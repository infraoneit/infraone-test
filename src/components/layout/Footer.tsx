import Link from 'next/link';
import { Fragment } from 'react';
import { Phone, Mail, MapPin, Clock, ExternalLink, Facebook, Instagram, Linkedin } from 'lucide-react';
import { FernwartungDialog } from '@/components/support/FernwartungDialog';
// [01.11.2026] AUFTRAG-116: sitewide Regionszeile (IT-Support nach Region)
import { IT_SUPPORT_REGIONEN } from '@/lib/regionen';

const regionen = IT_SUPPORT_REGIONEN;

const footerLinks = {
    services: [
        { label: 'IT-Support / Informatik', href: '/it-support' },
        { label: 'Cloud-Telefonie', href: '/cloud-telefonie' },
        { label: 'KI-Telefonassistent', href: '/ki-telefonassistent' },
        { label: 'IT-Systeme & Netzwerke', href: '/it-netzwerke' },
        { label: 'IT-Sicherheit', href: '/it-sicherheit' },
        { label: 'Microsoft 365', href: '/microsoft-365' },
        { label: 'WLAN', href: '/wlan' },
        // [01.11.2026] AUFTRAG-116: «Telefonie & Kommunikation» (/telefonie, nur Weiterleitung) entfernt — Cloud-Telefonie steht oben
        { label: 'Videoüberwachung', href: '/videoueberwachung' },
        { label: 'Webdesign', href: '/webdesign' },
        { label: 'KI & Software-Entwicklung', href: '/software-entwicklung' },
        { label: 'Digital Signage', href: '/digital-signage' },
    ],
    // AUFTRAG-110: eigene Spalte für den Bereich KI-Telefonassistent
    ki: [
        { label: 'Übersicht und Live-Test', href: '/ki-telefonassistent' },
        { label: 'Funktionen', href: '/ki-telefonassistent/funktionen' },
        { label: 'Anwendungen', href: '/ki-telefonassistent/anwendungen' },
        { label: 'Branchen', href: '/ki-telefonassistent/branchen' },
        { label: 'Schweizerdeutsch', href: '/ki-telefonassistent/schweizerdeutsch' },
        { label: 'So funktioniert es', href: '/ki-telefonassistent/so-funktioniert-es' },
        { label: 'Preise', href: '/ki-telefonassistent/preise' },
        { label: 'Sicherheit und Datenschutz', href: '/ki-telefonassistent/sicherheit-datenschutz' },
        { label: 'Häufige Fragen', href: '/ki-telefonassistent/faq' },
    ],
    company: [
        { label: 'Über uns', href: '/unternehmen' },
        { label: 'Partner', href: '/partner' },
        { label: 'Blog', href: '/blog' },
        { label: 'Kontakt', href: '/kontakt' },
    ],
    legal: [
        { label: 'AGB', href: '/agb' },
        { label: 'Datenschutz', href: '/datenschutz' },
        { label: 'Impressum', href: '/impressum' },
    ],
    partnerSites: [
        { label: 'cloud-telefonanlagen.ch', href: 'https://cloud-telefonanlagen.ch' },
        { label: 'informatik-schweiz.ch', href: 'https://informatik-schweiz.ch' },
        { label: 'informatik-support.ch', href: 'https://informatik-support.ch' },
        { label: 'werbebildschirme.ch', href: 'https://werbebildschirme.ch' },
    ],
};

