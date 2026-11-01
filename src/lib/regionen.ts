/**
 * IT-Support-Regionen für die sitewide Regionszeile im Footer.
 *
 * [01.11.2026] AUFTRAG-116 (P5): Die Regionsseiten hingen nach dem Menü-Umbau nur noch an Hub und
 * Geschwisterseiten. Der Footer verlinkt die sechs IT-Support-Regionen auf jeder Seite. Reihenfolge fest
 * (Auftrag); `name` = Feld `name` der Content-JSON content/leistungen/it-support-regions/<slug>.json
 * (Einheitstest prüft die Gleichheit). Als Liste statt fs-Lesen, weil der Footer auch bei einer
 * Neuberechnung zur Laufzeit (ISR) ohne Zugriff auf content/ rendern muss.
 */
export interface Region {
    slug: string;
    name: string;
}

export const IT_SUPPORT_REGIONEN: readonly Region[] = [
    { slug: 'winterthur', name: 'Winterthur' },
    { slug: 'zuerich', name: 'Zürich' },
    { slug: 'schaffhausen', name: 'Schaffhausen' },
    { slug: 'thurgau', name: 'Thurgau' },
    { slug: 'st-gallen', name: 'St. Gallen' },
    { slug: 'andelfingen', name: 'Andelfingen' },
];
