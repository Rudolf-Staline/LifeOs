/* ===================================================================
   contacts.js — Carnet d'Adresses Module
   Contacts personnels, groupes, anniversaires
   =================================================================== */

const Contacts = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapContact(row) {
        if (!row) return null;
        return {
            id: row.id,
            firstName: row.first_name || row.firstName || '',
            lastName: row.last_name || row.lastName || '',
            phone: row.phone || '',
            email: row.email || '',
            group: row.group_name || row.group || 'autre',
            company: row.company || '',
            birthday: row.birthday || '',
            address: row.address || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            avatar: row.avatar || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-contacts-v1';
    let useLocalStorage = false;
    let localContacts = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('contacts').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Contacts: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Contacts: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Contacts: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal()  { try { localContacts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localContacts = []; } }
    function saveLocal()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(localContacts)); }
    function genId()      { return 'ct_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    async function getAll() {
        if (useLocalStorage) return localContacts.map(c => ({...c}));
        const { data, error } = await supabaseClient.from('contacts').select('*')
            .eq('user_id', getUserId()).order('first_name', { ascending: true });
        return error ? [] : data.map(mapContact);
    }

    async function getById(id) {
        if (useLocalStorage) return localContacts.find(c => c.id === id) || null;
        const { data, error } = await supabaseClient.from('contacts').select('*')
            .eq('id', id).eq('user_id', getUserId()).single();
        return error ? null : mapContact(data);
    }

    async function add(contact) {
        const item = {
            first_name: contact.firstName || '',
            last_name: contact.lastName || '',
            phone: contact.phone || '',
            email: contact.email || '',
            group_name: contact.group || 'autre',
            company: contact.company || '',
            birthday: contact.birthday || '',
            address: contact.address || '',
            notes: contact.notes || '',
            favorite: !!contact.favorite,
            avatar: contact.avatar || ''
        };
        if (useLocalStorage) {
            const local = { id: genId(), ...item, firstName: item.first_name, lastName: item.last_name, group: item.group_name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            localContacts.push(local); saveLocal(); return local;
        }
        item.user_id = getUserId();
        const { data, error } = await supabaseClient.from('contacts').insert(item).select().single();
        return error ? null : mapContact(data);
    }

    async function update(id, changes) {
        const mapped = {};
        if (changes.firstName !== undefined) mapped.first_name = changes.firstName;
        if (changes.lastName !== undefined)  mapped.last_name = changes.lastName;
        if (changes.phone !== undefined)     mapped.phone = changes.phone;
        if (changes.email !== undefined)     mapped.email = changes.email;
        if (changes.group !== undefined)     mapped.group_name = changes.group;
        if (changes.company !== undefined)   mapped.company = changes.company;
        if (changes.birthday !== undefined)  mapped.birthday = changes.birthday;
        if (changes.address !== undefined)   mapped.address = changes.address;
        if (changes.notes !== undefined)     mapped.notes = changes.notes;
        if (changes.favorite !== undefined)  mapped.favorite = changes.favorite;
        if (changes.avatar !== undefined)    mapped.avatar = changes.avatar;

        if (useLocalStorage) {
            const idx = localContacts.findIndex(c => c.id === id);
            if (idx === -1) return null;
            Object.assign(localContacts[idx], changes, { updatedAt: new Date().toISOString() });
            saveLocal(); return localContacts[idx];
        }
        mapped.updated_at = new Date().toISOString();
        const { data, error } = await supabaseClient.from('contacts').update(mapped)
            .eq('id', id).eq('user_id', getUserId()).select().single();
        return error ? null : mapContact(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            localContacts = localContacts.filter(c => c.id !== id);
            saveLocal(); return true;
        }
        const { error } = await supabaseClient.from('contacts').delete()
            .eq('id', id).eq('user_id', getUserId());
        return !error;
    }

    async function toggleFavorite(id) {
        const contact = await getById(id);
        if (!contact) return null;
        return await update(id, { favorite: !contact.favorite });
    }

    // ===== Helpers =====
    const GROUPS = [
        { value: 'famille',    label: 'Famille',       icon: '👨‍👩‍👧‍👦', color: '#F59E0B' },
        { value: 'ami',        label: 'Ami(e)',         icon: '🤝',     color: '#22C55E' },
        { value: 'travail',    label: 'Travail',        icon: '💼',     color: '#3B82F6' },
        { value: 'voisin',     label: 'Voisin(e)',      icon: '🏘️',     color: '#06B6D4' },
        { value: 'scolaire',   label: 'École/Études',   icon: '🎓',     color: '#A78BFA' },
        { value: 'sante',      label: 'Santé',          icon: '🏥',     color: '#EF4444' },
        { value: 'service',    label: 'Service/Pro',    icon: '🔧',     color: '#F97316' },
        { value: 'autre',      label: 'Autre',          icon: '📋',     color: '#64748B' }
    ];

    function getGroupInfo(val) { return GROUPS.find(g => g.value === val) || GROUPS[GROUPS.length - 1]; }

    function getFullName(contact) {
        return `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Sans nom';
    }

    function getInitials(contact) {
        const f = (contact.firstName || '')[0] || '';
        const l = (contact.lastName || '')[0] || '';
        return (f + l).toUpperCase() || '?';
    }

    function formatBirthday(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    }

    function getUpcomingBirthdays(contacts, days = 30) {
        const today = new Date();
        const upcoming = [];
        contacts.forEach(c => {
            if (!c.birthday) return;
            const bd = new Date(c.birthday + 'T00:00:00');
            const next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
            if (next < today) next.setFullYear(next.getFullYear() + 1);
            const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
            if (diff <= days) upcoming.push({ ...c, daysUntil: diff });
        });
        return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    }

    async function getStats() {
        const all = await getAll();
        const groups = new Set(all.map(c => c.group));
        const withBirthday = all.filter(c => c.birthday).length;
        const favorites = all.filter(c => c.favorite).length;
        return { total: all.length, groups: groups.size, birthdays: withBirthday, favorites };
    }

    function exportCSV(contacts) {
        const headers = ['Prénom', 'Nom', 'Téléphone', 'Email', 'Groupe', 'Entreprise', 'Anniversaire', 'Adresse'];
        const rows = contacts.map(c => [c.firstName, c.lastName, c.phone, c.email, c.group, c.company, c.birthday, c.address]);
        return [headers, ...rows].map(r => r.join(',')).join('\n');
    }

    return {
        initStorage, getAll, getById, add, update, remove,
        toggleFavorite, getGroupInfo, getFullName, getInitials,
        formatBirthday, getUpcomingBirthdays, getStats, exportCSV, GROUPS
    };
})();
