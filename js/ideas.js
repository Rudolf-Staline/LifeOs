/* ===================================================================
   ideas.js — Idées & Brainstorming Module
   Capture d'idées, catégories, priorités, statuts
   =================================================================== */

const Ideas = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapIdea(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            category: row.category || 'general',
            description: row.description || '',
            priority: row.priority || 'normal',
            status: row.status || 'new',
            impact: row.impact || 'medium',
            effort: row.effort || 'medium',
            tags: row.tags || '',
            dueDate: row.due_date || row.dueDate || '',
            source: row.source || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-ideas-v1';
    let useLocalStorage = false;
    let localIdeas = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('ideas').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localIdeas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localIdeas = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localIdeas)); }

    async function getAll() {
        if (useLocalStorage) return localIdeas.map(mapIdea);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('ideas').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapIdea);
    }

    async function getById(id) {
        if (useLocalStorage) { const i = localIdeas.find(x => x.id === id); return i ? mapIdea(i) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('ideas').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapIdea(data);
    }

    async function add(idea) {
        if (useLocalStorage) {
            const ni = { ...idea, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localIdeas.unshift(ni); saveLocal(); return mapIdea(ni);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: idea.title, category: idea.category || 'general',
            description: idea.description || '', priority: idea.priority || 'normal',
            status: idea.status || 'new', impact: idea.impact || 'medium',
            effort: idea.effort || 'medium', tags: idea.tags || '',
            due_date: idea.dueDate || null, source: idea.source || '',
            notes: idea.notes || '', favorite: idea.favorite || false
        };
        const { data, error } = await supabaseClient.from('ideas').insert(row).select().single();
        return error ? null : mapIdea(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localIdeas.findIndex(x => x.id === id); if (idx < 0) return null;
            localIdeas[idx] = { ...localIdeas[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapIdea(localIdeas[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.priority !== undefined) row.priority = updates.priority;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.impact !== undefined) row.impact = updates.impact;
        if (updates.effort !== undefined) row.effort = updates.effort;
        if (updates.tags !== undefined) row.tags = updates.tags;
        if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
        if (updates.source !== undefined) row.source = updates.source;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('ideas').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapIdea(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localIdeas = localIdeas.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('ideas').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const i = await getById(id); if (!i) return null; return update(id, { favorite: !i.favorite }); }

    const CATEGORIES = [
        { value: 'general', label: 'Général', icon: '💡' },
        { value: 'business', label: 'Business', icon: '💼' },
        { value: 'tech', label: 'Tech', icon: '💻' },
        { value: 'creative', label: 'Créatif', icon: '🎨' },
        { value: 'personal', label: 'Personnel', icon: '👤' },
        { value: 'travel', label: 'Voyage', icon: '✈️' },
        { value: 'food', label: 'Cuisine', icon: '🍳' },
        { value: 'gift', label: 'Cadeau', icon: '🎁' },
        { value: 'improvement', label: 'Amélioration', icon: '📈' },
        { value: 'autre', label: 'Autre', icon: '📌' }
    ];

    const STATUSES = [
        { value: 'new', label: 'Nouvelle', icon: '💡', color: '#6366F1' },
        { value: 'exploring', label: 'En exploration', icon: '🔍', color: '#F59E0B' },
        { value: 'in_progress', label: 'En cours', icon: '▶️', color: '#A78BFA' },
        { value: 'realized', label: 'Réalisée', icon: '✅', color: '#22C55E' },
        { value: 'archived', label: 'Archivée', icon: '📁', color: '#64748B' },
        { value: 'rejected', label: 'Rejetée', icon: '❌', color: '#EF4444' }
    ];

    const PRIORITIES = [
        { value: 'low', label: 'Basse', icon: '🟢', color: '#22C55E' },
        { value: 'normal', label: 'Normale', icon: '🟡', color: '#F59E0B' },
        { value: 'high', label: 'Haute', icon: '🟠', color: '#F97316' },
        { value: 'critical', label: 'Critique', icon: '🔴', color: '#EF4444' }
    ];

    function getCategoryInfo(val) { return CATEGORIES.find(c => c.value === val) || CATEGORIES[0]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }
    function getPriorityInfo(val) { return PRIORITIES.find(p => p.value === val) || PRIORITIES[1]; }

    async function getStats() {
        const all = await getAll();
        const active = all.filter(i => ['new', 'exploring', 'in_progress'].includes(i.status)).length;
        const realized = all.filter(i => i.status === 'realized').length;
        return { total: all.length, active, realized, favorites: all.filter(i => i.favorite).length };
    }

    function exportCSV(ideas) {
        const header = 'Titre,Catégorie,Priorité,Statut,Impact,Effort,Tags,Source\n';
        const rows = ideas.map(i => `"${i.title}","${i.category}","${i.priority}","${i.status}","${i.impact}","${i.effort}","${i.tags}","${i.source}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'idees.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, getCategoryInfo, getStatusInfo, getPriorityInfo,
        CATEGORIES, STATUSES, PRIORITIES
    };
})();
