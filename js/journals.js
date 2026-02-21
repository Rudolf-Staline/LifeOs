/* ===================================================================
   journals.js — Journal Intime Module
   Entrées de journal personnel avec humeur et tags
   =================================================================== */

const Journals = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapEntry(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            date: row.date || new Date().toISOString().split('T')[0],
            content: row.content || '',
            mood: row.mood || 'neutral',
            weather: row.weather || '',
            tags: row.tags || '',
            isPrivate: row.is_private !== undefined ? !!row.is_private : (row.isPrivate !== undefined ? !!row.isPrivate : true),
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-journals-v1';
    let useLocalStorage = false;
    let localItems = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('journals').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localItems = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems)); }

    async function getAll() {
        if (useLocalStorage) return localItems.map(mapEntry);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('journals').select('*').eq('user_id', uid).order('date', { ascending: false });
        return error ? [] : (data || []).map(mapEntry);
    }

    async function getById(id) {
        if (useLocalStorage) { const i = localItems.find(x => x.id === id); return i ? mapEntry(i) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('journals').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapEntry(data);
    }

    async function add(item) {
        if (useLocalStorage) {
            const ni = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localItems.unshift(ni); saveLocal(); return mapEntry(ni);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: item.title || '',
            date: item.date || new Date().toISOString().split('T')[0],
            content: item.content, mood: item.mood || 'neutral',
            weather: item.weather || '', tags: item.tags || '',
            is_private: item.isPrivate !== undefined ? item.isPrivate : true,
            notes: item.notes || '', favorite: item.favorite || false
        };
        const { data, error } = await supabaseClient.from('journals').insert(row).select().single();
        return error ? null : mapEntry(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localItems.findIndex(x => x.id === id); if (idx < 0) return null;
            localItems[idx] = { ...localItems[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapEntry(localItems[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.date !== undefined) row.date = updates.date;
        if (updates.content !== undefined) row.content = updates.content;
        if (updates.mood !== undefined) row.mood = updates.mood;
        if (updates.weather !== undefined) row.weather = updates.weather;
        if (updates.tags !== undefined) row.tags = updates.tags;
        if (updates.isPrivate !== undefined) row.is_private = updates.isPrivate;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('journals').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapEntry(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localItems = localItems.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('journals').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const i = await getById(id); if (!i) return null; return update(id, { favorite: !i.favorite }); }

    const MOODS = [
        { value: 'amazing', label: 'Incroyable', icon: '🤩' },
        { value: 'happy', label: 'Heureux', icon: '😊' },
        { value: 'good', label: 'Bien', icon: '🙂' },
        { value: 'neutral', label: 'Neutre', icon: '😐' },
        { value: 'tired', label: 'Fatigué', icon: '😴' },
        { value: 'sad', label: 'Triste', icon: '😢' },
        { value: 'anxious', label: 'Anxieux', icon: '😰' }
    ];

    const WEATHER = [
        { value: 'sunny', label: 'Ensoleillé', icon: '☀️' },
        { value: 'cloudy', label: 'Nuageux', icon: '☁️' },
        { value: 'rainy', label: 'Pluvieux', icon: '🌧️' },
        { value: 'stormy', label: 'Orageux', icon: '⛈️' },
        { value: 'snowy', label: 'Neigeux', icon: '❄️' }
    ];

    function getMoodInfo(val) { return MOODS.find(m => m.value === val) || MOODS[3]; }
    function getWeatherInfo(val) { return WEATHER.find(w => w.value === val) || null; }

    async function getStats() {
        const all = await getAll();
        const thisMonth = all.filter(e => e.date && e.date.startsWith(new Date().toISOString().slice(0, 7))).length;
        return { total: all.length, thisMonth, favorites: all.filter(e => e.favorite).length, streak: calcStreak(all) };
    }

    function calcStreak(entries) {
        if (!entries.length) return 0;
        const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < dates.length; i++) {
            const expected = new Date(today);
            expected.setDate(expected.getDate() - i);
            const exp = expected.toISOString().split('T')[0];
            if (dates[i] === exp) streak++;
            else break;
        }
        return streak;
    }

    function exportCSV(items) {
        const header = 'Date,Titre,Humeur,Météo,Contenu,Tags\n';
        const rows = items.map(i => `"${i.date}","${i.title}","${i.mood}","${i.weather}","${i.content.replace(/"/g, '""')}","${i.tags}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'journal.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, getMoodInfo, getWeatherInfo,
        MOODS, WEATHER
    };
})();
