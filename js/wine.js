// ===================================================================
//  MODULE : Wine (Cave à vin)
// ===================================================================
const Wine = (() => {
    const TABLE = 'wines';
    const LOCAL_KEY = 'monbudget_wines';
    let useSupabase = false;

    const TYPES = [
        { value: 'red', label: 'Rouge', icon: '🍷', color: '#991B1B' },
        { value: 'white', label: 'Blanc', icon: '🥂', color: '#FDE68A' },
        { value: 'rose', label: 'Rosé', icon: '🌸', color: '#F9A8D4' },
        { value: 'sparkling', label: 'Pétillant', icon: '🍾', color: '#FCD34D' },
        { value: 'dessert', label: 'Dessert', icon: '🍯', color: '#D97706' },
        { value: 'autre', label: 'Autre', icon: '🍇', color: '#8B5CF6' }
    ];

    const REGIONS = [
        { value: 'bordeaux', label: 'Bordeaux' }, { value: 'bourgogne', label: 'Bourgogne' },
        { value: 'champagne', label: 'Champagne' }, { value: 'rhone', label: 'Rhône' },
        { value: 'loire', label: 'Loire' }, { value: 'alsace', label: 'Alsace' },
        { value: 'provence', label: 'Provence' }, { value: 'languedoc', label: 'Languedoc' },
        { value: 'italie', label: 'Italie' }, { value: 'espagne', label: 'Espagne' },
        { value: 'maroc', label: 'Maroc' }, { value: 'autre', label: 'Autre' }
    ];

    function getTypeInfo(v) { return TYPES.find(t => t.value === v) || TYPES[TYPES.length - 1]; }
    function getRegionInfo(v) { return REGIONS.find(r => r.value === v) || REGIONS[REGIONS.length - 1]; }

    function mapRow(r) {
        return {
            id: r.id, name: r.name || '', type: r.type || 'red',
            region: r.region || 'autre', appellation: r.appellation || '',
            vintage: parseInt(r.vintage) || 0, producer: r.producer || '',
            grape: r.grape || '', price: parseFloat(r.price) || 0,
            quantity: parseInt(r.quantity) || 0, rating: parseInt(r.rating) || 0,
            drinkBefore: r.drink_before || r.drinkBefore || '',
            purchaseDate: r.purchase_date || r.purchaseDate || '',
            location: r.location || '', notes: r.notes || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            name: d.name, type: d.type, region: d.region, appellation: d.appellation,
            vintage: d.vintage, producer: d.producer, grape: d.grape, price: d.price,
            quantity: d.quantity, rating: d.rating, drink_before: d.drinkBefore,
            purchase_date: d.purchaseDate, location: d.location, notes: d.notes, favorite: d.favorite
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'wine', item.id, `Vin: ${item.name}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'wine', id, `Vin modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'wine', id, 'Vin supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    async function drinkBottle(id) {
        const item = await getById(id);
        if (item && item.quantity > 0) return update(id, { quantity: item.quantity - 1 });
    }

    async function getStats() {
        const all = await getAll();
        const totalBottles = all.reduce((s, i) => s + i.quantity, 0);
        const totalValue = all.reduce((s, i) => s + (i.price * i.quantity), 0);
        return {
            total: all.length,
            bottles: totalBottles,
            totalValue: totalValue.toFixed(2),
            types: [...new Set(all.map(i => i.type))].length,
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Nom', 'Type', 'Région', 'Millésime', 'Producteur', 'Prix', 'Quantité', 'Note'];
        const rows = items.map(i => [i.name, i.type, i.region, i.vintage, i.producer, i.price, i.quantity, i.rating]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'wines.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, drinkBottle, getStats, exportCSV, TYPES, REGIONS, getTypeInfo, getRegionInfo };
})();
