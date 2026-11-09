#!/usr/bin/env node
/**
 * auftrag100-browser-test.mjs — Browser-Test AUFTRAG-100
 *
 * Teil M (Mega-Menü):
 *   M0  Server-HTML ohne JavaScript: alle Menü-Links im <header> (crawlbar),
 *       24 Regionsseiten, jede Zielseite 200, jeder Anker vorhanden, Texte
 *       ohne Zahlen/Superlative/ß/Dachmarke.
 *   M1  Desktop 1440 hell/dunkel: Hover öffnet je Panel, Verlassen schliesst,
 *       aria-expanded, keine Layout-Verschiebung (Seite steht), Screenshots.
 *   M2  Tastatur: Tab zum Auslöser, Enter öffnet, Tab in das Panel, Escape
 *       schliesst mit Fokus zurück, Pfeil runter öffnet auf den ersten Link,
 *       Tab aus dem Panel schliesst (keine Fokusfalle), Leertaste schaltet.
 *   M3  1024 px: Leiste ohne Überlappung, Panels passen ins Fenster.
 *   M4  prefers-reduced-motion: Panel ohne Verschiebung, kurze Überblendung.
 *   M5  Touch-Desktop (1180, Touch): Antippen öffnet, nochmals schliesst.
 *   M6  Klick auf einen Branchen-Link: Ziel-Abschnitt unter dem Header.
 *   M7  Mobil 375 hell/dunkel: Akkordeon im Overlay, Touchziele ≥ 44 px,
 *       Regionen aufklappbar, Escape schliesst, Link schliesst das Overlay.
 *
 * Teil T (Telefon scrollt mit) — Scan-, Profil- und Anruf-API werden im
 * Browser abgefangen (fiktive «Beispiel AG»): kein Scan fremder Seiten,
 * kein Auftrag beim Server, kein Anruf.
 *   T1  Desktop 1440 hell: eingabe → nicht sticky; Scan → sticky; gescrollt
 *       während Scan und während Anruf: getBoundingClientRect des Telefons
 *       (top = 112 px, ganz im Fenster); Ende der Bühne als Grenze (nie im
 *       Footer); CLS 0 im ganzen Ablauf.
 *   T2  Desktop dunkel, 1280×720 (Telefon passt ganz ins Fenster).
 *   T3  Mobil 375 hell/dunkel: kein automatischer Sprung, Statuszeile oben
 *       (48 px) mit Schritt und Fund, Antippen springt zum Telefon, im Anruf
 *       Stand und Dauer, CLS 0; reduzierte Bewegung ohne Verschiebung.
 *
 *   node scripts/auftrag100-browser-test.mjs            (alles)
 *   node scripts/auftrag100-browser-test.mjs --menue    (nur Teil M)
 *   node scripts/auftrag100-browser-test.mjs --telefon  (nur Teil T)
 *
 * Screenshots: ../auftraege/ergebnisse/A100-screens/ (oder SCREENS_ORDNER)
 *
 * ANPASSUNG AUFTRAG-113 (Menü-Kompromiss): Das Mega-Menü ist durch schlichte Dropdowns ersetzt
 * (Leistungen ▾ · KI-Telefonassistent ▾ · IT-Support · Cloud-Telefonie ▾ · Unternehmen ▾). Was nicht
 * mehr gilt und warum:
 * - «Für wen» (Branchen-Ankerlinks und 24 Regionen im Header) entfällt laut Inhaber. M0 prüft deshalb
 *   umgekehrt, dass KEINE Regionsseite mehr im Header steht; die Branchen-Prüfung «jede Branche verlinkt
 *   einen passenden Abschnitt» entfällt mangels Branchen im Menü (die Regionen prüft auftrag113 E).
 * - M6 «Klick auf einen Branchen-Link» → jetzt Klick auf «Peoplefone vPBX» (einziger Anker-Link im Menü).
 * - M7 «Regionen aufklappbar» und «Branchen-Link» → jetzt Gruppe «Cloud-Telefonie» und ein Link der KI-Gruppe.
 * - M4: die Wellenform gibt es nur noch in der mobilen KI-Karte (kein Mega-Panel mit Karte mehr).
 * - Panels: Dropdowns liegen direkt unter ihrem Knopf (oben 60–100 px statt «ab Header-Unterkante»).
 * - M0: Zielseiten mit gefolgter Weiterleitung (Footer-Link /telefonie → /cloud-telefonie; im Header seit dem Nachtrag keiner mehr).
 * - Vorgabe-Server jetzt :3005 (Port 3000 gehört dem Inhaber); `@/`-Importe über registerHooks.
 * Teil T (Telefon scrollt mit) ist unverändert und gehört nicht zum Menü.
 *
 * ANPASSUNG AUFTRAG-120 ([08.11.2026] Warum: AUFTRAG-120 führt den Sprung zur Aktionskarte bewusst ein):
 * - T3 mobil: Beim Scan-Start springt die Seite zur Aktionskarte (Oberkante 100–250 px) statt stehen zu bleiben;
 *   die Karte steht mobil vor dem Telefon, beim Formular zeigt der Pfeil deshalb nach unten; nach dem Anruf-Knopf
 *   springt die Seite zum Telefon (Statuszeile dann weg, beim Zurückscrollen zur Karte wieder da).
 * - T1 Desktop: weiterhin kein Sprung (scrollY nach dem Scan-Start 0).
 * - Attrappe auf den Ablauf seit AUFTRAG-111/112 nachgeführt (Vorprüfung, Handelsregister-Bestätigung, Vollscan,
 *   Scan-Kennung im Format s-…, Logo über /api/demo/bild/<scan_id>/0); alle übrigen /api/demo/** gesperrt.
 *   Scan-Schritte jetzt 8 (Handelsregister, A-111).
 *
 * ANPASSUNG AUFTRAG-121 ([09.11.2026] Warum: AUFTRAG-121 Kompaktmodus, kein Scrollen mobil):
 * - T3 mobil: Beim Scan-Start klappt der Hero zu, die Aktionskarte steht ohne Sprung ganz im Bild, das Telefon-Mockup ist
 *   mobil nicht gerendert. Die Statuszeile steht ab dem Scan immer, zeigt rechts den Fortschritt statt «Zum Telefon» und
 *   springt nicht mehr (Antippen ändert scrollY nicht); der Anruf-Knopf springt nicht mehr zum Telefon.
 *
 * ANPASSUNG AUFTRAG-122 ([09.11.2026] Warum: AUFTRAG-122 Telefon als Bühne, Karte darüber):
 * - T3 mobil: Das Telefon ist mobil wieder gerendert, aber als Bühne unter der Kompaktzeile (ganz im Bild, ≤ 300 px), die
 *   Karte liegt unten darüber; während des Anrufs gibt es keine Karte (und damit keinen Anruf-Knopf) — der Anrufstand wird an
 *   der Statuszeile (data-zustand) abgewartet. Keine Sprünge, Statuszeile wie A-121.
 *
 * ANPASSUNG AUFTRAG-123 ([09.11.2026] Warum: AUFTRAG-123 ruhige Bühne):
 * - T3 mobil: Die Statuszeile erscheint nur noch, wenn die Bühne (das Telefon) nicht im Bild ist — der Test scrollt während
 *   des Vollscans das Telefon aus dem Bild (Statuszeile mit Schritt und Fund) und wieder zurück (weg). «bereit» ist erst
 *   ein Kurzblatt («Lena ist bereit» / «Lena soll mich anrufen»), Antippen klappt das Formular aus. Das Blatt liegt unten
 *   in der Bühne, das Telefon darüber nie angeschnitten. Desktop-Teile (T1/T2, Menü) unverändert.
 */
