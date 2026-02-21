/* ===================================================================
   spiritual.js — Vie Spirituelle
   Bible (Louis Segond), Journal de Prière, Gratitude
   =================================================================== */

const Spiritual = (() => {
    'use strict';

    // ── Storage Keys ─────────────────────────────────────────────
    const S_PRAYER     = 'mb-prayer-v1';
    const S_GRATITUDE  = 'mb-gratitude-v1';
    const S_BOOKMARK   = 'mb-bible-bookmark-v1';
    const S_NOTES      = 'mb-bible-notes-v1';
    const S_FAVORITES  = 'mb-bible-favorites-v1';
    const S_HIGHLIGHTS = 'mb-bible-highlights-v1';
    const S_READ       = 'mb-bible-read-v1';
    const S_FONTSIZE   = 'mb-bible-fontsize-v1';

    let prayers          = [];
    let gratitudes       = [];
    let bibleNotes       = {};
    let bibleFavorites   = [];
    let bibleHighlights  = {};
    let bibleReadChapters = [];
    let bibleFontSize    = 16;
    let currentBibleTab  = 'read';

    function loadData() {
        try { prayers    = JSON.parse(localStorage.getItem(S_PRAYER)    || '[]'); } catch { prayers = []; }
        try { gratitudes = JSON.parse(localStorage.getItem(S_GRATITUDE) || '[]'); } catch { gratitudes = []; }
        try { bibleNotes = JSON.parse(localStorage.getItem(S_NOTES)     || '{}'); } catch { bibleNotes = {}; }
    }

    function loadBibleData() {
        try { bibleFavorites    = JSON.parse(localStorage.getItem(S_FAVORITES)  || '[]'); } catch { bibleFavorites = []; }
        try { bibleHighlights   = JSON.parse(localStorage.getItem(S_HIGHLIGHTS) || '{}'); } catch { bibleHighlights = {}; }
        try { bibleReadChapters = JSON.parse(localStorage.getItem(S_READ)       || '[]'); } catch { bibleReadChapters = []; }
        try { bibleFontSize     = parseInt(localStorage.getItem(S_FONTSIZE)) || 16; }       catch { bibleFontSize = 16; }
        try { bibleNotes        = JSON.parse(localStorage.getItem(S_NOTES)      || '{}'); } catch { bibleNotes = {}; }
    }

    function savePrayers()         { localStorage.setItem(S_PRAYER,     JSON.stringify(prayers)); }
    function saveGratitudes()      { localStorage.setItem(S_GRATITUDE,  JSON.stringify(gratitudes)); }
    function saveBibleNotes()      { localStorage.setItem(S_NOTES,      JSON.stringify(bibleNotes)); }
    function saveBookmark(b)       { localStorage.setItem(S_BOOKMARK,   JSON.stringify(b)); }
    function loadBookmark()        { try { return JSON.parse(localStorage.getItem(S_BOOKMARK) || 'null'); } catch { return null; } }
    function saveBibleFavorites()  { localStorage.setItem(S_FAVORITES,  JSON.stringify(bibleFavorites)); }
    function saveBibleHighlights() { localStorage.setItem(S_HIGHLIGHTS, JSON.stringify(bibleHighlights)); }
    function saveBibleRead()       { localStorage.setItem(S_READ,       JSON.stringify(bibleReadChapters)); }
    function saveBibleFontSize()   { localStorage.setItem(S_FONTSIZE,   bibleFontSize); }
    function genId()               { return 'sp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6); }

    // ── 66 Books of the Bible ─────────────────────────────────────
    const BIBLE_BOOKS = [
        // Ancien Testament
        { num:1,  name:'Genèse',                  ch:50,  group:'Pentateuque' },
        { num:2,  name:'Exode',                   ch:40,  group:'Pentateuque' },
        { num:3,  name:'Lévitique',               ch:27,  group:'Pentateuque' },
        { num:4,  name:'Nombres',                 ch:36,  group:'Pentateuque' },
        { num:5,  name:'Deutéronome',             ch:34,  group:'Pentateuque' },
        { num:6,  name:'Josué',                   ch:24,  group:'Livres historiques' },
        { num:7,  name:'Juges',                   ch:21,  group:'Livres historiques' },
        { num:8,  name:'Ruth',                    ch:4,   group:'Livres historiques' },
        { num:9,  name:'1 Samuel',                ch:31,  group:'Livres historiques' },
        { num:10, name:'2 Samuel',                ch:24,  group:'Livres historiques' },
        { num:11, name:'1 Rois',                  ch:22,  group:'Livres historiques' },
        { num:12, name:'2 Rois',                  ch:25,  group:'Livres historiques' },
        { num:13, name:'1 Chroniques',            ch:29,  group:'Livres historiques' },
        { num:14, name:'2 Chroniques',            ch:36,  group:'Livres historiques' },
        { num:15, name:'Esdras',                  ch:10,  group:'Livres historiques' },
        { num:16, name:'Néhémie',                 ch:13,  group:'Livres historiques' },
        { num:17, name:'Esther',                  ch:10,  group:'Livres historiques' },
        { num:18, name:'Job',                     ch:42,  group:'Livres poétiques' },
        { num:19, name:'Psaumes',                 ch:150, group:'Livres poétiques' },
        { num:20, name:'Proverbes',               ch:31,  group:'Livres poétiques' },
        { num:21, name:'Ecclésiaste',             ch:12,  group:'Livres poétiques' },
        { num:22, name:'Cantique des Cantiques',  ch:8,   group:'Livres poétiques' },
        { num:23, name:'Ésaïe',                   ch:66,  group:'Prophètes majeurs' },
        { num:24, name:'Jérémie',                 ch:52,  group:'Prophètes majeurs' },
        { num:25, name:'Lamentations',            ch:5,   group:'Prophètes majeurs' },
        { num:26, name:'Ézéchiel',                ch:48,  group:'Prophètes majeurs' },
        { num:27, name:'Daniel',                  ch:12,  group:'Prophètes majeurs' },
        { num:28, name:'Osée',                    ch:14,  group:'Prophètes mineurs' },
        { num:29, name:'Joël',                    ch:3,   group:'Prophètes mineurs' },
        { num:30, name:'Amos',                    ch:9,   group:'Prophètes mineurs' },
        { num:31, name:'Abdias',                  ch:1,   group:'Prophètes mineurs' },
        { num:32, name:'Jonas',                   ch:4,   group:'Prophètes mineurs' },
        { num:33, name:'Michée',                  ch:7,   group:'Prophètes mineurs' },
        { num:34, name:'Nahum',                   ch:3,   group:'Prophètes mineurs' },
        { num:35, name:'Habacuc',                 ch:3,   group:'Prophètes mineurs' },
        { num:36, name:'Sophonie',                ch:3,   group:'Prophètes mineurs' },
        { num:37, name:'Aggée',                   ch:2,   group:'Prophètes mineurs' },
        { num:38, name:'Zacharie',                ch:14,  group:'Prophètes mineurs' },
        { num:39, name:'Malachie',                ch:4,   group:'Prophètes mineurs' },
        // Nouveau Testament
        { num:40, name:'Matthieu',                ch:28,  group:'Évangiles' },
        { num:41, name:'Marc',                    ch:16,  group:'Évangiles' },
        { num:42, name:'Luc',                     ch:24,  group:'Évangiles' },
        { num:43, name:'Jean',                    ch:21,  group:'Évangiles' },
        { num:44, name:'Actes',                   ch:28,  group:'Histoire apostolique' },
        { num:45, name:'Romains',                 ch:16,  group:'Épîtres de Paul' },
        { num:46, name:'1 Corinthiens',           ch:16,  group:'Épîtres de Paul' },
        { num:47, name:'2 Corinthiens',           ch:13,  group:'Épîtres de Paul' },
        { num:48, name:'Galates',                 ch:6,   group:'Épîtres de Paul' },
        { num:49, name:'Éphésiens',               ch:6,   group:'Épîtres de Paul' },
        { num:50, name:'Philippiens',             ch:4,   group:'Épîtres de Paul' },
        { num:51, name:'Colossiens',              ch:4,   group:'Épîtres de Paul' },
        { num:52, name:'1 Thessaloniciens',       ch:5,   group:'Épîtres de Paul' },
        { num:53, name:'2 Thessaloniciens',       ch:3,   group:'Épîtres de Paul' },
        { num:54, name:'1 Timothée',              ch:6,   group:'Épîtres de Paul' },
        { num:55, name:'2 Timothée',              ch:4,   group:'Épîtres de Paul' },
        { num:56, name:'Tite',                    ch:3,   group:'Épîtres de Paul' },
        { num:57, name:'Philémon',                ch:1,   group:'Épîtres de Paul' },
        { num:58, name:'Hébreux',                 ch:13,  group:'Épîtres générales' },
        { num:59, name:'Jacques',                 ch:5,   group:'Épîtres générales' },
        { num:60, name:'1 Pierre',                ch:5,   group:'Épîtres générales' },
        { num:61, name:'2 Pierre',                ch:3,   group:'Épîtres générales' },
        { num:62, name:'1 Jean',                  ch:5,   group:'Épîtres générales' },
        { num:63, name:'2 Jean',                  ch:1,   group:'Épîtres générales' },
        { num:64, name:'3 Jean',                  ch:1,   group:'Épîtres générales' },
        { num:65, name:'Jude',                    ch:1,   group:'Épîtres générales' },
        { num:66, name:'Apocalypse',              ch:22,  group:'Prophétie' },
    ];

    // ── Daily Verses (Louis Segond) ────────────────────────────────
    const DAILY_VERSES = [
        { ref:'Jean 3:16',         text:'Car Dieu a tant aimé le monde qu\'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu\'il ait la vie éternelle.' },
        { ref:'Psaumes 23:1',      text:'L\'Éternel est mon berger: je ne manquerai de rien.' },
        { ref:'Philippiens 4:13',  text:'Je puis tout par celui qui me fortifie.' },
        { ref:'Jérémie 29:11',     text:'Car je connais les projets que j\'ai formés sur vous, dit l\'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l\'espérance.' },
        { ref:'Romains 8:28',      text:'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.' },
        { ref:'Ésaïe 40:31',       text:'Mais ceux qui se confient en l\'Éternel renouvellent leur force. Ils prennent le vol comme les aigles; ils courent, et ne se lassent point; ils marchent, et ne se fatiguent point.' },
        { ref:'Proverbes 3:5-6',   text:'Confie-toi en l\'Éternel de tout ton cœur, et ne t\'appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.' },
        { ref:'Matthieu 6:33',     text:'Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.' },
        { ref:'Josué 1:9',         text:'Ne t\'ai-je pas donné cet ordre: Sois ferme et courageux? Ne t\'effraie point et ne t\'épouvante point, car l\'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.' },
        { ref:'Psaumes 46:2',      text:'Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.' },
        { ref:'Romains 12:2',      text:'Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l\'intelligence, afin que vous discerniez quelle est la volonté de Dieu.' },
        { ref:'2 Corinthiens 5:7', text:'Car nous marchons par la foi et non par la vue.' },
        { ref:'Galates 5:22-23',   text:'Mais le fruit de l\'Esprit, c\'est l\'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance.' },
        { ref:'Ésaïe 41:10',       text:'Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu; je te fortifie, je viens à ton secours, je te soutiens de ma droite triomphante.' },
        { ref:'Jean 14:6',         text:'Jésus lui dit: Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.' },
        { ref:'Psaumes 119:105',   text:'Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.' },
        { ref:'Actes 1:8',         text:'Mais vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins à Jérusalem, dans toute la Judée, dans la Samarie, et jusqu\'aux extrémités de la terre.' },
        { ref:'Hébreux 11:1',      text:'Or la foi est une ferme assurance des choses qu\'on espère, une démonstration de celles qu\'on ne voit pas.' },
        { ref:'Matthieu 5:3',      text:'Heureux les pauvres en esprit, car le royaume des cieux est à eux!' },
        { ref:'1 Jean 4:8',        text:'Celui qui n\'aime pas n\'a pas connu Dieu, car Dieu est amour.' },
        { ref:'Philippiens 4:6-7', text:'Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces. Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.' },
        { ref:'Psaumes 37:4',      text:'Fais de l\'Éternel tes délices, et il te donnera ce que ton cœur désire.' },
        { ref:'Ésaïe 26:3',        text:'À celui qui est ferme dans ses dispositions tu assures la paix, la paix, parce qu\'il se confie en toi.' },
        { ref:'1 Thessaloniciens 5:16-18', text:'Soyez toujours joyeux. Priez sans cesse. Rendez grâces en toutes choses, car c\'est à votre égard la volonté de Dieu en Jésus-Christ.' },
        { ref:'Lamentations 3:22-23', text:'Les bontés de l\'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme; elles se renouvellent chaque matin. Ta fidélité est grande.' },
        { ref:'Colossiens 3:23',   text:'Quoi que vous fassiez, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes.' },
        { ref:'2 Timothée 3:16',   text:'Toute Écriture est inspirée de Dieu, et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la justice.' },
        { ref:'Matthieu 11:28',    text:'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.' },
        { ref:'Jean 10:10',        text:'Le voleur ne vient que pour dérober, égorger et détruire; moi, je suis venu afin que les brebis aient la vie, et qu\'elles soient dans l\'abondance.' },
        { ref:'Romains 5:8',       text:'Mais Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, Christ est mort pour nous.' },
        { ref:'Psaumes 27:1',      text:'L\'Éternel est ma lumière et mon salut: de qui aurais-je crainte? L\'Éternel est le soutien de ma vie: de qui aurais-je peur?' },
        { ref:'Jacques 1:3',       text:'Sachant que l\'épreuve de votre foi produit la patience.' },
        { ref:'Proverbes 31:25',   text:'Elle est revêtue de force et de magnificence, et elle rit de l\'avenir.' },
        { ref:'Jean 15:5',         text:'Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire.' },
        { ref:'Éphésiens 2:8-9',   text:'Car c\'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c\'est le don de Dieu. Ce n\'est point par les œuvres, afin que personne ne se glorifie.' },
        { ref:'Psaumes 139:14',    text:'Je te loue de ce que je suis une créature si merveilleuse. Tes œuvres sont admirables, et mon âme le reconnaît bien.' },
        { ref:'1 Corinthiens 13:4-5', text:'La charité est patiente, elle est pleine de bonté; la charité n\'est point envieuse; la charité ne se vante point, elle ne s\'enfle point d\'orgueil, elle ne fait rien de malhonnête, elle ne cherche point son intérêt.' },
        { ref:'Zacharie 4:6',      text:'Ce n\'est pas par la puissance ni par la force, mais c\'est par mon Esprit, dit l\'Éternel des armées.' },
        { ref:'Nombres 6:24-26',   text:'Que l\'Éternel te bénisse, et qu\'il te garde! Que l\'Éternel fasse luire sa face sur toi, et qu\'il t\'accorde sa grâce! Que l\'Éternel tourne sa face vers toi, et qu\'il te donne la paix!' },
        { ref:'Marc 11:24',        text:'C\'est pourquoi je vous dis: Tout ce que vous demanderez en priant, croyez que vous l\'avez reçu, et vous le verrez s\'accomplir.' },
        { ref:'Ésaïe 55:8',        text:'Car mes pensées ne sont pas vos pensées, et vos voies ne sont pas mes voies, dit l\'Éternel.' },
        { ref:'Romains 15:13',     text:'Que le Dieu de l\'espérance vous remplisse de toute joie et de toute paix par la foi, pour que vous abondiez en espérance, par la puissance du Saint-Esprit!' },
        { ref:'Jacques 4:8',       text:'Approchez-vous de Dieu et il s\'approchera de vous. Nettoyez vos mains, pécheurs; purifiez vos cœurs, hommes irrésolus.' },
        { ref:'2 Chroniques 7:14', text:'Si mon peuple sur qui est invoqué mon nom s\'humilie, prie, et cherche ma face, et s\'il se détourne de ses mauvaises voies — je l\'exaucerai des cieux, je lui pardonnerai son péché, et je guérirai son pays.' },
        { ref:'Psaumes 1:1-2',     text:'Heureux l\'homme qui ne marche pas selon le conseil des méchants, qui ne s\'arrête pas sur la voie des pécheurs, et qui ne s\'assied pas en compagnie des moqueurs, mais qui trouve son plaisir dans la loi de l\'Éternel, et qui la médite jour et nuit!' },
        { ref:'Jean 8:32',         text:'Vous connaîtrez la vérité, et la vérité vous affranchira.' },
        { ref:'Hébreux 13:5',      text:'Je ne te délaisserai point, et je ne t\'abandonnerai point.' },
        { ref:'Ésaïe 43:2',        text:'Lorsque tu passeras par les eaux, je serai avec toi; et par les fleuves, ils ne te submergeront point; lorsque tu marcheras dans le feu, tu ne te brûleras pas, et la flamme ne t\'embrasera point.' },
        { ref:'Matthieu 7:7',      text:'Demandez, et l\'on vous donnera; cherchez, et vous trouverez; frappez, et l\'on vous ouvrira.' },
        { ref:'2 Timothée 1:7',    text:'Car ce n\'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d\'amour et de sagesse.' },
    ];

    function getDailyVerse() {
        const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
        return DAILY_VERSES[daysSinceEpoch % DAILY_VERSES.length];
    }

    // ── Bible API ─────────────────────────────────────────────────
    // bolls.life/NBS — Nouvelle Bible Segond (français, confirmé fonctionnel)
    // Format réponse : [{pk, verse, text, comment}, ...]  verse commence à 1
    const API_URL = 'https://bolls.life/get-chapter/NBS';
    const CACHE = {};
    let bibleControlsBound = false;

    async function fetchChapter(bookNum, chapterNum) {
        const key = `${bookNum}_${chapterNum}`;
        if (CACHE[key]) return CACHE[key];
        const resp = await fetch(`${API_URL}/${bookNum}/${chapterNum}/`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const arr = await resp.json();
        if (!Array.isArray(arr) || arr.length === 0) throw new Error('Aucun verset reçu');
        const verses = {};
        arr.forEach(v => {
            const clean = String(v.text || '').replace(/<[^>]*>/g, '').trim();
            verses[v.verse] = { text: clean };
        });
        const data = { verses };
        CACHE[key] = data;
        return data;
    }

    // ── State ─────────────────────────────────────────────────────
    let currentBook    = 43; // Jean par défaut
    let currentChapter = 3;

    // ── Prayer helpers ─────────────────────────────────────────────
    const PRAYER_CATS = { thanksgiving:'Actions de grâce', intercession:'Intercession', supplication:'Supplication', praise:'Louange', confession:'Confession', guidance:'Guidance' };
    const PRAYER_STATUS = { active:'En attente', answered:'Exaucée', pending:'À Dieu' };

    function prayerStatBadge(s) {
        const map = { active:'badge-warning', answered:'badge-success', pending:'badge-info' };
        return `<span class="badge ${map[s]||'badge-info'}">${PRAYER_STATUS[s]||s}</span>`;
    }

    // ──────────────────────────────────────────────────────────────
    //  RENDER: SPIRITUAL OVERVIEW
    // ──────────────────────────────────────────────────────────────
    async function renderSpiritual() {
        loadData();
        const verse      = getDailyVerse();
        const totalPray  = prayers.length;
        const answered   = prayers.filter(p => p.status === 'answered').length;
        const totalGrat  = gratitudes.length;
        const today      = new Date().toISOString().slice(0, 10);
        const gratToday  = gratitudes.filter(g => g.date === today).length;

        // Gratitude streak
        let streak = 0;
        const days = [...new Set(gratitudes.map(g => g.date))].sort().reverse();
        for (let i = 0; i < days.length; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            if (days[i] === d.toISOString().slice(0,10)) streak++;
            else break;
        }

        document.getElementById('spiritual-stat-prayers').textContent = totalPray;
        document.getElementById('spiritual-stat-answered').textContent = answered;
        document.getElementById('spiritual-stat-gratitude').textContent = totalGrat;
        document.getElementById('spiritual-stat-streak').textContent = streak + ' j';

        // Daily verse
        const dv = document.getElementById('spiritual-daily-verse');
        if (dv) {
            dv.innerHTML = `
              <div class="daily-verse-reference"><i class="fas fa-cross"></i> ${verse.ref}</div>
              <blockquote class="daily-verse-text">"${verse.text}"</blockquote>`;
        }

        // Recent prayers
        const rp = document.getElementById('spiritual-recent-prayers');
        if (rp) {
            const list = prayers.slice(-5).reverse();
            rp.innerHTML = list.length === 0
                ? '<p class="empty-state-sm">Aucune prière enregistrée.</p>'
                : list.map(p => `
                    <div class="spiritual-mini-card">
                        <span class="smc-icon pray-icon"><i class="fas fa-pray"></i></span>
                        <div class="smc-body">
                            <span class="smc-title">${p.title}</span>
                            <span class="smc-date">${p.date}</span>
                        </div>
                        ${prayerStatBadge(p.status)}
                    </div>`).join('');
        }

        // Recent gratitude
        const rg = document.getElementById('spiritual-recent-gratitude');
        if (rg) {
            const list = gratitudes.slice(-5).reverse();
            rg.innerHTML = list.length === 0
                ? '<p class="empty-state-sm">Aucune gratitude enregistrée.</p>'
                : list.map(g => `
                    <div class="spiritual-mini-card">
                        <span class="smc-icon grat-icon">${g.emoji || '🙏'}</span>
                        <div class="smc-body">
                            <span class="smc-title">${g.text}</span>
                            <span class="smc-date">${g.date}</span>
                        </div>
                    </div>`).join('');
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  RENDER: BIBLE READER
    // ──────────────────────────────────────────────────────────────
    async function renderBible() {
        loadBibleData();
        const bm = loadBookmark();
        if (bm) { currentBook = bm.book; currentChapter = bm.chapter; }

        document.documentElement.style.setProperty('--bible-font-size', bibleFontSize + 'px');

        populateBibleBookSelect();
        populateBibleChapterSelect();
        if (!bibleControlsBound) {
            bindBibleControls();
            bibleControlsBound = true;
        }

        switchBibleTab(currentBibleTab || 'read');
        if (currentBibleTab === 'read') await loadBibleChapter();
    }

    function switchBibleTab(tab) {
        currentBibleTab = tab;
        document.querySelectorAll('.bible-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.bible-tab-panel').forEach(p => p.classList.toggle('active', p.id === `bible-panel-${tab}`));
        if (tab === 'favorites') renderBibleFavorites();
        if (tab === 'plan')      renderBiblePlan();
        if (tab === 'progress')  renderBibleProgress();
    }

    function populateBibleBookSelect() {
        const sel = document.getElementById('bible-book-select');
        if (!sel) return;
        let lastGroup = '';
        sel.innerHTML = '';
        BIBLE_BOOKS.forEach(b => {
            if (b.group !== lastGroup) {
                const og = document.createElement('optgroup');
                og.label = b.group;
                sel.appendChild(og);
                lastGroup = b.group;
            }
            const opt = document.createElement('option');
            opt.value = b.num;
            opt.textContent = b.name;
            if (b.num === currentBook) opt.selected = true;
            sel.lastChild.appendChild(opt);
        });
    }

    function populateBibleChapterSelect() {
        const sel  = document.getElementById('bible-chapter-select');
        const book = BIBLE_BOOKS.find(b => b.num === currentBook);
        if (!sel || !book) return;
        sel.innerHTML = '';
        for (let c = 1; c <= book.ch; c++) {
            const opt    = document.createElement('option');
            opt.value    = c;
            const isRead = bibleReadChapters.includes(`${currentBook}_${c}`);
            opt.textContent = `Chapitre ${c}${isRead ? ' ✓' : ''}`;
            if (c === currentChapter) opt.selected = true;
            sel.appendChild(opt);
        }
    }

    async function loadBibleChapter() {
        const container = document.getElementById('bible-verses-container');
        const titleEl   = document.getElementById('bible-chapter-title');
        if (!container) return;
        container.innerHTML = '<div class="bible-loading"><i class="fas fa-spinner fa-spin"></i> Chargement…</div>';

        const book    = BIBLE_BOOKS.find(b => b.num === currentBook);
        const readKey = `${currentBook}_${currentChapter}`;
        if (titleEl) titleEl.textContent = `${book ? book.name : ''} — Chapitre ${currentChapter}`;

        // Mark-read button state
        const btnMR = document.getElementById('bible-mark-read');
        if (btnMR) {
            const alreadyRead = bibleReadChapters.includes(readKey);
            btnMR.innerHTML = alreadyRead
                ? '<i class="fas fa-check-circle"></i> Déjà lu'
                : '<i class="fas fa-check-circle"></i> Marquer lu';
            btnMR.className = 'btn btn-sm ' + (alreadyRead ? 'btn-outline' : 'btn-success');
        }

        try {
            const data         = await fetchChapter(currentBook, currentChapter);
            const verses       = data.verses || {};
            const note         = bibleNotes[readKey] || '';
            const verseNumbers = Object.keys(verses).map(Number).sort((a, b) => a - b);
            if (verseNumbers.length === 0) throw new Error('Aucun verset reçu');

            const hlSet  = new Set(bibleHighlights[readKey] || []);
            const favSet = new Set(bibleFavorites.map(f => `${f.book}_${f.chapter}_${f.verse}`));

            container.innerHTML = `
              <div class="bible-chapter" id="bible-chapter-content" style="font-size:var(--bible-font-size,16px)">
                ${verseNumbers.map(vn => {
                    const isHl  = hlSet.has(vn);
                    const isFav = favSet.has(`${currentBook}_${currentChapter}_${vn}`);
                    return `
                  <p class="bible-verse${isHl ? ' verse-highlighted' : ''}" data-verse="${vn}">
                    <span class="bible-verse-num">${vn}</span>
                    <span class="bible-verse-text">${esc(verses[vn].text || '')}</span>
                    <span class="bible-verse-actions">
                      <button class="bva-btn bva-fav${isFav ? ' active' : ''}" data-action="fav"  data-verse="${vn}" title="Ajouter aux favoris"><i class="fas fa-star"></i></button>
                      <button class="bva-btn bva-hl${isHl  ? ' active' : ''}"  data-action="hl"   data-verse="${vn}" title="Surligner"><i class="fas fa-highlighter"></i></button>
                      <button class="bva-btn bva-copy"                          data-action="copy" data-verse="${vn}" title="Copier ce verset"><i class="fas fa-copy"></i></button>
                    </span>
                  </p>`;
                }).join('')}
              </div>
              <div class="bible-note-section">
                <label><i class="fas fa-pen"></i> Mes notes pour ce chapitre</label>
                <textarea id="bible-note-area" class="form-control" rows="4" placeholder="Vos réflexions, remarques, insights…">${esc(note)}</textarea>
                <button id="btn-bible-save-note" class="btn btn-primary btn-sm" style="margin-top:0.5rem">
                    <i class="fas fa-save"></i> Enregistrer les notes
                </button>
              </div>`;

            // Verse action event delegation
            document.getElementById('bible-chapter-content')?.addEventListener('click', e => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const vn   = parseInt(btn.dataset.verse);
                const vtxt = verses[vn] ? verses[vn].text : '';
                const ref  = `${book ? book.name : ''} ${currentChapter}:${vn}`;
                if (btn.dataset.action === 'fav')  toggleFavorite(vn, vtxt, ref, btn);
                if (btn.dataset.action === 'hl')   toggleHighlight(readKey, vn, btn);
                if (btn.dataset.action === 'copy') copyVerse(`«\u202F${vtxt}\u202F» — ${ref}`);
            });

            document.getElementById('btn-bible-save-note')?.addEventListener('click', () => {
                bibleNotes[readKey] = document.getElementById('bible-note-area').value;
                saveBibleNotes();
                showToast('Notes enregistrées !', 'success');
            });

            saveBookmark({ book: currentBook, chapter: currentChapter });
            updateBibleNavButtons();
        } catch (err) {
            container.innerHTML = `
              <div class="empty-state">
                <span class="empty-state-icon"><i class="fas fa-wifi-slash"></i></span>
                Impossible de charger ce chapitre. Vérifiez votre connexion.
                <br><small style="color:var(--text-muted);margin-top:0.5rem;display:block">${err.message}</small>
              </div>`;
        }
    }

    // ── Verse Actions ─────────────────────────────────────────────
    function toggleFavorite(verseNum, text, ref, btn) {
        const idx = bibleFavorites.findIndex(f => f.book === currentBook && f.chapter === currentChapter && f.verse === verseNum);
        if (idx >= 0) {
            bibleFavorites.splice(idx, 1);
            btn.classList.remove('active');
            showToast('Retiré des favoris.', 'info');
        } else {
            bibleFavorites.push({ book: currentBook, chapter: currentChapter, verse: verseNum, text, ref, addedAt: new Date().toISOString() });
            btn.classList.add('active');
            showToast('Ajouté aux favoris ⭐', 'success');
        }
        saveBibleFavorites();
    }

    function toggleHighlight(readKey, verseNum, btn) {
        if (!bibleHighlights[readKey]) bibleHighlights[readKey] = [];
        const arr = bibleHighlights[readKey];
        const idx = arr.indexOf(verseNum);
        if (idx >= 0) {
            arr.splice(idx, 1);
            btn.classList.remove('active');
            btn.closest('.bible-verse').classList.remove('verse-highlighted');
        } else {
            arr.push(verseNum);
            btn.classList.add('active');
            btn.closest('.bible-verse').classList.add('verse-highlighted');
        }
        saveBibleHighlights();
    }

    function copyVerse(text) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('Verset copié !', 'success'))
            .catch(() => {
                const ta = document.createElement('textarea');
                ta.value = text; document.body.appendChild(ta); ta.select();
                document.execCommand('copy'); ta.remove();
                showToast('Verset copié !', 'success');
            });
    }

    function markChapterRead() {
        const key = `${currentBook}_${currentChapter}`;
        const idx = bibleReadChapters.indexOf(key);
        if (idx >= 0) {
            bibleReadChapters.splice(idx, 1);
            showToast('Chapitre marqué non lu.', 'info');
        } else {
            bibleReadChapters.push(key);
            showToast('Chapitre marqué comme lu ! 🎉', 'success');
        }
        saveBibleRead();
        populateBibleChapterSelect();
        const btnMR = document.getElementById('bible-mark-read');
        if (btnMR) {
            const alreadyRead = bibleReadChapters.includes(key);
            btnMR.innerHTML   = alreadyRead ? '<i class="fas fa-check-circle"></i> Déjà lu' : '<i class="fas fa-check-circle"></i> Marquer lu';
            btnMR.className   = 'btn btn-sm ' + (alreadyRead ? 'btn-outline' : 'btn-success');
        }
    }

    function setBibleFontSize(delta) {
        bibleFontSize = Math.max(12, Math.min(26, bibleFontSize + delta));
        document.documentElement.style.setProperty('--bible-font-size', bibleFontSize + 'px');
        saveBibleFontSize();
    }

    // ── Favorites Tab ─────────────────────────────────────────────
    function renderBibleFavorites() {
        const container = document.getElementById('bible-favorites-container');
        if (!container) return;
        if (bibleFavorites.length === 0) {
            container.innerHTML = `<div class="empty-state"><span class="empty-state-icon"><i class="fas fa-star"></i></span>Aucun verset en favori.<br><small>Cliquez sur ⭐ à côté d'un verset pour l'ajouter.</small></div>`;
            return;
        }
        const sorted = [...bibleFavorites].reverse();
        container.innerHTML = `
          <div class="bible-favs-header"><i class="fas fa-star" style="color:#F59E0B"></i> ${bibleFavorites.length} verset${bibleFavorites.length > 1 ? 's' : ''} favori${bibleFavorites.length > 1 ? 's' : ''}</div>
          <div class="bible-favs-list">
            ${sorted.map((f, i) => `
              <div class="bible-fav-card">
                <div class="bible-fav-ref"><i class="fas fa-bookmark" style="color:#A78BFA"></i> ${esc(f.ref)}</div>
                <blockquote class="bible-fav-text">«\u202F${esc(f.text)}\u202F»</blockquote>
                <div class="bible-fav-actions">
                  <button class="btn btn-sm btn-outline" onclick="Spiritual.goToFav(${f.book},${f.chapter})"><i class="fas fa-book-open"></i> Lire</button>
                  <button class="btn btn-sm btn-outline" onclick="Spiritual.copyFav(${bibleFavorites.length - 1 - i})"><i class="fas fa-copy"></i> Copier</button>
                  <button class="btn btn-sm btn-danger-outline" onclick="Spiritual.removeFavByIndex(${bibleFavorites.length - 1 - i})"><i class="fas fa-trash"></i></button>
                </div>
              </div>`).join('')}
          </div>`;
    }

    function goToFav(book, chapter) {
        currentBook    = book;
        currentChapter = chapter;
        populateBibleBookSelect();
        populateBibleChapterSelect();
        switchBibleTab('read');
        loadBibleChapter();
    }

    function removeFavByIndex(idx) {
        if (idx >= 0 && idx < bibleFavorites.length) {
            bibleFavorites.splice(idx, 1);
            saveBibleFavorites();
            renderBibleFavorites();
            showToast('Retiré des favoris.', 'info');
        }
    }

    function copyFav(idx) {
        const f = bibleFavorites[idx];
        if (f) copyVerse(`«\u202F${f.text}\u202F» — ${f.ref}`);
    }

    // ── Annual Plan Tab ───────────────────────────────────────────
    function renderBiblePlan() {
        const container = document.getElementById('bible-plan-container');
        if (!container) return;

        // Build flat list of all 1189 chapters
        const allChaps = [];
        BIBLE_BOOKS.forEach(b => {
            for (let c = 1; c <= b.ch; c++) allChaps.push({ book: b.num, chapter: c, bookName: b.name });
        });
        const total     = allChaps.length; // 1189
        const totalDays = 365;

        function chaptersForDay(d) {
            const s = Math.floor(d * total / totalDays);
            const e = Math.floor((d + 1) * total / totalDays);
            return allChaps.slice(s, e);
        }

        const now         = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 0);
        const dayOfYear   = Math.floor((now - startOfYear) / 86400000); // 1-indexed
        const todayIdx    = Math.min(dayOfYear - 1, totalDays - 1);

        let completedDays = 0;
        for (let d = 0; d <= todayIdx; d++) {
            if (chaptersForDay(d).every(c => bibleReadChapters.includes(`${c.book}_${c.chapter}`))) completedDays++;
        }
        const pct = dayOfYear > 0 ? Math.round((completedDays / (todayIdx + 1)) * 100) : 0;

        // Show window of 7 days centred on today
        const startD = Math.max(0, todayIdx - 2);
        const endD   = Math.min(totalDays - 1, todayIdx + 4);
        const daySlice = [];
        for (let d = startD; d <= endD; d++) daySlice.push(d);

        container.innerHTML = `
          <div class="module-card bible-plan-card">
            <div class="module-card-body">
              <div class="bible-plan-progress-row">
                <span><i class="fas fa-calendar-check"></i> Jours complétés : <strong>${completedDays}</strong> / ${todayIdx + 1}</span>
                <span class="badge badge-primary">${pct}%</span>
              </div>
              <div class="bible-plan-bar-wrap"><div class="bible-plan-bar" style="width:${pct}%"></div></div>
            </div>
          </div>
          <div class="bible-plan-days">
            ${daySlice.map(d => {
                const chaps   = chaptersForDay(d);
                const isToday = d === todayIdx;
                const isPast  = d < todayIdx;
                const done    = chaps.every(c => bibleReadChapters.includes(`${c.book}_${c.chapter}`));
                const date    = new Date(now.getFullYear(), 0, d + 1);
                const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                return `
                  <div class="bible-plan-day${isToday ? ' plan-today' : ''}${done ? ' plan-done' : ''}">
                    <div class="plan-day-header">
                      <span class="plan-day-label">${isToday ? '📅 Aujourd\'hui' : dateStr}</span>
                      ${done ? '<span class="badge badge-success">✓ Complété</span>'
                             : isPast ? '<span class="badge badge-warning">En retard</span>' : ''}
                    </div>
                    <div class="plan-day-chapters">
                      ${chaps.map(c => {
                          const isRead = bibleReadChapters.includes(`${c.book}_${c.chapter}`);
                          return `<button class="plan-chap-btn${isRead ? ' plan-chap-read' : ''}" onclick="Spiritual.goToFav(${c.book},${c.chapter})">${c.bookName} ${c.chapter}</button>`;
                      }).join('')}
                    </div>
                  </div>`;
            }).join('')}
          </div>`;
    }

    // ── Progress Tab ──────────────────────────────────────────────
    function renderBibleProgress() {
        const container = document.getElementById('bible-progress-container');
        if (!container) return;

        const totalChapters  = BIBLE_BOOKS.reduce((s, b) => s + b.ch, 0); // 1189
        const readCount      = bibleReadChapters.length;
        const pct            = Math.round((readCount / totalChapters) * 100);
        const booksCompleted = BIBLE_BOOKS.filter(b => { for (let c = 1; c <= b.ch; c++) if (!bibleReadChapters.includes(`${b.num}_${c}`)) return false; return true; });
        const otBooks        = BIBLE_BOOKS.filter(b => b.num <= 39);
        const ntBooks        = BIBLE_BOOKS.filter(b => b.num >= 40);

        function bookPct(b) {
            let r = 0;
            for (let c = 1; c <= b.ch; c++) if (bibleReadChapters.includes(`${b.num}_${c}`)) r++;
            return Math.round((r / b.ch) * 100);
        }

        function booksGrid(list) {
            return list.map(b => {
                const p = bookPct(b);
                return `
                  <div class="book-prog-item" title="${b.name}: ${p}% lu">
                    <span class="book-prog-name">${b.name}</span>
                    <div class="book-prog-bar-wrap"><div class="book-prog-bar" style="width:${p}%"></div></div>
                    <span class="book-prog-pct">${p}%</span>
                  </div>`;
            }).join('');
        }

        container.innerHTML = `
          <div class="stats-grid" style="margin-bottom:1.5rem">
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon" style="color:#A78BFA"><i class="fas fa-book-open"></i></div><div class="stat-info"><span class="stat-label">Chapitres lus</span><span class="stat-value">${readCount}<small style="font-size:0.65em;color:var(--text-muted)"> / ${totalChapters}</small></span></div></div>
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon" style="color:#22C55E"><i class="fas fa-check-double"></i></div><div class="stat-info"><span class="stat-label">Livres terminés</span><span class="stat-value">${booksCompleted.length}<small style="font-size:0.65em;color:var(--text-muted)"> / 66</small></span></div></div>
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon" style="color:#F59E0B"><i class="fas fa-percent"></i></div><div class="stat-info"><span class="stat-label">Bible complétée</span><span class="stat-value">${pct}%</span></div></div>
            <div class="stat-card"><div class="stat-card-bg"></div><div class="stat-icon" style="color:#EC4899"><i class="fas fa-star"></i></div><div class="stat-info"><span class="stat-label">Versets favoris</span><span class="stat-value">${bibleFavorites.length}</span></div></div>
          </div>
          <div class="bible-overall-bar-wrap">
            <div class="bible-overall-bar-label"><span>Progression globale</span><span>${pct}%</span></div>
            <div class="bible-plan-bar-wrap"><div class="bible-plan-bar" style="width:${pct}%;background:linear-gradient(90deg,#7C3AED,#A78BFA)"></div></div>
          </div>
          <div class="bible-progress-section">
            <h4><i class="fas fa-landmark"></i> Ancien Testament</h4>
            <div class="bible-books-grid">${booksGrid(otBooks)}</div>
          </div>
          <div class="bible-progress-section" style="margin-top:1.5rem">
            <h4><i class="fas fa-cross"></i> Nouveau Testament</h4>
            <div class="bible-books-grid">${booksGrid(ntBooks)}</div>
          </div>`;
    }

    function updateBibleNavButtons() {
        const book    = BIBLE_BOOKS.find(b => b.num === currentBook);
        const btnPrev = document.getElementById('bible-btn-prev');
        const btnNext = document.getElementById('bible-btn-next');
        if (btnPrev) btnPrev.disabled = (currentBook === 1 && currentChapter === 1);
        if (btnNext) btnNext.disabled = (currentBook === 66 && currentChapter === (book ? book.ch : 1));
    }

    function bindBibleControls() {
        // Tabs
        document.querySelectorAll('.bible-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => switchBibleTab(btn.dataset.tab));
        });

        // Font size
        document.getElementById('bible-font-dec')?.addEventListener('click', () => setBibleFontSize(-2));
        document.getElementById('bible-font-inc')?.addEventListener('click', () => setBibleFontSize(+2));

        // Mark chapter read
        document.getElementById('bible-mark-read')?.addEventListener('click', markChapterRead);

        // Book / chapter navigation
        document.getElementById('bible-book-select')?.addEventListener('change', async e => {
            currentBook    = parseInt(e.target.value);
            currentChapter = 1;
            populateBibleChapterSelect();
            await loadBibleChapter();
        });

        document.getElementById('bible-chapter-select')?.addEventListener('change', async e => {
            currentChapter = parseInt(e.target.value);
            await loadBibleChapter();
        });

        document.getElementById('bible-btn-prev')?.addEventListener('click', async () => {
            if (currentChapter > 1) {
                currentChapter--;
            } else if (currentBook > 1) {
                currentBook--;
                const book = BIBLE_BOOKS.find(b => b.num === currentBook);
                currentChapter = book ? book.ch : 1;
            }
            populateBibleBookSelect();
            populateBibleChapterSelect();
            await loadBibleChapter();
        });

        document.getElementById('bible-btn-next')?.addEventListener('click', async () => {
            const book = BIBLE_BOOKS.find(b => b.num === currentBook);
            if (currentChapter < (book ? book.ch : 1)) {
                currentChapter++;
            } else if (currentBook < 66) {
                currentBook++;
                currentChapter = 1;
            }
            populateBibleBookSelect();
            populateBibleChapterSelect();
            await loadBibleChapter();
        });

        // Search
        document.getElementById('bible-search-btn')?.addEventListener('click', () => {
            const q = (document.getElementById('bible-search-input')?.value || '').toLowerCase().trim();
            if (!q) return;
            document.querySelectorAll('.bible-verse').forEach(el => {
                const txt = el.querySelector('.bible-verse-text')?.textContent.toLowerCase() || '';
                el.style.display = txt.includes(q) ? '' : 'none';
            });
            document.getElementById('bible-search-clear').style.display = 'inline-flex';
        });

        document.getElementById('bible-search-clear')?.addEventListener('click', () => {
            document.querySelectorAll('.bible-verse').forEach(el => el.style.display = '');
            document.getElementById('bible-search-input').value = '';
            document.getElementById('bible-search-clear').style.display = 'none';
        });

        document.getElementById('bible-search-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('bible-search-btn')?.click();
        });
    }

    // ──────────────────────────────────────────────────────────────
    //  RENDER: PRAYER JOURNAL
    // ──────────────────────────────────────────────────────────────
    async function renderPrayer() {
        loadData();
        updatePrayerStats();
        renderPrayerList();
        bindPrayerEvents();
    }

    function updatePrayerStats() {
        const total    = prayers.length;
        const answered = prayers.filter(p => p.status === 'answered').length;
        const active   = prayers.filter(p => p.status === 'active').length;
        const rate     = total > 0 ? Math.round((answered / total) * 100) : 0;
        setStat('prayer-stat-total',    total);
        setStat('prayer-stat-answered', answered);
        setStat('prayer-stat-active',   active);
        setStat('prayer-stat-rate',     rate + '%');
    }

    function renderPrayerList(filter = 'all') {
        const container = document.getElementById('prayer-list');
        if (!container) return;
        let list = [...prayers].reverse();
        if (filter !== 'all') list = list.filter(p => p.status === filter);

        container.innerHTML = list.length === 0
            ? `<div class="empty-state" id="prayer-empty"><span class="empty-state-icon"><i class="fas fa-pray"></i></span>Aucune prière enregistrée.<br><small>Commencez votre journal de prière.</small></div>`
            : list.map(p => `
                <div class="prayer-card" data-id="${p.id}">
                    <div class="prayer-card-header">
                        <span class="prayer-icon"><i class="fas fa-cross"></i></span>
                        <div class="prayer-card-info">
                            <strong>${esc(p.title)}</strong>
                            <span class="prayer-date">${p.date} · ${PRAYER_CATS[p.category] || p.category}</span>
                        </div>
                        ${prayerStatBadge(p.status)}
                    </div>
                    ${p.text ? `<p class="prayer-text">${esc(p.text)}</p>` : ''}
                    <div class="prayer-actions">
                        ${p.status !== 'answered' ? `<button class="btn btn-sm btn-success" onclick="Spiritual.markAnswered('${p.id}')"><i class="fas fa-check"></i> Exaucée</button>` : ''}
                        <button class="btn btn-sm btn-outline" onclick="Spiritual.editPrayer('${p.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger-outline" onclick="Spiritual.deletePrayer('${p.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`).join('');
    }

    function bindPrayerEvents() {
        document.getElementById('btn-add-prayer')?.addEventListener('click', () => openPrayerModal());
        document.getElementById('prayer-form')?.addEventListener('submit', savePrayerForm);
        document.getElementById('prayer-filter-status')?.addEventListener('change', e => renderPrayerList(e.target.value));
    }

    function openPrayerModal(prayer = null) {
        const modal = document.getElementById('modal-prayer');
        if (!modal) return;
        const isEdit = !!prayer;
        document.getElementById('modal-prayer-title').innerHTML = `<i class="fas fa-pray"></i> ${isEdit ? 'Modifier' : 'Nouvelle'} prière`;
        document.getElementById('prayer-form-id').value       = prayer ? prayer.id : '';
        document.getElementById('prayer-form-title').value    = prayer ? prayer.title : '';
        document.getElementById('prayer-form-text').value     = prayer ? prayer.text : '';
        document.getElementById('prayer-form-category').value = prayer ? prayer.category : 'supplication';
        document.getElementById('prayer-form-status').value   = prayer ? prayer.status : 'active';
        document.getElementById('prayer-form-date').value     = prayer ? prayer.date : new Date().toISOString().slice(0,10);
        modal.classList.add('active');
    }

    function savePrayerForm(e) {
        e.preventDefault();
        const id    = document.getElementById('prayer-form-id').value;
        const d = {
            id:       id || genId(),
            title:    document.getElementById('prayer-form-title').value.trim(),
            text:     document.getElementById('prayer-form-text').value.trim(),
            category: document.getElementById('prayer-form-category').value,
            status:   document.getElementById('prayer-form-status').value,
            date:     document.getElementById('prayer-form-date').value,
        };
        if (id) {
            const idx = prayers.findIndex(p => p.id === id);
            if (idx >= 0) prayers[idx] = d;
        } else {
            prayers.push(d);
        }
        savePrayers();
        closeModal('modal-prayer');
        updatePrayerStats();
        renderPrayerList();
        showToast(id ? 'Prière modifiée.' : 'Prière ajoutée.', 'success');
    }

    function markAnswered(id) {
        const p = prayers.find(p => p.id === id);
        if (p) { p.status = 'answered'; savePrayers(); updatePrayerStats(); renderPrayerList(); showToast('Prière marquée comme exaucée ! 🙌', 'success'); }
    }

    function editPrayer(id) {
        const p = prayers.find(p => p.id === id);
        if (p) openPrayerModal(p);
    }

    function deletePrayer(id) {
        if (!confirm('Supprimer cette prière ?')) return;
        prayers = prayers.filter(p => p.id !== id);
        savePrayers(); updatePrayerStats(); renderPrayerList();
        showToast('Prière supprimée.', 'info');
    }

    // ──────────────────────────────────────────────────────────────
    //  RENDER: GRATITUDE JOURNAL
    // ──────────────────────────────────────────────────────────────
    async function renderGratitude() {
        loadData();
        updateGratitudeStats();
        renderGratitudeList();
        bindGratitudeEvents();
    }

    function updateGratitudeStats() {
        const total    = gratitudes.length;
        const today    = new Date().toISOString().slice(0, 10);
        const todayCount = gratitudes.filter(g => g.date === today).length;

        const days  = [...new Set(gratitudes.map(g => g.date))].sort().reverse();
        let streak  = 0;
        for (let i = 0; i < days.length; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            if (days[i] === d.toISOString().slice(0, 10)) streak++;
            else break;
        }

        setStat('gratitude-stat-total',   total);
        setStat('gratitude-stat-today',   todayCount);
        setStat('gratitude-stat-streak',  streak + ' j');
        setStat('gratitude-stat-days',    days.length);
    }

    function setStat(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function renderGratitudeList(filterDate = '') {
        const container = document.getElementById('gratitude-list');
        if (!container) return;
        let list = [...gratitudes].reverse();
        if (filterDate) list = list.filter(g => g.date === filterDate);

        // Group by date
        const groups = {};
        list.forEach(g => { if (!groups[g.date]) groups[g.date] = []; groups[g.date].push(g); });

        const dates = Object.keys(groups).sort().reverse();
        container.innerHTML = dates.length === 0
            ? `<div class="empty-state"><span class="empty-state-icon">🙏</span>Aucune gratitude enregistrée.<br><small>Commencez votre pratique de gratitude.</small></div>`
            : dates.map(date => `
                <div class="gratitude-day-group">
                    <div class="grat-day-header"><i class="fas fa-calendar-day"></i> ${formatDateFR(date)}</div>
                    ${groups[date].map(g => `
                        <div class="gratitude-entry" data-id="${g.id}">
                            <span class="grat-emoji">${g.emoji || '🙏'}</span>
                            <div class="grat-content">
                                <p>${esc(g.text)}</p>
                                ${g.detail ? `<small>${esc(g.detail)}</small>` : ''}
                            </div>
                            <div class="grat-actions">
                                <button class="btn-icon-sm" onclick="Spiritual.editGratitude('${g.id}')" title="Modifier"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon-sm btn-icon-danger" onclick="Spiritual.deleteGratitude('${g.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>`).join('')}
                </div>`).join('');
    }

    function bindGratitudeEvents() {
        document.getElementById('btn-add-gratitude')?.addEventListener('click', () => openGratitudeModal());
        document.getElementById('gratitude-form')?.addEventListener('submit', saveGratitudeForm);
        document.getElementById('gratitude-filter-date')?.addEventListener('change', e => renderGratitudeList(e.target.value));
        // Quick emoji buttons
        document.querySelectorAll('.emoji-pick').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.emoji-pick').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('gratitude-form-emoji').value = btn.dataset.emoji;
            });
        });
    }

    function openGratitudeModal(gratitude = null) {
        const modal = document.getElementById('modal-gratitude');
        if (!modal) return;
        const isEdit = !!gratitude;
        document.getElementById('modal-gratitude-title').innerHTML = `🙏 ${isEdit ? 'Modifier' : 'Nouvelle'} gratitude`;
        document.getElementById('gratitude-form-id').value     = gratitude ? gratitude.id : '';
        document.getElementById('gratitude-form-text').value   = gratitude ? gratitude.text : '';
        document.getElementById('gratitude-form-detail').value = gratitude ? (gratitude.detail || '') : '';
        document.getElementById('gratitude-form-emoji').value  = gratitude ? (gratitude.emoji || '🙏') : '🙏';
        document.getElementById('gratitude-form-date').value   = gratitude ? gratitude.date : new Date().toISOString().slice(0, 10);
        // Reset emoji picker
        document.querySelectorAll('.emoji-pick').forEach(b => {
            b.classList.toggle('selected', b.dataset.emoji === (gratitude ? gratitude.emoji : '🙏'));
        });
        modal.classList.add('active');
    }

    function saveGratitudeForm(e) {
        e.preventDefault();
        const id = document.getElementById('gratitude-form-id').value;
        const d = {
            id:     id || genId(),
            text:   document.getElementById('gratitude-form-text').value.trim(),
            detail: document.getElementById('gratitude-form-detail').value.trim(),
            emoji:  document.getElementById('gratitude-form-emoji').value || '🙏',
            date:   document.getElementById('gratitude-form-date').value,
        };
        if (id) {
            const idx = gratitudes.findIndex(g => g.id === id);
            if (idx >= 0) gratitudes[idx] = d;
        } else {
            gratitudes.push(d);
        }
        saveGratitudes();
        closeModal('modal-gratitude');
        updateGratitudeStats();
        renderGratitudeList();
        showToast('Gratitude enregistrée. 🙏', 'success');
    }

    function editGratitude(id) {
        const g = gratitudes.find(g => g.id === id);
        if (g) openGratitudeModal(g);
    }

    function deleteGratitude(id) {
        if (!confirm('Supprimer cette entrée ?')) return;
        gratitudes = gratitudes.filter(g => g.id !== id);
        saveGratitudes(); updateGratitudeStats(); renderGratitudeList();
        showToast('Entrée supprimée.', 'info');
    }

    // ── Utility ────────────────────────────────────────────────────
    function esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function formatDateFR(iso) {
        const d = new Date(iso + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    }

    function closeModal(id) {
        document.getElementById(id)?.classList.remove('active');
    }

    function showToast(msg, type = 'success') {
        const tc = document.getElementById('toast-container');
        if (!tc) return;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span><button class="toast-close"><i class="fas fa-times"></i></button>`;
        tc.appendChild(t);
        t.querySelector('.toast-close').addEventListener('click', () => t.remove());
        setTimeout(() => t.remove(), 4000);
    }

    return {
        renderSpiritual,
        renderBible,
        renderPrayer,
        renderGratitude,
        markAnswered,
        editPrayer,
        deletePrayer,
        editGratitude,
        deleteGratitude,
        // Bible public methods (called from inline onclick)
        goToFav,
        removeFavByIndex,
        copyFav,
    };
})();
