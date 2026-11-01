#!/usr/bin/env node
/**
 * auftrag116-einheit-test.mjs (AUFTRAG-116) — Prüfungen ohne Server und ohne Browser.
 *
 * [01.11.2026] AUFTRAG-116:
 * P1  llms.txt im Standardformat: Kopf wortgleich aus dem Auftrag, Abschnittsfolge, jede Seite aus KI_SEITEN und jede
 *     Sitemap-URL (alleSeiten()) als ](https://infraone.ch/…)-Link, ≥ 60 Links, kein relativer Link, Beschreibung je Link
 *     ≤ 120 Zeichen, kein Anbieter-Name, «Mitarbeiter: 5» weg, Fakten/Preise der alten Datei (0cdaeff) erhalten,
 *     letzte Zeile «Aktualisiert: 2026-11-01»; llms-full.txt nur Kopf und Mitarbeitersatz geändert.
 * P2  Seitenliste = Fixture (URLs, Prioritäten, Frequenzen, Reihenfolge), Quellen existieren, lastmod.json deckt alle
 *     URLs, ISO-Daten, erstellt ≤ geaendert ≤ jetzt, drei Stichproben gegen git log, Fallback ohne Git (Exit 0,
 *     Datei unverändert), prebuild, sitemap.ts ohne gemeinsame Build-Zeit.
 * P3  WebPage-Schema mit datePublished/dateModified/publisher, Hub mit speakable; «Aktualisiert am» (Format, Zeitzone),
 *     SeitenKopf-Zeile, alle Aufrufer übergeben pfad.
 * P4  Hub-Texte wortgleich aus dem Auftrag, Preis aus der Konstante, Kapsel 40–60 Wörter, Titel/Beschreibung/Keywords
 *     unverändert (gegen 0cdaeff).
 * P5  kein /telefonie-Linkziel in src/, Footer-Eintrag weg, Regionszeile wortgleich, Regionsnamen = JSON, aria-label,
 *     Startseiten-Titel ≤ 60 (OG/Twitter unverändert), ServicesSection/leistungen → /cloud-telefonie.
 * P6  Entität: Felder exakt (aus dem Auftrag ausgewertet), numberOfEmployees weg, sameAs/foundingDate unverändert,
 *     gleiche @id; alle 19 `languages:` mit x-default.
 * P7  IndexNow: Schlüsseldatei, geaenderteUrls (Fixture), indexNowMelden (Fake-fetch), Netlify-Funktion (Fake-fetch,
 *     kein Netz), netlify.toml.
 * P8  headers(): vier Header wortgleich aus dem Auftrag, nur Produktion, Quelle schliesst keystatic/api aus,
 *     CSP enthält jede Quelle des Inventars, Code-Scan findet keine externe Quelle ausserhalb des Inventars.
 *
 *   node scripts/auftrag116-einheit-test.mjs
 *
 * Node ≥ 22.18 (Type-Stripping für die .ts-Quellen). Kein Netz: alle fetch-Aufrufe sind Attrappen.
 */
import { registerHooks } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';

process.removeAllListeners('warning');
process.on('warning', (w) => {
    if (w.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.warn(`${w.name}: ${w.message}`);
});

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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
    load(url, k, weiter) {
        // JSON (src/generated/lastmod.json) wie im Bundler als Standard-Export laden
        if (url.startsWith('file:') && url.endsWith('.json')) {
            return { format: 'module', source: `export default ${readFileSync(fileURLToPath(url), 'utf8')};`, shortCircuit: true };
        }
        const r = weiter(url, k);
        // schema.ts importiert reine Typen aus schema-dts ohne «import type» — für Node entfernen (nur Typen)
        if (url.endsWith('/src/lib/seo/schema.ts')) {
            const text = typeof r.source === 'string' ? r.source : Buffer.from(r.source).toString('utf8');
            return { ...r, source: text.replace(/^import \{[^}]*\} from 'schema-dts';/m, '') };
        }
        return r;
    },
});
const lade = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const seiten = await lade('src/components/ki-telefonassistent/seiten.ts');
const liste = await lade('src/lib/seo/seitenliste.ts');
const lastmod = await lade('src/lib/seo/lastmod.ts');
const schema = await lade('src/lib/seo/schema.ts');
const hub = await lade('src/components/ki-telefonassistent/hub-texte.ts');
const preise = await lade('src/lib/ki-telefonassistent-preise.ts');
const regionen = await lade('src/lib/regionen.ts');
const indexnow = await lade('src/lib/seo/indexnow.ts');
const anbieter = await lade('src/lib/ki-anbieter.ts');

