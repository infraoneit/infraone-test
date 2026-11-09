'use client';

/**
 * Lebende Vorschau: Telefon-Mockup der KI-Demo (AUFTRAG-095, Teil 4).
 *
 * Ansichten je Zustand: Leerlauf → Scan (Schritte mit Fund) → Assistenten-
 * Karte (Logo, Markenfarbe, Name, Rolle, «Kann»-Zeilen, Sprachwahl,
 * Begrüssung) → wählt → «Anruf von +41 44 552 03 06» → verbunden mit
 * Wellenform und Dauer → beendet mit Zusammenfassung. Die Ansichten
 * überblenden (keine Layout-Sprünge: das Gerät hat feste Masse).
 */
import type { CSSProperties, ReactNode } from 'react';
import { Check, Clock, Grid3x3, Loader2, Mic, Minus, Phone, PhoneOff, Volume2, X } from 'lucide-react';
import styles from '../KiDemo.module.css';
import { Welle } from './Welle';
import type { Zustand } from '@/lib/demo/zustand';
import { dauerAnzeige, fehlerTitel, GRUND_KEINE_RUECKMELDUNG } from '@/lib/demo/zustand';
import type { Sprache } from '@/lib/demo/typen';

/**
 * Absendernummer der Demo-Anrufe (Orchestrator `ausgehende_cli`).
 *
 * [09.11.2026] Warum: AUFTRAG-121 K8 — peoplefone zeigt beim Angerufenen heute die Hauptnummer 052 222 18 18 statt
 * der KI-Linie; bis das im Portal umgestellt ist, muss der angezeigte Text ohne Code-Änderung folgen können.
 * Build-Variable NEXT_PUBLIC_DEMO_ANRUF_VON (beim Build eingesetzt); ohne Variable wortgleich wie bisher.
 * Alle Anzeigen (Formular-Hinweis, Ablauf-Liste, Telefon-Bildschirm) nutzen diese eine Konstante.
 */
export const ANRUF_VON = process.env.NEXT_PUBLIC_DEMO_ANRUF_VON?.trim() || '+41 44 552 03 06';

/**
 * [09.11.2026] Warum: AUFTRAG-121 (K3.4) — Grund-Text bei «fehler», wie im Telefon-Bildschirm; die mobile
 * Aktionskarte (Ende-Ansicht, AUFTRAG-122: über dem Telefon) nutzt denselben Text statt einer Kopie.
 */
export function fehlerGrundText(grund: string | null | undefined): string {
    return grund === 'limit' ? 'Heute keine weiteren Testanrufe an diese Nummer.' : grund === GRUND_KEINE_RUECKMELDUNG ? 'Die Statusanzeige ist stehen geblieben.' : 'Versuchen Sie es gleich nochmals.';
}

/** AUFTRAG-121 (K3.4): Platzhalter der Zusammenfassung (Telefon und mobile Aktionskarte) */
export const ZUSAMMENFASSUNG_FOLGT = 'Die Zusammenfassung folgt in Kürze.';

/** AUFTRAG-112: `fehler` = Vollscan nach der Bestätigung gescheitert (Titel = Text des Servers) */
export type SchrittStatus = 'laeuft' | 'ok' | 'leer' | 'fehler';

export interface SchrittAnzeige {
    /** AUFTRAG-111: dazu «handelsregister» (Firma wird geprüft / Handelsregister: Name) */
    id: 'website' | 'handelsregister' | 'logo' | 'farbe' | 'telefon' | 'zeiten' | 'wissen' | 'assistent';
    titel: string;
    detail?: string;
    status: SchrittStatus;
    farbe?: string;
    logoSrc?: string;
    /** Hintergrund der kleinen Logo-Plakette (wie auf der Karte) */
    logoGrund?: string;
}

