import { Building2, ListChecks, PhoneCall } from 'lucide-react';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, FaqListe, Prosa, Querverweise, SeitenKopf, type FaqEintrag } from '@/components/ki-telefonassistent/Bausteine';
import { EntwurfsBand, PaketKarten, PreisDetails } from '@/components/ki-telefonassistent/Preise';
import { AnfrageFormular } from '@/components/ki-telefonassistent/AnfrageFormular';
import { RoiRechner } from '@/components/ki-telefonassistent/RoiRechner';
import { faqNachIds } from '@/components/ki-telefonassistent/inhalte/faq';
import { KI_BASIS, KI_PREISE_PFAD } from '@/components/ki-telefonassistent/seiten';
import { chf, EINRICHTUNG_EINMALIG, MWST_HINWEIS, PAKETE, PREISE_FREIGEGEBEN, WAEHRUNG } from '@/lib/ki-telefonassistent-preise';
import { generateKiTelefonassistentServiceSchema } from '@/lib/seo/schema';
import { KALENDER_SATZ } from '@/lib/in-entwicklung';

const TITEL = 'Preise des KI-Telefonassistenten | InfraOne';
const BESCHREIBUNG =
    'Pakete des KI-Telefonassistenten mit Gesprächsminuten, Einrichtung und Zusatzminuten, dazu ein Rechner: Was kostet Sie ein verpasster Anruf heute?';

// AUFTRAG-110: noindex, solange die Preise Entwurf sind (nur diese Seite); seit AUFTRAG-113 freigegeben → indexierbar
export const metadata = kiMetadata({ pfad: KI_PREISE_PFAD, titel: TITEL, beschreibung: BESCHREIBUNG, noindex: !PREISE_FREIGEGEBEN });

const entwurf = PREISE_FREIGEGEBEN ? '' : ' (Entwurf)';

const preisFaq: FaqEintrag[] = [
    ...faqNachIds(['kosten', 'kuendigung', 'minuten']),
    {
        id: 'einrichtung',
        frage: 'Was ist in der Einrichtung enthalten?',
        antwort: `Die einmalige Einrichtung${entwurf} von ${WAEHRUNG} ${chf(EINRICHTUNG_EINMALIG)} umfasst den Scan Ihrer Website, die gemeinsame Prüfung des Wissens, Begrüssung und Regeln sowie die Rufumleitung oder eine neue Nummer. Danach ist der Assistent bereit für den Betrieb.`,
    },
    {
        id: 'welches-paket',
        frage: 'Welches Paket passt zu mir?',
        // AUFTRAG-113/114: Kalendereintrag in Entwicklung (Satz wortgleich aus lib/in-entwicklung.ts)
        antwort: `Das hängt vor allem davon ab, wie viele Gesprächsminuten Sie pro Monat brauchen und ob der Assistent weiterleiten oder Notfälle melden soll. ${KALENDER_SATZ} Der Rechner unten hilft beim Einschätzen der Anrufe; im Erstgespräch schauen wir es gemeinsam an.`,
    },
    {
        id: 'cloud-telefonie',
        frage: 'Brauche ich dafür die Cloud-Telefonie von InfraOne?',
        antwort: `Nein. Eine Rufumleitung von Ihrer bestehenden Nummer genügt. Wenn Ihre Telefonanlage bei InfraOne läuft, wird der Assistent Teil davon; ${PREISE_FREIGEGEBEN ? 'die Anbindung an die vPBX gehört zum Paket Enterprise.' : 'im aktuellen Preisentwurf gehört die Anbindung an die vPBX zum Paket Enterprise.'}`,
    },
    ...faqNachIds(['testanruf-kosten']),
];