let ok = 0;
let fehl = 0;
function pruefe(name, bedingung, detail = '') {
    if (bedingung) ok++;
    else fehl++;
    console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + String(detail).slice(0, 400) : ''}`);
}
const lies = (rel) => readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
function dateien(d, re = /\.(ts|tsx)$/) {
    if (!existsSync(d)) return [];
    return readdirSync(d).flatMap((n) => {
        const p = path.join(d, n);
        return statSync(p).isDirectory() ? dateien(p, re) : re.test(n) ? [p] : [];
    });
}
const git = (args) => execFileSync('git', ['--literal-pathspecs', ...args], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).replace(/\r\n/g, '\n').trim();
const ausHead = (datei) => git(['show', `0cdaeff:${datei}`]);
/** Codezeilen ohne reine Kommentarzeilen */
const codeZeilen = (t) => t.split('\n').filter((z) => !/^\s*(\/\/|\/?\*|\{\/\*)/.test(z));
const DOMAIN = 'https://infraone.ch';

/* ------------------------------------------------------------------ */
/* Auftragsdatei (Quelle der wortgleichen Texte)                        */
/* ------------------------------------------------------------------ */
function auftragsDatei() {
    let d = ROOT;
    for (let i = 0; i < 8; i++) {
        const p = path.join(d, 'auftraege', 'AUFTRAG-116.md');
        if (existsSync(p)) return p;
        d = path.dirname(d);
    }
    return null;
}
const AUFTRAG_PFAD = auftragsDatei();
pruefe('Auftragsdatei AUFTRAG-116.md gefunden (Quelle der Soll-Texte)', !!AUFTRAG_PFAD, AUFTRAG_PFAD ?? 'nicht gefunden');
const AUFTRAG = AUFTRAG_PFAD ? readFileSync(AUFTRAG_PFAD, 'utf8').replace(/\r\n/g, '\n') : '';
const abschnitt = (von, bis) => AUFTRAG.slice(AUFTRAG.indexOf(von), bis ? AUFTRAG.indexOf(bis) : undefined);

/* ------------------------------------------------------------------ */
/* P2 — Seitenliste und lastmod (zuerst, P1 braucht die Seitenliste)    */
/* ------------------------------------------------------------------ */
const eintraege = liste.alleSeiten(ROOT);
const fixture = lies('scripts/fixtures/sitemap-urls-0cdaeff.txt')
    .split('\n')
    .filter((z) => z && !z.startsWith('#'))
    .map((z) => {
        const [url, priority, changeFrequency] = z.split('\t');
        return { url, priority: Number(priority), changeFrequency };
    });
const ist = eintraege.map((e) => ({ url: `${DOMAIN}${e.url}`, priority: e.priority, changeFrequency: e.changeFrequency }));
pruefe(`P2a: Fixture scripts/fixtures/sitemap-urls-0cdaeff.txt hat 78 Einträge`, fixture.length === 78, fixture.length);
const fixtureUrls = new Set(fixture.map((f) => f.url));
const istUrls = new Set(ist.map((e) => e.url));
const fehlen = [...fixtureUrls].filter((u) => !istUrls.has(u));
const zuviel = [...istUrls].filter((u) => !fixtureUrls.has(u));
pruefe(`P2a: alleSeiten() — Menge der URLs identisch mit dem Stand 0cdaeff (${istUrls.size} URLs)`, fehlen.length === 0 && zuviel.length === 0 && ist.length === fixture.length, `fehlen: ${fehlen.join(', ')} | zuviel: ${zuviel.join(', ')}`);
const abweichendPF = fixture.filter((f, i) => JSON.stringify(f) !== JSON.stringify(ist[i])).map((f) => f.url);
pruefe('P2a: Prioritäten, Frequenzen und Reihenfolge wie bisher', abweichendPF.length === 0, abweichendPF.join(', '));
const fehlendeQuellen = eintraege.flatMap((e) => [...e.quellen, e.hauptquelle].filter((q) => !existsSync(path.join(ROOT, q))).map((q) => `${e.url || '/'}: ${q}`));
pruefe('P2a: jede Quelle und Hauptquelle existiert im Repo', fehlendeQuellen.length === 0, fehlendeQuellen.join(', '));
const seitenlisteQuelle = lies('src/lib/seo/seitenliste.ts');
pruefe('P2a: seitenliste.ts ohne Next-Imports (nur fs/path und reine TS-Module)', !/from ['"]next/.test(seitenlisteQuelle) && /import fs from 'fs'/.test(seitenlisteQuelle) && /import path from 'path'/.test(seitenlisteQuelle));
const quellenVon = (url) => eintraege.find((e) => e.url === url);
const SOLL_QUELLEN = {
    '': [['src/app/(website)/page.tsx', 'src/components/sections/'], 'src/app/(website)/page.tsx'],
    '/kontakt': [['src/app/(website)/kontakt/page.tsx'], 'src/app/(website)/kontakt/page.tsx'],
    '/datenschutz': [['src/app/(website)/datenschutz/page.tsx', 'src/lib/datenschutz.ts'], 'src/app/(website)/datenschutz/page.tsx'],
    '/ki-telefonassistent': [['src/app/(website)/ki-telefonassistent/page.tsx', 'src/components/ki-telefonassistent/inhalte/faq.ts', 'src/components/ki-telefonassistent/inhalte/anwendungen.ts', 'src/components/ki-telefonassistent/inhalte/branchen.ts', 'src/lib/ki-telefonassistent-preise.ts'], 'src/app/(website)/ki-telefonassistent/page.tsx'],
    '/ki-telefonassistent/funktionen': [['src/app/(website)/ki-telefonassistent/funktionen/page.tsx', 'src/components/ki-telefonassistent/inhalte/funktionen.ts'], 'src/app/(website)/ki-telefonassistent/funktionen/page.tsx'],
    '/ki-telefonassistent/faq': [['src/app/(website)/ki-telefonassistent/faq/page.tsx', 'src/components/ki-telefonassistent/inhalte/faq.ts'], 'src/app/(website)/ki-telefonassistent/faq/page.tsx'],
    '/ki-telefonassistent/preise': [['src/app/(website)/ki-telefonassistent/preise/page.tsx', 'src/lib/ki-telefonassistent-preise.ts', 'src/components/ki-telefonassistent/Preise.tsx'], 'src/app/(website)/ki-telefonassistent/preise/page.tsx'],
    '/ki-telefonassistent/anwendungen/notfall': [['src/app/(website)/ki-telefonassistent/anwendungen/[slug]/page.tsx', 'src/components/ki-telefonassistent/inhalte/anwendungen.ts'], 'src/components/ki-telefonassistent/inhalte/anwendungen.ts'],
    '/ki-telefonassistent/branchen/garage': [['src/app/(website)/ki-telefonassistent/branchen/[slug]/page.tsx', 'src/components/ki-telefonassistent/inhalte/branchen.ts'], 'src/components/ki-telefonassistent/inhalte/branchen.ts'],
    '/ki-telefonassistent/glossar': [['src/app/(website)/ki-telefonassistent/glossar/page.tsx'], 'src/app/(website)/ki-telefonassistent/glossar/page.tsx'],
    '/it-support/winterthur': [['content/leistungen/it-support-regions/winterthur.json', 'src/app/(website)/it-support/[region]/page.tsx'], 'content/leistungen/it-support-regions/winterthur.json'],
    '/webdesign/zug': [['content/leistungen/webdesign-regions/zug.json', 'src/app/(website)/webdesign/[region]/page.tsx'], 'content/leistungen/webdesign-regions/zug.json'],
    '/cloud-telefonie/3cx': [['src/app/(website)/cloud-telefonie/3cx/page.tsx'], 'src/app/(website)/cloud-telefonie/3cx/page.tsx'],
    '/blog/it-trifft-ot': [['content/blog/it-trifft-ot.json', 'content/blog/it-trifft-ot/'], 'content/blog/it-trifft-ot.json'],
    '/it-support': [['src/app/(website)/it-support/page.tsx', 'content/leistungen/it-support.json'], 'src/app/(website)/it-support/page.tsx'],
};
const quellenAbw = Object.entries(SOLL_QUELLEN).filter(([u, [q, h]]) => JSON.stringify([quellenVon(u)?.quellen, quellenVon(u)?.hauptquelle]) !== JSON.stringify([q, h])).map(([u]) => u || '/');
pruefe('P2a: Quellen-Zuordnung nach der Tabelle (Stichproben je Zeile; /it-support zusätzlich mit seiner CMS-JSON)', quellenAbw.length === 0, quellenAbw.join(', '));
const geteilteQuellen = eintraege.flatMap((e) => e.quellen).filter((q) => /Bausteine\.tsx|layout\/Header|layout\/Footer|globals\.css|templates\//.test(q));
pruefe('P2a: geteilte Bausteine (Bausteine.tsx, Header, Footer, globals.css, Templates) zählen nicht', geteilteQuellen.length === 0, geteilteQuellen.join(', '));

// lastmod.json
const lm = JSON.parse(lies('src/generated/lastmod.json'));
const schluessel = eintraege.map((e) => (e.url === '' ? '/' : e.url));
const lmFehlt = schluessel.filter((s) => !lm.seiten[s]);
const lmZuviel = Object.keys(lm.seiten).filter((s) => !schluessel.includes(s));
pruefe(`P2b: src/generated/lastmod.json deckt alle ${schluessel.length} URLs (Schlüssel '' → '/'), quelle «git»`, lmFehlt.length === 0 && lmZuviel.length === 0 && lm.quelle === 'git' && !Number.isNaN(Date.parse(lm.erzeugt)), `fehlen: ${lmFehlt.join(', ')} | zuviel: ${lmZuviel.join(', ')}`);
const ISO_ZEIT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;
const ISO_TAG = /^\d{4}-\d{2}-\d{2}$/;
const unIso = Object.entries(lm.seiten).filter(([, d]) => !ISO_ZEIT.test(d.geaendert) || !(ISO_ZEIT.test(d.erstellt) || ISO_TAG.test(d.erstellt))).map(([s]) => s);
pruefe('P2b: ISO-Daten (geaendert mit Zeit und Offset, erstellt mit Zeit oder publishDate YYYY-MM-DD)', unIso.length === 0, unIso.join(', '));
const jetzt = Date.now();
const reihenfolge = Object.entries(lm.seiten).filter(([, d]) => !(Date.parse(d.erstellt) <= Date.parse(d.geaendert) && Date.parse(d.geaendert) <= jetzt)).map(([s, d]) => `${s} ${d.erstellt} > ${d.geaendert}`);
pruefe('P2b: erstellt ≤ geaendert ≤ jetzt für jede Seite', reihenfolge.length === 0, reihenfolge.join(', '));
const verschiedene = new Set(Object.values(lm.seiten).map((d) => d.geaendert)).size;
// [01.11.2026] AUFTRAG-116 (Nachtrag): Nach dem Commit von A-116 tragen alle Seiten, deren Quellen A-116 geändert hat
// (z. B. x-default in den [region]-Vorlagen), zu Recht dasselbe Commit-Datum — darum nur «mehrere Daten, keine Build-Zeit»;
// die Richtigkeit je Seite belegen die Stichproben gegen git log.
const haeufigstes = Math.max(...Object.values(Object.values(lm.seiten).reduce((m, d) => ({ ...m, [d.geaendert]: (m[d.geaendert] ?? 0) + 1 }), {})));
pruefe(`P2b: echte Daten statt Build-Zeit — ${verschiedene} verschiedene Änderungsdaten über ${schluessel.length} Seiten (häufigstes: ${haeufigstes} Seiten)`, verschiedene >= 5 && haeufigstes < schluessel.length && !Object.values(lm.seiten).some((d) => d.geaendert === lm.erzeugt), verschiedene);
// Stichproben gegen git log
const stichproben = ['/ki-telefonassistent', '/it-support/winterthur', '/blog/it-trifft-ot'].map((s) => {
    const e = eintraege.find((x) => (x.url === '' ? '/' : x.url) === s);
    const geaendert = git(['log', '-1', '--format=%cI', '--', ...e.quellen]);
    const erstelltGit = git(['log', '--diff-filter=A', '--follow', '--format=%cI', '--', e.hauptquelle]).split('\n').filter(Boolean).pop();
    const publishDate = e.hauptquelle.startsWith('content/blog/') ? JSON.parse(lies(e.hauptquelle)).publishDate : null;
    return { s, geaendert, erstellt: publishDate ?? erstelltGit, json: lm.seiten[s] };
});
for (const p of stichproben) {
    pruefe(`P2b: Stichprobe ${p.s} — geaendert = git log -1 (${p.geaendert}), erstellt = ${p.s.startsWith('/blog/') ? 'publishDate' : 'erster Commit'} (${p.erstellt})`, p.json?.geaendert === p.geaendert && p.json?.erstellt === p.erstellt, JSON.stringify(p.json) + ' (bei Abweichung: lastmod.json veraltet → node scripts/lastmod-erfassen.mjs)');
}
const pkg = JSON.parse(lies('package.json'));
pruefe('P2b: package.json «prebuild»: node scripts/lastmod-erfassen.mjs', pkg.scripts.prebuild === 'node scripts/lastmod-erfassen.mjs' && pkg.scripts.build === 'next build');
// Fallback: ohne Git → Meldung, Exit 0, Datei unverändert
{
    const vorher = readFileSync(path.join(ROOT, 'src/generated/lastmod.json'), 'utf8');
    const leer = mkdtempSync(path.join(os.tmpdir(), 'a116-ohne-git-'));
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^path$/i.test(k)));
    env.PATH = leer;
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/lastmod-erfassen.mjs')], { cwd: ROOT, env, encoding: 'utf8' });
    rmSync(leer, { recursive: true, force: true });
    const nachher = readFileSync(path.join(ROOT, 'src/generated/lastmod.json'), 'utf8');
    pruefe('P2b: ohne Git (PATH leer) → «lastmod: Git nicht verfügbar oder flach — behalte vorhandene Datei», Exit 0, Datei unverändert', r.status === 0 && (r.stdout ?? '').includes('lastmod: Git nicht verfügbar oder flach — behalte vorhandene Datei') && vorher === nachher, `Exit ${r.status}: ${norm(r.stdout)} ${norm(r.stderr)}`);
}
{
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/lastmod-erfassen.mjs')], { cwd: ROOT, encoding: 'utf8' });
    pruefe('P2b: normaler Lauf → Exit 0, Daten unverändert (Datei bleibt, kein neues «erzeugt»)', r.status === 0 && /lastmod: 78 Seiten aus Git, unverändert/.test(r.stdout ?? ''), norm(r.stdout));
}
const sitemapQuelle = lies('src/app/sitemap.ts');
pruefe('P2c: sitemap.ts nutzt alleSeiten() und seitenDatum() (lastmod.json), keine gemeinsame Build-Zeit mehr, Warnung bei fehlendem Eintrag', /alleSeiten\(\)/.test(sitemapQuelle) && /seitenDatum\(seite\.url\)/.test(sitemapQuelle) && /new Date\(datum\.geaendert\)/.test(sitemapQuelle) && !/lastModified: currentDate/.test(sitemapQuelle) && /console\.warn\(`sitemap: kein lastmod für /.test(sitemapQuelle));
pruefe('P2c: lastmod.ts lädt src/generated/lastmod.json statisch (import), seitenDatum(pfad) liefert { geaendert, erstellt } oder null', /^import daten from '@\/generated\/lastmod\.json';/m.test(lies('src/lib/seo/lastmod.ts')) && lastmod.seitenDatum('/ki-telefonassistent')?.geaendert === lm.seiten['/ki-telefonassistent'].geaendert && lastmod.seitenDatum('')?.geaendert === lm.seiten['/'].geaendert && lastmod.seitenDatum('/gibt-es-nicht') === null);

