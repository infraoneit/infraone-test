#!/usr/bin/env node
/**
 * auftrag116-browser-test.mjs (AUFTRAG-116) — Sicherheits-Header/CSP, Antwort-Kapsel, Aktualitätssignale, Footer.
 *
 * [01.11.2026] AUFTRAG-116: Gegen einen EIGENEN Produktions-Server (Vorgabe http://localhost:3005, nie :3000),
 * Build zuvor (`npm run build`, `next start -p 3005`).
 * P8  Auf /, /ki-telefonassistent, /ki-telefonassistent/preise, /ki-telefonassistent/branchen/elektriker, /kontakt,
 *     /blog, erstem Blogbeitrag, /datenschutz, /it-support/winterthur, /leistungen — je dunkel und hell:
 *     console + pageerror + securitypolicyviolation → 0 Meldungen mit «Content Security Policy»/«Refused to»,
 *     0 Seitenfehler; HTML-Antwort trägt die vier Header (Werte = next.config.ts); Theme-Umschalter wechselt die
 *     Klasse `dark` am <html>. /api/demo/scan (POST ohne Body → 4xx) und /keystatic ohne CSP.
 *     /kontakt: Karte (iframe google.com/maps mit contentWindow — oder, seit 023ff46, das statische Kartenbild).
 *     CSP-Probe (ohne Netz, alle Fremdadressen per route() beantwortet): jede Quelle des Inventars wird
 *     zugelassen, fremde Skripte/iframes/Abfragen werden blockiert (Gegenprobe beweist, dass die CSP greift).
 * P4/P3/P5  Hub: Überzeile, H1, #antwort wortgleich und 40–60 Wörter, <time dateTime> = lastmod, speakable im
 *     JSON-LD; Footer-Regionszeile mit 6 Links auf jeder geprüften Seite; nirgends href="/telefonie";
 *     hreflang x-default; Logo-Link mit aria-label; Startseiten-Titel; Brotkrumen-Zeile mit «Aktualisiert am»
 *     auf /ki-telefonassistent/funktionen (rechts neben den Brotkrumen bei 1280 px).
 * P2/P7  Sitemap 78 URLs mit echten lastmod; llms.txt und Schlüsseldatei werden ausgeliefert.
 * Screens: Hub-Hero dunkel/hell bei 1280 und 375, Footer-Regionszeile, Brotkrumen-Zeile mit «Aktualisiert am».
 *
 * Sicherheit: /api/demo/** im Browser abgefangen (418) — kein Scan, kein Anruf. Fremdadressen (Cloudflare,
 * Google, example.*) werden im Browser beantwortet, nichts geht ins Netz; RUM-Meldungen an Cloudflare entfallen.
 *
 *   $env:BASE_URL='http://localhost:3005'; node scripts/auftrag116-browser-test.mjs
 *
 * Node ≥ 22.18 (Type-Stripping für die .ts-Quellen).
 */
import { chromium } from 'playwright-core';
import { registerHooks } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
        if (url.startsWith('file:') && url.endsWith('.json')) {
            return { format: 'module', source: `export default ${readFileSync(fileURLToPath(url), 'utf8')};`, shortCircuit: true };
        }
        return weiter(url, k);
    },
});
const lade = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const { KI_BASIS } = await lade('src/components/ki-telefonassistent/seiten.ts');
const hub = await lade('src/components/ki-telefonassistent/hub-texte.ts');
const lastmod = await lade('src/lib/seo/lastmod.ts');
const { IT_SUPPORT_REGIONEN } = await lade('src/lib/regionen.ts');
const { INDEXNOW_KEY } = await lade('src/lib/seo/indexnow.ts');
const nextConfig = (await lade('next.config.ts')).default;
const envVorher = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';
const SOLL_HEADER = Object.fromEntries((await nextConfig.headers())[0].headers.map((h) => [h.key.toLowerCase(), h.value]));
process.env.NODE_ENV = envVorher;
const LM = JSON.parse(readFileSync(path.join(ROOT, 'src/generated/lastmod.json'), 'utf8'));

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
const SCREENS = process.env.SCREENS_DIR || path.join(ergebnisOrdner(), 'A116-screens');
mkdirSync(SCREENS, { recursive: true });