const locations = [
    {
        city: 'Winterthur',
        isMain: true,
        street: 'Rudolf-Diesel-Strasse 25',
        zip: '8404',
        mapUrl: 'https://maps.app.goo.gl/KZcGeudRfoJSirLA9',
    },
    {
        city: 'Schaffhausen',
        isMain: false,
        street: 'Solenbergstrasse 35',
        zip: '8207',
        mapUrl: 'https://maps.google.com/?q=Solenbergstrasse+35+8207+Schaffhausen',
    },
    {
        city: 'Tägerwilen',
        isMain: false,
        street: 'Bahnhofstrasse 17',
        zip: '8274',
        mapUrl: 'https://maps.google.com/?q=Bahnhofstrasse+17+8274+Tägerwilen',
    },
    {
        city: 'Kleinandelfingen',
        isMain: false,
        street: 'Einfangstrasse 8',
        zip: '8451',
        mapUrl: 'https://maps.google.com/?q=Einfangstrasse+8+8451+Kleinandelfingen',
    },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-surface border-t border-border">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12 lg:py-16">
                {/* AUFTRAG-110: fünf Spalten mit KI-Telefonassistent; bei lg steht der Firmenblock über den vier Linkspalten */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8 lg:gap-10 xl:gap-x-8 xl:gap-y-12">
                    {/* Company Info & Locations */}
                    <div className="md:col-span-2 lg:col-span-4 xl:col-span-2">
                        <h3 className="text-lg font-bold text-text-primary mb-4">
                            InfraOne IT Solutions
                        </h3>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            Digitale Lösungen für KMU & Privatpersonen – IT-Support, Webdesign & Cloud Telefonanlagen in der Deutschschweiz.
                        </p>

                        {/* Locations Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-4 mb-6">
                            {locations.map((location) => (
                                <a
                                    key={location.city}
                                    href={location.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-text-primary text-sm flex items-center gap-1">
                                                {location.city}
                                                {location.isMain && (
                                                    <span className="text-xs text-primary">(Hauptsitz)</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-text-secondary">
                                                {location.street}<br />
                                                {location.zip} {location.city}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm">
                            <a
                                href="tel:+41522221818"
                                className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
                            >
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>052 222 18 18</span>
                            </a>
                            <a
                                href="mailto:info@infraone.ch"
                                className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
                            >
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>info@infraone.ch</span>
                            </a>
                            <div className="flex items-center gap-3 text-text-secondary">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>Mo-Fr 8:00-17:00</span>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="flex gap-3 mt-6">
                            <a
                                href="https://www.facebook.com/profile.php?id=61587228175938"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary hover:text-white text-text-secondary transition-all duration-150 flex items-center justify-center"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.instagram.com/infraoneit/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary hover:text-white text-text-secondary transition-all duration-150 flex items-center justify-center"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/infraone-it-solutions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary hover:text-white text-text-secondary transition-all duration-150 flex items-center justify-center"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h3 className="text-lg font-bold text-text-primary mb-4">Leistungen</h3>
                        <ul className="space-y-2">
                            {footerLinks.services.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* KI-Telefonassistent (AUFTRAG-110) */}
                    <div>
                        <h3 className="text-lg font-bold text-text-primary mb-4">KI-Telefonassistent</h3>
                        <ul className="space-y-2">
                            {footerLinks.ki.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company & Legal Links */}
                    <div>
                        <h3 className="text-lg font-bold text-text-primary mb-4">Unternehmen</h3>
                        <ul className="space-y-2 mb-6">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <h3 className="text-lg font-bold text-text-primary mb-4">Rechtliches</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support, Partner Sites & CTA */}
                    <div>
                        <h3 className="text-lg font-bold text-text-primary mb-4">Support</h3>
                        <FernwartungDialog
                            label="Fernwartung starten"
                            variant="primary"
                            size="sm"
                            className="mb-6"
                        />

                        <div className="bg-card p-4 rounded-xl border border-border mb-6">
                            <p className="text-sm font-semibold text-primary mb-2">
                                Antwort innert einem Arbeitstag
                            </p>
                            <p className="text-xs text-text-secondary">
                                Bei Notfällen erreichen Sie uns direkt: <a href="tel:+41522221818" className="text-primary underline underline-offset-2">052 222 18 18</a>.
                            </p>
                        </div>

                        {/* Partner Sites */}
                        <h3 className="text-sm font-bold text-text-primary mb-3">Unsere Portale</h3>
                        <ul className="space-y-1">
                            {footerLinks.partnerSites.map((site) => (
                                <li key={site.href}>
                                    <a
                                        href={site.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        {site.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* [01.11.2026] AUFTRAG-116: sitewide Links auf die sechs IT-Support-Regionen (zwischen Linkspalten und unterer Leiste) */}
                <nav aria-label="IT-Support nach Region" className="mt-10 pt-8 border-t border-border text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">IT-Support in Ihrer Region:</span>{' '}
                    {regionen.map((r, i) => (<Fragment key={r.slug}>{i > 0 && <span aria-hidden="true"> · </span>}<Link href={`/it-support/${r.slug}`} className="hover:text-primary underline-offset-4 hover:underline">{r.name}</Link></Fragment>))}
                </nav>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
                        <p>© {currentYear} InfraOne IT Solutions GmbH. Alle Rechte vorbehalten.</p>
                        <p className="text-center md:text-right">
                            <span className="gradient-text font-semibold">Digitale Lösungen. Echt. Einfach.</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
