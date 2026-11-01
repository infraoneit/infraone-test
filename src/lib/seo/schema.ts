import { Organization, LocalBusiness, Service, FAQPage, WebSite, AboutPage, AggregateRating, WithContext } from 'schema-dts';

/**
 * Geo-Koordinaten für Schweizer Regionen
 */
export interface GeoCoordinates {
    latitude: number;
    longitude: number;
}

export interface RegionalData {
    name: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    geo?: GeoCoordinates;
}

/**
 * Geo-Koordinaten-Datenbank für Schweizer Städte/Regionen
 */
export const REGION_COORDINATES: Record<string, GeoCoordinates> = {
    winterthur: { latitude: 47.4996, longitude: 8.7243 },
    zuerich: { latitude: 47.3769, longitude: 8.5417 },
    schaffhausen: { latitude: 47.6976, longitude: 8.6348 },
    'st-gallen': { latitude: 47.4245, longitude: 9.3767 },
    thurgau: { latitude: 47.5536, longitude: 8.8989 }, // Frauenfeld
    andelfingen: { latitude: 47.5955, longitude: 8.6809 },
    rapperswil: { latitude: 47.2272, longitude: 8.8181 },
    basel: { latitude: 47.5596, longitude: 7.5886 },
    bern: { latitude: 46.9480, longitude: 7.4474 },
    luzern: { latitude: 47.0502, longitude: 8.3093 },
    aargau: { latitude: 47.3927, longitude: 8.0458 }, // Aarau
    zug: { latitude: 47.1715, longitude: 8.5159 },
    solothurn: { latitude: 47.2084, longitude: 7.5370 },
    graubuenden: { latitude: 46.8480, longitude: 9.5328 }, // Chur
};

/**
 * Generiert Organization Schema für die Homepage
 */
export function generateOrganizationSchema(): WithContext<Organization> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'InfraOne IT Solutions GmbH',
        url: 'https://infraone.ch',
        logo: 'https://infraone.ch/infraone-logo-schwarz.svg',
        description: 'IT-Support, Webdesign & Cloud Telefonanlagen in Winterthur, Schaffhausen & Zürich. Ihr Informatiker für KMU & Privatkunden.',
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Rudolf-Diesel-Strasse 25',
            addressLocality: 'Winterthur',
            addressRegion: 'Zürich',
            postalCode: '8404',
            addressCountry: 'CH',
        },
        contactPoint: [
            {
                '@type': 'ContactPoint',
                telephone: '+41522221818',
                contactType: 'customer service',
                availableLanguage: ['German'],
                areaServed: 'CH',
            },
            {
                '@type': 'ContactPoint',
                telephone: '+41765875055',
                contactType: 'emergency',
                availableLanguage: ['German'],
                areaServed: 'CH',
            },
        ],
        sameAs: [
            // Social Media Profile URLs können hier hinzugefügt werden
        ],
    };
}

/**
 * Generiert LocalBusiness Schema für regionale Service-Seiten
 */
export function generateLocalBusinessSchema(
    regionSlug: string,
    serviceName: string,
    serviceUrl: string,
    areaServedList?: string[]
): WithContext<LocalBusiness> {
    const geo = REGION_COORDINATES[regionSlug];

    const regionNames: Record<string, string> = {
        winterthur: 'Winterthur',
        zuerich: 'Zürich',
        schaffhausen: 'Schaffhausen',
        'st-gallen': 'St. Gallen',
        thurgau: 'Thurgau',
        andelfingen: 'Andelfingen',
        rapperswil: 'Rapperswil',
        basel: 'Basel',
        bern: 'Bern',
        luzern: 'Luzern',
        aargau: 'Aargau',
        zug: 'Zug',
        solothurn: 'Solothurn',
        graubuenden: 'Graubuenden',
    };

    const regionName = regionNames[regionSlug] || regionSlug;

    // Physische Standorte mit vollständiger Adresse
    const physicalLocations: Record<string, { street: string; zip: string; image: string; region: string }> = {
        'winterthur': {
            street: 'Rudolf-Diesel-Strasse 25',
            zip: '8404',
            region: 'Zürich',
            image: '/images/unternehmen/infraone-hauptsitz-winterthur.webp'
        },
        'schaffhausen': {
            street: 'Solenbergstrasse 35',
            zip: '8207',
            region: 'Schaffhausen',
            image: '/images/unternehmen/infraone-filiale-schaffhausen.webp'
        },
        'thurgau': {
            street: 'Bahnhofstrasse 17',
            zip: '8274',
            region: 'Thurgau',
            image: '/images/unternehmen/infraone-filiale-taegerwilen.webp'
        }
    };

    const locationData = physicalLocations[regionSlug];

    // Area Served aus CMS oder Standard
    const areaServed = areaServedList && areaServedList.length > 0
        ? areaServedList.map(area => ({ '@type': 'Place' as const, name: area }))
        : [{ '@type': 'Place' as const, name: regionName }];

    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: `InfraOne IT Solutions - ${serviceName} ${regionName}`,
        description: `${serviceName} Dienstleistungen in ${regionName} von InfraOne IT Solutions GmbH`,
        url: serviceUrl,
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        image: locationData
            ? `${BASE_URL}${locationData.image}`
            : `${BASE_URL}/infraone-logo-schwarz.svg`,
        address: {
            '@type': 'PostalAddress',
            ...(locationData && {
                streetAddress: locationData.street,
                postalCode: locationData.zip,
                addressRegion: locationData.region,
            }),
            addressLocality: regionName,
            addressCountry: 'CH',
        },
        ...(geo && {
            geo: {
                '@type': 'GeoCoordinates',
                latitude: geo.latitude,
                longitude: geo.longitude,
            },
        }),
        priceRange: '$$',
        areaServed: areaServed,
    };
}
/**
 * Generiert WebSite Schema für die Homepage (Sitelinks Search Box Support)
 */
/**
 * WebSite-Schema.
 *
 * Ohne SearchAction: Die frueher deklarierte Suche zeigte auf /search?q=...,
 * diese Route existiert auf der Seite gar nicht. Eine Suchfunktion zu
 * behaupten, die es nicht gibt, ist eine Falschangabe gegenueber Google.
 * Kommt zurueck, sobald es eine echte Suche gibt.
 *
 * Gleiche @id wie generateSitewideWebSiteSchema, damit beide Vorkommen von
 * Google als dieselbe Entitaet erkannt und zusammengefuehrt werden.
 */
export function generateWebSiteSchema(): WithContext<WebSite> {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        name: 'InfraOne IT Solutions',
        url: BASE_URL,
    };
}

