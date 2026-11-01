import { Metadata } from 'next';
import Image from 'next/image';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { Timeline } from '@/components/ui/Timeline';
import { Users, Target, Award, Heart, Linkedin, Mail } from 'lucide-react';

import { 
    generateAboutPageSchema,
    generatePersonSchema,
    generateBreadcrumbListSchema,
    generateWebPageSchema,
} from '@/lib/seo/schema';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Über uns | InfraOne IT Solutions Winterthur',
    description: 'InfraOne IT Solutions – Ihr IT-Partner in Winterthur. Erfahren Sie mehr über unser Team, unsere Geschichte und unsere Philosophie.',
    keywords: ['Über InfraOne', 'IT Unternehmen Winterthur', 'IT Team', 'Geschichte InfraOne'],
    alternates: {
        canonical: 'https://infraone.ch/unternehmen',
        languages: {
            'de-CH': 'https://infraone.ch/unternehmen',
            'x-default': 'https://infraone.ch/unternehmen', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const values = [
    {
        icon: <Users className="w-8 h-8" />,
        title: 'Persönlich',
        description: 'Wir kennen unsere Kunden persönlich und verstehen ihre Bedürfnisse. Keine Call-Center, direkter Kontakt.',
    },
    {
        icon: <Target className="w-8 h-8" />,
        title: 'Zielorientiert',
        description: 'Wir liefern Lösungen, die funktionieren – praktisch, effizient und auf den Punkt.',
    },
    {
        icon: <Award className="w-8 h-8" />,
        title: 'Qualität',
        description: 'Wir setzen auf bewährte Technologien und saubere Umsetzung. Keine Kompromisse bei der Qualität.',
    },
    {
        icon: <Heart className="w-8 h-8" />,
        title: 'Leidenschaft',
        description: 'IT ist unsere Leidenschaft. Wir bleiben neugierig und entwickeln uns ständig weiter.',
    },
];

const timelineEvents = [
    {
        year: '2026',
        title: 'Neuer Auftritt, klarer Fokus',
        description: 'Neue Website, geschärftes Angebot und offene Preise. Der Auftritt zeigt jetzt das, was wir täglich machen: IT für KMU, verständlich und nachvollziehbar.',
        highlight: true,
    },
    {
        year: '2025',
        title: 'Neustart als InfraOne IT Solutions GmbH',
        description: 'Nach dem Wiederaufbau starten wir unter neuem Namen. Mit der Übernahme der IT-Bestandskunden der Elektro-Tel AG kommt ein gewachsener Kundenstamm dazu, den wir bis heute betreuen.',
        highlight: true,
    },
    {
        year: '2021',
        title: 'Der Brand',
        description: 'Am 3. März 2021 zerstörte ein Grossbrand unsere Büroräumlichkeiten vollständig. 48 Stunden später lief der Betrieb provisorisch wieder. Danach legten wir das operative Geschäft bewusst auf Eis, um den Wiederaufbau sauber zu planen.',
    },
    {
        year: '2019',
        title: 'Übernahme der NET-SYS IT Solutions GmbH',
        description: 'Mit der Übernahme kamen neue Kunden und Mitarbeitende dazu. Ein wichtiger Schritt für die Breite unseres Angebots.',
    },
    {
        year: '2015',
        title: 'Erste Verstärkung',
        description: 'Die Nachfrage wuchs. Für die Administration holten wir zum ersten Mal Unterstützung ins Team.',
    },
    {
        year: '2013',
        title: 'Umwandlung zur GmbH',
        description: 'Neun Jahre nach der Gründung wurde aus der Einzelfirma eine GmbH. Ein Schritt zu mehr Verbindlichkeit gegenüber unseren Kunden.',
    },
    {
        year: '2006',
        title: 'Das erste eigene Büro',
        description: 'Umzug in die ersten externen Büroräumlichkeiten.',
    },
    {
        year: '2004',
        title: 'Der Anfang',
        description: 'Von einem kleinen Homeoffice in Hinwil aus betreuten wir die ersten Kunden.',
    },
];
export default function UnternehmenPage() {
    // 1. AboutPage Schema
    const aboutSchema = generateAboutPageSchema();
    
    // 2. Person Schema (CEO)
    const personSchema = generatePersonSchema(
        'Aladdin Avci',
        'Geschäftsführer & Gründer',
        'Mit einem Hintergrund in Elektrotechnik und IT verbindet Aladdin Avci zwei Disziplinen, die heute enger zusammengehören als je zuvor. Als diplomierter Techniker HF Systemtechnik ist er nicht nur Stratege, sondern auch Macher: nah an Projekten, Kunden und Partnern.',
        'aladdin.avci@infraone.ch',
        'https://www.linkedin.com/in/infraone-it-solutions'
    );
    
    // 3. Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Über uns', url: `${BASE_URL}/unternehmen` },
    ]);
    
    // 4. WebPage Schema
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/unternehmen`,
        'Über InfraOne IT Solutions',
        'Erfahren Sie mehr über InfraOne IT Solutions, unser Team, unsere Werte und unsere Geschichte.'
    );

    return (
        <>
            {/* 1. AboutPage Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
            />
            
            {/* 2. Person Schema (CEO) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
            />
            
            {/* 3. Breadcrumb Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            
            {/* 4. WebPage Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />

            {/* Hero */}
            <section className="relative py-16 lg:py-24 bg-gradient-to-br from-background via-background to-surface overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image src="/images/hero_homepage_1768423161913.webp" alt="InfraOne IT Solutions Hauptsitz Winterthur und Team" fill className="object-cover" priority aria-hidden="true" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <AnimatedSection animation="slideUp">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                                <span className="gradient-text">Über InfraOne</span>
                            </h1>
                            <p className="text-xl text-text-secondary mb-8">
                                IT-Lösungen mit Verstand und Herz – für Unternehmen, die mehr wollen als Standard.
                            </p>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* CEO Section */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <div>
                        <AnimatedSection animation="slideUp" className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                                Führung mit Vision
                            </h2>
                            <p className="text-text-secondary">Das Gesicht hinter InfraOne</p>
                        </AnimatedSection>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <AnimatedSection animation="slideUp" delay={0.1}>
                                <div className="relative">
                                    <div className="aspect-[4/5] relative rounded-2xl overflow-hidden border border-border">
                                        <Image
                                            src="/images/team/profilbild-ceo.webp"
                                            alt="Aladdin Avci - Geschäftsführer InfraOne IT Solutions"
                                            fill
                                            className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                                            quality={85}
                                        />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-2xl -z-10" />
                                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/5 rounded-xl -z-10" />
                                </div>
                            </AnimatedSection>

                            <AnimatedSection animation="slideUp" delay={0.2}>
                                <div className="lg:pl-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                                        <Award className="w-4 h-4" />
                                        <span>Geschäftsführer & Gründer</span>
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                                        Aladdin Avci
                                    </h3>
                                    <p className="text-lg text-primary font-medium mb-6">
                                        Dipl. Techniker HF Systemtechnik
                                    </p>

                                    <div className="prose prose-lg text-text-secondary mb-8">
                                        <p className="mb-4">
                                            Mit einem Hintergrund in Elektrotechnik und IT verbindet Aladdin Avci
                                            zwei Disziplinen, die heute enger zusammengehören als je zuvor. Nach
                                            Stationen bei Securiton, Peoplefone und in der Netzwerktechnik bringt
                                            er fundiertes Know-how aus Grossprojekten mit kritischer Infrastruktur mit.
                                        </p>
                                        <p>
                                            Als diplomierter Techniker HF Systemtechnik ist er nicht nur Stratege,
                                            sondern auch Macher: nah an Projekten, Kunden und Partnern. Seine Mission:
                                            Technik verständlich, sicher und nachhaltig machen – hands-on und schnell.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <a
                                            href="mailto:aladdin.avci@infraone.ch"
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-card border border-border hover:border-primary text-text-primary hover:text-primary transition-all"
                                        >
                                            <Mail className="w-5 h-5" />
                                            <span className="font-medium">E-Mail</span>
                                        </a>
                                        <a
                                            href="https://www.linkedin.com/in/infraone-it-solutions"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-card border border-border hover:border-primary text-text-primary hover:text-primary transition-all"
                                        >
                                            <Linkedin className="w-5 h-5" />
                                            <span className="font-medium">LinkedIn</span>
                                        </a>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </div>
            </section>
            {/* Timeline */}
            <section className="py-16 lg:py-24 bg-background overflow-hidden">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Unsere Geschichte
                        </h2>
                        <p className="text-lg text-primary font-medium">
                            Von der Einzelfirma 2004 zur InfraOne IT Solutions GmbH
                        </p>
                    </AnimatedSection>

                    <Timeline
                        events={timelineEvents}
                        introText="Über 20 Jahre IT-Arbeit, mit Höhen und Tiefen. Hier die Stationen, so wie sie waren."
                    />
                </div>
            </section>

            {/* Values */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp" className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                            Unsere Werte
                        </h2>
                        <p className="text-text-secondary">Was uns antreibt und leitet</p>
                    </AnimatedSection>

                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
                        {values.map((value, index) => (
                            <StaggerItem key={index}>
                                <div className="text-center p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all">
                                    <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary mb-2">{value.title}</h3>
                                    <p className="text-sm text-text-secondary">{value.description}</p>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 lg:py-20 bg-primary">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Lernen Sie uns kennen
                    </h2>
                    <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                        Wir freuen uns auf ein unverbindliches Gespräch über Ihre IT-Anforderungen.
                    </p>
                    <a
                        href="/kontakt"
                        className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-medium hover:bg-white/90 transition-colors"
                    >
                        Kontakt aufnehmen
                    </a>
                </div>
            </section>
        </>
    );
}