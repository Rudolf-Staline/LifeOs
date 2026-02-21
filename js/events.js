/* ===================================================================
   events.js — Événements & Planning Module
   Organisation événements, rappels, invités, countdown
   =================================================================== */

const Events = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapEvent(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            type: row.type || 'personal',
            category: row.category || 'autre',
            date: row.date || '',
            endDate: row.end_date || row.endDate || '',
            time: row.time || '',
            endTime: row.end_time || row.endTime || '',
            location: row.location || '',
            description: row.description || '',
            guests: row.guests || '',
            budget: parseFloat(row.budget || 0),
            status: row.status || 'upcoming',
            priority: row.priority || 'normal',
            reminder: !!row.reminder,
            recurring: row.recurring || '',
            color: row.color || '#A78BFA',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-events-v1';
    let useLocalStorage = false;
    let localEvents = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('events').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Events: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Events: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Events: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal() { try { localEvents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localEvents = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localEvents)); }

    async function getAll() {
        if (useLocalStorage) return localEvents.map(mapEvent);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('events').select('*').eq('user_id', uid).order('date', { ascending: true });
        return error ? [] : (data || []).map(mapEvent);
    }

    async function getById(id) {
        if (useLocalStorage) { const e = localEvents.find(x => x.id === id); return e ? mapEvent(e) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('events').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapEvent(data);
    }

    async function add(event) {
        if (useLocalStorage) {
            const ne = { ...event, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localEvents.unshift(ne); saveLocal(); return mapEvent(ne);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: event.title, type: event.type || 'personal',
            category: event.category || 'autre', date: event.date || null,
            end_date: event.endDate || null, time: event.time || '', end_time: event.endTime || '',
            location: event.location || '', description: event.description || '',
            guests: event.guests || '', budget: event.budget || 0,
            status: event.status || 'upcoming', priority: event.priority || 'normal',
            reminder: event.reminder || false, recurring: event.recurring || '',
            color: event.color || '#A78BFA', notes: event.notes || '',
            favorite: event.favorite || false
        };
        const { data, error } = await supabaseClient.from('events').insert(row).select().single();
        return error ? null : mapEvent(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localEvents.findIndex(x => x.id === id); if (idx < 0) return null;
            localEvents[idx] = { ...localEvents[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapEvent(localEvents[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.type !== undefined) row.type = updates.type;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.date !== undefined) row.date = updates.date;
        if (updates.endDate !== undefined) row.end_date = updates.endDate;
        if (updates.time !== undefined) row.time = updates.time;
        if (updates.endTime !== undefined) row.end_time = updates.endTime;
        if (updates.location !== undefined) row.location = updates.location;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.guests !== undefined) row.guests = updates.guests;
        if (updates.budget !== undefined) row.budget = updates.budget;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.priority !== undefined) row.priority = updates.priority;
        if (updates.reminder !== undefined) row.reminder = updates.reminder;
        if (updates.recurring !== undefined) row.recurring = updates.recurring;
        if (updates.color !== undefined) row.color = updates.color;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('events').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapEvent(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            localEvents = localEvents.filter(x => x.id !== id); saveLocal(); return true;
        }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('events').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) {
        const ev = await getById(id); if (!ev) return null;
        return update(id, { favorite: !ev.favorite });
    }

    const TYPES = [
        { value: 'personal', label: 'Personnel', icon: '👤' },
        { value: 'family', label: 'Famille', icon: '👨‍👩‍👧‍👦' },
        { value: 'work', label: 'Travail', icon: '💼' },
        { value: 'social', label: 'Social', icon: '🎉' },
        { value: 'sport', label: 'Sport', icon: '⚽' },
        { value: 'cultural', label: 'Culturel', icon: '🎭' },
        { value: 'travel', label: 'Voyage', icon: '✈️' },
        { value: 'health', label: 'Santé', icon: '🏥' }
    ];

    const CATEGORIES = [
        { value: 'birthday', label: 'Anniversaire', icon: '🎂' },
        { value: 'wedding', label: 'Mariage', icon: '💒' },
        { value: 'meeting', label: 'Réunion', icon: '📋' },
        { value: 'concert', label: 'Concert', icon: '🎵' },
        { value: 'dinner', label: 'Dîner', icon: '🍽️' },
        { value: 'party', label: 'Fête', icon: '🥳' },
        { value: 'conference', label: 'Conférence', icon: '🎤' },
        { value: 'holiday', label: 'Vacances', icon: '🏖️' },
        { value: 'exam', label: 'Examen', icon: '📝' },
        { value: 'deadline', label: 'Échéance', icon: '⏰' },
        { value: 'autre', label: 'Autre', icon: '📌' }
    ];

    const STATUSES = [
        { value: 'upcoming', label: 'À venir', icon: '📅', color: '#6366F1' },
        { value: 'ongoing', label: 'En cours', icon: '▶️', color: '#22C55E' },
        { value: 'completed', label: 'Terminé', icon: '✅', color: '#94A3B8' },
        { value: 'cancelled', label: 'Annulé', icon: '❌', color: '#EF4444' }
    ];

    function getTypeInfo(val) { return TYPES.find(t => t.value === val) || TYPES[0]; }
    function getCategoryInfo(val) { return CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }

    function getDaysUntil(event) {
        if (!event.date) return null;
        return Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
    }

    function getCountdown(event) {
        const days = getDaysUntil(event);
        if (days === null) return '';
        if (days < 0) return `il y a ${Math.abs(days)}j`;
        if (days === 0) return "Aujourd'hui !";
        if (days === 1) return 'Demain';
        if (days <= 7) return `Dans ${days} jours`;
        if (days <= 30) return `Dans ${Math.ceil(days / 7)} sem.`;
        return `Dans ${Math.ceil(days / 30)} mois`;
    }

    function formatDateRange(event) {
        const opts = { day: 'numeric', month: 'short', year: 'numeric' };
        if (!event.date) return '';
        const start = new Date(event.date).toLocaleDateString('fr-FR', opts);
        if (!event.endDate || event.endDate === event.date) {
            return event.time ? `${start} à ${event.time}` : start;
        }
        const end = new Date(event.endDate).toLocaleDateString('fr-FR', opts);
        return `${start} → ${end}`;
    }

    async function getStats() {
        const events = await getAll();
        const upcoming = events.filter(e => getDaysUntil(e) >= 0 && e.status === 'upcoming');
        const thisMonth = events.filter(e => {
            if (!e.date) return false;
            const d = new Date(e.date);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        return {
            total: events.length,
            upcoming: upcoming.length,
            thisMonth: thisMonth.length,
            totalBudget: events.reduce((s, e) => s + e.budget, 0).toFixed(2)
        };
    }

    function exportCSV(events) {
        const header = 'Titre,Type,Catégorie,Date,Heure,Lieu,Invités,Budget,Statut,Priorité\n';
        const rows = events.map(e =>
            `"${e.title}","${e.type}","${e.category}","${e.date}","${e.time}","${e.location}","${e.guests}",${e.budget},"${e.status}","${e.priority}"`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'evenements.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV,
        TYPES, CATEGORIES, STATUSES,
        getTypeInfo, getCategoryInfo, getStatusInfo,
        getDaysUntil, getCountdown, formatDateRange
    };
})();
