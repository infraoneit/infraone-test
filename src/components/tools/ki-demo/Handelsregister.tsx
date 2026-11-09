'use client';

/**
 * Handelsregister-Schritt der KI-Demo (AUFTRAG-109, Reihenfolge und Bindung AUFTRAG-111).
 *
 * AUFTRAG-111: Erster sichtbarer Schritt nach der URL-Eingabe («Welche ist Ihre Firma?»), noch
 * während der Scan im Telefon läuft. Zeigt das Ergebnis des Abgleichs mit Zefix (automatisch: UID
 * aus dem Impressum, Firmenname, zuletzt Domain-Label), lässt den Besucher bestätigen («Ja, das ist
 * meine Firma», bei mehreren Treffern Auswahl, höchstens 5) und bietet eine eigene Suche «Firmenname
 * oder UID» (höchstens 3 je Scan). «Meine Firma ist nicht dabei» / «Nein, andere Firma suchen» klappt
 * die Liste ein; «Zurück zu den Vorschlägen» zeigt sie wieder. Die Liste einer eigenen Suche ersetzt
 * die automatische.
 *
 * Gehört die gewählte Firma nicht zur gescannten Website (Server: 409 `website_passt_nicht`),
 * erscheint die Meldung unter der Liste mit «Andere Website eingeben»; die Liste bleibt wählbar und
 * es zählt nicht als Suchversuch. Erst nach der Bestätigung zeigt das Widget den Anruf-Schritt; der
 * Server erzwingt das zusätzlich (POST /api/demo/anruf → 403 ohne signierten, gebundenen Nachweis).
 *
 * AUFTRAG-112: Unter dem Untertitel von «Welche ist Ihre Firma?» und «Firma nicht gefunden» steht gedämpft
 * «Ihre Website lesen wir erst, nachdem Sie Ihre Firma bestätigt haben.» (der Vollscan läuft erst danach).
 *
 * [09.11.2026] Warum: AUFTRAG-123 ruhige Bühne — im Kompaktmodus (Handy) ist der Schritt ein Blatt mit EINER Frage und
 * EINER Haupthandlung: Titel, höchstens eine Hilfszeile (T2 «Aus dem Handelsregister (Zefix)» bzw. die bestehende
 * Meldung), der Inhalt, eine Haupthandlung, höchstens ein Textlink. Ein Treffer = ruhige Karte + «Ja, das ist meine
 * Firma»; mehrere Treffer = antippbare Zeilen (ein Tipp = wählen und bestätigen, kein «Ja»-Knopf). Ohne Radios,
 * Untertitel, Lesehinweis und Datenschutz-Fusszeile. Logik und Desktop-Darstellung unverändert.
 */
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Check, ChevronRight, Globe, Loader2, RotateCcw, Search } from 'lucide-react';
import {
    HR_KOMPAKT,
    HR_SCHRITT,
    HR_TEXT,
    MANUELL_MAX,
    websitePasstNichtTeile,
    type HrAntwort,
    type HrBestaetigt,
    type HrTrefferAnzeige,
} from '@/lib/demo/handelsregister-texte';
import { HR_CODE_WEBSITE_PASST_NICHT } from '@/lib/demo/bindung';
import styles from '../KiDemo.module.css';

const KNOPF =
    'w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-[1.1875rem] font-bold leading-6 text-center bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-default';
const KNOPF_ZWEIT =
    'inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border-2 border-border text-text-primary text-base font-semibold hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-default';
const TEXTLINK = 'block mx-auto text-sm font-semibold text-text-primary underline underline-offset-2 hover:no-underline';
/** AUFTRAG-123 (Z3): Textlink im Blatt — zentriert, Trefferfläche ≥ 44 px (fest in px, auch bei 14-px-Grundschrift) */
const TEXTLINK_KOMPAKT = 'mx-auto mt-1 flex min-h-[44px] w-fit items-center justify-center px-3 text-sm font-semibold text-text-primary underline underline-offset-2 hover:no-underline';
/** AUFTRAG-123 (Z3): Titel und Hilfszeile des Blatts */
const TITEL_KOMPAKT = 'flex-shrink-0 text-[1.375rem] font-bold leading-tight tracking-tight text-text-primary focus:outline-none';
const HILFE_KOMPAKT = 'mt-1 flex-shrink-0 text-sm text-text-secondary';

const NETZ = 'Die Verbindung hat nicht geklappt. Bitte versuchen Sie es gleich nochmals.';