/**
 * Generiert das Haupt-LocalBusiness Schema für die Homepage (Winterthur HQ)
 */
export function generateMainBusinessSchema(): WithContext<LocalBusiness> {
    return {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService', // Spezifischer als LocalBusiness
        // Gleiche @id wie die Hauptorganisation: Ohne sie sieht Google hier eine
        // zweite, unabhaengige Firma statt derselben Entitaet.
        '@id': `${BASE_URL}/#organization`,
        name: 'InfraOne IT Solutions GmbH',
        image: 'https://infraone.ch/infraone-logo-schwarz.svg',
        url: 'https://infraone.ch',
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        priceRange: '$$',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Rudolf-Diesel-Strasse 25',
            addressLocality: 'Winterthur',
            addressRegion: 'Zürich',
            postalCode: '8404',
            addressCountry: 'CH',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 47.4996,
            longitude: 8.7243,
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '17:00',
            },
        ],
        specialOpeningHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '08:00',
                closes: '23:00',
                description: 'IT-Notfall-Support verfügbar',
            },
        ],
        sameAs: [
            // Hier könnten LinkedIn, Facebook etc. URLs stehen
        ],
        areaServed: {
            '@type': 'GeoCircle',
            geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: 47.4996,
                longitude: 8.7243,
            },
            geoRadius: '50000', // 50km Umkreis
        },
    };
}

/**
 * Generiert Service Schema für Hauptseiten
 */
export function generateServiceSchema(
    serviceName: string,
    serviceType: string,
    description: string,
    serviceUrl: string,
    areaServed: string[] = ['Schweiz', 'Zürich', 'Winterthur', 'Schaffhausen', 'Thurgau', 'St. Gallen']
): WithContext<Service> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceName,
        serviceType: serviceType,
        description: description,
        url: serviceUrl,
        provider: {
            '@type': 'Organization',
            name: 'InfraOne IT Solutions GmbH',
            url: 'https://infraone.ch',
        },
        areaServed: areaServed.map((area) => ({
            '@type': 'Place',
            name: area,
        })),
    };
}

/**
 * Generiert ProfessionalService Schema für Remote-Dienstleistungen (z.B. Webdesign)
 * Wichtig: Kein lokaler Geo-Standort, da 100% remote möglich
 */
export function generateProfessionalServiceSchema(
    regionSlug: string,
    serviceName: string,
    serviceUrl: string,
    areaServedList?: string[]
): WithContext<LocalBusiness> {
    const regionNames: Record<string, string> = {
        winterthur: 'Winterthur',
        zuerich: 'Zürich',
        schaffhausen: 'Schaffhausen',
        'st-gallen': 'St. Gallen',
        thurgau: 'Thurgau',
        basel: 'Basel',
        bern: 'Bern',
        luzern: 'Luzern',
        aargau: 'Aargau',
        zug: 'Zug',
        solothurn: 'Solothurn',
        graubuenden: 'Graubünden',
    };

    const regionName = regionNames[regionSlug] || regionSlug;

    return {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: `InfraOne ${serviceName} - ${regionName}`,
        description: `${serviceName} Dienstleistungen für Unternehmen in ${regionName}. 100% remote möglich, persönliche Beratung auf Wunsch.`,
        url: serviceUrl,
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        // Echter Firmenstandort (nicht Region)
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Rudolf-Diesel-Strasse 25',
            addressLocality: 'Winterthur',
            addressRegion: 'Zürich',
            postalCode: '8404',
            addressCountry: 'CH',
        },
        // Bediente Region (aus Parameter oder Standard)
        areaServed: areaServedList && areaServedList.length > 0
            ? areaServedList.map(area => ({ '@type': 'Place', name: area }))
            : { '@type': 'Place', name: regionName },
        priceRange: '$$',
        // Keine Geo-Koordinaten, da Remote-Service
    };
}

/**
 * Generiert FAQPage Schema
 */
export function generateFAQSchema(
    faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

/**
 * Generiert AboutPage Schema für die Unternehmensseite
 */
export function generateAboutPageSchema(): WithContext<AboutPage> {
    return {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'Über InfraOne IT Solutions',
        description: 'Erfahren Sie mehr über InfraOne IT Solutions GmbH, unser Team, unsere Werte und unsere Geschichte.',
        url: 'https://infraone.ch/unternehmen',
        mainEntity: {
            '@type': 'Organization',
            name: 'InfraOne IT Solutions GmbH',
            url: 'https://infraone.ch',
            logo: 'https://infraone.ch/infraone-logo-schwarz.svg',
        },
    };
}

/**
 * Helper-Funktion zum Rendern von JSON-LD Schema im <head>
 * Verwendung: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 */
export function renderJsonLd(schema: any): string {
    return JSON.stringify(schema);
}

/**
 * HUB & SPOKE SCHEMA FUNCTIONS
 * Für saubere Hub-&-Spoke-Struktur mit korrekten Relationen
 */

import { BASE_URL } from '@/lib/constants';
import { PAKETE, PREISE_FREIGEGEBEN } from '@/lib/ki-telefonassistent-preise';
// [01.11.2026] AUFTRAG-116: Aktualitätssignale (Git-Daten je Seite) und Hub-Pfad für speakable
import { datumTag, seitenDatum } from '@/lib/seo/lastmod';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';

/**
 * [01.11.2026] AUFTRAG-116 (P6): Entitäts-Merkmale der Firma — identisch in generateOrganizationSchemaExtended()
 * und generateSitewideLocalBusinessSchema() (gleiche @id /#organization). UID aus dem Impressum
 * (impressum/page.tsx). `numberOfEmployees` entfällt (keine Belegquelle; 10 im Schema vs. 5 in llms.txt).
 */
export const ENTITAET_MERKMALE = {
    legalName: 'InfraOne IT Solutions GmbH',
    vatID: 'CHE-288.114.187 MWST',
    taxID: 'CHE-288.114.187',
    identifier: { '@type': 'PropertyValue', propertyID: 'UID', value: 'CHE-288.114.187' },
    knowsAbout: ['KI-Telefonassistent', 'Cloud-Telefonie', 'VoIP', 'IT-Support', 'Webdesign', 'Digital Signage', 'Microsoft 365', 'IT-Sicherheit', 'IT-Netzwerke', 'WLAN', 'Videoüberwachung'],
    knowsLanguage: ['de-CH', 'de', 'en'],
} as const;

/** [01.11.2026] AUFTRAG-116 (P6): bediente Gebiete (Land und Hauptregionen) */
export const ENTITAET_GEBIETE = [
    { '@type': 'Country', name: 'Schweiz' },
    { '@type': 'AdministrativeArea', name: 'Winterthur' },
    { '@type': 'AdministrativeArea', name: 'Zürich' },
    { '@type': 'AdministrativeArea', name: 'Schaffhausen' },
    { '@type': 'AdministrativeArea', name: 'Thurgau' },
    { '@type': 'AdministrativeArea', name: 'St. Gallen' },
] as const;

/**
 * [01.11.2026] AUFTRAG-116 (P6): Umkreis um den Hauptsitz — derselbe GeoCircle wie in generateMainBusinessSchema()
 * (gleiche @id). Im sitewide LocalBusiness steht er VOR der Gebietsliste (areaServed: [GeoCircle, …Liste]).
 */
const GEO_CIRCLE_HAUPTSITZ = {
    '@type': 'GeoCircle',
    geoMidpoint: { '@type': 'GeoCoordinates', latitude: 47.4996, longitude: 8.7243 },
    geoRadius: '50000',
} as const;

/**
 * Generiert LocalBusiness Schema für das Layout (sitewide)
 * Mit @id für Referenzierung durch andere Schemas
 */
export function generateSitewideLocalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${BASE_URL}/#organization`,
        name: 'InfraOne IT Solutions GmbH',
        // [01.11.2026] AUFTRAG-116: legalName, vatID, taxID, identifier (UID), knowsAbout, knowsLanguage, areaServed
        ...ENTITAET_MERKMALE,
        areaServed: [GEO_CIRCLE_HAUPTSITZ, ...ENTITAET_GEBIETE],
        url: BASE_URL,
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        address: {
            '@type': 'PostalAddress',
            // Ohne streetAddress ist der Eintrag fuer die lokale Suche unvollstaendig.
            streetAddress: 'Rudolf-Diesel-Strasse 25',
            addressLocality: 'Winterthur',
            addressRegion: 'Zürich',
            postalCode: '8404',
            addressCountry: 'CH',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 47.4996,
            longitude: 8.7243,
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '17:00',
            },
        ],
        priceRange: '$$',
    };
}

