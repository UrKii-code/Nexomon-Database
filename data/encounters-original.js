(function (global) {
  'use strict';

  /**
   * Verified Encounter Records for Nexomon (Original Game ONLY)
   *
   * Strictly sourced from documented Nexomon 1 walkthroughs and Fandom Wiki location pages.
   * Zero algorithmic guessing. Missing level ranges are stored as null (never invented).
   */
  const ENCOUNTER_GROUPS = [
    // Parum Starter Selection
    {
      locationId: 'loc-parum-starter-choice',
      region: 'Parum',
      area: 'Parum Starter Selection',
      encounterMethod: 'Starter Selection',
      levelMin: null,
      levelMax: null,
      conditions: 'Choose 1 of 7 starter Nexomon at the beginning of the game (all 7 can also be encountered later in the wild).',
      source: 'https://nexomon.fandom.com/wiki/Starters',
      items: [
        { id: '274', rarity: 'Special' },
        { id: '277', rarity: 'Special' },
        { id: '280', rarity: 'Special' },
        { id: '283', rarity: 'Special' },
        { id: '286', rarity: 'Special' },
        { id: '289', rarity: 'Special' },
        { id: '292', rarity: 'Special' }
      ]
    },
    // Parum
    {
      locationId: 'loc-parum-east-home',
      region: 'Parum',
      area: 'East of Home',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '003', rarity: 'Common' },
        { id: '008', rarity: 'Common' },
        { id: '018', rarity: 'Common' },
        { id: '035', rarity: 'Common' },
        { id: '066', rarity: 'Uncommon' },
        { id: '090', rarity: 'Uncommon' },
        { id: '092', rarity: 'Uncommon' },
        { id: '120', rarity: 'Uncommon' },
        { id: '148', rarity: 'Rare' },
        { id: '154', rarity: 'Rare' },
        { id: '169', rarity: 'Rare' },
        { id: '220', rarity: 'Rare' },
        { id: '253', rarity: 'Mega Rare' },
        { id: '274', rarity: 'Special' }
      ]
    },
    {
      locationId: 'loc-parum-town-path',
      region: 'Parum',
      area: 'Parum Town Outskirts',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: 'Grass patches outside Parum Town near the painter and merchant.',
      source: 'https://nexomon.fandom.com/wiki/Fleecius',
      items: [
        { id: '253', rarity: 'Mega Rare' }
      ]
    },

    // Mountain Village
    {
      locationId: 'loc-mountain-passage',
      region: 'Mountain Village',
      area: 'Mountain Passage',
      encounterMethod: 'Wild Cave',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '002', rarity: 'Common' },
        { id: '030', rarity: 'Common' },
        { id: '033', rarity: 'Common' },
        { id: '094', rarity: 'Uncommon' },
        { id: '124', rarity: 'Uncommon' },
        { id: '136', rarity: 'Uncommon' },
        { id: '214', rarity: 'Rare' },
        { id: '226', rarity: 'Rare' },
        { id: '271', rarity: 'Mega Rare' },
        { id: '280', rarity: 'Special' }
      ]
    },
    {
      locationId: 'loc-mountain-village-outskirts',
      region: 'Mountain Village',
      area: 'Mountain Village West & East',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '015', rarity: 'Common' },
        { id: '022', rarity: 'Common' },
        { id: '023', rarity: 'Common' },
        { id: '029', rarity: 'Common' },
        { id: '031', rarity: 'Common' },
        { id: '046', rarity: 'Uncommon' },
        { id: '054', rarity: 'Uncommon' },
        { id: '068', rarity: 'Uncommon' },
        { id: '151', rarity: 'Rare' },
        { id: '163', rarity: 'Rare' },
        { id: '256', rarity: 'Mega Rare' },
        { id: '265', rarity: 'Mega Rare' },
        { id: '289', rarity: 'Special' }
      ]
    },

    // Ignitia
    {
      locationId: 'loc-ignitia-west',
      region: 'Ignitia',
      area: 'West Ignitia',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://nexomon.fandom.com/wiki/Ignitia_(Region)',
      items: [
        { id: '012', rarity: 'Common' },
        { id: '017', rarity: 'Common' },
        { id: '019', rarity: 'Common' },
        { id: '072', rarity: 'Uncommon' },
        { id: '086', rarity: 'Uncommon' },
        { id: '128', rarity: 'Uncommon' },
        { id: '181', rarity: 'Rare' },
        { id: '202', rarity: 'Rare' },
        { id: '238', rarity: 'Rare' },
        { id: '262', rarity: 'Mega Rare' },
        { id: '286', rarity: 'Special' }
      ]
    },
    {
      locationId: 'loc-ignitia-east',
      region: 'Ignitia',
      area: 'East Ignitia',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://nexomon.fandom.com/wiki/Ignitia_(Region)',
      items: [
        { id: '005', rarity: 'Common' },
        { id: '010', rarity: 'Common' },
        { id: '027', rarity: 'Common' },
        { id: '033', rarity: 'Common' },
        { id: '052', rarity: 'Uncommon' },
        { id: '058', rarity: 'Uncommon' },
        { id: '100', rarity: 'Uncommon' },
        { id: '114', rarity: 'Uncommon' },
        { id: '142', rarity: 'Uncommon' },
        { id: '160', rarity: 'Rare' },
        { id: '223', rarity: 'Rare' },
        { id: '227', rarity: 'Rare' },
        { id: '244', rarity: 'Rare' },
        { id: '247', rarity: 'Rare' },
        { id: '268', rarity: 'Mega Rare' },
        { id: '274', rarity: 'Special' }
      ]
    },

    // Khan's Jungle
    {
      locationId: 'loc-khans-jungle-main',
      region: "Khan's Jungle",
      area: "Khan's Jungle Paths",
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://platget.com/thedoors/nexomon-locations/',
      items: [
        { id: '021', rarity: 'Common' },
        { id: '028', rarity: 'Common' },
        { id: '032', rarity: 'Common' },
        { id: '074', rarity: 'Uncommon' },
        { id: '076', rarity: 'Uncommon' },
        { id: '118', rarity: 'Uncommon' },
        { id: '157', rarity: 'Rare' },
        { id: '199', rarity: 'Rare' },
        { id: '211', rarity: 'Rare' },
        { id: '259', rarity: 'Mega Rare' },
        { id: '283', rarity: 'Special' },
        { id: '292', rarity: 'Special' }
      ]
    },
    {
      locationId: 'loc-khans-jungle-cave',
      region: "Khan's Jungle",
      area: 'Jungle Cave',
      encounterMethod: 'Wild Cave',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://platget.com/thedoors/nexomon-locations/',
      items: [
        { id: '020', rarity: 'Common' },
        { id: '033', rarity: 'Common' },
        { id: '038', rarity: 'Uncommon' },
        { id: '098', rarity: 'Uncommon' },
        { id: '132', rarity: 'Uncommon' },
        { id: '184', rarity: 'Rare' },
        { id: '193', rarity: 'Rare' },
        { id: '208', rarity: 'Rare' },
        { id: '256', rarity: 'Mega Rare' },
        { id: '280', rarity: 'Special' }
      ]
    },

    // Hidden Village
    {
      locationId: 'loc-hidden-village-south',
      region: 'Hidden Village',
      area: 'Hidden Village South',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://nexomon.fandom.com/wiki/Hidden_Village_(Region)',
      items: [
        { id: '004', rarity: 'Common' },
        { id: '014', rarity: 'Common' },
        { id: '021', rarity: 'Common' },
        { id: '040', rarity: 'Uncommon' },
        { id: '104', rarity: 'Uncommon' },
        { id: '126', rarity: 'Uncommon' },
        { id: '134', rarity: 'Uncommon' },
        { id: '166', rarity: 'Rare' },
        { id: '187', rarity: 'Rare' },
        { id: '229', rarity: 'Rare' },
        { id: '241', rarity: 'Rare' }
      ]
    },
    {
      locationId: 'loc-hidden-rest-stop',
      region: 'Hidden Village',
      area: 'Hidden Rest Stop & Guard Area',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: 'Bottom bushes at Hidden Rest Stop and Hidden Guard Area.',
      source: 'https://nexomon.fandom.com/wiki/Breeshy',
      items: [
        { id: '040', rarity: 'Uncommon' }
      ]
    },
    {
      locationId: 'loc-tree-of-ventra',
      region: 'Hidden Village',
      area: 'The Great Tree of Ventra (Floor 1)',
      encounterMethod: 'Wild Interior',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://nexomon.fandom.com/wiki/Arnut',
      items: [
        { id: '036', rarity: 'Uncommon' }
      ]
    },

    // Hilda's Domain
    {
      locationId: 'loc-hildas-maze',
      region: "Hilda's Domain",
      area: "Hilda's Maze",
      encounterMethod: 'Wild Grass',
      levelMin: 29,
      levelMax: 33,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '009', rarity: 'Common' },
        { id: '077', rarity: 'Uncommon' },
        { id: '119', rarity: 'Uncommon' },
        { id: '125', rarity: 'Uncommon' },
        { id: '129', rarity: 'Uncommon' },
        { id: '182', rarity: 'Rare' },
        { id: '212', rarity: 'Rare' },
        { id: '218', rarity: 'Rare' },
        { id: '248', rarity: 'Rare' },
        { id: '269', rarity: 'Mega Rare' },
        { id: '293', rarity: 'Special' }
      ]
    },

    // Phantom Citadel
    {
      locationId: 'loc-phantom-region-west',
      region: 'Phantom Citadel',
      area: 'Phantom Region West',
      encounterMethod: 'Wild Grass',
      levelMin: 29,
      levelMax: 32,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '007', rarity: 'Common' },
        { id: '022', rarity: 'Common' },
        { id: '025', rarity: 'Common' },
        { id: '087', rarity: 'Uncommon' },
        { id: '110', rarity: 'Uncommon' },
        { id: '138', rarity: 'Uncommon' },
        { id: '155', rarity: 'Rare' },
        { id: '196', rarity: 'Rare' },
        { id: '257', rarity: 'Mega Rare' },
        { id: '290', rarity: 'Special' }
      ]
    },

    // Solus Desert
    {
      locationId: 'loc-solus-desert-west',
      region: 'Solus Desert',
      area: 'Desert Region West',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '062', rarity: 'Uncommon' },
        { id: '091', rarity: 'Uncommon' },
        { id: '108', rarity: 'Uncommon' },
        { id: '173', rarity: 'Rare' },
        { id: '183', rarity: 'Rare' },
        { id: '249', rarity: 'Rare' },
        { id: '279', rarity: 'Special' }
      ]
    },
    {
      locationId: 'loc-solus-desert-east',
      region: 'Solus Desert',
      area: 'Solus East Desert',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://nexomon.fandom.com/wiki/Solus_Desert_(Region)',
      items: [
        { id: '005', rarity: 'Common' },
        { id: '016', rarity: 'Common' },
        { id: '019', rarity: 'Common' },
        { id: '027', rarity: 'Common' },
        { id: '037', rarity: 'Uncommon' },
        { id: '063', rarity: 'Uncommon' },
        { id: '080', rarity: 'Uncommon' },
        { id: '115', rarity: 'Uncommon' },
        { id: '145', rarity: 'Uncommon' },
        { id: '186', rarity: 'Rare' },
        { id: '224', rarity: 'Rare' },
        { id: '233', rarity: 'Rare' },
        { id: '236', rarity: 'Rare' },
        { id: '246', rarity: 'Rare' },
        { id: '270', rarity: 'Mega Rare' },
        { id: '291', rarity: 'Special' }
      ]
    },

    // Frozen Tundra & Nexolord Tower
    {
      locationId: 'loc-frozen-tundra-forests',
      region: 'Frozen Tundra',
      area: 'Frozen Tundra West & North Forests',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://platget.com/thedoors/nexomon-locations/',
      items: [
        { id: '001', rarity: 'Common' },
        { id: '003', rarity: 'Common' },
        { id: '011', rarity: 'Common' },
        { id: '015', rarity: 'Common' },
        { id: '018', rarity: 'Common' },
        { id: '025', rarity: 'Common' },
        { id: '045', rarity: 'Uncommon' },
        { id: '056', rarity: 'Uncommon' },
        { id: '071', rarity: 'Uncommon' },
        { id: '085', rarity: 'Uncommon' },
        { id: '093', rarity: 'Uncommon' },
        { id: '123', rarity: 'Uncommon' },
        { id: '147', rarity: 'Uncommon' },
        { id: '156', rarity: 'Rare' },
        { id: '159', rarity: 'Rare' },
        { id: '180', rarity: 'Rare' },
        { id: '198', rarity: 'Rare' },
        { id: '204', rarity: 'Rare' },
        { id: '213', rarity: 'Rare' },
        { id: '261', rarity: 'Mega Rare' },
        { id: '276', rarity: 'Special' }
      ]
    },
    {
      locationId: 'loc-frozen-tundra-wilds',
      region: 'Frozen Tundra',
      area: 'Tundra Region West & East',
      encounterMethod: 'Wild Grass',
      levelMin: 50,
      levelMax: 55,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '059', rarity: 'Uncommon' },
        { id: '089', rarity: 'Uncommon' },
        { id: '097', rarity: 'Uncommon' },
        { id: '113', rarity: 'Uncommon' },
        { id: '139', rarity: 'Uncommon' },
        { id: '141', rarity: 'Uncommon' },
        { id: '150', rarity: 'Rare' },
        { id: '165', rarity: 'Rare' },
        { id: '168', rarity: 'Rare' },
        { id: '207', rarity: 'Rare' },
        { id: '216', rarity: 'Rare' },
        { id: '222', rarity: 'Rare' },
        { id: '267', rarity: 'Mega Rare' },
        { id: '279', rarity: 'Special' }
      ]
    },
    {
      locationId: 'loc-nexolord-tower-approach',
      region: 'Nexolord Tower',
      area: 'Path to Nexolord Tower',
      encounterMethod: 'Wild Grass',
      levelMin: 50,
      levelMax: 55,
      conditions: 'High-level snowy approach to the one-time Nexolord Tower story dungeon.',
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '279', rarity: 'Special' },
        { id: '267', rarity: 'Mega Rare' }
      ]
    },

    // Royalle City
    {
      locationId: 'loc-royalle-west-forest',
      region: 'Royalle City',
      area: 'Royalle City West Forest',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://platget.com/thedoors/nexomon-locations/',
      items: [
        { id: '023', rarity: 'Common' },
        { id: '034', rarity: 'Common' },
        { id: '055', rarity: 'Uncommon' },
        { id: '269', rarity: 'Mega Rare' },
        { id: '287', rarity: 'Special' }
      ]
    },
    {
      locationId: 'loc-royalle-sewers',
      region: 'Royalle City',
      area: 'Royalle City Sewers',
      encounterMethod: 'Wild Cave',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '043', rarity: 'Uncommon' },
        { id: '051', rarity: 'Uncommon' },
        { id: '084', rarity: 'Uncommon' },
        { id: '103', rarity: 'Uncommon' },
        { id: '164', rarity: 'Rare' },
        { id: '203', rarity: 'Rare' },
        { id: '215', rarity: 'Rare' },
        { id: '221', rarity: 'Rare' }
      ]
    },
    {
      locationId: 'loc-royalle-east-forest',
      region: 'Royalle City',
      area: 'Royalle City East Forest / Royalle Woods',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://nexomon.fandom.com/wiki/Royalle_City_(Region)',
      items: [
        { id: '001', rarity: 'Common' },
        { id: '014', rarity: 'Common' },
        { id: '022', rarity: 'Common' }
      ]
    },

    // Palmaya Beach
    {
      locationId: 'loc-palmaya-beach-shore',
      region: 'Palmaya Beach',
      area: 'Palmaya Beach',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://nexomon.fandom.com/wiki/Palmaya_Beach_(Region)',
      items: [
        { id: '004', rarity: 'Common' },
        { id: '010', rarity: 'Common' },
        { id: '070', rarity: 'Uncommon' }
      ]
    },
    {
      locationId: 'loc-palmaya-boardwalk',
      region: 'Palmaya Beach',
      area: 'Palmaya Boardwalk',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: null,
      source: 'https://gamefaqs.gamespot.com/switch/1224261-nexomon/faqs',
      items: [
        { id: '010', rarity: 'Common' },
        { id: '032', rarity: 'Common' },
        { id: '260', rarity: 'Mega Rare' }
      ]
    },
    {
      locationId: 'loc-palmaya-pier',
      region: 'Palmaya Beach',
      area: 'Palmaya Pier & Kitchen Grounds',
      encounterMethod: 'Wild Grass',
      levelMin: null,
      levelMax: null,
      conditions: 'Palmaya Pier and grass outside Hendrick\'s Restaurant / behind Palmaya\'s Kitchen.',
      source: 'https://platget.com/thedoors/nexomon-locations/',
      items: [
        { id: '018', rarity: 'Common' },
        { id: '025', rarity: 'Common' },
        { id: '073', rarity: 'Uncommon' },
        { id: '112', rarity: 'Uncommon' },
        { id: '157', rarity: 'Rare' },
        { id: '158', rarity: 'Rare' }
      ]
    },

    // Post-Game Legendaries (Ancient Radar & Warden Phantoms)
    {
      locationId: 'loc-postgame-ancient-radar',
      region: 'World Roaming & Wardens',
      area: 'Ancient Radar Roaming Zones (Grass & Caves)',
      encounterMethod: 'Ancient Radar (Roaming)',
      levelMin: null,
      levelMax: null,
      conditions: 'Post-game: defeat Omnicron twice, collect 41 Nexomite Fragments, obtain Ancient Radar from Miriam in Parum Town, and look for "Legendary Nearby!" banner.',
      source: 'https://platget.com/thedoors/nexomon-legendaries/',
      items: [
        { id: '295', rarity: 'Legendary' },
        { id: '296', rarity: 'Legendary' },
        { id: '297', rarity: 'Legendary' },
        { id: '298', rarity: 'Legendary' },
        { id: '299', rarity: 'Legendary' },
        { id: '300', rarity: 'Legendary' },
        { id: '301', rarity: 'Legendary' },
        { id: '302', rarity: 'Legendary' },
        { id: '303', rarity: 'Legendary' },
        { id: '310', rarity: 'Legendary' }
      ]
    },
    {
      locationId: 'loc-postgame-warden-phantoms',
      region: 'World Roaming & Wardens',
      area: 'Warden Phantom Encounters (World & Netherworld)',
      encounterMethod: 'Warden Phantom',
      levelMin: null,
      levelMax: null,
      conditions: 'Defeat corrupted Warden Phantoms across regional maps (automatically awarded upon victory; not trapped).',
      source: 'https://platget.com/thedoors/nexomon-legendaries/',
      items: [
        { id: '304', rarity: 'Legendary' },
        { id: '305', rarity: 'Legendary' },
        { id: '306', rarity: 'Legendary' },
        { id: '307', rarity: 'Legendary' },
        { id: '308', rarity: 'Legendary' },
        { id: '309', rarity: 'Legendary' }
      ]
    }
  ];

  const ENCOUNTERS_ORIGINAL = [];
  ENCOUNTER_GROUPS.forEach((group, groupIndex) => {
    group.items.forEach((item, itemIndex) => {
      ENCOUNTERS_ORIGINAL.push({
        encounterId: `enc-orig-${String(groupIndex + 1).padStart(2, '0')}-${String(itemIndex + 1).padStart(2, '0')}`,
        gameId: 'nexomon-original',
        nexomonId: item.id,
        locationId: group.locationId,
        region: group.region,
        area: group.area,
        encounterMethod: group.encounterMethod,
        levelMin: group.levelMin,
        levelMax: group.levelMax,
        rarity: item.rarity,
        probability: 'Unknown',
        conditions: group.conditions || null,
        source: group.source,
        verified: true
      });
    });
  });

  const api = {
    ENCOUNTERS_ORIGINAL
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.NexomonEncountersOriginal = api;
})(typeof window !== 'undefined' ? window : globalThis);
