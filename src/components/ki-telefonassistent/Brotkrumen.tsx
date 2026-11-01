import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BASE_URL } from '@/lib/constants';
import { generateKiBreadcrumbSchema, generateKiSeitenSchema } from '@/lib/seo/schema';
import { KI_BASIS } from './seiten';

export interface Krume {
    name: string;
    pfad: string;
}

/** Brotkrumen ab Home: Home › KI-Telefonassistent › … › aktuelle Seite */
export function kiKrumen(...weitere: Krume[]): Krume[] {
    return [{ name: 'Home', pfad: '/' }, { name: 'KI-Telefonassistent', pfad: KI_BASIS }, ...weitere];
}

/** JSON-LD einer Unterseite: WebPage (about = Service) + BreadcrumbList */
export function kiSeitenSchemas(pfad: string, name: string, beschreibung: string, krumen: Krume[]) {
    const url = `${BASE_URL}${pfad}`;
    return [
        // [01.11.2026] AUFTRAG-116: pfad durchreichen (datePublished/dateModified aus Git, speakable am Hub)
        generateKiSeitenSchema(url, name, beschreibung, pfad),
        generateKiBreadcrumbSchema(
            url,
            krumen.map((k) => ({ name: k.name, url: k.pfad === '/' ? BASE_URL : `${BASE_URL}${k.pfad}` })),
        ),
    ];
}

/** Sichtbare Brotkrumen (die letzte Krume ist die aktuelle Seite, ohne Link) */
export function Brotkrumen({ krumen, className = '' }: { krumen: Krume[]; className?: string }) {
    return (
        <nav aria-label="Brotkrumen" className={className}>
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-text-secondary">
                {krumen.map((k, i) => {
                    const letzte = i === krumen.length - 1;
                    return (
                        <li key={k.pfad} className="flex items-center gap-1.5 min-w-0">
                            {letzte ? (
                                <span aria-current="page" className="font-medium text-text-primary">
                                    {k.name}
                                </span>
                            ) : (
                                <>
                                    <Link href={k.pfad} className="inline-flex items-center hover:text-primary underline-offset-4 hover:underline">
                                        {k.name}
                                    </Link>
                                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" aria-hidden="true" />
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