/**
 * Generiert WebSite Schema für das Layout (sitewide)
 * Mit @id für Referenzierung
 */
export function generateSitewideWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'InfraOne IT Solutions',
        publisher: { '@id': `${BASE_URL}/#organization` },
    };
}

/**
 * Generiert Service Schema für Hub-Seite (/cloud-telefonie)
 */
export function generateHubServiceSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${BASE_URL}/cloud-telefonie#service`,
        name: 'Cloud-Telefonie',
        serviceType: ['Cloud-Telefonie', 'VoIP', 'Hosted PBX'],
        provider: { '@id': `${BASE_URL}/#organization` },
        url: `${BASE_URL}/cloud-telefonie`,
        areaServed: { '@type': 'Country', name: 'Switzerland' },
    };
}

/**
 * Generiert Service Schema für Spoke-Seite (z.B. /cloud-telefonie/winterthur)
 */
export function generateSpokeServiceSchema(regionSlug: string, regionName: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${BASE_URL}/cloud-telefonie/${regionSlug}#service`,
        name: `Cloud-Telefonie in ${regionName}`,
        serviceType: ['Cloud-Telefonie', 'VoIP', 'Hosted PBX'],
        provider: { '@id': `${BASE_URL}/#organization` },
        url: `${BASE_URL}/cloud-telefonie/${regionSlug}`,
        areaServed: { '@type': 'AdministrativeArea', name: regionName },
        isPartOf: { '@id': `${BASE_URL}/cloud-telefonie#service` },
    };
}

/**
 * Generiert BreadcrumbList Schema
 */
export function generateBreadcrumbListSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/**
 * Generiert WebPage Schema
 */
export function generateWebPageSchema(url: string, name: string, description?: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url: url,
        name: name,
        ...(description && { description }),
        isPartOf: { '@id': `${BASE_URL}/#website` },
    };
}

/**
 * IT-SUPPORT HUB & SPOKE SCHEMA FUNCTIONS
 * Spezifische Schemas für IT-Support Cluster (Hub + 6 Spokes)
 */

/**
 * Generiert IT-Support Hub Schema (ProfessionalService)
 * Für /it-support Hauptseite
 */
export function generateITSupportHubSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': `${BASE_URL}/it-support#service`,
        name: 'IT-Support & Informatik-Support',
        serviceType: ['Computer Support', 'IT Support', 'Technical Support', 'Network Support'],
        description: 'Professioneller IT-Support für KMU und Privatpersonen in der Schweiz. Remote-Support innert Minuten, Vor-Ort-Service innerhalb 24h.',
        provider: { '@id': `${BASE_URL}/#organization` },
        url: `${BASE_URL}/it-support`,
        image: `${BASE_URL}/infraone-logo-schwarz.svg`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Rudolf-Diesel-Strasse 25',
            addressLocality: 'Winterthur',
            addressRegion: 'Zürich',
            postalCode: '8404',
            addressCountry: 'CH',
        },
        areaServed: { '@type': 'Country', name: 'Switzerland' },
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CHF',
            lowPrice: '145',
            highPrice: '200',
            priceSpecification: [
                {
                    '@type': 'UnitPriceSpecification',
                    price: '145',
                    priceCurrency: 'CHF',
                    name: 'Remote-Support',
                },
                {
                    '@type': 'UnitPriceSpecification',
                    price: '145',
                    priceCurrency: 'CHF',
                    name: 'Vor-Ort-Support Privat',
                },
            ],
        },
    };
}

/**
 * Generiert OfferCatalog Schema für IT-Support Preise
 * Für die Preisliste auf /it-support
 */
export function generateOfferCatalogSchema(priceCards: Array<{ title: string; description: string; price: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'OfferCatalog',
        name: 'IT-Support Preise',
        itemListElement: priceCards.map((card, index) => {
            const priceMatch = card.price.match(/\d+/);
            const priceValue = priceMatch ? priceMatch[0] : undefined;

            return {
                '@type': 'Offer',
                position: index + 1,
                itemOffered: {
                    '@type': 'Service',
                    name: card.title,
                    description: card.description,
                },
                ...(priceValue && {
                    price: priceValue,
                    priceCurrency: 'CHF',
                }),
            };
        }),
    };
}

/**
 * Generiert ItemList Schema für Listen (z.B. Häufige Probleme)
 */
export function generateItemListSchema(items: string[], listName: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: listName,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item,
        })),
    };
}

