/**
 * Bausteine des Bereichs /ki-telefonassistent (AUFTRAG-110).
 * Reine Server-Komponenten im Stil der Site: Container volle Breite,
 * Fliesstext mit Lesebreite, Karten rounded-2xl bg-card border-border.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Check, ChevronDown, Minus, Phone, PhoneCall, type LucideIcon } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Brotkrumen, type Krume } from './Brotkrumen';
import { Aktualisiert } from './Aktualisiert';
import { InEntwicklungBadge, MitHinweis } from './InEntwicklung';
import { MitKiAnbieterLink } from './KiAnbieter';
import { KI_BASIS } from './seiten';
import { ANFRAGE_HREF, ANFRAGE_TEXTE } from '@/lib/ki-anfrage';

/* ------------------------------------------------------------------ */
/* Seitenkopf der Unterseiten                                          */
/* ------------------------------------------------------------------ */

export function SeitenKopf({
    pfad,
    krumen,
    eyebrow,
    titel,
    lead,
    aside,
    aktionen = true,
    unterLead,
    hinweis,
}: {
    /** [01.11.2026] AUFTRAG-116: Pfad der Seite ab Domain — für «Aktualisiert am …» rechts in der Brotkrumen-Zeile */
    pfad: string;
    krumen: Krume[];
    eyebrow: string;
    /** AUFTRAG-113: z. B. Badge «In Entwicklung, kommt bald» neben der Eyebrow (Titelbereich) */
    hinweis?: ReactNode;
    titel: ReactNode;
    /** beantwortet die Frage des Suchenden in den ersten zwei Sätzen */
    lead: ReactNode;
    aside?: ReactNode;
    aktionen?: boolean;
    unterLead?: ReactNode;
}) {
    return (
        <section className="relative overflow-clip pt-8 pb-14 sm:pt-10 lg:pt-12 lg:pb-20">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-background to-background" />
                <div className="absolute -top-56 right-[-15%] w-[48rem] h-[48rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_12%,transparent),transparent)]" />
            </div>
            <div className="container mx-auto px-4 relative">
                {/* [01.11.2026] AUFTRAG-116: Brotkrumen (Markup unverändert) und rechts «Aktualisiert am …» in einer Zeile */}
                <div className="mb-8 lg:mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                    <Brotkrumen krumen={krumen} />
                    <Aktualisiert pfad={pfad} />
                </div>
                <div className={cn('grid gap-10 lg:gap-14', aside && 'lg:grid-cols-12 lg:items-center')}>
                    <div className={cn(aside && 'lg:col-span-7')}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <p className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary">
                                <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                                {eyebrow}
                            </p>
                            {hinweis}
                        </div>
                        <h1 className="mt-4 text-[2.1rem] leading-[1.08] sm:text-5xl lg:text-[3.25rem] font-bold tracking-[-0.03em] text-text-primary text-balance">
                            {titel}
                        </h1>
                        <div className="mt-5 text-lg md:text-xl text-text-secondary leading-relaxed max-w-[42rem] space-y-4">{lead}</div>
                        {unterLead}
                        {aktionen && <AktionenStandard className="mt-8" />}
                    </div>
                    {aside && <div className="lg:col-span-5 min-w-0">{aside}</div>}
                </div>
            </div>
        </section>
    );
}

/**
 * «Live testen» + «Assistent anfragen» (roter Faden zum Live-Test).
 * [31.10.2026] AUFTRAG-114: zweiter Knopf statt «Beratung vereinbaren» (/kontakt) jetzt «Assistent anfragen»
 * auf das Formular #anfrage — natives <a> wegen des Hashs (Next-<Link> löst kein hashchange aus).
 * `anfrageHref`: auf Seiten mit eigenem Formular «#anfrage», sonst die Hub-Seite.
 */
