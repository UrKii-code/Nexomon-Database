const firebaseConfig = window.__FIREBASE_CONFIG__ || null;

let auth = null;
let db = null;
let currentUserId = null;

if (firebaseConfig && firebaseConfig.apiKey && typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();

    // Listen for global authentication state changes
    auth.onAuthStateChanged(async (user) => {
        const authContainer = document.getElementById('auth-container');
        const profileView = document.getElementById('user-profile-view');
        const emailDisplay = document.getElementById('logged-in-email');

        if (user) {
            currentUserId = user.uid;
            if (authContainer) authContainer.classList.add('hidden');
            if (profileView) profileView.classList.remove('hidden');
            if (emailDisplay) emailDisplay.innerText = user.email;

            await loadCloudData(user.uid);
        } else {
            currentUserId = null;
            if (authContainer) authContainer.classList.remove('hidden');
            if (profileView) profileView.classList.add('hidden');
            loadSavedData();
        }
        renderGrid();
        renderLocationTab();
    });
}

function handleEmailSignUp() {
    if (!auth) {
        alert("Cloud sync is not configured. Progress is saved locally in your browser.");
        return;
    }
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert("Account created and logged in!"))
        .catch((error) => alert(error.message));
}

function handleEmailLogin() {
    if (!auth) {
        alert("Cloud sync is not configured. Progress is saved locally in your browser.");
        return;
    }
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }
    auth.signInWithEmailAndPassword(email, password)
        .then(() => alert("Logged in successfully!"))
        .catch((error) => alert(error.message));
}

function handleFirebaseLogout() {
    if (!auth) return;
    auth.signOut().then(() => {
        alert("Logged out successfully.");
        location.reload();
    });
}

const GAME_CONFIG = {
    nexomon1: {
        id: 'nexomon1',
        title: 'COLLECTION DATABASE',
        rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Special', 'Legendary'],
        mapImage: '/src/assets/images/nexomon_worldmap_hd_1795166264111.jpg',
        mapAlt: 'Nexomon World Map',
        regions: [
            'Parum',
            'Mountain Village',
            'Ignitia',
            "Khan's Jungle",
            'Hidden Village',
            "Hilda's Domain",
            'Phantom Citadel',
            'Solus Desert',
            'Frozen Tundra',
            'Nexolord Tower',
            'Royalle City',
            'Palmaya Beach',
            'The Netherworld'
        ],
        encounterTypes: ['Wild', 'Evolution', 'Legendary Radar', 'Warden Reward', 'Roaming'],
        storageKey: 'nexomon_collection_data',
        cloudField: 'caughtNexomon'
    },
    extinction: {
        id: 'extinction',
        title: 'EXTINCTION COLLECTION DATABASE',
        rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Ultra Rare', 'Legendary', 'Ultimate'],
        mapImage: 'images/worldmap-extinction.jpg',
        mapAlt: 'Nexomon: Extinction World Map',
        regions: [
            'Parum City',
            'The Orphanage',
            'The Outlands',
            'Immortal Citadel',
            'Frozen Lake',
            'New Ignitia',
            'Lateria',
            'Frozen Tundra',
            'Cadium',
            'The Drake Isles',
            'Hidden Village',
            'Palmaya',
            'Precursor Mountain'
        ],
        encounterTypes: ['Wild', 'Evolution', 'Quest / Post-Game', 'Quest / Resurrection', 'Post-Game', 'Roaming'],
        storageKey: 'nexomon_extinction_collection_data',
        cloudField: 'caughtExtinction'
    }
};

let currentGame = localStorage.getItem('nexomon_active_game') || 'nexomon1';
if (!GAME_CONFIG[currentGame]) currentGame = 'nexomon1';

function getGameConfig() {
    return GAME_CONFIG[currentGame] || GAME_CONFIG.nexomon1;
}

function getActiveDatabase() {
    if (currentGame === 'extinction' && typeof extinctionDatabase !== 'undefined') {
        return extinctionDatabase;
    }
    return nexomonDatabase;
}

// Ensure toggleCaught saves to cloud if logged in
function toggleCaught(id) {
    const activeDb = getActiveDatabase();
    const nexo = activeDb.find(n => n.id === id);
    if (nexo) {
        nexo.caught = !nexo.caught;
        
        if (currentUserId && db) {
            saveCollectionToCloud();
        } else {
            const cfg = getGameConfig();
            const caughtIds = activeDb.filter(n => n.caught).map(n => n.id);
            localStorage.setItem(cfg.storageKey, JSON.stringify(caughtIds));
        }
        
        renderGrid();
        renderLocationTab();
    }
}