/**
 * Generiert LocalBusiness + ITService Schema für Standort-Spokes (mit Büro)
 * Für /it-support/winterthur, /andelfingen, /schaffhausen, /thurgau
 */
export function generateITServiceLocalBusinessSchema(
    regionSlug: string,
    regionName: string,
    address: {
        street?: string;
        postalCode: string;
        addressLocality: string;
    },
    openingHours: string[] = ['Mo–Fr 08:00–17:00'],
    emergencyNote: string = 'Notfall-Support verfügbar bis 23:00 Uhr'
) {
    const geo = REGION_COORDINATES[regionSlug];

    return {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'ComputerStore'],
        '@id': `${BASE_URL}/it-support/${regionSlug}#business`,
        name: `InfraOne IT Solutions - ${regionName}`,
        url: `${BASE_URL}/it-support/${regionSlug}`,
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        address: {
            '@type': 'PostalAddress',
            ...(address.street && { streetAddress: address.street }),
            postalCode: address.postalCode,
            addressLocality: address.addressLocality,
            addressCountry: 'CH',
        },
        ...(geo && {
            geo: {
                '@type': 'GeoCoordinates',
                latitude: geo.latitude,
                longitude: geo.longitude,
            },
        }),
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '17:00',
        },
        specialOpeningHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '08:00',
            closes: '23:00',
            description: emergencyNote,
        },
        priceRange: '$$',
        areaServed: {
            '@type': 'AdministrativeArea',
            name: regionName,
        },
    };
}

/**
 * Generiert Virtual Spoke Schema für Regionen ohne physisches Büro
 * Für /it-support/zuerich, /st-gallen
 */
export function generateVirtualSpokeSchema(
    regionSlug: string,
    regionName: string,
    providerBusinessId: string // z.B. '/it-support/winterthur#business'
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${BASE_URL}/it-support/${regionSlug}#service`,
        name: `IT-Support ${regionName}`,
        serviceType: ['Computer Support', 'IT Support', 'Technical Support'],
        description: `IT-Support-Dienstleistungen für ${regionName}. Bedient durch unser qualifiziertes Team.`,
        provider: { '@id': providerBusinessId },
        url: `${BASE_URL}/it-support/${regionSlug}`,
        areaServed: {
            '@type': 'AdministrativeArea',
            name: regionName,
        },
        isPartOf: { '@id': `${BASE_URL}/it-support#service` },
    };
}

/**
 * Generiert AggregateRating Schema für Testimonials (Webdesign Hub - INTERNE Reviews)
 */
export function generateAggregateRatingSchema() {
    return {
        '@type': 'AggregateRating',
        '@id': `${BASE_URL}/webdesign#rating`,
        ratingValue: '5',
        bestRating: '5',
        worstRating: '1',
        ratingCount: '3',
        review: [
            {
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: 'Albert Sulejmani',
                },
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: '5',
                    bestRating: '5',
                },
                reviewBody: 'Unsere neue Website fühlt sich endlich so professionell an wie unsere Arbeit. Die Seite ist klar aufgebaut, schnell und auf das Wesentliche reduziert. Wir wurden von Anfang an verstanden und konnten unsere Inhalte Schritt für Schritt gemeinsam sauber aufbauen. Änderungen sind heute unkompliziert möglich, genau so wie wir es wollten.',
                itemReviewed: {
                    '@type': 'Service',
                    name: 'Webdesign & Website-Entwicklung',
                    provider: {
                        '@type': 'Organization',
                        name: 'InfraOne IT Solutions GmbH',
                    },
                },
            },
            {
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: 'Salvatore Irrera',
                },
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: '5',
                    bestRating: '5',
                },
                reviewBody: 'Von der ersten Idee bis zur fertigen Website lief alles strukturiert und transparent. Die neue Seite ist modern, übersichtlich und leicht zu pflegen. Besonders schätzen wir, dass wir Inhalte selbst anpassen können, ohne jedes Mal extern Hilfe zu brauchen.',
                itemReviewed: {
                    '@type': 'Service',
                    name: 'Webdesign & Website-Entwicklung',
                    provider: {
                        '@type': 'Organization',
                        name: 'InfraOne IT Solutions GmbH',
                    },
                },
            },
            {
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: 'Peer Höppli',
                },
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: '5',
                    bestRating: '5',
                },
                reviewBody: 'Die Website wurde extrem schnell umgesetzt und bringt unsere Projekte genau so zur Geltung, wie wir es uns vorgestellt haben. Klare Gestaltung, einfache Bedienung und ein sehr gutes Preis-Leistungs-Verhältnis. Wir sind rundum zufrieden.',
                itemReviewed: {
                    '@type': 'Service',
                    name: 'Webdesign & Website-Entwicklung',
                    provider: {
                        '@type': 'Organization',
                        name: 'InfraOne IT Solutions GmbH',
                    },
                },
            },
        ],
    };
}

/**
 * ========================================
 * NEUE SCHEMA-FUNKTIONEN FÜR HOMEPAGE & ERWEITERTE SEITEN
 * ========================================
 */

/**
 * Generiert erweiterte Organization Schema mit Social Media Links
 * Für die Startseite
 */
export function generateOrganizationSchemaExtended(): WithContext<Organization> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'InfraOne IT Solutions GmbH',
        url: BASE_URL,
        logo: `${BASE_URL}/infraone-logo-schwarz.svg`,
        image: `${BASE_URL}/images/infraone-og-image.jpg`,
        description: 'IT-Support, Webdesign & Cloud-Telefonanlagen in Winterthur, Schaffhausen & Zürich. Ihr kompetenter IT-Partner für KMU & Privatkunden in der Ostschweiz.',
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Rudolf-Diesel-Strasse 25',
            addressLocality: 'Winterthur',
            addressRegion: 'Zürich',
            postalCode: '8404',
            addressCountry: 'CH',
        },
        contactPoint: [
            {
                '@type': 'ContactPoint',
                telephone: '+41522221818',
                contactType: 'customer service',
                availableLanguage: ['German'],
                areaServed: 'CH',
            },
            {
                '@type': 'ContactPoint',
                telephone: '+41765875055',
                contactType: 'emergency',
                availableLanguage: ['German'],
                areaServed: 'CH',
            },
        ],
        sameAs: [
            'https://www.facebook.com/profile.php?id=61587228175938',
            'https://www.instagram.com/infraoneit/',
            'https://www.linkedin.com/in/infraone-it-solutions',
        ],
        foundingDate: '2015',
        // [01.11.2026] AUFTRAG-116: numberOfEmployees entfernt (keine Belegquelle); Entitäts-Merkmale und Gebiete ergänzt
        ...ENTITAET_MERKMALE,
        areaServed: ENTITAET_GEBIETE,
    };
}