import { chromium } from 'playwright-core';
import { registerHooks } from 'node:module';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// AUFTRAG-113: navigation.ts importiert über `@/…` (seit AUFTRAG-110) — Auflösung wie in den übrigen Skripten
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
const BASE = process.env.BASE_URL || 'http://localhost:3005';
if (/:3000\b/.test(BASE)) {
    console.error('Port 3000 gehört dem Inhaber (Testlink) — bitte den eigenen Server auf :3005 verwenden.');
    process.exit(2);
}
const CHROME = process.env.PLAYWRIGHT_CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SCREENS = path.resolve(ROOT, '..', 'auftraege', 'ergebnisse', process.env.SCREENS_ORDNER || 'A100-screens');
const args = process.argv.slice(2);
const nurMenue = args.includes('--menue');
const nurTelefon = args.includes('--telefon');
mkdirSync(SCREENS, { recursive: true });

// Menüdaten direkt aus der Quelle (Node ≥ 22.18: Type-Stripping)
const nav = await import(pathToFileURL(path.join(ROOT, 'src/components/layout/navigation.ts')).href);

/* ------------------------------------------------------------------ */
/* Prüfprotokoll                                                       */
/* ------------------------------------------------------------------ */
const ergebnisse = [];
function check(name, ok, detail = '') {
    ergebnisse.push({ name, ok: !!ok, detail: String(detail) });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== '' ? ' — ' + String(detail).slice(0, 300) : ''}`);
}
const shot = (page, name, opt = {}) => page.screenshot({ path: path.join(SCREENS, name), ...opt });
const warte = (page, ms) => page.waitForTimeout(ms);

async function neueSeite(browser, { breite, hoehe, theme = 'light', mobil = false, touch = mobil, ruhig = false, skala = null }) {
    const ctx = await browser.newContext({
        viewport: { width: breite, height: hoehe },
        deviceScaleFactor: skala ?? (mobil ? 2 : 1),
        isMobile: mobil,
        hasTouch: touch,
        reducedMotion: ruhig ? 'reduce' : 'no-preference',
        locale: 'de-CH',
    });
    await ctx.addInitScript((t) => {
        try {
            localStorage.setItem('theme', t);
        } catch {
            /* egal */
        }
        // Layout-Verschiebungen messen (CLS; Verschiebungen direkt nach Klick/Taste zählen nicht)
        window.__cls = 0;
        window.__clsQuellen = [];
        try {
            new PerformanceObserver((l) => {
                for (const e of l.getEntries()) {
                    if (e.hadRecentInput) continue;
                    window.__cls += e.value;
                    const q = (e.sources || []).map((s) => {
                        const n = s.node;
                        return `${n ? `${n.nodeName}.${String(n.className || '').slice(0, 40)}` : '?'} ${Math.round(s.previousRect.y)}→${Math.round(s.currentRect.y)}`;
                    });
                    window.__clsQuellen.push(`${e.value.toFixed(4)} @${Math.round(e.startTime)}ms: ${q.join(' | ')}`);
                }
            }).observe({ type: 'layout-shift', buffered: true });
        } catch {
            /* ältere Browser */
        }
    }, theme);
    const page = await ctx.newPage();
    const konsole = [];
    page.on('console', (m) => {
        if (m.type() === 'error') konsole.push(m.text());
    });
    page.on('pageerror', (e) => konsole.push('pageerror: ' + e.message));
    return { ctx, page, konsole };
}

const cls = async (page) => ({ wert: await page.evaluate(() => window.__cls), quellen: await page.evaluate(() => window.__clsQuellen) });

/* ------------------------------------------------------------------ */
/* Erwartete Links aus der Quelle                                      */
/* ------------------------------------------------------------------ */
function regionenAusContent() {
    const gruppen = { itSupport: 'it-support-regions', cloudTelefonie: 'cloud-telefonie-regions', webdesign: 'webdesign-regions' };
    const basis = { itSupport: '/it-support', cloudTelefonie: '/cloud-telefonie', webdesign: '/webdesign' };
    const liste = [];
    for (const [k, ordner] of Object.entries(gruppen)) {
        for (const f of readdirSync(path.join(ROOT, 'content', 'leistungen', ordner)).filter((x) => x.endsWith('.json'))) {
            const j = JSON.parse(readFileSync(path.join(ROOT, 'content', 'leistungen', ordner, f), 'utf8'));
            liste.push({ href: `${basis[k]}/${f.replace(/\.json$/, '')}`, name: j.name });
        }
    }
    return liste;
}
const REGIONEN = regionenAusContent();
// AUFTRAG-113: alle Adressen des neuen Headers aus der Quelle (statt LEISTUNGEN/BRANCHEN/DIREKTLINKS des Mega-Menüs)
const MENUE_LINKS = [...nav.headerLinks(), { titel: nav.KI_KARTE.titel, href: nav.KI_KARTE.href, text: nav.KI_KARTE.text }];

/* ------------------------------------------------------------------ */
/* Teil M: Menü (seit AUFTRAG-113 schlichte Dropdowns)                 */
/* ------------------------------------------------------------------ */
async function teilM0() {
    const html = await (await fetch(`${BASE}/`)).text();
    const kopf = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
    const hrefs = new Set([...kopf.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')));
    const fehlend = MENUE_LINKS.map((l) => l.href).filter((h) => !hrefs.has(h));
    check('M0 Server-HTML: alle Menü-Links im <header> (ohne JavaScript, crawlbar)', fehlend.length === 0, fehlend.length ? `fehlend: ${fehlend.join(', ')}` : `${new Set(MENUE_LINKS.map((l) => l.href)).size} Menü-Adressen`);
    // AUFTRAG-113: «Für wen» mit 24 Regionen entfällt → umgekehrt prüfen
    check('M0 keine der 24 Regionsseiten mehr im <header> (AUFTRAG-113)', REGIONEN.length === 24 && !REGIONEN.some((r) => hrefs.has(r.href)), REGIONEN.filter((r) => hrefs.has(r.href)).map((r) => r.href).join(', ') || `${REGIONEN.length} Regionen geprüft`);
    check('M0 Dropdowns im Server-HTML (Leistungen, KI, Cloud-Telefonie, Unternehmen, Mobil), kein «Für wen»', ['nav-panel-leistungen', 'nav-panel-ki', 'nav-panel-cloud', 'nav-panel-unternehmen', 'nav-mobil'].every((id) => kopf.includes(`id="${id}"`)) && !kopf.includes('fuer-wen'));

    // Jede Zielseite antwortet 200 (AUFTRAG-113: Weiterleitungen gefolgt, /telefonie → /cloud-telefonie), jeder Anker existiert
    const ziele = [...new Set(MENUE_LINKS.map((l) => l.href))];
    const status = [];
    const anker = [];
    const seitenCache = new Map();
    for (const z of ziele) {
        const pfad = z.split('#')[0];
        if (!seitenCache.has(pfad)) {
            const r = await fetch(`${BASE}${pfad}`, { redirect: 'follow' });
            seitenCache.set(pfad, { status: r.status, html: r.status === 200 ? await r.text() : '' });
        }
        const s = seitenCache.get(pfad);
        if (s.status !== 200) status.push(`${pfad} ${s.status}`);
        if (z.includes('#') && !s.html.includes(`id="${z.split('#')[1]}"`)) anker.push(z);
    }
    check(`M0 alle ${seitenCache.size} Zielseiten antworten 200 (nur bestehende Seiten, Weiterleitungen gefolgt)`, status.length === 0, status.join(', '));
    check('M0 Anker der Menü-Links existieren (#peoplefone)', anker.length === 0, anker.join(', ') || [...new Set(MENUE_LINKS.filter((l) => l.href.includes('#')).map((l) => l.href))].join(', '));
    // AUFTRAG-113: Prüfung «jede Branche verlinkt einen passenden Abschnitt» entfällt — keine Branchen mehr im Menü

    // Texte: kurz, ohne Zahlen (Produktnamen 3CX und Microsoft 365 ausgenommen), ohne Superlative, ß, Dachmarke
    const texte = [...MENUE_LINKS.flatMap((l) => [l.titel, l.text ?? '']), nav.KI_KARTE.aktion, ...nav.LEISTUNGEN.map((g) => g.titel), ...nav.KI_MENUE.map((g) => g.titel), ...nav.LEISTE.map((x) => x.titel)].filter(Boolean);
    const mitZahl = texte.filter((t) => /\d/.test(t.replace(/\b3CX\b/g, '').replace(/Microsoft 365/g, '')));
    const superlativ = texte.filter((t) => /\b(beste[nrs]?|bester|führend\w*|top|nr\.?\s*1|einzig\w*|unschlagbar|garantiert|perfekt\w*|revolution\w*|weltklasse|marktführer\w*|schnellste\w*|günstigste\w*)\b/i.test(t));
    check('M0 Menütexte ohne Zahlen (ausser Produktnamen 3CX, Microsoft 365)', mitZahl.length === 0, mitZahl.join(' | '));
    check('M0 Menütexte ohne Superlative', superlativ.length === 0, superlativ.join(' | '));
    check('M0 Menütexte kurz (Beschreibung ≤ 45 Zeichen)', MENUE_LINKS.every((l) => !l.text || l.text.length <= 45), MENUE_LINKS.filter((l) => l.text && l.text.length > 45).map((l) => l.text).join(' | '));
    check('M0 kein ß, keine Dachmarke Elektro-Tel im Header', !/ß/.test(kopf) && !/Elektro-Tel/i.test(kopf));
    check('M0 «Neu» nur beim KI-Telefonassistenten', MENUE_LINKS.filter((l) => l.badge).map((l) => `${l.titel}:${l.badge}`).join() === 'KI-Telefonassistent:Neu');
    // AUFTRAG-113: IT-Support bleibt Direktlink, Cloud-Telefonie ist Link-Knopf mit Dropdown (wie live)
    check('M0 Direktlink IT-Support, Leistenknopf Cloud-Telefonie als Link, CTA «Kostenloses Erstgespräch»', /href="\/it-support"[^>]*>IT-Support</.test(kopf) && /<a[^>]*id="nav-link-cloud"[^>]*href="\/cloud-telefonie"|<a[^>]*href="\/cloud-telefonie"[^>]*id="nav-link-cloud"/.test(kopf) && kopf.includes('>Kostenloses Erstgespräch<'));
}

/** Zustand eines Panels im Browser */
async function panelZustand(page, id) {
    return page.evaluate((id) => {
        const k = document.getElementById(`nav-knopf-${id}`);
        const p = document.getElementById(`nav-panel-${id}`);
        const s = getComputedStyle(p);
        const r = p.getBoundingClientRect();
        return { expanded: k.getAttribute('aria-expanded'), sichtbar: s.visibility === 'visible' && Number(s.opacity) > 0.98, top: Math.round(r.top), bottom: Math.round(r.bottom), transform: s.transform, dauer: s.transitionDuration };
    }, id);
}
const seitenLage = (page) => page.evaluate(() => ({ main: Math.round(document.querySelector('main').getBoundingClientRect().top * 10) / 10, scrollY: window.scrollY, breite: document.documentElement.scrollWidth }));

async function teilM1(browser, theme) {
    const name = `menue-desktop-1440-${theme === 'dark' ? 'dunkel' : 'hell'}`;
    const { ctx, page, konsole } = await neueSeite(browser, { breite: 1440, hoehe: 900, theme });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await shot(page, `${name}-0-zu.png`);
    const vorher = await seitenLage(page);
    // AUFTRAG-113: vier schlichte Dropdowns statt Leistungen/Für wen/Unternehmen
    for (const id of ['leistungen', 'ki', 'cloud', 'unternehmen']) {
        await page.mouse.move(700, 500);
        await page.hover(`#nav-knopf-${id}`);
        await warte(page, 450);
        const z = await panelZustand(page, id);
        const lage = await seitenLage(page);
        check(`${name}: Hover öffnet «${id}» (aria-expanded, sichtbar)`, z.expanded === 'true' && z.sichtbar, JSON.stringify(z));
        check(`${name}: «${id}» ohne Layoutsprung (Seite steht)`, lage.main === vorher.main && lage.scrollY === vorher.scrollY && lage.breite === vorher.breite, `${JSON.stringify(vorher)} → ${JSON.stringify(lage)}`);
        // AUFTRAG-113: Dropdown direkt unter dem Knopf (überlappt die Header-Unterkante um 12 px)
        check(`${name}: «${id}» unter dem Knopf (top ${z.top} px), im Fenster`, z.top >= 60 && z.top <= 100 && z.bottom <= 900, `${z.top}–${z.bottom}`);
        await shot(page, `${name}-${id}.png`);
        // in das Dropdown fahren: bleibt offen
        const mitte = await page.evaluate((id) => {
            const r = document.querySelector(`#nav-panel-${id} > div`).getBoundingClientRect();
            return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(60, r.height / 2)) };
        }, id);
        await page.mouse.move(mitte.x, mitte.y, { steps: 6 });
        await warte(page, 300);
        check(`${name}: «${id}» bleibt offen beim Weg ins Dropdown`, (await panelZustand(page, id)).expanded === 'true');
        await page.mouse.move(720, 880, { steps: 4 });
        await warte(page, 500);
        const nachUnten = await panelZustand(page, id);
        check(`${name}: Verlassen schliesst «${id}»`, nachUnten.expanded === 'false' && !nachUnten.sichtbar, JSON.stringify(nachUnten));
    }
    // Wechsel zwischen den Auslösern ohne Flackern: direkt das andere Dropdown
    await page.hover('#nav-knopf-leistungen');
    await warte(page, 400);
    await page.hover('#nav-knopf-ki');
    await warte(page, 60);
    const wechsel = [await panelZustand(page, 'leistungen'), await panelZustand(page, 'ki')];
    check(`${name}: Wechsel Leistungen → KI-Telefonassistent sofort`, wechsel[0].expanded === 'false' && wechsel[1].expanded === 'true', wechsel.map((w) => w.expanded).join('/'));
    await page.mouse.move(720, 880);
    await warte(page, 500);
    // Klick ausserhalb schliesst
    await page.click('#nav-knopf-unternehmen');
    await warte(page, 250);
    const klickAuf = await panelZustand(page, 'unternehmen');
    await page.mouse.click(300, 700);
    await warte(page, 300);
    check(`${name}: Klick öffnet, Klick daneben schliesst`, klickAuf.expanded === 'true' && (await panelZustand(page, 'unternehmen')).expanded === 'false');
    const c = await cls(page);
    // Quellen im Header/Menü zählen streng (0); der Slider der Startseite (Punkte) verschiebt sich selbst minimal
    const ausMenue = c.quellen.filter((q) => /nav|header|panel|schleier/i.test(q));
    check(`${name}: CLS beim Menü ${c.wert.toFixed(4)} (keine Verschiebung aus Header/Menü)`, ausMenue.length === 0 && c.wert < 0.001, c.quellen.join(" | "));
    check(`${name}: keine Konsolenfehler`, konsole.length === 0, konsole.slice(0, 3).join(' | '));
    await ctx.close();
}

