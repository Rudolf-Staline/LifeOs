// ===================================================================
//  LIFEOS — Settings Module (Paramètres)
//  Manages app preferences, module visibility, and general configuration
// ===================================================================
const Settings = (() => {
    const SETTINGS_KEY = 'lifeos-settings-v1';
    const MODULES_KEY = 'lifeos-modules-enabled-v1';

    // ── All toggleable modules with metadata ──
    const ALL_MODULES = [
        // Finance
        { id: 'budget', label: 'Budget', icon: 'fas fa-bullseye', group: 'finance', core: false },
        { id: 'transactions', label: 'Transactions', icon: 'fas fa-exchange-alt', group: 'finance', core: false },
        { id: 'recurring', label: 'Récurrences', icon: 'fas fa-redo', group: 'finance', core: false },
        { id: 'categories', label: 'Catégories', icon: 'fas fa-tags', group: 'finance', core: false },
        { id: 'goals', label: 'Objectifs', icon: 'fas fa-flag-checkered', group: 'finance', core: false },
        { id: 'reports', label: 'Rapports', icon: 'fas fa-chart-bar', group: 'finance', core: false },
        { id: 'audit', label: 'Journal d\'audit', icon: 'fas fa-history', group: 'finance', core: false },
        // Bien-être
        { id: 'fitness', label: 'Fitness', icon: 'fas fa-dumbbell', group: 'wellbeing', core: false },
        { id: 'health', label: 'Santé', icon: 'fas fa-heartbeat', group: 'wellbeing', core: false },
        { id: 'sleep', label: 'Sommeil', icon: 'fas fa-moon', group: 'wellbeing', core: false },
        { id: 'habits', label: 'Habitudes', icon: 'fas fa-check-double', group: 'wellbeing', core: false },
        { id: 'medications', label: 'Médicaments', icon: 'fas fa-pills', group: 'wellbeing', core: false },
        // Productivité
        { id: 'notes', label: 'Notes', icon: 'fas fa-sticky-note', group: 'productivity', core: false },
        { id: 'ideas', label: 'Idées', icon: 'fas fa-lightbulb', group: 'productivity', core: false },
        { id: 'projects', label: 'Projets', icon: 'fas fa-project-diagram', group: 'productivity', core: false },
        { id: 'learning', label: 'Apprentissage', icon: 'fas fa-graduation-cap', group: 'productivity', core: false },
        { id: 'events', label: 'Événements', icon: 'fas fa-calendar-alt', group: 'productivity', core: false },
        // Loisirs
        { id: 'movies', label: 'Films & Séries', icon: 'fas fa-film', group: 'leisure', core: false },
        { id: 'music', label: 'Musique', icon: 'fas fa-music', group: 'leisure', core: false },
        { id: 'games', label: 'Jeux', icon: 'fas fa-gamepad', group: 'leisure', core: false },
        { id: 'travel', label: 'Voyages', icon: 'fas fa-globe-americas', group: 'leisure', core: false },
        { id: 'podcasts', label: 'Podcasts', icon: 'fas fa-podcast', group: 'leisure', core: false },
        { id: 'albums', label: 'Albums photo', icon: 'fas fa-images', group: 'leisure', core: false },
        { id: 'wine', label: 'Cave à vin', icon: 'fas fa-wine-bottle', group: 'leisure', core: false },
        // Maison
        { id: 'inventory', label: 'Inventaire', icon: 'fas fa-boxes', group: 'home', core: false },
        { id: 'recipes', label: 'Recettes', icon: 'fas fa-utensils', group: 'home', core: false },
        { id: 'plants', label: 'Plantes', icon: 'fas fa-seedling', group: 'home', core: false },
        { id: 'pets', label: 'Animaux', icon: 'fas fa-paw', group: 'home', core: false },
        { id: 'home', label: 'Maison', icon: 'fas fa-home', group: 'home', core: false },
        { id: 'cleaning', label: 'Ménage', icon: 'fas fa-broom', group: 'home', core: false },
        { id: 'wardrobe', label: 'Garde-robe', icon: 'fas fa-tshirt', group: 'home', core: false },
        { id: 'vehicles', label: 'Véhicules', icon: 'fas fa-car', group: 'home', core: false },
        // Social
        { id: 'contacts', label: 'Contacts', icon: 'fas fa-address-book', group: 'social', core: false },
        { id: 'gifts', label: 'Cadeaux', icon: 'fas fa-gift', group: 'social', core: false },
        { id: 'wishlist', label: 'Wishlist', icon: 'fas fa-star', group: 'social', core: false },
        { id: 'books', label: 'Bibliothèque', icon: 'fas fa-book', group: 'social', core: false },
        { id: 'collections', label: 'Collections', icon: 'fas fa-palette', group: 'social', core: false },
        { id: 'packages', label: 'Colis', icon: 'fas fa-box', group: 'social', core: false },
        { id: 'subscriptions', label: 'Abonnements', icon: 'fas fa-newspaper', group: 'social', core: false },
        { id: 'documents', label: 'Documents', icon: 'fas fa-file-alt', group: 'social', core: false },
        // Trading
        { id: 'trades', label: 'Journal de Trading', icon: 'fas fa-chart-line', group: 'trading', core: false },
        { id: 'portfolio', label: 'Portefeuille', icon: 'fas fa-briefcase', group: 'trading', core: false },
        { id: 'trading-watchlist', label: 'Surveillance', icon: 'fas fa-binoculars', group: 'trading', core: false },
        // Sécurité
        { id: 'passwords', label: 'Mots de passe', icon: 'fas fa-lock', group: 'security', core: false },
        // Spiritualité
        { id: 'spiritual', label: 'Vie Spirituelle', icon: 'fas fa-dove', group: 'spiritual', core: false },
        { id: 'bible', label: 'Bible', icon: 'fas fa-bible', group: 'spiritual', core: false },
        { id: 'prayer', label: 'Journal de prière', icon: 'fas fa-pray', group: 'spiritual', core: false },
        { id: 'gratitude', label: 'Gratitude', icon: 'fas fa-heart', group: 'spiritual', core: false },
    ];

    const GROUP_LABELS = {
        finance: { label: 'Finance', color: '#2563EB', icon: 'fas fa-coins' },
        wellbeing: { label: 'Bien-être', color: '#06B6D4', icon: 'fas fa-heartbeat' },
        productivity: { label: 'Productivité', color: '#A78BFA', icon: 'fas fa-rocket' },
        leisure: { label: 'Loisirs', color: '#F59E0B', icon: 'fas fa-film' },
        home: { label: 'Maison & Vie', color: '#F97316', icon: 'fas fa-home' },
        social: { label: 'Social & Collections', color: '#EC4899', icon: 'fas fa-users' },
        trading: { label: 'Trading', color: '#10B981', icon: 'fas fa-chart-line' },
        security: { label: 'Sécurité', color: '#F43F5E', icon: 'fas fa-shield-alt' },
        spiritual: { label: 'Vie Spirituelle', color: '#A78BFA', icon: 'fas fa-dove' }
    };

    // ── Load / Save ──
    function getEnabledModules() {
        try {
            const saved = localStorage.getItem(MODULES_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        // Default: all enabled
        const defaults = {};
        ALL_MODULES.forEach(m => { defaults[m.id] = true; });
        return defaults;
    }

    function saveEnabledModules(modules) {
        localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
    }

    function isModuleEnabled(moduleId) {
        const modules = getEnabledModules();
        return modules[moduleId] !== false;
    }

    function setModuleEnabled(moduleId, enabled) {
        const modules = getEnabledModules();
        modules[moduleId] = enabled;
        saveEnabledModules(modules);
    }

    function getSettings() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
            currency: 'MAD',
            language: 'fr',
            dateFormat: 'dd/mm/yyyy',
            dashboardCompact: false,
            showModuleLauncher: true,
            confirmDelete: true,
            autoBackup: false
        };
    }

    function saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }

    // ── Apply module visibility to sidebar & dashboard ──
    function applyModuleVisibility() {
        const modules = getEnabledModules();

        // Hide/show nav items in sidebar using CSS class
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            const viewId = item.dataset.view;
            // Don't touch dashboard or settings
            if (viewId === 'dashboard' || viewId === 'settings') return;
            item.classList.toggle('module-hidden', modules[viewId] === false);
        });

        // Update group counts & hide empty groups
        document.querySelectorAll('.nav-group[data-group]').forEach(group => {
            const visibleItems = group.querySelectorAll('.nav-item[data-view]:not(.module-hidden)');
            const countEl = group.querySelector('.nav-group-count');
            if (countEl) countEl.textContent = visibleItems.length;
            group.classList.toggle('module-hidden', visibleItems.length === 0);
        });

        // Hide module launcher buttons
        document.querySelectorAll('.lm-module-btn[onclick]').forEach(btn => {
            const match = btn.getAttribute('onclick').match(/navigateTo\('([^']+)'\)/);
            if (match) {
                const modId = match[1];
                btn.classList.toggle('module-hidden', modules[modId] === false);
            }
        });
    }

    // ── Render settings page ──
    function renderSettings() {
        const container = document.getElementById('settings-content');
        if (!container) return;

        const settings = getSettings();
        const modules = getEnabledModules();

        // Count enabled
        const enabledCount = ALL_MODULES.filter(m => modules[m.id] !== false).length;
        const totalCount = ALL_MODULES.length;

        // Group modules
        const groups = {};
        ALL_MODULES.forEach(m => {
            if (!groups[m.group]) groups[m.group] = [];
            groups[m.group].push(m);
        });

        container.innerHTML = `
            <!-- General Settings -->
            <div class="settings-section">
                <div class="settings-section-header">
                    <i class="fas fa-sliders-h"></i>
                    <h3>Paramètres généraux</h3>
                </div>
                <div class="settings-grid">
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <label>Devise</label>
                            <span class="settings-item-desc">Devise utilisée pour les montants</span>
                        </div>
                        <select id="setting-currency" class="settings-select">
                            <option value="MAD" ${settings.currency === 'MAD' ? 'selected' : ''}>MAD — Dirham marocain</option>
                            <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR — Euro</option>
                            <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD — Dollar US</option>
                            <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>GBP — Livre sterling</option>
                            <option value="CAD" ${settings.currency === 'CAD' ? 'selected' : ''}>CAD — Dollar canadien</option>
                            <option value="CHF" ${settings.currency === 'CHF' ? 'selected' : ''}>CHF — Franc suisse</option>
                            <option value="TND" ${settings.currency === 'TND' ? 'selected' : ''}>TND — Dinar tunisien</option>
                            <option value="DZD" ${settings.currency === 'DZD' ? 'selected' : ''}>DZD — Dinar algérien</option>
                            <option value="XOF" ${settings.currency === 'XOF' ? 'selected' : ''}>XOF — Franc CFA</option>
                        </select>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <label>Format de date</label>
                            <span class="settings-item-desc">Format d'affichage des dates</span>
                        </div>
                        <select id="setting-dateformat" class="settings-select">
                            <option value="dd/mm/yyyy" ${settings.dateFormat === 'dd/mm/yyyy' ? 'selected' : ''}>JJ/MM/AAAA</option>
                            <option value="mm/dd/yyyy" ${settings.dateFormat === 'mm/dd/yyyy' ? 'selected' : ''}>MM/JJ/AAAA</option>
                            <option value="yyyy-mm-dd" ${settings.dateFormat === 'yyyy-mm-dd' ? 'selected' : ''}>AAAA-MM-JJ</option>
                        </select>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <label>Confirmer les suppressions</label>
                            <span class="settings-item-desc">Afficher une confirmation avant chaque suppression</span>
                        </div>
                        <label class="settings-toggle">
                            <input type="checkbox" id="setting-confirm-delete" ${settings.confirmDelete ? 'checked' : ''}>
                            <span class="settings-toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <label>Grille des modules (dashboard)</label>
                            <span class="settings-item-desc">Afficher l'accès rapide aux modules sur le tableau de bord</span>
                        </div>
                        <label class="settings-toggle">
                            <input type="checkbox" id="setting-show-launcher" ${settings.showModuleLauncher !== false ? 'checked' : ''}>
                            <span class="settings-toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Module Management -->
            <div class="settings-section">
                <div class="settings-section-header">
                    <i class="fas fa-puzzle-piece"></i>
                    <h3>Gestion des modules</h3>
                    <span class="settings-module-counter">${enabledCount}/${totalCount} actifs</span>
                </div>
                <p class="settings-module-desc">
                    Désactivez les modules que vous n'utilisez pas pour simplifier votre interface.
                    Les données des modules désactivés sont conservées.
                </p>
                <div class="settings-module-actions">
                    <button class="btn btn-sm btn-outline" id="settings-enable-all">
                        <i class="fas fa-check-double"></i> Tout activer
                    </button>
                    <button class="btn btn-sm btn-outline" id="settings-disable-all">
                        <i class="fas fa-times"></i> Tout désactiver
                    </button>
                </div>
                <div class="settings-modules-list">
                    ${Object.keys(groups).map(groupId => {
                        const grp = GROUP_LABELS[groupId] || { label: groupId, color: '#888', icon: 'fas fa-folder' };
                        const mods = groups[groupId];
                        const enabledInGroup = mods.filter(m => modules[m.id] !== false).length;
                        return `
                            <div class="settings-module-group">
                                <div class="settings-module-group-header" style="--group-color: ${grp.color}">
                                    <i class="${grp.icon}"></i>
                                    <span>${grp.label}</span>
                                    <span class="settings-group-count">${enabledInGroup}/${mods.length}</span>
                                    <button class="settings-group-toggle-btn" data-group="${groupId}" title="Basculer le groupe">
                                        <i class="fas ${enabledInGroup === mods.length ? 'fa-toggle-on' : enabledInGroup === 0 ? 'fa-toggle-off' : 'fa-minus-circle'}"></i>
                                    </button>
                                </div>
                                <div class="settings-module-group-items">
                                    ${mods.map(m => `
                                        <div class="settings-module-item ${modules[m.id] === false ? 'disabled' : ''}">
                                            <div class="settings-module-item-icon" style="color: ${grp.color}">
                                                <i class="${m.icon}"></i>
                                            </div>
                                            <span class="settings-module-item-label">${m.label}</span>
                                            <label class="settings-toggle settings-toggle-sm">
                                                <input type="checkbox" data-module-id="${m.id}" ${modules[m.id] !== false ? 'checked' : ''}>
                                                <span class="settings-toggle-slider"></span>
                                            </label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Data Management -->
            <div class="settings-section">
                <div class="settings-section-header">
                    <i class="fas fa-database"></i>
                    <h3>Données & stockage</h3>
                </div>
                <div class="settings-grid">
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <label>Stockage local utilisé</label>
                            <span class="settings-item-desc" id="settings-storage-size">Calcul en cours...</span>
                        </div>
                        <button class="btn btn-sm btn-outline" id="settings-calc-storage">
                            <i class="fas fa-sync"></i> Actualiser
                        </button>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <label>Réinitialiser les paramètres</label>
                            <span class="settings-item-desc">Remettre tous les réglages par défaut</span>
                        </div>
                        <button class="btn btn-sm btn-danger-outline" id="settings-reset">
                            <i class="fas fa-undo"></i> Réinitialiser
                        </button>
                    </div>
                </div>
            </div>

            <!-- About -->
            <div class="settings-section settings-about">
                <div class="settings-about-inner">
                    <div class="settings-about-logo"><i class="fas fa-infinity"></i></div>
                    <h3>Life<strong>OS</strong></h3>
                    <p>Votre système d'exploitation de vie</p>
                    <span class="settings-version">Version 2.0</span>
                </div>
            </div>
        `;

        // Calculate storage
        calcStorageSize();

        // Bind events
        bindSettingsEvents();
    }

    function calcStorageSize() {
        const el = document.getElementById('settings-storage-size');
        if (!el) return;
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length + key.length) * 2; // UTF-16
            }
        }
        const kb = (total / 1024).toFixed(1);
        const mb = (total / (1024 * 1024)).toFixed(2);
        el.textContent = total > 1048576 ? `${mb} Mo utilisés` : `${kb} Ko utilisés`;
    }

    function bindSettingsEvents() {
        // Module toggles
        document.querySelectorAll('[data-module-id]').forEach(cb => {
            cb.addEventListener('change', () => {
                setModuleEnabled(cb.dataset.moduleId, cb.checked);
                applyModuleVisibility();
                // Update counter
                const modules = getEnabledModules();
                const enabledCount = ALL_MODULES.filter(m => modules[m.id] !== false).length;
                const counterEl = document.querySelector('.settings-module-counter');
                if (counterEl) counterEl.textContent = `${enabledCount}/${ALL_MODULES.length} actifs`;
                // Update parent group counter and icon
                const item = cb.closest('.settings-module-item');
                if (item) item.classList.toggle('disabled', !cb.checked);
                const group = cb.closest('.settings-module-group');
                if (group) updateGroupCounter(group);
            });
        });

        // Group toggle buttons
        document.querySelectorAll('.settings-group-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const groupId = btn.dataset.group;
                const mods = ALL_MODULES.filter(m => m.group === groupId);
                const modules = getEnabledModules();
                const allEnabled = mods.every(m => modules[m.id] !== false);
                const newState = !allEnabled;
                mods.forEach(m => { modules[m.id] = newState; });
                saveEnabledModules(modules);
                applyModuleVisibility();
                renderSettings();
            });
        });

        // Enable all
        const enableAllBtn = document.getElementById('settings-enable-all');
        if (enableAllBtn) enableAllBtn.addEventListener('click', () => {
            const modules = getEnabledModules();
            ALL_MODULES.forEach(m => { modules[m.id] = true; });
            saveEnabledModules(modules);
            applyModuleVisibility();
            renderSettings();
        });

        // Disable all
        const disableAllBtn = document.getElementById('settings-disable-all');
        if (disableAllBtn) disableAllBtn.addEventListener('click', () => {
            const modules = getEnabledModules();
            ALL_MODULES.forEach(m => { modules[m.id] = false; });
            saveEnabledModules(modules);
            applyModuleVisibility();
            renderSettings();
        });

        // General settings changes
        const currencySel = document.getElementById('setting-currency');
        if (currencySel) currencySel.addEventListener('change', () => {
            const s = getSettings();
            s.currency = currencySel.value;
            saveSettings(s);
        });

        const dateFmtSel = document.getElementById('setting-dateformat');
        if (dateFmtSel) dateFmtSel.addEventListener('change', () => {
            const s = getSettings();
            s.dateFormat = dateFmtSel.value;
            saveSettings(s);
        });

        const confirmDelCb = document.getElementById('setting-confirm-delete');
        if (confirmDelCb) confirmDelCb.addEventListener('change', () => {
            const s = getSettings();
            s.confirmDelete = confirmDelCb.checked;
            saveSettings(s);
        });

        const showLauncherCb = document.getElementById('setting-show-launcher');
        if (showLauncherCb) showLauncherCb.addEventListener('change', () => {
            const s = getSettings();
            s.showModuleLauncher = showLauncherCb.checked;
            saveSettings(s);
            // Hide/show launcher on dashboard
            const launcher = document.querySelector('.lm-launcher-card');
            if (launcher) launcher.style.display = showLauncherCb.checked ? '' : 'none';
        });

        // Calc storage
        const calcBtn = document.getElementById('settings-calc-storage');
        if (calcBtn) calcBtn.addEventListener('click', calcStorageSize);

        // Reset settings
        const resetBtn = document.getElementById('settings-reset');
        if (resetBtn) resetBtn.addEventListener('click', () => {
            if (confirm('Réinitialiser tous les paramètres par défaut ? Les données ne seront pas supprimées.')) {
                localStorage.removeItem(SETTINGS_KEY);
                localStorage.removeItem(MODULES_KEY);
                applyModuleVisibility();
                renderSettings();
                if (typeof App !== 'undefined' && App.toast) App.toast('Paramètres réinitialisés', 'success');
            }
        });
    }

    function updateGroupCounter(groupEl) {
        const checkboxes = groupEl.querySelectorAll('[data-module-id]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const countEl = groupEl.querySelector('.settings-group-count');
        if (countEl) countEl.textContent = `${checkedCount}/${total}`;
        const iconEl = groupEl.querySelector('.settings-group-toggle-btn i');
        if (iconEl) {
            iconEl.className = `fas ${checkedCount === total ? 'fa-toggle-on' : checkedCount === 0 ? 'fa-toggle-off' : 'fa-minus-circle'}`;
        }
    }

    // Public API
    return {
        ALL_MODULES,
        GROUP_LABELS,
        getEnabledModules,
        saveEnabledModules,
        isModuleEnabled,
        setModuleEnabled,
        getSettings,
        saveSettings,
        renderSettings,
        applyModuleVisibility,
        calcStorageSize
    };
})();
