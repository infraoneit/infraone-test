import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BellRing, CalendarCheck, ClipboardList, FileText, Mail, MessageSquareText, PhoneIncoming, Siren, Smartphone, type LucideIcon } from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, Hakenliste, NotizKarte, Prosa, Querverweise, SeitenKopf, type LinkKarte } from '@/components/ki-telefonassistent/Bausteine';
import { GespraechPaar } from '@/components/ki-telefonassistent/Gespraech';
import { ANWENDUNGEN, anwendung } from '@/components/ki-telefonassistent/inhalte/anwendungen';
import { branche } from '@/components/ki-telefonassistent/inhalte/branchen';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
import { InEntwicklungBadge } from '@/components/ki-telefonassistent/InEntwicklung';

export const dynamicParams = false;

export function generateStaticParams() {
    return ANWENDUNGEN.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const a = anwendung(slug);
    if (!a) return {};
    return kiMetadata({ pfad: `${KI_BASIS}/anwendungen/${a.slug}`, titel: a.metaTitel, beschreibung: a.metaBeschreibung });
}

const ICONS: Record<string, LucideIcon> = {
    erreichbarkeit: PhoneIncoming,
    auskunft: MessageSquareText,
    'anliegen-erfassen': ClipboardList,
    terminbuchung: CalendarCheck,
    notfall: Siren,
};
const DANACH_ICONS: LucideIcon[] = [Mail, FileText, Smartphone];

/** Icon nach Inhalt (AUFTRAG-113: Kalender und SMS stehen nicht mehr an fester Stelle) */
function danachIcon(titel: string, i: number): LucideIcon {
    if (/kalender/i.test(titel)) return CalendarCheck;
    if (/sms/i.test(titel)) return Smartphone;
    if (/notfall/i.test(titel)) return Siren;
    if (/transkript/i.test(titel)) return FileText;
    if (/notiz/i.test(titel)) return Mail;
    return DANACH_ICONS[i % DANACH_ICONS.length];
}

export default async function AnwendungSeite({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const a = anwendung(slug);
    if (!a) notFound();

    const pfad = `${KI_BASIS}/anwendungen/${a.slug}`;
    const krumen = kiKrumen({ name: 'Anwendungen', pfad: `${KI_BASIS}/anwendungen` }, { name: a.name, pfad });

    const querverweise: LinkKarte[] = [
        ...a.verwandt.map((s) => {
            const v = anwendung(s)!;
            return { titel: v.name, text: v.teaser, href: `${KI_BASIS}/anwendungen/${v.slug}`, icon: ICONS[v.slug] };
        }),
        { titel: 'Alle Funktionen', text: 'Gesprächsführung, Mundart, Termine, Weiterleitung, Sicherheit.', href: `${KI_BASIS}/funktionen`, icon: BellRing },
        { titel: 'Preise', text: 'Monatliche Pakete und Rechner «Was kostet ein verpasster Anruf?».', href: `${KI_BASIS}/preise`, icon: FileText },
        { titel: 'Cloud-Telefonie', text: 'Die Telefonanlage von InfraOne, in die sich der Assistent einfügt.', href: '/cloud-telefonie', icon: PhoneIncoming },
    ];

    return (
        <>
            <JsonLd daten={kiSeitenSchemas(pfad, a.h1, a.metaBeschreibung, krumen)} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf pfad={pfad} krumen={krumen} eyebrow={`Anwendung: ${a.name}`} hinweis={a.inEntwicklung ? <InEntwicklungBadge /> : undefined} titel={a.h1} lead={<p>{a.lead}</p>} />

            {/* Problem */}
            <Abschnitt titel={a.problem.titel} hintergrund="surface">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    <Prosa className="lg:col-span-7">
                        {a.problem.absaetze.map((t) => (
                            <p key={t}>{t}</p>
                        ))}
                    </Prosa>
                    <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6">
                        <h3 className="font-bold text-text-primary mb-4">Typische Momente</h3>
                        <ul className="space-y-2.5">
                            {a.problem.momente.map((m) => (
                                <li key={m} className="flex gap-3 text-text-secondary leading-relaxed">
                                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
                                    {m}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Abschnitt>

            {/* Lösung */}
            <Abschnitt titel={a.loesung.titel}>
                <Prosa className="mb-10">
                    {a.loesung.absaetze.map((t) => (
                        <p key={t}>{t}</p>
                    ))}
                </Prosa>
                <ol className="grid sm:grid-cols-2 xl:grid-cols-4 gap-px rounded-3xl overflow-hidden border border-border bg-border">
                    {a.loesung.ablauf.map((s, i) => (
                        <li key={s.titel} className="bg-card p-6">
                            <span className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm mb-4" aria-hidden="true">
                                {i + 1}
                            </span>
                            <h3 className="text-lg font-bold text-text-primary mb-1.5">{s.titel}</h3>
                            {s.inEntwicklung && <InEntwicklungBadge className="mb-2" />}
                            <p className="text-text-secondary leading-relaxed">{s.text}</p>
                        </li>
                    ))}
                </ol>
            </Abschnitt>

            {/* Beispielgespräch */}
            <Abschnitt titel="So klingt es am Telefon" intro={<p>Dasselbe Gespräch zweimal: einmal in Mundart, einmal auf Hochdeutsch. Der Assistent versteht und spricht beides.</p>} hintergrund="surface">
                <GespraechPaar beispiel={a.beispiel} firma={a.firma} />
            </Abschnitt>

            {/* Danach */}
            <Abschnitt titel="Was danach passiert" intro={<p>{a.danach.absatz}</p>}>
                <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                    <ul className="lg:col-span-7 grid gap-4">
                        {a.danach.punkte.map((p, i) => {
                            const Icon = danachIcon(p.titel, i);
                            return (
                                <li key={p.titel} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                                    <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center" aria-hidden="true">
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    <span>
                                        <h3 className="font-bold text-text-primary">
                                            {p.titel}
                                            {p.inEntwicklung && (
                                                <>
                                                    {' '}
                                                    <InEntwicklungBadge className="ml-1" />
                                                </>
                                            )}
                                        </h3>
                                        <p className="mt-1 text-text-secondary leading-relaxed">{p.text}</p>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="lg:col-span-5">
                        <NotizKarte felder={a.danach.notiz} fuss="Darstellung vereinfacht, Beispiel aus dem Gespräch oben." />
                    </div>
                </div>
            </Abschnitt>

            {/* Für wen */}
            <Abschnitt titel="Für wen sich das lohnt" hintergrund="surface">
                <Prosa className="mb-8">
                    <p>{a.fuerWen.absatz}</p>
                </Prosa>
                <ul className="flex flex-wrap gap-3">
                    {a.fuerWen.branchen.map((s) => {
                        const b = branche(s)!;
                        return (
                            <li key={s}>
                                <Link
                                    href={`${KI_BASIS}/branchen/${s}`}
                                    className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-text-primary hover:border-primary/60 hover:text-primary transition-colors"
                                >
                                    {b.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </Abschnitt>

            {/* Was Sie festlegen */}
            <Abschnitt titel="Was Sie dafür festlegen" intro={<p>Bei der Einrichtung gehen wir diese Punkte mit Ihnen durch. Sie lassen sich später jederzeit anpassen.</p>}>
                <Hakenliste punkte={a.festlegen} spalten={2} />
            </Abschnitt>

            <Querverweise titel="Passt dazu" links={querverweise} />

            <AbschlussCta />
        </>
    );
}
