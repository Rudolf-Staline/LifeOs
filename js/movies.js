/* ===================================================================
   movies.js — Films & Séries Module
   Watchlist, suivi de visionnage, notes
   =================================================================== */

const Movies = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapMovie(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            type: row.type || 'movie',              // movie | series | documentary | anime
            genre: row.genre || 'autre',
            year: parseInt(row.year || 0),
            director: row.director || '',
            platform: row.platform || '',            // netflix, prime, disney, cinema, autre
            status: row.status || 'to-watch',        // to-watch | watching | watched | abandoned
            rating: parseInt(row.rating || 0),
            season: parseInt(row.season || 0),
            episode: parseInt(row.episode || 0),
            totalSeasons: parseInt(row.total_seasons || row.totalSeasons || 0),
            notes: row.notes || '',
            favorite: !!row.favorite,
            watchDate: row.watch_date || row.watchDate || '',
            poster: row.poster || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-movies-v1';
    let useLocalStorage = false;
    let localMovies = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('movies').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Movies: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Movies: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Movies: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal()  { try { localMovies = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localMovies = []; } }
    function saveLocal()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(localMovies)); }
    function genId()      { return 'mv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    async function getAll(filter) {
        let items;
        if (useLocalStorage) {
            items = localMovies.map(m => ({...m}));
        } else {
            let query = supabaseClient.from('movies').select('*').eq('user_id', getUserId());
            if (filter?.status) query = query.eq('status', filter.status);
            query = query.order('created_at', { ascending: false });
            const { data, error } = await query;
            items = error ? [] : data.map(mapMovie);
        }
        if (filter?.status && useLocalStorage) items = items.filter(m => m.status === filter.status);
        if (filter?.type) items = items.filter(m => m.type === filter.type);
        return items;
    }

    async function getById(id) {
        if (useLocalStorage) return localMovies.find(m => m.id === id) || null;
        const { data, error } = await supabaseClient.from('movies').select('*')
            .eq('id', id).eq('user_id', getUserId()).single();
        return error ? null : mapMovie(data);
    }

    async function add(movie) {
        const item = {
            title: movie.title,
            type: movie.type || 'movie',
            genre: movie.genre || 'autre',
            year: parseInt(movie.year || 0),
            director: movie.director || '',
            platform: movie.platform || '',
            status: movie.status || 'to-watch',
            rating: parseInt(movie.rating || 0),
            season: parseInt(movie.season || 0),
            episode: parseInt(movie.episode || 0),
            total_seasons: parseInt(movie.totalSeasons || 0),
            notes: movie.notes || '',
            favorite: !!movie.favorite,
            watch_date: movie.watchDate || '',
            poster: movie.poster || ''
        };
        if (useLocalStorage) {
            const local = { id: genId(), ...item, totalSeasons: item.total_seasons, watchDate: item.watch_date, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            localMovies.push(local); saveLocal(); return local;
        }
        item.user_id = getUserId();
        const { data, error } = await supabaseClient.from('movies').insert(item).select().single();
        return error ? null : mapMovie(data);
    }

    async function update(id, changes) {
        const mapped = {};
        if (changes.title !== undefined)        mapped.title = changes.title;
        if (changes.type !== undefined)         mapped.type = changes.type;
        if (changes.genre !== undefined)        mapped.genre = changes.genre;
        if (changes.year !== undefined)         mapped.year = parseInt(changes.year);
        if (changes.director !== undefined)     mapped.director = changes.director;
        if (changes.platform !== undefined)     mapped.platform = changes.platform;
        if (changes.status !== undefined)       mapped.status = changes.status;
        if (changes.rating !== undefined)       mapped.rating = parseInt(changes.rating);
        if (changes.season !== undefined)       mapped.season = parseInt(changes.season);
        if (changes.episode !== undefined)      mapped.episode = parseInt(changes.episode);
        if (changes.totalSeasons !== undefined) mapped.total_seasons = parseInt(changes.totalSeasons);
        if (changes.notes !== undefined)        mapped.notes = changes.notes;
        if (changes.favorite !== undefined)     mapped.favorite = changes.favorite;
        if (changes.watchDate !== undefined)    mapped.watch_date = changes.watchDate;
        if (changes.poster !== undefined)       mapped.poster = changes.poster;

        if (useLocalStorage) {
            const idx = localMovies.findIndex(m => m.id === id);
            if (idx === -1) return null;
            Object.assign(localMovies[idx], changes, { updatedAt: new Date().toISOString() });
            saveLocal(); return localMovies[idx];
        }
        mapped.updated_at = new Date().toISOString();
        const { data, error } = await supabaseClient.from('movies').update(mapped)
            .eq('id', id).eq('user_id', getUserId()).select().single();
        return error ? null : mapMovie(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            localMovies = localMovies.filter(m => m.id !== id);
            saveLocal(); return true;
        }
        const { error } = await supabaseClient.from('movies').delete()
            .eq('id', id).eq('user_id', getUserId());
        return !error;
    }

    async function toggleFavorite(id) {
        const movie = await getById(id);
        if (!movie) return null;
        return await update(id, { favorite: !movie.favorite });
    }

    // ===== Helpers =====
    const TYPES = [
        { value: 'movie',       label: 'Film',          icon: '🎬', color: '#3B82F6' },
        { value: 'series',      label: 'Série',         icon: '📺', color: '#A78BFA' },
        { value: 'documentary', label: 'Documentaire',  icon: '🎥', color: '#06B6D4' },
        { value: 'anime',       label: 'Anime',         icon: '🎌', color: '#F59E0B' }
    ];

    const GENRES = [
        { value: 'action',    label: 'Action' },       { value: 'comedie',   label: 'Comédie' },
        { value: 'drame',     label: 'Drame' },        { value: 'horreur',   label: 'Horreur' },
        { value: 'romance',   label: 'Romance' },      { value: 'sf',        label: 'Sci-Fi' },
        { value: 'thriller',  label: 'Thriller' },     { value: 'animation', label: 'Animation' },
        { value: 'fantastique', label: 'Fantastique' }, { value: 'aventure',  label: 'Aventure' },
        { value: 'crime',     label: 'Crime' },        { value: 'historique', label: 'Historique' },
        { value: 'musical',   label: 'Musical' },      { value: 'guerre',    label: 'Guerre' },
        { value: 'autre',     label: 'Autre' }
    ];

    const PLATFORMS = [
        { value: 'netflix',  label: 'Netflix',       icon: '🔴' },
        { value: 'prime',    label: 'Prime Video',   icon: '🟦' },
        { value: 'disney',   label: 'Disney+',       icon: '🏰' },
        { value: 'hbo',      label: 'HBO / Max',     icon: '🟣' },
        { value: 'apple',    label: 'Apple TV+',     icon: '🍎' },
        { value: 'cinema',   label: 'Cinéma',        icon: '🎞️' },
        { value: 'autre',    label: 'Autre',         icon: '📡' }
    ];

    const STATUSES = [
        { value: 'to-watch',  label: 'À voir',    icon: '📋', color: '#F59E0B' },
        { value: 'watching',  label: 'En cours',   icon: '▶️', color: '#3B82F6' },
        { value: 'watched',   label: 'Vu',         icon: '✅', color: '#22C55E' },
        { value: 'abandoned', label: 'Abandonné',  icon: '❌', color: '#EF4444' }
    ];

    function getTypeInfo(val)    { return TYPES.find(t => t.value === val) || TYPES[0]; }
    function getStatusInfo(val)  { return STATUSES.find(s => s.value === val) || STATUSES[0]; }
    function getPlatformInfo(val){ return PLATFORMS.find(p => p.value === val) || PLATFORMS[PLATFORMS.length - 1]; }

    function renderStars(rating) {
        let s = '';
        for (let i = 1; i <= 5; i++) s += i <= rating ? '⭐' : '☆';
        return s;
    }

    async function getStats() {
        const all = await getAll();
        const watched = all.filter(m => m.status === 'watched').length;
        const toWatch = all.filter(m => m.status === 'to-watch').length;
        const avgRating = all.filter(m => m.rating > 0).length > 0
            ? (all.filter(m => m.rating > 0).reduce((s, m) => s + m.rating, 0) / all.filter(m => m.rating > 0).length).toFixed(1) : '—';
        return { total: all.length, watched, toWatch, avgRating };
    }

    function exportCSV(movies) {
        const headers = ['Titre', 'Type', 'Genre', 'Année', 'Réalisateur', 'Plateforme', 'Statut', 'Note', 'Date vue'];
        const rows = movies.map(m => [m.title, m.type, m.genre, m.year, m.director, m.platform, m.status, m.rating, m.watchDate]);
        return [headers, ...rows].map(r => r.join(',')).join('\n');
    }

    return {
        initStorage, getAll, getById, add, update, remove,
        toggleFavorite, getTypeInfo, getStatusInfo, getPlatformInfo,
        renderStars, getStats, exportCSV, TYPES, GENRES, PLATFORMS, STATUSES
    };
})();
