import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CloudTelefonieContent } from '@/components/pages/CloudTelefonieContent';
import {
    generateCloudTelefonieVirtualSpokeSchema,
    generateFAQSchema,
    generateWebPageSchema,
    generateBreadcrumbListSchema,
} from '@/lib/seo/schema';
import { generateCloudTelefonieSpokeFaqs } from '@/data/webdesign-faqs';
import { BASE_URL } from '@/lib/constants';
import { getCloudTelefonieRegion, getAllCloudTelefonieRegionSlugs } from '@/lib/leistungen';

export async function generateStaticParams() {
    const slugs = await getAllCloudTelefonieRegionSlugs();
    return slugs.map(region => ({ region }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
    const { region } = await params;
    const data = await getCloudTelefonieRegion(region);
    if (!data) return { title: 'Cloud-Telefonie' };
    return {
        title: data.metaTitle || `Cloud-Telefonie ${data.name}`,
        description: data.metaDescription,
        keywords: data.keywords,
        alternates: {
            canonical: data.canonicalUrl || `${BASE_URL}/cloud-telefonie/${region}`,
            languages: {
                'de-CH': data.canonicalUrl || `${BASE_URL}/cloud-telefonie/${region}`,
                'x-default': data.canonicalUrl || `${BASE_URL}/cloud-telefonie/${region}`, // [01.11.2026] AUFTRAG-116: hreflang x-default
            },
        },
    };
}

export default async function CloudTelefonieRegionPage({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params;
    const data = await getCloudTelefonieRegion(region);
    if (!data) notFound();

    const serviceSchema = generateCloudTelefonieVirtualSpokeSchema(region, data.name, `${BASE_URL}/#business-winterthur`);
    const spokeFaqs = generateCloudTelefonieSpokeFaqs(data.name);
    const faqSchema = generateFAQSchema(spokeFaqs);
    const webPageSchema = generateWebPageSchema(`${BASE_URL}/cloud-telefonie/${region}`, data.headline, data.description);
    const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Cloud-Telefonie', url: `${BASE_URL}/cloud-telefonie` },
        { name: data.name, url: `${BASE_URL}/cloud-telefonie/${region}` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <CloudTelefonieContent data={data} />
        </>
    );
}