export default function PreiseSeite() {
    const krumen = kiKrumen({ name: 'Preise', pfad: KI_PREISE_PFAD });
    const lite = PAKETE[0];

    return (
        <>
            {/* Service mit Angebotskatalog erst nach Freigabe (siehe schema.ts) */}
            <JsonLd daten={[...kiSeitenSchemas(KI_PREISE_PFAD, 'Preise des KI-Telefonassistenten', BESCHREIBUNG, krumen), PREISE_FREIGEGEBEN ? generateKiTelefonassistentServiceSchema(BESCHREIBUNG) : null]} />

            {/* [01.11.2026] AUFTRAG-116: pfad für «Aktualisiert am …» in der Brotkrumen-Zeile */}
            <SeitenKopf
                pfad={KI_PREISE_PFAD}
                krumen={krumen}
                eyebrow="Preise"
                titel="Preise für den KI-Telefonassistenten"
                lead={
                    <p>
                        Der KI-Telefonassistent kostet eine monatliche Pauschale je nach Paket, dazu eine einmalige Einrichtung. Die Pakete unterscheiden sich nach enthaltenen Gesprächsminuten und Funktionen. Alle Preise verstehen sich {MWST_HINWEIS}
                    </p>
                }
                unterLead={<EntwurfsBand className="mt-8 max-w-[42rem]" />}
                aktionen={false}
            />

            <Abschnitt
                id="pakete"
                titel={`Pakete${entwurf}`}
                intro={<p>Vier Pakete vom kleinen Betrieb bis zum Unternehmen mit mehreren Standorten. Das Paket {lite.name} reicht, wenn der Assistent vor allem abnimmt und Anliegen aufnimmt.</p>}
                hintergrund="surface"
            >
                <EntwurfsBand className="mb-8" detail={false} />
                <PaketKarten />
                <div className="mt-6">
                    <PreisDetails />
                </div>
            </Abschnitt>

            {/* [31.10.2026] AUFTRAG-114: «Anfragen» der Paketkarten springt hierher (#anfrage-<paketid>) */}
            <AnfrageFormular />

            <Abschnitt
                id="rechner"
                titel="Was kostet ein verpasster Anruf?"
                intro={
                    <p>
                        Bevor Sie über den Preis des Assistenten nachdenken, lohnt sich die Gegenrechnung: Was entgeht Ihnen heute durch Anrufe, die niemand annimmt? Der Rechner arbeitet nur mit Ihren eigenen Zahlen und zeigt erst ein Ergebnis, wenn alle Felder ausgefüllt sind.
                    </p>
                }
            >
                <RoiRechner />
            </Abschnitt>

            <Abschnitt titel="So setzt sich der Preis zusammen" hintergrund="surface">
                <Prosa>
                    <p>
                        <strong>Monatliches Paket.</strong> Es deckt den Betrieb des Assistenten, die enthaltenen Gesprächsminuten und die Funktionen des Pakets. Gesprächsnotiz per E-Mail, Transkript und Zusammenfassung, Wissen aus Ihrer Website und Antworten rund um die Uhr sind in jedem Paket enthalten.
                    </p>
                    <p>
                        <strong>Einmalige Einrichtung.</strong> Wir lesen Ihre Website, prüfen das Wissen mit Ihnen, richten Begrüssung, Öffnungszeiten und Regeln ein und schalten die Rufumleitung oder eine neue Nummer auf.
                    </p>
                    <p>
                        <strong>Zusätzliche Minuten.</strong> Brauchen Sie in einem Monat mehr Gesprächsminuten als im Paket enthalten, werden die zusätzlichen Minuten einzeln verrechnet. Der Assistent hört also nicht auf abzunehmen, wenn die Minuten des Pakets aufgebraucht sind.
                    </p>
                    <p>
                        <strong>Enterprise.</strong> Eigene Integrationen, die Anbindung an die vPBX und mehrere Standorte planen wir individuell und offerieren sie nach Aufwand.
                    </p>
                </Prosa>
            </Abschnitt>

            <Abschnitt titel="Fragen zu Preisen">
                <FaqListe eintraege={preisFaq} />
            </Abschnitt>

            <Querverweise
                links={[
                    { titel: 'Funktionen', text: 'Was der Assistent in jedem Paket kann.', href: `${KI_BASIS}/funktionen`, icon: ListChecks },
                    { titel: 'Cloud-Telefonie', text: 'Telefonanlage von InfraOne mit offenen Preisen.', href: '/cloud-telefonie', icon: PhoneCall },
                    { titel: 'Branchen', text: 'Beispiele aus Handwerk, Praxis, Treuhand, Immobilien und Garage.', href: `${KI_BASIS}/branchen`, icon: Building2 },
                ]}
            />

            <AbschlussCta titel="Erst hören, dann entscheiden" text="Der Testanruf ist kostenlos und ohne Anmeldung. Hören Sie, wie Ihr Assistent klingt, und reden wir dann über das passende Paket." anfrageHref="#anfrage" />
        </>
    );
}
