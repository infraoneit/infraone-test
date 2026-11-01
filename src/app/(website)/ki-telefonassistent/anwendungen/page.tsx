import Link from 'next/link';
import { ArrowRight, Building2, CalendarCheck, ClipboardList, Layers, ListChecks, Mail, MessageSquareText, PhoneIncoming, Siren, type LucideIcon } from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, Prosa, Querverweise, SeitenKopf } from '@/components/ki-telefonassistent/Bausteine';
import { ANWENDUNGEN } from '@/components/ki-telefonassistent/inhalte/anwendungen';
import { branche } from '@/components/ki-telefonassistent/inhalte/branchen';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
import { InEntwicklungBadge } from '@/components/ki-telefonassistent/InEntwicklung';
import { generateItemListSchema } from '@/lib/seo/schema';

const PFAD = `${KI_BASIS}/anwendungen`;
const TITEL = 'Anwendungen des KI-Telefonassistenten | InfraOne';
const BESCHREIBUNG =
    'Erreichbarkeit, Auskunft, Anliegen erfassen, Terminbuchung und Notfall: So setzen Schweizer KMU den KI-Telefonassistenten im Alltag ein, mit Beispielen.';

export const metadata = kiMetadata({ pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG });

const ICONS: Record<string, LucideIcon> = {
    erreichbarkeit: PhoneIncoming,
    auskunft: MessageSquareText,
    'anliegen-erfassen': ClipboardList,
    terminbuchung: CalendarCheck,
    notfall: Siren,
};

// AUFTRAG-113: Kalendereintrag in Entwicklung — hier nur, was heute geht.
// [31.10.2026] AUFTRAG-114: Die SMS-Bestätigung funktioniert bereits → Schritt «Notiz und SMS» wie vor AUFTRAG-113.
const ablauf = [
    { titel: 'Begrüssung', text: 'mit Ihrem Firmennamen' },
    { titel: 'Frage beantworten', text: 'Auskunft aus Ihrem Wissen' },
    { titel: 'Anliegen aufnehmen', text: 'Name, Firma, Anliegen, Rückruf' },
    { titel: 'Terminwunsch oder Notfall', text: 'Notiz oder Notfallnummer' },
    { titel: 'Notiz und SMS', text: 'an Sie und an die anrufende Person' },
];

const wegweiser = [
    { wenn: 'Sie verpassen Anrufe, weil Ihr Team unterwegs oder beschäftigt ist', dann: 'erreichbarkeit' },
    { wenn: 'dieselben Fragen Ihr Team mehrmals am Tag unterbrechen', dann: 'auskunft' },
    { wenn: 'Telefonnotizen unvollständig sind oder im Team verloren gehen', dann: 'anliegen-erfassen' },
    { wenn: 'Ihre Arbeit in Terminen organisiert ist und viele Terminwünsche am Telefon ankommen', dann: 'terminbuchung' },
    { wenn: 'Sie einen Pikettdienst führen oder Kundschaft nachts Hilfe braucht', dann: 'notfall' },
] as const;

