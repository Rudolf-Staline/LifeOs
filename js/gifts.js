// ===================================================================
//  MODULE : Gifts (Cadeaux)
// ===================================================================
const Gifts = (() => {
    const TABLE = 'gifts';
    const LOCAL_KEY = 'monbudget_gifts';
    let useSupabase = false;

    const TYPES = [
        { value: 'given', label: 'Offert', icon: '🎁', color: '#EF4444' },
        { value: 'received', label: 'Reçu', icon: '📦', color: '#22C55E' },
        { value: 'idea', label: 'Idée cadeau', icon: '💡', color: '#F59E0B' }
    ];

    const OCCASIONS = [
        { value: 'birthday', label: 'Anniversaire', icon: '🎂' },
        { value: 'christmas', label: 'Noël', icon: '🎄' },
        { value: 'wedding', label: 'Mariage', icon: '💒' },
        { value: 'baby', label: 'Naissance', icon: '👶' },
        { value: 'valentines', label: 'Saint-Valentin', icon: '❤️' },
        { value: 'mothers_day', label: 'Fête des mères', icon: '🌸' },
        { value: 'fathers_day', label: 'Fête des pères', icon: '👔' },
        { value: 'graduation', label: 'Diplôme', icon: '🎓' },
        { value: 'housewarming', label: 'Crémaillère', icon: '🏠' },
        { value: 'thank_you', label: 'Remerciement', icon: '🙏' },
        { value: 'autre', label: 'Autre', icon: '🎀' }
    ];

    const STATUSES = [
        { value: 'planned', label: 'Planifié', icon: '📋', color: '#0EA5E9' },
        { value: 'bought', label: 'Acheté', icon: '🛒', color: '#F59E0B' },
        { value: 'wrapped', label: 'Emballé', icon: '🎁', color: '#8B5CF6' },
        { value: 'given', label: 'Offert/Reçu', icon: '✅', color: '#22C55E' }
    ];

    function getTypeInfo(v) { return TYPES.find(t => t.value === v) || TYPES[0]; }
    function getOccasionInfo(v) { return OCCASIONS.find(o => o.value === v) || OCCASIONS[OCCASIONS.length - 1]; }
    function getStatusInfo(v) { return STATUSES.find(s => s.value === v) || STATUSES[0]; }

    function mapRow(r) {
        return {
            id: r.id, name: r.name || '', type: r.type || 'given',
            recipient: r.recipient || '', occasion: r.occasion || 'autre',
            status: r.status || 'planned', price: parseFloat(r.price) || 0,
            date: r.date || '', store: r.store || '', url: r.url || '',
            description: r.description || '', notes: r.notes || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            name: d.name, type: d.type, recipient: d.recipient,
            occasion: d.occasion, status: d.status, price: d.price,
            date: d.date, store: d.store, url: d.url,
            description: d.description, notes: d.notes, favorite: d.favorite
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'gift', item.id, `Cadeau: ${item.name}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'gift', id, `Cadeau modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'gift', id, 'Cadeau supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    async function getStats() {
        const all = await getAll();
        const given = all.filter(i => i.type === 'given');
        const received = all.filter(i => i.type === 'received');
        return {
            total: all.length,
            given: given.length,
            received: received.length,
            totalSpent: given.reduce((s, i) => s + i.price, 0).toFixed(2),
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Nom', 'Type', 'Destinataire', 'Occasion', 'Statut', 'Prix', 'Date'];
        const rows = items.map(i => [i.name, i.type, i.recipient, i.occasion, i.status, i.price, i.date]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gifts.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, getStats, exportCSV, TYPES, OCCASIONS, STATUSES, getTypeInfo, getOccasionInfo, getStatusInfo };
})();
