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

// Ensure toggleCaught saves to cloud if logged in
function toggleCaught(id) {
    const nexo = nexomonDatabase.find(n => n.id === id);
    if (nexo) {
        nexo.caught = !nexo.caught;
        
        if (currentUserId && db) {
            saveCollectionToCloud();
        } else {
            const caughtIds = nexomonDatabase.filter(n => n.caught).map(n => n.id);
            localStorage.setItem('nexomon_collection_data', JSON.stringify(caughtIds));
        }
        
        renderGrid();
        renderLocationTab();
    }
}

async function saveCollectionToCloud() {
    if (!currentUserId || !db) return;
    const caughtIds = nexomonDatabase.filter(n => n.caught).map(n => n.id);
    try {
        await db.collection("users").doc(currentUserId).set({
            caughtNexomon: caughtIds,
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

const MAP_REGIONS = [
    { name: 'Parum', habitat: 'Grass', elements: ['Normal', 'Plant', 'Wind', 'Electric', 'Water', 'Fire'], rarities: ['Common', 'Uncommon', 'Rare'] },
    { name: 'Mountain Village', habitat: 'Cave', elements: ['Mineral', 'Wind', 'Normal', 'Fire'], rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare'] },
    { name: 'Ignitia', habitat: 'Volcano', elements: ['Fire', 'Mineral', 'Electric'], rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Special', 'Legendary'] },
    { name: "Khan's Jungle", habitat: 'Jungle', elements: ['Plant', 'Wind', 'Water', 'Normal'], rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare'] },
    { name: 'Hidden Village', habitat: 'Forest', elements: ['Plant', 'Electric', 'Wind', 'Normal'], rarities: ['Uncommon', 'Rare', 'Mega Rare', 'Special', 'Legendary'] },
    { name: "Hilda's Domain", habitat: 'Manor', elements: ['Normal', 'Electric', 'Wind', 'Plant'], rarities: ['Uncommon', 'Rare', 'Mega Rare', 'Special'] },
    { name: 'Phantom Citadel', habitat: 'Ruins', elements: ['Mineral', 'Electric', 'Fire', 'Wind', 'Normal'], rarities: ['Rare', 'Mega Rare', 'Special', 'Legendary'] },
    { name: 'Solus Desert', habitat: 'Desert', elements: ['Mineral', 'Fire', 'Normal', 'Electric'], rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Legendary'] },
    { name: 'Frozen Tundra', habitat: 'Snow', elements: ['Water', 'Wind', 'Mineral'], rarities: ['Uncommon', 'Rare', 'Mega Rare', 'Special', 'Legendary'] },
    { name: 'Nexolord Tower', habitat: 'Tower', elements: ['Electric', 'Fire', 'Mineral', 'Wind', 'Water', 'Plant', 'Normal'], rarities: ['Rare', 'Mega Rare', 'Special', 'Legendary'] },
    { name: 'Royalle City', habitat: 'Urban', elements: ['Normal', 'Electric', 'Water', 'Wind'], rarities: ['Common', 'Uncommon', 'Rare', 'Special'] },
    { name: 'Palmaya Beach', habitat: 'Beach', elements: ['Water', 'Wind', 'Plant', 'Normal'], rarities: ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Legendary'] }
];

let selectedMapRegion = '';
let mapSearchQuery = '';
let mapHabitatFilter = '';
let mapTypeFilter = '';
let mapRarityFilter = '';
let mapInitialized = false;

function initMapData() {
    nexomonDatabase.forEach((nexo, idx) => {
        if (nexo.regions && nexo.habitat) return;

        let candidates = MAP_REGIONS.filter(r =>
            r.elements.includes(nexo.element) && r.rarities.includes(nexo.rarity)
        );
        if (candidates.length === 0) {
            candidates = MAP_REGIONS.filter(r => r.elements.includes(nexo.element));
        }
        if (candidates.length === 0) {
            candidates = MAP_REGIONS;
        }

        const primary = candidates[idx % candidates.length];
        const secondary = candidates.length > 1 ? candidates[(idx + 3) % candidates.length] : null;
        const regions = secondary && secondary.name !== primary.name
            ? [primary.name, secondary.name]
            : [primary.name];

        nexo.regions = regions;
        nexo.location = primary.name;
        nexo.habitat = primary.habitat;
    });
}

function initMapFilters() {
    if (mapInitialized) return;
    mapInitialized = true;

    const regionSelect = document.getElementById('filter-region-dropdown');
    const habitatSelect = document.getElementById('filter-habitat-dropdown');
    const typeSelect = document.getElementById('filter-type-dropdown');
    const raritySelect = document.getElementById('filter-rarity-dropdown');
    const mapSearchInput = document.getElementById('map-search-input');

    if (regionSelect) {
        MAP_REGIONS.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.name;
            opt.textContent = r.name;
            regionSelect.appendChild(opt);
        });
        regionSelect.addEventListener('change', (e) => {
            selectArea(e.target.value, true);
        });
    }

    if (habitatSelect) {
        const habitats = [...new Set(MAP_REGIONS.map(r => r.habitat))];
        habitats.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h;
            opt.textContent = h;
            habitatSelect.appendChild(opt);
        });
        habitatSelect.addEventListener('change', (e) => {
            mapHabitatFilter = e.target.value;
            renderLocationTab();
        });
    }

    if (typeSelect) {
        const types = [...new Set(nexomonDatabase.map(n => n.element))];
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            typeSelect.appendChild(opt);
        });
        typeSelect.addEventListener('change', (e) => {
            mapTypeFilter = e.target.value;
            renderLocationTab();
        });
    }

    if (raritySelect) {
        const rarities = ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Special', 'Legendary'];
        rarities.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            raritySelect.appendChild(opt);
        });
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

    const speciesGrid = document.getElementById('region-species-grid');
    const countEl = document.getElementById('region-species-count');
    if (!speciesGrid) return;

    // Update left region progress counters
    const regionButtons = document.querySelectorAll('#region-list-container .region-btn');
    regionButtons.forEach(button => {
        const regionName = button.getAttribute('data-region');
        const progressSpan = button.querySelector('.region-progress');
        if (regionName && progressSpan) {
            const regionSpecies = nexomonDatabase.filter(n => n.regions && n.regions.includes(regionName));
            const caughtInRegion = regionSpecies.filter(n => n.caught).length;
            progressSpan.textContent = `${caughtInRegion}/${regionSpecies.length}`;
        }
    });

    const query = mapSearchQuery.trim().toLowerCase();
    const filtered = nexomonDatabase.filter(nexo => {
        const matchesRegion = !selectedMapRegion || (nexo.regions && nexo.regions.includes(selectedMapRegion));
        const matchesHabitat = !mapHabitatFilter || nexo.habitat === mapHabitatFilter;
        const matchesType = !mapTypeFilter || nexo.element === mapTypeFilter;
        const matchesRarity = !mapRarityFilter || nexo.rarity === mapRarityFilter;
        const matchesSearch = !query ||
            nexo.name.toLowerCase().includes(query) ||
            nexo.id.includes(query) ||
            (nexo.habitat && nexo.habitat.toLowerCase().includes(query)) ||
            (nexo.regions && nexo.regions.some(r => r.toLowerCase().includes(query)));

        return matchesRegion && matchesHabitat && matchesType && matchesRarity && matchesSearch;
    });

    const caughtCount = filtered.filter(n => n.caught).length;
    if (countEl) {
        countEl.textContent = `${filtered.length} Species • ${caughtCount} Caught`;
    }

    speciesGrid.innerHTML = '';

    if (filtered.length === 0) {
        speciesGrid.innerHTML = `
            <div class="col-span-2 text-center py-8 px-3 text-slate-400 text-xs">
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
                <p class="text-[10px] text-slate-400 truncate mb-1">${nexo.habitat || ''}</p>
                <div class="flex flex-nowrap items-center justify-center gap-1 w-full">
                    <span class="text-[9px] px-1 py-0.5 rounded border inline-flex items-center justify-center gap-0.5 whitespace-nowrap leading-tight ${elemConfig.bgStyle} ${elemConfig.textColor}">
                        <img src="${elemConfig.iconPath}" alt="${nexo.element}" class="w-2.5 h-2.5 object-contain shrink-0" onerror="this.style.display='none';">
                        <span>${nexo.element}</span>
                    </span>
                    <span class="text-[9px] px-1 py-0.5 rounded border inline-flex items-center justify-center whitespace-nowrap leading-tight ${getRarityBadgeStyle(nexo.rarity)}">${nexo.rarity}</span>
                </div>
            </div>
        `;
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
    const mapPins = document.querySelectorAll('#map-canvas .map-pin');
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
        case 'Legendary': return 'bg-amber-950 text-amber-300 border-amber-600 shadow-amber-500/10 shadow-lg';
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
        rarityLegendary: "Legendary"
    },
    ms: {
        collectionTitle: "PANGKALAN DATA KOLEKSI",
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
        rarityRare: "Nadir", // Or 'Nadir'
        rarityMegaRare: "Sangat Nadir",
        raritySpecial: "Istimewa",
        rarityLegendary: "Legenda"
    },
    zh: {
        collectionTitle: "收集数据库",
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
        rarityLegendary: "传说"
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
    if (document.getElementById('text-collection-title')) document.getElementById('text-collection-title').innerText = t.collectionTitle;
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
        { name: 'Legendary', key: 'legendary' }
    ];

    rarities.forEach(r => {
        const propName = `rarity${r.name.replace(' ', '')}`;
        const translatedText = t[propName] || r.name;

        // 1. Update filter pill text
        const pill = document.getElementById(`rarity-text-${r.key}`);
        if (pill) pill.innerText = translatedText;

        // 2. Update section header title text
        const sectionTitle = document.getElementById(`section-title-${r.key}`);
        if (sectionTitle) sectionTitle.innerText = translatedText;

        // 3. Update "Select All" button text
        const selectAllBtn = document.getElementById(`select-all-${r.key}`);
        if (selectAllBtn && t.selectAll) selectAllBtn.innerText = t.selectAll;
    });
}

// Render all rarity sections independently
function renderGrid() {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Mega Rare', 'Special', 'Legendary'];
    
    let totalItemsCount = nexomonDatabase.length;
    let totalCaughtCount = 0;

    rarities.forEach(rarity => {
        const rarityKey = rarity.toLowerCase().replace(' ', '-');
        const gridEl = document.getElementById(`grid-${rarityKey}`);
        const statsEl = document.getElementById(`section-stats-${rarityKey}`);
        
        if (!gridEl) return;
        gridEl.innerHTML = '';

        const rarityItems = nexomonDatabase.filter(n => n.rarity === rarity);
        
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
                    <img src="${nexo.image}" alt="${nexo.name}" class="w-full h-full object-contain drop-shadow-md" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
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
    const rarityKey = rarity.toLowerCase().replace(' ', '-');
    
    document.querySelectorAll('.rarity-pill').forEach(btn => {
        btn.classList.remove('ring-2', 'border-slate-100', 'border-emerald-400', 'border-blue-400', 'border-purple-400', 'border-pink-400', 'border-amber-400', 'bg-slate-800', 'text-white', 'shadow-lg');
    });
    
    const activeBtn = document.getElementById(`rarity-btn-${rarityKey}`);
    if (activeBtn) {
        let pillBorder = 'border-slate-100';
        if (rarity === 'Uncommon') pillBorder = 'border-emerald-400';
        if (rarity === 'Rare') pillBorder = 'border-blue-400';
        if (rarity === 'Mega Rare') pillBorder = 'border-purple-400';
        if (rarity === 'Special') pillBorder = 'border-pink-400';
        if (rarity === 'Legendary') pillBorder = 'border-amber-400';

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
    if (profileCountEl && profilePercentEl) {
        profileCountEl.innerText = `${caughtCount}`;
        profilePercentEl.innerText = `${percentage}%`;
    }
}

function toggleSelectAll(rarity) {
    const rarityItems = nexomonDatabase.filter(n => n.rarity === rarity);
    const allCaught = rarityItems.every(n => n.caught);
    rarityItems.forEach(n => n.caught = !allCaught);
    
    const caughtIds = nexomonDatabase.filter(n => n.caught).map(n => n.id);
    localStorage.setItem('nexomon_collection_data', JSON.stringify(caughtIds));

    renderGrid();
    renderLocationTab();
}

// Initialize saved data before first render
loadSavedData();
initMapData();
initMapFilters();
renderGrid();
renderLocationTab();
