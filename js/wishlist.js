// ===================================================================
//  MODULE : Wishlist (Liste de souhaits)
// ===================================================================
const Wishlist = (() => {
    const TABLE = 'wishlist';
    const LOCAL_KEY = 'monbudget_wishlist';
    let useSupabase = false;

    const CATEGORIES = [
        { value: 'tech', label: 'Tech', icon: '💻', color: '#0EA5E9' },
        { value: 'fashion', label: 'Mode', icon: '👗', color: '#EC4899' },
        { value: 'home', label: 'Maison', icon: '🏠', color: '#F59E0B' },
        { value: 'books', label: 'Livres', icon: '📚', color: '#8B5CF6' },
        { value: 'gaming', label: 'Jeux', icon: '🎮', color: '#EF4444' },
        { value: 'sport', label: 'Sport', icon: '⚽', color: '#22C55E' },
        { value: 'travel', label: 'Voyage', icon: '✈️', color: '#14B8A6' },
        { value: 'beauty', label: 'Beauté', icon: '💄', color: '#F472B6' },
        { value: 'food', label: 'Alimentation', icon: '🍽️', color: '#FB923C' },
        { value: 'autre', label: 'Autre', icon: '⭐', color: '#64748B' }
    ];

    const PRIORITIES = [
        { value: 'high', label: 'Haute', icon: '🔴', color: '#EF4444' },
        { value: 'medium', label: 'Moyenne', icon: '🟡', color: '#F59E0B' },
        { value: 'low', label: 'Basse', icon: '🟢', color: '#22C55E' }
    ];

    const STATUSES = [
        { value: 'wanted', label: 'Souhaité', icon: '⭐', color: '#F59E0B' },
        { value: 'saved', label: 'Économisé', icon: '💰', color: '#22C55E' },
        { value: 'bought', label: 'Acheté', icon: '✅', color: '#0EA5E9' },
        { value: 'gifted', label: 'Offert', icon: '🎁', color: '#A78BFA' },
        { value: 'abandoned', label: 'Abandonné', icon: '❌', color: '#EF4444' }
    ];

    function getCategoryInfo(v) { return CATEGORIES.find(c => c.value === v) || CATEGORIES[CATEGORIES.length - 1]; }
    function getPriorityInfo(v) { return PRIORITIES.find(p => p.value === v) || PRIORITIES[1]; }
    function getStatusInfo(v) { return STATUSES.find(s => s.value === v) || STATUSES[0]; }

    function mapRow(r) {
        return {
            id: r.id, name: r.name || '', category: r.category || 'autre',
            priority: r.priority || 'medium', status: r.status || 'wanted',
            price: parseFloat(r.price) || 0, savedAmount: parseFloat(r.saved_amount || r.savedAmount) || 0,
            url: r.url || '', store: r.store || '', image: r.image || '',
            addedDate: r.added_date || r.addedDate || '',
            purchaseDate: r.purchase_date || r.purchaseDate || '',
            description: r.description || '', notes: r.notes || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            name: d.name, category: d.category, priority: d.priority, status: d.status,
            price: d.price, saved_amount: d.savedAmount, url: d.url, store: d.store,
            image: d.image, added_date: d.addedDate, purchase_date: d.purchaseDate,
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'wishlist', item.id, `Souhait: ${item.name}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'wishlist', id, `Souhait modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'wishlist', id, 'Souhait supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    function getProgress(item) { return item.price > 0 ? Math.min(100, Math.round((item.savedAmount / item.price) * 100)) : 0; }

    async function getStats() {
        const all = await getAll();
        const wanted = all.filter(i => i.status === 'wanted');
        return {
            total: all.length,
            wanted: wanted.length,
            bought: all.filter(i => i.status === 'bought').length,
            totalValue: wanted.reduce((s, i) => s + i.price, 0).toFixed(2),
            totalSaved: all.reduce((s, i) => s + i.savedAmount, 0).toFixed(2),
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Nom', 'Catégorie', 'Priorité', 'Statut', 'Prix', 'Économisé', 'Magasin'];
        const rows = items.map(i => [i.name, i.category, i.priority, i.status, i.price, i.savedAmount, i.store]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'wishlist.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, getProgress, getStats, exportCSV, CATEGORIES, PRIORITIES, STATUSES, getCategoryInfo, getPriorityInfo, getStatusInfo };
})();
