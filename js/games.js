/* ===================================================================
   games.js — Jeux Vidéo Module
   Collection de jeux, progression, temps de jeu, notes
   =================================================================== */

const Games = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapGame(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            platform: row.platform || 'pc',
            genre: row.genre || 'action',
            status: row.status || 'backlog',
            progress: parseInt(row.progress || 0),
            hoursPlayed: parseFloat(row.hours_played || row.hoursPlayed || 0),
            rating: parseInt(row.rating || 0),
            releaseYear: parseInt(row.release_year || row.releaseYear || 0),
            developer: row.developer || '',
            publisher: row.publisher || '',
            price: parseFloat(row.price || 0),
            startDate: row.start_date || row.startDate || '',
            completedDate: row.completed_date || row.completedDate || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-games-v1';
    let useLocalStorage = false;
    let localGames = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('games').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localGames = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localGames = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localGames)); }

    async function getAll() {
        if (useLocalStorage) return localGames.map(mapGame);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('games').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapGame);
    }

    async function getById(id) {
        if (useLocalStorage) { const g = localGames.find(x => x.id === id); return g ? mapGame(g) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('games').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapGame(data);
    }

    async function add(game) {
        if (useLocalStorage) {
            const ng = { ...game, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localGames.unshift(ng); saveLocal(); return mapGame(ng);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: game.title, platform: game.platform || 'pc',
            genre: game.genre || 'action', status: game.status || 'backlog',
            progress: game.progress || 0, hours_played: game.hoursPlayed || 0,
            rating: game.rating || 0, release_year: game.releaseYear || null,
            developer: game.developer || '', publisher: game.publisher || '',
            price: game.price || 0, start_date: game.startDate || null,
            completed_date: game.completedDate || null, notes: game.notes || '',
            favorite: game.favorite || false
        };
        const { data, error } = await supabaseClient.from('games').insert(row).select().single();
        return error ? null : mapGame(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localGames.findIndex(x => x.id === id); if (idx < 0) return null;
            localGames[idx] = { ...localGames[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapGame(localGames[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.platform !== undefined) row.platform = updates.platform;
        if (updates.genre !== undefined) row.genre = updates.genre;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.progress !== undefined) row.progress = updates.progress;
        if (updates.hoursPlayed !== undefined) row.hours_played = updates.hoursPlayed;
        if (updates.rating !== undefined) row.rating = updates.rating;
        if (updates.releaseYear !== undefined) row.release_year = updates.releaseYear;
        if (updates.developer !== undefined) row.developer = updates.developer;
        if (updates.publisher !== undefined) row.publisher = updates.publisher;
        if (updates.price !== undefined) row.price = updates.price;
        if (updates.startDate !== undefined) row.start_date = updates.startDate;
        if (updates.completedDate !== undefined) row.completed_date = updates.completedDate;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('games').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapGame(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localGames = localGames.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('games').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const g = await getById(id); if (!g) return null; return update(id, { favorite: !g.favorite }); }

    const PLATFORMS = [
        { value: 'pc', label: 'PC', icon: '💻' },
        { value: 'ps5', label: 'PS5', icon: '🎮' },
        { value: 'ps4', label: 'PS4', icon: '🎮' },
        { value: 'xbox', label: 'Xbox', icon: '🟩' },
        { value: 'switch', label: 'Switch', icon: '🕹️' },
        { value: 'mobile', label: 'Mobile', icon: '📱' },
        { value: 'retro', label: 'Rétro', icon: '👾' },
        { value: 'autre', label: 'Autre', icon: '🎯' }
    ];

    const GENRES = [
        { value: 'action', label: 'Action', icon: '⚔️' },
        { value: 'rpg', label: 'RPG', icon: '🗡️' },
        { value: 'fps', label: 'FPS', icon: '🔫' },
        { value: 'adventure', label: 'Aventure', icon: '🗺️' },
        { value: 'strategy', label: 'Stratégie', icon: '♟️' },
        { value: 'sport', label: 'Sport', icon: '⚽' },
        { value: 'racing', label: 'Course', icon: '🏎️' },
        { value: 'puzzle', label: 'Puzzle', icon: '🧩' },
        { value: 'simulation', label: 'Simulation', icon: '🏙️' },
        { value: 'horror', label: 'Horreur', icon: '👻' },
        { value: 'indie', label: 'Indé', icon: '🌟' },
        { value: 'autre', label: 'Autre', icon: '🎮' }
    ];

    const STATUSES = [
        { value: 'backlog', label: 'Backlog', icon: '📚', color: '#64748B' },
        { value: 'playing', label: 'En cours', icon: '▶️', color: '#6366F1' },
        { value: 'completed', label: 'Terminé', icon: '✅', color: '#22C55E' },
        { value: 'platinum', label: 'Platine', icon: '🏆', color: '#F59E0B' },
        { value: 'dropped', label: 'Abandonné', icon: '❌', color: '#EF4444' },
        { value: 'wishlist', label: 'Wishlist', icon: '⭐', color: '#A78BFA' }
    ];

    function getPlatformInfo(val) { return PLATFORMS.find(p => p.value === val) || PLATFORMS[PLATFORMS.length - 1]; }
    function getGenreInfo(val) { return GENRES.find(g => g.value === val) || GENRES[GENRES.length - 1]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }

    function formatHours(h) {
        if (h < 1) return Math.round(h * 60) + ' min';
        return h.toFixed(1) + 'h';
    }

    async function getStats() {
        const all = await getAll();
        const playing = all.filter(g => g.status === 'playing').length;
        const completed = all.filter(g => g.status === 'completed' || g.status === 'platinum').length;
        const totalHours = all.reduce((s, g) => s + g.hoursPlayed, 0);
        return { total: all.length, playing, completed, totalHours: totalHours.toFixed(1) };
    }

    function exportCSV(games) {
        const header = 'Titre,Plateforme,Genre,Statut,Progression,Heures,Note,Prix\n';
        const rows = games.map(g => `"${g.title}","${g.platform}","${g.genre}","${g.status}",${g.progress},${g.hoursPlayed},${g.rating},${g.price}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'jeux.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, formatHours, getPlatformInfo, getGenreInfo, getStatusInfo,
        PLATFORMS, GENRES, STATUSES
    };
})();
