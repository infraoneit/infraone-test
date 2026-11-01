#!/usr/bin/env node
/**
 * auftrag114-browser-test.mjs (AUFTRAG-114) — Startseite mobil, Menü-Icons, Datenschutz, Preise, direkte Anfrage.
 *
 * Gegen einen EIGENEN Server (Vorgabe http://localhost:3005, nie :3000), Build zuvor.
 * P1a Einblend-Animation (Web Animations API): auf / bei 375×812 (Telefon-Emulation und schmales
 *     Desktop-Fenster) und 1280×720 für ALLE zehn Karten der ServicesSection
 *     `getAnimations()[0].timeline.source` = <html> (nicht die Section), zentriert gescrollt opacity '1'.
 *     Stichprobe /ki-telefonassistent, /it-support, /leistungen, /webdesign: letztes .reveal-stagger-item
 *     und letzte .reveal vor dem Footer, ebenso. Jedes .overflow-hidden mit Reveal-Kindern hat overflow: clip.
 * P1b Header-Abstand: Header-Höhe bei 375/768/1024/1280 = Beginn des Inhalts in <main>; Überzeile
 *     «IT-Dienstleister Winterthur» bei 375×640, 390×740, 375×812 mindestens 12 px unter dem Header;
 *     auf /, /ki-telefonassistent, /it-support, /cloud-telefonie, /kontakt liegt bei 375 px (und 1024/1280)
 *     das erste h1/p im main nicht unter dem Header.
 * P2  Menü-Icons: Desktop-Dropdowns und mobiles Akkordeon — jeder Eintrag mit Icon (svg[data-nav-icon],
 *     16 px, aria-hidden, vor dem Text), Zuordnung wie navigation.ts; Leistenknöpfe ohne Icon;
 *     Dropdowns ≤ 640 px, im Fenster, kein Eintrag abgeschnitten (1024 und 1280 px).
 * P3  /datenschutz: Titel, Beschreibung, alle Texte sichtbar, Anker, Tabelle (mobil waagrecht scrollbar,
 *     Seite ohne waagrechtes Scrollen); auf allen übrigen Sitemap-Seiten und in llms*.txt kein
 *     Gemini/OpenAI/GPT/ChatGPT (ohne die KI-News-Sektion [data-ki-news] mit fremden Schlagzeilen — [01.11.2026]
 *     AUFTRAG-116, Nachtrag N2); Satz mit Link auf /datenschutz#dienstleister; beim Laden von / keine
 *     Anfrage an fonts.googleapis.com / fonts.gstatic.com.
 * P4  /preise: SMS-Bestätigung ohne Badge in Starter/Business/Enterprise, Kalender mit Badge; im ganzen
 *     KI-Bereich keine Badge «In Entwicklung» an einem Eintrag, der die SMS nennt.
 * P5  Anfrage: Formular sichtbar OHNE Testanruf (Hub und /preise), Felder/Auswahl/Texte, Pflichtfelder
 *     (leeres Absenden sendet nichts), Hash-Vorwahl (#anfrage-<paket>, Knopf «Anfragen»), Firma aus dem
 *     Testanruf per sessionStorage (simuliert, ohne Anruf), Knöpfe «Assistent anfragen», Erfolg (POST
 *     abgefangen) und Fehlerpfad lokal → /kontakt mit Betreff «KI-Telefonassistent».
 *
 * Sicherheit: Alle Aufrufe auf /api/demo/** werden im Browser abgefangen (418) — kein Scan, kein Anruf,
 * keine Telefonnummer im Anruf-Formular. Das Anfrage-Formular sendet nur an den eigenen Server (lokal 500 →
 * Fehlerpfad) bzw. an eine abgefangene Route; Testwerte sind erfunden (example.invalid).
 *
 *   $env:BASE_URL='http://localhost:3005'; $env:SCREENS_DIR='…\A114-screens'; node scripts/auftrag114-browser-test.mjs
 *
 * Node ≥ 22.18 (Type-Stripping für die .ts-Quellen).
 */
import { chromium } from 'playwright-core';
import { registerHooks } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
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
const nav = await lade('src/components/layout/navigation.ts');
const { KI_SEITEN, KI_BASIS, KI_PREISE_PFAD } = await lade('src/components/ki-telefonassistent/seiten.ts');
const { PAKETE } = await lade('src/lib/ki-telefonassistent-preise.ts');
const { IN_ENTWICKLUNG, KALENDER_SATZ } = await lade('src/lib/in-entwicklung.ts');
const ds = await lade('src/lib/datenschutz.ts');
const { KI_ANBIETER_SATZ, KI_ANBIETER_LINK } = await lade('src/lib/ki-anbieter.ts');
const anf = await lade('src/lib/ki-anfrage.ts');

const BASE = (process.env.BASE_URL || 'http://localhost:3005').replace(/\/$/, '');
if (/:3000\b/.test(BASE)) {
    console.error('Port 3000 gehört dem Inhaber (Testlink) — bitte den eigenen Server auf :3005 verwenden.');
    process.exit(2);
}
const CHROME = process.env.PLAYWRIGHT_CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function ergebnisOrdner() {
    let d = ROOT;
    for (let i = 0; i < 8; i++) {
        if (existsSync(path.join(d, 'auftraege', 'ergebnisse'))) return path.join(d, 'auftraege', 'ergebnisse');
        d = path.dirname(d);
    }
    return path.join(ROOT, 'auftraege-ergebnisse');
}
const SCREENS = process.env.SCREENS_DIR || path.join(ergebnisOrdner(), 'A114-screens');
mkdirSync(SCREENS, { recursive: true });

const ergebnisse = [];
function check(name, ok, detail = '') {
    ergebnisse.push({ name, ok: !!ok, detail: String(detail).slice(0, 1200) });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`);
}
const protokoll = { zeit: new Date().toISOString(), basis: BASE };
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const ANBIETER_RE = /gemini|openai|gpt-|chatgpt/i;

/* ------------------------------------------------------------------ */
/* Hilfen                                                              */
/* ------------------------------------------------------------------ */
const browser = await chromium.launch({ executablePath: CHROME, headless: true });

/**
 * Neuer Kontext. `bewegung: true` → prefers-reduced-motion: no-preference (sonst laufen die
 * Einblend-Animationen nicht, und die Prüfung P1a wäre sinnlos); sonst «reduce» für ruhige Screens.
 */
async function neueSeite(viewport, { theme = 'light', mobil = false, bewegung = false } = {}) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: mobil ? 2 : 1, isMobile: mobil, hasTouch: mobil, locale: 'de-CH', reducedMotion: bewegung ? 'no-preference' : 'reduce' });
    await ctx.addInitScript((t) => {
        try {
            localStorage.setItem('theme', t);
        } catch {
            /* egal */
        }
    }, theme);
    await ctx.route('**/api/demo/**', (route) => route.fulfill({ status: 418, contentType: 'application/json', body: '{"fehler":"A114-Test: Demo-API gesperrt"}' }));
    const page = await ctx.newPage();
    const fehler = [];
    page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
    page.on('console', (m) => {
        if (m.type() !== 'error') return;
        // gewollt: gesperrte Demo-API (418) und der lokale Fehlerpfad des Formulars (POST /__forms.html → 500)
        if (/api\/demo|418|Failed to load resource/i.test(m.text())) return;
        fehler.push(m.text());
    });
    return { ctx, page, fehler };
}

async function oeffne(page, pfad) {
    const r = await page.goto(`${BASE}${pfad}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(300);
    return r;
}