async function teilM2(browser) {
    const name = 'menue-tastatur';
    const { ctx, page, konsole } = await neueSeite(browser, { breite: 1440, hoehe: 900 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const aktiv = () => page.evaluate(() => ({ id: document.activeElement?.id || '', text: document.activeElement?.textContent?.trim().slice(0, 40) ?? '', imPanel: document.activeElement?.closest('[id^="nav-panel-"]')?.id ?? null }));
    // Tab vom Seitenanfang bis zum Auslöser «Leistungen»
    let schritte = 0;
    while (schritte < 20 && (await aktiv()).id !== 'nav-knopf-leistungen') {
        await page.keyboard.press('Tab');
        schritte++;
    }
    check(`${name}: Tab erreicht «Leistungen» (${schritte} Tabs)`, (await aktiv()).id === 'nav-knopf-leistungen');
    check(`${name}: geschlossen sind Panel-Links nicht im Tab-Weg`, (await panelZustand(page, 'leistungen')).expanded === 'false');
    await page.keyboard.press('Enter');
    await warte(page, 250);
    check(`${name}: Enter öffnet (aria-expanded=true)`, (await panelZustand(page, 'leistungen')).expanded === 'true');
    await page.keyboard.press('Tab');
    const ersterLink = await aktiv();
    check(`${name}: Tab führt in das Panel (erster Link)`, ersterLink.imPanel === 'nav-panel-leistungen', JSON.stringify(ersterLink));
    await shot(page, `${name}-1-enter-tab.png`);
    await page.keyboard.press('Escape');
    await warte(page, 250);
    check(`${name}: Escape schliesst, Fokus zurück auf den Auslöser`, (await panelZustand(page, 'leistungen')).expanded === 'false' && (await aktiv()).id === 'nav-knopf-leistungen');
    await page.keyboard.press('ArrowDown');
    await warte(page, 250);
    const pfeil = await aktiv();
    check(`${name}: Pfeil runter öffnet und fokussiert den ersten Link`, (await panelZustand(page, 'leistungen')).expanded === 'true' && pfeil.imPanel === 'nav-panel-leistungen' && pfeil.text.startsWith('IT-Support'), JSON.stringify(pfeil));
    // durch alle Links tabben, bis der Fokus das Panel verlässt → Panel zu, keine Fokusfalle
    let n = 0;
    while (n < 40 && (await aktiv()).imPanel === 'nav-panel-leistungen') {
        await page.keyboard.press('Tab');
        n++;
    }
    await warte(page, 250);
    const danach = await aktiv();
    // AUFTRAG-113: nächster Leistenknopf ist «KI-Telefonassistent» (statt «Für wen»)
    check(`${name}: Tab aus dem Dropdown schliesst es, Fokus auf «KI-Telefonassistent» (keine Fokusfalle, ${n} Tabs)`, (await panelZustand(page, 'leistungen')).expanded === 'false' && danach.id === 'nav-knopf-ki', JSON.stringify(danach));
    await page.keyboard.press(' ');
    await warte(page, 250);
    check(`${name}: Leertaste öffnet «KI-Telefonassistent»`, (await panelZustand(page, 'ki')).expanded === 'true');
    await shot(page, `${name}-2-ki.png`);
    await page.keyboard.press(' ');
    await warte(page, 250);
    check(`${name}: Leertaste schliesst wieder`, (await panelZustand(page, 'ki')).expanded === 'false');
    // Shift+Tab rückwärts in das offene Panel von «Unternehmen»
    await page.focus('#nav-knopf-unternehmen');
    await page.keyboard.press('Enter');
    await warte(page, 200);
    await page.keyboard.press('Tab');
    const u = await aktiv();
    check(`${name}: «Unternehmen» per Tastatur, erster Link «Über uns»`, u.imPanel === 'nav-panel-unternehmen' && u.text === 'Über uns', JSON.stringify(u));
    await page.keyboard.press('Escape');
    const fokusSichtbar = await page.evaluate(() => document.activeElement.matches(':focus-visible') && getComputedStyle(document.activeElement).outlineStyle);
    check(`${name}: Fokus sichtbar (outline)`, fokusSichtbar && fokusSichtbar !== 'none', fokusSichtbar);
    check(`${name}: keine Konsolenfehler`, konsole.length === 0, konsole.slice(0, 3).join(' | '));
    await ctx.close();
}

async function teilM3(browser) {
    const name = 'menue-desktop-1024-hell';
    const { ctx, page } = await neueSeite(browser, { breite: 1024, hoehe: 768 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const leiste = await page.evaluate(() => {
        const r = (el) => el.getBoundingClientRect();
        const logo = r(document.querySelector('header a'));
        const navEl = document.querySelector('header nav');
        const aktionen = r(navEl.nextElementSibling);
        const items = [...navEl.querySelectorAll(':scope > ul > li')].map((li) => r(li));
        return { logoRechts: Math.round(logo.right), navLinks: Math.round(r(navEl).left), navRechts: Math.round(r(navEl).right), aktionenLinks: Math.round(aktionen.left), zeilen: new Set(items.map((i) => Math.round(i.top))).size, ueberlauf: document.documentElement.scrollWidth - window.innerWidth };
    });
    check(`${name}: Leiste ohne Überlappung (Abstände ≥ 16 px, eine Zeile)`, leiste.navLinks - leiste.logoRechts >= 16 && leiste.aktionenLinks - leiste.navRechts >= 16 && leiste.zeilen === 1 && leiste.ueberlauf <= 0, JSON.stringify(leiste));
    // AUFTRAG-113: alle vier Dropdowns, auch seitlich im Fenster
    for (const id of ['leistungen', 'ki', 'cloud', 'unternehmen']) {
        await page.hover(`#nav-knopf-${id}`);
        await warte(page, 450);
        const z = await panelZustand(page, id);
        const seitlich = await page.evaluate((id) => {
            const r = document.querySelector(`#nav-panel-${id} > div`).getBoundingClientRect();
            return { links: Math.round(r.left), rechts: Math.round(r.right) };
        }, id);
        check(`${name}: «${id}» passt ins Fenster (${z.top}–${z.bottom} px, ${seitlich.links}–${seitlich.rechts} px)`, z.sichtbar && z.bottom <= 768 && seitlich.links >= 0 && seitlich.rechts <= 1024, JSON.stringify({ ...z, ...seitlich }));
        await shot(page, `${name}-${id}.png`);
        await page.mouse.move(500, 760);
        await warte(page, 450);
    }
    await ctx.close();
}

async function teilM4(browser) {
    const name = 'menue-ruhig';
    const { ctx, page } = await neueSeite(browser, { breite: 1440, hoehe: 900, ruhig: true });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.hover('#nav-knopf-leistungen');
    await warte(page, 300);
    const z = await panelZustand(page, 'leistungen');
    // AUFTRAG-113: die Wellenform gibt es nur noch in der mobilen KI-Karte (im DOM, auf dem Desktop ausgeblendet)
    const welle = await page.evaluate(() => getComputedStyle(document.querySelector('#nav-mobil a[class*="kiKarte"] [aria-hidden="true"] > span')).animationName);
    check(`${name}: prefers-reduced-motion – Dropdown ohne Verschiebung, Überblendung ≤ 0,08 s, Welle still`, z.sichtbar && z.transform === 'none' && z.dauer.split(',').every((d) => parseFloat(d) <= 0.08) && welle === 'none', `${z.transform} · ${z.dauer} · ${welle}`);
    await ctx.close();
}

async function teilM5(browser) {
    const name = 'menue-touch-1180';
    const { ctx, page } = await neueSeite(browser, { breite: 1180, hoehe: 820, touch: true });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.tap('#nav-knopf-leistungen');
    await warte(page, 300);
    const auf = await panelZustand(page, 'leistungen');
    await page.tap('#nav-knopf-leistungen');
    await warte(page, 300);
    const zu = await panelZustand(page, 'leistungen');
    check(`${name}: Antippen öffnet, nochmals Antippen schliesst`, auf.expanded === 'true' && zu.expanded === 'false', `${auf.expanded} → ${zu.expanded}`);
    await ctx.close();
}

// AUFTRAG-113: keine Branchen-Anker mehr im Menü — geprüft wird der einzige Anker-Link «Peoplefone vPBX»
async function teilM6(browser) {
    const name = 'menue-anker-klick';
    const { ctx, page, konsole } = await neueSeite(browser, { breite: 1440, hoehe: 900 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.hover('#nav-knopf-cloud');
    await warte(page, 400);
    await page.click('#nav-panel-cloud a[href="/cloud-telefonie#peoplefone"]');
    await page.waitForURL('**/cloud-telefonie#peoplefone', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await warte(page, 900);
    const ziel = await page.evaluate(() => ({
        top: Math.round(document.getElementById('peoplefone').getBoundingClientRect().top),
        h2: document.querySelector('#peoplefone h2')?.textContent.trim(),
        nenntPeoplefone: /peoplefone/i.test(document.getElementById('peoplefone').textContent),
        offen: [...document.querySelectorAll('[id^="nav-knopf-"][aria-expanded="true"]')].length,
    }));
    check(`${name}: «Peoplefone vPBX» → /cloud-telefonie#peoplefone, Abschnitt unter dem Header, Menü zu`, ziel.top >= 60 && ziel.top <= 160 && ziel.offen === 0 && ziel.nenntPeoplefone, JSON.stringify(ziel));
    await shot(page, `${name}-peoplefone.png`);
    check(`${name}: keine Konsolenfehler`, konsole.length === 0, konsole.slice(0, 3).join(' | '));
    await ctx.close();
}

async function teilM7(browser, theme) {
    const name = `menue-mobil-375-${theme === 'dark' ? 'dunkel' : 'hell'}`;
    const { ctx, page, konsole } = await neueSeite(browser, { breite: 375, hoehe: 812, theme, mobil: true });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 500));
    await warte(page, 300);
    const yVorher = await page.evaluate(() => window.scrollY);
    await page.tap('#nav-mobil-knopf');
    await warte(page, 400);
    const overlay = await page.evaluate(() => {
        const o = document.getElementById('nav-mobil');
        const s = getComputedStyle(o);
        return { sichtbar: s.visibility === 'visible' && Number(s.opacity) > 0.98, expanded: document.getElementById('nav-mobil-knopf').getAttribute('aria-expanded'), label: document.getElementById('nav-mobil-knopf').getAttribute('aria-label'), body: document.body.style.position };
    });
    check(`${name}: Menü öffnet als Overlay (Seite festgehalten)`, overlay.sichtbar && overlay.expanded === 'true' && overlay.label === 'Menü schliessen' && overlay.body === 'fixed', JSON.stringify(overlay));
    await shot(page, `${name}-1-offen.png`);
    await page.tap('#nav-mobil-knopf-leistungen');
    await warte(page, 450);
    const leistungen = await page.evaluate(() => {
        const box = document.getElementById('nav-mobil-leistungen');
        const links = [...box.querySelectorAll('a')].filter((a) => getComputedStyle(a).visibility === 'visible');
        return { expanded: document.getElementById('nav-mobil-knopf-leistungen').getAttribute('aria-expanded'), links: links.length, kleinste: Math.min(...links.map((a) => a.getBoundingClientRect().height)) };
    });
    // AUFTRAG-113 (mit Nachtrag ohne /telefonie): 11 Leistungen + «Alle Leistungen im Überblick» = 12 Links (vorher 14 + Übersicht)
    check(`${name}: Akkordeon «Leistungen» klappt auf (12 Links), Touchziele ≥ 44 px`, leistungen.expanded === 'true' && leistungen.links === 12 && leistungen.kleinste >= 44, JSON.stringify(leistungen));
    await shot(page, `${name}-2-leistungen.png`);
    // AUFTRAG-113: statt «Für wen» mit Regionen → Gruppe «Cloud-Telefonie» (fünf Einträge)
    await page.tap('#nav-mobil-knopf-cloud');
    await warte(page, 450);
    const exklusiv = await page.evaluate(() => [document.getElementById('nav-mobil-knopf-leistungen').getAttribute('aria-expanded'), document.getElementById('nav-mobil-knopf-cloud').getAttribute('aria-expanded')]);
    check(`${name}: eine Hauptgruppe offen (Cloud-Telefonie auf, Leistungen zu)`, exklusiv.join() === 'false,true', exklusiv.join());
    const cloud = await page.evaluate(() => {
        const box = document.getElementById('nav-mobil-cloud');
        const links = [...box.querySelectorAll('a')];
        return { links: links.length, namen: links.map((a) => a.textContent.trim()), kleinste: Math.min(...links.map((a) => a.getBoundingClientRect().height)), knoepfe: Math.min(...[...document.querySelectorAll('#nav-mobil button')].filter((b) => b.getClientRects().length && getComputedStyle(b).visibility === 'visible').map((b) => b.getBoundingClientRect().height)) };
    });
    check(`${name}: Gruppe «Cloud-Telefonie» aufklappbar (5 Einträge), Touchziele ≥ 44 px`, cloud.links === 5 && cloud.kleinste >= 44 && cloud.knoepfe >= 44, `${cloud.namen.join(', ')} · Link ${cloud.kleinste} px · Knöpfe ${cloud.knoepfe} px`);
    await page.locator('#nav-mobil-knopf-cloud').scrollIntoViewIfNeeded();
    await shot(page, `${name}-3-cloud.png`);
    await page.keyboard.press('Escape');
    await warte(page, 400);
    const zu = await page.evaluate(() => ({ expanded: document.getElementById('nav-mobil-knopf').getAttribute('aria-expanded'), y: window.scrollY, fokus: document.activeElement?.id }));
    check(`${name}: Escape schliesst, Seite wieder an derselben Stelle, Fokus auf dem Menü-Knopf`, zu.expanded === 'false' && Math.abs(zu.y - yVorher) <= 1 && zu.fokus === 'nav-mobil-knopf', JSON.stringify(zu));
    // Link im Overlay: navigiert und schliesst
    await page.tap('#nav-mobil-knopf');
    await warte(page, 350);
    // AUFTRAG-113: statt Branchen-Link ein Link der KI-Gruppe (Funktionen)
    await page.tap('#nav-mobil-knopf-ki');
    await warte(page, 400);
    await page.tap('#nav-mobil-ki a[href="/ki-telefonassistent/funktionen"]');
    await page.waitForURL('**/ki-telefonassistent/funktionen', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await warte(page, 800);
    const ziel = await page.evaluate(() => ({ offen: document.getElementById('nav-mobil-knopf').getAttribute('aria-expanded'), h1: document.querySelector('h1')?.textContent.trim(), body: document.body.style.position, y: Math.round(window.scrollY) }));
    check(`${name}: KI-Link → /ki-telefonassistent/funktionen, Overlay zu, Seite oben`, ziel.offen === 'false' && ziel.body === '' && ziel.y <= 5 && /Was der KI-Telefonassistent kann/.test(ziel.h1 || ''), JSON.stringify(ziel));
    check(`${name}: keine Konsolenfehler`, konsole.length === 0, konsole.slice(0, 3).join(' | '));
    await ctx.close();
}

/* ------------------------------------------------------------------ */
/* Teil T: Telefon scrollt mit                                         */
/* ------------------------------------------------------------------ */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><rect x="4" y="12" width="36" height="36" rx="8" fill="#E8A13D"/><path d="M14 38V22h9a6 6 0 0 1 0 12h-9" fill="none" stroke="#1E3A5F" stroke-width="4"/><text x="50" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1E3A5F">Beispiel AG</text></svg>`;

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

/** Fängt Scan, Profil, Logo, Anruf und Status ab (fiktive Beispiel AG, kein Server-Auftrag, kein Anruf). */
// AUFTRAG-120: Ablauf seit A-111/A-112 — Vorprüfung {url}, Handelsregister (Treffer → Bestätigung), Vollscan {scan_id}
const SCAN_ID = 's-a100attrappe0001';
const TREFFER = { uid: 'CHE000000001', uid_formatiert: 'CHE-000.000.001', name: 'Beispiel AG', sitz: 'Winterthur', status: 'ACTIVE', status_text: 'aktiv', rechtsform: 'AG', aktiv: true };
async function apiAbfangen(page, { scanMs = 1200, profilMs = 2600 } = {}) {
    const z = { start: 0, gesendet: null, scans: 0 };
    await page.route('**/api/demo/**', (r) => r.fulfill({ status: 418, contentType: 'application/json', body: '{"fehler":"A100-Test: gesperrt"}' }));
    await page.route('**/api/demo/bild/**', (r) => r.fulfill({ status: 200, contentType: 'image/svg+xml', body: LOGO_SVG }));
    await page.route('**/api/demo/handelsregister', async (r) => {
        const body = JSON.parse(r.request().postData() || '{}');
        await new Promise((ok) => setTimeout(ok, 300));
        const basis = { scan_id: SCAN_ID, modus: 'streng', quelle: 'uid', treffer: [TREFFER], versuche_rest: 3 };
        const bestaetigt = { uid: TREFFER.uid, uid_formatiert: TREFFER.uid_formatiert, name: TREFFER.name, sitz: TREFFER.sitz, gebunden: 'domain' };
        await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body.bestaetige ? { ...basis, ergebnis: 'bestaetigt', bestaetigt } : { ...basis, ergebnis: 'treffer', bestaetigt: null }) });
    });
    await page.route('**/api/demo/scan', async (r) => {
        z.scans++;
        const body = JSON.parse(r.request().postData() || '{}');
        if (!body.scan_id) {
            await new Promise((ok) => setTimeout(ok, scanMs / 2));
            return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ scan_id: SCAN_ID, stufe: 'vorpruefung', host: 'beispiel-ag.ch' }) });
        }
        await new Promise((ok) => setTimeout(ok, scanMs));
        await r.fulfill({
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
    await page.route('**/api/demo/profil', async (r) => {
        await new Promise((ok) => setTimeout(ok, profilMs));
        await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profil: PROFIL, funde: { telefon: '044 000 00 00', oeffnungszeiten: 'Mo–Fr 07:30–17:00', wissen: 12 } }) });
    });
    await page.route('**/api/demo/anruf', async (r) => {
        z.gesendet = JSON.parse(r.request().postData() || '{}');
        z.start = Date.now();
        await r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'd-20261025-attrappea100' }) });
    });
    await page.route('**/api/demo/auftraege/**', async (r) => {
        const t = Date.now() - z.start;
        let status = 'wartend';
        if (t > 1500) status = 'angenommen';
        if (t > 3500) status = 'waehlt';
        if (t > 7000) status = 'verbunden';
        const ende = t > 26000;
        await r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'd-20261025-attrappea100', status: ende ? 'beendet' : status, zeit: new Date().toISOString(), dauer_s: ende ? 19 : null, zusammenfassung: ende ? 'Testgespräch (Attrappe im Browser).' : null }),
        });
    });
    return z;
}

