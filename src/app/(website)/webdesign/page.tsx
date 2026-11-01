import { Metadata } from 'next';
import { WebdesignContent } from '@/components/pages/WebdesignContent';
import { 
    generateWebDesignServiceSchema, 
    generateWebdesignPackageProducts,
    generateOfferCatalogSchema,
    generateFAQSchema,
    generateBreadcrumbListSchema,
    generateWebPageSchema,
} from '@/lib/seo/schema';
import { webdesignHubFaqs } from '@/data/webdesign-faqs';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Webdesign Schweiz: Preise online, Websites ab CHF 990',
    description: 'Websites für KMU ab CHF 990 – Preise offen statt Offerten-Poker. Wix, WordPress oder Next.js aus Winterthur, mit echten Referenzen zum Anklicken.',
    keywords: ['Webdesign Schweiz', 'Webagentur', 'Website erstellen', 'Homepage', 'SEO Webdesign'],
    alternates: {
        canonical: 'https://infraone.ch/webdesign',
        languages: {
            'de-CH': 'https://infraone.ch/webdesign',
            'x-default': 'https://infraone.ch/webdesign', // [01.11.2026] AUFTRAG-116: hreflang x-default
        },
    },
};

// Webdesign-Pakete für OfferCatalog
const packages = [
    { title: 'Starter-Paket', description: 'Perfekt für Startups und Kleinunternehmen. Bis zu 5 Seiten, responsive Design.', price: 'CHF 990' },
    { title: 'KMU-Paket', description: 'Für etablierte Unternehmen. Bis zu 15 Seiten, individuelles Design, Blog-Funktion.', price: 'CHF 2490' },
    { title: 'Pro-Paket', description: 'Maximale Performance & Kontrolle. Headless CMS, custom Development.', price: 'CHF 4990' },
];

export default function WebdesignPage() {
    // 1. WebDesign Service Schema (spezifisch)
    const serviceSchema = generateWebDesignServiceSchema();

    // 2. Product Schemas (3 Pakete)
    const productSchemas = generateWebdesignPackageProducts();

    // 3. OfferCatalog Schema
    const offerCatalogSchema = generateOfferCatalogSchema(packages);

    // 4. FAQ Schema
    const faqSchema = generateFAQSchema(webdesignHubFaqs);

    // 5. Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Webdesign', url: `${BASE_URL}/webdesign` },
    ]);

    // 6. WebPage Schema
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/webdesign`,
        'Webdesign & Website-Entwicklung',
        'Professionelles Webdesign in der Schweiz. Moderne, SEO-optimierte Websites ab CHF 990.'
    );

    return (
        <>
            {/* 1. WebDesign Service Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            
            {/* 2. Product Schemas (3 Pakete) */}
            {productSchemas.map((product, index) => (
                <script
                    key={`product-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        ...product
                    }) }}
                />
            ))}
            
            {/* 3. OfferCatalog Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogSchema) }}
            />
            
            {/* 4. FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            
            {/* 5. Breadcrumb Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            
            {/* 6. WebPage Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            
            <WebdesignContent />
        </>
    );
}
