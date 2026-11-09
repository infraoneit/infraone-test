#!/usr/bin/env node
/**
 * auftrag121-browser-test.mjs (AUFTRAG-121, umgebaut AUFTRAG-122) — KI-Demo auf dem Handy: alles in einem Blickfeld,
 * kein Scrollen; Desktop unverändert.
 *
 * [09.11.2026] Warum: Belege für AUFTRAG-121 (K1–K8). Gegen einen EIGENEN Server (Vorgabe http://localhost:3011,
 * nie :3000/:3010), Produktionsbuild (`npx next start -p 3011`). ALLE Aufrufe unter /api/demo/** sind gemockt
 * (fiktive Beispiel AG): kein echter Scan, keine Handelsregister-Abfrage, kein Anruf, kein Kontakt zu pbx01.
 *
 * [09.11.2026] Warum: AUFTRAG-122 Telefon als Bühne, Karte darüber — das Telefon ist mobil wieder gerendert und füllt
 * die Bühne (Breite aus der Fensterhöhe); die Handlungskarte liegt unten darüber (Firma: feste Höhe, sonst Inhalt) und
 * fehlt in den passiven Phasen (Vollscan nach der Bestätigung, Anruf). Gemessen je Schritt: scrollY 0, CLS 0, Lage von
 * Telefon und Karte in der Bühne, Hauptknopf im Bild, sichtbare Telefonhöhe über der Karte, Überlauf im Telefon.
 * Die A-121-Prüfungen auf «kein Telefon», die Kompakt-Ansichten «Vorbereitung» und «Anruf läuft» sind entfallen.
 *
 *   PHASE=vorher  → nur Screenshots (Stand vor der Änderung), keine Prüfungen
 *   PHASE=nachher → Messung (360×740, 375×812, 390×844; 1 und 5 Treffer; hell und dunkel; Fehlerlauf), Kontraste,
 *                   Desktop pixelgenau gegen «vorher»
 *   PHASE=prozent → nur S4.1 (A-122): Liste mit 1 Treffer bei 62/64/66/68 % Kartenanteil je Viewport
 *   PHASE=k8      → nur K8 (A-121): ERWARTE_ANRUF_VON (Vorgabe «+41 44 552 03 06») steht im Formular-Hinweis, in der
 *                   Ablauf-Liste und im Telefon-Bildschirm (Desktop, damit das Telefon sichtbar ist)
 *
 *   $env:BASE_URL='http://localhost:3011'; $env:PHASE='nachher'; node scripts/auftrag121-browser-test.mjs
 *   Bilder: $env:SCREENS_DIR (Vorgabe auftraege/ergebnisse/A122-screens)
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
const PHASE = ['vorher', 'k8', 'prozent'].includes(process.env.PHASE) ? process.env.PHASE : 'nachher';
const CHROME = process.env.PLAYWRIGHT_CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SEITE = `${BASE}/ki-telefonassistent`;
const ANRUF_VON = process.env.ERWARTE_ANRUF_VON || '+41 44 552 03 06';

function ergebnisOrdner() {
    let d = ROOT;
    for (let i = 0; i < 8; i++) {
        if (existsSync(path.join(d, 'auftraege', 'ergebnisse'))) return path.join(d, 'auftraege', 'ergebnisse');
        d = path.dirname(d);
    }
    return path.join(ROOT, 'auftraege-ergebnisse');
}
// [09.11.2026] Warum: AUFTRAG-122 Telefon als Bühne, Karte darüber — Bilder unter A122-screens
const SCREENS_BASIS = process.env.SCREENS_DIR || path.join(ergebnisOrdner(), 'A122-screens');
const SCREENS = path.join(SCREENS_BASIS, PHASE);
mkdirSync(SCREENS, { recursive: true });

const ergebnisse = [];
function check(name, ok, detail = '') {
    ergebnisse.push({ name, ok: !!ok, detail: String(detail).slice(0, 800) });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`);
}

/* ------------------------------------------------------------------ */
/* Attrappe (alle /api/demo/** gemockt)                                */
/* ------------------------------------------------------------------ */

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect x="4" y="12" width="36" height="36" rx="8" fill="#E8A13D"/><text x="50" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1E3A5F">Beispiel AG</text></svg>`;
const SCAN_ID = 's-a121attrappe0001';
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
const BESTAETIGT = { uid: TREFFER.uid, uid_formatiert: TREFFER.uid_formatiert, name: TREFFER.name, sitz: TREFFER.sitz, gebunden: 'domain' };
// lange Zusammenfassung (mehr als acht Zeilen auf 360 px) für «Mehr anzeigen»
const ZUSAMMENFASSUNG =
    'Testgespräch (Attrappe im Browser). Die Anruferin wollte wissen, ob die Beispiel AG auch am Samstag Notfalleinsätze übernimmt. Lena hat die Öffnungszeiten Mo–Fr 07:30–17:00 genannt, auf den Pikettdienst hingewiesen und einen Rückruf für Montagmorgen notiert. Anliegen: defekter Sicherungskasten in einem Einfamilienhaus in Winterthur, keine Gefahr im Verzug. Kontakt: Frau Muster, Rückruf unter der angerufenen Nummer. Stimmung freundlich, Gespräch nach rund drei Minuten von der Anruferin beendet.';
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
// [09.11.2026] Warum: AUFTRAG-122 — der Vollscan (Stufe 2) antwortet erst nach ≥ 1500 ms, damit die passive Phase messbar ist
const VOLLSCAN_MS = 2200;