async function saveCollectionToCloud() {
    if (!currentUserId || !db) return;
    const cfg = getGameConfig();
    const activeDb = getActiveDatabase();
    const caughtIds = activeDb.filter(n => n.caught).map(n => n.id);
    try {
        await db.collection("users").doc(currentUserId).set({
            [cfg.cloudField]: caughtIds,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving to cloud: ", error);
    }
}

async function loadCloudData(uid) {
    if (!db) return;
    try {
        const docRef = await db.collection("users").doc(uid).get();
        if (docRef.exists) {
            const data = docRef.data();
            const caughtIds = data.caughtNexomon || [];
            nexomonDatabase.forEach(nexo => {
                nexo.caught = caughtIds.includes(nexo.id);
            });
            if (typeof extinctionDatabase !== 'undefined') {
                const caughtExtIds = data.caughtExtinction || [];
                extinctionDatabase.forEach(nexo => {
                    nexo.caught = caughtExtIds.includes(nexo.id);
                });
            }
        }
    } catch (error) {
        console.error("Error loading cloud data: ", error);
    }
}

async function handleAccountDeletion() {
    if (!auth || !db) {
        alert("No cloud account is currently signed in.");
        return;
    }
    const user = auth.currentUser;
    if (!user) {
        alert("No user is currently signed in.");
        return;
    }

    const confirmed = confirm("Are you sure you want to delete your account? This will permanently remove your login and cloud data. There is no going back.");
    if (!confirmed) return;

    try {
        await db.collection("users").doc(user.uid).delete();
        await user.delete();
        alert("Account and cloud data successfully deleted.");
        location.reload();
    } catch (error) {
        console.error("Error deleting account: ", error);
        if (error.code === 'auth/requires-recent-login') {
            alert("For security reasons, please log out and log back in before deleting your account.");
        } else {
            alert("Error: " + error.message);
        }
    }
}

let currentFilterStatus = 'all'; // 'all', 'have', 'need'
let searchQuery = '';

// Load saved collection data and trainer preferences on startup
function loadSavedData() {
    const savedCollection = localStorage.getItem('nexomon_collection_data');
    if (savedCollection) {
        const caughtIds = JSON.parse(savedCollection);
        nexomonDatabase.forEach(nexo => {
            if (caughtIds.includes(nexo.id)) {
                nexo.caught = true;
            }
        });
    }

    if (typeof extinctionDatabase !== 'undefined') {
        const savedExtinction = localStorage.getItem('nexomon_extinction_collection_data');
        if (savedExtinction) {
            const caughtExtIds = JSON.parse(savedExtinction);
            extinctionDatabase.forEach(nexo => {
                if (caughtExtIds.includes(nexo.id)) {
                    nexo.caught = true;
                }
            });
        }
    }

    const savedTrainer = localStorage.getItem('nexomon_trainer_name');
    if (savedTrainer) {
        const tamerInput = document.getElementById('tamer-name-input');
        if (tamerInput) tamerInput.value = savedTrainer;
    }
}

// Theme Switcher Logic (Sun / Crescent Moon)
function toggleTheme() {
    const htmlRoot = document.getElementById('html-root');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    if (htmlRoot.classList.contains('dark')) {
        htmlRoot.classList.remove('dark');
        sunIcon.classList.add('hidden');
        sunIcon.classList.remove('block');
        moonIcon.classList.add('block');
        moonIcon.classList.remove('hidden');
    } else {
        htmlRoot.classList.add('dark');
        moonIcon.classList.add('hidden');
        moonIcon.classList.remove('block');
        sunIcon.classList.add('block');
        sunIcon.classList.remove('hidden');
    }
}

// Tab Switcher Logic for Collection, Location (Map), and Profile
function switchTab(tabName) {
    const collectionTab = document.getElementById('tab-collection');
    const locationTab = document.getElementById('tab-location');
    const profileTab = document.getElementById('tab-profile');
    
    const navCollection = document.getElementById('nav-collection');
    const navMap = document.getElementById('nav-map');
    const navProfile = document.getElementById('nav-profile');

    // Hide all tabs first
    if (collectionTab) collectionTab.classList.add('hidden');
    if (locationTab) locationTab.classList.add('hidden');
    if (profileTab) profileTab.classList.add('hidden');

    // Reset all nav styles to inactive
    if (navCollection) navCollection.className = "flex items-center gap-2 text-slate-400 hover:text-slate-200 transition";
    if (navMap) navMap.className = "flex items-center gap-2 text-slate-400 hover:text-slate-200 transition";
    if (navProfile) navProfile.className = "flex items-center gap-2 text-slate-400 hover:text-slate-200 transition";

    // Show active tab and highlight its nav button
    if (tabName === 'collection') {
        if (collectionTab) collectionTab.classList.remove('hidden');
        if (navCollection) navCollection.className = "flex items-center gap-2 text-amber-500 transition font-semibold";
    } else if (tabName === 'location') {
        if (locationTab) locationTab.classList.remove('hidden');
        if (navMap) navMap.className = "flex items-center gap-2 text-amber-500 transition font-semibold";
        renderLocationTab(); 
    } else if (tabName === 'profile') {
        if (profileTab) profileTab.classList.remove('hidden');
        if (navProfile) navProfile.className = "flex items-center gap-2 text-amber-500 transition font-semibold";
    }
}

let selectedMapRegion = '';
let mapSearchQuery = '';
let mapHabitatFilter = '';
let mapTypeFilter = '';
let mapRarityFilter = '';
let mapFiltersBound = false;

function initMapData() {
    const dbs = [nexomonDatabase];
    if (typeof extinctionDatabase !== 'undefined') dbs.push(extinctionDatabase);
    dbs.forEach(dbList => {
        dbList.forEach((nexo) => {
            if (!Array.isArray(nexo.regions)) nexo.regions = [];
            if (!nexo.locationsByRegion || typeof nexo.locationsByRegion !== 'object') {
                nexo.locationsByRegion = {};
            }
            if (!nexo.habitatType) nexo.habitatType = 'Wild';
            if (typeof nexo.locationNote !== 'string') nexo.locationNote = '';
            nexo.allSubAreas = [...new Set(Object.values(nexo.locationsByRegion).flat())];
        });
    });
}

function renderRegionListButtons() {
    const container = document.getElementById('region-list-container');
    if (!container) return;
    const cfg = getGameConfig();
    container.innerHTML = '';
    cfg.regions.forEach(regionName => {
        const btn = document.createElement('button');
        btn.setAttribute('data-region', regionName);
        btn.className = 'region-btn w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800/40 text-slate-300 hover:bg-slate-800 transition flex justify-between items-center gap-2';
        btn.onclick = () => selectArea(regionName);

        const nameSpan = document.createElement('span');
        nameSpan.textContent = regionName;
        const progSpan = document.createElement('span');
        progSpan.className = 'region-progress text-[10px] text-slate-400 font-mono ml-auto';

        btn.appendChild(nameSpan);
        btn.appendChild(progSpan);
        container.appendChild(btn);
    });
}

function populateMapFilterOptions() {
    const cfg = getGameConfig();
    const activeDb = getActiveDatabase();

    const regionSelect = document.getElementById('filter-region-dropdown');
    const habitatSelect = document.getElementById('filter-habitat-dropdown');
    const typeSelect = document.getElementById('filter-type-dropdown');
    const raritySelect = document.getElementById('filter-rarity-dropdown');

    if (regionSelect) {
        regionSelect.innerHTML = '<option value="">All Regions</option>';
        cfg.regions.forEach(regionName => {
            const opt = document.createElement('option');
            opt.value = regionName;
            opt.textContent = regionName;
            regionSelect.appendChild(opt);
        });
        regionSelect.value = selectedMapRegion;
    }

    if (habitatSelect) {
        habitatSelect.innerHTML = '<option value="">All Habitats</option>';
        const encounterGroup = document.createElement('optgroup');
        encounterGroup.label = 'Encounter / Method';
        cfg.encounterTypes.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.textContent = type;
            encounterGroup.appendChild(opt);
        });
        habitatSelect.appendChild(encounterGroup);

        const subAreas = [...new Set(
            activeDb.flatMap(n => n.allSubAreas || [])
        )].sort((a, b) => a.localeCompare(b));

        if (subAreas.length > 0) {
            const areaGroup = document.createElement('optgroup');
            areaGroup.label = 'Sub-Locations / Areas';
            subAreas.forEach(area => {
                const opt = document.createElement('option');
                opt.value = area;
                opt.textContent = area;
                areaGroup.appendChild(opt);
            });
            habitatSelect.appendChild(areaGroup);
        }
        habitatSelect.value = mapHabitatFilter;
    }

    if (typeSelect) {
        typeSelect.innerHTML = '<option value="">All Types</option>';
        const types = [...new Set(activeDb.map(n => n.element))];
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            typeSelect.appendChild(opt);
        });
        typeSelect.value = mapTypeFilter;
    }

    if (raritySelect) {
        raritySelect.innerHTML = '<option value="">All Rarities</option>';
        cfg.rarities.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            raritySelect.appendChild(opt);
        });
        raritySelect.value = mapRarityFilter;
    }
}

