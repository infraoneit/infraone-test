import Link from 'next/link';
import {
    ArrowRight,
    BadgeCheck,
    Briefcase,
    Building2,
    CalendarCheck,
    Car,
    BookOpen,
    ClipboardList,
    Globe,
    Mail,
    Headset,
    Scale,
    Languages,
    MapPin,
    MessageSquareText,
    PhoneCall,
    PhoneIncoming,
    Server,
    ShieldCheck,
    Siren,
    Stethoscope,
    Wrench,
    Zap,
} from 'lucide-react';
import { KiDemo } from '@/components/tools/KiDemo';
import { generateFAQSchema, generateKiTelefonassistentServiceSchema } from '@/lib/seo/schema';
import { kiMetadata } from '@/components/ki-telefonassistent/meta';
import { JsonLd } from '@/components/ki-telefonassistent/JsonLd';
import { kiKrumen, kiSeitenSchemas } from '@/components/ki-telefonassistent/Brotkrumen';
import { Abschnitt, AbschlussCta, FaqListe, IconKachel, OhneMit, Prosa, Querverweise, Schrittfolge } from '@/components/ki-telefonassistent/Bausteine';
import { KALENDER_SATZ } from '@/lib/in-entwicklung';
import { KiAnbieterSatz } from '@/components/ki-telefonassistent/KiAnbieter';
import { PreisTeaser } from '@/components/ki-telefonassistent/Preise';
import { AnfrageFormular } from '@/components/ki-telefonassistent/AnfrageFormular';
import { Gespraech } from '@/components/ki-telefonassistent/Gespraech';
import { faqFuerSchema, faqNachIds, HUB_FAQ_IDS } from '@/components/ki-telefonassistent/inhalte/faq';
import { ANWENDUNGEN } from '@/components/ki-telefonassistent/inhalte/anwendungen';
import { BRANCHEN } from '@/components/ki-telefonassistent/inhalte/branchen';
import { KI_BASIS } from '@/components/ki-telefonassistent/seiten';
// [01.11.2026] AUFTRAG-116: Antwort-Kapsel und «Aktualisiert am …»
import { HUB_H1, HUB_TESTEN, HUB_UEBERZEILE, hubAntwort } from '@/components/ki-telefonassistent/hub-texte';
import { Aktualisiert } from '@/components/ki-telefonassistent/Aktualisiert';

// Hero und Widget: unverändert aus AUFTRAG-092/095/098 (Widget gehört AUFTRAG-109, nur eingebettet).
// AUFTRAG-110: Seite wird Hub des Bereichs mit Unterseiten; Texte unterhalb des Heros neu.
const TITEL = 'KI-Telefonassistent für Schweizer KMU | InfraOne';
const BESCHREIBUNG =
    'Der KI-Telefonassistent von InfraOne nimmt rund um die Uhr ab, versteht Schweizerdeutsch und schickt Ihnen nach jedem Anruf eine Notiz. Jetzt live testen.';

export const metadata = kiMetadata({
    pfad: KI_BASIS,
    titel: TITEL,
    beschreibung: BESCHREIBUNG,
    keywords: ['KI-Telefonassistent', 'KI-Telefonassistent Schweiz', 'KI Telefonassistent Schweizerdeutsch', 'Voicebot Schweiz', 'Telefonassistent KMU', 'KI Anrufbeantworter'],
});

const nutzen = [
    {
        icon: PhoneIncoming,
        titel: 'Kein Anruf läuft ins Leere',
        text: 'Der Assistent nimmt ab, wenn Ihr Team im Kundengespräch, auf der Baustelle oder im Feierabend ist – rund um die Uhr, auch am Wochenende.',
    },
    {
        icon: ClipboardList,
        titel: 'Sie wissen, wer was wollte',
        text: 'Nach jedem Gespräch erhalten Sie eine Notiz per E-Mail: Name, Firma, Anliegen, Rückrufnummer, Zusammenfassung und Transkript.',
    },
    {
        icon: Languages,
        titel: 'Anrufende reden, wie sie reden',
        text: 'Er versteht und spricht Schweizerdeutsch, Hochdeutsch und Englisch und antwortet aus Ihrem Wissen – nicht aus Textbausteinen.',
    },
];