async function apiAbfangen(page, { treffer = 1, fehler = false } = {}) {
    const z = { start: 0, anrufe: 0, fremd: [] };
    await page.route('**/api/demo/**', (r) => {
        z.fremd.push(r.request().url());
        return r.fulfill({ status: 418, contentType: 'application/json', body: '{"fehler":"A122-Test: gesperrt"}' });
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
        await warte(body.bestaetige ? 400 : 1200);
        const orte = ['Zürich', 'Bern', 'St. Gallen', 'Luzern'];
        const liste = Array.from({ length: treffer }, (_, i) => (i ? { ...TREFFER, uid: `CHE00000000${i + 1}`, uid_formatiert: `CHE-000.000.00${i + 1}`, name: `Beispiel ${i + 1} AG`, sitz: orte[i - 1] } : TREFFER));
        const basis = { scan_id: SCAN_ID, modus: 'streng', quelle: treffer > 1 ? 'name' : 'uid', treffer: liste, versuche_rest: 3 };
        if (body.bestaetige) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...basis, ergebnis: 'bestaetigt', bestaetigt: BESTAETIGT, gueltig_bis: Date.now() + 3600e3 }) });
        if (treffer === 0) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...basis, treffer: [], ergebnis: 'kein_treffer', bestaetigt: null }) });
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...basis, ergebnis: 'treffer', bestaetigt: null }) });
    });
    await page.route('**/api/demo/profil', async (r) => {
        await warte(500);
        await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profil: PROFIL, funde: { telefon: '044 000 00 00', oeffnungszeiten: 'Mo–Fr 07:30–17:00', wissen: 12 } }) });
    });
    await page.route('**/api/demo/anruf', async (r) => {
        z.anrufe++;
        z.start = Date.now();
        await r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'd-20261109-attrappea121' }) });
    });
    await page.route('**/api/demo/auftraege/**', async (r) => {
        const t = Date.now() - z.start;
        const ende = fehler ? 'fehler' : 'beendet';
        const status = t > 9000 ? ende : t > 6000 && !fehler ? 'verbunden' : t > 3000 ? 'waehlt' : 'wartend';
        await r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'd-20261109-attrappea121',
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
 * Lage von Bühne, Telefon, Karte und Hauptknopf (mehrere Selektoren = unterste Unterkante zählt).
 * Bühne = zweite Rasterzeile der Demo (grid-template-rows im Kompaktmodus «44px <Bühne>»): Unterkante = Unterkante
 * des Rasters, Oberkante = Unterkante − Zeilenhöhe.
 */
async function messe(page, knoepfe = []) {
    return page.evaluate(
        ([sel, telSel, ks]) => {
            const r1 = (n) => Math.round(n * 10) / 10;
            const karte = document.querySelector(sel);
            const kr = karte?.getBoundingClientRect();
            const fig = document.querySelector(telSel);
            const tr = fig?.getBoundingClientRect();
            const buehneEl = fig?.parentElement?.parentElement ?? karte?.parentElement?.parentElement;
            const br = buehneEl?.getBoundingClientRect();
            const zeilen = buehneEl ? getComputedStyle(buehneEl).gridTemplateRows.split(' ').map(parseFloat) : [];
            const buehneHoehe = zeilen.length ? zeilen[zeilen.length - 1] : null;
            const buehneBottom = br ? br.bottom : null;
            const kn = ks.map((k) => document.querySelector(k)).filter(Boolean);
            const bs = kn.map((k) => k.getBoundingClientRect());
            const status = document.querySelector('button[data-zustand]:not([id])');
            const kompakt = document.querySelector('[data-ki-demo-kompakt]');
            const h1 = document.querySelector('h1');
            const h1r = h1?.getBoundingClientRect();
            // aktive Ansicht im Telefon: Text und Überlauf (Elemente ausserhalb des Bildschirms, ohne die animierten Ringe)
            const schirm = fig?.querySelector('[class*="bildschirm"]');
            const sr = schirm?.getBoundingClientRect();
            const aktiv = fig ? [...fig.querySelectorAll('[aria-hidden="false"]')].find((a) => a.className.includes('ansicht')) : null;
            const ueberlauf = [];
            if (aktiv && sr) {
                for (const el of aktiv.querySelectorAll('*')) {
                    if (el.closest('[class*="ringe"]')) continue;
                    const r = el.getBoundingClientRect();
                    if (!r.width || !r.height) continue;
                    if (r.left < sr.left - 1 || r.right > sr.right + 1) ueberlauf.push(`${el.tagName}.${String(el.className).slice(0, 30)} x ${r1(r.left)}–${r1(r.right)} / ${r1(sr.left)}–${r1(sr.right)}`);
                    // abgeschnittener Text in einer Zeile mit nowrap (nicht truncate/line-clamp)
                    const cs = getComputedStyle(el);
                    if (cs.whiteSpace === 'nowrap' && cs.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && el.children.length === 0) ueberlauf.push(`${el.tagName} Text breiter (${el.scrollWidth} > ${el.clientWidth}): ${el.textContent.slice(0, 30)}`);
                }
                if (aktiv.scrollHeight > aktiv.clientHeight + 1) ueberlauf.push(`Ansicht höher als der Bildschirm (${aktiv.scrollHeight} > ${aktiv.clientHeight})`);
            }
            return {
                innerHeight: window.innerHeight,
                scrollY: Math.round(window.scrollY),
                maxScrollY: Math.round(window.__maxScroll ?? -1),
                buehneTop: buehneBottom !== null && buehneHoehe !== null ? r1(buehneBottom - buehneHoehe) : null,
                buehneBottom: buehneBottom !== null ? r1(buehneBottom) : null,
                buehneHoehe: buehneHoehe !== null ? r1(buehneHoehe) : null,
                gridAreas: buehneEl ? getComputedStyle(buehneEl).gridTemplateAreas : null,
                telefon: tr ? { top: r1(tr.top), bottom: r1(tr.bottom), breite: r1(tr.width), hoehe: r1(tr.height), mitte: r1(tr.left + tr.width / 2) } : null,
                telefonAnsicht: aktiv ? aktiv.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) : null,
                telefonUeberlauf: ueberlauf.slice(0, 6),
                karteDa: !!karte,
                karteTop: kr ? r1(kr.top) : null,
                karteBottom: kr ? r1(kr.bottom) : null,
                karteHoehe: kr ? r1(kr.height) : null,
                karteBreite: kr ? r1(kr.width) : null,
                karteMitte: kr ? r1(kr.left + kr.width / 2) : null,
                karteScroll: karte ? { scrollH: karte.scrollHeight, clientH: karte.clientHeight } : null,
                // sichtbare Telefonhöhe über der Karte (ohne Karte: ganzes Telefon)
                telefonSichtbar: tr ? r1(Math.max(0, Math.min(kr ? kr.top : tr.bottom, tr.bottom) - tr.top)) : null,
                knopfTop: bs.length ? r1(Math.min(...bs.map((b) => b.top))) : null,
                knopfBottom: bs.length ? r1(Math.max(...bs.map((b) => b.bottom))) : null,
                knopfSichtbar: kn.length === ks.length && kn.every((k) => k.getClientRects().length > 0 && getComputedStyle(k).visibility !== 'hidden'),
                schritt: document.querySelector('[data-ki-demo-schritt]')?.textContent.trim() ?? null,
                status: status ? { sichtbar: status.getAttribute('data-sichtbar') === 'true', text: status.innerText.replace(/\s+/g, ' ').trim() } : null,
                kompakt: kompakt
                    ? { text: kompakt.innerText.replace(/\s+/g, ' ').trim(), hoehe: r1(kompakt.getBoundingClientRect().height), top: r1(kompakt.getBoundingClientRect().top) }
                    : null,
                h1ImDom: !!h1,
                h1Sichtbar: !!h1r && h1r.width > 2 && h1r.height > 2,
                telefonImDom: !!fig,
                konsoleSichtbar: !!document.querySelector('#ki-demo-url')?.getClientRects().length,
                scrollWidth: document.documentElement.scrollWidth,
                fokusImTelefon: !!fig && fig.contains(document.activeElement),
            };
        },
        [AKTION, TELEFON, knoepfe],
    );
}

/** Telefon und Karte in der Bühne (S1/S2/S4): Telefon oben bündig, ≤ 300 px, innerhalb; Karte unten bündig, Knopf im Bild */
function buehneOk(m, { karte = true } = {}) {
    const t = m.telefon;
    const tel = !!t && t.breite <= 300.5 && Math.abs(t.top - m.buehneTop) <= 1 && t.bottom <= m.buehneBottom + 0.5 && m.buehneBottom <= m.innerHeight;
    const k = karte ? m.karteDa && Math.abs(m.karteBottom - m.buehneBottom) <= 1 && m.karteTop >= m.buehneTop - 0.5 && (m.knopfBottom === null || (m.knopfSichtbar && m.knopfBottom <= m.innerHeight)) : !m.karteDa;
    return tel && k && m.scrollY === 0;
}
const lageText = (m) =>
    `Bühne ${m.buehneTop}–${m.buehneBottom} (${m.buehneHoehe}), Telefon ${m.telefon?.top}–${m.telefon?.bottom} b${m.telefon?.breite}, Karte ${m.karteDa ? `${m.karteTop}–${m.karteBottom} h${m.karteHoehe}` : 'keine'}, Knopf unten ${m.knopfBottom}, Fenster ${m.innerHeight}, scrollY ${m.scrollY}, Telefon sichtbar ${m.telefonSichtbar}`;

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

/** WCAG-Kontrast; Hintergrund = erster deckender Hintergrund in der Vorfahrenkette (Text mit Alpha darauf gemischt) */
async function kontrast(page, sel) {
    return page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const rgba = (farbe) => {
            const c = document.createElement('canvas');
            c.width = c.height = 1;
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = farbe;
            ctx.fillRect(0, 0, 1, 1);
            return Array.from(ctx.getImageData(0, 0, 1, 1).data);
        };
        let h = el;
        let bg = null;
        while (h) {
            const f = rgba(getComputedStyle(h).backgroundColor);
            if (f[3] > 250) {
                bg = f;
                break;
            }
            h = h.parentElement;
        }
        bg = bg ?? [255, 255, 255, 255];
        const vf = rgba(getComputedStyle(el).color);
        const a = vf[3] / 255;
        const v = [0, 1, 2].map((i) => Math.round(vf[i] * a + bg[i] * (1 - a)));
        const lum = ([r, g, b]) => {
            const k = (x) => {
                x /= 255;
                return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
        };
        const l1 = lum(v);
        const l2 = lum(bg);
        return { vorne: v, hinten: bg.slice(0, 3), verhaeltnis: Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100 };
    }, sel);
}

