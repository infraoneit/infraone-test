import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    ShieldCheck,
    CalendarCheck,
    ClipboardList,
    Cloud,
    MessageSquareText,
    PhoneForwarded,
    PhoneIncoming,
    Siren,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, Prosa, Querverweise, SeitenKopf, type LinkKarte } from '@/components/ki-telefonassistent/Bausteine';
import { GespraechPaar } from '@/components/ki-telefonassistent/Gespraech';
import { BRANCHEN, branche } from '@/components/ki-telefonassistent/inhalte/branchen';
import { anwendung } from '@/components/ki-telefonassistent/inhalte/anwendungen';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
import { InEntwicklungBadge } from '@/components/ki-telefonassistent/InEntwicklung';

export const dynamicParams = false;

export function generateStaticParams() {
    return BRANCHEN.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const b = branche(slug);
    if (!b) return {};
    return kiMetadata({ pfad: `${KI_BASIS}/branchen/${b.slug}`, titel: b.metaTitel, beschreibung: b.metaBeschreibung });
}

const ANWENDUNG_ICONS: Record<string, LucideIcon> = {
    erreichbarkeit: PhoneIncoming,
    auskunft: MessageSquareText,
    'anliegen-erfassen': ClipboardList,
    terminbuchung: CalendarCheck,
    notfall: Siren,
};
const INTEGRATION_ICONS: LucideIcon[] = [Siren, CalendarCheck, PhoneForwarded, Cloud];

function integrationIcon(titel: string, i: number): LucideIcon {
    if (/notfall|pikett/i.test(titel)) return Siren;
    if (/termin|kalender|besichtigung/i.test(titel)) return CalendarCheck;
    if (/weiterleit/i.test(titel)) return PhoneForwarded;
    if (/agent|werkstatt und verkauf/i.test(titel)) return Users;
    if (/telefonie|microsoft|it/i.test(titel)) return Cloud;
    return INTEGRATION_ICONS[i % INTEGRATION_ICONS.length];
}

export default async function BranchenSeite({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const b = branche(slug);
    if (!b) notFound();

    const pfad = `${KI_BASIS}/branchen/${b.slug}`;
    const krumen = kiKrumen({ name: 'Branchen', pfad: `${KI_BASIS}/branchen` }, { name: b.name, pfad });
    const andere = BRANCHEN.filter((x) => x.slug !== b.slug);

    const querverweise: LinkKarte[] = [
        ...b.anwendungen.map((s) => {
            const a = anwendung(s)!;
            return { titel: `Anwendung: ${a.name}`, text: a.teaser, href: `${KI_BASIS}/anwendungen/${a.slug}`, icon: ANWENDUNG_ICONS[a.slug] };
        }),
        { titel: 'Sicherheit und Datenschutz', text: 'Hosting in der Schweiz, keine Aufzeichnung, kein Training.', href: `${KI_BASIS}/sicherheit-datenschutz`, icon: ShieldCheck },
        { titel: 'Cloud-Telefonie', text: 'Telefonanlage von InfraOne, in die sich der Assistent einfügt.', href: '/cloud-telefonie', icon: Cloud },
        { titel: 'IT-Support', text: 'IT-Betreuung für KMU, per Fernwartung und vor Ort.', href: '/it-support', icon: Users },
    ];

    return (
        <>
            <JsonLd daten={kiSeitenSchemas(pfad, b.h1, b.metaBeschreibung, krumen)} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf pfad={pfad} krumen={krumen} eyebrow={`Branche: ${b.name}`} titel={b.h1} lead={<p>{b.lead}</p>} />

            {/* Alltag der Branche */}
            <Abschnitt titel={b.alltag.titel} hintergrund="surface">
                <Prosa>
                    {b.alltag.absaetze.map((t) => (
                        <p key={t}>{t}</p>
                    ))}
                </Prosa>
            </Abschnitt>

            {/* Typische Anrufe */}
            <Abschnitt titel="Typische Anrufe und wie der Assistent sie behandelt" intro={<p>Wie er im Einzelfall reagiert, legen Sie bei der Einrichtung fest. So sieht es typischerweise aus:</p>}>
                <div className="rounded-3xl border border-border bg-card overflow-hidden">
                    <div className="hidden md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] border-b border-border bg-surface/60 text-sm font-semibold text-text-secondary">
                        <div className="px-6 py-4">Anruf</div>
                        <div className="px-6 py-4">So behandelt ihn der Assistent</div>
                    </div>
                    <ul className="divide-y divide-border">
                        {b.anrufe.map((x) => (
                            <li key={x.anruf} className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                                <p className="px-5 pt-5 md:px-6 md:py-5 font-semibold text-text-primary">{x.anruf}</p>
                                <p className="px-5 pt-2 pb-5 md:px-6 md:py-5 text-text-secondary leading-relaxed">{x.antwort}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Abschnitt>

            {/* Beispielgespräch */}
            <Abschnitt titel="Beispielgespräch" intro={<p>Dasselbe Gespräch in Mundart und auf Hochdeutsch.</p>} hintergrund="surface">
                <GespraechPaar beispiel={b.beispiel} firma={b.firma} />
            </Abschnitt>

            {/* Integration */}
            <Abschnitt titel="So fügt er sich in Ihren Betrieb ein">
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {b.integration.map((x, i) => {
                        const Icon = integrationIcon(x.titel, i);
                        return (
                            <div key={x.titel} className="h-full p-6 rounded-2xl bg-card border border-border">
                                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5" aria-hidden="true">
                                    <Icon className="w-5 h-5" />
                                </span>
                                <h3 className="text-lg font-bold text-text-primary mb-2">{x.titel}</h3>
                                {/* AUFTRAG-113/114: Badge nur noch für den Kalendereintrag */}
                                {x.inEntwicklung && <InEntwicklungBadge className="mb-2" />}
                                <p className="text-text-secondary leading-relaxed">{x.text}</p>
                            </div>
                        );
                    })}
                </div>
            </Abschnitt>

            {/* Besonderheiten */}
            <Abschnitt titel={b.achten.titel} hintergrund="surface">
                <div className="grid md:grid-cols-3 gap-5">
                    {b.achten.punkte.map((p) => (
                        <div key={p.titel} className="h-full p-6 rounded-2xl bg-card border border-border">
                            <h3 className="text-lg font-bold text-text-primary mb-2">{p.titel}</h3>
                            <p className="text-text-secondary leading-relaxed">{p.text}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-8 text-text-secondary">
                    Weitere Branchen:{' '}
                    {andere.map((x, i) => (
                        <span key={x.slug}>
                            <Link href={`${KI_BASIS}/branchen/${x.slug}`} className="font-semibold text-text-primary underline underline-offset-4 decoration-primary hover:decoration-2">
                                {x.name}
                            </Link>
                            {i < andere.length - 1 ? ', ' : '.'}
                        </span>
                    ))}
                </p>
            </Abschnitt>

            <Querverweise titel="Passt dazu" hintergrund="background" links={querverweise} />

            <AbschlussCta titel={`Testen Sie den Assistenten für Ihren ${b.slug === 'arztpraxis' ? 'Praxisalltag' : 'Betrieb'}`} />
        </>
    );
}
