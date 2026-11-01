import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Phone, Monitor, MapPin, Clock, Users, Shield, ArrowRight, CheckCircle,
    Cloud, Wrench, Zap, Headphones, Globe, Mail, Server, HardDrive,
    BarChart3, Lock, Settings, Smartphone, Laptop, Printer, Wifi,
    AlertTriangle, AlertCircle
} from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';
import { 
    generateServiceSchema, 
    generateFAQSchema, 
    generateITSupportHubSchema, 
    generateOfferCatalogSchema, 
    generateItemListSchema, 
    generateBreadcrumbListSchema 
} from '@/lib/seo/schema';
import { BASE_URL } from '@/lib/constants';
import { FAQList } from '@/components/ui/FAQList';
import { SupportKostenRechner } from '@/components/tools/SupportKostenRechner';
import { FernwartungDialog } from '@/components/support/FernwartungDialog';
import { getITSupportData } from '@/lib/leistungen';

export const metadata: Metadata = {
    title: 'IT-Support Preise: ab CHF 145/h, online berechnen',
    description: 'Alle Preise offen: Remote und vor Ort Privat CHF 145/h, KMU vor Ort CHF 157/h – Kosten in 60 Sekunden online berechnen. IT-Support für KMU & Private in Winterthur, Thurgau, Zürich, Schaffhausen.',
    keywords: ['IT Support Schweiz', 'Informatik Support', 'Computerhilfe', 'PC Support'],
    alternates: {
        canonical: 'https://infraone.ch/it-support',
        languages: {
            'de-CH': 'https://infraone.ch/it-support',
            'x-default': 'https://infraone.ch/it-support', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

// Icon-Mapping für CMS-Daten (erweitert)
const iconMap: Record<string, React.ReactNode> = {
    phone: <Phone className="w-8 h-8" />,
    monitor: <Monitor className="w-8 h-8" />,
    mappin: <MapPin className="w-8 h-8" />,
    users: <Users className="w-8 h-8" />,
    shield: <Shield className="w-8 h-8" />,
    cloud: <Cloud className="w-8 h-8" />,
    wrench: <Wrench className="w-8 h-8" />,
    zap: <Zap className="w-8 h-8" />,
    headphones: <Headphones className="w-8 h-8" />,
    globe: <Globe className="w-8 h-8" />,
    mail: <Mail className="w-8 h-8" />,
    server: <Server className="w-8 h-8" />,
    harddrive: <HardDrive className="w-8 h-8" />,
    barchart: <BarChart3 className="w-8 h-8" />,
    lock: <Lock className="w-8 h-8" />,
    settings: <Settings className="w-8 h-8" />,
    smartphone: <Smartphone className="w-8 h-8" />,
    laptop: <Laptop className="w-8 h-8" />,
    printer: <Printer className="w-8 h-8" />,
    wifi: <Wifi className="w-8 h-8" />,
};

// Grid-Klassen Mapping
const gridColumnsMap: Record<string, string> = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-2 lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-4',
};

export default async function ITSupportPage() {
    // CMS-Daten laden
    const cmsData = await getITSupportData();

    // Fallback-Daten falls CMS nicht verfügbar
    const heroSection = cmsData?.heroSection ?? {
        categoryLabel: 'IT-SUPPORT & COMPUTERHILFE',
        headline: 'Informatik-Support',
        subheadline: 'Sofort. Schweizweit.',
        description: 'Schnelle IT-Hilfe für KMU & Private – per Telefon, Remote oder vor Ort. Transparente Preise, persönlicher Kontakt, keine Warteschleifen.',
        primaryButtonText: '052 222 18 18',
        primaryButtonHref: 'tel:+41522221818',
        secondaryButtonText: 'Remote-Support starten',
        secondaryButtonAction: 'download' as const,
        secondaryButtonUrl: '/kontakt',
    };

    const pricingSection = cmsData?.pricingSection ?? {
        sectionTitle: 'IT-Support Preise & Einsatzzeiten',
        sectionSubtitle: 'Transparente Preise ohne versteckte Kosten. Abrechnung im 15-Minuten-Takt.',
        gridColumns: '4',
        priceCards: [
            { title: 'Telefon- & Remote-Support', description: 'Sofortige Problemlösung durch zertifizierte Techniker. Der Grossteil der Standardprobleme wird remote gelöst – ohne Wartezeit auf einen Techniker.', price: 'CHF 145.–/h', billing: 'Mindestverrechnung: 15 Minuten', icon: 'phone' },
            { title: 'Vor-Ort-Support (Privatkunden)', description: 'Persönliche Betreuung vor Ort für Privatpersonen. Seriös, klar, effizient.', price: 'CHF 145.–/h', billing: 'Mindestverrechnung: 30 Minuten', icon: 'monitor' },
            { title: 'Vor-Ort-Support (Firma / KMU)', description: 'Professionelle Betreuung für Unternehmen. SLA-Modelle verfügbar.', price: 'CHF 157.–/h', billing: 'Mindestverrechnung: 30 Minuten', icon: 'mappin' },
            { title: 'Schulungen / Workshops / Beratung', description: 'Individuelle Schulungen, Workshops und IT-Beratung für Ihr Team.', price: 'CHF 200.–/h', billing: 'Nach Aufwand', icon: 'users' },
        ],
        travelCosts: {
            freeRegions: 'Grossraum Winterthur',
            freeRegionsNote: 'Keine Anfahrtskosten',
            otherRegions: 'Übrige Regionen',
            otherRegionsPrice: 'CHF 50 Pauschal',
            otherRegionsNote: 'Fahrzeit-Pauschale bis zu 1 Stunde ab Standort Winterthur (Hin- und Rückweg kombiniert).',
        },
        supportHours: {
            times: [
                { time: 'Mo–Fr 08:00–17:00', text: 'regulärer Tarif', style: 'neutral' },
                { time: 'Mo–Fr 17:00–23:00', text: '+25 % Zuschlag', style: 'warning' },
                { time: 'Samstag / Sonntag / Feiertage', text: '+50 % Zuschlag', style: 'warning' },
                { time: '23:00–08:00', text: 'nur mit SLA, +100 % Zuschlag', style: 'danger' },
            ],
            note: 'Support bis 23:00 Uhr sowie an Wochenenden und Feiertagen ist verfügbar (mit Zuschlag, Best-Effort).\nOhne aktives SLA sind Einsätze zwischen 23:00 und 08:00 Uhr ausgeschlossen.',
        },
    };

    // Wartungsvertrag-Block (optional, kommt aus dem CMS)
    const maintenanceSection = (cmsData as Record<string, any>)?.maintenanceSection;

    // Ablauf-Block "So läuft ein Einsatz ab" (optional, kommt aus dem CMS)
    const processSection = (cmsData as Record<string, any>)?.processSection;

    // Grid-Klasse für Preis-Kacheln
    const gridColumns = pricingSection.gridColumns || '4';
    const gridClass = gridColumnsMap[gridColumns] || gridColumnsMap['4'];

    // Secondary Button: Aktion "download" oeffnet die Fernwartung-Auswahl mit
    // Windows- und macOS-Client, "link" bleibt ein gewoehnlicher Link.
    const opensFernwartung = heroSection.secondaryButtonAction === 'download';
    const secondaryButtonHref = heroSection.secondaryButtonUrl || '#';
    const isExternalLink = secondaryButtonHref.startsWith('http');

    const regionsSection = cmsData?.regionsSection ?? {
        sectionTitle: 'IT-Support in Ihrer Region',
        sectionSubtitle: 'Vor-Ort-Einsätze in der Ostschweiz – Remote-Support schweizweit.',
        regions: [
            { name: 'IT-Support Winterthur', slug: 'winterthur', description: 'Hauptstandort. Vor Ort innert kurzer Zeit. Anfahrt kostenlos.', isFree: true },
            { name: 'IT-Support Zürich', slug: 'zuerich', description: 'Vor-Ort-Einsätze meist am selben Tag. Remote-Support jederzeit.', isFree: false },
            { name: 'IT-Support Schaffhausen', slug: 'schaffhausen', description: 'Vor-Ort-Einsätze in der Region Schaffhausen. Anfahrt kostenlos.', isFree: false },
            { name: 'IT-Support Thurgau', slug: 'thurgau', description: 'Betreuung für Industrie, Gewerbe und Verwaltungen im Thurgau.', isFree: false },
            { name: 'IT-Support St. Gallen', slug: 'st-gallen', description: 'Vor-Ort-Einsätze in der Ostschweiz meist am selben Tag.', isFree: false },
            { name: 'IT-Support Andelfingen', slug: 'andelfingen', description: 'Standort Kleinandelfingen. Anfahrt kostenlos.', isFree: true },
        ],
    };

    const faqsSection = cmsData?.faqsSection ?? {
        sectionTitle: 'Häufige Fragen',
        sectionSubtitle: 'Antworten auf die wichtigsten Fragen zu unserem Support.',
        faqs: [
            { question: 'Wie schnell erhalte ich IT Support im Notfall?', answer: 'Im Notfall (Pikett) reagieren wir sofort. Während den Bürozeiten haben Sie direkt einen Techniker am Apparat oder werden innert Kürze zurückgerufen. Remote-Support ist meist innert 15 Minuten verfügbar. Vor-Ort-Einsätze planen wir nach Dringlichkeit – bei Notfällen oft noch am gleichen Tag.' },
            { question: 'Bieten Sie Support für Privatkunden?', answer: 'Ja. Wir unterstützen Privatpersonen genauso professionell wie Firmenkunden bei allen Computer- und Internetproblemen.' },
            { question: 'Können Sie Outlook- und E-Mail-Probleme sofort lösen?', answer: 'Ja. Den Grossteil dieser Probleme lösen wir direkt per Fernwartung, ohne dass jemand vorbeikommen muss.' },
            { question: 'Was kostet Remote-Support?', answer: 'Telefon- & Remote-Support kostet CHF 145.–/h. Wir verrechnen transparent nach Zeitaufwand mit einer Mindestverrechnung von nur 15 Minuten.' },
            { question: 'Was mache ich, wenn mein Computer nicht startet?', answer: 'Rufen Sie an. Oft können wir per Telefon erste Tipps geben oder kommen vorbei, um die Hardware zu prüfen.' },
            { question: 'Wie läuft Remote-Support ab?', answer: 'Sie laden eine kleine Software herunter (AnyDesk), teilen uns den Code mit, und wir können Ihren Bildschirm sehen und Probleme direkt beheben.' },
            { question: 'Lösen Sie Server- und Netzwerkprobleme für KMU?', answer: 'Absolut. Das ist unser Kerngeschäft. Wir betreuen ganze Server-Infrastrukturen und Firmennetzwerke.' },
            { question: 'Wie wird die Fahrzeit verrechnet?', answer: 'Im Grossraum Winterthur fallen keine Anfahrtskosten an. Für übrige Regionen verrechnen wir eine Fahrzeit-Pauschale von CHF 50 für bis zu 1 Stunde ab Standort Winterthur (Hin- und Rückweg kombiniert).' },
            { question: 'Gibt es eine Mindestdauer bei Notfalleinsätzen?', answer: 'Nein. Es gilt ausschliesslich die jeweilige Mindestverrechnung gemäss Einsatzart (Remote 15 Minuten, Vor Ort 30 Minuten).' },
            { question: 'Muss ich einen Vertrag abschliessen?', answer: 'Nein. Wir arbeiten für die meisten Kunden auf Abruf. Wartungsverträge (SLA) bieten wir für Firmen an, die garantierte Reaktionszeiten benötigen.' },
        ],
    };

    const ctaSection = cmsData?.ctaSection ?? {
        headline: 'IT-Notfall? Wir sind erreichbar.',
        subtitle: 'Telefon oder WhatsApp – sofortige Hilfe für dringende IT-Probleme.',
        emergencyPhone: '076 587 50 55',
        emergencyPhoneLink: 'tel:+41765875055',
        whatsappLabel: 'WhatsApp öffnen',
        whatsappLink: 'https://wa.me/41765875055',
    };

    // Structured Data Einstellungen aus CMS
    const structuredData = cmsData?.structuredDataSection ?? {
        schemaType: 'ProfessionalService',
        areaServed: ['Schweiz', 'Winterthur', 'Zürich', 'Schaffhausen', 'Thurgau', 'St. Gallen'],
        includeFaqSchema: true,
    };

    // Schema.org generieren - Hub mit 5 Schemas
    // 1. IT-Support Hub Service Schema
    const hubServiceSchema = generateITSupportHubSchema();

    // 2. OfferCatalog Schema (Preise)
    const offerCatalogSchema = generateOfferCatalogSchema(pricingSection.priceCards);

    // 3. ItemList Schema (Häufige Probleme)
    const commonProblems = [
        'PC startet nicht / schwarzer Bildschirm',
        'Outlook Fehler / E-Mails senden nicht',
        'Viren / Malware / Betrugswarnung',
        'Internet langsam / WLAN instabil',
        'Microsoft 365 Probleme',
        'Drucker funktioniert nicht',
        'Serverstörung / Freigaben weg',
        'Windows Update Fehler',
        'VPN funktioniert nicht',
        'Backup-Warnungen / Daten weg',
        'Netzwerkstörung in KMU',
        'Bluescreen / PC stürzt ab',
        'Kein Ton / Audio defekt',
    ];
    const problemsListSchema = generateItemListSchema(commonProblems, 'Häufige IT-Probleme, die wir sofort lösen');

    // 4. FAQ Schema
    const faqSchema = structuredData.includeFaqSchema !== false 
        ? generateFAQSchema(faqsSection.faqs) 
        : null;

    // 5. Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'IT-Support', url: `${BASE_URL}/it-support` },
    ]);

    return (
        <>
            {/* 1. IT-Support Hub Service Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(hubServiceSchema) }}
            />
            
            {/* 2. OfferCatalog Schema (Preise) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogSchema) }}
            />
            
            {/* 3. ItemList Schema (Häufige Probleme) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(problemsListSchema) }}
            />
            
            {/* 4. FAQ Schema */}
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            
            {/* 5. Breadcrumb Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Hero */}
            <section className="relative py-16 lg:py-24 bg-gradient-to-br from-background via-background to-surface overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image src="/images/hero_it_network_1768423176860.webp" alt="IT-Support und Netzwerk-Infrastruktur für Schweizer KMU" fill className="object-cover" priority aria-hidden="true" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-xl">
                            <AnimatedSection animation="slideUp">
                                <p className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">
                                    {heroSection.categoryLabel}
                                </p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                                    <span className="gradient-text">{heroSection.headline}</span>{' '}
                                    <span className="block mt-2">{heroSection.subheadline}</span>
                                </h1>
                                <p className="text-xl text-text-secondary mb-8 max-w-2xl">
                                    {heroSection.description}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button variant="primary" size="lg" asChild>
                                        <a href={heroSection.primaryButtonHref}>
                                            <Phone className="w-5 h-5" />
                                            {heroSection.primaryButtonText}
                                        </a>
                                    </Button>
                                    {opensFernwartung ? (
                                        <FernwartungDialog
                                            label={heroSection.secondaryButtonText}
                                            variant="outline"
                                            size="lg"
                                        />
                                    ) : (
                                        <Button variant="outline" size="lg" asChild>
                                            <a
                                                href={secondaryButtonHref}
                                                target={isExternalLink ? '_blank' : undefined}
                                                rel={isExternalLink ? 'noopener noreferrer' : undefined}
                                            >
                                                <Monitor className="w-5 h-5" />
                                                {heroSection.secondaryButtonText}
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </AnimatedSection>
                        </div>

                        <AnimatedSection animation="slideUp" delay={0.2} className="hidden lg:block">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border">
                                <Image
                                    src={heroSection.heroImage || "/images/hero_it_network_1768423176860.webp"}
                                    alt="IT-Support und Informatik-Hilfe"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Support Types & Pricing */}
            <section id="preise" className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            {pricingSection.sectionTitle}
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            {pricingSection.sectionSubtitle}
                        </p>
                    </AnimatedSection>

                    <StaggerContainer className={`grid ${gridClass} gap-6`} staggerDelay={0.1}>
                        {pricingSection.priceCards.map((card, index) => (
                            <StaggerItem key={index}>
                                <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors flex flex-col">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                        {iconMap[card.icon] || <Monitor className="w-8 h-8" />}
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary mb-2">{card.title}</h3>
                                    <p className="text-sm text-text-secondary mb-4 flex-grow">{card.description}</p>
                                    <div>
                                        <p className="text-2xl font-bold text-primary mb-2">{card.price}</p>
                                        {(card as any).billing && (
                                            <p className="text-xs text-text-secondary border-t border-border pt-2 font-medium">{(card as any).billing}</p>
                                        )}
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>

                    {/* Times & Surcharges + Emergency Grid */}
                    <div className="mt-12 grid lg:grid-cols-2 gap-8">
                        {/* Supportzeiten & Zuschläge */}
                        <AnimatedSection animation="slideUp" delay={0.2}>
                            <div className="p-8 rounded-2xl border border-border bg-card h-full">
                                <h3 className="text-2xl font-bold text-text-primary mb-6">Supportzeiten & Zuschläge</h3>
                                <div className="space-y-4 mb-8">
                                    {(pricingSection.supportHours as any).times?.map((item: any, i: number) => (
                                        <div 
                                            key={i} 
                                            className={`flex justify-between items-center pb-2 ${
                                                i === 0 
                                                    ? 'border-b border-dashed border-border' 
                                                    : item.style === 'warning'
                                                    ? 'border border-yellow-500/50 bg-yellow-500/5 rounded px-3 py-2'
                                                    : item.style === 'danger'
                                                    ? 'border border-red-500/50 bg-red-500/10 rounded px-3 py-2'
                                                    : 'border-b border-border'
                                            }`}
                                        >
                                            <span className="font-mono font-medium text-text-primary">{item.time}</span>
                                            <span className={`${
                                                item.style === 'warning' 
                                                    ? 'text-yellow-600 dark:text-yellow-500 font-bold' 
                                                    : item.style === 'danger' 
                                                    ? 'text-red-400 font-bold' 
                                                    : 'text-text-secondary'
                                            }`}>
                                                {item.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed text-text-primary whitespace-pre-line">
                                        {(pricingSection.supportHours as any).note}
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Emergency & Travel Block */}
                        <AnimatedSection animation="slideUp" delay={0.3}>
                            <div className="flex flex-col gap-8 h-full">
                                {/* Emergency Box */}
                                <div className="flex-1 p-8 rounded-2xl bg-primary text-white shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">IT-Notfall – Telefon & WhatsApp</h3>
                                        <a href="tel:0765875055" className="block text-4xl md:text-5xl font-black my-4 hover:scale-105 transition-transform">
                                            076 587 50 55
                                        </a>
                                        <a href="https://wa.me/41765875055" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-primary px-4 py-1 rounded-full text-sm font-bold mb-4 hover:bg-gray-100 transition">
                                            WhatsApp
                                        </a>
                                        <p className="text-white/90 font-medium">Sofort erreichbar bis 23:00 Uhr</p>
                                    </div>
                                </div>

                                {/* Travel Costs */}
                                <div className="p-8 rounded-2xl border border-border bg-card flex-1 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-text-primary mb-4">Anfahrtskosten</h3>
                                    <ul className="space-y-2 mb-4">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                            <span className="text-text-primary">{pricingSection.travelCosts.freeRegions}: <span className="text-text-secondary">{pricingSection.travelCosts.freeRegionsNote}</span></span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                            <span className="text-text-primary">{pricingSection.travelCosts.otherRegions}: <span className="text-text-secondary">{pricingSection.travelCosts.otherRegionsPrice}</span></span>
                                        </li>
                                    </ul>
                                    {(pricingSection.travelCosts as any).otherRegionsNote && (
                                        <p className="text-sm text-text-secondary">{(pricingSection.travelCosts as any).otherRegionsNote}</p>
                                    )}
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Kostenrechner - zwischen Preiskarten und Regionen-Sektion (AUFTRAG-007) */}
            {/* IT-Faelle ohne Telefonie-Sparmodus — der gehoert auf /cloud-telefonie */}
            <SupportKostenRechner modi={['einsatz', 'betreuung']} defaultModus="einsatz" />

            {/* So läuft ein Einsatz ab - direkt nach den Preiskarten.
                Position gewählt: Der Block schliesst den Preis-/Einsatz-Teil ab
                ("was passiert, wenn ich anrufe"), bevor die Problem-Liste folgt. */}
            {processSection && (
                <section className="py-16 lg:py-24 bg-background border-t border-border">
                    <div className="container mx-auto px-4">
                        <AnimatedSection animation="slideUp" className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                                {processSection.sectionTitle}
                            </h2>
                            <p className="text-text-secondary max-w-2xl mx-auto">
                                {processSection.sectionSubtitle}
                            </p>
                        </AnimatedSection>

                        <div>
                            <StaggerContainer className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6" staggerDelay={0.1}>
                                {processSection.steps.map((step: { title: string; text: string }, index: number) => (
                                    <StaggerItem key={index}>
                                        <div className="flex gap-6 p-6 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-text-primary mb-2">
                                                    {step.title}
                                                </h3>
                                                <p className="text-text-secondary">
                                                    {step.text}
                                                </p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </div>
                    </div>
                </section>
            )}

            {/* Laufende Betreuung - eigene Sektion NACH dem Ablauf (AUFTRAG-014).
                #preise beginnt dadurch direkt mit den Stundensaetzen; das
                Betreuungsangebot bekommt seinen eigenen Block weiter unten. */}
            <section id="betreuung" className="py-16 lg:py-24 bg-surface scroll-mt-24">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Laufende Betreuung statt Feuerwehr
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Zwei Wege, wie wir Ihre IT dauerhaft betreuen – klar getrennt, ohne Kleingedrucktes.
                        </p>
                    </AnimatedSection>

                    {maintenanceSection && (
                        <AnimatedSection animation="slideUp" className="mb-12">
                            <div className="rounded-2xl border-2 border-primary/30 bg-card overflow-hidden">
                                <div className="grid lg:grid-cols-5 gap-0">
                                    <div className="lg:col-span-3 p-6 lg:p-10">
                                        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                                            {maintenanceSection.eyebrow}
                                        </p>
                                        <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                                            {maintenanceSection.headline}
                                        </h3>
                                        <p className="text-text-secondary leading-relaxed mb-6">
                                            {maintenanceSection.intro}
                                        </p>
                                        <ul className="space-y-3 mb-6">
                                            {maintenanceSection.included?.map((punkt: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-text-secondary">
                                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                    <span>{punkt}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-sm text-text-secondary border-l-2 border-border pl-4 italic">
                                            {maintenanceSection.limitation}
                                        </p>
                                    </div>
                                    <div className="lg:col-span-2 bg-surface p-6 lg:p-10 flex flex-col justify-center items-start lg:items-center lg:text-center">
                                        <p className="text-4xl md:text-5xl font-bold text-primary">
                                            {maintenanceSection.price}
                                        </p>
                                        <p className="text-text-secondary mb-6">{maintenanceSection.priceUnit}</p>
                                        <Button variant="primary" size="lg" asChild>
                                            {/* Bewusst <a> statt <Link>: Next setzt Hashes per pushState,
                                                das feuert kein hashchange - der Rechner wuerde weder
                                                scrollen noch den Betreuungsmodus vorwaehlen. */}
                                            <a href={maintenanceSection.ctaHref}>
                                                {maintenanceSection.ctaLabel}
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    )}

                    {/* Wartungsvertrag (Jahresprodukt) - hart kodiert, KEINE neuen
                        JSON-Felder: Keystatic entfernt unbekannte Felder beim Speichern. */}
                    <AnimatedSection animation="slideUp">
                        <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                            <h3 className="text-xl font-bold text-text-primary mb-4">
                                Wartungsvertrag – das Jahresprodukt
                            </h3>
                            <p className="text-text-secondary leading-relaxed mb-6">
                                Für Firmen, die keine monatliche Betreuung brauchen, aber ihre Anlage nicht sich selbst überlassen wollen: ein Jahresvertrag mit mindestens einer fest eingeplanten Wartung pro Jahr. Termin, Umfang und Preis werden vorab definiert – Sie wissen, wann wir kommen und was es kostet.
                            </p>
                            <p className="text-sm text-text-secondary border-l-2 border-border pl-4 italic">
                                Nicht zu verwechseln mit dem IT-Dienstleistungsvertrag: Der IT-Dienstleistungsvertrag ist die monatliche Rundum-Betreuung (ab CHF 200 pro Monat, monatlich kündbar). Der Wartungsvertrag ist das Jahresprodukt mit fest geplanten Wartungsterminen.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Häufige Probleme */}
            <section className="py-16 lg:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Häufige Probleme, die wir sofort lösen
                        </h2>
                    </AnimatedSection>

                    <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" staggerDelay={0.05}>
                        {[
                            'PC startet nicht / schwarzer Bildschirm',
                            'Outlook Fehler / E-Mails senden nicht',
                            'Viren / Malware / Betrugswarnung',
                            'Internet langsam / WLAN instabil',
                            'Microsoft 365 Probleme',
                            'Drucker funktioniert nicht',
                            'Serverstörung / Freigaben weg',
                            'Windows Update Fehler',
                            'VPN funktioniert nicht',
                            'Backup-Warnungen / Daten weg',
                            'Netzwerkstörung in KMU',
                            'Bluescreen / PC stürzt ab',
                            'Kein Ton / Audio defekt',
                        ].map((problem, index) => (
                            <StaggerItem key={index}>
                                <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors h-full">
                                    <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span className="font-medium text-text-primary text-sm">{problem}</span>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Regional Support */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            {regionsSection.sectionTitle}
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            {regionsSection.sectionSubtitle}
                        </p>
                    </AnimatedSection>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {regionsSection.regions.map((region, index) => (
                            <StaggerItem key={index}>
                                <Link href={`/it-support/${region.slug}`} className="block h-full group">
                                    <div className={`h-full p-6 rounded-2xl border transition-all ${region.isFree
                                        ? 'bg-primary/5 border-primary/30 hover:border-primary'
                                        : 'bg-card border-border hover:border-primary/50'
                                        }`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                                                {region.name}
                                            </h3>
                                            {region.isFree && (
                                                <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                                                    Kostenlos
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-text-secondary mb-4">{region.description}</p>
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                                            Mehr erfahren
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Warum InfraOne */}
            <section className="py-16 lg:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <AnimatedSection animation="slideUp">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                                Warum InfraOne für Support?
                            </h2>
                            <p className="text-lg text-text-secondary mb-6">
                                Schnell, transparent, persönlich – seit Jahren vertrauen uns KMU und Privatpersonen ihre IT an.
                            </p>
                            <Link 
                                href="/unternehmen" 
                                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline group"
                            >
                                Mehr über InfraOne
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </AnimatedSection>

                        <StaggerContainer className="grid md:grid-cols-2 gap-4" staggerDelay={0.05}>
                            {[
                                'Keine Warteschleife',
                                'Reaktionszeit im Notfall: innerhalb von 2–4 Stunden',
                                'Schweizer Techniker',
                                'Transparente Preise',
                                'Remote-Fixrate sehr hoch',
                                'Erfahrung aus KMU- und Privatkunden-Support',
                                'Keine Vertragsbindung für Privatkunden',
                                'Keine Mindeststunden bei Notfalleinsätzen',
                            ].map((benefit, index) => (
                                <StaggerItem key={index}>
                                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all hover:scale-[1.02] h-full">
                                        <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                                        <span className="font-medium text-text-primary">{benefit}</span>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">{faqsSection.sectionTitle}</h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">{faqsSection.sectionSubtitle}</p>
                    </AnimatedSection>
                    <div>
                        <FAQList items={faqsSection.faqs} twoColumns />
                    </div>
                </div>
            </section>

            {/* Emergency Contact */}
            <section className="py-16 lg:py-20 bg-primary">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {ctaSection.headline}
                    </h2>
                    <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                        {ctaSection.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white text-primary hover:bg-white/90"
                            asChild
                        >
                            <a href={ctaSection.emergencyPhoneLink}>
                                <Phone className="w-5 h-5" />
                                {ctaSection.emergencyPhone}
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white text-white hover:bg-white hover:text-primary"
                            asChild
                        >
                            <a href={ctaSection.whatsappLink} target="_blank" rel="noopener noreferrer">
                                {ctaSection.whatsappLabel}
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
