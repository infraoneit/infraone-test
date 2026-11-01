/**
 * «Aktualisiert am …» (AUFTRAG-116, P3b) — sichtbares Aktualitätssignal mit maschinenlesbarem <time>.
 *
 * [01.11.2026] AUFTRAG-116: Server-Komponente. Datum = seitenDatum(pfad).geaendert (letzter Commit der
 * Quellen der Seite, src/generated/lastmod.json), Anzeige de-CH «31. Oktober 2026», dateTime YYYY-MM-DD
 * (beides in Schweizer Zeit). Ohne Datum rendert die Komponente nichts.
 * Verwendet in SeitenKopf (rechts in der Brotkrumen-Zeile) und auf dem Hub unter dem Hero-Text.
 */
import { cn } from '@/lib/utils';
import { datumAnzeige, datumTag, seitenDatum } from '@/lib/seo/lastmod';

export function Aktualisiert({ pfad, className = '' }: { pfad: string; className?: string }) {
    const datum = seitenDatum(pfad);
    if (!datum) return null;
    return (
        <p className={cn('text-sm text-text-secondary', className)}>
            Aktualisiert am <time dateTime={datumTag(datum.geaendert)}>{datumAnzeige(datum.geaendert)}</time>
        </p>
    );
}
