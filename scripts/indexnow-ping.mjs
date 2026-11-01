#!/usr/bin/env node
/**
 * indexnow-ping.mjs (AUFTRAG-116, P7) — IndexNow-Meldung von Hand (für den Manager).
 *
 * [01.11.2026] AUFTRAG-116: Liest die Sitemap (Vorgabe https://infraone.ch/sitemap.xml) und meldet
 *   --alle      alle Sitemap-URLs
 *   --seit=N    nur Seiten mit lastmod der letzten N Tage (plus Startseite)
 * an https://api.indexnow.org/IndexNow (Schlüssel und Logik: src/lib/seo/indexnow.ts).
 *   --trocken   zeigt nur die Liste, sendet NICHTS
 *   --basis=URL andere Quelle der Sitemap, z. B. --basis=http://localhost:3005 (lokaler Produktions-Server)
 * Gemeldet werden nur URLs von infraone.ch (die Sitemap des lokalen Servers enthält ebenfalls diese).
 *
 *   node scripts/indexnow-ping.mjs --seit=3 --trocken --basis=http://localhost:3005
 *   node scripts/indexnow-ping.mjs --alle            (sendet wirklich — nur bewusst ausführen)
 *
 * Node ≥ 22.18 (Type-Stripping für die .ts-Quelle).
 */
import { registerHooks } from 'node:module';
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
const { alleUrls, geaenderteUrls, indexNowMelden, INDEXNOW_KEY_LOCATION } = await import(pathToFileURL(path.join(ROOT, 'src', 'lib', 'seo', 'indexnow.ts')).href);

const argumente = process.argv.slice(2);
const alle = argumente.includes('--alle');
const seitArg = argumente.find((a) => a.startsWith('--seit='));
const trocken = argumente.includes('--trocken');
const basis = (argumente.find((a) => a.startsWith('--basis='))?.slice('--basis='.length) || 'https://infraone.ch').replace(/\/$/, '');
const seit = seitArg ? Number(seitArg.slice('--seit='.length)) : NaN;

if (alle === !!seitArg || (seitArg && !(seit > 0))) {
    console.error('Aufruf: node scripts/indexnow-ping.mjs (--alle | --seit=N) [--trocken] [--basis=URL]');
    process.exit(2);
}

// Nach fetch kein process.exit() (Node unter Windows bricht sonst mit «Assertion failed … async.c» ab) — exitCode setzen
const antwort = await fetch(`${basis}/sitemap.xml`);
if (!antwort.ok) {
    console.error(`Sitemap ${basis}/sitemap.xml: HTTP ${antwort.status}`);
    process.exitCode = 1;
} else {
    const xml = await antwort.text();
    const urls = alle ? alleUrls(xml) : geaenderteUrls(xml, seit);
    console.log(`Sitemap: ${basis}/sitemap.xml — ${alle ? 'alle URLs' : `lastmod der letzten ${seit} Tage plus Startseite`}: ${urls.length}`);
    for (const u of urls) console.log(`  ${u}`);

    if (trocken) {
        console.log(`--trocken: nichts gesendet (Schlüsseldatei ${INDEXNOW_KEY_LOCATION}).`);
    } else {
        const { status, anzahl } = await indexNowMelden(urls);
        console.log(`indexnow: ${anzahl} URLs, Status ${status}`);
        // IndexNow: 200 = angenommen, 202 = angenommen (Schlüsselprüfung ausstehend); alles andere ist ein Fehler
        process.exitCode = status === 200 || status === 202 || anzahl === 0 ? 0 : 1;
    }
}
