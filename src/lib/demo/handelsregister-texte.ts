/**
 * Handelsregister-Prüfung der KI-Demo (AUFTRAG-109, Bindung AUFTRAG-111): Texte und Antworttypen,
 * die Widget (Browser) und Server gemeinsam nutzen. Ohne Node-Module — darf in den Client-Bundle.
 */
import type { Gebunden } from './bindung';

/** Höchstens so viele manuelle Suchen («Firmenname oder UID») je Scan. */
export const MANUELL_MAX = 3;

export type HrModus = 'streng' | 'aus';
export type HrQuelle = 'uid' | 'name' | 'manuell';

/**
 * Ergebnis einer Prüfung:
 * - treffer: mindestens ein aktiver Eintrag (Auswahl, Bestätigung nötig)
 * - nicht_aktiv: Einträge gefunden, aber keiner aktiv
 * - kein_treffer: nichts gefunden
 * - nicht_erreichbar: Register antwortet nicht (Schalter «streng»: kein Testanruf)
 * - bestaetigt: Firma bestätigt, signierter Nachweis gültig
 * - uebersprungen: Schalter «aus» (nur Entwicklung)
 */
export type HrErgebnis = 'treffer' | 'kein_treffer' | 'nicht_aktiv' | 'nicht_erreichbar' | 'bestaetigt' | 'uebersprungen';

/** Eintrag, wie ihn das Widget zeigt. */
export interface HrTrefferAnzeige {
    uid: string;
    uid_formatiert: string;
    name: string;
    sitz: string;
    status: string;
    status_text: string;
    rechtsform: string | null;
    aktiv: boolean;
}

/** Bestätigte Firma (Anzeige über dem Anruf-Formular). */
export interface HrBestaetigt {
    uid: string;
    uid_formatiert: string;
    name: string;
    sitz: string;
    /** AUFTRAG-111: Regel, über die die Firma an die Website gebunden ist */
    gebunden?: Gebunden;
}

/** AUFTRAG-111: Antwort 409 von «bestaetige», wenn die Firma nicht zur gescannten Website gehört. */
export interface HrWebsitePasstNicht {
    code: 'website_passt_nicht';
    fehler: string;
    /** gescannte Website (Host) */
    website: string;
    /** gewählte Firma laut Register */
    firma: string;
}

/** Antwort von POST /api/demo/handelsregister. */
export interface HrAntwort {
    scan_id: string;
    modus: HrModus;
    ergebnis: HrErgebnis;
    quelle: HrQuelle | null;
    /** höchstens 5, aktive zuerst nach Passung */
    treffer: HrTrefferAnzeige[];
    /** verbleibende manuelle Suchen */
    versuche_rest: number;
    bestaetigt: HrBestaetigt | null;
    /** Ablauf der Bestätigung (Epoch-ms), nur bei «bestaetigt» */
    gueltig_bis?: number;
}

/** Kennungen der 403-Antworten von POST /api/demo/anruf ohne gültigen Nachweis. */
export const HR_CODE_FEHLT = 'handelsregister_fehlt';
export const HR_CODE_ABGELAUFEN = 'handelsregister_abgelaufen';

/**
 * AUFTRAG-111, P2 (wortgleich): Meldung, wenn die gewählte Firma nicht zur Website gehört. Als Teile,
 * damit das Widget Website und Firma fett setzen kann; `websitePasstNichtText` = ganzer Satz.
 */
export function websitePasstNichtTeile(website: string, firma: string): [string, string, string, string, string] {
    return ['Die Website ', website, ' gehört laut Handelsregister und Website-Inhalt nicht zu ', firma, '. Bitte geben Sie die Website Ihrer Firma ein oder wählen Sie den passenden Eintrag.'];
}
export function websitePasstNichtText(website: string, firma: string): string {
    return websitePasstNichtTeile(website, firma).join('');
}

