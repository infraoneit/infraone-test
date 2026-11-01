import Link from 'next/link';
import {
    Server,
    Phone,
    Video,
    Code,
    Palette,
    Tv,
    ArrowRight,
    Plus,
    ShieldCheck,
    Cloud,
    Wifi,
    AudioLines
} from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';

const services: Array<{
    icon: typeof Server;
    title: string;
    subtitle: string;
    description: string;
    href: string;
    /** Breite Teaser-Karte über die ganze Rasterbreite (ab lg) */
    breit?: boolean;
}> = [
    {
        icon: Server,
        title: 'IT-Systeme & Netzwerke',
        subtitle: 'für Unternehmen & Privatpersonen',
        description: 'Stabile IT-Infrastrukturen mit Server, Cloud, Microsoft 365, Backup und Netzwerksicherheit.',
        href: '/it-netzwerke',
    },
    {
        icon: ShieldCheck,
        title: 'IT-Sicherheit',
        subtitle: 'Fortinet • Sophos • Veeam',
        description: 'Firewall, Virenschutz, Backup und Updates: Grundsicherung, die zum Betrieb passt.',
        href: '/it-sicherheit',
    },
    {
        icon: Cloud,
        title: 'Microsoft 365',
        subtitle: 'Einrichtung • Migration • Betrieb',
        description: 'E-Mail, Teams und Office sauber eingerichtet, migriert und betreut.',
        href: '/microsoft-365',
    },
    {
        icon: Wifi,
        title: 'WLAN',
        subtitle: 'Ubiquiti UniFi • TP-Link Omada',
        description: 'Flächendeckendes Firmen-WLAN: ausgemessen, installiert, überwacht.',
        href: '/wlan',
    },
    {
        icon: Phone,
        title: 'Cloud Telefonie',
        subtitle: 'peoplefone • 3CX • Yeastar',
        description: 'Moderne VoIP-Telefonanlagen für flexibles Arbeiten – im Büro, unterwegs oder im Homeoffice.',
        // [01.11.2026] AUFTRAG-116: direkt auf /cloud-telefonie statt auf die Weiterleitung /telefonie
        href: '/cloud-telefonie',
    },
    {
        icon: Video,
        title: 'Videoüberwachung',
        subtitle: 'Milestone • UniFi Protect • Aluha',
        description: 'Professionelle CCTV-Lösungen für Unternehmen und Privatkunden – datenschutzkonform.',
        href: '/videoueberwachung',
    },
    {
        icon: Palette,
        title: 'Webdesign',
        subtitle: 'WordPress • Wix • Next.js',
        description: 'Moderne, SEO-optimierte Websites ab CHF 990 – von der Visitenkarten-Website bis zur Web-App.',
        href: '/webdesign',
    },
    {
        icon: Code,
        title: 'KI & Software-Entwicklung',
        subtitle: 'KI-Integration • Automatisierung • Software auf Mass',
        description: 'Massgeschneiderte Software, API-Entwicklung und Prozessautomatisierung für Ihr Unternehmen.',
        href: '/software-entwicklung',
    },
    {
        icon: Tv,
        title: 'Digital Signage',
        subtitle: 'Eigene Software • Custom Widgets',
        description: 'Display-Netzwerke für dynamische Inhalte – lokal betrieben, ohne Cloud-Abhängigkeit.',
        href: '/digital-signage',
    },
    {
        // AUFTRAG-092: Teaser auf die Landingpage mit Demo-Anruf
        icon: AudioLines,
        title: 'KI-Telefonassistent',
        // AUFTRAG-098: Deutsch und Englisch zuverlässig, Schweizerdeutsch in Erprobung
        subtitle: 'Deutsch • Englisch • Schweizerdeutsch in Erprobung',
        description: 'Nimmt Anrufe entgegen, beantwortet Fragen aus Ihrem Wissen und nimmt Anliegen auf. Testen Sie ihn mit Ihrer Website – die KI ruft Sie an.',
        href: '/ki-telefonassistent',
        breit: true,
    },
];

export function ServicesSection() {
    return (
        // [31.10.2026] AUFTRAG-114: overflow-clip statt overflow-hidden - hidden machte die Section zum
        // Scroll-Container, animation-timeline: view() bezog sich auf sie, die letzten Karten
        // (mobil: KI-Telefonassistent) blieben unsichtbar. clip schneidet die Deko-Kreise genauso ab.
        <section className="py-20 lg:py-28 bg-background relative overflow-clip">
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-50 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <AnimatedSection animation="slideUp" className="text-center mb-16">
                    <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">
                        Branchenübergreifende Lösungen
                    </p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
                        Unsere IT-Kompetenzen für Ihr Projekt
                    </h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        Von der IT-Infrastruktur über Telefonie bis zur Videoüberwachung –
                        massgeschneiderte Lösungen aus einer Hand.
                    </p>
                </AnimatedSection>

                {/* Services Grid - 4 columns like Jungmann */}
                <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
                    {services.map((service, index) => (
                        <StaggerItem key={index} className={service.breit ? 'lg:col-span-3' : undefined}>
                            <Link href={service.href} className="block h-full group">
                                <div
                                    className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-150 relative overflow-hidden"
                                >
                                    {/* Accent Line at Top */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className={service.breit ? 'lg:flex lg:items-center lg:gap-6' : undefined}>
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors${service.breit ? ' lg:mb-0' : ''}`}>
                                            <service.icon className="w-7 h-7" />
                                        </div>

                                        <div className={service.breit ? 'lg:flex-1' : undefined}>
                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                                                {service.title}
                                            </h3>

                                            {/* Subtitle */}
                                            <p className="text-xs font-medium text-primary mb-3">
                                                {service.subtitle}
                                            </p>

                                            {/* Description */}
                                            <p className={`text-sm text-text-secondary mb-4 line-clamp-3${service.breit ? ' lg:mb-0' : ''}`}>
                                                {service.description}
                                            </p>
                                        </div>

                                        {/* CTA Link */}
                                        <div className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                                            <span>Mehr erfahren</span>
                                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-150" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                {/* CTA below services */}
                <AnimatedSection animation="slideUp" className="text-center mt-12">
                    <Link
                        href="/leistungen"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4"
                    >
                        Alle Leistungen im Überblick
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </AnimatedSection>
            </div>
        </section>
    );
}
