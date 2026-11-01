#!/usr/bin/env node
/**
 * auftrag114-einheit-test.mjs (AUFTRAG-114) — Prüfungen ohne Server und ohne Browser.
 *
 * P1  Einblend-Animation: Regel `.overflow-hidden:has(.reveal, .reveal-stagger-container) { overflow: clip }`
 *     samt Kommentar wortgleich im @supports-Block; ServicesSection mit overflow-clip; mobile body-Regel mit
 *     clip; Prüfliste «overflow-hidden UND Reveal-Kinder» ohne programmatisches Scrollen.
 *     Header-Abstand: <main> pt-20 lg:pt-15, Hero min-h-0 py-12 lg:min-h-[90vh].
 * P2  (Icons: scripts/navigation-einheit-test.mjs)
 * P3  Datenschutz: Texte wortgleich aus AUFTRAG-114, Abschnitt 3 (aus der Auftragsdatei gelesen),
 *     Anker; KI-Anbieter-Namen nur auf /datenschutz (Grep über src/app/(website) ohne datenschutz/,
 *     src/components, public/llms*.txt, content/ auf /gemini|openai|gpt-|chatgpt/i = 0 Treffer;
 *     Ausnahmen robots.ts, src/lib/demo/, src/app/api/ liegen ausserhalb des Suchbereichs);
 *     Ersatzsatz und llms-Fassung wortgleich; keine Resource Hints auf fonts.googleapis.com.
 * P4  Preise: Merkmale wortgleich, Beträge unverändert, Starter ⊂ Business ⊂ Enterprise;
 *     KALENDER_SATZ wortgleich, KALENDER_SMS_SATZ entfernt; keine Zeile mit «SMS» und «in Entwicklung»
 *     (bzw. inEntwicklung/künftig/kommt bald/noch nicht) in src/**, public/llms*.txt.
 * P5  Anfrage: Texte wortgleich, Hash-Vorwahl, Nachricht, Fehlerpfad-Adresse (ohne Kontaktdaten),
 *     __forms.html-Option, Verknüpfungen (Bausteine, Paketkarten, KiDemo).
 *
 *   node scripts/auftrag114-einheit-test.mjs
 *
 * Node >= 22.18 (Type-Stripping für die .ts-Quellen).
 */
import { registerHooks } from 'node:module';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

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
});
const lade = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const ds = await lade('src/lib/datenschutz.ts');
const anbieter = await lade('src/lib/ki-anbieter.ts');
const preise = await lade('src/lib/ki-telefonassistent-preise.ts');
const entw = await lade('src/lib/in-entwicklung.ts');
const anfrage = await lade('src/lib/ki-anfrage.ts');