function initSkript(theme) {
    return `try { localStorage.setItem('theme', '${theme}'); } catch {}
        window.__maxScroll = 0;
        addEventListener('scroll', () => { window.__maxScroll = Math.max(window.__maxScroll, scrollY); }, { passive: true });
        window.__cls = [];
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls.push({ wert: e.value, zeit: Math.round(e.startTime), quellen: (e.sources || []).map((q) => (q.node?.nodeName ?? '?') + '.' + String(q.node?.className ?? '').slice(0, 50) + ' ' + Math.round(q.previousRect.top) + '→' + Math.round(q.currentRect.top) + ' h' + Math.round(q.previousRect.height) + '→' + Math.round(q.currentRect.height)) }); }).observe({ type: 'layout-shift', buffered: true });`;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const protokoll = { zeit: new Date().toISOString(), basis: BASE, phase: PHASE, mobil: [], desktop: {}, kontrast: {} };
const tabelle = [];

/** Ein mobiler Durchlauf: Firma (Laden, Treffer) → Vollscan (keine Karte) → Formular → Anruf (keine Karte) → Ende */
async function mobilLauf({ breite, hoehe, treffer, theme, fehler = false, shots = false }) {
    const name = `${breite}x${hoehe}-${treffer}t-${theme === 'dark' ? 'dunkel' : 'hell'}${fehler ? '-fehler' : ''}`;
    const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'de-CH' });
    await ctx.addInitScript(initSkript(theme));
    const page = await ctx.newPage();
    const konsole = [];
    page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
    page.on('pageerror', (e) => konsole.push('pageerror: ' + e.message));
    const z = await apiAbfangen(page, { treffer, fehler });
    await page.goto(SEITE, { waitUntil: 'networkidle' });
    // Ausgangslage: Seite ganz oben; ab hier darf der Ablauf nicht scrollen
    await page.evaluate(() => {
        window.scrollTo(0, 0);
        window.__maxScroll = 0;
    });
    const telEingabe = await messe(page);
    const lauf = { name, schritte: {} };
    const zeile = (schritt, m) => {
        lauf.schritte[schritt] = m;
        tabelle.push({ viewport: `${breite}×${hoehe}`, treffer, theme, ...m, schritt, schrittzeile: m.schritt });
    };
    const bild = async (n) => shots && (await page.screenshot({ path: path.join(SCREENS, `mobil-${name}-${n}.png`) }));
    await scanne(page);
    // 0 Firma lädt («Wir gleichen … ab»)
    await page.waitForSelector('[data-handelsregister="pruefen"]', { timeout: 5000 }).catch(() => undefined);
    await page.waitForTimeout(650);
    const m0 = await messe(page);
    if (PHASE !== 'vorher') zeile('Firma lädt', m0);
    await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
    await page.waitForTimeout(900);
    if (PHASE === 'vorher') {
        await bild('1-firma');
        await ctx.close();
        return;
    }
    // 1 Firma
    const m1 = await messe(page, ['#ki-demo-hr-bestaetigen', '#ki-demo-hr-andere']);
    const liste = await page.evaluate(() => {
        const l = document.querySelector('[data-hr-liste-scroll]');
        const fokus = document.activeElement;
        if (!l) return null;
        const eintraege = [...l.querySelectorAll('label[data-uid]')];
        return {
            scrollH: l.scrollHeight,
            clientH: l.clientHeight,
            overflowY: getComputedStyle(l).overflowY,
            eintraege: eintraege.length,
            eintragMaxH: Math.max(...eintraege.map((e) => Math.round(e.getBoundingClientRect().height))),
            schatten: l.getAttribute('data-ueberlauf'),
            fokusRadio: fokus?.getAttribute('type') === 'radio',
        };
    });
    zeile('Firma', m1);
    lauf.liste = liste;
    await bild('1-firma');
    check(
        `[${name}] K1: H1 im DOM, visuell aus; Konsole aus; Kompaktzeile 44 px mit Host und «Ändern»`,
        m1.h1ImDom && !m1.h1Sichtbar && !m1.konsoleSichtbar && m1.kompakt && Math.abs(m1.kompakt.hoehe - 44) < 1 && m1.kompakt.text.includes('beispiel-ag.ch') && m1.kompakt.text.includes('Ändern'),
        JSON.stringify({ h1: m1.h1Sichtbar, konsole: m1.konsoleSichtbar, kompakt: m1.kompakt }),
    );
    check(`[${name}] S1: Raster 'kompakt' 'buehne'; Bühnenhöhe = max(560, Fenster − Kopf) und Bühne ganz im Fenster`, /"kompakt"\s*"buehne"/.test(m1.gridAreas ?? '') && m1.buehneHoehe >= 559.5 && m1.buehneBottom <= m1.innerHeight, `${m1.gridAreas} · ${lageText(m1)}`);
    check(`[${name}] S2/S3: Telefon gerendert (≤ 300 px, oben bündig in der Bühne), Statuszeile mit n/8 ohne «Zum Telefon»`, m1.telefonImDom && m1.status?.sichtbar && !m1.status.text.includes('Zum Telefon') && /\d\/8/.test(m1.status.text) && buehneOk(m1), `${lageText(m1)} · ${JSON.stringify(m1.status)}`);
    check(`[${name}] S4.1 Firma: Karte unten bündig, «Ja, das ist meine Firma» und Link ganz im Bild, scrollY 0`, buehneOk(m1) && m1.knopfBottom <= m1.karteBottom, lageText(m1));
    check(`[${name}] S4.1 Firma: Kartenhöhe gleich beim Laden und mit ${treffer} Treffer(n) (± 1 px) — ${m0.karteHoehe} → ${m1.karteHoehe}`, m0.karteDa && Math.abs(m0.karteHoehe - m1.karteHoehe) <= 1 && Math.abs(m0.karteTop - m1.karteTop) <= 1, `${m0.karteTop}/${m0.karteHoehe} → ${m1.karteTop}/${m1.karteHoehe}`);
    if (treffer >= 4)
        check(`[${name}] S4.1: ${treffer} Treffer — nur die Liste scrollt intern (overflow auto), Schattenrand, Einträge ≤ 56 px`, liste && liste.eintraege === treffer && liste.scrollH > liste.clientH && liste.overflowY === 'auto' && liste.schatten === 'true' && liste.eintragMaxH <= 56, JSON.stringify(liste));
    else check(`[${name}] S4.1: ${treffer} Treffer ohne Scrollen in der Liste, kein Schattenrand, Eintrag ≤ 56 px`, liste && liste.scrollH <= liste.clientH + 1 && liste.schatten !== 'true' && liste.eintragMaxH <= 56, JSON.stringify(liste));
    check(`[${name}] S4.1: Karte selbst ohne internes Scrollen; Telefon (Scan-Ansicht, ${m1.telefon?.breite} px) ohne Überlauf`, m1.karteScroll.scrollH <= m1.karteScroll.clientH + 1 && m1.telefonUeberlauf.length === 0, `${JSON.stringify(m1.karteScroll)} · ${m1.telefonUeberlauf.join(' | ')}`);
    check(`[${name}] S7: Fokus auf dem ersten Firmen-Radio (nicht im Telefon)`, liste?.fokusRadio && !m1.fokusImTelefon, JSON.stringify(liste));
    // 2 Vollscan nach der Bestätigung: keine Karte, das Telefon zeigt die Scan-Schritte
    if (treffer > 1) await page.check('[data-hr-liste-scroll] input[type="radio"] >> nth=0');
    await page.click('#ki-demo-hr-bestaetigen');
    await page.waitForSelector(`${TELEFON} li:has-text("Website wird gelesen")`, { timeout: 5000 }).catch(() => undefined);
    await page.waitForTimeout(500);
    const mv1 = await messe(page);
    zeile('Vollscan (liest)', mv1);
    await bild('2-vollscan-liest');
    check(`[${name}] S3 Vollscan: keine Karte gerendert, Telefon zeigt die Scan-Schritte («Website wird gelesen …»), Statuszeile n/8`, !mv1.karteDa && /Website wird gelesen/.test(mv1.telefonAnsicht ?? '') && buehneOk(mv1, { karte: false }) && /\d\/8/.test(mv1.status?.text ?? ''), `${mv1.telefonAnsicht} · ${lageText(mv1)}`);
    await page.waitForSelector(`${TELEFON} li:has-text("Wissenseinträge")`, { timeout: 15000 }).catch(() => undefined);
    await page.waitForTimeout(150);
    const mv2 = await messe(page);
    zeile('Vollscan (Funde)', mv2);
    await bild('3-vollscan-funde');
    check(`[${name}] S3 Vollscan: Telefon füllt sich (Logo, Markenfarbe, Telefon, Öffnungszeiten, Wissen) ohne Karte, ohne Überlauf`, !mv2.karteDa && /Logo gefunden/.test(mv2.telefonAnsicht ?? '') && /Markenfarbe #1E3A5F/.test(mv2.telefonAnsicht ?? '') && /Wissenseinträge/.test(mv2.telefonAnsicht ?? '') && mv2.telefonUeberlauf.length === 0, `${mv2.telefonAnsicht} · Überlauf ${mv2.telefonUeberlauf.join(' | ')}`);
    // 3 Formular
    await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
    await page.waitForTimeout(800);
    const m2 = await messe(page, ['#ki-demo-anruf-knopf']);
    const ablaufVorKlick = await page.locator('ol[aria-label="Ablauf des Testanrufs"]').count();
    const formText = await page.locator(AKTION).innerText();
    const assistentImBild = await page.evaluate(([tel, sel]) => {
        const fig = document.querySelector(tel);
        const karte = document.querySelector(sel).getBoundingClientRect();
        const aktiv = [...fig.querySelectorAll('[aria-hidden="false"]')].find((a) => a.className.includes('ansicht'));
        const name = [...aktiv.querySelectorAll('p')].find((p) => p.textContent.trim() === 'Lena');
        const logo = aktiv.querySelector('img');
        return { name: name ? Math.round(name.getBoundingClientRect().bottom) : null, logo: logo ? Math.round(logo.getBoundingClientRect().bottom) : null, karteTop: Math.round(karte.top) };
    }, [TELEFON, AKTION]);
    zeile('Formular', m2);
    await bild('4-formular');
    check(
        `[${name}] S4.2 Formular: Karte unten bündig, Höhe = Inhalt ≤ Bühne, kein internes Scrollen, «Jetzt KI-Anruf erhalten» im Bild, «Lena ruft Sie an», Ablauf-Liste erst nach dem Klick; Telefon (Assistenten-Karte mit Sprach-Segment) ohne Überlauf`,
        m2.telefonUeberlauf.length === 0 &&
        buehneOk(m2) && m2.karteHoehe <= m2.buehneHoehe + 0.5 && m2.karteScroll.scrollH <= m2.karteScroll.clientH + 1 && ablaufVorKlick === 0 && formText.includes('Lena ruft Sie an'),
        `${lageText(m2)} · Karte scroll ${JSON.stringify(m2.karteScroll)} · Ablauf ${ablaufVorKlick} · Telefon-Überlauf ${m2.telefonUeberlauf.join(' | ')}`,
    );
    check(
        `[${name}] S4.2: über der Karte sichtbar ${m2.telefonSichtbar} px Telefon (Ziel ≥ 100 px bei 375×812), Logo der Assistenten-Karte ganz im Bild (Name: ${assistentImBild.name !== null && assistentImBild.name <= assistentImBild.karteTop ? 'sichtbar' : 'unter der Karte'})`,
        (breite !== 375 || m2.telefonSichtbar >= 100) && assistentImBild.logo !== null && assistentImBild.logo <= assistentImBild.karteTop,
        JSON.stringify(assistentImBild),
    );
    lauf.assistentImBild = assistentImBild;
    // 4 Anruf: keine Karte, das Telefon zeigt den Anruf
    await page.fill('#ki-demo-nummer', '79 123 45 67');
    await page.check('#ki-demo-einwilligung');
    await page.click('#ki-demo-anruf-knopf');
    await page.waitForTimeout(900);
    const m3 = await messe(page);
    zeile('Anruf wartend', m3);
    await bild('5-anruf-wartend');
    check(`[${name}] S3 Anruf (wartend): keine Karte, Telefon «Ihr Assistent wählt gleich …», Statuszeile «Testanruf», Fokus nicht im Telefon`, buehneOk(m3, { karte: false }) && /Ihr Assistent wählt gleich/.test(m3.telefonAnsicht ?? '') && m3.status?.sichtbar && m3.status.text.startsWith('Testanruf') && !m3.fokusImTelefon && m3.telefonUeberlauf.length === 0, `${m3.telefonAnsicht} · ${lageText(m3)} · ${m3.telefonUeberlauf.join(' | ')}`);
    await page.waitForSelector('button[data-zustand="waehlt"]:not([id])', { state: 'attached', timeout: 20000 });
    await page.waitForTimeout(700);
    const mw = await messe(page);
    zeile('Anruf wählt', mw);
    await bild('6-anruf-waehlt');
    check(`[${name}] S3 Anruf (wählt): keine Karte, Telefon «Anruf von ${ANRUF_VON}» in Firmenfarbe, ohne Überlauf`, buehneOk(mw, { karte: false }) && (mw.telefonAnsicht ?? '').includes(`Anruf von ${ANRUF_VON}`) && mw.telefonUeberlauf.length === 0, `${mw.telefonAnsicht} · ${mw.telefonUeberlauf.join(' | ')}`);
    if (!fehler) {
        await page.waitForSelector('button[data-zustand="verbunden"]:not([id])', { state: 'attached', timeout: 20000 });
        await page.waitForTimeout(1300);
        const mb = await messe(page);
        zeile('Verbunden', mb);
        await bild('7-verbunden');
        check(`[${name}] S3 Verbunden: keine Karte, Telefon mit Name und Dauer m:ss, Statuszeile «Verbunden – m:ss»`, buehneOk(mb, { karte: false }) && /Lena/.test(mb.telefonAnsicht ?? '') && /\d:\d\d/.test(mb.telefonAnsicht ?? '') && /^Verbunden – \d:\d\d/.test(mb.status?.text ?? '') && mb.telefonUeberlauf.length === 0, `${mb.telefonAnsicht} · ${mb.status?.text} · ${mb.telefonUeberlauf.join(' | ')}`);
    }
    // 5 Ende: Karte über dem Telefon
    await page.waitForSelector('[data-ki-demo-ende]', { timeout: 30000 });
    await page.waitForTimeout(800);
    const m4 = await messe(page, ['#ki-demo-nochmals-testen', `${AKTION} a[data-ki-demo-anfrage]`]);
    const ende = await page.locator(AKTION).innerText();
    zeile(fehler ? 'Anruf gescheitert' : 'Anruf beendet', m4);
    await bild(fehler ? '8-fehler' : '8-ende');
    const paar = await page.evaluate((sel) => {
        const n = document.querySelector('#ki-demo-nochmals-testen');
        const b = document.querySelector(`${sel} a[data-ki-demo-anfrage]`);
        return { gleicheZeile: Math.abs(n.getBoundingClientRect().top - b.getBoundingClientRect().top) < 1, href: b.getAttribute('href'), texte: [n.innerText.trim(), b.innerText.trim()] };
    }, AKTION);
    check(`[${name}] S4.3: Karte nach dem Anruf über dem Telefon (unten bündig, Höhe = Inhalt ohne internes Scrollen, Knöpfe im Bild); Telefon (Ende-Ansicht) ohne Überlauf`, buehneOk(m4) && m4.karteScroll.scrollH <= m4.karteScroll.clientH + 1 && m4.karteHoehe < m4.buehneHoehe && m4.telefonUeberlauf.length === 0, `${lageText(m4)} · ${JSON.stringify(m4.karteScroll)} · ${m4.telefonUeberlauf.join(' | ')}`);
    if (fehler) {
        check(
            `[${name}] S4.3 Fehler: «Der Anruf hat nicht geklappt», Grund-Text, «Nochmals versuchen» + «Angebot anfragen» nebeneinander im Bild`,
            ende.includes('Der Anruf hat nicht geklappt') && ende.includes('Versuchen Sie es gleich nochmals.') && paar.texte[0] === 'Nochmals versuchen' && paar.texte[1] === 'Angebot anfragen' && paar.gleicheZeile && m4.knopfBottom <= m4.innerHeight && m4.scrollY === 0,
            JSON.stringify({ paar, unten: m4.knopfBottom }),
        );
    } else {
        check(
            `[${name}] S4.3 Beendet: «Ihre Zusammenfassung», «Nochmals testen» + «Angebot anfragen» (#anfrage) nebeneinander, Schrittzeile «Testanruf beendet», Statuszeile «Testanruf beendet»`,
            ende.includes('Ihre Zusammenfassung') && paar.texte[0] === 'Nochmals testen' && paar.texte[1] === 'Angebot anfragen' && paar.href === '#anfrage' && paar.gleicheZeile && m4.schritt === 'Testanruf beendet' && m4.status?.text.startsWith('Testanruf beendet'),
            JSON.stringify({ paar, schritt: m4.schritt, status: m4.status }),
        );
        const mehr = await page.locator('#ki-demo-mehr').count();
        const zeilen = await page.evaluate(() => {
            const p = document.querySelector('[data-ki-demo-zusammenfassung]');
            return Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight));
        });
        check(`[${name}] S4.3: Zusammenfassung höchstens acht Zeilen, «Mehr anzeigen» vorhanden (${zeilen} Zeilen)`, zeilen <= 8 && mehr === 1, `Zeilen ${zeilen}, Mehr ${mehr}`);
        if (mehr) {
            await page.click('#ki-demo-mehr');
            await page.waitForTimeout(300);
            const mm = await messe(page);
            const offen = await page.evaluate(() => {
                const p = document.querySelector('[data-ki-demo-zusammenfassung]');
                return { voll: p.scrollHeight <= p.clientHeight + 1, zeilen: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)) };
            });
            zeile('Mehr anzeigen', mm);
            check(`[${name}] S4.3: «Mehr anzeigen» — Text vollständig, Karte höchstens Bühne (${mm.karteHoehe} ≤ ${mm.buehneHoehe}), unten bündig, Seite bleibt oben`, offen.voll && offen.zeilen > 8 && mm.karteHoehe <= mm.buehneHoehe + 0.5 && Math.abs(mm.karteBottom - mm.buehneBottom) <= 1 && mm.scrollY === 0, `${JSON.stringify(offen)} · ${lageText(mm)}`);
            await bild('9-mehr');
        }
    }
    const fin = await messe(page);
    const clsListe = await page.evaluate(() => window.__cls);
    const cls = Math.round(clsListe.reduce((a, b) => a + b.wert, 0) * 10000) / 10000;
    lauf.cls = { summe: cls, eintraege: clsListe };
    check(`[${name}] scrollY im ganzen Ablauf 0 (max ${fin.maxScrollY}), kein waagrechtes Scrollen, CLS ${cls}`, fin.maxScrollY === 0 && fin.scrollWidth <= breite && cls === 0, `maxScrollY ${fin.maxScrollY}, scrollWidth ${fin.scrollWidth}, CLS ${cls} ${JSON.stringify(clsListe).slice(0, 500)}`);
    check(`[${name}] keine Konsolenfehler, keine ungemockten Demo-Aufrufe, genau 1 Anruf`, konsole.length === 0 && z.fremd.length === 0 && z.anrufe === 1, `${konsole.slice(0, 3).join(' | ')} ${z.fremd.join(' ')} Anrufe ${z.anrufe}`);

    // «Nochmals testen» → zurück zur Eingabe (S5: Hero, Konsole und Telefon wie vor dem Scan).
    // Manager-Nacharbeit AUFTRAG-121: «Nochmals versuchen» nach einem gescheiterten Anruf → Formular derselben Firma.
    await page.click('#ki-demo-nochmals-testen');
    await page.waitForTimeout(600);
    const zurueck = await messe(page, fehler ? ['#ki-demo-anruf-knopf'] : []);
    if (fehler) {
        const formular = await page.evaluate(() => ({ knopf: !!document.querySelector('#ki-demo-anruf-knopf[data-zustand="bereit"]'), nummer: !!document.querySelector('#ki-demo-nummer') }));
        check(`[${name}] «Nochmals versuchen» → Formular derselben Firma über dem Telefon (Kompaktmodus bleibt, Seite bleibt oben)`, zurueck.kompakt && !zurueck.h1Sichtbar && formular.knopf && formular.nummer && zurueck.maxScrollY === 0 && buehneOk(zurueck), JSON.stringify({ ...formular, kompakt: zurueck.kompakt, maxScrollY: zurueck.maxScrollY, lage: lageText(zurueck) }));
    } else {
        check(
            `[${name}] S5: «Nochmals testen» → Eingabe mit Hero, Konsole und Telefon wie vor dem Scan (Breite ${telEingabe.telefon?.breite} → ${zurueck.telefon?.breite})`,
            zurueck.h1Sichtbar && zurueck.konsoleSichtbar && zurueck.telefonImDom && !zurueck.kompakt && zurueck.telefon?.breite === telEingabe.telefon?.breite,
            JSON.stringify({ h1: zurueck.h1Sichtbar, konsole: zurueck.konsoleSichtbar, tel: zurueck.telefon }),
        );
    }
    protokoll.mobil.push(lauf);
    await ctx.close();
}

