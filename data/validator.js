(function (global) {
  'use strict';

  /**
   * Data Quality Validation & Completeness Engine
   * Audits any registered game dataset for structural integrity, cross-reference validity,
   * Extinction leakage, unverified records, and completeness metrics.
   */
  function validateGameDataset(gameId) {
    const gamesApi = global.NexomonGames || (typeof require !== 'undefined' ? require('./games.js') : null);
    if (!gamesApi) {
      return { ok: false, error: 'NexomonGames registry not loaded' };
    }

    const config = gamesApi.getGameConfig(gameId);
    const dataset = gamesApi.getDataset(gameId);
    const species = dataset.nexomon || [];
    const locations = dataset.locations || [];
    const encounters = dataset.encounters || [];
    const elements = dataset.elements || [];

    const allowedElements = new Set(config.elements || []);
    const allowedRarities = new Set(config.rarities || []);

    const duplicateIds = [];
    const duplicateNames = [];
    const seenIds = new Set();
    const seenNames = new Map();

    const missingArtwork = [];
    const missingElement = [];
    const invalidElements = [];
    const invalidRarities = [];
    const missingSources = [];
    const wrongGameId = [];

    const speciesById = new Map();

    species.forEach(item => {
      if (item.gameId !== gameId) {
        wrongGameId.push({ type: 'species', id: item.id, found: item.gameId });
      }
      if (seenIds.has(item.id)) {
        duplicateIds.push(item.id);
      } else {
        seenIds.add(item.id);
        speciesById.set(item.id, item);
      }

      const normName = (item.name || '').trim().toLowerCase();
      if (!normName) {
        duplicateNames.push(`#${item.id} (empty name)`);
      } else if (seenNames.has(normName)) {
        duplicateNames.push(`${item.name} (#${seenNames.get(normName)} & #${item.id})`);
      } else {
        seenNames.set(normName, item.id);
      }

      if (!item.artwork || !String(item.artwork).trim()) {
        missingArtwork.push(item.id);
      }
      if (!item.element) {
        missingElement.push(item.id);
      } else if (!allowedElements.has(item.element)) {
        invalidElements.push({ id: item.id, name: item.name, element: item.element });
      }
      if (!item.rarity || !allowedRarities.has(item.rarity)) {
        invalidRarities.push({ id: item.id, name: item.name, rarity: item.rarity });
      }
      if (!item.source) {
        missingSources.push({ type: 'species', id: item.id, name: item.name });
      }
    });

    const locationsById = new Map();
    const duplicateLocations = [];
    locations.forEach(loc => {
      if (loc.gameId !== gameId) {
        wrongGameId.push({ type: 'location', id: loc.locationId, found: loc.gameId });
      }
      if (locationsById.has(loc.locationId)) {
        duplicateLocations.push(loc.locationId);
      } else {
        locationsById.set(loc.locationId, loc);
      }
      if (!loc.source) {
        missingSources.push({ type: 'location', id: loc.locationId, name: loc.name });
      }
    });

    const invalidEvolutionRefs = [];
    const unverifiedEvolutions = [];
    const unverifiedStats = [];

    species.forEach(item => {
      const evo = item.evolution || {};
      if (evo.prevId && !speciesById.has(evo.prevId)) {
        invalidEvolutionRefs.push({ id: item.id, field: 'prevId', target: evo.prevId });
      } else if (evo.prevId) {
        const prevItem = speciesById.get(evo.prevId);
        if (prevItem && (!prevItem.evolution || !prevItem.evolution.nextIds.includes(item.id))) {
          invalidEvolutionRefs.push({ id: item.id, field: 'asymmetricPrev', target: evo.prevId });
        }
      }

      if (Array.isArray(evo.nextIds)) {
        evo.nextIds.forEach(nid => {
          if (!speciesById.has(nid)) {
            invalidEvolutionRefs.push({ id: item.id, field: 'nextIds', target: nid });
          } else {
            const nextItem = speciesById.get(nid);
            if (!nextItem.evolution || nextItem.evolution.prevId !== item.id) {
              invalidEvolutionRefs.push({ id: item.id, field: 'asymmetricNext', target: nid });
            }
          }
        });
      }

      if (!evo.verified) {
        unverifiedEvolutions.push(item.id);
      }
      if (!item.stats || !item.stats.verified) {
        unverifiedStats.push(item.id);
      }
    });

    const invalidLocationRefs = [];
    const invalidEncounterSpeciesRefs = [];
    const unverifiedEncounters = [];
    const speciesEncounterCount = new Map();

    encounters.forEach(enc => {
      if (enc.gameId !== gameId) {
        wrongGameId.push({ type: 'encounter', id: enc.encounterId, found: enc.gameId });
      }
      if (!speciesById.has(enc.nexomonId)) {
        invalidEncounterSpeciesRefs.push({ encounterId: enc.encounterId, nexomonId: enc.nexomonId });
      } else {
        speciesEncounterCount.set(enc.nexomonId, (speciesEncounterCount.get(enc.nexomonId) || 0) + 1);
      }
      if (!locationsById.has(enc.locationId)) {
        invalidLocationRefs.push({ encounterId: enc.encounterId, locationId: enc.locationId });
      }
      if (!enc.verified) {
        unverifiedEncounters.push(enc.encounterId);
      }
      if (!enc.source) {
        missingSources.push({ type: 'encounter', id: enc.encounterId });
      }
    });

    const missingLocations = species
      .filter(s => !speciesEncounterCount.has(s.id))
      .map(s => ({ id: s.id, name: s.name, element: s.element, rarity: s.rarity }));

    const verifiedEncounterSpeciesCount = species.length - missingLocations.length;
    const verifiedEvoCount = species.length - unverifiedEvolutions.length;
    const verifiedStatsCount = species.length - unverifiedStats.length;

    const structuralErrorCount =
      duplicateIds.length +
      duplicateNames.length +
      duplicateLocations.length +
      missingArtwork.length +
      missingElement.length +
      invalidElements.length +
      invalidRarities.length +
      invalidEvolutionRefs.length +
      invalidLocationRefs.length +
      invalidEncounterSpeciesRefs.length +
      wrongGameId.length +
      missingSources.length;

    return {
      gameId,
      gameTitle: config.title,
      structuralOk: structuralErrorCount === 0,
      structuralErrorCount,
      totals: {
        species: species.length,
        expectedSpecies: config.totalExpectedSpecies,
        elements: elements.length,
        locations: locations.length,
        encounters: encounters.length,
        verifiedEncounters: encounters.length - unverifiedEncounters.length,
        unverifiedEncountersCount: unverifiedEncounters.length
      },
      completeness: {
        identityVerified: species.filter(s => s.identityVerified).length,
        withDocumentedEncounters: verifiedEncounterSpeciesCount,
        missingEncounterLocations: missingLocations.length,
        verifiedEvolutions: verifiedEvoCount,
        unverifiedEvolutionsCount: unverifiedEvolutions.length,
        verifiedBaseStats: verifiedStatsCount,
        unverifiedBaseStatsCount: unverifiedStats.length
      },
      checks: {
        duplicateIds,
        duplicateNames,
        duplicateLocations,
        missingArtwork,
        missingElement,
        invalidElements,
        invalidRarities,
        invalidEvolutionRefs,
        invalidLocationRefs,
        invalidEncounterSpeciesRefs,
        wrongGameId,
        missingSources
      },
      backlog: {
        missingLocations,
        unverifiedEvolutions,
        unverifiedStats,
        unverifiedEncounters
      }
    };
  }

  const api = {
    validateGameDataset
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.NexomonValidator = api;
})(typeof window !== 'undefined' ? window : globalThis);