let ok = 0;
let fehl = 0;
function pruefe(name, bedingung, detail = '') {
    if (bedingung) ok++;
    else fehl++;
    console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + String(detail).slice(0, 400) : ''}`);
}
// [01.11.2026] AUFTRAG-116 (Nachtrag N3): Dateien mit LF-Zeilenenden lesen. Im Windows-Checkout (core.autocrlf=true)
// stehen CRLF im Arbeitsbaum; Regex-Prüfungen mit «\n» (z. B. der @supports-Block in globals.css) schlugen dort fehl,
// obwohl der Inhalt stimmt. Alle Lesezugriffe dieses Tests gehen über liesText().
const liesText = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const lies = (rel) => liesText(path.join(ROOT, rel));
const norm = (t) => t.replace(/\s+/g, ' ').trim();
function dateien(d, re = /\.(ts|tsx)$/) {
    if (!existsSync(d)) return [];
    return readdirSync(d).flatMap((n) => {
        const p = path.join(d, n);
        return statSync(p).isDirectory() ? dateien(p, re) : re.test(n) ? [p] : [];
    });
}
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

/* ------------------------------------------------------------------ */
/* Auftragsdatei (Quelle der wortgleichen Texte)                        */
/* ------------------------------------------------------------------ */
function auftragsDatei() {
    let d = ROOT;
    for (let i = 0; i < 8; i++) {
        const p = path.join(d, 'auftraege', 'AUFTRAG-114.md');
        if (existsSync(p)) return p;
        d = path.dirname(d);
    }
    return null;
}
const AUFTRAG_PFAD = auftragsDatei();
pruefe('Auftragsdatei AUFTRAG-114.md gefunden (Quelle der Soll-Texte)', !!AUFTRAG_PFAD, AUFTRAG_PFAD ?? 'nicht gefunden');
const AUFTRAG = AUFTRAG_PFAD ? liesText(AUFTRAG_PFAD) : '';
const AUFTRAG_NORM = norm(AUFTRAG);

/* ------------------------------------------------------------------ */
/* P1 — Einblend-Animation und Header-Abstand                           */
/* ------------------------------------------------------------------ */
const css = lies('src/app/globals.css');
const cssBlock = /```css\n([\s\S]*?)```/.exec(AUFTRAG)?.[1] ?? '';
const supportsBlock = /@supports \(animation-timeline: view\(\)\) \{\s*@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n  \}\n\}/.exec(css)?.[1] ?? '';
pruefe('P1a: Regel und Kommentar wortgleich aus dem Auftrag im Block @supports (animation-timeline: view()) › @media (prefers-reduced-motion: no-preference)', !!cssBlock && norm(supportsBlock).includes(norm(cssBlock)), norm(cssBlock).slice(0, 80));
pruefe('P1a: Selektor .overflow-hidden:has(.reveal, .reveal-stagger-container) → overflow: clip', /\.overflow-hidden:has\(\.reveal, \.reveal-stagger-container\)\s*\{\s*overflow: clip;\s*\}/.test(supportsBlock));
const services = lies('src/components/sections/ServicesSection.tsx');
pruefe('P1a: ServicesSection — Section mit overflow-clip, nicht overflow-hidden', /<section className="[^"]*\boverflow-clip\b[^"]*">/.test(services) && !/<section className="[^"]*\boverflow-hidden\b/.test(services));
const mobilBody = /\/\* Prevent horizontal overflow \*\/\s*body \{([\s\S]*?)\}/.exec(css)?.[1] ?? '';
pruefe('P1a: mobile body-Regel endet auf overflow-x: clip (body kein Scroll-Container, view() bezieht sich auf den Viewport)', /overflow-x: hidden;\s*overflow-x: clip;/.test(mobilBody), norm(mobilBody).slice(-80));

// Prüfliste: Dateien mit overflow-hidden UND Reveal-Kindern; keine davon scrollt programmatisch
const quellen = dateien(path.join(ROOT, 'src'), /\.tsx$/);
const pruefliste = quellen.filter((p) => {
    const t = liesText(p);
    return /\boverflow-hidden\b/.test(t) && /AnimatedSection|StaggerContainer|StaggerItem|\breveal\b/.test(t);
});
const scrollend = pruefliste.filter((p) => /\.scrollLeft\b|\.scrollTo\(|\.scrollBy\(|\.scrollTop\s*=/.test(liesText(p).replace(/window\.scrollTo\(/g, '')));
pruefe(`P1a: Prüfliste ${pruefliste.length} Dateien mit overflow-hidden und Reveal-Kindern — keine scrollt ein Element programmatisch (scrollLeft/scrollTo/scrollBy/scrollTop=)`, pruefliste.length >= 20 && scrollend.length === 0, scrollend.map(rel).join(', ') || pruefliste.map(rel).join(', '));
const scrollIntoViewDateien = quellen.filter((p) => /scrollIntoView/.test(liesText(p))).map(rel);
pruefe('P1a: scrollIntoView nur in ScrollToTop, KiDemo, SupportKostenRechner (scrollen Ziele in den Viewport, nicht die clip-Elemente)', JSON.stringify(scrollIntoViewDateien.sort()) === JSON.stringify(['src/components/layout/ScrollToTop.tsx', 'src/components/tools/KiDemo.tsx', 'src/components/tools/SupportKostenRechner.tsx']), scrollIntoViewDateien.join(', '));

const layout = lies('src/app/(website)/layout.tsx');
pruefe('P1b: <main> pt-20 lg:pt-15 (gemessene Header-Höhe; ab lg abzüglich Kontaktleiste im Fluss)', /<main className="flex-1 pt-20 lg:pt-15">/.test(layout));
const hero = lies('src/components/sections/HeroSection.tsx');
pruefe('P1b: Hero mobil ohne min-h-[90vh]-Zentrierung: min-h-0 py-12 lg:min-h-[90vh] lg:py-12', /className="relative min-h-0 py-12 lg:min-h-\[90vh\] lg:py-12 flex items-center overflow-hidden/.test(hero));
pruefe('P1b: Überzeile «IT-Dienstleister Winterthur» bleibt im Hero', hero.includes('IT-Dienstleister Winterthur'));

/* ------------------------------------------------------------------ */
/* P3 — Datenschutz                                                     */
/* ------------------------------------------------------------------ */
// Abschnitt 3 des Auftrags in Abschnitte zerlegen; Fliesstext zeilenweise zu einem Strom verbunden
const teil3 = AUFTRAG.split(/\n## 3\. Texte Datenschutzerklärung[^\n]*\n/)[1] ?? '';
const sollAbschnitte = [];
let sollH1 = '';
let sollEinleitung = '';
let aktuell = null;
for (const zeile of teil3.split('\n')) {
    const z = zeile.trim();
    if (!z) continue;
    let m;
    if ((m = /^H1: (.+)$/.exec(z))) sollH1 = m[1];
    else if ((m = /^Einleitung \(p\): (.+)$/.exec(z))) {
        sollEinleitung = m[1];
        aktuell = { einleitung: true };
    } else if ((m = /^## (.+?) \(id=([a-z-]+)\)$/.exec(z))) {
        aktuell = { titel: m[1], id: m[2], strom: [] };
        sollAbschnitte.push(aktuell);
    } else if (aktuell?.einleitung) sollEinleitung += ' ' + z;
    else if (aktuell) {
        if ((m = /^\(h3\) (.+)$/.exec(z))) aktuell.strom.push(`[h3] ${m[1]}`);
        else if ((m = /^Tabelle, Spalten (.+):$/.exec(z))) aktuell.strom.push(`[kopf] ${m[1].replace(/[«»]/g, '').split(', ').join(' | ')}`);
        else if (z.startsWith('|')) aktuell.strom.push(`[zeile] ${z.replace(/^\|\s*|\s*\|$/g, '').split(/\s*\|\s*/).join(' | ')}`);
        else if ((m = /^Satz unter der Tabelle: (.+)$/.exec(z))) aktuell.strom.push(m[1]);
        else aktuell.strom.push(z);
    }
}
const sollStand = sollAbschnitte.length ? (sollAbschnitte[sollAbschnitte.length - 1].strom.find((s) => s.startsWith('Stand:')) ?? '') : '';
if (sollStand) sollAbschnitte[sollAbschnitte.length - 1].strom = sollAbschnitte[sollAbschnitte.length - 1].strom.filter((s) => s !== sollStand);
const istStrom = (a) =>
    a.bloecke
        .map((b) =>
            b.art === 'h3'
                ? `[h3] ${b.text}`
                : b.art === 'tabelle'
                  ? [`[kopf] ${ds.DS_DIENSTLEISTER_SPALTEN.join(' | ')}`, ...ds.DS_DIENSTLEISTER.map((r) => `[zeile] ${r.join(' | ')}`)].join(' ')
                  : b.text,
        )
        .join(' ');
pruefe('P3: Auftrag Abschnitt 3 gelesen (11 Abschnitte, H1, Einleitung, Stand)', sollAbschnitte.length === 11 && !!sollH1 && !!sollEinleitung && !!sollStand, `${sollAbschnitte.length} Abschnitte`);
pruefe('P3: H1 wortgleich', ds.DS_TITEL === sollH1, ds.DS_TITEL);
pruefe('P3: Einleitung wortgleich', norm(ds.DS_EINLEITUNG) === norm(sollEinleitung));
pruefe('P3: «Stand: 31. Oktober 2026» wortgleich', ds.DS_STAND === sollStand, ds.DS_STAND);
pruefe('P3: Reihenfolge, Titel und Anker (id) der 11 Abschnitte exakt', JSON.stringify(ds.DS_ABSCHNITTE.map((a) => [a.titel, a.id])) === JSON.stringify(sollAbschnitte.map((a) => [a.titel, a.id])), ds.DS_ABSCHNITTE.map((a) => a.id).join(','));
for (const soll of sollAbschnitte) {
    const ist = ds.DS_ABSCHNITTE.find((a) => a.id === soll.id);
    const gleich = !!ist && norm(istStrom(ist)) === norm(soll.strom.join(' '));
    let detail = '';
    if (!gleich && ist) {
        const a = norm(istStrom(ist));
        const b = norm(soll.strom.join(' '));
        let i = 0;
        while (i < a.length && a[i] === b[i]) i++;
        detail = `ab Zeichen ${i}: ist «${a.slice(i, i + 60)}» / soll «${b.slice(i, i + 60)}»`;
    }
    pruefe(`P3: Text wortgleich — ${soll.titel}`, gleich, detail);
}
pruefe('P3: Anker #testanruf-ki-telefonassistent bleibt (Demo verlinkt ihn)', ds.DS_ABSCHNITTE.some((a) => a.id === 'testanruf-ki-telefonassistent') && lies('src/components/tools/KiDemo.tsx').includes('/datenschutz#testanruf-ki-telefonassistent'));
pruefe('P3: Dienstleister-Tabelle 8 Zeilen × 4 Spalten', ds.DS_DIENSTLEISTER.length === 8 && ds.DS_DIENSTLEISTER.every((r) => r.length === 4));
pruefe('P3: Metadaten wortgleich (title, description)', ds.DS_META.titel === 'Datenschutzerklärung | InfraOne IT Solutions' && AUFTRAG_NORM.includes(norm(`description «${ds.DS_META.beschreibung}»`)), ds.DS_META.beschreibung);
const dsSeite = lies('src/app/(website)/datenschutz/page.tsx');
pruefe('P3: Seite nutzt title.absolute (ohne Vorlage «| InfraOne»), Tabelle als <table> in overflow-x-auto', /title: \{ absolute: DS_META\.titel \}/.test(dsSeite) && /overflow-x-auto[\s\S]*<table/.test(dsSeite) && /max-w-3xl mx-auto/.test(dsSeite) && /prose/.test(dsSeite));

// KI-Anbieter nur in der Datenschutzerklärung
const ANBIETER_RE = /gemini|openai|gpt-|chatgpt/i;
const suchbereich = [
    ...dateien(path.join(ROOT, 'src', 'app', '(website)'), /\.(ts|tsx|js|jsx|json|md|mdx)$/).filter((p) => !rel(p).startsWith('src/app/(website)/datenschutz/')),
    ...dateien(path.join(ROOT, 'src', 'components'), /\.(ts|tsx|js|jsx|css)$/),
    path.join(ROOT, 'public', 'llms.txt'),
    path.join(ROOT, 'public', 'llms-full.txt'),
    ...dateien(path.join(ROOT, 'content'), /.*/),
];
const anbieterTreffer = suchbereich.flatMap((p) =>
    liesText(p)
        .split(/\r?\n/)
        .map((z, i) => (ANBIETER_RE.test(z) ? `${rel(p)}:${i + 1}` : null))
        .filter(Boolean),
);
pruefe(`P3: Grep /gemini|openai|gpt-|chatgpt/i über ${suchbereich.length} Dateien (src/app/(website) ohne datenschutz/, src/components, public/llms*.txt, content/) = 0 Treffer`, anbieterTreffer.length === 0, anbieterTreffer.join(', '));
const ausnahmen = ['src/app/robots.ts', ...dateien(path.join(ROOT, 'src', 'lib', 'demo')).map(rel), ...dateien(path.join(ROOT, 'src', 'app', 'api')).map(rel)].filter((r) => ANBIETER_RE.test(lies(r)));
console.log(`INFO  Ausnahmen mit Anbieter-Namen (Code/Crawler, nicht sichtbar, bleiben): ${ausnahmen.join(', ')}`);
pruefe('P3: Namen stehen auf /datenschutz (Quelle src/lib/datenschutz.ts)', /Gemini/.test(lies('src/lib/datenschutz.ts')) && /OpenAI/.test(lies('src/lib/datenschutz.ts')));
pruefe('P3: Ersatzsatz wortgleich aus dem Auftrag, Link auf /datenschutz#dienstleister', AUFTRAG_NORM.includes(norm(`«${anbieter.KI_ANBIETER_SATZ}»`)) && anbieter.KI_ANBIETER_LINK === '/datenschutz#dienstleister');
pruefe('P3: llms-Fassung wortgleich aus dem Auftrag und in llms.txt (2×) und llms-full.txt (1×)', AUFTRAG_NORM.includes(norm(`«${anbieter.KI_ANBIETER_LLMS}»`)) && lies('public/llms.txt').split(anbieter.KI_ANBIETER_LLMS).length - 1 === 2 && lies('public/llms-full.txt').split(anbieter.KI_ANBIETER_LLMS).length - 1 === 1);
pruefe('P3: Meta-Description «Sicherheit und Datenschutz» wortgleich', AUFTRAG_NORM.includes(norm(`«${anbieter.SICHERHEIT_DATENSCHUTZ_BESCHREIBUNG}»`)) && /BESCHREIBUNG = SICHERHEIT_DATENSCHUTZ_BESCHREIBUNG/.test(lies('src/app/(website)/ki-telefonassistent/sicherheit-datenschutz/page.tsx')));
const satzStellen = [
    ['src/app/(website)/ki-telefonassistent/page.tsx', /<KiAnbieterSatz \/>/],
    ['src/app/(website)/ki-telefonassistent/sicherheit-datenschutz/page.tsx', /<KiAnbieterSatz \/>[\s\S]*<KiAnbieterSatz \/>[\s\S]*<KiAnbieterSatz \/>/],
    ['src/components/ki-telefonassistent/inhalte/faq.ts', /\$\{KI_ANBIETER_SATZ\}/],
    ['src/components/ki-telefonassistent/inhalte/funktionen.ts', /\$\{KI_ANBIETER_SATZ\}/],
];
const fehlendeStellen = satzStellen.filter(([d, re]) => !re.test(lies(d))).map(([d]) => d);
pruefe('P3: Ersatzsatz an allen Fundstellen (Hub, Sicherheit 3×: Lead/Tabelle/Rechtsrahmen, FAQ, Funktionen)', fehlendeStellen.length === 0, fehlendeStellen.join(', '));
pruefe('P3: keine Resource Hints (<link href=…>) auf fonts.googleapis.com / fonts.gstatic.com im Quelltext', !dateien(path.join(ROOT, 'src')).some((p) => /href=["'{`]*https:\/\/fonts\.(googleapis|gstatic)\.com/.test(liesText(p))) && !/<link rel="(dns-prefetch|preconnect)"/.test(layout));

