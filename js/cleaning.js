// ===================================================================
//  MODULE : Cleaning (Ménage)
// ===================================================================
const Cleaning = (() => {
    const TABLE = 'cleaning';
    const LOCAL_KEY = 'monbudget_cleaning';
    let useSupabase = false;

    const ROOMS = [
        { value: 'kitchen', label: 'Cuisine', icon: '🍳' },
        { value: 'bathroom', label: 'Salle de bain', icon: '🚿' },
        { value: 'bedroom', label: 'Chambre', icon: '🛏️' },
        { value: 'living', label: 'Salon', icon: '🛋️' },
        { value: 'office', label: 'Bureau', icon: '💼' },
        { value: 'laundry', label: 'Buanderie', icon: '🧺' },
        { value: 'garage', label: 'Garage', icon: '🚗' },
        { value: 'garden', label: 'Jardin', icon: '🌿' },
        { value: 'hallway', label: 'Couloir/Entrée', icon: '🚪' },
        { value: 'autre', label: 'Autre', icon: '🏠' }
    ];

    const FREQUENCIES = [
        { value: 'daily', label: 'Quotidien', icon: '📅', color: '#EF4444' },
        { value: 'weekly', label: 'Hebdomadaire', icon: '📆', color: '#F59E0B' },
        { value: 'biweekly', label: 'Bimensuel', icon: '🗓️', color: '#0EA5E9' },
        { value: 'monthly', label: 'Mensuel', icon: '📋', color: '#22C55E' },
        { value: 'quarterly', label: 'Trimestriel', icon: '📊', color: '#8B5CF6' },
        { value: 'yearly', label: 'Annuel', icon: '🎯', color: '#64748B' }
    ];

    function getRoomInfo(v) { return ROOMS.find(r => r.value === v) || ROOMS[ROOMS.length - 1]; }
    function getFrequencyInfo(v) { return FREQUENCIES.find(f => f.value === v) || FREQUENCIES[1]; }

    function mapRow(r) {
        return {
            id: r.id, task: r.task || '', room: r.room || 'autre',
            frequency: r.frequency || 'weekly', lastDone: r.last_done || r.lastDone || '',
            nextDue: r.next_due || r.nextDue || '', assignee: r.assignee || '',
            duration: parseInt(r.duration) || 0, difficulty: r.difficulty || 'easy',
            supplies: r.supplies || '', notes: r.notes || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            task: d.task, room: d.room, frequency: d.frequency,
            last_done: d.lastDone, next_due: d.nextDue, assignee: d.assignee,
            duration: d.duration, difficulty: d.difficulty,
            supplies: d.supplies, notes: d.notes, favorite: d.favorite
        };
    }

    function _local() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; } }
    function _saveLocal(data) { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); }

    async function initStorage() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) { useSupabase = true; return; }
        }
        useSupabase = false;
    }

    async function getAll() {
        if (useSupabase) {
            const { data } = await supabaseClient.from(TABLE).select('*').order('created_at', { ascending: false });
            return (data || []).map(mapRow);
        }
        return _local().map(mapRow);
    }

    async function getById(id) { const all = await getAll(); return all.find(i => i.id === id) || null; }

    async function add(d) {
        const item = mapRow({ ...d, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        if (useSupabase) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const { error } = await supabaseClient.from(TABLE).insert({ ...toRow(item), id: item.id, user_id: session.user.id });
            if (error) { console.error(error); return null; }
        } else { const all = _local(); all.unshift(item); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'cleaning', item.id, `Ménage: ${item.task}`);
        return item;
    }

    async function update(id, d) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).update({ ...toRow(d), updated_at: new Date().toISOString() }).eq('id', id);
            if (error) { console.error(error); return null; }
        } else {
            const all = _local(); const idx = all.findIndex(i => i.id === id);
            if (idx !== -1) { all[idx] = { ...all[idx], ...d, updated_at: new Date().toISOString() }; _saveLocal(all); }
        }
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'cleaning', id, `Ménage modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'cleaning', id, 'Ménage supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    async function markDone(id) {
        const today = new Date().toISOString().split('T')[0];
        return update(id, { lastDone: today });
    }

    function isOverdue(item) {
        if (!item.nextDue) return false;
        return new Date(item.nextDue) < new Date();
    }

    async function getStats() {
        const all = await getAll();
        return {
            total: all.length,
            overdue: all.filter(i => isOverdue(i)).length,
            rooms: [...new Set(all.map(i => i.room))].length,
            doneThisWeek: all.filter(i => { if (!i.lastDone) return false; const d = new Date(i.lastDone); const w = new Date(); w.setDate(w.getDate() - 7); return d >= w; }).length,
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Tâche', 'Pièce', 'Fréquence', 'Dernier', 'Prochain', 'Durée(min)'];
        const rows = items.map(i => [i.task, i.room, i.frequency, i.lastDone, i.nextDue, i.duration]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cleaning.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, markDone, isOverdue, getStats, exportCSV, ROOMS, FREQUENCIES, getRoomInfo, getFrequencyInfo };
})();
