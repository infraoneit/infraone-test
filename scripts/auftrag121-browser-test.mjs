#!/usr/bin/env node
/**
 * auftrag121-browser-test.mjs (AUFTRAG-121, umgebaut AUFTRAG-122 und AUFTRAG-123) — KI-Demo auf dem Handy; Desktop unverändert.
 *
 * [09.11.2026] Warum: Belege für AUFTRAG-121 (K1–K8). Gegen einen EIGENEN Server (Vorgabe http://localhost:3011,
 * nie :3000/:3010), Produktionsbuild (`npx next start -p 3011`). ALLE Aufrufe unter /api/demo/** sind gemockt
 * (fiktive Beispiel AG): kein echter Scan, keine Handelsregister-Abfrage, kein Anruf, kein Kontakt zu pbx01.
 *
 * [09.11.2026] Warum: AUFTRAG-123 ruhige Bühne — ein Gedanke pro Moment. Das Telefon steht gross in der Bühne
 * (sichtbares Fenster ohne 560-px-Boden); braucht es eine Handlung, liegt unten EIN Blatt (Frage + Haupthandlung) und
 * das Telefon skaliert sich per Transform darüber (nie angeschnitten, unter 0,36 ausgeblendet — AUFTRAG-123b). Gemessen an
 * echten Handy-Höhen (360×640, 375×553, 390×664, 393×727, 430×739, 375×812) und am Tablet (768×1024); je Schritt die
 * Z9-Punkte als einzelne check()-Zeilen. Die A-122-Phase `prozent` ist entfallen (keine feste Kartenhöhe mehr).
 *
 * [09.11.2026] Warum: AUFTRAG-123b Feinschliff — zusätzlich geprüft:
 *   N1  Schwelle 0,36: in jedem Blatt-Schritt Telefon ausgeblendet genau dann, wenn die Skala < 0,36 ist.
 *   N2  409 «Andere Website eingeben» ohne Globus, einzeilig, 56 px — Läufe bei 360, 375, 390 und 430 px Breite.
 *   N3  Such-Platzhalter mobil «z. B. Muster AG», nicht abgeschnitten (Textbreite ≤ Innenbreite) — 360 und 390 px.
 *   N4  Ende: Haupthandlung «Angebot anfragen» (volle Breite, 56 px, Radius 16 px, #1f7a35), darunter Textlink
 *       «Nochmals testen»; Fehler: «Nochmals versuchen» + Textlink «Angebot anfragen». Nach «Mehr anzeigen» bleiben beide im Bild.
 *   N5  Regel für CLS ≠ 0 (Bestand O1): Liegen SÄMTLICHE Quellen aller Layout-Shifts eines Laufs innerhalb der Telefon-Figur
 *       (figure[aria-label^="Vorschau"]) und ist die Summe ≤ 0,001, wird das als «INFO bekannt (Bestand Telefon-Ansicht,
 *       O1)» protokolliert statt als Fehlschlag (derselbe Shift misst am Desktop, Telefon-Ansicht laut Auftrag tabu). Jede
 *       Quelle ausserhalb des Telefons, eine Quelle ohne Knoten oder eine Summe > 0,001 bleibt ein Fehlschlag.
 *
 *   PHASE=vorher  → nur Bilder (Stand vor der Änderung, 6682c0b): Desktop-Referenz, Handy 390×664 und 360×640 mit 1 und 5 Treffern
 *   PHASE=nachher → Z9 je Viewport und Schritt, Fälle (1/5 Treffer, Suche, 409, Anruf gescheitert), Statuszeile beim
 *                   Scrollen, Turnstile (Attrappe), Kontraste, reduzierte Bewegung, Tablet, Desktop pixelgenau gegen «vorher»,
 *                   Filmstreifen (sharp) und Messtabelle
 *   PHASE=k8      → nur K8 (A-121): ERWARTE_ANRUF_VON (Vorgabe «+41 44 552 03 06») steht im Formular-Hinweis, in der
 *                   Ablauf-Liste und im Telefon-Bildschirm (Desktop, damit das Telefon sichtbar ist)
 *
 *   $env:BASE_URL='http://localhost:3011'; $env:PHASE='nachher'; node scripts/auftrag121-browser-test.mjs
 *   Bilder: $env:SCREENS_DIR (Vorgabe auftraege/ergebnisse/A123b-screens); $env:NUR='390x664' nur diese Läufe
 */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'http://localhost:3011';
if (/:(3000|3010)\b/.test(BASE)) {
    console.error('Ports 3000 und 3010 gehören dem Inhaber (Testlinks) — bitte den eigenen Server auf :3011 verwenden.');
    process.exit(2);
}
const PHASE = ['vorher', 'k8'].includes(process.env.PHASE) ? process.env.PHASE : 'nachher';
const CHROME = process.env.PLAYWRIGHT_CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SEITE = `${BASE}/ki-telefonassistent`;
const ANRUF_VON = process.env.ERWARTE_ANRUF_VON || '+41 44 552 03 06';
const NUR = process.env.NUR || null;
/** [09.11.2026] Warum: AUFTRAG-123b (N1) — kleinste Telefon-Skala (KiDemo.tsx TELEFON_MIN_SKALA); N5 — Grenze für den bekannten Shift */
const SKALA_MIN = 0.36;
const CLS_BEKANNT_MAX = 0.001;

function ergebnisOrdner() {
    let d = ROOT;
    for (let i = 0; i < 8; i++) {
        if (existsSync(path.join(d, 'auftraege', 'ergebnisse'))) return path.join(d, 'auftraege', 'ergebnisse');
        d = path.dirname(d);
    }
    return path.join(ROOT, 'auftraege-ergebnisse');
}
// [09.11.2026] Warum: AUFTRAG-123 ruhige Bühne — Bilder unter A123-screens; AUFTRAG-123b: Vorgabe A123b-screens
const SCREENS_BASIS = process.env.SCREENS_DIR || path.join(ergebnisOrdner(), 'A123b-screens');
const SCREENS = path.join(SCREENS_BASIS, PHASE);
mkdirSync(SCREENS, { recursive: true });

const ergebnisse = [];
function check(name, ok, detail = '') {
    ergebnisse.push({ name, ok: !!ok, detail: String(detail).slice(0, 900) });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? ' — ' + String(detail).slice(0, 400) : ''}`);
}

/* ------------------------------------------------------------------ */
/* Texte (AUFTRAG-123, Abschnitt 3, wortgleich) und Bestand            */
/* ------------------------------------------------------------------ */

const T = {
    t1: 'Ist das Ihre Firma?',
    t2: 'Aus dem Handelsregister (Zefix)',
    t3: (name, sitz) => `${name}, ${sitz}: Das ist meine Firma`,
    t4a: (n) => `${n} ist bereit`,
    t4b: (n) => `${n} soll mich anrufen`,
    t5: (n) => `Wohin darf ${n} anrufen?`,
    t6: 'Schweizerdeutsch ist noch in Erprobung.',
    mehrere: 'Welche ist Ihre Firma?',
    datenschutz: 'Wir prüfen den Firmennamen gegen das öffentliche Handelsregister (Zefix).',
    lese: 'Ihre Website lesen wir erst, nachdem Sie Ihre Firma bestätigt haben.',
    einwilligung: 'Ich bin unter dieser Nummer erreichbar und möchte den Testanruf erhalten. Es gelten die Datenschutzhinweise.',
};

/* ------------------------------------------------------------------ */
/* Attrappe (alle /api/demo/** gemockt)                                */
/* ------------------------------------------------------------------ */

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect x="4" y="12" width="36" height="36" rx="8" fill="#E8A13D"/><text x="50" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1E3A5F">Beispiel AG</text></svg>`;
const SCAN_ID = 's-a123attrappe0001';
const PROFIL = {
    firma: 'Beispiel AG',
    website: 'https://beispiel-ag.ch',
    assistent_name: 'Lena',
    branche: 'Elektroinstallationen',
    telefon: '044 000 00 00',
    email: null,
    adresse: null,
    oeffnungszeiten_text: 'Mo–Fr 07:30–17:00',
    firma_text: 'Die Beispiel AG ist ein fiktiver Elektrobetrieb für diesen Test.',
    faehigkeiten: ['Rund um die Uhr erreichbar', 'Beantwortet Fragen aus Ihrer Website', 'Nimmt Anliegen und Rückrufwünsche auf'],
    wissen: Array.from({ length: 12 }, (_, i) => ({ frage: `Testfrage ${i + 1}`, antwort: 'Testantwort der Attrappe.', thema: 'Test' })),
    logo_url: null,
    farben: { primaer: '#1E3A5F', sekundaer: '#E8A13D' },
    stimme: 'weiblich',
};
const TREFFER = { uid: 'CHE000000001', uid_formatiert: 'CHE-000.000.001', name: 'Beispiel AG', sitz: 'Winterthur', status: 'ACTIVE', status_text: 'aktiv', rechtsform: 'AG', aktiv: true };
/** [09.11.2026] Warum: AUFTRAG-123 (Z9) — 5 Treffer, davon 1 inaktiv (gelöscht); ein langer Name prüft den Umbruch auf 2 Zeilen */
function trefferListe(n) {
    if (n <= 1) return [TREFFER];
    const orte = ['Zürich', 'Bern', 'St. Gallen', 'Luzern'];
    return Array.from({ length: n }, (_, i) => {
        if (i === 0) return TREFFER;
        const t = { ...TREFFER, uid: `CHE00000000${i + 1}`, uid_formatiert: `CHE-000.000.00${i + 1}`, name: i === 2 ? 'Beispiel Elektro- und Gebäudetechnik Ostschweiz AG' : `Beispiel ${i + 1} AG`, sitz: orte[i - 1] };
        return i === n - 1 ? { ...t, status: 'CANCELLED', status_text: 'gelöscht', aktiv: false } : t;
    });
}
// lange Zusammenfassung (mehr als sechs Zeilen) für «Mehr anzeigen»
const ZUSAMMENFASSUNG =
    'Testgespräch (Attrappe im Browser). Die Anruferin wollte wissen, ob die Beispiel AG auch am Samstag Notfalleinsätze übernimmt. Lena hat die Öffnungszeiten Mo–Fr 07:30–17:00 genannt, auf den Pikettdienst hingewiesen und einen Rückruf für Montagmorgen notiert. Anliegen: defekter Sicherungskasten in einem Einfamilienhaus in Winterthur, keine Gefahr im Verzug. Kontakt: Frau Muster, Rückruf unter der angerufenen Nummer. Stimmung freundlich, Gespräch nach rund drei Minuten von der Anruferin beendet.';
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
// Vollscan (Stufe 2) antwortet erst nach ≥ 1500 ms, damit die passive Phase messbar ist
const VOLLSCAN_MS = 2200;

/**
 * fall: 'normal' (Treffer aus dem automatischen Abgleich), 'suche' (automatisch kein Treffer → eigene Suche → 1 Treffer),
 * 'passt_nicht' (Bestätigung → 409 website_passt_nicht)
 */
async function apiAbfangen(page, { treffer = 1, fehler = false, fall = 'normal' } = {}) {
    const z = { start: 0, anrufe: 0, fremd: [], hr: [], anrufKoerper: [] };
    await page.route('**/api/demo/**', (r) => {
        z.fremd.push(r.request().url());
        return r.fulfill({ status: 418, contentType: 'application/json', body: '{"fehler":"A123-Test: gesperrt"}' });
    });
    await page.route('**/api/demo/bild/**', (r) => r.fulfill({ status: 200, contentType: 'image/svg+xml', body: LOGO_SVG }));
    await page.route('**/api/demo/scan', async (r) => {
        const body = JSON.parse(r.request().postData() || '{}');
        if (!body.scan_id) {
            await warte(500);
            return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ scan_id: SCAN_ID, stufe: 'vorpruefung', host: 'beispiel-ag.ch' }) });
        }
        await warte(VOLLSCAN_MS);
        return r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                scan_id: SCAN_ID,
                profil: PROFIL,
                assistent_weiblich: true,
                logos: [{ src: `/api/demo/bild/${SCAN_ID}/0`, index: 0, quelle: 'attrappe', format: 'svg', breite: 200, hoehe: 60, hell: false, transparenz: true, farbe: '#1E3A5F', umgebung: '#FFFFFF' }],
                farb_signale: [{ farbe: '#1E3A5F', gewicht: 5, quelle: 'css-variable' }],
                funde: { seiten: 4, firma: 'Beispiel AG', telefon: '044 000 00 00', oeffnungszeiten: 'Mo–Fr 07:30–17:00', farbe: '#1E3A5F' },
            }),
        });
    });
    await page.route('**/api/demo/handelsregister', async (r) => {
        const body = JSON.parse(r.request().postData() || '{}');
        z.hr.push(body);
        await warte(body.bestaetige ? 400 : 1200);
        const liste = trefferListe(treffer);
        const basis = { scan_id: SCAN_ID, modus: 'streng', quelle: treffer > 1 ? 'name' : 'uid', treffer: liste, versuche_rest: 3 };
        const json = (status, d) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(d) });
        if (body.bestaetige) {
            if (fall === 'passt_nicht')
                return json(409, { code: 'website_passt_nicht', fehler: 'Die Website gehört nicht zu dieser Firma.', website: 'beispiel-ag.ch', firma: 'Muster Holding AG' });
            const t = [...liste, TREFFER].find((x) => x.uid === body.bestaetige) ?? TREFFER;
            return json(200, { ...basis, ergebnis: 'bestaetigt', bestaetigt: { uid: t.uid, uid_formatiert: t.uid_formatiert, name: t.name, sitz: t.sitz, gebunden: 'domain' }, gueltig_bis: Date.now() + 3600e3 });
        }
        if (body.suche) return json(200, { ...basis, quelle: 'manuell', treffer: [TREFFER], versuche_rest: 2, ergebnis: 'treffer', bestaetigt: null });
        if (fall === 'suche' || treffer === 0) return json(200, { ...basis, quelle: 'name', treffer: [], ergebnis: 'kein_treffer', bestaetigt: null });
        return json(200, { ...basis, ergebnis: 'treffer', bestaetigt: null });
    });
    await page.route('**/api/demo/profil', async (r) => {
        await warte(500);
        await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profil: PROFIL, funde: { telefon: '044 000 00 00', oeffnungszeiten: 'Mo–Fr 07:30–17:00', wissen: 12 } }) });
    });
    await page.route('**/api/demo/anruf', async (r) => {
        z.anrufe++;
        z.anrufKoerper.push(JSON.parse(r.request().postData() || '{}'));
        z.start = Date.now();
        await r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'd-20261109-attrappea123' }) });
    });
    await page.route('**/api/demo/auftraege/**', async (r) => {
        const t = Date.now() - z.start;
        const ende = fehler ? 'fehler' : 'beendet';
        const status = t > 9000 ? ende : t > 6000 && !fehler ? 'verbunden' : t > 3000 ? 'waehlt' : 'wartend';
        await r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'd-20261109-attrappea123',
                status,
                zeit: new Date().toISOString(),
                dauer_s: status === 'beendet' ? 171 : null,
                zusammenfassung: status === 'beendet' ? ZUSAMMENFASSUNG : null,
                grund: status === 'fehler' ? 'nicht_erreicht' : null,
            }),
        });
    });
    return z;
}