export function AktionenStandard({ className = '', hell = false, anfrageHref = ANFRAGE_HREF }: { className?: string; hell?: boolean; anfrageHref?: string }) {
    return (
        <div className={cn('flex flex-col sm:flex-row gap-3 sm:gap-4', className)}>
            <Button variant="primary" size="lg" className={cn('px-7', hell && 'bg-white text-[#14361a] hover:bg-white/90 shadow-none')} asChild>
                <Link href={KI_BASIS}>
                    <PhoneCall className="w-5 h-5" aria-hidden="true" />
                    Jetzt live testen
                </Link>
            </Button>
            <Button variant="outline" size="lg" className={cn('px-7', hell && 'border-white text-white hover:bg-white hover:text-[#14361a]')} asChild>
                <a href={anfrageHref} data-anfrage-knopf="">
                    {ANFRAGE_TEXTE.cta}
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </a>
            </Button>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Abschnitt mit Überschrift                                           */
/* ------------------------------------------------------------------ */

export function Abschnitt({
    id,
    titel,
    intro,
    hintergrund = 'background',
    children,
    className = '',
    kopfRechts,
}: {
    id?: string;
    titel: ReactNode;
    intro?: ReactNode;
    hintergrund?: 'background' | 'surface';
    children?: ReactNode;
    className?: string;
    kopfRechts?: ReactNode;
}) {
    return (
        <section id={id} className={cn('py-16 lg:py-24 scroll-mt-24', hintergrund === 'surface' ? 'bg-surface' : 'bg-background', className)}>
            <div className="container mx-auto px-4">
                <AnimatedSection animation="slideUp" className={cn('mb-10 lg:mb-12', kopfRechts && 'flex flex-col gap-5 md:flex-row md:items-end md:justify-between')}>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary text-balance">{titel}</h2>
                        {intro && <div className="mt-4 text-lg text-text-secondary leading-relaxed max-w-3xl space-y-4">{intro}</div>}
                    </div>
                    {kopfRechts}
                </AnimatedSection>
                {children}
            </div>
        </section>
    );
}

/** Fliesstext-Block mit Lesebreite */
export function Prosa({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={cn('max-w-3xl text-lg text-text-secondary leading-relaxed space-y-5 [&_strong]:text-text-primary [&_a]:text-text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary', className)}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Karten                                                              */
/* ------------------------------------------------------------------ */

export function IconKachel({ icon: Icon, titel, children, href, linkText }: { icon: LucideIcon; titel: string; children: ReactNode; href?: string; linkText?: string }) {
    const inhalt = (
        <>
            <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5" aria-hidden="true">
                <Icon className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-text-primary mb-2 leading-snug">{titel}</h3>
            <div className="text-text-secondary leading-relaxed text-[0.975rem]">{children}</div>
            {href && (
                <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-hover dark:text-primary">
                    {linkText ?? 'Mehr erfahren'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                </span>
            )}
        </>
    );
    const klasse = 'group h-full flex flex-col p-6 rounded-2xl bg-card border border-border transition-colors';
    return href ? (
        <Link href={href} className={cn(klasse, 'hover:border-primary/50')}>
            {inhalt}
        </Link>
    ) : (
        <div className={klasse}>{inhalt}</div>
    );
}

export interface LinkKarte {
    titel: string;
    text: string;
    href: string;
    icon?: LucideIcon;
}

/** Interne Verlinkung: «Weiterlesen» mit Karten */
export function Querverweise({ titel = 'Weiterlesen', links, hintergrund = 'surface' }: { titel?: string; links: LinkKarte[]; hintergrund?: 'background' | 'surface' }) {
    return (
        <Abschnitt titel={titel} hintergrund={hintergrund}>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {links.map((l) => (
                    <li key={l.href}>
                        <Link href={l.href} className="group h-full flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                            {l.icon && (
                                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center" aria-hidden="true">
                                    <l.icon className="w-5 h-5" />
                                </span>
                            )}
                            <span className="min-w-0">
                                <span className="flex items-center gap-1.5 font-semibold text-text-primary group-hover:text-primary">
                                    {l.titel}
                                    <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                                </span>
                                <span className="mt-1 block text-sm text-text-secondary leading-relaxed">{l.text}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Abschnitt>
    );
}

/* ------------------------------------------------------------------ */
/* Schrittfolge                                                        */
/* ------------------------------------------------------------------ */

export interface Schritt {
    titel: string;
    text: ReactNode;
    icon?: LucideIcon;
    id?: string;
}

export function Schrittfolge({ schritte, spalten = 4 }: { schritte: Schritt[]; spalten?: 3 | 4 }) {
    return (
        <ol className={cn('grid gap-px rounded-3xl overflow-hidden border border-border bg-border', spalten === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3')}>
            {schritte.map((s, i) => (
                <li key={s.titel} id={s.id} className="bg-card p-6 lg:p-8 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm" aria-hidden="true">
                            {i + 1}
                        </span>
                        {s.icon && <s.icon className="w-5 h-5 text-primary" aria-hidden="true" />}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                        <span className="sr-only">Schritt {i + 1}: </span>
                        {s.titel}
                    </h3>
                    <div className="text-text-secondary leading-relaxed">{s.text}</div>
                </li>
            ))}
        </ol>
    );
}

/* ------------------------------------------------------------------ */
/* Ohne / Mit Assistent                                                */
/* ------------------------------------------------------------------ */

export function OhneMit({ zeilen }: { zeilen: Array<{ thema: string; ohne: string; mit: string; inEntwicklung?: boolean }> }) {
    return (
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="hidden md:grid md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-border bg-surface/60 text-sm font-semibold text-text-secondary">
                <div className="px-6 py-4">Situation</div>
                <div className="px-6 py-4">Ohne Assistent</div>
                <div className="px-6 py-4 text-primary-hover dark:text-primary">Mit Assistent</div>
            </div>
            <ul className="divide-y divide-border">
                {zeilen.map((z) => (
                    <li key={z.thema} className="grid md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
                        <p className="px-5 pt-5 md:px-6 md:py-5 font-semibold text-text-primary">{z.thema}</p>
                        <p className="px-5 pt-3 md:px-6 md:py-5 flex gap-3 text-text-secondary leading-relaxed">
                            <Minus className="w-5 h-5 mt-0.5 flex-shrink-0 text-text-secondary/70" aria-hidden="true" />
                            <span>
                                <span className="md:sr-only font-semibold text-text-primary">Ohne: </span>
                                {z.ohne}
                            </span>
                        </p>
                        <p className="px-5 pt-3 pb-5 md:px-6 md:py-5 flex gap-3 text-text-primary leading-relaxed md:bg-primary/[0.04]">
                            <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
                            <span>
                                <span className="md:sr-only font-semibold">Mit: </span>
                                {z.mit}
                                {/* AUFTRAG-113/114: Badge nur noch für den Kalendereintrag */}
                                {z.inEntwicklung && (
                                    <>
                                        {' '}
                                        <InEntwicklungBadge className="ml-1" />
                                    </>
                                )}
                            </span>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Häufige Fragen (natives details/summary, ohne JavaScript bedienbar) */
/* ------------------------------------------------------------------ */

export interface FaqEintrag {
    id: string;
    frage: string;
    /** Klartext (geht 1:1 ins FAQPage-JSON-LD) */
    antwort: string;
    link?: { text: string; href: string };
}

export function FaqListe({ eintraege, zweispaltig = true }: { eintraege: FaqEintrag[]; zweispaltig?: boolean }) {
    return (
        <div className={cn('grid gap-4 lg:items-start', zweispaltig && 'lg:grid-cols-2')}>
            {eintraege.map((f) => (
                <details key={f.id} id={`frage-${f.id}`} className="group rounded-2xl border border-border bg-card open:border-primary/40 scroll-mt-24">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
                        <h3 className="text-base font-semibold">{f.frage}</h3>
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-primary transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                    </summary>
                    <div className="px-5 pb-5 -mt-1 text-text-secondary leading-relaxed">
                        {/* AUFTRAG-114: «Datenschutzerklärung» im KI-Anbieter-Satz verlinkt (JSON-LD bleibt Klartext) */}
                        <p>
                            <MitKiAnbieterLink text={f.antwort} />
                        </p>
                        {f.link && (
                            <Link href={f.link.href} className="mt-3 inline-flex items-center gap-1.5 font-semibold text-text-primary underline underline-offset-4 decoration-primary hover:decoration-2">
                                {f.link.text}
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                        )}
                    </div>
                </details>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Abschluss-CTA                                                       */
/* ------------------------------------------------------------------ */

export function AbschlussCta({
    titel = 'Hören Sie selbst, wie Ihr Assistent klingt',
    text = 'Geben Sie Ihre Website ein und lassen Sie sich anrufen – kostenlos und ohne Anmeldung. Oder besprechen Sie Ihren Betrieb direkt mit uns.',
    liveHref = KI_BASIS,
    anfrageHref = ANFRAGE_HREF,
}: {
    titel?: string;
    text?: string;
    /** auf der Hub-Seite ein nativer Anker zum Widget (#live-test) */
    liveHref?: string;
    /** AUFTRAG-114: Formular «Assistent anfragen»; auf Seiten mit eigenem Formular «#anfrage» */
    anfrageHref?: string;
}) {
    const istAnker = liveHref.startsWith('#');
    return (
        <section className="py-16 lg:py-20 bg-primary">
            <div className="container mx-auto px-4 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-balance">{titel}</h2>
                <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">{text}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="secondary" size="lg" className="bg-white text-primary-hover hover:bg-white/90 border-0" asChild>
                        {istAnker ? (
                            <a href={liveHref}>
                                <PhoneCall className="w-5 h-5" aria-hidden="true" />
                                Jetzt live testen
                            </a>
                        ) : (
                            <Link href={liveHref}>
                                <PhoneCall className="w-5 h-5" aria-hidden="true" />
                                Jetzt live testen
                            </Link>
                        )}
                    </Button>
                    {/* AUFTRAG-114: «Assistent anfragen» statt «Beratung vereinbaren»; natives <a> wegen des Hashs */}
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-hover" asChild>
                        <a href={anfrageHref} data-anfrage-knopf="">
                            {ANFRAGE_TEXTE.cta}
                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </a>
                    </Button>
                    <Button variant="outline" size="lg" className="border-white/60 text-white hover:bg-white hover:text-primary-hover" asChild>
                        <a href="tel:+41522221818">
                            <Phone className="w-5 h-5" aria-hidden="true" />
                            052 222 18 18
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Gesprächsnotiz (schematisch, keine Bildschirmkopie)                  */
/* ------------------------------------------------------------------ */

export function NotizKarte({ titel = 'Gesprächsnotiz per E-Mail', felder, fuss }: { titel?: string; felder: Array<{ label: string; wert: string }>; fuss?: string }) {
    return (
        <figure className="rounded-2xl border border-border bg-card overflow-hidden">
            <figcaption className="flex items-center gap-2 px-5 py-3 border-b border-border bg-surface/60 text-sm font-semibold text-text-primary">
                <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                {titel}
                <span className="ml-auto text-xs font-medium text-text-secondary">Schema</span>
            </figcaption>
            <dl className="divide-y divide-border">
                {felder.map((f) => (
                    <div key={f.label} className="grid grid-cols-[8.75rem_minmax(0,1fr)] gap-3 px-5 py-3 text-sm">
                        <dt className="text-text-secondary">{f.label}</dt>
                        <dd className="text-text-primary">{f.wert}</dd>
                    </div>
                ))}
            </dl>
            {fuss && <p className="px-5 py-3 border-t border-border text-xs text-text-secondary">{fuss}</p>}
        </figure>
    );
}

/* ------------------------------------------------------------------ */
/* Häkchenliste                                                        */
/* ------------------------------------------------------------------ */

export function Hakenliste({ punkte, spalten = 1 }: { punkte: ReactNode[]; spalten?: 1 | 2 | 3 }) {
    return (
        <ul className={cn('grid gap-x-8 gap-y-3', spalten === 2 && 'sm:grid-cols-2', spalten === 3 && 'sm:grid-cols-2 lg:grid-cols-3')}>
            {punkte.map((p, i) => (
                <li key={i} className="flex gap-3 text-text-secondary leading-relaxed">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span>{typeof p === 'string' ? <MitHinweis text={p} /> : p}</span>
                </li>
            ))}
        </ul>
    );
}
