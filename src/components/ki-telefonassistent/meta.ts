import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/constants';

/** Vorhandenes OG-Bild des Bereichs (1200×630) */
export const KI_OG_BILD = '/og/ki-telefonassistent.png';

interface MetaEingabe {
    /** Pfad ab Domain, z. B. /ki-telefonassistent/funktionen */
    pfad: string;
    /** vollständiger Titel, höchstens 60 Zeichen (wird nicht mehr ergänzt) */
    titel: string;
    /** 120 bis 155 Zeichen */
    beschreibung: string;
    keywords?: string[];
    /** true = noindex, follow (z. B. Preisseite im Entwurf) */
    noindex?: boolean;
}

/**
 * Einheitliche Metadaten für alle Seiten des Bereichs: absoluter Titel
 * (ohne Template-Zusatz), Beschreibung, canonical, OpenGraph und Twitter.
 */
export function kiMetadata({ pfad, titel, beschreibung, keywords, noindex }: MetaEingabe): Metadata {
    const url = `${BASE_URL}${pfad}`;
    return {
        title: { absolute: titel },
        description: beschreibung,
        ...(keywords && { keywords }),
        alternates: {
            canonical: url,
            languages: { 'de-CH': url, 'x-default': url }, // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
        openGraph: {
            type: 'website',
            locale: 'de_CH',
            url,
            siteName: 'InfraOne IT Solutions',
            title: titel,
            description: beschreibung,
            images: [{ url: KI_OG_BILD, width: 1200, height: 630, alt: 'KI-Telefonassistent für Schweizer KMU – InfraOne' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: titel,
            description: beschreibung,
            images: [KI_OG_BILD],
        },
        ...(noindex && {
            robots: {
                index: false,
                follow: true,
                googleBot: { index: false, follow: true },
            },
        }),
    };
}