/* ------------------------------------------------------------------ */
/* Messhilfen                                                          */
/* ------------------------------------------------------------------ */

const AKTION = 'section[aria-labelledby="ki-demo-anruf-titel"]';
const TELEFON = 'figure[aria-label^="Vorschau"]';

/**
 * Lage von Kompaktzeile, Bühne (zweite Rasterzeile), Telefon (gemessen mit Transform: Rechteck ÷ Grundhöhe = Skala),
 * Blatt (falls sichtbar), Haupthandlungen, Statuszeile, Fokus und Telefon-Ansicht.
 */
async function messe(page) {
    return page.evaluate(
        ([sel, telSel]) => {
            const r1 = (n) => Math.round(n * 10) / 10;
            const rect = (el) => {
                if (!el) return null;
                const r = el.getBoundingClientRect();
                return { top: r1(r.top), bottom: r1(r.bottom), left: r1(r.left), right: r1(r.right), hoehe: r1(r.height), breite: r1(r.width), mitte: r1(r.left + r.width / 2) };
            };
            const sichtbar = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).opacity !== '0';
            const fig = document.querySelector(telSel);
            const kompaktEl = document.querySelector('[data-ki-demo-kompakt]');
            const buehneEl = fig?.parentElement?.parentElement ?? null;
            const zeilen = buehneEl ? getComputedStyle(buehneEl).gridTemplateRows.split(' ').map(parseFloat) : [];
            const br = buehneEl?.getBoundingClientRect();
            const buehneHoehe = zeilen.length ? zeilen[zeilen.length - 1] : null;
            const blattEl = document.querySelector(sel);
            const blattSichtbar = !!blattEl && blattEl.getClientRects().length > 0;
            const fcs = fig ? getComputedStyle(fig) : null;
            const fr = fig?.getBoundingClientRect();
            const status = document.querySelector('button[data-zustand]:not([id])');
            const h1 = document.querySelector('h1');
            const h1r = h1?.getBoundingClientRect();
            const schirm = fig?.querySelector('[class*="bildschirm"]');
            const sr = schirm?.getBoundingClientRect();
            const aktiv = fig ? [...fig.querySelectorAll('[aria-hidden="false"]')].find((a) => a.className.includes('ansicht')) : null;
            // Überlauf im Telefon (Elemente ausserhalb des Bildschirms, abgeschnittener nowrap-Text, Ansicht höher als der Bildschirm)
            const ueberlauf = [];
            if (aktiv && sr) {
                for (const el of aktiv.querySelectorAll('*')) {
                    if (el.closest('[class*="ringe"]')) continue;
                    const r = el.getBoundingClientRect();
                    if (!r.width || !r.height) continue;
                    if (r.left < sr.left - 1 || r.right > sr.right + 1) ueberlauf.push(`${el.tagName}.${String(el.className).slice(0, 30)} x ${r1(r.left)}–${r1(r.right)} / ${r1(sr.left)}–${r1(sr.right)}`);
                    const cs = getComputedStyle(el);
                    if (cs.whiteSpace === 'nowrap' && cs.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && el.children.length === 0) ueberlauf.push(`${el.tagName} Text breiter (${el.scrollWidth} > ${el.clientWidth}): ${el.textContent.slice(0, 30)}`);
                }
                if (aktiv.scrollHeight > aktiv.clientHeight + 1) ueberlauf.push(`Ansicht höher als der Bildschirm (${aktiv.scrollHeight} > ${aktiv.clientHeight})`);
            }
            const haupt = blattEl ? [...blattEl.querySelectorAll('[data-blatt-haupt], [data-blatt-zweit]')] : [];
            const links = blattEl ? [...blattEl.querySelectorAll('[data-blatt-link]')] : [];
            const innen = blattEl ? [...blattEl.querySelectorAll('[data-blatt-scroll]')] : [];
            const fokus = document.activeElement;
            const bcs = blattEl ? getComputedStyle(blattEl) : null;
            return {
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
                scrollY: Math.round(window.scrollY),
                maxScrollY: Math.round(window.__maxScroll ?? -1),
                scrollWidth: document.documentElement.scrollWidth,
                header: rect(document.querySelector('header')),
                kompakt: kompaktEl ? { ...rect(kompaktEl), text: kompaktEl.innerText.replace(/\s+/g, ' ').trim() } : null,
                gridAreas: buehneEl ? getComputedStyle(buehneEl).gridTemplateAreas : null,
                buehne: br && buehneHoehe !== null ? { top: r1(br.bottom - buehneHoehe), bottom: r1(br.bottom), hoehe: r1(buehneHoehe) } : null,
                skalaVar: buehneEl ? getComputedStyle(buehneEl).getPropertyValue('--telefon-skala').trim() : '',
                telefonAusAttr: buehneEl?.getAttribute('data-telefon-aus') ?? null,
                telefon: fig
                    ? {
                          ...rect(fig),
                          basisBreite: fig.offsetWidth,
                          basisHoehe: fig.offsetHeight,
                          skala: fig.offsetHeight ? Math.round((fr.height / fig.offsetHeight) * 1000) / 1000 : null,
                          opacity: fcs.opacity,
                          visibility: fcs.visibility,
                          aus: fcs.opacity === '0' || fcs.visibility === 'hidden',
                          transition: fcs.transitionDuration,
                      }
                    : null,
                telefonAnsicht: aktiv ? aktiv.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) : null,
                telefonUeberlauf: ueberlauf.slice(0, 6),
                blattImDom: !!blattEl,
                blatt: blattSichtbar
                    ? {
                          ...rect(blattEl),
                          art: blattEl.getAttribute('data-blatt'),
                          scrollH: blattEl.scrollHeight,
                          clientH: blattEl.clientHeight,
                          h2: blattEl.querySelectorAll('h2').length,
                          hilfe: blattEl.querySelectorAll('[data-blatt-hilfe]').length,
                          hilfeText: [...blattEl.querySelectorAll('[data-blatt-hilfe]')].map((e) => e.innerText.trim()),
                          titel: blattEl.querySelector('h2')?.innerText.trim() ?? null,
                          text: blattEl.innerText.replace(/\s+/g, ' ').trim(),
                          haupt: haupt.map((h) => ({ ...rect(h), id: h.id, text: h.innerText.replace(/\s+/g, ' ').trim(), sichtbar: sichtbar(h) })),
                          links: links.map((h) => ({ ...rect(h), id: h.id, text: h.innerText.trim(), sichtbar: sichtbar(h) })),
                          innen: innen.map((e) => ({ scrollH: e.scrollHeight, clientH: e.clientHeight })),
                          animation: `${bcs.animationName} ${bcs.animationDuration}`,
                          transition: bcs.transitionDuration,
                      }
                    : null,
                blattArtImDom: blattEl?.getAttribute('data-blatt') ?? null,
                status: status ? { sichtbar: status.getAttribute('data-sichtbar') === 'true', text: status.innerText.replace(/\s+/g, ' ').trim() } : null,
                schrittzeile: !!document.querySelector('[data-ki-demo-schritt]'),
                lesehinweis: !!document.querySelector('[data-hr-lesehinweis]'),
                datenschutzImBlatt: !!blattEl && blattEl.innerText.includes('Wir prüfen den Firmennamen gegen das öffentliche Handelsregister'),
                h1Sichtbar: !!h1r && h1r.width > 2 && h1r.height > 2,
                konsoleSichtbar: !!document.querySelector('#ki-demo-url')?.getClientRects().length,
                fokus: { id: fokus?.id || null, tag: fokus?.tagName ?? null, imTelefon: !!fig && fig.contains(fokus), imBlatt: !!blattEl && blattEl.contains(fokus), istBlatt: fokus === blattEl },
            };
        },
        [AKTION, TELEFON],
    );
}

const tabelle = [];
const lageText = (m) =>
    `Bühne ${m.buehne?.top}–${m.buehne?.bottom} (${m.buehne?.hoehe}), Kompaktzeile ${m.kompakt?.top}–${m.kompakt?.bottom}, Telefon ${m.telefon?.top}–${m.telefon?.bottom} (Grund ${m.telefon?.basisBreite}×${m.telefon?.basisHoehe}, Skala ${m.telefon?.skala}, ${m.telefon?.aus ? 'aus' : 'sichtbar'}), Blatt ${m.blatt ? `${m.blatt.top}–${m.blatt.bottom} h${m.blatt.hoehe} (${m.blatt.art})` : 'keins'}, Fenster ${m.innerHeight}, scrollY ${m.scrollY}`;

/**
 * Z9.1–Z9.6 je Schritt als einzelne check()-Zeilen. passiv = Vollscan/Anruf (kein Blatt im DOM, Skala 1).
 * statusErwartet: Statuszeile sichtbar (nur im Scroll-Lauf).
 */
function pruefeSchritt(lauf, schritt, m, { passiv = false, blattErwartet = !passiv, statusErwartet = false } = {}) {
    const p = `[${lauf}] ${schritt}`;
    check(`${p} Z9.1: scrollY 0, kein waagrechtes Scrollen`, m.scrollY === 0 && m.scrollWidth <= m.innerWidth, `scrollY ${m.scrollY}, scrollWidth ${m.scrollWidth}/${m.innerWidth}`);
    if (blattErwartet) {
        const b = m.blatt;
        const hauptOk = !!b && b.haupt.every((h) => h.sichtbar && h.top >= b.top - 0.5 && h.bottom <= Math.min(b.bottom, m.innerHeight) + 0.5 && h.hoehe >= 44);
        const linkOk = !!b && b.links.every((l) => l.sichtbar && l.bottom <= Math.min(b.bottom, m.innerHeight) + 0.5 && l.hoehe >= 44);
        check(
            `${p} Z9.2: Blatt ganz im Fenster (in der Bühne), Haupthandlung(en) ganz sichtbar und ≥ 44 px, Textlink ≥ 44 px`,
            !!b && b.top >= m.buehne.top - 0.5 && b.bottom <= m.innerHeight + 0.5 && Math.abs(b.bottom - m.buehne.bottom) <= 1 && hauptOk && linkOk,
            `${lageText(m)} · Haupt ${JSON.stringify(b?.haupt)} · Link ${JSON.stringify(b?.links)}`,
        );
    } else {
        check(`${p} Z9.2: kein sichtbares Blatt`, !m.blatt, lageText(m));
    }
    const t = m.telefon;
    const grenze = m.blatt ? m.blatt.top - 8 : m.innerHeight - 8;
    check(
        `${p} Z9.3: Telefon ganz sichtbar (Oberkante ≥ Kompaktzeile, Unterkante ≤ ${m.blatt ? 'Blatt − 8' : 'Fenster − 8'}) oder ausgeblendet`,
        !!t && (t.aus || (t.top >= (m.kompakt?.bottom ?? 0) - 0.5 && t.bottom <= grenze + 0.5)),
        lageText(m),
    );
    // [09.11.2026] Warum: AUFTRAG-123b (N1) — Schwelle 0,36 (vorher 0,32): ausgeblendet genau dann, wenn die Skala darunter liegt
    if (m.blatt) {
        const s = parseFloat(m.skalaVar);
        check(`${p} N1: Telefon ${t?.aus ? 'ausgeblendet' : 'sichtbar'} bei Skala ${m.skalaVar} (ausgeblendet genau unter ${SKALA_MIN})`, !!t && Number.isFinite(s) && t.aus === s < SKALA_MIN, lageText(m));
    }
    // Skala ohne Blatt = 1; nur wo die Mindestbreite (240 px) das Telefon höher als die Bühne macht (375×553), die Einpass-Skala
    if (passiv) check(`${p} Z9.4: passive Phase — kein Blatt im DOM, Skala ${einpass(m)} (ohne Blatt), Telefon sichtbar`, !m.blattImDom && Math.abs((t?.skala ?? 0) - einpass(m)) < 0.005 && !t?.aus, lageText(m));
    if (m.blatt)
        check(
            `${p} Z9.5: keine Schrittzeile, kein Lesehinweis, keine Datenschutz-Fusszeile; höchstens ein h2 und eine Hilfszeile`,
            !m.schrittzeile && !m.lesehinweis && !m.datenschutzImBlatt && m.blatt.h2 <= 1 && m.blatt.hilfe <= 1,
            JSON.stringify({ schritt: m.schrittzeile, lese: m.lesehinweis, ds: m.datenschutzImBlatt, h2: m.blatt.h2, hilfe: m.blatt.hilfeText }),
        );
    check(`${p} Z9.6: Statuszeile ${statusErwartet ? 'sichtbar (Bühne aus dem Bild)' : 'unsichtbar (Bühne im Bild)'}`, !!m.status && m.status.sichtbar === statusErwartet, JSON.stringify(m.status));
}

/** [09.11.2026] Warum: AUFTRAG-123 (Z2.6) — Skala ohne Blatt: 1, ausser das Telefon ist (Mindestbreite 240 px) höher als die Bühne */
function einpass(m) {
    if (!m.telefon || !m.buehne) return 1;
    return m.telefon.basisHoehe > m.buehne.hoehe + 0.5 ? Math.floor((m.buehne.hoehe / m.telefon.basisHoehe) * 1000) / 1000 : 1;
}

