/* ===================================================================
   bookmarks.js — Signets & Liens Module
   Sauvegarde de liens web avec tags et catégories
   =================================================================== */

const Bookmarks = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapBookmark(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            url: row.url || '',
            description: row.description || '',
            category: row.category || 'general',
            tags: row.tags || '',
            isRead: !!row.is_read || !!row.isRead,
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-bookmarks-v1';
    let useLocalStorage = false;
    let localItems = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('bookmarks').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localItems = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems)); }

    async function getAll() {
        if (useLocalStorage) return localItems.map(mapBookmark);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('bookmarks').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapBookmark);
    }

    async function getById(id) {
        if (useLocalStorage) { const i = localItems.find(x => x.id === id); return i ? mapBookmark(i) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('bookmarks').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapBookmark(data);
    }

    async function add(item) {
        if (useLocalStorage) {
            const ni = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localItems.unshift(ni); saveLocal(); return mapBookmark(ni);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: item.title, url: item.url,
            description: item.description || '', category: item.category || 'general',
            tags: item.tags || '', is_read: item.isRead || false,
            notes: item.notes || '', favorite: item.favorite || false
        };
        const { data, error } = await supabaseClient.from('bookmarks').insert(row).select().single();
        return error ? null : mapBookmark(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localItems.findIndex(x => x.id === id); if (idx < 0) return null;
            localItems[idx] = { ...localItems[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapBookmark(localItems[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.url !== undefined) row.url = updates.url;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.tags !== undefined) row.tags = updates.tags;
        if (updates.isRead !== undefined) row.is_read = updates.isRead;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('bookmarks').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapBookmark(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localItems = localItems.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('bookmarks').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const i = await getById(id); if (!i) return null; return update(id, { favorite: !i.favorite }); }

    const CATEGORIES = [
        { value: 'general', label: 'Général', icon: '🔗' },
        { value: 'tech', label: 'Tech', icon: '💻' },
        { value: 'news', label: 'Actualités', icon: '📰' },
        { value: 'tutorial', label: 'Tutoriel', icon: '📖' },
        { value: 'tool', label: 'Outil', icon: '🛠️' },
        { value: 'reference', label: 'Référence', icon: '📋' },
        { value: 'video', label: 'Vidéo', icon: '🎥' },
        { value: 'social', label: 'Social', icon: '👥' },
        { value: 'shopping', label: 'Shopping', icon: '🛒' },
        { value: 'other', label: 'Autre', icon: '📌' }
    ];

    function getCategoryInfo(val) { return CATEGORIES.find(c => c.value === val) || CATEGORIES[0]; }

    async function getStats() {
        const all = await getAll();
        const read = all.filter(b => b.isRead).length;
        return { total: all.length, read, unread: all.length - read, favorites: all.filter(b => b.favorite).length };
    }

    function exportCSV(items) {
        const header = 'Titre,URL,Catégorie,Lu,Tags\n';
        const rows = items.map(i => `"${i.title}","${i.url}","${i.category}","${i.isRead ? 'Oui' : 'Non'}","${i.tags}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'signets.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, getCategoryInfo, CATEGORIES
    };
})();
