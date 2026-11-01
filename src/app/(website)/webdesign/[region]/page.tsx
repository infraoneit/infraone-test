import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WebdesignContent } from '@/components/pages/WebdesignContent';
import {
    generateWebdesignPhysicalSpokeSchema,
    generateWebdesignVirtualSpokeSchema,
    generateWebdesignPackageProducts,
    generateOfferCatalogSchema,
    generateFAQSchema,
    generateBreadcrumbListSchema,
    generateWebPageSchema,
} from '@/lib/seo/schema';
import { generateWebdesignSpokeFaqs } from '@/data/webdesign-faqs';
import { BASE_URL } from '@/lib/constants';
import { getWebdesignRegion, getAllWebdesignRegionSlugs } from '@/lib/leistungen';

const packages = [
    { title: 'Starter-Paket', description: 'Perfekt für Startups und Kleinunternehmen. Bis zu 5 Seiten, responsive Design.', price: 'CHF 990' },
    { title: 'KMU-Paket', description: 'Für etablierte Unternehmen. Bis zu 15 Seiten, individuelles Design, Blog-Funktion.', price: 'CHF 2490' },
    { title: 'Pro-Paket', description: 'Maximale Performance & Kontrolle. Headless CMS, custom Development.', price: 'CHF 4990' },
];

export async function generateStaticParams() {
    const slugs = await getAllWebdesignRegionSlugs();
    return slugs.map(region => ({ region }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
    const { region } = await params;
    const data = await getWebdesignRegion(region);
    if (!data) return { title: 'Webdesign' };
    return {
        title: data.metaTitle || `Webdesign ${data.name}`,
        description: data.metaDescription,
        keywords: data.keywords,
        alternates: {
            canonical: data.canonicalUrl || `${BASE_URL}/webdesign/${region}`,
            languages: {
                'de-CH': data.canonicalUrl || `${BASE_URL}/webdesign/${region}`,
                'x-default': data.canonicalUrl || `${BASE_URL}/webdesign/${region}`, // [01.11.2026] AUFTRAG-116: hreflang x-default
            },
        },
    };
}

export default async function WebdesignRegionPage({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params;
    const data = await getWebdesignRegion(region);
    if (!data) notFound();

    // Service-Schema je nach physisch oder virtuell
    const serviceSchema = data.hasPhysicalLocation
        ? generateWebdesignPhysicalSpokeSchema(region, data.name, data.areaServed)
        : generateWebdesignVirtualSpokeSchema(region, data.name, `${BASE_URL}/#business-winterthur`, data.areaServed);

    const productSchemas = generateWebdesignPackageProducts();
    const offerCatalogSchema = generateOfferCatalogSchema(packages);
    const spokeFaqs = generateWebdesignSpokeFaqs(data.name, data.hasPhysicalLocation);
    const faqSchema = generateFAQSchema(spokeFaqs);
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Webdesign', url: `${BASE_URL}/webdesign` },
        { name: data.name, url: `${BASE_URL}/webdesign/${region}` },
    ]);
    const webPageSchema = generateWebPageSchema(
        `${BASE_URL}/webdesign/${region}`,
        data.headline,
        data.description
    );

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            {productSchemas.map((p, i) => (
                <script
                    key={`p-${i}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...p }) }}
                />
            ))}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <WebdesignContent data={data} />
        </>
    );
}