function zeile(lauf, viewport, schritt, m) {
    tabelle.push({
        lauf,
        viewport,
        schritt,
        buehne: m.buehne,
        telefon: m.telefon,
        blatt: m.blatt ? { top: m.blatt.top, hoehe: m.blatt.hoehe, art: m.blatt.art } : null,
        hauptUnten: m.blatt?.haupt.length ? Math.max(...m.blatt.haupt.map((h) => h.bottom)) : null,
        innerHeight: m.innerHeight,
        scrollY: m.scrollY,
    });
}

async function scanne(page) {
    await page.fill('#ki-demo-url', 'beispiel-ag.ch');
    await page.click('#ki-demo-scan-knopf');
}

async function pixelDiff(page, a, b) {
    const da = 'data:image/png;base64,' + readFileSync(a).toString('base64');
    const db = 'data:image/png;base64,' + readFileSync(b).toString('base64');
    return page.evaluate(
        async ([x, y]) => {
            const lade = (src) =>
                new Promise((ok, f) => {
                    const i = new Image();
                    i.onload = () => ok(i);
                    i.onerror = f;
                    i.src = src;
                });
            const [ia, ib] = await Promise.all([lade(x), lade(y)]);
            if (ia.width !== ib.width || ia.height !== ib.height) return { gleicheGroesse: false, a: [ia.width, ia.height], b: [ib.width, ib.height], abweichend: -1 };
            const px = (img) => {
                const c = document.createElement('canvas');
                c.width = img.width;
                c.height = img.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                return ctx.getImageData(0, 0, c.width, c.height).data;
            };
            const pa = px(ia);
            const pb = px(ib);
            let n = 0;
            let maxDelta = 0;
            for (let i = 0; i < pa.length; i += 4) {
                const d = Math.max(Math.abs(pa[i] - pb[i]), Math.abs(pa[i + 1] - pb[i + 1]), Math.abs(pa[i + 2] - pb[i + 2]), Math.abs(pa[i + 3] - pb[i + 3]));
                if (!d) continue;
                n++;
                maxDelta = Math.max(maxDelta, d);
            }
            return { gleicheGroesse: true, groesse: [ia.width, ia.height], abweichend: n, maxDelta };
        },
        [da, db],
    );
}

/**
 * [09.11.2026] Warum: AUFTRAG-123 (Z9.9) — Kontrast ALLER Texte im Blatt (jedes Element mit eigenem Text, sichtbar, nicht
 * sr-only) gegen den ersten deckenden Hintergrund der Vorfahrenkette; dazu alle Bedienelemente im Blatt (Trefferfläche).
 * Weiss auf Markengrün (Haupthandlungen bg-primary, Bestand, laut Auftrag «nicht anfassen») wird getrennt ausgewiesen.
 */
async function blattKontraste(page) {
    return page.evaluate((sel) => {
        const blatt = document.querySelector(sel);
        if (!blatt) return null;
        const c = document.createElement('canvas');
        c.width = c.height = 1;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        const rgba = (farbe) => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = farbe;
            ctx.fillRect(0, 0, 1, 1);
            return Array.from(ctx.getImageData(0, 0, 1, 1).data);
        };
        const lum = ([r, g, b]) => {
            const k = (x) => {
                x /= 255;
                return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
        };
        const grund = (el) => {
            let h = el;
            while (h) {
                const f = rgba(getComputedStyle(h).backgroundColor);
                if (f[3] > 250) return { farbe: f, el: h };
                h = h.parentElement;
            }
            return { farbe: [255, 255, 255, 255], el: null };
        };
        const srOnly = (el) => {
            for (let h = el; h && h !== blatt; h = h.parentElement) {
                const cs = getComputedStyle(h);
                if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || (cs.position === 'absolute' && parseFloat(cs.width) <= 1)) return true;
            }
            return false;
        };
        const texte = [];
        for (const el of blatt.querySelectorAll('*')) {
            const eigen = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
            if (!eigen || !el.getClientRects().length || srOnly(el)) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
            const g = grund(el);
            const vf = rgba(cs.color);
            const a = (vf[3] / 255) * parseFloat(cs.opacity);
            const v = [0, 1, 2].map((i) => Math.round(vf[i] * a + g.farbe[i] * (1 - a)));
            const l1 = lum(v);
            const l2 = lum(g.farbe);
            const verhaeltnis = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
            const markengruen = !!g.el && /\bbg-primary\b/.test(String(g.el.className)) && v.every((x) => x > 245);
            texte.push({ text: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 50), verhaeltnis, markengruen });
        }
        const ziele = [];
        for (const el of blatt.querySelectorAll('button, a, input, select, label')) {
            if (!el.getClientRects().length || srOnly(el)) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'inline') continue; // Textlink im Fliesstext (Datenschutzhinweise) — WCAG 2.5.8 Ausnahme
            if (el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')) continue; // Fläche = umgebendes label
            if (el.tagName === 'LABEL' && !el.querySelector('input')) continue;
            const r = el.getBoundingClientRect();
            ziele.push({ el: `${el.tagName}${el.id ? '#' + el.id : ''} ${el.innerText?.trim().slice(0, 24) ?? ''}`, hoehe: Math.round(r.height * 10) / 10 });
        }
        return { texte, ziele };
    }, AKTION);
}

function initSkript(theme) {
    return `try { localStorage.setItem('theme', '${theme}'); } catch {}
        window.__maxScroll = 0;
        addEventListener('scroll', () => { window.__maxScroll = Math.max(window.__maxScroll, scrollY); }, { passive: true });
        window.__cls = [];
        // [09.11.2026] Warum: AUFTRAG-123b (N5) — je Quelle zusätzlich, ob ihr Knoten in der Telefon-Figur liegt (imTelefon)
        new PerformanceObserver((l) => { const fig = document.querySelector('figure[aria-label^="Vorschau"]'); for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls.push({ wert: e.value, zeit: Math.round(e.startTime), quellen: (e.sources || []).map((q) => (q.node?.nodeName ?? '?') + '.' + String(q.node?.className ?? '').slice(0, 50) + ' ' + Math.round(q.previousRect.top) + '→' + Math.round(q.currentRect.top) + ' h' + Math.round(q.previousRect.height) + '→' + Math.round(q.currentRect.height)), imTelefon: (e.sources || []).map((q) => !!fig && !!q.node && fig.contains(q.node)) }); }).observe({ type: 'layout-shift', buffered: true });`;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const protokoll = { zeit: new Date().toISOString(), basis: BASE, phase: PHASE, mobil: [], desktop: {}, kontrast: {}, skalaKurzblatt: {}, filme: {} };

async function neueSeite({ breite, hoehe, theme = 'light', reduced = false, mobil = true }) {
    const ctx = await browser.newContext({
        viewport: { width: breite, height: hoehe },
        ...(mobil ? { isMobile: true, hasTouch: true } : {}),
        deviceScaleFactor: 1,
        locale: 'de-CH',
        reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    await ctx.addInitScript(initSkript(theme));
    const page = await ctx.newPage();
    const konsole = [];
    page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
    page.on('pageerror', (e) => konsole.push('pageerror: ' + e.message));
    return { ctx, page, konsole };
}

/* ------------------------------------------------------------------ */
/* PHASE=vorher: Bilder des alten Stands                               */
/* ------------------------------------------------------------------ */

async function vorherLauf({ breite, hoehe, treffer }) {
    const name = `${breite}x${hoehe}-${treffer}t-hell`;
    const { ctx, page } = await neueSeite({ breite, hoehe });
    await apiAbfangen(page, { treffer });
    await page.goto(SEITE, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await scanne(page);
    await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(SCREENS, `mobil-${name}-1-firma.png`) });
    const m1 = await messe(page);
    if (treffer > 1) await page.check('[data-hr-liste-scroll] input[type="radio"] >> nth=0');
    await page.click('#ki-demo-hr-bestaetigen');
    await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENS, `mobil-${name}-2-formular.png`) });
    const m2 = await messe(page);
    protokoll.mobil.push({ name, firma: lageText(m1), formular: lageText(m2), maxScrollY: m2.maxScrollY, status: m1.status });
    console.log(`vorher ${name}: Firma ${lageText(m1)} | Formular ${lageText(m2)}`);
    await ctx.close();
}

/* ------------------------------------------------------------------ */
/* PHASE=nachher: ein mobiler Durchlauf                                */
/* ------------------------------------------------------------------ */

/**
 * Eingabe → Scan (Prüfung: kein Blatt) → Firma (Blatt) → Vollscan (passiv) → Kurzblatt → Formular → Anruf (passiv) → Ende.
 * fall 'suche' / 'passt_nicht', fehler = Anruf gescheitert. film = Bilder für den Filmstreifen.
 */
