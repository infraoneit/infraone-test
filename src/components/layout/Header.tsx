'use client';

/**
 * Header mit schlichten Dropdowns (AUFTRAG-113, Kompromiss zwischen Live-Stand und AUFTRAG-100/110).
 *
 * Desktop (ab lg): Leistungen ▾ · KI-Telefonassistent ▾ (Badge «Neu») · IT-Support · Cloud-Telefonie ▾
 * · Unternehmen ▾. Jedes Dropdown liegt direkt unter seinem Knopf (höchstens zwei schmale Spalten,
 * keine Panels über die ganze Breite, kein Schleier, keine Beschreibungen oder Karten).
 * [31.10.2026] AUFTRAG-114: Einträge in Dropdowns und im mobilen Akkordeon mit Icon (16 px, vor dem Text,
 * aria-hidden); die Leistenknöpfe selbst bleiben ohne Icon. Zuordnung Name → Komponente in NAV_ICONS.
 * «Cloud-Telefonie» bleibt wie live ein Link auf /cloud-telefonie; das Dropdown öffnet per Hover,
 * über den Pfeil-Knopf daneben oder mit Pfeil runter.
 * Bedienung (wie AUFTRAG-100): Hover nur mit der Maus und kurzer Absicht-Verzögerung, Klick/Enter/
 * Leertaste schaltet, Pfeil runter öffnet und springt auf den ersten Link, Escape schliesst und gibt
 * den Fokus zurück, Verlassen (Maus oder Fokus) schliesst. Keine Fokusfalle. Alle Dropdowns bleiben
 * im DOM (Links für Crawler), geschlossen sind sie unsichtbar.
 *
 * Mobil: Vollbild-Overlay mit Akkordeon in derselben Reihenfolge wie die Leiste, darunter wie bisher
 * die Hervorhebung «KI-Anruf testen» und der CTA.
 */
import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight,
    AudioLines,
    Building2,
    ChevronDown,
    CircleHelp,
    Cloud,
    Code,
    Handshake,
    Headset,
    Languages,
    LayoutGrid,
    ListChecks,
    Mail,
    Menu,
    Newspaper,
    Palette,
    Phone,
    PhoneCall,
    PhoneForwarded,
    Router,
    Server,
    ShieldCheck,
    Tag,
    Tv,
    Users,
    Video,
    Wifi,
    Workflow,
    X,
    type LucideIcon,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import styles from './Header.module.css';
import {
    aktivePanelId,
    CLOUD_TELEFONIE,
    CLOUD_TELEFONIE_HREF,
    ERSTGESPRAECH,
    IT_SUPPORT,
    KI_KARTE,
    KI_MENUE,
    LEISTUNGEN,
    LEISTUNGEN_UEBERSICHT,
    NEU,
    pfadVon,
    UNTERNEHMEN,
    type NavGruppe,
    type NavIconName,
    type NavLink,
    type PanelId,
} from './navigation';

/**
 * AUFTRAG-114: Icon-Name (navigation.ts) → lucide-Komponente. Bewusst ein explizites Objekt
 * (kein `import * as`), damit nur diese Icons im Bundle landen; Record<NavIconName, …> erzwingt,
 * dass jeder in navigation.ts zulässige Name hier eine Komponente hat.
 */
const NAV_ICONS: Record<NavIconName, LucideIcon> = {
    Headset,
    Server,
    ShieldCheck,
    Cloud,
    Wifi,
    Video,
    Phone,
    AudioLines,
    Palette,
    Tv,
    Code,
    ListChecks,
    Workflow,
    Languages,
    Tag,
    LayoutGrid,
    Building2,
    CircleHelp,
    PhoneForwarded,
    Users,
    Router,
    Handshake,
    Newspaper,
    Mail,
    PhoneCall,
};

