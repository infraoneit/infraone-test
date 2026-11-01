import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Users, CheckCircle, ArrowRight, Phone, Network, Settings, Layers, Briefcase, Home, MessageSquare, Globe } from 'lucide-react';
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
    title: 'Microsoft Teams Telefonie Schweiz | Direct Routing, Operator Connect, Calling Plan',
    description: 'Microsoft Teams als vollwertige Telefonanlage für Schweizer KMU. Direct Routing über Peoplefone, 3CX-Gateway, Operator Connect oder Calling Plan. Auto Attendant, Call Queue, AI-Captions, native Outlook-Integration. Setup aus Winterthur.',
    keywords: ['Microsoft Teams Telefonie', 'Teams Phone Schweiz', 'Teams Direct Routing', 'Microsoft Calling Plan', 'Operator Connect', 'M365 Telefonie', 'Teams SIP Trunk', 'Teams Phone Standard', 'Teams Auto Attendant', 'Phone Resource Account'],
    alternates: {
        canonical: `${BASE_URL}/cloud-telefonie/ms-teams`,
        languages: {
            'de-CH': `${BASE_URL}/cloud-telefonie/ms-teams`,
            'x-default': `${BASE_URL}/cloud-telefonie/ms-teams`, // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const strengths = [
    'Eine einzige App für Chat, Videocall, Bildschirmfreigabe, Dateiablage und Telefonie — keine separate Telefonie-Software, keine getrennte Softphone-Lizenz',
    'Native Integration in Outlook-Kalender und Status: "in Besprechung" leitet eingehende Anrufe automatisch um, freie Slots zeigen sich beim Anrufer als Verfügbarkeit',
    'Auto Attendant und Call Queue als Microsoft-eigene Sprachmenü- und Warteschleifen-Funktion, direkt im Teams Admin Center konfigurierbar',
    'AI-Funktionen Microsoft-seitig: Live-Captions in Echtzeit, Sprachübersetzung, automatische Besprechungs-Zusammenfassungen mit Copilot',
    'Drei Anbindungs-Pfade: Direct Routing (günstig, flexibel), Operator Connect (One-Click-Setup), Microsoft Calling Plan (Komplettpaket)',
    'Volle Skalierbarkeit von 1 bis mehrere tausend Benutzer ohne Hardware-Wechsel, neue Mitarbeitende sind in unter 5 Minuten lizenziert und einsatzbereit',
    'Mobile- und Desktop-Clients identisch funktional: Homeoffice, Büro und unterwegs ohne Funktions-Einschränkungen',
    'Teams-zertifizierte Tischtelefone von Yealink, Poly und AudioCodes für klassische Arbeitsplätze, parallel zur App nutzbar',
    'Reduzierte Plattform-Komplexität: IT-Abteilung pflegt Microsoft 365 statt zusätzlich eine separate PBX-Software',
    'SharePoint- und OneDrive-Anbindung für Anrufaufzeichnung, mit DSG-konformer Speicherung in EU- oder Schweizer Rechenzentren möglich',
];

const variants = [
    {
        icon: <Network className="w-7 h-7" />,
        title: 'Direct Routing über Peoplefone',
        description: 'Sie behalten den Schweizer SIP-Provider und routen Anrufe über einen Session Border Controller (SBC) durch Teams. Schweizer Rufnummern, Schweizer Tarife mit Flatrate-Option, deutlich günstiger als Microsoft Calling Plan. Anbindung via Anyworld SBC oder direkter Peoplefone-Integration in unter 2 Wochen.',
        bestFor: 'KMU mit Microsoft 365, Kostenfokus, Schweizer Rufnummern, Flexibilität bei den Tarifen',
    },
    {
        icon: <Layers className="w-7 h-7" />,
        title: 'Operator Connect',
        description: 'One-Click-Anbindung an einen zertifizierten Telco-Partner direkt im Microsoft Teams Admin Center. Schnellster Setup unter den drei Varianten, kein eigener SBC nötig. Verfügbarkeit Schweizer Operators wächst, Pricing zwischen Calling Plan und Direct Routing.',
        bestFor: 'KMU die schnellen Setup ohne SBC-Aufwand wollen, Operator-Wahl wichtig',
    },
    {
        icon: <Settings className="w-7 h-7" />,
        title: '3CX als Teams-Gateway',
        description: 'Wenn bereits eine 3CX-Anlage läuft, wird Teams als zusätzlicher Endpunkt eingebunden. Mitarbeitende wählen frei zwischen Tischtelefon, 3CX-App und Teams. Klassische Sprachmenüs und Callcenter-Funktionen aus 3CX bleiben verfügbar, Teams ergänzt um Chat- und Video-Workflow.',
        bestFor: 'Bestehende 3CX-Installation, flexible Endgeräte-Wahl, gemischtes Team mit Power-Usern und Standard-Nutzern',
    },
];

const useCases = [
    {
        title: 'Unternehmen mit Microsoft-365-Vollausstattung',
        description: 'Wer bereits Outlook für Mail und Kalender, Teams für Chat und Video, SharePoint für Dateien und OneDrive für persönliche Ablage nutzt, hat keinen Grund, eine separate Telefonanlage zu pflegen. Teams als Phone-Backend schliesst die Lücke und macht die Microsoft-Welt zur einzigen Kommunikationsplattform. Anrufe gehen mit der Geschäftsnummer raus, eingehende Anrufe werden anhand des Outlook-Kalenders intelligent geroutet, Sprachnachrichten landen mit Transkription im Mail-Posteingang. Wir richten typische Setups für 20 bis 100 User in 1 bis 2 Wochen ein, inklusive Lizenz-Bestellung, Phone-Number-Bestellung und Mitarbeitenden-Schulung.',
        icon: <Briefcase className="w-5 h-5" />,
    },
    {
        title: 'Homeoffice-fokussierte und hybride Teams',
        description: 'Mitarbeitende im Homeoffice oder unterwegs telefonieren über Laptop, Tablet oder Smartphone mit ihrer Geschäftsnummer — ohne separates Softphone, ohne private Handynummer als Workaround. Eingehende Anrufe klingeln auf allen registrierten Geräten gleichzeitig, das Aufnehmen am Smartphone übernimmt das Gespräch unterbruchsfrei. Status-Anzeigen ("in Besprechung", "DND", "Verfügbar ab 14:00") gelten für Chat, Video und Telefonie gleich, was unnötige Anrufe in Konzentrationsphasen vermeidet. Für reisende Vertriebsmitarbeitende mit oft wechselnden WLANs ist die Mobil-App stabiler als klassische Softphone-Apps.',
        icon: <Home className="w-5 h-5" />,
    },
    {
        title: 'Beratungsfirmen, Kanzleien und Agenturen',
        description: 'Beratungs-Workflow läuft oft bereits über Teams: Kundentermine als Videocall, Dokumenten-Austausch via SharePoint, projektbegleitende Chats in Channels. Mit Teams als Telefonanlage kommen auch klassische Kundenanrufe in dieselbe Anwendung. Eingehende Anrufe lassen sich nach Verfügbarkeit, Kalender, Mandanten- oder Projektgruppe routen. Aufzeichnungen für Compliance-Anforderungen lassen sich automatisch starten und in einem dedizierten SharePoint-Bereich mit Aufbewahrungsrichtlinien ablegen, was bei Anwaltskanzleien für die nachträgliche Dokumentations-Pflicht entscheidend ist.',
        icon: <MessageSquare className="w-5 h-5" />,
    },
    {
        title: 'IT-Abteilungen mit Plattform-Konsolidierungs-Ziel',
        description: 'Wer eine separate PBX-Software, separate Voicemail-Server, separate Konferenzlösung und separate Mobile-Telefonie-App pflegt, hat schnell vier Plattformen mit vier Lizenz-Verträgen, vier Update-Zyklen und vier Schulungs-Sets. Teams als Telefonanlage reduziert das auf eine Plattform. Lizenz-Management, User-Provisioning, Sicherheits-Patches und Endgeräte-Verwaltung laufen über das Microsoft-365-Admin-Center, in dem ohnehin alle anderen Microsoft-Dienste verwaltet werden. Bei mittleren KMU bedeutet das oft 5 bis 10 Arbeitsstunden weniger Aufwand pro Monat in der IT.',
        icon: <Layers className="w-5 h-5" />,
    },
    {
        title: 'Multi-Standort-Setups mit unterschiedlichen Rufnummern',
        description: 'Wer mehrere Standorte in der Schweiz oder international betreibt, bekommt mit Teams Phone eine zentrale Verwaltung mit lokalen Rufnummern pro Standort. Zürcher Mitarbeitende rufen mit 044-Nummer raus, Berner mit 031-Nummer, Genfer mit 022-Nummer — alles in einer Teams-Instanz. Standortübergreifende Anrufe sind interne Teams-Calls und damit kostenlos. Auto Attendant lässt sich pro Standort individuell konfigurieren, sodass die Begrüssung der Anrufer dem jeweiligen lokalen Branding entspricht. Mit Direct Routing über Peoplefone bekommen Sie alle Schweizer Vorwahlen aus einer Hand.',
        icon: <Globe className="w-5 h-5" />,
    },
];

const faqs = [
    {
        question: 'Welche Microsoft-365-Lizenz brauche ich für Teams Telefonie?',
        answer: 'Sie brauchen die Microsoft-365-Lizenz plus eine Teams-Phone-Lizenz. Bei Business Premium (CHF 21 pro Benutzer und Monat) ist Teams Phone bereits inkludiert, plus die Möglichkeit eines kostengünstigen Direct Routing. Bei E3 oder E5 brauchen Sie das Teams Phone Add-On (CHF 8 bis 10 pro Benutzer und Monat). Beide Lizenz-Varianten geben Ihnen das Recht, ein- und ausgehende Anrufe über Teams zu tätigen. Für die externe Anbindung kommen entweder Direct Routing über Peoplefone (günstigste Variante), Operator Connect oder Microsoft Calling Plan dazu. Ein Phone Resource Account für Auto Attendant oder Call Queue ist über die Microsoft Teams Phone Resource Account-Lizenz kostenlos.',
    },
    {
        question: 'Was ist günstiger: Direct Routing, Operator Connect oder Microsoft Calling Plan?',
        answer: 'In der Schweiz fast immer Direct Routing über Peoplefone. Ein Microsoft Calling Plan kostet ca. CHF 12 bis 15 pro Benutzer und Monat zusätzlich zur M365-Lizenz, plus separate Auslandstarife. Operator Connect liegt preislich zwischen Calling Plan und Direct Routing, je nach Anbieter typisch CHF 8 bis 12 pro Benutzer plus Trunk-Grundgebühr. Direct Routing über Peoplefone kostet typisch CHF 3 bis 5 pro Benutzer plus SIP-Trunk-Grundgebühr und Tarife (Flatrate CH+EU CHF 22 pro Monat). Bei 20 Benutzern sparen Sie mit Direct Routing über CHF 200 pro Monat gegenüber dem Calling Plan, was sich über drei Jahre auf CHF 7000+ summiert. Wir rechnen Ihre konkrete Konstellation transparent durch.',
    },
    {
        question: 'Wie lange dauert die Einrichtung von Teams Telefonie?',
        answer: 'Bei Direct Routing über Peoplefone rechnen wir mit 1 bis 2 Wochen: Bedarfsanalyse und Lizenz-Inventur, allfällige Lizenz-Erweiterungen bestellen, SBC-Konfiguration (Anyworld SBC oder direkte Peoplefone-Anbindung), Teams Phone Policy einrichten, Nummern-Bestellung oder -Portierung, Auto Attendant und Call Queue konfigurieren, Mitarbeitenden-Schulung. Bei 3CX als Teams-Gateway 1 bis 2 Wochen je nach bestehender 3CX-Konfiguration. Microsoft Calling Plan ist am schnellsten (oft binnen Tagen), aber teurer im Betrieb. Operator Connect bewegt sich im 1-Wochen-Bereich, sofern Ihr Wunsch-Operator in der Schweiz verfügbar ist.',
    },
    {
        question: 'Kann ich mit Teams auch über klassische Tischtelefone telefonieren?',
        answer: 'Ja. Es gibt sogenannte Teams-zertifizierte Tischtelefone von Yealink (T55A, MP54, MP56), Poly (CCX-Serie) und AudioCodes (C455HD, C470HD), die sich direkt mit Teams Phone verbinden und alle Funktionen wie Anrufweiterleitung, Voicemail, Adressbuch-Suche und Calendar-Integration unterstützen. Preis je nach Modell CHF 200 bis 600 pro Gerät. Alternativ bei 3CX-Gateway-Variante können auch klassische SIP-Telefone von Yealink, Snom oder Fanvil parallel zu Teams genutzt werden. Mitarbeitende wählen je nach Vorliebe: Tischtelefon für klassische Arbeitsplätze, Teams-App für Mobile-First-Worker.',
    },
    {
        question: 'Was passiert mit Anrufen bei einem Microsoft-Teams-Ausfall?',
        answer: 'Sowohl Direct Routing als auch Operator Connect und Calling Plan sind bei einem Microsoft-365-Ausfall betroffen, weil Teams selbst die Anrufvermittlung übernimmt. Mit Peoplefone Direct Routing können Sie für jeden Benutzer Failover-Regeln definieren: bei Teams-Ausfall werden eingehende Anrufe automatisch auf eine vorab konfigurierte Mobilnummer weitergeleitet, sodass kritische Anrufe trotzdem ankommen. Für besonders kritische Setups (z.B. Notruf-Hotlines, Empfang in Spitälern) empfehlen wir eine 3CX-Gateway-Variante mit lokaler Backup-Konfiguration, die auch bei Teams-Ausfall autark funktioniert.',
    },
    {
        question: 'Können wir bestehende Geschäftsnummern zu Teams portieren?',
        answer: 'Ja, sowohl bei Direct Routing als auch bei Operator Connect und Calling Plan. Die Portierung läuft je nach Anbieter und altem Provider über 5 bis 15 Arbeitstage und ist unterbruchfrei: Ihre alte Anlage und neue Teams Phone laufen parallel, bis die Portierung am Stichtag final umgeschaltet wird. Wir koordinieren den gesamten Ablauf mit Ihrem aktuellen Provider, klären rechtliche Voraussetzungen (Unterschriftsberechtigung, Vertragsbindung), und planen die Umstellung so, dass keine Anrufe verloren gehen. Bei der Portierung können auch mehrere Nummern und Nummernblöcke zusammen migriert werden.',
    },
    {
        question: 'Wie funktioniert Anrufaufzeichnung mit Teams Phone und ist sie DSG-konform?',
        answer: 'Teams Phone unterstützt mehrere Aufnahme-Modi: manuelle Aufnahme pro Anruf, automatische Aufnahme aller eingehenden oder ausgehenden Anrufe, sowie Compliance-Aufnahme für regulierte Branchen wie Banken oder Versicherungen via Drittanbieter-Lösungen wie ASC, Numonix oder Verint. Speicherung läuft in SharePoint oder OneDrive, mit konfigurierbaren Aufbewahrungsrichtlinien und Zugriffsrechten. Für Schweizer DSG-Konformität ist die Datenresidenz Schweiz (Microsoft Datacenter Geneva, Zürich) entscheidend — diese ist mit Business-Premium-Lizenzen und entsprechender Konfiguration buchbar. Die Aufnahme-Pflicht zur Vorab-Information des Gesprächspartners ("Dieses Gespräch wird aufgezeichnet") implementieren wir technisch via Begrüssungs-Ansage.',
    },
];

export default function CloudTelefonieMsTeamsPage() {
    const serviceSchema = generateServiceSchema(
        'Microsoft Teams Telefonie Schweiz',
        'Cloud-Telefonanlage',
        'Microsoft Teams als vollwertige Telefonanlage für Schweizer KMU. Direct Routing über Peoplefone, Operator Connect, 3CX-Gateway oder Microsoft Calling Plan mit Auto Attendant, Call Queue und nativer Outlook-Integration.',
        `${BASE_URL}/cloud-telefonie/ms-teams`
    );
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/cloud-telefonie/ms-teams`,
        'Microsoft Teams Telefonie Schweiz',
        'Microsoft Teams als Telefonanlage für Schweizer KMU: Direct Routing, Operator Connect, 3CX-Gateway oder Calling Plan.'
    );
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Cloud-Telefonie', url: `${BASE_URL}/cloud-telefonie` },
        { name: 'Microsoft Teams', url: `${BASE_URL}/cloud-telefonie/ms-teams` },
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
                        alt="Microsoft Teams Telefonie Schweiz Hintergrund"
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
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-primary uppercase tracking-wider">
                                        Cloud-Telefonie Variante
                                    </p>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                                    <span className="gradient-text">Microsoft Teams</span>{' '}
                                    <span className="block mt-2">als vollwertige Telefonanlage</span>
                                </h1>
                                <p className="text-xl text-text-secondary mb-8">
                                    Mit Microsoft 365 wird Teams zur kompletten Telefonanlage: ein- und ausgehende Anrufe mit Geschäftsnummer, Auto Attendant, Call Queue, AI-Captions und tiefe Outlook-Integration. Drei Anbindungs-Pfade von Direct Routing bis Operator Connect — für jede Grösse das passende Modell.
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
                                    alt="Microsoft Teams Telefonie Schweiz"
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
                            <h2 className="text-3xl font-bold text-text-primary mb-4">Was ist Microsoft Teams Telefonie?</h2>
                            <p className="text-lg text-text-secondary leading-relaxed mb-4">
                                Microsoft hat Teams in den letzten Jahren von einer reinen Chat- und Videocall-App zur vollwertigen Kommunikationsplattform ausgebaut. Mit den richtigen Microsoft-365-Lizenzen und einer Telefonie-Anbindung wird Teams zur kompletten PBX: eingehende und ausgehende Anrufe mit Geschäftsnummer, Voicemail mit Transkription, Sammelanschlüsse via Call Queue, mehrstufige Sprachmenüs via Auto Attendant, automatisches Routing nach Verfügbarkeit und Kalender, Anrufaufzeichnung in SharePoint, AI-Captions in Echtzeit und Sprachübersetzung. Für klassische Arbeitsplätze gibt es Teams-zertifizierte Tischtelefone, für mobile Mitarbeitende die Apps für iOS, Android, Windows und Mac.
                            </p>
                            <p className="text-lg text-text-secondary leading-relaxed mb-4">
                                Der grosse Vorteil gegenüber separaten PBX-Lösungen liegt in der Konsolidierung: Chat, Videocall, Bildschirmfreigabe, Dateiablage und Telefonie laufen in derselben App. Mitarbeitende im Homeoffice brauchen kein separates Softphone, IT-Verantwortliche pflegen Microsoft 365 statt zusätzlich eine getrennte Telefonanlage. Status-Anzeigen sind plattformübergreifend konsistent — «in Besprechung» gilt für Anrufe genauso wie für Chats, freie Slots im Outlook-Kalender werden Anrufern korrekt signalisiert.
                            </p>
                            <p className="text-lg text-text-secondary leading-relaxed">
                                Bei der externen Telefonie-Anbindung haben Sie drei Pfade: Direct Routing über einen Schweizer SIP-Provider wie Peoplefone (günstig, flexibel, volle Schweizer Rufnummern), Operator Connect mit One-Click-Setup über einen zertifizierten Telco-Partner direkt im Teams Admin Center, oder Microsoft Calling Plan als All-in-One-Paket direkt von Microsoft. Für die meisten Schweizer KMU ist Direct Routing über Peoplefone die wirtschaftlich attraktivste Variante, weil Sie volle Tarif-Flexibilität behalten und unsere bestehende Infrastruktur nutzen. Wir richten typische Setups in 1 bis 2 Wochen ein, inklusive Rufnummern-Portierung und Mitarbeitenden-Schulung.
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
                            Drei Anbindungs-Pfade
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Vom günstigen Direct Routing bis zum One-Click Operator Connect
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
                                Stärken von Teams Telefonie
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
                            Wann sich Teams Telefonie lohnt
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Fünf typische Anwendungsfälle für Schweizer KMU
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
                            Häufige Fragen zu Teams Telefonie
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
                        Teams als Telefonanlage?
                    </h2>
                    <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                        Kostenloses 30-Minuten-Erstgespräch zur passenden Lizenz, Anbindungs-Variante und TCO-Berechnung. Wir prüfen Ihre M365-Umgebung vorab kostenlos.
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
                        <Link href="/cloud-telefonie/yeastar" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-text-primary font-medium">
                            Yeastar
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