/**
 * Generiert LocalBusiness Schema für 4 physische Standorte (Homepage)
 */
export function generateContactPageLocalBusinessSchema(
    location: {
        city: string;
        street: string;
        zip: string;
        isMain: boolean;
        mapUrl: string;
    },
    businessId: string
) {
    // Umlaute vereinheitlichen: Der Aufrufer uebergibt city.toLowerCase(), woraus
    // bei "Tägerwilen" die @id "#business-tägerwilen" wurde - die Service-Schemas
    // verweisen aber auf "#business-taegerwilen". Damit lief die Referenz ins Leere.
    const normalisiert = businessId
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss');
    const geo = REGION_COORDINATES[location.city.toLowerCase()];

    // Image-Mapping für Standorte
    const imageMapping: Record<string, string> = {
        'winterthur': '/images/unternehmen/infraone-hauptsitz-winterthur.webp',
        'schaffhausen': '/images/unternehmen/infraone-filiale-schaffhausen.webp',
        'tägerwilen': '/images/unternehmen/infraone-filiale-taegerwilen.webp',
        'taegerwilen': '/images/unternehmen/infraone-filiale-taegerwilen.webp', // Fallback ohne Umlaut
        'kleinandelfingen': '/images/unternehmen/infraone-filiale-kleinandelfingen.webp',
    };
    const locationImage = imageMapping[businessId] || '/infraone-logo-schwarz.svg';

    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${BASE_URL}/#business-${normalisiert}`,
        // Filialen brauchen unterscheidbare Namen. Vorher hiessen alle drei
        // "InfraOne IT Solutions " (mit Leerzeichen am Ende) - fuer Google
        // waren sie damit nicht auseinanderzuhalten.
        name: location.isMain
            ? 'InfraOne IT Solutions GmbH - Hauptsitz'
            : `InfraOne IT Solutions - ${location.city}`,
        url: BASE_URL,
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        image: `${BASE_URL}${locationImage}`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: location.street,
            postalCode: location.zip,
            addressLocality: location.city,
            addressCountry: 'CH',
        },
        ...(geo && {
            geo: {
                '@type': 'GeoCoordinates',
                latitude: geo.latitude,
                longitude: geo.longitude,
            },
        }),
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '17:00',
        },
        specialOpeningHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '08:00',
            closes: '23:00',
            description: 'IT-Notfall-Support verfügbar',
        },
        priceRange: '$$',
        hasMap: location.mapUrl,
    };
}

/**
 * Generiert ContactPage Schema
 */
export function generateContactPageSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        '@id': `${BASE_URL}/kontakt#webpage`,
        url: `${BASE_URL}/kontakt`,
        name: 'Kontakt - InfraOne IT Solutions',
        description: 'Kontaktieren Sie InfraOne IT Solutions an 4 Standorten in der Ostschweiz. Winterthur, Schaffhausen, Tägerwilen, Kleinandelfingen.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
    };
}

/**
 * Generiert Person Schema (z.B. für CEO auf Über-uns-Seite)
 */
export function generatePersonSchema(
    name: string,
    jobTitle: string,
    bio: string,
    email?: string,
    linkedin?: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: name,
        jobTitle: jobTitle,
        description: bio,
        worksFor: {
            '@type': 'Organization',
            '@id': `${BASE_URL}/#organization`,
            name: 'InfraOne IT Solutions GmbH',
        },
        ...(email && { email: email }),
        ...(linkedin && { sameAs: [linkedin] }),
    };
}

/**
 * Generiert externe Review Schemas (Google Reviews)
 * Für die Startseite
 */
interface ExternalReview {
    name: string;
    company: string;
    quote: string;
    rating: number;
    service: string;
    googleReviewUrl: string;
}

export function generateExternalReviewsSchema(reviews: ExternalReview[]) {
    return reviews.map((review) => ({
        '@type': 'Review',
        author: {
            '@type': 'Person',
            name: review.name,
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating.toString(),
            bestRating: '5',
        },
        reviewBody: review.quote,
        url: review.googleReviewUrl,
        itemReviewed: {
            '@type': 'Organization',
            '@id': `${BASE_URL}/#organization`,
            name: 'InfraOne IT Solutions GmbH',
        },
    }));
}

/**
 * Generiert AggregateRating für Homepage mit externen Google Reviews
 */
export function generateHomepageAggregateRatingSchema(reviews: ExternalReview[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'AggregateRating',
        '@id': `${BASE_URL}/#aggregateRating`,
        ratingValue: '5',
        bestRating: '5',
        worstRating: '1',
        ratingCount: reviews.length.toString(),
        itemReviewed: {
            '@type': 'Organization',
            '@id': `${BASE_URL}/#organization`,
        },
    };
}

/**
 * Generiert OfferCatalog für Homepage (Hauptdienstleistungen)
 */
export function generateHomepageOfferCatalogSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'OfferCatalog',
        name: 'InfraOne IT Solutions - Dienstleistungen',
        itemListElement: [
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'IT-Support & Managed Services',
                    description: 'Professioneller IT-Support für KMU in Winterthur, Zürich und Ostschweiz - vor Ort oder remote',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'IT-Systeme & Netzwerke',
                    description: 'Stabile IT-Infrastrukturen mit Server, Cloud, Microsoft 365, Backup und Netzwerksicherheit',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Webdesign & Website-Entwicklung',
                    description: 'Moderne, SEO-optimierte Websites ab CHF 990 - Wix, WordPress oder Next.js',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Cloud-Telefonie & VoIP',
                    description: 'Cloud-Telefonanlagen mit 3CX und Peoplefone - flexibel, skalierbar, professionell',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Videoüberwachung & Sicherheitssysteme',
                    description: 'Professionelle CCTV-Lösungen und IP-Kameras für Unternehmen und Privatkunden',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'KI & Software-Entwicklung',
                    description: 'Individuelle Softwarelösungen und Web-Applikationen für Ihr Unternehmen',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Digital Signage',
                    description: 'Digitale Beschilderung und Content-Management für Bildschirme und Displays',
                },
            },
        ],
    };
}

/**
 * Generiert Product Schema (z.B. für Webdesign-Pakete)
 */
