// ===================================================================
//  MODULE : Subscriptions (Abonnements)
// ===================================================================
const Subscriptions = (() => {
    const TABLE = 'subscriptions';
    const LOCAL_KEY = 'monbudget_subscriptions';
    let useSupabase = false;

    const CATEGORIES = [
        { value: 'streaming', label: 'Streaming', icon: '📺', color: '#EF4444' },
        { value: 'music', label: 'Musique', icon: '🎵', color: '#8B5CF6' },
        { value: 'cloud', label: 'Cloud/Stockage', icon: '☁️', color: '#0EA5E9' },
        { value: 'gaming', label: 'Gaming', icon: '🎮', color: '#22C55E' },
        { value: 'news', label: 'Presse/Actualités', icon: '📰', color: '#F59E0B' },
        { value: 'software', label: 'Logiciel', icon: '💻', color: '#6366F1' },
        { value: 'fitness', label: 'Sport/Fitness', icon: '🏋️', color: '#10B981' },
        { value: 'education', label: 'Éducation', icon: '🎓', color: '#EC4899' },
        { value: 'telecom', label: 'Télécom', icon: '📱', color: '#14B8A6' },
        { value: 'insurance', label: 'Assurance', icon: '🛡️', color: '#F97316' },
        { value: 'autre', label: 'Autre', icon: '📋', color: '#64748B' }
    ];

    const FREQUENCIES = [
        { value: 'monthly', label: 'Mensuel', icon: '📅' },
        { value: 'quarterly', label: 'Trimestriel', icon: '📆' },
        { value: 'yearly', label: 'Annuel', icon: '🗓️' },
        { value: 'weekly', label: 'Hebdomadaire', icon: '📋' }
    ];

    const STATUSES = [
        { value: 'active', label: 'Actif', icon: '✅', color: '#22C55E' },
        { value: 'paused', label: 'En pause', icon: '⏸️', color: '#F59E0B' },
        { value: 'cancelled', label: 'Annulé', icon: '❌', color: '#EF4444' },
        { value: 'trial', label: 'Essai', icon: '🆓', color: '#0EA5E9' }
    ];

    function getCategoryInfo(v) { return CATEGORIES.find(c => c.value === v) || CATEGORIES[CATEGORIES.length - 1]; }
    function getFrequencyInfo(v) { return FREQUENCIES.find(f => f.value === v) || FREQUENCIES[0]; }
    function getStatusInfo(v) { return STATUSES.find(s => s.value === v) || STATUSES[0]; }

    function mapRow(r) {
        return {
            id: r.id, name: r.name || '', provider: r.provider || '',
            category: r.category || 'autre', price: parseFloat(r.price) || 0,
            frequency: r.frequency || 'monthly', status: r.status || 'active',
            startDate: r.start_date || r.startDate || '',
            renewalDate: r.renewal_date || r.renewalDate || '',
            cancelDate: r.cancel_date || r.cancelDate || '',
            url: r.url || '', autoRenew: r.auto_renew ?? r.autoRenew ?? true,
            paymentMethod: r.payment_method || r.paymentMethod || '',
            notes: r.notes || '', favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            name: d.name, provider: d.provider, category: d.category,
            price: d.price, frequency: d.frequency, status: d.status,
            start_date: d.startDate, renewal_date: d.renewalDate,
            cancel_date: d.cancelDate, url: d.url, auto_renew: d.autoRenew,
            payment_method: d.paymentMethod, notes: d.notes, favorite: d.favorite
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

    async function getById(id) {
        const all = await getAll();
        return all.find(i => i.id === id) || null;
    }

    async function add(d) {
        const item = mapRow({ ...d, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        if (useSupabase) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const { error } = await supabaseClient.from(TABLE).insert({ ...toRow(item), id: item.id, user_id: session.user.id });
            if (error) { console.error(error); return null; }
        } else { const all = _local(); all.unshift(item); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'subscription', item.id, `Abonnement: ${item.name}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'subscription', id, `Abonnement modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'subscription', id, 'Abonnement supprimé');
        return true;
    }

    async function toggleFavorite(id) {
        const item = await getById(id);
        if (item) return update(id, { favorite: !item.favorite });
    }

    function getMonthlyPrice(item) {
        const p = item.price || 0;
        switch (item.frequency) {
            case 'weekly': return p * 4.33;
            case 'quarterly': return p / 3;
            case 'yearly': return p / 12;
            default: return p;
        }
    }

    function getAnnualPrice(item) { return getMonthlyPrice(item) * 12; }

    function isRenewalSoon(item) {
        if (!item.renewalDate) return false;
        const days = (new Date(item.renewalDate) - new Date()) / 86400000;
        return days >= 0 && days <= 7;
    }

    async function getStats() {
        const all = await getAll();
        const active = all.filter(i => i.status === 'active');
        const monthlyTotal = active.reduce((s, i) => s + getMonthlyPrice(i), 0);
        return {
            total: all.length,
            active: active.length,
            monthlyTotal: monthlyTotal.toFixed(2),
            yearlyTotal: (monthlyTotal * 12).toFixed(2),
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Nom', 'Fournisseur', 'Catégorie', 'Prix', 'Fréquence', 'Statut', 'Début', 'Renouvellement'];
        const rows = items.map(i => [i.name, i.provider, i.category, i.price, i.frequency, i.status, i.startDate, i.renewalDate]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'subscriptions.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, getStats, exportCSV, CATEGORIES, FREQUENCIES, STATUSES, getCategoryInfo, getFrequencyInfo, getStatusInfo, getMonthlyPrice, getAnnualPrice, isRenewalSoon };
})();