export interface KartenAnzeige {
    name: string;
    /** Ganze Rollenzeile: «KI-Telefonassistentin von FIRMA» bzw. bei English «AI phone assistant of FIRMA» (AUFTRAG-098) */
    rollenZeile: string;
    /** AUFTRAG-111: Rollenzeile mit vollem Firmennamen (Titel-Attribut, wenn die Karte ihn kürzt) */
    rollenTitel?: string;
    /** Sprache der Karte (AUFTRAG-098: English → Karte auf Englisch) */
    lang: 'de' | 'en';
    firma: string;
    website: string;
    /** drei «Kann»-Zeilen; null = englische Fassung wird noch übersetzt (AUFTRAG-098) */
    kann: string[] | null;
    /** AUFTRAG-096: Plakette — Website-Umgebung, Marke (sitzt auf der Kundenfläche), Weiss oder Dunkel */
    logo: { src: string; grund: 'weiss' | 'dunkel' | 'marke' | 'umgebung'; farbe: string; breite: number | null; hoehe: number | null } | null;
    primaer: string;
    tief: string;
    text: string;
    /** Firmenfarbe als Akzent, lesbar auf hellem bzw. dunklem Bildschirm (≥ 3:1) */
    akzentHell: string;
    akzentDunkel: string;
    begruessung: string;
}

/**
 * Sprachwahl (AUFTRAG-098, Entscheid des Inhabers): Deutsch · English ·
 * Schweizerdeutsch (in Erprobung), Vorgabe Deutsch. An die Anlage gehen
 * weiterhin `hochdeutsch` / `englisch` / `dialekt_auto`.
 */
export const SPRACH_WAHL: Array<{ wert: Sprache; text: string; zusatz?: string }> = [
    { wert: 'hochdeutsch', text: 'Deutsch' },
    { wert: 'englisch', text: 'English' },
    { wert: 'dialekt_auto', text: 'Schweizerdeutsch', zusatz: 'in Erprobung' },
];

/** Zugänglicher Name einer Sprache, z. B. «Schweizerdeutsch (in Erprobung)». */
export function sprachName(s: { text: string; zusatz?: string }): string {
    return s.zusatz ? `${s.text} (${s.zusatz})` : s.text;
}

interface Props {
    zustand: Zustand;
    host: string;
    welleFarbe: string;
    schritte: SchrittAnzeige[];
    karte: KartenAnzeige | null;
    sprache: Sprache;
    onSprache: (s: Sprache) => void;
    dauerSek: number;
    zusammenfassung: string | null;
    /** Grund bei «fehler» (z. B. limit) */
    fehlerGrund?: string | null;
}

function Ansicht({ aktiv, children, className = '', style, label }: { aktiv: boolean; children: ReactNode; className?: string; style?: CSSProperties; label?: string }) {
    return (
        <div
            className={`${styles.ansicht} ${aktiv ? styles.ansichtAktiv : ''} ${className}`}
            style={style}
            aria-hidden={!aktiv}
            inert={!aktiv}
            aria-label={label}
            role={label ? 'group' : undefined}
        >
            {children}
        </div>
    );
}

