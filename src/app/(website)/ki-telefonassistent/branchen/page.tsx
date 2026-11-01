import Link from 'next/link';
import { ArrowRight, Briefcase, Building2, Car, ClipboardList, FileText, ListChecks, MessageSquareText, PhoneIncoming, Siren, Stethoscope, Wrench, Zap, type LucideIcon } from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, IconKachel, Prosa, Querverweise, SeitenKopf } from '@/components/ki-telefonassistent/Bausteine';
import { BRANCHEN } from '@/components/ki-telefonassistent/inhalte/branchen';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
import { generateItemListSchema } from '@/lib/seo/schema';

const PFAD = `${KI_BASIS}/branchen`;
const TITEL = 'KI-Telefonassistent nach Branchen | InfraOne';
const BESCHREIBUNG =
    'Elektriker, Sanitär und Heizung, Arztpraxis, Treuhand, Immobilien, Garage: typische Anrufe, Beispielgespräche und Integration des KI-Telefonassistenten.';

export const metadata = kiMetadata({ pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG });

const ICONS: Record<string, LucideIcon> = {
    elektriker: Zap,
    'sanitaer-heizung': Wrench,
    arztpraxis: Stethoscope,
    treuhand: Briefcase,
    immobilien: Building2,
    garage: Car,
};

const gemeinsam = [
    { icon: PhoneIncoming, titel: 'Anrufe im falschen Moment', text: 'Das Telefon klingelt, wenn das Team beim Kunden, in der Werkstatt oder in der Sprechstunde ist.' },
    { icon: MessageSquareText, titel: 'Immer dieselben Fragen', text: 'Öffnungszeiten, Anfahrt, Ablauf: Antworten, die längst auf der Website stehen.' },
    { icon: ClipboardList, titel: 'Anliegen, die vollständig ankommen müssen', text: 'Wer zurückruft, braucht Name, Firma, Anliegen und Nummer, nicht nur einen Vornamen.' },
    { icon: Siren, titel: 'Dringendes, das nicht warten darf', text: 'Ein Notfall muss sofort zur richtigen Person, alles andere kann bis morgen warten.' },
];

