/* ===================================================================
   challenges.js — Défis Personnels Module
   Suivi de défis avec progression, objectifs et récompenses
   =================================================================== */

const Challenges = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapChallenge(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            description: row.description || '',
            category: row.category || 'personal',
            status: row.status || 'active',
            difficulty: row.difficulty || 'medium',
            startDate: row.start_date || row.startDate || new Date().toISOString().split('T')[0],
            endDate: row.end_date || row.endDate || '',
            progress: row.progress || 0,
            target: row.target || '',
            reward: row.reward || '',
            tags: row.tags || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-challenges-v1';
    let useLocalStorage = false;
    let localItems = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('challenges').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localItems = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems)); }

    async function getAll() {
        if (useLocalStorage) return localItems.map(mapChallenge);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('challenges').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapChallenge);
    }

    async function getById(id) {
        if (useLocalStorage) { const i = localItems.find(x => x.id === id); return i ? mapChallenge(i) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('challenges').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapChallenge(data);
    }

    async function add(item) {
        if (useLocalStorage) {
            const ni = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localItems.unshift(ni); saveLocal(); return mapChallenge(ni);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: item.title, description: item.description || '',
            category: item.category || 'personal', status: item.status || 'active',
            difficulty: item.difficulty || 'medium',
            start_date: item.startDate || new Date().toISOString().split('T')[0],
            end_date: item.endDate || null, progress: item.progress || 0,
            target: item.target || '', reward: item.reward || '',
            tags: item.tags || '', notes: item.notes || '',
            favorite: item.favorite || false
        };
        const { data, error } = await supabaseClient.from('challenges').insert(row).select().single();
        return error ? null : mapChallenge(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localItems.findIndex(x => x.id === id); if (idx < 0) return null;
            localItems[idx] = { ...localItems[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapChallenge(localItems[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.difficulty !== undefined) row.difficulty = updates.difficulty;
        if (updates.startDate !== undefined) row.start_date = updates.startDate;
        if (updates.endDate !== undefined) row.end_date = updates.endDate;
        if (updates.progress !== undefined) row.progress = updates.progress;
        if (updates.target !== undefined) row.target = updates.target;
        if (updates.reward !== undefined) row.reward = updates.reward;
        if (updates.tags !== undefined) row.tags = updates.tags;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('challenges').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapChallenge(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localItems = localItems.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('challenges').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const i = await getById(id); if (!i) return null; return update(id, { favorite: !i.favorite }); }

    const CATEGORIES = [
        { value: 'personal', label: 'Personnel', icon: '👤' },
        { value: 'fitness', label: 'Fitness', icon: '💪' },
        { value: 'health', label: 'Santé', icon: '🏥' },
        { value: 'learning', label: 'Apprentissage', icon: '📚' },
        { value: 'creative', label: 'Créatif', icon: '🎨' },
        { value: 'social', label: 'Social', icon: '👥' },
        { value: 'financial', label: 'Financier', icon: '💰' },
        { value: 'career', label: 'Carrière', icon: '💼' },
        { value: 'spiritual', label: 'Spirituel', icon: '🙏' },
        { value: 'other', label: 'Autre', icon: '📌' }
    ];

    const STATUSES = [
        { value: 'active', label: 'En cours', icon: '🔥', color: '#F59E0B' },
        { value: 'completed', label: 'Complété', icon: '✅', color: '#22C55E' },
        { value: 'paused', label: 'En pause', icon: '⏸️', color: '#6366F1' },
        { value: 'abandoned', label: 'Abandonné', icon: '❌', color: '#EF4444' }
    ];

    const DIFFICULTIES = [
        { value: 'easy', label: 'Facile', icon: '🟢', color: '#22C55E' },
        { value: 'medium', label: 'Moyen', icon: '🟡', color: '#F59E0B' },
        { value: 'hard', label: 'Difficile', icon: '🟠', color: '#F97316' },
        { value: 'extreme', label: 'Extrême', icon: '🔴', color: '#EF4444' }
    ];

    function getCategoryInfo(val) { return CATEGORIES.find(c => c.value === val) || CATEGORIES[0]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }
    function getDifficultyInfo(val) { return DIFFICULTIES.find(d => d.value === val) || DIFFICULTIES[1]; }

    async function getStats() {
        const all = await getAll();
        const active = all.filter(c => c.status === 'active').length;
        const completed = all.filter(c => c.status === 'completed').length;
        const avgProgress = all.length ? Math.round(all.reduce((s, c) => s + c.progress, 0) / all.length) : 0;
        return { total: all.length, active, completed, avgProgress };
    }

    function exportCSV(items) {
        const header = 'Titre,Catégorie,Statut,Difficulté,Progression,Début,Fin,Objectif,Récompense\n';
        const rows = items.map(i => `"${i.title}","${i.category}","${i.status}","${i.difficulty}","${i.progress}%","${i.startDate}","${i.endDate}","${i.target}","${i.reward}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'defis.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, getCategoryInfo, getStatusInfo, getDifficultyInfo,
        CATEGORIES, STATUSES, DIFFICULTIES
    };
})();