/** `aufMarke`: steht auf der Kundenfläche (Markenfarbe) — eine Marken-Plakette ist dann durchsichtig. */
function LogoOderInitiale({ karte, gross = false, aufMarke = true }: { karte: KartenAnzeige; gross?: boolean; aufMarke?: boolean }) {
    const masse = gross ? 'w-24 h-24 text-4xl' : 'w-14 h-14 text-2xl';
    if (karte.logo) {
        const durchsichtig = karte.logo.grund === 'marke' && aufMarke;
        const grund = durchsichtig ? 'transparent' : karte.logo.farbe;
        return (
            <span
                className={`relative flex items-center justify-center rounded-2xl ${gross ? 'w-28 h-28 p-3' : 'w-fit max-w-[11.5rem] h-14 px-3 py-2'} ${durchsichtig ? '' : 'shadow-sm'}`}
                style={{ background: grund }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element -- Logo kommt über den eigenen Proxy (beliebige Fremd-URL) */}
                <img
                    src={karte.logo.src}
                    alt={`Logo ${karte.firma}`}
                    width={karte.logo.breite ?? undefined}
                    height={karte.logo.hoehe ?? undefined}
                    className="block h-full w-auto max-w-full object-contain"
                    decoding="async"
                />
            </span>
        );
    }
    return (
        <span
            className={`flex items-center justify-center rounded-full font-semibold ${masse}`}
            style={{ background: 'rgba(255,255,255,0.16)', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35)' }}
            aria-hidden="true"
        >
            {karte.name.charAt(0)}
        </span>
    );
}

export function Telefon({ zustand, host, welleFarbe, schritte, karte, sprache, onSprache, dauerSek, zusammenfassung, fehlerGrund = null }: Props) {
    const kundenStil = karte
        ? ({
              '--kunde': karte.primaer,
              '--kunde-tief': karte.tief,
              '--kunde-text': karte.text,
              '--kunde-akzent-hell': karte.akzentHell,
              '--kunde-akzent-dunkel': karte.akzentDunkel,
          } as CSSProperties)
        : undefined;

    return (
        <figure className={styles.telefonHuelle} aria-label="Vorschau: So erscheint Ihr Assistent auf dem Telefon">
            <div className={styles.hof} style={{ '--welle': welleFarbe } as CSSProperties} aria-hidden="true" />
            <div className={styles.geraet} style={{ '--welle': welleFarbe } as CSSProperties}>
                <div className={styles.bildschirm} style={kundenStil}>
                    <span className={styles.insel} aria-hidden="true" />

                    {/* Leerlauf: die leere Karte zeigt, was gleich entsteht */}
                    <Ansicht aktiv={zustand === 'eingabe'}>
                        <div className="px-5 pt-12 pb-5 bg-gradient-to-br from-[#2b3440] to-[#141920] dark:from-[#3b4654] dark:to-[#1d232b] text-white">
                            <span className="flex items-center justify-center h-14 w-36 rounded-2xl border border-dashed border-white/45 text-[0.74rem] font-medium text-white/80">
                                Ihr Logo
                            </span>
                            <p className="mt-3 text-[1.7rem] font-bold leading-none tracking-tight">Ihr Assistent</p>
                            <p className="mt-1.5 text-[0.82rem] leading-snug text-white/80">KI-Telefonassistent von Ihrer Firma</p>
                            <div className="mt-3 w-28 text-[#6BD66F]">
                                <Welle farbe={welleFarbe} modus="ruhe" anzahl={16} hell className="[--welle-hoehe:22px]" />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col px-5 pt-4 pb-5" aria-hidden="true">
                            {[0.8, 0.66, 0.74].map((b, i) => (
                                <span key={i} className="flex items-center gap-2 h-6">
                                    <span className="w-4 h-4 rounded-full bg-black/[0.08] dark:bg-white/[0.09]" />
                                    <span className="h-2.5 rounded-full bg-black/[0.07] dark:bg-white/[0.08]" style={{ width: `${b * 100}%` }} />
                                </span>
                            ))}
                            <span className="mt-4 h-9 rounded-xl bg-black/[0.05] dark:bg-white/[0.06]" />
                            <span className="mt-4 h-24 rounded-xl bg-black/[0.04] dark:bg-white/[0.05]" />
                            <p className="mt-auto pt-4 text-center text-[0.8rem] font-medium text-[#5b6472] dark:text-[#9aa3af]">Entsteht aus Ihrer Website – in einer Minute.</p>
                        </div>
                    </Ansicht>

                    {/* Scan: Schritte mit Fund */}
                    <Ansicht aktiv={zustand === 'scan'} className="px-5 pt-12 pb-5">
                        <p className="text-center text-[0.78rem] font-medium text-[#5b6472] dark:text-[#9aa3af] truncate" title={host}>
                            {host}
                        </p>
                        <Welle farbe={welleFarbe} modus="scan" anzahl={26} className="mt-1 [--welle-hoehe:56px]" />
                        <ol className="mt-3 space-y-2.5" aria-label="Scan-Schritte">
                            {schritte.map((s) => (
                                <li key={s.id} className={`${styles.schritt} flex items-start gap-2.5`}>
                                    <span
                                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                            s.status === 'ok'
                                                ? 'bg-[#1f7a35] text-white'
                                                : s.status === 'fehler'
                                                  ? 'bg-[#b42318] text-white'
                                                  : s.status === 'leer'
                                                  ? 'bg-black/[0.08] text-[#5b6472] dark:bg-white/10 dark:text-[#9aa3af]'
                                                  : 'text-[#5b6472] dark:text-[#9aa3af]'
                                        }`}
                                        aria-hidden="true"
                                    >
                                        {s.status === 'ok' ? (
                                            <Check className={`${styles.haken} w-3 h-3`} strokeWidth={3.2} />
                                        ) : s.status === 'fehler' ? (
                                            <X className="w-3 h-3" strokeWidth={3.2} />
                                        ) : s.status === 'leer' ? (
                                            <Minus className="w-3 h-3" strokeWidth={3} />
                                        ) : (
                                            <Loader2 className="w-4 h-4 motion-safe:animate-spin" />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-2 text-[0.84rem] font-semibold leading-tight">
                                            {/* AUFTRAG-111: die Firmen-Schritte (wortgleiche, längere Texte) brechen zweizeilig um statt abgeschnitten zu werden;
                                                AUFTRAG-112: ebenso ein Fehler im Vollscan (Text des Servers) */}
                                            <span className={s.id === 'handelsregister' || s.id === 'assistent' || s.status === 'fehler' ? 'min-w-0 line-clamp-2' : 'truncate'} data-schritt-titel="" data-schritt-stand={s.status}>
                                                {s.titel}
                                            </span>
                                            {s.farbe && <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full ring-1 ring-black/10" style={{ background: s.farbe }} aria-hidden="true" />}
                                        </span>
                                        {s.detail && <span className="block text-[0.74rem] leading-snug text-[#5b6472] dark:text-[#9aa3af] truncate">{s.detail}</span>}
                                    </span>
                                    {s.logoSrc && (
                                        <span className="flex-shrink-0 h-7 max-w-[5.5rem] rounded-md px-1.5 py-1 flex items-center ring-1 ring-black/5" style={{ background: s.logoGrund ?? '#FFFFFF' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element -- eigener Proxy */}
                                            <img src={s.logoSrc} alt="" className="block h-5 w-auto max-w-[4.5rem] object-contain" />
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </Ansicht>

                    {/* Assistenten-Karte */}
                    {karte && (
                        <Ansicht aktiv={zustand === 'bereit'} label={`${karte.name}, ${karte.rollenTitel ?? karte.rollenZeile}`}>
                            <div className={`${styles.kundenFlaeche} px-5 pt-12 pb-5`} lang={karte.lang}>
                                <LogoOderInitiale karte={karte} />
                                <p className="mt-3 text-[1.7rem] font-bold leading-none tracking-tight">{karte.name}</p>
                                <p className="mt-1.5 text-[0.82rem] leading-snug opacity-90 line-clamp-2" title={karte.rollenTitel ?? karte.rollenZeile}>
                                    {karte.rollenZeile}
                                </p>
                                <div className="mt-3 w-28" style={{ color: karte.text }}>
                                    <Welle farbe={karte.primaer} modus="ruhe" anzahl={16} hell className="[--welle-hoehe:22px]" />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col px-5 pt-4 pb-5 min-h-0">
                                <ul className="space-y-2" lang={karte.lang} aria-busy={karte.kann === null || undefined}>
                                    {karte.kann
                                        ? karte.kann.map((f) => (
                                              <li key={f} className="flex items-start gap-2 text-[0.84rem] font-medium leading-snug">
                                                  <Check className="mt-0.5 w-4 h-4 flex-shrink-0" style={{ color: 'var(--kunde-akzent)' }} strokeWidth={3} aria-hidden="true" />
                                                  <span>{f}</span>
                                              </li>
                                          ))
                                        : [0.82, 0.7, 0.76].map((b, i) => (
                                              <li key={i} className="flex items-center gap-2 h-[1.155rem]" data-laedt="">
                                                  <Check className="w-4 h-4 flex-shrink-0 opacity-40" style={{ color: 'var(--kunde-akzent)' }} strokeWidth={3} aria-hidden="true" />
                                                  <span className="h-2.5 rounded-full bg-black/[0.08] dark:bg-white/[0.1] motion-safe:animate-pulse" style={{ width: `${b * 100}%` }} />
                                              </li>
                                          ))}
                                </ul>
                                {/* Spiegel der Sprachwahl im Formular: klickbar, aber nicht doppelt für Tastatur/Screenreader */}
                                <div className={`mt-4 ${styles.segment}`} aria-hidden="true">
                                    {SPRACH_WAHL.map((s) => (
                                        <button
                                            key={s.wert}
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => onSprache(s.wert)}
                                            className={`flex flex-col items-center justify-center h-9 px-0.5 rounded-[0.6rem] text-[0.62rem] lg:text-[0.68rem] font-semibold leading-none tracking-[-0.015em] whitespace-nowrap transition-colors ${
                                                sprache === s.wert ? styles.segmentAktiv : 'text-[#4a525e] dark:text-[#aab2bd] hover:text-[#111418] dark:hover:text-white'
                                            }`}
                                        >
                                            {s.text}
                                            {s.zusatz && <span className="mt-0.5 text-[0.52rem] lg:text-[0.56rem] font-medium opacity-75">{s.zusatz}</span>}
                                        </button>
                                    ))}
                                </div>
                                <blockquote className="mt-4 rounded-xl px-3.5 py-3 text-[0.8rem] leading-relaxed bg-black/[0.04] dark:bg-white/[0.06]" style={{ boxShadow: 'inset 3px 0 0 var(--kunde-akzent)' }}>
                                    <p lang={sprache === 'englisch' ? 'en' : sprache === 'dialekt_auto' ? 'gsw' : 'de'}>«{karte.begruessung}»</p>
                                </blockquote>
                            </div>
                        </Ansicht>
                    )}

                    {/* Anruf-Phasen (in Firmenfarbe) */}
                    {karte && (
                        <>
                            <Ansicht aktiv={zustand === 'wartend'} className={`${styles.kundenFlaeche} items-center justify-center text-center px-6`}>
                                <span className="relative flex items-center justify-center w-28 h-28" style={{ color: karte.text }}>
                                    <span className={styles.ringe} aria-hidden="true">
                                        <span />
                                        <span />
                                        <span />
                                    </span>
                                    <LogoOderInitiale karte={karte} gross />
                                </span>
                                <p className="mt-6 text-xl font-semibold">{karte.name}</p>
                                <p className="mt-1 text-sm opacity-90">Ihr Assistent wählt gleich …</p>
                            </Ansicht>

                            <Ansicht aktiv={zustand === 'waehlt'} className={`${styles.kundenFlaeche} items-center text-center px-6 pt-16 pb-10`}>
                                <p className="text-sm opacity-85">Anruf von</p>
                                <p className="mt-1 text-[1.6rem] font-semibold tracking-tight tabular-nums whitespace-nowrap">{ANRUF_VON}</p>
                                <p className="mt-1 text-sm opacity-90 line-clamp-1">
                                    {karte.name} · {karte.firma}
                                </p>
                                <span className="relative mt-8 flex items-center justify-center w-28 h-28" style={{ color: karte.text }}>
                                    <span className={styles.ringe} aria-hidden="true">
                                        <span />
                                        <span />
                                        <span />
                                    </span>
                                    <LogoOderInitiale karte={karte} gross />
                                </span>
                                <div className="mt-auto flex w-full justify-between px-4" aria-hidden="true">
                                    <span className="flex flex-col items-center gap-1.5 text-xs opacity-90">
                                        <span className="w-14 h-14 rounded-full bg-[#e5484d] text-white flex items-center justify-center">
                                            <PhoneOff className="w-6 h-6" />
                                        </span>
                                        Ablehnen
                                    </span>
                                    <span className="flex flex-col items-center gap-1.5 text-xs opacity-90">
                                        <span className={`w-14 h-14 rounded-full bg-[#2fb24c] text-white flex items-center justify-center`}>
                                            <Phone className={`w-6 h-6 ${styles.klingeln}`} />
                                        </span>
                                        Annehmen
                                    </span>
                                </div>
                            </Ansicht>

                            <Ansicht aktiv={zustand === 'verbunden'} className={`${styles.kundenFlaeche} items-center text-center px-6 pt-16 pb-10`}>
                                <p className="text-xl font-semibold">{karte.name}</p>
                                <p className="mt-0.5 text-sm opacity-85">{karte.firma}</p>
                                <p className="mt-3 text-[2rem] font-light tabular-nums" aria-label={`Gesprächsdauer ${dauerAnzeige(dauerSek)}`}>
                                    {dauerAnzeige(dauerSek)}
                                </p>
                                <div className="mt-6 w-full" style={{ color: karte.text }}>
                                    <Welle farbe={karte.primaer} modus="sprechen" anzahl={28} hell className="[--welle-hoehe:96px]" />
                                </div>
                                <div className="mt-auto grid grid-cols-3 gap-5" aria-hidden="true">
                                    {[Mic, Grid3x3, Volume2].map((Icon, i) => (
                                        <span key={i} className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                                            <Icon className="w-5 h-5" />
                                        </span>
                                    ))}
                                </div>
                                <span className="mt-5 w-14 h-14 rounded-full bg-[#e5484d] text-white flex items-center justify-center" aria-hidden="true">
                                    <PhoneOff className="w-6 h-6" />
                                </span>
                            </Ansicht>

                            <Ansicht aktiv={zustand === 'beendet'} className="px-5 pt-14 pb-5">
                                <div className="text-center">
                                    <span className="inline-flex mx-auto">
                                        <LogoOderInitiale karte={karte} aufMarke={false} />
                                    </span>
                                    <p className="mt-3 text-lg font-semibold">Anruf beendet</p>
                                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-[#5b6472] dark:text-[#9aa3af] tabular-nums">
                                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                        {dauerAnzeige(dauerSek)} Min.
                                    </p>
                                </div>
                                <div className="mt-5 rounded-2xl bg-white dark:bg-[#1a1f26] p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                                    <p className="text-[0.74rem] font-semibold" style={{ color: 'var(--kunde-akzent)' }}>
                                        Gesprächsnotiz
                                    </p>
                                    <p className="mt-1.5 text-[0.8rem] leading-relaxed line-clamp-[9]">{zusammenfassung ?? ZUSAMMENFASSUNG_FOLGT}</p>
                                </div>
                            </Ansicht>

                            <Ansicht aktiv={zustand === 'fehler'} className="items-center justify-center text-center px-7">
                                <span className="w-14 h-14 rounded-full bg-[#e5484d]/12 text-[#c9353a] flex items-center justify-center" aria-hidden="true">
                                    <PhoneOff className="w-6 h-6" />
                                </span>
                                <p className="mt-4 text-lg font-semibold">{fehlerTitel(fehlerGrund)}</p>
                                <p className="mt-1 text-sm text-[#5b6472] dark:text-[#9aa3af]">
                                    {fehlerGrundText(fehlerGrund)}
                                </p>
                            </Ansicht>
                        </>
                    )}
                                </div>
            </div>
        </figure>
    );
}
