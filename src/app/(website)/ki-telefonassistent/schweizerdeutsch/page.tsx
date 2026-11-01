import { AudioLines, Ear, Globe2, ListChecks, MessageSquareText, ShieldCheck, Volume2 } from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, FaqListe, IconKachel, Prosa, Querverweise, SeitenKopf, type FaqEintrag } from '@/components/ki-telefonassistent/Bausteine';
import { Gespraech } from '@/components/ki-telefonassistent/Gespraech';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';

const PFAD = `${KI_BASIS}/schweizerdeutsch`;
const TITEL = 'KI-Telefonassistent auf Schweizerdeutsch | InfraOne';
const BESCHREIBUNG =
    'Der KI-Telefonassistent von InfraOne versteht Schweizerdeutsch und antwortet in Mundart, Hochdeutsch oder Englisch. Was er kann und wo die Grenzen liegen.';

export const metadata = kiMetadata({
    pfad: PFAD,
    titel: TITEL,
    beschreibung: BESCHREIBUNG,
    keywords: ['KI Telefonassistent Schweizerdeutsch', 'Voicebot Mundart', 'KI versteht Schweizerdeutsch', 'Telefonassistent Dialekt'],
});

const woerter = [
    { mundart: 'aalüüte', bedeutung: 'anrufen' },
    { mundart: 'Sicherig', bedeutung: 'Sicherung' },
    { mundart: 'es tröpflet', bedeutung: 'es tropft' },
    { mundart: 'Lavabo', bedeutung: 'Waschbecken' },
    { mundart: 'Pneu', bedeutung: 'Reifen' },
    { mundart: 'am halbi drü', bedeutung: 'um 14.30 Uhr' },
    { mundart: 'verbiluege', bedeutung: 'vorbeischauen' },
    { mundart: 'Offerte', bedeutung: 'Angebot' },
];

const grenzen = [
    {
        icon: Globe2,
        titel: 'Dialektvielfalt',
        text: 'Zwischen Basel, Bern, dem Wallis, Graubünden und St. Gallen liegen Welten. Nicht jeder Ausdruck aus jeder Region wird auf Anhieb verstanden; seltene Wörter oder sehr starker Dialekt können zu Rückfragen führen.',
    },
    {
        icon: MessageSquareText,
        titel: 'Namen und Adressen',
        text: 'Familien- und Strassennamen sind am Telefon schwierig, auch für Menschen. Wir empfehlen, den Assistenten bei Namen nachfragen und buchstabieren zu lassen. Im Transkript sehen Sie, was er verstanden hat.',
    },
    {
        icon: Volume2,
        titel: 'Lärm und Verbindung',
        text: 'Baustellenlärm, Fahrgeräusche oder eine schlechte Mobilfunkverbindung erschweren das Verstehen – in Mundart wie auf Hochdeutsch.',
    },
    {
        icon: AudioLines,
        titel: 'Seine eigene Mundart',
        text: 'Er spricht Mundart, aber nicht den Dialekt jedes Dorfes, und nicht jede Formulierung klingt wie von hier. Im Testanruf ist Schweizerdeutsch deshalb noch als «in Erprobung» gekennzeichnet.',
    },
];

const faq: FaqEintrag[] = [
    {
        id: 'mundart-ausschalten',
        frage: 'Kann ich festlegen, dass der Assistent Hochdeutsch spricht?',
        antwort: 'Ja. Sie legen fest, in welcher Sprache er begrüsst und antwortet. Das kann sinnvoll sein, wenn ein grosser Teil Ihrer Kundschaft aus Deutschland kommt oder Sie viele internationale Anrufe haben.',
    },
    {
        id: 'weitere-sprachen',
        frage: 'Spricht der Assistent auch Französisch oder Italienisch?',
        antwort: 'Angeboten werden Schweizerdeutsch, Hochdeutsch und Englisch. Wenn Sie weitere Sprachen brauchen, sprechen Sie uns an.',
    },
    {
        id: 'dialekt-testen',
        frage: 'Wie finde ich heraus, ob er meinen Dialekt versteht?',
        antwort: 'Am einfachsten im Testanruf: Geben Sie Ihre Website ein, wählen Sie Schweizerdeutsch und reden Sie, wie Sie mit Ihrer Kundschaft reden. Pro Gerät sind zwei Testanrufe am Tag möglich.',
        link: { text: 'Zum Testanruf', href: KI_BASIS },
    },
];

