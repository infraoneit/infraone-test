import { Metadata } from 'next';

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    category: string;
    keywords: string[];
    readingTime: string;
    featuredImage?: string; // Optionales Titelbild (Pfad zum Bild)
    featuredImageWidth?: number;  // Natürliche Bildbreite (für CLS-freies Rendering, wird im Loader gesetzt)
    featuredImageHeight?: number; // Natürliche Bildhöhe
}

export const blogPosts: BlogPost[] = [
    // Leer (11.08.2026): Die fuenf Altartikel leben jetzt wie alle anderen in
    // content/blog/ (JSON + content.mdoc) und wurden dort ueberarbeitet.
    // Statische Eintraege hier wuerden die CMS-Fassung verdraengen (Slug-Konflikt).
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find(post => post.slug === slug);
}

// Helper function to generate metadata for a blog post
export function generateBlogMetadata(post: BlogPost): Metadata {
    return {
        title: post.title,
        description: post.excerpt,
        keywords: post.keywords,
        authors: [{ name: post.author }],
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        },
        alternates: {
            canonical: `https://infraone.ch/blog/${post.slug}`,
            languages: {
                'de-CH': `https://infraone.ch/blog/${post.slug}`,
                'x-default': `https://infraone.ch/blog/${post.slug}`, // [01.11.2026] AUFTRAG-116: hreflang x-default
            },
        },
    };
}

// Export all static blog posts for use with Keystatic combined data
export function getAllStaticBlogPosts(): BlogPost[] {
    return blogPosts;
}
