// ===================================================================
//  MODULE : Medications (Médicaments)
// ===================================================================
const Medications = (() => {
    const TABLE = 'medications';
    const LOCAL_KEY = 'monbudget_medications';
    let useSupabase = false;

    const TYPES = [
        { value: 'pill', label: 'Comprimé', icon: '💊', color: '#0EA5E9' },
        { value: 'capsule', label: 'Gélule', icon: '💊', color: '#8B5CF6' },
        { value: 'syrup', label: 'Sirop', icon: '🧴', color: '#F59E0B' },
        { value: 'injection', label: 'Injection', icon: '💉', color: '#EF4444' },
        { value: 'cream', label: 'Crème', icon: '🧴', color: '#EC4899' },
        { value: 'drops', label: 'Gouttes', icon: '💧', color: '#22C55E' },
        { value: 'inhaler', label: 'Inhalateur', icon: '🌬️', color: '#14B8A6' },
        { value: 'supplement', label: 'Complément', icon: '🌿', color: '#10B981' },
        { value: 'autre', label: 'Autre', icon: '💊', color: '#64748B' }
    ];

    const FREQUENCIES = [
        { value: 'once', label: '1x/jour', icon: '1️⃣' },
        { value: 'twice', label: '2x/jour', icon: '2️⃣' },
        { value: 'thrice', label: '3x/jour', icon: '3️⃣' },
        { value: 'weekly', label: 'Hebdomadaire', icon: '📅' },
        { value: 'as_needed', label: 'Si besoin', icon: '❓' },
        { value: 'autre', label: 'Autre', icon: '📋' }
    ];

    const STATUSES = [
        { value: 'active', label: 'En cours', icon: '✅', color: '#22C55E' },
        { value: 'completed', label: 'Terminé', icon: '🏁', color: '#0EA5E9' },
        { value: 'paused', label: 'Suspendu', icon: '⏸️', color: '#F59E0B' },
        { value: 'discontinued', label: 'Arrêté', icon: '⛔', color: '#EF4444' }
    ];

    function getTypeInfo(v) { return TYPES.find(t => t.value === v) || TYPES[TYPES.length - 1]; }
    function getFrequencyInfo(v) { return FREQUENCIES.find(f => f.value === v) || FREQUENCIES[0]; }
    function getStatusInfo(v) { return STATUSES.find(s => s.value === v) || STATUSES[0]; }

    function mapRow(r) {
        return {
            id: r.id, name: r.name || '', type: r.type || 'pill',
            dosage: r.dosage || '', frequency: r.frequency || 'once',
            status: r.status || 'active', prescriber: r.prescriber || '',
            pharmacy: r.pharmacy || '', startDate: r.start_date || r.startDate || '',
            endDate: r.end_date || r.endDate || '', refillDate: r.refill_date || r.refillDate || '',
            quantity: parseInt(r.quantity) || 0, price: parseFloat(r.price) || 0,
            sideEffects: r.side_effects || r.sideEffects || '',
            purpose: r.purpose || '', instructions: r.instructions || '',
            notes: r.notes || '', favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            name: d.name, type: d.type, dosage: d.dosage, frequency: d.frequency,
            status: d.status, prescriber: d.prescriber, pharmacy: d.pharmacy,
            start_date: d.startDate, end_date: d.endDate, refill_date: d.refillDate,
            quantity: d.quantity, price: d.price, side_effects: d.sideEffects,
            purpose: d.purpose, instructions: d.instructions,
            notes: d.notes, favorite: d.favorite
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'medication', item.id, `Médicament: ${item.name}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'medication', id, `Médicament modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'medication', id, 'Médicament supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    function needsRefill(item) {
        if (!item.refillDate) return false;
        const days = (new Date(item.refillDate) - new Date()) / 86400000;
        return days >= 0 && days <= 7;
    }

    async function getStats() {
        const all = await getAll();
        const active = all.filter(i => i.status === 'active');
        return {
            total: all.length,
            active: active.length,
            needRefill: all.filter(i => needsRefill(i)).length,
            totalCost: active.reduce((s, i) => s + i.price, 0).toFixed(2),
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Nom', 'Type', 'Dosage', 'Fréquence', 'Statut', 'Prescripteur', 'Prix'];
        const rows = items.map(i => [i.name, i.type, i.dosage, i.frequency, i.status, i.prescriber, i.price]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'medications.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, needsRefill, getStats, exportCSV, TYPES, FREQUENCIES, STATUSES, getTypeInfo, getFrequencyInfo, getStatusInfo };
})();
