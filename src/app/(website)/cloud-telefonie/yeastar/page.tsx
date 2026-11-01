import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, CheckCircle, ArrowRight, Phone, Cloud, Server, Shield, Wrench, Network, Layers, Briefcase, Cpu } from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';
import { FAQList } from '@/components/ui/FAQList';
import {
    generateServiceSchema,
    generateWebPageSchema,
    generateBreadcrumbListSchema,
    generateFAQSchema,
} from '@/lib/seo/schema';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Yeastar Telefonanlage Schweiz | S-Serie, P-Serie, Mitel-Migration',
    description: 'Yeastar als IP-Telefonanlage für Schweizer KMU. S-Serie für klassische On-Premise, P-Serie als Cloud-ready Hybrid, Linkus UC-Clients. Spezialität Mitel-Migration mit Weiterverwendung bestehender Endgeräte. Beratung aus Winterthur.',
    keywords: ['Yeastar Schweiz', 'Yeastar S-Serie', 'Yeastar P-Serie', 'Yeastar Cloud', 'Yeastar On-Premise', 'Mitel Migration', 'Mitel SX-200', 'MiNet Protokoll', 'Linkus UC', 'Yeastar KMU', 'PBX Hardware Schweiz'],
    alternates: {
        canonical: `${BASE_URL}/cloud-telefonie/yeastar`,
        languages: {
            'de-CH': `${BASE_URL}/cloud-telefonie/yeastar`,
            'x-default': `${BASE_URL}/cloud-telefonie/yeastar`, // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const strengths = [
    'Drei Betriebsvarianten aus einer Hand: Hardware-Box vor Ort, gehostete Cloud-Variante oder hybride Konfiguration mit lokalem Anker und Cloud-Erweiterung',
    'Mitel-Migration ohne Hardware-Wechsel: Yeastar unterstützt MiNet- und proprietäre Mitel-Protokolle. SX-200, SX-50, MiVoice 5000 und 3300 ICP Endgeräte bleiben nutzbar',
    'Linkus UC Clients für Windows, macOS, iOS und Android mit Chat, Präsenz, Anrufaufzeichnung und CRM-Pop-ups',
    'Module für klassische Anschlüsse: FXS (Analog-Endgeräte), FXO (Analog-Provider), BRI (ISDN), GSM/4G für Backup-Anbindung',
    'Standortübergreifende Setups mit bis zu 500 Nebenstellen pro Anlage und transparenter Vernetzung mehrerer Standorte',
    'Open SIP — vollständig kompatibel mit jedem SIP-Trunk-Anbieter, von Peoplefone über Swisscom bis hin zu spezialisierten Wholesale-Carriern',
    'Volle Hardware-Auswahl: Yealink, Snom, Fanvil, Grandstream und alle Yeastar-eigenen Endgeräte werden via SIP angebunden',
    'Auto-Provisioning für IP-Telefone und DECT-Basen, neue Geräte sind in unter 5 Minuten konfiguriert',
    'Datenresidenz vor Ort: bei On-Premise-Setups verlassen Sprachdaten und Aufzeichnungen das Firmennetzwerk nie',
    'Lange Lebensdauer: Hardware der S-Serie wird seit über 10 Jahren mit Firmware-Updates versorgt, kein Vendor-Zwang zum Wechsel',
];

const variants = [
    {
        icon: <Cloud className="w-7 h-7" />,
        title: 'Yeastar Cloud',
        description: 'Gehostete Variante in unserem Schweizer Rechenzentrums-Partner. Monatliche Abrechnung pro Benutzer, schneller Roll-out, automatische Updates und Backups. Funktional identisch zur On-Premise-Box, einfach in der Cloud betrieben. Linkus UC Clients voll funktionsfähig.',
        bestFor: 'KMU 10–50 Benutzer ohne Hardware-Bedürfnis, schnelle Inbetriebnahme, monatliches Pricing bevorzugt',
    },
    {
        icon: <Server className="w-7 h-7" />,
        title: 'Yeastar Hardware-Box (S-Serie / P-Serie)',
        description: 'Physische Box im eigenen Netzwerk. Die robuste S-Serie (S20, S50, S100, S300) skaliert von 5 bis 300 Nebenstellen, die moderne P-Serie kombiniert klassische PBX mit Cloud-Diensten wie Linkus Cloud Service. Einmalige Investition, danach minimale laufende Kosten — typische Amortisation 2 bis 3 Jahre.',
        bestFor: 'KMU mit eigener IT-Infrastruktur, Compliance- oder Datenschutz-Anforderungen, Kostenoptimierung über Jahre',
    },
    {
        icon: <Network className="w-7 h-7" />,
        title: 'Yeastar Hybrid',
        description: 'Kombination aus On-Premise-Anker und Cloud-Erweiterung. Hauptsitz mit Yeastar-Box, Aussenstandorte oder Homeoffice via Cloud-Anschluss. Bestehende ISDN- oder Analog-Linien bleiben über die Box angebunden, während neue Nebenstellen direkt in der Cloud aufgesetzt werden — ideal als Migrationsbrücke.',
        bestFor: 'Mitel-Migrationen, Multi-Standort-Setups mit Mischung aus Cloud und lokal, schrittweiser Übergang',
    },
];

const useCases = [
    {
        title: 'Mitel-Ablösung ohne Endgeräte-Tausch',
        description: 'Wer eine Mitel SX-200, MiVoice 5000 oder 3300 ICP betreibt, hat oft fünfstellige Investitionen in Endgeräten der Serien 5300, 6800 oder 6900 stecken. Yeastar ist die einzige aktuelle Anlage, die Mitels proprietäre MiNet-Protokolle unterstützt und diese Telefone direkt anbindet — kein Hardware-Wechsel nötig. Bei sehr alten TDM-Mitel-Anlagen ergänzen wir Yeastar mit FXS-Modulen oder Mitel-zu-SIP-Gateways. Eine typische Mitel-zu-Yeastar-Migration für 50 Nebenstellen dauert 4 bis 6 Wochen und spart gegenüber einem kompletten Hardware-Tausch oft CHF 15 000 bis 30 000.',
        icon: <Wrench className="w-5 h-5" />,
    },
    {
        title: 'Industrie- und Maschinenbau mit Werkhallen',
        description: 'Für Produktions-Standorte mit lauten Werkhallen, dickem Mauerwerk und teilweise instabiler Internetverbindung ist eine lokale Yeastar-Box oft die zuverlässigere Wahl. DECT-Multi-Zellen von Yeastar oder Snom decken grosse Hallen flächendeckend ab, robuste Headsets von Jabra oder Sennheiser sorgen für klare Verständigung. Interne Telefonie funktioniert auch bei Internet-Ausfall weiter, eingehende Anrufe von aussen werden bei Bedarf via 4G-Modul (Yeastar GSM-Karte) gepuffert. ERP-Anbindung an SAP, Abacus oder Microsoft Dynamics über Linkus-Plug-ins.',
        icon: <Cpu className="w-5 h-5" />,
    },
    {
        title: 'Kanzleien, Treuhand und Banken mit Compliance-Vorgaben',
        description: 'Anwaltskanzleien und Treuhänder haben Berufsgeheimnis-Pflichten, die Sprachdaten in fremder Hand kritisch machen. Banken unterliegen FINMA-Vorgaben zur Datenresidenz und Aufbewahrung. Eine lokal betriebene Yeastar-Box erfüllt diese Anforderungen vollständig: Gespräche, Voicemails und optionale Aufzeichnungen verlassen das Firmennetzwerk nie. Aufbewahrungsfristen lassen sich pro Anrufgruppe individuell konfigurieren, eine verschlüsselte Backup-Strategie auf Schweizer Storage ist Teil unseres Standard-Setups.',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        title: 'Hotels und Gastronomie mit PMS-Integration',
        description: 'Hotels brauchen mehr als nur Telefonie: Zimmeranschlüsse mit Direktwahl, Wake-up-Call-Logik, automatische Faktura der Telefonkosten auf das Gästezimmer und Anbindung an das Property-Management-System (protel, Mews, Apaleo, Fidelio). Yeastar bietet zertifizierte PMS-Integrationen out-of-the-box und unterstützt klassische Hotel-Workflows. Mit der P-Serie können Concierge und Empfang über Linkus-App auch ausserhalb der Rezeption erreichbar sein, während die Zimmeranschlüsse weiterhin als klassische SIP- oder Analog-Telefone laufen.',
        icon: <Briefcase className="w-5 h-5" />,
    },
    {
        title: 'Standorte mit alten ISDN- oder Analog-Anschlüssen',
        description: 'Viele Schweizer KMU haben noch funktionierende Türsprechanlagen, Faxgeräte, Alarmsysteme oder ISDN-Hauptanschlüsse, die nicht ohne Weiteres ersetzt werden können. Yeastar S-Serie unterstützt FXS-Module für analoge Endgeräte, FXO-Module für analoge Provider-Anschlüsse und BRI-Module für ISDN. Damit können bestehende Geräte schrittweise migriert werden, statt mit der PBX-Umstellung gleichzeitig alle Peripherie zu erneuern. Auch nach Swisscom-ISDN-Abschaltung lassen sich analoge Geräte über FXS weiter betreiben.',
        icon: <Layers className="w-5 h-5" />,
    },
];

const faqs = [
    {
        question: 'Was kostet eine Yeastar-Anlage in der Schweiz?',
        answer: 'Eine Yeastar S20 (bis 20 Benutzer) kostet als Hardware ca. CHF 500 bis 700, eine S50 (bis 50 Benutzer) CHF 1100 bis 1500, eine S100 (bis 100 Benutzer) CHF 2200 bis 2800, eine S300 (bis 300 Benutzer) CHF 3500 bis 4500. Hinzu kommen Endgeräte (IP-Telefone CHF 80 bis 300 pro Stück, DECT-Basen CHF 200 bis 500), Module für klassische Anschlüsse (FXS/FXO/BRI je CHF 100 bis 300) und einmalige Installation und Schulung (CHF 1500 bis 5000 je nach Komplexität). Die Yeastar-Cloud-Variante rechnen Sie mit etwa CHF 5 bis 8 pro Benutzer und Monat plus SIP-Trunk und Flatrate. Im Vergleich zur reinen Cloud-Telefonie amortisiert sich eine On-Premise-Yeastar typisch nach 2 bis 3 Jahren.',
    },
    {
        question: 'Kann ich meine bestehende Mitel-Anlage durch Yeastar ersetzen ohne Telefone zu wechseln?',
        answer: 'In den meisten Fällen ja. Yeastar ist seit Jahren die einzige aktuelle Telefonanlage am Markt, die Mitels proprietäre MiNet-Protokolle unterstützt. Mitel-IP-Telefone der Serien 5300, 6800 und 6900 lassen sich direkt anbinden. Bei sehr alten Mitel-TDM-Telefonen (DNI, ohne IP-Fähigkeit) brauchen Sie Mitel-zu-SIP-Gateways oder Adapter, oder Sie ersetzen diese Geräte schrittweise. Wir prüfen Ihre konkrete Mitel-Ausstattung kostenlos vor der Migration und liefern eine genaue Aussage zur Endgeräte-Kompatibilität. Bei MiVoice-Office-Anlagen mit SIP-Phones ist die Migration praktisch trivial.',
    },
    {
        question: 'Yeastar S-Serie oder P-Serie: was passt zu meinem Unternehmen?',
        answer: 'Die S-Serie ist die klassische, robuste On-Premise-Linie, seit über 10 Jahren am Markt und bewährt für Industrie, Hotels und KMU, die maximale Datenhoheit wollen. Sie unterstützt FXS, FXO, BRI und GSM-Module und ist die richtige Wahl, wenn Sie analoge oder ISDN-Endgeräte weiternutzen müssen. Die P-Serie ist die neuere Generation mit nativer Linkus-Integration, modernen Cloud-Funktionen wie Push-Benachrichtigungen, eingebauter Anrufaufzeichnung und CRM-Plug-ins für Salesforce, HubSpot oder Zoho. Faustregel: brauchen Sie Module für klassische Anschlüsse, kommt die S-Serie. Wollen Sie moderne Apps, mobile Workforce und Cloud-Features, ist die P-Serie der Weg.',
    },
    {
        question: 'Funktioniert Yeastar mit meiner Türsprechanlage, meinem Faxgerät und meinem Alarmsystem?',
        answer: 'Ja, in den meisten Fällen. Die S- und P-Serie unterstützen FXS-Module für analoge Geräte: analoge Türsprechstellen (z.B. von Siedle, Behnke, 2N), Faxgeräte und Alarmsysteme mit Telefon-Wählgerät werden über das FXS-Modul angeschlossen. FXO-Module nehmen analoge Anschlüsse vom Provider an, BRI-Module ISDN. Das macht Yeastar besonders attraktiv für KMU mit gemischter Infrastruktur, wo nicht alles auf einmal modernisiert werden kann oder soll. Bei IP-fähigen Türsprechanlagen (Behnke IP, 2N IP) ist die Anbindung direkt über SIP möglich.',
    },
    {
        question: 'Was passiert mit der Anlage bei einem Internet-Ausfall?',
        answer: 'Hier liegt einer der grössten Vorteile von Yeastar gegenüber reinen Cloud-Anlagen. Bei einer lokalen Yeastar-Box funktioniert die interne Telefonie auch ohne Internet weiter — Anrufe zwischen Mitarbeitenden, intern aufgenommene Voicemails, Sammelanschlüsse und Durchwahlen laufen autonom. Für eingehende Anrufe von aussen brauchen Sie einen aktiven SIP-Trunk via Internet, aber mit dem optionalen GSM- oder 4G-Modul lässt sich auch ein Mobilfunk-Backup einrichten: fällt das Internet aus, übernimmt das 4G-Modul automatisch die externe Anbindung. Failover-Routen auf Mobilnummern sind ebenfalls konfigurierbar.',
    },
    {
        question: 'Wie lange dauert eine Yeastar-Installation und was leistet InfraOne dabei?',
        answer: 'Eine Standard-Installation einer S-Serie-Box für 10 bis 30 Benutzer dauert 1 bis 2 Wochen: Hardware-Lieferung, Konfiguration der Nebenstellen, Sprachmenüs und Sammelanschlüsse, Anbindung an SIP-Trunk (typisch Peoplefone), Endgeräte-Auto-Provisioning, Schulung der Mitarbeitenden. Bei Mitel-Migrationen mit Endgeräte-Übernahme planen wir 4 bis 6 Wochen, weil wir die Mitel-Telefone schrittweise umstellen und parallel testen. Die Nummernportierung läuft unterbruchfrei über 5 bis 10 Arbeitstage parallel zum Live-Setup. Wir übernehmen Planung, Beschaffung, Installation, Konfiguration, Migration und laufenden Support.',
    },
    {
        question: 'Wann ist Yeastar die bessere Wahl als 3CX oder Peoplefone vPBX?',
        answer: 'Yeastar gewinnt in drei klar definierten Szenarien. Erstens bei Mitel-Migration mit Endgeräte-Übernahme: keine andere aktuelle Anlage unterstützt MiNet-Protokolle, das spart fünfstellige Investitionen. Zweitens bei Compliance-Pflichten zu lokaler Datenresidenz (Anwaltskanzleien, Treuhand, Banken, Gesundheitswesen): On-Premise-Yeastar hält Sprachdaten im eigenen Netzwerk. Drittens wenn klassische Anschlüsse weiter genutzt werden müssen (Türsprechanlagen, Faxgeräte, Alarmsysteme, ISDN-Bestand): FXS, FXO und BRI-Module sind out-of-the-box dabei. 3CX ist die bessere Wahl bei tiefer Microsoft-Teams-Integration oder Callcenter-Bedarf, Peoplefone vPBX bei reinen Cloud-Anforderungen mit Schweizer Datenresidenz.',
    },
];

export default function CloudTelefonieYeastarPage() {
    const serviceSchema = generateServiceSchema(
        'Yeastar Telefonanlage Schweiz',
        'IP-Telefonanlage',
        'Yeastar als IP-Telefonanlage für Schweizer KMU. S-Serie für klassische On-Premise, P-Serie als Cloud-ready Hybrid, Linkus UC-Clients. Spezialität Mitel-Migration mit Weiterverwendung bestehender Endgeräte und klassische Module für FXS, FXO und BRI.',
        `${BASE_URL}/cloud-telefonie/yeastar`
    );
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/cloud-telefonie/yeastar`,
        'Yeastar Telefonanlage Schweiz',
        'Yeastar als IP-Telefonanlage für Schweizer KMU: S-Serie und P-Serie mit Mitel-Migrationsfähigkeit, Cloud, On-Premise oder hybrid.'
    );
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Cloud-Telefonie', url: `${BASE_URL}/cloud-telefonie` },
        { name: 'Yeastar', url: `${BASE_URL}/cloud-telefonie/yeastar` },
    ]);
    const faqSchema = generateFAQSchema(faqs);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* Hero — same gradient and image as Cloud-Telefonie hub */}
            <section className="relative py-16 lg:py-24 bg-gradient-to-br from-background via-background to-surface overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image
                        src="/images/hero_telefonie_1768423192251.webp"
                        alt="Yeastar Telefonanlage Schweiz Hintergrund"
                        fill
                        className="object-cover"
                        priority
                        aria-hidden="true"
                    />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-xl">
                            <AnimatedSection animation="slideUp">
                                <Link href="/cloud-telefonie" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-4 transition-colors">
                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                    Zurück zu Cloud-Telefonie
                                </Link>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-primary uppercase tracking-wider">
                                        Cloud-Telefonie Variante
                                    </p>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                                    <span className="gradient-text">Yeastar Telefonanlage</span>{' '}
                                    <span className="block mt-2">Cloud, On-Premise oder hybrid</span>
                                </h1>
                                <p className="text-xl text-text-secondary mb-8">
                                    Vielseitige IP-Telefonanlage mit S- und P-Serie, FXS-/FXO-/BRI-Modulen für klassische Anschlüsse und einzigartiger Mitel-Migrationsfähigkeit. Die einzige aktuelle Anlage, die Mitels proprietäre MiNet-Protokolle unterstützt — bestehende Endgeräte bleiben nutzbar.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button variant="primary" size="lg" asChild>
                                        <Link href="/kontakt">
                                            Beratung anfordern
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <a href="tel:+41522221818">
                                            <Phone className="w-5 h-5" />
                                            052 222 18 18
                                        </a>
                                    </Button>
                                </div>
                            </AnimatedSection>
                        </div>

                        <AnimatedSection animation="slideUp" delay={0.2} className="hidden lg:block">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border">
                                <Image
                                    src="/images/hero_telefonie_1768423192251.webp"
                                    alt="Yeastar Cloud-Telefonanlage"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Intro */}
            <section className="py-12 lg:py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <AnimatedSection animation="slideUp">
                            <h2 className="text-3xl font-bold text-text-primary mb-4">Was macht Yeastar aus?</h2>
                            <p className="text-lg text-text-secondary leading-relaxed mb-4">
                                Yeastar ist ein chinesischer PBX-Hersteller, der seit 2006 am Markt ist und sich vor allem in Europa und Nordamerika eine starke Position bei KMU-Installationen erarbeitet hat. Anders als reine Cloud-Anbieter setzt Yeastar auf maximale Flexibilität bei der Betriebsart: dieselbe Software-Basis läuft als physische Hardware-Box vor Ort, als gehostete Cloud-Variante oder hybrid mit lokalem Anker und Cloud-Erweiterung. Die klassische S-Serie (S20, S50, S100, S300) deckt 5 bis 300 Nebenstellen ab, die modernere P-Serie ergänzt das Portfolio mit nativer Linkus-Integration und Cloud-Funktionen.
                            </p>
                            <p className="text-lg text-text-secondary leading-relaxed mb-4">
                                Zwei Eigenschaften machen Yeastar besonders. Erstens die einzigartige Mitel-Kompatibilität: Yeastar ist die einzige aktuelle Anlage am Markt, die Mitels proprietäre MiNet- und IPxx-Protokolle unterstützt. Wer eine alte Mitel SX-200, MiVoice 5000 oder 3300 ICP ablöst, kann seine teuren Mitel-IP-Telefone der Serien 5300, 6800 und 6900 direkt weiternutzen — das spart bei 50 Nebenstellen schnell CHF 15 000 bis 30 000. Zweitens die breite Unterstützung klassischer Anschlüsse: FXS-Module für analoge Endgeräte, FXO für analoge Provider-Anschlüsse, BRI für ISDN und optionale GSM-/4G-Module für Mobilfunk-Backup oder -Vermittlung.
                            </p>
                            <p className="text-lg text-text-secondary leading-relaxed">
                                In der Praxis ist Yeastar damit die richtige Wahl, wenn Sie nicht alles gleichzeitig modernisieren wollen oder können: bestehende Türsprechanlagen, Faxgeräte, Alarmsysteme und ISDN-Hauptanschlüsse bleiben über die entsprechenden Module nutzbar, während neue Nebenstellen als moderne IP-Telefone oder Linkus-Soft-Clients dazu kommen. Für Compliance-relevante Branchen wie Anwaltskanzleien, Treuhand oder Banken bietet die On-Premise-Variante zudem die nötige Datenresidenz: Sprachdaten und Aufzeichnungen verlassen das Firmennetzwerk nie.
                            </p>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Drei Varianten */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Drei Betriebsvarianten
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Von der robusten Hardware-Box bis zur reinen Cloud-Variante
                        </p>
                    </AnimatedSection>

                    <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {variants.map((variant, index) => (
                            <StaggerItem key={index}>
                                <div className="h-full p-6 rounded-2xl bg-card border border-border">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                        {variant.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary mb-3">{variant.title}</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed mb-4">{variant.description}</p>
                                    <div className="pt-3 border-t border-border">
                                        <p className="text-xs font-medium text-primary mb-1">Geeignet für</p>
                                        <p className="text-xs text-text-secondary">{variant.bestFor}</p>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Stärken */}
            <section className="py-16 lg:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div>
                        <AnimatedSection animation="slideUp">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">
                                Wann sich Yeastar besonders lohnt
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {strengths.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-text-secondary leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Anwendungsfälle */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Typische Anwendungsfälle
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Fünf Szenarien, in denen Yeastar fast immer die richtige Wahl ist
                        </p>
                    </AnimatedSection>

                    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
                        {useCases.map((useCase, i) => (
                            <AnimatedSection key={i} animation="slideUp">
                                <div className="p-6 rounded-2xl bg-card border border-border">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            {useCase.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-primary mb-2">{useCase.title}</h3>
                                            <p className="text-sm text-text-secondary leading-relaxed">{useCase.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 lg:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Häufige Fragen zu Yeastar
                        </h2>
                    </AnimatedSection>
                    <div>
                        <FAQList items={faqs} twoColumns />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 lg:py-20 bg-primary">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Yeastar für Ihre Migration?
                    </h2>
                    <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                        Kostenloses 30-Minuten-Erstgespräch zur passenden Yeastar-Variante. Bei Mitel-Migration prüfen wir Ihre Endgeräte-Kompatibilität vorab kostenlos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                            <Link href="/kontakt">
                                Beratung anfordern
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                            <a href="tel:+41522221818">
                                <Phone className="w-5 h-5" />
                                052 222 18 18
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Andere Varianten */}
            <section className="py-12 lg:py-16 bg-surface">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                            Andere Cloud-Telefonie-Varianten
                        </h2>
                    </AnimatedSection>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/cloud-telefonie#peoplefone" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-text-primary font-medium">
                            Peoplefone vPBX
                        </Link>
                        <Link href="/cloud-telefonie/3cx" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-text-primary font-medium">
                            3CX
                        </Link>
                        <Link href="/cloud-telefonie/ms-teams" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-text-primary font-medium">
                            Microsoft Teams
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
