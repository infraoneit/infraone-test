/**
 * IndexNow (AUFTRAG-116, P7) — meldet geänderte Seiten an Bing, Yandex, Naver, Seznam und weitere
 * Suchmaschinen, die das Protokoll teilen (eine Meldung an api.indexnow.org genügt).
 *
 * [01.11.2026] AUFTRAG-116: ohne Abhängigkeiten (nur fetch), läuft in Node (scripts/indexnow-ping.mjs) und in
 * Netlify Functions (netlify/functions/deploy-succeeded.mts). Der Schlüssel ist öffentlich per Design: er liegt
 * unter https://infraone.ch/<schlüssel>.txt (public/), damit IndexNow den Besitz der Domain prüfen kann.
 */

/** Schlüssel (32 Hex-Zeichen), identisch mit dem Inhalt von public/<schlüssel>.txt */
export const INDEXNOW_KEY = '2962f3fc54e5b86db3a8416738afbf65';
export const INDEXNOW_HOST = 'infraone.ch';
export const INDEXNOW_ENDPUNKT = 'https://api.indexnow.org/IndexNow';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;
/** Höchstzahl URLs je Meldung (Protokollgrenze) */
export const INDEXNOW_MAX_URLS = 10_000;

/**
 * Meldet `urls` per POST an IndexNow. Nur absolute https-URLs der eigenen Domain, ohne Doppel, höchstens
 * 10 000. Leere Liste → kein Request ({ status: 0, anzahl: 0 }).
 */
export async function indexNowMelden(urls: string[], fetchImpl: typeof fetch = fetch): Promise<{ status: number; anzahl: number }> {
    const eigene = [...new Set(urls)].filter((u) => {
        try {
            const x = new URL(u);
            return x.protocol === 'https:' && x.hostname === INDEXNOW_HOST;
        } catch {
            return false;
        }
    });
    const urlList = eigene.slice(0, INDEXNOW_MAX_URLS);
    if (urlList.length === 0) return { status: 0, anzahl: 0 };
    const antwort = await fetchImpl(INDEXNOW_ENDPUNKT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: INDEXNOW_HOST, key: INDEXNOW_KEY, keyLocation: INDEXNOW_KEY_LOCATION, urlList }),
    });
    return { status: antwort.status, anzahl: urlList.length };
}

/** Text eines XML-Elements ohne CDATA/Entities (für <loc> und <lastmod> genügt das) */
function xmlText(roh: string): string {
    return roh
        .replace(/^<!\[CDATA\[|\]\]>$/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();
}

/** Startseite? (https://infraone.ch oder https://infraone.ch/) */
function istStartseite(url: string): boolean {
    try {
        const x = new URL(url);
        return x.pathname === '/' && !x.search;
    } catch {
        return false;
    }
}

/**
 * Alle <loc> einer Sitemap, deren <lastmod> höchstens `seitTagen` Tage zurückliegt (≥ jetzt − seitTagen).
 * Die Startseite ist immer dabei (auch ohne <lastmod>; fehlt sie in der Sitemap, wird sie ergänzt).
 */
export function geaenderteUrls(sitemapXml: string, seitTagen: number, jetzt: Date = new Date()): string[] {
    const grenze = jetzt.getTime() - seitTagen * 24 * 60 * 60 * 1000;
    const treffer: string[] = [];
    let startseite = false;
    for (const block of sitemapXml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
        const loc = /<loc>([\s\S]*?)<\/loc>/.exec(block);
        if (!loc) continue;
        const url = xmlText(loc[1]);
        if (istStartseite(url)) {
            startseite = true;
            treffer.push(url);
            continue;
        }
        const lastmod = /<lastmod>([\s\S]*?)<\/lastmod>/.exec(block);
        const zeit = lastmod ? Date.parse(xmlText(lastmod[1])) : NaN;
        if (Number.isFinite(zeit) && zeit >= grenze) treffer.push(url);
    }
    if (!startseite) treffer.unshift(`https://${INDEXNOW_HOST}/`);
    return treffer;
}

/** Alle <loc> einer Sitemap (für «--alle») */
export function alleUrls(sitemapXml: string): string[] {
    return (sitemapXml.match(/<loc>([\s\S]*?)<\/loc>/g) ?? []).map((l) => xmlText(l.replace(/^<loc>|<\/loc>$/g, '')));
}
