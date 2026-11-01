/**
 * Seitenliste der Website — EINE Quelle für die Sitemap, die lastmod-Erfassung und die Prüfskripte.
 *
 * [01.11.2026] AUFTRAG-116 (P2a): Die URL-Erzeugung stand bisher in src/app/sitemap.ts und ist hierher
 * verschoben (gleiche URLs, Prioritäten und Frequenzen wie Commit 0cdaeff; Einheitstest gegen
 * scripts/fixtures/sitemap-urls-0cdaeff.txt). Neu je Seite: `quellen` (deren letzter Commit bestimmt das
 * Änderungsdatum) und `hauptquelle` (deren erster Commit bestimmt das Erstelldatum), ausgewertet von
 * scripts/lastmod-erfassen.mjs → src/generated/lastmod.json.
 *
 * Geteilte Bausteine (Bausteine.tsx, Header, Footer, globals.css, Templates) zählen bewusst NICHT —
 * sie würden jede Seite stempeln. Reines TypeScript ohne Next-Imports (nur fs/path), damit es auch die
 * Node-Prüfskripte laden können.
 */
import fs from 'fs';
import path from 'path';
import { KI_BASIS, KI_PREISE_PFAD, KI_SEITEN } from '@/components/ki-telefonassistent/seiten';
import { PREISE_FREIGEGEBEN } from '@/lib/ki-telefonassistent-preise';

export interface SeitenEintrag {
    url: string;                      // Pfad ab Domain, '' = Startseite
    priority: number;
    changeFrequency: 'weekly' | 'monthly' | 'yearly';
    /** Quelldateien, deren letzter Commit das Änderungsdatum bestimmt (relativ zum Repo) */
    quellen: string[];
    /** Datei, deren erster Commit das Erstelldatum bestimmt */
    hauptquelle: string;
}

/** Ordner der Seiten (App Router, Route-Gruppe «(website)») */
const SEITEN = 'src/app/(website)';
/** page.tsx einer statischen Seite, z. B. seite('/kontakt') → src/app/(website)/kontakt/page.tsx */
const seite = (pfad: string) => `${SEITEN}${pfad}/page.tsx`;
const KI_INHALTE = 'src/components/ki-telefonassistent/inhalte';
const KI_PREISE_LIB = 'src/lib/ki-telefonassistent-preise.ts';

/** Slugs aller JSON-Dateien eines Content-Ordners (alphabetisch wie readdirSync) */
function jsonSlugs(root: string, ordner: string): string[] {
    const dir = path.join(root, ordner);
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.endsWith('.json'))
        .map((d) => d.name.replace('.json', ''));
}

/** Eintrag einer statischen Seite: Quelle = ihre page.tsx (plus optionale Zusatzquellen) */
function statisch(url: string, priority: number, changeFrequency: SeitenEintrag['changeFrequency'], zusatz: string[] = []): SeitenEintrag {
    const hauptquelle = seite(url);
    return { url, priority, changeFrequency, quellen: [hauptquelle, ...zusatz], hauptquelle };
}

/** Quellen einer Seite des Bereichs KI-Telefonassistent (Tabelle in AUFTRAG-116, P2a) */
function kiQuellen(pfad: string): Pick<SeitenEintrag, 'quellen' | 'hauptquelle'> {
    const page = seite(pfad);
    if (pfad === KI_BASIS) {
        return {
            quellen: [page, `${KI_INHALTE}/faq.ts`, `${KI_INHALTE}/anwendungen.ts`, `${KI_INHALTE}/branchen.ts`, KI_PREISE_LIB],
            hauptquelle: page,
        };
    }
    if (pfad === `${KI_BASIS}/funktionen`) return { quellen: [page, `${KI_INHALTE}/funktionen.ts`], hauptquelle: page };
    if (pfad === `${KI_BASIS}/faq`) return { quellen: [page, `${KI_INHALTE}/faq.ts`], hauptquelle: page };
    if (pfad === KI_PREISE_PFAD) {
        return { quellen: [page, KI_PREISE_LIB, 'src/components/ki-telefonassistent/Preise.tsx'], hauptquelle: page };
    }
    const detail = new RegExp(`^${KI_BASIS}/(anwendungen|branchen)/[^/]+$`).exec(pfad);
    if (detail) {
        const inhalt = `${KI_INHALTE}/${detail[1]}.ts`;
        return { quellen: [`${SEITEN}${KI_BASIS}/${detail[1]}/[slug]/page.tsx`, inhalt], hauptquelle: inhalt };
    }
    return { quellen: [page], hauptquelle: page };
}

