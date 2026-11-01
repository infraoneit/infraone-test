import { Metadata } from 'next';
import { ServicePageTemplate } from '@/components/templates/ServicePageTemplate';
import { ShieldCheck, PackageCheck, Users, FileText } from 'lucide-react';
import {
    generateServiceWithMultipleProvidersSchema,
    generateFAQSchema,
    generateBreadcrumbListSchema,
    generateWebPageSchema,
} from '@/lib/seo/schema';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'IT-Sicherheit für KMU: Schutz, der zum Betrieb passt',
    description: 'IT-Sicherheit für Schweizer KMU: Firewall, Endpoint-Schutz, geprüfte Backups und Updates als betreuter Grundschutz. Beratung und Betrieb aus Winterthur.',
    keywords: ['IT-Sicherheit KMU', 'Firewall Winterthur', 'Virenschutz', 'Backup', 'IT Security Schweiz'],
    alternates: {
        canonical: 'https://infraone.ch/it-sicherheit',
        languages: {
            'de-CH': 'https://infraone.ch/it-sicherheit',
            'x-default': 'https://infraone.ch/it-sicherheit', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const features = [
    {
        number: '01',
        title: 'Firewall und Netzwerkschutz',
        description: 'Wir setzen Firewalls von Fortinet ein: Zugriffskontrolle am Netzwerkrand, VPN-Zugänge für Aussendienst und Homeoffice sowie Filterung unerwünschter Inhalte. Die Konfiguration wird dokumentiert und regelmässig überprüft.',
    },
    {
        number: '02',
        title: 'Endpoint-Schutz',
        description: 'Arbeitsplätze und Server werden mit Sophos geschützt und zentral überwacht. Verdächtige Vorgänge werden gemeldet und durch uns beurteilt, bevor daraus ein Betriebsunterbruch entsteht.',
    },
    {
        number: '03',
        title: 'Datensicherung und Wiederherstellung',
        description: 'Als Standard setzen wir auf Veeam in Kombination mit Synology-Speichersystemen. Wiederherstellungen werden regelmässig getestet, damit die Sicherung im Ernstfall auch wirklich funktioniert.',
    },
    {
        number: '04',
        title: 'Update- und Patch-Management',
        description: 'Betriebssysteme und Anwendungen werden zeitnah aktualisiert. Im IT-Dienstleistungsvertrag geschieht das laufend und kontrolliert im Hintergrund.',
    },
    {
        number: '05',
        title: 'Zugriffs- und Identitätsverwaltung',
        description: 'Mehrfaktor-Authentifizierung, zentrale Passwortverwaltung und klar geregelte Berechtigungen stellen sicher, dass nur berechtigte Personen auf Ihre Daten zugreifen.',
    },
    {
        number: '06',
        title: 'Schulung der Mitarbeitenden',
        description: 'Ein grosser Teil der Sicherheitsvorfälle beginnt mit einer täuschend echten E-Mail. Wir schulen Ihre Mitarbeitenden anhand konkreter Beispiele aus der Praxis.',
    },
];

const contentSections = [
    {
        title: 'Warum IT-Sicherheit für KMU relevant ist',
        paragraphs: [
            'Automatisierte Angriffe unterscheiden nicht nach Firmengrösse. Sie durchsuchen das Internet nach erreichbaren Fernzugängen, veralteten Systemen und ungeschützten Konten. Betroffen sind deshalb regelmässig auch kleine Betriebe, oft ohne dass ein gezielter Angreifer dahintersteckt.',
            'Für ein KMU sind die Folgen eines Vorfalls im Verhältnis meist gravierender als für einen Grossbetrieb: Ein verschlüsselter Server bedeutet stillstehende Arbeitsplätze, blockierte Aufträge und im schlechtesten Fall verlorene Daten. Die Wiederherstellung kostet erfahrungsgemäss ein Vielfaches der Vorsorge.',
            'Die gute Nachricht: Ein sauber umgesetzter Grundschutz wehrt die grosse Mehrheit dieser Angriffe ab. Es braucht dafür keine Speziallösungen, sondern bewährte Komponenten, die richtig konfiguriert und laufend betreut werden.',
        ],
    },
    {
        title: 'Unser Ansatz: Grundschutz vor Speziallösungen',
        paragraphs: [
            'Wir beginnen mit einer Bestandsaufnahme: Welche Systeme sind im Einsatz, welche Zugänge existieren, wie wird gesichert, wie aktuell sind die Systeme? Daraus entsteht eine priorisierte Massnahmenliste mit klaren Kosten, getrennt nach dringend und wünschenswert.',
            'Umgesetzt wird in Etappen, abgestimmt auf den Betrieb. Danach geht die Umgebung in die laufende Betreuung über: Überwachung, Updates und regelmässige Kontrolle der Sicherungen. So bleibt das Schutzniveau erhalten, statt nach dem Projekt langsam zu erodieren.',
        ],
    },
];

const processSteps = [
    {
        title: 'Bestandsaufnahme',
        description: 'Wir erfassen Systeme, Zugänge, Datensicherung und Updatestand und beurteilen den Ist-Zustand.',
    },
    {
        title: 'Massnahmenplan',
        description: 'Sie erhalten eine priorisierte Liste mit Aufwand und Kosten je Massnahme, nachvollziehbar begründet.',
    },
    {
        title: 'Umsetzung',
        description: 'Die vereinbarten Massnahmen werden geplant umgesetzt und dokumentiert, ohne den Betrieb zu unterbrechen.',
    },
    {
        title: 'Laufende Betreuung',
        description: 'Überwachung, Updates und Kontrolle der Sicherungen als Dauerbetrieb, auf Wunsch im IT-Dienstleistungsvertrag ab CHF 200 pro Monat.',
    },
];

const advantages = [
    {
        icon: <ShieldCheck className="w-8 h-8" />,
        title: 'Sachliche Beratung',
        description: 'Wir empfehlen, was nachweislich wirkt, und begründen jede Massnahme.',
    },
    {
        icon: <PackageCheck className="w-8 h-8" />,
        title: 'Bewährte Komponenten',
        description: 'Fortinet, Sophos, Veeam und Synology: Produkte, die wir täglich im Einsatz betreuen.',
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: 'Alles aus einer Hand',
        description: 'Sicherheit, Netzwerk und Support kommen vom selben Ansprechpartner.',
    },
    {
        icon: <FileText className="w-8 h-8" />,
        title: 'Dokumentierter Zustand',
        description: 'Sie wissen jederzeit, welche Schutzmassnahmen aktiv sind und wo Lücken bestehen.',
    },
];

const faqs = [
    {
        question: 'Was kostet IT-Sicherheit für ein KMU?',
        answer: 'Die Kosten hängen vom Ist-Zustand ab. Nach der Bestandsaufnahme erhalten Sie eine priorisierte Massnahmenliste mit klaren Kosten pro Position. Die laufende Betreuung ist Bestandteil des IT-Dienstleistungsvertrags ab CHF 200 pro Monat, Einzelmassnahmen werden nach den publizierten Stundensätzen abgerechnet.',
    },
    {
        question: 'Reicht ein Virenschutz nicht aus?',
        answer: 'Ein Virenschutz deckt nur einen Teil der Risiken ab. Häufige Schadensursachen sind Phishing-Mails, ungeschützte Fernzugänge, fehlende Updates und ungetestete Backups. Wirksamer Schutz kombiniert deshalb mehrere Ebenen: Firewall, Endpoint-Schutz, Datensicherung, aktuelle Systeme und geschulte Mitarbeitende.',
    },
    {
        question: 'Sind kleine Betriebe überhaupt ein Ziel?',
        answer: 'Ja. Die meisten Angriffe laufen automatisiert und suchen nach erreichbaren Schwachstellen, unabhängig von der Firmengrösse. Kleine Betriebe sind häufig betroffen, weil Schutzmassnahmen und Überwachung fehlen. Mit einem sauberen Grundschutz sind Sie der grossen Mehrheit dieser Angriffe voraus.',
    },
    {
        question: 'Was ist ein realistisches erstes Ziel?',
        answer: 'Fünf Punkte mit der grössten Wirkung: Mehrfaktor-Anmeldung auf allen wichtigen Konten, aktuelle Systeme, eine korrekt konfigurierte Firewall, ein getestetes Backup und sensibilisierte Mitarbeitende. Diese Basis wehrt die häufigsten Angriffsarten ab.',
    },
    {
        question: 'Wie läuft eine Bestandsaufnahme ab?',
        answer: 'Wir verschaffen uns vor Ort oder remote einen Überblick über Server, Arbeitsplätze, Netzwerk, Zugänge und Datensicherung. Das Ergebnis ist ein schriftlicher Bericht mit priorisierten Massnahmen. Der Aufwand hängt von der Umgebungsgrösse ab und wird vorab offeriert.',
    },
    {
        question: 'Was tun wir bei einem laufenden Vorfall?',
        answer: 'Rufen Sie uns an: 052 222 18 18, ausserhalb der Bürozeiten 076 587 50 55. Wichtig ist, betroffene Geräte vom Netzwerk zu trennen, aber nicht auszuschalten, und keine Lösegeldforderungen zu beantworten. Wir sichern den Zustand, stellen aus dem Backup wieder her und schliessen die Lücke.',
    },
    {
        question: 'Wie oft sollten Backups geprüft werden?',
        answer: 'Die Sicherung selbst läuft täglich, die Wiederherstellung sollte in regelmässigen Abständen getestet werden. In unseren Betreuungsverträgen sind solche Tests fester Bestandteil, denn eine ungeprüfte Sicherung bietet keine verlässliche Grundlage für den Ernstfall.',
    },
    {
        question: 'Was bedeutet Mehrfaktor-Authentifizierung?',
        answer: 'Zusätzlich zum Passwort wird ein zweiter Faktor verlangt, zum Beispiel eine Bestätigung per App. Selbst wenn ein Passwort gestohlen wird, bleibt das Konto geschützt. Wir richten das für Microsoft 365, VPN-Zugänge und weitere Dienste ein.',
    },
    {
        question: 'Unterstützen Sie uns beim Schweizer Datenschutzgesetz (revDSG)?',
        answer: 'Wir setzen die technischen Schutzmassnahmen um, die das Gesetz voraussetzt: Zugriffskontrolle, Verschlüsselung, Datensicherung und Protokollierung. Für rechtliche Fragen wie Bearbeitungsverzeichnisse arbeiten Sie idealerweise zusätzlich mit einer Fachperson für Datenschutzrecht.',
    },
    {
        question: 'Machen Sie auch Penetrationstests?',
        answer: 'Vertiefte Penetrationstests führen spezialisierte Anbieter durch, mit denen wir zusammenarbeiten. Unsere Leistung ist der Aufbau und Betrieb des Grundschutzes sowie die Behebung gefundener Schwachstellen.',
    },
    {
        question: 'Wie schnell reagieren Sie bei Sicherheitsvorfällen?',
        answer: 'Während der Bürozeiten erreichen Sie direkt einen Techniker. Für Kunden mit IT-Dienstleistungsvertrag gelten vereinbarte Reaktionszeiten, die schriftlich festgehalten werden.',
    },
    {
        question: 'Können Sie eine bestehende Sicherheitsumgebung übernehmen?',
        answer: 'Ja. Wir übernehmen bestehende Firewalls, Schutzsoftware und Sicherungslösungen, dokumentieren den Zustand und betreiben die Umgebung weiter oder modernisieren sie schrittweise.',
    },
];

export default function ITSicherheitPage() {
    // Service Schema mit allen 4 Provider-Standorten
    const serviceSchema = generateServiceWithMultipleProvidersSchema(
        'IT-Sicherheit',
        'Computer Security Service',
        'Firewall, Endpoint-Schutz, geprüfte Backups und Updates als betreuter Grundschutz für Schweizer KMU.',
        `${BASE_URL}/it-sicherheit`
    );

    // FAQ Schema
    const faqSchema = generateFAQSchema(faqs);

    // Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'IT-Sicherheit', url: `${BASE_URL}/it-sicherheit` },
    ]);

    // WebPage Schema
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/it-sicherheit`,
        'IT-Sicherheit',
        'Firewall, Endpoint-Schutz, geprüfte Backups und Updates als betreuter Grundschutz für Schweizer KMU.'
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
                heroImage="/images/hero-prtg.webp"
                headline="IT-Sicherheit"
                subheadline="Verlässlicher Grundschutz für KMU"
                description="Wirksame IT-Sicherheit entsteht nicht durch einzelne Produkte, sondern durch das Zusammenspiel von Firewall, Endpoint-Schutz, geprüften Backups, aktuellen Systemen und geschulten Mitarbeitenden. Wir planen, implementieren und betreiben diesen Grundschutz für Schweizer KMU."
                features={features}
                contentSections={contentSections}
                processHeadline="So läuft unsere Zusammenarbeit ab"
                processSteps={processSteps}
                advantages={advantages}
                faqs={faqs}
                ctaHeadline="Wo steht Ihre IT-Sicherheit heute?"
                ctaButtonLabel="Bestandsaufnahme anfragen"
                ctaButtonHref="/kontakt"
            />
        </>
    );
}
