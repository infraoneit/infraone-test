import { Metadata } from 'next';
import { ServicePageTemplate } from '@/components/templates/ServicePageTemplate';
import { Puzzle, Headphones, Shield } from 'lucide-react';
import { 
    generateServiceWithMultipleProvidersSchema,
    generateFAQSchema,
    generateBreadcrumbListSchema,
    generateWebPageSchema,
} from '@/lib/seo/schema';
import { itNetzwerkeFaqs } from '@/data/webdesign-faqs';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'IT-Systeme & Netzwerke | IT-Dienstleister Winterthur',
    description: 'Planung, Aufbau & Betreuung moderner IT-Netzwerke für KMU. Stabile IT-Infrastruktur, Cloud-Lösungen, Server & Virtualisierung in Winterthur.',
    keywords: ['IT Netzwerke Winterthur', 'IT Dienstleister', 'Netzwerk Infrastruktur', 'Cloud Lösungen', 'Microsoft 365'],
    alternates: {
        canonical: 'https://infraone.ch/it-netzwerke',
        languages: {
            'de-CH': 'https://infraone.ch/it-netzwerke',
            'x-default': 'https://infraone.ch/it-netzwerke', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const features = [
    {
        number: '01',
        title: 'Netzwerk-Infrastruktur',
        description: 'Wir planen und installieren leistungsfähige LAN & WLAN Netzwerke – strukturiert, sicher und auf Ihre Anforderungen zugeschnitten. Von der Verkabelung bis zur Segmentierung.',
        highlight: 'Sichere Netzwerke mit Struktur',
    },
    {
        number: '02',
        title: 'Cloud-Lösungen',
        description: 'Egal ob Microsoft 365 mit Outlook, Teams und SharePoint oder eine eigene Cloud mit Nextcloud. Wir richten Ihre Dienste ein und sorgen für reibungslosen Betrieb.',
        highlight: 'Modern arbeiten, mit Microsoft oder eigener Cloud',
    },
    {
        number: '03',
        title: 'Server & Virtualisierung',
        description: 'Physische Server, virtuelle Maschinen oder hybride Umgebungen – wir betreiben, warten und sichern Ihre Systeme. Mit Backup-Konzepten und Monitoring für maximale Verfügbarkeit.',
        highlight: 'Zuverlässige Systeme mit Backup-Strategie',
    },
    {
        number: '04',
        title: 'IT-Sicherheit & Firewall',
        description: 'Wir schützen Ihre Infrastruktur mit Firewalls, VPN, Virenschutz und Zugriffskontrollen – und sensibilisieren Ihr Team gegen Cyberbedrohungen.',
        highlight: 'Schutz vor Cyberangriffen',
    },
];

const processSteps = [
    {
        title: 'Wir analysieren dein System',
        description: 'Wir prüfen deine Netzwerke, Server, Cloud-Umgebung und Sicherheitslösungen – und finden genau die Schwachstellen, die deinen Alltag ausbremsen.',
    },
    {
        title: 'Du bekommst ein durchdachtes Konzept',
        description: 'Ob LAN/WLAN, Cloud, Microsoft 365, Nextcloud, Backup oder Security – wir erstellen einen klaren Plan, der zu deinem Unternehmen und deinem Budget passt.',
    },
    {
        title: 'Wir setzen alles um – professionell und sauber',
        description: 'Von der Installation über Konfiguration bis zur Dokumentation – wir richten deine Systeme so ein, dass sie stabil laufen und du dich nicht mehr darum kümmern musst.',
    },
    {
        title: 'Du wirst begleitet – dauerhaft',
        description: 'Unsere Hilfe endet nicht nach dem Projekt. Mit Support, Monitoring und regelmässiger Wartung sind wir auch langfristig für dich da.',
    },
];

const advantages = [
    {
        icon: <Puzzle className="w-8 h-8" />,
        title: 'Ganzheitliche IT',
        description: 'Netzwerk, Cloud, Server, Sicherheit – alles unter einem Dach und abgestimmt auf dein Unternehmen.',
    },
    {
        icon: <Headphones className="w-8 h-8" />,
        title: 'Persönlicher Support',
        description: 'Wir sind erreichbar, schnell und kennen deine Systeme. Keine Call-Center, keine Warteschleifen.',
    },
    {
        icon: <Shield className="w-8 h-8" />,
        title: 'Zuverlässig & nachhaltig',
        description: 'Wir setzen auf Lösungen, die langfristig funktionieren – klar, dokumentiert und professionell betreut.',
    },
];

export default function ITNetzwerkePage() {
    // Service Schema mit allen 4 Provider-Standorten
    const serviceSchema = generateServiceWithMultipleProvidersSchema(
        'IT-Systeme & Netzwerke',
        'Computer Networking Service',
        'Planung, Aufbau & Betreuung moderner IT-Netzwerke für KMU. Stabile IT-Infrastruktur, Cloud-Lösungen, Server & Virtualisierung.',
        `${BASE_URL}/it-netzwerke`
    );

    // FAQ Schema
    const faqSchema = generateFAQSchema(itNetzwerkeFaqs);

    // Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'IT-Netzwerke', url: `${BASE_URL}/it-netzwerke` },
    ]);

    // WebPage Schema
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/it-netzwerke`,
        'IT-Systeme & Netzwerke',
        'Planung, Aufbau & Betreuung moderner IT-Netzwerke für KMU.'
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
                heroImage="/images/hero_it_network_1768423176860.webp"
                headline="IT-Systeme & Netzwerke"
                subheadline="Stabile IT‑Infrastrukturen für Unternehmen"
                description="Du willst eine IT-Infrastruktur, die einfach läuft? Wir planen, installieren und betreuen sichere Netzwerke, leistungsstarke Clouds, Server und Sicherheitssysteme – alles aus einer Hand."
                features={features}
                processHeadline="So läuft unsere Zusammenarbeit ab"
                processSteps={processSteps}
                advantages={advantages}
                faqs={itNetzwerkeFaqs}
                ctaHeadline="Du willst eine stabile IT-Landschaft?"
                ctaButtonLabel="Jetzt Beratung anfordern"
                ctaButtonHref="/kontakt"
            />
        </>
    );
}
