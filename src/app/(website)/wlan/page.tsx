import { Metadata } from 'next';
import { ServicePageTemplate } from '@/components/templates/ServicePageTemplate';
import { Ruler, LayoutDashboard, Expand, Headphones } from 'lucide-react';
import {
    generateServiceWithMultipleProvidersSchema,
    generateFAQSchema,
    generateBreadcrumbListSchema,
    generateWebPageSchema,
} from '@/lib/seo/schema';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'WLAN für Firmen: Ausleuchtung, Installation, Betrieb',
    description: 'Firmen-WLAN für Büro, Werkstatt und Lager: professionelle Ausleuchtung, Installation und Betrieb mit Ubiquiti UniFi und TP-Link Omada. Aus Winterthur.',
    keywords: ['WLAN für Firmen', 'WLAN Ausleuchtung', 'Ubiquiti UniFi', 'TP-Link Omada', 'WLAN Installation Winterthur'],
    alternates: {
        canonical: 'https://infraone.ch/wlan',
        languages: {
            'de-CH': 'https://infraone.ch/wlan',
            'x-default': 'https://infraone.ch/wlan', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const features = [
    {
        number: '01',
        title: 'Ausleuchtung und Planung',
        description: 'Die Positionen der Access Points werden anhand von Grundriss, Bausubstanz und Nutzung geplant und per Messung überprüft. So entsteht Abdeckung ohne Funklöcher und ohne überflüssige Geräte.',
    },
    {
        number: '02',
        title: 'Professionelle Systeme',
        description: 'Wir installieren Ubiquiti UniFi und TP-Link Omada: zentral verwaltbare Systemfamilien, die vom Einzelbüro bis zum Betrieb mit Lagerhalle skalieren.',
    },
    {
        number: '03',
        title: 'Unterbruchsfreies Roaming',
        description: 'Mobile Geräte wechseln automatisch zum jeweils besten Access Point, auch während eines Telefonats über die Cloud-Telefonanlage.',
    },
    {
        number: '04',
        title: 'Getrenntes Gästenetz',
        description: 'Besucher erhalten Internetzugang ohne Verbindung zum Firmennetz, auf Wunsch mit eigener Anmeldeseite und Zeitbegrenzung.',
    },
    {
        number: '05',
        title: 'Verkabelung und Stromversorgung',
        description: 'Access Points werden über das Netzwerkkabel mit Strom versorgt (PoE). Zuleitungen und Montage planen wir mit, bei Bedarf gemeinsam mit unseren Elektropartnern.',
    },
    {
        number: '06',
        title: 'Überwachung und Betrieb',
        description: 'Ausfälle und Störungen werden zentral erkannt und behoben. Im IT-Dienstleistungsvertrag ist das WLAN Teil der laufend betreuten Umgebung.',
    },
];

const contentSections = [
    {
        title: 'Warum Firmen-WLAN mehr ist als ein starker Router',
        paragraphs: [
            'Im Privathaushalt versorgt ein einzelner Router wenige Geräte auf kleiner Fläche. Im Betrieb sind die Anforderungen anders: Dutzende Geräte gleichzeitig, grössere Flächen mit Beton und Metall, mobile Nutzung über Stockwerke hinweg und die Anbindung von Kassen, Druckern, Scannern oder Maschinen.',
            'Dafür braucht es mehrere aufeinander abgestimmte Access Points mit zentraler Verwaltung: gleiche Netzwerknamen im ganzen Gebäude, automatische Kanalwahl, Lastverteilung und eine saubere Trennung von Firmen-, Gäste- und Gerätenetzen. Einzelne Repeater oder ein zweiter Heimrouter verschlimmern die Situation in der Regel, statt sie zu verbessern.',
            'Die Grundlage jeder stabilen Installation ist die Planung: Bausubstanz und Nutzung bestimmen, wie viele Access Points es braucht und wo sie wirken. Deshalb messen wir aus, statt zu schätzen.',
        ],
    },
    {
        title: 'Typische Einsatzbereiche',
        paragraphs: [
            'Büro und Sitzungszimmer mit Notebooks, Telefonie und Videokonferenzen; Werkstatt und Lager mit Scannern, Tablets und robusten Geräten; Gastronomie und Empfang mit Gästezugang; Aussenbereiche wie Rampen oder Höfe mit wetterfesten Access Points. Je nach Bereich unterscheiden sich Geräte, Montage und Netztrennung, die zentrale Verwaltung bleibt dieselbe.',
        ],
    },
];

const processSteps = [
    {
        title: 'Begehung oder Grundrissanalyse',
        description: 'Wir beurteilen Fläche, Bausubstanz, Störquellen und Nutzung, vor Ort oder anhand Ihrer Pläne.',
    },
    {
        title: 'Konzept und Offerte',
        description: 'Sie erhalten ein Konzept mit den geplanten Positionen der Access Points sowie einen klaren Preis für Material und Montage.',
    },
    {
        title: 'Installation und Einrichtung',
        description: 'Montage, Verkabelung, zentrale Verwaltung, Firmen- und Gästenetz. In den meisten Fällen ohne Betriebsunterbruch.',
    },
    {
        title: 'Nachmessung und Übergabe',
        description: 'Abdeckung wird nachgemessen und optimiert, die Installation dokumentiert. Danach übernehmen wir auf Wunsch den laufenden Betrieb.',
    },
];

const advantages = [
    {
        icon: <Ruler className="w-8 h-8" />,
        title: 'Messung statt Schätzung',
        description: 'Access-Point-Positionen werden geplant und überprüft, nicht improvisiert.',
    },
    {
        icon: <LayoutDashboard className="w-8 h-8" />,
        title: 'Zentrale Verwaltung',
        description: 'Alle Geräte in einer Oberfläche: Anpassungen und Auswertungen ohne Aufwand vor Ort.',
    },
    {
        icon: <Expand className="w-8 h-8" />,
        title: 'Skalierbare Systeme',
        description: 'Dieselbe Systemfamilie wächst vom Kleinbetrieb bis zum Mehrgebäude-Standort mit.',
    },
    {
        icon: <Headphones className="w-8 h-8" />,
        title: 'Betrieb inbegriffen',
        description: 'Überwachung und Support aus einer Hand, aus Winterthur.',
    },
];

const faqs = [
    {
        question: 'Was kostet ein Firmen-WLAN?',
        answer: 'Die Kosten hängen von Fläche, Bausubstanz und Anzahl der Access Points ab. Nach Begehung oder Grundrissanalyse erhalten Sie eine Offerte mit klarem Preis für Material und Montage; die Arbeitszeit wird nach den publizierten Stundensätzen abgerechnet.',
    },
    {
        question: 'Wie viele Access Points brauchen wir?',
        answer: 'Das ergibt die Ausleuchtungsplanung. Pauschale Faustregeln führen erfahrungsgemäss entweder zu Funklöchern oder zu unnötiger Hardware; massgeblich sind Fläche, Wände, Decken und die Art der Nutzung.',
    },
    {
        question: 'Funktioniert WLAN auch in Werkstatt und Lager?',
        answer: 'Ja, mit entsprechender Planung. Beton, Metallregale und Maschinen dämpfen Funksignale erheblich. Mit geeigneten Geräten und richtiger Platzierung lässt sich auch in solchen Umgebungen eine stabile Abdeckung erreichen.',
    },
    {
        question: 'Können Sie unser bestehendes WLAN verbessern?',
        answer: 'Ja. Häufig bringen eine Nachmessung, optimierte Kanalwahl und gezielt ergänzte Access Points bereits eine deutliche Verbesserung. Ob sich eine Erweiterung oder ein Ersatz lohnt, sagen wir Ihnen nach der Analyse.',
    },
    {
        question: 'Ist ein Gästenetz ein Sicherheitsrisiko?',
        answer: 'Ein korrekt eingerichtetes Gästenetz ist im Gegenteil eine Schutzmassnahme: Besucher erhalten Internetzugang ohne jede Verbindung zum Firmennetz. Riskant ist die verbreitete Praxis, Gästen das interne WLAN-Passwort weiterzugeben.',
    },
    {
        question: 'Was ist der Unterschied zwischen Ubiquiti und TP-Link Omada?',
        answer: 'Beide sind zentral verwaltbare Systemfamilien für den Firmeneinsatz. Die Wahl richtet sich nach Anforderungen, bestehender Infrastruktur und Budget; wir setzen beide regelmässig ein und beraten produktneutral.',
    },
    {
        question: 'Unterstützt das WLAN unsere Cloud-Telefonie?',
        answer: 'Ja. Mit korrekt eingerichtetem Roaming und Priorisierung der Sprachpakete laufen Telefonate über WLAN stabil, auch beim Wechsel zwischen Access Points.',
    },
    {
        question: 'Brauchen die Access Points eine Steckdose?',
        answer: 'Nein. Die Geräte werden über das Netzwerkkabel mit Strom versorgt (Power over Ethernet). Es genügt eine saubere Netzwerkzuleitung, die wir bei Bedarf zusammen mit unseren Elektropartnern erstellen.',
    },
    {
        question: 'Wie lange dauert eine WLAN-Installation?',
        answer: 'Kleinere Installationen mit wenigen Access Points sind in einem Tag erledigt, grössere Gebäude entsprechend länger. Die Einrichtung erfolgt in der Regel ohne Unterbruch des laufenden Betriebs.',
    },
    {
        question: 'Können mehrere Standorte zentral verwaltet werden?',
        answer: 'Ja. Beide von uns eingesetzten Systemfamilien erlauben die Verwaltung mehrerer Standorte in einer Oberfläche, inklusive einheitlicher Netze und zentraler Auswertungen.',
    },
    {
        question: 'Was passiert, wenn ein Access Point ausfällt?',
        answer: 'Bei überlappender Planung übernehmen die Nachbargeräte die Abdeckung weitgehend. Der Ausfall wird in der zentralen Verwaltung sichtbar; im Betreuungsvertrag kümmern wir uns um den Ersatz, bevor es im Alltag stört.',
    },
    {
        question: 'Machen Sie auch WLAN für Aussenbereiche?',
        answer: 'Ja. Für Rampen, Höfe, Terrassen oder Aussenlager gibt es wetterfeste Access Points. Planung und Montage erfolgen wie im Innenbereich auf Basis einer Ausleuchtung.',
    },
];

export default function WlanPage() {
    // Service Schema mit allen 4 Provider-Standorten
    const serviceSchema = generateServiceWithMultipleProvidersSchema(
        'WLAN für Unternehmen',
        'WLAN Installation Service',
        'Firmen-WLAN für Büro, Werkstatt und Lager: professionelle Ausleuchtung, Installation und Betrieb mit Ubiquiti UniFi und TP-Link Omada.',
        `${BASE_URL}/wlan`
    );

    // FAQ Schema
    const faqSchema = generateFAQSchema(faqs);

    // Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'WLAN', url: `${BASE_URL}/wlan` },
    ]);

    // WebPage Schema
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/wlan`,
        'WLAN für Unternehmen',
        'Firmen-WLAN für Büro, Werkstatt und Lager: Ausleuchtung, Installation und Betrieb.'
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
                headline="WLAN für Unternehmen"
                subheadline="Geplant, ausgemessen, zuverlässig betrieben"
                description="Ein Firmen-WLAN muss viele Geräte gleichzeitig versorgen, Übergaben zwischen Access Points beherrschen und Gäste sauber vom Firmennetz trennen. Wir planen die Abdeckung anhand von Grundriss und Bausubstanz, installieren zentral verwaltbare Systeme und betreiben sie langfristig."
                features={features}
                contentSections={contentSections}
                processHeadline="So läuft unsere Zusammenarbeit ab"
                processSteps={processSteps}
                advantages={advantages}
                faqs={faqs}
                ctaHeadline="Ihr WLAN soll einfach funktionieren?"
                ctaButtonLabel="WLAN-Konzept anfragen"
                ctaButtonHref="/kontakt"
            />
        </>
    );
}
