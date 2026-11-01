import { HelpCircle, ListChecks, ShieldCheck } from 'lucide-react';
import { BASE_URL } from '@/lib/constants';
import { generateDefinedTermSetSchema } from '@/lib/seo/schema';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, Querverweise, SeitenKopf } from '@/components/ki-telefonassistent/Bausteine';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';

const PFAD = `${KI_BASIS}/glossar`;
const TITEL = 'Glossar KI-Telefonie: Begriffe erklärt | InfraOne';
const BESCHREIBUNG =
    'Sprach-zu-Sprach-KI, Voicebot, Rufumleitung, vPBX, Transkript, AVV und mehr: die wichtigsten Begriffe rund um den KI-Telefonassistenten kurz erklärt.';

export const metadata = kiMetadata({ pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG });

const ROH: Array<{ id: string; begriff: string; erklaerung: string }> = [
    { id: 'agent', begriff: 'Agent', erklaerung: 'Eine Ausprägung des Assistenten mit eigenen Regeln, etwa einer für die Öffnungszeiten und einer für den Abend. Pro Kunde sind mehrere Agenten möglich.' },
    { id: 'anrufbeantworter', begriff: 'Anrufbeantworter', erklaerung: 'Nimmt Sprachnachrichten auf, führt aber kein Gespräch. Ob eine Nachricht dringend ist, zeigt sich erst beim Abhören.' },
    { id: 'avv', begriff: 'Auftragsverarbeitungsvertrag (AVV)', erklaerung: 'Vertrag, der regelt, wie ein Dienstleister Personendaten im Auftrag eines Unternehmens bearbeitet. Für den KI-Telefonassistenten erhalten Sie ihn bei InfraOne auf Anfrage.' },
    { id: 'dsg', begriff: 'Datenschutzgesetz (DSG)', erklaerung: 'Das Schweizer Bundesgesetz über den Datenschutz. Es regelt, wie Personendaten bearbeitet werden dürfen, und gilt auch für Angaben, die Anrufende am Telefon machen.' },
    { id: 'gespraechsminute', begriff: 'Gesprächsminute', erklaerung: 'Masseinheit, nach der die Pakete des Assistenten bemessen sind. Jedes Paket enthält eine Anzahl Minuten pro Monat; darüber hinaus werden zusätzliche Minuten verrechnet.' },
    { id: 'gespraechsnotiz', begriff: 'Gesprächsnotiz', erklaerung: 'E-Mail, die der Assistent nach jedem Gespräch verschickt: Name, Firma, Anliegen und Rückrufnummer der anrufenden Person, dazu Zusammenfassung und Transkript.' },
    { id: 'handelsregister', begriff: 'Handelsregister-Abgleich', erklaerung: 'Vor dem Testanruf prüfen wir, ob die Firma hinter der eingegebenen Website im Schweizer Handelsregister eingetragen ist. Der Testanruf ist eingetragenen Firmen vorbehalten.' },
    { id: 'halluzination', begriff: 'Halluzination', erklaerung: 'Wenn eine KI etwas Falsches mit Überzeugung sagt. Der Assistent antwortet aus dem Wissen, das Sie freigeben, und nimmt sonst ein Anliegen für den Rückruf auf; Transkripte zeigen, was gesagt wurde.' },
    { id: 'ivr', begriff: 'IVR (Sprachmenü)', erklaerung: 'Interactive Voice Response: ein Menü, in dem Anrufende per Tastendruck oder Stichwort eine Abteilung wählen. Es verteilt Anrufe, beantwortet aber keine Fragen.' },
    { id: 'ki-telefonassistent', begriff: 'KI-Telefonassistent', erklaerung: 'Software, die Anrufe für einen Betrieb entgegennimmt und das Gespräch selbst führt: begrüssen, Fragen beantworten, Anliegen aufnehmen, Termine eintragen, weiterleiten.' },
    { id: 'mundart', begriff: 'Mundart (Schweizerdeutsch)', erklaerung: 'Die gesprochenen Dialekte der Deutschschweiz. Der Assistent von InfraOne versteht und spricht Schweizerdeutsch, daneben Hochdeutsch und Englisch.' },
    { id: 'notfallnummer', begriff: 'Notfallnummer', erklaerung: 'Nummer, an die der Assistent Fälle meldet, die Sie als Notfall festgelegt haben, zum Beispiel den Pikettdienst.' },
    { id: 'pikett', begriff: 'Pikett', erklaerung: 'Bereitschaftsdienst ausserhalb der Arbeitszeit. Der Assistent entlastet das Pikett, weil nur noch Notfälle sofort weitergemeldet werden.' },
    { id: 'rufumleitung', begriff: 'Rufumleitung', erklaerung: 'Einstellung in der Telefonanlage oder beim Anbieter, die Anrufe an eine andere Nummer weitergibt – immer, bei besetzt, nach einigen Klingeltönen oder zu bestimmten Zeiten. So behalten Sie Ihre Nummer.' },
    { id: 'sms-bestaetigung', begriff: 'SMS-Bestätigung', erklaerung: 'Kurze Nachricht an die anrufende Person, etwa mit dem vereinbarten Termin oder dem Hinweis, dass ihr Anliegen angekommen ist.' },
    { id: 'sprach-zu-sprach', begriff: 'Sprach-zu-Sprach-KI', erklaerung: 'KI, die Gesprochenes direkt hört und direkt sprechend antwortet, statt Sprache erst in Text umzuwandeln und Textbausteine vorzulesen. Der Assistent von InfraOne arbeitet so.' },
    { id: 'telefonservice', begriff: 'Telefonservice (extern)', erklaerung: 'Dienstleister, dessen Mitarbeitende Anrufe für mehrere Firmen nach einem Gesprächsleitfaden annehmen. Menschlich, aber an Servicezeiten gebunden und meist pro Anruf oder Minute verrechnet.' },
    { id: 'zusammenfassung', begriff: 'Zusammenfassung', erklaerung: 'Kurzfassung eines Gesprächs in wenigen Sätzen, die der Assistent zusammen mit dem Transkript in der Gesprächsnotiz mitschickt. So sehen Sie auf einen Blick, worum es ging.' },
    { id: 'training', begriff: 'Training (KI)', erklaerung: 'Das Lernen eines KI-Modells aus Daten. Bei den bezahlten Stufen, die InfraOne nutzt, werden Gesprächsdaten nicht für das Training verwendet.' },
    { id: 'transkript', begriff: 'Transkript', erklaerung: 'Wortlaut eines Gesprächs als Text. Der Assistent zeichnet keine Tonaufnahme auf, sondern liefert Transkript und Zusammenfassung.' },
    { id: 'voicebot', begriff: 'Voicebot', erklaerung: 'Allgemeiner Begriff für Software, die per Sprache mit Menschen kommuniziert. Ein KI-Telefonassistent ist ein Voicebot fürs Telefon.' },
    { id: 'vpbx', begriff: 'vPBX (Cloud-Telefonanlage)', erklaerung: 'Virtuelle Telefonanlage, die in einem Rechenzentrum statt im Büro läuft. InfraOne bietet Cloud-Telefonie an; der Assistent lässt sich dort anbinden.' },
    { id: 'website-scan', begriff: 'Website-Scan', erklaerung: 'Das Einlesen Ihrer öffentlichen Website: Leistungen, Öffnungszeiten, Kontakt und Abläufe werden zum Grundwissen des Assistenten.' },
];