async function mobilLauf(o) {
    const { breite, hoehe, treffer = 1, theme = 'light', reduced = false, fall = 'normal', fehler = false, shots = false, film = false } = o;
    const viewport = `${breite}×${hoehe}`;
    const name = o.name ?? `${breite}x${hoehe}-${treffer}t-${theme === 'dark' ? 'dunkel' : 'hell'}${reduced ? '-ruhig' : ''}${fall !== 'normal' ? '-' + fall : ''}${fehler ? '-fehler' : ''}`;
    const { ctx, page, konsole } = await neueSeite({ breite, hoehe, theme, reduced });
    const z = await apiAbfangen(page, { treffer, fehler, fall });
    await page.goto(SEITE, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
        window.scrollTo(0, 0);
        window.__maxScroll = 0;
    });
    const lauf = { name, schritte: {} };
    const frames = [];
    const bild = async (n, filmTitel) => {
        if (!shots && !film) return;
        const p = path.join(SCREENS, `mobil-${name}-${n}.png`);
        await page.screenshot({ path: p });
        if (film && filmTitel) frames.push({ p, titel: filmTitel });
    };
    const mess = async (schritt, opt = {}) => {
        const m = await messe(page);
        if (m.maxScrollY > 0 && !lauf.ersterScroll) {
            lauf.ersterScroll = { schritt, max: m.maxScrollY };
            console.log(`INFO  [${name}] gescrollt (max ${m.maxScrollY}) spätestens bis Schritt «${schritt}»`);
        }
        lauf.schritte[schritt] = m;
        zeile(name, viewport, schritt, m);
        pruefeSchritt(name, schritt, m, opt);
        return m;
    };
    const telEingabe = await messe(page);
    await bild('0-eingabe', 'Eingabe');

    // Vorlauf: liegt das URL-Feld unter dem Fensterrand (375×553), scrollt der Besucher selbst dorthin. Gemessen wird ab dem
    // Scan-Start — der Kompaktmodus stellt die Seite dann ohne Animation nach oben (A-122 Nachtrag) und ab da gilt scrollY 0.
    lauf.vorlaufScrollY = await page.evaluate(() => {
        document.querySelector('#ki-demo-url').scrollIntoView({ block: 'nearest', behavior: 'instant' });
        return Math.round(scrollY);
    });
    await scanne(page);
    await page.waitForFunction(() => !!document.querySelector('[data-ki-demo-kompakt]') && window.scrollY === 0, null, { timeout: 5000 });
    await page.evaluate(() => {
        window.__maxScroll = 0;
    });
    // Scan: Prüfung im Handelsregister läuft — Blatt gemountet, aber verborgen; Telefon gross
    await page.waitForSelector(`${TELEFON} li:has-text("Firma wird im Handelsregister geprüft")`, { timeout: 8000 }).catch(() => undefined);
    await page.waitForTimeout(200);
    const ms = await mess('Scan (Prüfung)', { blattErwartet: false });
    check(`[${name}] Z4.1: während der Prüfung kein sichtbares Blatt (Handelsregister gemountet: ${ms.blattArtImDom}), Telefon Skala 1 zeigt «Firma wird im Handelsregister geprüft …»`, ms.blattImDom && !ms.blatt && ms.blattArtImDom === 'pruefen' && Math.abs(ms.telefon.skala - einpass(ms)) < 0.005 && /Firma wird im Handelsregister geprüft/.test(ms.telefonAnsicht ?? ''), `${ms.telefonAnsicht} · ${lageText(ms)}`);
    check(
        `[${name}] Z1.2/Z1.3: Kompaktzeile 44 px, Oberkante = Header-Unterkante + 12 (${ms.header?.bottom} + 12 = ${ms.kompakt?.top}), Bühne 8 px darunter bis Fenster − 12 (${ms.buehne?.top}–${ms.buehne?.bottom}), Telefon-Grundbreite = min(300, max(240, Bühne × 9/18,6))`,
        ms.kompakt && Math.abs(ms.kompakt.hoehe - 44) < 0.6 && Math.abs(ms.kompakt.top - (ms.header.bottom + 12)) <= 0.6 && Math.abs(ms.buehne.top - (ms.kompakt.bottom + 8)) <= 0.6 && Math.abs(ms.buehne.bottom - (ms.innerHeight - 12)) <= 0.6 && Math.abs(ms.telefon.basisBreite - Math.min(300, breite, Math.max(240, (ms.buehne.hoehe * 9) / 18.6))) <= 1,
        lageText(ms) + ` · Header ${JSON.stringify(ms.header)}`,
    );
    check(`[${name}] Z1.1: H1 im DOM, visuell aus; Konsole aus; Kompaktzeile mit Host und «Ändern»`, !ms.h1Sichtbar && !ms.konsoleSichtbar && ms.kompakt?.text.includes('beispiel-ag.ch') && ms.kompakt.text.includes('Ändern'), JSON.stringify(ms.kompakt));
    await bild('1-scan', 'Scan');

    // Firma
    if (fall === 'suche') {
        await page.waitForSelector('[data-handelsregister="kein_treffer"]', { timeout: 15000 });
        await page.waitForTimeout(700);
        const mk = await mess('Firma nicht gefunden (Suche)');
        const suche = await page.evaluate(() => {
            const f = document.querySelector('#ki-demo-hr-suche')?.getBoundingClientRect();
            const k = document.querySelector('#ki-demo-hr-suchen')?.getBoundingClientRect();
            return f && k ? { feldUnten: f.bottom, knopfOben: k.top, knopfH: k.height, knopfB: k.width, feldB: f.width, feldH: f.height } : null;
        });
        check(`[${name}] Z4.4 Suche: «Firma nicht gefunden», Suchfeld und «Suchen» untereinander, «Suchen» als Haupthandlung volle Breite`, mk.blatt?.titel === 'Firma nicht gefunden' && suche && suche.knopfOben >= suche.feldUnten && Math.abs(suche.knopfB - suche.feldB) <= 1 && suche.knopfH >= 44 && mk.blatt.haupt.some((h) => h.id === 'ki-demo-hr-suchen'), JSON.stringify(suche));
        // [09.11.2026] Warum: AUFTRAG-123b (N3) — Platzhalter mobil «z. B. Muster AG», nicht abgeschnitten: Textbreite (Canvas, Schrift
        // des Felds) ≤ Innenbreite des Felds (clientWidth − Innenabstand); dazu scrollWidth ≤ clientWidth (leeres Feld)
        const n3 = await page.evaluate(() => {
            const f = document.querySelector('#ki-demo-hr-suche');
            const cs = getComputedStyle(f);
            const ctx = document.createElement('canvas').getContext('2d');
            ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            const textB = Math.round(ctx.measureText(f.placeholder).width * 10) / 10;
            const innen = Math.round((f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * 10) / 10;
            return { platzhalter: f.placeholder, wert: f.value, textB, innen, scrollW: f.scrollWidth, clientW: f.clientWidth, schrift: cs.fontSize, label: document.querySelector('label[for="ki-demo-hr-suche"]')?.innerText.trim() };
        });
        (protokoll.n3 = protokoll.n3 ?? {})[name] = n3;
        check(
            `[${name}] N3 Suche: Platzhalter «z. B. Muster AG», Beschriftung «Firmenname oder UID»; nicht abgeschnitten (Text ${n3.textB} ≤ ${n3.innen} px innen, scrollWidth ${n3.scrollW} ≤ clientWidth ${n3.clientW})`,
            n3.platzhalter === 'z. B. Muster AG' && n3.label === 'Firmenname oder UID' && n3.wert === '' && n3.textB <= n3.innen && n3.scrollW <= n3.clientW,
            JSON.stringify(n3),
        );
        await bild('2a-suche', null);
        await page.fill('#ki-demo-hr-suche', 'Beispiel AG');
        await page.tap('#ki-demo-hr-suchen');
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.waitForTimeout(700);
    } else {
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.waitForTimeout(700);
    }
    const mf = await mess(fall === 'suche' ? 'Firma (Suche → Treffer)' : 'Firma');
    const firma = await page.evaluate((sel) => {
        const b = document.querySelector(sel);
        const liste = b.querySelector('ul[role="list"][aria-label="Einträge im Handelsregister"]');
        const zeilen = [...b.querySelectorAll('[data-hr-zeile]')];
        const scroll = b.querySelector('[data-hr-liste-scroll]');
        const eintrag = b.querySelector('[data-hr-eintrag]');
        const nz = (z) => {
            const n = z.querySelector('[data-hr-name]');
            return n ? Math.round(n.getBoundingClientRect().height / parseFloat(getComputedStyle(n).lineHeight)) : null;
        };
        return {
            radios: [...b.querySelectorAll('input[type="radio"]')].filter((r) => r.getClientRects().length).length,
            liste: !!liste,
            items: liste ? liste.querySelectorAll(':scope > li').length : 0,
            zeilen: zeilen.map((z) => ({ tag: z.tagName, uid: z.getAttribute('data-uid'), aktiv: z.getAttribute('data-aktiv'), disabled: z.disabled ?? null, label: z.getAttribute('aria-label'), hoehe: Math.round(z.getBoundingClientRect().height), chevron: !!z.querySelector('svg'), nameZeilen: nz(z) })),
            scroll: scroll ? { scrollH: scroll.scrollHeight, clientH: scroll.clientHeight, schatten: scroll.getAttribute('data-ueberlauf') } : null,
            eintrag: eintrag ? { text: eintrag.innerText.replace(/\s+/g, ' ').trim(), klickbar: eintrag.tagName === 'BUTTON' || !!eintrag.closest('button') } : null,
            ja: !!b.querySelector('#ki-demo-hr-bestaetigen'),
            fokusTitel: document.activeElement?.id === 'ki-demo-anruf-titel',
        };
    }, AKTION);
    lauf.firma = firma;
    if (treffer === 1) {
        check(
            `[${name}] Z4.2 ein Treffer: Titel T1, Hilfszeile T2, Eintrag als ruhige Karte (nicht klickbar, kein Radio), «Ja, das ist meine Firma» + ein Textlink`,
            mf.blatt?.titel === T.t1 && mf.blatt.hilfeText[0] === T.t2 && firma.eintrag && !firma.eintrag.klickbar && firma.eintrag.text.includes('Beispiel AG') && firma.eintrag.text.includes('Winterthur · CHE-000.000.001') && firma.radios === 0 && mf.blatt.haupt[0]?.text === 'Ja, das ist meine Firma' && mf.blatt.links.length === 1 && mf.blatt.links[0].text === 'Nein, andere Firma suchen',
            JSON.stringify({ titel: mf.blatt?.titel, hilfe: mf.blatt?.hilfeText, eintrag: firma.eintrag, haupt: mf.blatt?.haupt.map((h) => h.text), links: mf.blatt?.links.map((l) => l.text) }),
        );
    } else {
        const aktive = firma.zeilen.filter((x) => x.aktiv === 'true');
        const inaktiv = firma.zeilen.filter((x) => x.aktiv === 'false');
        const liste = trefferListe(treffer);
        check(
            `[${name}] Z4.3 mehrere Treffer: Titel «Welche ist Ihre Firma?», Hilfszeile T2, Liste role=list (${firma.items} Einträge), kein «Ja»-Knopf, Link «Meine Firma ist nicht dabei»`,
            mf.blatt?.titel === T.mehrere && mf.blatt.hilfeText[0] === T.t2 && firma.liste && firma.items === treffer && !firma.ja && firma.radios === 0 && mf.blatt.links.length === 1 && mf.blatt.links[0].text === 'Meine Firma ist nicht dabei',
            JSON.stringify({ titel: mf.blatt?.titel, hilfe: mf.blatt?.hilfeText, items: firma.items, ja: firma.ja, links: mf.blatt?.links }),
        );
        check(
            `[${name}] Z4.3: aktive Zeilen sind <button> ≥ 64 px mit Chevron und aria-label T3, Name höchstens 2 Zeilen; inaktive Zeile sichtbar, aber kein Knopf`,
            aktive.length === treffer - 1 && aktive.every((x) => { const t = liste.find((l) => l.uid === x.uid); return x.tag === 'BUTTON' && x.hoehe >= 64 && x.chevron && x.nameZeilen <= 2 && x.label === T.t3(t.name, t.sitz); }) && inaktiv.length === 1 && inaktiv[0].tag !== 'BUTTON',
            JSON.stringify(firma.zeilen),
        );
        check(`[${name}] Z4.3: das Blatt höchstens Bühnenhöhe, ohne eigenes Scrollen; passt die Liste nicht, scrollt nur sie (Schattenrand)`, mf.blatt.hoehe <= mf.buehne.hoehe + 0.5 && mf.blatt.scrollH <= mf.blatt.clientH + 1 && !!firma.scroll && (firma.scroll.scrollH <= firma.scroll.clientH + 1 || firma.scroll.schatten === 'true'), JSON.stringify(firma.scroll));
    }
    check(`[${name}] Fokus: Titel des Firmen-Blatts (nicht im Telefon)`, firma.fokusTitel && !mf.fokus.imTelefon, JSON.stringify(mf.fokus));
    await bild('2-firma', 'Firma');

    if (fall === 'passt_nicht') {
        await page.tap('#ki-demo-hr-bestaetigen');
        await page.waitForSelector('[data-hr-passt-nicht]', { timeout: 8000 });
        await page.waitForTimeout(500);
        const mp = await mess('Firma (passt nicht, 409)');
        const jaDa = await page.locator('#ki-demo-hr-bestaetigen').count();
        check(
            `[${name}] Z4.4 409: Meldung wortgleich (role=alert), Haupthandlung «Andere Website eingeben», kein «Ja»-Knopf, ein Textlink`,
            /Die Website beispiel-ag\.ch gehört laut Handelsregister und Website-Inhalt nicht zu Muster Holding AG\. Bitte geben Sie die Website Ihrer Firma ein oder wählen Sie den passenden Eintrag\./.test(mp.blatt?.text ?? '') && mp.blatt.haupt.length === 1 && mp.blatt.haupt[0].text === 'Andere Website eingeben' && jaDa === 0 && mp.blatt.links.length === 1,
            JSON.stringify({ text: mp.blatt?.text, haupt: mp.blatt?.haupt, links: mp.blatt?.links, jaDa }),
        );
        // [09.11.2026] Warum: AUFTRAG-123b (N2) — Haupthandlung ohne Globus-Symbol, einzeilig, 56 px hoch (vorher 80 px, zweizeilig)
        const n2 = await page.evaluate(() => {
            const k = document.querySelector('#ki-demo-hr-andere-website');
            const r = k.getBoundingClientRect();
            const cs = getComputedStyle(k);
            const range = document.createRange();
            range.selectNodeContents(k);
            const tops = new Set([...range.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top)));
            return { hoehe: Math.round(r.height * 10) / 10, breite: Math.round(r.width * 10) / 10, svg: k.querySelectorAll('svg').length, zeilen: tops.size, radius: cs.borderTopLeftRadius, schrift: cs.fontSize, text: k.innerText.trim() };
        });
        (protokoll.n2 = protokoll.n2 ?? {})[name] = n2;
        check(`[${name}] N2 409: «Andere Website eingeben» ohne Globus-Symbol, einzeilig, 56 px hoch (gemessen ${n2.hoehe} px, ${n2.zeilen} Zeile(n), Breite ${n2.breite})`, n2.text === 'Andere Website eingeben' && n2.svg === 0 && n2.zeilen === 1 && Math.abs(n2.hoehe - 56) < 0.6, JSON.stringify(n2));
        // [09.11.2026] Warum: AUFTRAG-123b — bei 375×553 war das 409-Blatt 26 px höher als die Bühne und scrollte als Ganzes (Textlink
        // halb unter dem Rand); jetzt scrollt nur Eintrag + Meldung (data-blatt-scroll), das Blatt selbst nie
        check(`[${name}] 409: Blatt ohne eigenes Scrollen (${mp.blatt?.scrollH}/${mp.blatt?.clientH}); reicht die Bühne nicht, scrollt nur Eintrag + Meldung (${JSON.stringify(mp.blatt?.innen)})`, !!mp.blatt && mp.blatt.scrollH <= mp.blatt.clientH + 1, lageText(mp));
        n2.innen = mp.blatt?.innen;
        await bild('2b-passt-nicht', null);
        // die gemockte 409-Antwort meldet Chrome selbst als «Failed to load resource … 409 (Conflict)» (Netz, kein Skriptfehler)
        const ohne409 = () => konsole.filter((k) => !/status of 409 \(Conflict\)/.test(k));
        // [09.11.2026] Warum: AUFTRAG-123b — Z9.1-Abschluss VOR «Andere Website eingeben» (wie im Normallauf vor «Nochmals testen»):
        // danach verlässt die Demo den Kompaktmodus und fokussiert das URL-Feld (A-111); liegt es unter dem Fensterrand (375×553),
        // scrollt der Browser gewollt dorthin (gemessen 344 px) — das ist die Eingabe-Ansicht, nicht mehr die Bühne
        await abschluss(page, name, breite, ohne409(), z, { anrufe: 0 });
        await page.tap('#ki-demo-hr-andere-website');
        await page.waitForTimeout(600);
        const me = await messe(page);
        check(`[${name}] 409 → «Andere Website eingeben» führt zur Eingabe (Hero, Konsole), keine Konsolenfehler`, me.h1Sichtbar && me.konsoleSichtbar && !me.kompakt && ohne409().length === 0, JSON.stringify({ h1: me.h1Sichtbar, konsole: me.konsoleSichtbar, fehler: ohne409() }));
        protokoll.mobil.push(lauf);
        await ctx.close();
        return frames;
    }

    // Bestätigen
    if (treffer === 1) {
        await page.tap('#ki-demo-hr-bestaetigen');
    } else {
        // inaktive Zeile antippen: nichts passiert (kein POST)
        const vorher = z.hr.filter((b) => b.bestaetige).length;
        await page.locator('[data-hr-zeile][data-aktiv="false"]').tap({ force: true }).catch(() => undefined);
        await page.waitForTimeout(500);
        const nachInaktiv = z.hr.filter((b) => b.bestaetige).length;
        const uid = trefferListe(treffer)[1].uid;
        await page.locator(`[data-hr-zeile][data-uid="${uid}"]`).tap();
        await page.waitForTimeout(120);
        const tipp = await page.evaluate(() => {
            const zeilen = [...document.querySelectorAll('button[data-hr-zeile]')];
            return { gesperrt: zeilen.length > 0 && zeilen.every((z) => z.disabled), spinner: zeilen.filter((z) => z.querySelector('.animate-spin')).map((z) => z.getAttribute('data-uid')) };
        });
        await bild('2b-tipp', 'Tipp');
        await page.waitForSelector(`${TELEFON} li:has-text("Website wird gelesen")`, { timeout: 8000 }).catch(() => undefined);
        const bestaetigungen = z.hr.filter((b) => b.bestaetige);
        check(
            `[${name}] Z9.7: inaktive Zeile antippen → kein POST; EIN Tipp auf eine aktive Zeile → genau ein POST bestaetige=${uid} (Spinner in der Zeile, alle gesperrt), danach Vollscan`,
            nachInaktiv === vorher && bestaetigungen.length === 1 && bestaetigungen[0].bestaetige === uid && tipp.gesperrt && tipp.spinner.length === 1 && tipp.spinner[0] === uid,
            JSON.stringify({ vorher, nachInaktiv, bestaetigungen, tipp }),
        );
    }

    // Vollscan (passiv)
    await page.waitForSelector(`${TELEFON} li:has-text("Website wird gelesen")`, { timeout: 8000 }).catch(() => undefined);
    await page.waitForTimeout(500);
    const mv = await mess('Vollscan (liest)', { passiv: true });
    check(`[${name}] Z6: Vollscan — Telefon zeigt «Website wird gelesen …», ohne Überlauf`, /Website wird gelesen/.test(mv.telefonAnsicht ?? '') && mv.telefonUeberlauf.length === 0, `${mv.telefonAnsicht} · ${mv.telefonUeberlauf.join(' | ')}`);
    await bild('3-vollscan', 'Vollscan');
    await page.waitForSelector(`${TELEFON} li:has-text("Wissenseinträge")`, { timeout: 15000 }).catch(() => undefined);
    await page.waitForTimeout(150);
    const mv2 = await mess('Vollscan (Funde)', { passiv: true });
    check(`[${name}] Z6: Vollscan füllt das Telefon (Logo, Markenfarbe, Wissen) ohne Überlauf`, /Logo gefunden/.test(mv2.telefonAnsicht ?? '') && /Markenfarbe #1E3A5F/.test(mv2.telefonAnsicht ?? '') && /Wissenseinträge/.test(mv2.telefonAnsicht ?? '') && mv2.telefonUeberlauf.length === 0, `${mv2.telefonAnsicht} · ${mv2.telefonUeberlauf.join(' | ')}`);
    if (film && treffer > 1) {
        // Filmstreifen 5 Treffer: bis zur Firmenwahl (Eingabe, Scan, Firma, Tipp, Vollscan) — Kopie, spätere Bilder nicht mehr
        protokoll.filme[name] = frames.slice();
    }

    // Kurzblatt
    await page.waitForSelector('#ki-demo-bereit-knopf', { state: 'visible', timeout: 30000 });
    await page.waitForTimeout(800);
    const mk = await mess('Kurzblatt');
    const ziel = breite === 375 && hoehe === 812 ? 0.7 : breite === 390 && hoehe === 664 ? 0.55 : null;
    protokoll.skalaKurzblatt[name] = { viewport, skala: mk.telefon?.skala, var: mk.skalaVar, telefonSichtbar: !mk.telefon?.aus, blattHoehe: mk.blatt?.hoehe, buehne: mk.buehne?.hoehe, grund: `${mk.telefon?.basisBreite}×${mk.telefon?.basisHoehe}`, telefon: `${mk.telefon?.top}–${mk.telefon?.bottom}`, blattTop: mk.blatt?.top };
    const symbol = await page.locator('#ki-demo-bereit-knopf svg').count();
    check(
        `[${name}] Z5.1 Kurzblatt: nur Titel «${T.t4a('Lena')}» und Haupthandlung «${T.t4b('Lena')}» (Telefon-Symbol)`,
        mk.blatt?.art === 'kurz' && mk.blatt.titel === T.t4a('Lena') && mk.blatt.haupt.length === 1 && mk.blatt.haupt[0].text === T.t4b('Lena') && mk.blatt.text === `${T.t4a('Lena')} ${T.t4b('Lena')}` && symbol === 1,
        JSON.stringify({ art: mk.blatt?.art, text: mk.blatt?.text, symbol }),
    );
    check(
        `[${name}] Z5.1: Telefon zeigt den fertigen Assistenten gross — Skala ${mk.telefon?.skala} (CSS ${mk.skalaVar})${ziel ? ` ≥ ${ziel}` : ''}, sichtbar, Assistenten-Karte im Telefon`,
        !mk.telefon.aus && (ziel === null || mk.telefon.skala >= ziel) && /Lena/.test(mk.telefonAnsicht ?? '') && Math.abs(mk.telefon.skala - parseFloat(mk.skalaVar)) < 0.01,
        lageText(mk),
    );
    await bild('4-kurzblatt', 'Kurzblatt');

    // Formular (ausgeklappt)
    await page.tap('#ki-demo-bereit-knopf');
    await page.waitForTimeout(800);
    const mfo = await mess('Formular');
    await pruefeFormular(page, name, mfo, hoehe);
    await bild('5-formular', 'Formular');
    // Schweizerdeutsch → T6 darunter, Formular passt weiter
    await page.locator('label[for="ki-demo-sprache-dialekt_auto"]').tap();
    await page.waitForTimeout(300);
    const mfs = await mess('Formular (Schweizerdeutsch)');
    const t6 = await page.locator('[data-ki-demo-erprobung]').allInnerTexts();
    check(
        `[${name}] Z5.3: nur bei Schweizerdeutsch steht T6 «${T.t6}»; Formular ${hoehe >= 640 ? 'ohne internes Scrollen' : '(internes Scrollen erlaubt), Haupthandlung sichtbar'}`,
        t6.length === 1 && t6[0].trim() === T.t6 && (hoehe < 640 || (mfs.blatt.scrollH <= mfs.blatt.clientH + 1 && mfs.blatt.innen.every((i) => i.scrollH <= i.clientH + 1))),
        `${JSON.stringify(t6)} · ${lageText(mfs)} · innen ${JSON.stringify(mfs.blatt?.innen)}`,
    );
    await bild('5b-formular-schweizerdeutsch', null);
    await page.locator('label[for="ki-demo-sprache-hochdeutsch"]').tap();
    await page.waitForTimeout(200);
    check(`[${name}] Z5.3: zurück auf Deutsch → T6 wieder weg`, (await page.locator('[data-ki-demo-erprobung]').count()) === 0, '');

    // Anruf (passiv)
    await page.fill('#ki-demo-nummer', '79 123 45 67');
    await page.check('#ki-demo-einwilligung');
    // nach dem Klick auf die Einwilligung läuft der Hover-Übergang des Knopfs (0,15 s, Haftendes :hover vom Tipp aufs Kurzblatt)
    // noch — Playwright hält den Knopf dann für «nicht stabil» und scrollt ihn beim Wiederholen in die Mitte (gemessen 303 px bei
    // 393×727). Ein Mensch tippt nicht in derselben Zehntelsekunde: kurz warten.
    await page.waitForTimeout(400);
    await page.tap('#ki-demo-anruf-knopf');
    await page.waitForTimeout(900);
    const mw = await mess('Anruf wartend', { passiv: true });
    check(`[${name}] Z6 Anruf (wartend): Telefon «Ihr Assistent wählt gleich …», Fokus nicht im Telefon`, /Ihr Assistent wählt gleich/.test(mw.telefonAnsicht ?? '') && !mw.fokus.imTelefon && mw.telefonUeberlauf.length === 0, `${mw.telefonAnsicht} · ${JSON.stringify(mw.fokus)}`);
    await page.waitForSelector('button[data-zustand="waehlt"]:not([id])', { state: 'attached', timeout: 20000 });
    await page.waitForTimeout(700);
    const mwa = await mess('Anruf wählt', { passiv: true });
    check(`[${name}] Z6 Anruf (wählt): Telefon «Anruf von ${ANRUF_VON}», ohne Überlauf`, (mwa.telefonAnsicht ?? '').includes(`Anruf von ${ANRUF_VON}`) && mwa.telefonUeberlauf.length === 0, `${mwa.telefonAnsicht} · ${mwa.telefonUeberlauf.join(' | ')}`);
    await bild('6-waehlt', 'wählt');
    if (!fehler) {
        await page.waitForSelector('button[data-zustand="verbunden"]:not([id])', { state: 'attached', timeout: 20000 });
        await page.waitForTimeout(1300);
        const mb = await mess('Verbunden', { passiv: true });
        check(`[${name}] Z6 Verbunden: Telefon mit Name und Dauer m:ss, ohne Überlauf`, /Lena/.test(mb.telefonAnsicht ?? '') && /\d:\d\d/.test(mb.telefonAnsicht ?? '') && mb.telefonUeberlauf.length === 0, `${mb.telefonAnsicht} · ${mb.telefonUeberlauf.join(' | ')}`);
        await bild('7-verbunden', 'verbunden');
    }

    // Ende
    await page.waitForSelector('[data-ki-demo-ende]', { timeout: 30000 });
    await page.waitForTimeout(800);
    const me = await mess(fehler ? 'Anruf gescheitert' : 'Ende');
    const ende = await page.evaluate((sel) => {
        const b = document.querySelector(sel);
        const titel = b.querySelector('#ki-demo-anruf-titel');
        const dauer = b.querySelector('[data-ki-demo-dauer]');
        const zf = b.querySelector('[data-ki-demo-zusammenfassung]');
        const n = b.querySelector('#ki-demo-nochmals-testen');
        const a = b.querySelector('a[data-ki-demo-anfrage]');
        const tr = titel.getBoundingClientRect();
        const dr = dauer?.getBoundingClientRect();
        // [09.11.2026] Warum: AUFTRAG-123b (N4) — Haupthandlung und Textlink: Lage, Grösse, Zeilen, Radius, Schrift, Farbe
        const bcs = getComputedStyle(b);
        const innenB = b.clientWidth - parseFloat(bcs.paddingLeft) - parseFloat(bcs.paddingRight);
        const innenMitte = b.getBoundingClientRect().left + b.clientLeft + parseFloat(bcs.paddingLeft) + innenB / 2;
        const wurzel = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const zeilen = (el) => {
            const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            const tops = new Set();
            const range = document.createRange();
            for (let t = w.nextNode(); t; t = w.nextNode()) {
                if (!t.textContent.trim()) continue;
                range.selectNodeContents(t);
                for (const x of range.getClientRects()) if (x.width > 0) tops.add(Math.round(x.top));
            }
            return tops.size;
        };
        const info = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return { id: el.id || null, tag: el.tagName, text: el.innerText.trim(), top: Math.round(r.top * 10) / 10, bottom: Math.round(r.bottom * 10) / 10, hoehe: Math.round(r.height * 10) / 10, breite: Math.round(r.width * 10) / 10, mitte: Math.round((r.left + r.width / 2) * 10) / 10, zeilen: zeilen(el), radius: cs.borderTopLeftRadius, schrift: cs.fontSize, gewicht: cs.fontWeight, bg: cs.backgroundColor, klassen: String(el.className), href: el.getAttribute('href'), anfrage: el.hasAttribute('data-ki-demo-anfrage'), svg: el.querySelectorAll('svg').length };
        };
        const hauptEl = [...b.querySelectorAll('[data-blatt-haupt]')];
        const linkEl = [...b.querySelectorAll('[data-blatt-link]')];
        return {
            haupt: hauptEl.map(info),
            links: linkEl.map(info),
            zweit: b.querySelectorAll('[data-blatt-zweit]').length,
            innenB: Math.round(innenB * 10) / 10,
            innenMitte: Math.round(innenMitte * 10) / 10,
            sollSchrift: `${Math.round(wurzel * 1.1875 * 1000) / 1000}px`,
            titel: titel.innerText.trim(),
            dauer: dauer ? { text: dauer.innerText.trim(), gleicheZeile: dr.top < tr.bottom && dr.bottom > tr.top, rechts: dr.left > tr.right - 1, schrift: getComputedStyle(dauer).fontSize, tabular: getComputedStyle(dauer).fontVariantNumeric } : null,
            dauerZeile: [...b.querySelectorAll('p')].some((p) => p.innerText.trim().startsWith('Dauer:')),
            zfZeilen: zf ? Math.round(zf.getBoundingClientRect().height / parseFloat(getComputedStyle(zf).lineHeight)) : null,
            mehr: !!b.querySelector('#ki-demo-mehr'),
            knoepfe: [n?.innerText.trim(), a?.innerText.trim()],
            gleicheZeile: n && a ? Math.abs(n.getBoundingClientRect().top - a.getBoundingClientRect().top) < 1 : false,
            href: a?.getAttribute('href'),
            text: b.innerText.replace(/\s+/g, ' ').trim(),
            fokusBlatt: document.activeElement === b,
        };
    }, AKTION);
    lauf.ende = ende;
    check(`[${name}] Fokus nach dem Anruf auf dem Blatt (A-122 S7)`, ende.fokusBlatt, JSON.stringify(me.fokus));
    await bild(fehler ? '8-fehler' : '8-ende', fehler ? 'gescheitert' : 'Ende');
    // [09.11.2026] Warum: AUFTRAG-123b (N4) — statt zwei gleich gewichteter Knöpfe nebeneinander: EINE Haupthandlung (volle
    // Breite, 56 px, einzeilig, Radius 16 px, Schrift wie die übrigen Blatt-Haupthandlungen), darunter EIN Textlink (zentriert, 44 px)
    const h0 = ende.haupt[0];
    const l0 = ende.links[0];
    const n4Gestalt =
        ende.haupt.length === 1 && ende.links.length === 1 && ende.zweit === 0 &&
        Math.abs(h0.breite - ende.innenB) <= 1 && Math.abs(h0.hoehe - 56) < 0.6 && h0.zeilen === 1 && h0.radius === '16px' && h0.schrift === ende.sollSchrift && h0.gewicht === '700' &&
        l0.top >= h0.bottom - 0.5 && l0.hoehe >= 44 && Math.abs(l0.mitte - ende.innenMitte) <= 1 && l0.zeilen === 1;
    lauf.n4 = { haupt: h0, link: l0, innenB: ende.innenB, innenMitte: ende.innenMitte, sollSchrift: ende.sollSchrift };
    if (fehler) {
        check(`[${name}] Z7 Fehler: «Der Anruf hat nicht geklappt», Grund als Hilfszeile`, ende.titel === 'Der Anruf hat nicht geklappt' && ende.text.includes('Versuchen Sie es gleich nochmals.'), JSON.stringify(ende));
        check(
            `[${name}] N4 Fehler: Haupthandlung «Nochmals versuchen» (Markengrün, ${h0?.breite}×${h0?.hoehe} px, ${h0?.zeilen} Zeile, Radius ${h0?.radius}), darunter Textlink «Angebot anfragen» (natives <a> #anfrage, ${l0?.hoehe} px, zentriert)`,
            n4Gestalt && h0.id === 'ki-demo-nochmals-testen' && h0.tag === 'BUTTON' && h0.text === 'Nochmals versuchen' && /\bbg-primary\b/.test(h0.klassen) && l0.tag === 'A' && l0.anfrage && l0.href === '#anfrage' && l0.text === 'Angebot anfragen',
            JSON.stringify({ haupt: h0, link: l0, innenB: ende.innenB, innenMitte: ende.innenMitte, sollSchrift: ende.sollSchrift, zweit: ende.zweit }),
        );
        await page.tap('#ki-demo-nochmals-testen');
        await page.waitForTimeout(800);
        const mn = await mess('Formular (nach «Nochmals versuchen»)');
        const direkt = await page.evaluate(() => ({ kurz: !!document.querySelector('#ki-demo-bereit-knopf'), nummer: !!document.querySelector('#ki-demo-nummer'), knopf: document.querySelector('#ki-demo-anruf-knopf')?.getAttribute('data-zustand') }));
        check(`[${name}] Z5.6: «Nochmals versuchen» → direkt das ausgeklappte Formular derselben Firma (kein Kurzblatt)`, !direkt.kurz && direkt.nummer && direkt.knopf === 'bereit' && mn.blatt?.titel === T.t5('Lena'), JSON.stringify({ ...direkt, titel: mn.blatt?.titel }));
        await bild('9-nochmals-formular', null);
    } else {
        check(
            `[${name}] Z7 Ende: Titelzeile «Ihre Zusammenfassung» mit «2:51 Min.» rechts (14 px, tabular-nums), keine eigene Dauer-Zeile, höchstens 6 Zeilen + «Mehr anzeigen»`,
            ende.titel === 'Ihre Zusammenfassung' && ende.dauer?.text === '2:51 Min.' && ende.dauer.gleicheZeile && ende.dauer.rechts && ende.dauer.tabular.includes('tabular-nums') && !ende.dauerZeile && ende.zfZeilen <= 6 && ende.mehr,
            JSON.stringify(ende),
        );
        check(
            `[${name}] N4 Ende: Haupthandlung «Angebot anfragen» (natives <a> #anfrage, #1f7a35, ${h0?.breite}×${h0?.hoehe} px = volle Breite, ${h0?.zeilen} Zeile, Radius ${h0?.radius}, Schrift ${h0?.schrift}), darunter Textlink «Nochmals testen» (${l0?.hoehe} px, zentriert)`,
            n4Gestalt && h0.tag === 'A' && h0.anfrage && h0.href === '#anfrage' && h0.text === 'Angebot anfragen' && h0.bg === 'rgb(31, 122, 53)' && l0.id === 'ki-demo-nochmals-testen' && l0.tag === 'BUTTON' && l0.text === 'Nochmals testen',
            JSON.stringify({ haupt: h0, link: l0, innenB: ende.innenB, innenMitte: ende.innenMitte, sollSchrift: ende.sollSchrift, zweit: ende.zweit }),
        );
        await page.tap('#ki-demo-mehr');
        await page.waitForTimeout(400);
        const mm = await mess('Mehr anzeigen');
        const offen = await page.evaluate(() => {
            const p = document.querySelector('[data-ki-demo-zusammenfassung]');
            return { voll: p.scrollHeight <= p.clientHeight + 1, zeilen: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)) };
        });
        check(`[${name}] Z7: «Mehr anzeigen» — Text vollständig, Blatt höchstens Bühne, unten bündig`, offen.voll && offen.zeilen > 6 && mm.blatt.hoehe <= mm.buehne.hoehe + 0.5, `${JSON.stringify(offen)} · ${lageText(mm)}`);
        // [09.11.2026] Warum: AUFTRAG-123b (N4) — nach «Mehr anzeigen» scrollt nur der Kasten; Haupthandlung und Textlink bleiben ganz im Bild
        const hm = mm.blatt?.haupt.find((h) => h.text === 'Angebot anfragen');
        const lm = mm.blatt?.links.find((l) => l.id === 'ki-demo-nochmals-testen');
        check(
            `[${name}] N4: nach «Mehr anzeigen» scrollt nur der Kasten; «Angebot anfragen» (unten ${hm?.bottom}) und «Nochmals testen» (unten ${lm?.bottom}) ganz im Bild (Fenster ${mm.innerHeight})`,
            !!hm && !!lm && hm.sichtbar && lm.sichtbar && hm.top >= mm.blatt.top && lm.bottom <= Math.min(mm.blatt.bottom, mm.innerHeight) + 0.5 && mm.blatt.scrollH <= mm.blatt.clientH + 1,
            `${lageText(mm)} · haupt ${JSON.stringify(hm)} · link ${JSON.stringify(lm)} · innen ${JSON.stringify(mm.blatt?.innen)}`,
        );
        await bild('9-mehr', null);
    }
    await abschluss(page, name, breite, konsole, z, { anrufe: 1 });
    if (!fehler && fall === 'normal' && treffer === 1) {
        // [09.11.2026] Warum: AUFTRAG-123b (N4) — der Link bleibt ein natives <a> mit Hash und belegt die Firma vor (sessionStorage →
        // Formular «Assistent anfragen» liest beim hashchange). Nach abschluss(): der Sprung zu #anfrage scrollt gewollt.
        await page.tap('a[data-ki-demo-anfrage]');
        await page.waitForTimeout(700);
        const anfrage = await page.evaluate(() => ({ hash: location.hash, firma: document.querySelector('#anfrage-firma')?.value ?? null, scrollY: Math.round(scrollY) }));
        lauf.anfrage = anfrage;
        check(`[${name}] N4: «Angebot anfragen» springt zu #anfrage und belegt dort «Firma» mit «Beispiel AG» vor`, anfrage.hash === '#anfrage' && anfrage.firma === 'Beispiel AG' && anfrage.scrollY > 0, JSON.stringify(anfrage));
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(300);
    }
    if (!fehler) {
        await page.tap('#ki-demo-nochmals-testen');
        await page.waitForTimeout(600);
        const zurueck = await messe(page);
        check(`[${name}] «Nochmals testen» → Eingabe mit Hero, Konsole und Telefon wie vor dem Scan (Breite ${telEingabe.telefon?.breite} → ${zurueck.telefon?.breite}, ohne Skala)`, zurueck.h1Sichtbar && zurueck.konsoleSichtbar && !zurueck.kompakt && zurueck.telefon?.breite === telEingabe.telefon?.breite && zurueck.skalaVar === '' && !zurueck.telefonAusAttr, JSON.stringify({ tel: zurueck.telefon, skala: zurueck.skalaVar }));
    }
    if (film && treffer === 1) protokoll.filme[name] = frames;
    protokoll.mobil.push(lauf);
    await ctx.close();
    return frames;
}

