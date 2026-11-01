import Link from 'next/link';
import { ArrowRight, Ban, Building2, FileText, ListChecks } from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, Querverweise, SeitenKopf } from '@/components/ki-telefonassistent/Bausteine';
import { Gespraech } from '@/components/ki-telefonassistent/Gespraech';
import { FUNKTIONS_GRUPPEN } from '@/components/ki-telefonassistent/inhalte/funktionen';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
import { InEntwicklungBadge } from '@/components/ki-telefonassistent/InEntwicklung';
import { MitKiAnbieterLink } from '@/components/ki-telefonassistent/KiAnbieter';
import { generateItemListSchema } from '@/lib/seo/schema';

const PFAD = `${KI_BASIS}/funktionen`;
const TITEL = 'Funktionen des KI-Telefonassistenten | InfraOne';
const BESCHREIBUNG =
    // AUFTRAG-114: SMS-Bestätigung wieder verfügbar
    'Alle Funktionen des KI-Telefonassistenten: Mundart, Anliegen erfassen, Terminwünsche, Weiterleitung, Notfall, SMS, Wissen aus der Website und Telefonie.';

export const metadata = kiMetadata({ pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG });

const nichtTun = [
    { titel: 'Keine Zusagen ausserhalb Ihres Wissens', text: 'Er antwortet aus dem, was Sie freigeben. Fehlt etwas, nimmt er das Anliegen für einen Rückruf auf.' },
    { titel: 'Keine Beratung bei ausgeschlossenen Themen', text: 'Medizinische, rechtliche oder technische Ratschläge schliessen Sie aus, wenn Sie das wollen. Dann verweist er an Ihr Team.' },
    { titel: 'Keine Tonaufnahmen', text: 'Gespräche werden nicht aufgezeichnet. Es entstehen Transkript und Zusammenfassung.' },
    { titel: 'Kein Ersatz für Ihre Fachleute', text: 'Er nimmt ab, sortiert und hält fest. Entscheiden, beraten und reparieren bleibt bei Ihnen.' },
];

export default function FunktionenSeite() {
    const krumen = kiKrumen({ name: 'Funktionen', pfad: PFAD });
    const itemList = generateItemListSchema(
        FUNKTIONS_GRUPPEN.flatMap((g) => g.funktionen.map((f) => f.titel)),
        'Funktionen des KI-Telefonassistenten',
    );

    return (
        <>
            <JsonLd daten={[...kiSeitenSchemas(PFAD, 'Funktionen des KI-Telefonassistenten', BESCHREIBUNG, krumen), itemList]} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="Funktionen"
                titel="Was der KI-Telefonassistent kann"
                lead={
                    <p>
                        Der KI-Telefonassistent nimmt Anrufe für Ihren Betrieb entgegen, beantwortet Fragen und hält Anliegen fest – auf Schweizerdeutsch, Hochdeutsch oder Englisch. Hier finden Sie alle Funktionen nach Themen geordnet, jeweils mit einem kurzen Beispiel, wie es sich am Telefon anhört.
                    </p>
                }
                unterLead={
                    <nav aria-label="Funktionsgruppen" className="mt-8">
                        <ul className="flex flex-wrap gap-2">
                            {FUNKTIONS_GRUPPEN.map((g) => (
                                <li key={g.id}>
                                    {/* natives <a>: Sprung auf derselben Seite */}
                                    <a
                                        href={`#${g.id}`}
                                        className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-text-primary hover:border-primary/60 hover:text-primary transition-colors"
                                    >
                                        {g.titel}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                }
            />

            {FUNKTIONS_GRUPPEN.map((g, gi) => (
                <Abschnitt key={g.id} id={g.id} titel={g.titel} intro={<p>{g.intro}</p>} hintergrund={gi % 2 === 0 ? 'surface' : 'background'}>
                    <div className={`grid gap-5 ${g.funktionen.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                        {g.funktionen.map((f) => (
                            <article key={f.id} id={f.id} className="h-full flex flex-col rounded-2xl border border-border bg-card p-6 scroll-mt-24">
                                <h3 className="text-xl font-bold text-text-primary">{f.titel}</h3>
                                {/* AUFTRAG-113/114: Badge nur noch für den Kalendereintrag */}
                                {f.inEntwicklung && <InEntwicklungBadge className="mt-2 w-fit" />}
                                {/* AUFTRAG-114: «Datenschutzerklärung» im KI-Anbieter-Satz verlinkt */}
                                <p className="mt-2 text-text-secondary leading-relaxed">
                                    <MitKiAnbieterLink text={f.text} />
                                </p>
                                <p className="mt-5 mb-2 text-xs font-semibold text-text-secondary">So hört es sich an</p>
                                <Gespraech sprache={f.beispiel.sprache} zeilen={f.beispiel.zeilen} titel="Hörbeispiel" kompakt className="bg-background" />
                                {f.link && (
                                    <Link href={f.link.href} className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-hover dark:text-primary">
                                        {f.link.text}
                                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                )}
                            </article>
                        ))}
                    </div>
                </Abschnitt>
            ))}

            <Abschnitt titel="Was der Assistent bewusst nicht tut" intro={<p>Ein guter Assistent kennt seine Grenzen. Diese hier sind Absicht.</p>} hintergrund="surface">
                <ul className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {nichtTun.map((n) => (
                        <li key={n.titel} className="h-full rounded-2xl border border-border bg-card p-6">
                            <Ban className="w-5 h-5 text-text-secondary mb-4" aria-hidden="true" />
                            <h3 className="font-bold text-text-primary mb-2">{n.titel}</h3>
                            <p className="text-text-secondary leading-relaxed">{n.text}</p>
                        </li>
                    ))}
                </ul>
            </Abschnitt>

            <Querverweise
                titel="Funktionen im Einsatz"
                hintergrund="background"
                links={[
                    { titel: 'Anwendungen', text: 'Erreichbarkeit, Auskunft, Anliegen, Termine und Notfall mit Beispielgesprächen.', href: `${KI_BASIS}/anwendungen`, icon: ListChecks },
                    { titel: 'Branchen', text: 'Wie Elektriker, Praxen, Garagen und andere den Assistenten nutzen.', href: `${KI_BASIS}/branchen`, icon: Building2 },
                    { titel: 'Preise', text: 'Welche Funktionen in welchem Paket stecken.', href: `${KI_BASIS}/preise`, icon: FileText },
                ]}
            />

            <AbschlussCta />
        </>
    );
}
