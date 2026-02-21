/* ===================================================================
   app.js — Main Application Logic (Async / Supabase / Auth)
   Devise : MAD (Dirham Marocain)
   =================================================================== */

// Global init function called by Auth after login
async function AppInit() {
    await App.init();
    // Initialize account settings (avatar, profile modal)
    if (typeof AccountSettings !== 'undefined') {
        AccountSettings.init();
    }
}

const App = (() => {
    // -------- State --------
    let currentView = 'dashboard';
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let transactionSort = { field: 'date', dir: 'desc' };
    let transactionPage = 1;
    const TX_PER_PAGE = 15;
    let auditPage = 1;
    const AUDIT_PER_PAGE = 20;
    let confirmCallback = null;
    let clockTimer = null;
    let commandIndex = 0;
    let commandResults = [];
    let uiEnhancementsBound = false;

    const TX_DRAFT_KEY = 'lifeos-tx-draft-v1';
    const STYLE_LAB_KEY = 'lifeos-style-lab-v1';
    const TOUR_SEEN_KEY = 'lifeos-tour-seen-v1';

    // -------- Init --------
    async function init() {
        bindNavigation();
        bindMonthSelector();
        bindModals();
        bindTransactionForm();
        bindBudgetForm();
        bindCategoryForm();
        bindRecurringForm();
        bindGoalForm();
        bindInventoryForm();
        bindBookForm();
        bindFitnessForm();
        bindRecipeForm();
        bindNoteForm();
        bindHabitForm();
        bindContactForm();
        bindMovieForm();
        bindTripForm();
        bindPlantForm();
        bindMusicForm();
        bindVehicleForm();
        bindHealthForm();
        bindEventForm();
        bindPetForm();
        bindCourseForm();
        bindSleepForm();
        bindHomeTaskForm();
        bindGameForm();
        bindWardrobeForm();
        bindPackageForm();
        bindIdeaForm();
        bindProjectForm();
        bindPasswordForm();
        bindSubscriptionForm();
        bindGiftForm();
        bindWineForm();
        bindPodcastForm();
        bindCleaningForm();
        bindAlbumForm();
        bindMedicationForm();
        bindWishlistForm();
        bindDocumentForm();
        bindCollectionForm();
        bindTradeForm();
        bindPositionForm();
        bindTWatchlistForm();
        bindFilters();
        bindExportImport();
        bindMisc();
        bindEnhancements();

        // Init notification service
        if (typeof Notifications !== 'undefined' && Notifications.init) {
            Notifications.init();
        }

        // Show user info in sidebar
        const user = Auth.getUser();
        if (user) {
            const nameEl = document.getElementById('sidebar-user-name');
            if (nameEl) {
                nameEl.textContent = user.user_metadata?.full_name || user.email || 'Utilisateur';
            }
        }

        // Logout button
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await Auth.logout();
            });
        }

        // Process recurring transactions
        try {
            const generated = await Store.Recurring.processRecurring();
            if (generated > 0) {
                toast(`${generated} transaction(s) récurrente(s) générée(s)`, 'success');
            }
        } catch (e) {
            console.error('Error processing recurring:', e);
        }

        // Initialize inventory storage
        if (typeof Inventory !== 'undefined') {
            await Inventory.initStorage();
        }

        // Initialize books storage
        if (typeof Books !== 'undefined') {
            await Books.initStorage();
        }

        // Initialize fitness storage
        if (typeof Fitness !== 'undefined') {
            await Fitness.initStorage();
        }

        // Initialize recipes storage
        if (typeof Recipes !== 'undefined') {
            await Recipes.initStorage();
        }

        // Initialize notes storage
        if (typeof Notes !== 'undefined') {
            await Notes.initStorage();
        }

        // Initialize habits storage
        if (typeof Habits !== 'undefined') {
            await Habits.initStorage();
        }

        // Initialize contacts storage
        if (typeof Contacts !== 'undefined') {
            await Contacts.initStorage();
        }

        // Initialize movies storage
        if (typeof Movies !== 'undefined') {
            await Movies.initStorage();
        }

        // Initialize travel storage
        if (typeof Travel !== 'undefined') {
            await Travel.initStorage();
        }

        // Initialize plants storage
        if (typeof Plants !== 'undefined') {
            await Plants.initStorage();
        }

        // Initialize music storage
        if (typeof Music !== 'undefined') {
            await Music.initStorage();
        }

        // Initialize vehicles storage
        if (typeof Vehicles !== 'undefined') {
            await Vehicles.initStorage();
        }

        // Initialize health storage
        if (typeof Health !== 'undefined') {
            await Health.initStorage();
        }

        // Initialize events storage
        if (typeof Events !== 'undefined') {
            await Events.initStorage();
        }

        // Initialize pets storage
        if (typeof Pets !== 'undefined') {
            await Pets.initStorage();
        }

        // Initialize learning storage
        if (typeof Learning !== 'undefined') {
            await Learning.initStorage();
        }

        // Initialize sleep storage
        if (typeof Sleep !== 'undefined') {
            await Sleep.initStorage();
        }

        // Initialize home storage
        if (typeof Home !== 'undefined') {
            await Home.initStorage();
        }

        // Initialize games storage
        if (typeof Games !== 'undefined') {
            await Games.initStorage();
        }

        // Initialize wardrobe storage
        if (typeof Wardrobe !== 'undefined') {
            await Wardrobe.initStorage();
        }

        // Initialize packages storage
        if (typeof Packages !== 'undefined') {
            await Packages.initStorage();
        }

        // Initialize ideas storage
        if (typeof Ideas !== 'undefined') {
            await Ideas.initStorage();
        }

        // Initialize projects storage
        if (typeof Projects !== 'undefined') {
            await Projects.initStorage();
        }

        // Initialize passwords storage
        if (typeof Passwords !== 'undefined') {
            await Passwords.initStorage();
        }

        // Initialize subscriptions storage
        if (typeof Subscriptions !== 'undefined') {
            await Subscriptions.initStorage();
        }

        // Initialize gifts storage
        if (typeof Gifts !== 'undefined') {
            await Gifts.initStorage();
        }

        // Initialize wine storage
        if (typeof Wine !== 'undefined') {
            await Wine.initStorage();
        }

        // Initialize podcasts storage
        if (typeof Podcasts !== 'undefined') {
            await Podcasts.initStorage();
        }

        // Initialize cleaning storage
        if (typeof Cleaning !== 'undefined') {
            await Cleaning.initStorage();
        }

        // Initialize albums storage
        if (typeof Albums !== 'undefined') {
            await Albums.initStorage();
        }

        // Initialize medications storage
        if (typeof Medications !== 'undefined') {
            await Medications.initStorage();
        }

        // Initialize wishlist storage
        if (typeof Wishlist !== 'undefined') {
            await Wishlist.initStorage();
        }

        // Initialize documents storage
        if (typeof Documents !== 'undefined') {
            await Documents.initStorage();
        }

        // Initialize collections storage
        if (typeof Collections !== 'undefined') {
            await Collections.initStorage();
        }

        // Initialize trades storage
        if (typeof Trades !== 'undefined') {
            await Trades.initStorage();
        }

        // Initialize portfolio storage
        if (typeof Portfolio !== 'undefined') {
            await Portfolio.initStorage();
        }

        // Initialize trading watchlist storage
        if (typeof TradingWatchlist !== 'undefined') {
            await TradingWatchlist.initStorage();
        }

        // Apply module visibility from settings
        if (typeof Settings !== 'undefined') {
            Settings.applyModuleVisibility();
        }

        // Apply module launcher visibility from settings
        if (typeof Settings !== 'undefined') {
            const s = Settings.getSettings();
            const launcher = document.querySelector('.lm-launcher-card');
            if (launcher && s.showModuleLauncher === false) launcher.style.display = 'none';
        }

        updateMonthLabel();
        await navigateTo('dashboard');

        // Initialize theme system (particles, scroll animations, micro-interactions)
        if (typeof Theme !== 'undefined') {
            Theme.init();
        }
    }

    // ===== NAVIGATION =====
    function bindNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                navigateTo(item.dataset.view);
            });
        });

        // Pin sidebar button (icons-only ↔ expanded)
        bindSidebarPin();

        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobile-overlay');
            sidebar.classList.toggle('mobile-open');
            if (overlay) overlay.classList.toggle('active', sidebar.classList.contains('mobile-open'));
        });

        // Mobile overlay tap to close sidebar
        const mobileOv = document.getElementById('mobile-overlay');
        if (mobileOv) {
            mobileOv.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('mobile-open');
                mobileOv.classList.remove('active');
            });
        }

        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const btn = document.getElementById('mobile-menu-btn');
            const overlay = document.getElementById('mobile-overlay');
            if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
                if (overlay) overlay.classList.remove('active');
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.dataset.nav) {
                e.preventDefault();
                navigateTo(e.target.dataset.nav);
            }
        });

        // ===== SIDEBAR GROUPS — collapsible =====
        bindSidebarGroups();

        // ===== SIDEBAR SEARCH =====
        bindSidebarSearch();

        // ===== DASHBOARD QUICK ACTIONS =====
        bindQuickActions();
    }

    function bindSidebarPin() {
        const sidebar = document.getElementById('sidebar');
        const pinBtn = document.getElementById('btn-pin-sidebar');
        let pinned = localStorage.getItem('lifeos-sidebar-pinned') === '1';
        if (pinned) {
            sidebar.classList.add('pinned');
            if (pinBtn) pinBtn.title = 'Détacher la sidebar';
        }
        if (!pinBtn) return;
        pinBtn.addEventListener('click', () => {
            pinned = !pinned;
            sidebar.classList.toggle('pinned', pinned);
            localStorage.setItem('lifeos-sidebar-pinned', pinned ? '1' : '0');
            pinBtn.title = pinned ? 'Détacher la sidebar' : 'Épingler la sidebar';
        });
    }

    function bindSidebarGroups() {
        const GROUPS_KEY = 'lifeos-sidebar-groups-v1';
        let savedStates = {};
        try { savedStates = JSON.parse(localStorage.getItem(GROUPS_KEY) || '{}'); } catch(e) {}

        document.querySelectorAll('.nav-group').forEach(group => {
            const groupId = group.dataset.group;

            // Restore persisted state (only if we have a saved preference)
            if (savedStates[groupId] === true) {
                group.classList.add('collapsed');
            } else if (savedStates[groupId] === false) {
                group.classList.remove('collapsed');
            }

            const header = group.querySelector('.nav-group-header');
            if (!header) return;

            header.addEventListener('click', () => {
                const isCollapsed = group.classList.toggle('collapsed');
                savedStates[groupId] = isCollapsed;
                try { localStorage.setItem(GROUPS_KEY, JSON.stringify(savedStates)); } catch(e) {}
            });
        });
    }

    function bindSidebarSearch() {
        const input = document.getElementById('sidebar-search-input');
        if (!input) return;

        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();
            const allGroups = document.querySelectorAll('.nav-group');

            if (!query) {
                // Reset search — show everything, restore collapsed state
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('search-hidden'));
                allGroups.forEach(g => g.classList.remove('all-hidden'));
                return;
            }

            // Expand all groups during search
            allGroups.forEach(g => {
                g.classList.remove('collapsed');
                let hasVisible = false;
                g.querySelectorAll('.nav-item').forEach(item => {
                    const label = item.querySelector('span')?.textContent?.toLowerCase() || '';
                    const view = item.dataset.view || '';
                    const visible = label.includes(query) || view.includes(query);
                    item.classList.toggle('search-hidden', !visible);
                    if (visible) hasVisible = true;
                });
                g.classList.toggle('all-hidden', !hasVisible);
            });
        });
    }

    function bindQuickActions() {
        const qaIncome = document.getElementById('qa-add-income');
        if (qaIncome) qaIncome.addEventListener('click', async () => {
            await openTransactionModal(null);
            // Pre-select income
            document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
            const incomeOpt = document.querySelector('.toggle-option[data-value="income"]');
            if (incomeOpt) incomeOpt.classList.add('active');
            const incomeInput = document.querySelector('input[name="transaction-type"][value="income"]');
            if (incomeInput) incomeInput.checked = true;
            await populateCategorySelect('transaction-category', 'income');
        });
        const qaExpense = document.getElementById('qa-add-expense');
        if (qaExpense) qaExpense.addEventListener('click', () => openTransactionModal(null));
    }

    async function navigateTo(view) {
        currentView = view;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Auto-expand the sidebar group containing this view
        const activeNavItem = document.querySelector(`.nav-item[data-view="${view}"]`);
        if (activeNavItem) {
            const parentGroup = activeNavItem.closest('.nav-group');
            if (parentGroup && parentGroup.classList.contains('collapsed')) {
                parentGroup.classList.remove('collapsed');
            }
        }

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const viewEl = document.getElementById(`view-${view}`);
        if (viewEl) viewEl.classList.add('active');

        // Retour en haut lors de chaque navigation
        const mc = document.getElementById('main-content');
        if (mc) mc.scrollTop = 0;

        const titles = {
            dashboard: 'Tableau de bord',
            budget: 'Budget',
            transactions: 'Transactions',
            recurring: 'Récurrences',
            categories: 'Catégories',
            goals: 'Objectifs',
            inventory: 'Inventaire & Stock',
            books: 'Bibliothèque & Lecture',
            fitness: 'Fitness & Santé',
            recipes: 'Recettes & Cuisine',
            notes: 'Journal & Notes',
            habits: 'Habitudes & Suivi',
            contacts: 'Carnet d\'Adresses',
            movies: 'Films & S\u00e9ries',
            travel: 'Voyages & Destinations',
            plants: 'Plantes d\'Int\u00e9rieur',
            music: 'Musique & Playlists',
            vehicles: 'V\u00e9hicules & Entretien',
            health: 'Sant\u00e9 & M\u00e9dical',
            events: '\u00c9v\u00e9nements & Planning',
            pets: 'Animaux de Compagnie',
            learning: 'Apprentissage & Formation',
            sleep: 'Sommeil & Repos',
            home: 'Maison & Entretien',
            games: 'Jeux Vid\u00e9o',
            wardrobe: 'Garde-robe',
            packages: 'Colis & Livraisons',
            ideas: 'Id\u00e9es & Brainstorming',
            projects: 'Projets',
            passwords: 'Mots de passe',
            subscriptions: 'Abonnements',
            gifts: 'Cadeaux',
            wine: 'Cave à vin',
            podcasts: 'Podcasts',
            cleaning: 'Ménage',
            albums: 'Albums photo',
            medications: 'Médicaments',
            wishlist: 'Wishlist',
            documents: 'Documents',
            collections: 'Collections',
            reports: 'Rapports & Analyses',
            audit: 'Journal d\'audit',
            spiritual: 'Vie Spirituelle',
            bible: 'Bible',
            prayer: 'Journal de Prière',
            gratitude: 'Journal de Gratitude',
            settings: 'Paramètres'
        };
        const subtitles = {
            dashboard: 'Vue d\'ensemble',
            budget: 'Planification mensuelle',
            transactions: 'Historique détaillé',
            recurring: 'Paiements automatiques',
            categories: 'Organisation',
            goals: 'Épargne & projets',
            inventory: 'Gestion des ressources',
            books: 'Vos livres & progression',
            fitness: 'Entraînements & performances',
            recipes: 'Votre collection culinaire',
            notes: 'Pensées & réflexions',
            habits: 'Routines & séries',
            contacts: 'Vos proches & réseau',
            movies: 'Votre cinémathèque',
            travel: 'Explorez le monde',
            plants: 'Votre jardin intérieur',
            music: 'Vos morceaux & playlists',
            vehicles: 'Gestion de vos véhicules',
            health: 'Suivi médical & bien-être',
            events: 'Planifiez vos moments',
            pets: 'Vos compagnons',
            learning: 'Développez vos compétences',
            sleep: 'Analysez votre repos',
            home: 'Gérez votre maison',
            games: 'Votre collection gaming',
            wardrobe: 'Organisez vos vêtements',
            packages: 'Suivez vos livraisons',
            ideas: 'Capturez l\'inspiration',
            projects: 'Gérez vos projets',
            passwords: 'Coffre-fort numérique',
            subscriptions: 'Gérez vos abonnements',
            gifts: 'Offrez & recevez',
            wine: 'Votre cave personnelle',
            podcasts: 'Vos podcasts favoris',
            cleaning: 'Planifiez le ménage',
            albums: 'Vos souvenirs en images',
            medications: 'Suivi de traitements',
            wishlist: 'Vos envies & souhaits',
            documents: 'Vos documents importants',
            collections: 'Vos trésors de collection',
            reports: 'Statistiques avancées',
            audit: 'Traçabilité',
            spiritual: 'Tableau de bord spirituel',
            bible: 'Louis Segond 1910 — 66 livres',
            prayer: 'Intercession, louange & gratitude',
            gratitude: 'Pratiquez la reconnaissance quotidienne',
            settings: 'Configuration de votre LifeOS'
        };
        // Breadcrumb update
        const bcGroup = document.getElementById('breadcrumb-group');
        const bcPage  = document.getElementById('breadcrumb-page');
        const bcSep2  = document.getElementById('breadcrumb-sep2');
        if (bcGroup || bcPage) {
            const activeItem = document.querySelector(`.nav-item[data-view="${view}"]`);
            const groupEl = activeItem?.closest('.nav-group')?.querySelector('.nav-group-label');
            const sectionLabel = groupEl?.textContent?.trim() || '';
            const pageLabel = titles[view] || view;
            if (bcGroup) bcGroup.textContent = sectionLabel;
            if (bcPage)  bcPage.textContent = pageLabel;
            if (bcSep2)  bcSep2.style.display = sectionLabel ? '' : 'none';
        }
        // Legacy title elements (hidden via CSS but kept for JS compat)
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = titles[view] || '';
        const subtitleEl = document.getElementById('topbar-subtitle');
        if (subtitleEl) subtitleEl.textContent = subtitles[view] || '';

        await renderView(view);

        document.getElementById('sidebar').classList.remove('mobile-open');
        const mobileOverlay = document.getElementById('mobile-overlay');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
    }

    async function renderView(view) {
        switch (view) {
            case 'dashboard': await renderDashboard(); break;
            case 'budget': await renderBudget(); break;
            case 'transactions': await renderTransactions(); break;
            case 'recurring': await renderRecurring(); break;
            case 'categories': await renderCategories(); break;
            case 'goals': await renderGoals(); break;
            case 'inventory': await renderInventory(); break;
            case 'books': await renderBooks(); break;
            case 'fitness': await renderFitness(); break;
            case 'recipes': await renderRecipes(); break;
            case 'notes': await renderNotes(); break;
            case 'habits': await renderHabits(); break;
            case 'contacts': await renderContacts(); break;
            case 'movies': await renderMovies(); break;
            case 'travel': await renderTravel(); break;
            case 'plants': await renderPlants(); break;
            case 'music': await renderMusic(); break;
            case 'vehicles': await renderVehicles(); break;
            case 'health': await renderHealth(); break;
            case 'events': await renderEvents(); break;
            case 'pets': await renderPets(); break;
            case 'learning': await renderLearning(); break;
            case 'sleep': await renderSleep(); break;
            case 'home': await renderHome(); break;
            case 'games': await renderGames(); break;
            case 'wardrobe': await renderWardrobe(); break;
            case 'packages': await renderPackages(); break;
            case 'ideas': await renderIdeas(); break;
            case 'projects': await renderProjects(); break;
            case 'passwords': await renderPasswords(); break;
            case 'subscriptions': await renderSubscriptions(); break;
            case 'gifts': await renderGifts(); break;
            case 'wine': await renderWine(); break;
            case 'podcasts': await renderPodcasts(); break;
            case 'cleaning': await renderCleaning(); break;
            case 'albums': await renderAlbums(); break;
            case 'medications': await renderMedications(); break;
            case 'wishlist': await renderWishlist(); break;
            case 'documents': await renderDocuments(); break;
            case 'collections': await renderCollections(); break;
            case 'trades': await renderTrades(); break;
            case 'portfolio': await renderPortfolio(); break;
            case 'trading-watchlist': await renderTWatchlist(); break;
            case 'reports': await renderReports(); break;
            case 'audit': await renderAudit(); break;
            case 'spiritual': await Spiritual.renderSpiritual(); break;
            case 'bible': await Spiritual.renderBible(); break;
            case 'prayer': await Spiritual.renderPrayer(); break;
            case 'gratitude': await Spiritual.renderGratitude(); break;
            case 'settings': if (typeof Settings !== 'undefined') Settings.renderSettings(); break;
        }
    }

    // ===== MONTH SELECTOR =====
    function bindMonthSelector() {
        document.getElementById('prev-month').addEventListener('click', async () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            updateMonthLabel();
            await renderView(currentView);
        });

        document.getElementById('next-month').addEventListener('click', async () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            updateMonthLabel();
            await renderView(currentView);
        });
    }

    function updateMonthLabel() {
        document.getElementById('current-month-label').textContent =
            `${Store.getMonthName(currentMonth)} ${currentYear}`;
    }

    // ===== MODALS =====
    function bindModals() {
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(btn.dataset.close);
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal(overlay.id);
            });
        });

        document.getElementById('btn-quick-add').addEventListener('click', () => {
            openTransactionModal();
        });

        document.getElementById('btn-add-transaction').addEventListener('click', () => {
            openTransactionModal();
        });

        document.getElementById('btn-add-category').addEventListener('click', () => {
            openCategoryModal();
        });

        document.getElementById('btn-add-recurring').addEventListener('click', () => {
            openRecurringModal();
        });

        document.getElementById('btn-add-goal').addEventListener('click', () => {
            openGoalModal();
        });

        document.getElementById('confirm-yes').addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
            closeModal('modal-confirm');
        });
    }

    function openModal(id) {
        document.getElementById(id).classList.add('active');
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    function showConfirm(message, callback) {
        document.getElementById('confirm-message').textContent = message;
        confirmCallback = callback;
        openModal('modal-confirm');
    }

    // ===== TOAST =====
    function toast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `
            <i class="fas ${icons[type] || icons.success}"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(t);
        t.querySelector('.toast-close').addEventListener('click', () => t.remove());
        setTimeout(() => t.remove(), 4000);
    }

    // ===== POPULATE CATEGORY SELECTS =====
    async function populateCategorySelect(selectId, typeFilter = null) {
        const select = document.getElementById(selectId);
        if (!select) return;
        const currentVal = select.value;
        const cats = await Store.Categories.getAll();
        const filtered = typeFilter
            ? cats.filter(c => c.type === typeFilter || c.type === 'both')
            : cats;

        while (select.options.length > 1) select.options.length = 1;

        filtered.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });

        if (currentVal) select.value = currentVal;
    }

    // ===================================================================
    //  DASHBOARD — Life Manager View
    // ===================================================================
    async function renderDashboard() {
        /* ── Greeting & date ─────────────────────────────── */
        const now = new Date();
        const hour = now.getHours();
        const greetWord = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
        const userName = (() => {
            const el = document.getElementById('sidebar-user-name');
            const n = el ? el.textContent.trim() : '';
            return n && n !== 'Utilisateur' ? ` ${n.split(' ')[0]}` : '';
        })();
        const greetEl = document.getElementById('lm-greeting');
        if (greetEl) greetEl.textContent = `${greetWord}${userName} 👋`;

        const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
        const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
        const dateEl = document.getElementById('lm-date');
        if (dateEl) dateEl.textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

        const lmMonth = document.getElementById('lm-month-label');
        if (lmMonth) lmMonth.textContent = `${months[currentMonth - 1]} ${currentYear}`;

        /* ── Finance data ────────────────────────────────── */
        const [categories, transactions, budgets, goals] = await Promise.all([
            Store.Categories.getAll(),
            Store.Transactions.getByMonth(currentYear, currentMonth),
            Store.Budgets.getByMonth(currentYear, currentMonth),
            Store.Goals.getAll().catch(() => [])
        ]);

        const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const balance = income - expense;
        const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
        const budgetPct = totalBudget > 0 ? Math.round((expense / totalBudget) * 100) : null;

        // Stat elements (kept for compat)
        const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        setEl('stat-income', Store.formatMoney(income));
        setEl('stat-expense', Store.formatMoney(expense));
        const balEl = document.getElementById('stat-balance');
        if (balEl) {
            balEl.textContent = Store.formatMoney(balance);
            balEl.className = 'lm-fin-val ' + (balance >= 0 ? 'amount-positive' : 'amount-negative');
        }
        setEl('stat-budget-remaining', Store.formatMoney(totalBudget - expense));

        /* ── Habits data ─────────────────────────────────── */
        let habits = [], habitsToday = 0, habitsTotal = 0;
        try {
            habits = await Habits.getAll();
            const todayKey = now.toISOString().split('T')[0];
            habitsTotal = habits.length;
            habitsToday = habits.filter(h => {
                const comps = (() => { try { return JSON.parse(h.completions || '[]'); } catch { return []; } })();
                return comps.includes(todayKey);
            }).length;
        } catch (e) {}

        /* ── Events data ─────────────────────────────────── */
        let events = [], upcomingEvents = [];
        try {
            if (typeof Events !== 'undefined') {
                events = await Events.getAll();
                const todayStr = now.toISOString().split('T')[0];
                upcomingEvents = events
                    .filter(ev => ev.date >= todayStr)
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(0, 5);
            }
        } catch (e) {}

        /* ── Fitness data ─────────────────────────────────── */
        let fitnessCount = 0;
        try {
            if (typeof Fitness !== 'undefined') {
                const sessions = await Fitness.getAll();
                const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
                const cutoffStr = cutoff.toISOString().split('T')[0];
                fitnessCount = sessions.filter(s => (s.date || '') >= cutoffStr).length;
            }
        } catch (e) {}

        /* ── Render Pillars ─────────────────────────────── */
        // Pillar: balance
        const balPillar = document.getElementById('lmp-balance');
        if (balPillar) {
            balPillar.textContent = Store.formatMoney(balance);
            balPillar.className = 'lm-pillar-value ' + (balance >= 0 ? 'amount-positive' : 'amount-negative');
        }
        // Pillar: budget
        const budPillar = document.getElementById('lmp-budget');
        if (budPillar) {
            budPillar.textContent = budgetPct !== null ? `${budgetPct}%` : '— %';
            budPillar.className = 'lm-pillar-value ' + (budgetPct >= 100 ? 'amount-negative' : budgetPct >= 80 ? 'color-warning' : 'amount-positive');
        }
        const budBar = document.getElementById('lmp-budget-bar');
        if (budBar && budgetPct !== null) {
            const pct = Math.min(budgetPct, 100);
            const col = pct >= 100 ? 'var(--color-danger)' : pct >= 80 ? 'var(--color-warning)' : 'var(--color-success)';
            budBar.innerHTML = `<div class="lm-mini-bar"><div style="width:${pct}%;background:${col}"></div></div>`;
        }
        // Pillar: habits
        setEl('lmp-habits', habitsTotal > 0 ? `${habitsToday}/${habitsTotal}` : '—');
        const habitsDots = document.getElementById('lmp-habits-dots');
        if (habitsDots && habitsTotal > 0) {
            const dots = habits.slice(0, 6).map(h => {
                const comps = (() => { try { return JSON.parse(h.completions || '[]'); } catch { return []; } })();
                const done = comps.includes(now.toISOString().split('T')[0]);
                return `<span class="lm-habit-dot ${done ? 'done' : ''}" title="${h.name}">${h.icon || '•'}</span>`;
            }).join('');
            habitsDots.innerHTML = `<div class="lm-habit-dots">${dots}</div>`;
        }
        // Pillar: events
        setEl('lmp-events', upcomingEvents.length === 0 ? 'Aucun' : `${upcomingEvents.length} à venir`);
        const evNext = document.getElementById('lmp-events-next');
        if (evNext && upcomingEvents.length > 0) {
            const ev = upcomingEvents[0];
            evNext.innerHTML = `<span class="lm-pillar-sub">${escapeHtml(ev.title || ev.name || '—')}</span>`;
        }
        // Pillar: fitness
        setEl('lmp-fitness', fitnessCount > 0 ? `${fitnessCount} séance${fitnessCount > 1 ? 's' : ''}` : 'Aucune');
        setEl('lmp-fitness-sub', fitnessCount > 0 ? 'cette semaine' : 'cette semaine');
        // Pillar: goals
        const activeGoals = goals.filter(g => !g.achieved && !g.archived).length;
        setEl('lmp-goals', activeGoals > 0 ? `${activeGoals} en cours` : 'Aucun');

        /* ── Budget mini bar ─────────────────────────────── */
        const budgetMini = document.getElementById('lm-budget-mini');
        if (budgetMini) {
            if (budgets.length > 0 && totalBudget > 0) {
                const pct = Math.min((expense / totalBudget) * 100, 100);
                const col = pct >= 100 ? 'var(--color-danger)' : pct >= 80 ? 'var(--color-warning)' : 'var(--color-success)';
                budgetMini.innerHTML = `
                    <div class="lm-budget-mini-row">
                        <span>Budget du mois</span>
                        <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted)">${Store.formatMoney(expense)} / ${Store.formatMoney(totalBudget)}</span>
                        <span style="color:${col};font-weight:700;font-size:0.78rem">${Math.round(pct)}%</span>
                    </div>
                    <div class="lm-mini-bar-full"><div style="width:${pct}%;background:${col}"></div></div>
                `;
            } else {
                budgetMini.innerHTML = `<p class="empty-state-sm" style="padding:0.5rem 0">Aucun budget défini • <a href="#" data-nav="budget">Créer →</a></p>`;
            }
        }

        /* ── Recent transactions ─────────────────────────── */
        renderLifeRecentTransactions(transactions, categories);

        /* ── Habits widget ──────────────────────────────── */
        renderLifeHabits(habits);

        /* ── Events widget ──────────────────────────────── */
        renderLifeEvents(upcomingEvents);

        /* ── Keep charts/sparklines silently (no-op if containers hidden) ── */
        try { renderDashboardSparklines(transactions, budgets); } catch(e) {}
        try { Charts.renderExpenseBreakdown(transactions, categories); } catch(e) {}
        try { await Charts.renderMonthlyTrend(currentYear); } catch(e) {}
        try { Charts.renderBudgetVsActual(budgets, transactions, categories); } catch(e) {}
        try { renderAlerts(budgets, transactions, categories); } catch(e) {}
        try { if (typeof Theme !== 'undefined') Theme.animateCounters(); } catch(e) {}

        /* ── Portfolio & Trading pillars ─────────────────── */
        try {
            if (typeof Portfolio !== 'undefined') {
                const pStats = await Portfolio.getStats();
                const pEl = document.getElementById('lmp-portfolio');
                const pSub = document.getElementById('lmp-portfolio-sub');
                if (pEl) {
                    pEl.textContent = Store.formatMoney(pStats.totalValue || 0);
                    pEl.className = 'lm-pillar-value ' + ((pStats.totalPnL || 0) >= 0 ? 'amount-positive' : 'amount-negative');
                }
                if (pSub) {
                    const pnl = pStats.totalPnL || 0;
                    pSub.innerHTML = `<span class="lm-pillar-sub ${pnl>=0?'amount-positive':'amount-negative'}">${pnl>=0?'+':''}${Store.formatMoney(pnl)} P&L</span>`;
                }
            }
        } catch(e){}

        try {
            if (typeof Trades !== 'undefined') {
                const tStats = await Trades.getStats();
                const tEl = document.getElementById('lmp-trading');
                const tSub = document.getElementById('lmp-trading-sub');
                if (tEl) {
                    const pnl = tStats.totalPnL || 0;
                    tEl.textContent = `${pnl>=0?'+':''}${Store.formatMoney(pnl)}`;
                    tEl.className = 'lm-pillar-value ' + (pnl >= 0 ? 'amount-positive' : 'amount-negative');
                }
                if (tSub) {
                    tSub.innerHTML = `<span class="lm-pillar-sub">${tStats.winRate||0}% win • ${tStats.openTrades||0} ouvert${(tStats.openTrades||0)>1?'s':''}</span>`;
                }
            }
        } catch(e){}

        /* ── Module overview grid ───────────────────────── */
        try { await renderDashboardOverview(); } catch(e){ console.warn('Dashboard overview error:', e); }
    }

    // ===================================================================
    //  DASHBOARD — MODULE OVERVIEW GRID
    // ===================================================================
    async function renderDashboardOverview() {
        const grid = document.getElementById('dashboard-overview-grid');
        if (!grid) return;

        // Helper to safely call getStats or getAll+count
        const safe = async (fn) => { try { return await fn(); } catch(e) { return null; } };

        // Gather all module stats in parallel
        const [
            portfolioStats, tradesStats, watchlistStats, subsStats, wishlistStats,
            sleepStats, healthStats, medsStats, fitnessAll,
            notesStats, projectsStats, ideasStats, learningStats,
            booksAll, moviesStats, musicStats, gamesStats, podcastsStats, albumsStats,
            inventoryAll, recipesStats, plantsAll, petsStats, homeStats, vehiclesStats,
            wardrobeStats, cleaningStats, wineStats,
            contactsStats, giftsStats, packagesStats,
            passwordsStats, documentsStats,
            collectionsStats, travelStats, eventsStats
        ] = await Promise.all([
            safe(() => typeof Portfolio!=='undefined' ? Portfolio.getStats() : null),
            safe(() => typeof Trades!=='undefined' ? Trades.getStats() : null),
            safe(() => typeof TradingWatchlist!=='undefined' ? TradingWatchlist.getStats() : null),
            safe(() => typeof Subscriptions!=='undefined' ? Subscriptions.getStats() : null),
            safe(() => typeof Wishlist!=='undefined' ? Wishlist.getStats() : null),
            safe(() => typeof Sleep!=='undefined' ? Sleep.getStats() : null),
            safe(() => typeof Health!=='undefined' ? Health.getStats() : null),
            safe(() => typeof Medications!=='undefined' ? Medications.getStats() : null),
            safe(() => typeof Fitness!=='undefined' ? Fitness.getAll() : null),
            safe(() => typeof Notes!=='undefined' ? Notes.getStats() : null),
            safe(() => typeof Projects!=='undefined' ? Projects.getStats() : null),
            safe(() => typeof Ideas!=='undefined' ? Ideas.getStats() : null),
            safe(() => typeof Learning!=='undefined' ? Learning.getStats() : null),
            safe(() => typeof Books!=='undefined' ? Books.getAll() : null),
            safe(() => typeof Movies!=='undefined' ? Movies.getStats() : null),
            safe(() => typeof Music!=='undefined' ? Music.getStats() : null),
            safe(() => typeof Games!=='undefined' ? Games.getStats() : null),
            safe(() => typeof Podcasts!=='undefined' ? Podcasts.getStats() : null),
            safe(() => typeof Albums!=='undefined' ? Albums.getStats() : null),
            safe(() => typeof Inventory!=='undefined' ? Inventory.getAll() : null),
            safe(() => typeof Recipes!=='undefined' ? Recipes.getStats() : null),
            safe(() => typeof Plants!=='undefined' ? Plants.getAll() : null),
            safe(() => typeof Pets!=='undefined' ? Pets.getStats() : null),
            safe(() => typeof Home!=='undefined' ? Home.getStats() : null),
            safe(() => typeof Vehicles!=='undefined' ? Vehicles.getStats() : null),
            safe(() => typeof Wardrobe!=='undefined' ? Wardrobe.getStats() : null),
            safe(() => typeof Cleaning!=='undefined' ? Cleaning.getStats() : null),
            safe(() => typeof Wine!=='undefined' ? Wine.getStats() : null),
            safe(() => typeof Contacts!=='undefined' ? Contacts.getStats() : null),
            safe(() => typeof Gifts!=='undefined' ? Gifts.getStats() : null),
            safe(() => typeof Packages!=='undefined' ? Packages.getStats() : null),
            safe(() => typeof Passwords!=='undefined' ? Passwords.getStats() : null),
            safe(() => typeof Documents!=='undefined' ? Documents.getStats() : null),
            safe(() => typeof Collections!=='undefined' ? Collections.getStats() : null),
            safe(() => typeof Travel!=='undefined' ? Travel.getStats() : null),
            safe(() => typeof Events!=='undefined' ? Events.getStats() : null),
        ]);

        // Books & Fitness use sync getStats that takes an array
        const booksStats = booksAll ? Books.getStats(booksAll) : null;
        const fitnessStats = fitnessAll ? Fitness.getStats(fitnessAll) : null;
        // Inventory doesn't have getStats
        const inventoryCount = inventoryAll ? inventoryAll.length : 0;
        // Plants — compute needs-water count
        let plantsNeedWater = 0, plantsTotal = 0;
        if (plantsAll && typeof Plants !== 'undefined') {
            plantsTotal = plantsAll.length;
            plantsNeedWater = plantsAll.filter(p => { try { return Plants.needsWater(p); } catch(e) { return false; } }).length;
        }

        // Build overview cards — grouped by category
        const categories = [
            {
                title: 'Trading & Investissement', icon: 'fas fa-chart-line', color: '#10B981',
                cards: [
                    portfolioStats ? { label: 'Portefeuille', icon: 'fas fa-briefcase', nav: 'portfolio', stats: [
                        { label: 'Valeur totale', value: Store.formatMoney(portfolioStats.totalValue || 0) },
                        { label: 'P&L', value: `${(portfolioStats.totalPnL||0)>=0?'+':''}${Store.formatMoney(portfolioStats.totalPnL||0)}`, cls: (portfolioStats.totalPnL||0)>=0?'amount-positive':'amount-negative' },
                        { label: 'Positions', value: portfolioStats.total || 0 }
                    ]} : null,
                    tradesStats ? { label: 'Journal Trading', icon: 'fas fa-chart-line', nav: 'trades', stats: [
                        { label: 'P&L total', value: `${(tradesStats.totalPnL||0)>=0?'+':''}${Store.formatMoney(tradesStats.totalPnL||0)}`, cls: (tradesStats.totalPnL||0)>=0?'amount-positive':'amount-negative' },
                        { label: 'Win Rate', value: `${tradesStats.winRate||0}%` },
                        { label: 'Trades ouverts', value: tradesStats.openTrades || 0 }
                    ]} : null,
                    watchlistStats ? { label: 'Surveillance', icon: 'fas fa-binoculars', nav: 'trading-watchlist', stats: [
                        { label: 'Actifs surveillés', value: watchlistStats.total || 0 },
                        { label: 'Signaux achat', value: watchlistStats.buySignals || 0, cls: 'amount-positive' },
                        { label: 'Signaux vente', value: watchlistStats.sellSignals || 0, cls: 'amount-negative' }
                    ]} : null,
                ].filter(Boolean)
            },
            {
                title: 'Bien-être & Santé', icon: 'fas fa-heartbeat', color: '#EC4899',
                cards: [
                    fitnessStats ? { label: 'Fitness', icon: 'fas fa-dumbbell', nav: 'fitness', stats: [
                        { label: 'Séances', value: fitnessStats.total || 0 },
                        { label: 'Cette semaine', value: fitnessStats.thisWeek || 0 },
                        { label: 'Durée moy.', value: fitnessStats.avgDuration ? `${Math.round(fitnessStats.avgDuration)}min` : '—' }
                    ]} : null,
                    sleepStats ? { label: 'Sommeil', icon: 'fas fa-moon', nav: 'sleep', stats: [
                        { label: 'Entrées', value: sleepStats.total || 0 },
                        { label: 'Moy. durée', value: sleepStats.avgDuration ? `${sleepStats.avgDuration}h` : '—' },
                        { label: 'Qualité moy.', value: sleepStats.avgQuality ? `${sleepStats.avgQuality}/5` : '—' }
                    ]} : null,
                    healthStats ? { label: 'Santé', icon: 'fas fa-heartbeat', nav: 'health', stats: [
                        { label: 'Entrées', value: healthStats.total || 0 },
                        { label: 'À venir', value: healthStats.upcoming || 0 },
                        { label: 'Ce mois', value: healthStats.thisMonth || 0 }
                    ]} : null,
                    medsStats ? { label: 'Médicaments', icon: 'fas fa-pills', nav: 'medications', stats: [
                        { label: 'Médicaments', value: medsStats.total || 0 },
                        { label: 'Actifs', value: medsStats.active || 0 },
                        { label: 'Renouveler', value: medsStats.needsRefill || 0, cls: (medsStats.needsRefill||0)>0?'amount-negative':'' }
                    ]} : null,
                ].filter(Boolean)
            },
            {
                title: 'Productivité', icon: 'fas fa-rocket', color: '#6366F1',
                cards: [
                    notesStats ? { label: 'Notes', icon: 'fas fa-sticky-note', nav: 'notes', stats: [
                        { label: 'Total', value: notesStats.total || 0 },
                        { label: 'Épinglées', value: notesStats.pinned || 0 },
                        { label: 'Ce mois', value: notesStats.thisMonth || 0 }
                    ]} : null,
                    projectsStats ? { label: 'Projets', icon: 'fas fa-project-diagram', nav: 'projects', stats: [
                        { label: 'Total', value: projectsStats.total || 0 },
                        { label: 'En cours', value: projectsStats.inProgress || projectsStats.active || 0 },
                        { label: 'Terminés', value: projectsStats.completed || 0 }
                    ]} : null,
                    ideasStats ? { label: 'Idées', icon: 'fas fa-lightbulb', nav: 'ideas', stats: [
                        { label: 'Total', value: ideasStats.total || 0 },
                        { label: 'En cours', value: ideasStats.inProgress || 0 },
                        { label: 'Favorites', value: ideasStats.favorites || 0 }
                    ]} : null,
                    learningStats ? { label: 'Formation', icon: 'fas fa-graduation-cap', nav: 'learning', stats: [
                        { label: 'Cours', value: learningStats.total || 0 },
                        { label: 'En cours', value: learningStats.inProgress || 0 },
                        { label: 'Terminés', value: learningStats.completed || 0 }
                    ]} : null,
                ].filter(Boolean)
            },
            {
                title: 'Médias & Loisirs', icon: 'fas fa-film', color: '#F59E0B',
                cards: [
                    booksStats ? { label: 'Livres', icon: 'fas fa-book', nav: 'books', stats: [
                        { label: 'Total', value: booksStats.total || 0 },
                        { label: 'En lecture', value: booksStats.reading || 0 },
                        { label: 'Note moy.', value: booksStats.avgRating ? `${booksStats.avgRating}★` : '—' }
                    ]} : null,
                    moviesStats ? { label: 'Films', icon: 'fas fa-film', nav: 'movies', stats: [
                        { label: 'Total', value: moviesStats.total || 0 },
                        { label: 'À voir', value: moviesStats.toWatch || moviesStats.watchlist || 0 },
                        { label: 'Note moy.', value: moviesStats.avgRating ? `${moviesStats.avgRating}★` : '—' }
                    ]} : null,
                    musicStats ? { label: 'Musique', icon: 'fas fa-music', nav: 'music', stats: [
                        { label: 'Total', value: musicStats.total || 0 },
                        { label: 'Favorites', value: musicStats.favorites || 0 },
                        { label: 'Note moy.', value: musicStats.avgRating ? `${musicStats.avgRating}★` : '—' }
                    ]} : null,
                    gamesStats ? { label: 'Jeux', icon: 'fas fa-gamepad', nav: 'games', stats: [
                        { label: 'Total', value: gamesStats.total || 0 },
                        { label: 'En cours', value: gamesStats.playing || gamesStats.inProgress || 0 },
                        { label: 'Heures jouées', value: gamesStats.totalHours ? `${Math.round(gamesStats.totalHours)}h` : '—' }
                    ]} : null,
                    podcastsStats ? { label: 'Podcasts', icon: 'fas fa-podcast', nav: 'podcasts', stats: [
                        { label: 'Total', value: podcastsStats.total || 0 },
                        { label: 'En cours', value: podcastsStats.listening || podcastsStats.inProgress || 0 },
                        { label: 'Favorites', value: podcastsStats.favorites || 0 }
                    ]} : null,
                    albumsStats ? { label: 'Albums', icon: 'fas fa-compact-disc', nav: 'albums', stats: [
                        { label: 'Total', value: albumsStats.total || 0 },
                        { label: 'Favorites', value: albumsStats.favorites || 0 },
                        { label: 'Note moy.', value: albumsStats.avgRating ? `${albumsStats.avgRating}★` : '—' }
                    ]} : null,
                    travelStats ? { label: 'Voyages', icon: 'fas fa-globe-americas', nav: 'travel', stats: [
                        { label: 'Voyages', value: travelStats.total || 0 },
                        { label: 'Planifiés', value: travelStats.planned || travelStats.upcoming || 0 },
                        { label: 'Budget total', value: travelStats.totalBudget ? Store.formatMoney(travelStats.totalBudget) : '—' }
                    ]} : null,
                ].filter(Boolean)
            },
            {
                title: 'Maison & Quotidien', icon: 'fas fa-home', color: '#8B5CF6',
                cards: [
                    { label: 'Inventaire', icon: 'fas fa-boxes', nav: 'inventory', stats: [
                        { label: 'Objets', value: inventoryCount }
                    ]},
                    recipesStats ? { label: 'Recettes', icon: 'fas fa-utensils', nav: 'recipes', stats: [
                        { label: 'Total', value: recipesStats.total || 0 },
                        { label: 'Favorites', value: recipesStats.favorites || 0 },
                        { label: 'Note moy.', value: recipesStats.avgRating ? `${recipesStats.avgRating}★` : '—' }
                    ]} : null,
                    plantsTotal > 0 ? { label: 'Plantes', icon: 'fas fa-seedling', nav: 'plants', stats: [
                        { label: 'Total', value: plantsTotal },
                        { label: 'À arroser', value: plantsNeedWater, cls: plantsNeedWater>0?'amount-negative':'' }
                    ]} : null,
                    petsStats ? { label: 'Animaux', icon: 'fas fa-paw', nav: 'pets', stats: [
                        { label: 'Total', value: petsStats.total || 0 },
                        { label: 'Vétérinaire', value: petsStats.needsVet || 0, cls: (petsStats.needsVet||0)>0?'color-warning':'' }
                    ]} : null,
                    homeStats ? { label: 'Maison', icon: 'fas fa-home', nav: 'home', stats: [
                        { label: 'Tâches', value: homeStats.total || 0 },
                        { label: 'En retard', value: homeStats.overdue || 0, cls: (homeStats.overdue||0)>0?'amount-negative':'' }
                    ]} : null,
                    vehiclesStats ? { label: 'Véhicules', icon: 'fas fa-car', nav: 'vehicles', stats: [
                        { label: 'Total', value: vehiclesStats.total || 0 },
                        { label: 'Entretien dû', value: vehiclesStats.serviceDue || 0, cls: (vehiclesStats.serviceDue||0)>0?'color-warning':'' }
                    ]} : null,
                    wardrobeStats ? { label: 'Garde-robe', icon: 'fas fa-tshirt', nav: 'wardrobe', stats: [
                        { label: 'Articles', value: wardrobeStats.total || 0 },
                        { label: 'Portés ce mois', value: wardrobeStats.wornThisMonth || 0 }
                    ]} : null,
                    cleaningStats ? { label: 'Ménage', icon: 'fas fa-broom', nav: 'cleaning', stats: [
                        { label: 'Tâches', value: cleaningStats.total || 0 },
                        { label: 'En retard', value: cleaningStats.overdue || 0, cls: (cleaningStats.overdue||0)>0?'amount-negative':'' }
                    ]} : null,
                ].filter(Boolean)
            },
            {
                title: 'Social & Personnel', icon: 'fas fa-users', color: '#0EA5E9',
                cards: [
                    contactsStats ? { label: 'Contacts', icon: 'fas fa-address-book', nav: 'contacts', stats: [
                        { label: 'Total', value: contactsStats.total || 0 },
                        { label: 'Favoris', value: contactsStats.favorites || 0 }
                    ]} : null,
                    giftsStats ? { label: 'Cadeaux', icon: 'fas fa-gift', nav: 'gifts', stats: [
                        { label: 'Total', value: giftsStats.total || 0 },
                        { label: 'Planifiés', value: giftsStats.planned || 0 },
                        { label: 'Budget', value: giftsStats.totalBudget ? Store.formatMoney(giftsStats.totalBudget) : '—' }
                    ]} : null,
                    subsStats ? { label: 'Abonnements', icon: 'fas fa-newspaper', nav: 'subscriptions', stats: [
                        { label: 'Actifs', value: subsStats.active || subsStats.total || 0 },
                        { label: 'Coût/mois', value: subsStats.monthlyTotal ? Store.formatMoney(subsStats.monthlyTotal) : '—' }
                    ]} : null,
                    packagesStats ? { label: 'Colis', icon: 'fas fa-box', nav: 'packages', stats: [
                        { label: 'Total', value: packagesStats.total || 0 },
                        { label: 'En transit', value: packagesStats.inTransit || 0, cls: (packagesStats.inTransit||0)>0?'color-warning':'' }
                    ]} : null,
                    wishlistStats ? { label: 'Wishlist', icon: 'fas fa-star', nav: 'wishlist', stats: [
                        { label: 'Souhaits', value: wishlistStats.total || 0 },
                        { label: 'Achetés', value: wishlistStats.purchased || wishlistStats.completed || 0 }
                    ]} : null,
                    wineStats ? { label: 'Cave à vin', icon: 'fas fa-wine-bottle', nav: 'wine', stats: [
                        { label: 'Bouteilles', value: wineStats.total || 0 },
                        { label: 'En cave', value: wineStats.inCellar || wineStats.available || 0 }
                    ]} : null,
                    collectionsStats ? { label: 'Collections', icon: 'fas fa-palette', nav: 'collections', stats: [
                        { label: 'Items', value: collectionsStats.total || 0 },
                        { label: 'Valeur', value: collectionsStats.totalValue ? Store.formatMoney(collectionsStats.totalValue) : '—' }
                    ]} : null,
                ].filter(Boolean)
            },
            {
                title: 'Sécurité & Documents', icon: 'fas fa-shield-alt', color: '#EF4444',
                cards: [
                    passwordsStats ? { label: 'Mots de passe', icon: 'fas fa-lock', nav: 'passwords', stats: [
                        { label: 'Total', value: passwordsStats.total || 0 },
                        { label: 'Faibles', value: passwordsStats.weak || 0, cls: (passwordsStats.weak||0)>0?'amount-negative':'' },
                        { label: 'Expirés', value: passwordsStats.expired || 0, cls: (passwordsStats.expired||0)>0?'amount-negative':'' }
                    ]} : null,
                    documentsStats ? { label: 'Documents', icon: 'fas fa-file-alt', nav: 'documents', stats: [
                        { label: 'Total', value: documentsStats.total || 0 },
                        { label: 'Expirant', value: documentsStats.expiringSoon || 0, cls: (documentsStats.expiringSoon||0)>0?'color-warning':'' }
                    ]} : null,
                ].filter(Boolean)
            },
        ];

        // Filter out empty groups
        const activeCategories = categories.filter(cat => cat.cards.length > 0);

        if (activeCategories.length === 0) {
            grid.innerHTML = '<p class="empty-state-sm">Aucune donnée disponible. Commencez à utiliser les modules pour voir les statistiques ici.</p>';
            return;
        }

        grid.innerHTML = activeCategories.map(cat => `
            <div class="dash-overview-group">
                <div class="dash-overview-group-header" style="--group-color:${cat.color}">
                    <i class="${cat.icon}"></i> ${cat.title}
                </div>
                <div class="dash-overview-group-cards">
                    ${cat.cards.map(card => `
                        <div class="dash-overview-card" onclick="App&&App._navigateTo('${card.nav}')">
                            <div class="dash-overview-card-header">
                                <i class="${card.icon}"></i>
                                <span>${card.label}</span>
                            </div>
                            <div class="dash-overview-card-stats">
                                ${card.stats.map(s => `
                                    <div class="dash-stat">
                                        <span class="dash-stat-value ${s.cls||''}">${s.value}</span>
                                        <span class="dash-stat-label">${s.label}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderLifeRecentTransactions(transactions, categories) {
        const container = document.getElementById('recent-transactions');
        if (!container) return;
        const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-state-sm">Aucune transaction ce mois.<br><a href="#" data-nav="transactions">Ajouter →</a></p>';
            return;
        }
        const todayStr = new Date().toISOString().split('T')[0];
        container.innerHTML = recent.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const isExp = t.type === 'expense';
            return `
            <div class="lm-tx-row">
                <div class="lm-tx-icon" style="color:${cat ? cat.color : '#94A3B8'}">
                    <i class="${cat ? cat.icon : 'fas fa-tag'}"></i>
                </div>
                <div class="lm-tx-info">
                    <span class="lm-tx-desc">${escapeHtml(t.description)}</span>
                    <span class="lm-tx-meta">${cat ? cat.name : 'Autre'} • ${formatDate(t.date)}${t.date === todayStr ? ' <span class="tx-today-badge">Auj.</span>' : ''}</span>
                </div>
                <span class="lm-tx-amount ${isExp ? 'amount-negative' : 'amount-positive'}">${isExp ? '-' : '+'}${Store.formatMoney(t.amount)}</span>
            </div>`;
        }).join('');
    }

    function renderLifeHabits(habits) {
        const list = document.getElementById('lm-habits-list');
        const scoreEl = document.getElementById('lm-habits-score');
        const barFill = document.getElementById('lm-habit-bar-fill');
        if (!list) return;
        if (habits.length === 0) {
            list.innerHTML = '<p class="empty-state-sm">Aucune habitude configurée.<br><a href="#" data-nav="habits">Créer une habitude →</a></p>';
            return;
        }
        const todayKey = new Date().toISOString().split('T')[0];
        let done = 0;
        list.innerHTML = habits.map(h => {
            const comps = (() => { try { return JSON.parse(h.completions || '[]'); } catch { return []; } })();
            const isDone = comps.includes(todayKey);
            if (isDone) done++;
            return `
            <div class="lm-habit-row ${isDone ? 'lm-habit-done' : ''}">
                <span class="lm-habit-emoji">${h.icon || '✅'}</span>
                <span class="lm-habit-name">${escapeHtml(h.name)}</span>
                <span class="lm-habit-streak" title="Série actuelle">${h.streak > 0 ? `🔥 ${h.streak}j` : ''}</span>
                <button class="lm-habit-toggle" onclick="event.stopPropagation(); Habits && Habits.toggleToday('${h.id}').then(() => renderDashboard())" title="${isDone ? 'Marquer non fait' : 'Marquer fait'}">
                    <i class="fas ${isDone ? 'fa-check-circle' : 'fa-circle'}"></i>
                </button>
            </div>`;
        }).join('');
        const pct = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;
        if (scoreEl) scoreEl.textContent = `${pct}%`;
        if (barFill) barFill.style.width = `${pct}%`;
    }

    function renderLifeEvents(upcomingEvents) {
        const list = document.getElementById('lm-events-list');
        if (!list) return;
        if (upcomingEvents.length === 0) {
            list.innerHTML = '<p class="empty-state-sm">Aucun événement à venir.<br><a href="#" data-nav="events">Ajouter →</a></p>';
            return;
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
        list.innerHTML = upcomingEvents.map(ev => {
            const d = ev.date ? new Date(ev.date + 'T00:00:00') : null;
            const isToday = ev.date === todayStr;
            const dateLabel = d ? `${d.getDate()} ${months[d.getMonth()]}` : '—';
            return `
            <div class="lm-event-row ${isToday ? 'lm-event-today' : ''}">
                <div class="lm-event-date">
                    <span class="lm-event-day">${d ? d.getDate() : '—'}</span>
                    <span class="lm-event-month">${d ? months[d.getMonth()] : ''}</span>
                </div>
                <div class="lm-event-info">
                    <span class="lm-event-name">${escapeHtml(ev.title || ev.name || '—')}</span>
                    ${isToday ? '<span class="tx-today-badge">Aujourd\'hui</span>' : ''}
                </div>
            </div>`;
        }).join('');
    }

    // ===================================================================
    //  DASHBOARD SPARKLINES
    // ===================================================================
    function renderDashboardSparklines(transactions, budgets) {
        const seriesDays = 14;

        const incomeByDay = buildDailySeries(transactions, 'income', seriesDays);
        const expenseByDay = buildDailySeries(transactions, 'expense', seriesDays);
        const balanceByDay = incomeByDay.map((v, i) => (v || 0) - (expenseByDay[i] || 0));

        const totalBudget = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        const budgetRemainingByDay = balanceByDay.map((_, i) => {
            const spentToDate = expenseByDay.slice(0, i + 1).reduce((s, x) => s + (x || 0), 0);
            return totalBudget - spentToDate;
        });

        renderSparkline('spark-income', incomeByDay, { stroke: 'var(--accent-emerald)' });
        renderSparkline('spark-expense', expenseByDay, { stroke: 'var(--accent-rose)' });
        renderSparkline('spark-balance', balanceByDay, { stroke: 'var(--primary)' });
        renderSparkline('spark-budget', budgetRemainingByDay, { stroke: 'var(--accent-amber)' });
    }

    function buildDailySeries(transactions, type, days) {
        const now = new Date();
        const out = new Array(days).fill(0);
        const start = new Date(now);
        start.setDate(now.getDate() - (days - 1));
        start.setHours(0, 0, 0, 0);

        const byKey = new Map();
        transactions
            .filter(t => t.type === type)
            .forEach(t => {
                if (!t.date) return;
                const key = String(t.date);
                byKey.set(key, (byKey.get(key) || 0) + (Number(t.amount) || 0));
            });

        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().split('T')[0];
            out[i] = byKey.get(key) || 0;
        }
        return out;
    }

    function renderSparkline(containerId, values, opts = {}) {
        const el = document.getElementById(containerId);
        if (!el) return;

        const width = 240;
        const height = 40;
        const padding = 4;

        const series = Array.isArray(values) ? values : [];
        const min = Math.min(...series, 0);
        const max = Math.max(...series, 1);
        const range = Math.max(1e-9, max - min);

        const pts = series.map((v, i) => {
            const x = padding + (i * (width - padding * 2)) / Math.max(1, series.length - 1);
            const y = padding + (height - padding * 2) * (1 - ((v - min) / range));
            return { x, y };
        });

        const d = pts
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
            .join(' ');

        const stroke = opts.stroke || 'var(--primary)';
        const area = `${d} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

        el.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="grad-${containerId}" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stop-color="${stroke}" stop-opacity="0.22" />
                        <stop offset="1" stop-color="${stroke}" stop-opacity="0" />
                    </linearGradient>
                </defs>
                <path d="${area}" fill="url(#grad-${containerId})"></path>
                <path d="${d}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        `;
    }

    function renderBudgetProgress(budgets, transactions, categories) {
        const container = document.getElementById('budget-progress-list');
        if (budgets.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucun budget défini pour ce mois. <a href="#" data-nav="budget">Définir un budget →</a></p>';
            return;
        }

        container.innerHTML = budgets.map(b => {
            const cat = categories.find(c => c.id === b.categoryId);
            const spent = transactions.filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                .reduce((s, t) => s + t.amount, 0);
            const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
            const color = pct >= 100 ? '#F43F5E' : pct >= 80 ? '#F59E0B' : (cat ? cat.color : '#22C55E');

            return `
                <div class="progress-bar-container">
                    <div class="progress-cat-icon" style="background:${cat ? cat.color : '#94A3B8'}20; color:${cat ? cat.color : '#94A3B8'}">
                        <i class="${cat ? cat.icon : 'fas fa-tag'}"></i>
                    </div>
                    <div class="progress-info">
                        <div class="progress-header">
                            <span class="progress-name">${cat ? cat.name : 'Autre'}</span>
                            <span class="progress-amounts" style="font-family:var(--font-mono);font-size:0.78rem">${Store.formatMoney(spent)} / ${Store.formatMoney(b.amount)}</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width:${pct}%; background:${color}; box-shadow: 0 0 6px ${color}55"></div>
                        </div>
                    </div>
                    <span class="progress-pct" style="color:${color};font-family:var(--font-mono)">${pct.toFixed(0)}%</span>
                </div>
            `;
        }).join('');
    }

    function renderRecentTransactions(transactions, categories) {
        const container = document.getElementById('recent-transactions');
        const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucune transaction ce mois</p>';
            return;
        }

        const todayStrRec = new Date().toISOString().split('T')[0];
        container.innerHTML = recent.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const isExpense = t.type === 'expense';
            const isToday = t.date === todayStrRec;
            return `
                <div class="recent-tx ${isToday ? 'recent-tx-today' : ''}">
                    <div class="recent-tx-icon" style="background:${cat ? cat.color + '18' : '#94A3B818'};color:${cat ? cat.color : '#94A3B8'};border:1px solid ${cat ? cat.color + '28' : '#94A3B828'}">
                        <i class="${cat ? cat.icon : 'fas fa-tag'}"></i>
                    </div>
                    <div class="recent-tx-info">
                        <div class="recent-tx-desc">${escapeHtml(t.description)}${isToday ? '<span class="tx-today-badge">Auj.</span>' : ''}</div>
                        <div class="recent-tx-cat">${cat ? cat.name : 'Autre'} • ${formatDate(t.date)}</div>
                    </div>
                    <div class="recent-tx-amount ${isExpense ? 'amount-negative' : 'amount-positive'}" style="font-family:var(--font-mono)">
                        ${isExpense ? '-' : '+'}${Store.formatMoney(t.amount)}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderAlerts(budgets, transactions, categories) {
        const card = document.getElementById('alerts-card');
        const list = document.getElementById('alerts-list');
        const alerts = [];

        budgets.forEach(b => {
            const cat = categories.find(c => c.id === b.categoryId);
            const spent = transactions.filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                .reduce((s, t) => s + t.amount, 0);
            const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;

            if (pct >= 100) {
                alerts.push({
                    type: 'danger',
                    text: `⚠️ Budget dépassé pour "${cat ? cat.name : 'Autre'}" : ${Store.formatMoney(spent)} / ${Store.formatMoney(b.amount)} (${pct.toFixed(0)}%)`
                });
            } else if (pct >= 80) {
                alerts.push({
                    type: 'warning',
                    text: `⚠ Attention : "${cat ? cat.name : 'Autre'}" atteint ${pct.toFixed(0)}% du budget (${Store.formatMoney(spent)} / ${Store.formatMoney(b.amount)})`
                });
            }
        });

        if (alerts.length === 0) {
            card.style.display = 'none';
            return;
        }

        card.style.display = 'block';
        list.innerHTML = alerts.map(a => `
            <div class="alert-item alert-${a.type}">
                <i class="fas ${a.type === 'danger' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
                <span class="alert-text">${a.text}</span>
            </div>
        `).join('');
    }

    // ===================================================================
    //  BUDGET VIEW
    // ===================================================================
    async function renderBudget() {
        document.getElementById('budget-month-label').textContent =
            `${Store.getMonthName(currentMonth)} ${currentYear}`;

        await populateCategorySelect('budget-category', 'expense');

        const budgets = await Store.Budgets.getByMonth(currentYear, currentMonth);
        const transactions = await Store.Transactions.getByMonth(currentYear, currentMonth);
        const categories = await Store.Categories.getAll();

        const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
        document.getElementById('budget-total-badge').textContent = `Total: ${Store.formatMoney(totalBudget)}`;

        const tbody = document.getElementById('budget-table-body');
        const empty = document.getElementById('budget-empty');

        if (budgets.length === 0) {
            tbody.innerHTML = '';
            empty.style.display = 'block';
            document.getElementById('budget-table').style.display = 'none';
            return;
        }

        empty.style.display = 'none';
        document.getElementById('budget-table').style.display = 'table';

        tbody.innerHTML = budgets.map(b => {
            const cat = categories.find(c => c.id === b.categoryId);
            const spent = transactions.filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                .reduce((s, t) => s + t.amount, 0);
            const remaining = b.amount - spent;
            const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
            const color = pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#10B981';

            return `
                <tr>
                    <td>
                        <span class="tx-category">
                            <span class="tx-cat-icon" style="background:${cat ? cat.color + '18' : '#94A3B818'};color:${cat ? cat.color : '#94A3B8'}">
                                <i class="${cat ? cat.icon : 'fas fa-tag'}"></i>
                            </span>
                            ${cat ? cat.name : 'Autre'}
                        </span>
                    </td>
                    <td style="font-family:var(--font-mono);font-weight:700">${Store.formatMoney(b.amount)}</td>
                    <td style="font-family:var(--font-mono)">${Store.formatMoney(spent)}</td>
                    <td class="${remaining >= 0 ? 'amount-positive' : 'amount-negative'}" style="font-family:var(--font-mono);font-weight:600">${Store.formatMoney(remaining)}</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px">
                            <div class="budget-ring" style="--pct:${Math.min(pct, 100)};--ring-clr:${color}"><span>${pct.toFixed(0)}%</span></div>
                            <span class="budget-status-chip budget-status-${pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok'}">${pct >= 100 ? '✗ Dépassé' : pct >= 80 ? '⚠ Attention' : '✓ Respecté'}</span>
                        </div>
                    </td>
                    <td style="color:var(--text-secondary);font-size:0.85rem">${escapeHtml(b.notes || '—')}</td>
                    <td>
                        <div class="tx-actions">
                            <button class="btn btn-ghost btn-sm" onclick="App.editBudget('${b.categoryId}', ${b.amount}, '${escapeHtml(b.notes || '')}')">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn btn-ghost btn-sm" onclick="App.deleteBudget('${b.id}')">
                                <i class="fas fa-trash" style="color:var(--danger)"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function bindBudgetForm() {
        document.getElementById('budget-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const categoryId = document.getElementById('budget-category').value;
            const amount = parseFloat(document.getElementById('budget-amount').value);
            const notes = document.getElementById('budget-notes').value.trim();

            if (!categoryId || isNaN(amount) || amount <= 0) {
                toast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            await Store.Budgets.createOrUpdate({
                categoryId,
                amount,
                notes,
                year: currentYear,
                month: currentMonth
            });

            document.getElementById('budget-form').reset();
            toast('Budget enregistré avec succès');
            await renderBudget();
        });

        document.getElementById('btn-copy-prev-budget').addEventListener('click', async () => {
            const count = await Store.Budgets.copyFromPreviousMonth(currentYear, currentMonth);
            if (count > 0) {
                toast(`${count} budget(s) copié(s) depuis le mois précédent`);
                await renderBudget();
            } else {
                toast('Aucun budget trouvé le mois précédent', 'warning');
            }
        });
    }

    function editBudget(categoryId, amount, notes) {
        document.getElementById('budget-category').value = categoryId;
        document.getElementById('budget-amount').value = amount;
        document.getElementById('budget-notes').value = notes;
        document.getElementById('budget-category').focus();
    }

    async function deleteBudget(id) {
        showConfirm('Supprimer ce budget ?', async () => {
            await Store.Budgets.delete(id);
            toast('Budget supprimé');
            await renderBudget();
        });
    }

    // ===================================================================
    //  TRANSACTIONS VIEW
    // ===================================================================
    async function renderTransactions() {
        await populateCategorySelect('transaction-category');
        await populateCategorySelect('filter-category');

        const allTx = await Store.Transactions.getAll();
        const categories = await Store.Categories.getAll();
        let filtered = [...allTx];

        // Apply filters
        const fType = document.getElementById('filter-type').value;
        const fCat = document.getElementById('filter-category').value;
        const fFrom = document.getElementById('filter-date-from').value;
        const fTo = document.getElementById('filter-date-to').value;
        const fSearch = normalizeForSearch(document.getElementById('filter-search').value);

        if (fType) filtered = filtered.filter(t => t.type === fType);
        if (fCat) filtered = filtered.filter(t => t.categoryId === fCat);
        if (fFrom) filtered = filtered.filter(t => t.date >= fFrom);
        if (fTo) filtered = filtered.filter(t => t.date <= fTo);
        if (fSearch) filtered = filtered.filter(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const haystack = normalizeForSearch([
                t.description || '',
                t.notes || '',
                cat ? cat.name : '',
                `${t.amount}`,
                Number(t.amount || 0).toFixed(2),
                t.date || ''
            ].join(' '));
            return haystack.includes(fSearch);
        });

        // Sort
        filtered.sort((a, b) => {
            let va, vb;
            switch (transactionSort.field) {
                case 'date': va = a.date; vb = b.date; break;
                case 'amount': va = a.amount; vb = b.amount; break;
                case 'type': va = a.type; vb = b.type; break;
                case 'category':
                    const ca = categories.find(c => c.id === a.categoryId);
                    const cb = categories.find(c => c.id === b.categoryId);
                    va = ca ? ca.name : ''; vb = cb ? cb.name : '';
                    break;
                default: va = a.date; vb = b.date;
            }
            const cmp = va < vb ? -1 : va > vb ? 1 : 0;
            return transactionSort.dir === 'asc' ? cmp : -cmp;
        });

        // Summary
        const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        document.getElementById('transactions-count').textContent = `${filtered.length} transaction(s)`;
        document.getElementById('transactions-sum-badge').innerHTML =
            `<span class="amount-positive">+${Store.formatMoney(totalIncome)}</span> / <span class="amount-negative">-${Store.formatMoney(totalExpense)}</span>`;

        // Pagination
        const totalPages = Math.ceil(filtered.length / TX_PER_PAGE) || 1;
        if (transactionPage > totalPages) transactionPage = totalPages;
        const start = (transactionPage - 1) * TX_PER_PAGE;
        const paged = filtered.slice(start, start + TX_PER_PAGE);

        const tbody = document.getElementById('transactions-table-body');
        const empty = document.getElementById('transactions-empty');
        const table = document.getElementById('transactions-table');

        if (paged.length === 0) {
            tbody.innerHTML = '';
            empty.style.display = 'block';
            table.style.display = 'none';
        } else {
            empty.style.display = 'none';
            table.style.display = 'table';
            const todayStr = new Date().toISOString().split('T')[0];
            tbody.innerHTML = paged.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                const isExpense = t.type === 'expense';
                const isToday = t.date === todayStr;
                return `
                    <tr data-type="${t.type}">
                        <td style="font-family:var(--font-mono);font-size:0.82rem">${formatDate(t.date)}${isToday ? '<span class="tx-today-badge">Auj.</span>' : ''}</td>
                        <td><span class="tx-type-badge ${isExpense ? 'tx-type-expense' : 'tx-type-income'}">
                            <i class="fas ${isExpense ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                            ${isExpense ? 'Dépense' : 'Revenu'}
                        </span></td>
                        <td><span class="tx-category">
                            <span class="tx-cat-icon" style="background:${cat ? cat.color + '18' : '#94A3B818'};color:${cat ? cat.color : '#94A3B8'}">
                                <i class="${cat ? cat.icon : 'fas fa-tag'}"></i>
                            </span>
                            ${cat ? cat.name : 'Autre'}
                        </span></td>
                        <td>${escapeHtml(t.description)}${t.notes ? `<br><small style="color:var(--text-muted)">${escapeHtml(t.notes)}</small>` : ''}</td>
                        <td class="${isExpense ? 'amount-negative' : 'amount-positive'}" style="font-weight:700;font-family:var(--font-mono)">
                            ${isExpense ? '-' : '+'}${Store.formatMoney(t.amount)}
                        </td>
                        <td>
                            <div class="tx-actions">
                                <button class="btn btn-ghost btn-sm" onclick="App.editTransaction('${t.id}')">
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button class="btn btn-ghost btn-sm" onclick="App.deleteTransaction('${t.id}')">
                                    <i class="fas fa-trash" style="color:var(--danger)"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        renderPagination('transactions-pagination', transactionPage, totalPages, (page) => {
            transactionPage = page;
            renderTransactions();
        });

        document.querySelectorAll('#transactions-table .sortable').forEach(th => {
            th.onclick = () => {
                const field = th.dataset.sort;
                if (transactionSort.field === field) {
                    transactionSort.dir = transactionSort.dir === 'asc' ? 'desc' : 'asc';
                } else {
                    transactionSort = { field, dir: 'asc' };
                }
                renderTransactions();
            };
        });
    }

    function bindTransactionForm() {
        document.querySelectorAll('.toggle-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                opt.querySelector('input').checked = true;
                const type = opt.dataset.value;
                populateCategorySelect('transaction-category', type);
                saveTransactionDraft();
            });
        });

        ['transaction-amount', 'transaction-date', 'transaction-category', 'transaction-description', 'transaction-notes']
            .forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                const evt = el.tagName === 'SELECT' ? 'change' : 'input';
                el.addEventListener(evt, saveTransactionDraft);
            });

        document.getElementById('transaction-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('transaction-id').value;
            const type = document.querySelector('input[name="transaction-type"]:checked').value;
            const amount = parseFloat(document.getElementById('transaction-amount').value);
            const date = document.getElementById('transaction-date').value;
            const categoryId = document.getElementById('transaction-category').value;
            const description = document.getElementById('transaction-description').value.trim();
            const notes = document.getElementById('transaction-notes').value.trim();

            if (!categoryId || isNaN(amount) || !date || !description) {
                toast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            const data = { type, amount, date, categoryId, description, notes };

            if (id) {
                await Store.Transactions.update(id, data);
                toast('Transaction modifiée avec succès');
            } else {
                await Store.Transactions.create(data);
                toast('Transaction ajoutée avec succès');
            }

            if (!id) clearTransactionDraft();
            closeModal('modal-transaction');
            document.getElementById('transaction-form').reset();
            await renderView(currentView);
        });
    }

    async function openTransactionModal(id = null) {
        const form = document.getElementById('transaction-form');
        form.reset();
        document.getElementById('transaction-id').value = '';
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];

        document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
        document.querySelector('.toggle-option[data-value="expense"]').classList.add('active');
        document.querySelector('input[name="transaction-type"][value="expense"]').checked = true;

        await populateCategorySelect('transaction-category', 'expense');

        if (id) {
            clearTransactionDraft();
            const tx = await Store.Transactions.getById(id);
            if (tx) {
                document.getElementById('modal-transaction-title').textContent = 'Modifier la transaction';
                document.getElementById('transaction-id').value = tx.id;
                document.getElementById('transaction-amount').value = tx.amount;
                document.getElementById('transaction-date').value = tx.date;
                document.getElementById('transaction-description').value = tx.description;
                document.getElementById('transaction-notes').value = tx.notes || '';

                document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
                document.querySelector(`.toggle-option[data-value="${tx.type}"]`).classList.add('active');
                document.querySelector(`input[name="transaction-type"][value="${tx.type}"]`).checked = true;

                await populateCategorySelect('transaction-category', tx.type);
                setTimeout(() => {
                    document.getElementById('transaction-category').value = tx.categoryId;
                }, 0);
            }
        } else {
            document.getElementById('modal-transaction-title').textContent = 'Nouvelle transaction';
            await restoreTransactionDraft();
        }

        openModal('modal-transaction');
    }

    function editTransaction(id) {
        openTransactionModal(id);
    }

    function deleteTransaction(id) {
        showConfirm('Supprimer cette transaction ?', async () => {
            await Store.Transactions.delete(id);
            toast('Transaction supprimée');
            await renderView(currentView);
        });
    }

    function bindFilters() {
        ['filter-type', 'filter-category', 'filter-date-from', 'filter-date-to', 'filter-search'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                if (id === 'filter-date-from' || id === 'filter-date-to') resetQuickRangeChips();
                transactionPage = 1;
                renderTransactions();
            });
            if (id === 'filter-search') {
                document.getElementById(id).addEventListener('input', () => {
                    transactionPage = 1;
                    renderTransactions();
                });
            }
        });

        document.getElementById('btn-clear-filters').addEventListener('click', () => {
            document.getElementById('filter-type').value = '';
            document.getElementById('filter-category').value = '';
            document.getElementById('filter-date-from').value = '';
            document.getElementById('filter-date-to').value = '';
            document.getElementById('filter-search').value = '';
            resetQuickRangeChips();
            transactionPage = 1;
            renderTransactions();
        });

        document.getElementById('btn-export-transactions').addEventListener('click', () => exportTransactionsCSV());
    }

    async function exportTransactionsCSV() {
        const txs = await Store.Transactions.getAll();
        const categories = await Store.Categories.getAll();
        let csv = 'Date,Type,Catégorie,Description,Montant,Notes\n';
        txs.sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            csv += `"${t.date}","${t.type === 'expense' ? 'Dépense' : 'Revenu'}","${cat ? cat.name : 'Autre'}","${t.description}","${t.amount}","${t.notes || ''}"\n`;
        });
        downloadFile(csv, `transactions_${currentYear}.csv`, 'text/csv');
        toast('Transactions exportées en CSV');
    }

    // ===================================================================
    //  RECURRING VIEW
    // ===================================================================
    async function renderRecurring() {
        const items = await Store.Recurring.getAll();
        const categories = await Store.Categories.getAll();
        const tbody = document.getElementById('recurring-table-body');
        const empty = document.getElementById('recurring-empty');
        const table = document.getElementById('recurring-table');

        if (items.length === 0) {
            tbody.innerHTML = '';
            empty.style.display = 'block';
            table.style.display = 'none';
            return;
        }

        empty.style.display = 'none';
        table.style.display = 'table';

        const freqLabels = { weekly: 'Hebdomadaire', monthly: 'Mensuelle', quarterly: 'Trimestrielle', yearly: 'Annuelle' };

        tbody.innerHTML = items.map(r => {
            const cat = categories.find(c => c.id === r.categoryId);
            const isExpense = r.type === 'expense';
            const nextDue = r.lastGenerated
                ? getNextDueDate(r.lastGenerated, r.frequency)
                : r.startDate;

            return `
                <tr style="${!r.active ? 'opacity:0.5;' : ''}">
                    <td><span class="tx-type-badge ${isExpense ? 'tx-type-expense' : 'tx-type-income'}">
                        ${isExpense ? 'Dépense' : 'Revenu'}
                    </span></td>
                    <td><span class="tx-category">
                        <span class="tx-category-dot" style="background:${cat ? cat.color : '#94A3B8'}"></span>
                        ${cat ? cat.name : 'Autre'}
                    </span></td>
                    <td>${escapeHtml(r.description)}</td>
                    <td class="${isExpense ? 'amount-negative' : 'amount-positive'}" style="font-weight:600">
                        ${Store.formatMoney(r.amount)}
                    </td>
                    <td>${freqLabels[r.frequency] || r.frequency}</td>
                    <td>${formatDate(nextDue)}</td>
                    <td>
                        <span class="badge ${r.active ? 'badge-success' : 'badge-neutral'}">
                            ${r.active ? 'Actif' : 'Inactif'}
                        </span>
                    </td>
                    <td>
                        <div class="tx-actions">
                            <button class="btn btn-ghost btn-sm" onclick="App.toggleRecurring('${r.id}')" title="${r.active ? 'Désactiver' : 'Activer'}">
                                <i class="fas ${r.active ? 'fa-pause' : 'fa-play'}"></i>
                            </button>
                            <button class="btn btn-ghost btn-sm" onclick="App.editRecurring('${r.id}')">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn btn-ghost btn-sm" onclick="App.deleteRecurring('${r.id}')">
                                <i class="fas fa-trash" style="color:var(--danger)"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function bindRecurringForm() {
        document.getElementById('recurring-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('recurring-id').value;
            const type = document.getElementById('recurring-type').value;
            const categoryId = document.getElementById('recurring-category').value;
            const description = document.getElementById('recurring-description').value.trim();
            const amount = parseFloat(document.getElementById('recurring-amount').value);
            const frequency = document.getElementById('recurring-frequency').value;
            const startDate = document.getElementById('recurring-start').value;
            const endDate = document.getElementById('recurring-end').value || null;

            if (!categoryId || isNaN(amount) || !description || !startDate) {
                toast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            const data = { type, categoryId, description, amount, frequency, startDate, endDate };

            if (id) {
                await Store.Recurring.update(id, data);
                toast('Récurrence modifiée');
            } else {
                await Store.Recurring.create(data);
                toast('Récurrence créée');
            }

            closeModal('modal-recurring');
            await renderRecurring();
        });
    }

    async function openRecurringModal(id = null) {
        const form = document.getElementById('recurring-form');
        form.reset();
        document.getElementById('recurring-id').value = '';
        document.getElementById('recurring-start').value = new Date().toISOString().split('T')[0];

        await populateCategorySelect('recurring-category');

        if (id) {
            const rec = await Store.Recurring.getById(id);
            if (rec) {
                document.getElementById('modal-recurring-title').textContent = 'Modifier la récurrence';
                document.getElementById('recurring-id').value = rec.id;
                document.getElementById('recurring-type').value = rec.type;
                document.getElementById('recurring-description').value = rec.description;
                document.getElementById('recurring-amount').value = rec.amount;
                document.getElementById('recurring-frequency').value = rec.frequency;
                document.getElementById('recurring-start').value = rec.startDate;
                document.getElementById('recurring-end').value = rec.endDate || '';

                await populateCategorySelect('recurring-category');
                setTimeout(() => {
                    document.getElementById('recurring-category').value = rec.categoryId;
                }, 0);
            }
        } else {
            document.getElementById('modal-recurring-title').textContent = 'Nouvelle récurrence';
        }

        openModal('modal-recurring');
    }

    function editRecurring(id) { openRecurringModal(id); }

    function deleteRecurring(id) {
        showConfirm('Supprimer cette récurrence ?', async () => {
            await Store.Recurring.delete(id);
            toast('Récurrence supprimée');
            await renderRecurring();
        });
    }

    async function toggleRecurring(id) {
        await Store.Recurring.toggleActive(id);
        toast('Statut de la récurrence modifié');
        await renderRecurring();
    }

    // ===================================================================
    //  CATEGORIES VIEW
    // ===================================================================
    async function renderCategories() {
        const categories = await Store.Categories.getAll();
        const grid = document.getElementById('categories-grid');

        const typeLabels = { expense: 'Dépense', income: 'Revenu', both: 'Les deux' };

        grid.innerHTML = categories.map((cat, idx) => `
            <div class="category-card" style="animation-delay:${idx * 0.04}s">
                <div class="category-card-icon" style="background:${cat.color}20;color:${cat.color};border:1.5px solid ${cat.color}30">
                    <i class="${cat.icon}"></i>
                </div>
                <div class="category-card-info">
                    <div class="category-card-name">${escapeHtml(cat.name)}</div>
                    <div class="category-card-type">${typeLabels[cat.type] || cat.type}</div>
                </div>
                <div class="category-card-actions">
                    <button class="btn btn-ghost btn-sm" onclick="App.editCategory('${cat.id}')">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="App.deleteCategory('${cat.id}')">
                        <i class="fas fa-trash" style="color:var(--danger)"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function bindCategoryForm() {
        document.querySelectorAll('#icon-picker .icon-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('#icon-picker .icon-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        document.querySelectorAll('#color-picker .color-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('#color-picker .color-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        document.getElementById('category-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('category-id').value;
            const name = document.getElementById('category-name').value.trim();
            const type = document.getElementById('category-type').value;
            const icon = document.querySelector('#icon-picker .icon-option.selected')?.dataset.icon || 'fas fa-tag';
            const color = document.querySelector('#color-picker .color-option.selected')?.dataset.color || '#22C55E';

            if (!name) {
                toast('Le nom est obligatoire', 'error');
                return;
            }

            if (id) {
                await Store.Categories.update(id, { name, type, icon, color });
                toast('Catégorie modifiée');
            } else {
                await Store.Categories.create({ name, type, icon, color });
                toast('Catégorie créée');
            }

            closeModal('modal-category');
            await renderCategories();
        });
    }

    async function openCategoryModal(id = null) {
        const form = document.getElementById('category-form');
        form.reset();
        document.getElementById('category-id').value = '';

        document.querySelectorAll('#icon-picker .icon-option').forEach(o => o.classList.remove('selected'));
        document.querySelector('#icon-picker .icon-option').classList.add('selected');
        document.querySelectorAll('#color-picker .color-option').forEach(o => o.classList.remove('selected'));
        document.querySelector('#color-picker .color-option').classList.add('selected');

        if (id) {
            const cat = await Store.Categories.getById(id);
            if (cat) {
                document.getElementById('modal-category-title').textContent = 'Modifier la catégorie';
                document.getElementById('category-id').value = cat.id;
                document.getElementById('category-name').value = cat.name;
                document.getElementById('category-type').value = cat.type;

                document.querySelectorAll('#icon-picker .icon-option').forEach(o => {
                    o.classList.toggle('selected', o.dataset.icon === cat.icon);
                });

                document.querySelectorAll('#color-picker .color-option').forEach(o => {
                    o.classList.toggle('selected', o.dataset.color === cat.color);
                });
            }
        } else {
            document.getElementById('modal-category-title').textContent = 'Nouvelle catégorie';
        }

        openModal('modal-category');
    }

    function editCategory(id) { openCategoryModal(id); }

    function deleteCategory(id) {
        showConfirm('Supprimer cette catégorie ? Les transactions associées garderont leur catégorie.', async () => {
            await Store.Categories.delete(id);
            toast('Catégorie supprimée');
            await renderCategories();
        });
    }

    // ===================================================================
    //  GOALS VIEW
    // ===================================================================
    async function renderGoals() {
        const goals = await Store.Goals.getAll();
        const grid = document.getElementById('goals-grid');
        const empty = document.getElementById('goals-empty');

        if (goals.length === 0) {
            grid.innerHTML = '';
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';

        grid.innerHTML = goals.map(g => {
            const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
            const remaining = g.targetAmount - g.currentAmount;
            const color = g.color || '#22C55E';
            const deadlineText = g.deadline ? formatDate(g.deadline) : 'Pas d\'échéance';
            const isComplete = pct >= 100;

            return `
                <div class="goal-card${isComplete ? ' complete' : ''}" style="border-top: 3px solid ${color}">
                    <div class="goal-card-header">
                        <div style="flex:1">
                            <div class="goal-card-title">${escapeHtml(g.name)}</div>
                            <div class="goal-card-deadline"><i class="fas fa-calendar"></i> ${deadlineText}</div>
                            ${isComplete ? '<span class="badge badge-success" style="margin-top:0.4rem;display:inline-block">✅ Objectif atteint</span>' : ''}
                        </div>
                        <div class="budget-ring" style="--pct:${pct.toFixed(0)};--ring-clr:${isComplete ? '#22C55E' : color};width:54px;height:54px">
                            <span style="font-size:0.6rem">${pct.toFixed(0)}%</span>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin:0.6rem 0;font-family:var(--font-mono);font-size:0.82rem">
                        <span class="${isComplete ? 'amount-positive' : ''}" style="font-weight:700">${Store.formatMoney(g.currentAmount)}</span>
                        <span style="color:var(--text-muted);font-size:0.7rem">/ ${Store.formatMoney(g.targetAmount)}</span>
                        ${!isComplete ? `<span style="color:var(--text-secondary);font-size:0.72rem">Reste <strong style="color:var(--accent-rose)">${Store.formatMoney(remaining)}</strong></span>` : ''}
                    </div>
                    <div class="goal-progress-track" style="height:6px;border-radius:3px;background:rgba(255,255,255,0.06);overflow:hidden;margin-bottom:0.75rem">
                        <div style="height:100%;width:${pct}%;background:${isComplete ? '#22C55E' : color};border-radius:3px;transition:width 0.6s cubic-bezier(0.22,1,0.36,1)"></div>
                    </div>
                    ${g.notes ? `<div class="goal-card-notes">${escapeHtml(g.notes)}</div>` : ''}
                    <div class="goal-card-footer">
                        <div class="tx-actions">
                            ${!isComplete ? `<button class="btn btn-sm btn-primary" onclick="App.addToGoal('${g.id}')"><i class="fas fa-plus"></i> Ajouter</button>` : ''}
                            <button class="btn btn-ghost btn-sm" onclick="App.editGoal('${g.id}')"><i class="fas fa-pen"></i></button>
                            <button class="btn btn-ghost btn-sm" onclick="App.deleteGoal('${g.id}')"><i class="fas fa-trash" style="color:var(--danger)"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function bindGoalForm() {
        document.getElementById('goal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('goal-id').value;
            const name = document.getElementById('goal-name').value.trim();
            const targetAmount = parseFloat(document.getElementById('goal-target').value);
            const currentAmount = parseFloat(document.getElementById('goal-current').value) || 0;
            const deadline = document.getElementById('goal-deadline').value || null;
            const color = document.getElementById('goal-color').value;
            const notes = document.getElementById('goal-notes').value.trim();

            if (!name || isNaN(targetAmount)) {
                toast('Veuillez remplir les champs obligatoires', 'error');
                return;
            }

            const data = { name, targetAmount, currentAmount, deadline, color, notes };

            if (id) {
                await Store.Goals.update(id, data);
                toast('Objectif modifié');
            } else {
                await Store.Goals.create(data);
                toast('Objectif créé');
            }

            closeModal('modal-goal');
            await renderGoals();
        });
    }

    async function openGoalModal(id = null) {
        const form = document.getElementById('goal-form');
        form.reset();
        document.getElementById('goal-id').value = '';
        document.getElementById('goal-color').value = '#22C55E';

        if (id) {
            const g = await Store.Goals.getById(id);
            if (g) {
                document.getElementById('modal-goal-title').textContent = 'Modifier l\'objectif';
                document.getElementById('goal-id').value = g.id;
                document.getElementById('goal-name').value = g.name;
                document.getElementById('goal-target').value = g.targetAmount;
                document.getElementById('goal-current').value = g.currentAmount || 0;
                document.getElementById('goal-deadline').value = g.deadline || '';
                document.getElementById('goal-color').value = g.color || '#22C55E';
                document.getElementById('goal-notes').value = g.notes || '';
            }
        } else {
            document.getElementById('modal-goal-title').textContent = 'Nouvel objectif';
        }

        openModal('modal-goal');
    }

    function editGoal(id) { openGoalModal(id); }

    function deleteGoal(id) {
        showConfirm('Supprimer cet objectif ?', async () => {
            await Store.Goals.delete(id);
            toast('Objectif supprimé');
            await renderGoals();
        });
    }

    async function addToGoal(id) {
        const amount = prompt('Montant à ajouter (MAD) :');
        if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
            const goal = (await Store.Goals.getAll()).find(g => g.id === id);
            await Store.Goals.addAmount(id, parseFloat(amount));
            toast(`${Store.formatMoney(parseFloat(amount))} ajouté à l'objectif`);

            // Check if goal was just completed — launch confetti!
            if (goal && goal.currentAmount < goal.targetAmount) {
                const newAmount = goal.currentAmount + parseFloat(amount);
                if (newAmount >= goal.targetAmount && typeof Theme !== 'undefined') {
                    Theme.launchConfetti();
                    toast('🎉 Objectif atteint ! Félicitations !', 'success');
                }
            }

            await renderGoals();
        }
    }

    // ===================================================================
    //  INVENTORY & STOCK VIEW
    // ===================================================================

    async function renderInventory() {
        const items = await Inventory.getAll();
        const grid = document.getElementById('inventory-grid');
        const emptyEl = document.getElementById('inventory-empty');

        // Apply filters
        const filterCat = document.getElementById('inv-filter-category')?.value || '';
        const filterStatus = document.getElementById('inv-filter-status')?.value || '';
        const filterSearch = (document.getElementById('inv-filter-search')?.value || '').toLowerCase().trim();

        let filtered = items;
        if (filterCat) filtered = filtered.filter(i => i.category === filterCat);
        if (filterStatus) filtered = filtered.filter(i => Inventory.getItemStatus(i) === filterStatus);
        if (filterSearch) filtered = filtered.filter(i => i.name.toLowerCase().includes(filterSearch) || (i.location || '').toLowerCase().includes(filterSearch));

        // Update stats
        const allStatuses = items.map(i => ({ item: i, status: Inventory.getItemStatus(i) }));
        document.getElementById('inv-stat-total').textContent = items.length;
        document.getElementById('inv-stat-low').textContent = allStatuses.filter(s => s.status === 'low').length;
        document.getElementById('inv-stat-expiring').textContent = allStatuses.filter(s => s.status === 'expiring' || s.status === 'expired').length;
        document.getElementById('inv-stat-value').textContent = Inventory.formatMoney(
            items.reduce((sum, i) => sum + (i.quantity * i.price), 0)
        );

        if (!filtered.length) {
            grid.innerHTML = '';
            if (emptyEl) emptyEl.style.display = '';
            grid.appendChild(emptyEl);
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';

        grid.innerHTML = filtered.map(item => {
            const status = Inventory.getItemStatus(item);
            const badge = Inventory.getStatusBadge(status);
            const duration = Inventory.getDurationProgress(item);
            const expiry = Inventory.getExpiryInfo(item);
            const catIcon = Inventory.getCategoryIcon(item.category);
            const catLabel = Inventory.getCategoryLabel(item.category);

            let progressHTML = '';
            if (duration) {
                let progressClass = '';
                if (duration.pct >= 85) progressClass = 'progress-danger';
                else if (duration.pct >= 60) progressClass = 'progress-warning';

                progressHTML = `
                    <div class="inv-progress-wrap">
                        <div class="inv-progress-header">
                            <span class="inv-progress-label">Dur\u00e9e d'utilisation</span>
                            <span class="inv-progress-value">${duration.label}</span>
                        </div>
                        <div class="inv-progress-bar">
                            <div class="inv-progress-fill ${progressClass}" style="width:${duration.pct}%"></div>
                        </div>
                    </div>`;
            }

            let detailsHTML = '<div class="inv-card-details">';
            if (item.price > 0) {
                detailsHTML += `<div class="inv-detail-item"><span class="inv-detail-label">Prix unit.</span><span class="inv-detail-value">${Inventory.formatMoney(item.price)}</span></div>`;
            }
            if (item.purchaseDate) {
                detailsHTML += `<div class="inv-detail-item"><span class="inv-detail-label">Achet\u00e9</span><span class="inv-detail-value">${Inventory.formatDateShort(item.purchaseDate)}</span></div>`;
            }
            if (expiry) {
                detailsHTML += `<div class="inv-detail-item"><span class="inv-detail-label">Expiration</span><span class="inv-detail-value ${expiry.class}">${expiry.text}</span></div>`;
            }
            if (item.location) {
                detailsHTML += `<div class="inv-detail-item"><span class="inv-detail-label">Emplacement</span><span class="inv-detail-value">${escapeHtml(item.location)}</span></div>`;
            }
            detailsHTML += '</div>';

            // Hide details if empty
            const hasDetails = item.price > 0 || item.purchaseDate || expiry || item.location;

            return `
                <div class="inv-card" data-id="${item.id}">
                    <div class="inv-card-status-strip status-${status}"></div>
                    <div class="inv-card-body">
                        <div class="inv-card-header">
                            <div class="inv-card-icon cat-${item.category}">
                                <i class="${catIcon}"></i>
                            </div>
                            <div class="inv-card-title-wrap">
                                <div class="inv-card-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
                                <div class="inv-card-category">${escapeHtml(item.category)}</div>
                            </div>
                            <span class="inv-card-badge ${badge.class}">${badge.label}</span>
                        </div>
                        <div class="inv-card-quantity">
                            <span class="inv-card-qty-value">${item.quantity}</span>
                            <span class="inv-card-qty-unit">${escapeHtml(item.unit)}</span>
                            ${item.minQuantity > 0 ? `<span class="inv-card-qty-min">Min: ${item.minQuantity}</span>` : ''}
                        </div>
                        ${progressHTML}
                        ${hasDetails ? detailsHTML : ''}
                        <div class="inv-card-actions">
                            <button class="btn inv-action-use" onclick="App.useInventoryItem('${item.id}')"><i class="fas fa-minus-circle"></i> Utiliser</button>
                            <button class="btn inv-action-edit" onclick="App.editInventoryItem('${item.id}')"><i class="fas fa-edit"></i> Modifier</button>
                            <button class="btn inv-action-delete" onclick="App.deleteInventoryItem('${item.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    function openInventoryModal(item = null) {
        const modal = document.getElementById('modal-inventory');
        const title = document.getElementById('modal-inventory-title');
        const form = document.getElementById('inventory-form');

        form.reset();
        document.getElementById('inv-item-id').value = '';

        if (item) {
            title.innerHTML = '<i class="fas fa-box"></i> Modifier l\'article';
            document.getElementById('inv-item-id').value = item.id;
            document.getElementById('inv-item-name').value = item.name;
            document.getElementById('inv-item-category').value = item.category;
            document.getElementById('inv-item-quantity').value = item.quantity;
            document.getElementById('inv-item-unit').value = item.unit;
            document.getElementById('inv-item-price').value = item.price || '';
            document.getElementById('inv-item-min-qty').value = item.minQuantity || '';
            document.getElementById('inv-item-purchase-date').value = item.purchaseDate || '';
            document.getElementById('inv-item-expiry-date').value = item.expiryDate || '';
            document.getElementById('inv-item-duration').value = item.plannedDuration || '';
            document.getElementById('inv-item-location').value = item.location || '';
            document.getElementById('inv-item-notes').value = item.notes || '';
        } else {
            title.innerHTML = '<i class="fas fa-box"></i> Nouvel article';
            // Set purchase date to today by default
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('inv-item-purchase-date').value = today;
        }

        modal.classList.add('active');
    }

    function bindInventoryForm() {
        const form = document.getElementById('inventory-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('inv-item-id').value;
            const data = {
                name: document.getElementById('inv-item-name').value.trim(),
                category: document.getElementById('inv-item-category').value,
                quantity: parseFloat(document.getElementById('inv-item-quantity').value) || 0,
                unit: document.getElementById('inv-item-unit').value,
                price: parseFloat(document.getElementById('inv-item-price').value) || 0,
                minQuantity: parseFloat(document.getElementById('inv-item-min-qty').value) || 0,
                purchaseDate: document.getElementById('inv-item-purchase-date').value || null,
                expiryDate: document.getElementById('inv-item-expiry-date').value || null,
                plannedDuration: parseInt(document.getElementById('inv-item-duration').value) || null,
                location: document.getElementById('inv-item-location').value.trim(),
                notes: document.getElementById('inv-item-notes').value.trim()
            };

            let result;
            if (id) {
                result = await Inventory.update(id, data);
                if (result) toast('Article mis \u00e0 jour', 'success');
            } else {
                result = await Inventory.create(data);
                if (result) toast('Article ajout\u00e9 au stock', 'success');
            }

            if (result) {
                document.getElementById('modal-inventory').classList.remove('active');
                await renderInventory();
            } else {
                toast('Erreur lors de l\'enregistrement', 'error');
            }
        });

        // Bind add button
        const addBtn = document.getElementById('btn-add-inventory');
        if (addBtn) addBtn.addEventListener('click', () => openInventoryModal());

        // Bind export button
        const exportBtn = document.getElementById('btn-export-inventory');
        if (exportBtn) exportBtn.addEventListener('click', async () => {
            const items = await Inventory.getAll();
            Inventory.exportCSV(items);
            toast('Inventaire export\u00e9', 'success');
        });

        // Bind filters
        ['inv-filter-category', 'inv-filter-status'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderInventory());
        });

        const searchEl = document.getElementById('inv-filter-search');
        if (searchEl) {
            let debounce;
            searchEl.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => renderInventory(), 300);
            });
        }

        const clearBtn = document.getElementById('btn-inv-clear-filters');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            document.getElementById('inv-filter-category').value = '';
            document.getElementById('inv-filter-status').value = '';
            document.getElementById('inv-filter-search').value = '';
            renderInventory();
        });
    }

    async function editInventoryItem(id) {
        const item = await Inventory.getById(id);
        if (item) openInventoryModal(item);
    }

    async function deleteInventoryItem(id) {
        confirmCallback = async () => {
            const success = await Inventory.remove(id);
            if (success) {
                toast('Article supprim\u00e9', 'success');
                await renderInventory();
            }
        };
        document.getElementById('confirm-message').textContent = 'Supprimer cet article de l\'inventaire ?';
        document.getElementById('modal-confirm').classList.add('active');
    }

    // Use quantity popup
    let usePopupItem = null;

    function useInventoryItem(id) {
        // Create a simple prompt
        const amount = prompt('Quantit\u00e9 utilis\u00e9e :');
        if (amount === null) return;
        const qty = parseFloat(amount);
        if (isNaN(qty) || qty <= 0) {
            toast('Quantit\u00e9 invalide', 'error');
            return;
        }
        (async () => {
            const result = await Inventory.useQuantity(id, qty);
            if (result) {
                toast(`${qty} utilis\u00e9(e)s — Reste: ${result.quantity} ${result.unit}`, 'success');
                await renderInventory();
            }
        })();
    }

    // ===================================================================
    //  BOOKS / BIBLIOTHÈQUE VIEW
    // ===================================================================

    async function renderBooks() {
        const allBooks = await Books.getAll();
        const grid = document.getElementById('books-grid');
        const emptyEl = document.getElementById('books-empty');
        const readingCard = document.getElementById('books-reading-card');
        const readingList = document.getElementById('books-reading-list');

        // Filters
        const filterStatus = document.getElementById('book-filter-status')?.value || '';
        const filterGenre = document.getElementById('book-filter-genre')?.value || '';
        const filterSearch = (document.getElementById('book-filter-search')?.value || '').toLowerCase().trim();

        let filtered = allBooks;
        if (filterStatus) filtered = filtered.filter(b => b.status === filterStatus);
        if (filterGenre) filtered = filtered.filter(b => b.genre === filterGenre);
        if (filterSearch) filtered = filtered.filter(b =>
            b.title.toLowerCase().includes(filterSearch) ||
            b.author.toLowerCase().includes(filterSearch)
        );

        // Stats
        const stats = Books.getStats(allBooks);
        document.getElementById('book-stat-total').textContent = stats.total;
        document.getElementById('book-stat-reading').textContent = stats.reading;
        document.getElementById('book-stat-finished').textContent = stats.finished;
        document.getElementById('book-stat-pages').textContent = stats.totalPages.toLocaleString('fr-FR');

        // Currently reading section
        const currentlyReading = allBooks.filter(b => b.status === 'reading');
        if (currentlyReading.length > 0 && readingCard) {
            readingCard.style.display = '';
            readingList.innerHTML = currentlyReading.map(book => {
                const pct = Books.getReadingProgress(book);
                return `
                    <div class="book-reading-item">
                        <div class="book-reading-cover">${Books.getGenreEmoji(book.genre)}</div>
                        <div class="book-reading-info">
                            <div class="book-reading-title">${escapeHtml(book.title)}</div>
                            <div class="book-reading-author">${escapeHtml(book.author || 'Auteur inconnu')}</div>
                            <div class="book-reading-progress-wrap">
                                <div class="book-reading-progress-bar">
                                    <div class="book-reading-progress-fill" style="width:${pct}%"></div>
                                </div>
                                <span class="book-reading-progress-text">${book.currentPage}/${book.totalPages} pages (${pct}%)</span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="App.updateBookProgress('${book.id}')"><i class="fas fa-bookmark"></i> Mettre à jour</button>
                    </div>`;
            }).join('');
        } else if (readingCard) {
            readingCard.style.display = 'none';
        }

        // Main grid
        if (!filtered.length) {
            grid.innerHTML = '';
            if (emptyEl) { emptyEl.style.display = ''; grid.appendChild(emptyEl); }
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';

        grid.innerHTML = filtered.map((book, idx) => {
            const pct = Books.getReadingProgress(book);
            const statusInfo = Books.getStatusInfo(book.status);
            const genreEmoji = Books.getGenreEmoji(book.genre);
            const genreLabel = Books.getGenreLabel(book.genre);

            let progressHTML = '';
            if (book.totalPages > 0 && book.status !== 'to-read') {
                const progressClass = pct >= 100 ? 'progress-complete' : pct >= 60 ? 'progress-good' : '';
                progressHTML = `
                    <div class="book-progress-wrap">
                        <div class="book-progress-bar">
                            <div class="book-progress-fill ${progressClass}" style="width:${pct}%"></div>
                        </div>
                        <span class="book-progress-text">${book.currentPage}/${book.totalPages} pages — ${pct}%</span>
                    </div>`;
            }

            const starsHTML = Books.renderStars(book.rating);

            let datesHTML = '';
            if (book.startDate || book.finishDate) {
                datesHTML = '<div class="book-card-dates">';
                if (book.startDate) datesHTML += `<span><i class="fas fa-play"></i> ${Books.formatDateShort(book.startDate)}</span>`;
                if (book.finishDate) datesHTML += `<span><i class="fas fa-flag-checkered"></i> ${Books.formatDateShort(book.finishDate)}</span>`;
                datesHTML += '</div>';
            }

            return `
                <div class="book-card" data-id="${book.id}" style="animation-delay:${idx * 0.05}s">
                    <div class="book-card-cover-area">
                        <span class="book-card-emoji">${genreEmoji}</span>
                        <span class="book-card-badge ${statusInfo.class}">${statusInfo.label}</span>
                        ${book.favorite ? '<span class="book-card-fav"><i class="fas fa-heart"></i></span>' : ''}
                    </div>
                    <div class="book-card-body">
                        <div class="book-card-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</div>
                        <div class="book-card-author">${escapeHtml(book.author || 'Auteur inconnu')}</div>
                        <div class="book-card-genre">${genreLabel}</div>
                        ${book.rating > 0 ? `<div class="book-card-rating">${starsHTML}</div>` : ''}
                        ${progressHTML}
                        ${datesHTML}
                        ${book.notes ? `<div class="book-card-notes">${escapeHtml(book.notes).substring(0, 120)}${book.notes.length > 120 ? '...' : ''}</div>` : ''}
                        <div class="book-card-actions">
                            ${book.status === 'reading' ? `<button class="btn book-action-progress" onclick="App.updateBookProgress('${book.id}')"><i class="fas fa-bookmark"></i> Progression</button>` : ''}
                            <button class="btn book-action-edit" onclick="App.editBook('${book.id}')"><i class="fas fa-edit"></i> Modifier</button>
                            <button class="btn book-action-fav" onclick="App.toggleBookFavorite('${book.id}')" title="${book.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}"><i class="${book.favorite ? 'fas' : 'far'} fa-heart"></i></button>
                            <button class="btn book-action-delete" onclick="App.deleteBook('${book.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    function openBookModal(book = null) {
        const form = document.getElementById('book-form');
        const title = document.getElementById('modal-book-title');
        form.reset();
        document.getElementById('book-id').value = '';
        document.getElementById('book-current-page').value = 0;
        document.getElementById('book-rating').value = 0;

        if (book) {
            title.innerHTML = '<i class="fas fa-book"></i> Modifier le livre';
            document.getElementById('book-id').value = book.id;
            document.getElementById('book-title').value = book.title;
            document.getElementById('book-author').value = book.author || '';
            document.getElementById('book-genre').value = book.genre || 'autre';
            document.getElementById('book-total-pages').value = book.totalPages || '';
            document.getElementById('book-current-page').value = book.currentPage || 0;
            document.getElementById('book-status').value = book.status || 'to-read';
            document.getElementById('book-rating').value = book.rating || 0;
            document.getElementById('book-start-date').value = book.startDate || '';
            document.getElementById('book-finish-date').value = book.finishDate || '';
            document.getElementById('book-notes').value = book.notes || '';
        } else {
            title.innerHTML = '<i class="fas fa-book"></i> Nouveau livre';
        }

        document.getElementById('modal-book').classList.add('active');
    }

    function bindBookForm() {
        const form = document.getElementById('book-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('book-id').value;
            const data = {
                title: document.getElementById('book-title').value.trim(),
                author: document.getElementById('book-author').value.trim(),
                genre: document.getElementById('book-genre').value,
                totalPages: parseInt(document.getElementById('book-total-pages').value) || 0,
                currentPage: parseInt(document.getElementById('book-current-page').value) || 0,
                status: document.getElementById('book-status').value,
                rating: parseInt(document.getElementById('book-rating').value) || 0,
                startDate: document.getElementById('book-start-date').value || null,
                finishDate: document.getElementById('book-finish-date').value || null,
                notes: document.getElementById('book-notes').value.trim()
            };

            if (!data.title) {
                toast('Le titre est obligatoire', 'error');
                return;
            }

            let result;
            if (id) {
                result = await Books.update(id, data);
                if (result) toast('Livre mis à jour', 'success');
            } else {
                result = await Books.create(data);
                if (result) toast('Livre ajouté à la bibliothèque', 'success');
            }

            if (result) {
                document.getElementById('modal-book').classList.remove('active');
                await renderBooks();
            } else {
                toast('Erreur lors de l\'enregistrement', 'error');
            }
        });

        // Bind add button
        const addBtn = document.getElementById('btn-add-book');
        if (addBtn) addBtn.addEventListener('click', () => openBookModal());

        // Bind export button
        const exportBtn = document.getElementById('btn-export-books');
        if (exportBtn) exportBtn.addEventListener('click', async () => {
            const books = await Books.getAll();
            Books.exportCSV(books);
            toast('Bibliothèque exportée', 'success');
        });

        // Bind filters
        ['book-filter-status', 'book-filter-genre'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderBooks());
        });

        const searchEl = document.getElementById('book-filter-search');
        if (searchEl) {
            let debounce;
            searchEl.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => renderBooks(), 300);
            });
        }

        const clearBtn = document.getElementById('btn-book-clear-filters');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            document.getElementById('book-filter-status').value = '';
            document.getElementById('book-filter-genre').value = '';
            document.getElementById('book-filter-search').value = '';
            renderBooks();
        });
    }

    async function editBook(id) {
        const book = await Books.getById(id);
        if (book) openBookModal(book);
    }

    async function deleteBook(id) {
        confirmCallback = async () => {
            const success = await Books.remove(id);
            if (success) {
                toast('Livre supprimé', 'success');
                await renderBooks();
            }
        };
        document.getElementById('confirm-message').textContent = 'Supprimer ce livre de la bibliothèque ?';
        document.getElementById('modal-confirm').classList.add('active');
    }

    async function toggleBookFavorite(id) {
        const book = await Books.getById(id);
        if (!book) return;
        await Books.update(id, { favorite: !book.favorite });
        toast(book.favorite ? 'Retiré des favoris' : 'Ajouté aux favoris', 'success');
        await renderBooks();
    }

    function updateBookProgress(id) {
        const pageStr = prompt('Page actuelle :');
        if (pageStr === null) return;
        const page = parseInt(pageStr);
        if (isNaN(page) || page < 0) {
            toast('Page invalide', 'error');
            return;
        }
        (async () => {
            const result = await Books.updateProgress(id, page);
            if (result) {
                const pct = Books.getReadingProgress(result);
                toast(`Progression mise à jour : page ${result.currentPage} (${pct}%)`, 'success');
                if (result.status === 'finished') {
                    toast('🎉 Félicitations ! Livre terminé !', 'success');
                }
                await renderBooks();
            }
        })();
    }

    // ===================================================================
    //  FITNESS VIEW
    // ===================================================================

    async function renderFitness() {
        const allWorkouts = await Fitness.getAll();
        const grid = document.getElementById('fitness-grid');
        const emptyEl = document.getElementById('fitness-empty');

        const filterType = document.getElementById('fitness-filter-type')?.value || '';
        const filterSearch = (document.getElementById('fitness-filter-search')?.value || '').toLowerCase().trim();

        let filtered = allWorkouts;
        if (filterType) filtered = filtered.filter(w => w.type === filterType);
        if (filterSearch) filtered = filtered.filter(w => w.title.toLowerCase().includes(filterSearch) || (w.notes||'').toLowerCase().includes(filterSearch));

        const stats = Fitness.getStats(allWorkouts);
        document.getElementById('fitness-stat-total').textContent = stats.total;
        document.getElementById('fitness-stat-week').textContent = stats.thisWeek;
        document.getElementById('fitness-stat-duration').textContent = Fitness.formatDuration(stats.totalDuration);
        document.getElementById('fitness-stat-calories').textContent = stats.totalCalories.toLocaleString('fr-FR');

        if (!filtered.length) {
            grid.innerHTML = '';
            if (emptyEl) { emptyEl.style.display = ''; grid.appendChild(emptyEl); }
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        grid.innerHTML = filtered.map(w => {
            const ti = Fitness.getTypeInfo(w.type);
            const mood = Fitness.renderMood(w.mood);
            const dateStr = new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
            return `
                <div class="fitness-card" data-id="${w.id}">
                    <div class="fitness-card-header">
                        <span class="fitness-card-emoji">${ti.emoji}</span>
                        <div class="fitness-card-info">
                            <div class="fitness-card-title">${escapeHtml(w.title)}</div>
                            <div class="fitness-card-type">${ti.label}</div>
                        </div>
                        <span class="fitness-card-mood">${mood}</span>
                    </div>
                    <div class="fitness-card-meta">
                        <span><i class="fas fa-calendar"></i> ${dateStr}</span>
                        ${w.duration ? `<span class="fitness-duration-badge"><i class="fas fa-clock"></i> ${Fitness.formatDuration(w.duration)}</span>` : ''}
                        ${w.calories ? `<span><i class="fas fa-fire"></i> ${w.calories} kcal</span>` : ''}
                    </div>
                    ${w.exercises && w.exercises !== '[]' ? `<div class="fitness-card-exercises">${escapeHtml(typeof w.exercises === 'string' ? w.exercises : '').substring(0, 150)}</div>` : ''}
                    ${w.notes ? `<div class="fitness-card-notes">${escapeHtml(w.notes).substring(0, 100)}</div>` : ''}
                    <div class="fitness-card-actions">
                        <button class="btn fitness-action-edit" onclick="App.editWorkout('${w.id}')"><i class="fas fa-edit"></i> Modifier</button>
                        <button class="btn fitness-action-delete" onclick="App.deleteWorkout('${w.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        }).join('');
    }

    function openFitnessModal(w = null) {
        const form = document.getElementById('fitness-form');
        const title = document.getElementById('modal-fitness-title');
        form.reset();
        document.getElementById('workout-id').value = '';
        document.getElementById('workout-date').value = new Date().toISOString().split('T')[0];

        if (w) {
            title.innerHTML = '<i class="fas fa-dumbbell"></i> Modifier l\'entraînement';
            document.getElementById('workout-id').value = w.id;
            document.getElementById('workout-title').value = w.title;
            document.getElementById('workout-type').value = w.type || 'strength';
            document.getElementById('workout-date').value = w.date || '';
            document.getElementById('workout-duration').value = w.duration || '';
            document.getElementById('workout-calories').value = w.calories || '';
            document.getElementById('workout-mood').value = w.mood || 3;
            document.getElementById('workout-exercises').value = w.exercises || '';
            document.getElementById('workout-notes').value = w.notes || '';
        } else {
            title.innerHTML = '<i class="fas fa-dumbbell"></i> Nouvel entraînement';
        }
        document.getElementById('modal-fitness').classList.add('active');
    }

    function bindFitnessForm() {
        const form = document.getElementById('fitness-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('workout-id').value;
            const data = {
                title: document.getElementById('workout-title').value.trim(),
                type: document.getElementById('workout-type').value,
                date: document.getElementById('workout-date').value,
                duration: parseInt(document.getElementById('workout-duration').value) || 0,
                calories: parseInt(document.getElementById('workout-calories').value) || 0,
                mood: parseInt(document.getElementById('workout-mood').value) || 3,
                exercises: document.getElementById('workout-exercises').value.trim(),
                notes: document.getElementById('workout-notes').value.trim()
            };
            if (!data.title) { toast('Le titre est obligatoire', 'error'); return; }

            let result;
            if (id) { result = await Fitness.update(id, data); if (result) toast('Entraînement mis à jour', 'success'); }
            else { result = await Fitness.create(data); if (result) toast('Entraînement ajouté 💪', 'success'); }

            if (result) { document.getElementById('modal-fitness').classList.remove('active'); await renderFitness(); }
            else toast('Erreur lors de l\'enregistrement', 'error');
        });

        const addBtn = document.getElementById('btn-add-workout');
        if (addBtn) addBtn.addEventListener('click', () => openFitnessModal());

        const exportBtn = document.getElementById('btn-export-fitness');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Fitness.exportCSV(await Fitness.getAll()); toast('Fitness exporté', 'success'); });

        ['fitness-filter-type'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderFitness()); });
        const search = document.getElementById('fitness-filter-search');
        if (search) { let d; search.addEventListener('input', () => { clearTimeout(d); d = setTimeout(() => renderFitness(), 300); }); }
        const clearBtn = document.getElementById('btn-fitness-clear-filters');
        if (clearBtn) clearBtn.addEventListener('click', () => { document.getElementById('fitness-filter-type').value = ''; document.getElementById('fitness-filter-search').value = ''; renderFitness(); });
    }

    async function editWorkout(id) { const w = await Fitness.getById(id); if (w) openFitnessModal(w); }
    async function deleteWorkout(id) {
        confirmCallback = async () => { if (await Fitness.remove(id)) { toast('Entraînement supprimé', 'success'); await renderFitness(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cet entraînement ?';
        document.getElementById('modal-confirm').classList.add('active');
    }

    // ===================================================================
    //  RECIPES VIEW
    // ===================================================================

    async function renderRecipes() {
        const allRecipes = await Recipes.getAll();
        const grid = document.getElementById('recipes-grid');
        const emptyEl = document.getElementById('recipes-empty');

        const filterCat = document.getElementById('recipe-filter-category')?.value || '';
        const filterDiff = document.getElementById('recipe-filter-difficulty')?.value || '';
        const filterSearch = (document.getElementById('recipe-filter-search')?.value || '').toLowerCase().trim();

        let filtered = allRecipes;
        if (filterCat) filtered = filtered.filter(r => r.category === filterCat);
        if (filterDiff) filtered = filtered.filter(r => r.difficulty === filterDiff);
        if (filterSearch) filtered = filtered.filter(r => r.title.toLowerCase().includes(filterSearch) || (r.cuisine||'').toLowerCase().includes(filterSearch));

        const stats = Recipes.getStats(allRecipes);
        document.getElementById('recipe-stat-total').textContent = stats.total;
        document.getElementById('recipe-stat-favorites').textContent = stats.favorites;
        document.getElementById('recipe-stat-rating').textContent = stats.avgRating;
        document.getElementById('recipe-stat-categories').textContent = stats.categories;

        if (!filtered.length) {
            grid.innerHTML = '';
            if (emptyEl) { emptyEl.style.display = ''; grid.appendChild(emptyEl); }
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        grid.innerHTML = filtered.map(r => {
            const catInfo = Recipes.getCategoryInfo(r.category);
            const diffInfo = Recipes.getDifficultyInfo(r.difficulty);
            const totalTime = Recipes.getTotalTime(r);
            const starsHTML = r.rating > 0 ? Recipes.renderStars(r.rating) : '';
            return `
                <div class="recipe-card" data-id="${r.id}">
                    <div class="recipe-card-cover">
                        <span class="recipe-card-emoji">${catInfo.emoji}</span>
                        <span class="recipe-card-badge ${diffInfo.class}">${diffInfo.label}</span>
                        ${r.favorite ? '<span class="recipe-card-fav"><i class="fas fa-heart"></i></span>' : ''}
                    </div>
                    <div class="recipe-card-body">
                        <div class="recipe-card-title">${escapeHtml(r.title)}</div>
                        ${r.cuisine ? `<div class="recipe-card-cuisine">${escapeHtml(r.cuisine)}</div>` : ''}
                        <div class="recipe-card-meta">
                            ${r.prepTime ? `<span><i class="fas fa-cut"></i> ${Recipes.formatTime(r.prepTime)}</span>` : ''}
                            ${r.cookTime ? `<span><i class="fas fa-fire"></i> ${Recipes.formatTime(r.cookTime)}</span>` : ''}
                            ${totalTime ? `<span><i class="fas fa-clock"></i> ${Recipes.formatTime(totalTime)}</span>` : ''}
                            <span><i class="fas fa-users"></i> ${r.servings} pers.</span>
                        </div>
                        ${starsHTML ? `<div class="recipe-card-rating">${starsHTML}</div>` : ''}
                        ${r.ingredients ? `<div class="recipe-card-preview">${escapeHtml(r.ingredients).substring(0, 100)}...</div>` : ''}
                        <div class="recipe-card-actions">
                            <button class="btn recipe-action-edit" onclick="App.editRecipe('${r.id}')"><i class="fas fa-edit"></i> Modifier</button>
                            <button class="btn recipe-action-fav" onclick="App.toggleRecipeFavorite('${r.id}')"><i class="${r.favorite ? 'fas' : 'far'} fa-heart"></i></button>
                            <button class="btn recipe-action-delete" onclick="App.deleteRecipe('${r.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    function openRecipeModal(r = null) {
        const form = document.getElementById('recipe-form');
        const title = document.getElementById('modal-recipe-title');
        form.reset();
        document.getElementById('recipe-id').value = '';
        document.getElementById('recipe-rating').value = 0;
        document.getElementById('recipe-servings').value = 4;

        if (r) {
            title.innerHTML = '<i class="fas fa-utensils"></i> Modifier la recette';
            document.getElementById('recipe-id').value = r.id;
            document.getElementById('recipe-title').value = r.title;
            document.getElementById('recipe-category').value = r.category || 'autre';
            document.getElementById('recipe-cuisine').value = r.cuisine || '';
            document.getElementById('recipe-difficulty').value = r.difficulty || 'medium';
            document.getElementById('recipe-prep-time').value = r.prepTime || '';
            document.getElementById('recipe-cook-time').value = r.cookTime || '';
            document.getElementById('recipe-servings').value = r.servings || 4;
            document.getElementById('recipe-rating').value = r.rating || 0;
            document.getElementById('recipe-ingredients').value = r.ingredients || '';
            document.getElementById('recipe-steps').value = r.steps || '';
            document.getElementById('recipe-notes').value = r.notes || '';
        } else {
            title.innerHTML = '<i class="fas fa-utensils"></i> Nouvelle recette';
        }
        document.getElementById('modal-recipe').classList.add('active');
    }

    function bindRecipeForm() {
        const form = document.getElementById('recipe-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('recipe-id').value;
            const data = {
                title: document.getElementById('recipe-title').value.trim(),
                category: document.getElementById('recipe-category').value,
                cuisine: document.getElementById('recipe-cuisine').value.trim(),
                difficulty: document.getElementById('recipe-difficulty').value,
                prepTime: parseInt(document.getElementById('recipe-prep-time').value) || 0,
                cookTime: parseInt(document.getElementById('recipe-cook-time').value) || 0,
                servings: parseInt(document.getElementById('recipe-servings').value) || 4,
                rating: parseInt(document.getElementById('recipe-rating').value) || 0,
                ingredients: document.getElementById('recipe-ingredients').value.trim(),
                steps: document.getElementById('recipe-steps').value.trim(),
                notes: document.getElementById('recipe-notes').value.trim()
            };
            if (!data.title) { toast('Le titre est obligatoire', 'error'); return; }

            let result;
            if (id) { result = await Recipes.update(id, data); if (result) toast('Recette mise à jour', 'success'); }
            else { result = await Recipes.create(data); if (result) toast('Recette ajoutée 🍽️', 'success'); }

            if (result) { document.getElementById('modal-recipe').classList.remove('active'); await renderRecipes(); }
            else toast('Erreur lors de l\'enregistrement', 'error');
        });

        const addBtn = document.getElementById('btn-add-recipe');
        if (addBtn) addBtn.addEventListener('click', () => openRecipeModal());

        const exportBtn = document.getElementById('btn-export-recipes');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Recipes.exportCSV(await Recipes.getAll()); toast('Recettes exportées', 'success'); });

        ['recipe-filter-category', 'recipe-filter-difficulty'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderRecipes()); });
        const search = document.getElementById('recipe-filter-search');
        if (search) { let d; search.addEventListener('input', () => { clearTimeout(d); d = setTimeout(() => renderRecipes(), 300); }); }
        const clearBtn = document.getElementById('btn-recipe-clear-filters');
        if (clearBtn) clearBtn.addEventListener('click', () => { document.getElementById('recipe-filter-category').value = ''; document.getElementById('recipe-filter-difficulty').value = ''; document.getElementById('recipe-filter-search').value = ''; renderRecipes(); });
    }

    async function editRecipe(id) { const r = await Recipes.getById(id); if (r) openRecipeModal(r); }
    async function deleteRecipe(id) {
        confirmCallback = async () => { if (await Recipes.remove(id)) { toast('Recette supprimée', 'success'); await renderRecipes(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette recette ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleRecipeFavorite(id) {
        const r = await Recipes.getById(id);
        if (!r) return;
        await Recipes.update(id, { favorite: !r.favorite });
        toast(r.favorite ? 'Retiré des favoris' : 'Ajouté aux favoris', 'success');
        await renderRecipes();
    }

    // ===================================================================
    //  NOTES / JOURNAL VIEW
    // ===================================================================

    async function renderNotes() {
        const allNotes = await Notes.getAll();
        const grid = document.getElementById('notes-grid');
        const emptyEl = document.getElementById('notes-empty');

        const filterMood = document.getElementById('note-filter-mood')?.value || '';
        const filterSearch = (document.getElementById('note-filter-search')?.value || '').toLowerCase().trim();

        let filtered = allNotes;
        if (filterMood) filtered = filtered.filter(n => n.mood === parseInt(filterMood));
        if (filterSearch) filtered = filtered.filter(n =>
            (n.title||'').toLowerCase().includes(filterSearch) ||
            (n.content||'').toLowerCase().includes(filterSearch) ||
            (n.tags||'').toLowerCase().includes(filterSearch)
        );

        const stats = Notes.getStats(allNotes);
        document.getElementById('note-stat-total').textContent = stats.total;
        document.getElementById('note-stat-pinned').textContent = stats.pinned;
        document.getElementById('note-stat-tags').textContent = stats.tags;
        document.getElementById('note-stat-mood').textContent = stats.avgMood;

        if (!filtered.length) {
            grid.innerHTML = '';
            if (emptyEl) { emptyEl.style.display = ''; grid.appendChild(emptyEl); }
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        grid.innerHTML = filtered.map(n => {
            const moodInfo = Notes.getMoodInfo(n.mood);
            const tags = Notes.parseTags(n.tags);
            const colorStyle = n.color ? `border-left: 4px solid ${n.color}` : '';
            return `
                <div class="note-card ${n.pinned ? 'note-pinned' : ''}" data-id="${n.id}" style="${colorStyle}">
                    ${n.pinned ? '<span class="note-pin-icon"><i class="fas fa-thumbtack"></i></span>' : ''}
                    <div class="note-card-header">
                        <div class="note-card-title">${escapeHtml(n.title || 'Sans titre')}</div>
                        ${moodInfo.emoji ? `<span class="note-card-mood">${moodInfo.emoji}</span>` : ''}
                    </div>
                    <div class="note-card-content">${escapeHtml(n.content).substring(0, 200)}${n.content.length > 200 ? '...' : ''}</div>
                    ${tags.length ? `<div class="note-card-tags">${tags.map(t => `<span class="note-tag">#${escapeHtml(t)}</span>`).join(' ')}</div>` : ''}
                    <div class="note-card-footer">
                        <span class="note-card-date">${Notes.formatDate(n.updatedAt)}</span>
                    </div>
                    <div class="note-card-actions">
                        <button class="btn note-action-pin" onclick="App.toggleNotePin('${n.id}')" title="${n.pinned ? 'Désépingler' : 'Épingler'}"><i class="fas fa-thumbtack"></i></button>
                        <button class="btn note-action-edit" onclick="App.editNote('${n.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn note-action-archive" onclick="App.archiveNote('${n.id}')" title="Archiver"><i class="fas fa-archive"></i></button>
                        <button class="btn note-action-delete" onclick="App.deleteNote('${n.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        }).join('');
    }

    function openNoteModal(n = null) {
        const form = document.getElementById('note-form');
        const title = document.getElementById('modal-note-title');
        form.reset();
        document.getElementById('note-id').value = '';

        if (n) {
            title.innerHTML = '<i class="fas fa-sticky-note"></i> Modifier la note';
            document.getElementById('note-id').value = n.id;
            document.getElementById('note-title').value = n.title || '';
            document.getElementById('note-content').value = n.content || '';
            document.getElementById('note-mood').value = n.mood || 0;
            document.getElementById('note-tags').value = n.tags || '';
            document.getElementById('note-color').value = n.color || '';
        } else {
            title.innerHTML = '<i class="fas fa-sticky-note"></i> Nouvelle note';
        }
        document.getElementById('modal-note').classList.add('active');
    }

    function bindNoteForm() {
        const form = document.getElementById('note-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('note-id').value;
            const data = {
                title: document.getElementById('note-title').value.trim(),
                content: document.getElementById('note-content').value.trim(),
                mood: parseInt(document.getElementById('note-mood').value) || 0,
                tags: document.getElementById('note-tags').value.trim(),
                color: document.getElementById('note-color').value
            };
            if (!data.content) { toast('Le contenu est obligatoire', 'error'); return; }

            let result;
            if (id) { result = await Notes.update(id, data); if (result) toast('Note mise à jour', 'success'); }
            else { result = await Notes.create(data); if (result) toast('Note ajoutée ✏️', 'success'); }

            if (result) { document.getElementById('modal-note').classList.remove('active'); await renderNotes(); }
            else toast('Erreur lors de l\'enregistrement', 'error');
        });

        const addBtn = document.getElementById('btn-add-note');
        if (addBtn) addBtn.addEventListener('click', () => openNoteModal());

        const exportBtn = document.getElementById('btn-export-notes');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Notes.exportCSV(await Notes.getAll()); toast('Journal exporté', 'success'); });

        ['note-filter-mood'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderNotes()); });
        const search = document.getElementById('note-filter-search');
        if (search) { let d; search.addEventListener('input', () => { clearTimeout(d); d = setTimeout(() => renderNotes(), 300); }); }
        const clearBtn = document.getElementById('btn-note-clear-filters');
        if (clearBtn) clearBtn.addEventListener('click', () => { document.getElementById('note-filter-mood').value = ''; document.getElementById('note-filter-search').value = ''; renderNotes(); });
    }

    async function editNote(id) { const n = await Notes.getById(id); if (n) openNoteModal(n); }
    async function deleteNote(id) {
        confirmCallback = async () => { if (await Notes.remove(id)) { toast('Note supprimée', 'success'); await renderNotes(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette note ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleNotePin(id) {
        const result = await Notes.togglePin(id);
        if (result) { toast(result.pinned ? 'Note épinglée' : 'Note désépinglée', 'success'); await renderNotes(); }
    }
    async function archiveNote(id) {
        confirmCallback = async () => { if (await Notes.archive(id)) { toast('Note archivée', 'success'); await renderNotes(); } };
        document.getElementById('confirm-message').textContent = 'Archiver cette note ?';
        document.getElementById('modal-confirm').classList.add('active');
    }

    // ===================================================================
    //  HABITS VIEW
    // ===================================================================

    async function renderHabits() {
        const allHabits = await Habits.getAll();
        const grid = document.getElementById('habits-grid');
        const emptyEl = document.getElementById('habits-empty');

        const stats = Habits.getStats(allHabits);
        document.getElementById('habit-stat-total').textContent = stats.total;
        document.getElementById('habit-stat-today').textContent = stats.completedToday;
        document.getElementById('habit-stat-rate').textContent = stats.todayRate + '%';
        document.getElementById('habit-stat-best').textContent = stats.bestStreak;

        if (!allHabits.length) {
            grid.innerHTML = '';
            if (emptyEl) { emptyEl.style.display = ''; grid.appendChild(emptyEl); }
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        grid.innerHTML = allHabits.map((h, idx) => {
            const done = Habits.isCompletedToday(h);
            const rate = Habits.getCompletionRate(h);
            const week = Habits.getWeekView(h);
            const freqLabel = Habits.getFrequencyLabel(h.frequency);

            const weekHTML = week.map(d =>
                `<span class="habit-day ${d.completed ? 'habit-day-done' : ''}" title="${d.date}">${d.dayName}</span>`
            ).join('');

            // 12-week heatmap
            let completions = [];
            try { completions = Array.isArray(h.completions) ? h.completions : JSON.parse(h.completions || '[]'); } catch { completions = []; }
            const todayTs = new Date(); todayTs.setHours(0,0,0,0);
            let heatWeeks = '';
            for (let w = 11; w >= 0; w--) {
                let cells = '';
                for (let d2 = 6; d2 >= 0; d2--) {
                    const day = new Date(todayTs); day.setDate(todayTs.getDate() - (w * 7 + d2));
                    const ds = day.toISOString().split('T')[0];
                    const isFuture = day > todayTs;
                    const isDone = completions.includes(ds);
                    cells += '<div class="hh-cell' + (isFuture ? ' hh-future' : isDone ? ' hh-done' : '') + '" title="' + ds + '"></div>';
                }
                heatWeeks += '<div class="hh-week">' + cells + '</div>';
            }
            const heatmapHtml = '<div class="habit-heatmap-wrap"><div class="habit-heatmap-title">Activité 12 semaines</div><div class="habit-heatmap">' + heatWeeks + '</div></div>';

            return `
                <div class="habit-card ${done ? 'habit-done' : ''}" data-id="${h.id}" style="--habit-color: ${h.color}; animation-delay: ${idx * 0.06}s">
                    <div class="habit-card-header">
                        <button class="habit-check-btn ${done ? 'checked' : ''}" onclick="App.toggleHabit('${h.id}')" style="border-color: ${h.color}; ${done ? 'background:' + h.color : ''}">
                            ${done ? '<i class="fas fa-check"></i>' : ''}
                        </button>
                        <div class="habit-card-info">
                            <div class="habit-card-name"><span class="habit-icon">${h.icon}</span> ${escapeHtml(h.name)}</div>
                            <div class="habit-card-freq">${freqLabel}</div>
                        </div>
                        <div class="habit-card-streak">
                            ${h.streak > 0 ? `<span class="habit-streak-badge" style="background: ${h.color}20; color: ${h.color}"><i class="fas fa-fire"></i> ${h.streak}j</span>` : ''}
                        </div>
                    </div>
                    <div class="habit-week-view">${weekHTML}</div>
                    <div class="habit-card-footer">
                        <div class="habit-progress-bar"><div class="habit-progress-fill" style="width:${rate}%; background:${h.color}"></div></div>
                        <span class="habit-rate">${rate}% (30j)</span>
                    </div>
                    ${heatmapHtml}
                    <div class="habit-card-actions">
                        <button class="btn habit-action-edit" onclick="App.editHabit('${h.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn habit-action-delete" onclick="App.deleteHabit('${h.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        }).join('');
    }

    function openHabitModal(h = null) {
        const form = document.getElementById('habit-form');
        const title = document.getElementById('modal-habit-title');
        form.reset();
        document.getElementById('habit-id').value = '';
        document.getElementById('habit-icon').value = '✅';
        document.getElementById('habit-color').value = '#22C55E';

        if (h) {
            title.innerHTML = '<i class="fas fa-check-double"></i> Modifier l\'habitude';
            document.getElementById('habit-id').value = h.id;
            document.getElementById('habit-name').value = h.name;
            document.getElementById('habit-icon').value = h.icon || '✅';
            document.getElementById('habit-frequency').value = h.frequency || 'daily';
            document.getElementById('habit-color').value = h.color || '#22C55E';
        } else {
            title.innerHTML = '<i class="fas fa-check-double"></i> Nouvelle habitude';
        }
        document.getElementById('modal-habit').classList.add('active');
    }

    function bindHabitForm() {
        const form = document.getElementById('habit-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('habit-id').value;
            const data = {
                name: document.getElementById('habit-name').value.trim(),
                icon: document.getElementById('habit-icon').value.trim() || '✅',
                frequency: document.getElementById('habit-frequency').value,
                color: document.getElementById('habit-color').value || '#22C55E'
            };
            if (!data.name) { toast('Le nom est obligatoire', 'error'); return; }

            let result;
            if (id) { result = await Habits.update(id, data); if (result) toast('Habitude mise à jour', 'success'); }
            else { result = await Habits.create(data); if (result) toast('Habitude créée 🌱', 'success'); }

            if (result) { document.getElementById('modal-habit').classList.remove('active'); await renderHabits(); }
            else toast('Erreur lors de l\'enregistrement', 'error');
        });

        const addBtn = document.getElementById('btn-add-habit');
        if (addBtn) addBtn.addEventListener('click', () => openHabitModal());

        const exportBtn = document.getElementById('btn-export-habits');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Habits.exportCSV(await Habits.getAll()); toast('Habitudes exportées', 'success'); });
    }

    async function editHabit(id) { const h = await Habits.getById(id); if (h) openHabitModal(h); }
    async function deleteHabit(id) {
        confirmCallback = async () => { if (await Habits.remove(id)) { toast('Habitude supprimée', 'success'); await renderHabits(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette habitude ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleHabit(id) {
        const result = await Habits.toggleToday(id);
        if (result) {
            const done = Habits.isCompletedToday(result);
            toast(done ? '✅ Bravo, habitude complétée !' : 'Habitude décochée', 'success');
            await renderHabits();
        }
    }

    // ===================================================================
    //  CONTACTS VIEW
    // ===================================================================
    async function renderContacts() {
        const stats = await Contacts.getStats();
        document.getElementById('contact-stat-total').textContent = stats.total;
        document.getElementById('contact-stat-groups').textContent = stats.groups;
        document.getElementById('contact-stat-birthdays').textContent = stats.birthdays;
        document.getElementById('contact-stat-favorites').textContent = stats.favorites;

        // Populate group filter
        const groupFilter = document.getElementById('contact-filter-group');
        if (groupFilter && groupFilter.options.length <= 1) {
            Contacts.GROUPS.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.value; opt.textContent = `${g.icon} ${g.label}`;
                groupFilter.appendChild(opt);
            });
        }

        const filterGroup = document.getElementById('contact-filter-group')?.value || '';
        const search = (document.getElementById('contact-search')?.value || '').toLowerCase();

        let contacts = await Contacts.getAll();
        if (filterGroup) contacts = contacts.filter(c => c.group === filterGroup);
        if (search) contacts = contacts.filter(c =>
            Contacts.getFullName(c).toLowerCase().includes(search) ||
            (c.phone || '').includes(search) ||
            (c.email || '').toLowerCase().includes(search)
        );

        // Sort: favorites first, then alphabetical
        contacts.sort((a, b) => {
            if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
            return Contacts.getFullName(a).localeCompare(Contacts.getFullName(b));
        });

        const grid = document.getElementById('contacts-grid');
        const empty = document.getElementById('contacts-empty');
        if (!contacts.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        const upcoming = Contacts.getUpcomingBirthdays(contacts, 30);

        grid.innerHTML = contacts.map(c => {
            const g = Contacts.getGroupInfo(c.group);
            const initials = Contacts.getInitials(c);
            const bday = Contacts.formatBirthday(c.birthday);
            const upBd = upcoming.find(u => u.id === c.id);
            return `<div class="contact-card ${c.favorite ? 'contact-favorite' : ''}">
                <div class="contact-card-header">
                    <div class="contact-avatar" style="background:${g.color}20; color:${g.color}">${initials}</div>
                    <div class="contact-info">
                        <h4>${Contacts.getFullName(c)}</h4>
                        <span class="contact-group-badge" style="color:${g.color}">${g.icon} ${g.label}</span>
                    </div>
                    ${c.favorite ? '<span class="contact-fav-star">⭐</span>' : ''}
                </div>
                <div class="contact-details">
                    ${c.phone ? `<div class="contact-detail"><i class="fas fa-phone"></i> ${c.phone}</div>` : ''}
                    ${c.email ? `<div class="contact-detail"><i class="fas fa-envelope"></i> ${c.email}</div>` : ''}
                    ${c.company ? `<div class="contact-detail"><i class="fas fa-building"></i> ${c.company}</div>` : ''}
                    ${bday ? `<div class="contact-detail"><i class="fas fa-birthday-cake"></i> ${bday}${upBd ? ` <span class="birthday-soon">(dans ${upBd.daysUntil}j)</span>` : ''}</div>` : ''}
                </div>
                ${c.notes ? `<div class="contact-notes">${c.notes}</div>` : ''}
                <div class="contact-card-actions">
                    <button class="btn contact-action-fav" onclick="App.toggleContactFavorite('${c.id}')" title="${c.favorite ? 'Retirer favori' : 'Ajouter favori'}"><i class="fas fa-star"></i></button>
                    <button class="btn contact-action-edit" onclick="App.editContact('${c.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn contact-action-delete" onclick="App.deleteContact('${c.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openContactModal(contact = null) {
        document.getElementById('modal-contact-title').innerHTML = contact
            ? '<i class="fas fa-address-book"></i> Modifier le contact'
            : '<i class="fas fa-address-book"></i> Nouveau contact';
        document.getElementById('contact-id').value = contact?.id || '';
        document.getElementById('contact-firstname').value = contact?.firstName || '';
        document.getElementById('contact-lastname').value = contact?.lastName || '';
        document.getElementById('contact-phone').value = contact?.phone || '';
        document.getElementById('contact-email').value = contact?.email || '';
        document.getElementById('contact-group').value = contact?.group || 'autre';
        document.getElementById('contact-company').value = contact?.company || '';
        document.getElementById('contact-birthday').value = contact?.birthday || '';
        document.getElementById('contact-address').value = contact?.address || '';
        document.getElementById('contact-notes').value = contact?.notes || '';
        document.getElementById('modal-contact').classList.add('active');
    }

    function bindContactForm() {
        const form = document.getElementById('contact-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('contact-id').value;
            const data = {
                firstName: document.getElementById('contact-firstname').value.trim(),
                lastName: document.getElementById('contact-lastname').value.trim(),
                phone: document.getElementById('contact-phone').value.trim(),
                email: document.getElementById('contact-email').value.trim(),
                group: document.getElementById('contact-group').value,
                company: document.getElementById('contact-company').value.trim(),
                birthday: document.getElementById('contact-birthday').value,
                address: document.getElementById('contact-address').value.trim(),
                notes: document.getElementById('contact-notes').value.trim()
            };
            const result = id ? await Contacts.update(id, data) : await Contacts.add(data);
            if (result) {
                toast(id ? 'Contact mis à jour' : 'Contact ajouté', 'success');
                document.getElementById('modal-contact').classList.remove('active');
                await renderContacts();
            }
        });

        const addBtn = document.getElementById('btn-add-contact');
        if (addBtn) addBtn.addEventListener('click', () => openContactModal());

        const exportBtn = document.getElementById('btn-export-contacts');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Contacts.exportCSV(await Contacts.getAll()); toast('Contacts exportés', 'success'); });

        // Filters
        const groupFilter = document.getElementById('contact-filter-group');
        if (groupFilter) groupFilter.addEventListener('change', () => renderContacts());
        const searchInput = document.getElementById('contact-search');
        if (searchInput) searchInput.addEventListener('input', () => renderContacts());
    }

    async function editContact(id) { const c = await Contacts.getById(id); if (c) openContactModal(c); }
    async function deleteContact(id) {
        confirmCallback = async () => { if (await Contacts.remove(id)) { toast('Contact supprimé', 'success'); await renderContacts(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce contact ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleContactFavorite(id) {
        const result = await Contacts.toggleFavorite(id);
        if (result) { toast(result.favorite ? '⭐ Favori ajouté' : 'Favori retiré', 'success'); await renderContacts(); }
    }

    // ===================================================================
    //  MOVIES VIEW
    // ===================================================================
    async function renderMovies() {
        const stats = await Movies.getStats();
        document.getElementById('movie-stat-total').textContent = stats.total;
        document.getElementById('movie-stat-watched').textContent = stats.watched;
        document.getElementById('movie-stat-towatch').textContent = stats.toWatch;
        document.getElementById('movie-stat-rating').textContent = stats.avgRating;

        const filterStatus = document.getElementById('movie-filter-status')?.value || '';
        const filterType = document.getElementById('movie-filter-type')?.value || '';

        let movies = await Movies.getAll({ status: filterStatus || undefined });
        if (filterType) movies = movies.filter(m => m.type === filterType);

        // Sort: favorites first, then by date
        movies.sort((a, b) => {
            if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        const grid = document.getElementById('movies-grid');
        const empty = document.getElementById('movies-empty');
        if (!movies.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = movies.map((m, idx) => {
            const typeInfo = Movies.getTypeInfo(m.type);
            const statusInfo = Movies.getStatusInfo(m.status);
            const platformInfo = m.platform ? Movies.getPlatformInfo(m.platform) : null;
            const statusClass = m.status === 'watched' ? 'movie-status-watched' : m.status === 'watching' ? 'movie-status-watching' : 'movie-status-towatch';
            return `<div class="movie-card ${m.favorite ? 'movie-favorite' : ''}" style="animation-delay:${idx * 0.05}s">
                <div class="movie-card-header">
                    <span class="movie-type-badge" style="color:${typeInfo.color}">${typeInfo.icon} ${typeInfo.label}</span>
                    <span class="movie-status-badge ${statusClass}">${statusInfo.icon} ${statusInfo.label}</span>
                </div>
                <div class="movie-card-body">
                    <h4 class="movie-title">${m.title}</h4>
                    <div class="movie-meta">
                        ${m.year ? `<span><i class="fas fa-calendar"></i> ${m.year}</span>` : ''}
                        ${m.director ? `<span><i class="fas fa-user-tie"></i> ${m.director}</span>` : ''}
                        ${platformInfo ? `<span>${platformInfo.icon} ${platformInfo.label}</span>` : ''}
                    </div>
                    ${m.type === 'series' && m.season ? `<div class="movie-progress">S${m.season}E${m.episode}${m.totalSeasons ? ` / ${m.totalSeasons} saisons` : ''}</div>` : ''}
                    ${m.rating ? `<div class="movie-rating">${Movies.renderStars(m.rating)}</div>` : ''}
                    ${m.notes ? `<div class="movie-notes">${m.notes}</div>` : ''}
                </div>
                <div class="movie-card-actions">
                    <button class="btn movie-action-fav" onclick="App.toggleMovieFavorite('${m.id}')" title="${m.favorite ? 'Retirer favori' : 'Ajouter favori'}"><i class="fas fa-heart"></i></button>
                    <button class="btn movie-action-edit" onclick="App.editMovie('${m.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn movie-action-delete" onclick="App.deleteMovie('${m.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openMovieModal(movie = null) {
        document.getElementById('modal-movie-title').innerHTML = movie
            ? '<i class="fas fa-film"></i> Modifier le film / série'
            : '<i class="fas fa-film"></i> Nouveau film / série';
        document.getElementById('movie-id').value = movie?.id || '';
        document.getElementById('movie-title-input').value = movie?.title || '';
        document.getElementById('movie-type').value = movie?.type || 'movie';
        document.getElementById('movie-genre').value = movie?.genre || 'action';
        document.getElementById('movie-year').value = movie?.year || '';
        document.getElementById('movie-director').value = movie?.director || '';
        document.getElementById('movie-platform').value = movie?.platform || '';
        document.getElementById('movie-status').value = movie?.status || 'to-watch';
        document.getElementById('movie-rating').value = movie?.rating || 0;
        document.getElementById('movie-watch-date').value = movie?.watchDate || '';
        document.getElementById('movie-season').value = movie?.season || 0;
        document.getElementById('movie-episode').value = movie?.episode || 0;
        document.getElementById('movie-total-seasons').value = movie?.totalSeasons || 0;
        document.getElementById('movie-notes').value = movie?.notes || '';
        // Show/hide series fields
        const seriesFields = document.getElementById('movie-series-fields');
        if (seriesFields) seriesFields.style.display = (movie?.type === 'series' || movie?.type === 'anime') ? '' : 'none';
        document.getElementById('modal-movie').classList.add('active');
    }

    function bindMovieForm() {
        const form = document.getElementById('movie-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('movie-id').value;
            const data = {
                title: document.getElementById('movie-title-input').value.trim(),
                type: document.getElementById('movie-type').value,
                genre: document.getElementById('movie-genre').value,
                year: document.getElementById('movie-year').value,
                director: document.getElementById('movie-director').value.trim(),
                platform: document.getElementById('movie-platform').value,
                status: document.getElementById('movie-status').value,
                rating: document.getElementById('movie-rating').value,
                watchDate: document.getElementById('movie-watch-date').value,
                season: document.getElementById('movie-season').value,
                episode: document.getElementById('movie-episode').value,
                totalSeasons: document.getElementById('movie-total-seasons').value,
                notes: document.getElementById('movie-notes').value.trim()
            };
            const result = id ? await Movies.update(id, data) : await Movies.add(data);
            if (result) {
                toast(id ? 'Film/série mis à jour' : 'Film/série ajouté', 'success');
                document.getElementById('modal-movie').classList.remove('active');
                await renderMovies();
            }
        });

        const addBtn = document.getElementById('btn-add-movie');
        if (addBtn) addBtn.addEventListener('click', () => openMovieModal());

        const exportBtn = document.getElementById('btn-export-movies');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Movies.exportCSV(await Movies.getAll()); toast('Films/séries exportés', 'success'); });

        // Type toggle for series fields
        const typeSelect = document.getElementById('movie-type');
        if (typeSelect) typeSelect.addEventListener('change', (e) => {
            const seriesFields = document.getElementById('movie-series-fields');
            if (seriesFields) seriesFields.style.display = (e.target.value === 'series' || e.target.value === 'anime') ? '' : 'none';
        });

        // Filters
        const statusFilter = document.getElementById('movie-filter-status');
        if (statusFilter) statusFilter.addEventListener('change', () => renderMovies());
        const typeFilter = document.getElementById('movie-filter-type');
        if (typeFilter) typeFilter.addEventListener('change', () => renderMovies());
    }

    async function editMovie(id) { const m = await Movies.getById(id); if (m) openMovieModal(m); }
    async function deleteMovie(id) {
        confirmCallback = async () => { if (await Movies.remove(id)) { toast('Film/série supprimé', 'success'); await renderMovies(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce film/série ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleMovieFavorite(id) {
        const result = await Movies.toggleFavorite(id);
        if (result) { toast(result.favorite ? '❤️ Favori ajouté' : 'Favori retiré', 'success'); await renderMovies(); }
    }

    // ===================================================================
    //  TRAVEL VIEW
    // ===================================================================
    async function renderTravel() {
        const stats = await Travel.getStats();
        document.getElementById('travel-stat-total').textContent = stats.total;
        document.getElementById('travel-stat-visited').textContent = stats.visited;
        document.getElementById('travel-stat-planned').textContent = stats.planned;
        document.getElementById('travel-stat-countries').textContent = stats.countries;

        const filterStatus = document.getElementById('travel-filter-status')?.value || '';
        const filterContinent = document.getElementById('travel-filter-continent')?.value || '';

        let trips = await Travel.getAll({ status: filterStatus || undefined });
        if (filterContinent) trips = trips.filter(t => t.continent === filterContinent);

        const grid = document.getElementById('travel-grid');
        const empty = document.getElementById('travel-empty');
        if (!trips.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = trips.map(t => {
            const continent = Travel.getContinentInfo(t.continent);
            const status = Travel.getStatusInfo(t.status);
            const transport = Travel.getTransportInfo(t.transport);
            const dateRange = Travel.formatDateRange(t.startDate, t.endDate);
            const duration = Travel.getDuration(t.startDate, t.endDate);
            return `<div class="trip-card ${t.favorite ? 'trip-favorite' : ''}">
                <div class="trip-card-header" style="border-left: 3px solid ${continent.color}">
                    <div class="trip-header-top">
                        <span class="trip-continent">${continent.icon} ${continent.label}</span>
                        <span class="trip-status-badge" style="background:${status.color}20; color:${status.color}">${status.icon} ${status.label}</span>
                    </div>
                    <h4 class="trip-destination">${t.destination}</h4>
                    ${t.country ? `<span class="trip-country"><i class="fas fa-flag"></i> ${t.country}</span>` : ''}
                </div>
                <div class="trip-card-body">
                    <div class="trip-meta">
                        ${dateRange ? `<span><i class="fas fa-calendar-alt"></i> ${dateRange}</span>` : ''}
                        ${duration ? `<span><i class="fas fa-clock"></i> ${duration}</span>` : ''}
                        <span>${transport.icon} ${transport.label}</span>
                    </div>
                    ${t.companions ? `<div class="trip-companions"><i class="fas fa-users"></i> ${t.companions}</div>` : ''}
                    ${t.rating ? `<div class="trip-rating">${Travel.renderStars(t.rating)}</div>` : ''}
                    ${t.highlights ? `<div class="trip-highlights">${t.highlights}</div>` : ''}
                </div>
                <div class="trip-card-actions">
                    <button class="btn trip-action-fav" onclick="App.toggleTripFavorite('${t.id}')" title="${t.favorite ? 'Retirer favori' : 'Ajouter favori'}"><i class="fas fa-heart"></i></button>
                    <button class="btn trip-action-edit" onclick="App.editTrip('${t.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn trip-action-delete" onclick="App.deleteTrip('${t.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openTripModal(trip = null) {
        document.getElementById('modal-trip-title').innerHTML = trip
            ? '<i class="fas fa-globe-americas"></i> Modifier le voyage'
            : '<i class="fas fa-globe-americas"></i> Nouveau voyage';
        document.getElementById('trip-id').value = trip?.id || '';
        document.getElementById('trip-destination').value = trip?.destination || '';
        document.getElementById('trip-country').value = trip?.country || '';
        document.getElementById('trip-continent').value = trip?.continent || 'afrique';
        document.getElementById('trip-status').value = trip?.status || 'planned';
        document.getElementById('trip-transport').value = trip?.transport || 'avion';
        document.getElementById('trip-start-date').value = trip?.startDate || '';
        document.getElementById('trip-end-date').value = trip?.endDate || '';
        document.getElementById('trip-companions').value = trip?.companions || '';
        document.getElementById('trip-rating').value = trip?.rating || 0;
        document.getElementById('trip-highlights').value = trip?.highlights || '';
        document.getElementById('trip-notes').value = trip?.notes || '';
        document.getElementById('modal-trip').classList.add('active');
    }

    function bindTripForm() {
        const form = document.getElementById('trip-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('trip-id').value;
            const data = {
                destination: document.getElementById('trip-destination').value.trim(),
                country: document.getElementById('trip-country').value.trim(),
                continent: document.getElementById('trip-continent').value,
                status: document.getElementById('trip-status').value,
                transport: document.getElementById('trip-transport').value,
                startDate: document.getElementById('trip-start-date').value,
                endDate: document.getElementById('trip-end-date').value,
                companions: document.getElementById('trip-companions').value.trim(),
                rating: document.getElementById('trip-rating').value,
                highlights: document.getElementById('trip-highlights').value.trim(),
                notes: document.getElementById('trip-notes').value.trim()
            };
            const result = id ? await Travel.update(id, data) : await Travel.add(data);
            if (result) {
                toast(id ? 'Voyage mis à jour' : 'Voyage ajouté', 'success');
                document.getElementById('modal-trip').classList.remove('active');
                await renderTravel();
            }
        });

        const addBtn = document.getElementById('btn-add-trip');
        if (addBtn) addBtn.addEventListener('click', () => openTripModal());

        const exportBtn = document.getElementById('btn-export-travel');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Travel.exportCSV(await Travel.getAll()); toast('Voyages exportés', 'success'); });

        // Filters
        const statusFilter = document.getElementById('travel-filter-status');
        if (statusFilter) statusFilter.addEventListener('change', () => renderTravel());
        const continentFilter = document.getElementById('travel-filter-continent');
        if (continentFilter) continentFilter.addEventListener('change', () => renderTravel());
    }

    async function editTrip(id) { const t = await Travel.getById(id); if (t) openTripModal(t); }
    async function deleteTrip(id) {
        confirmCallback = async () => { if (await Travel.remove(id)) { toast('Voyage supprimé', 'success'); await renderTravel(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce voyage ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleTripFavorite(id) {
        const result = await Travel.toggleFavorite(id);
        if (result) { toast(result.favorite ? '❤️ Favori ajouté' : 'Favori retiré', 'success'); await renderTravel(); }
    }

    // ===================================================================
    //  PLANTS VIEW
    // ===================================================================
    async function renderPlants() {
        const stats = await Plants.getStats();
        document.getElementById('plant-stat-total').textContent = stats.total;
        document.getElementById('plant-stat-water').textContent = stats.needWater;
        document.getElementById('plant-stat-healthy').textContent = stats.healthy;
        document.getElementById('plant-stat-locations').textContent = stats.locations;

        let plants = await Plants.getAll();
        // Sort: needs water first, then alphabetical
        plants.sort((a, b) => {
            const aw = Plants.needsWater(a) ? 0 : 1;
            const bw = Plants.needsWater(b) ? 0 : 1;
            if (aw !== bw) return aw - bw;
            return a.name.localeCompare(b.name);
        });

        const grid = document.getElementById('plants-grid');
        const empty = document.getElementById('plants-empty');
        if (!plants.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = plants.map(p => {
            const health = Plants.getHealthInfo(p.health);
            const sunlight = Plants.getSunlightInfo(p.sunlight);
            const waterStatus = Plants.getWaterStatus(p);
            const daysSince = Plants.daysSinceWatered(p);
            return `<div class="plant-card ${Plants.needsWater(p) ? 'plant-needs-water' : ''}">
                <div class="plant-card-header">
                    <div class="plant-emoji">${health.icon}</div>
                    <div class="plant-info">
                        <h4>${p.name}</h4>
                        ${p.species ? `<span class="plant-species">${p.species}</span>` : ''}
                    </div>
                    <span class="plant-health-badge" style="background:${health.color}20; color:${health.color}">${health.label}</span>
                </div>
                <div class="plant-card-body">
                    <div class="plant-water-status" style="color:${waterStatus.color}">
                        ${waterStatus.icon} ${waterStatus.label}
                        <span class="plant-water-detail">(${daysSince < 999 ? `il y a ${daysSince}j` : 'jamais arrosé'} / tous les ${p.waterFrequency || p.water_frequency}j)</span>
                    </div>
                    <div class="plant-meta">
                        ${p.location ? `<span><i class="fas fa-map-pin"></i> ${p.location}</span>` : ''}
                        <span>${sunlight.icon} ${sunlight.label}</span>
                    </div>
                    ${p.notes ? `<div class="plant-notes">${p.notes}</div>` : ''}
                </div>
                <div class="plant-card-actions">
                    <button class="btn plant-action-water" onclick="App.waterPlant('${p.id}')" title="Arroser"><i class="fas fa-tint"></i></button>
                    <button class="btn plant-action-edit" onclick="App.editPlant('${p.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn plant-action-delete" onclick="App.deletePlant('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openPlantModal(plant = null) {
        document.getElementById('modal-plant-title').innerHTML = plant
            ? '<i class="fas fa-seedling"></i> Modifier la plante'
            : '<i class="fas fa-seedling"></i> Nouvelle plante';
        document.getElementById('plant-id').value = plant?.id || '';
        document.getElementById('plant-name').value = plant?.name || '';
        document.getElementById('plant-species').value = plant?.species || '';
        document.getElementById('plant-location').value = plant?.location || 'salon';
        document.getElementById('plant-sunlight').value = plant?.sunlight || 'medium';
        document.getElementById('plant-water-frequency').value = plant?.waterFrequency || plant?.water_frequency || 7;
        document.getElementById('plant-health').value = plant?.health || 'good';
        document.getElementById('plant-acquired').value = plant?.acquired || '';
        document.getElementById('plant-last-watered').value = plant?.lastWatered || plant?.last_watered || '';
        document.getElementById('plant-notes').value = plant?.notes || '';
        document.getElementById('modal-plant').classList.add('active');
    }

    function bindPlantForm() {
        const form = document.getElementById('plant-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('plant-id').value;
            const data = {
                name: document.getElementById('plant-name').value.trim(),
                species: document.getElementById('plant-species').value.trim(),
                location: document.getElementById('plant-location').value,
                sunlight: document.getElementById('plant-sunlight').value,
                waterFrequency: document.getElementById('plant-water-frequency').value,
                health: document.getElementById('plant-health').value,
                acquired: document.getElementById('plant-acquired').value,
                lastWatered: document.getElementById('plant-last-watered').value,
                notes: document.getElementById('plant-notes').value.trim()
            };
            const result = id ? await Plants.update(id, data) : await Plants.add(data);
            if (result) {
                toast(id ? 'Plante mise à jour' : 'Plante ajoutée', 'success');
                document.getElementById('modal-plant').classList.remove('active');
                await renderPlants();
            }
        });

        const addBtn = document.getElementById('btn-add-plant');
        if (addBtn) addBtn.addEventListener('click', () => openPlantModal());

        const exportBtn = document.getElementById('btn-export-plants');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Plants.exportCSV(await Plants.getAll()); toast('Plantes exportées', 'success'); });
    }

    async function editPlant(id) { const p = await Plants.getById(id); if (p) openPlantModal(p); }
    async function deletePlant(id) {
        confirmCallback = async () => { if (await Plants.remove(id)) { toast('Plante supprimée', 'success'); await renderPlants(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette plante ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function waterPlant(id) {
        const result = await Plants.waterPlant(id);
        if (result) { toast('💧 Plante arrosée !', 'success'); await renderPlants(); }
    }

    // ===================================================================
    //  MUSIC VIEW
    // ===================================================================
    async function renderMusic() {
        const stats = await Music.getStats();
        document.getElementById('music-stat-total').textContent = stats.total;
        document.getElementById('music-stat-artists').textContent = stats.artists;
        document.getElementById('music-stat-favorites').textContent = stats.favorites;
        document.getElementById('music-stat-rating').textContent = stats.avgRating;

        let tracks = await Music.getAll();

        // Apply filters
        const genreF = document.getElementById('music-filter-genre')?.value;
        const moodF = document.getElementById('music-filter-mood')?.value;
        const searchF = document.getElementById('music-search')?.value?.toLowerCase();
        if (genreF) tracks = tracks.filter(t => t.genre === genreF);
        if (moodF) tracks = tracks.filter(t => t.mood === moodF);
        if (searchF) tracks = tracks.filter(t => t.title.toLowerCase().includes(searchF) || t.artist.toLowerCase().includes(searchF) || t.album.toLowerCase().includes(searchF));

        // Sort: favorites first
        tracks.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || a.title.localeCompare(b.title));

        const grid = document.getElementById('music-grid');
        const empty = document.getElementById('music-empty');
        if (!tracks.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = tracks.map((t, idx) => {
            const genre = Music.getGenreInfo(t.genre);
            const platform = t.platform ? Music.getPlatformInfo(t.platform) : null;
            const mood = t.mood ? Music.getMoodInfo(t.mood) : null;
            return `<div class="music-card" style="animation-delay:${idx * 0.05}s">
                <div class="music-card-header">
                    <div class="music-genre-badge">${genre.icon} ${genre.label}</div>
                    <button class="music-favorite ${t.favorite ? 'active' : ''}" onclick="App.toggleMusicFavorite('${t.id}')"><i class="fas fa-heart"></i></button>
                </div>
                <div class="music-card-body">
                    <h4 class="music-title">${t.title}</h4>
                    <span class="music-artist"><i class="fas fa-microphone-alt"></i> ${t.artist}</span>
                    ${t.album ? `<span class="music-album"><i class="fas fa-compact-disc"></i> ${t.album}</span>` : ''}
                    <div class="music-meta">
                        ${t.year ? `<span>${t.year}</span>` : ''}
                        ${t.duration ? `<span><i class="fas fa-clock"></i> ${t.duration}</span>` : ''}
                        ${platform ? `<span>${platform.icon} ${platform.label}</span>` : ''}
                        ${mood ? `<span>${mood.icon} ${mood.label}</span>` : ''}
                    </div>
                    ${t.rating ? `<div class="music-rating">${Music.renderStars(t.rating)}</div>` : ''}
                    ${t.playlist ? `<div class="music-playlist"><i class="fas fa-list"></i> ${t.playlist}</div>` : ''}
                    ${t.notes ? `<div class="music-notes">${t.notes}</div>` : ''}
                </div>
                <div class="music-card-actions">
                    <button class="btn" onclick="App.editMusic('${t.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteMusic('${t.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openMusicModal(track = null) {
        document.getElementById('modal-music-title').innerHTML = track
            ? '<i class="fas fa-music"></i> Modifier le morceau'
            : '<i class="fas fa-music"></i> Nouveau morceau';
        document.getElementById('music-id').value = track?.id || '';
        document.getElementById('music-title').value = track?.title || '';
        document.getElementById('music-artist').value = track?.artist || '';
        document.getElementById('music-album').value = track?.album || '';
        document.getElementById('music-genre').value = track?.genre || 'pop';
        document.getElementById('music-year').value = track?.year || '';
        document.getElementById('music-duration').value = track?.duration || '';
        document.getElementById('music-platform').value = track?.platform || '';
        document.getElementById('music-mood').value = track?.mood || '';
        document.getElementById('music-rating').value = track?.rating || 0;
        document.getElementById('music-playlist').value = track?.playlist || '';
        document.getElementById('music-notes').value = track?.notes || '';
        document.getElementById('modal-music').classList.add('active');
    }

    function bindMusicForm() {
        const form = document.getElementById('music-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('music-id').value;
            const data = {
                title: document.getElementById('music-title').value.trim(),
                artist: document.getElementById('music-artist').value.trim(),
                album: document.getElementById('music-album').value.trim(),
                genre: document.getElementById('music-genre').value,
                year: parseInt(document.getElementById('music-year').value) || 0,
                duration: document.getElementById('music-duration').value.trim(),
                platform: document.getElementById('music-platform').value,
                mood: document.getElementById('music-mood').value,
                rating: parseInt(document.getElementById('music-rating').value) || 0,
                playlist: document.getElementById('music-playlist').value.trim(),
                notes: document.getElementById('music-notes').value.trim()
            };
            const result = id ? await Music.update(id, data) : await Music.add(data);
            if (result) {
                toast(id ? 'Morceau mis à jour' : 'Morceau ajouté', 'success');
                document.getElementById('modal-music').classList.remove('active');
                await renderMusic();
            }
        });

        const addBtn = document.getElementById('btn-add-music');
        if (addBtn) addBtn.addEventListener('click', () => openMusicModal());

        const exportBtn = document.getElementById('btn-export-music');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Music.exportCSV(await Music.getAll()); toast('Musique exportée', 'success'); });

        // Filters
        ['music-filter-genre', 'music-filter-mood'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderMusic());
        });
        const searchEl = document.getElementById('music-search');
        if (searchEl) searchEl.addEventListener('input', () => renderMusic());
    }

    async function editMusic(id) { const t = await Music.getById(id); if (t) openMusicModal(t); }
    async function deleteMusic(id) {
        confirmCallback = async () => { if (await Music.remove(id)) { toast('Morceau supprimé', 'success'); await renderMusic(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce morceau ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleMusicFavorite(id) { await Music.toggleFavorite(id); await renderMusic(); }

    // ===================================================================
    //  VEHICLES VIEW
    // ===================================================================
    async function renderVehicles() {
        const stats = await Vehicles.getStats();
        document.getElementById('vehicle-stat-total').textContent = stats.total;
        document.getElementById('vehicle-stat-active').textContent = stats.active;
        document.getElementById('vehicle-stat-alerts').textContent = stats.alerts;
        document.getElementById('vehicle-stat-km').textContent = stats.totalKm.toLocaleString('fr-FR');

        let vehicles = await Vehicles.getAll();
        vehicles.sort((a, b) => {
            const as = a.status === 'active' ? 0 : 1;
            const bs = b.status === 'active' ? 0 : 1;
            if (as !== bs) return as - bs;
            return a.name.localeCompare(b.name);
        });

        const grid = document.getElementById('vehicles-grid');
        const empty = document.getElementById('vehicles-empty');
        if (!vehicles.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = vehicles.map(v => {
            const type = Vehicles.getTypeInfo(v.type);
            const fuel = Vehicles.getFuelInfo(v.fuel);
            const status = Vehicles.getStatusInfo(v.status);
            const hasAlert = Vehicles.isInsuranceExpiring(v) || Vehicles.isServiceDue(v);
            return `<div class="vehicle-card ${hasAlert ? 'vehicle-alert' : ''}">
                <div class="vehicle-card-header">
                    <div class="vehicle-type-icon">${type.icon}</div>
                    <div class="vehicle-info">
                        <h4>${v.name}</h4>
                        <span class="vehicle-brand">${v.brand} ${v.model} ${v.year ? '(' + v.year + ')' : ''}</span>
                    </div>
                    <span class="vehicle-status-badge" style="background:${status.color}20; color:${status.color}">${status.icon} ${status.label}</span>
                </div>
                <div class="vehicle-card-body">
                    <div class="vehicle-meta">
                        ${v.plate ? `<span><i class="fas fa-id-card"></i> ${v.plate}</span>` : ''}
                        <span>${fuel.icon} ${fuel.label}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${Vehicles.formatMileage(v.mileage)}</span>
                        ${v.color ? `<span><i class="fas fa-palette"></i> ${v.color}</span>` : ''}
                    </div>
                    ${hasAlert ? `<div class="vehicle-alerts">
                        ${Vehicles.isInsuranceExpiring(v) ? '<span class="vehicle-alert-item"><i class="fas fa-shield-alt"></i> Assurance bientôt expirée</span>' : ''}
                        ${Vehicles.isServiceDue(v) ? '<span class="vehicle-alert-item"><i class="fas fa-wrench"></i> Entretien à planifier</span>' : ''}
                    </div>` : ''}
                    ${v.notes ? `<div class="vehicle-notes">${v.notes}</div>` : ''}
                </div>
                <div class="vehicle-card-actions">
                    <button class="btn" onclick="App.editVehicle('${v.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteVehicle('${v.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openVehicleModal(vehicle = null) {
        document.getElementById('modal-vehicle-title').innerHTML = vehicle
            ? '<i class="fas fa-car"></i> Modifier le véhicule'
            : '<i class="fas fa-car"></i> Nouveau véhicule';
        document.getElementById('vehicle-id').value = vehicle?.id || '';
        document.getElementById('vehicle-name').value = vehicle?.name || '';
        document.getElementById('vehicle-type').value = vehicle?.type || 'car';
        document.getElementById('vehicle-brand').value = vehicle?.brand || '';
        document.getElementById('vehicle-model').value = vehicle?.model || '';
        document.getElementById('vehicle-year').value = vehicle?.year || '';
        document.getElementById('vehicle-plate').value = vehicle?.plate || '';
        document.getElementById('vehicle-fuel').value = vehicle?.fuel || 'essence';
        document.getElementById('vehicle-mileage').value = vehicle?.mileage || 0;
        document.getElementById('vehicle-status').value = vehicle?.status || 'active';
        document.getElementById('vehicle-color').value = vehicle?.color || '';
        document.getElementById('vehicle-insurance').value = vehicle?.insuranceExpiry || '';
        document.getElementById('vehicle-next-service').value = vehicle?.nextService || '';
        document.getElementById('vehicle-notes').value = vehicle?.notes || '';
        document.getElementById('modal-vehicle').classList.add('active');
    }

    function bindVehicleForm() {
        const form = document.getElementById('vehicle-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('vehicle-id').value;
            const data = {
                name: document.getElementById('vehicle-name').value.trim(),
                type: document.getElementById('vehicle-type').value,
                brand: document.getElementById('vehicle-brand').value.trim(),
                model: document.getElementById('vehicle-model').value.trim(),
                year: parseInt(document.getElementById('vehicle-year').value) || 0,
                plate: document.getElementById('vehicle-plate').value.trim(),
                fuel: document.getElementById('vehicle-fuel').value,
                mileage: parseInt(document.getElementById('vehicle-mileage').value) || 0,
                status: document.getElementById('vehicle-status').value,
                color: document.getElementById('vehicle-color').value.trim(),
                insuranceExpiry: document.getElementById('vehicle-insurance').value,
                nextService: document.getElementById('vehicle-next-service').value,
                notes: document.getElementById('vehicle-notes').value.trim()
            };
            const result = id ? await Vehicles.update(id, data) : await Vehicles.add(data);
            if (result) {
                toast(id ? 'Véhicule mis à jour' : 'Véhicule ajouté', 'success');
                document.getElementById('modal-vehicle').classList.remove('active');
                await renderVehicles();
            }
        });

        const addBtn = document.getElementById('btn-add-vehicle');
        if (addBtn) addBtn.addEventListener('click', () => openVehicleModal());

        const exportBtn = document.getElementById('btn-export-vehicles');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Vehicles.exportCSV(await Vehicles.getAll()); toast('Véhicules exportés', 'success'); });
    }

    async function editVehicle(id) { const v = await Vehicles.getById(id); if (v) openVehicleModal(v); }
    async function deleteVehicle(id) {
        confirmCallback = async () => { if (await Vehicles.remove(id)) { toast('Véhicule supprimé', 'success'); await renderVehicles(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce véhicule ?';
        document.getElementById('modal-confirm').classList.add('active');
    }

    // ===================================================================
    //  HEALTH VIEW
    // ===================================================================
    async function renderHealth() {
        const stats = await Health.getStats();
        document.getElementById('health-stat-total').textContent = stats.total;
        document.getElementById('health-stat-upcoming').textContent = stats.upcoming;
        document.getElementById('health-stat-completed').textContent = stats.completed;
        document.getElementById('health-stat-cost').textContent = stats.totalCost + ' MAD';

        let records = await Health.getAll();

        // Apply filters
        const typeF = document.getElementById('health-filter-type')?.value;
        const statusF = document.getElementById('health-filter-status')?.value;
        if (typeF) records = records.filter(r => r.type === typeF);
        if (statusF) records = records.filter(r => r.status === statusF);

        // Sort: upcoming first, then by date desc
        records.sort((a, b) => {
            const aUp = Health.isUpcoming(a) ? 0 : 1;
            const bUp = Health.isUpcoming(b) ? 0 : 1;
            if (aUp !== bUp) return aUp - bUp;
            return (b.date || '').localeCompare(a.date || '');
        });

        const grid = document.getElementById('health-grid');
        const empty = document.getElementById('health-empty');
        if (!records.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = records.map(r => {
            const type = Health.getTypeInfo(r.type);
            const cat = Health.getCategoryInfo(r.category);
            const status = Health.getStatusInfo(r.status);
            const priority = Health.getPriorityInfo(r.priority);
            const upcoming = Health.isUpcoming(r);
            return `<div class="health-card ${upcoming ? 'health-upcoming' : ''}">
                <div class="health-card-header">
                    <div class="health-type-icon">${type.icon}</div>
                    <div class="health-info">
                        <h4>${r.title}</h4>
                        <span class="health-category">${cat.icon} ${cat.label}</span>
                    </div>
                    <span class="health-status-badge" style="background:${status.color}20; color:${status.color}">${status.icon} ${status.label}</span>
                </div>
                <div class="health-card-body">
                    <div class="health-meta">
                        ${r.date ? `<span><i class="fas fa-calendar"></i> ${new Date(r.date).toLocaleDateString('fr-FR')}${r.time ? ' à ' + r.time : ''}</span>` : ''}
                        ${r.doctor ? `<span><i class="fas fa-user-md"></i> ${r.doctor}</span>` : ''}
                        ${r.location ? `<span><i class="fas fa-map-marker-alt"></i> ${r.location}</span>` : ''}
                        <span style="color:${priority.color}">${priority.icon} ${priority.label}</span>
                    </div>
                    ${r.symptoms ? `<div class="health-detail"><i class="fas fa-thermometer-half"></i> ${r.symptoms}</div>` : ''}
                    ${r.diagnosis ? `<div class="health-detail"><i class="fas fa-file-medical"></i> ${r.diagnosis}</div>` : ''}
                    ${r.cost ? `<div class="health-cost"><i class="fas fa-coins"></i> ${r.cost.toFixed(2)} MAD</div>` : ''}
                    ${r.notes ? `<div class="health-notes">${r.notes}</div>` : ''}
                </div>
                <div class="health-card-actions">
                    <button class="btn" onclick="App.editHealth('${r.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteHealth('${r.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openHealthModal(record = null) {
        document.getElementById('modal-health-title').innerHTML = record
            ? '<i class="fas fa-heartbeat"></i> Modifier le suivi'
            : '<i class="fas fa-heartbeat"></i> Nouveau suivi santé';
        document.getElementById('health-id').value = record?.id || '';
        document.getElementById('health-title').value = record?.title || '';
        document.getElementById('health-type').value = record?.type || 'appointment';
        document.getElementById('health-category').value = record?.category || 'general';
        document.getElementById('health-doctor').value = record?.doctor || '';
        document.getElementById('health-date').value = record?.date || '';
        document.getElementById('health-time').value = record?.time || '';
        document.getElementById('health-status').value = record?.status || 'scheduled';
        document.getElementById('health-priority').value = record?.priority || 'normal';
        document.getElementById('health-location').value = record?.location || '';
        document.getElementById('health-cost').value = record?.cost || 0;
        document.getElementById('health-symptoms').value = record?.symptoms || '';
        document.getElementById('health-diagnosis').value = record?.diagnosis || '';
        document.getElementById('health-notes').value = record?.notes || '';
        document.getElementById('modal-health').classList.add('active');
    }

    function bindHealthForm() {
        const form = document.getElementById('health-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('health-id').value;
            const data = {
                title: document.getElementById('health-title').value.trim(),
                type: document.getElementById('health-type').value,
                category: document.getElementById('health-category').value,
                doctor: document.getElementById('health-doctor').value.trim(),
                date: document.getElementById('health-date').value,
                time: document.getElementById('health-time').value,
                status: document.getElementById('health-status').value,
                priority: document.getElementById('health-priority').value,
                location: document.getElementById('health-location').value.trim(),
                cost: parseFloat(document.getElementById('health-cost').value) || 0,
                symptoms: document.getElementById('health-symptoms').value.trim(),
                diagnosis: document.getElementById('health-diagnosis').value.trim(),
                notes: document.getElementById('health-notes').value.trim()
            };
            const result = id ? await Health.update(id, data) : await Health.add(data);
            if (result) {
                toast(id ? 'Suivi mis à jour' : 'Suivi ajouté', 'success');
                document.getElementById('modal-health').classList.remove('active');
                await renderHealth();
            }
        });

        const addBtn = document.getElementById('btn-add-health');
        if (addBtn) addBtn.addEventListener('click', () => openHealthModal());

        const exportBtn = document.getElementById('btn-export-health');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Health.exportCSV(await Health.getAll()); toast('Santé exportée', 'success'); });

        // Filters
        ['health-filter-type', 'health-filter-status'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderHealth());
        });
    }

    async function editHealth(id) { const r = await Health.getById(id); if (r) openHealthModal(r); }
    async function deleteHealth(id) {
        confirmCallback = async () => { if (await Health.remove(id)) { toast('Suivi supprimé', 'success'); await renderHealth(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce suivi médical ?';
        document.getElementById('modal-confirm').classList.add('active');
    }

    // ===================================================================
    //  EVENTS VIEW
    // ===================================================================
    async function renderEvents() {
        const stats = await Events.getStats();
        document.getElementById('event-stat-total').textContent = stats.total;
        document.getElementById('event-stat-upcoming').textContent = stats.upcoming;
        document.getElementById('event-stat-month').textContent = stats.thisMonth;
        document.getElementById('event-stat-budget').textContent = stats.totalBudget + ' MAD';

        let events = await Events.getAll();

        // Apply filters
        const typeF = document.getElementById('event-filter-type')?.value;
        const statusF = document.getElementById('event-filter-status')?.value;
        if (typeF) events = events.filter(e => e.type === typeF);
        if (statusF) events = events.filter(e => e.status === statusF);

        // Sort: upcoming first, then by date
        events.sort((a, b) => {
            const aDays = Events.getDaysUntil(a) ?? 9999;
            const bDays = Events.getDaysUntil(b) ?? 9999;
            if (aDays >= 0 && bDays >= 0) return aDays - bDays;
            if (aDays >= 0) return -1;
            if (bDays >= 0) return 1;
            return (b.date || '').localeCompare(a.date || '');
        });

        const grid = document.getElementById('events-grid');
        const empty = document.getElementById('events-empty');
        if (!events.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = events.map(ev => {
            const type = Events.getTypeInfo(ev.type);
            const cat = Events.getCategoryInfo(ev.category);
            const status = Events.getStatusInfo(ev.status);
            const countdown = Events.getCountdown(ev);
            const daysUntil = Events.getDaysUntil(ev);
            const isNear = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7;
            return `<div class="event-card ${isNear ? 'event-soon' : ''}" style="border-left: 4px solid ${ev.color || '#A78BFA'}">
                <div class="event-card-header">
                    <div class="event-header-top">
                        <span class="event-type">${type.icon} ${type.label}</span>
                        <span class="event-status-badge" style="background:${status.color}20; color:${status.color}">${status.icon} ${status.label}</span>
                    </div>
                    <h4 class="event-title">${ev.title}</h4>
                    <span class="event-category">${cat.icon} ${cat.label}</span>
                </div>
                <div class="event-card-body">
                    ${countdown ? `<div class="event-countdown ${isNear ? 'event-countdown-near' : ''}">${countdown}</div>` : ''}
                    <div class="event-meta">
                        <span><i class="fas fa-calendar"></i> ${Events.formatDateRange(ev)}</span>
                        ${ev.location ? `<span><i class="fas fa-map-marker-alt"></i> ${ev.location}</span>` : ''}
                        ${ev.guests ? `<span><i class="fas fa-users"></i> ${ev.guests}</span>` : ''}
                        ${ev.budget ? `<span><i class="fas fa-coins"></i> ${ev.budget.toFixed(2)} MAD</span>` : ''}
                    </div>
                    ${ev.description ? `<div class="event-description">${ev.description}</div>` : ''}
                    ${ev.notes ? `<div class="event-notes">${ev.notes}</div>` : ''}
                </div>
                <div class="event-card-actions">
                    <button class="btn" onclick="App.toggleEventFavorite('${ev.id}')"><i class="fas fa-heart ${ev.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editEvent('${ev.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteEvent('${ev.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openEventModal(event = null) {
        document.getElementById('modal-event-title').innerHTML = event
            ? '<i class="fas fa-calendar-alt"></i> Modifier l\'événement'
            : '<i class="fas fa-calendar-alt"></i> Nouvel événement';
        document.getElementById('event-id').value = event?.id || '';
        document.getElementById('event-title').value = event?.title || '';
        document.getElementById('event-type').value = event?.type || 'personal';
        document.getElementById('event-category').value = event?.category || 'autre';
        document.getElementById('event-status').value = event?.status || 'upcoming';
        document.getElementById('event-date').value = event?.date || '';
        document.getElementById('event-end-date').value = event?.endDate || '';
        document.getElementById('event-time').value = event?.time || '';
        document.getElementById('event-end-time').value = event?.endTime || '';
        document.getElementById('event-location').value = event?.location || '';
        document.getElementById('event-budget').value = event?.budget || 0;
        document.getElementById('event-guests').value = event?.guests || '';
        document.getElementById('event-description').value = event?.description || '';
        document.getElementById('event-notes').value = event?.notes || '';
        document.getElementById('modal-event').classList.add('active');
    }

    function bindEventForm() {
        const form = document.getElementById('event-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('event-id').value;
            const data = {
                title: document.getElementById('event-title').value.trim(),
                type: document.getElementById('event-type').value,
                category: document.getElementById('event-category').value,
                status: document.getElementById('event-status').value,
                date: document.getElementById('event-date').value,
                endDate: document.getElementById('event-end-date').value,
                time: document.getElementById('event-time').value,
                endTime: document.getElementById('event-end-time').value,
                location: document.getElementById('event-location').value.trim(),
                budget: parseFloat(document.getElementById('event-budget').value) || 0,
                guests: document.getElementById('event-guests').value.trim(),
                description: document.getElementById('event-description').value.trim(),
                notes: document.getElementById('event-notes').value.trim()
            };
            const result = id ? await Events.update(id, data) : await Events.add(data);
            if (result) {
                toast(id ? 'Événement mis à jour' : 'Événement ajouté', 'success');
                document.getElementById('modal-event').classList.remove('active');
                await renderEvents();
            }
        });

        const addBtn = document.getElementById('btn-add-event');
        if (addBtn) addBtn.addEventListener('click', () => openEventModal());

        const exportBtn = document.getElementById('btn-export-events');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Events.exportCSV(await Events.getAll()); toast('Événements exportés', 'success'); });

        // Filters
        ['event-filter-type', 'event-filter-status'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderEvents());
        });
    }

    async function editEvent(id) { const e = await Events.getById(id); if (e) openEventModal(e); }
    async function deleteEvent(id) {
        confirmCallback = async () => { if (await Events.remove(id)) { toast('Événement supprimé', 'success'); await renderEvents(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cet événement ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleEventFavorite(id) { await Events.toggleFavorite(id); await renderEvents(); }

    // ===================================================================
    //  PETS VIEW
    // ===================================================================
    async function renderPets() {
        const stats = await Pets.getStats();
        document.getElementById('pet-stat-total').textContent = stats.total;
        document.getElementById('pet-stat-species').textContent = stats.species;
        document.getElementById('pet-stat-vet').textContent = stats.needVet;
        document.getElementById('pet-stat-fav').textContent = stats.favorites;

        const pets = await Pets.getAll();
        const grid = document.getElementById('pets-grid');
        const empty = document.getElementById('pets-empty');
        if (!pets.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = pets.map(p => {
            const sp = Pets.getSpeciesInfo(p.species);
            const age = Pets.getAge(p);
            const needVet = Pets.needsVetVisit(p);
            return `<div class="pet-card" style="border-left: 4px solid ${needVet ? '#EF4444' : '#22C55E'}">
                <div class="pet-card-header">
                    <span class="pet-species">${sp.icon} ${sp.label}</span>
                    ${needVet ? '<span class="badge-warning">🏥 RDV véto</span>' : ''}
                </div>
                <h4 class="pet-name">${p.name}</h4>
                <div class="pet-meta">
                    ${p.breed ? `<span><i class="fas fa-dna"></i> ${p.breed}</span>` : ''}
                    ${age ? `<span><i class="fas fa-birthday-cake"></i> ${age}</span>` : ''}
                    ${p.weight ? `<span><i class="fas fa-weight"></i> ${p.weight} kg</span>` : ''}
                    ${p.gender ? `<span>${p.gender === 'male' ? '♂️' : '♀️'}</span>` : ''}
                </div>
                ${p.vet ? `<div class="pet-vet"><i class="fas fa-stethoscope"></i> ${p.vet}</div>` : ''}
                ${p.notes ? `<div class="pet-notes">${p.notes}</div>` : ''}
                <div class="pet-card-actions">
                    <button class="btn" onclick="App.togglePetFavorite('${p.id}')"><i class="fas fa-heart ${p.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editPet('${p.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deletePet('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openPetModal(pet = null) {
        document.getElementById('modal-pet-title').innerHTML = pet ? '<i class="fas fa-paw"></i> Modifier l\'animal' : '<i class="fas fa-paw"></i> Nouvel animal';
        document.getElementById('pet-id').value = pet?.id || '';
        document.getElementById('pet-name').value = pet?.name || '';
        document.getElementById('pet-species').value = pet?.species || 'chien';
        document.getElementById('pet-breed').value = pet?.breed || '';
        document.getElementById('pet-gender').value = pet?.gender || '';
        document.getElementById('pet-birthdate').value = pet?.birthdate || '';
        document.getElementById('pet-weight').value = pet?.weight || '';
        document.getElementById('pet-vet').value = pet?.vet || '';
        document.getElementById('pet-vet-phone').value = pet?.vetPhone || '';
        document.getElementById('pet-next-vet').value = pet?.nextVetVisit || '';
        document.getElementById('pet-color').value = pet?.color || '';
        document.getElementById('pet-vaccinations').value = pet?.vaccinations || '';
        document.getElementById('pet-food').value = pet?.food || '';
        document.getElementById('pet-notes').value = pet?.notes || '';
        document.getElementById('modal-pet').classList.add('active');
    }

    function bindPetForm() {
        const form = document.getElementById('pet-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('pet-id').value;
            const data = {
                name: document.getElementById('pet-name').value.trim(),
                species: document.getElementById('pet-species').value,
                breed: document.getElementById('pet-breed').value.trim(),
                gender: document.getElementById('pet-gender').value,
                birthdate: document.getElementById('pet-birthdate').value,
                weight: parseFloat(document.getElementById('pet-weight').value) || 0,
                vet: document.getElementById('pet-vet').value.trim(),
                vetPhone: document.getElementById('pet-vet-phone').value.trim(),
                nextVetVisit: document.getElementById('pet-next-vet').value,
                color: document.getElementById('pet-color').value.trim(),
                vaccinations: document.getElementById('pet-vaccinations').value.trim(),
                food: document.getElementById('pet-food').value.trim(),
                notes: document.getElementById('pet-notes').value.trim()
            };
            const result = id ? await Pets.update(id, data) : await Pets.add(data);
            if (result) { toast(id ? 'Animal mis à jour' : 'Animal ajouté', 'success'); document.getElementById('modal-pet').classList.remove('active'); await renderPets(); }
        });
        const addBtn = document.getElementById('btn-add-pet');
        if (addBtn) addBtn.addEventListener('click', () => openPetModal());
        const exportBtn = document.getElementById('btn-export-pets');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Pets.exportCSV(await Pets.getAll()); toast('Animaux exportés', 'success'); });
    }

    async function editPet(id) { const p = await Pets.getById(id); if (p) openPetModal(p); }
    async function deletePet(id) {
        confirmCallback = async () => { if (await Pets.remove(id)) { toast('Animal supprimé', 'success'); await renderPets(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cet animal ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function togglePetFavorite(id) { await Pets.toggleFavorite(id); await renderPets(); }

    // ===================================================================
    //  LEARNING VIEW
    // ===================================================================
    async function renderLearning() {
        const stats = await Learning.getStats();
        document.getElementById('learning-stat-total').textContent = stats.total;
        document.getElementById('learning-stat-progress').textContent = stats.inProgress;
        document.getElementById('learning-stat-completed').textContent = stats.completed;
        document.getElementById('learning-stat-cost').textContent = stats.totalCost + ' MAD';

        let courses = await Learning.getAll();
        const statusF = document.getElementById('learning-filter-status')?.value;
        const catF = document.getElementById('learning-filter-category')?.value;
        if (statusF) courses = courses.filter(c => c.status === statusF);
        if (catF) courses = courses.filter(c => c.category === catF);

        const grid = document.getElementById('learning-grid');
        const empty = document.getElementById('learning-empty');
        if (!courses.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = courses.map(c => {
            const cat = Learning.getCategoryInfo(c.category);
            const st = Learning.getStatusInfo(c.status);
            return `<div class="learning-card" style="border-left: 4px solid ${st.color}">
                <div class="learning-card-header">
                    <span class="learning-category">${cat.icon} ${cat.label}</span>
                    <span class="badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                </div>
                <h4 class="learning-title">${c.title}</h4>
                ${c.platform ? `<div class="learning-platform"><i class="fas fa-globe"></i> ${c.platform}</div>` : ''}
                ${c.instructor ? `<div class="learning-instructor"><i class="fas fa-chalkboard-teacher"></i> ${c.instructor}</div>` : ''}
                <div class="progress-bar-wrap"><div class="progress-bar" style="width:${c.progress}%; background:${st.color}"></div></div>
                <span class="learning-progress-text">${c.progress}%</span>
                ${c.cost ? `<div class="learning-cost"><i class="fas fa-coins"></i> ${c.cost.toFixed(2)} MAD</div>` : ''}
                <div class="learning-card-actions">
                    <button class="btn" onclick="App.toggleCourseFavorite('${c.id}')"><i class="fas fa-heart ${c.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editCourse('${c.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteCourse('${c.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openCourseModal(course = null) {
        document.getElementById('modal-course-title').innerHTML = course ? '<i class="fas fa-graduation-cap"></i> Modifier le cours' : '<i class="fas fa-graduation-cap"></i> Nouveau cours';
        document.getElementById('course-id').value = course?.id || '';
        document.getElementById('course-title').value = course?.title || '';
        document.getElementById('course-platform').value = course?.platform || '';
        document.getElementById('course-category').value = course?.category || 'dev';
        document.getElementById('course-status').value = course?.status || 'not_started';
        document.getElementById('course-instructor').value = course?.instructor || '';
        document.getElementById('course-progress').value = course?.progress || 0;
        document.getElementById('course-start-date').value = course?.startDate || '';
        document.getElementById('course-cost').value = course?.cost || 0;
        document.getElementById('course-url').value = course?.url || '';
        document.getElementById('course-notes').value = course?.notes || '';
        document.getElementById('modal-course').classList.add('active');
    }

    function bindCourseForm() {
        const form = document.getElementById('course-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('course-id').value;
            const data = {
                title: document.getElementById('course-title').value.trim(),
                platform: document.getElementById('course-platform').value.trim(),
                category: document.getElementById('course-category').value,
                status: document.getElementById('course-status').value,
                instructor: document.getElementById('course-instructor').value.trim(),
                progress: parseInt(document.getElementById('course-progress').value) || 0,
                startDate: document.getElementById('course-start-date').value,
                cost: parseFloat(document.getElementById('course-cost').value) || 0,
                url: document.getElementById('course-url').value.trim(),
                notes: document.getElementById('course-notes').value.trim()
            };
            const result = id ? await Learning.update(id, data) : await Learning.add(data);
            if (result) { toast(id ? 'Cours mis à jour' : 'Cours ajouté', 'success'); document.getElementById('modal-course').classList.remove('active'); await renderLearning(); }
        });
        const addBtn = document.getElementById('btn-add-course');
        if (addBtn) addBtn.addEventListener('click', () => openCourseModal());
        const exportBtn = document.getElementById('btn-export-learning');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Learning.exportCSV(await Learning.getAll()); toast('Cours exportés', 'success'); });
        ['learning-filter-status', 'learning-filter-category'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderLearning());
        });
    }

    async function editCourse(id) { const c = await Learning.getById(id); if (c) openCourseModal(c); }
    async function deleteCourse(id) {
        confirmCallback = async () => { if (await Learning.remove(id)) { toast('Cours supprimé', 'success'); await renderLearning(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce cours ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleCourseFavorite(id) { await Learning.toggleFavorite(id); await renderLearning(); }

    // ===================================================================
    //  SLEEP VIEW
    // ===================================================================
    async function renderSleep() {
        const stats = await Sleep.getStats();
        document.getElementById('sleep-stat-total').textContent = stats.total;
        document.getElementById('sleep-stat-duration').textContent = stats.avgDuration + 'h';
        document.getElementById('sleep-stat-quality').textContent = stats.avgQuality + '/5';
        document.getElementById('sleep-stat-week').textContent = stats.thisWeek;

        const entries = await Sleep.getAll();
        const grid = document.getElementById('sleep-grid');
        const empty = document.getElementById('sleep-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const q = Sleep.getQualityInfo(e.quality);
            const m = Sleep.getMoodInfo(e.mood);
            const qRingClass = e.quality >= 5 ? 'sleep-quality-excellent' : e.quality >= 4 ? 'sleep-quality-good' : e.quality >= 3 ? 'sleep-quality-average' : 'sleep-quality-poor';
            return `<div class="sleep-card" style="border-left: 4px solid ${q.color}">
                <div class="sleep-card-header">
                    <span class="sleep-date"><i class="fas fa-calendar"></i> ${e.date ? new Date(e.date).toLocaleDateString('fr-FR') : ''}</span>
                    <div style="display:flex;align-items:center;gap:0.5rem">
                        <span class="sleep-quality-ring ${qRingClass}">${e.quality}</span>
                        <span class="badge" style="background:${q.color}20; color:${q.color}">${q.icon} ${q.label}</span>
                    </div>
                </div>
                <div class="sleep-times">
                    ${e.bedtime ? `<span><i class="fas fa-bed"></i> ${e.bedtime}</span>` : ''}
                    ${e.wakeTime ? `<span><i class="fas fa-sun"></i> ${e.wakeTime}</span>` : ''}
                    ${e.duration ? `<span><i class="fas fa-clock"></i> ${e.duration}h</span>` : ''}
                </div>
                <div class="sleep-meta">
                    <span>${m.icon} ${m.label}</span>
                    ${e.interruptions ? `<span>⚠️ ${e.interruptions} interruption(s)</span>` : ''}
                    ${e.nap ? `<span>😴 Sieste</span>` : ''}
                </div>
                ${e.notes ? `<div class="sleep-notes">${e.notes}</div>` : ''}
                <div class="sleep-card-actions">
                    <button class="btn" onclick="App.editSleep('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteSleep('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openSleepModal(entry = null) {
        document.getElementById('modal-sleep-title').innerHTML = entry ? '<i class="fas fa-moon"></i> Modifier la nuit' : '<i class="fas fa-moon"></i> Nouvelle nuit';
        document.getElementById('sleep-id').value = entry?.id || '';
        document.getElementById('sleep-date').value = entry?.date || new Date().toISOString().split('T')[0];
        document.getElementById('sleep-quality').value = entry?.quality || 3;
        document.getElementById('sleep-bedtime').value = entry?.bedtime || '';
        document.getElementById('sleep-wake-time').value = entry?.wakeTime || '';
        document.getElementById('sleep-duration').value = entry?.duration || 0;
        document.getElementById('sleep-mood').value = entry?.mood || 'normal';
        document.getElementById('sleep-interruptions').value = entry?.interruptions || 0;
        document.getElementById('sleep-nap').value = entry?.nap ? 'true' : 'false';
        document.getElementById('sleep-factors').value = entry?.factors || '';
        document.getElementById('sleep-notes').value = entry?.notes || '';
        document.getElementById('modal-sleep').classList.add('active');
    }

    function bindSleepForm() {
        const form = document.getElementById('sleep-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('sleep-id').value;
            const bedtime = document.getElementById('sleep-bedtime').value;
            const wakeTime = document.getElementById('sleep-wake-time').value;
            const data = {
                date: document.getElementById('sleep-date').value,
                quality: parseInt(document.getElementById('sleep-quality').value),
                bedtime, wakeTime,
                duration: parseFloat(document.getElementById('sleep-duration').value) || Sleep.calcDuration(bedtime, wakeTime),
                mood: document.getElementById('sleep-mood').value,
                interruptions: parseInt(document.getElementById('sleep-interruptions').value) || 0,
                nap: document.getElementById('sleep-nap').value === 'true',
                factors: document.getElementById('sleep-factors').value.trim(),
                notes: document.getElementById('sleep-notes').value.trim()
            };
            const result = id ? await Sleep.update(id, data) : await Sleep.add(data);
            if (result) { toast(id ? 'Nuit mise à jour' : 'Nuit enregistrée', 'success'); document.getElementById('modal-sleep').classList.remove('active'); await renderSleep(); }
        });
        const addBtn = document.getElementById('btn-add-sleep');
        if (addBtn) addBtn.addEventListener('click', () => openSleepModal());
        const exportBtn = document.getElementById('btn-export-sleep');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Sleep.exportCSV(await Sleep.getAll()); toast('Sommeil exporté', 'success'); });

        // Auto-calculate duration from bedtime + wake time
        function autoCalcSleepDuration() {
            const bed = document.getElementById('sleep-bedtime')?.value;
            const wake = document.getElementById('sleep-wake-time')?.value;
            const durEl = document.getElementById('sleep-duration');
            if (bed && wake && durEl) {
                const calc = Sleep.calcDuration(bed, wake);
                if (calc > 0) durEl.value = calc;
            }
        }
        const bedEl = document.getElementById('sleep-bedtime');
        const wakeEl = document.getElementById('sleep-wake-time');
        if (bedEl) bedEl.addEventListener('change', autoCalcSleepDuration);
        if (wakeEl) wakeEl.addEventListener('change', autoCalcSleepDuration);
    }
    async function editSleep(id) { const e = await Sleep.getById(id); if (e) openSleepModal(e); }
    async function deleteSleep(id) {
        confirmCallback = async () => { if (await Sleep.remove(id)) { toast('Entrée supprimée', 'success'); await renderSleep(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette entrée de sommeil ?';
        document.getElementById('modal-confirm').classList.add('active');
    }

    // ===================================================================
    //  HOME VIEW
    // ===================================================================
    async function renderHome() {
        const stats = await Home.getStats();
        document.getElementById('home-stat-total').textContent = stats.total;
        document.getElementById('home-stat-pending').textContent = stats.pending;
        document.getElementById('home-stat-overdue').textContent = stats.overdue;
        document.getElementById('home-stat-cost').textContent = stats.totalCost + ' MAD';

        let tasks = await Home.getAll();
        const statusF = document.getElementById('home-filter-status')?.value;
        const roomF = document.getElementById('home-filter-room')?.value;
        if (statusF) tasks = tasks.filter(t => t.status === statusF);
        if (roomF) tasks = tasks.filter(t => t.room === roomF);

        const grid = document.getElementById('home-grid');
        const empty = document.getElementById('home-empty');
        if (!tasks.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = tasks.map(t => {
            const room = Home.getRoomInfo(t.room);
            const cat = Home.getCategoryInfo(t.category);
            const st = Home.getStatusInfo(t.status);
            const pri = Home.getPriorityInfo(t.priority);
            const overdue = Home.isOverdue(t);
            return `<div class="home-card" style="border-left: 4px solid ${overdue ? '#EF4444' : st.color}">
                <div class="home-card-header">
                    <span>${room.icon} ${room.label}</span>
                    <span class="badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                </div>
                <h4 class="home-title">${t.title}</h4>
                <div class="home-meta">
                    <span>${cat.icon} ${cat.label}</span>
                    <span style="color:${pri.color}">${pri.icon} ${pri.label}</span>
                    ${t.dueDate ? `<span><i class="fas fa-calendar"></i> ${new Date(t.dueDate).toLocaleDateString('fr-FR')}</span>` : ''}
                    ${t.cost ? `<span><i class="fas fa-coins"></i> ${t.cost.toFixed(2)} MAD</span>` : ''}
                </div>
                ${overdue ? '<div class="badge-warning">⚠️ En retard</div>' : ''}
                ${t.contractor ? `<div class="home-contractor"><i class="fas fa-user-tie"></i> ${t.contractor}</div>` : ''}
                <div class="home-card-actions">
                    ${t.status !== 'done' ? `<button class="btn" onclick="App.completeHomeTask('${t.id}')"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn" onclick="App.editHomeTask('${t.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteHomeTask('${t.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openHomeTaskModal(task = null) {
        document.getElementById('modal-home-task-title').innerHTML = task ? '<i class="fas fa-home"></i> Modifier la tâche' : '<i class="fas fa-home"></i> Nouvelle tâche';
        document.getElementById('home-task-id').value = task?.id || '';
        document.getElementById('home-task-title').value = task?.title || '';
        document.getElementById('home-task-room').value = task?.room || 'autre';
        document.getElementById('home-task-category').value = task?.category || 'maintenance';
        document.getElementById('home-task-priority').value = task?.priority || 'normal';
        document.getElementById('home-task-status').value = task?.status || 'todo';
        document.getElementById('home-task-due').value = task?.dueDate || '';
        document.getElementById('home-task-cost').value = task?.cost || 0;
        document.getElementById('home-task-contractor').value = task?.contractor || '';
        document.getElementById('home-task-description').value = task?.description || '';
        document.getElementById('home-task-notes').value = task?.notes || '';
        document.getElementById('modal-home-task').classList.add('active');
    }

    function bindHomeTaskForm() {
        const form = document.getElementById('home-task-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('home-task-id').value;
            const data = {
                title: document.getElementById('home-task-title').value.trim(),
                room: document.getElementById('home-task-room').value,
                category: document.getElementById('home-task-category').value,
                priority: document.getElementById('home-task-priority').value,
                status: document.getElementById('home-task-status').value,
                dueDate: document.getElementById('home-task-due').value,
                cost: parseFloat(document.getElementById('home-task-cost').value) || 0,
                contractor: document.getElementById('home-task-contractor').value.trim(),
                description: document.getElementById('home-task-description').value.trim(),
                notes: document.getElementById('home-task-notes').value.trim()
            };
            const result = id ? await Home.update(id, data) : await Home.add(data);
            if (result) { toast(id ? 'Tâche mise à jour' : 'Tâche ajoutée', 'success'); document.getElementById('modal-home-task').classList.remove('active'); await renderHome(); }
        });
        const addBtn = document.getElementById('btn-add-home-task');
        if (addBtn) addBtn.addEventListener('click', () => openHomeTaskModal());
        const exportBtn = document.getElementById('btn-export-home');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Home.exportCSV(await Home.getAll()); toast('Tâches exportées', 'success'); });
        ['home-filter-status', 'home-filter-room'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderHome());
        });
    }

    async function editHomeTask(id) { const t = await Home.getById(id); if (t) openHomeTaskModal(t); }
    async function deleteHomeTask(id) {
        confirmCallback = async () => { if (await Home.remove(id)) { toast('Tâche supprimée', 'success'); await renderHome(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette tâche ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function completeHomeTask(id) { await Home.completeTask(id); toast('Tâche terminée !', 'success'); await renderHome(); }

    // ===================================================================
    //  GAMES VIEW
    // ===================================================================
    async function renderGames() {
        const stats = await Games.getStats();
        document.getElementById('game-stat-total').textContent = stats.total;
        document.getElementById('game-stat-playing').textContent = stats.playing;
        document.getElementById('game-stat-completed').textContent = stats.completed;
        document.getElementById('game-stat-hours').textContent = stats.totalHours + 'h';

        let games = await Games.getAll();
        const statusF = document.getElementById('game-filter-status')?.value;
        const platformF = document.getElementById('game-filter-platform')?.value;
        if (statusF) games = games.filter(g => g.status === statusF);
        if (platformF) games = games.filter(g => g.platform === platformF);

        const grid = document.getElementById('games-grid');
        const empty = document.getElementById('games-empty');
        if (!games.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = games.map(g => {
            const plat = Games.getPlatformInfo(g.platform);
            const genre = Games.getGenreInfo(g.genre);
            const st = Games.getStatusInfo(g.status);
            return `<div class="game-card" style="border-left: 4px solid ${st.color}">
                <div class="game-card-header">
                    <span>${plat.icon} ${plat.label}</span>
                    <span class="badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                </div>
                <h4 class="game-title">${g.title}</h4>
                <div class="game-meta">
                    <span>${genre.icon} ${genre.label}</span>
                    ${g.hoursPlayed ? `<span><i class="fas fa-clock"></i> ${Games.formatHours(g.hoursPlayed)}</span>` : ''}
                    ${g.rating ? `<span>⭐ ${g.rating}/10</span>` : ''}
                    ${g.developer ? `<span><i class="fas fa-code"></i> ${g.developer}</span>` : ''}
                </div>
                ${g.progress ? `<div class="progress-bar-wrap"><div class="progress-bar" style="width:${g.progress}%; background:${st.color}"></div></div><span class="game-progress-text">${g.progress}%</span>` : ''}
                <div class="game-card-actions">
                    <button class="btn" onclick="App.toggleGameFavorite('${g.id}')"><i class="fas fa-heart ${g.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editGame('${g.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteGame('${g.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openGameModal(game = null) {
        document.getElementById('modal-game-title').innerHTML = game ? '<i class="fas fa-gamepad"></i> Modifier le jeu' : '<i class="fas fa-gamepad"></i> Nouveau jeu';
        document.getElementById('game-id').value = game?.id || '';
        document.getElementById('game-title').value = game?.title || '';
        document.getElementById('game-platform').value = game?.platform || 'pc';
        document.getElementById('game-genre').value = game?.genre || 'action';
        document.getElementById('game-status').value = game?.status || 'backlog';
        document.getElementById('game-progress').value = game?.progress || 0;
        document.getElementById('game-hours').value = game?.hoursPlayed || 0;
        document.getElementById('game-rating').value = game?.rating || 0;
        document.getElementById('game-price').value = game?.price || 0;
        document.getElementById('game-developer').value = game?.developer || '';
        document.getElementById('game-notes').value = game?.notes || '';
        document.getElementById('modal-game').classList.add('active');
    }

    function bindGameForm() {
        const form = document.getElementById('game-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('game-id').value;
            const data = {
                title: document.getElementById('game-title').value.trim(),
                platform: document.getElementById('game-platform').value,
                genre: document.getElementById('game-genre').value,
                status: document.getElementById('game-status').value,
                progress: parseInt(document.getElementById('game-progress').value) || 0,
                hoursPlayed: parseFloat(document.getElementById('game-hours').value) || 0,
                rating: parseInt(document.getElementById('game-rating').value) || 0,
                price: parseFloat(document.getElementById('game-price').value) || 0,
                developer: document.getElementById('game-developer').value.trim(),
                notes: document.getElementById('game-notes').value.trim()
            };
            const result = id ? await Games.update(id, data) : await Games.add(data);
            if (result) { toast(id ? 'Jeu mis à jour' : 'Jeu ajouté', 'success'); document.getElementById('modal-game').classList.remove('active'); await renderGames(); }
        });
        const addBtn = document.getElementById('btn-add-game');
        if (addBtn) addBtn.addEventListener('click', () => openGameModal());
        const exportBtn = document.getElementById('btn-export-games');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Games.exportCSV(await Games.getAll()); toast('Jeux exportés', 'success'); });
        ['game-filter-status', 'game-filter-platform'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderGames());
        });
    }

    async function editGame(id) { const g = await Games.getById(id); if (g) openGameModal(g); }
    async function deleteGame(id) {
        confirmCallback = async () => { if (await Games.remove(id)) { toast('Jeu supprimé', 'success'); await renderGames(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce jeu ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleGameFavorite(id) { await Games.toggleFavorite(id); await renderGames(); }

    // ===================================================================
    //  WARDROBE VIEW
    // ===================================================================
    async function renderWardrobe() {
        const stats = await Wardrobe.getStats();
        document.getElementById('wardrobe-stat-total').textContent = stats.total;
        document.getElementById('wardrobe-stat-categories').textContent = stats.categories;
        document.getElementById('wardrobe-stat-value').textContent = stats.totalValue + ' MAD';
        document.getElementById('wardrobe-stat-fav').textContent = stats.favorites;

        let items = await Wardrobe.getAll();
        const catF = document.getElementById('wardrobe-filter-category')?.value;
        const seasonF = document.getElementById('wardrobe-filter-season')?.value;
        if (catF) items = items.filter(i => i.category === catF);
        if (seasonF) items = items.filter(i => i.season === seasonF);

        const grid = document.getElementById('wardrobe-grid');
        const empty = document.getElementById('wardrobe-empty');
        if (!items.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = items.map(i => {
            const cat = Wardrobe.getCategoryInfo(i.category);
            const season = Wardrobe.getSeasonInfo(i.season);
            const cond = Wardrobe.getConditionInfo(i.condition);
            return `<div class="wardrobe-card" style="border-left: 4px solid ${cond.color}">
                <div class="wardrobe-card-header">
                    <span>${cat.icon} ${cat.label}</span>
                    <span class="badge" style="background:${cond.color}20; color:${cond.color}">${cond.icon} ${cond.label}</span>
                </div>
                <h4 class="wardrobe-title">${i.name}</h4>
                <div class="wardrobe-meta">
                    ${i.brand ? `<span><i class="fas fa-tag"></i> ${i.brand}</span>` : ''}
                    ${i.color ? `<span><i class="fas fa-palette"></i> ${i.color}</span>` : ''}
                    ${i.size ? `<span><i class="fas fa-ruler"></i> ${i.size}</span>` : ''}
                    <span>${season.icon} ${season.label}</span>
                </div>
                <div class="wardrobe-extra">
                    ${i.timesWorn ? `<span>👕 Porté ${i.timesWorn}x</span>` : ''}
                    ${i.price ? `<span><i class="fas fa-coins"></i> ${i.price.toFixed(2)} MAD</span>` : ''}
                </div>
                <div class="wardrobe-card-actions">
                    <button class="btn" onclick="App.wearWardrobeItem('${i.id}')" title="Porter"><i class="fas fa-check"></i></button>
                    <button class="btn" onclick="App.toggleWardrobeFavorite('${i.id}')"><i class="fas fa-heart ${i.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editWardrobe('${i.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteWardrobe('${i.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openWardrobeModal(item = null) {
        document.getElementById('modal-wardrobe-title').innerHTML = item ? '<i class="fas fa-tshirt"></i> Modifier le vêtement' : '<i class="fas fa-tshirt"></i> Nouveau vêtement';
        document.getElementById('wardrobe-id').value = item?.id || '';
        document.getElementById('wardrobe-name').value = item?.name || '';
        document.getElementById('wardrobe-category').value = item?.category || 'top';
        document.getElementById('wardrobe-brand').value = item?.brand || '';
        document.getElementById('wardrobe-color').value = item?.color || '';
        document.getElementById('wardrobe-size').value = item?.size || '';
        document.getElementById('wardrobe-season').value = item?.season || 'all';
        document.getElementById('wardrobe-occasion').value = item?.occasion || 'casual';
        document.getElementById('wardrobe-condition').value = item?.condition || 'good';
        document.getElementById('wardrobe-price').value = item?.price || 0;
        document.getElementById('wardrobe-purchase-date').value = item?.purchaseDate || '';
        document.getElementById('wardrobe-notes').value = item?.notes || '';
        document.getElementById('modal-wardrobe').classList.add('active');
    }

    function bindWardrobeForm() {
        const form = document.getElementById('wardrobe-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('wardrobe-id').value;
            const data = {
                name: document.getElementById('wardrobe-name').value.trim(),
                category: document.getElementById('wardrobe-category').value,
                brand: document.getElementById('wardrobe-brand').value.trim(),
                color: document.getElementById('wardrobe-color').value.trim(),
                size: document.getElementById('wardrobe-size').value.trim(),
                season: document.getElementById('wardrobe-season').value,
                occasion: document.getElementById('wardrobe-occasion').value,
                condition: document.getElementById('wardrobe-condition').value,
                price: parseFloat(document.getElementById('wardrobe-price').value) || 0,
                purchaseDate: document.getElementById('wardrobe-purchase-date').value,
                notes: document.getElementById('wardrobe-notes').value.trim()
            };
            const result = id ? await Wardrobe.update(id, data) : await Wardrobe.add(data);
            if (result) { toast(id ? 'Vêtement mis à jour' : 'Vêtement ajouté', 'success'); document.getElementById('modal-wardrobe').classList.remove('active'); await renderWardrobe(); }
        });
        const addBtn = document.getElementById('btn-add-wardrobe');
        if (addBtn) addBtn.addEventListener('click', () => openWardrobeModal());
        const exportBtn = document.getElementById('btn-export-wardrobe');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Wardrobe.exportCSV(await Wardrobe.getAll()); toast('Garde-robe exportée', 'success'); });
        ['wardrobe-filter-category', 'wardrobe-filter-season'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderWardrobe());
        });
    }

    async function editWardrobe(id) { const i = await Wardrobe.getById(id); if (i) openWardrobeModal(i); }
    async function deleteWardrobe(id) {
        confirmCallback = async () => { if (await Wardrobe.remove(id)) { toast('Vêtement supprimé', 'success'); await renderWardrobe(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce vêtement ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleWardrobeFavorite(id) { await Wardrobe.toggleFavorite(id); await renderWardrobe(); }
    async function wearWardrobeItem(id) { await Wardrobe.wearItem(id); toast('Porté !', 'success'); await renderWardrobe(); }

    // ===================================================================
    //  PACKAGES VIEW
    // ===================================================================
    async function renderPackages() {
        const stats = await Packages.getStats();
        document.getElementById('package-stat-total').textContent = stats.total;
        document.getElementById('package-stat-transit').textContent = stats.inTransit;
        document.getElementById('package-stat-delivered').textContent = stats.delivered;
        document.getElementById('package-stat-spent').textContent = stats.totalSpent + ' MAD';

        let pkgs = await Packages.getAll();
        const statusF = document.getElementById('package-filter-status')?.value;
        const carrierF = document.getElementById('package-filter-carrier')?.value;
        if (statusF) pkgs = pkgs.filter(p => p.status === statusF);
        if (carrierF) pkgs = pkgs.filter(p => p.carrier === carrierF);

        const grid = document.getElementById('packages-grid');
        const empty = document.getElementById('packages-empty');
        if (!pkgs.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = pkgs.map(p => {
            const carrier = Packages.getCarrierInfo(p.carrier);
            const st = Packages.getStatusInfo(p.status);
            const daysLeft = Packages.getDaysUntilDelivery(p);
            return `<div class="package-card" style="border-left: 4px solid ${st.color}">
                <div class="package-card-header">
                    <span>${carrier.icon} ${carrier.label}</span>
                    <span class="badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                </div>
                <h4 class="package-title">${p.name}</h4>
                <div class="package-meta">
                    ${p.store ? `<span><i class="fas fa-store"></i> ${p.store}</span>` : ''}
                    ${p.trackingNumber ? `<span><i class="fas fa-barcode"></i> ${p.trackingNumber}</span>` : ''}
                    ${p.orderDate ? `<span><i class="fas fa-calendar"></i> ${new Date(p.orderDate).toLocaleDateString('fr-FR')}</span>` : ''}
                    ${p.price ? `<span><i class="fas fa-coins"></i> ${p.price.toFixed(2)} MAD</span>` : ''}
                </div>
                ${daysLeft !== null && daysLeft >= 0 ? `<div class="package-eta">📦 Livraison dans ${daysLeft}j</div>` : ''}
                <div class="package-card-actions">
                    ${p.status !== 'delivered' ? `<button class="btn" onclick="App.markPackageDelivered('${p.id}')" title="Marquer livré"><i class="fas fa-check-circle"></i></button>` : ''}
                    <button class="btn" onclick="App.editPackage('${p.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deletePackage('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openPackageModal(pkg = null) {
        document.getElementById('modal-package-title').innerHTML = pkg ? '<i class="fas fa-box"></i> Modifier le colis' : '<i class="fas fa-box"></i> Nouveau colis';
        document.getElementById('package-id').value = pkg?.id || '';
        document.getElementById('package-name').value = pkg?.name || '';
        document.getElementById('package-store').value = pkg?.store || '';
        document.getElementById('package-tracking').value = pkg?.trackingNumber || '';
        document.getElementById('package-carrier').value = pkg?.carrier || 'poste';
        document.getElementById('package-status').value = pkg?.status || 'ordered';
        document.getElementById('package-order-date').value = pkg?.orderDate || '';
        document.getElementById('package-expected').value = pkg?.expectedDate || '';
        document.getElementById('package-price').value = pkg?.price || 0;
        document.getElementById('package-notes').value = pkg?.notes || '';
        document.getElementById('modal-package').classList.add('active');
    }

    function bindPackageForm() {
        const form = document.getElementById('package-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('package-id').value;
            const data = {
                name: document.getElementById('package-name').value.trim(),
                store: document.getElementById('package-store').value.trim(),
                trackingNumber: document.getElementById('package-tracking').value.trim(),
                carrier: document.getElementById('package-carrier').value,
                status: document.getElementById('package-status').value,
                orderDate: document.getElementById('package-order-date').value,
                expectedDate: document.getElementById('package-expected').value,
                price: parseFloat(document.getElementById('package-price').value) || 0,
                notes: document.getElementById('package-notes').value.trim()
            };
            const result = id ? await Packages.update(id, data) : await Packages.add(data);
            if (result) { toast(id ? 'Colis mis à jour' : 'Colis ajouté', 'success'); document.getElementById('modal-package').classList.remove('active'); await renderPackages(); }
        });
        const addBtn = document.getElementById('btn-add-package');
        if (addBtn) addBtn.addEventListener('click', () => openPackageModal());
        const exportBtn = document.getElementById('btn-export-packages');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Packages.exportCSV(await Packages.getAll()); toast('Colis exportés', 'success'); });
        ['package-filter-status', 'package-filter-carrier'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderPackages());
        });
    }

    async function editPackage(id) { const p = await Packages.getById(id); if (p) openPackageModal(p); }
    async function deletePackage(id) {
        confirmCallback = async () => { if (await Packages.remove(id)) { toast('Colis supprimé', 'success'); await renderPackages(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce colis ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function markPackageDelivered(id) { await Packages.markDelivered(id); toast('Colis livré !', 'success'); await renderPackages(); }

    // ===================================================================
    //  IDEAS VIEW
    // ===================================================================
    async function renderIdeas() {
        const stats = await Ideas.getStats();
        document.getElementById('idea-stat-total').textContent = stats.total;
        document.getElementById('idea-stat-active').textContent = stats.active;
        document.getElementById('idea-stat-realized').textContent = stats.realized;
        document.getElementById('idea-stat-fav').textContent = stats.favorites;

        let ideas = await Ideas.getAll();
        const statusF = document.getElementById('idea-filter-status')?.value;
        const catF = document.getElementById('idea-filter-category')?.value;
        if (statusF) ideas = ideas.filter(i => i.status === statusF);
        if (catF) ideas = ideas.filter(i => i.category === catF);

        const grid = document.getElementById('ideas-grid');
        const empty = document.getElementById('ideas-empty');
        if (!ideas.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = ideas.map(i => {
            const cat = Ideas.getCategoryInfo(i.category);
            const st = Ideas.getStatusInfo(i.status);
            const pri = Ideas.getPriorityInfo(i.priority);
            const priClass = i.priority === 'high' ? 'idea-priority-high' : i.priority === 'low' ? 'idea-priority-low' : 'idea-priority-medium';
            return `<div class="idea-card" style="border-left: 4px solid ${st.color}">
                <div class="idea-card-header">
                    <span>${cat.icon} ${cat.label}</span>
                    <span class="badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                </div>
                <h4 class="idea-title">${i.title}</h4>
                ${i.description ? `<div class="idea-description">${i.description}</div>` : ''}
                <div class="idea-meta">
                    <span class="${priClass}">${pri.icon} ${pri.label}</span>
                    <span>💥 Impact: ${i.impact}</span>
                    <span>💪 Effort: ${i.effort}</span>
                </div>
                ${i.tags ? `<div class="idea-tags">${i.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>` : ''}
                <div class="idea-card-actions">
                    <button class="btn" onclick="App.toggleIdeaFavorite('${i.id}')"><i class="fas fa-heart ${i.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editIdea('${i.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteIdea('${i.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openIdeaModal(idea = null) {
        document.getElementById('modal-idea-title').innerHTML = idea ? '<i class="fas fa-lightbulb"></i> Modifier l\'idée' : '<i class="fas fa-lightbulb"></i> Nouvelle idée';
        document.getElementById('idea-id').value = idea?.id || '';
        document.getElementById('idea-title').value = idea?.title || '';
        document.getElementById('idea-category').value = idea?.category || 'general';
        document.getElementById('idea-status').value = idea?.status || 'new';
        document.getElementById('idea-priority').value = idea?.priority || 'normal';
        document.getElementById('idea-impact').value = idea?.impact || 'medium';
        document.getElementById('idea-effort').value = idea?.effort || 'medium';
        document.getElementById('idea-description').value = idea?.description || '';
        document.getElementById('idea-tags').value = idea?.tags || '';
        document.getElementById('idea-notes').value = idea?.notes || '';
        document.getElementById('modal-idea').classList.add('active');
    }

    function bindIdeaForm() {
        const form = document.getElementById('idea-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('idea-id').value;
            const data = {
                title: document.getElementById('idea-title').value.trim(),
                category: document.getElementById('idea-category').value,
                status: document.getElementById('idea-status').value,
                priority: document.getElementById('idea-priority').value,
                impact: document.getElementById('idea-impact').value,
                effort: document.getElementById('idea-effort').value,
                description: document.getElementById('idea-description').value.trim(),
                tags: document.getElementById('idea-tags').value.trim(),
                notes: document.getElementById('idea-notes').value.trim()
            };
            const result = id ? await Ideas.update(id, data) : await Ideas.add(data);
            if (result) { toast(id ? 'Idée mise à jour' : 'Idée ajoutée', 'success'); document.getElementById('modal-idea').classList.remove('active'); await renderIdeas(); }
        });
        const addBtn = document.getElementById('btn-add-idea');
        if (addBtn) addBtn.addEventListener('click', () => openIdeaModal());
        const exportBtn = document.getElementById('btn-export-ideas');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Ideas.exportCSV(await Ideas.getAll()); toast('Idées exportées', 'success'); });
        ['idea-filter-status', 'idea-filter-category'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderIdeas());
        });
    }

    async function editIdea(id) { const i = await Ideas.getById(id); if (i) openIdeaModal(i); }
    async function deleteIdea(id) {
        confirmCallback = async () => { if (await Ideas.remove(id)) { toast('Idée supprimée', 'success'); await renderIdeas(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette idée ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleIdeaFavorite(id) { await Ideas.toggleFavorite(id); await renderIdeas(); }

    // ===================================================================
    //  PROJECTS VIEW
    // ===================================================================
    async function renderProjects() {
        const stats = await Projects.getStats();
        document.getElementById('project-stat-total').textContent = stats.total;
        document.getElementById('project-stat-active').textContent = stats.active;
        document.getElementById('project-stat-completed').textContent = stats.completed;
        document.getElementById('project-stat-overdue').textContent = stats.overdue;

        let projects = await Projects.getAll();
        const statusF = document.getElementById('project-filter-status')?.value;
        const priF = document.getElementById('project-filter-priority')?.value;
        if (statusF) projects = projects.filter(p => p.status === statusF);
        if (priF) projects = projects.filter(p => p.priority === priF);

        const grid = document.getElementById('projects-grid');
        const empty = document.getElementById('projects-empty');
        if (!projects.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        // Global completion bar
        const globalPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        let globalBarEl = document.getElementById('proj-global-bar');
        if (!globalBarEl) { globalBarEl = document.createElement('div'); globalBarEl.id = 'proj-global-bar'; grid.parentElement.insertBefore(globalBarEl, grid); }
        globalBarEl.className = 'proj-global-bar';
        globalBarEl.innerHTML = `<span class="proj-global-label"><i class="fas fa-tasks"></i> Progression globale</span><div class="proj-global-track"><div class="proj-global-fill" style="width:${globalPct}%"></div></div><span class="proj-global-pct">${stats.completed}/${stats.total} — ${globalPct}%</span>`;

        grid.innerHTML = projects.map(p => {
            const cat = Projects.getCategoryInfo(p.category);
            const st = Projects.getStatusInfo(p.status);
            const pri = Projects.getPriorityInfo(p.priority);
            const overdue = Projects.isOverdue(p);
            const daysLeft = Projects.getDaysUntilDeadline(p);
            const budgetPct = Projects.getBudgetUsage(p);
            const statusClass = p.status === 'active' ? 'project-status-active' : p.status === 'paused' ? 'project-status-paused' : (p.status === 'completed' || p.status === 'finished') ? 'project-status-finished' : '';
            return `<div class="project-card" style="border-left: 4px solid ${overdue ? '#EF4444' : st.color}">
                <div class="project-card-header">
                    <span>${cat.icon} ${cat.label}</span>
                    <span class="${statusClass || 'badge'}" ${statusClass ? '' : `style="background:${st.color}20; color:${st.color}"`}>${st.icon} ${st.label}</span>
                </div>
                <h4 class="project-title">${p.name}</h4>
                ${p.description ? `<div class="project-description">${p.description}</div>` : ''}
                <div class="project-meta">
                    <span style="color:${pri.color}">${pri.icon} ${pri.label}</span>
                    ${daysLeft !== null ? `<span><i class="fas fa-calendar"></i> ${daysLeft > 0 ? daysLeft + 'j restants' : 'En retard'}</span>` : ''}
                    ${p.budget ? `<span><i class="fas fa-coins"></i> ${p.spent}/${p.budget} MAD (${budgetPct}%)</span>` : ''}
                </div>
                <div class="progress-bar-wrap"><div class="progress-bar" style="width:${p.progress}%; background:${st.color}"></div></div>
                <span class="project-progress-text">${p.progress}%</span>
                ${overdue ? '<div class="badge-warning">⚠️ En retard</div>' : ''}
                <div class="project-card-actions">
                    <button class="btn" onclick="App.toggleProjectFavorite('${p.id}')"><i class="fas fa-heart ${p.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editProject('${p.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteProject('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openProjectModal(project = null) {
        document.getElementById('modal-project-title').innerHTML = project ? '<i class="fas fa-project-diagram"></i> Modifier le projet' : '<i class="fas fa-project-diagram"></i> Nouveau projet';
        document.getElementById('project-id').value = project?.id || '';
        document.getElementById('project-name').value = project?.name || '';
        document.getElementById('project-category').value = project?.category || 'personal';
        document.getElementById('project-status').value = project?.status || 'planning';
        document.getElementById('project-priority').value = project?.priority || 'normal';
        document.getElementById('project-progress').value = project?.progress || 0;
        document.getElementById('project-deadline').value = project?.deadline || '';
        document.getElementById('project-budget').value = project?.budget || 0;
        document.getElementById('project-spent').value = project?.spent || 0;
        document.getElementById('project-description').value = project?.description || '';
        document.getElementById('project-tags').value = project?.tags || '';
        document.getElementById('project-notes').value = project?.notes || '';
        document.getElementById('modal-project').classList.add('active');
    }

    function bindProjectForm() {
        const form = document.getElementById('project-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('project-id').value;
            const data = {
                name: document.getElementById('project-name').value.trim(),
                category: document.getElementById('project-category').value,
                status: document.getElementById('project-status').value,
                priority: document.getElementById('project-priority').value,
                progress: parseInt(document.getElementById('project-progress').value) || 0,
                deadline: document.getElementById('project-deadline').value,
                budget: parseFloat(document.getElementById('project-budget').value) || 0,
                spent: parseFloat(document.getElementById('project-spent').value) || 0,
                description: document.getElementById('project-description').value.trim(),
                tags: document.getElementById('project-tags').value.trim(),
                notes: document.getElementById('project-notes').value.trim()
            };
            const result = id ? await Projects.update(id, data) : await Projects.add(data);
            if (result) { toast(id ? 'Projet mis à jour' : 'Projet ajouté', 'success'); document.getElementById('modal-project').classList.remove('active'); await renderProjects(); }
        });
        const addBtn = document.getElementById('btn-add-project');
        if (addBtn) addBtn.addEventListener('click', () => openProjectModal());
        const exportBtn = document.getElementById('btn-export-projects');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Projects.exportCSV(await Projects.getAll()); toast('Projets exportés', 'success'); });
        ['project-filter-status', 'project-filter-priority'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderProjects());
        });
    }

    async function editProject(id) { const p = await Projects.getById(id); if (p) openProjectModal(p); }
    async function deleteProject(id) {
        confirmCallback = async () => { if (await Projects.remove(id)) { toast('Projet supprimé', 'success'); await renderProjects(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce projet ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleProjectFavorite(id) { await Projects.toggleFavorite(id); await renderProjects(); }

    // ===================================================================
    //  PASSWORDS VIEW
    // ===================================================================
    async function renderPasswords() {
        const stats = await Passwords.getStats();
        document.getElementById('password-stat-total').textContent = stats.total;
        document.getElementById('password-stat-weak').textContent = stats.weak;
        document.getElementById('password-stat-expired').textContent = stats.expired;
        document.getElementById('password-stat-2fa').textContent = stats.with2FA;

        let entries = await Passwords.getAll();
        const catF = document.getElementById('password-filter-category')?.value;
        const strF = document.getElementById('password-filter-strength')?.value;
        if (catF) entries = entries.filter(e => e.category === catF);
        if (strF) entries = entries.filter(e => e.strength === strF);

        const grid = document.getElementById('passwords-grid');
        const empty = document.getElementById('passwords-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const cat = Passwords.getCategoryInfo(e.category);
            const str = Passwords.getStrengthInfo(e.strength);
            const expired = Passwords.isExpired(e);
            const old = Passwords.isOld(e);
            return `<div class="password-card" style="border-left: 4px solid ${str.color}">
                <div class="password-card-header">
                    <span>${cat.icon} ${cat.label}</span>
                    <span class="badge" style="background:${str.color}20; color:${str.color}">${str.icon} ${str.label}</span>
                </div>
                <h4 class="password-title">${e.site}</h4>
                <div class="password-meta">
                    ${e.username ? `<span><i class="fas fa-user"></i> ${e.username}</span>` : ''}
                    ${e.email ? `<span><i class="fas fa-envelope"></i> ${e.email}</span>` : ''}
                    <span><i class="fas fa-key"></i> ${Passwords.maskPassword(e.password)}</span>
                </div>
                <div class="password-extra">
                    ${e.twoFactor ? '<span class="badge-success">🛡️ 2FA</span>' : '<span class="badge-muted">Pas de 2FA</span>'}
                    ${expired ? '<span class="badge-warning">⚠️ Expiré</span>' : ''}
                    ${old ? '<span class="badge-muted">🕐 Ancien</span>' : ''}
                </div>
                <div class="password-card-actions">
                    <button class="btn" onclick="App.copyPassword('${e.id}')" title="Copier mot de passe"><i class="fas fa-copy"></i></button>
                    ${(e.username || e.email) ? `<button class="btn" onclick="App.copyUsername('${e.id}')" title="Copier identifiant"><i class="fas fa-user-check"></i></button>` : ''}
                    <button class="btn" onclick="App.togglePasswordFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editPassword('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deletePassword('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openPasswordModal(entry = null) {
        document.getElementById('modal-password-title').innerHTML = entry ? '<i class="fas fa-lock"></i> Modifier le mot de passe' : '<i class="fas fa-lock"></i> Nouveau mot de passe';
        document.getElementById('password-id').value = entry?.id || '';
        document.getElementById('password-site').value = entry?.site || '';
        document.getElementById('password-category').value = entry?.category || 'web';
        document.getElementById('password-username').value = entry?.username || '';
        document.getElementById('password-email').value = entry?.email || '';
        document.getElementById('password-password').value = entry?.password || '';
        document.getElementById('password-strength').value = entry?.strength || 'medium';
        document.getElementById('password-url').value = entry?.url || '';
        document.getElementById('password-2fa').value = entry?.twoFactor ? 'true' : 'false';
        document.getElementById('password-last-changed').value = entry?.lastChanged || '';
        document.getElementById('password-expires').value = entry?.expiresAt || '';
        document.getElementById('password-notes').value = entry?.notes || '';
        document.getElementById('modal-password').classList.add('active');
    }

    function bindPasswordForm() {
        const form = document.getElementById('password-form');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('password-id').value;
            const pwd = document.getElementById('password-password').value;
            const data = {
                site: document.getElementById('password-site').value.trim(),
                category: document.getElementById('password-category').value,
                username: document.getElementById('password-username').value.trim(),
                email: document.getElementById('password-email').value.trim(),
                password: pwd,
                strength: Passwords.evaluateStrength(pwd),
                url: document.getElementById('password-url').value.trim(),
                twoFactor: document.getElementById('password-2fa').value === 'true',
                lastChanged: document.getElementById('password-last-changed').value,
                expiresAt: document.getElementById('password-expires').value,
                notes: document.getElementById('password-notes').value.trim()
            };
            const result = id ? await Passwords.update(id, data) : await Passwords.add(data);
            if (result) { toast(id ? 'Mot de passe mis à jour' : 'Mot de passe ajouté', 'success'); document.getElementById('modal-password').classList.remove('active'); await renderPasswords(); }
        });
        const addBtn = document.getElementById('btn-add-password');
        if (addBtn) addBtn.addEventListener('click', () => openPasswordModal());
        const exportBtn = document.getElementById('btn-export-passwords');
        if (exportBtn) exportBtn.addEventListener('click', async () => { Passwords.exportCSV(await Passwords.getAll()); toast('Mots de passe exportés', 'success'); });
        ['password-filter-category', 'password-filter-strength'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => renderPasswords());
        });

        // Password generator button
        const pwdFieldGroup = document.getElementById('password-password')?.closest('.form-group');
        if (pwdFieldGroup && !pwdFieldGroup.querySelector('.pwd-gen-btn')) {
            const genBtn = document.createElement('button');
            genBtn.type = 'button'; genBtn.className = 'pwd-gen-btn';
            genBtn.innerHTML = '<i class="fas fa-magic"></i> Générer un mot de passe sécurisé';
            genBtn.addEventListener('click', () => {
                const generated = Passwords.generatePassword(16);
                const pwdField = document.getElementById('password-password');
                if (pwdField) { pwdField.value = generated; pwdField.dispatchEvent(new Event('input')); toast('Mot de passe généré ✨', 'success'); }
            });
            pwdFieldGroup.appendChild(genBtn);
        }

        // Show/hide password toggle
        const pwdField = document.getElementById('password-password');
        if (pwdField && !pwdField.parentElement.querySelector('.pwd-toggle-vis')) {
            const wrap = pwdField.parentElement;
            wrap.style.position = 'relative';
            pwdField.style.paddingRight = '2.5rem';
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button'; toggleBtn.className = 'pwd-toggle-vis';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            toggleBtn.addEventListener('click', () => {
                const isText = pwdField.type === 'text';
                pwdField.type = isText ? 'password' : 'text';
                toggleBtn.innerHTML = isText ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
            wrap.appendChild(toggleBtn);

            // Live strength indicator
            const strengthEl = document.getElementById('password-strength');
            if (strengthEl) {
                const strengthRow = document.createElement('div');
                strengthRow.className = 'pwd-strength-row';
                strengthRow.id = 'pwd-strength-row';
                strengthRow.innerHTML = '<div class="pwd-strength-bar"><div class="pwd-strength-fill" id="pwd-strength-fill" style="width:0%"></div></div><span class="pwd-strength-label" id="pwd-strength-label"></span>';
                if (!document.getElementById('pwd-strength-row')) {
                    pwdField.parentElement.after(strengthRow);
                }
                pwdField.addEventListener('input', () => {
                    const val = pwdField.value;
                    const str = Passwords.evaluateStrength(val);
                    strengthEl.value = str;
                    const fill = document.getElementById('pwd-strength-fill');
                    const label = document.getElementById('pwd-strength-label');
                    const strMap = { weak: { w: '25%', c: '#EF4444', l: '🔴 Faible' }, medium: { w: '55%', c: '#F59E0B', l: '🟡 Moyen' }, strong: { w: '80%', c: '#22C55E', l: '🟢 Fort' }, very_strong: { w: '100%', c: '#6366F1', l: '🛡️ Très fort' } };
                    const info = strMap[str] || strMap.weak;
                    if (fill) { fill.style.width = info.w; fill.style.background = info.c; }
                    if (label) { label.textContent = info.l; label.style.color = info.c; }
                });
            }
        }
    }
    async function editPassword(id) { const e = await Passwords.getById(id); if (e) openPasswordModal(e); }
    async function deletePassword(id) {
        confirmCallback = async () => { if (await Passwords.remove(id)) { toast('Mot de passe supprimé', 'success'); await renderPasswords(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce mot de passe ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function togglePasswordFavorite(id) { await Passwords.toggleFavorite(id); await renderPasswords(); }
    async function copyPassword(id) {
        const e = await Passwords.getById(id);
        if (e && e.password) { await navigator.clipboard.writeText(e.password); toast('Mot de passe copié !', 'success'); }
    }
    async function copyUsername(id) {
        const e = await Passwords.getById(id);
        if (e && e.username) { await navigator.clipboard.writeText(e.username); toast('Identifiant copié !', 'success'); }
        else if (e && e.email) { await navigator.clipboard.writeText(e.email); toast('Email copié !', 'success'); }
    }

    // ===================================================================
    //  SUBSCRIPTIONS VIEW
    // ===================================================================
    async function renderSubscriptions() {
        const stats = await Subscriptions.getStats();
        document.getElementById('subscriptions-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-newspaper"></i></div><div class="stat-info"><span class="stat-label">Total</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-label">Actifs</span><span class="stat-value">${stats.active}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-calendar-alt"></i></div><div class="stat-info"><span class="stat-label">Coût mensuel</span><span class="stat-value">${stats.monthlyTotal} MAD</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-calendar"></i></div><div class="stat-info"><span class="stat-label">Coût annuel</span><span class="stat-value">${stats.yearlyTotal} MAD</span></div></div>`;

        // Populate filter options
        const catSel = document.getElementById('subscriptions-filter-category');
        if (catSel && catSel.options.length <= 1) { Subscriptions.CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; catSel.appendChild(o); }); }
        const stSel = document.getElementById('subscriptions-filter-status');
        if (stSel && stSel.options.length <= 1) { Subscriptions.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }

        let entries = await Subscriptions.getAll();
        const search = document.getElementById('subscriptions-search')?.value?.toLowerCase();
        const catF = document.getElementById('subscriptions-filter-category')?.value;
        const stF = document.getElementById('subscriptions-filter-status')?.value;
        if (search) entries = entries.filter(e => e.name.toLowerCase().includes(search) || e.provider.toLowerCase().includes(search));
        if (catF) entries = entries.filter(e => e.category === catF);
        if (stF) entries = entries.filter(e => e.status === stF);

        const grid = document.getElementById('subscriptions-grid');
        const empty = document.getElementById('subscriptions-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const cat = Subscriptions.getCategoryInfo(e.category);
            const st = Subscriptions.getStatusInfo(e.status);
            const renewal = Subscriptions.isRenewalSoon(e);
            return `<div class="module-card" style="--mc-accent:${cat.color}">
                <div class="mc-header">
                    <span class="mc-type">${cat.icon} ${cat.label}</span>
                    <div class="mc-badges">
                        <span class="mc-badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                        ${renewal ? '<span class="mc-badge" style="background:#F59E0B20; color:#F59E0B">⚠️ Renouvellement proche</span>' : ''}
                    </div>
                </div>
                <div class="mc-title">${e.name}</div>
                ${e.provider ? `<div class="mc-subtitle">${e.provider}</div>` : ''}
                <div class="mc-meta">
                    <span><i class="fas fa-coins"></i> ${e.price} MAD/${e.frequency}</span>
                    ${e.renewalDate ? `<span><i class="fas fa-calendar"></i> ${e.renewalDate}</span>` : ''}
                </div>
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleSubscriptionFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editSubscription('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteSubscription('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openSubscriptionModal(entry = null) {
        document.getElementById('modal-subscription-title').innerHTML = entry ? '<i class="fas fa-newspaper"></i> Modifier l\'abonnement' : '<i class="fas fa-newspaper"></i> Nouvel abonnement';
        document.getElementById('subscription-id').value = entry?.id || '';
        document.getElementById('subscription-name').value = entry?.name || '';
        document.getElementById('subscription-provider').value = entry?.provider || '';
        const catSel = document.getElementById('subscription-category');
        if (catSel.options.length <= 0) { Subscriptions.CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; catSel.appendChild(o); }); }
        catSel.value = entry?.category || 'streaming';
        const stSel = document.getElementById('subscription-status');
        if (stSel.options.length <= 0) { Subscriptions.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        stSel.value = entry?.status || 'active';
        document.getElementById('subscription-price').value = entry?.price || '';
        const freqSel = document.getElementById('subscription-frequency');
        if (freqSel.options.length <= 0) { Subscriptions.FREQUENCIES.forEach(f => { const o = document.createElement('option'); o.value = f.value; o.textContent = f.label; freqSel.appendChild(o); }); }
        freqSel.value = entry?.frequency || 'monthly';
        document.getElementById('subscription-start').value = entry?.startDate || '';
        document.getElementById('subscription-renewal').value = entry?.renewalDate || '';
        document.getElementById('subscription-url').value = entry?.url || '';
        document.getElementById('subscription-payment').value = entry?.paymentMethod || '';
        document.getElementById('subscription-notes').value = entry?.notes || '';
        document.getElementById('modal-subscription').classList.add('active');
    }

    function bindSubscriptionForm() {
        const form = document.getElementById('subscription-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('subscription-id').value;
            const data = {
                name: document.getElementById('subscription-name').value.trim(),
                provider: document.getElementById('subscription-provider').value.trim(),
                category: document.getElementById('subscription-category').value,
                status: document.getElementById('subscription-status').value,
                price: parseFloat(document.getElementById('subscription-price').value) || 0,
                frequency: document.getElementById('subscription-frequency').value,
                startDate: document.getElementById('subscription-start').value,
                renewalDate: document.getElementById('subscription-renewal').value,
                url: document.getElementById('subscription-url').value.trim(),
                paymentMethod: document.getElementById('subscription-payment').value.trim(),
                notes: document.getElementById('subscription-notes').value.trim()
            };
            const result = id ? await Subscriptions.update(id, data) : await Subscriptions.add(data);
            if (result) { toast(id ? 'Abonnement mis à jour' : 'Abonnement ajouté', 'success'); document.getElementById('modal-subscription').classList.remove('active'); await renderSubscriptions(); }
        });
        const addBtn = document.getElementById('btn-add-subscription');
        if (addBtn) addBtn.addEventListener('click', () => openSubscriptionModal());
        ['subscriptions-filter-category', 'subscriptions-filter-status'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderSubscriptions()); });
        const searchEl = document.getElementById('subscriptions-search');
        if (searchEl) searchEl.addEventListener('input', () => renderSubscriptions());
    }

    async function editSubscription(id) { const e = await Subscriptions.getById(id); if (e) openSubscriptionModal(e); }
    async function deleteSubscription(id) {
        confirmCallback = async () => { if (await Subscriptions.remove(id)) { toast('Abonnement supprimé', 'success'); await renderSubscriptions(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cet abonnement ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleSubscriptionFavorite(id) { await Subscriptions.toggleFavorite(id); await renderSubscriptions(); }

    // ===================================================================
    //  GIFTS VIEW
    // ===================================================================
    async function renderGifts() {
        const stats = await Gifts.getStats();
        document.getElementById('gifts-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-gift"></i></div><div class="stat-info"><span class="stat-label">Total</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-hand-holding-heart"></i></div><div class="stat-info"><span class="stat-label">Offerts</span><span class="stat-value">${stats.given}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-box-open"></i></div><div class="stat-info"><span class="stat-label">Reçus</span><span class="stat-value">${stats.received}</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-label">Total dépensé</span><span class="stat-value">${stats.totalSpent} MAD</span></div></div>`;

        const typeSel = document.getElementById('gifts-filter-type');
        if (typeSel && typeSel.options.length <= 1) { Gifts.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        const occSel = document.getElementById('gifts-filter-occasion');
        if (occSel && occSel.options.length <= 1) { Gifts.OCCASIONS.forEach(oc => { const o = document.createElement('option'); o.value = oc.value; o.textContent = `${oc.icon} ${oc.label}`; occSel.appendChild(o); }); }

        let entries = await Gifts.getAll();
        const search = document.getElementById('gifts-search')?.value?.toLowerCase();
        const typeF = document.getElementById('gifts-filter-type')?.value;
        const occF = document.getElementById('gifts-filter-occasion')?.value;
        if (search) entries = entries.filter(e => e.name.toLowerCase().includes(search) || e.recipient.toLowerCase().includes(search));
        if (typeF) entries = entries.filter(e => e.type === typeF);
        if (occF) entries = entries.filter(e => e.occasion === occF);

        const grid = document.getElementById('gifts-grid');
        const empty = document.getElementById('gifts-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const typ = Gifts.getTypeInfo(e.type);
            const occ = Gifts.getOccasionInfo(e.occasion);
            const st = Gifts.getStatusInfo(e.status);
            return `<div class="module-card" style="--mc-accent:${typ.color}">
                <div class="mc-header">
                    <span class="mc-type">${typ.icon} ${typ.label} &nbsp;${occ.icon} ${occ.label}</span>
                    <span class="mc-badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                </div>
                <div class="mc-title">${e.name}</div>
                <div class="mc-meta">
                    ${e.recipient ? `<span><i class="fas fa-user"></i> ${e.recipient}</span>` : ''}
                    ${e.price ? `<span><i class="fas fa-coins"></i> ${e.price} MAD</span>` : ''}
                    ${e.date ? `<span><i class="fas fa-calendar"></i> ${e.date}</span>` : ''}
                    ${e.store ? `<span><i class="fas fa-store"></i> ${e.store}</span>` : ''}
                </div>
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleGiftFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editGift('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteGift('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openGiftModal(entry = null) {
        document.getElementById('modal-gift-title').innerHTML = entry ? '<i class="fas fa-gift"></i> Modifier le cadeau' : '<i class="fas fa-gift"></i> Nouveau cadeau';
        document.getElementById('gift-id').value = entry?.id || '';
        document.getElementById('gift-name').value = entry?.name || '';
        const typeSel = document.getElementById('gift-type');
        if (typeSel.options.length <= 0) { Gifts.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        typeSel.value = entry?.type || 'given';
        document.getElementById('gift-recipient').value = entry?.recipient || '';
        const occSel = document.getElementById('gift-occasion');
        if (occSel.options.length <= 0) { Gifts.OCCASIONS.forEach(oc => { const o = document.createElement('option'); o.value = oc.value; o.textContent = `${oc.icon} ${oc.label}`; occSel.appendChild(o); }); }
        occSel.value = entry?.occasion || 'birthday';
        const stSel = document.getElementById('gift-status');
        if (stSel.options.length <= 0) { Gifts.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        stSel.value = entry?.status || 'planned';
        document.getElementById('gift-price').value = entry?.price || '';
        document.getElementById('gift-date').value = entry?.date || '';
        document.getElementById('gift-store').value = entry?.store || '';
        document.getElementById('gift-url').value = entry?.url || '';
        document.getElementById('gift-notes').value = entry?.notes || '';
        document.getElementById('modal-gift').classList.add('active');
    }

    function bindGiftForm() {
        const form = document.getElementById('gift-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('gift-id').value;
            const data = {
                name: document.getElementById('gift-name').value.trim(),
                type: document.getElementById('gift-type').value,
                recipient: document.getElementById('gift-recipient').value.trim(),
                occasion: document.getElementById('gift-occasion').value,
                status: document.getElementById('gift-status').value,
                price: parseFloat(document.getElementById('gift-price').value) || 0,
                date: document.getElementById('gift-date').value,
                store: document.getElementById('gift-store').value.trim(),
                url: document.getElementById('gift-url').value.trim(),
                notes: document.getElementById('gift-notes').value.trim()
            };
            const result = id ? await Gifts.update(id, data) : await Gifts.add(data);
            if (result) { toast(id ? 'Cadeau mis à jour' : 'Cadeau ajouté', 'success'); document.getElementById('modal-gift').classList.remove('active'); await renderGifts(); }
        });
        const addBtn = document.getElementById('btn-add-gift');
        if (addBtn) addBtn.addEventListener('click', () => openGiftModal());
        ['gifts-filter-type', 'gifts-filter-occasion'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderGifts()); });
        const searchEl = document.getElementById('gifts-search');
        if (searchEl) searchEl.addEventListener('input', () => renderGifts());
    }

    async function editGift(id) { const e = await Gifts.getById(id); if (e) openGiftModal(e); }
    async function deleteGift(id) {
        confirmCallback = async () => { if (await Gifts.remove(id)) { toast('Cadeau supprimé', 'success'); await renderGifts(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce cadeau ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleGiftFavorite(id) { await Gifts.toggleFavorite(id); await renderGifts(); }

    // ===================================================================
    //  WINE VIEW
    // ===================================================================
    async function renderWine() {
        const stats = await Wine.getStats();
        document.getElementById('wine-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-wine-bottle"></i></div><div class="stat-info"><span class="stat-label">Références</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-wine-glass-alt"></i></div><div class="stat-info"><span class="stat-label">Bouteilles</span><span class="stat-value">${stats.bottles}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-label">Valeur cave</span><span class="stat-value">${stats.totalValue} MAD</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-th-large"></i></div><div class="stat-info"><span class="stat-label">Types</span><span class="stat-value">${stats.types}</span></div></div>`;

        const typeSel = document.getElementById('wine-filter-type');
        if (typeSel && typeSel.options.length <= 1) { Wine.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        const regSel = document.getElementById('wine-filter-region');
        if (regSel && regSel.options.length <= 1) { Wine.REGIONS.forEach(r => { const o = document.createElement('option'); o.value = r.value; o.textContent = `${r.icon} ${r.label}`; regSel.appendChild(o); }); }

        let entries = await Wine.getAll();
        const search = document.getElementById('wine-search')?.value?.toLowerCase();
        const typeF = document.getElementById('wine-filter-type')?.value;
        const regF = document.getElementById('wine-filter-region')?.value;
        if (search) entries = entries.filter(e => e.name.toLowerCase().includes(search) || e.producer.toLowerCase().includes(search));
        if (typeF) entries = entries.filter(e => e.type === typeF);
        if (regF) entries = entries.filter(e => e.region === regF);

        const grid = document.getElementById('wine-grid');
        const empty = document.getElementById('wine-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const typ = Wine.getTypeInfo(e.type);
            const reg = Wine.getRegionInfo(e.region);
            const stars = '★'.repeat(Math.floor(e.rating)) + (e.rating % 1 >= 0.5 ? '½' : '');
            return `<div class="module-card" style="--mc-accent:${typ.color}">
                <div class="mc-header">
                    <span class="mc-type">${typ.icon} ${typ.label} &nbsp;${reg.icon} ${reg.label}</span>
                    <span style="color:var(--primary); font-size:.85rem">${stars || '☆'}</span>
                </div>
                <div class="mc-title">${e.name}${e.vintage ? ` (${e.vintage})` : ''}</div>
                <div class="mc-meta">
                    ${e.producer ? `<span><i class="fas fa-industry"></i> ${e.producer}</span>` : ''}
                    <span><i class="fas fa-boxes"></i> ${e.quantity} bout.</span>
                    <span><i class="fas fa-coins"></i> ${e.price} MAD</span>
                </div>
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleWineFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.drinkWine('${e.id}')" title="Ouvrir une bouteille"><i class="fas fa-wine-glass-alt"></i></button>
                    <button class="btn" onclick="App.editWine('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteWine('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openWineModal(entry = null) {
        document.getElementById('modal-wine-title').innerHTML = entry ? '<i class="fas fa-wine-bottle"></i> Modifier le vin' : '<i class="fas fa-wine-bottle"></i> Nouveau vin';
        document.getElementById('wine-id').value = entry?.id || '';
        document.getElementById('wine-name').value = entry?.name || '';
        const typeSel = document.getElementById('wine-type');
        if (typeSel.options.length <= 0) { Wine.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        typeSel.value = entry?.type || 'red';
        const regSel = document.getElementById('wine-region');
        if (regSel.options.length <= 0) { Wine.REGIONS.forEach(r => { const o = document.createElement('option'); o.value = r.value; o.textContent = `${r.icon} ${r.label}`; regSel.appendChild(o); }); }
        regSel.value = entry?.region || 'bordeaux';
        document.getElementById('wine-appellation').value = entry?.appellation || '';
        document.getElementById('wine-vintage').value = entry?.vintage || '';
        document.getElementById('wine-producer').value = entry?.producer || '';
        document.getElementById('wine-grape').value = entry?.grape || '';
        document.getElementById('wine-price').value = entry?.price || '';
        document.getElementById('wine-quantity').value = entry?.quantity || 1;
        document.getElementById('wine-rating').value = entry?.rating || '';
        document.getElementById('wine-drink-before').value = entry?.drinkBefore || '';
        document.getElementById('wine-location').value = entry?.location || '';
        document.getElementById('wine-notes').value = entry?.notes || '';
        document.getElementById('modal-wine').classList.add('active');
    }

    function bindWineForm() {
        const form = document.getElementById('wine-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('wine-id').value;
            const data = {
                name: document.getElementById('wine-name').value.trim(),
                type: document.getElementById('wine-type').value,
                region: document.getElementById('wine-region').value,
                appellation: document.getElementById('wine-appellation').value.trim(),
                vintage: parseInt(document.getElementById('wine-vintage').value) || null,
                producer: document.getElementById('wine-producer').value.trim(),
                grape: document.getElementById('wine-grape').value.trim(),
                price: parseFloat(document.getElementById('wine-price').value) || 0,
                quantity: parseInt(document.getElementById('wine-quantity').value) || 1,
                rating: parseFloat(document.getElementById('wine-rating').value) || 0,
                drinkBefore: document.getElementById('wine-drink-before').value,
                location: document.getElementById('wine-location').value.trim(),
                notes: document.getElementById('wine-notes').value.trim()
            };
            const result = id ? await Wine.update(id, data) : await Wine.add(data);
            if (result) { toast(id ? 'Vin mis à jour' : 'Vin ajouté', 'success'); document.getElementById('modal-wine').classList.remove('active'); await renderWine(); }
        });
        const addBtn = document.getElementById('btn-add-wine');
        if (addBtn) addBtn.addEventListener('click', () => openWineModal());
        ['wine-filter-type', 'wine-filter-region'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderWine()); });
        const searchEl = document.getElementById('wine-search');
        if (searchEl) searchEl.addEventListener('input', () => renderWine());
    }

    async function editWine(id) { const e = await Wine.getById(id); if (e) openWineModal(e); }
    async function deleteWine(id) {
        confirmCallback = async () => { if (await Wine.remove(id)) { toast('Vin supprimé', 'success'); await renderWine(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce vin ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleWineFavorite(id) { await Wine.toggleFavorite(id); await renderWine(); }
    async function drinkWine(id) { const r = await Wine.drinkBottle(id); if (r) { toast('Bouteille ouverte ! 🍷', 'success'); await renderWine(); } else { toast('Plus de bouteilles !', 'warning'); } }

    // ===================================================================
    //  PODCASTS VIEW
    // ===================================================================
    async function renderPodcasts() {
        const stats = await Podcasts.getStats();
        document.getElementById('podcasts-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-podcast"></i></div><div class="stat-info"><span class="stat-label">Total</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-headphones"></i></div><div class="stat-info"><span class="stat-label">En écoute</span><span class="stat-value">${stats.listening}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-label">Terminés</span><span class="stat-value">${stats.finished}</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-star"></i></div><div class="stat-info"><span class="stat-label">Note moy.</span><span class="stat-value">${stats.avgRating}/5</span></div></div>`;

        const catSel = document.getElementById('podcasts-filter-category');
        if (catSel && catSel.options.length <= 1) { Podcasts.CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; catSel.appendChild(o); }); }
        const stSel = document.getElementById('podcasts-filter-status');
        if (stSel && stSel.options.length <= 1) { Podcasts.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }

        let entries = await Podcasts.getAll();
        const search = document.getElementById('podcasts-search')?.value?.toLowerCase();
        const catF = document.getElementById('podcasts-filter-category')?.value;
        const stF = document.getElementById('podcasts-filter-status')?.value;
        if (search) entries = entries.filter(e => e.title.toLowerCase().includes(search) || e.host.toLowerCase().includes(search));
        if (catF) entries = entries.filter(e => e.category === catF);
        if (stF) entries = entries.filter(e => e.status === stF);

        const grid = document.getElementById('podcasts-grid');
        const empty = document.getElementById('podcasts-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const cat = Podcasts.getCategoryInfo(e.category);
            const st = Podcasts.getStatusInfo(e.status);
            const progress = e.episodesTotal > 0 ? Math.round((e.episodesListened / e.episodesTotal) * 100) : 0;
            return `<div class="module-card" style="--mc-accent:${cat.color}">
                <div class="mc-header">
                    <span class="mc-type">${cat.icon} ${cat.label}</span>
                    <span class="mc-badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                </div>
                <div class="mc-title">${e.title}</div>
                ${e.host ? `<div class="mc-subtitle">${e.host}</div>` : ''}
                <div class="mc-meta">
                    ${e.platform ? `<span><i class="fas fa-headphones"></i> ${e.platform}</span>` : ''}
                    <span><i class="fas fa-list-ol"></i> ${e.episodesListened}/${e.episodesTotal} épisodes</span>
                    ${e.rating ? `<span><i class="fas fa-star" style="color:var(--primary)"></i> ${e.rating}/5</span>` : ''}
                </div>
                ${e.episodesTotal > 0 ? `<div class="mc-progress"><div class="mc-progress-bar"><div class="mc-progress-fill" style="width:${progress}%"></div></div><div class="mc-progress-label">${progress}%</div></div>` : ''}
                <div class="mc-actions">
                    <button class="btn" onclick="App.togglePodcastFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editPodcast('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deletePodcast('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openPodcastModal(entry = null) {
        document.getElementById('modal-podcast-title').innerHTML = entry ? '<i class="fas fa-podcast"></i> Modifier le podcast' : '<i class="fas fa-podcast"></i> Nouveau podcast';
        document.getElementById('podcast-id').value = entry?.id || '';
        document.getElementById('podcast-title-field').value = entry?.title || '';
        document.getElementById('podcast-host').value = entry?.host || '';
        const catSel = document.getElementById('podcast-category');
        if (catSel.options.length <= 0) { Podcasts.CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; catSel.appendChild(o); }); }
        catSel.value = entry?.category || 'tech';
        const stSel = document.getElementById('podcast-status');
        if (stSel.options.length <= 0) { Podcasts.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        stSel.value = entry?.status || 'listening';
        document.getElementById('podcast-platform').value = entry?.platform || '';
        document.getElementById('podcast-rating').value = entry?.rating || '';
        document.getElementById('podcast-episodes-total').value = entry?.episodesTotal || 0;
        document.getElementById('podcast-episodes-listened').value = entry?.episodesListened || 0;
        document.getElementById('podcast-url').value = entry?.url || '';
        document.getElementById('podcast-frequency').value = entry?.frequency || '';
        document.getElementById('podcast-notes').value = entry?.notes || '';
        document.getElementById('modal-podcast').classList.add('active');
    }

    function bindPodcastForm() {
        const form = document.getElementById('podcast-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('podcast-id').value;
            const data = {
                title: document.getElementById('podcast-title-field').value.trim(),
                host: document.getElementById('podcast-host').value.trim(),
                category: document.getElementById('podcast-category').value,
                status: document.getElementById('podcast-status').value,
                platform: document.getElementById('podcast-platform').value.trim(),
                rating: parseFloat(document.getElementById('podcast-rating').value) || 0,
                episodesTotal: parseInt(document.getElementById('podcast-episodes-total').value) || 0,
                episodesListened: parseInt(document.getElementById('podcast-episodes-listened').value) || 0,
                url: document.getElementById('podcast-url').value.trim(),
                frequency: document.getElementById('podcast-frequency').value.trim(),
                notes: document.getElementById('podcast-notes').value.trim()
            };
            const result = id ? await Podcasts.update(id, data) : await Podcasts.add(data);
            if (result) { toast(id ? 'Podcast mis à jour' : 'Podcast ajouté', 'success'); document.getElementById('modal-podcast').classList.remove('active'); await renderPodcasts(); }
        });
        const addBtn = document.getElementById('btn-add-podcast');
        if (addBtn) addBtn.addEventListener('click', () => openPodcastModal());
        ['podcasts-filter-category', 'podcasts-filter-status'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderPodcasts()); });
        const searchEl = document.getElementById('podcasts-search');
        if (searchEl) searchEl.addEventListener('input', () => renderPodcasts());
    }

    async function editPodcast(id) { const e = await Podcasts.getById(id); if (e) openPodcastModal(e); }
    async function deletePodcast(id) {
        confirmCallback = async () => { if (await Podcasts.remove(id)) { toast('Podcast supprimé', 'success'); await renderPodcasts(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce podcast ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function togglePodcastFavorite(id) { await Podcasts.toggleFavorite(id); await renderPodcasts(); }

    // ===================================================================
    //  CLEANING VIEW
    // ===================================================================
    async function renderCleaning() {
        const stats = await Cleaning.getStats();
        document.getElementById('cleaning-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-broom"></i></div><div class="stat-info"><span class="stat-label">Total</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><span class="stat-label">En retard</span><span class="stat-value">${stats.overdue}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-label">Fait cette sem.</span><span class="stat-value">${stats.doneThisWeek}</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-door-open"></i></div><div class="stat-info"><span class="stat-label">Pièces</span><span class="stat-value">${stats.rooms}</span></div></div>`;

        const roomSel = document.getElementById('cleaning-filter-room');
        if (roomSel && roomSel.options.length <= 1) { Cleaning.ROOMS.forEach(r => { const o = document.createElement('option'); o.value = r.value; o.textContent = `${r.icon} ${r.label}`; roomSel.appendChild(o); }); }
        const freqSel = document.getElementById('cleaning-filter-frequency');
        if (freqSel && freqSel.options.length <= 1) { Cleaning.FREQUENCIES.forEach(f => { const o = document.createElement('option'); o.value = f.value; o.textContent = `${f.icon} ${f.label}`; freqSel.appendChild(o); }); }

        let entries = await Cleaning.getAll();
        const search = document.getElementById('cleaning-search')?.value?.toLowerCase();
        const roomF = document.getElementById('cleaning-filter-room')?.value;
        const freqF = document.getElementById('cleaning-filter-frequency')?.value;
        if (search) entries = entries.filter(e => e.task.toLowerCase().includes(search));
        if (roomF) entries = entries.filter(e => e.room === roomF);
        if (freqF) entries = entries.filter(e => e.frequency === freqF);

        const grid = document.getElementById('cleaning-grid');
        const empty = document.getElementById('cleaning-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const room = Cleaning.getRoomInfo(e.room);
            const freq = Cleaning.getFrequencyInfo(e.frequency);
            const overdue = Cleaning.isOverdue(e);
            return `<div class="module-card" style="--mc-accent:${overdue ? '#EF4444' : room.color}">
                <div class="mc-header">
                    <span class="mc-type">${room.icon} ${room.label}</span>
                    <span class="mc-badge" style="background:${overdue ? '#EF444420' : '#22C55E20'}; color:${overdue ? '#EF4444' : '#22C55E'}">${overdue ? '⚠️ En retard' : '✅ À jour'}</span>
                </div>
                <div class="mc-title">${e.task}</div>
                <div class="mc-meta">
                    <span>${freq.icon} ${freq.label}</span>
                    ${e.assignee ? `<span><i class="fas fa-user"></i> ${e.assignee}</span>` : ''}
                    ${e.duration ? `<span><i class="fas fa-clock"></i> ${e.duration} min</span>` : ''}
                    ${e.lastDone ? `<span><i class="fas fa-calendar-check"></i> ${e.lastDone}</span>` : ''}
                </div>
                <div class="mc-actions">
                    <button class="btn btn-primary" onclick="App.markCleaningDone('${e.id}')" title="Marquer fait"><i class="fas fa-check"></i></button>
                    <button class="btn" onclick="App.toggleCleaningFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editCleaning('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteCleaning('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openCleaningModal(entry = null) {
        document.getElementById('modal-cleaning-title').innerHTML = entry ? '<i class="fas fa-broom"></i> Modifier la tâche' : '<i class="fas fa-broom"></i> Nouvelle tâche ménagère';
        document.getElementById('cleaning-id').value = entry?.id || '';
        document.getElementById('cleaning-task').value = entry?.task || '';
        const roomSel = document.getElementById('cleaning-room');
        if (roomSel.options.length <= 0) { Cleaning.ROOMS.forEach(r => { const o = document.createElement('option'); o.value = r.value; o.textContent = `${r.icon} ${r.label}`; roomSel.appendChild(o); }); }
        roomSel.value = entry?.room || 'kitchen';
        const freqSel = document.getElementById('cleaning-frequency');
        if (freqSel.options.length <= 0) { Cleaning.FREQUENCIES.forEach(f => { const o = document.createElement('option'); o.value = f.value; o.textContent = `${f.icon} ${f.label}`; freqSel.appendChild(o); }); }
        freqSel.value = entry?.frequency || 'weekly';
        document.getElementById('cleaning-difficulty').value = entry?.difficulty || 3;
        document.getElementById('cleaning-last-done').value = entry?.lastDone || '';
        document.getElementById('cleaning-next-due').value = entry?.nextDue || '';
        document.getElementById('cleaning-assignee').value = entry?.assignee || '';
        document.getElementById('cleaning-duration').value = entry?.duration || 30;
        document.getElementById('cleaning-supplies').value = entry?.supplies || '';
        document.getElementById('cleaning-notes').value = entry?.notes || '';
        document.getElementById('modal-cleaning').classList.add('active');
    }

    function bindCleaningForm() {
        const form = document.getElementById('cleaning-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('cleaning-id').value;
            const data = {
                task: document.getElementById('cleaning-task').value.trim(),
                room: document.getElementById('cleaning-room').value,
                frequency: document.getElementById('cleaning-frequency').value,
                difficulty: parseInt(document.getElementById('cleaning-difficulty').value) || 3,
                lastDone: document.getElementById('cleaning-last-done').value,
                nextDue: document.getElementById('cleaning-next-due').value,
                assignee: document.getElementById('cleaning-assignee').value.trim(),
                duration: parseInt(document.getElementById('cleaning-duration').value) || 30,
                supplies: document.getElementById('cleaning-supplies').value.trim(),
                notes: document.getElementById('cleaning-notes').value.trim()
            };
            const result = id ? await Cleaning.update(id, data) : await Cleaning.add(data);
            if (result) { toast(id ? 'Tâche mise à jour' : 'Tâche ajoutée', 'success'); document.getElementById('modal-cleaning').classList.remove('active'); await renderCleaning(); }
        });
        const addBtn = document.getElementById('btn-add-cleaning');
        if (addBtn) addBtn.addEventListener('click', () => openCleaningModal());
        ['cleaning-filter-room', 'cleaning-filter-frequency'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderCleaning()); });
        const searchEl = document.getElementById('cleaning-search');
        if (searchEl) searchEl.addEventListener('input', () => renderCleaning());
    }

    async function editCleaning(id) { const e = await Cleaning.getById(id); if (e) openCleaningModal(e); }
    async function deleteCleaning(id) {
        confirmCallback = async () => { if (await Cleaning.remove(id)) { toast('Tâche supprimée', 'success'); await renderCleaning(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette tâche ménagère ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleCleaningFavorite(id) { await Cleaning.toggleFavorite(id); await renderCleaning(); }
    async function markCleaningDone(id) { const r = await Cleaning.markDone(id); if (r) { toast('Tâche marquée comme faite ! 🧹', 'success'); await renderCleaning(); } }

    // ===================================================================
    //  ALBUMS VIEW
    // ===================================================================
    async function renderAlbums() {
        const stats = await Albums.getStats();
        document.getElementById('albums-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-images"></i></div><div class="stat-info"><span class="stat-label">Albums</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-image"></i></div><div class="stat-info"><span class="stat-label">Photos</span><span class="stat-value">${stats.totalPhotos}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-th-large"></i></div><div class="stat-info"><span class="stat-label">Catégories</span><span class="stat-value">${stats.categories}</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-share-alt"></i></div><div class="stat-info"><span class="stat-label">Partagés</span><span class="stat-value">${stats.shared}</span></div></div>`;

        const catSel = document.getElementById('albums-filter-category');
        if (catSel && catSel.options.length <= 1) { Albums.CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; catSel.appendChild(o); }); }

        let entries = await Albums.getAll();
        const search = document.getElementById('albums-search')?.value?.toLowerCase();
        const catF = document.getElementById('albums-filter-category')?.value;
        if (search) entries = entries.filter(e => e.title.toLowerCase().includes(search) || e.location.toLowerCase().includes(search));
        if (catF) entries = entries.filter(e => e.category === catF);

        const grid = document.getElementById('albums-grid');
        const empty = document.getElementById('albums-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const cat = Albums.getCategoryInfo(e.category);
            return `<div class="module-card" style="--mc-accent:${cat.color}">
                <div class="mc-header">
                    <span class="mc-type">${cat.icon} ${cat.label}</span>
                    <div class="mc-badges">
                        ${e.shared ? '<span class="mc-badge" style="background:#0EA5E920; color:#0EA5E9">📤 Partagé</span>' : ''}
                    </div>
                </div>
                <div class="mc-title">${e.title}</div>
                <div class="mc-meta">
                    <span><i class="fas fa-image"></i> ${e.photoCount} photos</span>
                    ${e.date ? `<span><i class="fas fa-calendar"></i> ${e.date}</span>` : ''}
                    ${e.location ? `<span><i class="fas fa-map-marker-alt"></i> ${e.location}</span>` : ''}
                    ${e.platform ? `<span><i class="fas fa-cloud"></i> ${e.platform}</span>` : ''}
                </div>
                ${e.description ? `<div class="mc-desc">${e.description}</div>` : ''}
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleAlbumFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editAlbum('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteAlbum('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openAlbumModal(entry = null) {
        document.getElementById('modal-album-title').innerHTML = entry ? '<i class="fas fa-images"></i> Modifier l\'album' : '<i class="fas fa-images"></i> Nouvel album';
        document.getElementById('album-id').value = entry?.id || '';
        document.getElementById('album-title-field').value = entry?.title || '';
        const catSel = document.getElementById('album-category');
        if (catSel.options.length <= 0) { Albums.CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; catSel.appendChild(o); }); }
        catSel.value = entry?.category || 'travel';
        document.getElementById('album-date').value = entry?.date || '';
        document.getElementById('album-location').value = entry?.location || '';
        document.getElementById('album-photo-count').value = entry?.photoCount || 0;
        document.getElementById('album-platform').value = entry?.platform || '';
        document.getElementById('album-cover').value = entry?.coverUrl || '';
        document.getElementById('album-shared').value = entry?.shared ? 'true' : 'false';
        document.getElementById('album-description').value = entry?.description || '';
        document.getElementById('album-notes').value = entry?.notes || '';
        document.getElementById('modal-album').classList.add('active');
    }

    function bindAlbumForm() {
        const form = document.getElementById('album-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('album-id').value;
            const data = {
                title: document.getElementById('album-title-field').value.trim(),
                category: document.getElementById('album-category').value,
                date: document.getElementById('album-date').value,
                location: document.getElementById('album-location').value.trim(),
                photoCount: parseInt(document.getElementById('album-photo-count').value) || 0,
                platform: document.getElementById('album-platform').value.trim(),
                coverUrl: document.getElementById('album-cover').value.trim(),
                shared: document.getElementById('album-shared').value === 'true',
                description: document.getElementById('album-description').value.trim(),
                notes: document.getElementById('album-notes').value.trim()
            };
            const result = id ? await Albums.update(id, data) : await Albums.add(data);
            if (result) { toast(id ? 'Album mis à jour' : 'Album ajouté', 'success'); document.getElementById('modal-album').classList.remove('active'); await renderAlbums(); }
        });
        const addBtn = document.getElementById('btn-add-album');
        if (addBtn) addBtn.addEventListener('click', () => openAlbumModal());
        const catEl = document.getElementById('albums-filter-category');
        if (catEl) catEl.addEventListener('change', () => renderAlbums());
        const searchEl = document.getElementById('albums-search');
        if (searchEl) searchEl.addEventListener('input', () => renderAlbums());
    }

    async function editAlbum(id) { const e = await Albums.getById(id); if (e) openAlbumModal(e); }
    async function deleteAlbum(id) {
        confirmCallback = async () => { if (await Albums.remove(id)) { toast('Album supprimé', 'success'); await renderAlbums(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cet album ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleAlbumFavorite(id) { await Albums.toggleFavorite(id); await renderAlbums(); }

    // ===================================================================
    //  MEDICATIONS VIEW
    // ===================================================================
    async function renderMedications() {
        const stats = await Medications.getStats();
        document.getElementById('medications-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-pills"></i></div><div class="stat-info"><span class="stat-label">Total</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-label">En cours</span><span class="stat-value">${stats.active}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-sync"></i></div><div class="stat-info"><span class="stat-label">À renouveler</span><span class="stat-value">${stats.needRefill}</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-label">Coût total</span><span class="stat-value">${stats.totalCost} MAD</span></div></div>`;

        const stSel = document.getElementById('medications-filter-status');
        if (stSel && stSel.options.length <= 1) { Medications.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        const typeSel = document.getElementById('medications-filter-type');
        if (typeSel && typeSel.options.length <= 1) { Medications.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }

        let entries = await Medications.getAll();
        const search = document.getElementById('medications-search')?.value?.toLowerCase();
        const stF = document.getElementById('medications-filter-status')?.value;
        const typeF = document.getElementById('medications-filter-type')?.value;
        if (search) entries = entries.filter(e => e.name.toLowerCase().includes(search) || e.purpose.toLowerCase().includes(search));
        if (stF) entries = entries.filter(e => e.status === stF);
        if (typeF) entries = entries.filter(e => e.type === typeF);

        const grid = document.getElementById('medications-grid');
        const empty = document.getElementById('medications-empty');

        // Refill alert banner
        let alertCont = document.getElementById('medications-alert');
        if (!alertCont) { alertCont = document.createElement('div'); alertCont.id = 'medications-alert'; grid.parentElement.insertBefore(alertCont, grid); }
        alertCont.innerHTML = stats.needRefill > 0
            ? `<div class="module-alert warning"><i class="fas fa-exclamation-triangle"></i><span><strong>${stats.needRefill} médicament(s)</strong> à renouveler bientôt — pensez à contacter votre médecin.</span></div>`
            : '';

        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const typ = Medications.getTypeInfo(e.type);
            const st = Medications.getStatusInfo(e.status);
            const refill = Medications.needsRefill(e);
            return `<div class="module-card" style="--mc-accent:${st.color}">
                <div class="mc-header">
                    <span class="mc-type">${typ.icon} ${typ.label}</span>
                    <div class="mc-badges">
                        <span class="mc-badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                        ${refill ? '<span class="mc-badge" style="background:#F59E0B20; color:#F59E0B">🔄 Renouveler</span>' : ''}
                    </div>
                </div>
                <div class="mc-title">${e.name}${e.dosage ? ` — ${e.dosage}` : ''}</div>
                <div class="mc-meta">
                    <span><i class="fas fa-redo"></i> ${Medications.getFrequencyInfo(e.frequency).label}</span>
                    ${e.prescriber ? `<span><i class="fas fa-user-md"></i> ${e.prescriber}</span>` : ''}
                    ${e.price ? `<span><i class="fas fa-coins"></i> ${e.price} MAD</span>` : ''}
                    ${e.quantity ? `<span><i class="fas fa-boxes"></i> Stock: ${e.quantity}</span>` : ''}
                </div>
                ${e.purpose ? `<div class="mc-desc">${e.purpose}</div>` : ''}
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleMedicationFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editMedication('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteMedication('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openMedicationModal(entry = null) {
        document.getElementById('modal-medication-title').innerHTML = entry ? '<i class="fas fa-pills"></i> Modifier le médicament' : '<i class="fas fa-pills"></i> Nouveau médicament';
        document.getElementById('medication-id').value = entry?.id || '';
        document.getElementById('medication-name').value = entry?.name || '';
        const typeSel = document.getElementById('medication-type');
        if (typeSel.options.length <= 0) { Medications.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        typeSel.value = entry?.type || 'pill';
        document.getElementById('medication-dosage').value = entry?.dosage || '';
        const freqSel = document.getElementById('medication-frequency');
        if (freqSel.options.length <= 0) { Medications.FREQUENCIES.forEach(f => { const o = document.createElement('option'); o.value = f.value; o.textContent = `${f.icon} ${f.label}`; freqSel.appendChild(o); }); }
        freqSel.value = entry?.frequency || 'once';
        const stSel = document.getElementById('medication-status');
        if (stSel.options.length <= 0) { Medications.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        stSel.value = entry?.status || 'active';
        document.getElementById('medication-price').value = entry?.price || '';
        document.getElementById('medication-start').value = entry?.startDate || '';
        document.getElementById('medication-end').value = entry?.endDate || '';
        document.getElementById('medication-prescriber').value = entry?.prescriber || '';
        document.getElementById('medication-pharmacy').value = entry?.pharmacy || '';
        document.getElementById('medication-refill').value = entry?.refillDate || '';
        document.getElementById('medication-quantity').value = entry?.quantity || 0;
        document.getElementById('medication-purpose').value = entry?.purpose || '';
        document.getElementById('medication-notes').value = entry?.notes || '';
        document.getElementById('modal-medication').classList.add('active');
    }

    function bindMedicationForm() {
        const form = document.getElementById('medication-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('medication-id').value;
            const data = {
                name: document.getElementById('medication-name').value.trim(),
                type: document.getElementById('medication-type').value,
                dosage: document.getElementById('medication-dosage').value.trim(),
                frequency: document.getElementById('medication-frequency').value,
                status: document.getElementById('medication-status').value,
                price: parseFloat(document.getElementById('medication-price').value) || 0,
                startDate: document.getElementById('medication-start').value,
                endDate: document.getElementById('medication-end').value,
                prescriber: document.getElementById('medication-prescriber').value.trim(),
                pharmacy: document.getElementById('medication-pharmacy').value.trim(),
                refillDate: document.getElementById('medication-refill').value,
                quantity: parseInt(document.getElementById('medication-quantity').value) || 0,
                purpose: document.getElementById('medication-purpose').value.trim(),
                notes: document.getElementById('medication-notes').value.trim()
            };
            const result = id ? await Medications.update(id, data) : await Medications.add(data);
            if (result) { toast(id ? 'Médicament mis à jour' : 'Médicament ajouté', 'success'); document.getElementById('modal-medication').classList.remove('active'); await renderMedications(); }
        });
        const addBtn = document.getElementById('btn-add-medication');
        if (addBtn) addBtn.addEventListener('click', () => openMedicationModal());
        ['medications-filter-status', 'medications-filter-type'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderMedications()); });
        const searchEl = document.getElementById('medications-search');
        if (searchEl) searchEl.addEventListener('input', () => renderMedications());
    }

    async function editMedication(id) { const e = await Medications.getById(id); if (e) openMedicationModal(e); }
    async function deleteMedication(id) {
        confirmCallback = async () => { if (await Medications.remove(id)) { toast('Médicament supprimé', 'success'); await renderMedications(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce médicament ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleMedicationFavorite(id) { await Medications.toggleFavorite(id); await renderMedications(); }

    // ===================================================================
    //  WISHLIST VIEW
    // ===================================================================
    async function renderWishlist() {
        const stats = await Wishlist.getStats();
        document.getElementById('wishlist-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-star"></i></div><div class="stat-info"><span class="stat-label">Total</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-heart"></i></div><div class="stat-info"><span class="stat-label">Souhaités</span><span class="stat-value">${stats.wanted}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-label">Valeur totale</span><span class="stat-value">${stats.totalValue} MAD</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-piggy-bank"></i></div><div class="stat-info"><span class="stat-label">Économisé</span><span class="stat-value">${stats.totalSaved} MAD</span></div></div>`;

        const catSel = document.getElementById('wishlist-filter-category');
        if (catSel && catSel.options.length <= 1) { Wishlist.CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; catSel.appendChild(o); }); }
        const stSel = document.getElementById('wishlist-filter-status');
        if (stSel && stSel.options.length <= 1) { Wishlist.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        const prSel = document.getElementById('wishlist-filter-priority');
        if (prSel && prSel.options.length <= 1) { Wishlist.PRIORITIES.forEach(p => { const o = document.createElement('option'); o.value = p.value; o.textContent = `${p.icon} ${p.label}`; prSel.appendChild(o); }); }

        let entries = await Wishlist.getAll();
        const search = document.getElementById('wishlist-search')?.value?.toLowerCase();
        const catF = document.getElementById('wishlist-filter-category')?.value;
        const stF = document.getElementById('wishlist-filter-status')?.value;
        const prF = document.getElementById('wishlist-filter-priority')?.value;
        if (search) entries = entries.filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search));
        if (catF) entries = entries.filter(e => e.category === catF);
        if (stF) entries = entries.filter(e => e.status === stF);
        if (prF) entries = entries.filter(e => e.priority === prF);

        const grid = document.getElementById('wishlist-grid');
        const empty = document.getElementById('wishlist-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const cat = Wishlist.getCategoryInfo(e.category);
            const pri = Wishlist.getPriorityInfo(e.priority);
            const st = Wishlist.getStatusInfo(e.status);
            const progress = Wishlist.getProgress(e);
            return `<div class="module-card" style="--mc-accent:${cat.color}">
                <div class="mc-header">
                    <span class="mc-type">${cat.icon} ${cat.label}</span>
                    <div class="mc-badges">
                        <span class="mc-badge" style="background:${pri.color}20; color:${pri.color}">${pri.icon} ${pri.label}</span>
                        <span class="mc-badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                    </div>
                </div>
                <div class="mc-title">${e.name}</div>
                <div class="mc-meta">
                    ${e.price ? `<span><i class="fas fa-coins"></i> ${e.price} MAD</span>` : ''}
                    ${e.store ? `<span><i class="fas fa-store"></i> ${e.store}</span>` : ''}
                    ${e.url ? `<a href="${e.url}" target="_blank" style="color:var(--primary)"><i class="fas fa-link"></i> Lien</a>` : ''}
                </div>
                ${e.price > 0 ? `<div class="mc-progress"><div class="mc-progress-bar"><div class="mc-progress-fill" style="width:${progress}%; background:${progress >= 100 ? '#22C55E' : cat.color}"></div></div><div class="mc-progress-label">${e.savedAmount} / ${e.price} MAD (${progress}%)</div></div>` : ''}
                ${e.description ? `<div class="mc-desc">${e.description}</div>` : ''}
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleWishlistFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editWishlist('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteWishlist('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openWishlistModal(entry = null) {
        document.getElementById('modal-wishlist-title').innerHTML = entry ? '<i class="fas fa-star"></i> Modifier le souhait' : '<i class="fas fa-star"></i> Nouveau souhait';
        document.getElementById('wishlist-id').value = entry?.id || '';
        document.getElementById('wishlist-name').value = entry?.name || '';
        const catSel = document.getElementById('wishlist-category');
        if (catSel.options.length <= 0) { Wishlist.CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; catSel.appendChild(o); }); }
        catSel.value = entry?.category || 'tech';
        const prSel = document.getElementById('wishlist-priority');
        if (prSel.options.length <= 0) { Wishlist.PRIORITIES.forEach(p => { const o = document.createElement('option'); o.value = p.value; o.textContent = `${p.icon} ${p.label}`; prSel.appendChild(o); }); }
        prSel.value = entry?.priority || 'medium';
        const stSel = document.getElementById('wishlist-status');
        if (stSel.options.length <= 0) { Wishlist.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        stSel.value = entry?.status || 'wanted';
        document.getElementById('wishlist-price').value = entry?.price || '';
        document.getElementById('wishlist-saved').value = entry?.savedAmount || 0;
        document.getElementById('wishlist-store').value = entry?.store || '';
        document.getElementById('wishlist-url').value = entry?.url || '';
        document.getElementById('wishlist-description').value = entry?.description || '';
        document.getElementById('wishlist-notes').value = entry?.notes || '';
        document.getElementById('modal-wishlist').classList.add('active');
    }

    function bindWishlistForm() {
        const form = document.getElementById('wishlist-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('wishlist-id').value;
            const data = {
                name: document.getElementById('wishlist-name').value.trim(),
                category: document.getElementById('wishlist-category').value,
                priority: document.getElementById('wishlist-priority').value,
                status: document.getElementById('wishlist-status').value,
                price: parseFloat(document.getElementById('wishlist-price').value) || 0,
                savedAmount: parseFloat(document.getElementById('wishlist-saved').value) || 0,
                store: document.getElementById('wishlist-store').value.trim(),
                url: document.getElementById('wishlist-url').value.trim(),
                description: document.getElementById('wishlist-description').value.trim(),
                notes: document.getElementById('wishlist-notes').value.trim()
            };
            const result = id ? await Wishlist.update(id, data) : await Wishlist.add(data);
            if (result) { toast(id ? 'Souhait mis à jour' : 'Souhait ajouté', 'success'); document.getElementById('modal-wishlist').classList.remove('active'); await renderWishlist(); }
        });
        const addBtn = document.getElementById('btn-add-wishlist');
        if (addBtn) addBtn.addEventListener('click', () => openWishlistModal());
        ['wishlist-filter-category', 'wishlist-filter-status', 'wishlist-filter-priority'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderWishlist()); });
        const searchEl = document.getElementById('wishlist-search');
        if (searchEl) searchEl.addEventListener('input', () => renderWishlist());
    }

    async function editWishlist(id) { const e = await Wishlist.getById(id); if (e) openWishlistModal(e); }
    async function deleteWishlist(id) {
        confirmCallback = async () => { if (await Wishlist.remove(id)) { toast('Souhait supprimé', 'success'); await renderWishlist(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce souhait ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleWishlistFavorite(id) { await Wishlist.toggleFavorite(id); await renderWishlist(); }

    // ===================================================================
    //  DOCUMENTS VIEW
    // ===================================================================
    async function renderDocuments() {
        const stats = await Documents.getStats();
        document.getElementById('documents-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-file-alt"></i></div><div class="stat-info"><span class="stat-label">Total</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><span class="stat-label">Valides</span><span class="stat-value">${stats.valid}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><span class="stat-label">Expire bientôt</span><span class="stat-value">${stats.expiringSoon}</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-times-circle"></i></div><div class="stat-info"><span class="stat-label">Expirés</span><span class="stat-value">${stats.expired}</span></div></div>`;

        const stSel = document.getElementById('documents-filter-status');
        if (stSel && stSel.options.length <= 1) { Documents.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        const typeSel = document.getElementById('documents-filter-type');
        if (typeSel && typeSel.options.length <= 1) { Documents.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }

        let entries = await Documents.getAll();
        const search = document.getElementById('documents-search')?.value?.toLowerCase();
        const stF = document.getElementById('documents-filter-status')?.value;
        const typeF = document.getElementById('documents-filter-type')?.value;
        if (search) entries = entries.filter(e => e.title.toLowerCase().includes(search) || e.issuer.toLowerCase().includes(search));
        if (stF) entries = entries.filter(e => e.status === stF);
        if (typeF) entries = entries.filter(e => e.type === typeF);

        const grid = document.getElementById('documents-grid');
        const empty = document.getElementById('documents-empty');

        // Expiry alert banner
        let docAlertCont = document.getElementById('documents-alert');
        if (!docAlertCont) { docAlertCont = document.createElement('div'); docAlertCont.id = 'documents-alert'; grid.parentElement.insertBefore(docAlertCont, grid); }
        const docAlertTotal = (stats.expiringSoon || 0) + (stats.expired || 0);
        docAlertCont.innerHTML = stats.expired > 0
            ? `<div class="module-alert danger"><i class="fas fa-times-circle"></i><span><strong>${stats.expired} document(s) expiré(s)</strong>${stats.expiringSoon > 0 ? ` et ${stats.expiringSoon} expirant bientôt` : ''} — renouvelez-les rapidement.</span></div>`
            : stats.expiringSoon > 0
                ? `<div class="module-alert warning"><i class="fas fa-exclamation-triangle"></i><span><strong>${stats.expiringSoon} document(s)</strong> expire(nt) bientôt — pensez à les renouveler.</span></div>`
                : '';

        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const typ = Documents.getTypeInfo(e.type);
            const st = Documents.getStatusInfo(e.status);
            const expiring = Documents.isExpiringSoon(e);
            const expired = Documents.isExpired(e);
            const accentColor = expired ? '#EF4444' : expiring ? '#F59E0B' : typ.color;
            return `<div class="module-card" style="--mc-accent:${accentColor}">
                <div class="mc-header">
                    <span class="mc-type">${typ.icon} ${typ.label}</span>
                    <div class="mc-badges">
                        <span class="mc-badge" style="background:${st.color}20; color:${st.color}">${st.icon} ${st.label}</span>
                        ${expired ? '<span class="mc-badge" style="background:#EF444420; color:#EF4444">❌ Expiré</span>' : expiring ? '<span class="mc-badge" style="background:#F59E0B20; color:#F59E0B">⚠️ Expire bientôt</span>' : ''}
                    </div>
                </div>
                <div class="mc-title">${e.title}</div>
                <div class="mc-meta">
                    ${e.issuer ? `<span><i class="fas fa-building"></i> ${e.issuer}</span>` : ''}
                    ${e.number ? `<span><i class="fas fa-hashtag"></i> ${e.number}</span>` : ''}
                    ${e.issueDate ? `<span><i class="fas fa-calendar-plus"></i> Émis: ${e.issueDate}</span>` : ''}
                    ${e.expiryDate ? `<span><i class="fas fa-calendar-times"></i> Expire: ${e.expiryDate}</span>` : ''}
                    ${e.holder ? `<span><i class="fas fa-user"></i> ${e.holder}</span>` : ''}
                </div>
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleDocumentFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editDocument('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteDocument('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openDocumentModal(entry = null) {
        document.getElementById('modal-document-title').innerHTML = entry ? '<i class="fas fa-file-alt"></i> Modifier le document' : '<i class="fas fa-file-alt"></i> Nouveau document';
        document.getElementById('document-id').value = entry?.id || '';
        document.getElementById('document-title-field').value = entry?.title || '';
        const typeSel = document.getElementById('document-type');
        if (typeSel.options.length <= 0) { Documents.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        typeSel.value = entry?.type || 'autre';
        document.getElementById('document-issuer').value = entry?.issuer || '';
        document.getElementById('document-number').value = entry?.number || '';
        document.getElementById('document-issue-date').value = entry?.issueDate || '';
        document.getElementById('document-expiry-date').value = entry?.expiryDate || '';
        const stSel = document.getElementById('document-status');
        if (stSel.options.length <= 0) { Documents.STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s.value; o.textContent = `${s.icon} ${s.label}`; stSel.appendChild(o); }); }
        stSel.value = entry?.status || 'valid';
        document.getElementById('document-holder').value = entry?.holder || '';
        document.getElementById('document-location').value = entry?.location || '';
        document.getElementById('document-reminder').value = entry?.reminderDays || 30;
        document.getElementById('document-description').value = entry?.description || '';
        document.getElementById('document-notes').value = entry?.notes || '';
        document.getElementById('modal-document').classList.add('active');
    }

    function bindDocumentForm() {
        const form = document.getElementById('document-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('document-id').value;
            const data = {
                title: document.getElementById('document-title-field').value.trim(),
                type: document.getElementById('document-type').value,
                issuer: document.getElementById('document-issuer').value.trim(),
                number: document.getElementById('document-number').value.trim(),
                issueDate: document.getElementById('document-issue-date').value,
                expiryDate: document.getElementById('document-expiry-date').value,
                status: document.getElementById('document-status').value,
                holder: document.getElementById('document-holder').value.trim(),
                location: document.getElementById('document-location').value.trim(),
                reminderDays: parseInt(document.getElementById('document-reminder').value) || 30,
                description: document.getElementById('document-description').value.trim(),
                notes: document.getElementById('document-notes').value.trim()
            };
            const result = id ? await Documents.update(id, data) : await Documents.add(data);
            if (result) { toast(id ? 'Document mis à jour' : 'Document ajouté', 'success'); document.getElementById('modal-document').classList.remove('active'); await renderDocuments(); }
        });
        const addBtn = document.getElementById('btn-add-document');
        if (addBtn) addBtn.addEventListener('click', () => openDocumentModal());
        ['documents-filter-status', 'documents-filter-type'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderDocuments()); });
        const searchEl = document.getElementById('documents-search');
        if (searchEl) searchEl.addEventListener('input', () => renderDocuments());
    }

    async function editDocument(id) { const e = await Documents.getById(id); if (e) openDocumentModal(e); }
    async function deleteDocument(id) {
        confirmCallback = async () => { if (await Documents.remove(id)) { toast('Document supprimé', 'success'); await renderDocuments(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce document ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleDocumentFavorite(id) { await Documents.toggleFavorite(id); await renderDocuments(); }

    // ===================================================================
    //  COLLECTIONS VIEW
    // ===================================================================
    async function renderCollections() {
        const stats = await Collections.getStats();
        document.getElementById('collections-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-palette"></i></div><div class="stat-info"><span class="stat-label">Collections</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-cubes"></i></div><div class="stat-info"><span class="stat-label">Objets</span><span class="stat-value">${stats.totalItems}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-label">Valeur totale</span><span class="stat-value">${stats.totalValue} MAD</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-gem"></i></div><div class="stat-info"><span class="stat-label">Rares</span><span class="stat-value">${stats.rare}</span></div></div>`;

        const typeSel = document.getElementById('collections-filter-type');
        if (typeSel && typeSel.options.length <= 1) { Collections.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        const rarSel = document.getElementById('collections-filter-rarity');
        if (rarSel && rarSel.options.length <= 1) { Collections.RARITIES.forEach(r => { const o = document.createElement('option'); o.value = r.value; o.textContent = `${r.icon} ${r.label}`; rarSel.appendChild(o); }); }

        let entries = await Collections.getAll();
        const search = document.getElementById('collections-search')?.value?.toLowerCase();
        const typeF = document.getElementById('collections-filter-type')?.value;
        const rarF = document.getElementById('collections-filter-rarity')?.value;
        if (search) entries = entries.filter(e => e.name.toLowerCase().includes(search) || e.item.toLowerCase().includes(search));
        if (typeF) entries = entries.filter(e => e.type === typeF);
        if (rarF) entries = entries.filter(e => e.rarity === rarF);

        const grid = document.getElementById('collections-grid');
        const empty = document.getElementById('collections-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const typ = Collections.getTypeInfo(e.type);
            const cond = Collections.getConditionInfo(e.condition);
            const rar = Collections.getRarityInfo(e.rarity);
            const appreciation = Collections.getAppreciation(e);
            return `<div class="module-card" style="--mc-accent:${typ.color}">
                <div class="mc-header">
                    <span class="mc-type">${typ.icon} ${typ.label}</span>
                    <div class="mc-badges">
                        <span class="mc-badge" style="background:${rar.color}20; color:${rar.color}">${rar.icon} ${rar.label}</span>
                        <span class="mc-badge" style="background:${cond.color}20; color:${cond.color}">${cond.icon} ${cond.label}</span>
                    </div>
                </div>
                <div class="mc-title">${e.name}</div>
                ${e.item ? `<div class="mc-subtitle">${e.item}</div>` : ''}
                <div class="mc-meta">
                    <span><i class="fas fa-coins"></i> ${e.value} MAD</span>
                    <span><i class="fas fa-boxes"></i> x${e.quantity}</span>
                    ${e.year ? `<span><i class="fas fa-calendar"></i> ${e.year}</span>` : ''}
                    ${e.series ? `<span><i class="fas fa-layer-group"></i> ${e.series}</span>` : ''}
                    ${appreciation !== 0 ? `<span style="color:${appreciation > 0 ? '#22C55E' : '#EF4444'}">${appreciation > 0 ? '📈' : '📉'} ${appreciation > 0 ? '+' : ''}${appreciation}%</span>` : ''}
                </div>
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleCollectionFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.editCollection('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteCollection('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openCollectionModal(entry = null) {
        document.getElementById('modal-collection-title').innerHTML = entry ? '<i class="fas fa-palette"></i> Modifier la collection' : '<i class="fas fa-palette"></i> Nouvel objet de collection';
        document.getElementById('collection-id').value = entry?.id || '';
        document.getElementById('collection-name').value = entry?.name || '';
        const typeSel = document.getElementById('collection-type');
        if (typeSel.options.length <= 0) { Collections.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        typeSel.value = entry?.type || 'autre';
        document.getElementById('collection-item').value = entry?.item || '';
        const condSel = document.getElementById('collection-condition');
        if (condSel.options.length <= 0) { Collections.CONDITIONS.forEach(c => { const o = document.createElement('option'); o.value = c.value; o.textContent = `${c.icon} ${c.label}`; condSel.appendChild(o); }); }
        condSel.value = entry?.condition || 'good';
        const rarSel = document.getElementById('collection-rarity');
        if (rarSel.options.length <= 0) { Collections.RARITIES.forEach(r => { const o = document.createElement('option'); o.value = r.value; o.textContent = `${r.icon} ${r.label}`; rarSel.appendChild(o); }); }
        rarSel.value = entry?.rarity || 'common';
        document.getElementById('collection-year').value = entry?.year || '';
        document.getElementById('collection-value').value = entry?.value || '';
        document.getElementById('collection-purchase-price').value = entry?.purchasePrice || '';
        document.getElementById('collection-quantity').value = entry?.quantity || 1;
        document.getElementById('collection-source').value = entry?.source || '';
        document.getElementById('collection-series').value = entry?.series || '';
        document.getElementById('collection-location').value = entry?.location || '';
        document.getElementById('collection-notes').value = entry?.notes || '';
        document.getElementById('modal-collection').classList.add('active');
    }

    function bindCollectionForm() {
        const form = document.getElementById('collection-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('collection-id').value;
            const data = {
                name: document.getElementById('collection-name').value.trim(),
                type: document.getElementById('collection-type').value,
                item: document.getElementById('collection-item').value.trim(),
                condition: document.getElementById('collection-condition').value,
                rarity: document.getElementById('collection-rarity').value,
                year: document.getElementById('collection-year').value,
                value: parseFloat(document.getElementById('collection-value').value) || 0,
                purchasePrice: parseFloat(document.getElementById('collection-purchase-price').value) || 0,
                quantity: parseInt(document.getElementById('collection-quantity').value) || 1,
                source: document.getElementById('collection-source').value.trim(),
                series: document.getElementById('collection-series').value.trim(),
                location: document.getElementById('collection-location').value.trim(),
                notes: document.getElementById('collection-notes').value.trim()
            };
            const result = id ? await Collections.update(id, data) : await Collections.add(data);
            if (result) { toast(id ? 'Collection mise à jour' : 'Objet ajouté à la collection', 'success'); document.getElementById('modal-collection').classList.remove('active'); await renderCollections(); }
        });
        const addBtn = document.getElementById('btn-add-collection');
        if (addBtn) addBtn.addEventListener('click', () => openCollectionModal());
        ['collections-filter-type', 'collections-filter-rarity'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderCollections()); });
        const searchEl = document.getElementById('collections-search');
        if (searchEl) searchEl.addEventListener('input', () => renderCollections());
    }

    async function editCollection(id) { const e = await Collections.getById(id); if (e) openCollectionModal(e); }
    async function deleteCollection(id) {
        confirmCallback = async () => { if (await Collections.remove(id)) { toast('Objet supprimé', 'success'); await renderCollections(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cet objet de collection ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleCollectionFavorite(id) { await Collections.toggleFavorite(id); await renderCollections(); }

    // ===================================================================
    //  TRADES (JOURNAL DE TRADING)
    // ===================================================================
    async function renderTrades() {
        const stats = await Trades.getStats();
        const pnlClass = parseFloat(stats.totalPnL) >= 0 ? 'stat-income' : 'stat-expense';
        document.getElementById('trades-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-chart-line"></i></div><div class="stat-info"><span class="stat-label">Total Trades</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card ${pnlClass}"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-coins"></i></div><div class="stat-info"><span class="stat-label">P&L Total</span><span class="stat-value">${stats.totalPnL} MAD</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-percentage"></i></div><div class="stat-info"><span class="stat-label">Win Rate</span><span class="stat-value">${stats.winRate}%</span></div></div>
            <div class="stat-card stat-budget"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-balance-scale"></i></div><div class="stat-info"><span class="stat-label">Profit Factor</span><span class="stat-value">${stats.profitFactor}</span></div></div>`;

        // Populate filters
        const instSel = document.getElementById('trades-filter-instrument');
        if (instSel && instSel.options.length <= 1) { Trades.INSTRUMENTS.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; instSel.appendChild(o); }); }
        const statSel = document.getElementById('trades-filter-status');
        if (statSel && statSel.options.length <= 1) { Trades.STATUSES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; statSel.appendChild(o); }); }
        const dirSel = document.getElementById('trades-filter-direction');
        if (dirSel && dirSel.options.length <= 1) { Trades.DIRECTIONS.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; dirSel.appendChild(o); }); }

        let entries = await Trades.getAll();
        const search = document.getElementById('trades-search')?.value?.toLowerCase();
        const instF = document.getElementById('trades-filter-instrument')?.value;
        const statF = document.getElementById('trades-filter-status')?.value;
        const dirF = document.getElementById('trades-filter-direction')?.value;
        if (search) entries = entries.filter(e => e.symbol.toLowerCase().includes(search) || e.notes.toLowerCase().includes(search) || e.platform.toLowerCase().includes(search));
        if (instF) entries = entries.filter(e => e.instrument === instF);
        if (statF) entries = entries.filter(e => e.status === statF);
        if (dirF) entries = entries.filter(e => e.direction === dirF);

        const grid = document.getElementById('trades-grid');
        const empty = document.getElementById('trades-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const inst = Trades.getInstrumentInfo(e.instrument);
            const dir = Trades.getDirectionInfo(e.direction);
            const stat = Trades.getStatusInfo(e.status);
            const strat = Trades.getStrategyInfo(e.strategy);
            const pnlColor = e.pnl > 0 ? '#10B981' : e.pnl < 0 ? '#EF4444' : '#6B7280';
            const pnlSign = e.pnl > 0 ? '+' : '';
            return `<div class="module-card" style="--mc-accent:${inst.color}">
                <div class="mc-header">
                    <span class="mc-type">${inst.icon} ${inst.label} &nbsp;${dir.icon} ${dir.label}</span>
                    <span style="background:${stat.color};color:#fff;padding:2px 8px;border-radius:6px;font-size:.75rem">${stat.icon} ${stat.label}</span>
                </div>
                <div class="mc-title">${e.symbol}</div>
                <div class="mc-meta">
                    <span><i class="fas fa-sign-in-alt"></i> ${e.entryPrice}</span>
                    ${e.exitPrice ? `<span><i class="fas fa-sign-out-alt"></i> ${e.exitPrice}</span>` : ''}
                    <span><i class="fas fa-sort-amount-up"></i> ${e.quantity} lots</span>
                    ${e.leverage > 1 ? `<span><i class="fas fa-bolt"></i> x${e.leverage}</span>` : ''}
                </div>
                <div class="mc-meta">
                    <span style="color:${pnlColor};font-weight:700"><i class="fas fa-dollar-sign"></i> ${pnlSign}${e.pnl} MAD (${pnlSign}${e.pnlPercent}%)</span>
                    ${e.strategy !== 'autre' ? `<span><i class="fas fa-chess"></i> ${strat.label}</span>` : ''}
                    ${e.entryDate ? `<span><i class="fas fa-calendar"></i> ${e.entryDate}</span>` : ''}
                </div>
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleTradeFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    ${e.status === 'open' ? `<button class="btn" onclick="App.closeTradePrompt('${e.id}')" title="Clôturer"><i class="fas fa-lock"></i></button>` : ''}
                    <button class="btn" onclick="App.editTrade('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteTrade('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openTradeModal(entry = null) {
        document.getElementById('modal-trade-title').innerHTML = entry ? '<i class="fas fa-chart-line"></i> Modifier le trade' : '<i class="fas fa-chart-line"></i> Nouveau trade';
        document.getElementById('trade-id').value = entry?.id || '';
        document.getElementById('trade-symbol').value = entry?.symbol || '';
        const instSel = document.getElementById('trade-instrument');
        if (instSel.options.length <= 0) { Trades.INSTRUMENTS.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; instSel.appendChild(o); }); }
        instSel.value = entry?.instrument || 'forex';
        document.getElementById('trade-direction').value = entry?.direction || 'long';
        document.getElementById('trade-status').value = entry?.status || 'open';
        document.getElementById('trade-entry-price').value = entry?.entryPrice || '';
        document.getElementById('trade-exit-price').value = entry?.exitPrice || '';
        document.getElementById('trade-quantity').value = entry?.quantity || '';
        document.getElementById('trade-leverage').value = entry?.leverage || 1;
        document.getElementById('trade-stop-loss').value = entry?.stopLoss || '';
        document.getElementById('trade-take-profit').value = entry?.takeProfit || '';
        document.getElementById('trade-fees').value = entry?.fees || '';
        const stratSel = document.getElementById('trade-strategy');
        if (stratSel.options.length <= 0) { Trades.STRATEGIES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = t.label; stratSel.appendChild(o); }); }
        stratSel.value = entry?.strategy || 'autre';
        document.getElementById('trade-entry-date').value = entry?.entryDate || new Date().toISOString().split('T')[0];
        document.getElementById('trade-exit-date').value = entry?.exitDate || '';
        document.getElementById('trade-platform').value = entry?.platform || '';
        document.getElementById('trade-tags').value = entry?.tags || '';
        document.getElementById('trade-emotion-entry').value = entry?.emotionEntry || '';
        document.getElementById('trade-emotion-exit').value = entry?.emotionExit || '';
        document.getElementById('trade-notes').value = entry?.notes || '';
        document.getElementById('modal-trade').classList.add('active');
    }

    function bindTradeForm() {
        const form = document.getElementById('trade-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('trade-id').value;
            const data = {
                symbol: document.getElementById('trade-symbol').value.trim().toUpperCase(),
                instrument: document.getElementById('trade-instrument').value,
                direction: document.getElementById('trade-direction').value,
                status: document.getElementById('trade-status').value,
                entryPrice: parseFloat(document.getElementById('trade-entry-price').value) || 0,
                exitPrice: parseFloat(document.getElementById('trade-exit-price').value) || 0,
                quantity: parseFloat(document.getElementById('trade-quantity').value) || 0,
                leverage: parseFloat(document.getElementById('trade-leverage').value) || 1,
                stopLoss: parseFloat(document.getElementById('trade-stop-loss').value) || 0,
                takeProfit: parseFloat(document.getElementById('trade-take-profit').value) || 0,
                fees: parseFloat(document.getElementById('trade-fees').value) || 0,
                strategy: document.getElementById('trade-strategy').value,
                entryDate: document.getElementById('trade-entry-date').value,
                exitDate: document.getElementById('trade-exit-date').value,
                platform: document.getElementById('trade-platform').value.trim(),
                tags: document.getElementById('trade-tags').value.trim(),
                emotionEntry: document.getElementById('trade-emotion-entry').value.trim(),
                emotionExit: document.getElementById('trade-emotion-exit').value.trim(),
                notes: document.getElementById('trade-notes').value.trim()
            };
            const result = id ? await Trades.update(id, data) : await Trades.add(data);
            if (result) { toast(id ? 'Trade mis à jour' : 'Trade ajouté', 'success'); document.getElementById('modal-trade').classList.remove('active'); await renderTrades(); }
        });
        const addBtn = document.getElementById('btn-add-trade');
        if (addBtn) addBtn.addEventListener('click', () => openTradeModal());
        ['trades-filter-instrument', 'trades-filter-status', 'trades-filter-direction'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderTrades()); });
        const searchEl = document.getElementById('trades-search');
        if (searchEl) searchEl.addEventListener('input', () => renderTrades());
    }

    async function editTrade(id) { const e = await Trades.getById(id); if (e) openTradeModal(e); }
    async function deleteTrade(id) {
        confirmCallback = async () => { if (await Trades.remove(id)) { toast('Trade supprimé', 'success'); await renderTrades(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer ce trade ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleTradeFavorite(id) { await Trades.toggleFavorite(id); await renderTrades(); }
    async function closeTradePrompt(id) {
        const price = prompt('Prix de sortie :');
        if (price !== null && !isNaN(parseFloat(price))) {
            const r = await Trades.closeTrade(id, price);
            if (r) { toast('Trade clôturé', 'success'); await renderTrades(); }
        }
    }

    // ===================================================================
    //  PORTFOLIO (PORTEFEUILLE)
    // ===================================================================
    async function renderPortfolio() {
        const stats = await Portfolio.getStats();
        const pnlClass = parseFloat(stats.totalPnL) >= 0 ? 'stat-income' : 'stat-expense';
        document.getElementById('portfolio-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-briefcase"></i></div><div class="stat-info"><span class="stat-label">Positions</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-wallet"></i></div><div class="stat-info"><span class="stat-label">Valeur totale</span><span class="stat-value">${stats.totalValue} MAD</span></div></div>
            <div class="stat-card ${pnlClass}"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-chart-line"></i></div><div class="stat-info"><span class="stat-label">P&L</span><span class="stat-value">${stats.totalPnL} MAD (${stats.totalPnLPercent}%)</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div><div class="stat-info"><span class="stat-label">Dividendes est.</span><span class="stat-value">${stats.totalDividends} MAD</span></div></div>`;

        const typeSel = document.getElementById('portfolio-filter-type');
        if (typeSel && typeSel.options.length <= 1) { Portfolio.ASSET_TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        const secSel = document.getElementById('portfolio-filter-sector');
        if (secSel && secSel.options.length <= 1) { Portfolio.SECTORS.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = t.label; secSel.appendChild(o); }); }

        let entries = await Portfolio.getAll();
        const search = document.getElementById('portfolio-search')?.value?.toLowerCase();
        const typeF = document.getElementById('portfolio-filter-type')?.value;
        const secF = document.getElementById('portfolio-filter-sector')?.value;
        if (search) entries = entries.filter(e => e.symbol.toLowerCase().includes(search) || e.name.toLowerCase().includes(search));
        if (typeF) entries = entries.filter(e => e.assetType === typeF);
        if (secF) entries = entries.filter(e => e.sector === secF);

        const grid = document.getElementById('portfolio-grid');
        const empty = document.getElementById('portfolio-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const typ = Portfolio.getAssetTypeInfo(e.assetType);
            const calc = Portfolio.calcPosition(e);
            const pnlColor = calc.pnl > 0 ? '#10B981' : calc.pnl < 0 ? '#EF4444' : '#6B7280';
            const pnlSign = calc.pnl > 0 ? '+' : '';
            const pctDistance = e.targetPrice > 0 ? ((e.targetPrice - e.currentPrice) / e.currentPrice * 100).toFixed(1) : null;
            return `<div class="module-card" style="--mc-accent:${typ.color}">
                <div class="mc-header">
                    <span class="mc-type">${typ.icon} ${typ.label}</span>
                    <span style="color:${pnlColor};font-weight:700;font-size:.9rem">${pnlSign}${calc.pnlPercent}%</span>
                </div>
                <div class="mc-title">${e.symbol}${e.name ? ` — ${e.name}` : ''}</div>
                <div class="mc-meta">
                    <span><i class="fas fa-sort-amount-up"></i> ${e.quantity} unités</span>
                    <span><i class="fas fa-calculator"></i> Moy: ${e.avgPrice} ${e.currency}</span>
                    <span><i class="fas fa-coins"></i> Act: ${e.currentPrice} ${e.currency}</span>
                </div>
                <div class="mc-meta">
                    <span style="color:${pnlColor};font-weight:700"><i class="fas fa-dollar-sign"></i> ${pnlSign}${calc.pnl} ${e.currency}</span>
                    <span><i class="fas fa-wallet"></i> Val: ${calc.currentValue} ${e.currency}</span>
                    ${pctDistance !== null ? `<span><i class="fas fa-trophy"></i> Cible: ${pctDistance}%</span>` : ''}
                </div>
                <div class="mc-actions">
                    <button class="btn" onclick="App.togglePositionFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.updatePositionPrice('${e.id}')" title="Mettre à jour le prix"><i class="fas fa-sync-alt"></i></button>
                    <button class="btn" onclick="App.editPosition('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deletePosition('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openPositionModal(entry = null) {
        document.getElementById('modal-position-title').innerHTML = entry ? '<i class="fas fa-briefcase"></i> Modifier la position' : '<i class="fas fa-briefcase"></i> Nouvelle position';
        document.getElementById('position-id').value = entry?.id || '';
        document.getElementById('position-symbol').value = entry?.symbol || '';
        document.getElementById('position-name').value = entry?.name || '';
        const typeSel = document.getElementById('position-asset-type');
        if (typeSel.options.length <= 0) { Portfolio.ASSET_TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        typeSel.value = entry?.assetType || 'stock';
        const secSel = document.getElementById('position-sector');
        if (secSel.options.length <= 0) { Portfolio.SECTORS.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = t.label; secSel.appendChild(o); }); }
        secSel.value = entry?.sector || 'autre';
        document.getElementById('position-quantity').value = entry?.quantity || '';
        document.getElementById('position-avg-price').value = entry?.avgPrice || '';
        document.getElementById('position-current-price').value = entry?.currentPrice || '';
        document.getElementById('position-currency').value = entry?.currency || 'MAD';
        document.getElementById('position-dividend-yield').value = entry?.dividendYield || '';
        document.getElementById('position-platform').value = entry?.platform || '';
        document.getElementById('position-target-price').value = entry?.targetPrice || '';
        document.getElementById('position-stop-loss').value = entry?.stopLoss || '';
        document.getElementById('position-purchase-date').value = entry?.purchaseDate || '';
        document.getElementById('position-notes').value = entry?.notes || '';
        document.getElementById('modal-position').classList.add('active');
    }

    function bindPositionForm() {
        const form = document.getElementById('position-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('position-id').value;
            const data = {
                symbol: document.getElementById('position-symbol').value.trim().toUpperCase(),
                name: document.getElementById('position-name').value.trim(),
                assetType: document.getElementById('position-asset-type').value,
                sector: document.getElementById('position-sector').value,
                quantity: parseFloat(document.getElementById('position-quantity').value) || 0,
                avgPrice: parseFloat(document.getElementById('position-avg-price').value) || 0,
                currentPrice: parseFloat(document.getElementById('position-current-price').value) || 0,
                currency: document.getElementById('position-currency').value.trim() || 'MAD',
                dividendYield: parseFloat(document.getElementById('position-dividend-yield').value) || 0,
                platform: document.getElementById('position-platform').value.trim(),
                targetPrice: parseFloat(document.getElementById('position-target-price').value) || 0,
                stopLoss: parseFloat(document.getElementById('position-stop-loss').value) || 0,
                purchaseDate: document.getElementById('position-purchase-date').value,
                notes: document.getElementById('position-notes').value.trim()
            };
            const result = id ? await Portfolio.update(id, data) : await Portfolio.add(data);
            if (result) { toast(id ? 'Position mise à jour' : 'Position ajoutée', 'success'); document.getElementById('modal-position').classList.remove('active'); await renderPortfolio(); }
        });
        const addBtn = document.getElementById('btn-add-position');
        if (addBtn) addBtn.addEventListener('click', () => openPositionModal());
        ['portfolio-filter-type', 'portfolio-filter-sector'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderPortfolio()); });
        const searchEl = document.getElementById('portfolio-search');
        if (searchEl) searchEl.addEventListener('input', () => renderPortfolio());
    }

    async function editPosition(id) { const e = await Portfolio.getById(id); if (e) openPositionModal(e); }
    async function deletePosition(id) {
        confirmCallback = async () => { if (await Portfolio.remove(id)) { toast('Position supprimée', 'success'); await renderPortfolio(); } };
        document.getElementById('confirm-message').textContent = 'Supprimer cette position ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function togglePositionFavorite(id) { await Portfolio.toggleFavorite(id); await renderPortfolio(); }
    async function updatePositionPrice(id) {
        const price = prompt('Nouveau prix actuel :');
        if (price !== null && !isNaN(parseFloat(price))) {
            const r = await Portfolio.updatePrice(id, price);
            if (r) { toast('Prix mis à jour', 'success'); await renderPortfolio(); }
        }
    }

    // ===================================================================
    //  TRADING WATCHLIST (SURVEILLANCE)
    // ===================================================================
    async function renderTWatchlist() {
        const stats = await TradingWatchlist.getStats();
        document.getElementById('twatchlist-stats').innerHTML = `
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-binoculars"></i></div><div class="stat-info"><span class="stat-label">Actifs surveillés</span><span class="stat-value">${stats.total}</span></div></div>
            <div class="stat-card stat-income"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-arrow-up"></i></div><div class="stat-info"><span class="stat-label">Signaux achat</span><span class="stat-value">${stats.buySignals}</span></div></div>
            <div class="stat-card stat-expense"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-arrow-down"></i></div><div class="stat-info"><span class="stat-label">Signaux vente</span><span class="stat-value">${stats.sellSignals}</span></div></div>
            <div class="stat-card stat-balance"><div class="stat-card-bg"></div><div class="stat-icon"><i class="fas fa-bell"></i></div><div class="stat-info"><span class="stat-label">Alertes actives</span><span class="stat-value">${stats.alertsActive}</span></div></div>`;

        const typeSel = document.getElementById('twatchlist-filter-type');
        if (typeSel && typeSel.options.length <= 1) { TradingWatchlist.ASSET_TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        const sigSel = document.getElementById('twatchlist-filter-signal');
        if (sigSel && sigSel.options.length <= 1) { TradingWatchlist.SIGNALS.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; sigSel.appendChild(o); }); }

        let entries = await TradingWatchlist.getAll();
        const search = document.getElementById('twatchlist-search')?.value?.toLowerCase();
        const typeF = document.getElementById('twatchlist-filter-type')?.value;
        const sigF = document.getElementById('twatchlist-filter-signal')?.value;
        if (search) entries = entries.filter(e => e.symbol.toLowerCase().includes(search) || e.name.toLowerCase().includes(search));
        if (typeF) entries = entries.filter(e => e.assetType === typeF);
        if (sigF) entries = entries.filter(e => e.signal === sigF);

        const grid = document.getElementById('twatchlist-grid');
        const empty = document.getElementById('twatchlist-empty');
        if (!entries.length) { grid.innerHTML = ''; grid.appendChild(empty); empty.style.display = ''; return; }
        if (empty) empty.style.display = 'none';

        grid.innerHTML = entries.map(e => {
            const typ = TradingWatchlist.getAssetTypeInfo(e.assetType);
            const sig = TradingWatchlist.getSignalInfo(e.signal);
            const tf = TradingWatchlist.getTimeframeInfo(e.timeframe);
            const priorityStars = '★'.repeat(e.priority) + '☆'.repeat(5 - e.priority);
            return `<div class="module-card" style="--mc-accent:${sig.color}">
                <div class="mc-header">
                    <span class="mc-type">${typ.icon} ${typ.label}</span>
                    <span style="background:${sig.color};color:#fff;padding:2px 8px;border-radius:6px;font-size:.75rem">${sig.icon} ${sig.label}</span>
                </div>
                <div class="mc-title">${e.symbol}${e.name ? ` — ${e.name}` : ''}</div>
                <div class="mc-meta">
                    <span><i class="fas fa-coins"></i> ${e.currentPrice}</span>
                    ${e.targetBuy ? `<span style="color:#10B981"><i class="fas fa-arrow-down"></i> Achat: ${e.targetBuy}</span>` : ''}
                    ${e.targetSell ? `<span style="color:#EF4444"><i class="fas fa-arrow-up"></i> Vente: ${e.targetSell}</span>` : ''}
                    <span><i class="fas fa-clock"></i> ${tf.label}</span>
                </div>
                <div class="mc-meta">
                    ${e.support ? `<span><i class="fas fa-level-down-alt"></i> S: ${e.support}</span>` : ''}
                    ${e.resistance ? `<span><i class="fas fa-level-up-alt"></i> R: ${e.resistance}</span>` : ''}
                    <span style="color:var(--primary);font-size:.8rem">${priorityStars}</span>
                    ${e.alertEnabled ? `<span><i class="fas fa-bell" style="color:#F59E0B"></i> ${e.alertPrice}</span>` : ''}
                </div>
                ${e.analysis ? `<div class="mc-meta"><span style="font-style:italic;opacity:.8"><i class="fas fa-microscope"></i> ${e.analysis.substring(0, 80)}${e.analysis.length > 80 ? '...' : ''}</span></div>` : ''}
                <div class="mc-actions">
                    <button class="btn" onclick="App.toggleTWatchlistFavorite('${e.id}')"><i class="fas fa-heart ${e.favorite ? 'text-rose' : ''}"></i></button>
                    <button class="btn" onclick="App.updateTWatchlistPrice('${e.id}')" title="Mettre à jour le prix"><i class="fas fa-sync-alt"></i></button>
                    <button class="btn" onclick="App.editTWatchlist('${e.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn" onclick="App.deleteTWatchlist('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    function openTWatchlistModal(entry = null) {
        document.getElementById('modal-twatchlist-title').innerHTML = entry ? '<i class="fas fa-binoculars"></i> Modifier la surveillance' : '<i class="fas fa-binoculars"></i> Nouvel actif à surveiller';
        document.getElementById('twatchlist-id').value = entry?.id || '';
        document.getElementById('twatchlist-symbol').value = entry?.symbol || '';
        document.getElementById('twatchlist-name').value = entry?.name || '';
        const typeSel = document.getElementById('twatchlist-asset-type');
        if (typeSel.options.length <= 0) { TradingWatchlist.ASSET_TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; typeSel.appendChild(o); }); }
        typeSel.value = entry?.assetType || 'stock';
        const sigSel = document.getElementById('twatchlist-signal');
        if (sigSel.options.length <= 0) { TradingWatchlist.SIGNALS.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = `${t.icon} ${t.label}`; sigSel.appendChild(o); }); }
        sigSel.value = entry?.signal || 'neutral';
        document.getElementById('twatchlist-current-price').value = entry?.currentPrice || '';
        const tfSel = document.getElementById('twatchlist-timeframe');
        if (tfSel.options.length <= 0) { TradingWatchlist.TIMEFRAMES.forEach(t => { const o = document.createElement('option'); o.value = t.value; o.textContent = t.label; tfSel.appendChild(o); }); }
        tfSel.value = entry?.timeframe || 'D1';
        document.getElementById('twatchlist-target-buy').value = entry?.targetBuy || '';
        document.getElementById('twatchlist-target-sell').value = entry?.targetSell || '';
        document.getElementById('twatchlist-support').value = entry?.support || '';
        document.getElementById('twatchlist-resistance').value = entry?.resistance || '';
        document.getElementById('twatchlist-priority').value = entry?.priority || 0;
        document.getElementById('twatchlist-alert-price').value = entry?.alertPrice || '';
        document.getElementById('twatchlist-analysis').value = entry?.analysis || '';
        document.getElementById('twatchlist-notes').value = entry?.notes || '';
        document.getElementById('modal-twatchlist').classList.add('active');
    }

    function bindTWatchlistForm() {
        const form = document.getElementById('twatchlist-form');
        if (form) form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const id = document.getElementById('twatchlist-id').value;
            const data = {
                symbol: document.getElementById('twatchlist-symbol').value.trim().toUpperCase(),
                name: document.getElementById('twatchlist-name').value.trim(),
                assetType: document.getElementById('twatchlist-asset-type').value,
                signal: document.getElementById('twatchlist-signal').value,
                currentPrice: parseFloat(document.getElementById('twatchlist-current-price').value) || 0,
                timeframe: document.getElementById('twatchlist-timeframe').value,
                targetBuy: parseFloat(document.getElementById('twatchlist-target-buy').value) || 0,
                targetSell: parseFloat(document.getElementById('twatchlist-target-sell').value) || 0,
                support: parseFloat(document.getElementById('twatchlist-support').value) || 0,
                resistance: parseFloat(document.getElementById('twatchlist-resistance').value) || 0,
                priority: parseInt(document.getElementById('twatchlist-priority').value) || 0,
                alertPrice: parseFloat(document.getElementById('twatchlist-alert-price').value) || 0,
                alertEnabled: parseFloat(document.getElementById('twatchlist-alert-price').value) > 0,
                analysis: document.getElementById('twatchlist-analysis').value.trim(),
                notes: document.getElementById('twatchlist-notes').value.trim()
            };
            const result = id ? await TradingWatchlist.update(id, data) : await TradingWatchlist.add(data);
            if (result) { toast(id ? 'Surveillance mise à jour' : 'Actif ajouté à la surveillance', 'success'); document.getElementById('modal-twatchlist').classList.remove('active'); await renderTWatchlist(); }
        });
        const addBtn = document.getElementById('btn-add-twatchlist');
        if (addBtn) addBtn.addEventListener('click', () => openTWatchlistModal());
        ['twatchlist-filter-type', 'twatchlist-filter-signal'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => renderTWatchlist()); });
        const searchEl = document.getElementById('twatchlist-search');
        if (searchEl) searchEl.addEventListener('input', () => renderTWatchlist());
    }

    async function editTWatchlist(id) { const e = await TradingWatchlist.getById(id); if (e) openTWatchlistModal(e); }
    async function deleteTWatchlist(id) {
        confirmCallback = async () => { if (await TradingWatchlist.remove(id)) { toast('Actif retiré de la surveillance', 'success'); await renderTWatchlist(); } };
        document.getElementById('confirm-message').textContent = 'Retirer cet actif de la surveillance ?';
        document.getElementById('modal-confirm').classList.add('active');
    }
    async function toggleTWatchlistFavorite(id) { await TradingWatchlist.toggleFavorite(id); await renderTWatchlist(); }
    async function updateTWatchlistPrice(id) {
        const price = prompt('Nouveau prix actuel :');
        if (price !== null && !isNaN(parseFloat(price))) {
            const r = await TradingWatchlist.updatePrice(id, price);
            if (r) { toast('Prix mis à jour', 'success'); await renderTWatchlist(); }
        }
    }

    // ===================================================================
    //  REPORTS VIEW
    // ===================================================================
    async function renderReports() {
        const yearSelect = document.getElementById('report-year');
        const years = await getAvailableYears();
        yearSelect.innerHTML = years.map(y =>
            `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`
        ).join('');

        yearSelect.onchange = () => {
            currentYear = parseInt(yearSelect.value);
            updateMonthLabel();
            renderReports();
        };

        const year = parseInt(yearSelect.value) || currentYear;
        const txs = await Store.Transactions.getByYear(year);

        const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const savings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome * 100) : 0;

        document.getElementById('report-annual-income').textContent = Store.formatMoney(totalIncome);
        document.getElementById('report-annual-expense').textContent = Store.formatMoney(totalExpense);
        document.getElementById('report-annual-savings').textContent = Store.formatMoney(savings);
        document.getElementById('report-annual-savings').className =
            'stat-value ' + (savings >= 0 ? 'amount-positive' : 'amount-negative');
        document.getElementById('report-savings-rate').textContent = `${savingsRate.toFixed(1)} %`;

        await Charts.renderReportAnnual(year);
        await Charts.renderReportCategory(year);

        await renderMonthlyDetailTable(year);
        await renderVarianceTable(year);

        document.getElementById('btn-export-report').onclick = () => exportReport(year);
    }

    async function renderMonthlyDetailTable(year) {
        const tbody = document.getElementById('report-monthly-body');
        const tfoot = document.getElementById('report-monthly-footer');
        let totalInc = 0, totalExp = 0, totalBudget = 0;

        let rows = '';
        for (let m = 0; m < 12; m++) {
            const txs = await Store.Transactions.getByMonth(year, m);
            const budgets = await Store.Budgets.getByMonth(year, m);
            const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const budgetTotal = budgets.reduce((s, b) => s + b.amount, 0);
            const variance = budgetTotal - expense;
            const balance = income - expense;

            totalInc += income;
            totalExp += expense;
            totalBudget += budgetTotal;

            rows += `
                <tr>
                    <td><strong>${Store.getMonthName(m)}</strong></td>
                    <td class="amount-positive">${Store.formatMoney(income)}</td>
                    <td class="amount-negative">${Store.formatMoney(expense)}</td>
                    <td>${budgetTotal > 0 ? Store.formatMoney(budgetTotal) : '—'}</td>
                    <td class="${variance >= 0 ? 'amount-positive' : 'amount-negative'}">
                        ${budgetTotal > 0 ? Store.formatMoney(variance) : '—'}
                    </td>
                    <td class="${balance >= 0 ? 'amount-positive' : 'amount-negative'}" style="font-weight:600">
                        <div style="display:flex;align-items:center;gap:6px">
                            <div class="report-bal-bar" style="--pct:${income > 0 ? Math.min(Math.abs(balance)/income*100,100).toFixed(0) : 0};--clr:${balance >= 0 ? 'var(--primary)' : 'var(--accent-rose)'}"></div>
                            ${Store.formatMoney(balance)}
                        </div>
                    </td>
                </tr>
            `;
        }
        tbody.innerHTML = rows;

        const totalVariance = totalBudget - totalExp;
        tfoot.innerHTML = `
            <tr style="font-weight:700;border-top:2px solid var(--border);">
                <td>TOTAL</td>
                <td class="amount-positive">${Store.formatMoney(totalInc)}</td>
                <td class="amount-negative">${Store.formatMoney(totalExp)}</td>
                <td>${totalBudget > 0 ? Store.formatMoney(totalBudget) : '—'}</td>
                <td class="${totalVariance >= 0 ? 'amount-positive' : 'amount-negative'}">
                    ${totalBudget > 0 ? Store.formatMoney(totalVariance) : '—'}
                </td>
                <td class="${totalInc - totalExp >= 0 ? 'amount-positive' : 'amount-negative'}">
                    ${Store.formatMoney(totalInc - totalExp)}
                </td>
            </tr>
        `;
    }

    async function renderVarianceTable(year) {
        const tbody = document.getElementById('report-variance-body');
        const categories = (await Store.Categories.getAll()).filter(c => c.type === 'expense' || c.type === 'both');
        const allBudgets = await Store.Budgets.getByYear(year);
        const allTxs = (await Store.Transactions.getByYear(year)).filter(t => t.type === 'expense');

        if (allBudgets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Aucun budget défini pour cette année</td></tr>';
            return;
        }

        const catIds = [...new Set(allBudgets.map(b => b.categoryId))];

        tbody.innerHTML = catIds.map(catId => {
            const cat = categories.find(c => c.id === catId);
            const budgetTotal = allBudgets.filter(b => b.categoryId === catId).reduce((s, b) => s + b.amount, 0);
            const spentTotal = allTxs.filter(t => t.categoryId === catId).reduce((s, t) => s + t.amount, 0);
            const variance = budgetTotal - spentTotal;
            const variancePct = budgetTotal > 0 ? (variance / budgetTotal * 100) : 0;
            const status = variance >= 0 ? 'success' : 'danger';

            return `
                <tr>
                    <td><span class="tx-category">
                        <span class="tx-category-dot" style="background:${cat ? cat.color : '#94A3B8'}"></span>
                        ${cat ? cat.name : 'Autre'}
                    </span></td>
                    <td>${Store.formatMoney(budgetTotal)}</td>
                    <td>${Store.formatMoney(spentTotal)}</td>
                    <td class="${variance >= 0 ? 'amount-positive' : 'amount-negative'}">${Store.formatMoney(variance)}</td>
                    <td class="${variance >= 0 ? 'amount-positive' : 'amount-negative'}">${variancePct.toFixed(1)}%</td>
                    <td><span class="badge badge-${status}">
                        ${variance >= 0 ? '✅ Sous budget' : '⚠ Dépassé'}
                    </span></td>
                </tr>
            `;
        }).join('');
    }

    async function exportReport(year) {
        const txs = await Store.Transactions.getByYear(year);
        let text = `RAPPORT ANNUEL — ${year}\n${'='.repeat(50)}\n\n`;

        const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        text += `Revenus totaux :  ${Store.formatMoney(totalIncome)}\n`;
        text += `Dépenses totales : ${Store.formatMoney(totalExpense)}\n`;
        text += `Solde net :        ${Store.formatMoney(totalIncome - totalExpense)}\n`;
        text += `Taux d'épargne :   ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%\n\n`;

        text += `DÉTAIL MENSUEL\n${'-'.repeat(50)}\n`;
        for (let m = 0; m < 12; m++) {
            const mTxs = await Store.Transactions.getByMonth(year, m);
            const inc = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const exp = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            text += `${Store.getMonthName(m).padEnd(12)} | Revenus: ${Store.formatMoney(inc).padStart(12)} | Dépenses: ${Store.formatMoney(exp).padStart(12)} | Solde: ${Store.formatMoney(inc - exp).padStart(12)}\n`;
        }

        downloadFile(text, `rapport_${year}.txt`, 'text/plain');
        toast('Rapport exporté');
    }

    // ===================================================================
    //  AUDIT VIEW
    // ===================================================================
    async function renderAudit() {
        const actionFilter = document.getElementById('audit-filter-action').value;
        const entityFilter = document.getElementById('audit-filter-entity').value;

        const entries = await Store.Audit.getFiltered({ action: actionFilter || undefined, entity: entityFilter || undefined });

        const totalPages = Math.ceil(entries.length / AUDIT_PER_PAGE) || 1;
        if (auditPage > totalPages) auditPage = totalPages;
        const start = (auditPage - 1) * AUDIT_PER_PAGE;
        const paged = entries.slice(start, start + AUDIT_PER_PAGE);

        const timeline = document.getElementById('audit-timeline');

        if (paged.length === 0) {
            timeline.innerHTML = '<p class="empty-state">Aucune entrée dans le journal</p>';
        } else {
            const actionIcons = { create: 'fa-plus', update: 'fa-pen', delete: 'fa-trash' };
            const actionLabels = { create: 'Création', update: 'Modification', delete: 'Suppression' };

            timeline.innerHTML = paged.map(e => `
                <div class="audit-entry">
                    <div class="audit-icon ${e.action}">
                        <i class="fas ${actionIcons[e.action] || 'fa-info'}"></i>
                    </div>
                    <div class="audit-content">
                        <div class="audit-action">
                            <span class="badge badge-${e.action === 'create' ? 'success' : e.action === 'delete' ? 'danger' : 'info'}">
                                ${actionLabels[e.action] || e.action}
                            </span>
                            <span style="margin-left:6px;text-transform:capitalize">${e.entity || ''}</span>
                        </div>
                        <div class="audit-details">${escapeHtml(e.details || '')}</div>
                        <div class="audit-time"><i class="fas fa-clock"></i> ${formatDateTime(e.timestamp)}</div>
                    </div>
                </div>
            `).join('');
        }

        renderPagination('audit-pagination', auditPage, totalPages, (page) => {
            auditPage = page;
            renderAudit();
        });

        document.getElementById('audit-filter-action').onchange = () => { auditPage = 1; renderAudit(); };
        document.getElementById('audit-filter-entity').onchange = () => { auditPage = 1; renderAudit(); };
    }

    // ===== EXPORT / IMPORT =====
    function bindExportImport() {
        document.getElementById('btn-export-all').addEventListener('click', async () => {
            const data = await Store.exportAll();
            downloadFile(data, `lifeos_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
            toast('Données exportées avec succès');
        });

        document.getElementById('btn-import-all').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                showConfirm('Importer ce fichier ? Les données seront ajoutées à votre compte.', async () => {
                    if (await Store.importAll(ev.target.result)) {
                        toast('Données importées avec succès');
                        await renderView(currentView);
                    } else {
                        toast('Erreur lors de l\'import', 'error');
                    }
                });
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        document.getElementById('btn-clear-audit').addEventListener('click', () => {
            showConfirm('Vider le journal d\'audit ?', async () => {
                await Store.Audit.clear();
                toast('Journal vidé');
                await renderAudit();
            });
        });

        document.getElementById('btn-export-audit').addEventListener('click', async () => {
            const entries = await Store.Audit.getAll();
            let csv = 'Date,Action,Entité,Détails\n';
            entries.forEach(e => {
                csv += `"${formatDateTime(e.timestamp)}","${e.action}","${e.entity}","${e.details}"\n`;
            });
            downloadFile(csv, `audit_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
            toast('Journal exporté');
        });
    }

    // ===================================================================
    //  HEALTH SCORE
    // ===================================================================
    function renderHealthScore(income, expense, totalBudget, budgets, transactions, categories) {
        let score = 50; // Base score
        const factors = [];

        // Factor 1: Positive balance (+20)
        if (income > 0 && income >= expense) {
            score += 20;
            factors.push({ icon: 'fa-check-circle', text: 'Solde positif ce mois' });
        } else if (income > 0) {
            score -= 10;
            factors.push({ icon: 'fa-times-circle', text: 'Dépenses supérieures aux revenus' });
        }

        // Factor 2: Budget defined (+10)
        if (budgets.length > 0) {
            score += 10;
            factors.push({ icon: 'fa-check-circle', text: 'Budgets définis' });
        } else {
            factors.push({ icon: 'fa-exclamation-circle', text: 'Aucun budget défini' });
        }

        // Factor 3: Budget adherence (+15)
        if (budgets.length > 0) {
            const overBudget = budgets.filter(b => {
                const spent = transactions.filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                    .reduce((s, t) => s + t.amount, 0);
                return spent > b.amount;
            }).length;
            if (overBudget === 0) {
                score += 15;
                factors.push({ icon: 'fa-check-circle', text: 'Tous les budgets respectés' });
            } else {
                score -= overBudget * 5;
                factors.push({ icon: 'fa-times-circle', text: `${overBudget} budget(s) dépassé(s)` });
            }
        }

        // Factor 4: Savings rate (+5 to +15)
        if (income > 0) {
            const savingsRate = ((income - expense) / income) * 100;
            if (savingsRate >= 20) {
                score += 15;
                factors.push({ icon: 'fa-check-circle', text: `Taux d'épargne: ${savingsRate.toFixed(0)}%` });
            } else if (savingsRate >= 10) {
                score += 5;
                factors.push({ icon: 'fa-exclamation-circle', text: `Taux d'épargne: ${savingsRate.toFixed(0)}%` });
            } else {
                factors.push({ icon: 'fa-times-circle', text: `Taux d'épargne faible: ${Math.max(0, savingsRate).toFixed(0)}%` });
            }
        }

        // Factor 5: Diversification of expenses
        const expenseCategories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.categoryId));
        if (expenseCategories.size >= 3) {
            score += 5;
            factors.push({ icon: 'fa-check-circle', text: 'Dépenses diversifiées' });
        }

        score = Math.max(0, Math.min(100, score));

        // Render label
        const labelEl = document.getElementById('health-label');
        if (labelEl) {
            if (score >= 80) labelEl.textContent = '🌟 Excellente gestion !';
            else if (score >= 60) labelEl.textContent = '👍 Bonne gestion';
            else if (score >= 40) labelEl.textContent = '⚠️ Peut mieux faire';
            else labelEl.textContent = '🚨 Attention requise';
        }

        // Render factors
        const factorsEl = document.getElementById('health-factors');
        if (factorsEl) {
            factorsEl.innerHTML = factors.slice(0, 4).map(f =>
                `<div class="health-factor"><i class="fas ${f.icon}"></i> ${f.text}</div>`
            ).join('');
        }

        // Animate ring
        if (typeof Theme !== 'undefined' && Theme.animateHealthScore) {
            Theme.animateHealthScore(score);
        }

        // Trigger notifications for important events
        if (typeof Theme !== 'undefined' && Theme.addNotification) {
            budgets.forEach(b => {
                const cat = categories.find(c => c.id === b.categoryId);
                const spent = transactions.filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                    .reduce((s, t) => s + t.amount, 0);
                const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
                if (pct >= 100) {
                    Theme.addNotification('danger', 'Budget dépassé', `${cat?.name || 'Catégorie'}: ${pct.toFixed(0)}% du budget utilisé`);
                } else if (pct >= 80) {
                    Theme.addNotification('warning', 'Budget bientôt atteint', `${cat?.name || 'Catégorie'}: ${pct.toFixed(0)}% du budget utilisé`);
                }
            });

            if (income > 0 && expense > income) {
                Theme.addNotification('danger', 'Dépenses élevées', 'Vos dépenses dépassent vos revenus ce mois.');
            }

            if (score >= 80) {
                Theme.addNotification('success', 'Bravo !', 'Votre santé financière est excellente ce mois.');
            }
        }
    }

    // ===================================================================
    //  SMART INSIGHTS
    // ===================================================================
    function renderSmartInsights(income, expense, totalBudget, budgets, transactions, categories) {
        const container = document.getElementById('insights-list');
        if (!container) return;

        const insights = [];

        // Insight 1: Biggest expense category
        const catSpending = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            catSpending[t.categoryId] = (catSpending[t.categoryId] || 0) + t.amount;
        });
        const topCatId = Object.entries(catSpending).sort((a, b) => b[1] - a[1])[0];
        if (topCatId) {
            const cat = categories.find(c => c.id === topCatId[0]);
            const pctOfTotal = expense > 0 ? ((topCatId[1] / expense) * 100).toFixed(0) : 0;
            insights.push({
                type: 'tip',
                icon: 'fa-chart-pie',
                title: 'Plus grosse catégorie de dépenses',
                desc: `${cat?.name || 'Autre'} représente ${pctOfTotal}% de vos dépenses (${Store.formatMoney(topCatId[1])})`
            });
        }

        // Insight 2: Savings opportunity
        if (income > 0 && expense > 0) {
            const savingsRate = ((income - expense) / income) * 100;
            if (savingsRate < 20 && savingsRate >= 0) {
                const target20 = income * 0.2;
                const needed = target20 - (income - expense);
                insights.push({
                    type: 'alert',
                    icon: 'fa-piggy-bank',
                    title: 'Objectif d\'épargne à 20%',
                    desc: `Réduisez vos dépenses de ${Store.formatMoney(needed)} pour atteindre la règle des 20% d'épargne.`
                });
            } else if (savingsRate >= 20) {
                insights.push({
                    type: 'success',
                    icon: 'fa-star',
                    title: 'Excellent taux d\'épargne',
                    desc: `Vous épargnez ${savingsRate.toFixed(0)}% de vos revenus — supérieur au seuil recommandé de 20%.`
                });
            }
        }

        // Insight 3: Budget usage warning
        const overBudget = budgets.filter(b => {
            const spent = transactions.filter(t => t.type === 'expense' && t.categoryId === b.categoryId)
                .reduce((s, t) => s + t.amount, 0);
            return spent > b.amount;
        });
        if (overBudget.length > 0) {
            const names = overBudget.map(b => {
                const cat = categories.find(c => c.id === b.categoryId);
                return cat?.name || 'Autre';
            }).join(', ');
            insights.push({
                type: 'danger',
                icon: 'fa-exclamation-triangle',
                title: `${overBudget.length} budget(s) dépassé(s)`,
                desc: `Catégories concernées : ${names}. Pensez à ajuster vos dépenses.`
            });
        }

        // Insight 4: Day-by-day spending
        if (transactions.length > 0) {
            const today = new Date();
            const dayOfMonth = today.getDate();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const dailyBudget = totalBudget > 0 ? totalBudget / daysInMonth : 0;
            const dailySpent = dayOfMonth > 0 ? expense / dayOfMonth : 0;

            if (dailyBudget > 0) {
                if (dailySpent > dailyBudget * 1.2) {
                    insights.push({
                        type: 'alert',
                        icon: 'fa-calendar-day',
                        title: 'Rythme de dépenses élevé',
                        desc: `Vous dépensez ${Store.formatMoney(dailySpent)}/jour vs ${Store.formatMoney(dailyBudget)}/jour budgété.`
                    });
                } else if (dailySpent <= dailyBudget) {
                    insights.push({
                        type: 'success',
                        icon: 'fa-calendar-check',
                        title: 'Rythme de dépenses maîtrisé',
                        desc: `${Store.formatMoney(dailySpent)}/jour — sous votre moyenne budgétée de ${Store.formatMoney(dailyBudget)}/jour.`
                    });
                }
            }
        }

        // Insight 4b: Month-end forecast
        if (transactions.length > 0) {
            const today = new Date();
            const dayOfMonth = Math.max(1, today.getDate());
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const dailySpent = expense / dayOfMonth;
            const forecastExpense = dailySpent * daysInMonth;

            if (forecastExpense > 0) {
                const delta = forecastExpense - totalBudget;
                if (totalBudget > 0 && delta > 0) {
                    insights.push({
                        type: 'danger',
                        icon: 'fa-chart-line',
                        title: 'Projection fin de mois',
                        desc: `Au rythme actuel, vous atteindrez ~${Store.formatMoney(forecastExpense)} de dépenses (dépasserait le budget de ${Store.formatMoney(delta)}).`
                    });

                    if (typeof Theme !== 'undefined' && Theme.addNotification) {
                        Theme.addNotification('warning', 'Projection fin de mois', `Risque de dépassement: +${Store.formatMoney(delta)}.`);
                    }
                } else if (totalBudget > 0 && delta <= 0) {
                    insights.push({
                        type: 'success',
                        icon: 'fa-chart-line',
                        title: 'Projection fin de mois',
                        desc: `Au rythme actuel, vous resterez sous le budget (projection: ${Store.formatMoney(forecastExpense)}).`
                    });
                }
            }
        }

        // Insight 5: Transaction count
        if (transactions.length > 0) {
            const expCount = transactions.filter(t => t.type === 'expense').length;
            const incCount = transactions.filter(t => t.type === 'income').length;
            insights.push({
                type: 'tip',
                icon: 'fa-receipt',
                title: 'Résumé des mouvements',
                desc: `${expCount} dépense(s) et ${incCount} revenu(s) enregistrés ce mois.`
            });
        }

        if (insights.length === 0) {
            container.innerHTML = '<p class="empty-state"><span class="empty-state-icon"><i class="fas fa-brain"></i></span>Ajoutez des transactions pour obtenir des insights.</p>';
            return;
        }

        container.innerHTML = insights.map((ins, i) => `
            <div class="insight-item" style="animation-delay: ${i * 0.08}s">
                <div class="insight-icon insight-${ins.type}">
                    <i class="fas ${ins.icon}"></i>
                </div>
                <div class="insight-content">
                    <div class="insight-title">${ins.title}</div>
                    <div class="insight-desc">${ins.desc}</div>
                </div>
            </div>
        `).join('');

        // Bind refresh button
        const refreshBtn = document.getElementById('btn-refresh-insights');
        if (refreshBtn && !refreshBtn.dataset.bound) {
            refreshBtn.dataset.bound = '1';
            refreshBtn.addEventListener('click', () => {
                refreshBtn.querySelector('i').style.animation = 'spinOrbit 0.8s ease';
                setTimeout(() => {
                    refreshBtn.querySelector('i').style.animation = '';
                    renderView('dashboard');
                }, 400);
            });
        }
    }

    function bindEnhancements() {
        if (uiEnhancementsBound) return;
        uiEnhancementsBound = true;
        initLiveHeader();
        initQuickRangeFilters();
        initCommandPalette();
        // Style Lab is handled entirely by theme.js — no duplicate init here
        initGuidedTour();
        initFabActions();
        ensureTransactionDraftButton();
    }

    function initLiveHeader() {
        const clockEl = document.getElementById('live-clock');
        const greetingEl = document.getElementById('live-greeting');
        if (!clockEl || !greetingEl) return;

        const update = () => {
            const now = new Date();
            const h = now.getHours();
            let greeting = 'Bonsoir';
            if (h >= 5 && h < 12) greeting = 'Bonjour';
            else if (h >= 12 && h < 18) greeting = 'Bon apres-midi';
            greetingEl.textContent = greeting;
            clockEl.textContent = now.toLocaleTimeString('fr-FR', { hour12: false });
        };

        update();
        if (clockTimer) clearInterval(clockTimer);
        clockTimer = setInterval(update, 1000);
    }

    function initQuickRangeFilters() {
        const filtersBar = document.querySelector('#view-transactions .filters-bar');
        const clearBtn = document.getElementById('btn-clear-filters');
        if (!filtersBar || !clearBtn) return;
        if (document.getElementById('tx-quick-ranges')) return;

        const wrap = document.createElement('div');
        wrap.id = 'tx-quick-ranges';
        wrap.className = 'filter-chips';
        wrap.innerHTML = `
            <button type="button" class="filter-chip" data-range="today">Aujourd'hui</button>
            <button type="button" class="filter-chip" data-range="month">Ce mois</button>
            <button type="button" class="filter-chip" data-range="year">Cette annee</button>
        `;
        filtersBar.insertBefore(wrap, clearBtn);

        wrap.querySelectorAll('.filter-chip').forEach(btn => {
            btn.addEventListener('click', () => applyQuickRange(btn.dataset.range));
        });
    }

    function applyQuickRange(range) {
        const from = document.getElementById('filter-date-from');
        const to = document.getElementById('filter-date-to');
        if (!from || !to) return;

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const today = `${yyyy}-${mm}-${dd}`;

        if (range === 'today') {
            from.value = today;
            to.value = today;
        } else if (range === 'month') {
            from.value = `${yyyy}-${mm}-01`;
            to.value = today;
        } else if (range === 'year') {
            from.value = `${yyyy}-01-01`;
            to.value = today;
        }

        setActiveQuickRange(range);
        transactionPage = 1;
        renderTransactions();
    }

    function setActiveQuickRange(range) {
        document.querySelectorAll('#tx-quick-ranges .filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.range === range);
        });
    }

    function resetQuickRangeChips() {
        setActiveQuickRange('');
    }

    function getCommandDefinitions() {
        return [
            { icon: 'fa-chart-pie', title: 'Tableau de bord', subtitle: 'Vue globale', action: () => navigateTo('dashboard') },
            { icon: 'fa-bullseye', title: 'Budget', subtitle: 'Planification mensuelle', action: () => navigateTo('budget') },
            { icon: 'fa-exchange-alt', title: 'Transactions', subtitle: 'Historique complet', action: () => navigateTo('transactions') },
            { icon: 'fa-redo', title: 'Recurrences', subtitle: 'Paiements automatiques', action: () => navigateTo('recurring') },
            { icon: 'fa-tags', title: 'Categories', subtitle: 'Gerer les categories', action: () => navigateTo('categories') },
            { icon: 'fa-trophy', title: 'Objectifs', subtitle: 'Suivre votre epargne', action: () => navigateTo('goals') },
            { icon: 'fa-chart-bar', title: 'Rapports', subtitle: 'Analyses annuelles', action: () => navigateTo('reports') },
            { icon: 'fa-boxes', title: 'Inventaire', subtitle: 'G\u00e9rer le stock', action: () => navigateTo('inventory') },
            { icon: 'fa-box', title: 'Nouvel article', subtitle: 'Ajouter au stock', action: () => openInventoryModal() },
            { icon: 'fa-plus', title: 'Nouvelle transaction', subtitle: 'Ajouter rapidement', action: () => openTransactionModal() },
            { icon: 'fa-moon', title: 'Basculer le theme', subtitle: 'Clair / sombre', action: () => document.getElementById('theme-toggle')?.click() },
            { icon: 'fa-swatchbook', title: 'Ouvrir Style Lab', subtitle: 'Personnaliser le style', action: () => openStyleLab() },
            { icon: 'fa-wand-magic-sparkles', title: 'Demarrer le guide', subtitle: 'Tour rapide de l app', action: () => startTour() },
            { icon: 'fa-expand-alt', title: 'Mode focus', subtitle: 'Masquer la sidebar', action: () => toggleFocusMode() },
            { icon: 'fa-keyboard', title: 'Raccourcis clavier', subtitle: 'Voir tous les raccourcis (Ctrl+/)', action: () => { const m = document.getElementById('modal-shortcuts'); if (m) m.classList.add('active'); } },
            { icon: 'fa-heartbeat', title: 'Sante financiere', subtitle: 'Score et diagnostic', action: () => navigateTo('dashboard') }
        ];
    }

    function initCommandPalette() {
        const btnShortcuts = document.getElementById('btn-shortcuts');
        const btnCommand = document.getElementById('fab-command');
        const search = document.getElementById('command-search');
        const list = document.getElementById('command-list');
        if (!search || !list) return;

        const render = () => {
            const q = normalizeForSearch(search.value || '');
            commandResults = getCommandDefinitions().filter(cmd => {
                const text = normalizeForSearch(`${cmd.title} ${cmd.subtitle}`);
                return !q || text.includes(q);
            });
            commandIndex = 0;
            renderCommandList();
        };

        search.addEventListener('input', render);
        search.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (commandResults.length) commandIndex = (commandIndex + 1) % commandResults.length;
                renderCommandList();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (commandResults.length) commandIndex = (commandIndex - 1 + commandResults.length) % commandResults.length;
                renderCommandList();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const current = commandResults[commandIndex];
                if (current) executeCommand(current);
            }
        });

        if (btnShortcuts) btnShortcuts.addEventListener('click', openCommandPalette);
        if (btnCommand) btnCommand.addEventListener('click', openCommandPalette);
        render();
    }

    function renderCommandList() {
        const list = document.getElementById('command-list');
        if (!list) return;
        if (!commandResults.length) {
            list.innerHTML = '<div class="command-empty">Aucune commande trouvee</div>';
            return;
        }
        list.innerHTML = commandResults.map((cmd, idx) => `
            <button class="command-item ${idx === commandIndex ? 'active' : ''}" data-index="${idx}" type="button">
                <span class="command-icon"><i class="fas ${cmd.icon}"></i></span>
                <span class="command-text">
                    <span class="command-title">${cmd.title}</span>
                    <span class="command-subtitle">${cmd.subtitle}</span>
                </span>
            </button>
        `).join('');

        list.querySelectorAll('.command-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = commandResults[parseInt(btn.dataset.index, 10)];
                if (cmd) executeCommand(cmd);
            });
        });
    }

    function executeCommand(cmd) {
        closeModal('modal-command');
        const search = document.getElementById('command-search');
        if (search) search.value = '';
        const out = cmd.action();
        if (out && typeof out.then === 'function') out.catch(() => null);
    }

    function openCommandPalette() {
        openModal('modal-command');
        const search = document.getElementById('command-search');
        if (!search) return;
        search.value = '';
        commandIndex = 0;
        commandResults = getCommandDefinitions();
        renderCommandList();
        setTimeout(() => search.focus(), 0);
    }

    // Style Lab is fully managed by theme.js — these stubs allow guided tour & command palette to still work
    function openStyleLab() {
        const panel = document.getElementById('style-lab');
        if (!panel) return;
        panel.classList.add('active');
        panel.setAttribute('aria-hidden', 'false');
    }

    function closeStyleLab() {
        const panel = document.getElementById('style-lab');
        if (!panel) return;
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
    }

    function initGuidedTour() {
        const overlay = document.getElementById('tour-overlay');
        const nextBtn = document.getElementById('tour-next');
        const prevBtn = document.getElementById('tour-prev');
        const skipBtn = document.getElementById('tour-skip');
        if (!overlay || !nextBtn || !prevBtn || !skipBtn) return;

        nextBtn.addEventListener('click', () => moveTour(1));
        prevBtn.addEventListener('click', () => moveTour(-1));
        skipBtn.addEventListener('click', endTour);

        if (!localStorage.getItem(TOUR_SEEN_KEY)) {
            setTimeout(() => startTour(), 900);
        }
    }

    function getTourSteps() {
        return [
            { selector: '#btn-quick-add', title: 'Ajout rapide', description: 'Creez une transaction en un clic.' },
            { selector: '#btn-style-lab', title: 'Style Lab', description: 'Personnalisez couleurs, scene et ambiance.' },
            { selector: '#view-transactions .filters-bar', title: 'Filtres avances', description: 'Affinez vos recherches de transactions.' },
            { selector: '#fab-command', title: 'Palette de commandes', description: 'Accedez vite aux actions via Ctrl/Cmd + K.' }
        ];
    }

    function startTour() {
        const overlay = document.getElementById('tour-overlay');
        if (!overlay) return;
        overlay.dataset.step = '0';
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        renderTourStep();
    }

    function moveTour(delta) {
        const overlay = document.getElementById('tour-overlay');
        if (!overlay) return;
        const total = getTourSteps().length;
        let step = parseInt(overlay.dataset.step || '0', 10) + delta;
        if (step < 0) step = 0;
        if (step >= total) {
            endTour();
            return;
        }
        overlay.dataset.step = String(step);
        renderTourStep();
    }

    function renderTourStep() {
        const overlay = document.getElementById('tour-overlay');
        if (!overlay) return;
        const steps = getTourSteps();
        const idx = parseInt(overlay.dataset.step || '0', 10);
        const step = steps[idx];
        if (!step) return;

        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        const target = document.querySelector(step.selector);
        if (target) {
            target.classList.add('tour-highlight');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        document.getElementById('tour-step').textContent = `Etape ${idx + 1}/${steps.length}`;
        document.getElementById('tour-title').textContent = step.title;
        document.getElementById('tour-description').textContent = step.description;
        document.getElementById('tour-prev').disabled = idx === 0;
        document.getElementById('tour-next').textContent = idx === steps.length - 1 ? 'Terminer' : 'Suivant';
    }

    function endTour() {
        const overlay = document.getElementById('tour-overlay');
        if (!overlay) return;
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        localStorage.setItem(TOUR_SEEN_KEY, '1');
    }

    function initFabActions() {
        const topBtn = document.getElementById('fab-top');
        const focusBtn = document.getElementById('fab-focus');
        if (topBtn) {
            topBtn.addEventListener('click', () => {
                const mc = document.getElementById('main-content');
                if (mc) mc.scrollTo({ top: 0, behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        if (focusBtn) {
            focusBtn.addEventListener('click', () => {
                toggleFocusMode();
            });
        }
    }

    function toggleFocusMode() {
        const btn = document.getElementById('fab-focus');
        const enabled = document.body.classList.toggle('focus-mode');
        if (btn) {
            btn.classList.toggle('active', enabled);
            btn.innerHTML = enabled ? '<i class="fas fa-compress-alt"></i>' : '<i class="fas fa-expand-alt"></i>';
        }
    }

    function ensureTransactionDraftButton() {
        const modal = document.getElementById('modal-transaction');
        const footer = modal?.querySelector('.modal-footer');
        if (!footer || document.getElementById('btn-clear-tx-draft')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'btn-clear-tx-draft';
        btn.className = 'btn btn-ghost';
        btn.innerHTML = '<i class="fas fa-eraser"></i> Effacer brouillon';
        btn.addEventListener('click', () => {
            clearTransactionDraft();
            toast('Brouillon supprime', 'info');
        });
        footer.prepend(btn);
    }

    function saveTransactionDraft() {
        const id = document.getElementById('transaction-id')?.value;
        if (id) return;
        const type = document.querySelector('input[name="transaction-type"]:checked')?.value || 'expense';
        const draft = {
            type,
            amount: document.getElementById('transaction-amount')?.value || '',
            date: document.getElementById('transaction-date')?.value || '',
            categoryId: document.getElementById('transaction-category')?.value || '',
            description: document.getElementById('transaction-description')?.value || '',
            notes: document.getElementById('transaction-notes')?.value || '',
            savedAt: Date.now()
        };
        localStorage.setItem(TX_DRAFT_KEY, JSON.stringify(draft));
    }

    async function restoreTransactionDraft() {
        const raw = localStorage.getItem(TX_DRAFT_KEY);
        if (!raw) return;
        let draft = null;
        try {
            draft = JSON.parse(raw);
        } catch (_) {
            return;
        }
        if (!draft?.savedAt || Date.now() - draft.savedAt > 1000 * 60 * 60 * 24 * 7) {
            clearTransactionDraft();
            return;
        }

        const type = draft.type === 'income' ? 'income' : 'expense';
        document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
        const activeType = document.querySelector(`.toggle-option[data-value="${type}"]`);
        if (activeType) activeType.classList.add('active');
        const typeInput = document.querySelector(`input[name="transaction-type"][value="${type}"]`);
        if (typeInput) typeInput.checked = true;
        await populateCategorySelect('transaction-category', type);

        document.getElementById('transaction-amount').value = draft.amount || '';
        document.getElementById('transaction-date').value = draft.date || document.getElementById('transaction-date').value;
        document.getElementById('transaction-category').value = draft.categoryId || '';
        document.getElementById('transaction-description').value = draft.description || '';
        document.getElementById('transaction-notes').value = draft.notes || '';
    }

    function clearTransactionDraft() {
        localStorage.removeItem(TX_DRAFT_KEY);
    }

    function bindMisc() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
                closeStyleLab();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                openTransactionModal();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openCommandPalette();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                startTour();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                const modal = document.getElementById('modal-shortcuts');
                if (modal) modal.classList.toggle('active');
            }
            if (!e.ctrlKey && !e.metaKey && e.key === '?') {
                if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
                e.preventDefault();
                openCommandPalette();
            }
        });

        // Shortcuts button opens shortcuts modal
        const btnShortcuts = document.getElementById('btn-shortcuts');
        if (btnShortcuts) {
            btnShortcuts.removeEventListener('click', openCommandPalette);
            btnShortcuts.addEventListener('click', () => {
                const modal = document.getElementById('modal-shortcuts');
                if (modal) modal.classList.toggle('active');
            });
        }

        // Settings button opens settings view
        const btnSettings = document.getElementById('btn-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                navigateTo('settings');
            });
        }
    }

    // ===== UTILITY FUNCTIONS =====
    function normalizeForSearch(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function hexToRgba(hex, alpha = 1) {
        const safe = String(hex || '').replace('#', '');
        const full = safe.length === 3 ? safe.split('').map(x => x + x).join('') : safe;
        const num = parseInt(full, 16);
        if (Number.isNaN(num)) return `rgba(99,102,241,${alpha})`;
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function renderPagination(containerId, currentPage, totalPages, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '';
        html += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="false">« Préc.</button>`;

        const range = 2;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
                html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - range - 1 || i === currentPage + range + 1) {
                html += '<button disabled>•</button>';
            }
        }

        html += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="false">Suiv. »</button>`;

        container.innerHTML = html;

        container.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => onPageChange(parseInt(btn.dataset.page)));
        });

        container.querySelector('button:first-child').addEventListener('click', () => {
            if (currentPage > 1) onPageChange(currentPage - 1);
        });

        container.querySelector('button:last-child').addEventListener('click', () => {
            if (currentPage < totalPages) onPageChange(currentPage + 1);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function formatDateTime(isoStr) {
        if (!isoStr) return '—';
        const d = new Date(isoStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    async function getAvailableYears() {
        const txs = await Store.Transactions.getAll();
        const years = new Set([currentYear]);
        txs.forEach(t => years.add(new Date(t.date).getFullYear()));
        return [...years].sort((a, b) => b - a);
    }

    function getNextDueDate(fromDate, frequency) {
        const d = new Date(fromDate);
        switch (frequency) {
            case 'weekly': d.setDate(d.getDate() + 7); break;
            case 'monthly': d.setMonth(d.getMonth() + 1); break;
            case 'quarterly': d.setMonth(d.getMonth() + 3); break;
            case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
        }
        return d.toISOString().split('T')[0];
    }

    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // -------- Auth.init() is called from auth.js on DOMContentLoaded --------
    // No more DOMContentLoaded here

    // Public API for inline handlers
    return {
        init,
        toast,
        editTransaction,
        deleteTransaction,
        editBudget,
        deleteBudget,
        editCategory,
        deleteCategory,
        editRecurring,
        deleteRecurring,
        toggleRecurring,
        editGoal,
        deleteGoal,
        addToGoal,
        editInventoryItem,
        deleteInventoryItem,
        useInventoryItem,
        editBook,
        deleteBook,
        updateBookProgress,
        toggleBookFavorite,
        editWorkout,
        deleteWorkout,
        editRecipe,
        deleteRecipe,
        toggleRecipeFavorite,
        editNote,
        deleteNote,
        toggleNotePin,
        archiveNote,
        editHabit,
        deleteHabit,
        toggleHabit,
        editContact,
        deleteContact,
        toggleContactFavorite,
        editMovie,
        deleteMovie,
        toggleMovieFavorite,
        editTrip,
        deleteTrip,
        toggleTripFavorite,
        editPlant,
        deletePlant,
        waterPlant,
        editMusic,
        deleteMusic,
        toggleMusicFavorite,
        editVehicle,
        deleteVehicle,
        editHealth,
        deleteHealth,
        editEvent,
        deleteEvent,
        toggleEventFavorite,
        editPet,
        deletePet,
        togglePetFavorite,
        editCourse,
        deleteCourse,
        toggleCourseFavorite,
        editSleep,
        deleteSleep,
        editHomeTask,
        deleteHomeTask,
        completeHomeTask,
        editGame,
        deleteGame,
        toggleGameFavorite,
        editWardrobe,
        deleteWardrobe,
        toggleWardrobeFavorite,
        wearWardrobeItem,
        editPackage,
        deletePackage,
        markPackageDelivered,
        editIdea,
        deleteIdea,
        toggleIdeaFavorite,
        editProject,
        deleteProject,
        toggleProjectFavorite,
        editPassword,
        deletePassword,
        togglePasswordFavorite,
        copyPassword,
        copyUsername,
        editSubscription,
        deleteSubscription,
        toggleSubscriptionFavorite,
        editGift,
        deleteGift,
        toggleGiftFavorite,
        editWine,
        deleteWine,
        toggleWineFavorite,
        drinkWine,
        editPodcast,
        deletePodcast,
        togglePodcastFavorite,
        editCleaning,
        deleteCleaning,
        toggleCleaningFavorite,
        markCleaningDone,
        editAlbum,
        deleteAlbum,
        toggleAlbumFavorite,
        editMedication,
        deleteMedication,
        toggleMedicationFavorite,
        editWishlist,
        deleteWishlist,
        toggleWishlistFavorite,
        editDocument,
        deleteDocument,
        toggleDocumentFavorite,
        editCollection,
        deleteCollection,
        toggleCollectionFavorite,
        editTrade,
        deleteTrade,
        toggleTradeFavorite,
        closeTradePrompt,
        editPosition,
        deletePosition,
        togglePositionFavorite,
        updatePositionPrice,
        editTWatchlist,
        deleteTWatchlist,
        toggleTWatchlistFavorite,
        updateTWatchlistPrice,
        _navigateTo: navigateTo
    };
})();

/* ===================================================================
   ACCOUNT SETTINGS — Profile Editing
   =================================================================== */
const AccountSettings = (() => {
    const PREFS_KEY = 'lifeos-account-prefs';
    let selectedColor = 'linear-gradient(135deg, #7C3AED, #D946EF)';
    let selectedIcon = 'fa-user-astronaut';

    function init() {
        loadPrefs();
        bindUserAreaClick();
        bindAvatarColors();
        bindAvatarIcons();
        bindAccountForm();
        applyAvatarToSidebar();
    }

    function loadPrefs() {
        try {
            const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
            if (saved.avatarColor) selectedColor = saved.avatarColor;
            if (saved.avatarIcon) selectedIcon = saved.avatarIcon;
        } catch(e) {}
    }

    function savePrefs() {
        try {
            localStorage.setItem(PREFS_KEY, JSON.stringify({
                avatarColor: selectedColor,
                avatarIcon: selectedIcon
            }));
        } catch(e) {}
    }

    function applyAvatarToSidebar() {
        const avatar = document.getElementById('sidebar-user-avatar');
        if (avatar) {
            avatar.style.background = selectedColor;
            avatar.innerHTML = `<i class="fas ${selectedIcon}"></i>`;
        }
    }

    function bindUserAreaClick() {
        const userArea = document.getElementById('sidebar-user-area');
        if (!userArea) return;

        userArea.addEventListener('click', (e) => {
            // Don't open modal if clicking logout button
            if (e.target.closest('.sidebar-logout-btn')) return;
            openAccountModal();
        });
    }

    function openAccountModal() {
        const user = Auth.getUser();
        if (!user) return;

        // Fill form fields
        const nameInput = document.getElementById('account-fullname');
        const emailInput = document.getElementById('account-email');
        const createdAt = document.getElementById('account-created-at');
        const lastSignin = document.getElementById('account-last-signin');
        const newPw = document.getElementById('account-new-password');
        const confirmPw = document.getElementById('account-confirm-password');

        if (nameInput) nameInput.value = user.user_metadata?.full_name || '';
        if (emailInput) emailInput.value = user.email || '';
        if (newPw) newPw.value = '';
        if (confirmPw) confirmPw.value = '';

        // Format dates
        if (createdAt && user.created_at) {
            createdAt.textContent = new Date(user.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        }
        if (lastSignin && user.last_sign_in_at) {
            lastSignin.textContent = new Date(user.last_sign_in_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }

        // Update avatar preview
        updateAvatarPreview();

        // Set active states for color & icon buttons
        document.querySelectorAll('.avatar-color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === selectedColor);
        });
        document.querySelectorAll('.avatar-icon-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.icon === selectedIcon);
        });

        // Close password section
        const details = document.querySelector('.account-password-section');
        if (details) details.open = false;

        document.getElementById('modal-account').classList.add('active');
    }

    function updateAvatarPreview() {
        const preview = document.getElementById('account-avatar-preview');
        if (preview) {
            preview.style.background = selectedColor;
            preview.innerHTML = `<i class="fas ${selectedIcon}"></i>`;
        }
    }

    function bindAvatarColors() {
        document.querySelectorAll('.avatar-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.avatar-color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedColor = btn.dataset.color;
                updateAvatarPreview();
            });
        });
    }

    function bindAvatarIcons() {
        document.querySelectorAll('.avatar-icon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.avatar-icon-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedIcon = btn.dataset.icon;
                updateAvatarPreview();
            });
        });
    }

    function bindAccountForm() {
        const form = document.getElementById('account-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('account-fullname').value.trim();
            const newPassword = document.getElementById('account-new-password').value;
            const confirmPassword = document.getElementById('account-confirm-password').value;

            // Validate password if provided
            if (newPassword) {
                if (newPassword.length < 6) {
                    if (typeof App !== 'undefined' && App.toast) {
                        App.toast('Le mot de passe doit contenir au moins 6 caractères.', 'error');
                    }
                    return;
                }
                if (newPassword !== confirmPassword) {
                    if (typeof App !== 'undefined' && App.toast) {
                        App.toast('Les mots de passe ne correspondent pas.', 'error');
                    }
                    return;
                }
            }

            try {
                // Update user metadata (name)
                const updateData = {
                    data: { full_name: fullName }
                };

                // Add password if changing
                if (newPassword) {
                    updateData.password = newPassword;
                }

                const { data, error } = await supabaseClient.auth.updateUser(updateData);

                if (error) {
                    if (typeof App !== 'undefined' && App.toast) {
                        App.toast(`Erreur : ${error.message}`, 'error');
                    }
                    return;
                }

                // Save avatar preferences locally
                savePrefs();
                applyAvatarToSidebar();

                // Update sidebar name
                const nameEl = document.getElementById('sidebar-user-name');
                if (nameEl) nameEl.textContent = fullName || data.user?.email || 'Utilisateur';

                // Close modal
                document.getElementById('modal-account').classList.remove('active');

                if (typeof App !== 'undefined' && App.toast) {
                    App.toast('Profil mis à jour avec succès !', 'success');
                }
            } catch (err) {
                console.error('Account update error:', err);
                if (typeof App !== 'undefined' && App.toast) {
                    App.toast('Erreur lors de la mise à jour.', 'error');
                }
            }
        });
    }

    return { init, applyAvatarToSidebar };
})();