/* ------------------------------------------------------------------ */
/* P1 — llms.txt / llms-full.txt                                        */
/* ------------------------------------------------------------------ */
const llms = lies('public/llms.txt');
const kopfSoll = /Kopf wortgleich:\n\n```\n([\s\S]*?)```/.exec(AUFTRAG)?.[1] ?? '';
pruefe('P1: Kopf (H1 und Blockquote) wortgleich aus dem Auftrag am Dateianfang', !!kopfSoll && llms.startsWith(kopfSoll), kopfSoll.split('\n')[2]);
const h2 = [...llms.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const H2_SOLL = ['KI-Telefonassistent', 'Cloud-Telefonie', 'IT-Support', 'Webdesign', 'Digital Signage', 'Weitere Leistungen', 'Unternehmen', 'Blog', 'Optional'];
pruefe('P1: Abschnitte in der Reihenfolge des Auftrags', JSON.stringify(h2) === JSON.stringify(H2_SOLL), h2.join(' | '));
const linkZeilen = [...llms.matchAll(/^- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$/gm)].map((m) => ({ titel: m[1], url: m[2], text: m[3] ?? '' }));
pruefe(`P1: ≥ 60 Links im Format «- [Titel](URL): Beschreibung» (${linkZeilen.length})`, linkZeilen.length >= 60);
const zuLang = linkZeilen.filter((l) => !l.text || l.text.length > 120).map((l) => `${l.url} (${l.text.length})`);
pruefe('P1: jede Beschreibung vorhanden und ≤ 120 Zeichen', zuLang.length === 0, zuLang.join(', '));
const relativ = [...llms.matchAll(/\]\((?!https?:\/\/)([^)]*)\)/g)].map((m) => m[1]);
pruefe('P1: kein relativer Link', relativ.length === 0, relativ.join(', '));
const eigeneLinks = new Set([...llms.matchAll(/\]\((https:\/\/infraone\.ch[^)]*)\)/g)].map((m) => m[1]));
const kiFehlt = seiten.KI_SEITEN.filter((s) => !eigeneLinks.has(`${DOMAIN}${s.pfad}`)).map((s) => s.pfad);
pruefe(`P1: alle ${seiten.KI_SEITEN.length} Seiten aus KI_SEITEN als ](https://infraone.ch/…)-Link`, kiFehlt.length === 0 && seiten.KI_SEITEN.length === 22, kiFehlt.join(', '));
const kiAbschnitt = llms.split('\n## ')[1] ?? '';
pruefe('P1: KI-Abschnitt zuerst, mit allen 22 KI-Seiten als Linkliste', seiten.KI_SEITEN.every((s) => kiAbschnitt.includes(`](${DOMAIN}${s.pfad})`)));
const sitemapFehlt = eintraege.filter((e) => !eigeneLinks.has(`${DOMAIN}${e.url === '' ? '/' : e.url}`)).map((e) => e.url || '/');
pruefe(`P1: jede Sitemap-URL (alleSeiten(), ${eintraege.length}) als Link; Startseite als https://infraone.ch/`, sitemapFehlt.length === 0, sitemapFehlt.join(', '));
pruefe('P1: Beispiel aus dem Auftrag wortgleich (IT-Support Winterthur)', llms.includes('- [IT-Support Winterthur](https://infraone.ch/it-support/winterthur): Vor-Ort- und Remote-Support, Anfahrt frei.'));
const ANBIETER_RE = /gemini|openai|gpt-|chatgpt/i;
pruefe('P1: kein Treffer auf /gemini|openai|gpt-|chatgpt/i in llms.txt und llms-full.txt', !ANBIETER_RE.test(llms) && !ANBIETER_RE.test(lies('public/llms-full.txt')));
pruefe('P1: «Mitarbeiter: 5» entfällt', !/Mitarbeiter: 5/.test(llms));
const zeilen = llms.split('\n');
const letzte = zeilen[zeilen.length - 1] === '' ? zeilen[zeilen.length - 2] : zeilen[zeilen.length - 1];
pruefe('P1: letzte Zeile «Aktualisiert: 2026-11-01»', letzte === 'Aktualisiert: 2026-11-01', letzte);
pruefe('P1: Anbieter-Satz (A-114, wortgleich) genau 2× in llms.txt, 1× in llms-full.txt', llms.split(anbieter.KI_ANBIETER_LLMS).length - 1 === 2 && lies('public/llms-full.txt').split(anbieter.KI_ANBIETER_LLMS).length - 1 === 1);
// Fakten und Preise der alten Datei bleiben erhalten
const alt = ausHead('public/llms.txt');
const altPreise = [...new Set(alt.match(/CHF [\d'.,-]+[^\s,;)]*/g) ?? [])];
const preiseFehlen = altPreise.filter((p) => !llms.includes(p));
pruefe(`P1: alle ${altPreise.length} CHF-Angaben der alten Datei (0cdaeff) unverändert enthalten`, altPreise.length >= 20 && preiseFehlen.length === 0, preiseFehlen.join(', '));
// Pfade wie «/it-support/winterthur» (nicht Teil einer https-Adresse); Kurzformen «/sanitaer-heizung» der alten Branchenzeile zählen als Linkende
const altPfade = [...new Set(alt.match(/(?<![\w.:/])\/[a-z0-9][a-z0-9/-]*/g) ?? [])].filter((p) => !/^\/(h|Monat|Mt)$/.test(p));
const pfadeFehlen = altPfade.filter((p) => ![...eigeneLinks].some((u) => u.endsWith(p)) && !llms.includes(` ${p}`));
pruefe(`P1: alle ${altPfade.length} Pfade der alten Datei als Link (oder im Text) enthalten`, pfadeFehlen.length === 0, pfadeFehlen.join(', '));
const FAKTEN = ['Rudolf-Diesel-Strasse 25, 8404 Winterthur', 'Taegerwilen (Thurgau)', 'Gegruendet: 2015', 'Bediente Regionen: Winterthur, Zuerich, Thurgau, Schaffhausen, St. Gallen, Aargau, Zug, Luzern, Basel, Bern, Solothurn, Graubuenden', '052 222 18 18', '076 587 50 55', 'info@infraone.ch', 'Rund 100 betreute KMU-Kunden', 'Peoplefone (zertifizierter Partner)', 'Microsoft Teams Integration', 'Next.js mit Keystatic CMS', 'infraone-signage', 'SBB-Verbindungen', 'Schweizweite Installation', 'Remote-Support oft innert 15 Minuten', 'Abrechnung im 15-Minuten-Takt', '2 Testanrufe je Geraet und Tag', 'Zefix', 'Ja, das ist meine Firma', 'Infomaniak, Satigny', 'Keine Tonaufnahme', 'Eintrag im Microsoft-365-Kalender: in Entwicklung, kommt bald', 'SMS-Bestaetigung an Anrufende', 'Microsoft, Peoplefone, 3CX, Yeastar, Sophos, Fortinet, Lenovo, HPE, VMware, Veeam, Cisco, Ubiquiti, Synology, Milestone, Axis, Hikvision, Wago', 'https://www.schaltkraft.ch', 'https://www.elektro-tel.ch', 'https://winterthur-architekten.netlify.app', 'Hikvision, Axis, Dahua', 'Ubiquiti UniFi, TP-Link Omada', 'Cisco, Ubiquiti, Fortinet', 'Visual Callflow', 'Fax2Mail', 'Mindestverrechnung 15 Min', '17:00-23:00 mit Zuschlag', 'Notfall-Support bis 23:00 Uhr'];
const faktenFehlen = FAKTEN.filter((f) => !llms.includes(f));
pruefe(`P1: ${FAKTEN.length} Kernfakten der alten Datei wörtlich erhalten`, faktenFehlen.length === 0, faktenFehlen.join(' | '));
// llms-full.txt: nur Kopf (Reihenfolge) und Mitarbeitersatz
const vollAlt = ausHead('public/llms-full.txt').split('\n');
const vollNeu = lies('public/llms-full.txt').replace(/\n$/, '').split('\n');
const vollDiff = vollNeu.map((z, i) => (z !== vollAlt[i] ? i + 1 : null)).filter(Boolean);
pruefe('P1: llms-full.txt — genau zwei Zeilen geändert (Kopf-Spezialgebiete, Mitarbeitersatz), Länge gleich', vollNeu.length === vollAlt.length && JSON.stringify(vollDiff) === JSON.stringify([4, 15]), `geänderte Zeilen: ${vollDiff.join(', ')}`);
pruefe('P1: llms-full.txt — Kopf mit KI-Telefonassistent zuerst (Reihenfolge wie llms.txt)', vollNeu[3] === '> Spezialgebiete: KI-Telefonassistent fuer Schweizer KMU (versteht und spricht Schweizerdeutsch), Cloud-Telefonie, IT-Support, Webdesign, Digital Signage.', vollNeu[3]);
pruefe('P1: llms-full.txt — «Das Unternehmen betreut rund 100 KMU-Kunden in der IT-Betreuung in der Deutschschweiz.» wortgleich, «beschaeftigt 5» weg', vollNeu[14].includes('Das Unternehmen betreut rund 100 KMU-Kunden in der IT-Betreuung in der Deutschschweiz.') && !/beschaeftigt 5/.test(vollNeu.join('\n')) && AUFTRAG.includes('«Das Unternehmen betreut rund 100 KMU-Kunden in der\nIT-Betreuung in der Deutschschweiz.»'));

/* ------------------------------------------------------------------ */
/* P3 — Aktualitätssignale                                              */
/* ------------------------------------------------------------------ */
const funk = schema.generateKiSeitenSchema(`${DOMAIN}/ki-telefonassistent/funktionen`, 'Funktionen', 'x', '/ki-telefonassistent/funktionen');
const lmFunk = lm.seiten['/ki-telefonassistent/funktionen'];
pruefe('P3a: generateKiSeitenSchema(url, name, description, pfad) — datePublished = erstellt (YYYY-MM-DD), dateModified = geaendert (ISO mit Zeit), publisher → /#organization', funk.datePublished === lastmod.datumTag(lmFunk.erstellt) && ISO_TAG.test(funk.datePublished) && funk.dateModified === lmFunk.geaendert && funk.publisher?.['@id'] === `${DOMAIN}/#organization` && !('speakable' in funk), JSON.stringify({ d: funk.datePublished, m: funk.dateModified }));
const hubSchema = schema.generateKiSeitenSchema(`${DOMAIN}/ki-telefonassistent`, 'Hub', 'x', '/ki-telefonassistent');
pruefe('P3a: Hub — speakable { SpeakableSpecification, cssSelector [#antwort, h1] }', JSON.stringify(hubSchema.speakable) === JSON.stringify({ '@type': 'SpeakableSpecification', cssSelector: ['#antwort', 'h1'] }));
pruefe('P3a: kiSeitenSchemas reicht pfad durch (Brotkrumen.tsx)', /generateKiSeitenSchema\(url, name, beschreibung, pfad\)/.test(lies('src/components/ki-telefonassistent/Brotkrumen.tsx')));
const ohneDatum = schema.generateKiSeitenSchema(`${DOMAIN}/x`, 'x', 'x', '/gibt-es-nicht');
pruefe('P3a: ohne lastmod-Eintrag keine Datumsfelder (keine erfundenen Daten)', !('datePublished' in ohneDatum) && !('dateModified' in ohneDatum));
pruefe('P3b: Anzeige de-CH «31. Oktober 2026», dateTime «2026-10-31» (Schweizer Zeit, auch kurz nach Mitternacht)', lastmod.datumAnzeige('2026-10-31T16:12:39+01:00') === '31. Oktober 2026' && lastmod.datumTag('2026-10-31T16:12:39+01:00') === '2026-10-31' && lastmod.datumTag('2026-11-01T00:30:00+01:00') === '2026-11-01' && lastmod.datumTag('2026-10-31T23:30:00Z') === '2026-11-01', `${lastmod.datumAnzeige('2026-10-31T16:12:39+01:00')} / ${lastmod.datumTag('2026-10-31T23:30:00Z')}`);
const aktQuelle = lies('src/components/ki-telefonassistent/Aktualisiert.tsx');
pruefe('P3b: Aktualisiert.tsx — Server-Komponente, <p className="text-sm text-text-secondary">Aktualisiert am <time dateTime=…>, ohne Datum nichts', !/use client/.test(aktQuelle) && /cn\('text-sm text-text-secondary', className\)/.test(aktQuelle) && /Aktualisiert am <time dateTime=\{datumTag\(datum\.geaendert\)\}>\{datumAnzeige\(datum\.geaendert\)\}<\/time>/.test(aktQuelle) && /if \(!datum\) return null;/.test(aktQuelle) && /day: 'numeric', month: 'long', year: 'numeric'/.test(lies('src/lib/seo/lastmod.ts')) && /new Intl\.DateTimeFormat\('de-CH'/.test(lies('src/lib/seo/lastmod.ts')));
const bausteine = lies('src/components/ki-telefonassistent/Bausteine.tsx');
pruefe('P3b: SeitenKopf — Brotkrumen und rechts <Aktualisiert pfad={pfad} /> in einer Zeile (flex flex-wrap items-center justify-between gap-x-6 gap-y-2)', /<div className="mb-8 lg:mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">\s*<Brotkrumen krumen=\{krumen\} \/>\s*<Aktualisiert pfad=\{pfad\} \/>\s*<\/div>/.test(bausteine) && /pfad: string;/.test(bausteine));
const seitenkopfAufrufe = dateien(path.join(ROOT, 'src', 'app')).flatMap((p) => [...readFileSync(p, 'utf8').matchAll(/<SeitenKopf\b([\s\S]*?)\/>/g)].map((m) => ({ datei: rel(p), pfad: /\bpfad=\{(PFAD|KI_PREISE_PFAD|pfad)\}/.test(m[1]) })));
pruefe(`P3b: alle ${seitenkopfAufrufe.length} Aufrufer von SeitenKopf übergeben ihren PFAD`, seitenkopfAufrufe.length === 12 && seitenkopfAufrufe.every((a) => a.pfad), seitenkopfAufrufe.filter((a) => !a.pfad).map((a) => a.datei).join(', '));
const hubSeite = lies('src/app/(website)/ki-telefonassistent/page.tsx');
// [01.11.2026] AUFTRAG-116 (Nachtrag N1): «Aktualisiert am» unter dem Demo-Widget (nach </KiDemo>, im selben Container), nicht mehr im Hero-Textblock
pruefe('P3b/N1: Hub — <Aktualisiert pfad={KI_BASIS} className="mt-8" /> direkt nach </KiDemo> im selben Container, nicht mehr im Hero-Textblock', /\{HUB_TESTEN\}<\/p>\s*<\/KiDemo>\s*(\{\/\*[\s\S]*?\*\/\}\s*)?<Aktualisiert pfad=\{KI_BASIS\} className="mt-8" \/>\s*<\/div>\s*<\/section>/.test(hubSeite) && (hubSeite.match(/<Aktualisiert /g) ?? []).length === 1);

/* ------------------------------------------------------------------ */
/* P4 — Antwort-Kapsel                                                  */
/* ------------------------------------------------------------------ */
const p4 = abschnitt('### P4', '### P5');
const sollUeberzeile = /Überzeile \(bleibt mit dem pulsierenden Punkt\): `([^`]+)`/.exec(p4)?.[1];
const sollH1 = /- H1: `([^`]+)`/.exec(p4)?.[1];
const sollAntwort = norm(/Erster Absatz[^\n]*:\n\s*`([^`]+)`/.exec(p4)?.[1] ?? '');
const sollTesten = norm(/Zweiter Absatz \(`[^`]*`\):\n\s*`([^`]+)`/.exec(p4)?.[1] ?? '');
const PREIS = `${preise.WAEHRUNG} ${preise.chf(preise.abPreis())}`;
pruefe('P4: Überzeile wortgleich', hub.HUB_UEBERZEILE === sollUeberzeile, hub.HUB_UEBERZEILE);
pruefe('P4: H1 wortgleich', hub.HUB_H1 === sollH1, hub.HUB_H1);
pruefe(`P4: Kapsel wortgleich, {PREIS} = WAEHRUNG + chf(abPreis()) = «${PREIS}»`, !!sollAntwort && hub.hubAntwort() === sollAntwort.replace('{PREIS}', PREIS), hub.hubAntwort());
pruefe('P4: Satz ohne Preis-Teil endet nach «Betrieb in der Schweiz.», wenn PREISE_FREIGEGEBEN false wäre', /PREISE_FREIGEGEBEN \? `, ab \$\{WAEHRUNG\} \$\{chf\(abPreis\(\)\)\} pro Monat` : ''/.test(lies('src/components/ki-telefonassistent/hub-texte.ts')) && sollAntwort.includes('Betrieb in der Schweiz, ab {PREIS} pro Monat.'));
pruefe('P4: zweiter Absatz wortgleich', hub.HUB_TESTEN === sollTesten, hub.HUB_TESTEN);
const woerter = hub.hubAntwort().split(/\s+/).filter(Boolean).length;
pruefe(`P4: Kapsel 40–60 Wörter (${woerter})`, woerter >= 40 && woerter <= 60);
pruefe('P4: kein Preis-Literal im Hub und in hub-texte.ts (Preis nur aus der Konstante)', !/CHF\s*49|\b49\b/.test(codeZeilen(lies('src/components/ki-telefonassistent/hub-texte.ts')).join('\n')) && !/CHF\s*49/.test(hubSeite));
// [01.11.2026] AUFTRAG-116 (Nachtrag N1): Kapsel auf dem Handy eine Stufe kleiner, zweiter Absatz erst ab sm sichtbar (bleibt im DOM)
pruefe('P4/N1: Hero-Markup — Überzeile mit Punkt, H1, <p id="antwort"> (text-base sm:text-lg md:text-xl), zweiter Absatz «hidden sm:block»', /motion-safe:animate-ping[\s\S]{0,200}\{HUB_UEBERZEILE\}/.test(hubSeite) && /<h1 className="mt-5 [^"]*">\s*\{HUB_H1\}\s*<\/h1>/.test(hubSeite) && /<p id="antwort" className="mt-5 text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed max-w-\[38rem\]">\s*\{hubAntwort\(\)\}\s*<\/p>/.test(hubSeite) && /<p className="hidden sm:block mt-4 text-base md:text-lg text-text-secondary max-w-\[38rem\]">\{HUB_TESTEN\}<\/p>/.test(hubSeite));
const hubAlt = ausHead('src/app/(website)/ki-telefonassistent/page.tsx').replace(/\r\n/g, '\n');
const unveraendert = [/const TITEL = [^\n]+/, /const BESCHREIBUNG =\n[^\n]+/, /keywords: \[[^\n]+/, /kiSeitenSchemas\(KI_BASIS, '[^']+'/, /<KiDemo turnstileSiteKey=\{turnstileSiteKey\} begruessungNachStimme=\{begruessungNachStimme\}>/].filter((re) => re.exec(hubAlt)?.[0] !== re.exec(hubSeite)?.[0]);
pruefe('P4: Titel, Beschreibung, Keywords, kiSeitenSchemas-Name und Demo-Widget unverändert (gegen 0cdaeff)', unveraendert.length === 0, unveraendert.map(String).join(', '));

/* ------------------------------------------------------------------ */
/* P5 — Interne Links und Footer                                        */
/* ------------------------------------------------------------------ */
const srcDateien = dateien(path.join(ROOT, 'src'));
const telefonieZiele = srcDateien.flatMap((p) =>
    codeZeilen(readFileSync(p, 'utf8').replace(/\r\n/g, '\n'))
        .filter((z) => /(['"`])\/telefonie(?:[#?][^'"`]*)?\1/.test(z))
        .map((z) => `${rel(p)}: ${z.trim().slice(0, 80)}`),
);
pruefe(`P5: «/telefonie» nirgends als Linkziel in src/ (${srcDateien.length} Dateien; Kommentare ausgenommen)`, telefonieZiele.length === 0, telefonieZiele.join(' | '));
pruefe('P5: Weiterleitung /telefonie → /cloud-telefonie bleibt in next.config.ts', /source: '\/telefonie',\s*destination: '\/cloud-telefonie',\s*permanent: true/.test(lies('next.config.ts')));
const footer = lies('src/components/layout/Footer.tsx');
pruefe('P5: Footer — Eintrag «Telefonie & Kommunikation» entfernt, Cloud-Telefonie bleibt', !codeZeilen(footer).some((z) => /Telefonie & Kommunikation/.test(z)) && /\{ label: 'Cloud-Telefonie', href: '\/cloud-telefonie' \}/.test(footer));
const navBlock = /```tsx\n(<nav aria-label="IT-Support nach Region"[\s\S]*?)```/.exec(abschnitt('### P5', '### P6'))?.[1] ?? '';
pruefe('P5: Footer — Regionszeile wortgleich aus dem Auftrag (nav, Überschrift, Trenner, Links)', !!navBlock && norm(footer).includes(norm(navBlock)) && /import \{ Fragment \} from 'react';/.test(footer));
pruefe('P5: Regionszeile zwischen Linkspalten und unterer Leiste', footer.indexOf('aria-label="IT-Support nach Region"') > footer.indexOf('footerLinks.partnerSites.map') && footer.indexOf('aria-label="IT-Support nach Region"') < footer.indexOf('{/* Bottom Bar */}'));
const SOLL_SLUGS = /in dieser Reihenfolge: ([a-z,\s-]+?); `name`/.exec(abschnitt('### P5', '### P6'))?.[1]?.split(/,\s*/) ?? [];
pruefe('P5: sechs Regionen in der Reihenfolge des Auftrags', JSON.stringify(regionen.IT_SUPPORT_REGIONEN.map((r) => r.slug)) === JSON.stringify(SOLL_SLUGS) && SOLL_SLUGS.length === 6, SOLL_SLUGS.join(','));
const namenAbw = regionen.IT_SUPPORT_REGIONEN.filter((r) => JSON.parse(lies(`content/leistungen/it-support-regions/${r.slug}.json`)).name !== r.name).map((r) => r.slug);
pruefe('P5: Regionsnamen = Feld `name` der Content-JSON', namenAbw.length === 0, regionen.IT_SUPPORT_REGIONEN.map((r) => r.name).join(', '));
const ariaSoll = /`Header\.tsx:\d+` Logo-Link: `aria-label="([^"]+)"`/.exec(AUFTRAG)?.[1];
pruefe(`P5: Header-Logo-Link mit aria-label «${ariaSoll}»`, !!ariaSoll && lies('src/components/layout/Header.tsx').includes(`<Link href="/" aria-label="${ariaSoll}"`));
const titelSoll = /`title\.default`: `([^`]+)`/.exec(AUFTRAG)?.[1];
const layout = lies('src/app/(website)/layout.tsx');
const layoutAlt = ausHead('src/app/(website)/layout.tsx').replace(/\r\n/g, '\n');
pruefe(`P5: Startseiten-Titel wortgleich und ≤ 60 Zeichen (${titelSoll?.length})`, !!titelSoll && layout.includes(`default: "${titelSoll}",`) && titelSoll.length <= 60, titelSoll);
const ogTw = (t) => [/openGraph: \{[\s\S]*?title: "([^"]+)"/.exec(t)?.[1], /twitter: \{[\s\S]*?title: "([^"]+)"/.exec(t)?.[1]];
pruefe('P5: openGraph.title und twitter.title unverändert', JSON.stringify(ogTw(layout)) === JSON.stringify(ogTw(layoutAlt)), ogTw(layout).join(' | '));
pruefe('P5: ServicesSection und /leistungen verlinken /cloud-telefonie', /title: 'Cloud Telefonie',[\s\S]{0,300}href: '\/cloud-telefonie'/.test(lies('src/components/sections/ServicesSection.tsx')) && /title: 'Telefonie & Kommunikation',[\s\S]{0,300}href: '\/cloud-telefonie'/.test(lies('src/app/(website)/leistungen/page.tsx')));

/* ------------------------------------------------------------------ */
/* P6 — Entität und hreflang                                            */
/* ------------------------------------------------------------------ */
const p6Block = /```ts\n(legalName[\s\S]*?)```/.exec(abschnitt('### P6', '### P7'))?.[1] ?? '';
let sollEntitaet = null;
try {
    sollEntitaet = new Function(`return {${p6Block}};`)();
} catch {
    sollEntitaet = null;
}
pruefe('P6: Soll-Felder aus dem Auftrag ausgewertet (legalName … areaServed)', !!sollEntitaet && Object.keys(sollEntitaet).length === 7, sollEntitaet ? Object.keys(sollEntitaet).join(',') : 'nicht lesbar');
const org = schema.generateOrganizationSchemaExtended();
const lb = schema.generateSitewideLocalBusinessSchema();
const felder = ['legalName', 'vatID', 'taxID', 'identifier', 'knowsAbout', 'knowsLanguage'];
const orgAbw = felder.filter((f) => JSON.stringify(org[f]) !== JSON.stringify(sollEntitaet?.[f]));
const lbAbw = felder.filter((f) => JSON.stringify(lb[f]) !== JSON.stringify(sollEntitaet?.[f]));
pruefe('P6: Organization (Extended) — legalName, vatID, taxID, identifier (UID), knowsAbout, knowsLanguage exakt', orgAbw.length === 0, orgAbw.join(','));
pruefe('P6: LocalBusiness (sitewide) — dieselben Felder exakt', lbAbw.length === 0, lbAbw.join(','));
pruefe('P6: Organization areaServed = Liste aus dem Auftrag', JSON.stringify(org.areaServed) === JSON.stringify(sollEntitaet?.areaServed));
pruefe('P6: LocalBusiness areaServed = [GeoCircle (Hauptsitz, wie generateMainBusinessSchema), …Liste]', lb.areaServed?.[0]?.['@type'] === 'GeoCircle' && JSON.stringify(lb.areaServed[0]) === JSON.stringify(schema.generateMainBusinessSchema().areaServed) && JSON.stringify(lb.areaServed.slice(1)) === JSON.stringify(sollEntitaet?.areaServed));
pruefe('P6: numberOfEmployees entfernt (nirgends im Schema-Code)', !('numberOfEmployees' in org) && !('numberOfEmployees' in lb) && !codeZeilen(lies('src/lib/seo/schema.ts')).some((z) => /numberOfEmployees/.test(z)));
pruefe('P6: sameAs (Facebook, Instagram, LinkedIn) und foundingDate 2015 unverändert, gleiche @id', JSON.stringify(org.sameAs) === JSON.stringify(['https://www.facebook.com/profile.php?id=61587228175938', 'https://www.instagram.com/infraoneit/', 'https://www.linkedin.com/in/infraone-it-solutions']) && org.foundingDate === '2015' && org['@id'] === lb['@id'] && org['@id'] === `${DOMAIN}/#organization`);
pruefe('P6: UID stimmt mit dem Impressum überein', lies('src/app/(website)/impressum/page.tsx').includes('CHE-288.114.187 MWST') && sollEntitaet?.vatID === 'CHE-288.114.187 MWST');
const langStellen = srcDateien.flatMap((p) => {
    const t = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    return [...t.matchAll(/languages: \{/g)].map((m) => {
        const stueck = t.slice(m.index, m.index + 400);
        const deCH = /'de-CH': (.+?),(?: 'x-default'|\s*\n)/.exec(stueck)?.[1];
        const xWert = /'x-default': (.+?)(?:,| \})/.exec(stueck)?.[1];
        return { datei: rel(p), xdefault: !!xWert, deCH, xWert };
    });
});
const ohneX = langStellen.filter((s) => !s.xdefault || s.xWert !== s.deCH).map((s) => s.datei);
pruefe(`P6: alle ${langStellen.length} «languages:»-Stellen mit x-default (= de-CH-URL)`, langStellen.length === 19 && ohneX.length === 0, ohneX.join(', '));

