/* ===================================================================
   moods.js — Suivi d'Humeur Module
   Tracking quotidien de l'humeur, énergie, stress, activités
   =================================================================== */

const Moods = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapMood(row) {
        if (!row) return null;
        return {
            id: row.id,
            date: row.date || new Date().toISOString().split('T')[0],
            mood: row.mood || 'neutral',
            energy: row.energy || 5,
            stress: row.stress || 5,
            sleepQuality: row.sleep_quality || row.sleepQuality || 5,
            activities: row.activities || '',
            emotions: row.emotions || '',
            weather: row.weather || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-moods-v1';
    let useLocalStorage = false;
    let localItems = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('moods').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localItems = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems)); }

    async function getAll() {
        if (useLocalStorage) return localItems.map(mapMood);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('moods').select('*').eq('user_id', uid).order('date', { ascending: false });
        return error ? [] : (data || []).map(mapMood);
    }

    async function getById(id) {
        if (useLocalStorage) { const i = localItems.find(x => x.id === id); return i ? mapMood(i) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('moods').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapMood(data);
    }

    async function add(item) {
        if (useLocalStorage) {
            const ni = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localItems.unshift(ni); saveLocal(); return mapMood(ni);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, date: item.date || new Date().toISOString().split('T')[0],
            mood: item.mood || 'neutral', energy: item.energy || 5,
            stress: item.stress || 5, sleep_quality: item.sleepQuality || 5,
            activities: item.activities || '', emotions: item.emotions || '',
            weather: item.weather || '', notes: item.notes || '',
            favorite: item.favorite || false
        };
        const { data, error } = await supabaseClient.from('moods').insert(row).select().single();
        return error ? null : mapMood(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localItems.findIndex(x => x.id === id); if (idx < 0) return null;
            localItems[idx] = { ...localItems[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapMood(localItems[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.date !== undefined) row.date = updates.date;
        if (updates.mood !== undefined) row.mood = updates.mood;
        if (updates.energy !== undefined) row.energy = updates.energy;
        if (updates.stress !== undefined) row.stress = updates.stress;
        if (updates.sleepQuality !== undefined) row.sleep_quality = updates.sleepQuality;
        if (updates.activities !== undefined) row.activities = updates.activities;
        if (updates.emotions !== undefined) row.emotions = updates.emotions;
        if (updates.weather !== undefined) row.weather = updates.weather;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('moods').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapMood(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localItems = localItems.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('moods').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const i = await getById(id); if (!i) return null; return update(id, { favorite: !i.favorite }); }

    const MOOD_LEVELS = [
        { value: 'amazing', label: 'Incroyable', icon: '🤩', color: '#22C55E' },
        { value: 'happy', label: 'Heureux', icon: '😊', color: '#84CC16' },
        { value: 'good', label: 'Bien', icon: '🙂', color: '#A78BFA' },
        { value: 'neutral', label: 'Neutre', icon: '😐', color: '#F59E0B' },
        { value: 'tired', label: 'Fatigué', icon: '😴', color: '#FB923C' },
        { value: 'sad', label: 'Triste', icon: '😢', color: '#6366F1' },
        { value: 'stressed', label: 'Stressé', icon: '😰', color: '#EF4444' },
        { value: 'angry', label: 'En colère', icon: '😠', color: '#DC2626' }
    ];

    const WEATHER_OPTIONS = [
        { value: 'sunny', label: 'Ensoleillé', icon: '☀️' },
        { value: 'cloudy', label: 'Nuageux', icon: '☁️' },
        { value: 'rainy', label: 'Pluvieux', icon: '🌧️' },
        { value: 'stormy', label: 'Orageux', icon: '⛈️' },
        { value: 'snowy', label: 'Neigeux', icon: '❄️' },
        { value: 'windy', label: 'Venteux', icon: '💨' }
    ];

    function getMoodInfo(val) { return MOOD_LEVELS.find(m => m.value === val) || MOOD_LEVELS[3]; }
    function getWeatherInfo(val) { return WEATHER_OPTIONS.find(w => w.value === val) || null; }

    async function getStats() {
        const all = await getAll();
        const avgEnergy = all.length ? Math.round(all.reduce((s, m) => s + m.energy, 0) / all.length * 10) / 10 : 0;
        const avgStress = all.length ? Math.round(all.reduce((s, m) => s + m.stress, 0) / all.length * 10) / 10 : 0;
        return { total: all.length, avgEnergy, avgStress, favorites: all.filter(m => m.favorite).length };
    }

    function exportCSV(items) {
        const header = 'Date,Humeur,Énergie,Stress,Sommeil,Météo,Activités,Émotions\n';
        const rows = items.map(i => `"${i.date}","${i.mood}","${i.energy}","${i.stress}","${i.sleepQuality}","${i.weather}","${i.activities}","${i.emotions}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'humeur.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, getMoodInfo, getWeatherInfo,
        MOOD_LEVELS, WEATHER_OPTIONS
    };
})();
