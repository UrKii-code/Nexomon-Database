(function (global) {
  'use strict';

  function initOriginalGameDataset() {
    const gamesApi = global.NexomonGames || (typeof require !== 'undefined' ? require('./games.js') : null);
    const elementsApi = global.NexomonElementsOriginal || (typeof require !== 'undefined' ? require('./elements-original.js') : null);
    const speciesApi = global.NexomonSpeciesOriginal || (typeof require !== 'undefined' ? require('./nexomon-original.js') : null);
    const locationsApi = global.NexomonLocationsOriginal || (typeof require !== 'undefined' ? require('./locations-original.js') : null);
    const encountersApi = global.NexomonEncountersOriginal || (typeof require !== 'undefined' ? require('./encounters-original.js') : null);

    if (!gamesApi || !elementsApi || !speciesApi || !locationsApi || !encountersApi) {
      return;
    }

    const regionsByName = new Map(locationsApi.REGIONS_ORIGINAL.map(r => [r.name, r]));
    const encountersBySpecies = new Map();

    encountersApi.ENCOUNTERS_ORIGINAL.forEach(enc => {
      if (!encountersBySpecies.has(enc.nexomonId)) {
        encountersBySpecies.set(enc.nexomonId, []);
      }
      encountersBySpecies.get(enc.nexomonId).push(enc);
    });

    const enrichedSpecies = speciesApi.NEXOMON_ORIGINAL.map(sp => {
      const spEncounters = encountersBySpecies.get(sp.id) || [];
      const regionNames = [...new Set(spEncounters.map(e => e.region))];
      const biomes = [...new Set(regionNames.map(rn => {
        const reg = regionsByName.get(rn);
        return reg ? reg.biome : null;
      }).filter(Boolean))];

      return Object.assign({}, sp, {
        habitat: biomes.length > 0 ? biomes.join(' · ') : 'Unknown',
        documentedRegions: regionNames,
        encounterCount: spEncounters.length
      });
    });

    gamesApi.registerDataset('nexomon-original', {
      nexomon: enrichedSpecies,
      regions: locationsApi.REGIONS_ORIGINAL,
      locations: locationsApi.LOCATIONS_ORIGINAL,
      encounters: encountersApi.ENCOUNTERS_ORIGINAL,
      elements: elementsApi.ELEMENTS_ORIGINAL,
      elementMeta: elementsApi.ELEMENT_META_ORIGINAL
    });
  }

  initOriginalGameDataset();

  const api = { initOriginalGameDataset };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.NexomonBootstrapOriginal = api;
})(typeof window !== 'undefined' ? window : globalThis);