export function generateProductSchema(
    name: string,
    price: string,
    description: string,
    features: string[],
    imageUrl?: string
) {
    const priceMatch = price.match(/\d+/);
    const priceValue = priceMatch ? priceMatch[0] : undefined;

    return {
        '@type': 'Product',
        name: name,
        description: description,
        ...(imageUrl && { image: imageUrl }),
        offers: {
            '@type': 'Offer',
            price: priceValue,
            priceCurrency: 'CHF',
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: 'InfraOne IT Solutions GmbH',
            },
        },
        ...(features.length > 0 && {
            additionalProperty: features.map(feature => ({
                '@type': 'PropertyValue',
                name: 'Feature',
                value: feature,
            })),
        }),
    };
}

/**
 * Generiert WebDesign Service Schema (spezifisch für Webdesign Hub)
 */
export function generateWebDesignServiceSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${BASE_URL}/webdesign#service`,
        serviceType: 'Web Design',
        name: 'Webdesign & Website-Entwicklung',
        description: 'Professionelles Webdesign in der Schweiz. Moderne, SEO-optimierte Websites ab CHF 990.',
        provider: {
            '@type': 'Organization',
            '@id': `${BASE_URL}/#organization`,
        },
        url: `${BASE_URL}/webdesign`,
        areaServed: {
            '@type': 'Country',
            name: 'Switzerland',
        },
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CHF',
            lowPrice: '990',
            highPrice: '4990',
            offerCount: '3',
        },
    };
}

/**
 * Generiert 3 Webdesign-Pakete als Product Schemas
 */
export function generateWebdesignPackageProducts() {
    return [
        generateProductSchema(
            'Webdesign Starter-Paket',
            'CHF 990',
            'Perfekt für Startups und Kleinunternehmen. Bis zu 5 Seiten, responsive Design, SEO-Grundoptimierung.',
            ['Responsive Design', 'SEO-Grundoptimierung', 'Kontaktformular', 'SSL-Zertifikat', '3 Monate Support'],
            `${BASE_URL}/images/offer/webdesign-starter-paket.png`
        ),
        generateProductSchema(
            'Webdesign KMU-Paket',
            'CHF 2490',
            'Für etablierte Unternehmen. Bis zu 15 Seiten, individuelles Design, Blog-Funktion, erweiterte SEO.',
            ['Individuelles Design', 'Erweiterte SEO', 'Blog-Funktion', 'Google Analytics', 'Newsletter-Integration', 'Social Media Anbindung', '6 Monate Support'],
            `${BASE_URL}/images/offer/webdesign-kmu-paket.png`
        ),
        generateProductSchema(
            'Webdesign Pro-Paket',
            'CHF 4990',
            'Maximale Performance & Kontrolle. Headless CMS, custom Development, unbegrenzte Seiten.',
            ['Unbegrenzte Seiten', 'Headless CMS', 'Maximale Performance', 'Vollständige SEO', 'Custom Entwicklung', 'API-Integration', 'Multi-Language', '12 Monate Support'],
            `${BASE_URL}/images/offer/webdesign-pro-paket.png`
        ),
    ];
}

/**
 * Generiert Blog Schema für Blog-Übersichtsseite
 */
export function generateBlogSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${BASE_URL}/blog#blog`,
        name: 'InfraOne IT Solutions Blog',
        description: 'IT-Wissen, Praxistipps und Neuigkeiten',
        url: `${BASE_URL}/blog`,
        publisher: {
            '@type': 'Organization',
            '@id': `${BASE_URL}/#organization`,
        },
    };
}

/**
 * Generiert BlogPosting Schema für einzelne Artikel
 */
export function generateBlogPostingSchema(
    title: string,
    excerpt: string,
    slug: string,
    datePublished: string,
    category: string,
    readingTime: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${BASE_URL}/blog/${slug}#article`,
        headline: title,
        description: excerpt,
        url: `${BASE_URL}/blog/${slug}`,
        datePublished: datePublished,
        author: {
            '@type': 'Organization',
            name: 'InfraOne IT Solutions GmbH',
            url: BASE_URL,
        },
        publisher: {
            '@type': 'Organization',
            '@id': `${BASE_URL}/#organization`,
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/blog/${slug}`,
        },
        articleSection: category,
        timeRequired: readingTime,
        inLanguage: 'de-CH',
    };
}

/**
 * Generiert Speakable Schema für Voice Search (Blog-Artikel)
 */
export function generateSpeakableSchema(speakableSelectors: string[]) {
    return {
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: speakableSelectors,
        },
    };
}

/**
 * Generiert Service Schema mit mehreren Provider-Standorten
 * Für Standard-Services ohne regionale Spokes
 */
export function generateServiceWithMultipleProvidersSchema(
    serviceName: string,
    serviceType: string,
    description: string,
    serviceUrl: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceName,
        serviceType: serviceType,
        description: description,
        url: serviceUrl,
        provider: [
            { '@id': `${BASE_URL}/#business-winterthur` },
            { '@id': `${BASE_URL}/#business-schaffhausen` },
            { '@id': `${BASE_URL}/#business-taegerwilen` },
            { '@id': `${BASE_URL}/#business-kleinandelfingen` },
        ],
        areaServed: {
            '@type': 'Country',
            name: 'Switzerland',
        },
    };
}

/**
 * Generiert Webdesign Spoke Schema (physischer Standort mit Büro)
 * Für Winterthur, Schaffhausen, Thurgau
 */
export function generateWebdesignPhysicalSpokeSchema(
    regionSlug: string,
    regionName: string,
    areaServedList?: string[]
) {
    const geo = REGION_COORDINATES[regionSlug];

    // Image-Mapping für physische Standorte
    const imageMapping: Record<string, string> = {
        'winterthur': '/images/unternehmen/infraone-hauptsitz-winterthur.webp',
        'schaffhausen': '/images/unternehmen/infraone-filiale-schaffhausen.webp',
        'thurgau': '/images/unternehmen/infraone-filiale-taegerwilen.webp',
    };
    const locationImage = imageMapping[regionSlug] || '/infraone-logo-schwarz.svg';

    // Address-Mapping für physische Standorte
    const physicalAddresses: Record<string, { street: string; zip: string; region: string }> = {
        'winterthur': { street: 'Rudolf-Diesel-Strasse 25', zip: '8404', region: 'Zürich' },
        'schaffhausen': { street: 'Solenbergstrasse 35', zip: '8207', region: 'Schaffhausen' },
        'thurgau': { street: 'Bahnhofstrasse 17', zip: '8274', region: 'Thurgau' }
    };
    const addressData = physicalAddresses[regionSlug];

    return {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': `${BASE_URL}/webdesign/${regionSlug}#service`,
        name: `InfraOne Webdesign - ${regionName}`,
        description: `Professionelles Webdesign für Unternehmen in ${regionName}. Moderne Websites ab CHF 990.`,
        serviceType: 'Web Design',
        url: `${BASE_URL}/webdesign/${regionSlug}`,
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        image: `${BASE_URL}${locationImage}`,
        address: {
            '@type': 'PostalAddress',
            ...(addressData && {
                streetAddress: addressData.street,
                postalCode: addressData.zip,
                addressRegion: addressData.region,
            }),
            addressLocality: regionName,
            addressCountry: 'CH',
        },
        ...(geo && {
            geo: {
                '@type': 'GeoCoordinates',
                latitude: geo.latitude,
                longitude: geo.longitude,
            },
        }),
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '17:00',
        },
        specialOpeningHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '08:00',
            closes: '23:00',
            description: 'IT-Notfall-Support verfügbar',
        },
        areaServed: areaServedList && areaServedList.length > 0
            ? areaServedList.map(area => ({ '@type': 'Place', name: area }))
            : { '@type': 'Place', name: regionName },
        priceRange: '$$',
        isPartOf: { '@id': `${BASE_URL}/webdesign#service` },
    };
}