const schritte = [
    {
        icon: Globe,
        titel: 'Website scannen',
        text: 'Sie geben Ihre Website ein, der Testassistent entsteht aus Ihren Inhalten. Ohne Anmeldung.',
    },
    {
        // Nachtrag 02:30 (AUFTRAG-109): Handelsregister-Prüfung vor dem Testanruf
        icon: BadgeCheck,
        titel: 'Firma bestätigen (Handelsregister)',
        text: 'Wir prüfen Ihre Firma im Handelsregister (Zefix), und Sie bestätigen «Ja, das ist meine Firma». Ohne aktiven Eintrag kein Testanruf.',
    },
    {
        icon: PhoneIncoming,
        titel: 'Testanruf',
        text: 'Der Assistent ruft Sie an: Sie hören, wie er Ihre Firma vorstellt, Fragen beantwortet und ein Anliegen aufnimmt.',
    },
    {
        icon: ClipboardList,
        titel: 'Einrichten',
        text: 'Wir übernehmen das Wissen aus Ihrer Website, prüfen es mit Ihnen und legen Begrüssung, Öffnungszeiten und Regeln fest.',
    },
    {
        icon: PhoneCall,
        titel: 'Aufschalten',
        text: 'Sie leiten Ihre bestehende Nummer um, immer oder nur in bestimmten Fällen. Oder Sie erhalten eine neue Nummer.',
    },
    {
        icon: MessageSquareText,
        titel: 'Im Alltag nutzen',
        text: 'Nach jedem Anruf eine Notiz per E-Mail. Wissen und Regeln passen wir an, wenn sich bei Ihnen etwas ändert.',
    },
];

const ohneMit = [
    {
        thema: 'Anruf während eines Kundentermins',
        ohne: 'Es klingelt ins Leere oder auf den Anrufbeantworter. Wer etwas Dringendes hat, ruft beim nächsten Betrieb an.',
        mit: 'Der Assistent nimmt ab, klärt das Anliegen und schickt Ihnen eine Notiz für den Rückruf.',
    },
    {
        thema: 'Anruf nach Feierabend',
        ohne: 'Eine Ansage nennt die Öffnungszeiten. Ob es ein Notfall war, wissen Sie erst am nächsten Morgen.',
        mit: 'Er beantwortet Fragen, nimmt Anliegen auf und meldet echte Notfälle sofort an Ihre Notfallnummer.',
    },
    {
        thema: 'Rückruf',
        ohne: 'Eine unbekannte Nummer in der Anrufliste, ohne Hinweis, worum es ging.',
        mit: 'Sie rufen zurück und kennen Name, Firma und Anliegen schon.',
    },
    {
        thema: 'Immer dieselben Fragen',
        ohne: 'Öffnungszeiten, Anfahrt, Leistungen: Jede Frage unterbricht die Arbeit.',
        mit: 'Er beantwortet wiederkehrende Fragen aus Ihrer Website und Ihren Angaben.',
    },
    {
        thema: 'Terminwunsch',
        ohne: 'Notiz auf einem Zettel, Rückruf, nochmals Rückruf.',
        // AUFTRAG-113/114: Satz wortgleich aus lib/in-entwicklung.ts, Badge für den Kalendereintrag
        mit: KALENDER_SATZ,
        inEntwicklung: true,
    },
];

const anwendungIcons = { erreichbarkeit: PhoneIncoming, auskunft: MessageSquareText, 'anliegen-erfassen': ClipboardList, terminbuchung: CalendarCheck, notfall: Siren } as const;
const branchenIcons = { elektriker: Zap, 'sanitaer-heizung': Wrench, arztpraxis: Stethoscope, treuhand: Briefcase, immobilien: Building2, garage: Car } as const;