async function hole(url) {
    const r = await fetch(url, { redirect: 'follow' });
    return { status: r.status, text: await r.text(), url: r.url };
}

/** Element zentriert ins Bild scrollen, zwei Frames warten, Zustand der Einblend-Animation lesen */
const REVEAL_ZUSTAND = async (el) => {
    const b = el.getBoundingClientRect();
    const ziel = window.scrollY + b.top + b.height / 2 - window.innerHeight / 2;
    window.scrollTo(0, Math.max(0, Math.min(ziel, document.documentElement.scrollHeight - window.innerHeight)));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 150));
    const anim = el.getAnimations()[0];
    const quelle = anim?.timeline?.source ?? null;
    const sec = el.closest('section');
    const art = !quelle ? null : quelle === document.documentElement ? 'html' : quelle === document.body ? 'body' : quelle === sec ? 'section' : `${quelle.tagName}.${String(quelle.className).slice(0, 50)}`;
    const r = el.getBoundingClientRect();
    return {
        text: (el.querySelector('h3, h2')?.textContent ?? el.textContent).trim().slice(0, 40),
        opacity: getComputedStyle(el).opacity,
        quelle: art,
        fortschritt: anim ? Math.round((anim.currentTime?.value ?? anim.currentTime ?? 0) * 10) / 10 : null,
        imBild: r.top < window.innerHeight && r.bottom > 0,
    };
};