/* ------------------------------------------------------------------ */
/* P4 — Preise, SMS verfügbar                                           */
/* ------------------------------------------------------------------ */
const Z = entw.IN_ENTWICKLUNG_ZUSATZ;
const SOLL_MERKMALE = {
    lite: ['100 Gesprächsminuten pro Monat', '1 Telefonnummer'],
    starter: ['500 Gesprächsminuten pro Monat', 'SMS-Bestätigung an Anrufende', `Termine im Microsoft-365-Kalender${Z}`],
    business: [
        '1500 Gesprächsminuten pro Monat',
        '3 gleichzeitige Gespräche',
        'SMS-Bestätigung an Anrufende',
        `Termine im Microsoft-365-Kalender${Z}`,
        'Weiterleitung an eine Person',
        'Notfallmeldung an Ihre Notfallnummer',
        'Mehrere Agenten, z. B. ausserhalb der Öffnungszeiten',
    ],
    enterprise: [
        'Minuten und Gespräche nach Bedarf',
        'SMS-Bestätigung an Anrufende',
        `Termine im Microsoft-365-Kalender${Z}`,
        'Weiterleitung und Notfallmeldung wie Business',
        'Eigene Integrationen',
        'Anbindung an die vPBX',
        'Mehrere Standorte',
    ],
};
for (const p of preise.PAKETE) pruefe(`P4: Merkmale ${p.name} wortgleich aus dem Auftrag`, JSON.stringify(p.merkmale) === JSON.stringify(SOLL_MERKMALE[p.id]), p.merkmale.join(' | '));
pruefe('P4: Beträge unverändert (49/100, 149/500, 299/1500, auf Anfrage; Einrichtung 490; Zusatzminute 0.45)', JSON.stringify(preise.PAKETE.map((p) => [p.preisMonat, p.minuten])) === JSON.stringify([[49, 100], [149, 500], [299, 1500], [null, null]]) && preise.EINRICHTUNG_EINMALIG === 490 && preise.PREIS_ZUSATZMINUTE === 0.45 && preise.PREISE_FREIGEGEBEN === true);
pruefe('P4: Plakette «Empfehlung» bleibt am Starter', preise.PAKETE.filter((p) => p.empfohlen).map((p) => p.id).join() === 'starter');
const starterOhneMinuten = preise.PAKETE.find((p) => p.id === 'starter').merkmale.slice(1);
const fehltHoeher = ['business', 'enterprise'].flatMap((id) => starterOhneMinuten.filter((m) => !preise.PAKETE.find((p) => p.id === id).merkmale.includes(m)).map((m) => `${id}: ${m}`));
pruefe('P4: alles, was beim Starter steht (SMS, Kalender in Entwicklung), steht auch bei Business und Enterprise', fehltHoeher.length === 0, fehltHoeher.join(', '));
pruefe('P4: KALENDER_SATZ wortgleich aus dem Auftrag', AUFTRAG_NORM.includes(norm(`«${entw.KALENDER_SATZ}»`)), entw.KALENDER_SATZ);
// Verwendungen im Code (Kommentarzeilen, die den alten Namen nennen, zählen nicht)
const codeZeilen = (t) => t.split(/\r?\n/).filter((z) => !/^\s*(\/\/|\/?\*)/.test(z)).join('\n');
const smsSatzReste = [...dateien(path.join(ROOT, 'src')), ...dateien(path.join(ROOT, 'scripts'), /\.mjs$/)]
    .filter((p) => rel(p) !== 'scripts/auftrag114-einheit-test.mjs' && /\bKALENDER_SMS_SATZ\b/.test(codeZeilen(liesText(p))))
    .map(rel);
