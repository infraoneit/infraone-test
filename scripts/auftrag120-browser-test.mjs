#!/usr/bin/env node
/**
 * auftrag120-browser-test.mjs (AUFTRAG-120) — KI-Demo auf dem Handy: Aktionskarte vor dem Telefon,
 * Schrittführung, Scroll-Führung; Desktop unverändert.
 *
 * [08.11.2026] Warum: Belege für AUFTRAG-120 (Z1–Z6). Gegen einen EIGENEN Server (Vorgabe
 * http://localhost:3011, nie :3000), Produktionsbuild (`npx next start -p 3011`).
 * ALLE Aufrufe unter /api/demo/** sind gemockt (fiktive Beispiel AG): kein echter Scan, keine
 * Handelsregister-Abfrage, kein Anruf, kein Kontakt zu pbx01 oder infraone.ch.
 *
 *   PHASE=vorher  → nur messen und Screenshots (Stand 8c2192e), Prüfungen informativ
 *   PHASE=nachher → messen, Screenshots, Prüfungen; Desktop-Screenshots pixelgenau gegen «vorher»
 *
 *   $env:BASE_URL='http://localhost:3011'; $env:PHASE='nachher'; node scripts/auftrag120-browser-test.mjs
 *
 * [09.11.2026] Warum: AUFTRAG-121 Kompaktmodus, kein Scrollen mobil — die mobilen Prüfungen auf Sprünge (Z3), den
 * Statuszeilen-Hinweis «Bitte Firma bestätigen» (Z4) und die Mindesthöhe (Nacharbeit 2) sind auf das neue Verhalten
 * umgestellt (Karte immer im Bild, scrollY 0, Telefon mobil nicht gerendert). Desktop-Teil unverändert.
 *
 * [09.11.2026] Warum: AUFTRAG-122 Telefon als Bühne, Karte darüber — mobil ist das Telefon wieder gerendert, aber als
 * Bühne unter der Kompaktzeile (Raster 'kompakt' 'buehne'); die Karte liegt unten bündig darüber und fehlt während des
 * Anrufs (das Telefon zeigt den Stand). Weiterhin: keine Sprünge (scrollY 0), Statuszeile wie A-121, CLS 0.
 *
 * [09.11.2026] Warum: AUFTRAG-123 ruhige Bühne — mobile Prüfungen auf Z1–Z7 umgestellt (kein Blatt während der Prüfung,
 * keine Schrittzeile, Telefon skaliert über dem Blatt, Kurzblatt → Formular, antippbare Treffer, Statuszeile nur ausserhalb
 * der Bühne). Desktop-Teil unverändert.
 */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'http://localhost:3011';
if (/:3000\b/.test(BASE)) {
    console.error('Port 3000 gehört dem Inhaber (Testlink) — bitte den eigenen Server auf :3011 verwenden.');
    process.exit(2);
}
const PHASE = process.env.PHASE === 'vorher' ? 'vorher' : 'nachher';
const CHROME = process.env.PLAYWRIGHT_CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SEITE = `${BASE}/ki-telefonassistent`;

function ergebnisOrdner() {
    let d = ROOT;
    for (let i = 0; i < 8; i++) {
        if (existsSync(path.join(d, 'auftraege', 'ergebnisse'))) return path.join(d, 'auftraege', 'ergebnisse');
        d = path.dirname(d);
    }
    return path.join(ROOT, 'auftraege-ergebnisse');
}
const SCREENS_BASIS = process.env.SCREENS_DIR || path.join(ergebnisOrdner(), 'A120-screens');
const SCREENS = path.join(SCREENS_BASIS, PHASE);
mkdirSync(SCREENS, { recursive: true });

const ergebnisse = [];
function check(name, ok, detail = '') {
    ergebnisse.push({ name, ok: !!ok, detail: String(detail).slice(0, 600) });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`);
}

/* ------------------------------------------------------------------ */
/* Attrappe (alle /api/demo/** gemockt)                                */
/* ------------------------------------------------------------------ */

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect x="4" y="12" width="36" height="36" rx="8" fill="#E8A13D"/><text x="50" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1E3A5F">Beispiel AG</text></svg>`;
const SCAN_ID = 's-a120attrappe0001'; // Format wie SCAN_ID_RE (lib/demo/scans.ts)
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
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));