interface Props {
    /** Scan-Kennung; null, solange die Scan-Antwort noch fehlt (Schritt zeigt «wird abgeglichen») */
    scanId: string | null;
    /** Website (Host, z. B. «elektro-tel.ch») für die Untertitel */
    website: string;
    /**
     * Ergebnis der automatischen Prüfung (startet mit der Scan-Antwort); null = läuft,
     * 'netz' = Verbindungsfehler. Eine bestätigte Antwort behandelt das Widget selbst.
     */
    start: HrAntwort | 'netz' | null;
    /** automatische Prüfung nochmals anstossen (Register war nicht erreichbar) */
    onNochmals: () => void;
    /** bestätigt — mit der Scan-Kennung, zu der die Bestätigung gehört */
    onBestaetigt: (b: HrBestaetigt, scanId: string) => void;
    /** AUFTRAG-111: zurück zum URL-Feld (vorbefüllt, fokussiert, Scan zurückgesetzt) */
    onAndereWebsite: () => void;
    /** Hinweis von aussen, z. B. «Bestätigung abgelaufen» nach 403 der Anruf-Route */
    hinweis?: string | null;
    /**
     * [09.11.2026] Warum: AUFTRAG-121 (K3.1) — Kompaktmodus der Aktionskarte auf dem Handy (nur unter 1024 px, von
     * KiDemo gesetzt). AUFTRAG-123: eigene Blatt-Darstellung (siehe Kopf), bei vielen Treffern scrollt nur die Liste
     * (Schattenrand unten). Nur Darstellung, Logik gleich.
     */
    kompakt?: boolean;
}

function versucheText(n: number): string {
    return n === 1 ? 'Noch 1 Versuch' : `Noch ${n} Versuche`;
}

