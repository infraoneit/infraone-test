import Link from 'next/link';
import type { ReactNode } from 'react';
import { Ban, FileLock2, ListChecks, MicOff, Scale, ShieldCheck, UserCheck } from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, FaqListe, Hakenliste, IconKachel, Prosa, Querverweise, SeitenKopf } from '@/components/ki-telefonassistent/Bausteine';
import { faqNachIds } from '@/components/ki-telefonassistent/inhalte/faq';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
import { MitHinweis } from '@/components/ki-telefonassistent/InEntwicklung';
import { inEntwicklung } from '@/lib/in-entwicklung';
import { KiAnbieterSatz } from '@/components/ki-telefonassistent/KiAnbieter';
import { SICHERHEIT_DATENSCHUTZ_BESCHREIBUNG } from '@/lib/ki-anbieter';

const PFAD = `${KI_BASIS}/sicherheit-datenschutz`;
const TITEL = 'Sicherheit und Datenschutz beim KI-Telefonassistenten';
// [31.10.2026] AUFTRAG-114: Namen der KI-Anbieter nur noch in der Datenschutzerklärung (Text wortgleich aus dem Auftrag)
const BESCHREIBUNG = SICHERHEIT_DATENSCHUTZ_BESCHREIBUNG;

export const metadata = kiMetadata({ pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG });

const orte: Array<{ was: string; wo: string; hinweis: ReactNode }> = [
    { was: 'Assistent mit Wissen, Regeln und Notizen', wo: 'Schweiz, bei Infomaniak in Satigny', hinweis: 'Hier laufen Steuerung des Gesprächs, Ihr Wissen und die Erstellung der Notizen.' },
    { was: 'Telefonie', wo: 'Schweizer Provider', hinweis: 'Ihre Nummer bleibt, die Umleitung läuft über Schweizer Telefonie.' },
    // AUFTRAG-114: Anbieter nur in der Datenschutzerklärung; «EU-Region» entfällt (dort: Verarbeitungsorte je Anbieter)
    { was: 'Sprachverarbeitung (Hören und Sprechen)', wo: 'KI-Anbieter', hinweis: <KiAnbieterSatz /> },
    { was: 'Gesprächsnotizen', wo: 'per E-Mail an Ihre Adressen', hinweis: 'Sie bestimmen, wer welche Notizen erhält.' },
    // AUFTRAG-113: Kalendereintrag in Entwicklung
    { was: 'Termine (falls genutzt)', wo: inEntwicklung('Ihr Microsoft-365-Kalender'), hinweis: 'Der Eintrag im Kalender ist in Entwicklung. Heute gehen Terminwünsche als Notiz per E-Mail an Sie.' },
];

const grundsaetze = [
    { icon: MicOff, titel: 'Keine Aufzeichnung', text: 'Gespräche werden nicht als Tonaufnahme gespeichert. Es entstehen ein Transkript und eine Zusammenfassung.' },
    { icon: Ban, titel: 'Kein Training', text: 'Wir nutzen bezahlte Stufen der KI-Anbieter, bei denen Daten nicht für das Training von Modellen verwendet werden.' },
    { icon: UserCheck, titel: 'Nur, was nötig ist', text: 'Sie legen fest, welche Angaben der Assistent erfragt. Themen, die er nicht behandeln soll, schliessen Sie aus.' },
    { icon: FileLock2, titel: 'AVV auf Anfrage', text: 'Die Bearbeitung in Ihrem Auftrag regeln wir in einem Auftragsverarbeitungsvertrag nach Schweizer Datenschutzgesetz.' },
];