/** alphabetisch (de-CH), unabhängig von der Reihenfolge oben */
const BEGRIFFE = [...ROH].sort((a, b) => a.begriff.localeCompare(b.begriff, 'de-CH'));

export default function GlossarSeite() {
    const krumen = kiKrumen({ name: 'Glossar', pfad: PFAD });
    const buchstaben = [...new Set(BEGRIFFE.map((b) => b.begriff[0].toUpperCase()))];

    return (
        <>
            <JsonLd daten={[...kiSeitenSchemas(PFAD, 'Glossar KI-Telefonie', BESCHREIBUNG, krumen), generateDefinedTermSetSchema(`${BASE_URL}${PFAD}`, 'Glossar KI-Telefonie', BEGRIFFE)]} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="Glossar"
                titel="Glossar: Begriffe der KI-Telefonie"
                lead={
                    <p>
                        Rund um den KI-Telefonassistenten tauchen Begriffe aus Telefonie, KI und Datenschutz auf. Hier sind die wichtigsten kurz und ohne Fachchinesisch erklärt, alphabetisch geordnet.
                    </p>
                }
                aktionen={false}
                unterLead={
                    <nav aria-label="Buchstaben" className="mt-8">
                        <ul className="flex flex-wrap gap-2">
                            {buchstaben.map((b) => (
                                <li key={b}>
                                    <a href={`#buchstabe-${b}`} className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-border bg-card font-semibold text-text-primary hover:border-primary/60 hover:text-primary">
                                        {b}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                }
            />

            <Abschnitt titel="Begriffe von A bis Z" hintergrund="surface">
                <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                    {buchstaben.map((b) => (
                        <section key={b} id={`buchstabe-${b}`} className="scroll-mt-24">
                            <h3 className="text-sm font-bold text-primary-hover dark:text-primary border-b border-border pb-2">{b}</h3>
                            <dl className="divide-y divide-border">
                                {BEGRIFFE.filter((x) => x.begriff[0].toUpperCase() === b).map((x) => (
                                    <div key={x.id} id={x.id} className="py-4 scroll-mt-24">
                                        <dt className="font-bold text-text-primary">{x.begriff}</dt>
                                        <dd className="mt-1 text-text-secondary leading-relaxed">{x.erklaerung}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}
                </div>
            </Abschnitt>

            <Querverweise
                hintergrund="background"
                links={[
                    { titel: 'Häufige Fragen', text: 'Antworten zu Mundart, Nummer, Kosten und Datenschutz.', href: `${KI_BASIS}/faq`, icon: HelpCircle },
                    { titel: 'Funktionen', text: 'Was der Assistent am Telefon kann.', href: `${KI_BASIS}/funktionen`, icon: ListChecks },
                    { titel: 'Sicherheit und Datenschutz', text: 'Hosting in der Schweiz, keine Aufzeichnung, kein Training.', href: `${KI_BASIS}/sicherheit-datenschutz`, icon: ShieldCheck },
                ]}
            />

            <AbschlussCta />
        </>
    );
}