/** Tablet 768×1024 (S4.5): Karte höchstens 30 rem breit und zentriert, Telefon zentriert ≤ 300 px */
async function tabletLauf() {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'de-CH' });
    await ctx.addInitScript(initSkript('light'));
    const page = await ctx.newPage();
    await apiAbfangen(page);
    await page.goto(SEITE, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await scanne(page);
    await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
    await page.waitForTimeout(900);
    const m = await messe(page, ['#ki-demo-hr-bestaetigen']);
    const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    tabelle.push({ viewport: '768×1024', treffer: 1, theme: 'light', ...m, schritt: 'Firma (Tablet)' });
    await page.screenshot({ path: path.join(SCREENS, 'tablet-768x1024-firma.png') });
    check(`Tablet 768×1024 (S4.5): Karte ≤ 30 rem (${m.karteBreite} ≤ ${30 * rem}) und zentriert, Telefon ≤ 300 px und zentriert, beide in der Bühne`, m.karteBreite <= 30 * rem + 0.5 && Math.abs(m.karteMitte - 384) <= 1 && Math.abs(m.telefon.mitte - 384) <= 1 && buehneOk(m), lageText(m));
    await ctx.close();
}

try {
    if (PHASE === 'prozent') {
        /*
         * [09.11.2026] Warum: AUFTRAG-122 (S4.1) — Beleg für den Anteil der Firmen-Karte an der Bühne: je Viewport mit
         * 1 Treffer die Liste bei 62/64/66/68 % messen (Variable --karte-firma an der Bühne überschrieben, sonst der Build).
         */
        for (const [b, h] of [
            [360, 740],
            [375, 812],
            [390, 844],
        ]) {
            const ctx = await browser.newContext({ viewport: { width: b, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'de-CH' });
            await ctx.addInitScript(initSkript('light'));
            const page = await ctx.newPage();
            await apiAbfangen(page);
            await page.goto(SEITE, { waitUntil: 'networkidle' });
            await scanne(page);
            await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
            await page.waitForTimeout(900);
            for (const anteil of [0.62, 0.64, 0.66, 0.68]) {
                const m = await page.evaluate((a) => {
                    const buehne = document.querySelector('[data-ki-demo-kompakt]').parentElement;
                    buehne.style.setProperty('--karte-firma', String(a));
                    const l = document.querySelector('[data-hr-liste-scroll]');
                    const k = document.querySelector('section[aria-labelledby="ki-demo-anruf-titel"]');
                    return { karte: Math.round(k.getBoundingClientRect().height * 10) / 10, listeSichtbar: l.clientHeight, listeInhalt: l.scrollHeight, passt: l.scrollHeight <= l.clientHeight };
                }, anteil);
                (protokoll.prozent ??= []).push({ viewport: `${b}×${h}`, anteil, ...m });
                console.log(`${b}×${h} ${Math.round(anteil * 100)} %: Karte ${m.karte} px, Liste ${m.listeSichtbar}/${m.listeInhalt} px → ${m.passt ? 'passt' : 'scrollt'}`);
            }
            await ctx.close();
        }
        const kleinster = [0.62, 0.64, 0.66, 0.68].find((a) => protokoll.prozent.filter((p) => p.anteil === a).every((p) => p.passt));
        check(`S4.1: kleinster Anteil (2-%-Schritte), bei dem 1 Treffer auf allen drei Viewports ohne Listen-Scroll passt: ${kleinster ? Math.round(kleinster * 100) + ' %' : 'keiner ≤ 68 %'} (CSS: 66 %)`, kleinster === 0.66, JSON.stringify(protokoll.prozent));
    } else if (PHASE === 'k8') {
        const erwartet = ANRUF_VON;
        const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1, locale: 'de-CH' });
        await ctx.addInitScript(initSkript('light'));
        const page = await ctx.newPage();
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
        /* ---------------- Mobil (S1–S5, S7) ---------------- */
        const viewports = [
            [360, 740],
            [375, 812],
            [390, 844],
        ];
        if (PHASE === 'vorher') {
            await mobilLauf({ breite: 375, hoehe: 812, treffer: 1, theme: 'light', shots: true });
            await mobilLauf({ breite: 360, hoehe: 740, treffer: 5, theme: 'light', shots: true });
        } else {
            // NUR=360x740 (Fehlersuche): nur dieser Viewport, hell
            const nur = process.env.NUR;
            for (const [b, h] of viewports)
                for (const treffer of [1, 5])
                    for (const theme of nur ? ['light'] : ['light', 'dark'])
                        if (!nur || nur === `${b}x${h}`) await mobilLauf({ breite: b, hoehe: h, treffer, theme, shots: (b === 375 && treffer === 1) || (b === 360 && treffer === 5 && theme === 'light') || (b === 390 && treffer === 1 && theme === 'light') });
            await mobilLauf({ breite: 360, hoehe: 740, treffer: 1, theme: 'light', fehler: true, shots: true });
            await tabletLauf();

            /* Kontraste der Texte in der Karte, mobil dunkel und hell (AUFTRAG-122: keine neuen Texte; Karte jetzt über dem Telefon) */
            for (const theme of ['dark', 'light']) {
                const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'de-CH' });
                await ctx.addInitScript(initSkript(theme));
                const page = await ctx.newPage();
                await apiAbfangen(page, { treffer: 5 });
                await page.goto(SEITE, { waitUntil: 'networkidle' });
                await scanne(page);
                await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
                await page.waitForTimeout(800);
                const k = {};
                for (const [n, s] of [
                    ['Kompaktzeile Host', '[data-ki-demo-kompakt] [data-host]'],
                    ['Kompaktzeile «Ändern»', '#ki-demo-aendern'],
                    ['Schrittzeile', '[data-ki-demo-schritt]'],
                    ['Treffer-Zeile Sitz · UID · Status', 'label[data-uid] [data-hr-meta]'],
                    ['Statuszeile Fortschritt', '[data-ki-demo-fortschritt]'],
                ])
                    k[n] = await kontrast(page, s);
                await page.check('[data-hr-liste-scroll] input[type="radio"] >> nth=0');
                await page.click('#ki-demo-hr-bestaetigen');
                await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
                await page.waitForTimeout(600);
                k['Formular «Der Anruf kommt von …»'] = await kontrast(page, '#ki-demo-nummer-hinweis');
                await page.fill('#ki-demo-nummer', '79 123 45 67');
                await page.check('#ki-demo-einwilligung');
                await page.click('#ki-demo-anruf-knopf');
                await page.waitForSelector('[data-ki-demo-ende]', { timeout: 30000 });
                await page.waitForTimeout(500);
                k['«Ihre Zusammenfassung»'] = await kontrast(page, '#ki-demo-anruf-titel');
                k['Zusammenfassung'] = await kontrast(page, '[data-ki-demo-zusammenfassung]');
                k['«Mehr anzeigen»'] = await kontrast(page, '#ki-demo-mehr');
                k['«Nochmals testen»'] = await kontrast(page, '#ki-demo-nochmals-testen');
                k['«Angebot anfragen»'] = await kontrast(page, `${AKTION} a[data-ki-demo-anfrage]`);
                protokoll.kontrast[theme] = k;
                const dunkel = await page.evaluate(() => document.documentElement.classList.contains('dark'));
                const schlecht = Object.entries(k).filter(([, v]) => !v || v.verhaeltnis < 4.5);
                check(
                    `Kontrast mobil ${theme === 'dark' ? 'dunkel (Dark Mode aktiv)' : 'hell'}: Texte der Karte über dem Telefon ≥ 4.5:1`,
                    schlecht.length === 0 && (theme !== 'dark' || dunkel),
                    Object.entries(k)
                        .map(([n, v]) => `${n} ${v?.verhaeltnis}`)
                        .join(' · '),
                );
                await ctx.close();
            }
        }

        /* ---------------- Desktop 1366×900 (S6) ---------------- */
        {
            const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1, locale: 'de-CH', reducedMotion: 'reduce' });
            await ctx.addInitScript(initSkript('light'));
            const page = await ctx.newPage();
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
            const d1 = await messe(page, ['#ki-demo-hr-bestaetigen']);
            const sticky1 = await page.evaluate(() => {
                const t = document.querySelector('figure').parentElement;
                return { position: getComputedStyle(t).position, top: getComputedStyle(t).top, mitlaufen: t.getAttribute('data-mitlaufen'), area: getComputedStyle(t).gridArea, links: Math.round(t.getBoundingClientRect().left) };
            });
            const schrittSichtbar = await page.locator('[data-ki-demo-schritt]').evaluateAll((l) => l.some((e) => e.getClientRects().length > 0));
            const statusDisplay = await page.evaluate(() => getComputedStyle(document.querySelector('button[data-zustand]:not([id])')).display);
            bilder.push(await shot('desktop-2-nach-scan.png'));
            await page.click('#ki-demo-hr-bestaetigen');
            await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
            await page.mouse.move(0, 0);
            await page.waitForTimeout(1500);
            const d2 = await messe(page, ['#ki-demo-anruf-knopf']);
            bilder.push(await shot('desktop-3-formular.png'));
            await page.evaluate(() => {
                const b = document.querySelector('figure').parentElement.parentElement.getBoundingClientRect();
                window.scrollTo(0, Math.max(0, b.bottom + window.scrollY - window.innerHeight + 40));
            });
            await page.waitForTimeout(800);
            bilder.push(await shot('desktop-4-buehne-ende.png'));
            protokoll.desktop = { d1, d2, sticky1, statusDisplay, schrittSichtbar };
            if (PHASE === 'nachher') {
                check('S6 Desktop: keine Kompaktzeile, H1 und Konsole sichtbar, Telefon gerendert, keine Schrittzeile', !d1.kompakt && d1.h1Sichtbar && d1.konsoleSichtbar && d1.telefonImDom && !schrittSichtbar, JSON.stringify({ kompakt: d1.kompakt, h1: d1.h1Sichtbar, konsole: d1.konsoleSichtbar, tel: d1.telefonImDom, schrittSichtbar }));
                check('S6 Desktop: Telefon rechts sticky wie heute (top 112 px, data-mitlaufen), Raster unverändert', sticky1.position === 'sticky' && sticky1.top === '112px' && sticky1.mitlaufen === 'true' && sticky1.links > 700 && /"intro telefon"\s*"konsole telefon"\s*"aktion telefon"/.test(d1.gridAreas ?? ''), JSON.stringify({ ...sticky1, areas: d1.gridAreas }));
                check('S6 Desktop: Statuszeile display none, kein Sprung beim Scan (scrollY 0)', statusDisplay === 'none' && d1.scrollY === 0, `${statusDisplay}, scrollY ${d1.scrollY}`);
                for (const b of bilder) {
                    const vorher = path.join(SCREENS_BASIS, 'vorher', path.basename(b));
                    if (!existsSync(vorher)) {
                        check(`S6 Desktop: ${path.basename(b)} deckungsgleich mit «vorher»`, false, 'kein Vorher-Bild');
                        continue;
                    }
                    const diff = await pixelDiff(page, vorher, b);
                    protokoll.desktop[`diff_${path.basename(b)}`] = diff;
                    check(`S6 Desktop: ${path.basename(b)} deckungsgleich mit «vorher» (0 abweichende Pixel)`, diff.gleicheGroesse && diff.abweichend === 0, JSON.stringify(diff));
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
        '| Viewport | Treffer | Theme | Schritt | Bühne oben–unten (Höhe) | Telefon oben–unten (Breite) | Karte oben–unten (Höhe) | Knopf unten | Fenster | Telefon sichtbar über Karte | scrollY |',
        '|---|---|---|---|---|---|---|---|---|---|---|',
    ];
    for (const t of tabelle)
        md.push(
            `| ${t.viewport} | ${t.treffer} | ${t.theme === 'dark' ? 'dunkel' : 'hell'} | ${t.schritt} | ${t.buehneTop}–${t.buehneBottom} (${t.buehneHoehe}) | ${t.telefon ? `${t.telefon.top}–${t.telefon.bottom} (${t.telefon.breite})` : '–'} | ${t.karteDa ? `${t.karteTop}–${t.karteBottom} (${t.karteHoehe})` : 'keine'} | ${t.knopfBottom ?? '–'} | ${t.innerHeight} | ${t.telefonSichtbar} | ${t.scrollY} |`,
        );
    writeFileSync(path.join(SCREENS, 'messtabelle.md'), md.join('\n') + '\n');
}
const fehl = ergebnisse.filter((e) => !e.ok).length;
console.log(`\n${PHASE}: ${ergebnisse.length - fehl}/${ergebnisse.length} bestanden`);
process.exit(PHASE !== 'vorher' && fehl ? 1 : 0);