export default function SicherheitDatenschutzSeite() {
    const krumen = kiKrumen({ name: 'Sicherheit und Datenschutz', pfad: PFAD });
    const faq = faqNachIds(['datenschutz', 'aufzeichnung', 'training', 'avv', 'handelsregister', 'verbotene-themen']);

    return (
        <>
            <JsonLd daten={kiSeitenSchemas(PFAD, 'Sicherheit und Datenschutz beim KI-Telefonassistenten', BESCHREIBUNG, krumen)} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="Sicherheit und Datenschutz"
                titel="Sicherheit und Datenschutz beim KI-Telefonassistenten"
                lead={
                    <p>
                        {/* AUFTRAG-114: Namen der KI-Anbieter nur noch in der Datenschutzerklärung */}
                        Der KI-Telefonassistent läuft auf Servern in der Schweiz, bei Infomaniak in Satigny. <KiAnbieterSatz /> Gespräche werden nicht aufgezeichnet.
                    </p>
                }
            />

            <Abschnitt titel="Wo was läuft" intro={<p>Ein Telefonassistent besteht aus mehreren Teilen. Hier sehen Sie, welcher Teil wo läuft.</p>} hintergrund="surface">
                <div className="rounded-3xl border border-border bg-card overflow-hidden">
                    <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.3fr)] border-b border-border bg-surface/60 text-sm font-semibold text-text-secondary">
                        <div className="px-6 py-4">Teil</div>
                        <div className="px-6 py-4">Wo</div>
                        <div className="px-6 py-4">Was das heisst</div>
                    </div>
                    <ul className="divide-y divide-border">
                        {orte.map((o) => (
                            <li key={o.was} className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.3fr)]">
                                <p className="px-5 pt-5 md:px-6 md:py-5 font-semibold text-text-primary">{o.was}</p>
                                <p className="px-5 pt-1 md:px-6 md:py-5 text-text-primary">
                                    <MitHinweis text={o.wo} />
                                </p>
                                <p className="px-5 pt-1 pb-5 md:px-6 md:py-5 text-text-secondary leading-relaxed">{o.hinweis}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Abschnitt>

            <Abschnitt titel="Vier Grundsätze">
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {grundsaetze.map((g) => (
                        <IconKachel key={g.titel} icon={g.icon} titel={g.titel}>
                            {g.text}
                        </IconKachel>
                    ))}
                </div>
            </Abschnitt>

            <Abschnitt titel="Welche Daten entstehen" hintergrund="surface">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    <Prosa className="lg:col-span-7">
                        <p>
                            Bei jedem Gespräch entstehen die Angaben, die der Assistent für Ihr Team festhält: in der Regel Name, Firma, Anliegen und Rückrufnummer der anrufenden Person, dazu ein Transkript und eine Zusammenfassung. Diese Notiz erhalten Sie per E-Mail.
                        </p>
                        <p>
                            Was darüber hinaus erfragt wird, bestimmen Sie. In Branchen mit besonders schützenswerten Daten, etwa in der <Link href={`${KI_BASIS}/branchen/arztpraxis`}>Arztpraxis</Link>, legen wir mit Ihnen fest, dass der Assistent nur erfragt, was für den Rückruf nötig ist, und keine medizinischen Auskünfte gibt.
                        </p>
                        <p>
                            Wie lange Transkripte und Zusammenfassungen bei uns gespeichert bleiben, vereinbaren wir mit Ihnen und halten es im Auftragsverarbeitungsvertrag fest. Für die Notizen in Ihrem E-Mail-Postfach gelten Ihre eigenen Regeln.
                        </p>
                    </Prosa>
                    <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6">
                        <h3 className="font-bold text-text-primary mb-4">Pro Gespräch</h3>
                        <Hakenliste punkte={['Name und Firma', 'Anliegen', 'Rückrufnummer', 'Transkript des Gesprächs', 'Zusammenfassung', 'keine Tonaufnahme']} />
                    </div>
                </div>
            </Abschnitt>

            <Abschnitt titel="Rechtlicher Rahmen: DSG und Auftragsverarbeitung">
                <Prosa>
                    <p>
                        Im Sinne des Schweizer Datenschutzgesetzes (DSG) sind Sie für die Daten Ihrer Anrufenden verantwortlich; InfraOne bearbeitet sie in Ihrem Auftrag. Das regeln wir in einem Auftragsverarbeitungsvertrag (AVV), den Sie bei uns anfordern können. <KiAnbieterSatz />
                    </p>
                    <p>
                        Wir empfehlen eine Begrüssung, in der sich der Assistent als digitaler Assistent vorstellt. So wissen Anrufende von Anfang an, mit wem sie sprechen. In allen Beispielen auf dieser Website stellt er sich so vor.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Datenschutz beim Testanruf" hintergrund="surface">
                <Prosa>
                    <p>
                        Für den Testanruf lesen wir die öffentlich erreichbaren Seiten der Website, die Sie eingeben, und gleichen die Firma mit dem Schweizer Handelsregister ab. Ihre Telefonnummer verwenden wir für diesen Anruf und für eine Rückmeldung von uns, falls Sie Fragen haben – nicht für Werbung. Pro Gerät sind zwei Testanrufe am Tag möglich.
                    </p>
                    <p>
                        Die Einzelheiten stehen in den <Link href="/datenschutz#testanruf-ki-telefonassistent">Datenschutzhinweisen zum Testanruf</Link>.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Sicherheit gehört bei uns zum Handwerk">
                <Prosa>
                    <p>
                        InfraOne ist ein IT-Dienstleister und betreut rund 100 KMU in der IT, von der Firewall bis zur Datensicherung. Der Assistent ist für uns kein Fremdprodukt, sondern Teil der Telefonie und IT, die wir betreiben. Wenn Sie möchten, prüfen wir bei der Gelegenheit auch die <Link href="/it-sicherheit">IT-Sicherheit</Link> rundherum.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Fragen zu Datenschutz und Sicherheit" hintergrund="surface">
                <FaqListe eintraege={faq} />
            </Abschnitt>

            <Querverweise
                hintergrund="background"
                links={[
                    { titel: 'Häufige Fragen', text: 'Alle Antworten zu Mundart, Nummer, Kosten und Datenschutz.', href: `${KI_BASIS}/faq`, icon: ListChecks },
                    { titel: 'IT-Sicherheit', text: 'Firewall, Endpoint-Schutz und Backups für KMU.', href: '/it-sicherheit', icon: ShieldCheck },
                    { titel: 'Vergleich', text: 'KI-Assistent, Telefonservice, Sekretariat oder Sprachmenü?', href: `${KI_BASIS}/vergleich`, icon: Scale },
                ]}
            />

            <AbschlussCta />
        </>
    );
}