/** Z5.2/Z5.3: ausgeklapptes Formular */
async function pruefeFormular(page, name, m, hoehe) {
    const f = await page.evaluate((sel) => {
        const b = document.querySelector(sel);
        const y = (q) => b.querySelector(q)?.getBoundingClientRect().top ?? null;
        const seg = b.querySelector('[data-ki-demo-segment]');
        const labels = seg ? [...seg.querySelectorAll('label')] : [];
        // Überstand: rechte Kante des letzten Segments gegen die Innenkante der Leiste (Rand + Innenabstand)
        const segR = seg?.getBoundingClientRect();
        const segInnenRechts = segR ? segR.right - parseFloat(getComputedStyle(seg).borderRightWidth) - parseFloat(getComputedStyle(seg).paddingRight) : null;
        const segUeberstand = labels.length && segInnenRechts !== null ? Math.round((labels[labels.length - 1].getBoundingClientRect().right - segInnenRechts) * 10) / 10 : null;
        const range = document.createRange();
        const segInfo = labels.map((l) => {
            // Text steht in der Pille (span) im Segment; Innenabstand = (Segmentbreite − Textbreite) / 2
            const t = [...(l.querySelector('span') ?? l).childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
            let textB = null;
            let zeilen = 0;
            if (t) {
                range.selectNodeContents(t);
                textB = range.getBoundingClientRect().width;
                zeilen = range.getClientRects().length;
            }
            const r = l.getBoundingClientRect();
            return { text: l.innerText.trim(), breite: Math.round(r.width * 10) / 10, hoehe: Math.round(r.height * 10) / 10, innen: textB === null ? null : Math.round(((r.width - textB) / 2) * 10) / 10, zeilen };
        });
        const sprache = b.querySelector('#ki-demo-sprache-titel');
        const nummerLabel = b.querySelector('label[for="ki-demo-nummer"]');
        return {
            titel: b.querySelector('h2')?.innerText.trim(),
            fokusTitel: document.activeElement?.tagName === 'H2' && document.activeElement.id === 'ki-demo-anruf-titel',
            reihenfolge: [y('h2'), y('#ki-demo-nummer'), y('#ki-demo-nummer-hinweis'), y('[data-ki-demo-segment]'), y('label[for="ki-demo-einwilligung"]'), y('#ki-demo-anruf-knopf')],
            hinweis: b.querySelector('#ki-demo-nummer-hinweis')?.innerText.trim(),
            feldH: Math.round(b.querySelector('#ki-demo-nummer')?.getBoundingClientRect().height ?? 0),
            vorwahlH: Math.round(b.querySelector('#ki-demo-vorwahl')?.getBoundingClientRect().height ?? 0),
            segH: seg ? Math.round(seg.getBoundingClientRect().height * 10) / 10 : null,
            segInfo,
            segUeberstand,
            spracheSichtbar: !!sprache && sprache.getBoundingClientRect().width > 2,
            nummerLabelSichtbar: !!nummerLabel && nummerLabel.getBoundingClientRect().width > 2,
            erprobung: b.querySelectorAll('[data-ki-demo-erprobung]').length,
            einwilligung: b.querySelector('#ki-demo-einwilligung-text')?.innerText.replace(/\s+/g, ' ').trim(),
            knopf: b.querySelector('#ki-demo-anruf-knopf')?.innerText.trim(),
            zurueck: [...b.querySelectorAll('a, button')].some((e) => /zurück/i.test(e.innerText)),
            schrittzeile: !!b.querySelector('[data-ki-demo-schritt]'),
            bestaetigt: !!b.querySelector('[data-handelsregister-bestaetigt]'),
        };
    }, AKTION);
    const aufsteigend = f.reihenfolge.every((v, i, a) => v !== null && (i === 0 || v > a[i - 1]));
    check(`[${name}] Z5.2: Antippen klappt das Formular aus, Fokus auf dem Titel (ohne Tastatur), kein Zurück-Link`, f.fokusTitel && !f.zurueck && m.scrollY === 0, JSON.stringify({ fokus: m.fokus, zurueck: f.zurueck }));
    check(`[${name}] Z5.3: Reihenfolge Titel T5 → Nummer → «Der Anruf kommt von ${ANRUF_VON}.» → Sprache → Einwilligung (wortgleich) → «Jetzt KI-Anruf erhalten»`, f.titel === T.t5('Lena') && aufsteigend && f.hinweis === `Der Anruf kommt von ${ANRUF_VON}.` && f.knopf === 'Jetzt KI-Anruf erhalten' && f.einwilligung === T.einwilligung, JSON.stringify(f));
    check(
        `[${name}] Z5.3: Nummernfeld 48 px, Sprachwahl einzeilig 44 px nur mit «Deutsch | English | Schweizerdeutsch», je ≥ 10 px Innenabstand; «Sprache» und «Ihre Telefonnummer» nur für Screenreader; ohne Schrittzeile und Handelsregister-Zeile`,
        f.feldH === 48 && f.vorwahlH === 48 && Math.abs(f.segH - 44) < 0.6 && f.segInfo.map((s) => s.text).join('|') === 'Deutsch|English|Schweizerdeutsch' && f.segInfo.every((s) => s.zeilen === 1 && s.innen >= 10) && f.segUeberstand !== null && f.segUeberstand <= 0.5 && !f.spracheSichtbar && !f.nummerLabelSichtbar && f.erprobung === 0 && !f.schrittzeile && !f.bestaetigt,
        JSON.stringify({ feldH: f.feldH, vorwahlH: f.vorwahlH, segH: f.segH, seg: f.segInfo, ueberstand: f.segUeberstand, sprache: f.spracheSichtbar, label: f.nummerLabelSichtbar }),
    );
    check(
        `[${name}] Z9.8: Formular ${hoehe >= 640 ? 'passt ohne internes Scrollen' : 'scrollt höchstens intern, «Jetzt KI-Anruf erhalten» ganz sichtbar'} (Blatt ${m.blatt?.hoehe} px in ${m.buehne?.hoehe} px Bühne)`,
        !!m.blatt && m.blatt.haupt.some((h) => h.id === 'ki-demo-anruf-knopf' && h.sichtbar) && (hoehe < 640 || (m.blatt.scrollH <= m.blatt.clientH + 1 && m.blatt.innen.every((i) => i.scrollH <= i.clientH + 1))),
        `${lageText(m)} · innen ${JSON.stringify(m.blatt?.innen)}`,
    );
    protokoll.formular = protokoll.formular ?? {};
    protokoll.formular[name] = { segInfo: f.segInfo, segUeberstand: f.segUeberstand, blattHoehe: m.blatt?.hoehe, buehne: m.buehne?.hoehe, innen: m.blatt?.innen, scroll: [m.blatt?.scrollH, m.blatt?.clientH] };
}

/** Ende eines Laufs: scrollY im ganzen Ablauf 0, CLS 0, keine Fehler, Anrufzahl */
async function abschluss(page, name, breite, konsole, z, { anrufe }) {
    const fin = await messe(page);
    const clsListe = await page.evaluate(() => window.__cls);
    const clsRoh = clsListe.reduce((a, b) => a + b.wert, 0);
    const cls = Math.round(clsRoh * 10000) / 10000;
    // [09.11.2026] Warum: AUFTRAG-123b (N5) — bekannter Telefon-Shift (O1, Bestand): alle Quellen im Telefon und Summe ≤ 0,001 → INFO
    const bekannt = clsRoh > 0 && clsRoh <= CLS_BEKANNT_MAX && clsListe.every((e) => e.imTelefon?.length > 0 && e.imTelefon.length === e.quellen.length && e.imTelefon.every(Boolean));
    if (bekannt) {
        console.log(`INFO  [${name}] bekannt (Bestand Telefon-Ansicht, O1): CLS ${clsRoh.toFixed(6)}, Quellen ${JSON.stringify(clsListe.map((e) => e.quellen))}`);
        (protokoll.infoBekannt = protokoll.infoBekannt ?? []).push({ lauf: name, cls: clsRoh, eintraege: clsListe });
    }
    check(
        `[${name}] Z9.1: scrollY im ganzen Ablauf 0 (max ${fin.maxScrollY}), kein waagrechtes Scrollen, CLS ${cls}${bekannt ? ' — INFO bekannt (Bestand Telefon-Ansicht, O1)' : ''}`,
        fin.maxScrollY === 0 && fin.scrollWidth <= breite && (cls === 0 || bekannt),
        `maxScrollY ${fin.maxScrollY}, scrollWidth ${fin.scrollWidth}, CLS ${cls} ${JSON.stringify(clsListe).slice(0, 600)}`,
    );
    check(`[${name}] keine Konsolenfehler, keine ungemockten Demo-Aufrufe, ${anrufe} (gemockte) Anruf-Anfrage(n)`, konsole.length === 0 && z.fremd.length === 0 && z.anrufe === anrufe, `${konsole.slice(0, 3).join(' | ')} ${z.fremd.join(' ')} Anrufe ${z.anrufe}`);
}

/**
 * Beleg (keine Z9-Prüfung): Layout-Shifts im Desktop-Ablauf «automatisch kein Treffer → eigene Suche → Treffer». Der Desktop
 * ist byte-gleich mit 6682c0b — was hier verschiebt, ist Bestand (Telefon-Schritte), nicht AUFTRAG-123.
 */
async function desktopSucheCls() {
    const { ctx, page } = await neueSeite({ breite: 1366, hoehe: 900, mobil: false });
    await apiAbfangen(page, { fall: 'suche' });
    await page.goto(SEITE, { waitUntil: 'networkidle' });
    await scanne(page);
    await page.waitForSelector('[data-handelsregister="kein_treffer"]', { timeout: 15000 });
    await page.waitForTimeout(800);
    const nachAntwort = await page.evaluate(() => window.__cls);
    await page.fill('#ki-demo-hr-suche', 'Beispiel AG');
    await page.click('#ki-demo-hr-suchen');
    await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
    await page.waitForTimeout(800);
    const alle = await page.evaluate(() => window.__cls);
    protokoll.desktopSucheCls = { nachAntwort, alle };
    console.log(`INFO  Desktop (Bestand) kein Treffer → Suche: CLS-Einträge ${JSON.stringify(alle)}`);
    await ctx.close();
}

/** Z9.6: ein Lauf scrollt während des Vollscans nach unten → Statuszeile sichtbar; zurück nach oben → wieder weg */
async function statusLauf() {
    const name = '375x812-statuszeile';
    const { ctx, page, konsole } = await neueSeite({ breite: 375, hoehe: 812 });
    const z = await apiAbfangen(page);
    await page.goto(SEITE, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await scanne(page);
    await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
    await page.waitForTimeout(600);
    const m0 = await messe(page);
    pruefeSchritt(name, 'Firma', m0);
    await page.tap('#ki-demo-hr-bestaetigen');
    await page.waitForSelector(`${TELEFON} li:has-text("Website wird gelesen")`, { timeout: 8000 });
    // Telefon aus dem Bild, Bühne (Raster) noch im Bild — weiter unten (FAQ) gilt «ausserhalb der Demo» (A-100: keine Statuszeile)
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
    await page.waitForTimeout(600);
    const m1 = await messe(page);
    await page.screenshot({ path: path.join(SCREENS, `mobil-${name}-gescrollt.png`) });
    check(`[${name}] Z9.6: während des Vollscans nach unten gescrollt (scrollY ${m1.scrollY}) → Statuszeile sichtbar («${m1.status?.text}»)`, m1.status?.sichtbar && m1.scrollY > 0 && /Schritt \d von 8/.test(m1.status.text), JSON.stringify(m1.status));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(600);
    const m2 = await messe(page);
    check(`[${name}] Z9.6: zurück nach oben → Statuszeile wieder unsichtbar`, !m2.status?.sichtbar && m2.scrollY === 0, JSON.stringify(m2.status));
    check(`[${name}] keine Konsolenfehler, keine ungemockten Demo-Aufrufe`, konsole.length === 0 && z.fremd.length === 0, konsole.join(' | '));
    await ctx.close();
}

/**
 * Z5.4: Turnstile im Kompaktmodus mit appearance 'interaction-only', am Desktop unveränderte Optionen. Lokal ist kein
 * Site-Key gesetzt — der Test setzt im ausgelieferten HTML die Prop turnstileSiteKey (Attrappe, kein echter Schlüssel)
 * und beantwortet challenges.cloudflare.com mit einem Fake-Skript (window.turnstile zeichnet die Optionen auf).
 */
async function turnstileLauf() {
    const FAKE = `window.turnstile = { render: function (el, opt) { (window.__turnstile = window.__turnstile || []).push({ appearance: opt.appearance === undefined ? null : opt.appearance, schluessel: Object.keys(opt).sort().join(',') }); setTimeout(function () { opt.callback('attrappe-token'); }, 30); return 'attrappe-' + window.__turnstile.length; }, reset: function () {}, remove: function () {} };`;
    const ergebnis = {};
    for (const [art, breite, hoehe, mobil] of [
        ['mobil', 390, 664, true],
        ['desktop', 1366, 900, false],
    ]) {
        const { ctx, page } = await neueSeite({ breite, hoehe, mobil });
        const z = await apiAbfangen(page);
        let cloudflare = 0;
        await page.route('https://challenges.cloudflare.com/**', (r) => {
            cloudflare++;
            return r.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE });
        });
        let gepatcht = false;
        await page.route(SEITE, async (r) => {
            const res = await r.fetch();
            const html = await res.text();
            const neu = html.replace('\\"turnstileSiteKey\\":\\"$undefined\\"', '\\"turnstileSiteKey\\":\\"a123-attrappe\\"');
            gepatcht = neu !== html;
            await r.fulfill({ response: res, body: neu });
        });
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        await scanne(page);
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.click('#ki-demo-hr-bestaetigen');
        if (mobil) {
            await page.waitForSelector('#ki-demo-bereit-knopf', { state: 'visible', timeout: 30000 });
            await page.waitForTimeout(300);
            ergebnis.vorAusklappen = await page.evaluate(() => (window.__turnstile || []).length);
            await page.tap('#ki-demo-bereit-knopf');
            await page.waitForTimeout(800);
        } else {
            await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
            await page.waitForTimeout(800);
        }
        ergebnis[art] = { gepatcht, cloudflare, aufrufe: await page.evaluate(() => window.__turnstile || []) };
        await page.fill('#ki-demo-nummer', '79 123 45 67');
        await page.check('#ki-demo-einwilligung');
        await page.click('#ki-demo-anruf-knopf');
        await page.waitForTimeout(600);
        ergebnis[art].token = z.anrufKoerper[0]?.turnstile ?? null;
        ergebnis[art].fremd = z.fremd;
        await ctx.close();
    }
    protokoll.turnstile = ergebnis;
    check(`Z5.4 Turnstile mobil: Widget erst im ausgeklappten Formular, render() mit appearance 'interaction-only', Token geht mit dem Anruf`, ergebnis.mobil.gepatcht && ergebnis.vorAusklappen === 0 && ergebnis.mobil.aufrufe.length === 1 && ergebnis.mobil.aufrufe[0].appearance === 'interaction-only' && ergebnis.mobil.token === 'attrappe-token' && ergebnis.mobil.fremd.length === 0, JSON.stringify(ergebnis));
    check(`Z5.4 Turnstile Desktop: render() ohne appearance, Optionen unverändert (callback, error-callback, expired-callback, language, sitekey)`, ergebnis.desktop.gepatcht && ergebnis.desktop.aufrufe.length === 1 && ergebnis.desktop.aufrufe[0].appearance === null && ergebnis.desktop.aufrufe[0].schluessel === 'callback,error-callback,expired-callback,language,sitekey' && ergebnis.desktop.token === 'attrappe-token' && ergebnis.desktop.fremd.length === 0, JSON.stringify(ergebnis.desktop));
}