export default function AnwendungenSeite() {
    const krumen = kiKrumen({ name: 'Anwendungen', pfad: PFAD });
    const itemList = generateItemListSchema(
        ANWENDUNGEN.map((a) => a.name),
        'Anwendungen des KI-Telefonassistenten',
    );

    return (
        <>
            <JsonLd daten={[...kiSeitenSchemas(PFAD, 'Anwendungen des KI-Telefonassistenten', BESCHREIBUNG, krumen), itemList]} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="Anwendungen"
                titel="Wofür KMU den KI-Telefonassistenten einsetzen"
                lead={
                    <p>
                        Der KI-Telefonassistent übernimmt am Telefon fünf Aufgaben: erreichbar sein, Auskunft geben, Anliegen erfassen, Terminwünsche aufnehmen und Notfälle weitermelden. Oft kommt mehreres zusammen – hier sehen Sie, wie jede Aufgabe im Alltag aussieht.
                    </p>
                }
            />

            {/* Die fünf Anwendungen */}
            <Abschnitt titel="Fünf Aufgaben, ein Assistent" hintergrund="surface" intro={<p>Jede Seite zeigt das Problem, die Lösung, ein Beispielgespräch in Mundart und auf Hochdeutsch und was nach dem Anruf passiert.</p>}>
                <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {ANWENDUNGEN.map((a) => {
                        const Icon = ICONS[a.slug];
                        return (
                            <li key={a.slug}>
                                <Link href={`${PFAD}/${a.slug}`} className="group h-full flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
                                    <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5" aria-hidden="true">
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    <h3 className="text-xl font-bold text-text-primary group-hover:text-primary">{a.name}</h3>
                                    {a.inEntwicklung && <InEntwicklungBadge className="mt-2 w-fit" />}
                                    <p className="mt-2 text-text-secondary leading-relaxed">{a.lead.split('. ')[0]}.</p>
                                    <p className="mt-4 text-sm text-text-secondary">
                                        <span className="font-semibold text-text-primary">Typisch für: </span>
                                        {a.fuerWen.branchen.map((s) => branche(s)!.name).join(', ')}
                                    </p>
                                    <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-hover dark:text-primary">
                                        Zur Anwendung
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                    <li>
                        <div className="h-full flex flex-col rounded-2xl border border-dashed border-border p-6">
                            <span className="w-11 h-11 rounded-xl bg-surface text-text-secondary flex items-center justify-center mb-5 border border-border" aria-hidden="true">
                                <Layers className="w-5 h-5" />
                            </span>
                            <h3 className="text-xl font-bold text-text-primary">Ihre eigene Aufgabe</h3>
                            <p className="mt-2 text-text-secondary leading-relaxed">
                                Haben Sie einen Ablauf am Telefon, der hier fehlt? Erzählen Sie uns davon. Für Abläufe, die über Notiz, SMS, Weiterleitung und Notfallmeldung hinausgehen, prüfen wir mit Ihnen eigene Integrationen.
                            </p>
                            <Link href="/kontakt" className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-primary hover:text-primary">
                                Beratung vereinbaren
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </li>
                </ul>
            </Abschnitt>

            {/* Ein Anruf, mehrere Aufgaben */}
            <Abschnitt titel="Ein Anruf, mehrere Aufgaben" intro={<p>Im echten Gespräch greifen die Anwendungen ineinander. Eine Kundin fragt nach den Öffnungszeiten, erwähnt dann ihr eigentliches Anliegen und möchte gleich einen Termin. Der Assistent führt durch alle Schritte in einem Gespräch.</p>}>
                <ol className="grid gap-3 md:grid-cols-5">
                    {ablauf.map((s, i) => (
                        <li key={s.titel} className="relative rounded-2xl border border-border bg-card p-5">
                            <span className="text-xs font-semibold text-text-secondary">Schritt {i + 1}</span>
                            <h3 className="mt-1 font-bold text-text-primary">{s.titel}</h3>
                            <p className="mt-1 text-sm text-text-secondary">{s.text}</p>
                            {i < ablauf.length - 1 && (
                                <ArrowRight className="hidden md:block absolute -right-[0.65rem] top-1/2 -translate-y-1/2 w-4 h-4 text-primary bg-background rounded-full" aria-hidden="true" />
                            )}
                        </li>
                    ))}
                </ol>
                <Prosa className="mt-10">
                    <p>
                        Welche Schritte der Assistent in einem Gespräch ausführt, hängt davon ab, was Sie freigeben. Ein Betrieb, der keine Termine am Telefon vergibt, lässt die Terminbuchung weg; ein Büro ohne Pikett braucht keine Notfallregeln. Die Gesprächsnotiz per E-Mail erhalten Sie in jedem Fall.
                    </p>
                </Prosa>
            </Abschnitt>

            {/* Wegweiser */}
            <Abschnitt titel="Welche Anwendung passt zu Ihnen?" hintergrund="surface" intro={<p>Ein kurzer Wegweiser. Er ersetzt kein Gespräch, zeigt aber, wo Sie am meisten gewinnen.</p>}>
                <ul className="rounded-3xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {wegweiser.map((w) => {
                        const a = ANWENDUNGEN.find((x) => x.slug === w.dann)!;
                        return (
                            <li key={w.dann} className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2 md:gap-6 px-5 py-5 md:px-6 items-center">
                                <p className="text-text-secondary leading-relaxed">
                                    <span className="font-semibold text-text-primary">Wenn </span>
                                    {w.wenn},
                                </p>
                                <Link href={`${PFAD}/${a.slug}`} className="inline-flex items-center gap-2 font-semibold text-text-primary hover:text-primary">
                                    <ListChecks className="w-4 h-4 text-primary" aria-hidden="true" />
                                    dann: {a.name}
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </Abschnitt>

            {/* Womit anfangen */}
            <Abschnitt titel="Womit Sie anfangen">
                <Prosa>
                    <p>
                        Fangen Sie mit dem an, was heute am meisten schmerzt. Naheliegend für kleine Betriebe ist die Erreichbarkeit zusammen mit dem Erfassen von Anliegen: Der Assistent nimmt ab, wenn niemand Zeit hat, und Sie erhalten nach jedem Gespräch eine vollständige Notiz.
                    </p>
                    <p>
                        Terminwünsche und Notfallregeln kommen dazu, sobald Sie wissen, welche Termine der Assistent aufnehmen soll und was bei Ihnen als Notfall gilt. Das Wissen aus Ihrer Website steht von Anfang an zur Verfügung, die Auskunft läuft also vom ersten Tag an mit.
                    </p>
                    <p>
                        Wie gut das zu Ihrem Betrieb passt, hören Sie am schnellsten selbst: Im <Link href={KI_BASIS}>Testanruf</Link> baut die Demo aus Ihrer Website einen Assistenten und ruft Sie an.
                    </p>
                </Prosa>
            </Abschnitt>

            <Querverweise
                links={[
                    { titel: 'Branchen', text: 'Typische Anrufe und Beispielgespräche aus sechs Branchen.', href: `${KI_BASIS}/branchen`, icon: Building2 },
                    { titel: 'Funktionen', text: 'Alle Funktionen in Gruppen, mit Hörbeispielen.', href: `${KI_BASIS}/funktionen`, icon: ListChecks },
                    { titel: 'So funktioniert es', text: 'Vom Testanruf zum eigenen Assistenten.', href: `${KI_BASIS}/so-funktioniert-es`, icon: Mail },
                ]}
            />

            <AbschlussCta />
        </>
    );
}
