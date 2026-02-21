/* ===================================================================
   habits.js — Habitudes & Suivi Module
   Suivi d'habitudes quotidiennes, streaks, fréquence
   =================================================================== */

const Habits = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapHabit(row) {
        if (!row) return null;
        return {
            id: row.id,
            name: row.name || '',
            icon: row.icon || '✅',
            color: row.color || '#22C55E',
            frequency: row.frequency || 'daily',        // daily | weekday | weekly
            target: parseInt(row.target || 1),            // times per period
            completions: row.completions || '[]',         // JSON array of date strings
            streak: parseInt(row.streak || 0),
            bestStreak: parseInt(row.best_streak || row.bestStreak || 0),
            archived: !!row.archived,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-habits-v1';
    let useLocalStorage = false;
    let localHabits = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('habits').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Habits: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Habits: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Habits: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal()  { try { localHabits = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localHabits = []; } }
    function saveLocal()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(localHabits)); }
    function genId()      { return 'hb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    async function getAll() {
        if (useLocalStorage) return localHabits.filter(h => !h.archived).map(h => ({...h}));
        const { data, error } = await supabaseClient.from('habits').select('*')
            .eq('user_id', getUserId()).eq('archived', false).order('created_at', { ascending: true });
        return error ? [] : data.map(mapHabit);
    }

    async function getById(id) {
        if (useLocalStorage) return localHabits.find(h => h.id === id) || null;
        const { data, error } = await supabaseClient.from('habits').select('*').eq('id', id).single();
        return error ? null : mapHabit(data);
    }

    async function create(d) {
        if (useLocalStorage) {
            const h = { id: genId(), name: d.name, icon: d.icon||'✅', color: d.color||'#22C55E',
                frequency: d.frequency||'daily', target: parseInt(d.target||1),
                completions: '[]', streak: 0, bestStreak: 0, archived: false,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            localHabits.push(h); saveLocal(); return h;
        }
        const { data, error } = await supabaseClient.from('habits').insert({
            user_id: getUserId(), name: d.name, icon: d.icon || '✅', color: d.color || '#22C55E',
            frequency: d.frequency || 'daily', target: d.target || 1,
            completions: '[]', streak: 0, best_streak: 0, archived: false
        }).select().single();
        if (error) { console.error('Habit create error:', error); return null; }
        return mapHabit(data);
    }

    async function update(id, d) {
        if (useLocalStorage) {
            const idx = localHabits.findIndex(h => h.id === id);
            if (idx === -1) return null;
            const h = localHabits[idx];
            for (const k of Object.keys(d)) { if (d[k] !== undefined) h[k] = d[k]; }
            h.updatedAt = new Date().toISOString();
            localHabits[idx] = h; saveLocal(); return {...h};
        }
        const u = { updated_at: new Date().toISOString() };
        if (d.name !== undefined) u.name = d.name;
        if (d.icon !== undefined) u.icon = d.icon;
        if (d.color !== undefined) u.color = d.color;
        if (d.frequency !== undefined) u.frequency = d.frequency;
        if (d.target !== undefined) u.target = d.target;
        if (d.completions !== undefined) u.completions = d.completions;
        if (d.streak !== undefined) u.streak = d.streak;
        if (d.bestStreak !== undefined) u.best_streak = d.bestStreak;
        if (d.archived !== undefined) u.archived = d.archived;
        const { data, error } = await supabaseClient.from('habits').update(u).eq('id', id).select().single();
        if (error) return null;
        return mapHabit(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            const idx = localHabits.findIndex(h => h.id === id);
            if (idx === -1) return false;
            localHabits.splice(idx, 1); saveLocal(); return true;
        }
        const { error } = await supabaseClient.from('habits').delete().eq('id', id);
        return !error;
    }

    // Toggle completion for today
    async function toggleToday(id) {
        const habit = await getById(id);
        if (!habit) return null;

        const today = new Date().toISOString().split('T')[0];
        let completions = [];
        try { completions = JSON.parse(habit.completions || '[]'); } catch { completions = []; }

        const idx = completions.indexOf(today);
        if (idx >= 0) {
            completions.splice(idx, 1);
        } else {
            completions.push(today);
        }

        // Recalculate streak
        const { streak, bestStreak } = calcStreak(completions, habit.frequency);

        return await update(id, {
            completions: JSON.stringify(completions),
            streak,
            bestStreak: Math.max(bestStreak, habit.bestStreak)
        });
    }

    function calcStreak(completions, frequency) {
        if (!completions.length) return { streak: 0, bestStreak: 0 };

        const sorted = [...completions].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Must have done today or yesterday to have active streak
        if (sorted[0] !== today && sorted[0] !== yesterday) return { streak: 0, bestStreak: calcBest(sorted) };

        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1]);
            const curr = new Date(sorted[i]);
            const diff = (prev - curr) / 86400000;

            if (frequency === 'daily' && diff === 1) {
                streak++;
            } else if (frequency === 'weekday') {
                // Skip weekends
                if (diff <= 3) streak++;
                else break;
            } else if (frequency === 'weekly') {
                if (diff <= 7) streak++;
                else break;
            } else {
                break;
            }
        }

        return { streak, bestStreak: Math.max(streak, calcBest(sorted)) };
    }

    function calcBest(sorted) {
        if (sorted.length <= 1) return sorted.length;
        let best = 1, current = 1;
        for (let i = 1; i < sorted.length; i++) {
            const diff = (new Date(sorted[i-1]) - new Date(sorted[i])) / 86400000;
            if (diff === 1) { current++; best = Math.max(best, current); }
            else current = 1;
        }
        return best;
    }

    // ===== HELPERS =====
    function isCompletedToday(habit) {
        const today = new Date().toISOString().split('T')[0];
        try { return JSON.parse(habit.completions || '[]').includes(today); } catch { return false; }
    }

    function getCompletionRate(habit, days = 30) {
        let completions = [];
        try { completions = JSON.parse(habit.completions || '[]'); } catch { return 0; }
        const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
        const recent = completions.filter(d => d >= since);
        return Math.round((recent.length / days) * 100);
    }

    function getWeekView(habit) {
        let completions = [];
        try { completions = JSON.parse(habit.completions || '[]'); } catch { return []; }
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000);
            const dateStr = d.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0).toUpperCase(),
                completed: completions.includes(dateStr)
            });
        }
        return days;
    }

    function getFrequencyLabel(freq) {
        const labels = { 'daily': 'Quotidien', 'weekday': 'Jours ouvrés', 'weekly': 'Hebdomadaire' };
        return labels[freq] || freq;
    }

    function getStats(habits) {
        const completedToday = habits.filter(h => isCompletedToday(h)).length;
        const totalStreaks = habits.reduce((s, h) => s + h.streak, 0);
        const bestStreak = habits.reduce((b, h) => Math.max(b, h.bestStreak), 0);
        return {
            total: habits.length,
            completedToday,
            todayRate: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0,
            totalStreaks,
            bestStreak
        };
    }

    function exportCSV(habits) {
        const headers = ['Nom','Icône','Fréquence','Série actuelle','Meilleure série','Taux (30j)'];
        const rows = habits.map(h => [h.name, h.icon, h.frequency, h.streak, h.bestStreak, getCompletionRate(h) + '%']
            .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `habitudes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    }

    return {
        initStorage, getAll, getById, create, update, remove, toggleToday,
        isCompletedToday, getCompletionRate, getWeekView, getFrequencyLabel, getStats, exportCSV
    };
})();
