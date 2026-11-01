/**
 * Texte des Hero auf dem Hub /ki-telefonassistent — Antwort-Kapsel (AEO).
 *
 * [01.11.2026] AUFTRAG-116 (P4): Überzeile, H1 und die zwei Absätze wortgleich aus dem Auftrag. Die Kapsel
 * (#antwort) beantwortet in einem Absatz, was der Assistent ist, für wen, in welchen Sprachen, was er tut,
 * wo er läuft und ab welchem Preis (40–60 Wörter; Einheits- und Browser-Test zählen). Der Preis kommt aus
 * src/lib/ki-telefonassistent-preise.ts (heute «CHF 49»), nie als Literal. Solange die Preise nicht
 * freigegeben sind, endet die Kapsel nach «Betrieb in der Schweiz.».
 * Reines TypeScript ohne JSX (auch für die Node-Prüfskripte).
 */
import { abPreis, chf, PREISE_FREIGEGEBEN, WAEHRUNG } from '@/lib/ki-telefonassistent-preise';

/** Überzeile (mit dem pulsierenden Punkt) */
export const HUB_UEBERZEILE = 'Live-Test in einer Minute';

/** H1 des Hubs */
export const HUB_H1 = 'KI-Telefonassistent für Schweizer KMU, der Ihre Anrufe annimmt';

/** Antwort-Kapsel, erster Absatz mit id="antwort" */
export function hubAntwort(): string {
    const preis = PREISE_FREIGEGEBEN ? `, ab ${WAEHRUNG} ${chf(abPreis())} pro Monat` : '';
    return (
        'Der KI-Telefonassistent von InfraOne nimmt ab, wenn in Ihrem Betrieb niemand Zeit hat: rund um die Uhr, auf ' +
        'Schweizerdeutsch, Hochdeutsch und Englisch. Er beantwortet Fragen aus Ihrem Wissen, erfasst Name, Anliegen und ' +
        `Rückrufnummer und schickt nach jedem Gespräch eine Notiz per E-Mail. Betrieb in der Schweiz${preis}.`
    );
}

/** Zweiter Absatz */
export const HUB_TESTEN = 'Testen Sie ihn jetzt: Website eingeben, der Assistent ruft Sie an – kostenlos und ohne Anmeldung.';
