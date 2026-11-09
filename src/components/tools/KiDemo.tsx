'use client';

/**
 * KI-Telefonassistent-Demo (AUFTRAG-092, überarbeitet AUFTRAG-095).
 *
 * Bühne: links Eingabe und Aktion, rechts (mobil darunter) ein lebendes
 * Telefon. Ablauf als Zustandsautomat (lib/demo/zustand.ts):
 * eingabe → scan → bereit → wartend → waehlt → verbunden → beendet | fehler.
 * Genau EIN Primär-Button je Zustand; Übergänge aus dem Status-Polling.
 *
 * Kundeninhalte (Karte, Anruf) tragen die Farben des Kunden, nie
 * InfraOne-Grün (Portmann-Prinzip). Buttons/CTA bleiben im Marken-Grün.
 *
 * AUFTRAG-111: URL → sofort «Welche ist Ihre Firma?» (Handelsregister, parallel zum Scan) →
 * Bestätigung (Server prüft die Bindung Website ↔ Firma) → erst dann «<Name> ist bereit», Karte mit
 * dem Handelsregister-Namen und Anruf-Formular. Bis dahin zeigt das Telefon keinen Firmennamen
 * aus dem Scan.
 *
 * AUFTRAG-112: Das URL-Feld ist das Tor. Stufe 1 (`starteScan`, POST /api/demo/scan {url}): Inhaltsfilter
 * und Vorprüfung (Startseite + Impressum) — das Telefon zeigt nur «Website erreichbar», «Firma wird im
 * Handelsregister geprüft …» und «Wartet auf die Bestätigung Ihrer Firma»; keine Chips, kein Logo, keine
 * Farbe, kein Profil. Stufe 2 (`starteVollscan`, POST /api/demo/scan {scan_id}) erst nach der
 * Bestätigung der Firma: «Website wird gelesen …» → «Website gelesen», danach die bisherige Abfolge.
 *
 * [09.11.2026] Warum: AUFTRAG-123 ruhige Bühne — auf dem Handy (Kompaktmodus) ein Gedanke pro Moment: das Telefon erzählt
 * gross; braucht es eine Handlung, liegt unten EIN Blatt (eine Frage, eine Haupthandlung) und das Telefon skaliert sich
 * per Transform darüber (nie angeschnitten, unter 0,36 ausgeblendet — AUFTRAG-123b). «bereit» erst als Kurzblatt, dann das
 * Formular. Desktop unverändert.
 *
 * [09.11.2026] Warum: AUFTRAG-123b Feinschliff — Schwelle 0,36 statt 0,32 (keine Briefmarke), 409-Haupthandlung ohne
 * Globus (einzeilig), kürzerer Such-Platzhalter, Ende/Fehler mit EINER Haupthandlung und einem Textlink darunter.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUp, BookOpen, Check, Clock, Globe, Languages, Loader2, Phone, PhoneCall, RotateCcw, Timer, X } from 'lucide-react';
import styles from './KiDemo.module.css';
import { Telefon, SPRACH_WAHL, ANRUF_VON, fehlerGrundText, sprachName, ZUSAMMENFASSUNG_FOLGT, type KartenAnzeige, type SchrittAnzeige } from './ki-demo/Telefon';
import { Handelsregister } from './ki-demo/Handelsregister';
import { HR_CODE_ABGELAUFEN, HR_CODE_FEHLT, HR_SCHRITT, type HrAntwort, type HrBestaetigt } from '@/lib/demo/handelsregister-texte';
import { ANFRAGE_FIRMA_SCHLUESSEL, ANFRAGE_HREF, ANFRAGE_ID } from '@/lib/ki-anfrage';
import { kuerzeName, sprechName } from '@/lib/demo/bindung';
import {
    brauchtDunklenGrund,
    dominanteFarbe,
    helligkeit,
    lesbarAuf,
    logoPixel,
    logoSichtbar,
    logoVerlust,
    NEUTRAL_PRIMAER,
    textAuf,
    verlustAuf,
    waehlePlakette,
    type PlakettenArt,
} from '@/lib/demo/farben';
import { bestimmeMarkenfarbe, FARB_GEWICHT_LOGO, type FarbSignal } from '@/lib/demo/markenfarbe';
import { formatiereNummer, pruefeRueckrufNummer } from '@/lib/demo/nummer';
import { begruessungFuer, kannZeilen, rollenZeile, standardAufEnglisch, STANDARD_FAEHIGKEITEN_EN } from '@/lib/demo/begruessung';
import { bindeScan, istAktuell, LEERE_SITZUNG, logosDesScans, neueSitzung, profilPasst, type Sitzung } from '@/lib/demo/sitzung';
import {
    ansage,
    dauerAnzeige,
    fehlerMeldung,
    fehlerTitel,
    GRUND_KEINE_RUECKMELDUNG,
    istEndStatus,
    naechsterZustand,
    primaerButton,
    STATUS_MAX_MS,
    STATUS_TAKT_MS,
    zustandAusStatus,
    type Zustand,
} from '@/lib/demo/zustand';
import { SPRACHE_VORGABE, type AuftragStatus, type Profil, type Sprache, type Stimme } from '@/lib/demo/typen';

/* ------------------------------------------------------------------ */
/* Texte                                                               */
/* ------------------------------------------------------------------ */

const NACH_GESPRAECH =
    'Das war ein Assistent aus Ihrer Website – in einer Minute. Mit Ihren Vorgaben, Ihrer Begrüssung und Ihrem Wissen richten wir ihn für Ihren Betrieb ein.';

/** Clientseitige Kurzmeldungen (Server liefert eigene Klartexte). */
const HINWEIS = {
    url: 'Bitte geben Sie eine gültige Website-Adresse ein, z. B. muster-ag.ch.',
    netz: 'Die Verbindung hat nicht geklappt. Bitte versuchen Sie es gleich nochmals.',
    nummer: 'Bitte geben Sie eine gültige Schweizer oder Liechtensteiner Telefonnummer ein.',
    sonderdienst: 'An Mehrwert- und Sondernummern können wir nicht anrufen.',
    einwilligung: 'Bitte bestätigen Sie, dass Sie den Testanruf erhalten möchten.',
};

const GRUEN_LEERLAUF = '#4CAF50';

/*
 * [08.11.2026] Warum: AUFTRAG-120 (Z2) — auf dem Handy «checkte niemand», was nach dem Scan zu tun ist. Die
 * Aktionskarte sagt mobil in einer Zeile über der Überschrift, wo der Besucher steht. Texte wortgleich aus dem Auftrag.
 * [09.11.2026] Warum: AUFTRAG-121 (K3/K4) — wortgleich K3.3/K3.4: «Testanruf läuft» / «Testanruf beendet» (ohne
 * «… im Telefon unten»: seit AUFTRAG-122 liegt das Telefon mobil als Bühne hinter der Karte, nicht darunter).
 * Der Statuszeilen-Hinweis «Bitte Firma bestätigen» (A-120, Z4) entfällt: die Karte ist immer im Bild.
 */
const SCHRITT_FUEHRUNG = {
    firma: 'Schritt 1 von 2 · Firma bestätigen',
    nummer: 'Schritt 2 von 2 · Nummer eingeben, Testanruf starten',
    laeuft: 'Testanruf läuft',
    beendet: 'Testanruf beendet',
};

/*
 * [09.11.2026] Warum: AUFTRAG-123 (Z5, Texte T4a/T4b/T5/T6 wortgleich vom Manager) — mobil zeigt «bereit» zuerst nur ein
 * Kurzblatt («{Name} ist bereit» / «{Name} soll mich anrufen»); Antippen klappt das Formular aus («Wohin darf {Name}
 * anrufen?»), unter der Sprachwahl nur bei Schweizerdeutsch der Erprobungs-Hinweis. Rückfall ohne Namen wie im Auftrag.
 */
const BEREIT_TEXT = {
    kurzTitel: (name: string) => (name ? `${name} ist bereit` : 'Ihr Assistent ist bereit'),
    kurzKnopf: (name: string) => (name ? `${name} soll mich anrufen` : 'Testanruf starten'),
    formTitel: (name: string) => (name ? `Wohin darf ${name} anrufen?` : 'Wohin dürfen wir anrufen?'),
    erprobung: 'Schweizerdeutsch ist noch in Erprobung.',
};

/*
 * [09.11.2026] Warum: AUFTRAG-123 (Z2.2/Z2.3) — Luft zwischen Telefon und Blatt (px) und kleinste Skala: darunter blendet das
 * Telefon aus (keine Briefmarke). Z3: Schatten des Blatts nach oben (dunkel kräftiger).
 * [09.11.2026] Warum: AUFTRAG-123b (N1) — Schwelle 0,36 statt 0,32: bei 0,327 (Formular 393×727) und 0,341 (430×739) war das
 * Telefon nur noch ≈ 90 × 190 px gross (Briefmarke, A-123 O3). Firmen-Schritt (390×664: 0,383) und Kurzblätter bleiben sichtbar.
 */
const TELEFON_LUFT = 12;
const TELEFON_MIN_SKALA = 0.36;
const BLATT_SCHATTEN = 'shadow-[0_-12px_40px_-16px_rgba(10,18,10,0.35)] dark:shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.8)]';
const BLATT_TITEL = 'text-[1.375rem] font-bold leading-tight tracking-tight text-text-primary focus:outline-none';
/** [09.11.2026] Warum: AUFTRAG-123b (N4) — Textlink unter der Haupthandlung (zentriert, Trefferfläche 44 px; wie im Firmen-Blatt) */
const BLATT_LINK = 'mx-auto mt-1 flex min-h-[44px] w-fit items-center justify-center px-3 text-sm font-semibold text-text-primary underline underline-offset-2 hover:no-underline';

/** AUFTRAG-120/121: Kompaktmodus nur unterhalb von lg (1024 px); am Desktop bleibt alles wie A-100 */
const MOBIL = '(max-width: 1023px)';
const istMobilJetzt = () => typeof window !== 'undefined' && window.matchMedia(MOBIL).matches;
function mobilAbonnieren(melden: () => void) {
    const mq = window.matchMedia(MOBIL);
    mq.addEventListener('change', melden);
    return () => mq.removeEventListener('change', melden);
}

/** Schritte des Scans im Telefon: Website, Handelsregister (AUFTRAG-111), Logo, Farbe, Telefon, Öffnungszeiten, Wissen, Assistent */
const SCAN_SCHRITTE = 8;

/* ------------------------------------------------------------------ */
/* Typen der API                                                       */
/* ------------------------------------------------------------------ */

interface LogoVomServer {
    src: string;
    index: number;
    quelle: string;
    format: string | null;
    breite: number | null;
    hoehe: number | null;
    hell: boolean | null;
    transparenz: boolean | null;
    farbe: string | null;
    /** AUFTRAG-096: Hintergrund der Logo-Umgebung auf der Website */
    umgebung?: string | null;
    /** AUFTRAG-096: Inline-SVG ohne eigene Farbe */
    ohneEigeneFarbe?: boolean;
}

/** AUFTRAG-112: Antwort der Vorprüfung (Stufe 1) — bewusst ohne Logos, Farben, Funde und Profil */
interface VorpruefungAntwort {
    scan_id: string;
    stufe: 'vorpruefung';
    host: string;
}

/** Antwort des Vollscans (Stufe 2, nach der Bestätigung der Firma) */
interface ScanAntwort {
    scan_id: string;
    profil: Profil;
    assistent_weiblich: boolean;
    logos: LogoVomServer[];
    /** AUFTRAG-096: gewichtete Farbsignale ohne Browser-Logo-Farbe */
    farb_signale?: FarbSignal[];
    funde: { seiten: number; firma: string; telefon: string | null; oeffnungszeiten: string | null; farbe: string | null };
}

interface ProfilAntwort {
    profil: Profil;
    funde?: { telefon: string | null; oeffnungszeiten: string | null; wissen: number };
}

interface GeladenesLogo {
    src: string;
    index: number;
    hell: boolean;
    farbe: string | null;
    breite: number | null;
    hoehe: number | null;
    /** AUFTRAG-096: Plakette hinter dem Logo (Website-Umgebung, Marke, Weiss oder Dunkel) */
    plakette: { art: PlakettenArt; farbe: string };
}

interface Karte {
    scanId: string;
    profil: Profil;
    /**
     * AUFTRAG-098: die drei Fähigkeiten auf Englisch (Karte bei «English»). Standard-
     * Fähigkeiten sofort, sonst null bis zur ersten Wahl von «English» (POST /api/demo/faehigkeiten).
     */
    faehigkeitenEn: string[] | null;
    stimme: Stimme;
    logo: GeladenesLogo | null;
    primaer: string;
}

interface Auftrag {
    id: string;
    dauer_s: number | null;
    zusammenfassung: string | null;
    grund: string | null;
}

interface Chip {
    id: string;
    text: string;
    farbe?: string;
    logoSrc?: string;
    /** Hintergrund der kleinen Logo-Plakette (wie auf der Karte) */
    logoGrund?: string;
    icon?: 'telefon' | 'zeiten' | 'wissen';
}

declare global {
    interface Window {
        turnstile?: {
            render: (el: HTMLElement, opt: Record<string, unknown>) => string;
            reset: (id?: string) => void;
            remove: (id: string) => void;
        };
    }
}

/* ------------------------------------------------------------------ */
/* Hilfen                                                              */
/* ------------------------------------------------------------------ */

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

function ladeBild(src: string, zeitMs: number): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const t = setTimeout(() => reject(new Error('Zeit')), zeitMs);
        img.onload = () => {
            clearTimeout(t);
            if (img.naturalWidth > 0 || /svg/i.test(src)) resolve(img);
            else reject(new Error('leer'));
        };
        img.onerror = () => {
            clearTimeout(t);
            reject(new Error('Bild'));
        };
        img.decoding = 'async';
        img.src = src;
    });
}

/** Pixel des Logos über Canvas (gleicher Ursprung dank eigenem Proxy); null, wenn nicht lesbar. */
function canvasPixel(img: HTMLImageElement): { px: Uint8ClampedArray; breite: number } | null {
    try {
        const w = img.naturalWidth || 120;
        const h = img.naturalHeight || 60;
        const m = Math.min(1, 160 / Math.max(w, h));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * m));
        canvas.height = Math.max(1, Math.round(h * m));
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return null;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return { px: ctx.getImageData(0, 0, canvas.width, canvas.height).data, breite: canvas.width };
    } catch {
        return null;
    }
}

/**
 * AUFTRAG-096: Die Karte probiert die geordneten Kandidaten (höchstens 4) der
 * Reihe nach: laden, auf Canvas zeichnen, ≥ 2 % sichtbare Pixel und keine
 * einfarbige Fläche → gültig, sonst nächster. Das deckt alle Formate ab, auch
 * SVG mit CSS-Füllungen, die der Server nicht beurteilen kann. Danach:
 * Markenfarbe aus den Signalen des Servers plus Logo-Farbe (gleiche Regeln wie
 * der Server) und Plakette (Website-Umgebung, Marke, Weiss oder Dunkel).
 */