/** AUFTRAG-111, P6 (wortgleich) */
export const HR_SCHRITT = {
    /** Titel des Firmen-Schritts beim Start (bleibt bei Treffern) */
    titel: 'Welche ist Ihre Firma?',
    untertitelEiner: (domain: string) => `Diesen Eintrag haben wir zu ${domain} im Handelsregister gefunden.`,
    untertitelMehrere: (domain: string) => `Zu ${domain} passen mehrere Einträge im Handelsregister. Wählen Sie Ihre Firma.`,
    /** Schritt im Telefon während der Prüfung */
    telefonPruefung: 'Firma wird im Handelsregister geprüft …',
    /** Schritt im Telefon nach der Bestätigung (Status ok) */
    telefonBestaetigt: (name: string) => `Handelsregister: ${name}`,
    /** Assistent-Schritt vor der Bestätigung (Status leer) */
    assistentWartet: 'Wartet auf die Bestätigung Ihrer Firma',
    /** Knopf bei website_passt_nicht */
    andereWebsite: 'Andere Website eingeben',
    /** Textlink unter dem Suchformular (P3) */
    zurueck: 'Zurück zu den Vorschlägen',
    /** AUFTRAG-112 (wortgleich): Telefon-Schritt nach der Vorprüfung (Status ok, detail Host) */
    websiteErreichbar: 'Website erreichbar',
    /** AUFTRAG-112 (wortgleich): Telefon-Schritt, wenn die automatische Prüfung nichts Aktives findet (Status leer) */
    telefonNichtGefunden: 'Firma im Handelsregister nicht gefunden',
    telefonNichtGefundenDetail: 'Unten nach Firmenname oder UID suchen',
    /** AUFTRAG-112 (wortgleich): Vollscan nach der Bestätigung (läuft → «Website gelesen», detail «<host> · n Seiten») */
    websiteWirdGelesen: 'Website wird gelesen …',
    websiteGelesen: 'Website gelesen',
    websiteGelesenDetail: (host: string, seiten: number) => `${host} · ${seiten} ${seiten === 1 ? 'Seite' : 'Seiten'}`,
    /** AUFTRAG-112 (wortgleich): gedämpfte Zeile unter dem Untertitel des Firmen-Schritts */
    leseHinweis: 'Ihre Website lesen wir erst, nachdem Sie Ihre Firma bestätigt haben.',
    /** AUFTRAG-112 (wortgleich): Knopf nach einem Fehler im Vollscan */
    nochmalsVersuchen: 'Nochmals versuchen',
} as const;

/**
 * [09.11.2026] Warum: AUFTRAG-123 (Abschnitt 3, wortgleich vom Manager) — Texte nur für das Firmen-Blatt im Kompaktmodus
 * (Handy, unter 1024 px): T1 Titel bei genau einem aktiven Treffer, T2 Herkunftszeile unter dem Titel (ersetzt dort
 * Untertitel, Lesehinweis und die Datenschutz-Fusszeile), T3 zugänglicher Name je antippbarer Zeile bei mehreren Treffern.
 * Am Desktop unverändert (HR_SCHRITT/HR_TEXT).
 */
export const HR_KOMPAKT = {
    /** T1 */
    titelEiner: 'Ist das Ihre Firma?',
    /** T2 */
    herkunft: 'Aus dem Handelsregister (Zefix)',
    /** T3: aria-label je Trefferzeile («{Name}, {Sitz}: Das ist meine Firma») */
    zeileLabel: (name: string, sitz: string) => `${name}, ${sitz}: Das ist meine Firma`,
    /**
     * [09.11.2026] Warum: AUFTRAG-123b (N3, wortgleich vom Manager) — Platzhalter des Suchfelds im Kompaktmodus; der lange
     * Desktop-Platzhalter «z. B. Muster AG oder CHE-123.456.789» war mobil am Ende abgeschnitten (A-123 O6).
     */
    platzhalter: 'z. B. Muster AG',
} as const;

export const HR_TEXT = {
    /** Datenschutz-Hinweis im Widget (AUFTRAG-109, Abschnitt 3, wortgleich) */
    datenschutz: 'Wir prüfen den Firmennamen gegen das öffentliche Handelsregister (Zefix).',
    /** Register nicht erreichbar, Schalter «streng» (wortgleich AUFTRAG-109) */
    nichtErreichbar: 'Handelsregister gerade nicht erreichbar, bitte in ein paar Minuten nochmals.',
    /** kein aktiver Eintrag (wortgleich AUFTRAG-109) */
    aktivNoetig: 'Für den Testanruf braucht es einen aktiven Handelsregister-Eintrag.',
    fehlt: 'Für den Testanruf braucht es eine bestätigte Firma aus dem Handelsregister. Bitte bestätigen Sie zuerst Ihre Firma.',
    abgelaufen: 'Die Bestätigung Ihrer Firma ist abgelaufen. Bitte bestätigen Sie Ihre Firma nochmals.',
    versucheAus: 'Die Suche ist für diese Website ausgeschöpft.',
    uidUngueltig: 'Diese UID ist ungültig. Bitte prüfen Sie die Eingabe, z. B. CHE-123.456.789.',
    suchtextKurz: 'Bitte geben Sie mindestens drei Zeichen ein.',
    nichtBestaetigbar: 'Diese Firma können wir nicht bestätigen. Bitte wählen Sie einen Eintrag aus der Liste.',
} as const;