/**
 * Generiert Webdesign Spoke Schema (virtueller Standort ohne Büro)
 * Für alle anderen Regionen (Zürich, Basel, Bern, etc.)
 */
export function generateWebdesignVirtualSpokeSchema(
    regionSlug: string,
    regionName: string,
    providerBusinessId: string,
    areaServedList?: string[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${BASE_URL}/webdesign/${regionSlug}#service`,
        name: `Webdesign ${regionName}`,
        serviceType: 'Web Design',
        description: `Webdesign-Dienstleistungen für ${regionName}. 100% remote möglich.`,
        provider: { '@id': providerBusinessId },
        url: `${BASE_URL}/webdesign/${regionSlug}`,
        areaServed: areaServedList && areaServedList.length > 0
            ? areaServedList.map(area => ({ '@type': 'Place', name: area }))
            : { '@type': 'AdministrativeArea', name: regionName },
        isPartOf: { '@id': `${BASE_URL}/webdesign#service` },
    };
}

/**
 * Generiert Cloud-Telefonie Spoke Schema (alle virtuell)
 */
export function generateCloudTelefonieVirtualSpokeSchema(
    regionSlug: string,
    regionName: string,
    providerBusinessId: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${BASE_URL}/cloud-telefonie/${regionSlug}#service`,
        name: `Cloud-Telefonie in ${regionName}`,
        serviceType: ['Cloud-Telefonie', 'VoIP', 'Hosted PBX'],
        description: `Cloud-Telefonanlagen für Unternehmen in ${regionName}. Schweizweite VoIP-Lösungen.`,
        provider: { '@id': providerBusinessId },
        url: `${BASE_URL}/cloud-telefonie/${regionSlug}`,
        areaServed: {
            '@type': 'AdministrativeArea',
            name: regionName,
        },
        isPartOf: { '@id': `${BASE_URL}/cloud-telefonie#service` },
    };
}

/**
 * ========================================
 * DIGITAL SIGNAGE HUB & SPOKE SCHEMAS
 * ========================================
 */

/**
 * Generiert Digital Signage Hub Service Schema
 * Für /digital-signage Hauptseite (schweizweit)
 */
export function generateDigitalSignageHubSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${BASE_URL}/digital-signage#service`,
        name: 'Digital Signage Schweiz',
        alternateName: ['Werbebildschirme Schweiz', 'Infoscreen Schweiz', 'Digitale Beschilderung'],
        serviceType: ['Digital Signage', 'Electronic Display', 'Digital Advertising'],
        description: 'Professionelle Digital Signage Lösungen ohne Abo-Kosten für die ganze Schweiz. Werbebildschirme und Infoscreens mit lokalem Betrieb, Live-Daten Integration und Multi-Display Support.',
        provider: { '@id': `${BASE_URL}/#organization` },
        url: `${BASE_URL}/digital-signage`,
        image: `${BASE_URL}/images/hero_digital_signage_1768423279297.webp`,
        areaServed: { '@type': 'Country', name: 'Switzerland' },
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'CHF',
            lowPrice: '1590',
            highPrice: '10000',
            offerCount: '3',
            offers: [
                {
                    '@type': 'Offer',
                    name: 'Digital Signage Starter-Paket',
                    price: '1590',
                    priceCurrency: 'CHF',
                    availability: 'https://schema.org/InStock',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'Digital Signage Starter-Paket',
                        description: '1 Display + Mini-Server, bis 5 Bildschirme erweiterbar, Setup & Installation, Custom Designvorlage, Schulung & Support',
                    }
                }
            ]
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Digital Signage Pakete',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Starter-Paket',
                        description: '1 Display + Mini-Server, bis 5 Bildschirme erweiterbar'
                    }
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Multi-Display Lösung',
                        description: 'Mehrere Displays, zentrale Verwaltung, Custom Widgets'
                    }
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Enterprise Lösung',
                        description: 'Filial-Netzwerke, API-Integrationen, Premium Support'
                    }
                }
            ]
        }
    };
}

/**
 * Generiert Product Schema für Digital Signage Starter-Paket
 * Für bessere Shopping-Results in Google
 */
export function generateDigitalSignageProductSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${BASE_URL}/digital-signage#product`,
        name: 'Digital Signage Starter-Paket',
        description: 'Professionelle Digital Signage Lösung ohne monatliche Abo-Kosten. Inkl. 1 Display, Mini-Server, Setup, Installation, Custom Designvorlage und Schulung. Schweizweite Installation.',
        brand: {
            '@type': 'Brand',
            name: 'InfraOne IT Solutions'
        },
        category: 'Digital Signage',
        image: `${BASE_URL}/images/digital-signage/products.webp`,
        offers: {
            '@type': 'Offer',
            price: '1590',
            priceCurrency: 'CHF',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
                '@type': 'Organization',
                name: 'InfraOne IT Solutions GmbH'
            },
            areaServed: {
                '@type': 'Country',
                name: 'Switzerland'
            }
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '12',
            bestRating: '5',
            worstRating: '1'
        }
    };
}

/**
 * Generiert Digital Signage Spoke Schema für regionale Seiten
 * Für /digital-signage/winterthur, /digital-signage/zuerich, etc.
 */