function Eintrag({ t, gewaehlt, name, onWahl }: { t: HrTrefferAnzeige; gewaehlt: boolean; name: string; onWahl: () => void }) {
    const id = `ki-demo-hr-${t.uid}`;
    return (
        <label
            htmlFor={id}
            className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                t.aktiv ? 'cursor-pointer' : 'cursor-default opacity-75'
            } ${gewaehlt ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-surface'}`}
            data-uid={t.uid}
            data-aktiv={t.aktiv ? 'true' : 'false'}
        >
            <input id={id} type="radio" name={name} value={t.uid} checked={gewaehlt} disabled={!t.aktiv} onChange={onWahl} className="mt-1 w-5 h-5 flex-shrink-0 accent-[var(--primary)]" />
            <span className="min-w-0 flex-1">
                <span className="block text-[0.98rem] font-semibold leading-snug text-text-primary break-words">{t.name}</span>
                <span className="mt-1 block text-sm text-text-secondary">
                    Sitz: {t.sitz || 'unbekannt'}
                    {t.rechtsform ? ` · ${t.rechtsform}` : ''}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                    <span className="tabular-nums">UID: {t.uid_formatiert}</span>
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            t.aktiv ? 'bg-primary/10 text-text-primary' : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
                        }`}
                    >
                        Status: {t.status_text}
                    </span>
                </span>
            </span>
        </label>
    );
}

/**
 * [09.11.2026] Warum: AUFTRAG-123 (Z4.3) — mehrere Treffer: jede aktive Zeile ist EIN Knopf (Tipp = wählen und bestätigen),
 * mindestens 64 px, Name höchstens zwei Zeilen, darunter «Sitz · UID», rechts ein Chevron (während der Anfrage ein Spinner).
 * Inaktive Einträge bleiben sichtbar, sind aber kein Knopf (Status rot wie bisher).
 */
function Zeile({ t, gesperrt, laedt, onTipp }: { t: HrTrefferAnzeige; gesperrt: boolean; laedt: boolean; onTipp: () => void }) {
    const sitz = t.sitz || 'unbekannt';
    const inhalt = (
        <span className="min-w-0 flex-1">
            <span data-hr-name="" className="line-clamp-2 text-base font-semibold leading-snug text-text-primary">
                {t.name}
            </span>
            <span className="mt-0.5 block text-sm leading-5 text-text-secondary tabular-nums" data-hr-meta="">
                {sitz} · {t.uid_formatiert}
                {!t.aktiv && (
                    <>
                        {' · '}
                        <span className="font-semibold text-red-700 dark:text-red-300">{t.status_text}</span>
                    </>
                )}
            </span>
        </span>
    );
    if (!t.aktiv) {
        return (
            <div data-hr-zeile="" data-uid={t.uid} data-aktiv="false" className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-2.5">
                {inhalt}
            </div>
        );
    }
    return (
        <button
            type="button"
            data-hr-zeile=""
            data-uid={t.uid}
            data-aktiv="true"
            aria-label={HR_KOMPAKT.zeileLabel(t.name, sitz)}
            onClick={onTipp}
            disabled={gesperrt}
            // min-h mit «!»: globals.css setzt mobil (ungeschichtet) min-height: 44px auf alle Knöpfe und schlägt sonst die
            // Tailwind-Klasse — bei 14-px-Grundschrift (360 px) waren die Zeilen nur 58 px hoch (gemessen)
            className="flex w-full min-h-[64px]! items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:hover:border-border"
        >
            {inhalt}
            {laedt ? (
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
            ) : (
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-text-secondary" aria-hidden="true" />
            )}
        </button>
    );
}

export function Handelsregister({ scanId, website, start, onNochmals, onBestaetigt, onAndereWebsite, hinweis = null, kompakt = false }: Props) {
    // Antwort einer eigenen Suche, gebunden an die automatische Antwort, auf der sie aufbaut:
    // kommt eine neue automatische Antwort (Nochmals prüfen), gilt wieder diese.
    const [eigene, setEigene] = useState<{ basis: Props['start']; antwort: HrAntwort } | null>(null);
    // letzte Liste mit Treffern vor einer eigenen Suche (für «Zurück zu den Vorschlägen»)
    const [vorschlaege, setVorschlaege] = useState<{ basis: Props['start']; antwort: HrAntwort } | null>(null);
    const [wahl, setWahl] = useState<string | null>(null);
    const [suchOffen, setSuchOffen] = useState(false);
    const [suche, setSuche] = useState('');
    const [laeuft, setLaeuft] = useState<'suche' | 'bestaetige' | null>(null);
    const [fehler, setFehler] = useState<string | null>(null);
    const [passtNicht, setPasstNicht] = useState<{ website: string; firma: string } | null>(null);
    const radioName = useId();
    /*
     * AUFTRAG-121 (K3.1): Schattenrand unten, solange die Liste im Kompaktmodus mehr Einträge hat, als sichtbar sind
     * (und noch nicht ans Ende gescrollt). Nur ein Attribut am Element, kein neuer Zustand.
     */
    const listeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = listeRef.current;
        if (!kompakt || !el) return;
        const pruefen = () => el.setAttribute('data-ueberlauf', el.scrollHeight - el.clientHeight - el.scrollTop > 2 ? 'true' : 'false');
        pruefen();
        el.addEventListener('scroll', pruefen, { passive: true });
        const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(pruefen);
        ro?.observe(el);
        if (el.firstElementChild) ro?.observe(el.firstElementChild);
        return () => {
            el.removeEventListener('scroll', pruefen);
            ro?.disconnect();
        };
    });

    const eigeneGilt = !!eigene && eigene.basis === start;
    const antwort: HrAntwort | null = eigeneGilt ? eigene.antwort : start && start !== 'netz' ? start : null;
    const netz = !eigeneGilt && start === 'netz';
    const setAntwort = (a: HrAntwort) => setEigene({ basis: start, antwort: a });

    // Auswahl: Wahl des Besuchers, sonst genau ein aktiver Eintrag vorgewählt
    const treffer = antwort?.treffer ?? [];
    const aktive = treffer.filter((t) => t.aktiv);
    const auswahl = wahl && aktive.some((t) => t.uid === wahl) ? wahl : aktive.length === 1 ? aktive[0].uid : null;

    const rest = antwort?.versuche_rest ?? 0;
    const ergebnis = !scanId ? 'pruefen' : netz ? 'netz' : (antwort?.ergebnis ?? 'pruefen');
    const ohneAktive = ergebnis === 'kein_treffer' || ergebnis === 'nicht_aktiv';
    // frühere Vorschläge, zu denen der Besucher nach einer erfolglosen eigenen Suche zurück kann
    const vorschlag = vorschlaege && vorschlaege.basis === start && vorschlaege.antwort !== antwort && vorschlaege.antwort.treffer.some((t) => t.aktiv) ? vorschlaege.antwort : null;
    const ausgeschoepft = ohneAktive && rest === 0 && !vorschlag;
    // P3: «Meine Firma ist nicht dabei» klappt die Liste ein — nur das Suchformular bleibt
    const listeZu = ergebnis === 'treffer' && suchOffen;
    const suchFormular = (ohneAktive && rest > 0) || (listeZu && rest > 0);
    const zurueck = listeZu || (ohneAktive && !!vorschlag);

    const post = async (body: Record<string, string>) => {
        const res = await fetch('/api/demo/handelsregister', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scan_id: scanId, ...body }),
        });
        const daten = await res.json().catch(() => null);
        return { res, daten };
    };

    /*
     * [09.11.2026] Warum: AUFTRAG-123 (Z4.3) — mit Kennung aufrufbar: im Kompaktmodus wählt und bestätigt ein Tipp auf eine
     * Trefferzeile in einem Schritt (gleiche Logik wie «Ja, das ist meine Firma» mit dieser UID).
     */
    const bestaetigeUid = async (uid: string | null) => {
        if (!uid || laeuft || !scanId) return;
        setLaeuft('bestaetige');
        setFehler(null);
        setPasstNicht(null);
        try {
            const { res, daten } = await post({ bestaetige: uid });
            if (res.ok && daten?.bestaetigt && daten.scan_id === scanId) {
                onBestaetigt(daten.bestaetigt as HrBestaetigt, scanId);
                return;
            }
            // AUFTRAG-111: Firma gehört nicht zur Website — Meldung unter der Liste, Liste bleibt wählbar
            if (res.status === 409 && daten?.code === HR_CODE_WEBSITE_PASST_NICHT) {
                setPasstNicht({ website: typeof daten.website === 'string' ? daten.website : website, firma: typeof daten.firma === 'string' ? daten.firma : '' });
                return;
            }
            setFehler(typeof daten?.fehler === 'string' ? daten.fehler : NETZ);
        } catch {
            setFehler(NETZ);
        } finally {
            setLaeuft(null);
        }
    };
    const bestaetigen = () => bestaetigeUid(auswahl);

    const suchen = async (e: FormEvent) => {
        e.preventDefault();
        if (laeuft || !scanId) return;
        const text = suche.trim();
        if (text.length < 3) {
            setFehler(HR_TEXT.suchtextKurz);
            document.getElementById('ki-demo-hr-suche')?.focus();
            return;
        }
        setLaeuft('suche');
        setFehler(null);
        setPasstNicht(null);
        try {
            const { res, daten } = await post({ suche: text });
            if (res.ok && daten && daten.scan_id === scanId) {
                // schon bestätigt (gültiger Nachweis) → direkt weiter
                if (daten.ergebnis === 'bestaetigt' && daten.bestaetigt) {
                    onBestaetigt(daten.bestaetigt as HrBestaetigt, scanId);
                    return;
                }
                // P4: die Liste der eigenen Suche ersetzt die bisherige; diese bleibt als Vorschlag erreichbar
                if (antwort && antwort.ergebnis === 'treffer' && antwort.treffer.some((t) => t.aktiv)) setVorschlaege({ basis: start, antwort });
                setAntwort(daten as HrAntwort);
                setWahl(null);
                if ((daten as HrAntwort).ergebnis === 'treffer') {
                    setSuchOffen(false);
                    // [09.11.2026] Warum: AUFTRAG-123 — mobil verschwindet das Suchformular samt Fokus; Fokus auf den Titel des Blatts
                    if (kompakt) setTimeout(() => (document.querySelector('[data-handelsregister] #ki-demo-anruf-titel') as HTMLElement | null)?.focus({ preventScroll: true }), 0);
                }
                return;
            }
            if (res.status === 429 && antwort) setAntwort({ ...antwort, versuche_rest: 0 });
            setFehler(typeof daten?.fehler === 'string' ? daten.fehler : NETZ);
        } catch {
            setFehler(NETZ);
        } finally {
            setLaeuft(null);
        }
    };

    const zurueckZuVorschlaegen = () => {
        setFehler(null);
        setPasstNicht(null);
        setSuchOffen(false);
        // nach einer erfolglosen eigenen Suche: frühere Liste wieder zeigen (Zähler bleibt aktuell)
        if (ohneAktive && vorschlag) {
            setAntwort({ ...vorschlag, versuche_rest: rest });
            setWahl(null);
        }
        // AUFTRAG-123: im Kompaktmodus gibt es keine Radios — Fokus auf den Titel des Blatts (ohne Scrollen)
        setTimeout(
            () =>
                kompakt
                    ? (document.querySelector('[data-handelsregister] #ki-demo-anruf-titel') as HTMLElement | null)?.focus({ preventScroll: true })
                    : (document.querySelector('[data-handelsregister] input[type="radio"]:not(:disabled)') as HTMLInputElement | null)?.focus(),
            0,
        );
    };

    const oeffneSuche = () => {
        setSuchOffen(true);
        setFehler(null);
        setPasstNicht(null);
        setTimeout(() => document.getElementById('ki-demo-hr-suche')?.focus(), 0);
    };

    const titel =
        ergebnis === 'pruefen' || ergebnis === 'treffer'
            ? HR_SCHRITT.titel
            : ergebnis === 'bestaetigt' || ergebnis === 'uebersprungen'
              ? 'Ihre Firma im Handelsregister'
              : ergebnis === 'netz' || ergebnis === 'nicht_erreichbar'
                ? 'Handelsregister nicht erreichbar'
                : ausgeschoepft
                  ? 'Kein Testanruf möglich'
                  : ergebnis === 'nicht_aktiv'
                    ? 'Kein aktiver Eintrag gefunden'
                    : 'Firma nicht gefunden';

    const manuell = antwort?.quelle === 'manuell';
    const untertitel =
        ergebnis === 'treffer'
            ? manuell
                ? `${aktive.length > 1 ? 'Wir haben mehrere Einträge im Handelsregister gefunden. Wählen Sie Ihre Firma.' : 'Diesen Eintrag haben wir im Handelsregister gefunden.'} Gefunden über Ihre Eingabe.`
                : aktive.length > 1
                  ? HR_SCHRITT.untertitelMehrere(website)
                  : HR_SCHRITT.untertitelEiner(website)
            : `Diese Einträge sind im Handelsregister nicht aktiv.${manuell ? ' Gefunden über Ihre Eingabe.' : ''}`;

    const passt = passtNicht ? websitePasstNichtTeile(passtNicht.website, passtNicht.firma) : null;

    // Meldung ohne aktive Einträge (bestehender Text, wortgleich)
    const ohneAktiveText = ohneAktive
        ? `${
              ergebnis === 'kein_treffer'
                  ? rest < MANUELL_MAX
                      ? 'Zu dieser Eingabe haben wir im Handelsregister keinen Eintrag gefunden.'
                      : 'Zu Ihrer Website haben wir im Handelsregister keinen passenden Eintrag gefunden.'
                  : HR_TEXT.aktivNoetig
          }${rest > 0 ? ' Geben Sie den Firmennamen oder die UID ein, dann suchen wir nochmals.' : ''}`
        : null;

    if (kompakt) {
        /*
         * [09.11.2026] Warum: AUFTRAG-123 (Z3/Z4) — Blatt im Kompaktmodus. Genau ein aktiver Treffer: T1 + ruhige Karte +
         * «Ja, das ist meine Firma»; mehrere: Liste antippbarer Zeilen (role=list), kein «Ja»-Knopf. Bei 409 wird «Andere
         * Website eingeben» die Haupthandlung (ein erneutes «Ja» liefe wieder in den Fehler). Suchformular untereinander,
         * «Suchen» als Haupthandlung; «Noch n Versuche» rechts neben der Feldbeschriftung (keine zweite Hilfszeile).
         */
        const listeOffen = (ergebnis === 'treffer' || ergebnis === 'nicht_aktiv') && treffer.length > 0 && !listeZu;
        const einer = ergebnis === 'treffer' && !listeZu && aktive.length === 1;
        const mehrere = listeOffen && !einer;
        const hilfe = ergebnis === 'treffer' && !listeZu ? HR_KOMPAKT.herkunft : ohneAktive && !ausgeschoepft ? ohneAktiveText : null;
        const fehlerZeile = fehler && (
            <p role="alert" className="mt-3 flex-shrink-0 text-sm font-medium text-red-700 dark:text-red-300">
                {fehler}
            </p>
        );
        const passtMeldung = passt && (
            <p role="alert" data-hr-passt-nicht="" className="mt-4 flex-shrink-0 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                {passt[0]}
                <strong className="font-semibold">{passt[1]}</strong>
                {passt[2]}
                <strong className="font-semibold">{passt[3]}</strong>
                {passt[4]}
            </p>
        );
        const andereWebsiteKnopf = (
            <button type="button" onClick={onAndereWebsite} className={KNOPF} id="ki-demo-hr-andere-website" data-blatt-haupt="">
                <Globe className="w-5 h-5" aria-hidden="true" />
                {HR_SCHRITT.andereWebsite}
            </button>
        );
        return (
            <div data-handelsregister={ergebnis} data-hr-liste={listeZu ? 'zu' : 'offen'} className="flex min-h-0 flex-1 flex-col">
                <h2 id="ki-demo-anruf-titel" tabIndex={-1} className={TITEL_KOMPAKT}>
                    {einer ? HR_KOMPAKT.titelEiner : titel}
                </h2>
                {hilfe && (
                    <p className={HILFE_KOMPAKT} data-blatt-hilfe="">
                        {hilfe}
                    </p>
                )}

                {hinweis && ergebnis !== 'pruefen' && (
                    <p role="alert" className="mt-3 flex-shrink-0 text-sm font-medium text-red-700 dark:text-red-300">
                        {hinweis}
                    </p>
                )}

                {/* Während der Prüfung ist das Blatt unsichtbar (KiDemo: data-blatt="pruefen"); das Telefon zeigt den Stand */}
                {ergebnis === 'pruefen' && (
                    <p role="status" className="mt-4 flex items-center gap-3 rounded-2xl bg-surface border border-border px-4 py-4 text-text-secondary">
                        <Loader2 className="w-5 h-5 flex-shrink-0 text-primary motion-safe:animate-spin" aria-hidden="true" />
                        Wir gleichen Ihre Website mit dem Handelsregister ab …
                    </p>
                )}

                {(ergebnis === 'netz' || ergebnis === 'nicht_erreichbar') && (
                    <>
                        <p role="alert" className="mt-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                            {ergebnis === 'netz' ? NETZ : HR_TEXT.nichtErreichbar}
                        </p>
                        <button type="button" onClick={onNochmals} className={`${KNOPF} mt-4`} id="ki-demo-hr-nochmals" data-blatt-haupt="">
                            <RotateCcw className="w-5 h-5" aria-hidden="true" />
                            Nochmals prüfen
                        </button>
                    </>
                )}

                {einer && (
                    <>
                        <div data-hr-eintrag="" data-uid={aktive[0].uid} className="mt-4 flex-shrink-0 rounded-2xl border border-border bg-surface px-4 py-3">
                            <p data-hr-name="" className="line-clamp-2 text-[1.0625rem] font-semibold leading-snug text-text-primary">
                                {aktive[0].name}
                            </p>
                            <p className="mt-0.5 text-sm text-text-secondary tabular-nums">
                                {aktive[0].sitz || 'unbekannt'} · {aktive[0].uid_formatiert}
                            </p>
                        </div>
                        {passtMeldung}
                        {fehlerZeile}
                        <div className="mt-4 flex-shrink-0">
                            {passt ? (
                                andereWebsiteKnopf
                            ) : (
                                <button type="button" onClick={bestaetigen} disabled={!auswahl || !!laeuft} className={KNOPF} id="ki-demo-hr-bestaetigen" data-blatt-haupt="">
                                    {laeuft === 'bestaetige' ? <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Check className="w-5 h-5" aria-hidden="true" />}
                                    Ja, das ist meine Firma
                                </button>
                            )}
                            {rest > 0 && (
                                <button type="button" onClick={oeffneSuche} className={TEXTLINK_KOMPAKT} id="ki-demo-hr-andere" data-blatt-link="">
                                    Nein, andere Firma suchen
                                </button>
                            )}
                        </div>
                    </>
                )}

                {mehrere && (
                    <>
                        {/* nur diese Hülle scrollt (flex 1 1 auto, min-height 0), Schattenrand unten aus A-121 */}
                        <div ref={listeRef} className={`${styles.hrListe} mt-4`} data-hr-liste-scroll="">
                            <ul role="list" aria-label="Einträge im Handelsregister" className="space-y-2">
                                {treffer.map((t) => (
                                    <li key={t.uid}>
                                        <Zeile t={t} gesperrt={!!laeuft} laedt={laeuft === 'bestaetige' && wahl === t.uid} onTipp={() => {
                                                if (laeuft) return;
                                                setWahl(t.uid);
                                                void bestaetigeUid(t.uid);
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {passtMeldung}
                        {!suchFormular && fehlerZeile}
                        {passt && <div className="mt-4 flex-shrink-0">{andereWebsiteKnopf}</div>}
                        {ergebnis === 'treffer' && rest > 0 && (
                            <button type="button" onClick={oeffneSuche} className={`${TEXTLINK_KOMPAKT} flex-shrink-0`} id="ki-demo-hr-andere" data-blatt-link="">
                                Meine Firma ist nicht dabei
                            </button>
                        )}
                    </>
                )}

                {suchFormular && (
                    <form onSubmit={suchen} noValidate className="mt-4 flex-shrink-0" aria-label="Firma im Handelsregister suchen">
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                            <label htmlFor="ki-demo-hr-suche" className="text-sm font-medium text-text-primary">
                                Firmenname oder UID
                            </label>
                            <span id="ki-demo-hr-versuche" className="flex-shrink-0 text-xs text-text-secondary">
                                {versucheText(rest)}
                            </span>
                        </div>
                        <div className="relative">
                            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" aria-hidden="true" />
                            <input
                                id="ki-demo-hr-suche"
                                type="text"
                                value={suche}
                                onChange={(e) => setSuche(e.target.value)}
                                maxLength={120}
                                autoComplete="organization"
                                placeholder="z. B. Muster AG oder CHE-123.456.789"
                                aria-describedby="ki-demo-hr-versuche"
                                className="w-full h-[48px] pl-11 pr-3 rounded-xl border border-border bg-background text-text-primary text-base placeholder:text-text-secondary/70 focus:outline-none focus:border-primary"
                            />
                        </div>
                        {fehlerZeile}
                        <button type="submit" disabled={!!laeuft} className={`${KNOPF} mt-4`} id="ki-demo-hr-suchen" data-blatt-haupt="">
                            {laeuft === 'suche' ? <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Search className="w-5 h-5" aria-hidden="true" />}
                            Suchen
                        </button>
                    </form>
                )}

                {zurueck && (
                    <button type="button" onClick={zurueckZuVorschlaegen} className={`${TEXTLINK_KOMPAKT} flex-shrink-0`} id="ki-demo-hr-zurueck" data-blatt-link="">
                        {HR_SCHRITT.zurueck}
                    </button>
                )}

                {!einer && !mehrere && !suchFormular && fehlerZeile}

                {ausgeschoepft && (
                    <>
                        <p role="alert" className="mt-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                            {HR_TEXT.aktivNoetig} Gerne zeigen wir Ihnen den Assistenten persönlich.
                        </p>
                        <Link href={`/kontakt?subject=${encodeURIComponent('KI-Telefonassistent')}`} className={`${KNOPF} mt-4`} id="ki-demo-hr-kontakt" data-blatt-haupt="">
                            Kontakt aufnehmen
                            <ArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        </Link>
                    </>
                )}
            </div>
        );
    }

    return (
        <div data-handelsregister={ergebnis} data-hr-liste={listeZu ? 'zu' : 'offen'}>
            <h2 id="ki-demo-anruf-titel" className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                {titel}
            </h2>

            {hinweis && ergebnis !== 'pruefen' && (
                <p role="alert" className="mt-3 text-sm font-medium text-red-700 dark:text-red-300">
                    {hinweis}
                </p>
            )}

            {ergebnis === 'pruefen' && (
                <p role="status" className="mt-4 flex items-center gap-3 rounded-2xl bg-surface border border-border px-4 py-4 text-text-secondary">
                    <Loader2 className="w-5 h-5 flex-shrink-0 text-primary motion-safe:animate-spin" aria-hidden="true" />
                    Wir gleichen Ihre Website mit dem Handelsregister ab …
                </p>
            )}
            {/* AUFTRAG-112: gedämpfte Zeile unter dem Untertitel («Welche ist Ihre Firma?»; Liste eingeklappt: unter dem Titel) */}
            {(ergebnis === 'pruefen' || (ergebnis === 'treffer' && listeZu)) && (
                <p className="mt-2 text-xs text-text-secondary" data-hr-lesehinweis="">
                    {HR_SCHRITT.leseHinweis}
                </p>
            )}

            {(ergebnis === 'netz' || ergebnis === 'nicht_erreichbar') && (
                <div className="mt-4 space-y-4">
                    <p role="alert" className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                        {ergebnis === 'netz' ? NETZ : HR_TEXT.nichtErreichbar}
                    </p>
                    <button type="button" onClick={onNochmals} className={KNOPF_ZWEIT} id="ki-demo-hr-nochmals">
                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        Nochmals prüfen
                    </button>
                </div>
            )}

            {(ergebnis === 'treffer' || ergebnis === 'nicht_aktiv') && treffer.length > 0 && !listeZu && (
                <div className="mt-4">
                    <p className="text-sm text-text-secondary" id="ki-demo-hr-untertitel">
                        {untertitel}
                    </p>
                    {ergebnis === 'treffer' && (
                        <p className="mt-2 text-xs text-text-secondary" data-hr-lesehinweis="">
                            {HR_SCHRITT.leseHinweis}
                        </p>
                    )}
                    <fieldset className="mt-3 space-y-2.5 min-w-0" aria-label="Einträge im Handelsregister">
                        {treffer.map((t) => (
                            <Eintrag
                                key={t.uid}
                                t={t}
                                name={radioName}
                                gewaehlt={auswahl === t.uid}
                                onWahl={() => {
                                    setWahl(t.uid);
                                    setPasstNicht(null);
                                }}
                            />
                        ))}
                    </fieldset>
                    {passt && (
                        <div className="mt-3 space-y-3" data-hr-passt-nicht="">
                            <p role="alert" className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                                {passt[0]}
                                <strong className="font-semibold">{passt[1]}</strong>
                                {passt[2]}
                                <strong className="font-semibold">{passt[3]}</strong>
                                {passt[4]}
                            </p>
                            <button type="button" onClick={onAndereWebsite} className={KNOPF_ZWEIT} id="ki-demo-hr-andere-website">
                                <Globe className="w-4 h-4" aria-hidden="true" />
                                {HR_SCHRITT.andereWebsite}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {ergebnis === 'treffer' && !listeZu && (
                <div className="mt-5 space-y-3">
                    <button type="button" onClick={bestaetigen} disabled={!auswahl || !!laeuft} className={KNOPF} id="ki-demo-hr-bestaetigen">
                        {laeuft === 'bestaetige' ? <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Check className="w-5 h-5" aria-hidden="true" />}
                        Ja, das ist meine Firma
                    </button>
                    {rest > 0 && (
                        <button type="button" onClick={oeffneSuche} className={TEXTLINK} id="ki-demo-hr-andere">
                            {aktive.length > 1 ? 'Meine Firma ist nicht dabei' : 'Nein, andere Firma suchen'}
                        </button>
                    )}
                </div>
            )}

            {ohneAktive && !ausgeschoepft && (
                <p className="mt-4 text-sm text-text-secondary">
                    {ergebnis === 'kein_treffer'
                        ? rest < MANUELL_MAX
                            ? 'Zu dieser Eingabe haben wir im Handelsregister keinen Eintrag gefunden.'
                            : 'Zu Ihrer Website haben wir im Handelsregister keinen passenden Eintrag gefunden.'
                        : HR_TEXT.aktivNoetig}
                    {rest > 0 ? ' Geben Sie den Firmennamen oder die UID ein, dann suchen wir nochmals.' : ''}
                </p>
            )}
            {/* AUFTRAG-112: gedämpfte Zeile unter dem Untertitel von «Firma nicht gefunden» */}
            {ergebnis === 'kein_treffer' && !ausgeschoepft && (
                <p className="mt-2 text-xs text-text-secondary" data-hr-lesehinweis="">
                    {HR_SCHRITT.leseHinweis}
                </p>
            )}

            {suchFormular && (
                <form onSubmit={suchen} noValidate className="mt-4" aria-label="Firma im Handelsregister suchen">
                    <label htmlFor="ki-demo-hr-suche" className="block text-sm font-medium text-text-primary mb-2">
                        Firmenname oder UID
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1 min-w-0">
                            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" aria-hidden="true" />
                            <input
                                id="ki-demo-hr-suche"
                                type="text"
                                value={suche}
                                onChange={(e) => setSuche(e.target.value)}
                                maxLength={120}
                                autoComplete="organization"
                                placeholder="z. B. Muster AG oder CHE-123.456.789"
                                aria-describedby="ki-demo-hr-versuche"
                                className="w-full h-12 pl-11 pr-3 rounded-xl border border-border bg-background text-text-primary text-base placeholder:text-text-secondary/70 focus:outline-none focus:border-primary"
                            />
                        </div>
                        <button type="submit" disabled={!!laeuft} className={KNOPF_ZWEIT} id="ki-demo-hr-suchen">
                            {laeuft === 'suche' ? <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Search className="w-4 h-4" aria-hidden="true" />}
                            Suchen
                        </button>
                    </div>
                    <p id="ki-demo-hr-versuche" className="mt-2 text-xs text-text-secondary">
                        {versucheText(rest)}
                    </p>
                </form>
            )}

            {zurueck && (
                <button type="button" onClick={zurueckZuVorschlaegen} className={`${TEXTLINK} mt-4`} id="ki-demo-hr-zurueck">
                    {HR_SCHRITT.zurueck}
                </button>
            )}

            {fehler && (
                <p role="alert" className="mt-3 text-sm font-medium text-red-700 dark:text-red-300">
                    {fehler}
                </p>
            )}

            {ausgeschoepft && (
                <div className="mt-4 space-y-4">
                    <p role="alert" className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                        {HR_TEXT.aktivNoetig} Gerne zeigen wir Ihnen den Assistenten persönlich.
                    </p>
                    <Link href={`/kontakt?subject=${encodeURIComponent('KI-Telefonassistent')}`} className={KNOPF} id="ki-demo-hr-kontakt">
                        Kontakt aufnehmen
                        <ArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    </Link>
                </div>
            )}

            <p className="mt-5 text-xs text-text-secondary">{HR_TEXT.datenschutz}</p>
        </div>
    );
}