try {
    /* ---------------- P1a: Einblend-Animation ---------------- */
    {
        const varianten = [
            ['375×812 Telefon', { width: 375, height: 812 }, true],
            ['375×812 schmales Fenster', { width: 375, height: 812 }, false],
            ['1280×720', { width: 1280, height: 720 }, false],
        ];
        protokoll.karten = {};
        for (const [name, vp, mobil] of varianten) {
            const { ctx, page, fehler } = await neueSeite(vp, { mobil, bewegung: true, theme: 'dark' });
            await oeffne(page, '/');
            const anzahl = await page.evaluate(() => {
                const sec = [...document.querySelectorAll('section')].find((s) => s.querySelector('h2')?.textContent?.includes('Unsere IT-Kompetenzen'));
                return sec ? sec.querySelectorAll('.reveal-stagger-item').length : 0;
            });
            const karten = [];
            for (let i = 0; i < anzahl; i++) {
                const h = await page.evaluateHandle((i) => {
                    const sec = [...document.querySelectorAll('section')].find((s) => s.querySelector('h2')?.textContent?.includes('Unsere IT-Kompetenzen'));
                    return sec.querySelectorAll('.reveal-stagger-item')[i];
                }, i);
                karten.push(await h.evaluate(REVEAL_ZUSTAND));
                if (i === anzahl - 1 && name.startsWith('375×812 Telefon')) await page.screenshot({ path: path.join(SCREENS, 'P1-start-375x812-karte-ki.png') });
            }
            protokoll.karten[name] = karten;
            const sectionOverflow = await page.evaluate(() => getComputedStyle([...document.querySelectorAll('section')].find((s) => s.querySelector('h2')?.textContent?.includes('Unsere IT-Kompetenzen'))).overflow);
            check(`P1a ${name}: zehn Karten der ServicesSection`, anzahl === 10, `${anzahl} Karten`);
            check(`P1a ${name}: bei allen zehn Karten timeline.source = <html> (nicht die Section)`, karten.length === 10 && karten.every((k) => k.quelle === 'html'), karten.map((k) => k.quelle).join(','));
            check(`P1a ${name}: alle zehn Karten zentriert opacity '1'`, karten.length === 10 && karten.every((k) => k.opacity === '1' && k.imBild), karten.map((k) => `${k.text}:${k.opacity}`).join(' | '));
            check(`P1a ${name}: Karte «KI-Telefonassistent» sichtbar (opacity 1)`, karten.find((k) => k.text.startsWith('KI-Telefonassistent'))?.opacity === '1');
            check(`P1a ${name}: Section overflow clip`, sectionOverflow === 'clip', sectionOverflow);
            check(`P1a ${name}: keine Konsolenfehler`, fehler.length === 0, fehler.slice(0, 3).join(' | '));
            await ctx.close();
        }

        // Stichprobe: letzte Reveal-Elemente vor dem Footer
        protokoll.stichprobe = {};
        for (const [name, vp, mobil] of [
            ['375×812', { width: 375, height: 812 }, true],
            ['1280×720', { width: 1280, height: 720 }, false],
        ]) {
            const { ctx, page } = await neueSeite(vp, { mobil, bewegung: true });
            for (const pfad of [KI_BASIS, '/it-support', '/leistungen', '/webdesign']) {
                await oeffne(page, pfad);
                const ziele = await page.evaluate(() => {
                    const main = document.querySelector('main');
                    return { items: main.querySelectorAll('.reveal-stagger-item').length, reveals: main.querySelectorAll('.reveal').length };
                });
                const zust = {};
                if (ziele.items) zust.letztesItem = await (await page.evaluateHandle(() => [...document.querySelectorAll('main .reveal-stagger-item')].pop())).evaluate(REVEAL_ZUSTAND);
                if (ziele.reveals) zust.letzteReveal = await (await page.evaluateHandle(() => [...document.querySelectorAll('main .reveal')].pop())).evaluate(REVEAL_ZUSTAND);
                protokoll.stichprobe[`${name} ${pfad}`] = { ...ziele, ...zust };
                const alle = Object.values(zust);
                check(
                    `P1a ${name} ${pfad}: letztes .reveal-stagger-item${ziele.items ? '' : ' (keins vorhanden)'} und letzte .reveal — Quelle <html>, opacity '1'`,
                    alle.length >= 1 && alle.every((z) => z.quelle === 'html' && z.opacity === '1'),
                    Object.entries(zust).map(([k, z]) => `${k}: «${z.text}» ${z.quelle} ${z.opacity}`).join(' | '),
                );
                // jedes overflow-hidden mit Reveal-Kindern ist jetzt clip (Regel greift)
                const hidden = await page.evaluate(() =>
                    [...document.querySelectorAll('.overflow-hidden')].filter((e) => e.querySelector('.reveal, .reveal-stagger-container')).map((e) => getComputedStyle(e).overflow),
                );
                check(`P1a ${name} ${pfad}: ${hidden.length} .overflow-hidden mit Reveal-Kindern haben overflow: clip`, hidden.every((o) => o === 'clip'), hidden.join(','));
            }
            await ctx.close();
        }
    }

    /* ---------------- P1b: Header-Abstand ---------------- */
    {
        protokoll.kopf = {};
        for (const [w, h, mobil] of [
            [375, 812, true],
            [768, 1024, true],
            [1024, 768, false],
            [1280, 800, false],
        ]) {
            const { ctx, page } = await neueSeite({ width: w, height: h }, { mobil });
            await oeffne(page, '/');
            const m = await page.evaluate(() => {
                const hb = document.querySelector('header').getBoundingClientRect();
                const main = document.querySelector('main');
                const inhalt = main.getBoundingClientRect().top + parseFloat(getComputedStyle(main).paddingTop);
                return { headerHoehe: hb.height, headerUnten: hb.bottom, mainOben: main.getBoundingClientRect().top, mainPadding: getComputedStyle(main).paddingTop, inhaltBeginn: inhalt };
            });
            protokoll.kopf[`${w}x${h}`] = m;
            check(`P1b ${w} px: Inhalt in <main> beginnt exakt an der Unterkante des Headers (Header ${m.headerHoehe} px, main ab ${m.mainOben} px + ${m.mainPadding})`, Math.abs(m.inhaltBeginn - m.headerUnten) < 0.5, JSON.stringify(m));
            await ctx.close();
        }
        protokoll.ueberzeile = {};
        for (const [w, h] of [
            [375, 640],
            [390, 740],
            [375, 812],
        ]) {
            const { ctx, page } = await neueSeite({ width: w, height: h }, { mobil: true });
            await oeffne(page, '/');
            const m = await page.evaluate(() => {
                const header = document.querySelector('header').getBoundingClientRect();
                const ue = [...document.querySelectorAll('main p')].find((p) => p.textContent.trim() === 'IT-Dienstleister Winterthur');
                const r = ue.getBoundingClientRect();
                const s = getComputedStyle(ue);
                return { headerUnten: header.bottom, oben: r.top, unten: r.bottom, sichtbar: r.height > 0 && s.visibility === 'visible' && s.opacity === '1' };
            });
            protokoll.ueberzeile[`${w}x${h}`] = m;
            check(`P1b ${w}×${h}: Überzeile «IT-Dienstleister Winterthur» vollständig unter dem Header (oben ${m.oben} ≥ ${m.headerUnten} + 12)`, m.sichtbar && m.oben >= m.headerUnten + 12, JSON.stringify(m));
            if (w === 375 && h === 640) await page.screenshot({ path: path.join(SCREENS, 'P1-hero-375x640.png') });
            await ctx.close();
        }
        protokoll.erstesElement = {};
        for (const [w, h, mobil] of [
            [375, 812, true],
            [1024, 768, false],
            [1280, 800, false],
        ]) {
            const { ctx, page } = await neueSeite({ width: w, height: h }, { mobil });
            for (const pfad of ['/', KI_BASIS, '/it-support', '/cloud-telefonie', '/kontakt']) {
                await oeffne(page, pfad);
                const m = await page.evaluate(() => {
                    const header = document.querySelector('header').getBoundingClientRect();
                    const e = [...document.querySelectorAll('main h1, main p')].find((x) => x.getBoundingClientRect().height > 0);
                    return { headerUnten: header.bottom, tag: e.tagName, text: e.textContent.trim().slice(0, 40), oben: e.getBoundingClientRect().top };
                });
                protokoll.erstesElement[`${w} ${pfad}`] = m;
                check(`P1b ${w} px ${pfad}: erstes h1/p im main nicht unter dem Header («${m.text}», ${Math.round(m.oben - m.headerUnten)} px Abstand)`, m.oben >= m.headerUnten, JSON.stringify(m));
            }
            await ctx.close();
        }
    }

    /* ---------------- P2: Menü-Icons ---------------- */
    {
        const sollIcon = new Map(nav.headerLinks().filter((l) => l.icon).map((l) => [`${l.titel}|${l.href}`, l.icon]));
        for (const [w, h] of [
            [1280, 800],
            [1024, 768],
        ]) {
            const { ctx, page, fehler } = await neueSeite({ width: w, height: h });
            await oeffne(page, '/');
            const leiste = await page.evaluate(() => {
                const n = [...document.querySelectorAll('header nav[aria-label="Hauptnavigation"]')].find((x) => !x.closest('#nav-mobil'));
                return [...n.querySelectorAll(':scope > ul > li')].map((li) => ({ text: li.getAttribute('data-leiste'), icons: [...li.querySelectorAll('svg[data-nav-icon]')].filter((s) => !s.closest('[id^="nav-panel-"]')).length }));
            });
            check(`P2 ${w} px: Leistenknöpfe ohne Icon`, leiste.length === 5 && leiste.every((l) => l.icons === 0), JSON.stringify(leiste));
            for (const id of ['leistungen', 'ki', 'cloud', 'unternehmen']) {
                await page.locator(`#nav-knopf-${id}`).click();
                await page.waitForTimeout(350);
                const z = await page.evaluate((id) => {
                    const p = document.getElementById(`nav-panel-${id}`);
                    const box = p.firstElementChild.getBoundingClientRect();
                    const s = getComputedStyle(p);
                    return {
                        sichtbar: s.visibility === 'visible',
                        breite: Math.round(box.width),
                        links: Math.round(box.left),
                        rechts: Math.round(box.right),
                        fenster: window.innerWidth,
                        eintraege: [...p.querySelectorAll('a')].map((a) => {
                            const k = a.cloneNode(true);
                            k.querySelectorAll('[data-badge]').forEach((b) => b.remove());
                            const svg = a.querySelector('svg[data-nav-icon]');
                            const r = svg?.getBoundingClientRect();
                            const t = [...a.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
                            const textLinks = t ? (() => { const rg = document.createRange(); rg.selectNodeContents(t); return rg.getBoundingClientRect().left; })() : null;
                            return {
                                titel: k.textContent.replace(/\s+/g, ' ').trim(),
                                href: a.getAttribute('href'),
                                icon: svg?.getAttribute('data-nav-icon') ?? null,
                                groesse: r ? [Math.round(r.width), Math.round(r.height)] : null,
                                ariaHidden: svg?.getAttribute('aria-hidden') ?? null,
                                vorText: r && textLinks !== null ? r.right <= textLinks + 0.5 : null,
                                abgeschnitten: a.scrollWidth > a.clientWidth + 1,
                            };
                        }),
                    };
                }, id);
                const mitPflicht = z.eintraege.filter((e) => !(e.titel === nav.LEISTUNGEN_UEBERSICHT.titel));
                const falsch = mitPflicht.filter((e) => e.icon !== sollIcon.get(`${e.titel}|${e.href}`) || !e.groesse || e.groesse[0] !== 16 || e.groesse[1] !== 16 || e.ariaHidden !== 'true' || e.vorText !== true);
                check(`P2 ${w} px Dropdown ${id}: ${mitPflicht.length} Einträge mit Icon (16 px, aria-hidden, vor dem Text), Zuordnung wie navigation.ts`, z.sichtbar && mitPflicht.length > 0 && falsch.length === 0, falsch.map((e) => JSON.stringify(e)).join(' | ') || mitPflicht.map((e) => `${e.titel}:${e.icon}`).join(', '));
                check(`P2 ${w} px Dropdown ${id}: Breite ${z.breite} px ≤ 640, im Fenster, kein Eintrag abgeschnitten`, z.breite <= 640 && z.links >= 0 && z.rechts <= z.fenster && z.eintraege.every((e) => !e.abgeschnitten), JSON.stringify({ breite: z.breite, links: z.links, rechts: z.rechts, abgeschnitten: z.eintraege.filter((e) => e.abgeschnitten).map((e) => e.titel) }));
                if (id === 'leistungen') {
                    const fuss = z.eintraege.find((e) => e.titel === nav.LEISTUNGEN_UEBERSICHT.titel);
                    check(`P2 ${w} px: «Alle Leistungen im Überblick» ohne Icon links (Pfeil rechts wie bisher)`, fuss && fuss.icon === null);
                }
                if (w === 1280 && (id === 'leistungen' || id === 'ki')) {
                    await page.screenshot({ path: path.join(SCREENS, `P2-menue-desktop-${id}.png`), clip: { x: 0, y: 0, width: 1280, height: 620 } });
                }
                await page.keyboard.press('Escape');
                await page.waitForTimeout(250);
            }
            check(`P2 ${w} px: keine Konsolenfehler`, fehler.length === 0, fehler.slice(0, 3).join(' | '));
            await ctx.close();
        }
        // Mobil
        const { ctx, page, fehler } = await neueSeite({ width: 375, height: 812 }, { mobil: true });
        await oeffne(page, '/');
        await page.locator('#nav-mobil-knopf').click();
        await page.waitForTimeout(350);
        const mobilErgebnis = {};
        for (const id of ['leistungen', 'ki', 'cloud', 'unternehmen']) {
            await page.locator(`#nav-mobil-knopf-${id}`).click();
            await page.waitForTimeout(400);
            const e = await page.evaluate((id) =>
                [...document.querySelectorAll(`#nav-mobil-${id} a`)].map((a) => {
                    const k = a.cloneNode(true);
                    k.querySelectorAll('[data-badge]').forEach((b) => b.remove());
                    const svg = a.querySelector('svg[data-nav-icon]');
                    const r = svg?.getBoundingClientRect();
                    return { titel: k.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href'), icon: svg?.getAttribute('data-nav-icon') ?? null, groesse: r ? [Math.round(r.width), Math.round(r.height)] : null, ariaHidden: svg?.getAttribute('aria-hidden') ?? null };
                }),
            id);
            mobilErgebnis[id] = e;
            const pflicht = e.filter((x) => x.titel !== nav.LEISTUNGEN_UEBERSICHT.titel);
            const falsch = pflicht.filter((x) => x.icon !== sollIcon.get(`${x.titel}|${x.href}`) || x.groesse?.[0] !== 16 || x.ariaHidden !== 'true');
            check(`P2 mobil 375: Akkordeon ${id} — ${pflicht.length} Einträge mit Icon wie navigation.ts`, pflicht.length > 0 && falsch.length === 0, falsch.map((x) => JSON.stringify(x)).join(' | '));
            if (id === 'ki') await page.screenshot({ path: path.join(SCREENS, 'P2-menue-mobil-ki.png') });
            await page.locator(`#nav-mobil-knopf-${id}`).click();
            await page.waitForTimeout(300);
        }
        await page.locator('#nav-mobil-knopf-leistungen').click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(SCREENS, 'P2-menue-mobil-leistungen.png') });
        const mobilLeiste = await page.evaluate(() => [...document.querySelectorAll('[id^="nav-mobil-knopf-"]')].map((b) => b.querySelectorAll('svg[data-nav-icon]').length));
        check('P2 mobil 375: Gruppenknöpfe des Akkordeons ohne Icon', mobilLeiste.every((n) => n === 0), mobilLeiste.join(','));
        check('P2 mobil 375: keine Konsolenfehler', fehler.length === 0, fehler.slice(0, 3).join(' | '));
        protokoll.mobilMenue = mobilErgebnis;
        await ctx.close();
    }

    /* ---------------- P3: Datenschutz, KI-Anbieter, Schriften ---------------- */
    {
        for (const [name, vp, mobil] of [
            ['1280', { width: 1280, height: 900 }, false],
            ['375', { width: 375, height: 812 }, true],
        ]) {
            const { ctx, page, fehler } = await neueSeite(vp, { mobil });
            await oeffne(page, '/datenschutz');
            const s = await page.evaluate(() => {
                const main = document.querySelector('main');
                const wrap = main.querySelector('table')?.parentElement;
                return {
                    titel: document.title,
                    beschreibung: document.querySelector('meta[name="description"]')?.content ?? null,
                    h1: main.querySelector('h1')?.textContent.trim(),
                    h2: [...main.querySelectorAll('h2')].map((h) => [h.id, h.textContent.trim()]),
                    h3: [...main.querySelectorAll('h3')].map((h) => h.textContent.trim()),
                    text: main.innerText,
                    tabelle: wrap ? { klasse: wrap.className, scrollW: wrap.scrollWidth, clientW: wrap.clientWidth, overflowX: getComputedStyle(wrap).overflowX, zeilen: main.querySelectorAll('table tbody tr').length, kopf: [...main.querySelectorAll('table thead th')].map((t) => t.textContent.trim()) } : null,
                    seiteBreite: document.documentElement.scrollWidth,
                    fenster: window.innerWidth,
                };
            });
            if (name === '1280') {
                check('P3 /datenschutz: <title> «Datenschutzerklärung | InfraOne IT Solutions»', s.titel === ds.DS_META.titel, s.titel);
                check('P3 /datenschutz: Meta-Description wortgleich', s.beschreibung === ds.DS_META.beschreibung, s.beschreibung);
                check('P3 /datenschutz: H1 und 11 h2 mit den Ankern aus dem Auftrag', s.h1 === ds.DS_TITEL && JSON.stringify(s.h2) === JSON.stringify(ds.DS_ABSCHNITTE.map((a) => [a.id, a.titel])), s.h2.map((x) => x[0]).join(','));
                const sollH3 = ds.DS_ABSCHNITTE.flatMap((a) => a.bloecke.filter((b) => b.art === 'h3').map((b) => b.text));
                check('P3 /datenschutz: fünf h3 im Abschnitt Testanruf', JSON.stringify(s.h3) === JSON.stringify(sollH3), s.h3.join(', '));
                const texte = [ds.DS_EINLEITUNG, ...ds.DS_ABSCHNITTE.flatMap((a) => a.bloecke.filter((b) => b.art === 'p').map((b) => b.text)), ds.DS_STAND];
                const fehlend = texte.filter((t) => !norm(s.text).includes(norm(t)));
                check(`P3 /datenschutz: alle ${texte.length} Absätze sichtbar und wortgleich`, fehlend.length === 0, fehlend.map((t) => t.slice(0, 60)).join(' | '));
                const zellen = ds.DS_DIENSTLEISTER.flat();
                check('P3 /datenschutz: Tabelle «Dienstleister» als <table>, 4 Spalten, 8 Zeilen, alle Zellen', s.tabelle && JSON.stringify(s.tabelle.kopf) === JSON.stringify([...ds.DS_DIENSTLEISTER_SPALTEN]) && s.tabelle.zeilen === 8 && zellen.every((z) => norm(s.text).includes(norm(z))), JSON.stringify(s.tabelle?.kopf));
                check('P3 /datenschutz: Namen der KI-Anbieter stehen hier (Gemini, OpenAI)', /Gemini/.test(s.text) && /OpenAI/.test(s.text));
                await page.screenshot({ path: path.join(SCREENS, 'P3-datenschutz-desktop.png') });
                await page.locator('#dienstleister').scrollIntoViewIfNeeded();
                await page.waitForTimeout(200);
                await page.screenshot({ path: path.join(SCREENS, 'P3-datenschutz-dienstleister-desktop.png') });
            } else {
                check('P3 /datenschutz 375: Tabelle im overflow-x-auto-Wrapper waagrecht scrollbar, Seite selbst nicht', s.tabelle && s.tabelle.overflowX === 'auto' && s.tabelle.scrollW > s.tabelle.clientW && s.seiteBreite <= s.fenster, JSON.stringify(s.tabelle) + ` Seite ${s.seiteBreite}/${s.fenster}`);
                await page.locator('#dienstleister').scrollIntoViewIfNeeded();
                await page.waitForTimeout(200);
                await page.screenshot({ path: path.join(SCREENS, 'P3-datenschutz-mobil-tabelle.png') });
            }
            check(`P3 /datenschutz ${name}: keine Konsolenfehler`, fehler.length === 0, fehler.slice(0, 3).join(' | '));
            await ctx.close();
        }

        // Anker der Demo und Sprung über den Satz-Link
        {
            const { ctx, page } = await neueSeite({ width: 1280, height: 900 });
            await oeffne(page, `${KI_BASIS}/sicherheit-datenschutz`);
            const links = await page.$$eval('main a[data-ki-anbieter-link]', (as) => as.map((a) => [a.getAttribute('href'), a.closest('p, li, div')?.textContent.replace(/\s+/g, ' ').trim()]));
            // Lead, Tabelle «Wo was läuft», Rechtlicher Rahmen und die FAQ-Antwort «Wo werden die Daten verarbeitet?»
            check('P3 /sicherheit-datenschutz: Satz «… steht in unserer Datenschutzerklärung.» 4× (Lead, Tabelle, Rechtsrahmen, FAQ) mit Link auf /datenschutz#dienstleister', links.length === 4 && links.every(([h, t]) => h === KI_ANBIETER_LINK && t.includes(KI_ANBIETER_SATZ)), JSON.stringify(links.map((l) => l[0])));
            await page.locator('main a[data-ki-anbieter-link]').first().click();
            await page.waitForURL(/\/datenschutz#dienstleister$/, { timeout: 15000 });
            await page.waitForTimeout(500);
            const lage = await page.evaluate(() => {
                const h = document.getElementById('dienstleister').getBoundingClientRect();
                return { oben: Math.round(h.top), headerUnten: Math.round(document.querySelector('header').getBoundingClientRect().bottom) };
            });
            check('P3: Klick auf den Link führt auf /datenschutz#dienstleister, Überschrift sichtbar unter dem Header', lage.oben >= lage.headerUnten && lage.oben < 400, JSON.stringify(lage));
            await ctx.close();
        }

        // Alle übrigen Seiten: kein Anbieter-Name im sichtbaren Text, in Meta-Angaben oder JSON-LD
        const sitemap = (await hole(`${BASE}/sitemap.xml`)).text;
        const pfade = [...sitemap.matchAll(/<loc>https:\/\/infraone\.ch([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
        const { ctx, page } = await neueSeite({ width: 1280, height: 900 });
        const funde = [];
        let geprueft = 0;
        const kiNewsEntfernt = [];
        for (const pfad of pfade) {
            if (pfad === '/datenschutz') continue;
            await page.goto(`${BASE}${pfad}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
            // [01.11.2026] AUFTRAG-116 (Nachtrag N2): Die A-114-Regel meint die KI-Anbieter, die WIR einsetzen — nicht fremde
            // Schlagzeilen. Die KI-News-Sektion (KINewsSection, RSS von the-decoder.de, /software-entwicklung) zeigt
            // Fremdinhalte, die sich täglich ändern (z. B. «ChatGPT …»). Sie wird darum vor der Textprüfung aus dem DOM
            // entfernt (Haken: data-ki-news). Meta-Angaben und JSON-LD bleiben vollständig geprüft.
            const t = await page.evaluate(() => {
                const kiNews = [...document.querySelectorAll('[data-ki-news]')];
                kiNews.forEach((n) => n.remove());
                const meta = [...document.querySelectorAll('meta[content]')].map((m) => m.content).join(' ');
                const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(' ');
                return { text: `${document.title} ${meta} ${document.body.innerText} ${ld}`, kiNews: kiNews.length };
            });
            if (t.kiNews) kiNewsEntfernt.push(`${pfad} (${t.kiNews})`);
            geprueft++;
            const m = t.text.match(ANBIETER_RE);
            if (m) funde.push(`${pfad}: «${m[0]}»`);
        }
        await ctx.close();
        console.log(`INFO  P3: KI-News-Sektion (Fremdinhalt, data-ki-news) vor der Prüfung entfernt auf: ${kiNewsEntfernt.join(', ') || 'keiner Seite (Feed leer)'}`);
        check(`P3: ${geprueft} Sitemap-Seiten ausser /datenschutz — kein Gemini/OpenAI/GPT-/ChatGPT in Text, Meta oder JSON-LD`, geprueft >= 70 && funde.length === 0, funde.join(' | '));
        for (const datei of ['/llms.txt', '/llms-full.txt']) {
            const r = await hole(`${BASE}${datei}`);
            check(`P3: ${datei} ohne Anbieter-Namen`, r.status === 200 && !ANBIETER_RE.test(r.text), r.text.match(ANBIETER_RE)?.[0] ?? '');
        }
        protokoll.anbieterSuche = { seiten: geprueft, funde, kiNewsEntfernt };

        // Schriften: beim Laden von / keine Anfrage an Google Fonts
        {
            const { ctx, page } = await neueSeite({ width: 1280, height: 900 });
            const anfragen = [];
            page.on('request', (r) => anfragen.push(r.url()));
            await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 });
            const google = anfragen.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u));
            const schriften = anfragen.filter((u) => /\.woff2?(\?|$)/.test(u));
            const hinweise = await page.evaluate(() => [...document.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]')].map((l) => l.href));
            check('P3: beim Laden von / keine Anfrage an fonts.googleapis.com / fonts.gstatic.com', google.length === 0, google.join(', '));
            check('P3: Schriften kommen vom eigenen Server (/_next/static/media)', schriften.length > 0 && schriften.every((u) => u.startsWith(`${BASE}/_next/static/media/`)), schriften.map((u) => u.replace(BASE, '')).join(', '));
            check('P3: keine preconnect/dns-prefetch-Hinweise auf Google Fonts im <head>', !hinweise.some((h) => /fonts\.(googleapis|gstatic)/.test(h)), hinweise.join(', '));
            protokoll.schriften = { anfragenGesamt: anfragen.length, google, schriften: schriften.map((u) => u.replace(BASE, '')) };
            await ctx.close();
        }
    }

    /* ---------------- P4: Preise, SMS verfügbar ---------------- */
    {
        const { ctx, page, fehler } = await neueSeite({ width: 1280, height: 900 });
        await oeffne(page, KI_PREISE_PFAD);
        const karten = await page.evaluate(() =>
            [...document.querySelectorAll('article[id^="paket-"]')].map((a) => ({
                id: a.id.replace('paket-', ''),
                empfehlung: a.textContent.includes('Empfehlung'),
                merkmale: [...a.querySelectorAll('ul li')].map((li) => {
                    const k = li.cloneNode(true);
                    const badge = !!k.querySelector('[data-in-entwicklung]');
                    k.querySelectorAll('[data-in-entwicklung]').forEach((b) => b.remove());
                    return { text: k.textContent.replace(/\s+/g, ' ').trim(), badge };
                }),
                knopf: (() => { const x = a.querySelector('a[data-paket-anfrage]'); return x ? [x.textContent.trim(), x.getAttribute('href')] : null; })(),
            })),
        );
        protokoll.paketkarten = karten;
        const k = (id) => karten.find((x) => x.id === id);
        const sms = (id) => k(id)?.merkmale.find((m) => m.text === 'SMS-Bestätigung an Anrufende');
        const kal = (id) => k(id)?.merkmale.find((m) => m.text === 'Termine im Microsoft-365-Kalender');
        check('P4 /preise: SMS-Bestätigung ohne Badge bei Starter, Business, Enterprise', ['starter', 'business', 'enterprise'].every((id) => sms(id) && !sms(id).badge), JSON.stringify(['starter', 'business', 'enterprise'].map((id) => sms(id))));
        check(`P4 /preise: «Termine im Microsoft-365-Kalender» mit Badge «${IN_ENTWICKLUNG}» bei Starter, Business, Enterprise`, ['starter', 'business', 'enterprise'].every((id) => kal(id)?.badge));
        check('P4 /preise: Lite unverändert (100 Gesprächsminuten, 1 Telefonnummer)', JSON.stringify(k('lite')?.merkmale.map((m) => m.text)) === JSON.stringify(['100 Gesprächsminuten pro Monat', '1 Telefonnummer']));
        check('P4 /preise: Merkmale je Paket wie src/lib/ki-telefonassistent-preise.ts (sichtbar)', PAKETE.every((p) => JSON.stringify(k(p.id)?.merkmale.map((m) => m.text)) === JSON.stringify(p.merkmale.map((m) => m.replace(' (in Entwicklung, kommt bald)', '')))));
        check('P4 /preise: Plakette «Empfehlung» nur am Starter', karten.filter((x) => x.empfehlung).map((x) => x.id).join() === 'starter');
        check('P4 /preise: Knopf der Paketkarten «Anfragen» → #anfrage-<paketid>', karten.every((x) => x.knopf?.[0] === anf.ANFRAGE_TEXTE.paketKnopf && x.knopf?.[1] === `#anfrage-${x.id}`), JSON.stringify(karten.map((x) => x.knopf)));
        await page.locator('#pakete').scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await page.locator('#pakete').screenshot({ path: path.join(SCREENS, 'P4-preise-pakete.png') });
        check('P4 /preise: keine Konsolenfehler', fehler.length === 0, fehler.slice(0, 3).join(' | '));
        await ctx.close();

        // Im ganzen KI-Bereich: keine Badge an einem Eintrag, der die SMS nennt (ausser im Kalender-Satz)
        const kalenderErsterSatz = KALENDER_SATZ.split('. ')[0];
        const { ctx: c2, page: p2 } = await neueSeite({ width: 1280, height: 900 });
        const smsBadges = [];
        let badges = 0;
        for (const s of KI_SEITEN) {
            await oeffne(p2, s.pfad);
            const r = await p2.evaluate((satz) =>
                [...document.querySelectorAll('main [data-in-entwicklung]')].map((b) => {
                    const eintrag = b.closest('li, p, td, tr, article, dd, dt') ?? b.parentElement;
                    const t = eintrag.textContent.replace(/\s+/g, ' ').trim();
                    return { t: t.slice(0, 160), sms: /SMS/.test(t) && !t.includes(satz) };
                }),
            kalenderErsterSatz);
            badges += r.length;
            for (const x of r) if (x.sms) smsBadges.push(`${s.pfad}: «${x.t}»`);
        }
        await c2.close();
        check(`P4: ${KI_SEITEN.length} Seiten des KI-Bereichs, ${badges} Badges — keine an einem Eintrag, der die SMS nennt`, badges > 0 && smsBadges.length === 0, smsBadges.slice(0, 5).join(' | '));
        protokoll.smsBadges = { seiten: KI_SEITEN.length, badges, smsBadges };
    }

    /* ---------------- P5: Direkte Anfrage ---------------- */
    {
        const T = anf.ANFRAGE_TEXTE;
        // 1) Hub, ohne Testanruf: Formular sichtbar und vollständig
        const { ctx, page, fehler } = await neueSeite({ width: 1280, height: 900 });
        const formPosts = [];
        page.on('request', (r) => {
            if (r.method() === 'POST' && r.url().includes('/__forms.html')) formPosts.push(r.postData() ?? '');
        });
        await oeffne(page, KI_BASIS);
        const f = await page.evaluate(() => {
            const sec = document.getElementById('anfrage');
            const r = sec?.getBoundingClientRect();
            const sel = document.getElementById('anfrage-paket');
            const label = (id) => document.querySelector(`label[for="${id}"]`)?.textContent.replace(/\s+/g, ' ').trim();
            return {
                vorhanden: !!sec,
                hoehe: r ? Math.round(r.height) : 0,
                text: sec?.innerText ?? '',
                optionen: sel ? [...sel.options].map((o) => o.textContent) : [],
                vorgabe: sel?.value,
                labels: ['anfrage-name', 'anfrage-firma', 'anfrage-email', 'anfrage-telefon', 'anfrage-paket', 'anfrage-website', 'anfrage-nachricht'].map(label),
                required: ['anfrage-name', 'anfrage-firma', 'anfrage-email', 'anfrage-telefon', 'anfrage-website', 'anfrage-nachricht'].map((id) => document.getElementById(id)?.required),
                honig: !!sec?.querySelector('input[name="bot-field"]'),
                demoAnruf: !!document.querySelector('#ki-demo-anruf-titel'),
                reihenfolge: (() => {
                    const ids = [...document.querySelectorAll('main > section, main > div > section, main section[id]')].map((s) => s.id).filter(Boolean);
                    return ids;
                })(),
                nachPreis: (() => {
                    const preis = document.getElementById('preise');
                    return !!preis && !!sec && (preis.compareDocumentPosition(sec) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
                })(),
                vorFaq: (() => {
                    const faq = [...document.querySelectorAll('main h2')].find((h) => h.textContent.trim() === 'Häufige Fragen');
                    return !!faq && !!sec && (sec.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
                })(),
            };
        });
        check('P5 Hub: Section #anfrage vorhanden und sichtbar — ohne Testanruf (kein Anrufzustand)', f.vorhanden && f.hoehe > 300 && !f.demoAnruf, `Höhe ${f.hoehe}`);
        check('P5 Hub: Formular nach dem Preis-Teaser (#preise) und vor den FAQ', f.nachPreis && f.vorFaq);
        check('P5 Hub: Überzeile, Titel, Lead, Knopf, Einwilligung wortgleich', [T.ueberzeile, T.titel, T.lead, T.knopf, T.einwilligung].every((t) => norm(f.text).includes(norm(t))), norm(f.text).slice(0, 200));
        check('P5 Hub: Felder Name*, Firma*, E-Mail*, Telefon*, Paket, Website der Firma (optional), Nachricht (optional)', JSON.stringify(f.labels) === JSON.stringify(['Name *', 'Firma *', 'E-Mail *', 'Telefon *', 'Paket', 'Website der Firma (optional)', 'Nachricht (optional)']) && JSON.stringify(f.required) === JSON.stringify([true, true, true, true, false, false]) && f.honig, JSON.stringify(f.labels));
        check('P5 Hub: Paket-Auswahl «Lite, Starter, Business, Enterprise, Noch unsicher», Vorgabe «Starter»', JSON.stringify(f.optionen) === JSON.stringify([...anf.ANFRAGE_PAKETE]) && f.vorgabe === 'Starter', `${f.optionen.join(', ')} / ${f.vorgabe}`);
        await page.locator('#anfrage').scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await page.locator('#anfrage').screenshot({ path: path.join(SCREENS, 'P5-anfrage-formular-desktop.png') });

        // 2) Pflichtfelder: leeres Absenden sendet nichts
        await page.locator('#anfrage button[type="submit"]').click();
        await page.waitForTimeout(400);
        const ungueltig = await page.evaluate(() => [...document.querySelectorAll('#anfrage :invalid')].map((e) => e.id).filter(Boolean));
        check('P5 Pflichtfelder: leeres Absenden sendet nichts, Name/Firma/E-Mail/Telefon ungültig', formPosts.length === 0 && JSON.stringify(ungueltig) === JSON.stringify(['anfrage-name', 'anfrage-firma', 'anfrage-email', 'anfrage-telefon']), `${formPosts.length} POST, ungültig: ${ungueltig.join(',')}`);
        await page.fill('#anfrage-email', 'kein-mail');
        const emailUngueltig = await page.evaluate(() => document.getElementById('anfrage-email').matches(':invalid'));
        check('P5 Pflichtfelder: E-Mail ohne @ ist ungültig', emailUngueltig);

        // 3) Firma aus dem Testanruf (sessionStorage, wie KiDemo) beim Sprung auf #anfrage
        await page.evaluate((k) => sessionStorage.setItem(k, 'Muster Test AG'), anf.ANFRAGE_FIRMA_SCHLUESSEL);
        await page.evaluate(() => { location.hash = 'anfrage'; });
        await page.waitForTimeout(300);
        const firma = await page.evaluate((k) => ({ wert: document.getElementById('anfrage-firma').value, rest: sessionStorage.getItem(k) }), anf.ANFRAGE_FIRMA_SCHLUESSEL);
        check('P5 Testanruf→Anfrage: Firma aus sessionStorage «ki-anfrage-firma» steht vor, Schlüssel danach gelöscht', firma.wert === 'Muster Test AG' && firma.rest === null, JSON.stringify(firma));

        // 4) Knöpfe «Assistent anfragen»: Hub-Abschluss auf #anfrage (gleiche Seite)
        const knoepfeHub = await page.$$eval('main a[data-anfrage-knopf]', (as) => as.map((a) => [a.textContent.trim(), a.getAttribute('href')]));
        check('P5 Hub: Abschluss-CTA «Assistent anfragen» → #anfrage (natives <a>)', knoepfeHub.length >= 1 && knoepfeHub.every(([t, h]) => t === T.cta && h === '#anfrage'), JSON.stringify(knoepfeHub));
        check('P5 Hub: keine Konsolenfehler', fehler.length === 0, fehler.slice(0, 3).join(' | '));
        await ctx.close();

        // 5) Unterseite: Hero-Knopf führt auf das Formular des Hubs
        {
            const { ctx, page } = await neueSeite({ width: 1280, height: 900 });
            await oeffne(page, `${KI_BASIS}/funktionen`);
            const k = await page.$$eval('main a[data-anfrage-knopf]', (as) => as.map((a) => [a.textContent.trim(), a.getAttribute('href'), a.tagName]));
            check('P5 /funktionen: Hero und Abschluss «Assistent anfragen» → /ki-telefonassistent#anfrage (natives <a>), kein «Beratung vereinbaren»', k.length === 2 && k.every(([t, h, tag]) => t === T.cta && h === anf.ANFRAGE_HREF && tag === 'A') && !(await page.locator('main').innerText()).includes('Beratung vereinbaren'), JSON.stringify(k));
            await page.locator('main a[data-anfrage-knopf]').first().click();
            await page.waitForURL(/\/ki-telefonassistent#anfrage$/, { timeout: 20000 });
            await page.waitForTimeout(800);
            const lage = await page.evaluate(() => {
                const r = document.getElementById('anfrage').getBoundingClientRect();
                return { oben: Math.round(r.top), unten: Math.round(r.bottom), fenster: window.innerHeight };
            });
            check('P5 /funktionen → Klick «Assistent anfragen» landet beim Formular auf dem Hub', lage.oben < lage.fenster && lage.unten > 0, JSON.stringify(lage));
            await ctx.close();
        }

        // 6) /preise: Formular unter den Paketkarten, Knopf «Anfragen» wählt das Paket vor
        {
            const { ctx, page, fehler } = await neueSeite({ width: 1280, height: 900 });
            await oeffne(page, KI_PREISE_PFAD);
            const reihenfolge = await page.evaluate(() => {
                const pakete = document.getElementById('pakete');
                const a = document.getElementById('anfrage');
                const rechner = document.getElementById('rechner');
                return !!pakete && !!a && !!rechner && (pakete.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 && (a.compareDocumentPosition(rechner) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
            });
            check('P5 /preise: Formular #anfrage unter den Paketkarten (vor dem Rechner)', reihenfolge);
            await page.locator('a[data-paket-anfrage="business"]').click();
            await page.waitForTimeout(600);
            const z = await page.evaluate(() => ({ hash: location.hash, paket: document.getElementById('anfrage-paket').value, oben: Math.round(document.getElementById('anfrage').getBoundingClientRect().top), fenster: window.innerHeight }));
            check('P5 /preise: Klick «Anfragen» bei Business → #anfrage-business, Paket «Business» vorgewählt, Formular im Bild', z.hash === '#anfrage-business' && z.paket === 'Business' && z.oben < z.fenster, JSON.stringify(z));
            await page.locator('a[data-paket-anfrage="lite"]').scrollIntoViewIfNeeded();
            await page.locator('a[data-paket-anfrage="lite"]').click();
            await page.waitForTimeout(500);
            check('P5 /preise: danach «Anfragen» bei Lite → Paket «Lite»', (await page.inputValue('#anfrage-paket')) === 'Lite');
            const abschluss = await page.$$eval('main a[data-anfrage-knopf]', (as) => as.map((a) => a.getAttribute('href')));
            check('P5 /preise: Abschluss-CTA «Assistent anfragen» → #anfrage (eigenes Formular)', abschluss.length === 1 && abschluss[0] === '#anfrage', abschluss.join(','));
            check('P5 /preise: keine Konsolenfehler', fehler.length === 0, fehler.slice(0, 3).join(' | '));
            await ctx.close();
            // direkter Aufruf mit Hash
            const { ctx: c3, page: p3 } = await neueSeite({ width: 375, height: 812 }, { mobil: true });
            await oeffne(p3, `${KI_BASIS}#anfrage-enterprise`);
            await p3.waitForTimeout(500);
            const zz = await p3.evaluate(() => ({ paket: document.getElementById('anfrage-paket').value, oben: Math.round(document.getElementById('anfrage').getBoundingClientRect().top), fenster: window.innerHeight }));
            check('P5 mobil: Aufruf /ki-telefonassistent#anfrage-enterprise → Paket «Enterprise», Formular im Bild', zz.paket === 'Enterprise' && zz.oben < zz.fenster, JSON.stringify(zz));
            await p3.locator('#anfrage').screenshot({ path: path.join(SCREENS, 'P5-anfrage-formular-mobil.png') });
            await c3.close();
        }

        // 7) Erfolg (Netlify simuliert: POST abgefangen, 200) — Formular wird ersetzt
        {
            const { ctx, page } = await neueSeite({ width: 1280, height: 900 });
            let gesendet = null;
            await page.route('**/__forms.html', async (route) => {
                if (route.request().method() !== 'POST') return route.continue();
                gesendet = route.request().postData();
                return route.fulfill({ status: 200, contentType: 'text/html', body: 'ok' });
            });
            await oeffne(page, KI_PREISE_PFAD);
            await page.fill('#anfrage-name', 'Test Person');
            await page.fill('#anfrage-firma', 'Muster Test AG');
            await page.fill('#anfrage-email', 'test@example.invalid');
            await page.fill('#anfrage-telefon', '000');
            await page.selectOption('#anfrage-paket', 'Business');
            await page.fill('#anfrage-website', 'muster-test.invalid');
            await page.fill('#anfrage-nachricht', 'Testanfrage AUFTRAG-114');
            await page.locator('#anfrage button[type="submit"]').click();
            await page.waitForSelector('[data-anfrage-erfolg]', { timeout: 10000 });
            const p = new URLSearchParams(gesendet ?? '');
            const erfolg = await page.locator('[data-anfrage-erfolg]').innerText();
            check('P5 Erfolg (POST abgefangen): Felder wie der Kostenrechner (form-name=contact, Betreff KI-Telefonassistent, message «Paket: … / Website: … / Nachricht: …»)', p.get('form-name') === 'contact' && p.get('subject') === 'KI-Telefonassistent' && p.get('name') === 'Test Person' && p.get('company') === 'Muster Test AG' && p.get('email') === 'test@example.invalid' && p.get('phone') === '000' && p.get('message') === 'Paket: Business / Website: muster-test.invalid / Nachricht: Testanfrage AUFTRAG-114' && p.has('bot-field') && p.get('bot-field') === '', gesendet);
            check('P5 Erfolg: Text wortgleich, Formular ersetzt', norm(erfolg) === norm(T.erfolg) && (await page.locator('[data-anfrage-formular]').count()) === 0, erfolg);
            await page.locator('#anfrage').screenshot({ path: path.join(SCREENS, 'P5-anfrage-erfolg-simuliert.png') });
            await ctx.close();
        }

        // 8) Fehlerpfad lokal (kein Netlify: POST → 500) → Meldung, nach 1,5 s /kontakt vorbefüllt
        {
            const { ctx, page } = await neueSeite({ width: 1280, height: 900 });
            let status = null;
            page.on('response', (r) => {
                if (r.request().method() === 'POST' && r.url().includes('/__forms.html')) status = r.status();
            });
            await oeffne(page, KI_BASIS);
            await page.fill('#anfrage-name', 'Test Person');
            await page.fill('#anfrage-firma', 'Muster Test AG');
            await page.fill('#anfrage-email', 'test@example.invalid');
            await page.fill('#anfrage-telefon', '000');
            await page.selectOption('#anfrage-paket', 'Enterprise');
            await page.fill('#anfrage-nachricht', 'Testanfrage Fehlerpfad');
            const t0 = Date.now();
            await page.locator('#anfrage button[type="submit"]').click();
            await page.waitForSelector('[data-anfrage-fehler]', { timeout: 10000 });
            const meldung = await page.locator('[data-anfrage-fehler]').innerText();
            await page.locator('#anfrage').screenshot({ path: path.join(SCREENS, 'P5-anfrage-fehlerpfad-meldung.png') });
            await page.waitForURL(/\/kontakt\?/, { timeout: 15000 });
            const dauer = Date.now() - t0;
            await page.waitForTimeout(800);
            const k = await page.evaluate(() => ({ url: location.pathname + location.search, betreff: document.getElementById('subject')?.value, nachricht: document.getElementById('message')?.value }));
            const q = new URL(k.url, BASE).searchParams;
            check('P5 Fehlerpfad: lokal antwortet /__forms.html nicht mit 2xx', status !== null && (status < 200 || status >= 300), String(status));
            check('P5 Fehlerpfad: Meldung wortgleich', norm(meldung) === norm(T.fehler), meldung);
            check('P5 Fehlerpfad: nach ~1,5 s auf /kontakt', dauer >= 1400 && dauer < 8000, `${dauer} ms`);
            check('P5 Fehlerpfad: /kontakt mit Betreff «KI-Telefonassistent» vorbefüllt, Nachricht mit Firma/Paket/Nachricht, ohne Name/E-Mail/Telefon in der Adresse', k.betreff === 'KI-Telefonassistent' && q.get('subject') === 'KI-Telefonassistent' && /Firma: Muster Test AG/.test(k.nachricht ?? '') && /Paket: Enterprise/.test(k.nachricht ?? '') && /Nachricht: Testanfrage Fehlerpfad/.test(k.nachricht ?? '') && !/Test Person|example\.invalid|\b000\b/.test(decodeURIComponent(k.url.replace(/\+/g, ' '))), JSON.stringify(k));
            // Formular auf /kontakt mit vorbefülltem Betreff und Nachricht
            await page.locator('#subject').scrollIntoViewIfNeeded();
            await page.waitForTimeout(300);
            await page.locator('form:has(#subject)').screenshot({ path: path.join(SCREENS, 'P5-kontakt-nach-fehlerpfad.png') });
            protokoll.fehlerpfad = { status, dauerMs: dauer, kontakt: k };
            await ctx.close();
        }
    }
} finally {
    await browser.close();
}

writeFileSync(path.join(SCREENS, 'browser-test.json'), JSON.stringify({ ...protokoll, ergebnisse }, null, 1));
const fehler = ergebnisse.filter((e) => !e.ok).length;
console.log(`\n${ergebnisse.length - fehler}/${ergebnisse.length} Browser-Prüfungen bestanden. Screens: ${SCREENS}`);
process.exit(fehler ? 1 : 0);