/** Z9.9 Kontraste aller Texte und Trefferflächen in jedem Blatt (390×664 hell und dunkel) */
async function kontrastLauf(theme) {
    const sammlung = {};
    let dunkel = false;
    {
        const { ctx, page } = await neueSeite({ breite: 390, hoehe: 664, theme });
        await apiAbfangen(page, { treffer: 5 });
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        await scanne(page);
        const nimm = async (n) => {
            await page.waitForTimeout(700);
            sammlung[n] = await blattKontraste(page);
        };
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await nimm('Firma (5 Treffer)');
        await page.tap('#ki-demo-hr-andere');
        await nimm('Suche (Meine Firma ist nicht dabei)');
        await page.tap('#ki-demo-hr-zurueck');
        await page.waitForTimeout(300);
        await page.locator('button[data-hr-zeile] >> nth=0').tap();
        await page.waitForSelector('#ki-demo-bereit-knopf', { state: 'visible', timeout: 30000 });
        await nimm('Kurzblatt');
        await page.tap('#ki-demo-bereit-knopf');
        await page.waitForTimeout(300);
        await page.locator('label[for="ki-demo-sprache-dialekt_auto"]').tap();
        await nimm('Formular (Schweizerdeutsch)');
        await page.locator('label[for="ki-demo-sprache-hochdeutsch"]').tap();
        await page.fill('#ki-demo-nummer', '79 123 45 67');
        await page.check('#ki-demo-einwilligung');
        await page.tap('#ki-demo-anruf-knopf');
        await page.waitForSelector('[data-ki-demo-ende]', { timeout: 30000 });
        await nimm('Ende');
        dunkel = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        await ctx.close();
    }
    for (const fall of ['normal', 'passt_nicht']) {
        const { ctx, page } = await neueSeite({ breite: 390, hoehe: 664, theme });
        await apiAbfangen(page, { treffer: 1, fall });
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        await scanne(page);
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.waitForTimeout(700);
        if (fall === 'normal') sammlung['Firma (1 Treffer)'] = await blattKontraste(page);
        else {
            await page.tap('#ki-demo-hr-bestaetigen');
            await page.waitForSelector('[data-hr-passt-nicht]', { timeout: 8000 });
            await page.waitForTimeout(500);
            sammlung['Firma (409)'] = await blattKontraste(page);
        }
        await ctx.close();
    }
    {
        const { ctx, page } = await neueSeite({ breite: 390, hoehe: 664, theme });
        await apiAbfangen(page, { treffer: 1, fehler: true });
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        await scanne(page);
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.tap('#ki-demo-hr-bestaetigen');
        await page.waitForSelector('#ki-demo-bereit-knopf', { state: 'visible', timeout: 30000 });
        await page.tap('#ki-demo-bereit-knopf');
        await page.fill('#ki-demo-nummer', '79 123 45 67');
        await page.check('#ki-demo-einwilligung');
        await page.tap('#ki-demo-anruf-knopf');
        await page.waitForSelector('[data-ki-demo-ende]', { timeout: 30000 });
        await page.waitForTimeout(700);
        sammlung['Anruf gescheitert'] = await blattKontraste(page);
        await ctx.close();
    }
    protokoll.kontrast[theme] = sammlung;
    const schlecht = [];
    const gruen = [];
    const klein = [];
    for (const [blatt, k] of Object.entries(sammlung)) {
        for (const t of k?.texte ?? []) {
            if (t.markengruen) gruen.push(`${blatt}: «${t.text}» ${t.verhaeltnis}`);
            else if (t.verhaeltnis < 4.5) schlecht.push(`${blatt}: «${t.text}» ${t.verhaeltnis}`);
        }
        for (const zz of k?.ziele ?? []) if (zz.hoehe < 44) klein.push(`${blatt}: ${zz.el} ${zz.hoehe}`);
    }
    const anzahl = Object.values(sammlung).reduce((a, k) => a + (k?.texte.length ?? 0), 0);
    const gruenWerte = [...new Set(gruen.map((g) => g.split('» ')[1]))].join('/');
    protokoll.kontrast[`${theme}_markengruen`] = gruen;
    check(`Z9.9 Kontrast ${theme === 'dark' ? 'dunkel (Dark Mode aktiv)' : 'hell'}: alle ${anzahl - gruen.length} Texte in ${Object.keys(sammlung).length} Blättern ≥ 4.5:1 (ausgenommen Weiss auf Markengrün in den Haupthandlungen, Bestand: ${gruenWerte})`, schlecht.length === 0 && (theme !== 'dark' || dunkel), schlecht.join(' · '));
    check(`Z9.9 Trefferflächen ${theme === 'dark' ? 'dunkel' : 'hell'}: alle Bedienelemente in den Blättern ≥ 44 px`, klein.length === 0, klein.join(' · '));
}

