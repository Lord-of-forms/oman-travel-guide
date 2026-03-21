export const destinations = [
  {
    id: 'oman',
    name: 'Oman',
    country: 'Oman',
    emoji: '🇴🇲',
    description: 'Entdecke versteckte Juwelen im Sultanat Oman',
    heroImage: null,
    dataFile: 'oman',
    language: 'de',
    aiLanguageInstruction: 'Antworte IMMER auf Deutsch.',
    categories: ['Wüste', 'Wasser', 'Gebirge', 'Kultur', 'Küste'],
    centerLat: 22.5,
    centerLng: 57.5,
  },
];

export const getDestinationById = (id) =>
  destinations.find((d) => d.id === id) || destinations[0];
