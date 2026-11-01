import { ArrowRight } from 'lucide-react';

// KI-News-Sektion auf /software-entwicklung (AUFTRAG-007).
// Server-Komponente: holt die zwei neuesten Einträge aus dem RSS-Feed von
// the-decoder.de (deutschsprachige KI-News). ISR: fetch mit revalidate 86400,
// erneuert sich täglich beim ersten Aufruf. Bei Fehler oder Timeout (5 s)
// wird die Sektion stumm weggelassen (return null) — nie leer/kaputt rendern.
// Urheberrecht: nur Titel + Kurzauszug (max. 200 Zeichen) + Quellenlink.

const FEED_URL = 'https://the-decoder.de/feed/';
const FEED_QUELLE = 'the-decoder.de';
const MAX_AUSZUG = 200;

interface NewsItem {
    titel: string;
    link: string;
    datum: string;
    auszug: string;
}

function decodeEntities(text: string): string {
    const benannt: Record<string, string> = {
        amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
        nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', auml: 'ä',
        ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß',
    };
    return text
        .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_m, dez: string) => String.fromCodePoint(parseInt(dez, 10)))
        .replace(/&([a-zA-Z]+);/g, (m, name: string) => benannt[name] ?? m);
}

function stripCdata(text: string): string {
    return text.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
}

function extrahiereTag(block: string, tag: string): string {
    const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return match ? stripCdata(match[1]).trim() : '';
}

function kuerzeAuszug(text: string): string {
    if (text.length <= MAX_AUSZUG) return text;
    return text.slice(0, MAX_AUSZUG).trimEnd() + '…';
}

function formatDatumDeutsch(pubDate: string): string {
    const date = new Date(pubDate);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}

function parseFeed(xml: string): NewsItem[] {
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 2) {
        const block = match[1];
        const titel = decodeEntities(extrahiereTag(block, 'title'));
        const link = extrahiereTag(block, 'link');
        const beschreibung = decodeEntities(
            extrahiereTag(block, 'description')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
        );
        if (titel && link) {
            items.push({
                titel,
                link,
                datum: formatDatumDeutsch(extrahiereTag(block, 'pubDate')),
                auszug: kuerzeAuszug(beschreibung),
            });
        }
    }
    return items;
}

async function ladeNews(): Promise<NewsItem[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
        const antwort = await fetch(FEED_URL, {
            next: { revalidate: 86400 },
            signal: controller.signal,
            headers: { 'User-Agent': 'infraone.ch KI-News (+https://infraone.ch)' },
        });
        if (!antwort.ok) return [];
        const xml = await antwort.text();
        return parseFeed(xml);
    } catch {
        // Feed nicht erreichbar, Timeout oder Parse-Fehler → Sektion auslassen
        return [];
    } finally {
        clearTimeout(timeout);
    }
}

export default async function KINewsSection() {
    const news = await ladeNews();
    if (news.length === 0) return null;

    // [01.11.2026] AUFTRAG-116 (Nachtrag N2): data-ki-news als stabiler Haken für Prüfskripte — die Sektion zeigt
    // fremde Schlagzeilen (the-decoder.de); die A-114-Prüfung der Anbieter-Namen nimmt sie aus.
    return (
        <section data-ki-news="" className="py-16 lg:py-24 bg-background border-t border-border">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Aktuell aus der KI-Welt
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {news.map((item) => (
                        <article
                            key={item.link}
                            className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors flex flex-col"
                        >
                            <p className="text-xs text-text-secondary mb-2">
                                {item.datum && `${item.datum} · `}Quelle: {FEED_QUELLE}
                            </p>
                            <h3 className="text-lg font-bold text-text-primary mb-3">
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener nofollow"
                                    className="hover:text-primary transition-colors"
                                >
                                    {item.titel}
                                </a>
                            </h3>
                            {item.auszug && (
                                <p className="text-sm text-text-secondary mb-4 flex-grow">{item.auszug}</p>
                            )}
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener nofollow"
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-auto"
                            >
                                Weiterlesen bei the-decoder.de
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </article>
                    ))}
                </div>

                <p className="text-xs text-text-secondary text-center mt-8">
                    Automatisch aktualisierte Auswahl. Die verlinkten Artikel stammen von den jeweiligen Quellen.
                </p>
            </div>
        </section>
    );
}
