/* ===================================================================
   projects.js — Projets Module
   Gestion de projets, tâches, deadlines, progression
   =================================================================== */

const Projects = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapProject(row) {
        if (!row) return null;
        return {
            id: row.id,
            name: row.name || '',
            description: row.description || '',
            category: row.category || 'personal',
            status: row.status || 'planning',
            priority: row.priority || 'normal',
            progress: parseInt(row.progress || 0),
            startDate: row.start_date || row.startDate || '',
            deadline: row.deadline || '',
            completedDate: row.completed_date || row.completedDate || '',
            budget: parseFloat(row.budget || 0),
            spent: parseFloat(row.spent || 0),
            client: row.client || '',
            team: row.team || '',
            tags: row.tags || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-projects-v1';
    let useLocalStorage = false;
    let localProjects = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('projects').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localProjects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localProjects = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localProjects)); }

    async function getAll() {
        if (useLocalStorage) return localProjects.map(mapProject);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('projects').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapProject);
    }

    async function getById(id) {
        if (useLocalStorage) { const p = localProjects.find(x => x.id === id); return p ? mapProject(p) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('projects').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapProject(data);
    }

    async function add(project) {
        if (useLocalStorage) {
            const np = { ...project, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localProjects.unshift(np); saveLocal(); return mapProject(np);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, name: project.name, description: project.description || '',
            category: project.category || 'personal', status: project.status || 'planning',
            priority: project.priority || 'normal', progress: project.progress || 0,
            start_date: project.startDate || null, deadline: project.deadline || null,
            completed_date: project.completedDate || null, budget: project.budget || 0,
            spent: project.spent || 0, client: project.client || '',
            team: project.team || '', tags: project.tags || '',
            notes: project.notes || '', favorite: project.favorite || false
        };
        const { data, error } = await supabaseClient.from('projects').insert(row).select().single();
        return error ? null : mapProject(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localProjects.findIndex(x => x.id === id); if (idx < 0) return null;
            localProjects[idx] = { ...localProjects[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapProject(localProjects[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.name !== undefined) row.name = updates.name;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.priority !== undefined) row.priority = updates.priority;
        if (updates.progress !== undefined) row.progress = updates.progress;
        if (updates.startDate !== undefined) row.start_date = updates.startDate;
        if (updates.deadline !== undefined) row.deadline = updates.deadline;
        if (updates.completedDate !== undefined) row.completed_date = updates.completedDate;
        if (updates.budget !== undefined) row.budget = updates.budget;
        if (updates.spent !== undefined) row.spent = updates.spent;
        if (updates.client !== undefined) row.client = updates.client;
        if (updates.team !== undefined) row.team = updates.team;
        if (updates.tags !== undefined) row.tags = updates.tags;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('projects').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapProject(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localProjects = localProjects.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('projects').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const p = await getById(id); if (!p) return null; return update(id, { favorite: !p.favorite }); }

    const CATEGORIES = [
        { value: 'personal', label: 'Personnel', icon: '👤' },
        { value: 'work', label: 'Travail', icon: '💼' },
        { value: 'side_project', label: 'Side project', icon: '🚀' },
        { value: 'freelance', label: 'Freelance', icon: '💻' },
        { value: 'community', label: 'Communauté', icon: '🤝' },
        { value: 'education', label: 'Éducation', icon: '🎓' },
        { value: 'autre', label: 'Autre', icon: '📋' }
    ];

    const STATUSES = [
        { value: 'planning', label: 'Planification', icon: '📋', color: '#64748B' },
        { value: 'active', label: 'Actif', icon: '▶️', color: '#6366F1' },
        { value: 'on_hold', label: 'En pause', icon: '⏸️', color: '#F59E0B' },
        { value: 'completed', label: 'Terminé', icon: '✅', color: '#22C55E' },
        { value: 'cancelled', label: 'Annulé', icon: '❌', color: '#EF4444' }
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

    function isOverdue(project) {
        if (!project.deadline || project.status === 'completed' || project.status === 'cancelled') return false;
        return new Date(project.deadline) < new Date();
    }

    function getDaysUntilDeadline(project) {
        if (!project.deadline) return null;
        return Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    }

    function getBudgetUsage(project) {
        if (!project.budget) return 0;
        return Math.round((project.spent / project.budget) * 100);
    }

    async function getStats() {
        const all = await getAll();
        const active = all.filter(p => p.status === 'active').length;
        const completed = all.filter(p => p.status === 'completed').length;
        const overdue = all.filter(p => isOverdue(p)).length;
        return { total: all.length, active, completed, overdue };
    }

    function exportCSV(projects) {
        const header = 'Nom,Catégorie,Statut,Priorité,Progression,Début,Deadline,Budget,Dépensé\n';
        const rows = projects.map(p => `"${p.name}","${p.category}","${p.status}","${p.priority}",${p.progress},"${p.startDate}","${p.deadline}",${p.budget},${p.spent}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'projets.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, isOverdue, getDaysUntilDeadline, getBudgetUsage,
        getCategoryInfo, getStatusInfo, getPriorityInfo,
        CATEGORIES, STATUSES, PRIORITIES
    };
})();
