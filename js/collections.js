// ===================================================================
//  MODULE : Collections
// ===================================================================
const Collections = (() => {
    const TABLE = 'collections';
    const LOCAL_KEY = 'monbudget_collections';
    let useSupabase = false;

    const TYPES = [
        { value: 'stamps', label: 'Timbres', icon: '📮', color: '#0EA5E9' },
        { value: 'coins', label: 'Monnaies', icon: '🪙', color: '#F59E0B' },
        { value: 'figurines', label: 'Figurines', icon: '🎭', color: '#8B5CF6' },
        { value: 'cards', label: 'Cartes', icon: '🃏', color: '#EF4444' },
        { value: 'art', label: 'Art', icon: '🎨', color: '#EC4899' },
        { value: 'vinyl', label: 'Vinyles', icon: '💿', color: '#14B8A6' },
        { value: 'comics', label: 'BD/Comics', icon: '📖', color: '#22C55E' },
        { value: 'toys', label: 'Jouets', icon: '🧸', color: '#FB923C' },
        { value: 'watches', label: 'Montres', icon: '⌚', color: '#10B981' },
        { value: 'minerals', label: 'Minéraux', icon: '💎', color: '#6366F1' },
        { value: 'autre', label: 'Autre', icon: '🎨', color: '#64748B' }
    ];

    const CONDITIONS = [
        { value: 'mint', label: 'Neuf', icon: '✨', color: '#22C55E' },
        { value: 'excellent', label: 'Excellent', icon: '👍', color: '#0EA5E9' },
        { value: 'good', label: 'Bon', icon: '👌', color: '#F59E0B' },
        { value: 'fair', label: 'Correct', icon: '🤏', color: '#FB923C' },
        { value: 'poor', label: 'Mauvais', icon: '👎', color: '#EF4444' }
    ];

    const RARITIES = [
        { value: 'common', label: 'Commun', icon: '⚪', color: '#64748B' },
        { value: 'uncommon', label: 'Peu commun', icon: '🟢', color: '#22C55E' },
        { value: 'rare', label: 'Rare', icon: '🔵', color: '#0EA5E9' },
        { value: 'very_rare', label: 'Très rare', icon: '🟣', color: '#8B5CF6' },
        { value: 'legendary', label: 'Légendaire', icon: '🟡', color: '#F59E0B' }
    ];

    function getTypeInfo(v) { return TYPES.find(t => t.value === v) || TYPES[TYPES.length - 1]; }
    function getConditionInfo(v) { return CONDITIONS.find(c => c.value === v) || CONDITIONS[2]; }
    function getRarityInfo(v) { return RARITIES.find(r => r.value === v) || RARITIES[0]; }

    function mapRow(r) {
        return {
            id: r.id, name: r.name || '', type: r.type || 'autre',
            item: r.item || '', condition: r.condition || 'good',
            rarity: r.rarity || 'common', year: r.year || '',
            value: parseFloat(r.value) || 0, purchasePrice: parseFloat(r.purchase_price || r.purchasePrice) || 0,
            quantity: parseInt(r.quantity) || 1, source: r.source || '',
            location: r.location || '', photo: r.photo || '',
            series: r.series || '', edition: r.edition || '',
            description: r.description || '', notes: r.notes || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            name: d.name, type: d.type, item: d.item, condition: d.condition,
            rarity: d.rarity, year: d.year, value: d.value, purchase_price: d.purchasePrice,
            quantity: d.quantity, source: d.source, location: d.location, photo: d.photo,
            series: d.series, edition: d.edition,
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'collection', item.id, `Collection: ${item.name}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'collection', id, `Collection modifiée`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'collection', id, 'Collection supprimée');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    function getAppreciation(item) {
        if (item.purchasePrice <= 0) return 0;
        return Math.round(((item.value - item.purchasePrice) / item.purchasePrice) * 100);
    }

    async function getStats() {
        const all = await getAll();
        return {
            total: all.length,
            totalItems: all.reduce((s, i) => s + i.quantity, 0),
            totalValue: all.reduce((s, i) => s + (i.value * i.quantity), 0).toFixed(2),
            types: [...new Set(all.map(i => i.type))].length,
            rare: all.filter(i => ['rare', 'very_rare', 'legendary'].includes(i.rarity)).length,
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Nom', 'Type', 'Objet', 'État', 'Rareté', 'Valeur', 'Quantité'];
        const rows = items.map(i => [i.name, i.type, i.item, i.condition, i.rarity, i.value, i.quantity]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'collections.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, getAppreciation, getStats, exportCSV, TYPES, CONDITIONS, RARITIES, getTypeInfo, getConditionInfo, getRarityInfo };
})();
