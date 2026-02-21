// ===================================================================
//  MODULE : Albums (Photos)
// ===================================================================
const Albums = (() => {
    const TABLE = 'albums';
    const LOCAL_KEY = 'monbudget_albums';
    let useSupabase = false;

    const CATEGORIES = [
        { value: 'travel', label: 'Voyage', icon: '✈️', color: '#0EA5E9' },
        { value: 'family', label: 'Famille', icon: '👨‍👩‍👧‍👦', color: '#EC4899' },
        { value: 'friends', label: 'Amis', icon: '👫', color: '#8B5CF6' },
        { value: 'event', label: 'Événement', icon: '🎉', color: '#F59E0B' },
        { value: 'nature', label: 'Nature', icon: '🌿', color: '#22C55E' },
        { value: 'food', label: 'Cuisine', icon: '🍽️', color: '#EF4444' },
        { value: 'pet', label: 'Animaux', icon: '🐾', color: '#D97706' },
        { value: 'art', label: 'Art', icon: '🎨', color: '#A78BFA' },
        { value: 'sport', label: 'Sport', icon: '⚽', color: '#10B981' },
        { value: 'autre', label: 'Autre', icon: '📷', color: '#64748B' }
    ];

    function getCategoryInfo(v) { return CATEGORIES.find(c => c.value === v) || CATEGORIES[CATEGORIES.length - 1]; }

    function mapRow(r) {
        return {
            id: r.id, title: r.title || '', category: r.category || 'autre',
            description: r.description || '', date: r.date || '',
            location: r.location || '', photoCount: parseInt(r.photo_count || r.photoCount) || 0,
            coverUrl: r.cover_url || r.coverUrl || '', storageSize: r.storage_size || r.storageSize || '',
            platform: r.platform || '', shared: r.shared || false,
            tags: r.tags || '', notes: r.notes || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            title: d.title, category: d.category, description: d.description,
            date: d.date, location: d.location, photo_count: d.photoCount,
            cover_url: d.coverUrl, storage_size: d.storageSize,
            platform: d.platform, shared: d.shared, tags: d.tags,
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'album', item.id, `Album: ${item.title}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'album', id, `Album modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'album', id, 'Album supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    async function getStats() {
        const all = await getAll();
        const totalPhotos = all.reduce((s, i) => s + i.photoCount, 0);
        return {
            total: all.length,
            totalPhotos,
            categories: [...new Set(all.map(i => i.category))].length,
            shared: all.filter(i => i.shared).length,
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Titre', 'Catégorie', 'Date', 'Lieu', 'Photos', 'Plateforme'];
        const rows = items.map(i => [i.title, i.category, i.date, i.location, i.photoCount, i.platform]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'albums.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, getStats, exportCSV, CATEGORIES, getCategoryInfo };
})();