pruefe('P4: KALENDER_SMS_SATZ entfernt, alle Verwendungen auf KALENDER_SATZ umgestellt', !('KALENDER_SMS_SATZ' in entw) && smsSatzReste.length === 0, smsSatzReste.join(', '));
const SMS_IN_ENTWICKLUNG = /in Entwicklung|inEntwicklung|IN_ENTWICKLUNG|künftig|kommt bald|noch nicht/i;
const smsDateien = [...dateien(path.join(ROOT, 'src')), path.join(ROOT, 'public', 'llms.txt'), path.join(ROOT, 'public', 'llms-full.txt')];
let smsZeilen = 0;
const smsTreffer = smsDateien.flatMap((p) =>
    liesText(p)
        .split(/\r?\n/)
        .map((z, i) => {
            if (!/SMS/.test(z)) return null;
            smsZeilen++;
            return SMS_IN_ENTWICKLUNG.test(z) ? `${rel(p)}:${i + 1}` : null;
        })
        .filter(Boolean),
);
pruefe(`P4: grep "SMS" über src/** und public/llms*.txt (${smsZeilen} Zeilen) — keine mit «in Entwicklung»/inEntwicklung/künftig/kommt bald/noch nicht im selben Eintrag`, smsZeilen > 20 && smsTreffer.length === 0, smsTreffer.join(', '));
pruefe('P4: Kalender-Markierung bleibt (Badge-Zusatz und Satz weiterhin im Einsatz)', /inEntwicklung\('Termine im Microsoft-365-Kalender'\)/.test(lies('src/lib/ki-telefonassistent-preise.ts')) && /\$\{KALENDER_SATZ\}/.test(lies('src/components/ki-telefonassistent/inhalte/faq.ts')) && /Eintrag im Microsoft-365-Kalender: in Entwicklung, kommt bald/.test(lies('public/llms.txt')));