/** Icon vor einem Menüeintrag: 16 px, gedämpftes Grün, beim Überfahren volles Grün (AUFTRAG-114) */
function NavIcon({ name, className = 'text-primary/70 group-hover:text-primary' }: { name?: NavIconName; className?: string }) {
    if (!name) return null;
    const Icon = NAV_ICONS[name];
    return <Icon data-nav-icon={name} className={cn('h-4 w-4 flex-shrink-0 transition-colors', className)} aria-hidden="true" />;
}

/** Absicht beim Hovern: kurz warten, bevor ein Dropdown aufgeht bzw. zugeht */
const OEFFNEN_MS = 80;
const SCHLIESSEN_MS = 180;

/** Balkenhöhen der kleinen Wellenform in der KI-Karte (nur mobil) */
const WELLE = [0.35, 0.6, 0.85, 0.5, 0.95, 0.7, 0.4, 0.8, 1, 0.65, 0.45, 0.9, 0.55, 0.75, 0.4, 0.85, 0.6, 0.3];

/** Badge «Neu» (Leistenknopf, Leistungs-Eintrag, mobiles Akkordeon) */
function NeuBadge({ className = '' }: { className?: string }) {
    return (
        <span
            data-badge="neu"
            className={cn('rounded-full border border-primary/40 bg-primary/10 px-1.5 py-px text-[0.6875rem] font-semibold leading-4 text-primary-hover dark:text-primary', className)}
        >
            {NEU}
        </span>
    );
}

