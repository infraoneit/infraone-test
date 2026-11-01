import { Metadata } from 'next';
import { ServicePageTemplate } from '@/components/templates/ServicePageTemplate';
import { Tag, Settings, HardDrive, MapPin } from 'lucide-react';
import {
    generateServiceWithMultipleProvidersSchema,
    generateFAQSchema,
    generateBreadcrumbListSchema,
    generateWebPageSchema,
} from '@/lib/seo/schema';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Microsoft 365 für KMU: Einrichtung, Migration, Betrieb',
    description: 'Microsoft 365 für Schweizer KMU: Migration ohne Unterbruch, passende Lizenzen, sichere Konfiguration und laufender Betrieb. Betreut aus Winterthur.',
    keywords: ['Microsoft 365 Migration', 'Microsoft 365 KMU', 'Teams einrichten', 'Office 365 Winterthur', 'Microsoft 365 Backup'],
    alternates: {
        canonical: 'https://infraone.ch/microsoft-365',
        languages: {
            'de-CH': 'https://infraone.ch/microsoft-365',
            'x-default': 'https://infraone.ch/microsoft-365', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const features = [
    {
        number: '01',
        title: 'Migration ohne Unterbruch',
        description: 'Postfächer, Kalender und Daten werden vollständig übernommen, die Umschaltung erfolgt geplant und ausserhalb der Arbeitszeiten. Ihre Erreichbarkeit bleibt durchgehend bestehen.',
    },
    {
        number: '02',
        title: 'Lizenzberatung',
        description: 'Business Basic, Standard oder Premium: Wir ermitteln den tatsächlichen Bedarf pro Arbeitsplatz und stellen die wirtschaftlichste Lizenzierung zusammen.',
    },
    {
        number: '03',
        title: 'Teams, SharePoint und OneDrive',
        description: 'Zusammenarbeit mit klarer Ablagestruktur und sauber geregelten Berechtigungen, damit Dokumente auffindbar bleiben und Zugriffe nachvollziehbar sind.',
    },
    {
        number: '04',
        title: 'Sichere Konfiguration',
        description: 'Mehrfaktor-Anmeldung, Schutz vor Phishing und Weiterleitungsregeln sowie Richtlinien für externe Freigaben gehören bei uns zur Standardeinrichtung.',
    },
    {
        number: '05',
        title: 'Backup für Microsoft 365',
        description: 'Microsoft garantiert den Betrieb der Plattform, nicht die Wiederherstellung gelöschter Inhalte. Wir sichern Postfächer, OneDrive und SharePoint zusätzlich mit Veeam.',
    },
    {
        number: '06',
        title: 'Laufender Betrieb',
        description: 'Ein- und Austritte, neue Geräte, Anpassungen und Support: Wir betreuen die Umgebung nach der Einführung weiter.',
    },
];

const contentSections = [
    {
        title: 'Was eine saubere Microsoft-365-Umgebung ausmacht',
        paragraphs: [
            'Der Unterschied zwischen einer stabilen und einer mühsamen Microsoft-365-Umgebung liegt selten an den Lizenzen, sondern an der Konfiguration. Dazu gehören eine durchdachte Benutzer- und Gruppenstruktur, klare Berechtigungen, aktivierte Sicherheitsfunktionen und eine Ablage, die zur Arbeitsweise des Betriebs passt.',
            'Häufige Folgen einer unsauberen Einrichtung sind frei geteilte Dokumente, unkontrollierte Weiterleitungen, verwaiste Konten ehemaliger Mitarbeitender und fehlender Schutz vor Kontenübernahmen. Diese Punkte lassen sich auch nachträglich bereinigen; wir übernehmen dazu regelmässig bestehende Umgebungen.',
            'Für die Sicherheit relevant: Die Standardeinstellungen von Microsoft 365 sind auf einfache Inbetriebnahme ausgelegt, nicht auf maximalen Schutz. Mehrfaktor-Anmeldung, Anti-Phishing-Regeln und Freigabe-Richtlinien müssen bewusst konfiguriert werden.',
        ],
    },
    {
        title: 'Cloud, Server im Haus oder beides?',
        paragraphs: [
            'Nicht jeder Betrieb gehört vollständig in die Cloud. Branchensoftware, Maschinensteuerungen oder grosse Datenmengen sprechen manchmal für einen Server im Haus, während E-Mail und Zusammenarbeit in der Cloud fast immer die robustere Lösung sind. Wir beurteilen das nüchtern anhand Ihrer Anwendungen und empfehlen die Kombination, die zum Betrieb passt.',
        ],
    },
];

const processSteps = [
    {
        title: 'Analyse',
        description: 'Wir erfassen die bestehende Umgebung: Postfächer, Datenbestände, Altsysteme und Abhängigkeiten zu Branchenanwendungen.',
    },
    {
        title: 'Planung',
        description: 'Sie erhalten einen Migrationsplan mit Terminen, Verantwortlichkeiten und dem Ablauf der Umschaltung.',
    },
    {
        title: 'Migration',
        description: 'Übernahme der Daten und geplante Umschaltung, in der Regel übers Wochenende oder gestaffelt nach Abteilungen.',
    },
    {
        title: 'Übergabe und Betrieb',
        description: 'Einführung für die Mitarbeitenden, Dokumentation der Umgebung und anschliessend laufende Betreuung.',
    },
];

const advantages = [
    {
        icon: <Tag className="w-8 h-8" />,
        title: 'Offerierter Festumfang',
        description: 'Der Migrationsumfang wird vorab definiert und offeriert.',
    },
    {
        icon: <Settings className="w-8 h-8" />,
        title: 'Konfiguration inbegriffen',
        description: 'Sicherheit, Ablagestruktur und Geräteeinrichtung sind Teil der Einführung, nicht kostenpflichtige Nacharbeit.',
    },
    {
        icon: <HardDrive className="w-8 h-8" />,
        title: 'Backup-Konzept inklusive',
        description: 'Wir zeigen transparent, was Microsoft abdeckt und was zusätzlich gesichert werden muss.',
    },
    {
        icon: <MapPin className="w-8 h-8" />,
        title: 'Betreuung nach der Einführung',
        description: 'Support und Weiterentwicklung durch denselben Ansprechpartner in Winterthur.',
    },
];

const faqs = [
    {
        question: 'Wie lange dauert eine Migration zu Microsoft 365?',
        answer: 'Für ein KMU mit bis zu 20 Postfächern rechnen wir mit ein bis zwei Wochen Vorbereitungszeit; die Umschaltung selbst erfolgt meist an einem Wochenende. Grössere Umgebungen werden gestaffelt migriert.',
    },
    {
        question: 'Was geschieht mit den bestehenden E-Mails und Kalendern?',
        answer: 'Sie werden vollständig übernommen: Postfächer, Ordnerstrukturen, Kalender und Kontakte ziehen in die neue Umgebung um.',
    },
    {
        question: 'Können wir unsere Domain und E-Mail-Adressen behalten?',
        answer: 'Ja. Ihre Domain wird mit Microsoft 365 verbunden, alle Adressen bleiben unverändert bestehen.',
    },
    {
        question: 'Brauchen wir weiterhin einen eigenen Server?',
        answer: 'Das hängt von Ihren Anwendungen ab. E-Mail und Zusammenarbeit laufen in der Cloud meist zuverlässiger; Branchensoftware oder grosse Datenmengen können weiterhin für einen Server im Haus sprechen. Wir beurteilen das im Rahmen der Analyse.',
    },
    {
        question: 'Sichert Microsoft unsere Daten nicht automatisch?',
        answer: 'Microsoft stellt den Betrieb der Plattform sicher, garantiert aber keine Wiederherstellung gelöschter oder überschriebener Inhalte nach Ablauf der Aufbewahrungsfristen. Ein separates Backup, bei uns mit Veeam, schliesst diese Lücke.',
    },
    {
        question: 'Welche Microsoft-365-Lizenz ist die richtige?',
        answer: 'Für die meisten KMU ist Business Standard passend. Business Premium lohnt sich bei erhöhten Sicherheitsanforderungen und zentraler Geräteverwaltung, Business Basic für reine Web-Nutzung. Wir stellen die Lizenzen nach tatsächlichem Bedarf pro Arbeitsplatz zusammen.',
    },
    {
        question: 'Was kostet die Migration?',
        answer: 'Der Umfang wird nach der Analyse als Festumfang offeriert. Die laufenden Lizenzkosten gehen direkt an Microsoft und werden transparent ausgewiesen.',
    },
    {
        question: 'Wie sicher sind unsere Daten bei Microsoft?',
        answer: 'Microsoft betreibt die Infrastruktur auf hohem Niveau; entscheidend ist die Konfiguration der eigenen Umgebung: Mehrfaktor-Anmeldung, Zugriffsregeln und Freigabe-Richtlinien. Genau diese Punkte richten wir standardmässig ein.',
    },
    {
        question: 'Können Sie eine bestehende Microsoft-365-Umgebung übernehmen?',
        answer: 'Ja. Wir analysieren die bestehende Einrichtung, bereinigen Berechtigungen, Sicherheitseinstellungen und Ablagestruktur und übernehmen anschliessend die Betreuung.',
    },
    {
        question: 'Funktioniert Microsoft 365 auch mit unserer Telefonie?',
        answer: 'Ja. Microsoft Teams lässt sich mit der Festnetztelefonie verbinden. Ob sich das für Ihren Betrieb lohnt, hängt von Lizenzen und Arbeitsweise ab; die Varianten zeigen wir auf unserer Cloud-Telefonie-Seite transparent auf.',
    },
    {
        question: 'Werden unsere Mitarbeitenden geschult?',
        answer: 'Ja. Zur Einführung gehört eine praxisnahe Einführung in E-Mail, Teams und Dateiablage. Auf Wunsch schulen wir vertieft, abgerechnet nach dem publizierten Stundensatz für Schulungen.',
    },
    {
        question: 'Was passiert bei einem Austritt eines Mitarbeitenden?',
        answer: 'Das Konto wird deaktiviert, Daten und Postfach werden nach definiertem Ablauf gesichert oder übergeben, Lizenzen werden freigegeben. Im laufenden Betrieb erledigen wir das als Standardprozess.',
    },
];

export default function Microsoft365Page() {
    // Service Schema mit allen 4 Provider-Standorten
    const serviceSchema = generateServiceWithMultipleProvidersSchema(
        'Microsoft 365',
        'Cloud Migration Service',
        'Microsoft 365 für Schweizer KMU: Migration ohne Unterbruch, passende Lizenzen, sichere Konfiguration und laufender Betrieb.',
        `${BASE_URL}/microsoft-365`
    );

    // FAQ Schema
    const faqSchema = generateFAQSchema(faqs);

    // Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Microsoft 365', url: `${BASE_URL}/microsoft-365` },
    ]);

    // WebPage Schema
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/microsoft-365`,
        'Microsoft 365',
        'Microsoft 365 für Schweizer KMU: Migration, Lizenzberatung, sichere Konfiguration und laufender Betrieb.'
    );

    return (
        <>
            {/* Service Schema (mit 4 Provider-Standorten) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />

            {/* FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Breadcrumb Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* WebPage Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            <ServicePageTemplate
                heroImage="/images/hero_software_1768423249576.webp"
                headline="Microsoft 365"
                subheadline="Einrichtung, Migration und Betrieb für KMU"
                description="Microsoft 365 ist für die meisten KMU der Standard für E-Mail, Office und Zusammenarbeit. Über den Nutzen entscheidet die Einrichtung: Eine sauber konfigurierte Umgebung läuft stabil und sicher, eine unsaubere erzeugt laufend Aufwand. Wir planen, migrieren und betreiben Microsoft 365 für Schweizer KMU."
                features={features}
                contentSections={contentSections}
                processHeadline="So läuft unsere Zusammenarbeit ab"
                processSteps={processSteps}
                advantages={advantages}
                faqs={faqs}
                ctaHeadline="Microsoft 365 einführen oder aufräumen?"
                ctaButtonLabel="Beratung anfragen"
                ctaButtonHref="/kontakt"
            />
        </>
    );
}