function initMapFilters() {
    if (mapFiltersBound) return;
    mapFiltersBound = true;

    const regionSelect = document.getElementById('filter-region-dropdown');
    const habitatSelect = document.getElementById('filter-habitat-dropdown');
    const typeSelect = document.getElementById('filter-type-dropdown');
    const raritySelect = document.getElementById('filter-rarity-dropdown');
    const mapSearchInput = document.getElementById('map-search-input');

    if (regionSelect) {
        regionSelect.addEventListener('change', (e) => {
            selectArea(e.target.value, true);
        });
    }
    if (habitatSelect) {
        habitatSelect.addEventListener('change', (e) => {
            mapHabitatFilter = e.target.value;
            renderLocationTab();
        });
    }
    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            mapTypeFilter = e.target.value;
            renderLocationTab();
        });
    }
    if (raritySelect) {
        raritySelect.addEventListener('change', (e) => {
            mapRarityFilter = e.target.value;
            renderLocationTab();
        });
    }
    if (mapSearchInput) {
        mapSearchInput.addEventListener('input', (e) => {
            mapSearchQuery = e.target.value;
            renderLocationTab();
        });
    }

    renderRegionListButtons();
    populateMapFilterOptions();
}

function resetMapFilters() {
    selectedMapRegion = '';
    mapSearchQuery = '';
    mapHabitatFilter = '';
    mapTypeFilter = '';
    mapRarityFilter = '';

    const mapSearchInput = document.getElementById('map-search-input');
    const regionSelect = document.getElementById('filter-region-dropdown');
    const habitatSelect = document.getElementById('filter-habitat-dropdown');
    const typeSelect = document.getElementById('filter-type-dropdown');
    const raritySelect = document.getElementById('filter-rarity-dropdown');

    if (mapSearchInput) mapSearchInput.value = '';
    if (regionSelect) regionSelect.value = '';
    if (habitatSelect) habitatSelect.value = '';
    if (typeSelect) typeSelect.value = '';
    if (raritySelect) raritySelect.value = '';

    selectArea('');
}

