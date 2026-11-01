import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Server, Phone, Video, Code, Palette, Tv, Plus, ShieldCheck, Cloud, Wifi } from 'lucide-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';

import { generateServiceSchema } from '@/lib/seo/schema';

const services = [
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
        title: 'Telefonie & Kommunikation',
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
        icon: Code,
        title: 'KI & Software-Entwicklung',
        subtitle: 'KI-Integration • Automatisierung • Software auf Mass',
        description: 'Massgeschneiderte Software, API-Entwicklung und Prozessautomatisierung für Ihr Unternehmen.',
        href: '/software-entwicklung',
    },
    {
        icon: Palette,
        title: 'Webdesign',
        subtitle: 'WordPress • Wix • Next.js',
        description: 'Moderne, SEO-optimierte Websites ab CHF 990 – von der Visitenkarten-Website bis zur Web-App.',
        href: '/webdesign',
    },
    {
        icon: Tv,
        title: 'Digital Signage',
        subtitle: 'Eigene Software • Custom Widgets',
        description: 'Display-Netzwerke für dynamische Inhalte – lokal betrieben, ohne Cloud-Abhängigkeit.',
        href: '/digital-signage',
    },
];

export default function LeistungenPage() {
    const serviceSchema = generateServiceSchema(
        'IT-Dienstleistungen',
        'ProfessionalService',
        'Alle IT-Dienstleistungen von InfraOne aus einer Hand: Netzwerke, Telefonie, Sicherheit, Webdesign und Software.',
        'https://infraone.ch/leistungen'
    );

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            {/* Hero */}
            <section className="relative py-16 lg:py-24 bg-gradient-to-br from-background via-background to-surface overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image src="/images/hero_homepage_1768423161913.webp" alt="Übersicht der IT-Dienstleistungen von InfraOne IT Solutions" fill className="object-cover" priority aria-hidden="true" />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <AnimatedSection animation="slideUp">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
                            <span className="gradient-text">Unsere Leistungen</span>
                        </h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                            Von der IT-Infrastruktur über Webdesign bis zur Videoüberwachung – alles aus einer Hand.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
                        {services.map((service, index) => (
                            <StaggerItem key={index}>
                                <Link href={service.href} className="block h-full group">
                                    <div
                                        className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-150 relative overflow-hidden"
                                    >
                                        {/* Accent Line at Top */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Icon */}
                                        <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <service.icon className="w-7 h-7" />
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                                            {service.title}
                                        </h2>

                                        {/* Subtitle */}
                                        <p className="text-xs font-medium text-primary mb-3">
                                            {service.subtitle}
                                        </p>

                                        {/* Description */}
                                        <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                                            {service.description}
                                        </p>

                                        {/* CTA Link */}
                                        <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                                            <span>Mehr erfahren</span>
                                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-150" />
                                        </div>
                                    </div>
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 lg:py-20 bg-primary">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Nicht sicher, welche Lösung passt?
                    </h2>
                    <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                        Wir beraten Sie gerne und finden gemeinsam die optimale Lösung für Ihr Unternehmen.
                    </p>
                    <Link
                        href="/kontakt"
                        className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-medium hover:bg-white/90 transition-colors"
                    >
                        Kostenloses Erstgespräch
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </>
    );
}
