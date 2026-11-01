#!/usr/bin/env node
/**
 * lastmod-erfassen.mjs (AUFTRAG-116, P2b) — echte Änderungs- und Erstelldaten je Seite aus Git.
 *
 * [01.11.2026] AUFTRAG-116: Für jeden Eintrag aus src/lib/seo/seitenliste.ts (`alleSeiten()`):
 *   geaendert = git log -1 --format=%cI -- <quellen…>
 *   erstellt  = git log --diff-filter=A --follow --format=%cI -- <hauptquelle> | tail -1
 *               (Blogbeitrag: `publishDate` aus der JSON, falls vorhanden)
 * und schreibt src/generated/lastmod.json:
 *   { "erzeugt": "…", "quelle": "git", "seiten": { "/": { "geaendert": "…", "erstellt": "…" }, … } }
 * Schlüssel = url ('' → '/').
 *
 * Läuft als `prebuild` vor jedem `npm run build`. Der Build darf NIE daran scheitern: flacher Klon,
 * Git fehlt oder irgendein Fehler → Meldung «lastmod: Git nicht verfügbar oder flach — behalte vorhandene
 * Datei» und Exit 0. Die erzeugte Datei wird committet (Fallback für Netlify, falls dort flach geklont wird).
 * Sind die Daten unverändert, bleibt die Datei unangetastet (kein neues «erzeugt», keine Änderung im Arbeitsbaum).
 * Die Git-Abfragen laufen zu acht parallel (seriell rund 19 s, parallel wenige Sekunden).
 *
 *   node scripts/lastmod-erfassen.mjs
 *
 * Hinweis: Massgebend ist der letzte COMMIT. Nicht committete Änderungen zählen erst nach dem Commit —
 * nach einem Commit das Skript erneut laufen lassen und die geänderte lastmod.json mitcommitten.
 */
