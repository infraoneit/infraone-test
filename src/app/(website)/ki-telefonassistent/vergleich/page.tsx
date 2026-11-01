import { Building2, ListChecks, PhoneCall } from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, Prosa, Querverweise, SeitenKopf } from '@/components/ki-telefonassistent/Bausteine';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
import { MitHinweis } from '@/components/ki-telefonassistent/InEntwicklung';
import { inEntwicklung } from '@/lib/in-entwicklung';

const PFAD = `${KI_BASIS}/vergleich`;
const TITEL = 'KI-Telefonassistent im Vergleich | InfraOne';
const BESCHREIBUNG =
    'KI-Telefonassistent, Anrufbeantworter, externer Telefonservice, Sekretariat oder Sprachmenü (IVR)? Ein sachlicher Vergleich mit Stärken und Grenzen.';

export const metadata = kiMetadata({ pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG });

const SPALTEN = ['KI-Telefonassistent', 'Anrufbeantworter', 'Externer Telefonservice', 'Sekretariat im Betrieb', 'Sprachmenü (IVR)'] as const;

const zeilen: Array<{ kriterium: string; werte: [string, string, string, string, string] }> = [
    { kriterium: 'Erreichbarkeit', werte: ['rund um die Uhr', 'rund um die Uhr, nur Aufnahme', 'zu den vereinbarten Zeiten', 'während der Arbeitszeit', 'rund um die Uhr'] },
    { kriterium: 'Beantwortet Fragen', werte: ['ja, aus Ihrem Wissen', 'nein', 'nach Gesprächsleitfaden', 'ja, mit Erfahrung im Betrieb', 'nur vorbereitete Ansagen'] },
    { kriterium: 'Erfasst Anliegen', werte: ['vollständig, Notiz per E-Mail', 'Sprachnachricht, oft unvollständig', 'Notiz durch Mitarbeitende', 'ja', 'nein'] },
    { kriterium: 'Mundart', werte: ['versteht und spricht Schweizerdeutsch', '–', 'je nach Besetzung', 'ja', 'Tastendruck oder Stichworte'] },
    // AUFTRAG-113: «in Entwicklung» statt «im Microsoft-365-Kalender» (Zusatz → Badge in der Zelle)
    { kriterium: 'Termine', werte: [inEntwicklung('Terminwunsch per E-Mail; Kalendereintrag'), 'nein', 'je nach Anbieter', 'ja', 'nein'] },
    { kriterium: 'Notfälle', werte: ['meldet sofort an Ihre Notfallnummer', 'erst beim Abhören', 'je nach Vereinbarung', 'während der Arbeitszeit', 'Weiterleitung per Taste'] },
    { kriterium: 'Mehrere Anrufe gleichzeitig', werte: ['ja, je nach Paket', 'ja', 'je nach Besetzung', 'einer nach dem anderen', 'ja'] },
    { kriterium: 'Persönlicher Kontakt', werte: ['KI-Stimme, Weiterleitung möglich', 'nein', 'ja, fremde Person', 'ja, kennt die Kundschaft', 'nein'] },
    { kriterium: 'Kostenmodell', werte: ['Monatspauschale mit Minuten', 'meist im Anschluss enthalten', 'meist pro Anruf oder Minute', 'Lohn und Arbeitsplatz', 'Teil der Telefonanlage'] },
];

const alternativen = [
    {
        titel: 'Wann ein Anrufbeantworter genügt',
        text: [
            'Wenn wenige Anrufe kommen, selten etwas dringend ist und Ihre Kundschaft bereit ist, eine Nachricht zu hinterlassen, reicht ein Anrufbeantworter. Er kostet wenig und ist schnell eingerichtet.',
            'Seine Grenze: Er beantwortet keine Frage und erkennt keinen Notfall. Ob eine Nachricht dringend ist, wissen Sie erst, wenn Sie sie abhören, und nicht alle Anrufenden sprechen auf Band.',
        ],
    },
    {
        titel: 'Wann ein externer Telefonservice passt',
        text: [
            'Ein Telefonservice setzt Menschen ans Telefon, die nach Ihrem Leitfaden Anrufe annehmen. Das passt, wenn Sie ausdrücklich eine menschliche Stimme wollen und die Anrufe gut planbar sind.',
            'Die Grenzen liegen bei Servicezeiten, Kosten pro Anruf oder Minute und beim Wissen über Ihren Betrieb: Die Mitarbeitenden betreuen viele Firmen gleichzeitig und kennen Ihre Abläufe nur aus dem Leitfaden.',
        ],
    },
    {
        titel: 'Wann ein Sekretariat unersetzlich ist',
        text: [
            'Eine Person im Betrieb kennt die Kundschaft, trifft Entscheidungen, empfängt Besuch und löst Fälle, die nicht ins Schema passen. Das kann kein Assistent ersetzen, und das soll er auch nicht.',
            'Er kann das Sekretariat aber entlasten: in der Mittagspause, wenn die Leitung besetzt ist, in Spitzenzeiten und nach Feierabend. Das Sekretariat erhält dann die Notizen und kümmert sich um das, was eine Person braucht.',
        ],
    },
    {
        titel: 'Wann ein Sprachmenü sinnvoll ist',
        text: [
            'Ein klassisches Sprachmenü – «Drücken Sie 1 für …» – verteilt Anrufe zuverlässig auf Abteilungen. Es beantwortet aber keine Fragen und nimmt keine Anliegen auf, und wessen Anliegen in keine Kategorie passt, drückt sich durch das Menü.',
            'Der Assistent ersetzt den Tastendruck durch ein Gespräch: Die anrufende Person sagt, worum es geht. In der Cloud-Telefonie von InfraOne lassen sich Sprachmenü und Assistent auch kombinieren.',
        ],
    },
];