async function ladeLogo(logos: LogoVomServer[], signale: FarbSignal[]): Promise<{ logo: GeladenesLogo | null; marke: string | null }> {
    const markeOhneLogo = bestimmeMarkenfarbe(signale)?.primaer ?? null;
    for (const l of logos.slice(0, 4)) {
        let img: HTMLImageElement;
        try {
            img = await ladeBild(l.src, 6500);
        } catch {
            continue;
        }
        const raster = canvasPixel(img);
        const px = raster?.px ?? null;
        const stat = px ? logoPixel(px) : null;
        if (stat && !logoSichtbar(stat).ok) continue;
        let { hell, farbe } = l;
        if (px && hell === null) hell = stat!.transparenz && brauchtDunklenGrund(logoVerlust(px, raster!.breite));
        if (px && farbe === null) farbe = dominanteFarbe(px)?.primaer ?? null;
        const marke = bestimmeMarkenfarbe([...signale, ...(farbe ? [{ farbe, gewicht: FARB_GEWICHT_LOGO, quelle: 'logo' as const }] : [])])?.primaer ?? markeOhneLogo;
        const plakette = waehlePlakette({
            umgebung: l.umgebung ?? null,
            // ohne Markenfarbe trägt die Karte das neutrale Blau (helles Logo sitzt dann direkt darauf, wie A-095)
            marke: marke ?? NEUTRAL_PRIMAER,
            hell: !!hell,
            mittel: stat?.mittel ?? null,
            einfarbig: !!stat?.einfarbig,
            ohneEigeneFarbe: !!l.ohneEigeneFarbe,
            verlust: px ? (grund) => verlustAuf(px, grund, raster!.breite).anteil : undefined,
        });
        return {
            logo: { src: l.src, index: l.index, hell: !!hell, farbe, breite: img.naturalWidth || l.breite, hoehe: img.naturalHeight || l.hoehe, plakette },
            marke,
        };
    }
    return { logo: null, marke: markeOhneLogo };
}