/** Lage des Telefons, der Bühne, des Heros und des Footers */
async function telefonLage(page) {
    return page.evaluate(() => {
        const tel = document.querySelector('figure').parentElement;
        const r = tel.getBoundingClientRect();
        const buehne = tel.parentElement.getBoundingClientRect();
        const hero = tel.closest('section').getBoundingClientRect();
        const footer = document.querySelector('footer').getBoundingClientRect();
        const zustand = document.querySelector('[data-zustand]')?.getAttribute('data-zustand');
        return {
            position: getComputedStyle(tel).position,
            top: Math.round(r.top * 10) / 10,
            bottom: Math.round(r.bottom * 10) / 10,
            hoehe: Math.round(r.height),
            fenster: window.innerHeight,
            buehneBottom: Math.round(buehne.bottom * 10) / 10,
            heroBottom: Math.round(hero.bottom * 10) / 10,
            footerTop: Math.round(footer.top),
            scrollY: Math.round(window.scrollY),
            kopf: Math.round(document.querySelector('header').getBoundingClientRect().bottom),
            zustand,
        };
    });
}

/** AUFTRAG-120: Firma bestätigen (seit A-111 Voraussetzung für Vollscan, Karte und Formular) */
async function firmaBestaetigen(page) {
    const k = page.locator('#ki-demo-hr-bestaetigen:not([disabled])');
    await k.waitFor({ timeout: 15000 });
    await k.click();
}

