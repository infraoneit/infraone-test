import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/constants';
import { alleSeiten } from '@/lib/seo/seitenliste';
import { seitenDatum } from '@/lib/seo/lastmod';

/**
 * Sitemap (/sitemap.xml).
 *
 * [01.11.2026] AUFTRAG-116 (P2c): Die Seitenliste (URLs, Prioritäten, Frequenzen) kommt aus
 * src/lib/seo/seitenliste.ts (`alleSeiten()`, gleiche Liste wie bisher, auch für die Prüfskripte).
 * lastModified ist das echte Änderungsdatum je Seite (letzter Commit ihrer Quellen) aus
 * src/generated/lastmod.json (statischer Import über `seitenDatum`) statt einer gemeinsamen Build-Zeit.
 * Fehlt ein Eintrag: Build-Datum und Warnung im Build-Log.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const buildDatum = new Date();

    return alleSeiten().map((seite) => {
        const datum = seitenDatum(seite.url);
        if (!datum) console.warn(`sitemap: kein lastmod für ${seite.url || '/'}`);
        return {
            url: `${BASE_URL}${seite.url}`,
            lastModified: datum ? new Date(datum.geaendert) : buildDatum,
            changeFrequency: seite.changeFrequency,
            priority: seite.priority,
        };
    });
}