const ergebnisse = [];
function check(name, ok, detail = '') {
    ergebnisse.push({ name, ok: !!ok, detail: String(detail).slice(0, 1200) });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + String(detail).slice(0, 300) : ''}`);
}
const protokoll = { zeit: new Date().toISOString(), basis: BASE, seiten: {} };
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const CSP_RE = /Content Security Policy|Refused to/i;

/* ------------------------------------------------------------------ */
/* Hilfen                                                              */
/* ------------------------------------------------------------------ */
const browser = await chromium.launch({ executablePath: CHROME, headless: true });

/** Fremdadressen im Browser beantworten (kein Netz). Die CSP prüft der Browser VOR der Anfrage. */
async function fremdeAdressenAbfangen(ctx) {
    await ctx.route('**/api/demo/**', (route) => route.fulfill({ status: 418, contentType: 'application/json', body: '{"fehler":"A116-Test: Demo-API gesperrt"}' }));
    await ctx.route(/^https:\/\/(static\.cloudflareinsights\.com|cloudflareinsights\.com|challenges\.cloudflare\.com|www\.google\.com|maps\.google\.com|example\.com|example\.org)\//, (route) => {
        const u = route.request().url();
        if (/\.js(\?|$)/.test(u)) return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* A116-Attrappe */' });
        if (/\.png(\?|$)/.test(u)) return route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
        if (route.request().method() === 'POST') return route.fulfill({ status: 204, body: '' });
        return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>A116-Attrappe</title><p>ok</p>' });
    });
}

async function neueSeite(viewport, { theme = 'dark', mobil = false } = {}) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: mobil ? 2 : 1, isMobile: mobil, hasTouch: mobil, locale: 'de-CH', reducedMotion: 'reduce' });
    await ctx.addInitScript((t) => {
        try {
            localStorage.setItem('theme', t);
        } catch {
            /* egal */
        }
        window.__cspVerstoesse = [];
        document.addEventListener('securitypolicyviolation', (e) => window.__cspVerstoesse.push(`${e.violatedDirective} ${e.blockedURI}`));
    }, theme);
    await fremdeAdressenAbfangen(ctx);
    const page = await ctx.newPage();
    const meldungen = { csp: [], seitenfehler: [], konsole: [] };
    page.on('pageerror', (e) => meldungen.seitenfehler.push(e.message));
    page.on('console', (m) => {
        const t = m.text();
        if (CSP_RE.test(t)) meldungen.csp.push(t);
        else if (m.type() === 'error' && !/api\/demo|418|Failed to load resource/i.test(t)) meldungen.konsole.push(t);
    });
    return { ctx, page, meldungen };
}

async function oeffne(page, pfad) {
    const r = await page.goto(`${BASE}${pfad}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(300);
    return r;
}

/** in Schritten bis ans Seitenende scrollen (lädt Lazy-Inhalte, damit auch deren CSP geprüft wird) */
async function durchscrollen(page) {
    await page.evaluate(async () => {
        const schritt = Math.max(400, Math.floor(window.innerHeight * 0.8));
        for (let y = 0; y < document.documentElement.scrollHeight; y += schritt) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, document.documentElement.scrollHeight);
        await new Promise((r) => setTimeout(r, 300));
        window.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);
}

async function themeUmschalten(page) {
    const knopf = page.locator('button[aria-label="Theme umschalten"]:visible').first();
    const vorher = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await knopf.click();
    await page.waitForTimeout(250);
    const nachher = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await knopf.click();
    await page.waitForTimeout(250);
    const zurueck = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    return { vorher, nachher, zurueck, ok: vorher !== nachher && zurueck === vorher };
}

