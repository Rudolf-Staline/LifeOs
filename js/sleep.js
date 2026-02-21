/* ===================================================================
   sleep.js — Sommeil & Repos Module
   Suivi du sommeil, qualité, durée, habitudes
   =================================================================== */

const Sleep = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapEntry(row) {
        if (!row) return null;
        return {
            id: row.id,
            date: row.date || '',
            bedtime: row.bedtime || '',
            wakeTime: row.wake_time || row.wakeTime || '',
            duration: parseFloat(row.duration || 0),
            quality: parseInt(row.quality || 3),
            mood: row.mood || 'normal',
            dreams: row.dreams || '',
            interruptions: parseInt(row.interruptions || 0),
            factors: row.factors || '',
            nap: !!row.nap,
            napDuration: parseInt(row.nap_duration || row.napDuration || 0),
            notes: row.notes || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-sleep-v1';
    let useLocalStorage = false;
    let localEntries = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('sleep_entries').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localEntries = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntries)); }

    async function getAll() {
        if (useLocalStorage) return localEntries.map(mapEntry);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('sleep_entries').select('*').eq('user_id', uid).order('date', { ascending: false });
        return error ? [] : (data || []).map(mapEntry);
    }

    async function getById(id) {
        if (useLocalStorage) { const e = localEntries.find(x => x.id === id); return e ? mapEntry(e) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('sleep_entries').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapEntry(data);
    }

    async function add(entry) {
        if (useLocalStorage) {
            const ne = { ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localEntries.unshift(ne); saveLocal(); return mapEntry(ne);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, date: entry.date || null, bedtime: entry.bedtime || '',
            wake_time: entry.wakeTime || '', duration: entry.duration || 0,
            quality: entry.quality || 3, mood: entry.mood || 'normal',
            dreams: entry.dreams || '', interruptions: entry.interruptions || 0,
            factors: entry.factors || '', nap: entry.nap || false,
            nap_duration: entry.napDuration || 0, notes: entry.notes || ''
        };
        const { data, error } = await supabaseClient.from('sleep_entries').insert(row).select().single();
        return error ? null : mapEntry(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localEntries.findIndex(x => x.id === id); if (idx < 0) return null;
            localEntries[idx] = { ...localEntries[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapEntry(localEntries[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.date !== undefined) row.date = updates.date;
        if (updates.bedtime !== undefined) row.bedtime = updates.bedtime;
        if (updates.wakeTime !== undefined) row.wake_time = updates.wakeTime;
        if (updates.duration !== undefined) row.duration = updates.duration;
        if (updates.quality !== undefined) row.quality = updates.quality;
        if (updates.mood !== undefined) row.mood = updates.mood;
        if (updates.dreams !== undefined) row.dreams = updates.dreams;
        if (updates.interruptions !== undefined) row.interruptions = updates.interruptions;
        if (updates.factors !== undefined) row.factors = updates.factors;
        if (updates.nap !== undefined) row.nap = updates.nap;
        if (updates.napDuration !== undefined) row.nap_duration = updates.napDuration;
        if (updates.notes !== undefined) row.notes = updates.notes;
        const { data, error } = await supabaseClient.from('sleep_entries').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapEntry(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localEntries = localEntries.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('sleep_entries').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    const QUALITIES = [
        { value: 1, label: 'Très mauvais', icon: '😫', color: '#EF4444' },
        { value: 2, label: 'Mauvais', icon: '😞', color: '#F97316' },
        { value: 3, label: 'Moyen', icon: '😐', color: '#F59E0B' },
        { value: 4, label: 'Bon', icon: '😊', color: '#84CC16' },
        { value: 5, label: 'Excellent', icon: '😴', color: '#22C55E' }
    ];

    const MOODS = [
        { value: 'energetic', label: 'Énergique', icon: '⚡' },
        { value: 'normal', label: 'Normal', icon: '😐' },
        { value: 'tired', label: 'Fatigué', icon: '😴' },
        { value: 'groggy', label: 'Vaseux', icon: '🥱' },
        { value: 'refreshed', label: 'Reposé', icon: '🌟' }
    ];

    const FACTORS = [
        { value: 'stress', label: 'Stress', icon: '😰' },
        { value: 'caffeine', label: 'Caféine', icon: '☕' },
        { value: 'exercise', label: 'Exercice', icon: '🏃' },
        { value: 'screen', label: 'Écrans', icon: '📱' },
        { value: 'alcohol', label: 'Alcool', icon: '🍷' },
        { value: 'noise', label: 'Bruit', icon: '🔊' },
        { value: 'temperature', label: 'Température', icon: '🌡️' },
        { value: 'medication', label: 'Médicament', icon: '💊' }
    ];

    function getQualityInfo(val) { return QUALITIES.find(q => q.value === parseInt(val)) || QUALITIES[2]; }
    function getMoodInfo(val) { return MOODS.find(m => m.value === val) || MOODS[1]; }

    function calcDuration(bedtime, wakeTime) {
        if (!bedtime || !wakeTime) return 0;
        const [bh, bm] = bedtime.split(':').map(Number);
        const [wh, wm] = wakeTime.split(':').map(Number);
        let mins = (wh * 60 + wm) - (bh * 60 + bm);
        if (mins < 0) mins += 24 * 60;
        return Math.round(mins / 60 * 10) / 10;
    }

    async function getStats() {
        const all = await getAll();
        const last7 = all.slice(0, 7);
        const avgDuration = last7.length ? (last7.reduce((s, e) => s + e.duration, 0) / last7.length).toFixed(1) : '0';
        const avgQuality = last7.length ? (last7.reduce((s, e) => s + e.quality, 0) / last7.length).toFixed(1) : '0';
        return { total: all.length, avgDuration, avgQuality, thisWeek: last7.length };
    }

    function exportCSV(entries) {
        const header = 'Date,Coucher,Réveil,Durée(h),Qualité,Humeur,Interruptions,Sieste\n';
        const rows = entries.map(e => `"${e.date}","${e.bedtime}","${e.wakeTime}",${e.duration},${e.quality},"${e.mood}",${e.interruptions},${e.nap}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sommeil.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove,
        getStats, exportCSV, calcDuration, getQualityInfo, getMoodInfo,
        QUALITIES, MOODS, FACTORS
    };
})();
