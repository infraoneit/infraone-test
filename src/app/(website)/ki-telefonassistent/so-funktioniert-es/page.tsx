import Link from 'next/link';
import {
    BadgeCheck,
    BookOpenCheck,
    Building2,
    FileText,
    Globe,
    ListChecks,
    Mail,
    MessageSquareText,
    PhoneCall,
    PhoneForwarded,
    RefreshCw,
    Settings2,
    ShieldCheck,
} from 'lucide-react';
import { BASE_URL } from '@/lib/constants';
import { generateHowToSchema } from '@/lib/seo/schema';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, Hakenliste, Prosa, Querverweise, SeitenKopf, Schrittfolge, type Schritt } from '@/components/ki-telefonassistent/Bausteine';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
import { inEntwicklung } from '@/lib/in-entwicklung';

const PFAD = `${KI_BASIS}/so-funktioniert-es`;
const TITEL = 'So funktioniert der KI-Telefonassistent | InfraOne';
const BESCHREIBUNG =
    'Vom kostenlosen Testanruf über die Einrichtung mit Website-Scan, Wissen und Rufumleitung bis zum Betrieb: So kommen Sie zu Ihrem KI-Telefonassistenten.';

export const metadata = kiMetadata({ pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG });

const testSchritte: Schritt[] = [
    { icon: Globe, titel: 'Website eingeben', text: 'Auf der Seite KI-Telefonassistent geben Sie Ihre Website-Adresse ein. Wir lesen die öffentlichen Seiten: Leistungen, Kontakt, Öffnungszeiten, Logo und Farben.' },
    // Nachtrag 02:30 (AUFTRAG-109): Handelsregister-Prüfung zwischen Website-Scan und Anruf
    {
        icon: BadgeCheck,
        titel: 'Firma bestätigen (Handelsregister)',
        text: (
            <>
                Wir prüfen die Firma hinter der Website im Schweizer Handelsregister (Zefix), bevorzugt über die UID im Impressum, sonst über den Namen oder Ihre Eingabe. Sie bestätigen «Ja, das ist meine Firma». Ohne aktiven Eintrag ist kein Testanruf möglich – dann zeigen wir Ihnen den Assistenten{' '}
                <Link href="/kontakt" className="text-text-primary underline underline-offset-4 decoration-primary">
                    persönlich
                </Link>
                .
            </>
        ),
    },
    { icon: PhoneCall, titel: 'Nummer und Sprache', text: 'Sie geben Ihre Telefonnummer ein und wählen die Sprache des Gesprächs.' },
    { icon: MessageSquareText, titel: 'Der Assistent ruft an', text: 'Er stellt Ihre Firma vor, beantwortet Fragen und nimmt ein Anliegen auf. Kostenlos, ohne Anmeldung, zwei Testanrufe pro Gerät und Tag.' },
];

const einrichtung: Array<Schritt & { id: string }> = [
    { id: 'website-scan', icon: Globe, titel: 'Website-Scan', text: 'Ausgangspunkt ist Ihre Website. Leistungen, Öffnungszeiten, Kontakt und Abläufe werden zum Grundwissen des Assistenten.' },
    { id: 'wissen-pruefen', icon: BookOpenCheck, titel: 'Wissen prüfen', text: 'Sie prüfen das Wissen und ergänzen, was nicht online steht: Abläufe, häufige Fragen, Parkplätze. Und Sie schliessen Themen aus, die er nicht behandeln soll.' },
    { id: 'begruessung', icon: MessageSquareText, titel: 'Begrüssung und Haltung', text: 'Begrüssungstext, Sprache, förmlich oder locker, Ihr Text für die Zeit ausserhalb der Öffnungszeiten. Bei Bedarf mehrere Agenten, etwa für Tag und Nacht.' },
    // AUFTRAG-114: SMS-Bestätigung verfügbar (Kalendereintrag: Badge in der Checkliste unten)
    { id: 'regeln', icon: Settings2, titel: 'Regeln festlegen', text: 'Wohin er weiterleitet, was als Notfall gilt und an welche Nummer er Notfälle meldet, wer die Notizen und Terminwünsche erhält und ob Anrufende eine SMS-Bestätigung bekommen.' },
    { id: 'rufumleitung', icon: PhoneForwarded, titel: 'Rufumleitung oder Nummer', text: 'Sie leiten Ihre Nummer um – immer, bei besetzt, nach einigen Klingeltönen oder ausserhalb der Öffnungszeiten – oder Sie erhalten eine neue Nummer. Mit Cloud-Telefonie von InfraOne direkt in der Anlage.' },
    { id: 'freigabe', icon: ShieldCheck, titel: 'Testen und freigeben', text: 'Sie rufen selbst an und hören, wie der Assistent antwortet. Erst nach Ihrer Freigabe nimmt er echte Anrufe an.' },
];