async function apiAbfangen(page, { treffer = 1 } = {}) {
    const z = { start: 0, anrufe: 0, fremd: [] };
    // alles Unbekannte unter /api/demo/** gesperrt (zuerst registriert = zuletzt geprüft)
    await page.route('**/api/demo/**', (r) => {
        z.fremd.push(r.request().url());
        return r.fulfill({ status: 418, contentType: 'application/json', body: '{"fehler":"A120-Test: gesperrt"}' });
    });
    await page.route('**/api/demo/bild/**', (r) => r.fulfill({ status: 200, contentType: 'image/svg+xml', body: LOGO_SVG }));
    await page.route('**/api/demo/scan', async (r) => {
        const body = JSON.parse(r.request().postData() || '{}');
        if (!body.scan_id) {
            await warte(500);
            return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ scan_id: SCAN_ID, stufe: 'vorpruefung', host: 'beispiel-ag.ch' }) });
        }
        await warte(600);
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
        // AUFTRAG-120, Nacharbeit 2: die erste Antwort kommt nach 1,5 s, damit der Ladezustand («Wir gleichen … ab») messbar ist
        await warte(body.bestaetige ? 400 : 1500);
        const liste = Array.from({ length: treffer }, (_, i) => (i ? { ...TREFFER, uid: `CHE00000000${i + 1}`, uid_formatiert: `CHE-000.000.00${i + 1}`, name: `Beispiel ${i + 1} AG` } : TREFFER));
        const basis = { scan_id: SCAN_ID, modus: 'streng', quelle: treffer > 1 ? 'name' : 'uid', treffer: liste, versuche_rest: 3 };
        if (body.bestaetige) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...basis, ergebnis: 'bestaetigt', bestaetigt: BESTAETIGT, gueltig_bis: Date.now() + 3600e3 }) });
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...basis, ergebnis: 'treffer', bestaetigt: null }) });
    });
    await page.route('**/api/demo/profil', async (r) => {
        await warte(700);
        await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profil: PROFIL, funde: { telefon: '044 000 00 00', oeffnungszeiten: 'Mo–Fr 07:30–17:00', wissen: 12 } }) });
    });
    await page.route('**/api/demo/anruf', async (r) => {
        z.anrufe++;
        z.start = Date.now();
        await r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'd-20261108-attrappea120' }) });
    });
    await page.route('**/api/demo/auftraege/**', async (r) => {
        const t = Date.now() - z.start;
        const status = t > 9000 ? 'beendet' : t > 6000 ? 'verbunden' : t > 3000 ? 'waehlt' : 'wartend';
        await r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'd-20261108-attrappea120', status, zeit: new Date().toISOString(), dauer_s: status === 'beendet' ? 19 : null, zusammenfassung: status === 'beendet' ? 'Testgespräch (Attrappe im Browser).' : null }),
        });
    });
    return z;
}

/* ------------------------------------------------------------------ */
/* Messhilfen                                                          */
/* ------------------------------------------------------------------ */

