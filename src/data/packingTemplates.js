export const packingTemplates = {
  desert: {
    name: 'Wüsten-Abenteuer',
    nameEn: 'Desert Adventure',
    items: [
      { category: 'Kleidung', items: ['Leichte, atmungsaktive Hemden', 'Lange Hosen', 'Sonnenhut', 'Schal/Keffiyeh', 'Sandalen', 'Festes Schuhwerk'] },
      { category: 'Essentials', items: ['Sonnencreme SPF50+', 'Wasserflasche (2L+)', 'Erste-Hilfe-Set', 'Taschenlampe/Stirnlampe', 'Sonnenschutzbrille'] },
      { category: 'Ausrüstung', items: ['Geländefahrzeug-Dokumente', 'GPS-Gerät', 'Sandboards', 'Reifendruckprüfer', 'Schaufel'] },
    ]
  },
  beach: {
    name: 'Strand & Küste',
    nameEn: 'Beach & Coast',
    items: [
      { category: 'Kleidung', items: ['Badebekleidung', 'Strandtuch', 'Leichte Sommerkleidung', 'Flip-Flops'] },
      { category: 'Essentials', items: ['Sonnencreme SPF50+', 'After-Sun Lotion', 'Insektenschutz', 'Wasserdichte Tasche'] },
      { category: 'Ausrüstung', items: ['Schnorchelausrüstung', 'Unterwasserkamera', 'Strandschirm', 'Kühltasche'] },
    ]
  },
  mountain: {
    name: 'Bergwanderung',
    nameEn: 'Mountain Hiking',
    items: [
      { category: 'Kleidung', items: ['Wanderstiefel', 'Wandersocken', 'Regenjacke', 'Fleecepullover', 'Wanderhose'] },
      { category: 'Essentials', items: ['Erste-Hilfe-Set', 'Wasserflasche', 'Energieriegel', 'Sonnencreme', 'Kopflampe'] },
      { category: 'Ausrüstung', items: ['Wanderrucksack', 'Wanderstöcke', 'Karte/Kompass', 'Notfallpfeife', 'Rettungsfolie'] },
    ]
  },
  city: {
    name: 'Städtetrip',
    nameEn: 'City Trip',
    items: [
      { category: 'Kleidung', items: ['Bequeme Laufschuhe', 'Smarte Freizeitkleidung', 'Leichte Jacke', 'Kulturbekleidung (Moscheen etc.)'] },
      { category: 'Essentials', items: ['Reiseadapter', 'Powerbank', 'Kopfhörer', 'Wasserflasche'] },
      { category: 'Dokumente', items: ['Reisepass/Ausweis', 'Versicherungskarte', 'Notfallkontakte', 'Buchungsbestätigungen'] },
    ]
  },
  general: {
    name: 'Allgemeine Reise',
    nameEn: 'General Travel',
    items: [
      { category: 'Dokumente', items: ['Reisepass', 'Visum', 'Versicherung', 'Buchungen'] },
      { category: 'Gesundheit', items: ['Medikamente', 'Erste-Hilfe-Set', 'Hand-Desinfektionsmittel', 'Masken'] },
      { category: 'Technik', items: ['Ladekabel', 'Reiseadapter', 'Powerbank', 'Kamera'] },
    ]
  }
};

export function suggestTemplate(destination) {
  const categories = (destination?.categories || []).map(c => c.toLowerCase());
  if (categories.some(c => c.includes('wüste') || c.includes('desert'))) return 'desert';
  if (categories.some(c => c.includes('küste') || c.includes('coast') || c.includes('beach'))) return 'beach';
  if (categories.some(c => c.includes('gebirge') || c.includes('mountain'))) return 'mountain';
  return 'general';
}