/**
 * Alle Seiten der Sitemap in der Reihenfolge der bisherigen sitemap.ts.
 * `root` = Repo-Wurzel (Vorgabe: Arbeitsverzeichnis, wie bisher in sitemap.ts).
 */
export function alleSeiten(root: string = process.cwd()): SeitenEintrag[] {
    // Hauptseiten
    const hauptseiten: SeitenEintrag[] = [
        { url: '', priority: 1.0, changeFrequency: 'weekly', quellen: [seite(''), 'src/components/sections/'], hauptquelle: seite('') },
        statisch('/leistungen', 0.9, 'weekly'),
        statisch('/kontakt', 0.9, 'monthly'),
        statisch('/unternehmen', 0.8, 'monthly'),
        statisch('/partner', 0.7, 'monthly'),
        statisch('/blog', 0.8, 'weekly'),
    ];

    // Service-Hubs (ohne /telefonie — Weiterleitung auf /cloud-telefonie)
    const serviceHubs: Array<{ url: string; priority: number }> = [
        { url: '/it-support', priority: 1.0 },
        { url: '/webdesign', priority: 1.0 },
        { url: '/cloud-telefonie', priority: 1.0 },
        { url: KI_BASIS, priority: 0.9 },
        { url: '/digital-signage', priority: 0.9 },
        { url: '/it-netzwerke', priority: 0.8 },
        { url: '/it-sicherheit', priority: 0.8 },
        { url: '/microsoft-365', priority: 0.8 },
        { url: '/wlan', priority: 0.8 },
        { url: '/videoueberwachung', priority: 0.8 },
        { url: '/software-entwicklung', priority: 0.8 },
    ];
    const hubs: SeitenEintrag[] = serviceHubs.map(({ url, priority }) => {
        if (url === KI_BASIS) return { url, priority, changeFrequency: 'weekly', ...kiQuellen(url) };
        // /it-support liest seinen Inhalt aus der CMS-Datei content/leistungen/it-support.json (Keystatic):
        // eine Bearbeitung dort ändert die Seite, darum zählt sie mit (wie die JSON der Regionsseiten).
        return statisch(url, priority, 'weekly', url === '/it-support' ? ['content/leistungen/it-support.json'] : []);
    });

    // Cloud-Telefonie Technologie-Varianten (eigene SEO-Landings)
    const varianten: SeitenEintrag[] = ['/cloud-telefonie/3cx', '/cloud-telefonie/ms-teams', '/cloud-telefonie/yeastar'].map((url) => statisch(url, 0.8, 'monthly'));

    // Bereich KI-Telefonassistent (Hub steht oben bei den Service-Hubs); /preise erst nach Freigabe
    const kiSeiten: SeitenEintrag[] = KI_SEITEN.filter((s) => s.pfad !== KI_BASIS)
        .filter((s) => PREISE_FREIGEGEBEN || s.pfad !== KI_PREISE_PFAD)
        .map((s) => ({ url: s.pfad, priority: s.prioritaet, changeFrequency: 'monthly' as const, ...kiQuellen(s.pfad) }));

    // Regionsseiten (dynamisch aus content/): Quelle = Content-JSON + [region]/page.tsx des Bereichs
    const regionen = (bereich: 'webdesign' | 'it-support' | 'cloud-telefonie'): SeitenEintrag[] =>
        jsonSlugs(root, `content/leistungen/${bereich}-regions`).map((slug) => {
            const json = `content/leistungen/${bereich}-regions/${slug}.json`;
            return { url: `/${bereich}/${slug}`, priority: 0.6, changeFrequency: 'monthly', quellen: [json, `${SEITEN}/${bereich}/[region]/page.tsx`], hauptquelle: json };
        });

    // Blog-Posts (dynamisch aus content/blog/): JSON + Ordner mit dem Text
    const blog: SeitenEintrag[] = jsonSlugs(root, 'content/blog').map((slug) => {
        const json = `content/blog/${slug}.json`;
        return { url: `/blog/${slug}`, priority: 0.7, changeFrequency: 'monthly', quellen: [json, `content/blog/${slug}/`], hauptquelle: json };
    });

    // Rechtliches
    const recht: SeitenEintrag[] = [
        statisch('/impressum', 0.3, 'yearly'),
        statisch('/datenschutz', 0.3, 'yearly', ['src/lib/datenschutz.ts']),
        statisch('/agb', 0.3, 'yearly'),
    ];

    return [...hauptseiten, ...hubs, ...varianten, ...kiSeiten, ...regionen('webdesign'), ...regionen('it-support'), ...regionen('cloud-telefonie'), ...blog, ...recht];
}
