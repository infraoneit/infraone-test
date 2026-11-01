import { Metadata } from 'next';
import { ServicePageTemplate } from '@/components/templates/ServicePageTemplate';
import { Eye, Lock, Zap } from 'lucide-react';
import {
    generateServiceWithMultipleProvidersSchema,
    generateFAQSchema,
    generateBreadcrumbListSchema,
    generateWebPageSchema,
} from '@/lib/seo/schema';
import { videoueberwachungFaqs } from '@/data/webdesign-faqs';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Videoüberwachung | Milestone VMS & UniFi Protect Winterthur',
    description: 'Professionelle CCTV-Lösungen mit Milestone VMS, UniFi Protect und Aluha für KMU und Privatkunden. Videoüberwachung Winterthur.',
    keywords: ['Videoüberwachung Winterthur', 'Milestone VMS', 'UniFi Protect', 'CCTV Kamera', 'Überwachungskamera'],
    alternates: {
        canonical: 'https://infraone.ch/videoueberwachung',
        languages: {
            'de-CH': 'https://infraone.ch/videoueberwachung',
            'x-default': 'https://infraone.ch/videoueberwachung', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const features = [
    {
        number: '01',
        title: 'Milestone VMS',
        description: 'Das weltweit führende Video Management System für professionelle Überwachungslösungen. Skalierbar von wenigen bis zu tausenden Kameras mit leistungsstarker Analyse.',
        highlight: 'Enterprise-Lösung für grosse Installationen',
    },
    {
        number: '02',
        title: 'UniFi Protect',
        description: 'Die elegante Lösung von Ubiquiti für kleine bis mittlere Installationen. Einfach zu bedienen, modern im Design und ohne laufende Lizenzkosten.',
        highlight: 'Keine monatlichen Kosten',
    },
    {
        number: '03',
        title: 'Aluha Cloud',
        description: 'Cloudbasierte Videoüberwachung mit KI-Analyse. Perfekt für verteilte Standorte und Unternehmen, die ihre Aufnahmen sicher in der Cloud speichern möchten.',
        highlight: 'KI-gestützte Cloud-Lösung',
    },
    {
        number: '04',
        title: 'Kamera-Hardware',
        description: 'Von Dome- über Bullet- bis zu PTZ-Kameras – wir beraten Sie bei der Auswahl der richtigen Hardware für Innen- und Aussenbereiche.',
        highlight: 'Hikvision, Axis, UniFi & mehr',
    },
];

const processSteps = [
    {
        title: 'Bedarfsanalyse vor Ort',
        description: 'Wir besichtigen Ihr Objekt, identifizieren kritische Bereiche und berücksichtigen Datenschutzanforderungen.',
    },
    {
        title: 'Systemplanung & Angebot',
        description: 'Sie erhalten ein transparentes Angebot mit Kamerapositionierung, Speicherlösung und laufenden Kosten.',
    },
    {
        title: 'Installation & Konfiguration',
        description: 'Wir installieren Kameras, Recorder und Netzwerk-Infrastruktur – sauber, professionell und dokumentiert.',
    },
    {
        title: 'Einweisung & Support',
        description: 'Ihr Team lernt das System kennen. Bei Fragen oder Erweiterungen sind wir auch später für Sie da.',
    },
];

const advantages = [
    {
        icon: <Eye className="w-8 h-8" />,
        title: 'Professionelle Beratung',
        description: 'Wir finden die richtige Lösung für Ihren Bedarf – von der einfachen Kamera bis zum komplexen System.',
    },
    {
        icon: <Lock className="w-8 h-8" />,
        title: 'Datenschutz-konform',
        description: 'Wir berücksichtigen Schweizer Datenschutzanforderungen und helfen bei der korrekten Beschilderung.',
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: 'Schneller Service',
        description: 'Bei Störungen oder Erweiterungswünschen reagieren wir schnell und kompetent.',
    },
];

export default function VideoueberwachungPage() {
    const serviceSchema = generateServiceWithMultipleProvidersSchema(
        'Videoüberwachung & CCTV',
        'Security System Service',
        'Professionelle CCTV-Lösungen mit Milestone VMS, UniFi Protect und Aluha für KMU und Privatkunden.',
        `${BASE_URL}/videoueberwachung`
    );

    const faqSchema = generateFAQSchema(videoueberwachungFaqs);
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Videoüberwachung', url: `${BASE_URL}/videoueberwachung` },
    ]);
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/videoueberwachung`,
        'Videoüberwachung & CCTV',
        'Professionelle CCTV-Lösungen mit Milestone VMS, UniFi Protect und Aluha.'
    );

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <ServicePageTemplate
                heroImage="/images/hero_video_1768423206506.webp"
                headline="Videoüberwachung"
                subheadline="Professionelle Sicherheitslösungen für Ihr Unternehmen"
                description="Von der einzelnen Kamera bis zum komplexen Überwachungssystem – wir installieren und betreuen Videoüberwachung mit Milestone VMS, UniFi Protect und Aluha."
                features={features}
                processHeadline="So entsteht Ihre Videoüberwachung"
                processSteps={processSteps}
                advantages={advantages}
                faqs={videoueberwachungFaqs}
                ctaHeadline="Mehr Sicherheit für Ihr Unternehmen?"
                ctaButtonLabel="Beratung anfordern"
                ctaButtonHref="/kontakt"
            />
        </>
    );
}
