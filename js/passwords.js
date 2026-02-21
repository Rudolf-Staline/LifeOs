/* ===================================================================
   passwords.js — Mots de Passe Module
   Gestionnaire de mots de passe local (coffre-fort)
   =================================================================== */

const Passwords = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapEntry(row) {
        if (!row) return null;
        return {
            id: row.id,
            site: row.site || '',
            url: row.url || '',
            username: row.username || '',
            email: row.email || '',
            password: row.password || '',
            category: row.category || 'web',
            strength: row.strength || 'medium',
            twoFactor: !!row.two_factor || !!row.twoFactor,
            lastChanged: row.last_changed || row.lastChanged || '',
            expiresAt: row.expires_at || row.expiresAt || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-passwords-v1';
    let useLocalStorage = false;
    let localEntries = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('passwords').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localEntries = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntries)); }

    async function getAll() {
        if (useLocalStorage) return localEntries.map(mapEntry);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('passwords').select('*').eq('user_id', uid).order('site');
        return error ? [] : (data || []).map(mapEntry);
    }

    async function getById(id) {
        if (useLocalStorage) { const e = localEntries.find(x => x.id === id); return e ? mapEntry(e) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('passwords').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapEntry(data);
    }

    async function add(entry) {
        if (useLocalStorage) {
            const ne = { ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localEntries.unshift(ne); saveLocal(); return mapEntry(ne);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, site: entry.site, url: entry.url || '',
            username: entry.username || '', email: entry.email || '',
            password: entry.password || '', category: entry.category || 'web',
            strength: entry.strength || 'medium', two_factor: entry.twoFactor || false,
            last_changed: entry.lastChanged || null, expires_at: entry.expiresAt || null,
            notes: entry.notes || '', favorite: entry.favorite || false
        };
        const { data, error } = await supabaseClient.from('passwords').insert(row).select().single();
        return error ? null : mapEntry(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localEntries.findIndex(x => x.id === id); if (idx < 0) return null;
            localEntries[idx] = { ...localEntries[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapEntry(localEntries[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.site !== undefined) row.site = updates.site;
        if (updates.url !== undefined) row.url = updates.url;
        if (updates.username !== undefined) row.username = updates.username;
        if (updates.email !== undefined) row.email = updates.email;
        if (updates.password !== undefined) row.password = updates.password;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.strength !== undefined) row.strength = updates.strength;
        if (updates.twoFactor !== undefined) row.two_factor = updates.twoFactor;
        if (updates.lastChanged !== undefined) row.last_changed = updates.lastChanged;
        if (updates.expiresAt !== undefined) row.expires_at = updates.expiresAt;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('passwords').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapEntry(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localEntries = localEntries.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('passwords').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const e = await getById(id); if (!e) return null; return update(id, { favorite: !e.favorite }); }

    const CATEGORIES_LIST = [
        { value: 'web', label: 'Site web', icon: '🌐' },
        { value: 'email', label: 'Email', icon: '📧' },
        { value: 'social', label: 'Réseau social', icon: '👥' },
        { value: 'bank', label: 'Banque', icon: '🏦' },
        { value: 'shopping', label: 'Shopping', icon: '🛒' },
        { value: 'work', label: 'Travail', icon: '💼' },
        { value: 'gaming', label: 'Jeux', icon: '🎮' },
        { value: 'app', label: 'Application', icon: '📱' },
        { value: 'wifi', label: 'Wi-Fi', icon: '📶' },
        { value: 'autre', label: 'Autre', icon: '🔑' }
    ];

    const STRENGTHS = [
        { value: 'weak', label: 'Faible', icon: '🔴', color: '#EF4444' },
        { value: 'medium', label: 'Moyen', icon: '🟡', color: '#F59E0B' },
        { value: 'strong', label: 'Fort', icon: '🟢', color: '#22C55E' },
        { value: 'very_strong', label: 'Très fort', icon: '🛡️', color: '#6366F1' }
    ];

    function getCategoryInfo(val) { return CATEGORIES_LIST.find(c => c.value === val) || CATEGORIES_LIST[0]; }
    function getStrengthInfo(val) { return STRENGTHS.find(s => s.value === val) || STRENGTHS[1]; }

    function isExpired(entry) {
        if (!entry.expiresAt) return false;
        return new Date(entry.expiresAt) < new Date();
    }

    function isOld(entry) {
        if (!entry.lastChanged) return true;
        const days = Math.ceil((new Date() - new Date(entry.lastChanged)) / (1000 * 60 * 60 * 24));
        return days > 180;
    }

    function generatePassword(length = 16) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        let pwd = '';
        const arr = new Uint32Array(length);
        crypto.getRandomValues(arr);
        for (let i = 0; i < length; i++) pwd += chars[arr[i] % chars.length];
        return pwd;
    }

    function evaluateStrength(pwd) {
        if (!pwd) return 'weak';
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return 'weak';
        if (score <= 3) return 'medium';
        if (score <= 4) return 'strong';
        return 'very_strong';
    }

    function maskPassword(pwd) {
        if (!pwd) return '';
        return '•'.repeat(Math.min(pwd.length, 20));
    }

    async function getStats() {
        const all = await getAll();
        const weak = all.filter(e => e.strength === 'weak').length;
        const expired = all.filter(e => isExpired(e)).length;
        const with2FA = all.filter(e => e.twoFactor).length;
        return { total: all.length, weak, expired, with2FA };
    }

    function exportCSV(entries) {
        const header = 'Site,URL,Utilisateur,Email,Catégorie,Force,2FA,Dernier changement\n';
        const rows = entries.map(e => `"${e.site}","${e.url}","${e.username}","${e.email}","${e.category}","${e.strength}",${e.twoFactor},"${e.lastChanged}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mots-de-passe.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, isExpired, isOld, generatePassword, evaluateStrength, maskPassword,
        getCategoryInfo, getStrengthInfo,
        CATEGORIES_LIST, STRENGTHS
    };
})();
