(function (global) {
  'use strict';

  const GAME_REGISTRY = {
    'nexomon-original': {
      id: 'nexomon-original',
      title: 'Nexomon (Original)',
      shortTitle: 'Nexomon 1',
      subtitle: 'Original Game Database · Verified Companion Architecture',
      releaseYear: 2017,
      totalExpectedSpecies: 310,
      elements: ['Normal', 'Mineral', 'Wind', 'Water', 'Fire', 'Electric', 'Plant'],
      rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Special', 'Legendary'],
      statSchema: [
        { key: 'hp', label: 'HP', usedInGame: true },
        { key: 'stamina', label: 'STA', usedInGame: true },
        { key: 'attack', label: 'ATK', usedInGame: true },
        { key: 'defense', label: 'DEF', usedInGame: true },
        { key: 'speed', label: 'SPD', usedInGame: true },
        { key: 'specialAttack', label: 'SP.ATK', usedInGame: false },
        { key: 'specialDefense', label: 'SP.DEF', usedInGame: false }
      ],
      worldMapImage: '/src/assets/images/nexomon_worldmap_hd_1795166264111.jpg',
      source: 'https://nexomon.fandom.com/wiki/Nexomon_Database',
      enabled: true
    },
    'nexomon-extinction': {
      id: 'nexomon-extinction',
      title: 'Nexomon: Extinction',
      shortTitle: 'Extinction',
      subtitle: 'Planned Future Expansion (Not Loaded)',
      releaseYear: 2020,
      totalExpectedSpecies: 381,
      elements: ['Normal', 'Mineral', 'Wind', 'Water', 'Fire', 'Electric', 'Plant', 'Ghost', 'Psychic'],
      rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Ultra Rare', 'Legendary'],
      statSchema: [
        { key: 'hp', label: 'HP', usedInGame: true },
        { key: 'stamina', label: 'STA', usedInGame: true },
        { key: 'attack', label: 'ATK', usedInGame: true },
        { key: 'defense', label: 'DEF', usedInGame: true },
        { key: 'speed', label: 'SPD', usedInGame: true }
      ],
      worldMapImage: null,
      source: 'https://nexomon.fandom.com/wiki/Database_(Extinction)',
      enabled: false
    }
  };

  const datasets = {};

  function registerDataset(gameId, payload) {
    datasets[gameId] = {
      gameId,
      nexomon: Array.isArray(payload.nexomon) ? payload.nexomon : [],
      regions: Array.isArray(payload.regions) ? payload.regions : [],
      locations: Array.isArray(payload.locations) ? payload.locations : [],
      encounters: Array.isArray(payload.encounters) ? payload.encounters : [],
      elements: Array.isArray(payload.elements) ? payload.elements : [],
      elementMeta: payload.elementMeta || null
    };
  }

  function getGameConfig(gameId) {
    return GAME_REGISTRY[gameId] || GAME_REGISTRY['nexomon-original'];
  }

  function getDataset(gameId) {
    return datasets[gameId] || {
      gameId,
      nexomon: [],
      regions: [],
      locations: [],
      encounters: [],
      elements: [],
      elementMeta: null
    };
  }

  function listGames() {
    return Object.values(GAME_REGISTRY);
  }

  const api = {
    GAME_REGISTRY,
    registerDataset,
    getGameConfig,
    getDataset,
    listGames
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.NexomonGames = api;
})(typeof window !== 'undefined' ? window : globalThis);