async function anrufStarten(page) {
    await page.fill('#ki-demo-nummer', '079 000 00 01');
    await page.locator('#ki-demo-einwilligung').check();
    await page.click('#ki-demo-anruf-knopf');
}

async function teilT1(browser, { theme, breite, hoehe, voll }) {
    const name = `telefon-desktop-${breite}x${hoehe}-${theme === 'dark' ? 'dunkel' : 'hell'}`;
    const { ctx, page, konsole } = await neueSeite(browser, { breite, hoehe, theme });
    const abfang = await apiAbfangen(page);
    await page.goto(`${BASE}/ki-telefonassistent`, { waitUntil: 'networkidle' });
    let l = await telefonLage(page);
    check(`${name}: eingabe – Telefon nicht sticky`, l.position === 'static', l.position);
    check(`${name}: Telefon passt unter dem Header ins Fenster (Höhe ${l.hoehe} px)`, 112 + l.hoehe <= hoehe, `${l.hoehe} px bei ${hoehe} px Fenster`);
    await page.fill('#ki-demo-url', 'beispiel-ag.ch');
    await page.locator('#ki-demo-scan-knopf').scrollIntoViewIfNeeded();
    const yVorScan = await page.evaluate(() => Math.round(window.scrollY));
    await page.click('#ki-demo-scan-knopf');
    await warte(page, 300);
    l = await telefonLage(page);
    check(`${name}: scan – Telefon sticky`, l.position === 'sticky', `${l.position} (${l.zustand})`);
    // [08.11.2026] Warum: AUFTRAG-120 führt den Sprung zur Aktionskarte bewusst ein — aber nur mobil; am Desktop bleibt die Seite
    // stehen (Vergleich mit scrollY direkt vor dem Klick: bei 720 px Höhe scrollt Playwright den Knopf selbst ins Bild)
    check(`${name}: Scan-Start ohne automatischen Sprung (Desktop, scrollY ${yVorScan} → ${l.scrollY})`, l.scrollY === yVorScan, `scrollY ${yVorScan} → ${l.scrollY}`);
    await firmaBestaetigen(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await warte(page, 150);
    // Während des Scans nach unten zur Aktionskarte scrollen
    await page.evaluate(() => window.scrollBy(0, 520));
    await page.locator('figure li:has-text("Logo gefunden")').first().waitFor({ timeout: 15000 }).catch(() => undefined);
    await warte(page, 250);
    l = await telefonLage(page);
    check(`${name}: Scan, gescrollt (${l.scrollY} px) – Telefon oben unter dem Header (top ${l.top} px) und ganz sichtbar`, l.zustand === 'scan' && Math.abs(l.top - 112) <= 1.5 && l.bottom <= l.fenster && l.top >= l.kopf, JSON.stringify(l));
    await shot(page, `${name}-1-scan-gescrollt.png`);

    await page.locator('#ki-demo-anruf-knopf[data-zustand="bereit"]').waitFor({ state: 'visible', timeout: 30000 });
    await warte(page, 600);
    await page.locator('#ki-demo-anruf-knopf').scrollIntoViewIfNeeded();
    await warte(page, 200);
    l = await telefonLage(page);
    // [08.11.2026] AUFTRAG-120: Seit dem Firmen-Schritt (A-111) ist das Formular so lang, dass bei 1280×720 der Anruf-Knopf am
    // Ende der Bühne liegt; das Telefon endet dort mit der Bühne (A-100-Grenze) und ragt oben unter den Header. Nicht durch
    // A-120 verursacht (Desktop pixelgleich vorher/nachher); geprüft wird deshalb «ganz sichtbar ODER an der Bühnen-Grenze».
    check(`${name}: bereit, Formular im Blick – Telefon (Karte) sichtbar oder an der Bühnen-Grenze`, (l.top >= l.kopf - 1 && l.bottom <= l.fenster + 1) || (Math.abs(l.bottom - l.buehneBottom) <= 1 && l.bottom <= l.fenster + 1), JSON.stringify(l));
    await shot(page, `${name}-2-bereit-formular.png`);

    await anrufStarten(page);
    await page.locator('#ki-demo-anruf-knopf[data-zustand="verbunden"]').waitFor({ timeout: 30000 });
    await warte(page, 2200);
    // ganz nach unten zur Aktionskarte (Ablauf des Testanrufs)
    await page.evaluate(() => document.querySelector('[aria-label="Ablauf des Testanrufs"]').scrollIntoView({ block: 'end' }));
    await warte(page, 300);
    l = await telefonLage(page);
    const ansicht = await page.evaluate(() => [...document.querySelectorAll('figure [aria-label^="Gesprächsdauer"]')].some((el) => el.closest('[aria-hidden="false"]')));
    check(`${name}: Anruf (verbunden), gescrollt (${l.scrollY} px) – Telefon sichtbar (top ${l.top} px), zeigt Gesprächsdauer`, l.zustand === 'verbunden' && l.top >= l.kopf - 1 && l.bottom <= l.fenster + 1 && ansicht, JSON.stringify(l));
    await shot(page, `${name}-3-anruf-gescrollt.png`);

    if (voll) {
        // Grenze: weiter scrollen, das Telefon endet mit der Bühne (nie im nächsten Abschnitt oder Footer)
        const proben = [];
        for (const dy of [200, 400, 600, 900, 1400, 2400]) {
            await page.evaluate((y) => window.scrollBy(0, y), dy);
            await warte(page, 120);
            proben.push(await telefonLage(page));
        }
        const verletzt = proben.filter((p) => p.bottom > p.buehneBottom + 0.6 || p.bottom > p.heroBottom || p.bottom > p.footerTop);
        const amEnde = proben.find((p) => p.top < 112 - 2);
        check(`${name}: Grenze – Telefon nie unter dem Ende der Bühne/des Abschnitts, nie im Footer`, verletzt.length === 0 && !!amEnde, verletzt.length ? JSON.stringify(verletzt[0]) : `am Ende: top ${amEnde?.top}, bottom ${amEnde?.bottom} = Bühne ${amEnde?.buehneBottom}`);
        await page.evaluate(() => {
            const b = document.querySelector('figure').parentElement.parentElement.getBoundingClientRect();
            window.scrollBy(0, b.bottom - window.innerHeight + 160);
        });
        await warte(page, 200);
        await shot(page, `${name}-4-grenze-ende-buehne.png`);
        // Zurück zum Anfang: Telefon wieder an seinem Platz
        await page.evaluate(() => window.scrollTo(0, 0));
        await warte(page, 200);
        l = await telefonLage(page);
        check(`${name}: oben angekommen – Telefon an seinem Platz in der Bühne`, l.top > 112 + 20, JSON.stringify(l));
        // Ende des Anrufs, danach «Andere Website» → wieder im Fluss
        await page.locator('#ki-demo-anruf-knopf[data-zustand="beendet"]').waitFor({ timeout: 40000 });
        await warte(page, 400);
        await page.click('button:has-text("Andere Website")');
        await warte(page, 300);
        l = await telefonLage(page);
        check(`${name}: «Andere Website» → eingabe, Telefon wieder im Fluss`, l.position === 'static', l.position);
    }
    check(`${name}: Anruf-API abgefangen (kein Auftrag beim Server, kein Anruf)`, abfang.gesendet?.nummer === '+41790000001', JSON.stringify(abfang.gesendet ?? {}).slice(0, 120));
    const c = await cls(page);
    check(`${name}: CLS im ganzen Ablauf ${c.wert.toFixed(4)} (Höhen-Sprünge)`, c.wert === 0, c.quellen.join(' | '));
    check(`${name}: keine Konsolenfehler`, konsole.length === 0, konsole.slice(0, 3).join(' | '));
    await ctx.close();
}

async function statusZeile(page) {
    return page.evaluate(() => {
        const b = document.querySelector('button[data-sichtbar], button[class*="statuszeile"]');
        if (!b) return null;
        const r = b.getBoundingClientRect();
        const s = getComputedStyle(b);
        const [kopf, text] = [...b.querySelectorAll('span.block')].map((x) => x.textContent.trim());
        return { sichtbar: b.dataset.sichtbar === 'true' && s.visibility === 'visible', top: Math.round(r.top), hoehe: Math.round(r.height), kopf, text, transform: s.transform, kopfUnten: Math.round(document.querySelector('header').getBoundingClientRect().bottom) };
    });
}

async function teilT3(browser, { theme, ruhig = false }) {
    const name = `telefon-mobil-375-${theme === 'dark' ? 'dunkel' : 'hell'}${ruhig ? '-ruhig' : ''}`;
    const { ctx, page, konsole } = await neueSeite(browser, { breite: 375, hoehe: 812, theme, mobil: true, ruhig });
    await apiAbfangen(page);
    await page.goto(`${BASE}/ki-telefonassistent`, { waitUntil: 'networkidle' });
    await page.locator('#ki-demo-url').scrollIntoViewIfNeeded();
    await page.fill('#ki-demo-url', 'beispiel-ag.ch');
    const yVorher = await page.evaluate(() => window.scrollY);
    let s = await statusZeile(page);
    check(`${name}: eingabe – keine Statuszeile`, s && !s.sichtbar, JSON.stringify(s));
    await page.tap('#ki-demo-scan-knopf');
    // A-123: Firmen-Blatt abwarten, dann die Bewegung (Blatt 420 ms, Telefon-Skala 450 ms) ausklingen lassen
    await page.locator('section[data-blatt="firma"]').waitFor({ state: 'visible', timeout: 15000 });
    await warte(page, 700);
    s = await statusZeile(page);
    const yScan = await page.evaluate(() => window.scrollY);
    // [09.11.2026] Warum: AUFTRAG-121 Kompaktmodus, kein Scrollen mobil — statt des A-120-Sprungs zur Karte klappt der Hero zu.
    // AUFTRAG-122: Telefon als Bühne. [09.11.2026] Warum: AUFTRAG-123 ruhige Bühne — das Blatt (Höhe = Inhalt) liegt unten in
    // der Bühne, das Telefon skaliert sich darüber und wird nie angeschnitten (oder blendet aus); die Statuszeile erscheint nur,
    // wenn die Bühne nicht im Bild ist.
    const lage = () =>
        page.evaluate(() => {
            const k = document.querySelector('section[aria-labelledby="ki-demo-anruf-titel"]');
            const r = k?.getBoundingClientRect();
            const f = document.querySelector('figure[aria-label^="Vorschau"]');
            const t = f?.getBoundingClientRect();
            const cs = f ? getComputedStyle(f) : null;
            return {
                top: r ? Math.round(r.top * 10) / 10 : null,
                bottom: r ? Math.round(r.bottom * 10) / 10 : null,
                telefon: t ? { top: Math.round(t.top * 10) / 10, bottom: Math.round(t.bottom * 10) / 10, grundBreite: f.offsetWidth, aus: cs.opacity === '0' || cs.visibility === 'hidden' } : null,
            };
        });
    const karte = await lage();
    check(
        `${name}: Scan-Start ohne Sprung (scrollY ${yVorher} → ${yScan}), Blatt ganz im Bild (${karte.top}–${karte.bottom} px), Telefon (Grundbreite ≤ 300 px) darüber nie angeschnitten`,
        yScan === yVorher && karte.top >= 112 && karte.bottom <= 812 && !!karte.telefon && karte.telefon.grundBreite <= 300 && karte.telefon.top >= 112 && (karte.telefon.aus || karte.telefon.bottom <= karte.top - 8),
        JSON.stringify(karte),
    );
    check(`${name}: Statuszeile unsichtbar, solange die Bühne im Bild ist (A-123 Z1.1)`, s && !s.sichtbar, JSON.stringify(s));
    await firmaBestaetigen(page);
    // A-123 (Z1.1): die Statuszeile erscheint, sobald das Telefon aus dem Bild gescrollt ist (Bühne noch im Bild) — dann mit
    // Schritt und Fund. AUFTRAG-120: der Fund «Markenfarbe» steht nur einen Takt (~360 ms) — abfragen, bis er erscheint
    await warte(page, 300);
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
    await page
        .waitForFunction(() => /Markenfarbe #1E3A5F/.test(document.querySelector('button[data-sichtbar="true"]')?.textContent ?? ''), null, { timeout: 20000, polling: 30 })
        .catch(() => undefined);
    s = await statusZeile(page);
    check(`${name}: Telefon aus dem Bild gescrollt → Statuszeile oben (unter dem Header, 48 px) mit Schritt und Fund («Markenfarbe #1E3A5F»)`, s.sichtbar && s.hoehe === 48 && Math.abs(s.top - s.kopfUnten) <= 1 && /Markenfarbe #1E3A5F/.test(s.text), `${s.kopf} | ${s.text} · ${JSON.stringify(s)}`);
    if (ruhig) check(`${name}: reduzierte Bewegung – Statuszeile ohne Verschiebung`, s.transform === 'none', s.transform);
    await shot(page, `${name}-1-statuszeile-scan.png`);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await warte(page, 500);
    s = await statusZeile(page);
    check(`${name}: zurück oben (Bühne im Bild) → Statuszeile wieder weg`, !s.sichtbar, JSON.stringify(s));
    // A-123 (Z5.1): «bereit» erst als Kurzblatt
    await page.locator('#ki-demo-bereit-knopf').waitFor({ state: 'visible', timeout: 30000 });
    await warte(page, 700);
    const yBereit = await page.evaluate(() => window.scrollY);
    s = await statusZeile(page);
    const kurz = await page.evaluate(() => document.querySelector('section[aria-labelledby="ki-demo-anruf-titel"]')?.innerText.replace(/\s+/g, ' ').trim());
    check(`${name}: bereit – kein automatischer Sprung, Kurzblatt «Lena ist bereit / Lena soll mich anrufen», Statuszeile unsichtbar`, yBereit === 0 && !s.sichtbar && kurz === 'Lena ist bereit Lena soll mich anrufen', `scrollY ${yBereit}; ${kurz}; ${JSON.stringify(s)}`);
    await shot(page, `${name}-2-kurzblatt.png`);
    await page.tap('#ki-demo-bereit-knopf');
    await warte(page, ruhig ? 400 : 1100);
    const yTipp = await page.evaluate(() => window.scrollY);
    await shot(page, `${name}-3-formular.png`);
    const knopf = await page.evaluate(() => Math.round(document.querySelector('#ki-demo-anruf-knopf').getBoundingClientRect().bottom));
    check(`${name}: Formular nach dem Antippen – kein Sprung (scrollY ${yTipp}), Anruf-Knopf ohne Scrollen ganz im Bild (unten ${knopf} px)`, yTipp === 0 && knopf <= 812, String(knopf));
    await anrufStarten(page);
    await warte(page, ruhig ? 400 : 1100);
    // AUFTRAG-121: kein Sprung zum Telefon mehr. AUFTRAG-122/123: während des Anrufs kein Blatt, das Telefon zeigt den Stand
    // (Skala 1); die Statuszeile bleibt unsichtbar (Telefon im Bild) — der Anrufstand wird an ihrem data-zustand abgewartet
    const yAnruf = await page.evaluate(() => window.scrollY);
    s = await statusZeile(page);
    const ohneKarte = await page.evaluate(() => !document.querySelector('section[aria-labelledby="ki-demo-anruf-titel"]') && !!document.querySelector('figure[aria-label^="Vorschau"]'));
    const l = await lage();
    check(`${name}: Anruf-Knopf ohne Sprung (scrollY ${yAnruf}), kein Blatt, Telefon ganz im Bild, Statuszeile unsichtbar (Stand «${s.kopf}»)`, yAnruf === 0 && !s.sichtbar && s.kopf === 'Testanruf' && ohneKarte && !l.telefon.aus && l.telefon.bottom <= 812, `${s.kopf} | ${s.text} | ohne Karte ${ohneKarte} | ${JSON.stringify(l.telefon)}`);
    await page.locator('button[class*="statuszeile"][data-zustand="waehlt"]').waitFor({ state: 'attached', timeout: 30000 });
    await warte(page, 400);
    s = await statusZeile(page);
    const telWaehlt = await page.evaluate(() => [...document.querySelectorAll('figure [aria-hidden="false"]')].map((a) => a.innerText).join(' ').replace(/\s+/g, ' '));
    check(`${name}: Anruf – Telefon «Anruf von …», Statuszeile (unsichtbar) mit «Ihr Telefon klingelt …»`, /Anruf von/.test(telWaehlt) && !s.sichtbar && s.text === 'Ihr Telefon klingelt …', `${s.kopf} | ${s.text} | ${telWaehlt.slice(0, 80)}`);
    await page.locator('button[class*="statuszeile"][data-zustand="verbunden"]').waitFor({ state: 'attached', timeout: 30000 });
    await warte(page, 2300);
    s = await statusZeile(page);
    check(`${name}: verbunden – Stand und Dauer («Verbunden – 0:0x», «Sie sprechen mit Lena») in der (unsichtbaren) Statuszeile`, !s.sichtbar && /^Verbunden – 0:0\d$/.test(s.kopf) && s.text === 'Sie sprechen mit Lena', `${s.kopf} | ${s.text}`);
    await shot(page, `${name}-4-anruf.png`);
    // weit nach unten (FAQ): Statuszeile weg
    await page.evaluate(() => document.querySelector('details').scrollIntoView());
    await warte(page, 400);
    s = await statusZeile(page);
    check(`${name}: ausserhalb der Demo (FAQ) keine Statuszeile`, !s.sichtbar);
    const c = await cls(page);
    check(`${name}: CLS im ganzen Ablauf ${c.wert.toFixed(4)}`, c.wert === 0, c.quellen.join(' | '));
    check(`${name}: keine Konsolenfehler`, konsole.length === 0, konsole.slice(0, 3).join(' | '));
    await ctx.close();
}

/* ------------------------------------------------------------------ */
/* Ablauf                                                              */
/* ------------------------------------------------------------------ */
const browser = await chromium.launch({ executablePath: CHROME });
try {
    if (!nurTelefon) {
        await teilM0();
        await teilM1(browser, 'light');
        await teilM1(browser, 'dark');
        await teilM2(browser);
        await teilM3(browser);
        await teilM4(browser);
        await teilM5(browser);
        await teilM6(browser);
        await teilM7(browser, 'light');
        await teilM7(browser, 'dark');
    }
    if (!nurMenue) {
        await teilT1(browser, { theme: 'light', breite: 1440, hoehe: 900, voll: true });
        await teilT1(browser, { theme: 'dark', breite: 1440, hoehe: 900, voll: false });
        await teilT1(browser, { theme: 'light', breite: 1280, hoehe: 720, voll: false });
        await teilT3(browser, { theme: 'light' });
        await teilT3(browser, { theme: 'dark' });
        await teilT3(browser, { theme: 'light', ruhig: true });
    }
} finally {
    await browser.close();
}

const fehler = ergebnisse.filter((e) => !e.ok);
writeFileSync(path.join(SCREENS, `browser-test${nurMenue ? '-menue' : nurTelefon ? '-telefon' : ''}.json`), JSON.stringify({ zeit: new Date().toISOString(), basis: BASE, bestanden: ergebnisse.length - fehler.length, gesamt: ergebnisse.length, ergebnisse }, null, 2));
console.log(`\n${ergebnisse.length - fehler.length}/${ergebnisse.length} bestanden`);
process.exit(fehler.length ? 1 : 0);