/* ------------------------------------------------------------------ */
/* P5 — Direkte Anfrage                                                 */
/* ------------------------------------------------------------------ */
const T = anfrage.ANFRAGE_TEXTE;
const wortgleich = [
    ['Überzeile', `Überzeile «${T.ueberzeile}»`],
    ['Titel', `Titel «${T.titel}»`],
    ['Lead', `Lead «${T.lead}»`],
    ['Knopf', `Knopf «${T.knopf}»`],
    ['Einwilligung', `«${T.einwilligung}»`],
    ['Erfolg', `«${T.erfolg}»`],
    ['Fehler', `«${T.fehler}»`],
    ['zweiter Hero-Knopf', `zweiter Knopf heisst «${T.cta}»`],
    ['Paketkarten', `→ «${T.paketKnopf}»`],
    ['Pakete', `(Select: ${anfrage.ANFRAGE_PAKETE.map((p) => `«${p}»`).join(', ')}, Vorgabe «${anfrage.ANFRAGE_PAKET_VORGABE}»)`],
    ['Felder', `Felder: ${anfrage.ANFRAGE_FELDER.name}*, ${anfrage.ANFRAGE_FELDER.firma}*, ${anfrage.ANFRAGE_FELDER.email}*, ${anfrage.ANFRAGE_FELDER.telefon}*, ${anfrage.ANFRAGE_FELDER.paket}`],
    ['optional', `${anfrage.ANFRAGE_FELDER.website} ${anfrage.ANFRAGE_FELDER.optional}, ${anfrage.ANFRAGE_FELDER.nachricht} ${anfrage.ANFRAGE_FELDER.optional}`],
];
const abweichend = wortgleich.filter(([, s]) => !AUFTRAG_NORM.includes(norm(s))).map(([n]) => n);
pruefe(`P5: ${wortgleich.length} Textstellen wortgleich aus dem Auftrag (Überzeile, Titel, Lead, Felder, Paketauswahl, Knopf, Einwilligung, Erfolg, Fehler, Knöpfe)`, abweichend.length === 0, abweichend.join(', '));
pruefe('P5: Einwilligung verlinkt /datenschutz#formulare (Anker existiert)', T.einwilligungLink === '/datenschutz#formulare' && ds.DS_ABSCHNITTE.some((a) => a.id === 'formulare') && T.einwilligung.includes(T.einwilligungLinkwort));
const hashFaelle = [
    ['#anfrage-lite', 'Lite'],
    ['#anfrage-starter', 'Starter'],
    ['#anfrage-business', 'Business'],
    ['#anfrage-enterprise', 'Enterprise'],
    ['#anfrage', null],
    ['#anfrage-xyz', null],
    ['', null],
];
pruefe('P5: Hash-Vorwahl paketAusHash (#anfrage-<paketid> → Paket, sonst nichts)', hashFaelle.every(([h, s]) => anfrage.paketAusHash(h) === s));
pruefe('P5: Paket-IDs der Vorwahl = IDs der Paketkarten', JSON.stringify(Object.keys(anfrage.ANFRAGE_PAKET_NACH_ID)) === JSON.stringify(preise.PAKETE.map((p) => p.id)) && preise.PAKETE.every((p) => anfrage.ANFRAGE_PAKET_NACH_ID[p.id] === p.name));
pruefe('P5: Nachricht «Paket: … / Website: … / Nachricht: …»', anfrage.anfrageNachricht('Starter', ' muster.ch ', 'Bitte Rückruf') === 'Paket: Starter / Website: muster.ch / Nachricht: Bitte Rückruf' && anfrage.anfrageNachricht('Lite', '', '') === 'Paket: Lite / Website: keine Angabe / Nachricht: keine Angabe');
const href = anfrage.anfrageKontaktHref('Muster AG', 'Business', 'muster.ch', 'Hallo');
const hp = new URL(href, 'https://infraone.ch').searchParams;
pruefe('P5: Fehlerpfad → /kontakt?subject=KI-Telefonassistent&message=… (Firma, Paket, Website, Nachricht; keine Kontaktdaten)', href.startsWith('/kontakt?') && hp.get('subject') === 'KI-Telefonassistent' && hp.get('message') === 'Anfrage KI-Telefonassistent / Firma: Muster AG / Paket: Business / Website: muster.ch / Nachricht: Hallo' && [...hp.keys()].join() === 'subject,message', href);
pruefe('P5: /kontakt übernimmt den Betreff «KI-Telefonassistent» (ContactSection)', /\/\^KI-Telefonassistent\(\?: für/.test(lies('src/components/sections/ContactSection.tsx')));
pruefe('P5: public/__forms.html enthält <option>KI-Telefonassistent</option> im Formular «contact»', /<form name="contact"[\s\S]*<option>KI-Telefonassistent<\/option>[\s\S]*<\/form>/.test(lies('public/__forms.html')));
const formular = lies('src/components/ki-telefonassistent/AnfrageFormular.tsx');
pruefe('P5: Versand wie der Kostenrechner (POST /__forms.html, urlencoded, form-name=contact, Felder name/company/email/phone/subject/message, Honeypot bot-field)', /fetch\('\/__forms\.html'/.test(formular) && /'Content-Type': 'application\/x-www-form-urlencoded'/.test(formular) && ["'form-name', 'contact'", "'bot-field'", "'name'", "'company'", "'email'", "'phone'", "'subject', ANFRAGE_BETREFF", "'message'"].every((s) => formular.includes(`body.append(${s}`)));
pruefe('P5: Fehlerpfad nach 1,5 s mit router.push', anfrage.ANFRAGE_WEITERLEITUNG_MS === 1500 && /setTimeout\(\(\) => router\.push\(ziel\), ANFRAGE_WEITERLEITUNG_MS\)/.test(formular));
pruefe('P5: Pflichtfelder Name, Firma, E-Mail, Telefon (required), Website und Nachricht ohne required', ['anfrage-name', 'anfrage-firma', 'anfrage-email', 'anfrage-telefon'].every((id) => new RegExp(`id="${id}"[^>]*\\brequired\\b`).test(formular)) && !/id="anfrage-website"[^>]*\brequired\b/.test(formular) && !/id="anfrage-nachricht"[^>]*\brequired\b/.test(formular));
pruefe('P5: sessionStorage «ki-anfrage-firma» wird nach dem Lesen gelöscht', anfrage.ANFRAGE_FIRMA_SCHLUESSEL === 'ki-anfrage-firma' && /getItem\(ANFRAGE_FIRMA_SCHLUESSEL\)[\s\S]{0,120}removeItem\(ANFRAGE_FIRMA_SCHLUESSEL\)/.test(formular));
const hub = lies('src/app/(website)/ki-telefonassistent/page.tsx');
pruefe('P5: Hub — Formular nach dem Preis-Teaser und vor den FAQ', hub.indexOf('<PreisTeaser />') > 0 && hub.indexOf('<AnfrageFormular') > hub.indexOf('<PreisTeaser />') && hub.indexOf('<AnfrageFormular') < hub.indexOf('<FaqListe'));
const preisSeite = lies('src/app/(website)/ki-telefonassistent/preise/page.tsx');
pruefe('P5: /preise — Formular unter den Paketkarten', preisSeite.indexOf('<PaketKarten />') > 0 && preisSeite.indexOf('<AnfrageFormular') > preisSeite.indexOf('<PaketKarten />') && preisSeite.indexOf('<AnfrageFormular') < preisSeite.indexOf('id="rechner"'));
const bausteine = lies('src/components/ki-telefonassistent/Bausteine.tsx');
pruefe('P5: Bausteine — «Assistent anfragen» als natives <a> auf #anfrage (Hero-Aktionen und Abschluss-CTA), kein «Beratung vereinbaren» mehr', (bausteine.match(/<a href=\{anfrageHref\} data-anfrage-knopf="">/g) ?? []).length === 2 && !/^\s*Beratung vereinbaren\s*$/m.test(bausteine) && anfrage.ANFRAGE_HREF === '/ki-telefonassistent#anfrage');
const preiseKomp = lies('src/components/ki-telefonassistent/Preise.tsx');
pruefe('P5: Paketkarten — «Anfragen» auf #anfrage-<paketid> (natives <a>), kein /kontakt mehr', /href=\{`#\$\{ANFRAGE_ID\}-\$\{p\.id\}`\}/.test(preiseKomp) && !/Beratung vereinbaren|Offerte anfragen|href="\/kontakt"/.test(preiseKomp));
const demo = lies('src/components/tools/KiDemo.tsx');
pruefe('P5: KiDemo — «So bekommt Ihre Firma diesen Assistenten» → /ki-telefonassistent#anfrage, Firma per sessionStorage', /<a\s+href=\{ANFRAGE_HREF\}[\s\S]{0,1500}sessionStorage\.setItem\(ANFRAGE_FIRMA_SCHLUESSEL[\s\S]{0,1500}So bekommt Ihre Firma diesen Assistenten/.test(demo) && !/\/kontakt\?subject=\$\{encodeURIComponent\('KI-Telefonassistent'\)\}/.test(demo));

console.log(`\n${ok}/${ok + fehl} bestanden`);
process.exit(fehl ? 1 : 0);
