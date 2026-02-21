// ===================================================================
//  MODULE : Podcasts
// ===================================================================
const Podcasts = (() => {
    const TABLE = 'podcasts';
    const LOCAL_KEY = 'monbudget_podcasts';
    let useSupabase = false;

    const CATEGORIES = [
        { value: 'tech', label: 'Tech', icon: '💻', color: '#0EA5E9' },
        { value: 'business', label: 'Business', icon: '💼', color: '#22C55E' },
        { value: 'science', label: 'Science', icon: '🔬', color: '#8B5CF6' },
        { value: 'culture', label: 'Culture', icon: '🎭', color: '#EC4899' },
        { value: 'comedy', label: 'Comédie', icon: '😂', color: '#F59E0B' },
        { value: 'news', label: 'Actualités', icon: '📰', color: '#EF4444' },
        { value: 'history', label: 'Histoire', icon: '📜', color: '#D97706' },
        { value: 'health', label: 'Santé', icon: '💊', color: '#10B981' },
        { value: 'education', label: 'Éducation', icon: '🎓', color: '#6366F1' },
        { value: 'music', label: 'Musique', icon: '🎵', color: '#A78BFA' },
        { value: 'autre', label: 'Autre', icon: '🎧', color: '#64748B' }
    ];

    const STATUSES = [
        { value: 'listening', label: 'En cours', icon: '▶️', color: '#22C55E' },
        { value: 'queued', label: 'En file', icon: '📋', color: '#0EA5E9' },
        { value: 'finished', label: 'Terminé', icon: '✅', color: '#8B5CF6' },
        { value: 'dropped', label: 'Abandonné', icon: '⏹️', color: '#EF4444' }
    ];

    function getCategoryInfo(v) { return CATEGORIES.find(c => c.value === v) || CATEGORIES[CATEGORIES.length - 1]; }
    function getStatusInfo(v) { return STATUSES.find(s => s.value === v) || STATUSES[0]; }

    function mapRow(r) {
        return {
            id: r.id, title: r.title || '', host: r.host || '',
            category: r.category || 'autre', platform: r.platform || '',
            status: r.status || 'queued', rating: parseInt(r.rating) || 0,
            episodesTotal: parseInt(r.episodes_total || r.episodesTotal) || 0,
            episodesListened: parseInt(r.episodes_listened || r.episodesListened) || 0,
            url: r.url || '', startDate: r.start_date || r.startDate || '',
            frequency: r.frequency || '', notes: r.notes || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            title: d.title, host: d.host, category: d.category,
            platform: d.platform, status: d.status, rating: d.rating,
            episodes_total: d.episodesTotal, episodes_listened: d.episodesListened,
            url: d.url, start_date: d.startDate, frequency: d.frequency,
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'podcast', item.id, `Podcast: ${item.title}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'podcast', id, `Podcast modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'podcast', id, 'Podcast supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    async function getStats() {
        const all = await getAll();
        return {
            total: all.length,
            listening: all.filter(i => i.status === 'listening').length,
            finished: all.filter(i => i.status === 'finished').length,
            avgRating: all.filter(i => i.rating).length ? (all.reduce((s, i) => s + i.rating, 0) / all.filter(i => i.rating).length).toFixed(1) : '0',
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Titre', 'Animateur', 'Catégorie', 'Plateforme', 'Statut', 'Note', 'Épisodes'];
        const rows = items.map(i => [i.title, i.host, i.category, i.platform, i.status, i.rating, `${i.episodesListened}/${i.episodesTotal}`]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'podcasts.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, getStats, exportCSV, CATEGORIES, STATUSES, getCategoryInfo, getStatusInfo };
})();