function hostVon(eingabe: string): string {
    try {
        const s = eingabe.trim();
        return new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`).hostname.replace(/^www\./, '');
    } catch {
        return eingabe.trim();
    }
}

function kurz(text: string, max: number): string {
    return text.length > max ? text.slice(0, max - 1).replace(/[\s,;–-]+$/, '') + '…' : text;
}

/* ------------------------------------------------------------------ */
/* Primär-Button                                                       */
/* ------------------------------------------------------------------ */

function KnopfSymbol({ symbol }: { symbol: ReturnType<typeof primaerButton>['symbol'] }) {
    switch (symbol) {
        case 'pfeil':
            return <ArrowRight className="w-5 h-5" aria-hidden="true" />;
        case 'spinner':
            return <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />;
        case 'telefon':
            return <PhoneCall className="w-5 h-5" aria-hidden="true" />;
        case 'puls':
            return <span className={styles.puls} aria-hidden="true" />;
        case 'klingeln':
            return <Phone className={`w-5 h-5 ${styles.klingeln}`} aria-hidden="true" />;
        case 'welle':
            return (
                <span className={styles.knopfWelle} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </span>
            );
        case 'neu':
            return <RotateCcw className="w-5 h-5" aria-hidden="true" />;
    }
}

const KNOPF_BASIS =
    // Höhe aus Polsterung + Zeilenhöhe (56 px), nicht aus min-height: globals.css setzt mobil min-height:44px auf alle Buttons
    'w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-[1.1875rem] font-bold leading-6 text-center focus-visible:outline-2 focus-visible:outline-offset-2';

function PrimaerKnopf({
    zustand,
    name,
    type,
    onClick,
    id,
    zweizeilig = false,
    gesperrt = false,
    haupt = false,
}: {
    zustand: Zustand;
    name: string;
    type: 'submit' | 'button';
    onClick?: () => void;
    id?: string;
    zweizeilig?: boolean;
    /** AUFTRAG-103: nach 429 (Limit) gesperrt — kein weiterer Versuch aus dieser Seite */
    gesperrt?: boolean;
    /** AUFTRAG-123 (Z3): Haupthandlung des Blatts (nur mobil; Messpunkt data-blatt-haupt) */
    haupt?: boolean;
}) {
    const b = primaerButton(zustand, name);
    const deaktiviert = b.deaktiviert || gesperrt;
    const farbe =
        b.art === 'verbunden'
            ? 'bg-[#1f7a35] text-white shadow-lg shadow-[#1f7a35]/30'
            : b.art === 'sekundaer'
              ? 'border-2 border-border bg-transparent text-text-primary hover:border-primary'
              : 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover';
    return (
        <button
            id={id}
            type={type}
            onClick={onClick}
            disabled={deaktiviert}
            aria-disabled={deaktiviert || undefined}
            data-zustand={zustand}
            data-gesperrt={gesperrt ? 'true' : undefined}
            data-blatt-haupt={haupt ? '' : undefined}
            className={`${styles.knopf} ${KNOPF_BASIS} ${farbe} ${zustand === 'wartend' ? styles.knopfWartet : ''} ${zweizeilig ? 'h-[4.75rem] sm:h-auto' : ''} ${gesperrt ? 'opacity-50 shadow-none' : ''} disabled:cursor-default`}
        >
            <KnopfSymbol symbol={b.symbol} />
            <span key={`${zustand}-${b.text}`} className={styles.knopfText}>
                {b.text}
            </span>
        </button>
    );
}

/* ------------------------------------------------------------------ */
/* Komponente                                                          */
/* ------------------------------------------------------------------ */

export function KiDemo({ children, turnstileSiteKey, begruessungNachStimme = false }: { children: ReactNode; turnstileSiteKey?: string; begruessungNachStimme?: boolean }) {
    const [zustand, setZustand] = useState<Zustand>('eingabe');
    const [eingabe, setEingabe] = useState('');
    const [host, setHost] = useState('');
    const [scanFehler, setScanFehler] = useState<string | null>(null);
    const [schritte, setSchritte] = useState<SchrittAnzeige[]>([]);
    const [chips, setChips] = useState<Chip[]>([]);
    const [welleFarbe, setWelleFarbe] = useState(GRUEN_LEERLAUF);
    const [karte, setKarte] = useState<Karte | null>(null);

    // AUFTRAG-098: Hochdeutsch ist die Vorgabe (Englisch gleichwertig, Schweizerdeutsch in Erprobung)
    const [sprache, setSprache] = useState<Sprache>(SPRACHE_VORGABE);
    const [vorwahl, setVorwahl] = useState<'+41' | '+423'>('+41');
    const [nummer, setNummer] = useState('');
    const [einwilligung, setEinwilligung] = useState(false);
    const [honigtopf, setHonigtopf] = useState('');
    const [formFehler, setFormFehler] = useState<string | null>(null);
    const [auftrag, setAuftrag] = useState<Auftrag | null>(null);
    const [verbundenSeit, setVerbundenSeit] = useState<number | null>(null);
    const [jetzt, setJetzt] = useState(0);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    // AUFTRAG-103: nach 429 bleibt der jeweilige Button gesperrt (Server-Klartext bleibt stehen, kein Neuversuch)
    const [scanGesperrt, setScanGesperrt] = useState(false);
    const [anrufSperre, setAnrufSperre] = useState<string | null>(null);
    // AUFTRAG-109: Handelsregister-Abgleich (startet mit der Scan-Antwort), Bestätigung, Hinweis nach 403
    const [hrStart, setHrStart] = useState<HrAntwort | 'netz' | null>(null);
    const [hrBestaetigt, setHrBestaetigt] = useState<HrBestaetigt | null>(null);
    const [hrHinweis, setHrHinweis] = useState<string | null>(null);
    // AUFTRAG-111: Scan-Kennung des Firmen-Schritts (schon während des Scans) und die fertig vorbereitete
    // Karte — sie erscheint erst, wenn die Firma bestätigt ist
    const [hrScanId, setHrScanId] = useState<string | null>(null);
    const [vorbereitet, setVorbereitet] = useState<Karte | null>(null);
    // AUFTRAG-112: Scan-Kennung, deren Vorprüfung da ist (Stufe 1); Fehlertext des Vollscans (Stufe 2);
    // Kennung, für die der Vollscan schon gestartet wurde (einmal je Bestätigung)
    const [vorgeprueft, setVorgeprueft] = useState<string | null>(null);
    const [vollFehler, setVollFehler] = useState<string | null>(null);
    const vollGestartet = useRef<string | null>(null);

    // AUFTRAG-102: Sitzung (Lauf + Scan-Kennung) — Logo, Farben und Profil gehören immer zum laufenden Scan
    const sitzungRef = useRef<Sitzung>(LEERE_SITZUNG);
    const eingabeRef = useRef<HTMLInputElement>(null);
    const telefonRef = useRef<HTMLDivElement>(null);
    const buehneRef = useRef<HTMLDivElement>(null);
    const aktionRef = useRef<HTMLElement>(null);
    // AUFTRAG-122 (S7): mobil nach dem Anruf-Knopf Fokus auf die Karte, sobald sie wieder gerendert ist
    const fokusNachAnruf = useRef(false);
    // [09.11.2026] Warum: AUFTRAG-123 (Z5.1/Z5.2) — mobil «bereit» erst als Kurzblatt; true = Formular ausgeklappt. Der Merker
    // setzt nach dem Antippen (bzw. «Nochmals versuchen») den Fokus auf den Titel des Formulars (Tastatur bleibt zu).
    const [formOffen, setFormOffen] = useState(false);
    const fokusFormTitel = useRef(false);
    const [aktionMin, setAktionMin] = useState(0);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const turnstileWidget = useRef<string | null>(null);

    const name = karte?.profil.assistent_name ?? '';

    /* ---------- Scan ---------- */

    const setzeSchritt = useCallback((s: SchrittAnzeige) => {
        setSchritte((liste) => {
            const i = liste.findIndex((x) => x.id === s.id);
            if (i < 0) return [...liste, s];
            const neu = [...liste];
            neu[i] = s;
            return neu;
        });
    }, []);

    /*
     * AUFTRAG-109: automatischer Abgleich mit dem Handelsregister (UID aus dem Impressum, sonst
     * Firmenname). Läuft parallel zu den Scan-Schritten; nur die Antwort zum laufenden Scan zählt.
     * Ist der Scan schon bestätigt (gültiger Nachweis), geht es direkt zum Anruf-Schritt.
     */
    const pruefeRegister = useCallback(async (scanId: string, lauf: number) => {
        setHrStart(null);
        try {
            const res = await fetch('/api/demo/handelsregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scan_id: scanId }),
            });
            const d = (await res.json().catch(() => null)) as HrAntwort | null;
            if (!istAktuell(sitzungRef.current, lauf, scanId)) return;
            if (!res.ok || !d || d.scan_id !== scanId) {
                setHrStart('netz');
                return;
            }
            if (d.ergebnis === 'bestaetigt' && d.bestaetigt) setHrBestaetigt(d.bestaetigt);
            setHrStart(d);
        } catch {
            if (istAktuell(sitzungRef.current, lauf, scanId)) setHrStart('netz');
        }
    }, []);
    const hrUebersprungen = hrStart !== null && hrStart !== 'netz' && hrStart.ergebnis === 'uebersprungen';
    const hrOk = !!hrBestaetigt || hrUebersprungen;

    /*
     * AUFTRAG-112, Stufe 1: Inhaltsfilter und Vorprüfung (POST /api/demo/scan {url}). Danach zeigt das
     * Telefon nur «Website erreichbar» → «Firma wird im Handelsregister geprüft …» → «Wartet auf die
     * Bestätigung Ihrer Firma» (schritteAnzeige); keine Chips, kein Logo, keine Farbe (Welle bleibt
     * neutral), kein Profil. Der Handelsregister-Abgleich startet mit der Antwort.
     */
    const starteScan = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            if (zustand !== 'eingabe' || scanGesperrt) return;
            const wert = eingabe.trim();
            if (!wert || wert.length > 300 || !/\.[a-z]{2,}/i.test(wert)) {
                setScanFehler(HINWEIS.url);
                eingabeRef.current?.focus();
                return;
            }
            const neu = neueSitzung(sitzungRef.current);
            sitzungRef.current = neu;
            const lauf = neu.lauf;
            const h = hostVon(wert);
            setScanFehler(null);
            setChips([]);
            setKarte(null);
            setAuftrag(null);
            setFormFehler(null);
            setHrStart(null);
            setHrBestaetigt(null);
            setHrHinweis(null);
            setHrScanId(null);
            setVorbereitet(null);
            setVorgeprueft(null);
            setVollFehler(null);
            vollGestartet.current = null;
            // AUFTRAG-123 (Z5): neuer Scan → «bereit» wieder zuerst als Kurzblatt
            setFormOffen(false);
            setHost(h);
            setWelleFarbe(GRUEN_LEERLAUF);
            // bis zur Antwort der Vorprüfung keine Schritte (das Telefon zeigt Host und Welle)
            setSchritte([]);
            setZustand('scan');

            // Fehler (auch 422 Inhaltsfilter): Meldung unter dem URL-Feld, zurück zur Eingabe, keine Schritte,
            // das Feld behält den Wert und bekommt den Fokus
            const zurueckZurEingabe = (text: string) => {
                setScanFehler(text);
                setSchritte([]);
                setZustand('eingabe');
                setTimeout(() => eingabeRef.current?.focus(), 0);
            };
            let v: VorpruefungAntwort;
            try {
                const res = await fetch('/api/demo/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: wert }),
                });
                const daten = await res.json().catch(() => ({}));
                if (!istAktuell(sitzungRef.current, lauf)) return;
                if (!res.ok) {
                    // AUFTRAG-103: Limit erreicht → Button bleibt gesperrt, kein Neuversuch
                    if (res.status === 429) setScanGesperrt(true);
                    zurueckZurEingabe(typeof daten.fehler === 'string' ? daten.fehler : HINWEIS.netz);
                    return;
                }
                v = daten as VorpruefungAntwort;
            } catch {
                if (!istAktuell(sitzungRef.current, lauf)) return;
                zurueckZurEingabe(HINWEIS.netz);
                return;
            }
            // AUFTRAG-102: Scan-Kennung an diesen Lauf binden; ab jetzt zählt nur noch, was zu ihr gehört
            const gebunden = bindeScan(sitzungRef.current, lauf, v.scan_id);
            if (!gebunden) {
                if (sitzungRef.current.lauf !== lauf) return;
                zurueckZurEingabe(HINWEIS.netz);
                return;
            }
            sitzungRef.current = gebunden;
            setSchritte([
                { id: 'website', titel: HR_SCHRITT.websiteErreichbar, detail: h, status: 'ok' },
                // Text und Stand folgen dem Abgleich und der Bestätigung (schritteAnzeige)
                { id: 'handelsregister', titel: HR_SCHRITT.telefonPruefung, status: 'laeuft' },
            ]);
            setVorgeprueft(v.scan_id);
            // AUFTRAG-111: der Firmen-Schritt im Formularbereich kann ab jetzt suchen und bestätigen
            setHrScanId(v.scan_id);
            // AUFTRAG-109: Handelsregister-Abgleich startet sofort
            void pruefeRegister(v.scan_id, lauf);
        },
        [eingabe, zustand, scanGesperrt, pruefeRegister],
    );

    /*
     * AUFTRAG-112, Stufe 2: erst nach der Bestätigung der Firma (gleiche scan_id) bzw. bei abgeschalteter
     * Prüfung — Vollscan (POST /api/demo/scan {scan_id}), danach exakt die bisherige Abfolge: Logo,
     * Markenfarbe und Welle, Telefon, Öffnungszeiten, Wissen (KI-Profil), Chips; die Karte wird vorbereitet
     * («Assistent wird vorbereitet …», «<Name> ist bereit» im Effekt unten). Fehler: Schritt «website» auf
     * Fehler, Hinweis mit dem Servertext und «Nochmals versuchen». Fehlt der Nachweis (403), zurück zum
     * Firmen-Schritt; nach der neuen Bestätigung startet Stufe 2 wieder.
     */
    const starteVollscan = useCallback(
        async (scanId: string, lauf: number, h: string) => {
            const aktuell = () => istAktuell(sitzungRef.current, lauf, scanId);
            setVollFehler(null);
            setzeSchritt({ id: 'website', titel: HR_SCHRITT.websiteWirdGelesen, detail: h, status: 'laeuft' });
            const scheitern = (text: string) => {
                setzeSchritt({ id: 'website', titel: text, detail: h, status: 'fehler' });
                setVollFehler(text);
            };

            let scan: ScanAntwort;
            try {
                const res = await fetch('/api/demo/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scan_id: scanId }),
                });
                const daten = await res.json().catch(() => ({}));
                if (!aktuell()) return;
                if (res.status === 403 && (daten.code === HR_CODE_FEHLT || daten.code === HR_CODE_ABGELAUFEN)) {
                    vollGestartet.current = null;
                    setzeSchritt({ id: 'website', titel: HR_SCHRITT.websiteErreichbar, detail: h, status: 'ok' });
                    setHrBestaetigt(null);
                    setHrHinweis(typeof daten.fehler === 'string' ? daten.fehler : null);
                    void pruefeRegister(scanId, lauf);
                    return;
                }
                if (!res.ok || daten.scan_id !== scanId) {
                    scheitern(typeof daten.fehler === 'string' ? daten.fehler : HINWEIS.netz);
                    return;
                }
                scan = daten as ScanAntwort;
            } catch {
                if (!aktuell()) return;
                scheitern(HINWEIS.netz);
                return;
            }

            // KI-Profil und Logo laufen parallel zu den Schritten; das Profil zählt nur mit derselben scan_id
            const profilVersprechen: Promise<ProfilAntwort> = fetch('/api/demo/profil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scan_id: scan.scan_id }),
            })
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => (d && d.profil && profilPasst(sitzungRef.current, lauf, d) ? (d as ProfilAntwort) : { profil: scan.profil }))
                .catch(() => ({ profil: scan.profil }));
            // nur Logos mit dieser Scan-Kennung im Pfad (/api/demo/bild/<scan_id>/<n>)
            const logoVersprechen = ladeLogo(logosDesScans(scan.logos, scan.scan_id), scan.farb_signale ?? []);
            const takt = async (ms = 360) => {
                await pause(ms);
                return aktuell();
            };

            const seiten = scan.funde?.seiten ?? 1;
            setzeSchritt({ id: 'website', titel: HR_SCHRITT.websiteGelesen, detail: HR_SCHRITT.websiteGelesenDetail(h, seiten), status: 'ok' });
            if (!(await takt())) return;

            setzeSchritt({ id: 'logo', titel: 'Logo wird geprüft …', status: 'laeuft' });
            const { logo, marke } = await logoVersprechen;
            if (!aktuell()) return;
            if (logo) {
                setzeSchritt({ id: 'logo', titel: 'Logo gefunden', status: 'ok', logoSrc: logo.src, logoGrund: logo.plakette.farbe });
                setChips((c) => [...c, { id: 'logo', text: 'Logo', logoSrc: logo.src, logoGrund: logo.plakette.farbe }]);
            } else {
                setzeSchritt({ id: 'logo', titel: 'Kein Logo gefunden', detail: 'Die Karte zeigt die Initiale', status: 'leer' });
            }
            if (!(await takt())) return;

            // AUFTRAG-096: Markenfarbe aus den gewichteten Signalen (inkl. Logo-Farbe), zuletzt Server-Ergebnis
            const farbe = marke ?? scan.funde?.farbe ?? scan.profil.farben?.primaer ?? null;
            if (farbe) {
                setWelleFarbe(farbe);
                setzeSchritt({ id: 'farbe', titel: `Markenfarbe ${farbe}`, status: 'ok', farbe });
                setChips((c) => [...c, { id: 'farbe', text: farbe, farbe }]);
            } else {
                setWelleFarbe(NEUTRAL_PRIMAER);
                setzeSchritt({ id: 'farbe', titel: 'Keine Markenfarbe gefunden', detail: 'Die Karte nutzt ein neutrales Blau', status: 'leer' });
            }
            if (!(await takt())) return;

            const tel = scan.funde?.telefon ?? null;
            setzeSchritt(tel ? { id: 'telefon', titel: `Telefon ${tel}`, status: 'ok' } : { id: 'telefon', titel: 'Keine Telefonnummer gefunden', status: 'leer' });
            if (tel) setChips((c) => [...c, { id: 'telefon', text: 'Telefon', icon: 'telefon' }]);
            if (!(await takt())) return;

            const zeiten = scan.funde?.oeffnungszeiten ?? null;
            setzeSchritt(zeiten ? { id: 'zeiten', titel: `Öffnungszeiten ${kurz(zeiten, 60)}`, status: 'ok' } : { id: 'zeiten', titel: 'Keine Öffnungszeiten gefunden', status: 'leer' });
            if (zeiten) setChips((c) => [...c, { id: 'zeiten', text: 'Öffnungszeiten', icon: 'zeiten' }]);
            if (!(await takt())) return;

            setzeSchritt({ id: 'wissen', titel: 'Wissen wird aufgebaut …', status: 'laeuft' });
            const profil = await profilVersprechen;
            if (!aktuell()) return;
            const p = profil.profil;
            const anzahl = p.wissen.length;
            setzeSchritt({ id: 'wissen', titel: `${anzahl} Wissenseinträge`, detail: 'aus Ihrer Website', status: 'ok' });
            setChips((c) => [...c.filter((x) => x.id !== 'wissen'), { id: 'wissen', text: `Wissen: ${anzahl} Einträge`, icon: 'wissen' }]);
            // Die KI findet manchmal Telefon/Zeiten, die die Regeln verpasst haben
            if (!tel && profil.funde?.telefon) {
                setzeSchritt({ id: 'telefon', titel: `Telefon ${profil.funde.telefon}`, status: 'ok' });
                setChips((c) => [...c.filter((x) => x.id !== 'wissen'), { id: 'telefon', text: 'Telefon', icon: 'telefon' }, ...c.filter((x) => x.id === 'wissen')]);
            }
            if (!zeiten && profil.funde?.oeffnungszeiten) {
                setzeSchritt({ id: 'zeiten', titel: `Öffnungszeiten ${kurz(profil.funde.oeffnungszeiten, 60)}`, status: 'ok' });
            }
            if (!(await takt())) return;

            // AUFTRAG-111: Karte vorbereiten; «Assistent bereit», Karte und Formular folgen im Effekt unten
            // (AUFTRAG-112: die Firma ist hier schon bestätigt — Stufe 2 startet erst danach)
            const stimme: Stimme = p.stimme ?? (scan.assistent_weiblich ? 'weiblich' : 'maennlich');
            setVorbereitet({ scanId: scan.scan_id, profil: p, faehigkeitenEn: standardAufEnglisch(p.faehigkeiten), stimme, logo, primaer: farbe ?? NEUTRAL_PRIMAER });
        },
        [setzeSchritt, pruefeRegister],
    );

    /*
     * AUFTRAG-111: Assistent erst nach der Bestätigung der Firma bereit. Sind die Scan-Schritte fertig
     * (Karte vorbereitet) und ist die Firma bestätigt: «Assistent wird vorbereitet …» → «<Name> ist
     * bereit» → Karte und Anruf-Formular. Ohne Bestätigung bleibt der Schritt «Assistent» auf
     * «Wartet auf die Bestätigung Ihrer Firma» (schritteAnzeige).
     */
    useEffect(() => {
        if (zustand !== 'scan' || !vorbereitet || !hrOk || vorbereitet.scanId !== hrScanId) return;
        const k = vorbereitet;
        const zeiten = [
            setTimeout(() => setzeSchritt({ id: 'assistent', titel: 'Assistent wird vorbereitet …', status: 'laeuft' }), 0),
            setTimeout(() => setzeSchritt({ id: 'assistent', titel: `${k.profil.assistent_name} ist bereit`, status: 'ok' }), 380),
            setTimeout(() => {
                setKarte(k);
                setZustand('bereit');
            }, 700),
        ];
        return () => zeiten.forEach(clearTimeout);
    }, [zustand, vorbereitet, hrOk, hrScanId, setzeSchritt]);

    /*
     * AUFTRAG-112: Stufe 2 startet, sobald die Firma bestätigt ist (bzw. die Prüfung abgeschaltet) — nur für
     * den Scan, dessen Vorprüfung da ist, und nur einmal je Bestätigung (nach 403 im Vollscan wieder).
     */
    useEffect(() => {
        if (zustand !== 'scan' || !hrOk || !hrScanId || vorgeprueft !== hrScanId || vollGestartet.current === hrScanId) return;
        const scanId = hrScanId;
        const lauf = sitzungRef.current.lauf;
        const t = setTimeout(() => {
            if (vollGestartet.current === scanId || !istAktuell(sitzungRef.current, lauf, scanId)) return;
            vollGestartet.current = scanId;
            void starteVollscan(scanId, lauf, host);
        }, 0);
        return () => clearTimeout(t);
    }, [zustand, hrOk, hrScanId, vorgeprueft, host, starteVollscan]);

    /** AUFTRAG-112: «Nochmals versuchen» nach einem Fehler im Vollscan */
    const vollscanNochmals = () => {
        if (!hrScanId || !istAktuell(sitzungRef.current, sitzungRef.current.lauf, hrScanId)) return;
        vollGestartet.current = hrScanId;
        void starteVollscan(hrScanId, sitzungRef.current.lauf, host);
    };

    // AUFTRAG-098: Fähigkeiten auf Englisch erst bei der ersten Wahl von «English» übersetzen (einmal je Scan)
    const enAngefragt = useRef<string | null>(null);
    const enScanId = sprache === 'englisch' && karte && karte.faehigkeitenEn === null ? karte.scanId : null;
    useEffect(() => {
        if (!enScanId || enAngefragt.current === enScanId) return;
        enAngefragt.current = enScanId;
        const setzen = (liste: string[]) => setKarte((k) => (k && k.scanId === enScanId ? { ...k, faehigkeitenEn: liste } : k));
        fetch('/api/demo/faehigkeiten', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scan_id: enScanId }) })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => setzen(Array.isArray(d?.faehigkeiten_en) && d.faehigkeiten_en.length === 3 ? d.faehigkeiten_en : [...STANDARD_FAEHIGKEITEN_EN]))
            .catch(() => setzen([...STANDARD_FAEHIGKEITEN_EN]));
    }, [enScanId]);

    /*
     * AUFTRAG-100: Mobil kein automatischer Sprung zum Telefon mehr. Ist das
     * Telefon ausserhalb des Bildes, zeigt eine kompakte Statuszeile oben
     * (unter dem Header) Schritt und Fund; Antippen springt zum Telefon.
     * Desktop: Das Telefon läuft ab lg mit (position: sticky, siehe CSS).
     */
    /*
     * [09.11.2026] Warum: AUFTRAG-122 Telefon als Bühne, Karte darüber — das Telefon ist mobil wieder immer gerendert
     * (A-121 hatte es im Kompaktmodus weggelassen) und wird wieder beobachtet; im Kompaktmodus steht die Statuszeile
     * trotzdem immer (siehe statusSichtbar).
     */
    const istMobil = useSyncExternalStore(mobilAbonnieren, istMobilJetzt, () => false);
    const kompakt = istMobil && zustand !== 'eingabe';
    /*
     * [09.11.2026] Warum: AUFTRAG-123 (Z1.1) — die Statuszeile gilt mobil wieder nur, wenn das Telefon (die Bühne) nicht im
     * Bild ist. `kompakt` in der Messung: beim Wechsel in den Kompaktmodus ändert sich das ganze Layout; bis die neue
     * Beobachtung (Effekt mit Abhängigkeit kompakt) gemeldet hat, gilt die alte Messung nicht (sonst blitzt die Zeile auf).
     */
    const [sicht, setSicht] = useState({ telefon: true, oben: false, buehne: true, kompakt: false });
    useEffect(() => {
        const tel = telefonRef.current;
        const buehne = buehneRef.current;
        // AUFTRAG-121 (K2): die Bühne wird immer beobachtet (Statuszeile weg ausserhalb der Demo)
        if (!buehne || typeof IntersectionObserver === 'undefined') return;
        // Header mobil: 64 px + 16 px Abstand oben
        const rand = '-80px 0px 0px 0px';
        const ioTel = new IntersectionObserver(
            ([e]) => {
                const oberkante = e.rootBounds?.top ?? 80;
                const telefon = e.intersectionRatio >= 0.35;
                const oben = e.boundingClientRect.top < oberkante;
                // nur neu zeichnen, wenn sich etwas ändert
                setSicht((s) => (s.telefon === telefon && s.oben === oben && s.kompakt === kompakt ? s : { ...s, telefon, oben, kompakt }));
            },
            { rootMargin: rand, threshold: [0, 0.2, 0.35, 0.5, 0.75, 1] },
        );
        const ioBuehne = new IntersectionObserver(([e]) => setSicht((s) => (s.buehne === e.isIntersecting ? s : { ...s, buehne: e.isIntersecting })), { rootMargin: rand });
        if (tel) ioTel.observe(tel);
        ioBuehne.observe(buehne);
        return () => {
            ioTel.disconnect();
            ioBuehne.disconnect();
        };
    }, [kompakt]);

    const zumTelefon = () => {
        const el = telefonRef.current;
        if (!el) return;
        const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
        el.focus({ preventScroll: true });
    };

    // Aktionskarte wächst nur: die grösste bisher gemessene Höhe bleibt als Mindesthöhe
    const aktionSichtbar = zustand !== 'eingabe';
    useEffect(() => {
        const el = aktionRef.current;
        if (!aktionSichtbar || !el || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver((eintraege) => {
            // AUFTRAG-121 (K3): mobil hat die Karte eine feste Höhe (Fenster) — dort keine Mindesthöhe festhalten
            if (istMobilJetzt()) return;
            const h = Math.round(eintraege[0]?.borderBoxSize?.[0]?.blockSize ?? el.getBoundingClientRect().height);
            // Ausreisser (z. B. Ganzseiten-Screenshot mit riesigem Viewport) nicht festhalten
            if (h > window.innerHeight * 2.5 && h > 1400) return;
            setAktionMin((m) => (h > m ? h : m));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [aktionSichtbar]);

    /*
     * [09.11.2026] Warum: AUFTRAG-121 (K2/K5) — die Sprünge aus AUFTRAG-120 (zur Karte, zum Telefon, zurück zur Karte),
     * der Statuszeilen-Hinweis «Bitte Firma bestätigen» und die gemessene Mindesthöhe im Firmen-Schritt (Nacharbeit 2)
     * entfallen: Im Kompaktmodus liegt die Karte immer ganz im Bild und hat eine feste Höhe (CSS), die Seite scrollt nie.
     *
     * AUFTRAG-121 (K7): mobil nach dem Scan Fokus auf das erste wählbare Firmen-Radio (ohne Scrollen); die Liste steht
     * im Bild. Am Desktop unverändert (kein Fokuswechsel).
     * [09.11.2026] Warum: AUFTRAG-123 (Z4) — mobil gibt es keine Radios mehr (eine ruhige Karte bzw. antippbare Zeilen, ein
     * Tipp bestätigt): Fokus auf den Titel des Firmen-Blatts (ohne Scrollen), nicht auf eine Handlung.
     */
    const hrTrefferDa = hrStart !== null && hrStart !== 'netz' && hrStart.ergebnis === 'treffer' ? hrStart : null;
    useEffect(() => {
        if (!kompakt || !hrTrefferDa || hrOk) return;
        const t = setTimeout(() => (document.querySelector('[data-handelsregister] #ki-demo-anruf-titel') as HTMLElement | null)?.focus({ preventScroll: true }), 0);
        return () => clearTimeout(t);
    }, [kompakt, hrTrefferDa, hrOk]);

    /*
     * AUFTRAG-121 (K3.4): «Mehr anzeigen» nur, wenn die Zusammenfassung mehr als acht Zeilen hat (gemessen am
     * gekürzten Absatz). Neuer Anruf → wieder zu.
     */
    const [mehrOffen, setMehrOffen] = useState(false);
    const [zfLang, setZfLang] = useState(false);
    const zfRef = useRef<HTMLParagraphElement>(null);

    const andereWebsite = () => {
        // neuer Lauf: verspätete Antworten des bisherigen Scans werden verworfen
        sitzungRef.current = neueSitzung(sitzungRef.current);
        setAktionMin(0);
        setMehrOffen(false);
        setZustand('eingabe');
        setKarte(null);
        setAuftrag(null);
        setChips([]);
        setSchritte([]);
        setFormFehler(null);
        setVerbundenSeit(null);
        setWelleFarbe(GRUEN_LEERLAUF);
        setHrStart(null);
        setHrBestaetigt(null);
        setHrHinweis(null);
        setHrScanId(null);
        setVorbereitet(null);
        setVorgeprueft(null);
        setVollFehler(null);
        vollGestartet.current = null;
        setFormOffen(false);
        setTimeout(() => {
            eingabeRef.current?.focus();
            eingabeRef.current?.select();
        }, 0);
    };

    /* ---------- Turnstile (nur wenn konfiguriert) ---------- */

    /*
     * AUFTRAG-103: Der Container existiert nur im Zustand «bereit». Verlässt die Karte «bereit»
     * (Absenden, Anruf, Fehler), wird das Widget entfernt; beim nächsten «bereit» rendert ein
     * frisches Widget mit neuem Token (Turnstile-Token gelten nur einmal). Vorher blieb die alte
     * Widget-Kennung stehen: nach dem ersten Versuch erschien kein Widget mehr, jeder weitere
     * Versuch scheiterte mit 403.
     */
    useEffect(() => {
        // AUFTRAG-109: das Formular (und damit der Container) erscheint erst nach der Handelsregister-Bestätigung
        if (!turnstileSiteKey || zustand !== 'bereit' || !hrOk || anrufSperre || !turnstileRef.current) return;
        let aktiv = true;
        const rendern = () => {
            if (!aktiv || !window.turnstile || !turnstileRef.current || turnstileWidget.current) return;
            turnstileWidget.current = window.turnstile.render(turnstileRef.current, {
                sitekey: turnstileSiteKey,
                callback: (t: string) => setTurnstileToken(t),
                'expired-callback': () => setTurnstileToken(null),
                'error-callback': () => setTurnstileToken(null),
                language: 'de',
                // [09.11.2026] Warum: AUFTRAG-123 (Z5.4) — mobil braucht das Widget nur bei einer echten Prüfung Platz
                ...(kompakt ? { appearance: 'interaction-only' } : {}),
            });
        };
        if (window.turnstile) {
            rendern();
        } else {
            let s = document.getElementById('ki-demo-turnstile-skript') as HTMLScriptElement | null;
            if (!s) {
                s = document.createElement('script');
                s.id = 'ki-demo-turnstile-skript';
                s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
                s.async = true;
                document.head.appendChild(s);
            }
            s.addEventListener('load', rendern, { once: true });
        }
        return () => {
            aktiv = false;
            const id = turnstileWidget.current;
            turnstileWidget.current = null;
            if (id && window.turnstile) {
                try {
                    window.turnstile.remove(id);
                } catch {
                    /* Widget schon weg */
                }
            }
        };
        // AUFTRAG-123 (Z5): mobil liegt der Behälter erst im ausgeklappten Formular (formOffen)
    }, [turnstileSiteKey, zustand, anrufSperre, hrOk, kompakt, formOffen]);

    /* ---------- Anruf ---------- */

    const starteAnruf = async (e: FormEvent) => {
        e.preventDefault();
        if (!karte || zustand !== 'bereit' || anrufSperre || !hrOk) return;
        setFormFehler(null);
        const pruefung = pruefeRueckrufNummer(nummer, vorwahl);
        if (!pruefung.ok) {
            setFormFehler(pruefung.grund === 'sonderdienst' ? HINWEIS.sonderdienst : HINWEIS.nummer);
            document.getElementById('ki-demo-nummer')?.focus();
            return;
        }
        if (!einwilligung) {
            setFormFehler(HINWEIS.einwilligung);
            document.getElementById('ki-demo-einwilligung')?.focus();
            return;
        }
        // Sofortige Rückmeldung: der Button zeigt den Wartezustand, solange der Auftrag angelegt wird
        setZustand('wartend');
        // AUFTRAG-121 (K7): mobil Fokus auf die Karte statt ins Leere (ohne Scrollen). [09.11.2026] Warum: AUFTRAG-122 (S7) —
        // während des Anrufs gibt es mobil keine Karte; der Fokus kommt auf die Karte, sobald sie wieder da ist (Ende, Fehler)
        if (istMobilJetzt()) fokusNachAnruf.current = true;
        // Turnstile-Token gilt nur einmal; das nächste «bereit» rendert ein frisches Widget
        const token = turnstileToken;
        setTurnstileToken(null);
        try {
            const res = await fetch('/api/demo/anruf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scan_id: karte.scanId,
                    nummer: pruefung.e164,
                    sprache,
                    einwilligung: true,
                    honigtopf,
                    farben: { primaer: karte.primaer, sekundaer: karte.profil.farben?.sekundaer ?? helligkeit(karte.primaer, -0.18) },
                    ...(karte.logo ? { logo_index: karte.logo.index } : {}),
                    ...(turnstileSiteKey ? { turnstile: token } : {}),
                }),
            });
            const daten = await res.json().catch(() => ({}));
            // AUFTRAG-109: Nachweis fehlt oder ist abgelaufen → zurück zur Bestätigung (Ergebnis kommt aus dem Speicher)
            if (res.status === 403 && (daten.code === HR_CODE_FEHLT || daten.code === HR_CODE_ABGELAUFEN)) {
                setHrBestaetigt(null);
                setHrHinweis(typeof daten.fehler === 'string' ? daten.fehler : null);
                setZustand('bereit');
                void pruefeRegister(karte.scanId, sitzungRef.current.lauf);
                return;
            }
            if (res.status !== 201 || typeof daten.id !== 'string') {
                const text = typeof daten.fehler === 'string' ? daten.fehler : HINWEIS.netz;
                // AUFTRAG-103: 429 (Limit) zeigt den Server-Klartext und sperrt den Button — kein automatischer Neuversuch
                if (res.status === 429) setAnrufSperre(text);
                setZustand('bereit');
                setFormFehler(text);
                return;
            }
            setAuftrag({ id: daten.id, dauer_s: null, zusammenfassung: null, grund: null });
        } catch {
            setZustand('bereit');
            setFormFehler(HINWEIS.netz);
        }
    };

    /*
     * Status-Polling (AUFTRAG-098, sparsam für Netlify Free): alle 4 s bis zum
     * Endzustand, danach keine Abfrage mehr. Bei verdecktem Tab (Besucher am
     * Telefon, anderer Tab) Pause; beim Zurückkommen sofort eine Abfrage. Nach
     * 20 Minuten ohne Endzustand Schluss: Hinweis «Keine Rückmeldung» mit
     * «Nochmals versuchen» (kein totes Ende).
     */
    const auftragId = auftrag?.id;
    useEffect(() => {
        if (!auftragId) return;
        let aktiv = true;
        let fertig = false;
        let laeuft = false;
        const start = Date.now();
        let timer: ReturnType<typeof setTimeout> | undefined;
        const verdeckt = () => document.visibilityState === 'hidden';
        const planen = () => {
            clearTimeout(timer);
            timer = undefined;
            if (aktiv && !fertig && !verdeckt()) timer = setTimeout(abfragen, STATUS_TAKT_MS);
        };
        const abfragen = async () => {
            if (!aktiv || fertig || laeuft) return;
            laeuft = true;
            try {
                const res = await fetch(`/api/demo/auftraege/${auftragId}`, { cache: 'no-store' });
                if (res.ok) {
                    const d = (await res.json()) as { id: string; status: AuftragStatus; dauer_s: number | null; zusammenfassung: string | null; grund?: string | null };
                    if (!aktiv) return;
                    const neu = zustandAusStatus(d.status);
                    if (neu === 'verbunden') {
                        const t = Date.now();
                        setVerbundenSeit((v) => v ?? t);
                        setJetzt(t);
                    }
                    setZustand((alt) => naechsterZustand(alt, neu));
                    setAuftrag((a) => (a && a.id === d.id ? { ...a, dauer_s: d.dauer_s, zusammenfassung: d.zusammenfassung, grund: d.grund ?? null } : a));
                    if (istEndStatus(d.status)) fertig = true;
                }
            } catch {
                /* nächster Versuch */
            } finally {
                laeuft = false;
            }
            if (aktiv && !fertig && Date.now() - start > STATUS_MAX_MS) {
                fertig = true;
                setAuftrag((a) => (a && a.id === auftragId ? { ...a, grund: GRUND_KEINE_RUECKMELDUNG } : a));
                setZustand('fehler');
            }
            planen();
        };
        const sichtbarkeit = () => {
            if (verdeckt()) {
                clearTimeout(timer);
                timer = undefined;
            } else if (!laeuft) {
                clearTimeout(timer);
                void abfragen();
            }
        };
        document.addEventListener('visibilitychange', sichtbarkeit);
        planen();
        return () => {
            aktiv = false;
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', sichtbarkeit);
        };
    }, [auftragId]);

    // Gesprächsdauer zählen, solange verbunden (Start = erster «verbunden»-Status im Polling)
    useEffect(() => {
        if (zustand !== 'verbunden') return;
        const t = setInterval(() => setJetzt(Date.now()), 1000);
        return () => clearInterval(t);
    }, [zustand]);

    const nochmals = () => {
        setMehrOffen(false);
        setAuftrag(null);
        setVerbundenSeit(null);
        setEinwilligung(false);
        setFormFehler(null);
        setZustand('bereit');
    };
    // [09.11.2026] Warum: AUFTRAG-123 (Z5.6) — mobil nach «Nochmals versuchen» direkt das ausgeklappte Formular derselben
    // Firma (der Besucher war schon dort), Fokus auf dessen Titel
    const nochmalsKompakt = () => {
        fokusFormTitel.current = true;
        setFormOffen(true);
        nochmals();
    };

    /* ---------- Darstellung ---------- */

    const kartenAnzeige: KartenAnzeige | null = useMemo(() => {
        if (!karte) return null;
        const p = karte.profil;
        const primaer = karte.primaer;
        const englisch = sprache === 'englisch';
        /*
         * AUFTRAG-111: Firmenname erst nach der Bestätigung — Rollenzeile mit dem Handelsregister-Namen
         * (ab 40 Zeichen gekürzt, Titel voll), Begrüssung und Anruf-Ansichten mit dem gebundenen
         * Sprechnamen (so meldet sich der Assistent). Vorher neutral («Ihrer Firma»), nie der Scan-Name.
         * Schalter «aus» (nur Entwicklung): wie bisher der Name aus dem Scan.
         */
        const hrName = hrBestaetigt?.name ?? null;
        const neutral = englisch ? 'your company' : 'Ihrer Firma';
        const sprech = hrName ? sprechName(p.firma, hrName) : hrUebersprungen ? p.firma : null;
        const rollenFirma = hrName ?? (hrUebersprungen ? p.firma : neutral);
        return {
            name: p.assistent_name,
            // AUFTRAG-098: bei «English» Karte auf Englisch («AI phone assistant of FIRMA»)
            rollenZeile: rollenZeile(karte.stimme, sprache, kuerzeName(rollenFirma, 40)),
            rollenTitel: rollenZeile(karte.stimme, sprache, rollenFirma),
            lang: englisch ? ('en' as const) : ('de' as const),
            firma: sprech ?? (englisch ? 'Your company' : 'Ihre Firma'),
            website: p.website.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            // AUFTRAG-102: «Kennt Ansprechpersonen» nur, wenn auf der Website Personen gefunden wurden
            kann: kannZeilen(englisch ? karte.faehigkeitenEn : p.faehigkeiten, p.personen?.length ?? 0, englisch),
            logo: karte.logo ? { src: karte.logo.src, grund: karte.logo.plakette.art, farbe: karte.logo.plakette.art === 'marke' ? primaer : karte.logo.plakette.farbe, breite: karte.logo.breite, hoehe: karte.logo.hoehe } : null,
            primaer,
            tief: helligkeit(primaer, -0.16),
            text: textAuf(primaer),
            akzentHell: lesbarAuf(primaer, '#F5F6F7', 3),
            akzentDunkel: lesbarAuf(primaer, '#0F1216', 3),
            begruessung: begruessungFuer(sprache, p.assistent_name, sprech ?? neutral, karte.stimme, begruessungNachStimme),
        };
    }, [karte, sprache, begruessungNachStimme, hrBestaetigt, hrUebersprungen]);
    const firma = kartenAnzeige?.firma ?? '';

    /*
     * AUFTRAG-111: Schritte im Telefon — «Handelsregister» folgt der Bestätigung (läuft → «Handelsregister:
     * <Name>», ok); sind die übrigen Schritte fertig und die Firma noch offen, wartet «Assistent».
     * AUFTRAG-112: Die Firma wartet schon nach der Vorprüfung (Stufe 1); findet der automatische Abgleich
     * nichts Aktives: «Firma im Handelsregister nicht gefunden» (leer, «Unten nach Firmenname oder UID suchen»).
     */
    const wartetAufFirma = zustand === 'scan' && !!hrScanId && vorgeprueft === hrScanId && !hrOk;
    const hrNichtGefunden = hrStart !== null && hrStart !== 'netz' && (hrStart.ergebnis === 'kein_treffer' || hrStart.ergebnis === 'nicht_aktiv');
    const schritteAnzeige: SchrittAnzeige[] = useMemo(() => {
        const hr: SchrittAnzeige = hrBestaetigt
            ? { id: 'handelsregister', titel: HR_SCHRITT.telefonBestaetigt(hrBestaetigt.name), status: 'ok' }
            : hrUebersprungen
              ? { id: 'handelsregister', titel: 'Handelsregister-Prüfung ausgeschaltet', status: 'leer' }
              : hrNichtGefunden
                ? { id: 'handelsregister', titel: HR_SCHRITT.telefonNichtGefunden, detail: HR_SCHRITT.telefonNichtGefundenDetail, status: 'leer' }
                : { id: 'handelsregister', titel: HR_SCHRITT.telefonPruefung, status: 'laeuft' };
        const liste = schritte.map((s) => (s.id === 'handelsregister' ? hr : s));
        if (wartetAufFirma && !liste.some((s) => s.id === 'assistent')) liste.push({ id: 'assistent', titel: HR_SCHRITT.assistentWartet, status: 'leer' });
        return liste;
    }, [schritte, hrBestaetigt, hrUebersprungen, hrNichtGefunden, wartetAufFirma]);

    const dauerSek =
        zustand === 'verbunden' && verbundenSeit
            ? Math.max(0, Math.round((jetzt - verbundenSeit) / 1000))
            : auftrag?.dauer_s ?? (verbundenSeit ? Math.max(0, Math.round((jetzt - verbundenSeit) / 1000)) : 0);

    const telefonWelle = zustand === 'eingabe' ? GRUEN_LEERLAUF : karte ? karte.primaer : welleFarbe;
    const nummerAnzeige = (() => {
        const p = pruefeRueckrufNummer(nummer, vorwahl);
        return p.ok ? formatiereNummer(p.e164) : nummer;
    })();
    const sprachEintrag = SPRACH_WAHL.find((s) => s.wert === sprache);
    const sprachText = sprachEintrag ? sprachName(sprachEintrag) : '';
    const verlauf: Array<{ titel: string; detail: string; stand: 'offen' | 'laeuft' | 'ok' | 'fehler' }> = [
        {
            titel: 'Auftrag angenommen',
            detail: zustand === 'bereit' ? 'sofort nach Ihrem Klick' : `Sprache: ${sprachText}`,
            stand: zustand === 'bereit' ? 'offen' : auftrag || zustand === 'fehler' ? 'ok' : 'laeuft',
        },
        {
            titel: 'Ihr Telefon klingelt',
            detail:
                zustand === 'fehler'
                    ? auftrag?.grund === 'limit'
                        ? 'Tageslimit für diese Nummer erreicht'
                        : auftrag?.grund === GRUND_KEINE_RUECKMELDUNG
                          ? 'seit 20 Minuten keine Rückmeldung'
                          : `${nummerAnzeige} nicht erreicht`
                    : zustand === 'bereit'
                      ? `Anruf von ${ANRUF_VON}`
                      : `Anruf von ${ANRUF_VON} an ${nummerAnzeige}`,
            stand: zustand === 'fehler' ? 'fehler' : zustand === 'verbunden' ? 'ok' : zustand === 'waehlt' ? 'laeuft' : 'offen',
        },
        {
            titel: `Gespräch mit ${kartenAnzeige?.name ?? 'Ihrem Assistenten'}`,
            detail: zustand === 'verbunden' ? `läuft seit ${dauerAnzeige(dauerSek)} · höchstens drei Minuten` : 'höchstens drei Minuten',
            stand: zustand === 'verbunden' ? 'laeuft' : 'offen',
        },
        { titel: 'Zusammenfassung', detail: 'erscheint hier nach dem Gespräch', stand: 'offen' },
    ];
    const imAnruf = zustand === 'wartend' || zustand === 'waehlt' || zustand === 'verbunden';

    /*
     * [09.11.2026] Warum: AUFTRAG-122 Telefon als Bühne, Karte darüber (S3) — mobil ist die Handlungskarte in den
     * passiven Phasen nicht gerendert: Vollscan nach der Bestätigung (ausser bei einem Fehler im Vollscan) und Anruf.
     * Dann zeigt allein das Telefon den Stand. Am Desktop immer gerendert (ab dem Scan).
     */
    const karteDa = zustand !== 'eingabe' && !(kompakt && ((zustand === 'scan' && hrOk && !vollFehler) || imAnruf));
    useEffect(() => {
        if (!kompakt || !karteDa || !fokusNachAnruf.current) return;
        fokusNachAnruf.current = false;
        const t = setTimeout(() => aktionRef.current?.focus({ preventScroll: true }), 0);
        return () => clearTimeout(t);
    }, [kompakt, karteDa]);

    /*
     * [09.11.2026] Warum: AUFTRAG-123 (Z2) — das Telefon wird nie vom Blatt angeschnitten. Mobil (Kompaktmodus) skaliert es
     * sich per Transform (Ursprung oben Mitte, CSS) auf s = min(1, (Bühnenhöhe − Blatthöhe − 12 px) / Telefonhöhe); unter
     * TELEFON_MIN_SKALA (0,36, AUFTRAG-123b N1) blendet es aus (data-telefon-aus, bleibt im DOM). Ohne Blatt
     * s = min(1, Bühnenhöhe / Telefonhöhe): 1, ausser die Mindestbreite (CSS --telefon-min-b, sehr niedrige Fenster wie 375×553) macht das Telefon höher als die Bühne.
     * Gemessen per ResizeObserver an Bühne, Telefon und Blatt (Blatt mit display: none = Höhe 0 = kein Blatt). Gesetzt direkt
     * an der Bühne (--telefon-skala) und vor dem Zeichnen, damit Blatt und Skala im selben Bild gelten. Transform verschiebt
     * kein Layout (CLS 0). Am Desktop weder Variable noch Attribut.
     */
    useLayoutEffect(() => {
        const buehne = buehneRef.current;
        if (!buehne) return;
        if (!kompakt) {
            buehne.style.removeProperty('--telefon-skala');
            buehne.removeAttribute('data-telefon-aus');
            return;
        }
        const figur = telefonRef.current?.firstElementChild as HTMLElement | null;
        const blatt = karteDa ? aktionRef.current : null;
        const rechnen = () => {
            const zeilen = getComputedStyle(buehne).gridTemplateRows.split(' ');
            const buehneH = parseFloat(zeilen[zeilen.length - 1]) || 0;
            const telefonH = figur?.offsetHeight ?? 0;
            const blattH = blatt?.offsetHeight ?? 0;
            const verfuegbar = blattH > 0 ? buehneH - blattH - TELEFON_LUFT : buehneH;
            // 0,5 px Toleranz: Breite × 18,6 / 9 rundet minimal über die Bühnenhöhe (sonst Skala 0,999 ohne Blatt)
            const s = telefonH > 0 && (blattH > 0 || telefonH > buehneH + 0.5) ? Math.min(1, Math.max(0, verfuegbar / telefonH)) : 1;
            // abgerundet: die Luft zum Blatt bleibt ≥ 12 px
            buehne.style.setProperty('--telefon-skala', String(Math.floor(s * 1000) / 1000));
            if (s < TELEFON_MIN_SKALA) buehne.setAttribute('data-telefon-aus', 'true');
            else buehne.removeAttribute('data-telefon-aus');
        };
        rechnen();
        if (typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(rechnen);
        ro.observe(buehne);
        if (figur) ro.observe(figur);
        if (blatt) ro.observe(blatt);
        return () => ro.disconnect();
    }, [kompakt, karteDa]);

    // [09.11.2026] Warum: AUFTRAG-123 (Z5.2) — nach dem Antippen des Kurzblatts (bzw. «Nochmals versuchen») Fokus auf den Titel
    // des Formulars, nicht ins Nummernfeld (das öffnete ungefragt die Bildschirmtastatur); ohne Scrollen
    useEffect(() => {
        if (!kompakt || !formOffen || zustand !== 'bereit' || !fokusFormTitel.current) return;
        const t = setTimeout(() => {
            fokusFormTitel.current = false;
            (document.querySelector('[data-ki-demo-formular] #ki-demo-anruf-titel') as HTMLElement | null)?.focus({ preventScroll: true });
        }, 0);
        return () => clearTimeout(t);
    }, [kompakt, formOffen, zustand]);

    /*
     * [09.11.2026] Warum: AUFTRAG-122 Manager-Nachtrag — auf dem Handy rollt der Browser die Seite beim Fokus auf ein
     * Eingabefeld (Bildschirmtastatur) um 200–350 px, damit das Feld sichtbar bleibt, und rollt sie danach nicht zurück
     * (im eingebauten Browser gemessen: URL-Feld antippen → scrollY 214, Feld in der Fenstermitte). Die Bühne ist aber für
     * «Seite ganz oben» gerechnet (Kompaktzeile, Telefon, Karte in Fensterhöhe). Deshalb bei jedem Zustandswechsel im
     * Kompaktmodus (Scan-Start, Formular, Anruf, Ende) ohne Animation nach oben — kein Sprung innerhalb des Inhalts wie in
     * A-120, sondern die Ausgangslage der Bühne. Am Desktop (kompakt false) passiert nichts. 'instant' statt 'auto': 'auto'
     * folgt der CSS-Eigenschaft scroll-behavior (Seite: smooth) — das wäre eine sichtbare Fahrt nach oben und bleibt in
     * einem Hintergrund-Tab ganz aus.
     */
    useEffect(() => {
        if (!kompakt) return;
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [kompakt, zustand]);

    /* AUFTRAG-100: Statuszeile mobil — oben der Schritt, darunter der letzte Fund bzw. der Anrufstand */
    // AUFTRAG-121 (K2): `fortschritt` («3/8») steht mobil rechts in der Statuszeile statt «Zum Telefon»
    const statusZeile: { kopf: string; text: string; zeichen: 'scan' | 'farbe' | 'puls' | 'welle' | 'ok' | 'fehler'; farbe?: string; fortschritt?: string } | null = (() => {
        const assistent = kartenAnzeige?.name ?? 'Ihr Assistent';
        switch (zustand) {
            case 'eingabe':
                return null;
            case 'scan': {
                const laufend = [...schritteAnzeige].reverse().find((s) => s.status === 'laeuft');
                const fund = [...schritteAnzeige].reverse().find((s) => s.status !== 'laeuft');
                const nummer = Math.min(SCAN_SCHRITTE, Math.max(1, schritteAnzeige.length));
                return {
                    kopf: `Schritt ${nummer} von ${SCAN_SCHRITTE}${laufend ? `: ${laufend.titel}` : ''}`,
                    // AUFTRAG-112: bis zur Antwort der Vorprüfung gibt es noch keinen Fund (die Website wird erst nach der Bestätigung gelesen)
                    text: fund?.titel ?? HR_SCHRITT.telefonPruefung,
                    zeichen: fund?.farbe ? 'farbe' : 'scan',
                    farbe: fund?.farbe,
                    fortschritt: `${nummer}/${SCAN_SCHRITTE}`,
                };
            }
            case 'bereit':
                return { kopf: 'Scan abgeschlossen', text: hrOk ? `${assistent} ist bereit` : 'Bitte bestätigen Sie Ihre Firma', zeichen: 'farbe', farbe: kartenAnzeige?.primaer, fortschritt: `${SCAN_SCHRITTE}/${SCAN_SCHRITTE}` };
            case 'wartend':
                return { kopf: 'Testanruf', text: 'Wir rufen Sie gleich an …', zeichen: 'puls' };
            case 'waehlt':
                return { kopf: 'Testanruf', text: 'Ihr Telefon klingelt …', zeichen: 'puls' };
            case 'verbunden':
                return { kopf: `Verbunden – ${dauerAnzeige(dauerSek)}`, text: `Sie sprechen mit ${assistent}`, zeichen: 'welle' };
            case 'beendet':
                // AUFTRAG-121 (K4): «Testanruf beendet» (die Statuszeile gibt es nur mobil)
                return { kopf: 'Testanruf beendet', text: 'Gespräch beendet', zeichen: 'ok' };
            case 'fehler':
                return { kopf: 'Testanruf', text: fehlerTitel(auftrag?.grund), zeichen: 'fehler' };
        }
    })();
    // AUFTRAG-121 (K2/K4): im Kompaktmodus stand die Statuszeile immer (AUFTRAG-122 ebenso).
    // [09.11.2026] Warum: AUFTRAG-123 (Z1.1) — drei Fortschrittsanzeigen gleichzeitig waren zu viel: mobil wie am Desktop nur,
    // wenn das Telefon nicht im Bild ist (Besucher scrollt während Scan/Anruf weiter); solange es im Bild ist, erzählt das
    // Telefon. Ganz ausserhalb der Demo bleibt sie weg wie bisher (sicht.buehne). Die Messung muss zum Modus passen
    // (sicht.kompakt, siehe oben). Live-Region unverändert.
    const statusSichtbar = !!statusZeile && sicht.buehne && !sicht.telefon && sicht.kompakt === kompakt;

    /*
     * [08.11.2026] Warum: AUFTRAG-120 (Z2) — Schrittführung in der Aktionskarte (nur mobil, lg:hidden). Nach der
     * Bestätigung gilt «Schritt 2 von 2» auch, solange das Formular noch als Platzhalter wartet (Vollscan läuft):
     * die Zeile bleibt so ohne Wechsel stehen (kein Layout-Sprung).
     */
    const firmenSchritt = (zustand === 'scan' || zustand === 'bereit') && !hrOk;
    const schrittText = firmenSchritt
        ? SCHRITT_FUEHRUNG.firma
        : zustand === 'scan' || zustand === 'bereit'
          ? SCHRITT_FUEHRUNG.nummer
          : imAnruf
            ? SCHRITT_FUEHRUNG.laeuft
            : zustand === 'beendet' || zustand === 'fehler'
              ? SCHRITT_FUEHRUNG.beendet
              : null;
    /*
     * [09.11.2026] Warum: AUFTRAG-123 (Z3/Z4.1) — Art des Blatts (nur mobil, data-blatt). Während der Handelsregister-Prüfung
     * («Wir gleichen … ab») ist das Blatt unsichtbar (display: none, CSS): Handelsregister.tsx bleibt gemountet, weil die
     * Abfrage darin läuft; das Telefon zeigt in voller Grösse «Firma wird im Handelsregister geprüft …». Kommt die Antwort,
     * erscheint das Blatt als neue Box (kein Layout-Shift). Bedingung = ergebnis 'pruefen' im Widget (keine Scan-Kennung
     * oder noch keine Antwort des automatischen Abgleichs).
     */
    const hrPruefen = firmenSchritt && (!hrScanId || hrStart === null);
    const blattArt = !kompakt
        ? undefined
        : firmenSchritt
          ? hrPruefen
              ? 'pruefen'
              : 'firma'
          : zustand === 'scan' && vollFehler
            ? 'vollfehler'
            : zustand === 'beendet'
              ? 'ende'
              : zustand === 'fehler'
                ? 'fehler'
                : zustand === 'bereit'
                  ? formOffen
                      ? 'formular'
                      : 'kurz'
                  : 'inhalt';

    const schrittZeile = (text: string) => (
        <p data-ki-demo-schritt="" className="lg:hidden mb-2.5 flex items-start gap-2 text-sm leading-5 font-medium text-text-secondary">
            <span className="mt-1.5 w-2 h-2 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {text}
        </p>
    );


    /*
     * [09.11.2026] Warum: AUFTRAG-121 (K3.3) — die Ablauf-Liste («Auftrag angenommen · Ihr Telefon klingelt …») als
     * eine Funktion. AUFTRAG-122 (S3): nur noch am Desktop unter dem Formular; mobil zeigt während des Anrufs das Telefon
     * den Stand (die A-121-Ansicht «Anruf läuft» ist entfallen).
     */
    const ablaufListe = () => (
        <ol className="mt-6 space-y-3.5" aria-label="Ablauf des Testanrufs">
            {verlauf.map((v) => (
                <li key={v.titel} className="flex items-start gap-3">
                    <span
                        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            v.stand === 'ok'
                                ? 'bg-primary text-white'
                                : v.stand === 'laeuft'
                                  ? 'text-primary ring-2 ring-primary/40'
                                  : v.stand === 'fehler'
                                    ? 'bg-red-600 text-white'
                                    : 'ring-1 ring-border text-text-secondary'
                        }`}
                        aria-hidden="true"
                    >
                        {v.stand === 'ok' ? (
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        ) : v.stand === 'laeuft' ? (
                            <span className={styles.puls} />
                        ) : v.stand === 'fehler' ? (
                            <X className="w-3.5 h-3.5" strokeWidth={3} />
                        ) : null}
                    </span>
                    <span className="min-w-0">
                        <span className={`block text-[0.95rem] font-semibold leading-snug ${v.stand === 'offen' ? 'text-text-secondary' : 'text-text-primary'}`}>
                            {v.titel}
                            <span className="sr-only">
                                {v.stand === 'ok' ? ' (erledigt)' : v.stand === 'laeuft' ? ' (läuft)' : v.stand === 'fehler' ? ' (nicht erreicht)' : ' (folgt)'}
                            </span>
                        </span>
                        <span className="block text-sm text-text-secondary tabular-nums">{v.detail}</span>
                    </span>
                </li>
            ))}
        </ol>
    );

    /** Bestätigte Firma (Zeile «Handelsregister: Name, Sitz · UID») — über dem Formular bzw. über dem Hinweis nach einem Fehler im Vollscan */
    const bestaetigtZeile = (b: HrBestaetigt) => (
        <p className="mt-2 flex items-start gap-2 text-sm text-text-secondary" data-handelsregister-bestaetigt={b.uid}>
            <Check className="mt-0.5 w-4 h-4 flex-shrink-0 text-primary" strokeWidth={3} aria-hidden="true" />
            <span>
                Handelsregister: <span className="font-semibold text-text-primary">{b.name}</span>, {b.sitz} ·{' '}
                <span className="tabular-nums whitespace-nowrap">{b.uid_formatiert}</span>
            </span>
        </p>
    );

    /** Formular des Testanrufs; als Platzhalter (während des Scans) unsichtbar mit gleicher Höhe, darüber ein Skelett. */
    const anrufFormular = (platzhalter: boolean) => {
        const inhalt = (
            <>
                                    <h2 id="ki-demo-anruf-titel" className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                                        {zustand === 'fehler' ? fehlerTitel(auftrag?.grund) : `${kartenAnzeige?.name ?? 'Ihr Assistent'} ruft Sie an`}
                                    </h2>
                                    {hrBestaetigt && !platzhalter && bestaetigtZeile(hrBestaetigt)}
                                    {/* [09.11.2026] Warum: AUFTRAG-123 (Z5) — dieses Formular gilt nur noch am Desktop; mobil kompaktFormular() */}
                                    <form onSubmit={starteAnruf} noValidate className="mt-5 space-y-5">
                                        <fieldset disabled={zustand !== 'bereit' || !!anrufSperre} className="min-w-0 space-y-5 disabled:opacity-80">
                                            <div role="radiogroup" aria-labelledby="ki-demo-sprache-titel">
                                                <p id="ki-demo-sprache-titel" className="text-sm font-medium text-text-primary mb-2">
                                                    Sprache
                                                </p>
                                                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.45fr)] gap-1 rounded-xl bg-surface p-1 border border-border">
                                                    {SPRACH_WAHL.map((s) => {
                                                        const aktiv = sprache === s.wert;
                                                        return (
                                                            <label
                                                                key={s.wert}
                                                                htmlFor={`ki-demo-sprache-${s.wert}`}
                                                                className={`flex flex-col items-center justify-center min-h-12 rounded-lg px-1 sm:px-2 text-[0.8125rem] sm:text-sm font-semibold leading-tight whitespace-nowrap transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                                                                    aktiv ? 'bg-card text-text-primary shadow-sm ring-1 ring-border' : 'text-text-secondary hover:text-text-primary'
                                                                } ${zustand === 'bereit' ? 'cursor-pointer' : 'cursor-default'}`}
                                                            >
                                                                <input
                                                                    id={`ki-demo-sprache-${s.wert}`}
                                                                    type="radio"
                                                                    name="ki-demo-sprache-wahl"
                                                                    value={s.wert}
                                                                    checked={aktiv}
                                                                    onChange={() => setSprache(s.wert)}
                                                                    aria-label={sprachName(s)}
                                                                    className="sr-only"
                                                                />
                                                                {s.text}
                                                                {s.zusatz && <span className="text-[0.6875rem] sm:text-xs font-medium text-text-secondary">{s.zusatz}</span>}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
    
                                            <div>
                                                <label htmlFor="ki-demo-nummer" className="block text-sm font-medium text-text-primary mb-2">
                                                    Ihre Telefonnummer
                                                </label>
                                                <div className={`${styles.feld} flex rounded-xl border border-border bg-background overflow-hidden`}>
                                                    <label htmlFor="ki-demo-vorwahl" className="sr-only">
                                                        Vorwahl
                                                    </label>
                                                    <select
                                                        id="ki-demo-vorwahl"
                                                        value={vorwahl}
                                                        onChange={(e) => setVorwahl(e.target.value as '+41' | '+423')}
                                                        className="h-12 pl-3 pr-1 bg-surface text-text-primary border-r border-border text-base focus:outline-none"
                                                    >
                                                        <option value="+41">+41</option>
                                                        <option value="+423">+423</option>
                                                    </select>
                                                    <input
                                                        id="ki-demo-nummer"
                                                        type="tel"
                                                        inputMode="tel"
                                                        autoComplete="tel-national"
                                                        value={nummer}
                                                        onChange={(e) => setNummer(e.target.value)}
                                                        placeholder="79 123 45 67"
                                                        aria-describedby="ki-demo-nummer-hinweis"
                                                        className="flex-1 min-w-0 h-12 px-3 bg-transparent text-text-primary text-base placeholder:text-text-secondary/70 focus:outline-none"
                                                    />
                                                </div>
                                                <p id="ki-demo-nummer-hinweis" className="mt-2 text-xs text-text-secondary">
                                                    Der Anruf kommt von {ANRUF_VON}.
                                                </p>
                                            </div>
    
                                            {/* Honigtopf: für Menschen unsichtbar */}
                                            <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                                                <label htmlFor="ki-demo-web">Website-Kontakt</label>
                                                <input id="ki-demo-web" type="text" tabIndex={-1} autoComplete="off" value={honigtopf} onChange={(e) => setHonigtopf(e.target.value)} />
                                            </div>
    
                                            <label htmlFor="ki-demo-einwilligung" className="flex items-start gap-3 text-sm text-text-secondary cursor-pointer">
                                                <input
                                                    id="ki-demo-einwilligung"
                                                    type="checkbox"
                                                    aria-labelledby="ki-demo-einwilligung-text"
                                                    checked={einwilligung}
                                                    onChange={(e) => setEinwilligung(e.target.checked)}
                                                    className="mt-0.5 w-5 h-5 flex-shrink-0 rounded accent-[var(--primary)]"
                                                />
                                                <span id="ki-demo-einwilligung-text">
                                                    Ich bin unter dieser Nummer erreichbar und möchte den Testanruf erhalten. Es gelten die{' '}
                                                    <Link href="/datenschutz#testanruf-ki-telefonassistent" className="underline underline-offset-2 text-text-primary hover:no-underline" target="_blank">
                                                        Datenschutzhinweise
                                                    </Link>
                                                    .
                                                </span>
                                            </label>
                                        </fieldset>
    
                                        {turnstileSiteKey && zustand === 'bereit' && !anrufSperre && <div ref={turnstileRef} />}
    
                                        {(anrufSperre ?? formFehler) && zustand === 'bereit' && (
                                            <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
                                                {anrufSperre ?? formFehler}
                                            </p>
                                        )}
                                        {zustand === 'fehler' && (
                                            <p role="alert" className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                                                {fehlerMeldung(auftrag?.grund).text}{' '}
                                                <a href="tel:+41522221818" className="font-semibold underline whitespace-nowrap">
                                                    052 222 18 18
                                                </a>
                                                .
                                            </p>
                                        )}
    
                                        {/* Derselbe Button wechselt Text, Symbol und Farbe je Zustand */}
                                        <PrimaerKnopf
                                            zustand={zustand}
                                            name={kartenAnzeige?.name ?? 'Ihr Assistent'}
                                            type={zustand === 'bereit' ? 'submit' : 'button'}
                                            onClick={zustand === 'fehler' ? nochmals : undefined}
                                            id="ki-demo-anruf-knopf"
                                            zweizeilig
                                            gesperrt={zustand === 'bereit' && !!anrufSperre}
                                        />
                                    </form>
    
                                    {/* AUFTRAG-121 (K3.2)/AUFTRAG-122 (S3): die Ablauf-Liste steht nur am Desktop (mobil zeigt das Telefon den Anruf) */}
                                    {ablaufListe()}
                                    {zustand === 'verbunden' && (
                                        <span className="sr-only" aria-label={`Gesprächsdauer ${dauerAnzeige(dauerSek)}`}>
                                            {dauerAnzeige(dauerSek)}
                                        </span>
                                    )}
                                </>
        );
        if (!platzhalter) return inhalt;
        return (
            <div className="relative" aria-hidden="true">
                <div className="invisible" inert>
                    {inhalt}
                </div>
                <div className="absolute inset-0 flex flex-col gap-5">
                    <p className="text-xl sm:text-2xl font-bold text-text-secondary tracking-tight">Ihr Testanruf</p>
                    <p className="-mt-3 text-sm text-text-secondary">Sobald Ihr Assistent bereit ist, wählen Sie hier Sprache und Nummer.</p>
                    <span className="h-[3.25rem] rounded-xl bg-surface" />
                    <span className="h-12 rounded-xl bg-surface" />
                    <span className="h-10 w-4/5 rounded-lg bg-surface" />
                    <span className="h-14 rounded-2xl bg-surface" />
                    <span className="flex-1 rounded-2xl bg-surface/60" />
                </div>
            </div>
        );
    };

    /*
     * [09.11.2026] Warum: AUFTRAG-121 (K3) — Ansicht «Ende» der Aktionskarte im Kompaktmodus (nur Handy).
     * AUFTRAG-122 (S3): die A-121-Ansichten «Vorbereitung» (Vollscan) und «Anruf läuft» sind entfallen — in diesen
     * passiven Phasen ist mobil keine Karte gerendert, das Telefon (Bühne) zeigt Scan-Schritte bzw. den Anruf.
     */
    /*
     * [09.11.2026] Warum: AUFTRAG-123 (Z5.1) — Kurzblatt direkt nach dem Vollscan (mobil): nur «{Name} ist bereit» und die
     * Haupthandlung «{Name} soll mich anrufen». Das Telefon darüber zeigt den fertigen Assistenten gross (Skala, Z2).
     */
    const kurzBlatt = () => {
        const n = kartenAnzeige?.name ?? '';
        return (
            <div data-ki-demo-kurzblatt="" className="flex flex-col">
                <h2 id="ki-demo-anruf-titel" className={BLATT_TITEL}>
                    {BEREIT_TEXT.kurzTitel(n)}
                </h2>
                <button
                    type="button"
                    id="ki-demo-bereit-knopf"
                    data-blatt-haupt=""
                    onClick={() => {
                        fokusFormTitel.current = true;
                        setFormOffen(true);
                    }}
                    className={`${styles.knopf} ${KNOPF_BASIS} mt-4 bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover`}
                >
                    <PhoneCall className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    {BEREIT_TEXT.kurzKnopf(n)}
                </button>
            </div>
        );
    };

    /*
     * [09.11.2026] Warum: AUFTRAG-123 (Z5.2/Z5.3) — ausgeklapptes Formular (mobil); dasselbe Blatt wie das Kurzblatt wächst auf
     * die Eingabe des Besuchers. Reihenfolge: Titel T5, Nummer mit «Der Anruf kommt von …» (Hilfszeile), Sprachwahl
     * einzeilig (nur «Deutsch | English | Schweizerdeutsch», bei Schweizerdeutsch darunter T6), Einwilligung (wortgleich),
     * Haupthandlung. «Ihre Telefonnummer» und «Sprache» nur für Screenreader — die Frage steht im Titel. Reicht die Bühne
     * nicht (z. B. 375×553), scrollen nur die Felder; Meldungen und der Knopf bleiben im Bild. IDs wie am Desktop (Tests, K8).
     */
    const kompaktFormular = () => (
        <form onSubmit={starteAnruf} noValidate data-ki-demo-formular="" className="flex min-h-0 flex-1 flex-col">
            <h2 id="ki-demo-anruf-titel" tabIndex={-1} className={`flex-shrink-0 ${BLATT_TITEL}`}>
                {BEREIT_TEXT.formTitel(kartenAnzeige?.name ?? '')}
            </h2>
            <div data-blatt-scroll="" className="-mx-1 mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-1">
                <fieldset disabled={zustand !== 'bereit' || !!anrufSperre} className="min-w-0 disabled:opacity-80">
                    <div>
                        <label htmlFor="ki-demo-nummer" className="sr-only">
                            Ihre Telefonnummer
                        </label>
                        <div className={`${styles.feld} flex rounded-xl border border-border bg-background overflow-hidden`}>
                            <label htmlFor="ki-demo-vorwahl" className="sr-only">
                                Vorwahl
                            </label>
                            <select
                                id="ki-demo-vorwahl"
                                value={vorwahl}
                                onChange={(e) => setVorwahl(e.target.value as '+41' | '+423')}
                                className="h-[48px] pl-3 pr-1 bg-surface text-text-primary border-r border-border text-base focus:outline-none"
                            >
                                <option value="+41">+41</option>
                                <option value="+423">+423</option>
                            </select>
                            <input
                                id="ki-demo-nummer"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel-national"
                                value={nummer}
                                onChange={(e) => setNummer(e.target.value)}
                                placeholder="79 123 45 67"
                                aria-describedby="ki-demo-nummer-hinweis"
                                className="flex-1 min-w-0 h-[48px] px-3 bg-transparent text-text-primary text-base placeholder:text-text-secondary/70 focus:outline-none"
                            />
                        </div>
                        <p id="ki-demo-nummer-hinweis" data-blatt-hilfe="" className="mt-1 text-sm text-text-secondary">
                            Der Anruf kommt von {ANRUF_VON}.
                        </p>
                    </div>
                    <div role="radiogroup" aria-labelledby="ki-demo-sprache-titel" className="mt-4">
                        <p id="ki-demo-sprache-titel" className="sr-only">
                            Sprache
                        </p>
                        {/* einzeilig 44 px, Segmentbreite nach Inhalt (flex: auto), je mindestens 10 px Innenabstand. Schrift 13 px wie die
                            bestehende Sprachwahl mobil: mit 14 px ragte «Schweizerdeutsch» bei 375 px Breite 9 px über den Rand (gemessen).
                            Trefferfläche = ganzes Segment 44 px hoch (Rahmen als ring, ohne Platz), die sichtbare Pille liegt innen */}
                        <div data-ki-demo-segment="" className="flex h-[44px] rounded-xl bg-surface px-1 ring-1 ring-inset ring-border">
                            {SPRACH_WAHL.map((s) => {
                                const aktiv = sprache === s.wert;
                                return (
                                    <label
                                        key={s.wert}
                                        htmlFor={`ki-demo-sprache-${s.wert}`}
                                        className="flex flex-auto cursor-pointer items-center px-0.5 rounded-lg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary"
                                    >
                                        <input
                                            id={`ki-demo-sprache-${s.wert}`}
                                            type="radio"
                                            name="ki-demo-sprache-wahl"
                                            value={s.wert}
                                            checked={aktiv}
                                            onChange={() => setSprache(s.wert)}
                                            aria-label={sprachName(s)}
                                            className="sr-only"
                                        />
                                        <span
                                            className={`flex h-[36px] w-full items-center justify-center rounded-lg px-[10px] text-[0.8125rem] font-semibold leading-none whitespace-nowrap transition-colors ${
                                                aktiv ? 'bg-card text-text-primary shadow-sm ring-1 ring-border' : 'text-text-secondary hover:text-text-primary'
                                            }`}
                                        >
                                            {s.text}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {sprache === 'dialekt_auto' && (
                            <p data-ki-demo-erprobung="" className="mt-1 text-[0.8125rem] text-text-secondary">
                                {BEREIT_TEXT.erprobung}
                            </p>
                        )}
                    </div>
                    {/* Honigtopf: für Menschen unsichtbar */}
                    <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                        <label htmlFor="ki-demo-web">Website-Kontakt</label>
                        <input id="ki-demo-web" type="text" tabIndex={-1} autoComplete="off" value={honigtopf} onChange={(e) => setHonigtopf(e.target.value)} />
                    </div>
                    <label htmlFor="ki-demo-einwilligung" className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
                        <input
                            id="ki-demo-einwilligung"
                            type="checkbox"
                            aria-labelledby="ki-demo-einwilligung-text"
                            checked={einwilligung}
                            onChange={(e) => setEinwilligung(e.target.checked)}
                            className="mt-0.5 w-5 h-5 flex-shrink-0 rounded accent-[var(--primary)]"
                        />
                        <span id="ki-demo-einwilligung-text">
                            Ich bin unter dieser Nummer erreichbar und möchte den Testanruf erhalten. Es gelten die{' '}
                            <Link href="/datenschutz#testanruf-ki-telefonassistent" className="underline underline-offset-2 text-text-primary hover:no-underline" target="_blank">
                                Datenschutzhinweise
                            </Link>
                            .
                        </span>
                    </label>
                </fieldset>
                {turnstileSiteKey && zustand === 'bereit' && !anrufSperre && <div ref={turnstileRef} className="mt-2" />}
            </div>
            {(anrufSperre ?? formFehler) && zustand === 'bereit' && (
                <p role="alert" className="mt-2 flex-shrink-0 text-sm font-medium text-red-700 dark:text-red-300">
                    {anrufSperre ?? formFehler}
                </p>
            )}
            <div className="mt-4 flex-shrink-0">
                <PrimaerKnopf zustand={zustand} name={kartenAnzeige?.name ?? 'Ihr Assistent'} type="submit" id="ki-demo-anruf-knopf" haupt gesperrt={zustand === 'bereit' && !!anrufSperre} />
            </div>
        </form>
    );

    /** K3.4: Anruf beendet — Zusammenfassung (acht Zeilen, «Mehr anzeigen»), Nochmals testen + Angebot anfragen; Fehlerfall */
    const kompaktEnde = () => {
        const gescheitert = zustand === 'fehler';
        /*
         * [09.11.2026] Warum: AUFTRAG-123b (N4) — Z3-Regel «eine Haupthandlung, höchstens ein Textlink», untereinander. Vorher
         * standen zwei gleich gewichtete Knöpfe nebeneinander und brachen bei 360–390 px zweizeilig um (A-123 O7). Ende:
         * «Angebot anfragen» (Dunkelgrün #1f7a35 wie Bestand, ≥ 4,5:1 hell und dunkel) + Textlink «Nochmals testen»; Fehler:
         * «Nochmals versuchen» (Markengrün wie die übrigen Haupthandlungen) + Textlink «Angebot anfragen». IDs, Hash-Link als
         * natives <a>, sessionStorage-Vorbelegung und Handler unverändert.
         */
        const anfrageVorbelegen = () => {
            const testFirma = hrBestaetigt?.name ?? (hrUebersprungen ? karte?.profil.firma : undefined) ?? '';
            try {
                if (testFirma.trim()) window.sessionStorage.setItem(ANFRAGE_FIRMA_SCHLUESSEL, testFirma.trim());
            } catch {
                // sessionStorage gesperrt: Formular öffnet ohne Vorbelegung
            }
        };
        return (
            <div data-ki-demo-ende={gescheitert ? 'fehler' : 'beendet'} className="flex min-h-0 flex-1 flex-col">
                {/* [09.11.2026] Warum: AUFTRAG-123 (Z7) — Dauer rechts in der Titelzeile statt als eigene Zeile; Abstände nach Z3 */}
                <div className="flex flex-shrink-0 items-baseline justify-between gap-3">
                    <h2 id="ki-demo-anruf-titel" className={BLATT_TITEL}>
                        {gescheitert ? 'Der Anruf hat nicht geklappt' : 'Ihre Zusammenfassung'}
                    </h2>
                    {!gescheitert && auftrag?.dauer_s !== null && auftrag?.dauer_s !== undefined && (
                        <span data-ki-demo-dauer="" className="flex-shrink-0 text-sm text-text-secondary tabular-nums">
                            {dauerAnzeige(auftrag.dauer_s)} Min.
                        </span>
                    )}
                </div>
                {gescheitert ? (
                    <p data-blatt-hilfe="" className="mt-1 flex-shrink-0 text-sm text-text-secondary">
                        {fehlerGrundText(auftrag?.grund)}
                    </p>
                ) : (
                    // AUFTRAG-123 (Z7): höchstens sechs Zeilen; nach «Mehr anzeigen» scrollt nur dieser Kasten, die Knöpfe bleiben im Bild
                    <div data-blatt-scroll="" className="mt-4 min-h-0 overflow-y-auto overscroll-contain rounded-2xl bg-surface border border-border p-4">
                        <p ref={zfRef} data-ki-demo-zusammenfassung="" className={`text-[0.9375rem] text-text-primary leading-relaxed ${mehrOffen ? '' : 'line-clamp-6'}`}>
                            {auftrag?.zusammenfassung ?? ZUSAMMENFASSUNG_FOLGT}
                        </p>
                        {zfLang && !mehrOffen && (
                            <button
                                type="button"
                                id="ki-demo-mehr"
                                onClick={() => setMehrOffen(true)}
                                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-text-primary underline underline-offset-2 hover:no-underline"
                            >
                                Mehr anzeigen
                            </button>
                        )}
                    </div>
                )}
                {gescheitert ? (
                    <div className="mt-auto flex-shrink-0 pt-4">
                        <button
                            type="button"
                            id="ki-demo-nochmals-testen"
                            data-blatt-haupt=""
                            onClick={nochmalsKompakt}
                            className={`${styles.knopf} ${KNOPF_BASIS} bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover`}
                        >
                            <RotateCcw className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                            Nochmals versuchen
                        </button>
                        {/* natives <a> wegen des Hashs; Firma wie beim Desktop-Link (AUFTRAG-114) im Formular vorbelegt */}
                        <a href={`#${ANFRAGE_ID}`} onClick={anfrageVorbelegen} data-ki-demo-anfrage="" data-blatt-link="" className={BLATT_LINK}>
                            Angebot anfragen
                        </a>
                    </div>
                ) : (
                    <div className="mt-auto flex-shrink-0 pt-4">
                        {/* natives <a> wegen des Hashs; Firma wie beim Desktop-Link (AUFTRAG-114) im Formular vorbelegt. Dunkelgrün wie der
                            Knopf «verbunden» (Bestand): Weiss auf bg-primary erreicht nur 3,7:1 (hell) bzw. 2,8:1 (dunkel), hier ≥ 4.5:1 */}
                        <a
                            href={`#${ANFRAGE_ID}`}
                            onClick={anfrageVorbelegen}
                            data-ki-demo-anfrage=""
                            data-blatt-haupt=""
                            className={`${styles.knopf} ${KNOPF_BASIS} bg-[#1f7a35] text-white shadow-lg shadow-[#1f7a35]/30 hover:bg-[#1a6a2e]`}
                        >
                            Angebot anfragen
                        </a>
                        <button type="button" id="ki-demo-nochmals-testen" data-blatt-link="" onClick={andereWebsite} className={BLATT_LINK}>
                            Nochmals testen
                        </button>
                    </div>
                )}
            </div>
        );
    };
    // K3.4: gemessen, ob der gekürzte Absatz mehr Zeilen hätte («Mehr anzeigen» nur dann; AUFTRAG-123 Z7: sechs statt acht)
    const zfText = kompakt && zustand === 'beendet' ? (auftrag?.zusammenfassung ?? '') : null;
    useLayoutEffect(() => {
        const el = zfRef.current;
        if (zfText === null || !el || mehrOffen) return;
        setZfLang(el.scrollHeight > el.clientHeight + 1);
    }, [zfText, mehrOffen]);

    return (
        <div className={styles.buehne} ref={buehneRef} data-kompakt={kompakt ? 'true' : undefined}>
            <div className={styles.intro}>{children}</div>

            {/* AUFTRAG-121 (K1): mobil ab dem Scan statt Hero und Konsole eine Zeile (44 px): Website und «Ändern» */}
            {kompakt && (
                <div className={`${styles.kompaktZeile} flex items-center gap-2.5 rounded-2xl bg-card pl-4 pr-1 ring-1 ring-border shadow-sm`} data-ki-demo-kompakt="">
                    <Globe className="w-4 h-4 flex-shrink-0 text-text-secondary" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary" data-host="">
                        {host || eingabe}
                    </span>
                    <button
                        type="button"
                        id="ki-demo-aendern"
                        onClick={andereWebsite}
                        disabled={imAnruf}
                        aria-label="Website ändern"
                        className="flex-shrink-0 h-11 px-3 text-sm font-semibold text-text-primary underline underline-offset-2 hover:no-underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                    >
                        Ändern
                    </button>
                </div>
            )}

            {/* Konsole: Eingabe der Website */}
            <div className={styles.konsole}>
                <form onSubmit={starteScan} noValidate aria-label="Website scannen">
                    <label htmlFor="ki-demo-url" className="sr-only">
                        Ihre Website
                    </label>
                    <div className={`${styles.feld} flex flex-col sm:flex-row gap-2 rounded-[1.35rem] border border-border bg-card p-2 shadow-[0_20px_50px_-30px_rgba(10,18,10,0.35)]`}>
                        <div className="relative flex-1 min-w-0">
                            <Globe className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" aria-hidden="true" />
                            <input
                                ref={eingabeRef}
                                id="ki-demo-url"
                                type="text"
                                inputMode="url"
                                autoComplete="url"
                                autoCapitalize="none"
                                spellCheck={false}
                                value={zustand === 'eingabe' ? eingabe : host || eingabe}
                                onChange={(e) => setEingabe(e.target.value)}
                                readOnly={zustand !== 'eingabe'}
                                placeholder="Ihre Website, z. B. muster-ag.ch"
                                aria-invalid={!!scanFehler}
                                aria-describedby={scanFehler ? 'ki-demo-url-fehler' : 'ki-demo-vertrauen'}
                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-transparent text-text-primary text-lg placeholder:text-text-secondary/80 focus:outline-none read-only:text-text-secondary"
                            />
                        </div>
                        {/* AUFTRAG-111: wartet der fertige Scan auf die Firma, steht hier «Andere Website» statt «Wird gescannt …»
                            (AUFTRAG-112: schon nach der Vorprüfung, und nach einem Fehler im Vollscan) */}
                        {zustand === 'eingabe' || (zustand === 'scan' && !wartetAufFirma && !vollFehler) ? (
                            <div className="sm:w-auto sm:min-w-[13.5rem]">
                                <PrimaerKnopf zustand={zustand} name={name} type="submit" id="ki-demo-scan-knopf" gesperrt={zustand === 'eingabe' && scanGesperrt} />
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={andereWebsite}
                                disabled={imAnruf}
                                className="sm:min-w-[13.5rem] inline-flex items-center justify-center gap-2 h-14 px-6 rounded-2xl border-2 border-border text-text-primary text-base font-semibold hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                Andere Website
                            </button>
                        )}
                    </div>
                    {scanFehler && (
                        <p id="ki-demo-url-fehler" role="alert" className="mt-3 text-sm font-medium text-red-700 dark:text-red-300">
                            {scanFehler}
                        </p>
                    )}
                </form>

                <p id="ki-demo-vertrauen" className="mt-4 text-sm text-text-secondary">
                    Kostenlos · Ohne Anmeldung · Keine Werbeanrufe
                </p>

                {/* Belege (Leerlauf) bzw. Funde (ab Scan) im selben Platz */}
                <div className={`${styles.fundzeile} mt-5`}>
                    {zustand === 'eingabe' ? (
                        <ul className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                            {[
                                { icon: Languages, text: 'Deutsch und Englisch, Schweizerdeutsch in Erprobung' },
                                { icon: Timer, text: 'In einer Minute' },
                                { icon: BookOpen, text: 'Ihre Website als Wissen' },
                            ].map(({ icon: Icon, text }) => (
                                <li key={text} className="flex items-start gap-2.5 text-sm font-medium text-text-primary leading-snug">
                                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center" aria-hidden="true">
                                        <Icon className="w-3.5 h-3.5" />
                                    </span>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="flex flex-wrap gap-2" aria-label="Gefunden">
                            {chips.map((c) => (
                                <li
                                    key={c.id}
                                    className={`${styles.chip} inline-flex items-center gap-2 h-8 sm:h-9 rounded-full border border-border bg-card pl-1 sm:pl-1.5 pr-3 sm:pr-3.5 text-[0.8125rem] sm:text-sm font-medium text-text-primary`}
                                >
                                    {c.logoSrc ? (
                                        <span className="h-6 rounded-full px-2 flex items-center ring-1 ring-black/5" style={{ background: c.logoGrund ?? '#FFFFFF' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element -- eigener Proxy */}
                                            <img src={c.logoSrc} alt="" className="block h-4 w-auto max-w-[4.5rem] object-contain" />
                                        </span>
                                    ) : c.farbe ? (
                                        <span className="w-6 h-6 rounded-full ring-1 ring-black/10" style={{ background: c.farbe }} aria-hidden="true" />
                                    ) : (
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center" aria-hidden="true">
                                            {c.icon === 'telefon' ? <Phone className="w-3.5 h-3.5" /> : c.icon === 'zeiten' ? <Clock className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                        </span>
                                    )}
                                    {c.id === 'farbe' ? <span className="tabular-nums">{c.text}</span> : c.text}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Lebendes Telefon — ab lg läuft es während Scan, Karte und Anruf mit (sticky bis zum Ende der Bühne).
                [09.11.2026] Warum: AUFTRAG-122 Telefon als Bühne, Karte darüber — mobil wieder immer gerendert; im
                Kompaktmodus füllt es die Bühne (CSS), die Handlungskarte liegt unten darüber (DOM danach). */}
            <div
                className={`${styles.telefonBereich} scroll-mt-20 focus:outline-none`}
                ref={telefonRef}
                data-mitlaufen={zustand !== 'eingabe' ? 'true' : undefined}
                tabIndex={-1}
            >
                <Telefon
                    zustand={zustand}
                    host={host}
                    welleFarbe={telefonWelle}
                    schritte={schritteAnzeige}
                    karte={kartenAnzeige}
                    sprache={sprache}
                    onSprache={setSprache}
                    dauerSek={dauerSek}
                    zusammenfassung={auftrag?.zusammenfassung ?? null}
                    fehlerGrund={auftrag?.grund ?? null}
                />
            </div>

            {/* Aktion: Testanruf. Ab dem Scan ist der Platz reserviert (Platzhalter), danach bleibt
                das Formular stehen und nur der Button wechselt — keine Layout-Sprünge beim Polling.
                AUFTRAG-122 (S3): mobil in den passiven Phasen nicht gerendert (karteDa). */}
            <div className={styles.aktion}>
                {karteDa && (
                    <section
                        ref={aktionRef}
                        aria-labelledby="ki-demo-anruf-titel"
                        // AUFTRAG-120/121: mobil fokussierbar (Fokus nach dem Anruf-Knopf, K7), am Desktop unverändert
                        tabIndex={istMobil ? -1 : undefined}
                        // [09.11.2026] Warum: AUFTRAG-123 (Z3) — mobil ein Blatt: Höhe = Inhalt (höchstens Bühne), Innenabstand 20 px,
                        // Schatten nach oben; data-blatt = Art (bei «pruefen» unsichtbar). Die feste Firmen-Höhe aus A-122 entfällt.
                        data-blatt={blattArt}
                        className={`${styles.einblenden} ${styles.aktionKarte} rounded-[1.75rem] border border-border bg-card ${kompakt ? 'p-5' : 'p-5 sm:p-7'} ${kompakt ? BLATT_SCHATTEN : 'shadow-[0_30px_60px_-40px_rgba(10,18,10,0.45)]'} focus:outline-none`}
                        // AUFTRAG-121 (K3): mobil Höhe aus dem CSS, dort keine Mindesthöhe
                        style={aktionMin && !kompakt ? { minHeight: aktionMin } : undefined}
                    >
                        {/* [09.11.2026] Warum: AUFTRAG-123 (Z3) — mobil keine Schrittzeile mehr (ein Gedanke pro Blatt; der Fortschritt steht im Telefon) */}
                        {schrittText && !kompakt && schrittZeile(schrittText)}
                        {firmenSchritt ? (
                            // AUFTRAG-111: «Welche ist Ihre Firma?» sofort nach der URL-Eingabe (während des Scans);
                            // nach 403 (Bestätigung abgelaufen) wieder hier
                            <Handelsregister
                                key={hrScanId ?? 'scan'}
                                scanId={hrScanId}
                                website={host}
                                start={hrStart}
                                hinweis={hrHinweis}
                                onNochmals={() => {
                                    if (hrScanId) void pruefeRegister(hrScanId, sitzungRef.current.lauf);
                                }}
                                onBestaetigt={(b, scanId) => {
                                    // nur für den laufenden Scan (eine verspätete Antwort eines früheren Scans zählt nicht)
                                    if (scanId !== sitzungRef.current.scanId) return;
                                    setHrBestaetigt(b);
                                    setHrHinweis(null);
                                    setFormFehler(null);
                                }}
                                onAndereWebsite={andereWebsite}
                                kompakt={kompakt}
                            />
                        ) : zustand === 'scan' && vollFehler ? (
                            // AUFTRAG-112: Fehler im Vollscan (Stufe 2) — Hinweis mit dem Servertext unter der bestätigten Firma
                            // [09.11.2026] Warum: AUFTRAG-123 (Z3) — mobil als Blatt: Titel, Meldung, «Nochmals versuchen» als Haupthandlung
                            // (ohne die Zeile «Handelsregister: …»)
                            <div data-vollscan-fehler="">
                                <h2 id="ki-demo-anruf-titel" className={kompakt ? BLATT_TITEL : 'text-xl sm:text-2xl font-bold text-text-primary tracking-tight'}>
                                    Ihr Testanruf
                                </h2>
                                {hrBestaetigt && !kompakt && bestaetigtZeile(hrBestaetigt)}
                                <p role="alert" className="mt-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                                    {vollFehler}
                                </p>
                                <button
                                    type="button"
                                    onClick={vollscanNochmals}
                                    id="ki-demo-vollscan-nochmals"
                                    data-blatt-haupt={kompakt ? '' : undefined}
                                    className={
                                        kompakt
                                            ? `${styles.knopf} ${KNOPF_BASIS} mt-4 bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover`
                                            : 'mt-4 inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border-2 border-border text-text-primary text-base font-semibold hover:border-primary transition-colors'
                                    }
                                >
                                    <RotateCcw className={kompakt ? 'w-5 h-5' : 'w-4 h-4'} aria-hidden="true" />
                                    {HR_SCHRITT.nochmalsVersuchen}
                                </button>
                            </div>
                        ) : !karte || !kartenAnzeige || zustand === 'scan' ? (
                            // AUFTRAG-122 (S3): mobil hier nie erreicht (Vollscan = keine Karte); am Desktop der Platzhalter wie bisher
                            anrufFormular(true)
                        ) : kompakt && (zustand === 'beendet' || zustand === 'fehler') ? (
                            kompaktEnde()
                        ) : kompakt && zustand === 'bereit' ? (
                            // AUFTRAG-123 (Z5): mobil erst das Kurzblatt, nach dem Antippen das ausgeklappte Formular
                            formOffen ? (
                                kompaktFormular()
                            ) : (
                                kurzBlatt()
                            )
                        ) : zustand === 'beendet' ? (
                            <>
                                <h2 id="ki-demo-anruf-titel" className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                                    Gespräch beendet – so lief es:
                                </h2>
                                <div className="mt-4 space-y-5">
                                    <div className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
                                        <p className="text-text-primary leading-relaxed">{auftrag?.zusammenfassung ?? 'Die Zusammenfassung folgt in Kürze.'}</p>
                                        {auftrag?.dauer_s !== null && auftrag?.dauer_s !== undefined && (
                                            <p className="mt-2 text-sm text-text-secondary tabular-nums">Dauer: {dauerAnzeige(auftrag.dauer_s)} Min.</p>
                                        )}
                                    </div>
                                    <PrimaerKnopf zustand={zustand} name={kartenAnzeige.name} type="button" onClick={nochmals} id="ki-demo-anruf-knopf" />
                                    <div className="pt-1">
                                        <p className="text-text-secondary leading-relaxed">{NACH_GESPRAECH}</p>
                                        {/*
                                         * [31.10.2026] AUFTRAG-114: führt auf das Formular «Assistent anfragen» dieser Seite
                                         * (#anfrage) statt auf /kontakt; natives <a> wegen des Hashs. Die getestete Firma
                                         * (Handelsregister-Name, sonst der Name aus dem Scan) steht dort im Feld «Firma» vor —
                                         * per sessionStorage, das Formular löscht den Schlüssel nach dem Lesen.
                                         */}
                                        <a
                                            href={ANFRAGE_HREF}
                                            onClick={() => {
                                                const testFirma = hrBestaetigt?.name ?? (hrUebersprungen ? karte?.profil.firma : undefined) ?? '';
                                                try {
                                                    if (testFirma.trim()) window.sessionStorage.setItem(ANFRAGE_FIRMA_SCHLUESSEL, testFirma.trim());
                                                } catch {
                                                    // sessionStorage gesperrt: Formular öffnet ohne Vorbelegung
                                                }
                                            }}
                                            data-ki-demo-anfrage=""
                                            className={`${styles.knopf} ${KNOPF_BASIS} mt-4 bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover`}
                                        >
                                            So bekommt Ihre Firma diesen Assistenten
                                            <ArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                        </a>
                                    </div>
                                </div>
                            </>
                        ) : (
                            anrufFormular(false)
                        )}
                    </section>
                )}
            </div>

            {/* AUFTRAG-100: Statuszeile mobil (fest unter dem Header, 48 px), solange das Telefon nicht im Bild ist.
                [09.11.2026] Warum: AUFTRAG-121 (K2/K4) — im Kompaktmodus (Handy ab dem Scan; seit AUFTRAG-122 mit dem Telefon
                als Bühne im Bild) steht die Zeile immer, zeigt Schritt und Fund bzw. den Anrufstand und rechts den Fortschritt («3/8») statt
                «Zum Telefon»; sie springt nirgends hin (nur Anzeige, für Screenreader spricht die Live-Region unten). Der
                Hinweis «Bitte Firma bestätigen» aus AUFTRAG-120 entfällt — die Aktionskarte ist immer im Bild. */}
            <button
                type="button"
                onClick={kompakt ? undefined : zumTelefon}
                className={styles.statuszeile}
                data-sichtbar={statusSichtbar ? 'true' : undefined}
                data-kompakt={kompakt ? 'true' : undefined}
                aria-hidden={!statusSichtbar || kompakt || undefined}
                tabIndex={statusSichtbar && !kompakt ? 0 : -1}
                data-zustand={zustand}
            >
                <span className="container mx-auto flex h-full items-center gap-3 px-4 text-left">
                    {/* key: jedes Zeichen ist ein neues Element (kein Umbau eines bestehenden = keine Layout-Verschiebung) */}
                    <span key={statusZeile?.zeichen ?? 'leer'} className="flex h-7 w-7 flex-shrink-0 items-center justify-center" aria-hidden="true">
                        {statusZeile?.zeichen === 'scan' ? (
                            <Loader2 className="h-5 w-5 text-primary motion-safe:animate-spin" />
                        ) : statusZeile?.zeichen === 'farbe' ? (
                            <span className="h-4 w-4 rounded-full ring-2 ring-black/10 dark:ring-white/15" style={{ background: statusZeile.farbe ?? GRUEN_LEERLAUF }} />
                        ) : statusZeile?.zeichen === 'puls' ? (
                            <span className={`${styles.puls} text-primary`} />
                        ) : statusZeile?.zeichen === 'welle' ? (
                            <span className={`${styles.knopfWelle} text-[#1f7a35] dark:text-primary`}>
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                            </span>
                        ) : statusZeile?.zeichen === 'fehler' ? (
                            <X className="h-5 w-5 text-red-600 dark:text-red-400" strokeWidth={2.6} />
                        ) : (
                            <Check className="h-5 w-5 text-primary" strokeWidth={2.6} />
                        )}
                    </span>
                    <span key="telefon-text" className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-xs text-text-secondary tabular-nums">{statusZeile?.kopf}</span>
                        <span className="block truncate text-sm font-semibold text-text-primary tabular-nums">{statusZeile?.text}</span>
                    </span>
                    {kompakt ? (
                        statusZeile?.fortschritt && (
                            <span key="fortschritt" className="inline-flex flex-shrink-0 items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-text-primary tabular-nums" data-ki-demo-fortschritt="">
                                {statusZeile.fortschritt}
                            </span>
                        )
                    ) : (
                        <span key="telefon-pill" className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-text-primary">
                            Zum Telefon
                            {sicht.oben ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />}
                        </span>
                    )}
                </span>
            </button>

            {/* Ansage der Zustandswechsel für Screenreader */}
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {zustand === 'fehler'
                    ? `${fehlerMeldung(auftrag?.grund).text.replace(/:$/, '')}: 052 222 18 18.`
                    : zustand === 'bereit' && !hrOk
                      ? `${name}, Ihr Assistent, ist bereit. Bitte bestätigen Sie zuerst Ihre Firma im Handelsregister.`
                      : wartetAufFirma
                        ? `${HR_SCHRITT.websiteErreichbar}. ${HR_SCHRITT.assistentWartet}.`
                        : ansage(zustand, name, firma)}
            </p>
        </div>
    );
}