// Location / Map Tab Dynamic Rendering
function renderLocationTab() {
    initMapData();
    initMapFilters();

    const activeDb = getActiveDatabase();
    const speciesGrid = document.getElementById('region-species-grid');
    const countEl = document.getElementById('region-species-count');
    if (!speciesGrid) return;

    // Update left region progress counters
    const regionButtons = document.querySelectorAll('#region-list-container .region-btn');
    regionButtons.forEach(button => {
        const regionName = button.getAttribute('data-region');
        const progressSpan = button.querySelector('.region-progress');
        if (regionName && progressSpan) {
            const regionSpecies = activeDb.filter(n => n.regions && n.regions.includes(regionName));
            const caughtInRegion = regionSpecies.filter(n => n.caught).length;
            progressSpan.textContent = `${caughtInRegion}/${regionSpecies.length}`;
        }
    });

    const query = mapSearchQuery.trim().toLowerCase();
    const filtered = activeDb.filter(nexo => {
        const matchesRegion = !selectedMapRegion || (nexo.regions && nexo.regions.includes(selectedMapRegion));
        const matchesHabitat = !mapHabitatFilter ||
            nexo.habitatType === mapHabitatFilter ||
            (selectedMapRegion
                ? (nexo.locationsByRegion && Array.isArray(nexo.locationsByRegion[selectedMapRegion]) && nexo.locationsByRegion[selectedMapRegion].includes(mapHabitatFilter))
                : (nexo.allSubAreas && nexo.allSubAreas.includes(mapHabitatFilter)));
        const matchesType = !mapTypeFilter || nexo.element === mapTypeFilter;
        const matchesRarity = !mapRarityFilter || nexo.rarity === mapRarityFilter;
        const matchesSearch = !query ||
            nexo.name.toLowerCase().includes(query) ||
            nexo.id.includes(query) ||
            (nexo.locationNote && nexo.locationNote.toLowerCase().includes(query)) ||
            (nexo.habitatType && nexo.habitatType.toLowerCase().includes(query)) ||
            (nexo.regions && nexo.regions.some(r => r.toLowerCase().includes(query))) ||
            (nexo.allSubAreas && nexo.allSubAreas.some(a => a.toLowerCase().includes(query)));

        return matchesRegion && matchesHabitat && matchesType && matchesRarity && matchesSearch;
    });

    const caughtCount = filtered.filter(n => n.caught).length;
    if (countEl) {
        countEl.textContent = `${filtered.length} Species • ${caughtCount} Caught`;
    }

    speciesGrid.innerHTML = '';

    if (filtered.length === 0) {
        speciesGrid.innerHTML = `
            <div class="col-span-full text-center py-8 px-3 text-slate-400 text-xs">
                No Nexomon match the selected map filters.
            </div>
        `;
        return;
    }

    filtered.forEach(nexo => {
        const elemConfig = getElementConfig(nexo.element, nexo.elementIcon);
        const card = document.createElement('div');
        card.className = `rounded-xl p-2.5 flex flex-col items-center justify-between border transition-all cursor-pointer ${
            nexo.caught
                ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                : 'bg-slate-950/60 border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-700'
        }`;
        card.onclick = () => toggleCaught(nexo.id);

        let locationText = '';
        let locationTooltip = '';
        if (selectedMapRegion) {
            const subLocs = (nexo.locationsByRegion && nexo.locationsByRegion[selectedMapRegion]) || [];
            locationText = subLocs.length > 0 ? subLocs.join(', ') : (nexo.locationNote || nexo.habitatType || '');
            locationTooltip = `${selectedMapRegion}: ${locationText}`;
        } else {
            locationText = (nexo.regions && nexo.regions.length > 0)
                ? nexo.regions.join(', ')
                : (nexo.locationNote || nexo.habitatType || '');
            if (nexo.regions && nexo.regions.length > 0) {
                locationTooltip = nexo.regions.map(region => {
                    const subLocs = (nexo.locationsByRegion && nexo.locationsByRegion[region]) || [];
                    return subLocs.length > 0 ? `${region}: ${subLocs.join(', ')}` : region;
                }).join('\n');
            } else {
                locationTooltip = nexo.locationNote || nexo.habitatType || '';
            }
        }
        card.title = locationTooltip;

        card.innerHTML = `
            <div class="w-full flex justify-between items-center text-[10px] text-slate-400 mb-1">
                <span class="font-mono">#${nexo.id}</span>
                <span class="w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${nexo.caught ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold' : 'border-slate-600'}">
                    ${nexo.caught ? '✓' : ''}
                </span>
            </div>
            <div class="w-16 h-16 my-1 flex items-center justify-center relative">
                <img src="${nexo.image}" alt="${nexo.name}" loading="lazy" class="w-full h-full object-contain drop-shadow" onerror="this.style.display='none';">
            </div>
            <div class="text-center w-full mt-1">
                <p class="font-bold text-xs text-slate-200 truncate">${nexo.name}</p>
                <p class="location-subtext text-[10px] text-slate-400 truncate mb-1"></p>
                <div class="flex flex-nowrap items-center justify-center gap-1 w-full">
                    <span class="text-[9px] px-1 py-0.5 rounded border inline-flex items-center justify-center gap-0.5 whitespace-nowrap leading-tight ${elemConfig.bgStyle} ${elemConfig.textColor}">
                        <img src="${elemConfig.iconPath}" alt="${nexo.element}" class="w-2.5 h-2.5 object-contain shrink-0" onerror="this.style.display='none';">
                        <span>${nexo.element}</span>
                    </span>
                    <span class="text-[9px] px-1 py-0.5 rounded border inline-flex items-center justify-center whitespace-nowrap leading-tight ${getRarityBadgeStyle(nexo.rarity)}">${nexo.rarity}</span>
                </div>
            </div>
        `;
        const subtextEl = card.querySelector('.location-subtext');
        if (subtextEl) subtextEl.textContent = locationText;

        speciesGrid.appendChild(card);
    });
}

function selectArea(areaName, force = false) {
    const nextRegion = areaName || '';
    selectedMapRegion = (!force && nextRegion && selectedMapRegion === nextRegion) ? '' : nextRegion;

    // 1. Update right panel header title and icon
    const regionTitle = document.getElementById('selected-region-title');
    if (regionTitle) {
        regionTitle.textContent = selectedMapRegion ? `${selectedMapRegion} Habitat` : 'All Regions';
    }

    const regionIcon = document.getElementById('selected-region-icon');
    if (regionIcon) {
        regionIcon.src = "images/savepoint.png";
        if (selectedMapRegion) {
            regionIcon.classList.remove('hidden');
        } else {
            regionIcon.classList.add('hidden');
        }
    }

    // 2. Sync region dropdown
    const regionSelect = document.getElementById('filter-region-dropdown');
    if (regionSelect) {
        regionSelect.value = selectedMapRegion;
    }

    // 3. Highlight active button in left region list
    const regionButtons = document.querySelectorAll('#region-list-container .region-btn');
    regionButtons.forEach(button => {
        const regionKey = button.getAttribute('data-region') || button.querySelector('span').textContent;

        const existingIcon = button.querySelector('.region-owl-icon');
        if (existingIcon) existingIcon.remove();

        if (selectedMapRegion && regionKey === selectedMapRegion) {
            button.classList.remove('bg-slate-800/40', 'bg-slate-800/60', 'text-slate-300', 'text-slate-200');
            button.classList.add('bg-slate-800', 'border', 'border-amber-500/50', 'text-white');

            const img = document.createElement('img');
            img.src = "images/savepoint.png";
            img.className = "w-4 h-4 object-contain region-owl-icon select-none shrink-0";
            button.insertBefore(img, button.querySelector('.region-progress'));
        } else {
            button.classList.remove('bg-slate-800', 'border', 'border-amber-500/50', 'text-white');
            button.classList.add('bg-slate-800/40', 'text-slate-300');
        }
    });

    // 4. Highlight active pin on the map
    const activePinsId = currentGame === 'extinction' ? 'map-pins-extinction' : 'map-pins-nexomon1';
    const mapPins = document.querySelectorAll(`#${activePinsId} .map-pin`);
    mapPins.forEach(pin => {
        const pinRegion = pin.getAttribute('data-region');
        const pinCircle = pin.firstElementChild;
        const pinLabel = pin.querySelector('.pin-label');

        if (selectedMapRegion && pinRegion === selectedMapRegion) {
            pin.classList.add('scale-125', 'z-20');
            if (pinCircle) pinCircle.classList.add('ring-2', 'ring-amber-400', 'bg-amber-400/20');
            if (pinLabel) {
                pinLabel.classList.remove('hidden');
                pinLabel.classList.add('block');
            }
        } else {
            pin.classList.remove('scale-125', 'z-20');
            if (pinCircle) pinCircle.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-400/20');
            if (pinLabel) {
                pinLabel.classList.add('hidden');
                pinLabel.classList.remove('block');
            }
        }
    });

    renderLocationTab();
}