import { execFile, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import path from 'node:path';

// Build-Log ruhig halten: der Hinweis «MODULE_TYPELESS_PACKAGE_JSON» beim Laden der .ts-Quellen ist erwartet
process.removeAllListeners('warning');
process.on('warning', (w) => {
    if (w.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.warn(`${w.name}: ${w.message}`);
});

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = path.join(ROOT, 'src', 'generated', 'lastmod.json');
const ZIEL_REL = 'src/generated/lastmod.json';

function behalte(grund) {
    console.log(`lastmod: Git nicht verfügbar oder flach — behalte vorhandene Datei${grund ? ` (${grund})` : ''}`);
    process.exit(0);
}
const kurz = (e) => String(e?.message ?? e).split('\n')[0].slice(0, 160);

/** git mit wörtlichen Pfaden (Ordner wie «(website)» und «[slug]» sind keine Muster) */
const GIT_OPTIONEN = { cwd: ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 };
function git(args) {
    return execFileSync('git', ['--literal-pathspecs', ...args], { ...GIT_OPTIONEN, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
const execFileAsync = promisify(execFile);
async function gitAsync(args) {
    const { stdout } = await execFileAsync('git', ['--literal-pathspecs', ...args], GIT_OPTIONEN);
    return stdout.trim();
}

/** höchstens `n` Aufgaben gleichzeitig; Ergebnisse in der Reihenfolge der Eingaben */
async function parallel(eingaben, n, aufgabe) {
    const ergebnisse = new Array(eingaben.length);
    let naechste = 0;
    const arbeiter = Array.from({ length: Math.min(n, eingaben.length) }, async () => {
        while (naechste < eingaben.length) {
            const i = naechste++;
            ergebnisse[i] = await aufgabe(eingaben[i]);
        }
    });
    await Promise.all(arbeiter);
    return ergebnisse;
}

try {
    if (git(['rev-parse', '--is-shallow-repository']) === 'true') behalte('flacher Klon');
} catch (e) {
    behalte(kurz(e));
}

let alleSeiten;
try {
    // .ts-Quellen mit @/-Alias laden (Node ≥ 22.18, Type-Stripping) — wie die übrigen Prüfskripte
    const { registerHooks } = await import('node:module');
    registerHooks({
        resolve(s, k, weiter) {
            let x = s;
            if (x.startsWith('@/')) x = pathToFileURL(path.join(ROOT, 'src', x.slice(2))).href;
            try {
                return weiter(x, k);
            } catch (e) {
                if ((x.startsWith('.') || x.startsWith('file:')) && !/\.[cm]?[jt]sx?$/.test(x)) return weiter(x + '.ts', k);
                throw e;
            }
        },
    });
    ({ alleSeiten } = await import(pathToFileURL(path.join(ROOT, 'src', 'lib', 'seo', 'seitenliste.ts')).href));
} catch (e) {
    behalte(`Seitenliste nicht ladbar: ${kurz(e)}`);
}

/** Daten einer Seite: { schluessel, geaendert, erstellt } (geaendert '' = keine Quelle committet) */
async function erfasse(s) {
    const schluessel = s.url === '' ? '/' : s.url;
    const geaendert = await gitAsync(['log', '-1', '--format=%cI', '--', ...s.quellen]);
    if (!geaendert) return { schluessel, geaendert: '', erstellt: '' };
    let erstellt = '';
    if (/^content\/blog\/[^/]+\.json$/.test(s.hauptquelle)) {
        try {
            const publishDate = JSON.parse(readFileSync(path.join(ROOT, s.hauptquelle), 'utf8')).publishDate;
            if (typeof publishDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(publishDate)) erstellt = publishDate;
        } catch {
            /* ohne publishDate: Git */
        }
    }
    if (!erstellt) {
        const zeilen = (await gitAsync(['log', '--diff-filter=A', '--follow', '--format=%cI', '--', s.hauptquelle])).split('\n').filter(Boolean);
        erstellt = zeilen[zeilen.length - 1] ?? '';
    }
    // noch nie committete Hauptquelle: Erstelldatum = Änderungsdatum
    return { schluessel, geaendert, erstellt: erstellt || geaendert };
}

const start = Date.now();
const seiten = {};
const ohneDatum = [];
try {
    const daten = await parallel(alleSeiten(ROOT), 8, erfasse);
    for (const d of daten) {
        if (!d.geaendert) ohneDatum.push(d.schluessel);
        else seiten[d.schluessel] = { geaendert: d.geaendert, erstellt: d.erstellt };
    }
} catch (e) {
    behalte(kurz(e));
}

const anzahl = Object.keys(seiten).length;
if (anzahl === 0) behalte('keine Daten erfasst');
if (ohneDatum.length) console.warn(`lastmod: ohne Commit (fehlen in der Datei, Sitemap nimmt das Build-Datum): ${ohneDatum.join(', ')}`);

let vorher = null;
try {
    vorher = existsSync(ZIEL) ? JSON.parse(readFileSync(ZIEL, 'utf8')) : null;
} catch {
    vorher = null;
}
const dauer = `${((Date.now() - start) / 1000).toFixed(1)} s`;
if (vorher && JSON.stringify(vorher.seiten) === JSON.stringify(seiten)) {
    console.log(`lastmod: ${anzahl} Seiten aus Git, unverändert — ${ZIEL_REL} bleibt (${dauer})`);
    process.exit(0);
}
try {
    mkdirSync(path.dirname(ZIEL), { recursive: true });
    writeFileSync(ZIEL, JSON.stringify({ erzeugt: new Date().toISOString(), quelle: 'git', seiten }, null, 2) + '\n', 'utf8');
    console.log(`lastmod: ${anzahl} Seiten aus Git → ${ZIEL_REL} geschrieben (${dauer})`);
} catch (e) {
    behalte(`Schreiben fehlgeschlagen: ${kurz(e)}`);
}