const warumInfraOne = [
    { icon: Headset, titel: 'IT-Partner, nicht nur Software', text: 'InfraOne betreut rund 100 KMU in der IT. Den Assistenten richten wir mit Ihnen ein und bleiben Ansprechpartner im Betrieb.' },
    { icon: PhoneCall, titel: 'Eigene Telefonie', text: 'Cloud-Telefonie und Telefonanlage kommen ebenfalls von uns. Der Assistent wird bei Bedarf Teil Ihrer Anlage.' },
    { icon: MapPin, titel: 'Vor Ort in der Region', text: 'Standorte in Winterthur, Schaffhausen, Tägerwilen und Kleinandelfingen – wenn es vor Ort etwas braucht, kommen wir vorbei.' },
    { icon: Server, titel: 'Betrieb in der Schweiz', text: 'Der Assistent läuft bei Infomaniak in Satigny, die Telefonie über Schweizer Provider.' },
];

export default function KiTelefonassistentPage() {
    const serviceSchema = generateKiTelefonassistentServiceSchema(BESCHREIBUNG);
    const hubFaq = faqNachIds(HUB_FAQ_IDS);
    // Turnstile nur, wenn Site-Key UND Secret gesetzt sind (sonst aus)
    const turnstileSiteKey =
        process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET ? process.env.TURNSTILE_SITE_KEY : undefined;
    // Begrüssungsvorschau: A-091 wortgleich; mit 1 die Formen nach Stimme (sobald AUFTRAG-094 live ist)
    const begruessungNachStimme = (process.env.DEMO_BEGRUESSUNG_NACH_STIMME ?? '0').trim() === '1';

    return (
        <>
            <JsonLd daten={[serviceSchema, ...kiSeitenSchemas(KI_BASIS, 'KI-Telefonassistent für Schweizer KMU', BESCHREIBUNG, kiKrumen()), generateFAQSchema(faqFuerSchema(hubFaq))]} />

            {/* Hero: das Eingabefeld ist die Bühne, rechts das lebende Telefon (unverändert) */}
            <section id="live-test" className="relative overflow-clip pt-10 pb-16 sm:pt-14 lg:pt-16 lg:pb-24 lg:min-h-[min(calc(100svh-5rem),62rem)] scroll-mt-20">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-background to-background" />
                    {/* weicher Lichtfleck als Verlauf statt blur-Filter (billiger zu malen, besseres LCP auf Mobilgeräten) */}
                    <div className="absolute -top-56 right-[-15%] w-[56rem] h-[56rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]" />
                </div>
                <div className="container mx-auto px-4 relative">
                    <KiDemo turnstileSiteKey={turnstileSiteKey} begruessungNachStimme={begruessungNachStimme}>
                        {/* [01.11.2026] AUFTRAG-116 (P4): Antwort-Kapsel — Überzeile, H1 und zwei Absätze wortgleich aus dem
                            Auftrag (Texte in components/ki-telefonassistent/hub-texte.ts, Preis aus der Preis-Konstante),
                            darunter «Aktualisiert am …». Titel, Beschreibung, Keywords und Widget unverändert. */}
                        <p className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary">
                            <span className="relative flex w-2 h-2" aria-hidden="true">
                                <span className="absolute inset-0 rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
                                <span className="relative w-2 h-2 rounded-full bg-primary" />
                            </span>
                            {HUB_UEBERZEILE}
                        </p>
                        <h1 className="mt-5 text-[2.4rem] leading-[1.04] sm:text-5xl lg:text-[3.5rem] xl:text-[3.9rem] font-bold tracking-[-0.035em] text-text-primary text-balance">
                            {HUB_H1}
                        </h1>
                        <p id="antwort" className="mt-5 text-lg md:text-xl text-text-secondary leading-relaxed max-w-[38rem]">
                            {hubAntwort()}
                        </p>
                        <p className="mt-4 text-base md:text-lg text-text-secondary max-w-[38rem]">{HUB_TESTEN}</p>
                        <Aktualisiert pfad={KI_BASIS} className="mt-6" />
                    </KiDemo>
                </div>
            </section>

            {/* 1. Nutzen in drei Kacheln */}
            <Abschnitt
                titel="Was der Assistent Ihrem Betrieb abnimmt"
                intro={
                    <p>
                        Der KI-Telefonassistent ist eine Telefonistin, die nie in der Pause ist: Er nimmt Anrufe an, wenn niemand Zeit hat, beantwortet Fragen aus Ihrem Wissen und hält fest, was Sie erledigen müssen. Für kleine und mittlere Betriebe in der Schweiz, die kein eigenes Sekretariat haben oder es entlasten wollen.
                    </p>
                }
                hintergrund="surface"
            >
                <div className="grid md:grid-cols-3 gap-5">
                    {nutzen.map((n) => (
                        <IconKachel key={n.titel} icon={n.icon} titel={n.titel}>
                            {n.text}
                        </IconKachel>
                    ))}
                </div>
                <p className="mt-8">
                    <Link href={`${KI_BASIS}/funktionen`} className="inline-flex items-center gap-2 font-semibold text-text-primary underline underline-offset-4 decoration-primary hover:decoration-2">
                        Alle Funktionen im Überblick
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </p>
            </Abschnitt>

            {/* 2. So funktioniert es: vier Schritte */}
            <Abschnitt
                titel="So funktioniert es"
                intro={<p>Die ersten drei Schritte machen Sie oben auf dieser Seite selbst: Website eingeben, Firma bestätigen, Anruf annehmen. Danach richten wir den Assistenten mit Ihnen für Ihren Betrieb ein.</p>}
                kopfRechts={
                    <Link href={`${KI_BASIS}/so-funktioniert-es`} className="inline-flex items-center gap-2 font-semibold text-text-primary underline underline-offset-4 decoration-primary hover:decoration-2 whitespace-nowrap">
                        Ablauf im Detail
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                }
            >
                <Schrittfolge schritte={schritte} spalten={3} />
            </Abschnitt>

            {/* 3. Ohne / Mit Assistent */}
            <Abschnitt
                titel="Ohne und mit Assistent"
                intro={<p>Was sich im Alltag ändert, sehen Sie am besten an den Momenten, in denen heute niemand abnimmt.</p>}
                hintergrund="surface"
            >
                <OhneMit zeilen={ohneMit} />
            </Abschnitt>

            {/* 4. Anwendungen */}
            <Abschnitt
                titel="Wofür Betriebe ihn einsetzen"
                intro={<p>Sie können mit einer Aufgabe starten und später weitere dazunehmen. Jede Anwendung zeigt ein Beispielgespräch in Mundart und auf Hochdeutsch.</p>}
                kopfRechts={
                    <Link href={`${KI_BASIS}/anwendungen`} className="inline-flex items-center gap-2 font-semibold text-text-primary underline underline-offset-4 decoration-primary hover:decoration-2 whitespace-nowrap">
                        Alle Anwendungen
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                }
            >
                <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
                    {ANWENDUNGEN.map((a) => (
                        <IconKachel key={a.slug} icon={anwendungIcons[a.slug]} titel={a.name} href={`${KI_BASIS}/anwendungen/${a.slug}`}>
                            {a.teaser}
                        </IconKachel>
                    ))}
                </div>
            </Abschnitt>

            {/* 5. Branchen (Anker #betriebe für das Menü «Für wen») */}
            <Abschnitt
                id="betriebe"
                titel="Für welche Betriebe"
                intro={<p>Überall, wo das Team arbeitet, statt am Telefon zu sitzen. Für sechs Branchen zeigen wir typische Anrufe und wie der Assistent sie behandelt.</p>}
                hintergrund="surface"
                kopfRechts={
                    <Link href={`${KI_BASIS}/branchen`} className="inline-flex items-center gap-2 font-semibold text-text-primary underline underline-offset-4 decoration-primary hover:decoration-2 whitespace-nowrap">
                        Alle Branchen
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                }
            >
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {BRANCHEN.map((b) => {
                        const Icon = branchenIcons[b.slug];
                        return (
                            <li key={b.slug}>
                                <Link href={`${KI_BASIS}/branchen/${b.slug}`} className="group h-full flex gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                                    <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center" aria-hidden="true">
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-1.5 font-bold text-text-primary group-hover:text-primary">
                                            {b.name}
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                                        </span>
                                        <span className="mt-1 block text-sm text-text-secondary leading-relaxed">{b.teaser}</span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <p className="mt-6 text-text-secondary">
                    Ihre Branche ist nicht dabei? Gastronomie, Coiffeur, Physiotherapie oder Beratung funktionieren nach demselben Prinzip –{' '}
                    <Link href="/kontakt" className="font-semibold text-text-primary underline underline-offset-4 decoration-primary">
                        fragen Sie uns
                    </Link>
                    .
                </p>
            </Abschnitt>

            {/* 6. Mundart */}
            <Abschnitt titel="Versteht Mundart – und antwortet auch so">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    <Prosa className="lg:col-span-7">
                        <p>
                            In der Deutschschweiz ist Mundart die Alltagssprache, auch am Telefon. Der Assistent versteht Schweizerdeutsch und spricht es auch. Anrufende müssen nicht auf Hochdeutsch umstellen, und wer lieber Hochdeutsch oder Englisch spricht, wird ebenso bedient.
                        </p>
                        <p>
                            Er arbeitet mit Sprach-zu-Sprach-KI: Er hört das Gesprochene und antwortet direkt, statt Text in Sprache umzuwandeln und Bausteine vorzulesen. Dialekte sind vielfältig, und nicht jeder Ausdruck aus jeder Region wird auf Anhieb verstanden. Im Testanruf ist Schweizerdeutsch deshalb noch als «in Erprobung» gekennzeichnet – prüfen Sie ihn am besten mit Ihrem eigenen Dialekt.
                        </p>
                        <p>
                            <Link href={`${KI_BASIS}/schweizerdeutsch`}>Mehr zu Schweizerdeutsch und den Grenzen</Link>
                        </p>
                    </Prosa>
                    <div className="lg:col-span-5">
                        <Gespraech
                            sprache="gsw"
                            titel="So tönt es"
                            zeilen={[
                                { wer: 'anrufer', text: 'Grüezi, bi üs gheit immer wieder d Sicherig use. Chönd Sie emal verbicho?' },
                                { wer: 'assistent', text: 'Sicher. Isch nume ein Ruum betroffe oder s ganze Huus?' },
                                { wer: 'anrufer', text: 'Nume d Chuchi.' },
                                { wer: 'assistent', text: 'Guet, dänn nimm ich das als dringendi Störig uf. Wie isch Ihri Adrässe?' },
                            ]}
                        />
                        <p className="mt-3 text-sm text-text-secondary">Beispiel, gekürzt.</p>
                    </div>
                </div>
            </Abschnitt>

            {/* 7. Preise-Teaser (mit Entwurfsband, solange nicht freigegeben) */}
            <Abschnitt
                id="preise"
                titel="Preise"
                intro={<p>Monatliche Pakete nach Gesprächsminuten und Funktionen, dazu eine einmalige Einrichtung. Der Testanruf ist kostenlos.</p>}
                hintergrund="surface"
            >
                <PreisTeaser />
            </Abschnitt>

            {/* [31.10.2026] AUFTRAG-114: direkte Anfrage ohne vorherigen Testanruf (nach dem Preis-Teaser, vor den FAQ) */}
            <AnfrageFormular />

            {/* 8. Warum InfraOne */}
            <Abschnitt
                titel="Warum mit InfraOne"
                intro={<p>InfraOne ist ein IT-Dienstleister aus Winterthur. Der Assistent ist für uns kein Einzelprodukt, sondern Teil von Telefonie und IT, die wir für KMU betreiben.</p>}
            >
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {warumInfraOne.map((w) => (
                        <IconKachel key={w.titel} icon={w.icon} titel={w.titel}>
                            {w.text}
                        </IconKachel>
                    ))}
                </div>
            </Abschnitt>

            {/* 9. Vertrauen: Datenschutz und Technik */}
            <section className="py-16 lg:py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <div className="rounded-3xl border border-border bg-card p-6 md:p-10 grid lg:grid-cols-12 gap-8 lg:gap-12">
                        <div className="lg:col-span-7">
                            <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6" aria-hidden="true">
                                <ShieldCheck className="w-7 h-7" />
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-5">Datenschutz, offen erklärt</h2>
                            <Prosa>
                                {/* [31.10.2026] AUFTRAG-114: Namen der KI-Anbieter nur noch in der Datenschutzerklärung */}
                                <p>
                                    Der Assistent läuft auf Servern in der Schweiz, bei Infomaniak in Satigny, die Telefonie über Schweizer Provider. <KiAnbieterSatz />
                                </p>
                                <p>
                                    Gespräche werden nicht aufgezeichnet. Sie erhalten Transkript und Zusammenfassung per E-Mail. Einen Auftragsverarbeitungsvertrag nach Schweizer Datenschutzgesetz erhalten Sie auf Anfrage.
                                </p>
                            </Prosa>
                        </div>
                        <ul className="lg:col-span-5 space-y-3 self-center">
                            <li>
                                <Link href={`${KI_BASIS}/sicherheit-datenschutz`} className="group flex items-center justify-between gap-4 rounded-2xl border border-border p-5 hover:border-primary/50 transition-colors">
                                    <span>
                                        <span className="block font-semibold text-text-primary group-hover:text-primary">Sicherheit und Datenschutz</span>
                                        <span className="block text-sm text-text-secondary">Wo was läuft, was erfasst wird, AVV</span>
                                    </span>
                                    <ArrowRight className="w-5 h-5 flex-shrink-0 text-primary" aria-hidden="true" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/datenschutz#testanruf-ki-telefonassistent" className="group flex items-center justify-between gap-4 rounded-2xl border border-border p-5 hover:border-primary/50 transition-colors">
                                    <span>
                                        <span className="block font-semibold text-text-primary group-hover:text-primary">Datenschutzhinweise zum Testanruf</span>
                                        <span className="block text-sm text-text-secondary">Was mit Website und Nummer passiert</span>
                                    </span>
                                    <ArrowRight className="w-5 h-5 flex-shrink-0 text-primary" aria-hidden="true" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 10. FAQ-Auszug */}
            <Abschnitt
                titel="Häufige Fragen"
                kopfRechts={
                    <Link href={`${KI_BASIS}/faq`} className="inline-flex items-center gap-2 font-semibold text-text-primary underline underline-offset-4 decoration-primary hover:decoration-2 whitespace-nowrap">
                        Alle Fragen
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                }
            >
                <FaqListe eintraege={hubFaq} />
            </Abschnitt>

            {/* 11. Weiterlesen: interne Verlinkung */}
            <Querverweise
                links={[
                    { titel: 'Vergleich', text: 'KI-Assistent, Anrufbeantworter, Telefonservice, Sekretariat oder Sprachmenü?', href: `${KI_BASIS}/vergleich`, icon: Scale },
                    { titel: 'So funktioniert es', text: 'Vom Testanruf zum eigenen Assistenten, Schritt für Schritt.', href: `${KI_BASIS}/so-funktioniert-es`, icon: ClipboardList },
                    { titel: 'Glossar', text: 'Sprach-zu-Sprach-KI, Rufumleitung, vPBX und weitere Begriffe erklärt.', href: `${KI_BASIS}/glossar`, icon: BookOpen },
                    { titel: 'Cloud-Telefonie', text: 'Telefonanlage aus der Cloud, in die sich der Assistent einfügt.', href: '/cloud-telefonie', icon: PhoneCall },
                    { titel: 'IT-Support', text: 'Hilfe per Fernwartung und vor Ort, für KMU in der Ostschweiz.', href: '/it-support', icon: Headset },
                    { titel: 'Kontakt', text: 'Erstgespräch vereinbaren oder direkt anrufen.', href: '/kontakt', icon: Mail },
                ]}
            />

            {/* 12. Abschluss-CTA */}
            <AbschlussCta
                titel="Bereit für Ihren eigenen Assistenten?"
                text="Testen Sie ihn oben mit Ihrer Website – kostenlos, ohne Anmeldung. Oder sprechen Sie direkt mit uns über Ihren Betrieb."
                liveHref="#live-test"
                anfrageHref="#anfrage"
            />
        </>
    );
}