const AKTION = 'section[aria-labelledby="ki-demo-anruf-titel"]';
async function lage(page) {
    return page.evaluate((sel) => {
        const runde = (n) => Math.round(n * 10) / 10;
        const karte = document.querySelector(sel);
        // AUFTRAG-121: genau das Telefon-Mockup (mobil ab dem Scan nicht gerendert → null)
        const tel = document.querySelector('figure[aria-label^="Vorschau"]')?.parentElement;
        const zeile = document.querySelector('[data-ki-demo-schritt]');
        // Statuszeile (A-100); «vorher» ohne data-ziel, ohne id (die Primär-Knöpfe tragen ids)
        const status = document.querySelector('button[data-ziel]') ?? document.querySelector('button[data-zustand]:not([id])');
        const kr = karte?.getBoundingClientRect();
        const tr = tel?.getBoundingClientRect();
        return {
            scrollY: Math.round(window.scrollY),
            karteTop: kr ? runde(kr.top) : null,
            karteHoehe: kr ? runde(kr.height) : null,
            // AUFTRAG-122: Unterkante der Karte, Lage und Breite des Telefons (Bühne)
            karteBottom: kr ? runde(kr.bottom) : null,
            telefonBottom: tr ? runde(tr.bottom) : null,
            telefonBreite: tel ? runde(tel.querySelector('figure').getBoundingClientRect().width) : null,
            karteDocTop: kr ? runde(kr.top + window.scrollY) : null,
            telefonTop: tr ? runde(tr.top) : null,
            telefonDocTop: tr ? runde(tr.top + window.scrollY) : null,
            telefonLeft: tr ? runde(tr.left) : null,
            karteLeft: kr ? runde(kr.left) : null,
            schrittzeile: zeile ? { text: zeile.textContent.trim(), sichtbar: getComputedStyle(zeile).display !== 'none' && zeile.getBoundingClientRect().height > 0 } : null,
            statuszeile: status
                ? {
                      sichtbar: status.getAttribute('data-sichtbar') === 'true' && getComputedStyle(status).display !== 'none',
                      text: status.innerText.replace(/\s+/g, ' ').trim(),
                      ziel: status.getAttribute('data-ziel'),
                  }
                : null,
            // [09.11.2026] Warum: AUFTRAG-123 — das Telefon selbst (mit Transform): Lage, Skala, ausgeblendet
            figur: (() => {
                const f = tel?.querySelector('figure');
                if (!f) return null;
                const r = f.getBoundingClientRect();
                const cs = getComputedStyle(f);
                return { top: runde(r.top), bottom: runde(r.bottom), skala: Math.round((r.height / f.offsetHeight) * 1000) / 1000, aus: cs.opacity === '0' || cs.visibility === 'hidden' };
            })(),
            gridTelefon: tel ? getComputedStyle(tel).gridArea : null,
            gridAktion: karte?.parentElement ? getComputedStyle(karte.parentElement).gridArea : null,
            // AUFTRAG-121: Bühne über die Karte (mobil gibt es ab dem Scan kein Telefon)
            gridAreas: (tel?.parentElement ?? karte?.parentElement?.parentElement) ? getComputedStyle(tel?.parentElement ?? karte.parentElement.parentElement).gridTemplateAreas : null,
        };
    }, AKTION);
}

async function scanne(page) {
    await page.fill('#ki-demo-url', 'beispiel-ag.ch');
    await page.click('#ki-demo-scan-knopf');
}

/** Pixelvergleich zweier PNG im Browser (keine neue Abhängigkeit) */
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
            const box = [Infinity, Infinity, -1, -1];
            for (let i = 0; i < pa.length; i += 4) {
                const d = Math.max(Math.abs(pa[i] - pb[i]), Math.abs(pa[i + 1] - pb[i + 1]), Math.abs(pa[i + 2] - pb[i + 2]), Math.abs(pa[i + 3] - pb[i + 3]));
                if (!d) continue;
                n++;
                maxDelta = Math.max(maxDelta, d);
                const x = (i / 4) % ia.width;
                const y = Math.floor(i / 4 / ia.width);
                box[0] = Math.min(box[0], x);
                box[1] = Math.min(box[1], y);
                box[2] = Math.max(box[2], x);
                box[3] = Math.max(box[3], y);
            }
            return { gleicheGroesse: true, groesse: [ia.width, ia.height], abweichend: n, maxDelta, bereich: n ? box : null };
        },
        [da, db],
    );
}

/** WCAG-Kontrast (Farben über Canvas nach sRGB, auch oklch/lab aus Tailwind v4) */
async function kontrast(page, selVorne, selHinten) {
    return page.evaluate(
        ([v, h]) => {
            const rgb = (farbe) => {
                const c = document.createElement('canvas');
                c.width = c.height = 1;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 1, 1);
                ctx.fillStyle = farbe;
                ctx.fillRect(0, 0, 1, 1);
                return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
            };
            const lum = ([r, g, b]) => {
                const k = (x) => {
                    x /= 255;
                    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
                };
                return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
            };
            const fv = getComputedStyle(document.querySelector(v)).color;
            const fh = getComputedStyle(document.querySelector(h)).backgroundColor;
            const a = lum(rgb(fv));
            const b = lum(rgb(fh));
            return { vorne: fv, hinten: fh, rgbVorne: rgb(fv), rgbHinten: rgb(fh), verhaeltnis: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100 };
        },
        [selVorne, selHinten],
    );
}