export function Header() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [offen, setOffen] = useState<PanelId | null>(null);
    const [mobilOffen, setMobilOffen] = useState(false);
    const [mobilGruppe, setMobilGruppe] = useState<PanelId | null>(null);

    const navRef = useRef<HTMLElement>(null);
    const oeffnenTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const schliessenTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const zeigerArt = useRef<string>('mouse');

    // Routenwechsel: alles schliessen (abgeleiteter Zustand statt Effekt)
    const [letzterPfad, setLetzterPfad] = useState(pathname);
    if (pathname !== letzterPfad) {
        setLetzterPfad(pathname);
        setOffen(null);
        setMobilOffen(false);
        setMobilGruppe(null);
    }

    useEffect(() => {
        const beimScrollen = () => setIsScrolled(window.scrollY > 20);
        beimScrollen();
        window.addEventListener('scroll', beimScrollen, { passive: true });
        return () => window.removeEventListener('scroll', beimScrollen);
    }, []);

    // Mobil: Seite hinter dem Overlay festhalten und beim Schliessen an dieselbe Stelle zurück
    useEffect(() => {
        if (!mobilOffen) return;
        const y = window.scrollY;
        const stil = document.body.style;
        stil.position = 'fixed';
        stil.top = `-${y}px`;
        stil.width = '100%';
        document.body.classList.add('mobile-menu-open');
        const taste = (e: globalThis.KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setMobilOffen(false);
            document.getElementById('nav-mobil-knopf')?.focus();
        };
        document.addEventListener('keydown', taste);
        return () => {
            document.removeEventListener('keydown', taste);
            document.body.classList.remove('mobile-menu-open');
            stil.position = '';
            stil.top = '';
            stil.width = '';
            window.scrollTo(0, y);
        };
    }, [mobilOffen]);

    // Desktop: Klick ausserhalb und Escape schliessen das offene Dropdown
    useEffect(() => {
        if (!offen) return;
        const aussen = (e: globalThis.PointerEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) setOffen(null);
        };
        const taste = (e: globalThis.KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            const fokusImMenue = !!navRef.current?.contains(document.activeElement);
            setOffen(null);
            if (fokusImMenue) document.getElementById(`nav-knopf-${offen}`)?.focus();
        };
        document.addEventListener('pointerdown', aussen);
        document.addEventListener('keydown', taste);
        return () => {
            document.removeEventListener('pointerdown', aussen);
            document.removeEventListener('keydown', taste);
        };
    }, [offen]);

    useEffect(
        () => () => {
            clearTimeout(oeffnenTimer.current);
            clearTimeout(schliessenTimer.current);
        },
        [],
    );

    /* ---------- Steuerung Desktop ---------- */

    const timerStopp = () => {
        clearTimeout(oeffnenTimer.current);
        clearTimeout(schliessenTimer.current);
    };

    const mausRein = (id: PanelId | null) => (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        timerStopp();
        if (id === null) {
            // Direktlink: offenes Dropdown nach kurzer Zeit schliessen
            schliessenTimer.current = setTimeout(() => setOffen(null), SCHLIESSEN_MS);
            return;
        }
        if (offen) setOffen(id);
        else oeffnenTimer.current = setTimeout(() => setOffen(id), OEFFNEN_MS);
    };

    const mausRaus = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        timerStopp();
        schliessenTimer.current = setTimeout(() => setOffen(null), SCHLIESSEN_MS);
    };

    const knopfKlick = (id: PanelId) => (e: MouseEvent) => {
        timerStopp();
        // Tastatur (Enter/Leertaste) und Touch schalten um; die Maus öffnet (das Dropdown ist meist schon per Hover offen)
        if (e.detail === 0 || zeigerArt.current === 'touch') setOffen((o) => (o === id ? null : id));
        else setOffen(id);
    };

    const knopfTaste = (id: PanelId) => (e: KeyboardEvent) => {
        if (e.key !== 'ArrowDown') return;
        e.preventDefault();
        timerStopp();
        setOffen(id);
        requestAnimationFrame(() => document.querySelector<HTMLElement>(`#nav-panel-${id} a`)?.focus());
    };

    // Fokus verlässt den Menüpunkt (Tab weiter) → schliessen; ohne Ziel (Klick ins Leere) nicht
    const fokusRaus = (id: PanelId) => (e: FocusEvent<HTMLElement>) => {
        const ziel = e.relatedTarget as Node | null;
        if (ziel && !e.currentTarget.contains(ziel)) setOffen((o) => (o === id ? null : o));
    };

    const schliessen = () => {
        timerStopp();
        setOffen(null);
    };

    const aktiv = aktivePanelId(pathname);
    const istAktuell = (href: string) => (href.includes('#') ? false : pfadVon(href) === pathname);

    /* ---------- Bausteine Desktop ---------- */

    const dropdownLink = (l: NavLink) => (
        <Link
            href={l.href}
            onClick={schliessen}
            aria-current={istAktuell(l.href) ? 'page' : undefined}
            className="group flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-text-primary transition-colors hover:bg-surface hover:text-primary focus-visible:bg-surface aria-[current=page]:bg-surface aria-[current=page]:text-primary-hover dark:aria-[current=page]:text-primary"
        >
            <NavIcon name={l.icon} />
            {l.titel}
            {l.badge && <NeuBadge />}
        </Link>
    );

    const huelle = (inhalt: ReactNode, breite: string) => (
        <div className={cn('rounded-2xl border border-border bg-card p-2 shadow-[0_24px_44px_-24px_rgba(10,18,10,0.45)] dark:shadow-[0_24px_44px_-20px_rgba(0,0,0,0.8)]', breite)}>{inhalt}</div>
    );

    const zweiSpalten = (gruppen: NavGruppe[]) => (
        <div className="grid grid-cols-2 gap-x-2">
            {gruppen.map((g) => (
                <div key={g.id} className="min-w-0">
                    <p id={`nav-gruppe-${g.id}`} className="px-3 pb-1 pt-1.5 text-[0.8125rem] font-semibold text-text-secondary">
                        {g.titel}
                    </p>
                    <ul aria-labelledby={`nav-gruppe-${g.id}`}>
                        {g.links.map((l) => (
                            <li key={l.href}>{dropdownLink(l)}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );

    const eineSpalte = (links: NavLink[]) => (
        <ul>
            {links.map((l) => (
                <li key={l.href}>{dropdownLink(l)}</li>
            ))}
        </ul>
    );

    const fussLink = (l: NavLink) => (
        <div className="mt-1 border-t border-border pt-1">
            <Link href={l.href} onClick={schliessen} className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface hover:text-primary">
                {l.titel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
        </div>
    );

    const dropdownLeistungen = huelle(
        <>
            {zweiSpalten(LEISTUNGEN)}
            {fussLink(LEISTUNGEN_UEBERSICHT)}
        </>,
        // AUFTRAG-114: breiter wegen der Icons (Einträge bleiben einzeilig), weiterhin ≤ 640 px
        'w-[36rem]',
    );

    // AUFTRAG-113: «KI-Anruf testen» als schmaler Knopf in der Fusszeile, keine grosse Karte
    const dropdownKi = huelle(
        <>
            {zweiSpalten(KI_MENUE)}
            <div className="mt-1 border-t border-border px-1 pb-1 pt-2">
                <Link
                    href={KI_KARTE.href}
                    onClick={schliessen}
                    data-ki-anruf-testen=""
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                    <NavIcon name={KI_KARTE.icon} className="text-white" />
                    {KI_KARTE.titel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                </Link>
            </div>
        </>,
        // AUFTRAG-114: breiter wegen der Icons, weiterhin ≤ 640 px
        'w-[34rem]',
    );

    const dropdownCloud = huelle(eineSpalte(CLOUD_TELEFONIE), 'w-72');
    const dropdownUnternehmen = huelle(eineSpalte(UNTERNEHMEN), 'w-56');

    const knopfKlasse = (id: PanelId) =>
        cn(
            'flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[0.875rem] font-medium text-text-primary transition-colors hover:bg-surface hover:text-primary xl:px-3.5 xl:text-[0.9375rem]',
            (offen === id || aktiv === id) && 'text-primary-hover dark:text-primary',
            offen === id && 'bg-surface',
        );

    const pfeil = (id: PanelId) => <ChevronDown className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-200 motion-reduce:transition-none', offen === id && 'rotate-180')} aria-hidden="true" />;

    /**
     * Leistenknopf mit Dropdown; mit `href` als Link plus Pfeil-Knopf (Cloud-Telefonie wie live).
     * `kurz`: Beschriftung bei 1024 px (unter xl), damit die Leiste mit Abstand in eine Zeile passt.
     */
    const ausloeser = (id: PanelId, titel: string, inhalt: ReactNode, { badge = false, href, kurz }: { badge?: boolean; href?: string; kurz?: string } = {}) => (
        <li data-leiste={titel} className="relative flex items-center" onPointerEnter={mausRein(id)} onPointerLeave={mausRaus} onBlur={fokusRaus(id)}>
            {href ? (
                <div className={cn('flex h-10 items-center rounded-lg', offen === id && 'bg-surface')}>
                    <Link
                        id={`nav-link-${id}`}
                        href={href}
                        onClick={schliessen}
                        onKeyDown={knopfTaste(id)}
                        aria-current={pathname === href ? 'page' : undefined}
                        className={cn(knopfKlasse(id), 'rounded-r-none pr-1.5 xl:pr-1.5', offen === id && 'bg-transparent')}
                    >
                        {titel}
                    </Link>
                    <button
                        id={`nav-knopf-${id}`}
                        type="button"
                        aria-expanded={offen === id}
                        aria-controls={`nav-panel-${id}`}
                        aria-label={`Untermenü ${titel}`}
                        onPointerDown={(e) => {
                            zeigerArt.current = e.pointerType;
                        }}
                        onClick={knopfKlick(id)}
                        onKeyDown={knopfTaste(id)}
                        className={cn(
                            styles.pfeilKnopf,
                            'flex h-10 w-7 items-center justify-center rounded-lg rounded-l-none text-text-primary transition-colors hover:bg-surface hover:text-primary xl:w-8',
                            (offen === id || aktiv === id) && 'text-primary-hover dark:text-primary',
                        )}
                    >
                        {pfeil(id)}
                    </button>
                </div>
            ) : (
                <button
                    id={`nav-knopf-${id}`}
                    type="button"
                    aria-expanded={offen === id}
                    aria-controls={`nav-panel-${id}`}
                    onPointerDown={(e) => {
                        zeigerArt.current = e.pointerType;
                    }}
                    onClick={knopfKlick(id)}
                    onKeyDown={knopfTaste(id)}
                    className={knopfKlasse(id)}
                >
                    {kurz ? (
                        <>
                            <span className="xl:hidden">{kurz}</span>
                            <span className="hidden xl:inline">{titel}</span>
                        </>
                    ) : (
                        titel
                    )}
                    {badge && <NeuBadge />}
                    {pfeil(id)}
                </button>
            )}
            <div id={`nav-panel-${id}`} className={styles.dropdown} data-offen={offen === id}>
                {inhalt}
            </div>
        </li>
    );

    /* ---------- Mobil ---------- */

    const mobilSchliessen = () => setMobilOffen(false);

    const mobilAkkordeon = (id: PanelId, titel: string, inhalt: ReactNode, badge = false) => {
        const auf = mobilGruppe === id;
        return (
            <>
                <button
                    type="button"
                    id={`nav-mobil-knopf-${id}`}
                    aria-expanded={auf}
                    aria-controls={`nav-mobil-${id}`}
                    onClick={() => setMobilGruppe((g) => (g === id ? null : id))}
                    className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-lg font-semibold text-text-primary"
                >
                    <span className="flex items-center gap-2">
                        {titel}
                        {badge && <NeuBadge />}
                    </span>
                    <ChevronDown className={cn('h-5 w-5 flex-shrink-0 text-text-secondary transition-transform duration-200 motion-reduce:transition-none', auf && 'rotate-180 text-primary')} aria-hidden="true" />
                </button>
                <div id={`nav-mobil-${id}`} className={styles.akkordeon} data-offen={auf}>
                    <div>{inhalt}</div>
                </div>
            </>
        );
    };

    const mobilLink = (l: NavLink) => (
        <Link
            href={l.href}
            onClick={mobilSchliessen}
            aria-current={istAktuell(l.href) ? 'page' : undefined}
            className="group flex min-h-12 items-center gap-2 rounded-xl px-3 py-1.5 text-base font-medium text-text-primary transition-colors hover:bg-surface aria-[current=page]:bg-surface aria-[current=page]:text-primary-hover dark:aria-[current=page]:text-primary"
        >
            <NavIcon name={l.icon} />
            <span className="min-w-0">{l.titel}</span>
            {l.badge && <NeuBadge />}
        </Link>
    );

    const mobilGruppen = (gruppen: NavGruppe[], fuss?: NavLink) => (
        <div className="space-y-4 pb-5">
            {gruppen.map((g) => (
                <div key={g.id}>
                    <p id={`nav-mobil-gruppe-${g.id}`} className="px-3 pb-1 text-sm font-semibold text-text-secondary">
                        {g.titel}
                    </p>
                    <ul aria-labelledby={`nav-mobil-gruppe-${g.id}`}>
                        {g.links.map((l) => (
                            <li key={l.href}>{mobilLink(l)}</li>
                        ))}
                    </ul>
                </div>
            ))}
            {fuss && (
                <Link href={fuss.href} onClick={mobilSchliessen} className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-semibold text-primary-hover dark:text-primary">
                    {fuss.titel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            )}
        </div>
    );

    const mobilListe = (links: NavLink[]) => (
        <ul className="pb-5">
            {links.map((l) => (
                <li key={l.href}>{mobilLink(l)}</li>
            ))}
        </ul>
    );

    const kiKarte = (
        <Link href={KI_KARTE.href} onClick={mobilSchliessen} className={cn(styles.kiKarte, 'group relative flex flex-col overflow-hidden rounded-2xl p-5 text-white')}>
            <span className={styles.welle} aria-hidden="true">
                {WELLE.map((h, i) => (
                    <span key={i} style={{ '--h': h, '--i': i } as CSSProperties} />
                ))}
            </span>
            <span className="mt-4 text-lg font-bold leading-tight">{KI_KARTE.titel}</span>
            <span className="mt-1 text-sm leading-snug text-white/80">{KI_KARTE.text}</span>
            <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#14361a]">
                {KI_KARTE.aktion}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </span>
        </Link>
    );

    const kopfLeiste = isScrolled && !mobilOffen;

    return (
        <>
            {/* Top Bar */}
            <div className="hidden lg:block bg-primary text-white py-2">
                <div className="container mx-auto px-4 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-6">
                        <a href="tel:+41522221818" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Phone className="w-4 h-4" />
                            <span>052 222 18 18</span>
                        </a>
                        <a href="mailto:info@infraone.ch" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Mail className="w-4 h-4" />
                            <span>info@infraone.ch</span>
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Mo-Fr 8:00-17:00</span>
                        <span className="text-primary-light">|</span>
                        <span className="font-semibold">Antwort innert einem Arbeitstag</span>
                    </div>
                </div>
            </div>

            {/* Main Header - Fixed positioning for reliable sticky behavior */}
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color] duration-200',
                    kopfLeiste ? 'bg-background/95 backdrop-blur-lg shadow-lg border-b border-border' : 'bg-background',
                )}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo - Show dark logo in light mode, light logo in dark mode */}
                        {/* [01.11.2026] AUFTRAG-116: Ankertext für den Logo-Link (Link-Checker: «link without anchor text») */}
                        <Link href="/" aria-label="InfraOne IT Solutions – Startseite" className="relative z-[110] flex-shrink-0" onPointerEnter={mausRein(null)}>
                            {/* AUFTRAG-100: width/height im echten Seitenverhältnis der SVGs (viewBox), sonst verschiebt sich die Leiste beim Laden */}
                            <Image
                                src="/infraone-logo-schwarz.svg"
                                alt="InfraOne IT Solutions"
                                width={3638}
                                height={974}
                                className="h-10 lg:h-9 xl:h-12 w-auto dark:hidden"
                                priority
                            />
                            <Image
                                src="/infraone-logo-weiss.svg"
                                alt="InfraOne IT Solutions"
                                width={3637}
                                height={973}
                                className="h-10 lg:h-9 xl:h-12 w-auto hidden dark:block"
                                priority
                            />
                        </Link>

                        {/* Desktop: Leiste mit schlichten Dropdowns (AUFTRAG-113) */}
                        <nav ref={navRef} aria-label="Hauptnavigation" className="hidden lg:block h-full">
                            <ul className="flex h-full items-stretch gap-0 xl:gap-1">
                                {ausloeser('leistungen', 'Leistungen', dropdownLeistungen)}
                                {/* AUFTRAG-113: markant mit Badge «Neu»; bei 1024 px kurz «KI-Assistent» (wie AUFTRAG-110) */}
                                {ausloeser('ki', 'KI-Telefonassistent', dropdownKi, { badge: true, kurz: 'KI-Assistent' })}
                                <li data-leiste={IT_SUPPORT.titel} className="flex items-center" onPointerEnter={mausRein(null)}>
                                    <Link
                                        href={IT_SUPPORT.href}
                                        aria-current={pathname === IT_SUPPORT.href ? 'page' : undefined}
                                        className={cn(
                                            'flex h-10 items-center whitespace-nowrap rounded-lg px-2 text-[0.875rem] font-medium text-text-primary transition-colors hover:bg-surface hover:text-primary xl:px-3.5 xl:text-[0.9375rem]',
                                            aktiv === 'direkt' && 'text-primary-hover dark:text-primary',
                                        )}
                                    >
                                        {IT_SUPPORT.titel}
                                    </Link>
                                </li>
                                {ausloeser('cloud', 'Cloud-Telefonie', dropdownCloud, { href: CLOUD_TELEFONIE_HREF })}
                                {ausloeser('unternehmen', 'Unternehmen', dropdownUnternehmen)}
                            </ul>
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-3" onPointerEnter={mausRein(null)}>
                            <ThemeToggle />
                            <Button variant="primary" size="sm" className="lg:px-3 xl:px-4" asChild>
                                {/* AUFTRAG-110: bei 1024 px kurz, damit die Leiste nicht umbricht */}
                                <Link href={ERSTGESPRAECH.href} aria-label={ERSTGESPRAECH.titel}>
                                    <span className="xl:hidden">Erstgespräch</span>
                                    <span className="hidden xl:inline">{ERSTGESPRAECH.titel}</span>
                                </Link>
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex lg:hidden items-center gap-2 relative z-[110]">
                            <ThemeToggle />
                            <button
                                id="nav-mobil-knopf"
                                type="button"
                                onClick={() => {
                                    // jedes Öffnen beginnt mit zugeklappten Gruppen
                                    if (!mobilOffen) setMobilGruppe(null);
                                    setMobilOffen(!mobilOffen);
                                }}
                                className="p-3 rounded-lg hover:bg-surface transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center text-text-primary"
                                aria-label={mobilOffen ? 'Menü schliessen' : 'Menü öffnen'}
                                aria-expanded={mobilOffen}
                                aria-controls="nav-mobil"
                            >
                                {mobilOffen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobil: Vollbild-Overlay mit Akkordeon (bleibt im DOM, geschlossen unsichtbar) */}
                <div id="nav-mobil" className={cn(styles.mobil, 'lg:hidden')} data-offen={mobilOffen} inert={!mobilOffen}>
                    {/* Scrollbereich beginnt unter der Kopfzeile: Inhalt läuft nicht unter Logo und Schalter */}
                    <div className="absolute inset-x-0 bottom-0 top-[calc(4rem+max(1rem,env(safe-area-inset-top)))] overflow-y-auto overscroll-contain touch-manipulation border-t border-border">
                        <div className="container mx-auto px-5 pb-10 pt-2">
                            <nav aria-label="Hauptnavigation">
                                <ul className="border-b border-border [&>li:first-child]:border-t-0">
                                    <li className="border-t border-border">{mobilAkkordeon('leistungen', 'Leistungen', mobilGruppen(LEISTUNGEN, LEISTUNGEN_UEBERSICHT))}</li>
                                    <li className="border-t border-border">{mobilAkkordeon('ki', 'KI-Telefonassistent', mobilGruppen(KI_MENUE), true)}</li>
                                    <li className="border-t border-border">
                                        <Link
                                            href={IT_SUPPORT.href}
                                            onClick={mobilSchliessen}
                                            aria-current={pathname === IT_SUPPORT.href ? 'page' : undefined}
                                            className="flex min-h-14 items-center py-3 text-lg font-semibold text-text-primary aria-[current=page]:text-primary-hover dark:aria-[current=page]:text-primary"
                                        >
                                            {IT_SUPPORT.titel}
                                        </Link>
                                    </li>
                                    <li className="border-t border-border">{mobilAkkordeon('cloud', 'Cloud-Telefonie', mobilListe(CLOUD_TELEFONIE))}</li>
                                    <li className="border-t border-border">{mobilAkkordeon('unternehmen', 'Unternehmen', mobilListe(UNTERNEHMEN))}</li>
                                </ul>
                            </nav>

                            <div className="mt-6 space-y-3">
                                {kiKarte}
                                <Button variant="primary" size="lg" className="w-full min-h-14 text-base font-semibold" asChild>
                                    <Link href={ERSTGESPRAECH.href} onClick={mobilSchliessen}>
                                        {ERSTGESPRAECH.titel}
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-8 flex flex-col gap-1 border-t border-border pt-6 text-base text-text-secondary">
                                <a href="tel:+41522221818" className="flex min-h-11 items-center gap-3 transition-colors hover:text-primary">
                                    <Phone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                    <span>052 222 18 18</span>
                                </a>
                                <a href="mailto:info@infraone.ch" className="flex min-h-11 items-center gap-3 transition-colors hover:text-primary">
                                    <Mail className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                    <span>info@infraone.ch</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
