(function (global) {
  'use strict';

  const ELEMENTS_ORIGINAL = [
    {
      id: 'Normal',
      name: 'Normal',
      gameId: 'nexomon-original',
      icon: 'images/normal.png',
      colorHex: '#94A3B8',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700',
      textClass: 'text-slate-600 dark:text-slate-300',
      strongAgainst: [],
      weakTo: [],
      resists: [],
      neutralSummary: 'Neutral against all 7 original elements (no elemental strengths or weaknesses).',
      verified: true,
      source: 'https://nexomon.fandom.com/wiki/Elements'
    },
    {
      id: 'Mineral',
      name: 'Mineral',
      gameId: 'nexomon-original',
      icon: 'images/mineral.png',
      colorHex: '#A8A29E',
      badgeClass: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-900/80 dark:text-stone-300 dark:border-stone-700',
      textClass: 'text-stone-600 dark:text-stone-300',
      strongAgainst: ['Fire', 'Electric'],
      weakTo: ['Water', 'Wind'],
      resists: ['Fire', 'Electric'],
      neutralSummary: 'Earth and stone type. Excels against Fire and Electric; vulnerable to Water and Wind.',
      verified: true,
      source: 'https://nexomon.fandom.com/wiki/Elements'
    },
    {
      id: 'Wind',
      name: 'Wind',
      gameId: 'nexomon-original',
      icon: 'images/wind.png',
      colorHex: '#34D399',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      strongAgainst: ['Plant', 'Mineral'],
      weakTo: ['Fire', 'Electric'],
      resists: ['Plant', 'Mineral'],
      neutralSummary: 'Aerial elemental type. Strong against Plant and Mineral; weak against Fire and Electric.',
      verified: true,
      source: 'https://nexomon.fandom.com/wiki/Elements'
    },
    {
      id: 'Water',
      name: 'Water',
      gameId: 'nexomon-original',
      icon: 'images/water.png',
      colorHex: '#38BDF8',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800',
      textClass: 'text-sky-600 dark:text-sky-400',
      strongAgainst: ['Fire', 'Mineral'],
      weakTo: ['Plant', 'Electric'],
      resists: ['Fire', 'Mineral'],
      neutralSummary: 'Aquatic elemental type. Overwhelms Fire and Mineral; vulnerable to Plant and Electric.',
      verified: true,
      source: 'https://nexomon.fandom.com/wiki/Elements'
    },
    {
      id: 'Fire',
      name: 'Fire',
      gameId: 'nexomon-original',
      icon: 'images/fire.png',
      colorHex: '#F87171',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
      textClass: 'text-rose-600 dark:text-rose-400',
      strongAgainst: ['Plant', 'Wind'],
      weakTo: ['Water', 'Mineral'],
      resists: ['Plant', 'Wind'],
      neutralSummary: 'Thermal elemental type. Burns Plant and Wind; weak to Water and Mineral.',
      verified: true,
      source: 'https://nexomon.fandom.com/wiki/Elements'
    },
    {
      id: 'Electric',
      name: 'Electric',
      gameId: 'nexomon-original',
      icon: 'images/electric.png',
      colorHex: '#FBBF24',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
      textClass: 'text-amber-600 dark:text-amber-400',
      strongAgainst: ['Water', 'Wind'],
      weakTo: ['Plant', 'Mineral'],
      resists: ['Water', 'Wind'],
      neutralSummary: 'High-voltage elemental type. Strong against Water and Wind; grounded by Plant and Mineral.',
      verified: true,
      source: 'https://nexomon.fandom.com/wiki/Elements'
    },
    {
      id: 'Plant',
      name: 'Plant',
      gameId: 'nexomon-original',
      icon: 'images/plant.png',
      colorHex: '#4ADE80',
      badgeClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/70 dark:text-green-300 dark:border-green-800',
      textClass: 'text-green-600 dark:text-green-400',
      strongAgainst: ['Water', 'Electric'],
      weakTo: ['Fire', 'Wind'],
      resists: ['Water', 'Electric'],
      neutralSummary: 'Botanical elemental type. Absorbs Water and Electric; vulnerable to Fire and Wind.',
      verified: true,
      source: 'https://nexomon.fandom.com/wiki/Elements'
    }
  ];

  const ELEMENT_META_ORIGINAL = {
    gameId: 'nexomon-original',
    totalElements: 7,
    excludedExpansionElements: ['Ghost', 'Psychic'],
    notes: 'Original Nexomon uses 7 elements (Ghost and Psychic were introduced later in Nexomon: Extinction and are intentionally excluded).'
  };

  function getMatchup(attackerElement, defenderElement) {
    const atk = ELEMENTS_ORIGINAL.find(e => e.id === attackerElement);
    if (!atk) return 'unknown';
    if (atk.strongAgainst.includes(defenderElement)) return 'effective';
    if (atk.weakTo.includes(defenderElement)) return 'weak';
    return 'neutral';
  }

  const api = {
    ELEMENTS_ORIGINAL,
    ELEMENT_META_ORIGINAL,
    getMatchup
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.NexomonElementsOriginal = api;
})(typeof window !== 'undefined' ? window : globalThis);
