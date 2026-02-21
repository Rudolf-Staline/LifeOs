// ===================================================================
//  MODULE : Documents
// ===================================================================
const Documents = (() => {
    const TABLE = 'documents';
    const LOCAL_KEY = 'monbudget_documents';
    let useSupabase = false;

    const TYPES = [
        { value: 'id', label: 'Pièce d\'identité', icon: '🪪', color: '#0EA5E9' },
        { value: 'passport', label: 'Passeport', icon: '🛂', color: '#8B5CF6' },
        { value: 'contract', label: 'Contrat', icon: '📑', color: '#22C55E' },
        { value: 'invoice', label: 'Facture', icon: '🧾', color: '#F59E0B' },
        { value: 'certificate', label: 'Certificat', icon: '📜', color: '#14B8A6' },
        { value: 'insurance', label: 'Assurance', icon: '🛡️', color: '#EC4899' },
        { value: 'tax', label: 'Fiscal', icon: '🏛️', color: '#EF4444' },
        { value: 'medical', label: 'Médical', icon: '🏥', color: '#F472B6' },
        { value: 'warranty', label: 'Garantie', icon: '✅', color: '#10B981' },
        { value: 'license', label: 'Permis/Licence', icon: '🪪', color: '#FB923C' },
        { value: 'autre', label: 'Autre', icon: '📝', color: '#64748B' }
    ];

    const STATUSES = [
        { value: 'valid', label: 'Valide', icon: '✅', color: '#22C55E' },
        { value: 'expiring', label: 'Expire bientôt', icon: '⚠️', color: '#F59E0B' },
        { value: 'expired', label: 'Expiré', icon: '❌', color: '#EF4444' },
        { value: 'archived', label: 'Archivé', icon: '📦', color: '#64748B' }
    ];

    function getTypeInfo(v) { return TYPES.find(t => t.value === v) || TYPES[TYPES.length - 1]; }
    function getStatusInfo(v) { return STATUSES.find(s => s.value === v) || STATUSES[0]; }

    function mapRow(r) {
        return {
            id: r.id, title: r.title || '', type: r.type || 'autre',
            issuer: r.issuer || '', number: r.number || '',
            issueDate: r.issue_date || r.issueDate || '',
            expiryDate: r.expiry_date || r.expiryDate || '',
            status: r.status || 'valid', location: r.location || '',
            digitalCopy: r.digital_copy || r.digitalCopy || '',
            holder: r.holder || '', description: r.description || '',
            reminderDays: parseInt(r.reminder_days || r.reminderDays) || 30,
            notes: r.notes || '', favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            title: d.title, type: d.type, issuer: d.issuer, number: d.number,
            issue_date: d.issueDate, expiry_date: d.expiryDate, status: d.status,
            location: d.location, digital_copy: d.digitalCopy, holder: d.holder,
            description: d.description, reminder_days: d.reminderDays,
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'document', item.id, `Document: ${item.title}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'document', id, `Document modifié`);
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'document', id, 'Document supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { favorite: !item.favorite }); }

    function isExpiringSoon(item) {
        if (!item.expiryDate) return false;
        const days = (new Date(item.expiryDate) - new Date()) / 86400000;
        return days >= 0 && days <= item.reminderDays;
    }

    function isExpired(item) {
        if (!item.expiryDate) return false;
        return new Date(item.expiryDate) < new Date();
    }

    async function getStats() {
        const all = await getAll();
        return {
            total: all.length,
            valid: all.filter(i => i.status === 'valid').length,
            expiringSoon: all.filter(i => isExpiringSoon(i)).length,
            expired: all.filter(i => isExpired(i)).length,
            types: [...new Set(all.map(i => i.type))].length,
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Titre', 'Type', 'Émetteur', 'Numéro', 'Émission', 'Expiration', 'Statut'];
        const rows = items.map(i => [i.title, i.type, i.issuer, i.number, i.issueDate, i.expiryDate, i.status]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'documents.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, isExpiringSoon, isExpired, getStats, exportCSV, TYPES, STATUSES, getTypeInfo, getStatusInfo };
})();