try {
    /* ---------------- erster Blogbeitrag ermitteln ---------------- */
    let ersterBeitrag = null;
    {
        const { ctx, page } = await neueSeite({ width: 1280, height: 800 });
        await oeffne(page, '/blog');
        ersterBeitrag = await page.evaluate(() => [...document.querySelectorAll('main a[href^="/blog/"]')].map((a) => a.getAttribute('href')).find((h) => /^\/blog\/[a-z0-9-]+$/.test(h)) ?? null);
        await ctx.close();
    }
    check('Vorbereitung: erster Blogbeitrag auf /blog gefunden', !!ersterBeitrag, ersterBeitrag);

    const SEITEN = ['/', KI_BASIS, `${KI_BASIS}/preise`, `${KI_BASIS}/branchen/elektriker`, '/kontakt', '/blog', ersterBeitrag, '/datenschutz', '/it-support/winterthur', '/leistungen'].filter(Boolean);

    /* ---------------- P8: zehn Seiten × dunkel/hell ---------------- */
    for (const theme of ['dark', 'light']) {
        const { ctx, page, meldungen } = await neueSeite({ width: 1280, height: 800 }, { theme });
        for (const pfad of SEITEN) {
            meldungen.csp.length = 0;
            meldungen.seitenfehler.length = 0;
            meldungen.konsole.length = 0;
            const r = await oeffne(page, pfad);
            const kopf = r.headers();
            await durchscrollen(page);
            const verstoesse = await page.evaluate(() => window.__cspVerstoesse.slice());
            const dom = await page.evaluate(() => ({
                dark: document.documentElement.classList.contains('dark'),
                telefonie: document.querySelectorAll('a[href="/telefonie"]').length,
                regionen: [...document.querySelectorAll('nav[aria-label="IT-Support nach Region"] a')].map((a) => a.getAttribute('href')),
                xDefault: document.querySelector('link[rel="alternate"][hreflang="x-default"]')?.getAttribute('href') ?? null,
                deCH: document.querySelector('link[rel="alternate"][hreflang="de-CH"]')?.getAttribute('href') ?? null,
                logo: document.querySelector('header a[href="/"]')?.getAttribute('aria-label') ?? null,
                titel: document.title,
            }));
            const umschalter = await themeUmschalten(page);
            const name = `${pfad} (${theme === 'dark' ? 'dunkel' : 'hell'})`;
            protokoll.seiten[name] = { status: r.status(), dom, umschalter, verstoesse, csp: meldungen.csp.slice(), seitenfehler: meldungen.seitenfehler.slice(), konsole: meldungen.konsole.slice() };
            const fehlendeHeader = Object.entries(SOLL_HEADER).filter(([k, v]) => kopf[k] !== v).map(([k]) => k);
            check(`P8 ${name}: HTTP 200, vier Sicherheits-Header mit den Werten aus next.config.ts`, r.status() === 200 && fehlendeHeader.length === 0, fehlendeHeader.join(', ') || `${r.status()}`);
            check(`P8 ${name}: 0 CSP-Meldungen («Content Security Policy»/«Refused to», securitypolicyviolation), 0 Seitenfehler`, meldungen.csp.length === 0 && verstoesse.length === 0 && meldungen.seitenfehler.length === 0, [...meldungen.csp, ...verstoesse, ...meldungen.seitenfehler].slice(0, 3).join(' | '));
            check(`P8 ${name}: Theme ${theme === 'dark' ? 'dunkel' : 'hell'} aktiv, Umschalter wechselt die Klasse dark am <html> (hin und zurück)`, dom.dark === (theme === 'dark') && umschalter.ok, JSON.stringify(umschalter));
            check(`P5 ${name}: Footer-Regionszeile mit 6 Links, kein href="/telefonie"`, JSON.stringify(dom.regionen) === JSON.stringify(IT_SUPPORT_REGIONEN.map((x) => `/it-support/${x.slug}`)) && dom.telefonie === 0, `${dom.regionen.length} Links, /telefonie ${dom.telefonie}×`);
            // «Kein Eintrag ohne x-default»: wo die Seite hreflang de-CH ausgibt, steht x-default mit derselben URL daneben.
            // Seiten mit eigenem `alternates` ohne `languages` geben gar kein hreflang aus (Stand vor A-116, nicht Teil des Auftrags).
            check(`P6 ${name}: ${dom.deCH ? 'hreflang de-CH mit x-default (gleiche URL)' : 'kein hreflang (eigenes alternates ohne languages) — also auch kein de-CH ohne x-default'}`, dom.deCH ? dom.xDefault === dom.deCH : dom.xDefault === null, `de-CH ${dom.deCH} | x-default ${dom.xDefault}`);
            if (!dom.deCH && theme === 'dark') console.log(`INFO  ${pfad}: gibt kein hreflang aus (Seite setzt alternates ohne languages)`);
            if (meldungen.konsole.length) console.log(`INFO  ${name}: weitere Konsolenfehler (nicht CSP): ${meldungen.konsole.slice(0, 2).join(' | ')}`);
            if (pfad === '/' && theme === 'dark') {
                check('P5 /: Startseiten-Titel «IT-Support, Webdesign & Telefonie in Winterthur | InfraOne» (≤ 60)', dom.titel === 'IT-Support, Webdesign & Telefonie in Winterthur | InfraOne' && dom.titel.length <= 60, dom.titel);
                check('P5 /: Logo-Link mit aria-label «InfraOne IT Solutions – Startseite»', dom.logo === 'InfraOne IT Solutions – Startseite', dom.logo);
            }
            if (pfad === '/kontakt') {
                const karte = await page.evaluate(() => {
                    const ifr = document.querySelector('iframe[src*="google.com/maps"]');
                    const bild = [...document.querySelectorAll('img')].find((i) => /infraone-standorte/.test(i.currentSrc || i.src));
                    return {
                        iframe: !!ifr,
                        iframeGeladen: !!ifr?.contentWindow,
                        bild: !!bild,
                        bildGeladen: !!bild && bild.complete && bild.naturalWidth > 0,
                        mapsLink: !!document.querySelector('a[href*="google.com/maps"], a[href*="maps.app.goo.gl"]'),
                    };
                });
                protokoll.kontaktKarte = karte;
                check(`P8 ${name}: Karte geladen (iframe google.com/maps mit contentWindow; ohne iframe: statisches Kartenbild geladen + Link zu Google Maps)`, karte.iframe ? karte.iframeGeladen : karte.bildGeladen && karte.mapsLink, JSON.stringify(karte));
                if (!karte.iframe) console.log('INFO  /kontakt hat kein Google-Maps-iframe (seit Commit 023ff46 statisches Bild mit Link; mapEmbed in kontakt/page.tsx wird nicht gerendert) — frame-src für www.google.com/maps.google.com bleibt für den Fall der Rückkehr und ist per CSP-Probe geprüft.');
            }
        }
        await ctx.close();
    }

    /* ---------------- P8: ausgenommene Pfade ohne CSP ---------------- */
    {
        const r = await fetch(`${BASE}/api/demo/scan`, { method: 'POST' });
        check('P8 /api/demo/scan: POST ohne Body → 4xx, kein Content-Security-Policy', r.status >= 400 && r.status < 500 && !r.headers.get('content-security-policy'), `${r.status}, CSP ${r.headers.get('content-security-policy') ? 'gesetzt' : 'fehlt'}`);
        const k = await fetch(`${BASE}/keystatic`, { redirect: 'manual' });
        check('P8 /keystatic: kein Content-Security-Policy (Admin ausgenommen)', !k.headers.get('content-security-policy'), `${k.status}`);
        const s = await fetch(`${BASE}/sitemap.xml`);
        check('P8 /sitemap.xml: trägt die Sicherheits-Header (alle übrigen Pfade)', s.headers.get('x-frame-options') === 'SAMEORIGIN' && !!s.headers.get('content-security-policy'));
    }

    /* ---------------- P8: CSP-Probe (Inventar zugelassen, Fremdes blockiert) ---------------- */
    {
        const { ctx, page, meldungen } = await neueSeite({ width: 1280, height: 800 });
        await oeffne(page, '/kontakt');
        const probe = await page.evaluate(async () => {
            const warte = (ms) => new Promise((r) => setTimeout(r, ms));
            const element = (tag, attr) =>
                new Promise((res) => {
                    const el = document.createElement(tag);
                    for (const [k, v] of Object.entries(attr)) el.setAttribute(k, v);
                    let fertig = false;
                    const ende = (x) => {
                        if (!fertig) {
                            fertig = true;
                            res(x);
                        }
                    };
                    el.addEventListener('load', () => ende('load'));
                    el.addEventListener('error', () => ende('error'));
                    document.body.appendChild(el);
                    setTimeout(() => ende('timeout'), 3000);
                });
            const abfrage = (url, init) => fetch(url, init).then((r) => `status ${r.status}`).catch((e) => `blockiert: ${e.message}`);
            window.__cspVerstoesse = [];
            const erlaubt = {
                'script static.cloudflareinsights.com': await element('script', { src: 'https://static.cloudflareinsights.com/beacon.min.js' }),
                'script challenges.cloudflare.com': await element('script', { src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit' }),
                'iframe challenges.cloudflare.com': await element('iframe', { src: 'https://challenges.cloudflare.com/cdn-cgi/challenge-platform/a116' }),
                'iframe www.google.com/maps/embed': await element('iframe', { src: 'https://www.google.com/maps/embed?pb=a116' }),
                'iframe maps.google.com': await element('iframe', { src: 'https://maps.google.com/?q=a116' }),
                'fetch cloudflareinsights.com': await abfrage('https://cloudflareinsights.com/cdn-cgi/rum', { method: 'POST', body: '{}' }),
                'fetch challenges.cloudflare.com': await abfrage('https://challenges.cloudflare.com/cdn-cgi/a116'),
                'img https (Firmenlogo fremder Domain)': await element('img', { src: 'https://example.org/logo.png' }),
            };
            await warte(300);
            const nachErlaubt = window.__cspVerstoesse.slice();
            window.__cspVerstoesse = [];
            const blockiert = {
                'script example.com': await element('script', { src: 'https://example.com/fremd.js' }),
                'iframe example.com': await element('iframe', { src: 'https://example.com/' }),
                'fetch example.com': await abfrage('https://example.com/a116'),
            };
            await warte(300);
            return { erlaubt, nachErlaubt, blockiert, nachBlockiert: window.__cspVerstoesse.slice() };
        });
        protokoll.cspProbe = probe;
        check('P8 CSP-Probe: Inventar zugelassen — Cloudflare-Skripte, Turnstile-iframe/-Abfrage, Google-Maps-iframes, RUM-Meldung, Fremd-Logo (0 Verstösse)', probe.nachErlaubt.length === 0 && Object.values(probe.erlaubt).every((v) => v === 'load' || /^status 20/.test(v)), JSON.stringify(probe.erlaubt) + ' ' + probe.nachErlaubt.join(' | '));
        check('P8 CSP-Gegenprobe: fremdes Skript, iframe und fetch werden blockiert (script-src, frame-src, connect-src)', probe.nachBlockiert.some((v) => /^script-src/.test(v) && /example\.com/.test(v)) && probe.nachBlockiert.some((v) => /^frame-src/.test(v)) && probe.nachBlockiert.some((v) => /^connect-src/.test(v)) && /blockiert/.test(probe.blockiert['fetch example.com']), probe.nachBlockiert.join(' | '));
        check('P8 CSP-Gegenprobe: Browser meldet «Refused to …» in der Konsole (die Überwachung der Seiten oben greift)', meldungen.csp.length >= 3, `${meldungen.csp.length} Meldungen`);
        await ctx.close();
    }

    /* ---------------- P4/P3: Hub ---------------- */
    for (const [vp, mobil, theme] of [
        [{ width: 1280, height: 800 }, false, 'dark'],
        [{ width: 1280, height: 800 }, false, 'light'],
        [{ width: 375, height: 812 }, true, 'dark'],
        [{ width: 375, height: 812 }, true, 'light'],
    ]) {
        const { ctx, page, meldungen } = await neueSeite(vp, { theme, mobil });
        await oeffne(page, KI_BASIS);
        const h = await page.evaluate(() => {
            const hero = document.getElementById('live-test');
            const t = hero?.querySelector('time');
            const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
                try {
                    const j = JSON.parse(s.textContent);
                    return Array.isArray(j) ? j : [j];
                } catch {
                    return [];
                }
            });
            const webpage = ld.find((x) => x['@type'] === 'WebPage');
            return {
                ueberzeile: hero?.querySelector('p')?.textContent?.trim(),
                h1: document.querySelector('h1')?.textContent?.trim(),
                h1Anzahl: document.querySelectorAll('h1').length,
                antwort: document.getElementById('antwort')?.textContent?.trim() ?? '',
                antwortSichtbar: (document.getElementById('antwort')?.getBoundingClientRect().height ?? 0) > 0,
                zweiter: document.getElementById('antwort')?.nextElementSibling?.textContent?.trim(),
                time: t ? { dateTime: t.getAttribute('datetime'), text: t.parentElement?.textContent?.trim() } : null,
                speakable: webpage?.speakable ?? null,
                datePublished: webpage?.datePublished ?? null,
                dateModified: webpage?.dateModified ?? null,
                telefonie: document.querySelectorAll('a[href="/telefonie"]').length,
                regionen: document.querySelectorAll('nav[aria-label="IT-Support nach Region"] a').length,
                eingabeOben: Math.round(document.getElementById('ki-demo-url')?.getBoundingClientRect().top ?? -1),
                fensterHoehe: window.innerHeight,
            };
        });
        console.log(`INFO  Hub ${vp.width}×${vp.height}: Eingabefeld «Website» (#ki-demo-url) beginnt bei y = ${h.eingabeOben} px (Fensterhöhe ${h.fensterHoehe} px)`);
        protokoll[`hubEingabe${vp.width}${theme}`] = { oben: h.eingabeOben, fenster: h.fensterHoehe };
        const wz = h.antwort.split(/\s+/).filter(Boolean).length;
        const name = `Hub ${vp.width} ${theme === 'dark' ? 'dunkel' : 'hell'}`;
        const soll = LM.seiten[KI_BASIS];
        check(`P4 ${name}: Überzeile, H1 (genau eine) und zweiter Absatz wortgleich`, h.ueberzeile === hub.HUB_UEBERZEILE && h.h1 === hub.HUB_H1 && h.h1Anzahl === 1 && h.zweiter === hub.HUB_TESTEN, `${h.ueberzeile} | ${h.h1} | ${h.zweiter}`);
        check(`P4 ${name}: #antwort wortgleich (Preis aus der Konstante), sichtbar, ${wz} Wörter (40–60)`, norm(h.antwort) === hub.hubAntwort() && wz >= 40 && wz <= 60 && h.antwortSichtbar, h.antwort.slice(-60));
        check(`P3 ${name}: <time dateTime> im Hero = lastmod (${lastmod.datumTag(soll.geaendert)}), Text «Aktualisiert am ${lastmod.datumAnzeige(soll.geaendert)}»`, h.time?.dateTime === lastmod.datumTag(soll.geaendert) && h.time?.text === `Aktualisiert am ${lastmod.datumAnzeige(soll.geaendert)}`, JSON.stringify(h.time));
        check(`P3 ${name}: JSON-LD WebPage mit speakable (#antwort, h1), datePublished, dateModified`, JSON.stringify(h.speakable?.cssSelector) === JSON.stringify(['#antwort', 'h1']) && h.datePublished === lastmod.datumTag(soll.erstellt) && h.dateModified === soll.geaendert, `${h.datePublished} / ${h.dateModified}`);
        check(`P5 ${name}: Footer-Regionszeile 6 Links, kein href="/telefonie" im DOM`, h.regionen === 6 && h.telefonie === 0);
        check(`P8 ${name}: 0 CSP-Meldungen, 0 Seitenfehler`, meldungen.csp.length === 0 && meldungen.seitenfehler.length === 0, [...meldungen.csp, ...meldungen.seitenfehler].slice(0, 2).join(' | '));
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(SCREENS, `hub-hero-${vp.width}-${theme === 'dark' ? 'dunkel' : 'hell'}.png`) });
        if (vp.width === 1280) {
            const nav = page.locator('nav[aria-label="IT-Support nach Region"]');
            await nav.scrollIntoViewIfNeeded();
            await page.waitForTimeout(200);
            await nav.screenshot({ path: path.join(SCREENS, `footer-regionszeile-1280-${theme === 'dark' ? 'dunkel' : 'hell'}.png`) });
        }
        await ctx.close();
    }
    {
        const { ctx, page } = await neueSeite({ width: 375, height: 812 }, { theme: 'dark', mobil: true });
        await oeffne(page, '/');
        const nav = page.locator('nav[aria-label="IT-Support nach Region"]');
        await nav.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const breite = await page.evaluate(() => ({ seite: document.documentElement.scrollWidth, fenster: window.innerWidth }));
        await nav.screenshot({ path: path.join(SCREENS, 'footer-regionszeile-375-dunkel.png') });
        check('P5 Footer-Regionszeile bei 375 px: kein waagrechtes Scrollen', breite.seite <= breite.fenster, JSON.stringify(breite));
        await ctx.close();
    }

    /* ---------------- P3: Brotkrumen-Zeile mit «Aktualisiert am» ---------------- */
    for (const [vp, mobil, theme] of [
        [{ width: 1280, height: 800 }, false, 'dark'],
        [{ width: 1280, height: 800 }, false, 'light'],
        [{ width: 375, height: 812 }, true, 'dark'],
    ]) {
        const { ctx, page } = await neueSeite(vp, { theme, mobil });
        const pfad = `${KI_BASIS}/funktionen`;
        await oeffne(page, pfad);
        const z = await page.evaluate(() => {
            const nav = document.querySelector('nav[aria-label="Brotkrumen"]');
            const zeile = nav?.parentElement;
            const p = zeile?.querySelector(':scope > p');
            const t = p?.querySelector('time');
            const rn = nav?.getBoundingClientRect();
            const rp = p?.getBoundingClientRect();
            return {
                klassen: zeile?.className ?? '',
                text: p?.textContent?.trim() ?? null,
                dateTime: t?.getAttribute('datetime') ?? null,
                rechts: !!rn && !!rp && rp.left >= rn.right && Math.abs(rp.top + rp.height / 2 - (rn.top + rn.height / 2)) < 12,
                bundigRechts: !!rp && Math.abs(rp.right - (zeile.getBoundingClientRect().right - parseFloat(getComputedStyle(zeile).paddingRight))) < 2,
                navMarkup: nav?.querySelector('ol') ? 'ol' : null,
            };
        });
        const soll = LM.seiten[pfad];
        const name = `${pfad} ${vp.width} ${theme === 'dark' ? 'dunkel' : 'hell'}`;
        check(`P3 ${name}: Brotkrumen-Zeile «flex flex-wrap items-center justify-between gap-x-6 gap-y-2» mit «Aktualisiert am ${lastmod.datumAnzeige(soll.geaendert)}» (<time dateTime=${lastmod.datumTag(soll.geaendert)}>)`, /flex flex-wrap items-center justify-between gap-x-6 gap-y-2/.test(z.klassen) && z.text === `Aktualisiert am ${lastmod.datumAnzeige(soll.geaendert)}` && z.dateTime === lastmod.datumTag(soll.geaendert) && z.navMarkup === 'ol', JSON.stringify(z));
        if (vp.width === 1280) check(`P3 ${name}: «Aktualisiert am» rechts neben den Brotkrumen, rechtsbündig in der Zeile`, z.rechts && z.bundigRechts, JSON.stringify(z));
        const zeile = page.locator('nav[aria-label="Brotkrumen"] >> xpath=..');
        await zeile.screenshot({ path: path.join(SCREENS, `brotkrumen-aktualisiert-funktionen-${vp.width}-${theme === 'dark' ? 'dunkel' : 'hell'}.png`) });
        await ctx.close();
    }

    /* ---------------- P2/P7/P1: Sitemap, Schlüsseldatei, llms.txt ---------------- */
    {
        const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
        const urls = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((m) => ({ loc: /<loc>([^<]+)<\/loc>/.exec(m[0])?.[1], lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(m[0])?.[1] }));
        const verschieden = new Set(urls.map((u) => u.lastmod)).size;
        const hubLm = urls.find((u) => u.loc === `https://infraone.ch${KI_BASIS}`)?.lastmod;
        check(`P2 /sitemap.xml: 78 URLs, jede mit lastmod, ${verschieden} verschiedene Daten (nicht mehr eine Build-Zeit)`, urls.length === 78 && urls.every((u) => !!u.lastmod) && verschieden >= 10, `${urls.length} URLs`);
        check('P2 /sitemap.xml: lastmod des Hubs = letzter Commit seiner Quellen (lastmod.json)', !!hubLm && Date.parse(hubLm) === Date.parse(LM.seiten[KI_BASIS].geaendert), `${hubLm} = ${LM.seiten[KI_BASIS].geaendert}`);
        const key = await fetch(`${BASE}/${INDEXNOW_KEY}.txt`);
        const keyText = await key.text();
        check('P7 Schlüsseldatei wird ausgeliefert (200, Inhalt = Schlüssel)', key.status === 200 && keyText === INDEXNOW_KEY, `${key.status} ${keyText}`);
        const llms = await fetch(`${BASE}/llms.txt`);
        const llmsText = await llms.text();
        check('P1 /llms.txt wird ausgeliefert (200), beginnt mit «# InfraOne IT Solutions», endet mit «Aktualisiert: 2026-11-01»', llms.status === 200 && llmsText.startsWith('# InfraOne IT Solutions') && llmsText.trimEnd().endsWith('Aktualisiert: 2026-11-01'));
    }
} finally {
    await browser.close();
}

writeFileSync(path.join(SCREENS, 'browser-test.json'), JSON.stringify({ ...protokoll, ergebnisse }, null, 1));
const fehler = ergebnisse.filter((e) => !e.ok).length;
console.log(`\n${ergebnisse.length - fehler}/${ergebnisse.length} Browser-Prüfungen bestanden. Screens: ${SCREENS}`);
process.exit(fehler ? 1 : 0);