/* ------------------------------------------------------------------ */
/* P7 — IndexNow                                                        */
/* ------------------------------------------------------------------ */
const keySoll = /`([0-9a-f]{32})`/.exec(abschnitt('### P7', '### P8'))?.[1];
const keyDatei = path.join(ROOT, 'public', `${keySoll}.txt`);
const keyInhalt = existsSync(keyDatei) ? readFileSync(keyDatei, 'utf8') : null;
pruefe('P7: Schlüsseldatei public/<schlüssel>.txt vorhanden, Inhalt = Schlüssel (ohne Zeilenumbruch), 32 Hex-Zeichen', keyInhalt === keySoll && /^[0-9a-f]{32}$/.test(keyInhalt ?? ''), keyInhalt);
pruefe('P7: INDEXNOW_KEY = Schlüssel, INDEXNOW_HOST = infraone.ch, keyLocation https://infraone.ch/<key>.txt', indexnow.INDEXNOW_KEY === keySoll && indexnow.INDEXNOW_HOST === 'infraone.ch' && indexnow.INDEXNOW_KEY_LOCATION === `https://infraone.ch/${keySoll}.txt`);
const FIX_JETZT = new Date('2026-11-01T12:00:00Z');
const fixtureXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://infraone.ch</loc><changefreq>weekly</changefreq></url>
<url><loc>https://infraone.ch/ki-telefonassistent</loc><lastmod>2026-10-31T15:12:39.000Z</lastmod></url>
<url><loc>https://infraone.ch/agb</loc><lastmod>2026-08-04T13:32:57.000Z</lastmod></url>
</urlset>`;
const treffer = indexnow.geaenderteUrls(fixtureXml, 3, FIX_JETZT);
pruefe('P7: geaenderteUrls(Fixture mit 3 URLs, eine alt, Startseite ohne lastmod, 3 Tage) → genau 2 Treffer inkl. Startseite', JSON.stringify(treffer) === JSON.stringify(['https://infraone.ch', 'https://infraone.ch/ki-telefonassistent']), treffer.join(', '));
pruefe('P7: geaenderteUrls ergänzt die Startseite, wenn sie in der Sitemap fehlt', JSON.stringify(indexnow.geaenderteUrls('<urlset><url><loc>https://infraone.ch/agb</loc><lastmod>2026-08-04</lastmod></url></urlset>', 3, FIX_JETZT)) === JSON.stringify(['https://infraone.ch/']));
const aufrufe = [];
const fakeFetch = async (url, init) => {
    aufrufe.push({ url, init });
    return new Response(null, { status: 200 });
};
const r1 = await indexnow.indexNowMelden(['https://infraone.ch/', 'https://infraone.ch/kontakt', 'https://infraone.ch/kontakt', 'https://example.com/x', 'http://infraone.ch/y'], fakeFetch);
const a1 = aufrufe[0];
const body1 = a1 ? JSON.parse(a1.init.body) : {};
pruefe('P7: indexNowMelden — POST https://api.indexnow.org/IndexNow, Content-Type «application/json; charset=utf-8»', aufrufe.length === 1 && a1.url === 'https://api.indexnow.org/IndexNow' && a1.init.method === 'POST' && a1.init.headers['Content-Type'] === 'application/json; charset=utf-8');
pruefe('P7: indexNowMelden — Body { host, key, keyLocation, urlList } (nur eigene https-URLs, ohne Doppel)', JSON.stringify(Object.keys(body1)) === JSON.stringify(['host', 'key', 'keyLocation', 'urlList']) && body1.host === 'infraone.ch' && body1.key === keySoll && body1.keyLocation === `https://infraone.ch/${keySoll}.txt` && JSON.stringify(body1.urlList) === JSON.stringify(['https://infraone.ch/', 'https://infraone.ch/kontakt']) && r1.status === 200 && r1.anzahl === 2, JSON.stringify(body1.urlList));
aufrufe.length = 0;
const r2 = await indexnow.indexNowMelden([], fakeFetch);
pruefe('P7: indexNowMelden — leere Liste → kein Request', aufrufe.length === 0 && r2.anzahl === 0, JSON.stringify(r2));
const viele = Array.from({ length: 10050 }, (_, i) => `https://infraone.ch/seite-${i}`);
const r3 = await indexnow.indexNowMelden(viele, fakeFetch);
pruefe('P7: indexNowMelden — höchstens 10 000 URLs je Meldung', aufrufe.length === 1 && JSON.parse(aufrufe[0].init.body).urlList.length === 10000 && r3.anzahl === 10000);
// Netlify-Funktion mit Attrappen (kein Netz)
const fnQuelle = lies('netlify/functions/deploy-succeeded.mts');
pruefe('P7: netlify/functions/deploy-succeeded.mts — Functions v2 (Standard-Export async (req: Request) => Response), nur production, Fehler → 200', /const deploySucceeded = async \(req: Request\): Promise<Response> =>/.test(fnQuelle) && /^export default deploySucceeded;$/m.test(fnQuelle) && /kontext !== 'production'/.test(fnQuelle) && /geaenderteUrls\(await sitemap\.text\(\), TAGE\)/.test(fnQuelle) && /const TAGE = 3;/.test(fnQuelle));
const fn = (await import(pathToFileURL(path.join(ROOT, 'netlify/functions/deploy-succeeded.mts')).href)).default;
const echtesFetch = globalThis.fetch;
const fnAufrufe = [];
const logs = [];
const echtesLog = console.log;
const echtesError = console.error;
console.log = (...a) => logs.push(a.join(' '));
console.error = (...a) => logs.push(a.join(' '));
try {
    globalThis.fetch = async (url) => {
        fnAufrufe.push(String(url));
        if (String(url) === 'https://infraone.ch/sitemap.xml') return new Response(fixtureXml.replace('2026-10-31T15:12:39.000Z', new Date(Date.now() - 86400000).toISOString()), { status: 200 });
        if (String(url) === 'https://api.indexnow.org/IndexNow') return new Response(null, { status: 202 });
        throw new Error('unerwartete Adresse ' + url);
    };
    const vorschau = await fn(new Request('https://x.invalid/', { method: 'POST', body: JSON.stringify({ payload: { context: 'deploy-preview' } }) }));
    const vorschauText = await vorschau.text();
    const nAufrufeVorschau = fnAufrufe.length;
    const prod = await fn(new Request('https://x.invalid/', { method: 'POST', body: JSON.stringify({ payload: { context: 'production' } }) }));
    const prodText = await prod.text();
    globalThis.fetch = async () => {
        throw new Error('Netz weg (Attrappe)');
    };
    const fehler = await fn(new Request('https://x.invalid/', { method: 'POST', body: JSON.stringify({ payload: { context: 'production' } }) }));
    const kaputt = await fn(new Request('https://x.invalid/', { method: 'POST', body: 'kein json' }));
    console.log = echtesLog;
    console.error = echtesError;
    pruefe('P7: Funktion — Deploy-Vorschau → 200 «übersprungen», kein Abruf', vorschau.status === 200 && vorschauText === 'übersprungen' && nAufrufeVorschau === 0);
    pruefe('P7: Funktion — production → Sitemap geholt, IndexNow gemeldet, Log «indexnow: 2 URLs, Status 202»', prod.status === 200 && prodText === 'indexnow: 2 URLs, Status 202' && JSON.stringify(fnAufrufe) === JSON.stringify(['https://infraone.ch/sitemap.xml', 'https://api.indexnow.org/IndexNow']) && logs.includes('indexnow: 2 URLs, Status 202'), prodText);
    pruefe('P7: Funktion — Netzfehler und kaputter Body → geloggt, Antwort 200', fehler.status === 200 && kaputt.status === 200 && logs.some((l) => /indexnow: Fehler — Netz weg/.test(l)), logs.slice(-2).join(' | '));
} finally {
    globalThis.fetch = echtesFetch;
    console.log = echtesLog;
    console.error = echtesError;
}
const toml = lies('netlify.toml');
const tomlAlt = ausHead('netlify.toml').replace(/\r\n/g, '\n');
pruefe('P7: netlify.toml — [functions."deploy-succeeded"] included_files = [], globaler Block unverändert', /\[functions\."deploy-succeeded"\]\n\s*included_files = \[\]/.test(toml) && toml.startsWith(tomlAlt.trimEnd()));
const ping = lies('scripts/indexnow-ping.mjs');
pruefe('P7: scripts/indexnow-ping.mjs — --alle, --seit=N, --trocken, --basis=', ['--alle', '--seit=', '--trocken', '--basis='].every((o) => ping.includes(o)) && /if \(trocken\) \{\s*console\.log\(`--trocken: nichts gesendet[^\n]*\n\s*\} else \{\s*const \{ status, anzahl \} = await indexNowMelden\(urls\);/.test(ping) && (ping.match(/indexNowMelden\(/g) ?? []).length === 1);

/* ------------------------------------------------------------------ */
/* P8 — Sicherheits-Header                                              */
/* ------------------------------------------------------------------ */
const p8 = abschnitt('### P8', '### P9');
const sollHeader = Object.fromEntries([...p8.matchAll(/^\| `([A-Za-z-]+)` \| `([^`]+)` \|$/gm)].map((m) => [m[1], m[2]]));
pruefe('P8: Soll-Header aus der Auftragstabelle gelesen (4)', Object.keys(sollHeader).length === 4, Object.keys(sollHeader).join(', '));
const cfg = (await lade('next.config.ts')).default;
const envVorher = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';
const regeln = await cfg.headers();
process.env.NODE_ENV = 'development';
const regelnDev = await cfg.headers();
process.env.NODE_ENV = envVorher;
const istHeader = Object.fromEntries((regeln[0]?.headers ?? []).map((h) => [h.key, h.value]));
pruefe('P8: Produktion — eine Regel mit genau den vier Headern, Werte wortgleich aus dem Auftrag', regeln.length === 1 && JSON.stringify(istHeader) === JSON.stringify(sollHeader), JSON.stringify(Object.keys(istHeader)));
pruefe('P8: Entwicklung (next dev) — keine Header-Regel (kein CSP, unsafe-eval bleibt möglich)', Array.isArray(regelnDev) && regelnDev.length === 0);
const quelle = regeln[0]?.source;
const quelleRe = new RegExp(`^${quelle}$`);
const pfadFaelle = { '/': true, '/kontakt': true, '/ki-telefonassistent': true, '/sitemap.xml': true, '/keystatic': false, '/keystatic/branch/main': false, '/api/demo/scan': false, '/api/keystatic/x': false };
const pfadAbw = Object.entries(pfadFaelle).filter(([p, soll]) => quelleRe.test(p) !== soll).map(([p]) => p);
pruefe(`P8: Quelle «${quelle}» — schliesst /keystatic und /api/ aus, gilt sonst überall`, quelle === '/((?!keystatic|api/).*)' && pfadAbw.length === 0, pfadAbw.join(', '));
// Inventar der externen Quellen (Tabelle im Bericht) — jede Quelle steht in ihrer Direktive
const csp = Object.fromEntries((istHeader['Content-Security-Policy'] ?? '').split(';').map((d) => d.trim().split(/\s+/)).map(([n, ...w]) => [n, w]));
const INVENTAR = [
    ['Cloudflare Web Analytics: Skript beacon.min.js (layout.tsx, nur mit Token)', 'script-src', 'https://static.cloudflareinsights.com'],
    ['Cloudflare Web Analytics: Meldung /cdn-cgi/rum (vom Beacon-Skript)', 'connect-src', 'https://cloudflareinsights.com'],
    ['Turnstile: Skript api.js (KiDemo.tsx, nur mit Schlüssel)', 'script-src', 'https://challenges.cloudflare.com'],
    ['Turnstile: Widget-iframe', 'frame-src', 'https://challenges.cloudflare.com'],
    ['Turnstile: Abfragen des Widgets', 'connect-src', 'https://challenges.cloudflare.com'],
    ['Google-Maps-Einbettung (kontakt/page.tsx mapEmbed, www.google.com/maps/embed)', 'frame-src', 'https://www.google.com'],
    ['Google Maps (maps.google.com)', 'frame-src', 'https://maps.google.com'],
    ['Firmenlogos der Demo (<img src={logoSrc}>, eigener Proxy /api/demo/bild)', 'img-src', "'self'"],
    ['Firmenlogos/Bilder beliebiger https-Domains', 'img-src', 'https:'],
    ['Bilder als data:/blob: (Canvas, Inline-SVG)', 'img-src', 'data:'],
    ['next/image (/_next/image), public/images', 'img-src', "'self'"],
    ['Schrift Geist über next/font (eigenes Hosting /_next/static/media)', 'font-src', "'self'"],
    ['Netlify Forms POST /__forms.html (ContactSection, AnfrageFormular, SupportKostenRechner)', 'connect-src', "'self'"],
    ['Demo-API /api/demo/* (KiDemo, Handelsregister)', 'connect-src', "'self'"],
    ['Next-Inline-Skripte (Hydration, Theme-Skript, JSON-LD)', 'script-src', "'unsafe-inline'"],
    ['Inline-Styles (style-Attribute, framer-motion)', 'style-src', "'unsafe-inline'"],
];
const inventarFehlt = INVENTAR.filter(([, d, q]) => !(csp[d] ?? []).includes(q)).map(([n, d, q]) => `${n}: ${q} fehlt in ${d}`);
pruefe(`P8: CSP-Direktiven enthalten jede der ${INVENTAR.length} Quellen des Inventars`, inventarFehlt.length === 0, inventarFehlt.join(' | '));
// Code-Scan: externe Quellen im Client-Code, die NICHT im Inventar stehen (Server-Code src/lib/demo, src/app/api ausgenommen)
const clientDateien = dateien(path.join(ROOT, 'src'), /\.(ts|tsx|css)$/).filter((p) => !/[\\/]src[\\/](lib[\\/]demo|app[\\/]api)[\\/]/.test(p));
const SCAN = [
    [/\bsrc\s*[=:]\s*\{?\s*['"`](https:\/\/[^/'"`]+)/g, 'script-src|img-src|frame-src'],
    [/\.src\s*=\s*['"`](https:\/\/[^/'"`]+)/g, 'script-src'],
    [/mapEmbed\s*:\s*['"`](https:\/\/[^/'"`]+)/g, 'frame-src'],
    [/<iframe[^>]*src=\{?['"`](https:\/\/[^/'"`]+)/g, 'frame-src'],
    [/fetch\(\s*['"`](https:\/\/[^/'"`]+)/g, 'connect-src'],
    [/@import\s+(?:url\()?['"]?(https:\/\/[^/'")]+)/g, 'style-src'],
    [/url\(\s*['"]?(https:\/\/[^/'")]+)/g, 'img-src|font-src'],
];
const gefunden = new Map();
for (const p of clientDateien) {
    const t = readFileSync(p, 'utf8');
    for (const [re, direktiven] of SCAN) for (const m of t.matchAll(re)) gefunden.set(`${m[1]} (${direktiven})`, [...(gefunden.get(`${m[1]} (${direktiven})`) ?? []), rel(p)]);
}
const nichtImInventar = [...gefunden.keys()].filter((k) => {
    const origin = k.split(' ')[0];
    const direktiven = /\((.+)\)$/.exec(k)[1].split('|');
    return !direktiven.some((d) => (csp[d] ?? []).includes(origin) || (d === 'img-src' && (csp[d] ?? []).includes('https:')));
});
console.log(`INFO  Code-Scan externer Quellen (Client-Code, ${clientDateien.length} Dateien): ${[...gefunden.entries()].map(([k, v]) => `${k} ← ${[...new Set(v)].join(', ')}`).join(' | ')}`);
pruefe('P8: Code-Scan — keine externe Quelle im Client-Code ausserhalb der CSP', gefunden.size >= 3 && nichtImInventar.length === 0, nichtImInventar.join(', '));
pruefe('P8: KI-News (the-decoder.de) wird serverseitig geholt (keine Client-Komponente) — keine CSP-Direktive nötig', !/^['"]use client/m.test(lies('src/components/sections/KINewsSection.tsx')));
pruefe('P8: keine Resource Hints/Imports auf Google Fonts; Geist über next/font (Selbst-Hosting)', /from "next\/font\/google"/.test(layout) && !clientDateien.some((p) => codeZeilen(readFileSync(p, 'utf8').replace(/\r\n/g, '\n')).some((z) => /fonts\.(googleapis|gstatic)\.com/.test(z))));

console.log(`\n${ok}/${ok + fehl} bestanden`);
process.exit(fehl ? 1 : 0);