/** Z9.10: reduzierte Bewegung — berechnete transition-duration von Telefon und Blatt 0s, Blatt ohne Animation */
function ruhigPruefen(lauf) {
    const m = lauf?.schritte?.Kurzblatt;
    const f = lauf?.schritte?.Formular;
    const null0 = (s) => /^0s(, 0s)*$/.test(s ?? '');
    check(
        `[${lauf?.name}] Z9.10: reduzierte Bewegung — transition-duration Telefon ${m?.telefon?.transition} / Blatt ${m?.blatt?.transition}, Blatt-Animation «${m?.blatt?.animation}»`,
        !!m && null0(m.telefon.transition) && null0(m.blatt.transition) && (m.blatt.animation.startsWith('none') || m.blatt.animation.endsWith(' 0s')) && null0(f?.telefon?.transition),
        JSON.stringify({ k: m?.telefon?.transition, b: m?.blatt?.transition, a: m?.blatt?.animation }),
    );
}

/** Filmstreifen mit sharp: Bilder nebeneinander, darunter der Schritt */
async function filmstreifen(frames, datei) {
    if (!frames?.length) return;
    const { default: sharp } = await import('sharp');
    const meta = await sharp(frames[0].p).metadata();
    const w = meta.width;
    const h = meta.height;
    const luecke = 16;
    const fuss = 40;
    const breite = frames.length * w + (frames.length + 1) * luecke;
    const hoehe = h + 2 * luecke + fuss;
    const texte = frames.map((f, i) => `<text x="${luecke + i * (w + luecke) + w / 2}" y="${luecke + h + 30}" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#1a2a1a" text-anchor="middle">${i + 1} · ${f.titel}</text>`).join('');
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${breite}" height="${hoehe}">${texte}</svg>`);
    await sharp({ create: { width: breite, height: hoehe, channels: 3, background: '#e6ebe6' } })
        .composite([...frames.map((f, i) => ({ input: f.p, left: luecke + i * (w + luecke), top: luecke })), { input: svg, left: 0, top: 0 }])
        .png()
        .toFile(path.join(SCREENS, datei));
}

