/**
 * Netlify-Ereignisfunktion «deploy-succeeded» (AUFTRAG-116, P7) — IndexNow-Meldung nach jedem
 * erfolgreichen Produktions-Deploy.
 *
 * [01.11.2026] AUFTRAG-116: Netlify ruft die Funktion (Name = Ereignis) nach jedem erfolgreichen Deploy auf,
 * Body `{ payload: <Deploy> }`. Nur bei `payload.context === 'production'`: Sitemap von infraone.ch holen,
 * Seiten mit lastmod der letzten 3 Tage (plus Startseite) an IndexNow melden, Ergebnis loggen
 * («indexnow: 12 URLs, Status 200»). Alles andere → 200 «übersprungen». Jeder Fehler wird geloggt und mit
 * 200 beantwortet: ein Ping darf den Deploy nie stören.
 */
import { geaenderteUrls, indexNowMelden } from '../../src/lib/seo/indexnow';

const SITEMAP_URL = 'https://infraone.ch/sitemap.xml';
const TAGE = 3;

// Functions v2: Standard-Export einer async-Funktion (req: Request) => Response (benannt, wegen ESLint import/no-anonymous-default-export)
const deploySucceeded = async (req: Request): Promise<Response> => {
    try {
        const body = (await req.json().catch(() => null)) as { payload?: { context?: string } } | null;
        const kontext = body?.payload?.context;
        if (kontext !== 'production') {
            console.log(`indexnow: übersprungen (context ${kontext ?? 'unbekannt'})`);
            return new Response('übersprungen', { status: 200 });
        }
        const sitemap = await fetch(SITEMAP_URL, { headers: { 'User-Agent': 'infraone.ch IndexNow (deploy-succeeded)' } });
        if (!sitemap.ok) throw new Error(`Sitemap HTTP ${sitemap.status}`);
        const urls = geaenderteUrls(await sitemap.text(), TAGE);
        const { status, anzahl } = await indexNowMelden(urls);
        const meldung = `indexnow: ${anzahl} URLs, Status ${status}`;
        console.log(meldung);
        return new Response(meldung, { status: 200 });
    } catch (e) {
        console.error(`indexnow: Fehler — ${e instanceof Error ? e.message : String(e)}`);
        return new Response('indexnow: Fehler (protokolliert)', { status: 200 });
    }
};

export default deploySucceeded;
