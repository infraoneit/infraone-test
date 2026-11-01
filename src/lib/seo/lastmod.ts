/**
 * Änderungs- und Erstelldaten je Seite (AUFTRAG-116, P2c).
 *
 * [01.11.2026] AUFTRAG-116: Quelle ist src/generated/lastmod.json (erzeugt von scripts/lastmod-erfassen.mjs
 * aus Git, committet als Fallback). Statischer Import: die Daten stecken im Server-Bundle, zur Laufzeit wird
 * keine Datei gelesen. Verwendet von der Sitemap (lastModified), vom WebPage-Schema der KI-Seiten
 * (datePublished/dateModified) und von «Aktualisiert am …» (components/ki-telefonassistent/Aktualisiert.tsx).
 */
import daten from '@/generated/lastmod.json';

export interface SeitenDatum {
    /** letzter Commit einer Quelle der Seite, ISO 8601 mit Zeit und Offset */
    geaendert: string;
    /** erster Commit der Hauptquelle (Blog: publishDate), ISO 8601 */
    erstellt: string;
}

interface LastmodDatei {
    erzeugt: string;
    quelle: string;
    seiten: Record<string, SeitenDatum>;
}

const DATEI = daten as LastmodDatei;

/** Daten einer Seite; `pfad` ab Domain ('' oder '/' = Startseite). null, wenn die Seite fehlt. */
export function seitenDatum(pfad: string): SeitenDatum | null {
    const schluessel = pfad === '' ? '/' : pfad;
    return DATEI.seiten[schluessel] ?? null;
}

/** Zeitzone der Anzeige — fest, damit Build-Server (UTC) und Besucher dasselbe Datum sehen */
const ZONE = 'Europe/Zurich';

/** Kalendertag eines ISO-Datums in Schweizer Zeit als «YYYY-MM-DD» (für <time dateTime> und datePublished) */
export function datumTag(iso: string): string {
    const teile = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(iso));
    const wert = (typ: string) => teile.find((t) => t.type === typ)?.value ?? '';
    return `${wert('year')}-${wert('month')}-${wert('day')}`;
}

/** Anzeige «31. Oktober 2026» (de-CH, Schweizer Zeit) */
export function datumAnzeige(iso: string): string {
    return new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONE }).format(new Date(iso));
}