const TEXT = {
    s1: 'Schritt 1 von 2 · Firma bestätigen',
    s2: 'Schritt 2 von 2 · Nummer eingeben, Testanruf starten',
    // [09.11.2026] Warum: AUFTRAG-121 Kompaktmodus, kein Scrollen mobil — mobil gibt es kein Telefon mehr unter der Karte
    laeuft: 'Testanruf läuft',
    beendet: 'Testanruf beendet',
    firma: 'Bitte Firma bestätigen',
    nummer: 'Nummer eingeben für den Testanruf',
};

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const protokoll = { zeit: new Date().toISOString(), basis: BASE, phase: PHASE, mobil: {}, desktop: {}, dunkel: {} };
const nachher = PHASE === 'nachher';
try {
    /* ---------------- Mobil 375×812 (hell) ---------------- */
    // [09.11.2026] Warum: AUFTRAG-121 Kompaktmodus, kein Scrollen mobil — die Sprünge (Z3), der Statuszeilen-Hinweis
    // «Bitte Firma bestätigen» (Z4) und die gemessene Mindesthöhe (Nacharbeit 2) sind abgelöst.
    // [09.11.2026] Warum: AUFTRAG-123 ruhige Bühne — mobil auf Z1–Z7 umgestellt: während der Prüfung kein sichtbares Blatt;
    // danach EIN Blatt unten in der Bühne (Höhe = Inhalt, keine Schrittzeile), das Telefon skaliert sich darüber (nie
    // angeschnitten); «bereit» erst als Kurzblatt, Antippen klappt das Formular aus; Statuszeile nur, wenn die Bühne nicht
    // im Bild ist; scrollY 0 und CLS 0 im ganzen Ablauf. Der Desktop-Teil unten ist unverändert.
    {
        const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'de-CH' });
        await ctx.addInitScript(() => {
            try {
                localStorage.setItem('theme', 'light');
            } catch {}
            // AUFTRAG-120, Nacharbeit 2: Layout-Verschiebungen ohne vorherige Eingabe (CLS)
            window.__cls = [];
            new PerformanceObserver((l) => {
                for (const e of l.getEntries()) if (!e.hadRecentInput)
                        window.__cls.push({
                            wert: e.value,
                            zeit: Math.round(e.startTime),
                            quellen: (e.sources || []).map((q) => `${q.node?.nodeName ?? '?'}.${String(q.node?.className ?? '').slice(0, 40)} ${Math.round(q.previousRect.top)}→${Math.round(q.currentRect.top)} h${Math.round(q.previousRect.height)}→${Math.round(q.currentRect.height)}`),
                        });
            }).observe({ type: 'layout-shift', buffered: true });
            // AUFTRAG-121: grösster scrollY im ganzen Ablauf
            window.__maxScroll = 0;
            addEventListener('scroll', () => (window.__maxScroll = Math.max(window.__maxScroll, scrollY)), { passive: true });
        });
        const page = await ctx.newPage();
        const konsole = [];
        page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
        page.on('pageerror', (e) => konsole.push('pageerror: ' + e.message));
        const z = await apiAbfangen(page);
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        await scanne(page);
        // Ladezustand: Vorprüfung (0,5 s) ist da, Registerantwort (1,5 s) noch nicht
        await page.waitForSelector('[data-handelsregister="pruefen"]', { state: 'attached', timeout: 5000 });
        await page.waitForTimeout(1000);
        const laden = await lage(page);
        laden.handelsregister = await page.getAttribute('[data-handelsregister]', 'data-handelsregister');
        protokoll.mobil.laden = laden;
        await page.screenshot({ path: path.join(SCREENS, 'mobil-0-laden.png') });
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.waitForTimeout(1200);
        const nachScan = await lage(page);
        protokoll.mobil.nachScan = nachScan;
        if (nachher) {
            check('A-123 mobil (Z4.1): während der Prüfung kein sichtbares Blatt, das Telefon steht ganz im Bild (Skala 1)', laden.handelsregister === 'pruefen' && (laden.karteTop === null || laden.karteHoehe === 0) && laden.figur && Math.abs(laden.figur.skala - 1) < 0.005 && laden.figur.bottom <= 812, JSON.stringify({ hr: laden.handelsregister, karte: laden.karteTop, figur: laden.figur }));
        }
        await page.screenshot({ path: path.join(SCREENS, 'mobil-1-nach-scan-oben.png') });
        if (nachher) {
            check('A-123 mobil: nach dem Scan steht das Firmen-Blatt ganz im Bild ohne Sprung (scrollY 0, Unterkante ≤ 812 px)', nachScan.scrollY === 0 && nachScan.karteTop >= 112 && nachScan.karteBottom <= 812, `Blatt ${nachScan.karteTop}–${nachScan.karteBottom}, scrollY ${nachScan.scrollY}`);
            check(`A-123 mobil (Z3): keine Schrittzeile («${TEXT.s1}» entfällt im Kompaktmodus)`, nachScan.schrittzeile === null, JSON.stringify(nachScan.schrittzeile));
            check(
                'A-123 mobil (Z2): Telefon gerendert (Grundbreite ≤ 300 px), über dem Blatt nie angeschnitten (Unterkante ≤ Blatt − 8) oder ausgeblendet',
                nachScan.figur && nachScan.telefonBreite <= 300 && (nachScan.figur.aus || nachScan.figur.bottom <= nachScan.karteTop - 8),
                `Telefon ${JSON.stringify(nachScan.figur)}, Blatt ${nachScan.karteTop}`,
            );
            check('A-122 mobil: Raster im Kompaktmodus kompakt / buehne (vor dem Scan intro / konsole / aktion / telefon)', /"kompakt"\s*"buehne"/.test(nachScan.gridAreas ?? ''), nachScan.gridAreas);
            check('A-123 mobil (Z1.1): Statuszeile unsichtbar, solange die Bühne im Bild ist', !nachScan.statuszeile?.sichtbar, JSON.stringify(nachScan.statuszeile));
        }
        await page.locator(AKTION).screenshot({ path: path.join(SCREENS, 'mobil-2-aktionskarte-firma.png') });

        // Z5: Firma bestätigen → Vollscan (kein Blatt) → Kurzblatt → Formular
        const vorBest = await lage(page);
        await page.click('#ki-demo-hr-bestaetigen');
        await page.waitForSelector('#ki-demo-bereit-knopf', { state: 'visible', timeout: 30000 });
        await page.waitForTimeout(800);
        const kurz = await lage(page);
        await page.locator(AKTION).screenshot({ path: path.join(SCREENS, 'mobil-3a-kurzblatt.png') });
        await page.click('#ki-demo-bereit-knopf');
        await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
        await page.waitForTimeout(800);
        const formular = await lage(page);
        protokoll.mobil.z5 = { vorBest, kurz, formular };
        if (nachher) {
            // AUFTRAG-123: das Blatt hängt unten in der Bühne (Unterkante fest), das Telefon skaliert ab seiner Oberkante (fest)
            check(
                'Z5 mobil (A-123): Firma → Kurzblatt → Formular: Blatt-Unterkante und Telefon-Oberkante bleiben stehen',
                Math.abs(kurz.karteBottom - vorBest.karteBottom) < 1 && Math.abs(formular.karteBottom - vorBest.karteBottom) < 1 && Math.abs(kurz.figur.top - vorBest.figur.top) < 1 && Math.abs(formular.figur.top - vorBest.figur.top) < 1,
                `Blatt unten ${vorBest.karteBottom} · ${kurz.karteBottom} · ${formular.karteBottom}; Telefon oben ${vorBest.figur.top} · ${kurz.figur.top} · ${formular.figur.top}`,
            );
            check(`A-123 mobil (Z3): keine Schrittzeile («${TEXT.s2}» entfällt)`, kurz.schrittzeile === null && formular.schrittzeile === null, JSON.stringify([kurz.schrittzeile, formular.schrittzeile]));
            const knopf = await page.evaluate(() => Math.round(document.querySelector('#ki-demo-anruf-knopf').getBoundingClientRect().bottom));
            check('A-121 mobil: Formular — Anruf-Knopf ganz im Bild, scrollY 0', knopf <= 812 && formular.scrollY === 0, `Knopf unten ${knopf}, scrollY ${formular.scrollY}`);
        }
        await page.locator(AKTION).screenshot({ path: path.join(SCREENS, 'mobil-3-aktionskarte-formular.png') });

        // Anruf (gemockt) — A-121: kein Sprung zum Telefon mehr; A-122/123: während des Anrufs kein Blatt, das Telefon zeigt den Stand
        await page.fill('#ki-demo-nummer', '79 123 45 67');
        await page.check('#ki-demo-einwilligung');
        await page.click('#ki-demo-anruf-knopf');
        await page.waitForTimeout(1500);
        const anruf = await lage(page);
        protokoll.mobil.anruf = anruf;
        await page.screenshot({ path: path.join(SCREENS, 'mobil-5-telefon-nach-anruf-klick.png') });
        if (nachher) {
            const telText = await page.evaluate(() => [...document.querySelectorAll('figure [aria-hidden="false"]')].map((a) => a.innerText).join(' ').replace(/\s+/g, ' '));
            check(
                'A-122 mobil: nach dem Anruf-Knopf kein Sprung (scrollY 0), kein Blatt, das Telefon zeigt den Anruf (Skala 1)',
                anruf.scrollY === 0 && anruf.karteTop === null && anruf.figur && Math.abs(anruf.figur.skala - 1) < 0.005 && /Ihr Assistent wählt gleich|Anruf von/.test(telText),
                `Karte ${anruf.karteTop}, scrollY ${anruf.scrollY}, Telefon «${telText.slice(0, 80)}» ${JSON.stringify(anruf.figur)}`,
            );
            check('Z2 mobil (A-122): während des Anrufs kein Blatt und damit keine Schrittzeile', anruf.schrittzeile === null, JSON.stringify(anruf.schrittzeile));
            check('A-123 mobil (Z1.1): Statuszeile während des Anrufs unsichtbar (das Telefon ist im Bild)', !anruf.statuszeile?.sichtbar, JSON.stringify(anruf.statuszeile));
        }
        await page.waitForSelector(nachher ? '[data-ki-demo-ende]' : '#ki-demo-anruf-knopf[data-zustand="beendet"]', { timeout: 30000 });
        await page.waitForTimeout(600);
        const ende = await lage(page);
        protokoll.mobil.ende = ende;
        if (nachher) check(`A-123 mobil (Z3/Z7): Ende ohne Schrittzeile («${TEXT.beendet}» entfällt), Blatt im Bild`, ende.schrittzeile === null && ende.karteBottom <= 812, JSON.stringify(ende.schrittzeile));
        await page.locator(AKTION).screenshot({ path: path.join(SCREENS, 'mobil-6-telefon-beendet.png') });
        const cls = await page.evaluate(() => window.__cls);
        protokoll.mobil.cls = cls;
        if (nachher) {
            const summe = Math.round(cls.reduce((a, e) => a + e.wert, 0) * 10000) / 10000;
            check(`Nacharbeit 2 mobil: CLS im ganzen Ablauf ${summe}`, summe === 0, JSON.stringify(cls).slice(0, 1500));
            const maxScroll = await page.evaluate(() => window.__maxScroll);
            check('A-121 mobil: scrollY im ganzen Ablauf 0', maxScroll === 0, `max ${maxScroll}`);
            check('Mobil: keine Konsolenfehler, keine ungemockten Demo-Aufrufe, genau 1 (gemockter) Anruf', konsole.length === 0 && z.fremd.length === 0 && z.anrufe === 1, `${konsole.slice(0, 3).join(' | ')} ${z.fremd.join(' ')} Anrufe ${z.anrufe}`);
            const breit = await page.evaluate(() => document.documentElement.scrollWidth);
            check('Mobil: kein waagrechtes Scrollen', breit <= 375, `scrollWidth ${breit}`);
        }
        await ctx.close();
    }

    /* ---------------- Mobil dunkel + reduzierte Bewegung ---------------- */
    // [09.11.2026] Warum: AUFTRAG-123 — mobil gibt es keine Schrittzeile mehr; geprüft wird die Hilfszeile des Blatts (T2) und
    // dass Telefon und Blatt bei reduzierter Bewegung ohne Übergang erscheinen.
    {
        const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'de-CH', reducedMotion: 'reduce' });
        await ctx.addInitScript(() => {
            try {
                localStorage.setItem('theme', 'dark');
            } catch {}
        });
        const page = await ctx.newPage();
        await apiAbfangen(page);
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        const dunkel = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        await scanne(page);
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.waitForTimeout(500);
        const l = await lage(page);
        protokoll.dunkel.lage = l;
        await page.screenshot({ path: path.join(SCREENS, 'mobil-dunkel-nach-scan.png') });
        if (nachher) {
            const k = await kontrast(page, `${AKTION} [data-blatt-hilfe]`, AKTION);
            protokoll.dunkel.kontrast = k;
            check('Dark Mode mobil (A-123): Hilfszeile des Firmen-Blatts lesbar (Kontrast ≥ 4.5:1 gegen bg-card)', dunkel && k.verhaeltnis >= 4.5, JSON.stringify(k));
            const ruhig = await page.evaluate((sel) => ({ telefon: getComputedStyle(document.querySelector('figure[aria-label^="Vorschau"]')).transitionDuration, blatt: getComputedStyle(document.querySelector(sel)).animationName }), AKTION);
            check('Reduzierte Bewegung (A-123): Blatt ohne Sprung im Bild (scrollY 0), Telefon ohne Übergang, Blatt ohne Einblend-Animation', l.scrollY === 0 && l.karteBottom <= 812 && /^0s(, 0s)*$/.test(ruhig.telefon) && ruhig.blatt === 'none', `Blatt ${l.karteTop}–${l.karteBottom}, scrollY ${l.scrollY}, ${JSON.stringify(ruhig)}`);
            await page.evaluate(() => document.documentElement.classList.remove('dark'));
            const kh = await kontrast(page, `${AKTION} [data-blatt-hilfe]`, AKTION);
            protokoll.dunkel.kontrastHell = kh;
            check('Hell mobil (A-123): Hilfszeile Kontrast ≥ 4.5:1', kh.verhaeltnis >= 4.5, JSON.stringify(kh));
        }
        await ctx.close();
    }

    /* ---------------- Mobil: fünf Treffer (A-123: antippbare Zeilen, nur die Liste scrollt) ---------------- */
    if (nachher) {
        const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'de-CH' });
        await ctx.addInitScript(() => {
            try {
                localStorage.setItem('theme', 'light');
            } catch {}
        });
        const page = await ctx.newPage();
        await apiAbfangen(page, { treffer: 5 });
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        await scanne(page);
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.waitForTimeout(800);
        const l = await lage(page);
        const k = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            const liste = el.querySelector('[data-hr-liste-scroll]');
            const link = document.querySelector('#ki-demo-hr-andere');
            return {
                zeilen: el.querySelectorAll('button[data-hr-zeile]').length,
                ja: !!el.querySelector('#ki-demo-hr-bestaetigen'),
                listeScrollH: liste?.scrollHeight,
                listeClientH: liste?.clientHeight,
                listeOverflow: liste ? getComputedStyle(liste).overflowY : null,
                blattScroll: el.scrollHeight > el.clientHeight + 1,
                linkUnten: link ? Math.round(link.getBoundingClientRect().bottom) : null,
                karteUnten: Math.round(el.getBoundingClientRect().bottom),
                scrollY: Math.round(scrollY),
            };
        }, AKTION);
        protokoll.mobil.fuenfTreffer = { blatt: l.karteHoehe, ...k };
        check('A-123 mobil: fünf Treffer — fünf antippbare Zeilen ohne «Ja»-Knopf, das Blatt scrollt nicht selbst (höchstens die Liste), Link und Blatt im Bild', k.zeilen === 5 && !k.ja && !k.blattScroll && k.listeOverflow === 'auto' && k.linkUnten <= 812 && k.karteUnten <= 812 && k.scrollY === 0, `Blatt ${l.karteHoehe} px; ${JSON.stringify(k)}`);
        await page.screenshot({ path: path.join(SCREENS, 'mobil-7-fuenf-treffer.png') });
        await ctx.close();
    }

    /* ---------------- Desktop 1366×900 (hell, ruhig für Pixelvergleich) ---------------- */
    {
        const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1, locale: 'de-CH', reducedMotion: 'reduce' });
        await ctx.addInitScript(() => {
            try {
                localStorage.setItem('theme', 'light');
            } catch {}
        });
        const page = await ctx.newPage();
        const z = await apiAbfangen(page);
        await page.goto(SEITE, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        const shot = async (name, opts = {}) => {
            const p = path.join(SCREENS, name);
            await page.screenshot({ path: p, animations: 'disabled', caret: 'hide', ...opts });
            return p;
        };
        const bilder = [];
        bilder.push(await shot('desktop-1-start.png'));
        await scanne(page);
        await page.waitForSelector('[data-handelsregister="treffer"]', { timeout: 15000 });
        await page.mouse.move(0, 0);
        await page.waitForTimeout(1500);
        const d1 = await lage(page);
        protokoll.desktop.nachScan = d1;
        bilder.push(await shot('desktop-2-nach-scan.png'));
        await page.click('#ki-demo-hr-bestaetigen');
        await page.waitForSelector('#ki-demo-nummer', { state: 'visible', timeout: 30000 });
        await page.mouse.move(0, 0);
        await page.waitForTimeout(1500);
        const d2 = await lage(page);
        protokoll.desktop.formular = d2;
        bilder.push(await shot('desktop-3-formular.png'));
        // Ende der Bühne (Karte unten, Telefon mitlaufend) — Fensterbild statt Elementbild: ein Elementbild über die
        // Fensterhöhe vergrössert das Fenster kurz (100svh-abhängige Grössen, Hintergrund) und ist nicht vergleichbar
        await page.evaluate(() => {
            const b = document.querySelector('figure').parentElement.parentElement.getBoundingClientRect();
            window.scrollTo(0, Math.max(0, b.bottom + window.scrollY - window.innerHeight + 40));
        });
        await page.waitForTimeout(800);
        protokoll.desktop.ende = await lage(page);
        bilder.push(await shot('desktop-4-buehne-ende.png'));
        if (nachher) {
            check('Z6 Desktop: kein Sprung beim Scan (scrollY 0)', d1.scrollY === 0, `scrollY ${d1.scrollY}`);
            check('Z6 Desktop: Grid-Flächen unverändert (Telefon rechts, Karte links)', /"intro telefon"\s*"konsole telefon"\s*"aktion telefon"/.test(d1.gridAreas ?? '') && d1.telefonLeft > d1.karteLeft, `${d1.gridAreas} · Telefon left ${d1.telefonLeft} > Karte left ${d1.karteLeft}`);
            check('Z6 Desktop: keine Schrittzeile sichtbar, keine Statuszeile', (!d1.schrittzeile || !d1.schrittzeile.sichtbar) && (!d2.schrittzeile || !d2.schrittzeile.sichtbar) && !d1.statuszeile?.sichtbar, JSON.stringify([d1.schrittzeile, d2.schrittzeile, d1.statuszeile?.sichtbar]));
            for (const b of bilder) {
                const vorher = path.join(SCREENS_BASIS, 'vorher', path.basename(b));
                if (!existsSync(vorher)) {
                    check(`Z6 Desktop: ${path.basename(b)} deckungsgleich mit «vorher»`, false, 'kein Vorher-Bild');
                    continue;
                }
                const diff = await pixelDiff(page, vorher, b);
                protokoll.desktop[`diff_${path.basename(b)}`] = diff;
                check(`Z6 Desktop: ${path.basename(b)} deckungsgleich mit «vorher» (0 abweichende Pixel)`, diff.gleicheGroesse && diff.abweichend === 0, JSON.stringify(diff));
            }
            check('Desktop: keine ungemockten Demo-Aufrufe', z.fremd.length === 0, z.fremd.join(' '));
        }
        await ctx.close();
    }
} finally {
    await browser.close();
}

protokoll.ergebnisse = ergebnisse;
writeFileSync(path.join(SCREENS, 'browser-test.json'), JSON.stringify(protokoll, null, 2));
const fehl = ergebnisse.filter((e) => !e.ok).length;
console.log(`\n${PHASE}: ${ergebnisse.length - fehl}/${ergebnisse.length} bestanden`);
process.exit(nachher && fehl ? 1 : 0);