const betrieb: Schritt[] = [
    { icon: Mail, titel: 'Notiz nach jedem Gespräch', text: 'Name, Firma, Anliegen, Rückrufnummer, Zusammenfassung und Transkript per E-Mail.' },
    { icon: RefreshCw, titel: 'Anpassen, wenn sich etwas ändert', text: 'Ferien, neue Leistungen, andere Notfallregeln im Winter: Wissen und Regeln passen wir an.' },
    { icon: FileText, titel: 'Lücken schliessen', text: 'Die Transkripte zeigen, welche Fragen der Assistent noch nicht beantworten konnte. Daraus wird neues Wissen.' },
];

const bereithalten = [
    'die Adresse Ihrer Website',
    'Öffnungszeiten, auch an Feiertagen und in den Ferien',
    'häufige Fragen Ihrer Kundschaft und Ihre Antworten',
    'Themen, über die der Assistent nicht sprechen soll',
    'die Nummer für Weiterleitungen und die Notfallnummer',
    'die E-Mail-Adressen, an die die Notizen gehen',
    // AUFTRAG-113: Kalendereintrag in Entwicklung (Zusatz → Badge in der Hakenliste)
    inEntwicklung('Zugang zum Microsoft-365-Kalender für den Kalendereintrag'),
    'Zugang zur Telefonanlage oder zum Anbieter für die Rufumleitung',
];

