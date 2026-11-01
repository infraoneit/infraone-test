import Link from 'next/link';
import { BookOpen, ListChecks, ShieldCheck } from 'lucide-react';
import { generateFAQSchema } from '@/lib/seo/schema';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, FaqListe, Querverweise, SeitenKopf } from '@/components/ki-telefonassistent/Bausteine';
import { ALLE_FAQ, FAQ_KATEGORIEN, faqFuerSchema } from '@/components/ki-telefonassistent/inhalte/faq';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';

const PFAD = `${KI_BASIS}/faq`;
const TITEL = 'FAQ zum KI-Telefonassistenten | InfraOne';
const BESCHREIBUNG =
    'Antworten zu Mundart, Datenschutz, Notfällen, Rufumleitung, eigener Nummer, Terminen, SMS, Kosten und Testanruf beim KI-Telefonassistenten von InfraOne.';

export const metadata = kiMetadata({ pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG });

export default function FaqSeite() {
    const krumen = kiKrumen({ name: 'Häufige Fragen', pfad: PFAD });

    return (
        <>
            <JsonLd daten={[...kiSeitenSchemas(PFAD, 'Häufige Fragen zum KI-Telefonassistenten', BESCHREIBUNG, krumen), generateFAQSchema(faqFuerSchema(ALLE_FAQ))]} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={PFAD}
                krumen={krumen}
                eyebrow="Häufige Fragen"
                titel="Häufige Fragen zum KI-Telefonassistenten"
                lead={
                    <p>
                        Hier finden Sie Antworten auf die Fragen, die sich vor dem Entscheid für einen KI-Telefonassistenten stellen: ob der Assistent Mundart versteht, ob Sie Ihre Nummer behalten, was bei Notfällen passiert, was er kostet und wie es um den Datenschutz steht. Fehlt Ihre Frage, rufen Sie uns an oder testen Sie den Assistenten direkt.
                    </p>
                }
                unterLead={
                    <nav aria-label="Themen" className="mt-8">
                        <ul className="flex flex-wrap gap-2">
                            {FAQ_KATEGORIEN.map((k) => (
                                <li key={k.id}>
                                    <a
                                        href={`#${k.id}`}
                                        className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-text-primary hover:border-primary/60 hover:text-primary transition-colors"
                                    >
                                        {k.titel}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                }
            />

            {FAQ_KATEGORIEN.map((k, i) => (
                <Abschnitt key={k.id} id={k.id} titel={k.titel} hintergrund={i % 2 === 0 ? 'surface' : 'background'} className="py-12 lg:py-16">
                    <FaqListe eintraege={k.eintraege} />
                </Abschnitt>
            ))}

            <Abschnitt titel="Ihre Frage war nicht dabei?">
                <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
                    Rufen Sie uns an unter{' '}
                    <a href="tel:+41522221818" className="font-semibold text-text-primary underline underline-offset-4 decoration-primary">
                        052 222 18 18
                    </a>
                    , schreiben Sie an{' '}
                    <a href="mailto:info@infraone.ch" className="font-semibold text-text-primary underline underline-offset-4 decoration-primary">
                        info@infraone.ch
                    </a>{' '}
                    oder{' '}
                    <Link href="/kontakt" className="font-semibold text-text-primary underline underline-offset-4 decoration-primary">
                        vereinbaren Sie ein Erstgespräch
                    </Link>
                    .
                </p>
            </Abschnitt>

            <Querverweise
                links={[
                    { titel: 'Funktionen', text: 'Alles, was der Assistent am Telefon kann, mit Hörbeispielen.', href: `${KI_BASIS}/funktionen`, icon: ListChecks },
                    { titel: 'Sicherheit und Datenschutz', text: 'Wo was läuft, was erfasst wird, AVV.', href: `${KI_BASIS}/sicherheit-datenschutz`, icon: ShieldCheck },
                    { titel: 'Glossar', text: 'Begriffe der KI-Telefonie kurz erklärt.', href: `${KI_BASIS}/glossar`, icon: BookOpen },
                ]}
            />

            <AbschlussCta />
        </>
    );
}
