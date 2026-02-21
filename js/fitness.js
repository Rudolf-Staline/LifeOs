/* ===================================================================
   fitness.js — Fitness & Santé Module
   Suivi d'entraînements, exercices, poids, performances
   =================================================================== */

const Fitness = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapWorkout(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            type: row.type || 'strength',
            date: row.date || new Date().toISOString().split('T')[0],
            duration: parseInt(row.duration || 0),          // minutes
            calories: parseInt(row.calories || 0),
            exercises: row.exercises || '[]',
            mood: parseInt(row.mood || 3),                   // 1-5
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-fitness-v1';
    let useLocalStorage = false;
    let localWorkouts = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('workouts').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Fitness: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Fitness: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Fitness: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal()  { try { localWorkouts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localWorkouts = []; } }
    function saveLocal()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(localWorkouts)); }
    function genId()      { return 'wk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    async function getAll() {
        if (useLocalStorage) return localWorkouts.map(w => ({...w}));
        const { data, error } = await supabaseClient.from('workouts').select('*')
            .eq('user_id', getUserId()).order('date', { ascending: false });
        return error ? [] : data.map(mapWorkout);
    }

    async function getById(id) {
        if (useLocalStorage) return localWorkouts.find(w => w.id === id) || null;
        const { data, error } = await supabaseClient.from('workouts').select('*').eq('id', id).single();
        return error ? null : mapWorkout(data);
    }

    async function create(d) {
        if (useLocalStorage) {
            const w = { id: genId(), title: d.title, type: d.type || 'strength', date: d.date || new Date().toISOString().split('T')[0],
                duration: parseInt(d.duration||0), calories: parseInt(d.calories||0), exercises: d.exercises || '[]',
                mood: parseInt(d.mood||3), notes: d.notes||'', favorite: !!d.favorite,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            localWorkouts.push(w); saveLocal(); return w;
        }
        const { data, error } = await supabaseClient.from('workouts').insert({
            user_id: getUserId(), title: d.title, type: d.type || 'strength',
            date: d.date || new Date().toISOString().split('T')[0],
            duration: d.duration || 0, calories: d.calories || 0,
            exercises: d.exercises || '[]', mood: d.mood || 3,
            notes: d.notes || '', favorite: !!d.favorite
        }).select().single();
        if (error) { console.error('Workout create error:', error); return null; }
        return mapWorkout(data);
    }

    async function update(id, d) {
        if (useLocalStorage) {
            const idx = localWorkouts.findIndex(w => w.id === id);
            if (idx === -1) return null;
            const w = localWorkouts[idx];
            for (const k of Object.keys(d)) { if (d[k] !== undefined) w[k] = d[k]; }
            w.updatedAt = new Date().toISOString();
            localWorkouts[idx] = w; saveLocal(); return {...w};
        }
        const u = { updated_at: new Date().toISOString() };
        if (d.title !== undefined) u.title = d.title;
        if (d.type !== undefined) u.type = d.type;
        if (d.date !== undefined) u.date = d.date;
        if (d.duration !== undefined) u.duration = d.duration;
        if (d.calories !== undefined) u.calories = d.calories;
        if (d.exercises !== undefined) u.exercises = d.exercises;
        if (d.mood !== undefined) u.mood = d.mood;
        if (d.notes !== undefined) u.notes = d.notes;
        if (d.favorite !== undefined) u.favorite = d.favorite;
        const { data, error } = await supabaseClient.from('workouts').update(u).eq('id', id).select().single();
        if (error) return null;
        return mapWorkout(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            const idx = localWorkouts.findIndex(w => w.id === id);
            if (idx === -1) return false;
            localWorkouts.splice(idx, 1); saveLocal(); return true;
        }
        const { error } = await supabaseClient.from('workouts').delete().eq('id', id);
        return !error;
    }

    // ===== HELPERS =====
    function getTypeInfo(type) {
        const types = {
            'strength':   { label: 'Musculation', icon: 'fas fa-dumbbell', emoji: '🏋️', class: 'type-strength' },
            'cardio':     { label: 'Cardio', icon: 'fas fa-running', emoji: '🏃', class: 'type-cardio' },
            'flexibility':{ label: 'Souplesse', icon: 'fas fa-spa', emoji: '🧘', class: 'type-flexibility' },
            'sport':      { label: 'Sport', icon: 'fas fa-futbol', emoji: '⚽', class: 'type-sport' },
            'swimming':   { label: 'Natation', icon: 'fas fa-swimmer', emoji: '🏊', class: 'type-swimming' },
            'cycling':    { label: 'Cyclisme', icon: 'fas fa-bicycle', emoji: '🚴', class: 'type-cycling' },
            'hiking':     { label: 'Randonnée', icon: 'fas fa-mountain', emoji: '🥾', class: 'type-hiking' },
            'other':      { label: 'Autre', icon: 'fas fa-heartbeat', emoji: '💪', class: 'type-other' }
        };
        return types[type] || types.other;
    }

    function renderMood(m) {
        const moods = ['', '😫', '😕', '😐', '😊', '🔥'];
        return moods[m] || '😐';
    }

    function formatDuration(min) {
        if (min < 60) return `${min} min`;
        const h = Math.floor(min / 60);
        const m = min % 60;
        return m > 0 ? `${h}h${m.toString().padStart(2,'0')}` : `${h}h`;
    }

    function getStats(workouts) {
        const total = workouts.length;
        const totalDuration = workouts.reduce((s, w) => s + w.duration, 0);
        const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);
        const thisWeek = workouts.filter(w => {
            const d = new Date(w.date);
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0,0,0,0);
            return d >= startOfWeek;
        }).length;
        return { total, totalDuration, totalCalories, thisWeek };
    }

    function exportCSV(workouts) {
        const headers = ['Titre', 'Type', 'Date', 'Durée (min)', 'Calories', 'Humeur', 'Notes'];
        const rows = workouts.map(w => [w.title, w.type, w.date, w.duration, w.calories, w.mood, w.notes]
            .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `fitness_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    }

    return {
        initStorage, getAll, getById, create, update, remove,
        getTypeInfo, renderMood, formatDuration, getStats, exportCSV
    };
})();