export default function BranchenSeite() {
    const krumen = kiKrumen({ name: 'Branchen', pfad: PFAD });
    const itemList = generateItemListSchema(
        BRANCHEN.map((b) => `KI-Telefonassistent für ${b.name}`),
        'KI-Telefonassistent nach Branchen',
    );

    return (
        <>
            <JsonLd daten={[...kiSeitenSchemas(PFAD, 'KI-Telefonassistent nach Branchen', BESCHREIBUNG, krumen), itemList]} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="Branchen"
                titel="KI-Telefonassistent für Ihre Branche"
                lead={
                    <p>
                        Der KI-Telefonassistent passt überall, wo das Team arbeitet, statt am Telefon zu sitzen. Für sechs Branchen zeigen wir typische Anrufe, ein Beispielgespräch in Mundart und auf Hochdeutsch und wie sich der Assistent in den Betrieb einfügt.
                    </p>
                }
            />

            <Abschnitt titel="Sechs Branchen im Detail" hintergrund="surface">
                <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {BRANCHEN.map((b) => {
                        const Icon = ICONS[b.slug];
                        return (
                            <li key={b.slug}>
                                <Link href={`${PFAD}/${b.slug}`} className="group h-full flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
                                    <span className="flex items-center gap-3">
                                        <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center" aria-hidden="true">
                                            <Icon className="w-5 h-5" />
                                        </span>
                                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary">{b.name}</h3>
                                    </span>
                                    <p className="mt-4 text-text-secondary leading-relaxed">{b.teaser}</p>
                                    <p className="mt-4 text-sm font-semibold text-text-primary">Typische Anrufe</p>
                                    <ul className="mt-2 space-y-1.5">
                                        {b.anrufe.slice(0, 3).map((x) => (
                                            <li key={x.anruf} className="text-sm text-text-secondary leading-snug">
                                                {x.anruf}
                                            </li>
                                        ))}
                                    </ul>
                                    <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-hover dark:text-primary">
                                        Zur Branche
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </Abschnitt>

            <Abschnitt titel="Was alle Branchen gemeinsam haben" intro={<p>So unterschiedlich die Betriebe sind, am Telefon kämpfen sie mit denselben vier Dingen. Genau dort setzt der Assistent an.</p>}>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {gemeinsam.map((g) => (
                        <IconKachel key={g.titel} icon={g.icon} titel={g.titel}>
                            {g.text}
                        </IconKachel>
                    ))}
                </div>
            </Abschnitt>

            <Abschnitt titel="Was sich je Branche unterscheidet" hintergrund="surface">
                <Prosa>
                    <p>
                        <strong>Notfallregeln.</strong> In der <Link href={`${PFAD}/sanitaer-heizung`}>Haustechnik</Link> und beim <Link href={`${PFAD}/elektriker`}>Elektriker</Link> entscheidet die Einordnung zwischen Notfall und Anliegen, wer nachts geweckt wird. Im <Link href={`${PFAD}/treuhand`}>Treuhandbüro</Link> gibt es meist keine Notfälle, dafür Fristen und viele Rückrufwünsche.
                    </p>
                    <p>
                        <strong>Datenschutz.</strong> In der <Link href={`${PFAD}/arztpraxis`}>Arztpraxis</Link> geht es um Gesundheitsdaten, die das Datenschutzgesetz besonders schützt. Dort legen Sie fest, dass der Assistent nur erfragt, was für den Rückruf nötig ist, und keine medizinischen Auskünfte gibt.
                    </p>
                    <p>
                        <strong>Termine.</strong> In der <Link href={`${PFAD}/garage`}>Garage</Link> kommen die Termine in Wellen, im Frühling und Herbst zum Pneuwechsel. In der <Link href={`${PFAD}/immobilien`}>Bewirtschaftung</Link> sind es Besichtigungen, die sich nach freien Wohnungen richten.
                    </p>
                    <p>
                        <strong>Wissen.</strong> Was der Assistent wissen muss, ist überall anders: Inserate, Checklisten für die Steuererklärung, Marken in der Werkstatt, Parkplätze vor der Praxis. Das Grundwissen kommt aus Ihrer Website, den Rest ergänzen Sie.
                    </p>
                    <p>
                        <strong>Weiterleitung.</strong> Wer wann direkt verbunden wird, hängt vom Betrieb ab. Im Treuhandbüro ist es vielleicht die zuständige Sachbearbeiterin, in der Garage der Verkauf, in der Bewirtschaftung der Hauswart. Der Assistent leitet an die Nummer weiter, die Sie für den jeweiligen Fall hinterlegen, und nimmt sonst das Anliegen für den Rückruf auf.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Ihre Branche fehlt?">
                <Prosa>
                    <p>
                        Die sechs Branchen sind Beispiele, keine Grenze. Gastronomie, Coiffeur, Physiotherapie, Handel oder Beratung funktionieren nach demselben Prinzip: Der Assistent nimmt ab, beantwortet Fragen aus Ihrem Wissen, nimmt Anliegen auf und schickt Ihnen eine Notiz.
                    </p>
                    <p>
                        Am schnellsten sehen Sie es im <Link href={KI_BASIS}>Testanruf mit Ihrer eigenen Website</Link>. Wenn Sie lieber zuerst darüber sprechen, <Link href="/kontakt">vereinbaren Sie ein Gespräch</Link> mit uns.
                    </p>
                </Prosa>
            </Abschnitt>

            <Querverweise
                links={[
                    { titel: 'Anwendungen', text: 'Erreichbarkeit, Auskunft, Anliegen erfassen, Terminbuchung, Notfall.', href: `${KI_BASIS}/anwendungen`, icon: ListChecks },
                    { titel: 'Funktionen', text: 'Alle Funktionen in Gruppen, mit Hörbeispielen.', href: `${KI_BASIS}/funktionen`, icon: MessageSquareText },
                    { titel: 'Preise', text: 'Pakete und Rechner «Was kostet ein verpasster Anruf?».', href: `${KI_BASIS}/preise`, icon: FileText },
                ]}
            />

            <AbschlussCta />
        </>
    );
}
