import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Phone, Sparkles, Workflow, Code } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { MotionCard, MotionCTA } from '@/components/ui/MotionCard';
import { FAQList } from '@/components/ui/FAQList';
import KINewsSection from '@/components/sections/KINewsSection';
import { generateServiceWithMultipleProvidersSchema, generateFAQSchema, generateBreadcrumbListSchema, generateWebPageSchema } from '@/lib/seo/schema';
import { softwareEntwicklungFaqs } from '@/data/webdesign-faqs';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'KI für KMU & Software-Entwicklung',
    description: 'KI im Unternehmen einsetzen, ohne Buzzwords: Prozesse analysieren, Abläufe automatisieren, Software auf Mass. Aus Winterthur, für Schweizer KMU.',
    keywords: ['KI für KMU', 'KI-Integration', 'Automatisierung', 'Software Entwicklung', 'Individualsoftware'],
    alternates: {
        canonical: 'https://infraone.ch/software-entwicklung',
        languages: {
            'de-CH': 'https://infraone.ch/software-entwicklung',
            'x-default': 'https://infraone.ch/software-entwicklung', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

const angebote = [
    {
        icon: <Sparkles className="w-8 h-8" />,
        title: 'KI-Potenzialanalyse',
        text: 'Wir schauen uns Ihre Abläufe an und zeigen, wo KI wirklich Zeit spart – und wo nicht. Sie bekommen eine ehrliche Einschätzung mit konkreten nächsten Schritten statt einer Folienschlacht. Beratung zu CHF 200 pro Stunde, Umfang vorher klar abgemacht.',
    },
    {
        icon: <Workflow className="w-8 h-8" />,
        title: 'KI in bestehende Abläufe einbauen',
        text: 'Der grösste Nutzen liegt selten in neuen Werkzeugen, sondern darin, die bestehenden schlauer zu machen: Dokumente, die sich selbst ablegen. E-Mails, die vorsortiert ankommen. Ein Assistent, der Fragen zu Ihren eigenen Unterlagen beantwortet – ohne dass Ihre Daten das Haus verlassen. Wir richten das ein, schulen Ihr Team und bleiben ansprechbar.',
    },
    {
        icon: <Code className="w-8 h-8" />,
        title: 'Software nach Mass',
        text: 'Wenn Standardsoftware nicht passt, bauen wir Ihre: Weberweiterungen, Schnittstellen zwischen Systemen, die sich nicht kennen, Automatisierungen für Abläufe, die heute von Hand laufen – mit KI, wo sie hilft, und ohne, wo sie nur Etikett wäre.',
    },
];

export default function SoftwareEntwicklungPage() {
    const serviceSchema = generateServiceWithMultipleProvidersSchema(
        'KI & Software-Entwicklung', 'Software Development Service',
        'KI-Integration, Automatisierung und Software auf Mass für Schweizer KMU.',
        `${BASE_URL}/software-entwicklung`
    );
    const faqSchema = generateFAQSchema(softwareEntwicklungFaqs);
    const breadcrumbSchema = generateBreadcrumbListSchema([{ name: 'Home', url: BASE_URL }, { name: 'KI & Software-Entwicklung', url: `${BASE_URL}/software-entwicklung` }]);
    const webPageSchema = generateWebPageSchema(`${BASE_URL}/software-entwicklung`, 'KI & Software-Entwicklung', 'KI-Integration, Automatisierung und Software auf Mass für Schweizer KMU.');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

            {/* Hero Section */}
            <section className="relative py-12 md:py-16 lg:py-24 bg-gradient-to-br from-background via-background to-surface overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image
                        src="/images/hero_software_1768423249576.webp"
                        alt="KI und Software-Entwicklung für Schweizer KMU"
                        fill
                        className="object-cover"
                        priority
                        quality={85}
                        sizes="100vw"
                        aria-hidden="true"
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-xl">
                            <AnimatedSection animation="slideUp">
                                <p className="text-sm font-medium text-primary mb-4 uppercase tracking-wider">
                                    KI &amp; Software-Entwicklung
                                </p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                                    <span className="gradient-text">KI, die im Betrieb ankommt</span>
                                </h1>
                                <p className="text-xl text-text-secondary mb-8 max-w-2xl">
                                    Alle reden über künstliche Intelligenz. Wir bauen sie ein: in Ihre Abläufe, Ihre Dokumente, Ihre Software. Ohne Hype – mit messbarem Ergebnis. Und wo KI nichts bringt, sagen wir Ihnen das auch.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button variant="primary" size="lg" asChild>
                                        <Link href="/kontakt">
                                            Jetzt beraten lassen
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
                                    src="/images/hero_software_1768423249576.webp"
                                    alt="KI-Integration und Software-Entwicklung aus Winterthur"
                                    fill
                                    className="object-cover"
                                    priority
                                    quality={85}
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Angebotsblöcke */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" staggerDelay={0.15}>
                        {angebote.map((angebot, index) => (
                            <StaggerItem key={index}>
                                <MotionCard
                                    hoverY={-5}
                                    className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-150 h-full"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                        {angebot.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-text-primary mb-4">
                                        {angebot.title}
                                    </h2>
                                    <p className="text-text-secondary leading-relaxed">
                                        {angebot.text}
                                    </p>
                                </MotionCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Vertrauensabschnitt */}
            <section className="py-16 lg:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <AnimatedSection animation="slideUp">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                                Wir verkaufen nichts, was wir nicht selbst benutzen
                            </h2>
                            <p className="text-lg text-text-secondary leading-relaxed">
                                Unsere eigene Firma läuft auf dem, was wir Ihnen anbieten: KI unterstützt bei uns Entwicklung, Support-Diagnosen und Marketing – täglich, nicht als Experiment. Unsere Signage-Software und diese Website sind selbst entwickelt. Wenn wir Ihnen etwas empfehlen, haben wir es vorher an uns selbst ausprobiert.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* FAQs Section */}
            {softwareEntwicklungFaqs.length > 0 && (
                <section className="py-16 lg:py-24 bg-surface border-t border-border">
                    <div className="container mx-auto px-4">
                        <AnimatedSection animation="slideUp" className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                                Häufige Fragen
                            </h2>
                        </AnimatedSection>
                        <div>
                            <FAQList items={softwareEntwicklungFaqs} twoColumns />
                        </div>
                    </div>
                </section>
            )}

            {/* KI-News - server-seitig, ISR taeglich (AUFTRAG-007) */}
            <KINewsSection />

            {/* CTA Section */}
            <section className="py-16 lg:py-20 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="cta-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <circle cx="30" cy="30" r="2" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#cta-grid)" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <MotionCTA className="max-w-2xl mx-auto text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Wo könnte KI bei Ihnen Zeit sparen?
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-white text-primary hover:bg-white/90"
                                asChild
                            >
                                <Link href="/kontakt">
                                    Projekt besprechen
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-primary"
                                asChild
                            >
                                <a href="tel:+41522221818">
                                    <Phone className="w-5 h-5" />
                                    Jetzt anrufen
                                </a>
                            </Button>
                        </div>
                    </MotionCTA>
                </div>
            </section>
        </>
    );
}