try {
    if (PHASE === 'k8') {
        const erwartet = ANRUF_VON;
        const { ctx, page } = await neueSeite({ breite: 1366, hoehe: 900, mobil: false });
        await apiAbfangen(page);
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        await scanne(page);
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.click('#ki-demo-hr-bestaetigen');
        await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
        const hinweis = await page.locator('#ki-demo-nummer-hinweis').innerText();
        const ablauf = await page.locator('ol[aria-label="Ablauf des Testanrufs"]').innerText();
        await page.fill('#ki-demo-nummer', '79 123 45 67');
        await page.check('#ki-demo-einwilligung');
        await page.click('#ki-demo-anruf-knopf');
        await page.waitForSelector('#ki-demo-anruf-knopf[data-zustand="waehlt"]', { timeout: 20000 });
        await page.waitForTimeout(800);
        const telefon = await page.evaluate(() => [...document.querySelectorAll('figure p')].filter((p) => p.checkVisibility({ visibilityProperty: true })).map((p) => p.textContent).join(' | '));
        const ablauf2 = await page.locator('ol[aria-label="Ablauf des Testanrufs"]').innerText();
        protokoll.k8 = { erwartet, hinweis, ablauf, ablauf2, telefon };
        check(`K8: Formular-Hinweis «Der Anruf kommt von ${erwartet}.»`, hinweis.trim() === `Der Anruf kommt von ${erwartet}.`, hinweis);
        check(`K8: Ablauf-Liste «Anruf von ${erwartet}» (vor und während des Anrufs)`, ablauf.includes(`Anruf von ${erwartet}`) && ablauf2.includes(`Anruf von ${erwartet} an`), `${ablauf} || ${ablauf2}`);
        check(`K8: Telefon-Bildschirm («Anruf von») zeigt ${erwartet}`, telefon.includes(erwartet), telefon);
        const andere = ['+41 44 552 03 06', '052 222 18 18'].filter((n) => n !== erwartet);
        check('K8: kein anderer Absender an diesen Stellen', !andere.some((n) => (hinweis + ablauf + ablauf2 + telefon).includes(n)), andere.join(', '));
        await page.screenshot({ path: path.join(SCREENS, `k8-desktop-waehlt-${erwartet.replace(/\D/g, '')}.png`) });
        await ctx.close();
    } else {
        if (PHASE === 'vorher') {
            for (const [b, h] of [
                [390, 664],
                [360, 640],
            ])
                for (const t of [1, 5]) await vorherLauf({ breite: b, hoehe: h, treffer: t });
        } else {
            const VIEWPORTS = [
                [360, 640],
                [375, 553],
                [390, 664],
                [393, 727],
                [430, 739],
                [375, 812],
            ];
            const soll = (b, h) => !NUR || NUR === `${b}x${h}`;
            let film1 = null;
            let film5 = null;
            for (const [b, h] of VIEWPORTS)
                if (soll(b, h)) {
                    const frames = await mobilLauf({ breite: b, hoehe: h, treffer: 1, shots: true, film: b === 390 && h === 664 });
                    if (b === 390 && h === 664) film1 = frames;
                }
            if (soll(390, 664)) {
                await mobilLauf({ breite: 390, hoehe: 664, treffer: 1, theme: 'dark', shots: true });
                await mobilLauf({ breite: 390, hoehe: 664, treffer: 1, reduced: true });
                ruhigPruefen(protokoll.mobil.find((l) => l.name === '390x664-1t-hell-ruhig'));
                await mobilLauf({ breite: 390, hoehe: 664, treffer: 5, shots: true, film: true });
                film5 = protokoll.filme['390x664-5t-hell'];
                await mobilLauf({ breite: 390, hoehe: 664, treffer: 1, fall: 'suche', shots: true });
                await mobilLauf({ breite: 390, hoehe: 664, treffer: 1, fall: 'passt_nicht', shots: true });
                await mobilLauf({ breite: 390, hoehe: 664, treffer: 1, fehler: true, shots: true });
            }
            if (soll(360, 640)) await mobilLauf({ breite: 360, hoehe: 640, treffer: 5, shots: true });
            if (soll(375, 553)) await mobilLauf({ breite: 375, hoehe: 553, treffer: 5, shots: true });
            // [09.11.2026] Warum: AUFTRAG-123b — N2: 409 auch bei 360, 375 und 430 px (390 oben); N3: Suche auch bei 360 px;
            // N4: Ende und Fehler bei 360×640, 375×553 und 390×664 je hell und dunkel (fehlende Kombinationen hier)
            if (soll(390, 664)) await mobilLauf({ breite: 390, hoehe: 664, treffer: 1, theme: 'dark', fehler: true, shots: true });
            for (const [b, h] of [
                [360, 640],
                [375, 553],
            ])
                if (soll(b, h)) {
                    await mobilLauf({ breite: b, hoehe: h, treffer: 1, fehler: true, shots: true });
                    await mobilLauf({ breite: b, hoehe: h, treffer: 1, theme: 'dark', shots: true });
                    await mobilLauf({ breite: b, hoehe: h, treffer: 1, theme: 'dark', fehler: true, shots: true });
                    await mobilLauf({ breite: b, hoehe: h, treffer: 1, fall: 'passt_nicht', shots: true });
                }
            if (soll(360, 640)) await mobilLauf({ breite: 360, hoehe: 640, treffer: 1, fall: 'suche', shots: true });
            if (soll(430, 739)) await mobilLauf({ breite: 430, hoehe: 739, treffer: 1, fall: 'passt_nicht', shots: true });
            if (soll(768, 1024)) {
                await mobilLauf({ breite: 768, hoehe: 1024, treffer: 1, shots: true, name: 'tablet-768x1024-1t-hell' });
                const t = protokoll.mobil.find((l) => l.name === 'tablet-768x1024-1t-hell');
                for (const s of ['Firma', 'Kurzblatt', 'Formular', 'Ende']) {
                    const m = t?.schritte?.[s];
                    check(`[tablet-768x1024] Z9.11 ${s}: Blatt ≤ 30 rem (${m?.blatt?.breite} ≤ 480) und zentriert (Mitte ${m?.blatt?.mitte}), Telefon zentriert (Mitte ${m?.telefon?.mitte}), Grundbreite ≤ 300 px`, !!m?.blatt && m.blatt.breite <= 480.5 && Math.abs(m.blatt.mitte - 384) <= 1 && Math.abs(m.telefon.mitte - 384) <= 1 && m.telefon.basisBreite <= 300, m ? lageText(m) : 'kein Schritt');
                }
            }
            if (!NUR) {
                await statusLauf();
                await desktopSucheCls();
                await turnstileLauf();
                await kontrastLauf('light');
                await kontrastLauf('dark');
            }
            if (film1) await filmstreifen(film1, 'filmstreifen-390x664-hell.png');
            if (film5) await filmstreifen(film5, 'filmstreifen-390x664-5treffer-hell.png');
        }

        /* ---------------- Desktop 1366×900 (Z9.12) ---------------- */
        if (!NUR) {
            const { ctx, page } = await neueSeite({ breite: 1366, hoehe: 900, reduced: true, mobil: false });
            const z = await apiAbfangen(page);
            await page.goto(SEITE, { waitUntil: 'networkidle' });
            await page.waitForTimeout(800);
            const shot = async (name) => {
                const p = path.join(SCREENS, name);
                await page.screenshot({ path: p, animations: 'disabled', caret: 'hide' });
                return p;
            };
            const bilder = [];
            bilder.push(await shot('desktop-1-start.png'));
            await scanne(page);
            await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
            await page.mouse.move(0, 0);
            await page.waitForTimeout(1500);
            const d1 = await messe(page);
            const sticky1 = await page.evaluate(() => {
                const t = document.querySelector('figure').parentElement;
                return { position: getComputedStyle(t).position, top: getComputedStyle(t).top, mitlaufen: t.getAttribute('data-mitlaufen'), links: Math.round(t.getBoundingClientRect().left), buehneAttr: [...t.parentElement.attributes].map((a) => a.name).join(',') };
            });
            const schrittSichtbar = await page.locator('[data-ki-demo-schritt]').evaluateAll((l) => l.some((e) => e.getClientRects().length > 0));
            const statusDisplay = await page.evaluate(() => getComputedStyle(document.querySelector('button[data-zustand]:not([id])')).display);
            bilder.push(await shot('desktop-2-nach-scan.png'));
            await page.click('#ki-demo-hr-bestaetigen');
            await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
            await page.mouse.move(0, 0);
            await page.waitForTimeout(1500);
            const d2 = await messe(page);
            bilder.push(await shot('desktop-3-formular.png'));
            await page.evaluate(() => {
                const b = document.querySelector('figure').parentElement.parentElement.getBoundingClientRect();
                window.scrollTo(0, Math.max(0, b.bottom + window.scrollY - window.innerHeight + 40));
            });
            await page.waitForTimeout(800);
            bilder.push(await shot('desktop-4-buehne-ende.png'));
            protokoll.desktop = { d1, d2, sticky1, statusDisplay, schrittSichtbar };
            if (PHASE === 'nachher') {
                check('Z9.12 Desktop: keine Kompaktzeile, H1 und Konsole sichtbar, keine Schrittzeile sichtbar, Telefon ohne Skala-Variable/-Attribut', !d1.kompakt && d1.h1Sichtbar && d1.konsoleSichtbar && !schrittSichtbar && d1.skalaVar === '' && !d1.telefonAusAttr && Math.abs(d1.telefon.skala - 1) < 0.005, JSON.stringify({ kompakt: d1.kompakt, h1: d1.h1Sichtbar, konsole: d1.konsoleSichtbar, schrittSichtbar, skala: d1.skalaVar, attr: sticky1.buehneAttr }));
                check('Z9.12 Desktop: Telefon rechts sticky wie heute (top 112 px, data-mitlaufen), Raster unverändert', sticky1.position === 'sticky' && sticky1.top === '112px' && sticky1.mitlaufen === 'true' && sticky1.links > 700 && /"intro telefon"\s*"konsole telefon"\s*"aktion telefon"/.test(d1.gridAreas ?? ''), JSON.stringify({ ...sticky1, areas: d1.gridAreas }));
                check('Z9.12 Desktop: Statuszeile display none, kein Sprung beim Scan (scrollY 0)', statusDisplay === 'none' && d1.scrollY === 0, `${statusDisplay}, scrollY ${d1.scrollY}`);
                for (const b of bilder) {
                    const vorher = path.join(SCREENS_BASIS, 'vorher', path.basename(b));
                    if (!existsSync(vorher)) {
                        check(`Z9.12 Desktop: ${path.basename(b)} deckungsgleich mit «vorher»`, false, 'kein Vorher-Bild');
                        continue;
                    }
                    const diff = await pixelDiff(page, vorher, b);
                    protokoll.desktop[`diff_${path.basename(b)}`] = diff;
                    check(`Z9.12 Desktop: ${path.basename(b)} deckungsgleich mit «vorher» (0 abweichende Pixel)`, diff.gleicheGroesse && diff.abweichend === 0, JSON.stringify(diff));
                }
                check('Desktop: keine ungemockten Demo-Aufrufe', z.fremd.length === 0, z.fremd.join(' '));
            }
            await ctx.close();
        }
    }
} finally {
    await browser.close();
}

protokoll.ergebnisse = ergebnisse;
protokoll.tabelle = tabelle;
writeFileSync(path.join(SCREENS, 'browser-test.json'), JSON.stringify(protokoll, null, 2));
if (tabelle.length) {
    const md = [
        '# A-123b Messtabelle (Playwright, Produktionsbuild :3011, /api/demo/** gemockt; Schwelle Telefon-Skala 0,36)',
        '',
        'Werte in px aus getBoundingClientRect(); Telefon-Grundgrösse = Layout-Masse ohne Transform (offsetWidth × offsetHeight), Skala = gemessene Höhe ÷ Grundhöhe.',
        '',
        '| Lauf | Viewport | Schritt | Bühne oben–unten (Höhe) | Telefon Grundgrösse | Skala | Telefon sichtbar | Telefon oben–unten | Blatt Oberkante | Blatt Höhe | Haupthandlung unten | Fenster | scrollY |',
        '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
    ];
    for (const t of tabelle)
        md.push(
            `| ${t.lauf} | ${t.viewport} | ${t.schritt} | ${t.buehne ? `${t.buehne.top}–${t.buehne.bottom} (${t.buehne.hoehe})` : '–'} | ${t.telefon ? `${t.telefon.basisBreite}×${t.telefon.basisHoehe}` : '–'} | ${t.telefon?.skala ?? '–'} | ${t.telefon ? (t.telefon.aus ? 'nein (ausgeblendet)' : 'ja') : '–'} | ${t.telefon ? `${t.telefon.top}–${t.telefon.bottom}` : '–'} | ${t.blatt ? `${t.blatt.top} (${t.blatt.art})` : 'kein Blatt'} | ${t.blatt?.hoehe ?? '–'} | ${t.hauptUnten ?? '–'} | ${t.innerHeight} | ${t.scrollY} |`,
        );
    writeFileSync(path.join(SCREENS, 'messtabelle.md'), md.join('\n') + '\n');
}
const fehl = ergebnisse.filter((e) => !e.ok).length;
console.log(`\n${PHASE}: ${ergebnisse.length - fehl}/${ergebnisse.length} bestanden`);
process.exit(PHASE !== 'vorher' && fehl ? 1 : 0);