export function generateDigitalSignageSpokeSchema(
    regionSlug: string,
    regionName: string,
    hasPhysicalLocation: boolean = false
) {
    const geo = REGION_COORDINATES[regionSlug];

    const baseSchema: any = {
        '@context': 'https://schema.org',
        '@type': hasPhysicalLocation ? 'LocalBusiness' : 'Service',
        '@id': `${BASE_URL}/digital-signage/${regionSlug}#service`,
        name: `Digital Signage ${regionName}`,
        alternateName: [`Werbebildschirme ${regionName}`, `Infoscreen ${regionName}`],
        description: `Professionelle Digital Signage Lösungen für ${regionName}. Werbebildschirme und Infoscreens ohne Abo-Kosten. Installation und Support vor Ort.`,
        provider: { '@id': `${BASE_URL}/#organization` },
        url: `${BASE_URL}/digital-signage/${regionSlug}`,
        telephone: '+41522221818',
        email: 'info@infraone.ch',
        areaServed: {
            '@type': 'AdministrativeArea',
            name: regionName
        },
        isPartOf: { '@id': `${BASE_URL}/digital-signage#service` }
    };

    // Füge Geo-Koordinaten hinzu wenn vorhanden
    if (geo && hasPhysicalLocation) {
        baseSchema.geo = {
            '@type': 'GeoCoordinates',
            latitude: geo.latitude,
            longitude: geo.longitude
        };
    }

    return baseSchema;
}

/**
 * Generiert Service Schema für /ki-telefonassistent (AUFTRAG-092, erweitert AUFTRAG-110).
 * Angebote (Offer) erst, wenn die Preise freigegeben sind (PREISE_FREIGEGEBEN).
 * Der Anbieter verweist auf das sitewide LocalBusiness (@id /#organization) —
 * kein zweites Organization-Objekt.
 */
export function generateKiTelefonassistentServiceSchema(description: string) {
    const angebote = generateKiTelefonassistentOfferCatalog();
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': KI_SERVICE_ID,
        name: 'KI-Telefonassistent',
        alternateName: ['KI-Telefonassistent für Schweizer KMU', 'Telefonassistent mit künstlicher Intelligenz'],
        serviceType: ['KI-Telefonassistent', 'Voicebot', 'Telefonassistenz'],
        category: 'Telefonie und Kommunikation',
        description,
        provider: { '@id': `${BASE_URL}/#organization` },
        url: `${BASE_URL}/ki-telefonassistent`,
        areaServed: { '@type': 'Country', name: 'Switzerland' },
        audience: { '@type': 'BusinessAudience', audienceType: 'KMU in der Schweiz' },
        // AUFTRAG-110: versteht und spricht Schweizerdeutsch, Hochdeutsch und Englisch
        availableLanguage: [
            { '@type': 'Language', name: 'Schweizerdeutsch', alternateName: 'gsw' },
            { '@type': 'Language', name: 'Deutsch', alternateName: 'de' },
            { '@type': 'Language', name: 'Englisch', alternateName: 'en' },
        ],
        isRelatedTo: { '@id': `${BASE_URL}/cloud-telefonie#service` },
        ...(angebote && { hasOfferCatalog: angebote }),
    };
}

/* ------------------------------------------------------------------ */
/* KI-Telefonassistent: Unterseiten (AUFTRAG-110)                      */
/* ------------------------------------------------------------------ */

export const KI_SERVICE_ID = `${BASE_URL}/ki-telefonassistent#service`;

/**
 * Angebotskatalog aus src/lib/ki-telefonassistent-preise.ts —
 * null, solange die Preise Entwurf sind (keine Platzhalter in strukturierten Daten).
 */
export function generateKiTelefonassistentOfferCatalog() {
    if (!PREISE_FREIGEGEBEN) return null;
    return {
        '@type': 'OfferCatalog',
        name: 'Pakete KI-Telefonassistent',
        itemListElement: PAKETE.filter((p) => p.preisMonat !== null).map((p) => ({
            '@type': 'Offer',
            name: `KI-Telefonassistent ${p.name}`,
            description: p.merkmale.join(', '),
            price: String(p.preisMonat),
            priceCurrency: 'CHF',
            priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: String(p.preisMonat),
                priceCurrency: 'CHF',
                unitCode: 'MON',
                valueAddedTaxIncluded: false,
            },
            seller: { '@id': `${BASE_URL}/#organization` },
        })),
    };
}

/**
 * WebPage einer Unterseite des KI-Bereichs: gehört zur Website, handelt vom
 * Service (about) und verweist auf die Brotkrumen.
 *
 * [01.11.2026] AUFTRAG-116 (P3a): `pfad` (ab Domain) liefert über seitenDatum() die Git-Daten der Seite:
 * datePublished = erstellt (nur Datum YYYY-MM-DD), dateModified = geaendert (ISO mit Zeit); dazu publisher
 * (Verweis auf die Organisation). Der Hub erhält speakable (#antwort = Antwort-Kapsel, h1).
 */
export function generateKiSeitenSchema(url: string, name: string, description: string, pfad: string) {
    const datum = seitenDatum(pfad);
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name,
        description,
        inLanguage: 'de-CH',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': KI_SERVICE_ID },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        ...(datum && { datePublished: datumTag(datum.erstellt), dateModified: datum.geaendert }),
        publisher: { '@id': `${BASE_URL}/#organization` },
        ...(pfad === KI_BASIS && { speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#antwort', 'h1'] } }),
    };
}

/** BreadcrumbList mit @id (verknüpft mit generateKiSeitenSchema) */
export function generateKiBreadcrumbSchema(url: string, items: Array<{ name: string; url: string }>) {
    return {
        ...generateBreadcrumbListSchema(items),
        '@id': `${url}#breadcrumb`,
    };
}

/** DefinedTermSet für das Glossar (/ki-telefonassistent/glossar) */
export function generateDefinedTermSetSchema(url: string, name: string, begriffe: Array<{ id: string; begriff: string; erklaerung: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': `${url}#glossar`,
        name,
        url,
        inLanguage: 'de-CH',
        hasDefinedTerm: begriffe.map((b) => ({
            '@type': 'DefinedTerm',
            '@id': `${url}#${b.id}`,
            name: b.begriff,
            description: b.erklaerung,
            inDefinedTermSet: `${url}#glossar`,
        })),
    };
}

/**
 * HowTo: Weg vom Testanruf zum eigenen Assistenten (/so-funktioniert-es).
 * Bewusst ohne totalTime: Eine Einrichtungsdauer ist nicht belegt.
 */
export function generateHowToSchema(
    url: string,
    name: string,
    description: string,
    schritte: Array<{ name: string; text: string; anker?: string }>,
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name,
        description,
        inLanguage: 'de-CH',
        step: schritte.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
            ...(s.anker && { url: `${url}#${s.anker}` }),
        })),
    };
}
