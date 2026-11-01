import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, CheckCircle, ArrowRight, Phone, Cloud, Server, Brain, Users, Building2, Network, Headphones } from 'lucide-react';
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
    title: '3CX Telefonanlage Schweiz | Hosted, Cloud oder On-Premise',
    description: '3CX als Unified-Communications-Plattform für Schweizer KMU: native Teams-Integration, KI-Live-Transkription, Callcenter-Routing. Drei Betriebsvarianten, SC-Lizenzmodell statt Per-User. Beratung und Setup aus Winterthur.',
    keywords: ['3CX Schweiz', '3CX Cloud', '3CX Hosted', '3CX On-Premise', '3CX Teams Integration', '3CX Pro', '3CX Enterprise', '3CX Simultaneous Calls', '3CX Callcenter', '3CX KMU', '3CX Telefonanlage'],
    alternates: {
        canonical: `${BASE_URL}/cloud-telefonie/3cx`,
        languages: {
            'de-CH': `${BASE_URL}/cloud-telefonie/3cx`,
            'x-default': `${BASE_URL}/cloud-telefonie/3cx`, // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const strengths = [
    'Native Microsoft-Teams-Integration mit Direct Routing oder als Teams-Gateway, ohne zusätzliche Microsoft-Calling-Plan-Lizenz',
    'KI-Modul mit Live-Transkription, Gesprächs-Zusammenfassungen, Sentiment-Analyse und anbindbaren Voice-Bots',
    'SC-Lizenzmodell (Simultaneous Calls) statt Per-User-Abrechnung: ab etwa 30 Mitarbeitenden deutlich günstiger als klassische Anbieter',
    'Vollwertiger Web-Client, Desktop-Clients für Windows und Mac, native Apps für iOS und Android, Browser-Telefonie ohne Plugin',
    'Callcenter-Modus mit Skill-based Routing, Live-Wallboard, Whisper, Listen-in und detailliertem Reporting',
    'CRM-Anbindungen out-of-the-box für Salesforce, HubSpot, Microsoft Dynamics, Zoho, Bexio und über 30 weitere Systeme',
    'Sicherheit ab Werk: TLS-Verschlüsselung für SIP, SRTP für Sprachdaten, Anti-Hacking-Modul, automatische Update-Verteilung',
    'Volle Kompatibilität mit Yealink, Snom, Fanvil, Grandstream und Polycom IP-Telefonen sowie DECT-Multi-Zellen-Systemen',
    'Multi-Tenant-fähig für Multi-Standort-Setups, interne Anrufe zwischen allen Standorten kostenlos',
    'Editionen Standard, Pro und Enterprise mit klar gestaffeltem Funktionsumfang und benutzerunabhängigem Pricing',
];

const variants = [
    {
        icon: <Cloud className="w-7 h-7" />,
        title: '3CX Hosted',
        description: 'Gemanagtes Hosting direkt bei 3CX in europäischen Rechenzentren. Updates, Backups und Anti-Hacking-Patches laufen automatisch im Hintergrund. Schnellster Roll-out: oft binnen 48 Stunden einsatzbereit. Günstigste Variante.',
        bestFor: 'KMU 5–50 Benutzer, schneller Start, Standard-Anforderungen, kein eigener Server',
    },
    {
        icon: <Server className="w-7 h-7" />,
        title: 'Cloud-Hosted bei Schweizer Provider',
        description: 'Installation in einem Schweizer Rechenzentrum (z.B. Hetzner Schweiz, Infomaniak, Init7). Datenresidenz in der Schweiz, individuelle Backup-Strategie, volle Kontrolle über Updates und Konfiguration. Sinnvolle Wahl zwischen Hosted und On-Premise.',
        bestFor: 'Anwaltskanzleien, Treuhand, Gesundheitswesen, Datenschutz-relevante Branchen',
    },
    {
        icon: <Building2 className="w-7 h-7" />,
        title: 'On-Premise im eigenen Netzwerk',
        description: 'Installation auf eigener Hardware (Mini-PC oder VM) im Firmen-Netzwerk. Einmalige Investition statt Hosting-Mietkosten, maximale Datenhoheit, Failover-Setups möglich. Ab etwa 50 Benutzern wirtschaftlich, weil Lizenzkosten benutzerunabhängig sind.',
        bestFor: 'KMU ab 50 Benutzern, bestehende Server-Infrastruktur, Compliance-Vorgaben, Cost-Optimization',
    },
];

const useCases = [
    {
        title: 'Beratungsfirmen und Treuhand mit Microsoft-365-Ökosystem',
        description: 'Wer den Arbeitsalltag in Teams verbringt, integriert 3CX als Telefonie-Backend nahtlos: Mitarbeitende telefonieren direkt aus dem Teams-Client, Kontakte synchronisieren sich mit Outlook, Anrufe landen mit Kalender-Status automatisch im "in Besprechung". Die 3CX-Web-App ersetzt das klassische Tischtelefon vollständig, was Beratungsfirmen pro Arbeitsplatz CHF 200–400 Hardware-Kosten spart. Aufzeichnungen für Compliance werden verschlüsselt in SharePoint oder einem dedizierten Storage abgelegt.',
        icon: <Users className="w-5 h-5" />,
    },
    {
        title: 'Industrie- und Maschinenbau mit CRM- und ERP-Integration',
        description: 'Eingehende Anrufe öffnen automatisch den Kundendatensatz in SAP, Abacus oder Microsoft Dynamics, der zuständige Aussendienst-Mitarbeiter bekommt einen Pop-up mit Auftragshistorie, offenen Tickets und letzten Lieferungen. DECT-Multi-Zellen decken Werkhallen mit hoher Lärmbelastung ab, Headsets wie Jabra Engage 75 sorgen für klare Verständigung. Skill-based Routing leitet technische Anfragen direkt an den richtigen Spezialisten weiter, statt durch ein generisches Sprachmenü zu gehen.',
        icon: <Building2 className="w-5 h-5" />,
    },
    {
        title: 'Tech-Startups und Scale-ups mit hoher Skalierbarkeit',
        description: 'Wer von 10 auf 50 Mitarbeitende wächst, muss bei Per-User-Anbietern jeden Monat die Rechnung erhöhen. Mit 3CX zahlen Sie nach gleichzeitigen Anrufen (SC), nicht nach Köpfen — bei 30 Mitarbeitenden mit typischem 30%-Telefoniepensum reichen oft 16 SC für unter CHF 90 pro Monat. APIs und Webhooks erlauben tiefe Integration in eigene Backend-Systeme, ChatBots oder Helpdesk-Lösungen wie Zendesk oder Intercom. Neue Mitarbeitende werden mit einem QR-Code und der 3CX-App in unter 60 Sekunden eingerichtet.',
        icon: <Brain className="w-5 h-5" />,
    },
    {
        title: 'Multi-Standort-Setups und internationale Niederlassungen',
        description: 'Eine einzige 3CX-Instanz verwaltet bis zu 50 Standorte mit lokalen Rufnummern und individuellen Öffnungszeiten je Niederlassung. Interne Anrufe zwischen den Standorten sind kostenlos, ein gemeinsames Adressbuch und einheitliche Sprachmenüs schaffen Konsistenz. Bei Standorten im Ausland werden lokale SIP-Trunks pro Land eingebunden, sodass Anrufe immer mit der passenden Vorwahl rausgehen. Failover zwischen Standorten ist konfigurierbar: fällt ein Standort aus, übernehmen andere automatisch.',
        icon: <Network className="w-5 h-5" />,
    },
    {
        title: 'Callcenter und Hotline-Betrieb mit Skill-based Routing',
        description: 'Für KMU mit eigener Beratungs- oder Support-Hotline bietet 3CX Pro alles, was sonst nur teure Spezialsysteme bieten: Warteschlangen mit Position-Ansage, intelligentes Routing nach Sprache oder Kompetenz, Live-Wallboard mit aktuellen Wartezeiten und Auslastung, Whisper-Modus zum Mithören für Coaches, automatische Aufzeichnung mit Aufbewahrungsfristen. Reports lassen sich nach Skill-Gruppe, Mitarbeitenden oder Zeitfenster auswerten.',
        icon: <Headphones className="w-5 h-5" />,
    },
];

const faqs = [
    {
        question: 'Was kostet 3CX in der Schweiz wirklich?',
        answer: 'Die Lizenzkosten richten sich nach gleichzeitigen Anrufen (Simultaneous Calls, SC) und nicht nach Benutzeranzahl. Faustregel: pro 4 Mitarbeitende braucht es etwa 1 SC. Eine 3CX-Standard-Lizenz für 16 SC kostet ca. CHF 600 bis 900 pro Jahr, eine 3CX-Pro-Lizenz (mit Aufzeichnung, CRM-Integration und Callcenter-Features) ab CHF 1200 pro Jahr, eine 3CX-Enterprise mit unlimited Features ab CHF 1700 pro Jahr. Hinzu kommen Hosting-Kosten (Hosted by 3CX bereits inklusive, Cloud-Hosted Schweiz CHF 30–80 pro Monat, On-Premise einmalig CHF 800–2000 für Hardware) und SIP-Trunk-Kosten über Peoplefone ab CHF 19 pro Monat plus Tarife. Eine konkrete TCO-Berechnung über drei Jahre erstellen wir nach 30-minütigem Erstgespräch.',
    },
    {
        question: 'SC-Lizenz vs Per-User: ab wann lohnt sich 3CX gegenüber Peoplefone vPBX?',
        answer: 'Faustregel: ab etwa 25 bis 30 Mitarbeitenden mit gemischten Telefoniepensen wird 3CX wirtschaftlich. Bei einer Peoplefone vPBX Plus mit 30 Usern zahlen Sie etwa CHF 95 pro Monat plus SIP-Trunk und Flatrate. Mit 3CX Standard 16 SC plus Schweizer Cloud-Hosting plus SIP-Trunk liegen Sie bei etwa CHF 130 bis 160 pro Monat, dafür mit unbegrenzten Benutzern. Beim Wachstum auf 50 Benutzer wird der Unterschied deutlich: Peoplefone vPBX Plus 11-20 = CHF 55 + 21-30 = 75 oder hier 31-40 = 95 + 41-50 = 115... während 3CX gleich teuer bleibt. Wir rechnen Ihren konkreten Fall durch.',
    },
    {
        question: 'Welche Microsoft-365-Lizenz brauche ich für die Teams-Integration?',
        answer: 'Für die volle Teams-Integration via Direct Routing brauchen Sie eine Microsoft-365-Lizenz mit Teams Phone, also Business Premium (Teams Phone inklusive) oder E3 plus Teams Phone Add-On (CHF 8–10 pro Benutzer und Monat). 3CX selbst lizenzieren Sie wie gewohnt nach SC. Die Konfiguration als SBC (Session Border Controller) für Teams übernehmen wir, dauert je nach Bestehender M365-Umgebung 1 bis 2 Wochen. Vorteil gegenüber dem reinen Microsoft Calling Plan: spürbar günstigere Telefonkosten dank Peoplefone-SIP-Trunk und mehr Flexibilität bei Sprachmenüs und Callcenter-Features.',
    },
    {
        question: 'Was genau leisten die 3CX-KI-Funktionen?',
        answer: 'Die KI-Module sind ab 3CX Pro verfügbar und decken vier Bereiche ab: Erstens Live-Transkription von Gesprächen in Echtzeit (Deutsch, Englisch, Französisch, Italienisch), nützlich für Compliance und Hörbehinderte. Zweitens automatische Gesprächs-Zusammenfassungen mit den wichtigsten Punkten und Action-Items, die direkt ins CRM geschrieben werden können. Drittens Sentiment-Analyse zur Erkennung von kritischen Gesprächen für Eskalations-Workflows. Viertens Voice-Bots als 24/7-Vorschaltung, die einfache Anfragen wie "Öffnungszeiten" oder "Termin verschieben" eigenständig beantworten und nur bei Bedarf an einen Menschen weiterleiten.',
    },
    {
        question: 'Wie migrieren wir von einer alten Asterisk-, FreePBX- oder Avaya-Anlage auf 3CX?',
        answer: 'Migrationen von SIP-basierten Anlagen wie Asterisk oder FreePBX laufen typisch in 2 bis 4 Wochen: Wir analysieren Ihre bestehende Konfiguration (Nebenstellen, Sprachmenüs, Sammelanschlüsse, Aufzeichnungen), bilden sie in 3CX nach und führen einen parallelen Test-Betrieb durch. Bei Avaya, Cisco oder klassischen TDM-Anlagen ist die Migration komplexer, weil Endgeräte oft proprietär sind. In diesen Fällen ergänzen wir die Hardware-Strategie: SIP-fähige Avaya-Modelle weiterverwenden, ältere durch Yealink oder Snom ersetzen. Die Nummernportierung läuft unterbruchfrei über 5 bis 10 Arbeitstage parallel zum Live-Setup.',
    },
    {
        question: 'Wann ist 3CX die bessere Wahl als Yeastar oder Peoplefone vPBX?',
        answer: '3CX gewinnt in drei Szenarien klar. Erstens bei Microsoft-365-Vollintegration: Teams-Phone-Integration funktioniert mit 3CX deutlich runder als mit anderen Anlagen. Zweitens bei Callcenter-Bedarf ab 5 Agenten: 3CX-Pro liefert Wallboards, Whisper-Mode und Skill-based Routing, was Peoplefone in dieser Tiefe nicht hat. Drittens bei KI-Anforderungen: Live-Transkription und automatische Zusammenfassungen sind 3CX-exklusiv. Peoplefone vPBX ist bei kleinen KMU (bis 30 User) und Schweizer-Datenresidenz-Anforderungen oft die einfachere Wahl, Yeastar bei Mitel-Migration oder On-Premise-Pflicht. Wir empfehlen herstellerneutral.',
    },
    {
        question: 'Sind Updates und Sicherheits-Patches inklusive?',
        answer: 'Bei 3CX Hosted und Cloud-Hosted sind alle Updates und Sicherheits-Patches im Abo inklusive, sie werden automatisch in der Nacht eingespielt mit Rollback bei Problemen. Bei On-Premise gehören Major-Updates zur jährlichen Lizenzgebühr, die Installation übernehmen wir im Rahmen eines Wartungsvertrags. Kritische Security-Patches (z.B. nach CVE-Veröffentlichungen) implementieren wir innert 24 Stunden, Feature-Updates planen wir in festen Wartungsfenstern. Das 3CX-Anti-Hacking-Modul blockiert automatisch verdächtige IPs nach Brute-Force-Versuchen und logged Angriffe für nachträgliche Analyse.',
    },
];

export default function CloudTelefonie3CXPage() {
    const serviceSchema = generateServiceSchema(
        '3CX Telefonanlage Schweiz',
        'Cloud-Telefonanlage',
        '3CX als Unified-Communications-Plattform für Schweizer KMU. Drei Betriebsvarianten (Hosted, Cloud, On-Premise) mit nativer Teams-Integration, KI-Funktionen, Callcenter-Features und SC-Lizenzmodell.',
        `${BASE_URL}/cloud-telefonie/3cx`
    );
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/cloud-telefonie/3cx`,
        '3CX Telefonanlage Schweiz',
        '3CX als IP-Telefonanlage für Schweizer KMU: Hosted, Cloud oder On-Premise mit Teams-Integration und KI-Funktionen.'
    );
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Cloud-Telefonie', url: `${BASE_URL}/cloud-telefonie` },
        { name: '3CX', url: `${BASE_URL}/cloud-telefonie/3cx` },
    ]);
    const faqSchema = generateFAQSchema(faqs);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* Hero — same gradient and layout as Cloud-Telefonie hub */}
            <section className="relative py-16 lg:py-24 bg-gradient-to-br from-background via-background to-surface overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image
                        src="/images/hero_telefonie_1768423192251.webp"
                        alt="3CX Cloud-Telefonie Hintergrund"
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
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-primary uppercase tracking-wider">
                                        Cloud-Telefonie Variante
                                    </p>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                                    <span className="gradient-text">3CX Telefonanlage</span>{' '}
                                    <span className="block mt-2">Hosted, Cloud oder lokal mit KI</span>
                                </h1>
                                <p className="text-xl text-text-secondary mb-8">
                                    Unified-Communications-Plattform mit nativer Microsoft-Teams-Integration, KI-Live-Transkription und vollwertigem Callcenter-Modus. Drei Betriebsvarianten, benutzerunabhängiges SC-Lizenzmodell, ab etwa 30 Mitarbeitenden besonders wirtschaftlich.
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
                                    src="/images/3cx-pbx-virtual-phonesystem-infraone-it-solutions.webp"
                                    alt="3CX PBX Virtual Phone System InfraOne IT Solutions"
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
                            <h2 className="text-3xl font-bold text-text-primary mb-4">Was macht 3CX aus?</h2>
                            <p className="text-lg text-text-secondary leading-relaxed mb-4">
                                3CX ist eine softwarebasierte IP-Telefonanlage, die seit 2005 entwickelt wird und sich bei über 600 000 Installationen weltweit etabliert hat. Anders als reine Cloud-Anbieter wie Peoplefone oder klassische On-Premise-Anlagen wie Mitel oder Cisco verbindet 3CX beide Welten: dieselbe Software läuft als gemanagtes Hosting in der Cloud, als selbstverwaltete Cloud-Installation oder auf einem eigenen Server. So lässt sich die Betriebsart frei wählen — je nach Datenschutz-Anforderung, Investitionsmodell und IT-Reife.
                            </p>
                            <p className="text-lg text-text-secondary leading-relaxed mb-4">
                                Drei Eigenschaften heben 3CX vom Wettbewerb ab. Erstens das benutzerunabhängige Lizenzmodell: 3CX rechnet nach gleichzeitigen Anrufen (Simultaneous Calls) statt pro Mitarbeitenden. Wer 50 Beschäftigte mit gemischtem Telefoniepensum hat, kommt oft mit 16 SC aus — und zahlt damit nicht das Fünffache wie bei Per-User-Anbietern. Zweitens die native Microsoft-Teams-Integration: 3CX fungiert als Telefonie-Backend für Teams, ohne dass ein teurer Microsoft Calling Plan nötig wäre. Drittens das KI-Modul mit Live-Transkription, automatischen Zusammenfassungen, Sentiment-Analyse und anbindbaren Voice-Bots.
                            </p>
                            <p className="text-lg text-text-secondary leading-relaxed">
                                In der Praxis bedeutet das: Mitarbeitende telefonieren über den Web-Client im Browser, die Desktop-App auf Windows oder Mac, die Mobile-App auf iPhone oder Android, oder klassische IP-Tischtelefone von Yealink, Snom oder Fanvil. Anrufe lassen sich aufnehmen und automatisch transkribieren, Gesprächs-Zusammenfassungen landen direkt im CRM-System. Das Callcenter-Modul mit Skill-based Routing, Live-Wallboard und Whisper-Funktion macht 3CX auch für KMU mit eigener Hotline interessant — Funktionen, die sonst nur teure Spezialsysteme bieten.
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
                            Vom gemanagten Hosting bis zur eigenen Server-Installation
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
                                Stärken von 3CX im Überblick
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

            {/* Anwendungsfälle (Anker für das Menü «Für wen», AUFTRAG-100) */}
            <section id="anwendungsfaelle" className="py-16 lg:py-24 bg-surface scroll-mt-24">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Wann sich 3CX besonders lohnt
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Fünf typische Anwendungsfälle, in denen 3CX seine Stärken voll ausspielt
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
                            Häufige Fragen zu 3CX
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
                        3CX für Ihr Unternehmen?
                    </h2>
                    <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                        Kostenloses 30-Minuten-Erstgespräch zur passenden 3CX-Edition, Betriebsvariante und TCO-Berechnung über drei Jahre.
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
                        <Link href="/cloud-telefonie/ms-teams" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-text-primary font-medium">
                            Microsoft Teams
                        </Link>
                        <Link href="/cloud-telefonie/yeastar" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-text-primary font-medium">
                            Yeastar
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