export default function VergleichSeite() {
    const krumen = kiKrumen({ name: 'Vergleich', pfad: PFAD });

    return (
        <>
            <JsonLd daten={kiSeitenSchemas(PFAD, 'KI-Telefonassistent im Vergleich', BESCHREIBUNG, krumen)} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="Vergleich"
                titel="KI-Telefonassistent, Anrufbeantworter, Telefonservice oder Sekretariat?"
                lead={
                    <p>
                        Ein KI-Telefonassistent führt das Gespräch selbst, rund um die Uhr, und schickt Ihnen danach eine Notiz. Ein Anrufbeantworter nimmt nur Nachrichten auf, ein externer Telefonservice und ein Sekretariat arbeiten mit Menschen und festen Zeiten, ein klassisches Sprachmenü verteilt Anrufe per Tastendruck. Welche Lösung passt, hängt von Ihren Anrufen ab.
                    </p>
                }
            />

            <Abschnitt
                titel="Die fünf Lösungen im Überblick"
                intro={<p>Die Tabelle beschreibt typische Ausprägungen, keine bestimmten Anbieter. Im Einzelfall kann ein Telefonservice oder ein Sprachmenü mehr oder weniger können.</p>}
                hintergrund="surface"
            >
                <div className="overflow-x-auto rounded-3xl border border-border bg-card" role="region" aria-label="Vergleichstabelle" tabIndex={0}>
                    <table className="w-full min-w-[56rem] text-left text-sm">
                        <caption className="sr-only">Vergleich KI-Telefonassistent, Anrufbeantworter, externer Telefonservice, Sekretariat und Sprachmenü</caption>
                        <thead className="bg-surface/60 border-b border-border">
                            <tr>
                                <th scope="col" className="sticky left-0 bg-surface px-5 py-4 font-semibold text-text-secondary">
                                    Kriterium
                                </th>
                                {SPALTEN.map((s, i) => (
                                    <th key={s} scope="col" className={`px-5 py-4 font-semibold ${i === 0 ? 'text-primary-hover dark:text-primary' : 'text-text-primary'}`}>
                                        {s}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {zeilen.map((z) => (
                                <tr key={z.kriterium}>
                                    <th scope="row" className="sticky left-0 bg-card px-5 py-4 font-semibold text-text-primary align-top">
                                        {z.kriterium}
                                    </th>
                                    {z.werte.map((w, i) => (
                                        <td key={i} className={`px-5 py-4 align-top leading-relaxed ${i === 0 ? 'bg-primary/[0.05] text-text-primary font-medium' : 'text-text-secondary'}`}>
                                            <MitHinweis text={w} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-sm text-text-secondary lg:hidden">Tabelle seitlich wischen, um alle Spalten zu sehen.</p>
            </Abschnitt>

            <Abschnitt titel="Stärken und Grenzen der Alternativen">
                <div className="grid md:grid-cols-2 gap-5">
                    {alternativen.map((a) => (
                        <div key={a.titel} className="h-full rounded-2xl border border-border bg-card p-6 lg:p-8">
                            <h3 className="text-xl font-bold text-text-primary mb-3">{a.titel}</h3>
                            {a.text.map((t) => (
                                <p key={t} className="mt-3 text-text-secondary leading-relaxed">
                                    {t}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>
            </Abschnitt>

            <Abschnitt titel="Kombinieren statt ersetzen" hintergrund="surface">
                <Prosa>
                    <p>
                        Häufig ist eine Kombination sinnvoll. Tagsüber nimmt Ihr Team ab, der Assistent übernimmt, wenn die Leitung besetzt ist oder nach einigen Klingeltönen niemand abnimmt. Abends und am Wochenende übernimmt er ganz, mit strengeren Regeln für Notfälle.
                    </p>
                    <p>
                        So behalten Sie den persönlichen Kontakt dort, wo er zählt, und verlieren trotzdem keinen Anruf. Die Notizen landen bei den Personen, die sich darum kümmern.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Wann der KI-Assistent nicht die richtige Wahl ist">
                <Prosa>
                    <p>
                        Wenn fast jeder Anruf eine persönliche Beratung oder einen Entscheid braucht, hilft ein Assistent nur am Rand. Wenn Ihre Kundschaft vor allem in anderen Sprachen als Schweizerdeutsch, Hochdeutsch oder Englisch anruft, ist er heute nicht die passende Lösung. Und wenn bei Ihnen kaum Anrufe verloren gehen, reicht vielleicht der Anrufbeantworter.
                    </p>
                    <p>
                        Ob es sich lohnt, rechnen Sie am besten mit Ihren eigenen Zahlen im <a href={`${KI_BASIS}/preise#rechner`}>Rechner «Was kostet ein verpasster Anruf?»</a> nach – und hören Sie im Testanruf, wie der Assistent mit Ihrer Website klingt.
                    </p>
                </Prosa>
            </Abschnitt>

            <Querverweise
                links={[
                    { titel: 'Funktionen', text: 'Was der Assistent im Detail kann.', href: `${KI_BASIS}/funktionen`, icon: ListChecks },
                    { titel: 'Cloud-Telefonie', text: 'Telefonanlage mit Sprachmenü, in die sich der Assistent einfügt.', href: '/cloud-telefonie', icon: PhoneCall },
                    { titel: 'Branchen', text: 'Beispiele aus Handwerk, Praxis, Treuhand, Immobilien und Garage.', href: `${KI_BASIS}/branchen`, icon: Building2 },
                ]}
            />

            <AbschlussCta />
        </>
    );
}
