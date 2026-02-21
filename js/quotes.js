/* ===================================================================
   quotes.js — Citations & Inspirations Module
   Collection de citations favorites avec auteurs et catégories
   =================================================================== */

const Quotes = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapQuote(row) {
        if (!row) return null;
        return {
            id: row.id,
            text: row.text || '',
            author: row.author || '',
            source: row.source || '',
            category: row.category || 'inspiration',
            tags: row.tags || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-quotes-v1';
    let useLocalStorage = false;
    let localItems = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('quotes').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localItems = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems)); }

    async function getAll() {
        if (useLocalStorage) return localItems.map(mapQuote);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('quotes').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapQuote);
    }

    async function getById(id) {
        if (useLocalStorage) { const i = localItems.find(x => x.id === id); return i ? mapQuote(i) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('quotes').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapQuote(data);
    }

    async function add(item) {
        if (useLocalStorage) {
            const ni = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localItems.unshift(ni); saveLocal(); return mapQuote(ni);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, text: item.text, author: item.author || '',
            source: item.source || '', category: item.category || 'inspiration',
            tags: item.tags || '', notes: item.notes || '',
            favorite: item.favorite || false
        };
        const { data, error } = await supabaseClient.from('quotes').insert(row).select().single();
        return error ? null : mapQuote(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localItems.findIndex(x => x.id === id); if (idx < 0) return null;
            localItems[idx] = { ...localItems[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapQuote(localItems[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.text !== undefined) row.text = updates.text;
        if (updates.author !== undefined) row.author = updates.author;
        if (updates.source !== undefined) row.source = updates.source;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.tags !== undefined) row.tags = updates.tags;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('quotes').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapQuote(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localItems = localItems.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('quotes').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const i = await getById(id); if (!i) return null; return update(id, { favorite: !i.favorite }); }

    const CATEGORIES = [
        { value: 'inspiration', label: 'Inspiration', icon: '✨' },
        { value: 'motivation', label: 'Motivation', icon: '🔥' },
        { value: 'wisdom', label: 'Sagesse', icon: '🦉' },
        { value: 'humor', label: 'Humour', icon: '😄' },
        { value: 'love', label: 'Amour', icon: '❤️' },
        { value: 'philosophy', label: 'Philosophie', icon: '🤔' },
        { value: 'science', label: 'Science', icon: '🔬' },
        { value: 'literature', label: 'Littérature', icon: '📚' },
        { value: 'cinema', label: 'Cinéma', icon: '🎬' },
        { value: 'other', label: 'Autre', icon: '📌' }
    ];

    function getCategoryInfo(val) { return CATEGORIES.find(c => c.value === val) || CATEGORIES[0]; }

    async function getStats() {
        const all = await getAll();
        const authors = new Set(all.filter(q => q.author).map(q => q.author)).size;
        return { total: all.length, authors, favorites: all.filter(q => q.favorite).length, categories: new Set(all.map(q => q.category)).size };
    }

    function exportCSV(items) {
        const header = 'Citation,Auteur,Source,Catégorie,Tags\n';
        const rows = items.map(i => `"${i.text}","${i.author}","${i.source}","${i.category}","${i.tags}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'citations.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, getCategoryInfo, CATEGORIES
    };
})();