export default function SchweizerdeutschSeite() {
    const krumen = kiKrumen({ name: 'Schweizerdeutsch', pfad: PFAD });

    return (
        <>
            <JsonLd daten={kiSeitenSchemas(PFAD, 'KI-Telefonassistent auf Schweizerdeutsch', BESCHREIBUNG, krumen)} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="Schweizerdeutsch"
                titel="Ein Telefonassistent, der Mundart versteht und spricht"
                lead={
                    <p>
                        Ja: Der KI-Telefonassistent von InfraOne versteht Schweizerdeutsch und antwortet auch in Mundart. Anrufende müssen nicht auf Hochdeutsch umstellen – und wer Hochdeutsch oder Englisch spricht, wird ebenso bedient.
                    </p>
                }
                aside={
                    <div>
                        <Gespraech
                            sprache="gsw"
                            titel="Beispiel in Mundart"
                            zeilen={[
                                { wer: 'assistent', text: 'Grüezi, Muster Sanitär GmbH, de digital Assistänt. Wie chan ich Ihne hälfe?' },
                                { wer: 'anrufer', text: 'Grüezi, bi mir tröpflet s Lavabo. Chönnt öpper emal verbiluege?' },
                                { wer: 'assistent', text: 'Sicher. Ich nimm das gern uf. Wänn sind Sie die Wuche dihei?' },
                                { wer: 'anrufer', text: 'Am Donnschtig am Namittag.' },
                            ]}
                        />
                        <p className="mt-3 text-sm text-text-secondary">Beispiel, gekürzt. Erfundene Firma.</p>
                    </div>
                }
            />

            <Abschnitt titel="Warum Mundart am Telefon zählt" hintergrund="surface">
                <Prosa>
                    <p>
                        In der Deutschschweiz ist Mundart die Alltagssprache, auch am Telefon. Wer bei einem Betrieb anruft, redet so, wie er immer redet – besonders, wenn es schnell gehen muss oder etwas nicht stimmt. Wer aufgeregt ist, weil im Keller Wasser steht, stellt nicht auf Hochdeutsch um.
                    </p>
                    <p>
                        Ein Telefonsystem, das nur Hochdeutsch versteht, zwingt Anrufende zum Umschalten oder zu Stichworten. Ein Assistent, der Mundart versteht, lässt sie reden. Und eine Begrüssung in Mundart klingt nach dem Betrieb aus der Region, nicht nach einer Hotline.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Verstehen: Mundart, wie sie am Telefon klingt">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    <Prosa className="lg:col-span-6">
                        <p>
                            Der Assistent versteht Schweizerdeutsch, nicht nur einzelne Stichworte. Anrufende können ganze Sätze mit Dialektwörtern sagen, Uhrzeiten wie «am halbi drü» oder Ortsnamen aus der Region, und das Anliegen landet in der Notiz für Ihr Team.
                        </p>
                        <p>
                            Dahinter steht Sprach-zu-Sprach-KI: Das Modell hört das Gesprochene und antwortet direkt, statt es erst in Text umzuwandeln und Textbausteine vorzulesen. Für Mundart ist das ein Vorteil, weil Tonfall und Satzmelodie im Gespräch erhalten bleiben.
                        </p>
                    </Prosa>
                    <div className="lg:col-span-6 rounded-2xl border border-border bg-card overflow-hidden">
                        <p className="px-5 py-3 border-b border-border bg-surface/60 text-sm font-semibold text-text-primary">Wörter, die am Telefon vorkommen</p>
                        <dl className="divide-y divide-border">
                            {woerter.map((w) => (
                                <div key={w.mundart} className="grid grid-cols-2 gap-4 px-5 py-3">
                                    <dt className="font-semibold text-text-primary" lang="gsw">
                                        {w.mundart}
                                    </dt>
                                    <dd className="text-text-secondary">{w.bedeutung}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </Abschnitt>

            <Abschnitt titel="Sprechen: Antworten in Mundart oder Hochdeutsch" hintergrund="surface">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    <Prosa className="lg:col-span-6">
                        <p>
                            Der Assistent spricht selbst Schweizerdeutsch. Sie legen fest, in welcher Sprache er begrüsst: in Mundart für die Kundschaft aus der Region, auf Hochdeutsch, wenn viele Anrufe aus Deutschland kommen, oder auf Englisch für internationale Anrufende.
                        </p>
                        <p>
                            Egal, in welcher Sprache das Gespräch lief: Nach dem Gespräch erhalten Sie die Notiz per E-Mail mit Name, Firma, Anliegen und Rückrufnummer, dazu eine Zusammenfassung und das Transkript.
                        </p>
                    </Prosa>
                    <div className="lg:col-span-6 grid gap-4">
                        <Gespraech sprache="gsw" titel="Dieselbe Antwort in Mundart" kompakt zeilen={[{ wer: 'assistent', text: 'Am Samschtig hämmer zue. Under de Wuche sind mir vo de sibni bis am föifi für Sie da.' }]} />
                        <Gespraech sprache="de" titel="… und auf Hochdeutsch" kompakt zeilen={[{ wer: 'assistent', text: 'Am Samstag haben wir geschlossen. Unter der Woche sind wir von 7 bis 17 Uhr für Sie da.' }]} />
                        <Gespraech sprache="en" titel="… and in English" kompakt zeilen={[{ wer: 'assistent', text: 'We are closed on Saturdays. On weekdays we are here for you from 7 am to 5 pm.' }]} />
                    </div>
                </div>
            </Abschnitt>

            <Abschnitt
                titel="Grenzen, ehrlich gesagt"
                intro={<p>Mundart ist für Sprach-KI anspruchsvoller als Hochdeutsch. Darum sagen wir offen, wo es haken kann – und was hilft.</p>}
            >
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {grenzen.map((g) => (
                        <IconKachel key={g.titel} icon={g.icon} titel={g.titel}>
                            {g.text}
                        </IconKachel>
                    ))}
                </div>
                <Prosa className="mt-10">
                    <p>
                        <strong>Was hilft:</strong> Testen Sie den Assistenten mit Ihrem eigenen Dialekt, bevor Sie sich entscheiden. Lassen Sie ihn bei Namen und Adressen nachfragen. Und prüfen Sie in den ersten Wochen die Transkripte: Dort sehen Sie, was er richtig verstanden hat und wo wir nachbessern.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Fragen zu Sprache und Mundart" hintergrund="surface">
                <FaqListe eintraege={faq} />
            </Abschnitt>

            <Querverweise
                hintergrund="background"
                links={[
                    { titel: 'Funktionen', text: 'Alle Funktionen mit Hörbeispielen in Mundart, Hochdeutsch und Englisch.', href: `${KI_BASIS}/funktionen`, icon: ListChecks },
                    { titel: 'Anwendungen', text: 'Beispielgespräche in Mundart und auf Hochdeutsch.', href: `${KI_BASIS}/anwendungen`, icon: Ear },
                    { titel: 'Sicherheit und Datenschutz', text: 'Wo die Sprachverarbeitung läuft und was mit den Daten passiert.', href: `${KI_BASIS}/sicherheit-datenschutz`, icon: ShieldCheck },
                ]}
            />

            <AbschlussCta titel="Testen Sie ihn mit Ihrem Dialekt" text="Geben Sie Ihre Website ein, wählen Sie Schweizerdeutsch und reden Sie, wie Sie mit Ihrer Kundschaft reden. Kostenlos und ohne Anmeldung." />
        </>
    );
}
