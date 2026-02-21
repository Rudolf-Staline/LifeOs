/* ===================================================================
   wardrobe.js — Garde-robe Module
   Vêtements, catégories, saisons, tenues
   =================================================================== */

const Wardrobe = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapItem(row) {
        if (!row) return null;
        return {
            id: row.id,
            name: row.name || '',
            category: row.category || 'top',
            brand: row.brand || '',
            color: row.color || '',
            size: row.size || '',
            season: row.season || 'all',
            occasion: row.occasion || 'casual',
            condition: row.condition || 'good',
            price: parseFloat(row.price || 0),
            purchaseDate: row.purchase_date || row.purchaseDate || '',
            lastWorn: row.last_worn || row.lastWorn || '',
            timesWorn: parseInt(row.times_worn || row.timesWorn || 0),
            notes: row.notes || '',
            photo: row.photo || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-wardrobe-v1';
    let useLocalStorage = false;
    let localItems = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('wardrobe').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localItems = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems)); }

    async function getAll() {
        if (useLocalStorage) return localItems.map(mapItem);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('wardrobe').select('*').eq('user_id', uid).order('name');
        return error ? [] : (data || []).map(mapItem);
    }

    async function getById(id) {
        if (useLocalStorage) { const i = localItems.find(x => x.id === id); return i ? mapItem(i) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('wardrobe').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapItem(data);
    }

    async function add(item) {
        if (useLocalStorage) {
            const ni = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localItems.unshift(ni); saveLocal(); return mapItem(ni);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, name: item.name, category: item.category || 'top',
            brand: item.brand || '', color: item.color || '', size: item.size || '',
            season: item.season || 'all', occasion: item.occasion || 'casual',
            condition: item.condition || 'good', price: item.price || 0,
            purchase_date: item.purchaseDate || null, last_worn: item.lastWorn || null,
            times_worn: item.timesWorn || 0, notes: item.notes || '',
            photo: item.photo || '', favorite: item.favorite || false
        };
        const { data, error } = await supabaseClient.from('wardrobe').insert(row).select().single();
        return error ? null : mapItem(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localItems.findIndex(x => x.id === id); if (idx < 0) return null;
            localItems[idx] = { ...localItems[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapItem(localItems[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.name !== undefined) row.name = updates.name;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.brand !== undefined) row.brand = updates.brand;
        if (updates.color !== undefined) row.color = updates.color;
        if (updates.size !== undefined) row.size = updates.size;
        if (updates.season !== undefined) row.season = updates.season;
        if (updates.occasion !== undefined) row.occasion = updates.occasion;
        if (updates.condition !== undefined) row.condition = updates.condition;
        if (updates.price !== undefined) row.price = updates.price;
        if (updates.purchaseDate !== undefined) row.purchase_date = updates.purchaseDate;
        if (updates.lastWorn !== undefined) row.last_worn = updates.lastWorn;
        if (updates.timesWorn !== undefined) row.times_worn = updates.timesWorn;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.photo !== undefined) row.photo = updates.photo;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('wardrobe').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapItem(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localItems = localItems.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('wardrobe').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const i = await getById(id); if (!i) return null; return update(id, { favorite: !i.favorite }); }

    async function wearItem(id) {
        const item = await getById(id);
        if (!item) return null;
        return update(id, { lastWorn: new Date().toISOString().split('T')[0], timesWorn: item.timesWorn + 1 });
    }

    const CATEGORIES = [
        { value: 'top', label: 'Haut', icon: '👕' },
        { value: 'bottom', label: 'Bas', icon: '👖' },
        { value: 'dress', label: 'Robe', icon: '👗' },
        { value: 'outerwear', label: 'Veste/Manteau', icon: '🧥' },
        { value: 'shoes', label: 'Chaussures', icon: '👟' },
        { value: 'accessory', label: 'Accessoire', icon: '👜' },
        { value: 'sportswear', label: 'Sport', icon: '🏃' },
        { value: 'underwear', label: 'Sous-vêtement', icon: '🩲' },
        { value: 'sleepwear', label: 'Pyjama', icon: '😴' },
        { value: 'autre', label: 'Autre', icon: '👔' }
    ];

    const SEASONS = [
        { value: 'all', label: 'Toutes saisons', icon: '🌐' },
        { value: 'spring', label: 'Printemps', icon: '🌸' },
        { value: 'summer', label: 'Été', icon: '☀️' },
        { value: 'autumn', label: 'Automne', icon: '🍂' },
        { value: 'winter', label: 'Hiver', icon: '❄️' }
    ];

    const OCCASIONS = [
        { value: 'casual', label: 'Décontracté', icon: '😎' },
        { value: 'formal', label: 'Formel', icon: '👔' },
        { value: 'business', label: 'Business', icon: '💼' },
        { value: 'sport', label: 'Sport', icon: '⚽' },
        { value: 'party', label: 'Soirée', icon: '🎉' },
        { value: 'autre', label: 'Autre', icon: '📌' }
    ];

    const CONDITIONS = [
        { value: 'new', label: 'Neuf', icon: '✨', color: '#22C55E' },
        { value: 'good', label: 'Bon', icon: '👍', color: '#84CC16' },
        { value: 'worn', label: 'Usé', icon: '👌', color: '#F59E0B' },
        { value: 'damaged', label: 'Abîmé', icon: '⚠️', color: '#EF4444' }
    ];

    function getCategoryInfo(val) { return CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1]; }
    function getSeasonInfo(val) { return SEASONS.find(s => s.value === val) || SEASONS[0]; }
    function getOccasionInfo(val) { return OCCASIONS.find(o => o.value === val) || OCCASIONS[0]; }
    function getConditionInfo(val) { return CONDITIONS.find(c => c.value === val) || CONDITIONS[1]; }

    async function getStats() {
        const all = await getAll();
        const totalValue = all.reduce((s, i) => s + i.price, 0);
        const categories = new Set(all.map(i => i.category)).size;
        return { total: all.length, totalValue: totalValue.toFixed(2), categories, favorites: all.filter(i => i.favorite).length };
    }

    function exportCSV(items) {
        const header = 'Nom,Catégorie,Marque,Couleur,Taille,Saison,Occasion,État,Prix,Porté\n';
        const rows = items.map(i => `"${i.name}","${i.category}","${i.brand}","${i.color}","${i.size}","${i.season}","${i.occasion}","${i.condition}",${i.price},${i.timesWorn}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'garde-robe.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite, wearItem,
        getStats, exportCSV, getCategoryInfo, getSeasonInfo, getOccasionInfo, getConditionInfo,
        CATEGORIES, SEASONS, OCCASIONS, CONDITIONS
    };
})();