function getRarityBadgeStyle(rarity) {
    switch(rarity) {
        case 'Common': return 'bg-slate-800 text-slate-300 border-slate-700';
        case 'Uncommon': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
        case 'Rare': return 'bg-blue-950 text-blue-300 border-blue-800';
        case 'Mega Rare': return 'bg-purple-950 text-purple-300 border-purple-800';
        case 'Special': return 'bg-pink-950 text-pink-300 border-pink-800';
        case 'Ultra Rare': return 'bg-pink-950 text-pink-300 border-pink-800';
        case 'Legendary': return 'bg-amber-950 text-amber-300 border-amber-600 shadow-amber-500/10 shadow-lg';
        case 'Ultimate': return 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-cyan-500/20 shadow-lg';
        default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
}

function getElementConfig(element, elementIcon) {
    let textColor = 'text-slate-300';
    let bgStyle = 'bg-slate-800/80 border-slate-700';
    
    switch(element) {
        case 'Normal': textColor = 'text-slate-300'; bgStyle = 'bg-slate-800/80 border-slate-700'; break;
        case 'Water': textColor = 'text-blue-400'; bgStyle = 'bg-blue-950/80 border-blue-800'; break;
        case 'Fire': textColor = 'text-red-400'; bgStyle = 'bg-red-950/80 border-red-800'; break;
        case 'Electric': textColor = 'text-amber-400'; bgStyle = 'bg-amber-950/80 border-amber-800'; break;
        case 'Wind': textColor = 'text-emerald-400'; bgStyle = 'bg-emerald-950/80 border-emerald-800'; break;
        case 'Mineral': textColor = 'text-stone-400'; bgStyle = 'bg-stone-900/80 border-stone-700'; break;
        case 'Plant': textColor = 'text-green-400'; bgStyle = 'bg-green-950/80 border-green-800'; break;
        case 'Ghost': textColor = 'text-purple-400'; bgStyle = 'bg-purple-950/80 border-purple-800'; break;
        case 'Psychic': textColor = 'text-pink-400'; bgStyle = 'bg-pink-950/80 border-pink-800'; break;
    }
    
    const iconPath = elementIcon || `images/${element.toLowerCase()}.png`;
    return { textColor, bgStyle, iconPath };
}

// Language System Translations
const translations = {
    en: {
        collectionTitle: "COLLECTION DATABASE",
        extinctionCollectionTitle: "EXTINCTION COLLECTION DATABASE",
        navCollection: "Collections",
        navMap: "Map",
        navProfile: "Profile",
        searchPlaceholder: "Search...",
        filterAll: "All",
        filterHave: "Have",
        filterNeed: "Need",
        selectAll: "Select All",
        trainerLabel: "Trainer Account Sync",
        emailPlaceholder: "Email address",
        passwordPlaceholder: "Password",
        registerBtn: "Register",
        loginBtn: "Log In",
        connectedText: "Connected",
        collectedLabel: "Collected",
        completionLabel: "Completion",
        totalLabel: "Total",
        languageLabel: "Language",
        logoutLabel: "Log out",
        mapTitle: "World Map & Regional Habitats",
        mapSubtitle: "Explore regional habitats to discover native Nexomon species and encounter zones.",
        deleteAccountTitle: "Delete account",
        deleteAccountDesc: "Once you delete your account, there is no going back. Please be certain.",
        deleteAccountBtn: "Delete Account",
        rarityCommon: "Common",
        rarityUncommon: "Uncommon",
        rarityRare: "Rare",
        rarityMegaRare: "Mega Rare",
        raritySpecial: "Special",
        rarityUltraRare: "Ultra Rare",
        rarityLegendary: "Legendary",
        rarityUltimate: "Ultimate"
    },
    ms: {
        collectionTitle: "PANGKALAN DATA KOLEKSI",
        extinctionCollectionTitle: "PANGKALAN DATA KOLEKSI EXTINCTION",
        navCollection: "Koleksi",
        navMap: "Peta",
        navProfile: "Profil",
        searchPlaceholder: "Cari...",
        filterAll: "Semua",
        filterHave: "Ada",
        filterNeed: "Perlu",
        selectAll: "Pilih Semua",
        trainerLabel: "Penyegerakan Akaun Jurulatih",
        emailPlaceholder: "Alamat emel",
        passwordPlaceholder: "Kata laluan",
        registerBtn: "Daftar",
        loginBtn: "Log Masuk",
        connectedText: "Disambungkan",
        collectedLabel: "Dikumpul",
        completionLabel: "Penyempurnaan",
        totalLabel: "Jumlah",
        languageLabel: "Bahasa",
        logoutLabel: "Log keluar",
        mapTitle: "Peta Dunia & Habitat Serantau",
        mapSubtitle: "Teroka habitat serantau untuk menemui spesies Nexomon asli dan zon temui.",
        deleteAccountTitle: "Padam akaun",
        deleteAccountDesc: "Sebaik sahaja anda memadam akaun anda, tiada jalan untuk kembali. Sila pastikan.",
        deleteAccountBtn: "Padam Akaun",
        rarityCommon: "Biasa",
        rarityUncommon: "Luar Biasa",
        rarityRare: "Nadir",
        rarityMegaRare: "Sangat Nadir",
        raritySpecial: "Istimewa",
        rarityUltraRare: "Ultra Nadir",
        rarityLegendary: "Legenda",
        rarityUltimate: "Muktamad"
    },
    zh: {
        collectionTitle: "收集数据库",
        extinctionCollectionTitle: "灭绝收集数据库",
        navCollection: "收藏",
        navMap: "地图",
        navProfile: "个人资料",
        searchPlaceholder: "搜索...",
        filterAll: "全部",
        filterHave: "拥有",
        filterNeed: "缺少",
        selectAll: "全选",
        trainerLabel: "训练师账户同步",
        emailPlaceholder: "电子邮箱地址",
        passwordPlaceholder: "密码",
        registerBtn: "注册",
        loginBtn: "登录",
        connectedText: "已连接",
        collectedLabel: "已收集",
        completionLabel: "完成度",
        totalLabel: "总计",
        languageLabel: "语言",
        logoutLabel: "登出",
        mapTitle: "世界地图与区域栖息地",
        mapSubtitle: "探索各区域栖息地，寻找本地的Nexomon物种与遭遇点。",
        deleteAccountTitle: "删除账户",
        deleteAccountDesc: "一旦删除您的账户将无法恢复，请谨慎操作。",
        deleteAccountBtn: "删除账户",
        rarityCommon: "普通",
        rarityUncommon: "罕见",
        rarityRare: "稀有",
        rarityMegaRare: "超级稀有",
        raritySpecial: "特殊",
        rarityUltraRare: "究极稀有",
        rarityLegendary: "传说",
        rarityUltimate: "终极"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    const btnEn = document.getElementById('lang-en');
    const btnMs = document.getElementById('lang-ms');
    const btnZh = document.getElementById('lang-zh');
    
    [btnEn, btnMs, btnZh].forEach(btn => {
        if (btn) btn.className = "px-3 py-1 rounded text-slate-400 hover:text-white transition text-xs font-semibold";
    });

    if (lang === 'en' && btnEn) btnEn.className = "px-3 py-1 rounded bg-emerald-600 text-white transition text-xs font-semibold";
    if (lang === 'ms' && btnMs) btnMs.className = "px-3 py-1 rounded bg-emerald-600 text-white transition text-xs font-semibold";
    if (lang === 'zh' && btnZh) btnZh.className = "px-3 py-1 rounded bg-emerald-600 text-white transition text-xs font-semibold";

    applyTranslations();
}

function applyTranslations() {
    const t = translations[currentLang];
    if (!t) return;

    // Nav & Titles
    const titleText = currentGame === 'extinction' ? (t.extinctionCollectionTitle || t.collectionTitle) : t.collectionTitle;
    if (document.getElementById('text-collection-title')) document.getElementById('text-collection-title').innerText = titleText;
    if (document.getElementById('nav-collection-text')) document.getElementById('nav-collection-text').innerText = t.navCollection;
    if (document.getElementById('nav-map-text')) document.getElementById('nav-map-text').innerText = t.navMap;
    if (document.getElementById('nav-profile-text')) document.getElementById('nav-profile-text').innerText = t.navProfile;
    if (document.getElementById('search-input')) document.getElementById('search-input').placeholder = t.searchPlaceholder;
    
    // Filters & Selectors
    if (document.getElementById('btn-all')) document.getElementById('btn-all').innerText = t.filterAll;
    if (document.getElementById('btn-caught')) document.getElementById('btn-caught').innerText = t.filterHave;
    if (document.getElementById('btn-missing')) document.getElementById('btn-missing').innerText = t.filterNeed;
    
    // Profile / Auth Section
    if (document.getElementById('text-trainer-label')) document.getElementById('text-trainer-label').innerText = t.trainerLabel;
    if (document.getElementById('form-trainer-label')) document.getElementById('form-trainer-label').innerText = t.trainerLabel;
    if (document.getElementById('auth-email')) document.getElementById('auth-email').placeholder = t.emailPlaceholder;
    if (document.getElementById('auth-password')) document.getElementById('auth-password').placeholder = t.passwordPlaceholder;
    if (document.getElementById('btn-register')) document.getElementById('btn-register').innerText = t.registerBtn;
    if (document.getElementById('btn-login')) document.getElementById('btn-login').innerText = t.loginBtn;
    if (document.getElementById('text-connected')) document.getElementById('text-connected').innerText = t.connectedText;
    if (document.getElementById('text-collected-label')) document.getElementById('text-collected-label').innerText = t.collectedLabel;
    if (document.getElementById('text-completion-label')) document.getElementById('text-completion-label').innerText = t.completionLabel;
    if (document.getElementById('text-total-label')) document.getElementById('text-total-label').innerText = t.totalLabel;
    if (document.getElementById('text-language-label')) document.getElementById('text-language-label').innerText = t.languageLabel;
    if (document.getElementById('text-logout')) document.getElementById('text-logout').innerText = t.logoutLabel;
    
    // Map & Delete Account
    if (document.getElementById('text-map-title')) document.getElementById('text-map-title').innerText = t.mapTitle;
    if (document.getElementById('text-map-subtitle')) document.getElementById('text-map-subtitle').innerText = t.mapSubtitle;
    if (document.getElementById('text-delete-title')) document.getElementById('text-delete-title').innerText = t.deleteAccountTitle;
    if (document.getElementById('text-delete-desc')) document.getElementById('text-delete-desc').innerText = t.deleteAccountDesc;
    if (document.getElementById('btn-delete-account')) document.getElementById('btn-delete-account').innerText = t.deleteAccountBtn;

    // Rarity Pills, Section Titles, and Select All Buttons Update Loop
    const rarities = [
        { name: 'Common', key: 'common' },
        { name: 'Uncommon', key: 'uncommon' },
        { name: 'Rare', key: 'rare' },
        { name: 'Mega Rare', key: 'mega-rare' },
        { name: 'Special', key: 'special' },
        { name: 'Ultra Rare', key: 'ultra-rare' },
        { name: 'Legendary', key: 'legendary' },
        { name: 'Ultimate', key: 'ultimate' }
    ];

    rarities.forEach(r => {
        const propName = `rarity${r.name.replace(/\s+/g, '')}`;
        const translatedText = t[propName] || r.name;

        const pill = document.getElementById(`rarity-text-${r.key}`);
        if (pill) pill.innerText = translatedText;

        const sectionTitle = document.getElementById(`section-title-${r.key}`);
        if (sectionTitle) sectionTitle.innerText = translatedText;

        const selectAllBtn = document.getElementById(`select-all-${r.key}`);
        if (selectAllBtn && t.selectAll) selectAllBtn.innerText = t.selectAll;
    });
}

function applyGameUIState() {
    const cfg = getGameConfig();
    const isExtinction = currentGame === 'extinction';

    // 1. Update 'Switch Game' icon-only button distinct style & tooltip
    const switchBtn = document.getElementById('switch-game-btn');
    if (switchBtn) {
        switchBtn.className = isExtinction
            ? 'flex items-center justify-center p-1.5 rounded-lg border-2 border-cyan-400/70 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-300 dark:text-cyan-300 text-cyan-700 shadow-md shadow-cyan-950/20 transition-all shrink-0 cursor-pointer'
            : 'flex items-center justify-center p-1.5 rounded-lg border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 dark:text-amber-300 text-amber-700 shadow-md shadow-amber-950/20 transition-all shrink-0 cursor-pointer';
        switchBtn.title = isExtinction
            ? 'Switch Game (Current: Nexomon: Extinction)'
            : 'Switch Game (Current: Nexomon 1)';
    }

    // 2. Collection Title & Rarity Pills / Sections visibility
    applyTranslations();

    const allRarityKeys = ['common', 'uncommon', 'rare', 'mega-rare', 'special', 'ultra-rare', 'legendary', 'ultimate'];
    const activeRarityKeys = new Set(cfg.rarities.map(r => r.toLowerCase().replace(/\s+/g, '-')));

    allRarityKeys.forEach(key => {
        const pill = document.getElementById(`rarity-btn-${key}`);
        const section = document.getElementById(`section-${key}`);
        const show = activeRarityKeys.has(key);
        if (pill) pill.classList.toggle('hidden', !show);
        if (section) section.classList.toggle('hidden', !show);
    });

    // 3. Map Image & Pin Layers
    const mapImg = document.getElementById('map-world-image');
    if (mapImg) {
        mapImg.src = cfg.mapImage;
        mapImg.alt = cfg.mapAlt;
    }
    const pins1 = document.getElementById('map-pins-nexomon1');
    const pins2 = document.getElementById('map-pins-extinction');
    if (pins1) pins1.classList.toggle('hidden', isExtinction);
    if (pins2) pins2.classList.toggle('hidden', !isExtinction);

    // 4. Rebuild region list & dropdowns for active game
    renderRegionListButtons();
    populateMapFilterOptions();
}

function toggleGameDatabase() {
    switchGame(currentGame === 'extinction' ? 'nexomon1' : 'extinction');
}

function switchGame(gameId) {
    if (!GAME_CONFIG[gameId] || currentGame === gameId) return;
    currentGame = gameId;
    localStorage.setItem('nexomon_active_game', currentGame);

    selectedMapRegion = '';
    mapSearchQuery = '';
    mapHabitatFilter = '';
    mapTypeFilter = '';
    mapRarityFilter = '';

    const mapSearchInput = document.getElementById('map-search-input');
    if (mapSearchInput) mapSearchInput.value = '';

    document.querySelectorAll('.rarity-pill').forEach(btn => {
        btn.classList.remove('ring-2', 'border-slate-100', 'border-emerald-400', 'border-blue-400', 'border-purple-400', 'border-pink-400', 'border-amber-400', 'border-cyan-400', 'bg-slate-800/80', 'bg-slate-800', 'text-white', 'shadow-lg', 'shadow-md');
    });

    applyGameUIState();
    renderGrid();
    selectArea('', true);
}

// Render all rarity sections independently
function renderGrid() {
    const cfg = getGameConfig();
    const activeDb = getActiveDatabase();
    const rarities = cfg.rarities;
    
    let totalItemsCount = activeDb.length;
    let totalCaughtCount = 0;

    rarities.forEach(rarity => {
        const rarityKey = rarity.toLowerCase().replace(/\s+/g, '-');
        const gridEl = document.getElementById(`grid-${rarityKey}`);
        const statsEl = document.getElementById(`section-stats-${rarityKey}`);
        
        if (!gridEl) return;
        gridEl.innerHTML = '';

        const rarityItems = activeDb.filter(n => n.rarity === rarity);
        
        const filteredItems = rarityItems.filter(nexo => {
            const matchesStatus = 
                currentFilterStatus === 'all' ? true :
                currentFilterStatus === 'have' ? nexo.caught : !nexo.caught;
            
            const matchesSearch = nexo.name.toLowerCase().includes(searchQuery.toLowerCase()) || nexo.id.includes(searchQuery);

            return matchesStatus && matchesSearch;
        });

        const sectionTotal = rarityItems.length;
        const sectionCaught = rarityItems.filter(n => n.caught).length;
        totalCaughtCount += sectionCaught;
        const sectionPercentage = sectionTotal > 0 ? ((sectionCaught / sectionTotal) * 100).toFixed(2) : "0.00";
        
        if (statsEl) {
            statsEl.innerText = `${sectionCaught} / ${sectionTotal} (${sectionPercentage}%)`;
        }

        filteredItems.forEach(nexo => {
            const card = document.createElement('div');
            card.className = `relative rounded-xl p-3 xl:p-4 flex flex-col items-center justify-between border transition-all cursor-pointer ${
                nexo.caught 
                    ? 'bg-slate-900/80 dark:bg-slate-900/80 bg-white border-emerald-500/40 shadow-lg shadow-emerald-950/20' 
                    : 'bg-slate-900/40 dark:bg-slate-900/40 bg-slate-50 border-slate-800/80 opacity-60 hover:opacity-100'
            }`;
            card.onclick = () => toggleCaught(nexo.id);

            const elemConfig = getElementConfig(nexo.element, nexo.elementIcon);

            card.innerHTML = `
                <div class="w-full flex justify-between items-center text-xs text-slate-500 mb-2">
                    <span>#${nexo.id}</span>
                    <span class="w-4 h-4 rounded-full border flex items-center justify-center ${nexo.caught ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold' : 'border-slate-600'}">
                        ${nexo.caught ? '✓' : ''}
                    </span>
                </div>
                <div class="w-32 h-32 my-2 flex items-center justify-center relative">
                    <img src="${nexo.image}" alt="${nexo.name}" loading="lazy" class="w-full h-full object-contain drop-shadow-md" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <span class="text-slate-600 dark:text-slate-400 text-xs font-semibold hidden">[Sprite]</span>
                </div>
                <div class="text-center w-full">
                    <p class="font-bold text-sm text-slate-200 dark:text-slate-200 text-slate-800 truncate">${nexo.name}</p>
                    <div class="flex flex-nowrap items-center justify-center gap-1 mt-2 w-full">
                        <span class="text-[9px] xl:text-[10px] px-1 sm:px-1.5 py-0.5 rounded border inline-flex items-center justify-center gap-1 whitespace-nowrap leading-tight ${elemConfig.bgStyle} ${elemConfig.textColor}">
                            <img src="${elemConfig.iconPath}" alt="${nexo.element}" class="w-3 h-3 object-contain shrink-0" onerror="this.style.display='none';">
                            <span>${nexo.element}</span>
                        </span>
                        <span class="text-[9px] xl:text-[10px] px-1 sm:px-1.5 py-0.5 rounded border inline-flex items-center justify-center whitespace-nowrap leading-tight ${getRarityBadgeStyle(nexo.rarity)}">${nexo.rarity}</span>
                    </div>
                </div>
            `;
            gridEl.appendChild(card);
        });
    });

    updateGlobalStats(totalCaughtCount, totalItemsCount);
}

function filterStatus(status) {
    currentFilterStatus = status;
    const btnAll = document.getElementById('btn-all');
    const btnCaught = document.getElementById('btn-caught');
    const btnMissing = document.getElementById('btn-missing');

    [btnAll, btnCaught, btnMissing].forEach(btn => {
        if (!btn) return;
        btn.className = "px-4 py-1.5 rounded-md text-slate-400 hover:text-white transition text-xs font-semibold";
    });

    if (status === 'all' && btnAll) btnAll.className = "px-4 py-1.5 rounded-md bg-white text-slate-950 font-bold shadow transition text-xs";
    if (status === 'have' && btnCaught) btnCaught.className = "px-4 py-1.5 rounded-md bg-white text-slate-950 font-bold shadow transition text-xs";
    if (status === 'need' && btnMissing) btnMissing.className = "px-4 py-1.5 rounded-md bg-white text-slate-950 font-bold shadow transition text-xs";

    renderGrid();
}

function filterRarity(rarity) {
    const rarityKey = rarity.toLowerCase().replace(/\s+/g, '-');
    
    document.querySelectorAll('.rarity-pill').forEach(btn => {
        btn.classList.remove('ring-2', 'border-slate-100', 'border-emerald-400', 'border-blue-400', 'border-purple-400', 'border-pink-400', 'border-amber-400', 'border-cyan-400', 'bg-slate-800/80', 'bg-slate-800', 'text-white', 'shadow-lg', 'shadow-md');
    });
    
    const activeBtn = document.getElementById(`rarity-btn-${rarityKey}`);
    if (activeBtn) {
        let pillBorder = 'border-slate-100';
        if (rarity === 'Uncommon') pillBorder = 'border-emerald-400';
        if (rarity === 'Rare') pillBorder = 'border-blue-400';
        if (rarity === 'Mega Rare') pillBorder = 'border-purple-400';
        if (rarity === 'Special' || rarity === 'Ultra Rare') pillBorder = 'border-pink-400';
        if (rarity === 'Legendary') pillBorder = 'border-amber-400';
        if (rarity === 'Ultimate') pillBorder = 'border-cyan-400';

        activeBtn.classList.add('ring-2', pillBorder, 'bg-slate-800/80', 'shadow-md');
    }

    const activeSection = document.getElementById(`section-${rarityKey}`);
    if (activeSection) {
        const headerOffset = 130;
        const elementPosition = activeSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

const searchElement = document.getElementById('search-input');
if (searchElement) {
    searchElement.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderGrid();
    });
}

const tamerInput = document.getElementById('tamer-name-input');
if (tamerInput) {
    tamerInput.addEventListener('input', (e) => {
        localStorage.setItem('nexomon_trainer_name', e.target.value);
    });
}

function updateGlobalStats(caughtCount, total) {
    const percentage = total > 0 ? ((caughtCount / total) * 100).toFixed(2) : "0.00";
    
    const progressEl = document.getElementById('total-progress');
    if (progressEl) {
        progressEl.innerText = `${caughtCount} / ${total} (${percentage}%)`;
    }

    const profileCountEl = document.getElementById('profile-collection-count');
    const profilePercentEl = document.getElementById('profile-collection-percent');
    const profileTotalEl = document.getElementById('profile-collection-total');
    if (profileCountEl && profilePercentEl) {
        profileCountEl.innerText = `${caughtCount}`;
        profilePercentEl.innerText = `${percentage}%`;
    }
    if (profileTotalEl) {
        profileTotalEl.innerText = `${total}`;
    }
}

function toggleSelectAll(rarity) {
    const activeDb = getActiveDatabase();
    const cfg = getGameConfig();
    const rarityItems = activeDb.filter(n => n.rarity === rarity);
    const allCaught = rarityItems.every(n => n.caught);
    rarityItems.forEach(n => n.caught = !allCaught);
    
    if (currentUserId && db) {
        saveCollectionToCloud();
    } else {
        const caughtIds = activeDb.filter(n => n.caught).map(n => n.id);
        localStorage.setItem(cfg.storageKey, JSON.stringify(caughtIds));
    }

    renderGrid();
    renderLocationTab();
}

// Initialize saved data before first render
loadSavedData();
initMapData();
initMapFilters();
applyGameUIState();
renderGrid();
renderLocationTab();