export default function SoFunktioniertEsSeite() {
    const krumen = kiKrumen({ name: 'So funktioniert es', pfad: PFAD });
    const howTo = generateHowToSchema(`${BASE_URL}${PFAD}`, 'Einen KI-Telefonassistenten für Ihren Betrieb einrichten', BESCHREIBUNG, [
        { name: 'Website scannen', text: 'Auf der Seite KI-Telefonassistent die eigene Website eingeben; aus Leistungen, Kontakt, Öffnungszeiten, Logo und Farben entsteht der Testassistent.', anker: 'live-testen' },
        {
            name: 'Firma bestätigen (Handelsregister)',
            text: 'Die Firma wird im Schweizer Handelsregister (Zefix) geprüft, bevorzugt über die UID im Impressum, sonst über den Namen oder eine manuelle Eingabe; der Besucher bestätigt «Ja, das ist meine Firma». Ohne aktiven Eintrag gibt es keinen Testanruf.',
            anker: 'live-testen',
        },
        { name: 'Testanruf', text: 'Telefonnummer eingeben und Sprache wählen; der Assistent ruft an, stellt die Firma vor, beantwortet Fragen und nimmt ein Anliegen auf.', anker: 'live-testen' },
        ...einrichtung.map((s) => ({ name: `Einrichtung: ${s.titel}`, text: String(s.text), anker: s.id })),
        { name: 'Im Alltag nutzen', text: 'Nach jedem Gespräch eine Notiz per E-Mail; Wissen und Regeln werden angepasst, wenn sich etwas ändert.', anker: 'betrieb' },
    ]);

    return (
        <>
            <JsonLd daten={[...kiSeitenSchemas(PFAD, 'So funktioniert der KI-Telefonassistent', BESCHREIBUNG, krumen), howTo]} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="So funktioniert es"
                titel="Vom Testanruf zum eigenen Assistenten"
                lead={
                    <p>
                        In drei Phasen kommen Sie zu Ihrem KI-Telefonassistenten: Sie testen ihn live mit Ihrer Website, wir richten ihn gemeinsam mit Ihnen ein, und danach nimmt er im Alltag Anrufe für Sie an. Diese Seite zeigt jeden Schritt und was Sie dafür bereithalten.
                    </p>
                }
                unterLead={
                    <ol className="mt-8 flex flex-wrap gap-2 text-sm font-medium">
                        {[
                            ['#live-testen', '1. Live testen'],
                            ['#einrichten', '2. Einrichten'],
                            ['#betrieb', '3. Betrieb'],
                        ].map(([href, text]) => (
                            <li key={href}>
                                <a href={href} className="inline-flex rounded-full border border-border bg-card px-3.5 py-1.5 text-text-primary hover:border-primary/60 hover:text-primary transition-colors">
                                    {text}
                                </a>
                            </li>
                        ))}
                    </ol>
                }
            />

            <Abschnitt
                id="live-testen"
                titel="Phase 1: Live testen"
                intro={
                    <p>
                        Bevor Sie mit uns sprechen, hören Sie, wie Ihr eigener Assistent klingt. Die Demo baut ihn in einer Minute aus Ihrer Website und ruft Sie an – ohne Anmeldung, ohne Kosten.
                    </p>
                }
                hintergrund="surface"
            >
                <Schrittfolge schritte={testSchritte} />
                <p className="mt-8">
                    <Link href={KI_BASIS} className="inline-flex items-center gap-2 font-semibold text-text-primary underline underline-offset-4 decoration-primary hover:decoration-2">
                        Zum Testanruf
                    </Link>
                </p>
            </Abschnitt>

            <Abschnitt
                id="einrichten"
                titel="Phase 2: Einrichten"
                intro={
                    <p>
                        Aus dem Testassistenten wird Ihr Assistent: mit geprüftem Wissen, Ihrer Begrüssung, Ihren Regeln und Ihrer Nummer. Wir führen durch jeden Schritt, Sie entscheiden.
                    </p>
                }
            >
                <ol className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {einrichtung.map((s, i) => (
                        <li key={s.id} id={s.id} className="h-full rounded-2xl border border-border bg-card p-6 scroll-mt-24">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm" aria-hidden="true">
                                    {i + 1}
                                </span>
                                {s.icon && <s.icon className="w-5 h-5 text-primary" aria-hidden="true" />}
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">
                                <span className="sr-only">Schritt {i + 1}: </span>
                                {s.titel}
                            </h3>
                            <p className="text-text-secondary leading-relaxed">{s.text}</p>
                        </li>
                    ))}
                </ol>
            </Abschnitt>

            <Abschnitt id="betrieb" titel="Phase 3: Betrieb" intro={<p>Im Alltag merken Sie vom Assistenten vor allem eines: die Notizen in Ihrem Postfach. Er bleibt aber nicht stehen.</p>} hintergrund="surface">
                <Schrittfolge schritte={betrieb} spalten={3} />
                <Prosa className="mt-10">
                    <p>
                        Für Fragen im Betrieb erreichen Sie InfraOne unter <a href="tel:+41522221818">052 222 18 18</a> oder per E-Mail an <a href="mailto:info@infraone.ch">info@infraone.ch</a>. Als IT-Dienstleister mit Standorten in Winterthur, Schaffhausen, Tägerwilen und Kleinandelfingen kümmern wir uns auf Wunsch auch um Telefonanlage und IT rundherum.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Wie lange dauert das?">
                <Prosa>
                    <p>
                        Den Testanruf erleben Sie in einer Minute. Für die Einrichtung nennen wir bewusst keine Pauschalzeit: Sie hängt vor allem davon ab, wie schnell das Wissen geprüft ist, die Regeln feststehen und die Rufumleitung eingerichtet ist. Im Erstgespräch erhalten Sie einen konkreten Termin.
                    </p>
                    <p>
                        Schneller geht es, wenn Sie die Punkte unten schon bereithalten. Nichts davon ist Voraussetzung für das erste Gespräch.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Was Sie bereithalten sollten" hintergrund="surface">
                <Hakenliste punkte={bereithalten} spalten={2} />
            </Abschnitt>

            <Querverweise
                links={[
                    { titel: 'Funktionen', text: 'Was der Assistent nach der Einrichtung alles kann.', href: `${KI_BASIS}/funktionen`, icon: ListChecks },
                    { titel: 'Sicherheit und Datenschutz', text: 'Wo der Assistent läuft und was mit den Daten passiert.', href: `${KI_BASIS}/sicherheit-datenschutz`, icon: ShieldCheck },
                    { titel: 'Branchen', text: 'Beispiele für die Einrichtung in sechs Branchen.', href: `${KI_BASIS}/branchen`, icon: Building2 },
                ]}
            />

            <AbschlussCta />
        </>
    );
}
