/* ===================================================================
   notes.js — Journal & Notes Module
   Journal personnel, suivi d'humeur, tags, notes libres
   =================================================================== */

const Notes = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapNote(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            content: row.content || '',
            mood: parseInt(row.mood || 0),               // 0=none, 1-5 scale
            tags: row.tags || '',                          // comma-separated
            color: row.color || '',                        // card accent color
            pinned: !!row.pinned,
            archived: !!row.archived,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-notes-v1';
    let useLocalStorage = false;
    let localNotes = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('notes').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Notes: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Notes: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Notes: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal()  { try { localNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localNotes = []; } }
    function saveLocal()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotes)); }
    function genId()      { return 'nt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    async function getAll() {
        if (useLocalStorage) return localNotes.filter(n => !n.archived).map(n => ({...n}));
        const { data, error } = await supabaseClient.from('notes').select('*')
            .eq('user_id', getUserId()).eq('archived', false).order('pinned', { ascending: false }).order('updated_at', { ascending: false });
        return error ? [] : data.map(mapNote);
    }

    async function getById(id) {
        if (useLocalStorage) return localNotes.find(n => n.id === id) || null;
        const { data, error } = await supabaseClient.from('notes').select('*').eq('id', id).single();
        return error ? null : mapNote(data);
    }

    async function create(d) {
        if (useLocalStorage) {
            const n = { id: genId(), title: d.title || '', content: d.content || '',
                mood: parseInt(d.mood||0), tags: d.tags||'', color: d.color||'',
                pinned: !!d.pinned, archived: false,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            localNotes.push(n); saveLocal(); return n;
        }
        const { data, error } = await supabaseClient.from('notes').insert({
            user_id: getUserId(), title: d.title || '', content: d.content || '',
            mood: d.mood || 0, tags: d.tags || '', color: d.color || '',
            pinned: !!d.pinned, archived: false
        }).select().single();
        if (error) { console.error('Note create error:', error); return null; }
        return mapNote(data);
    }

    async function update(id, d) {
        if (useLocalStorage) {
            const idx = localNotes.findIndex(n => n.id === id);
            if (idx === -1) return null;
            const n = localNotes[idx];
            for (const k of Object.keys(d)) { if (d[k] !== undefined) n[k] = d[k]; }
            n.updatedAt = new Date().toISOString();
            localNotes[idx] = n; saveLocal(); return {...n};
        }
        const u = { updated_at: new Date().toISOString() };
        if (d.title !== undefined) u.title = d.title;
        if (d.content !== undefined) u.content = d.content;
        if (d.mood !== undefined) u.mood = d.mood;
        if (d.tags !== undefined) u.tags = d.tags;
        if (d.color !== undefined) u.color = d.color;
        if (d.pinned !== undefined) u.pinned = d.pinned;
        if (d.archived !== undefined) u.archived = d.archived;
        const { data, error } = await supabaseClient.from('notes').update(u).eq('id', id).select().single();
        if (error) return null;
        return mapNote(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            const idx = localNotes.findIndex(n => n.id === id);
            if (idx === -1) return false;
            localNotes.splice(idx, 1); saveLocal(); return true;
        }
        const { error } = await supabaseClient.from('notes').delete().eq('id', id);
        return !error;
    }

    async function togglePin(id) {
        const n = await getById(id);
        if (!n) return null;
        return await update(id, { pinned: !n.pinned });
    }

    async function archive(id) {
        return await update(id, { archived: true });
    }

    // ===== HELPERS =====
    function getMoodInfo(mood) {
        const moods = {
            0: { label: '—', emoji: '', class: '' },
            1: { label: 'Terrible', emoji: '😫', class: 'mood-1' },
            2: { label: 'Mauvais', emoji: '😕', class: 'mood-2' },
            3: { label: 'Neutre', emoji: '😐', class: 'mood-3' },
            4: { label: 'Bien', emoji: '😊', class: 'mood-4' },
            5: { label: 'Excellent', emoji: '🔥', class: 'mood-5' }
        };
        return moods[mood] || moods[0];
    }

    function getColorOptions() {
        return [
            { value: '', label: 'Par défaut' },
            { value: '#22C55E', label: 'Vert' },
            { value: '#A78BFA', label: 'Violet' },
            { value: '#F59E0B', label: 'Ambre' },
            { value: '#3B82F6', label: 'Bleu' },
            { value: '#EC4899', label: 'Rose' },
            { value: '#EF4444', label: 'Rouge' },
            { value: '#06B6D4', label: 'Cyan' }
        ];
    }

    function parseTags(tags) {
        if (!tags) return [];
        return tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getStats(notes) {
        const allTags = notes.flatMap(n => parseTags(n.tags));
        const uniqueTags = [...new Set(allTags)];
        const moodNotes = notes.filter(n => n.mood > 0);
        const avgMood = moodNotes.length > 0
            ? (moodNotes.reduce((s, n) => s + n.mood, 0) / moodNotes.length).toFixed(1) : '—';
        return {
            total: notes.length,
            pinned: notes.filter(n => n.pinned).length,
            tags: uniqueTags.length,
            avgMood
        };
    }

    function exportCSV(notes) {
        const headers = ['Titre','Contenu','Humeur','Tags','Épinglé','Couleur','Créé le'];
        const rows = notes.map(n => [n.title, n.content.substring(0,200), n.mood, n.tags, n.pinned?'Oui':'Non', n.color, n.createdAt]
            .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `journal_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    }

    return {
        initStorage, getAll, getById, create, update, remove,
        togglePin, archive, getMoodInfo, getColorOptions, parseTags, formatDate, getStats, exportCSV
    };
})();
