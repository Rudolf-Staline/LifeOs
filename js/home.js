/* ===================================================================
   home.js — Maison & Entretien Module
   Tâches de maintenance, réparations, pièces, coûts
   =================================================================== */

const Home = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapTask(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            room: row.room || 'autre',
            category: row.category || 'maintenance',
            priority: row.priority || 'normal',
            status: row.status || 'todo',
            dueDate: row.due_date || row.dueDate || '',
            completedDate: row.completed_date || row.completedDate || '',
            frequency: row.frequency || '',
            cost: parseFloat(row.cost || 0),
            contractor: row.contractor || '',
            contractorPhone: row.contractor_phone || row.contractorPhone || '',
            description: row.description || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-home-v1';
    let useLocalStorage = false;
    let localTasks = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('home_tasks').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localTasks = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localTasks)); }

    async function getAll() {
        if (useLocalStorage) return localTasks.map(mapTask);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('home_tasks').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapTask);
    }

    async function getById(id) {
        if (useLocalStorage) { const t = localTasks.find(x => x.id === id); return t ? mapTask(t) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('home_tasks').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapTask(data);
    }

    async function add(task) {
        if (useLocalStorage) {
            const nt = { ...task, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localTasks.unshift(nt); saveLocal(); return mapTask(nt);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: task.title, room: task.room || 'autre',
            category: task.category || 'maintenance', priority: task.priority || 'normal',
            status: task.status || 'todo', due_date: task.dueDate || null,
            completed_date: task.completedDate || null, frequency: task.frequency || '',
            cost: task.cost || 0, contractor: task.contractor || '',
            contractor_phone: task.contractorPhone || '', description: task.description || '',
            notes: task.notes || '', favorite: task.favorite || false
        };
        const { data, error } = await supabaseClient.from('home_tasks').insert(row).select().single();
        return error ? null : mapTask(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localTasks.findIndex(x => x.id === id); if (idx < 0) return null;
            localTasks[idx] = { ...localTasks[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapTask(localTasks[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.room !== undefined) row.room = updates.room;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.priority !== undefined) row.priority = updates.priority;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.dueDate !== undefined) row.due_date = updates.dueDate;
        if (updates.completedDate !== undefined) row.completed_date = updates.completedDate;
        if (updates.frequency !== undefined) row.frequency = updates.frequency;
        if (updates.cost !== undefined) row.cost = updates.cost;
        if (updates.contractor !== undefined) row.contractor = updates.contractor;
        if (updates.contractorPhone !== undefined) row.contractor_phone = updates.contractorPhone;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('home_tasks').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapTask(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localTasks = localTasks.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('home_tasks').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const t = await getById(id); if (!t) return null; return update(id, { favorite: !t.favorite }); }

    async function completeTask(id) {
        return update(id, { status: 'done', completedDate: new Date().toISOString().split('T')[0] });
    }

    const ROOMS = [
        { value: 'salon', label: 'Salon', icon: '🛋️' },
        { value: 'cuisine', label: 'Cuisine', icon: '🍳' },
        { value: 'chambre', label: 'Chambre', icon: '🛏️' },
        { value: 'sdb', label: 'Salle de bain', icon: '🚿' },
        { value: 'bureau', label: 'Bureau', icon: '💻' },
        { value: 'garage', label: 'Garage', icon: '🚗' },
        { value: 'jardin', label: 'Jardin', icon: '🌳' },
        { value: 'balcon', label: 'Balcon', icon: '🌤️' },
        { value: 'cave', label: 'Cave', icon: '🏚️' },
        { value: 'autre', label: 'Autre', icon: '🏠' }
    ];

    const TASK_CATEGORIES = [
        { value: 'maintenance', label: 'Entretien', icon: '🔧' },
        { value: 'repair', label: 'Réparation', icon: '🛠️' },
        { value: 'cleaning', label: 'Nettoyage', icon: '🧹' },
        { value: 'renovation', label: 'Rénovation', icon: '🏗️' },
        { value: 'plumbing', label: 'Plomberie', icon: '🚰' },
        { value: 'electrical', label: 'Électricité', icon: '⚡' },
        { value: 'painting', label: 'Peinture', icon: '🎨' },
        { value: 'garden', label: 'Jardinage', icon: '🌱' },
        { value: 'security', label: 'Sécurité', icon: '🔒' },
        { value: 'autre', label: 'Autre', icon: '📋' }
    ];

    const STATUSES = [
        { value: 'todo', label: 'À faire', icon: '📝', color: '#6366F1' },
        { value: 'in_progress', label: 'En cours', icon: '🔨', color: '#F59E0B' },
        { value: 'waiting', label: 'En attente', icon: '⏳', color: '#94A3B8' },
        { value: 'done', label: 'Terminé', icon: '✅', color: '#22C55E' }
    ];

    const PRIORITIES = [
        { value: 'low', label: 'Basse', icon: '🟢', color: '#22C55E' },
        { value: 'normal', label: 'Normale', icon: '🟡', color: '#F59E0B' },
        { value: 'high', label: 'Haute', icon: '🟠', color: '#F97316' },
        { value: 'urgent', label: 'Urgente', icon: '🔴', color: '#EF4444' }
    ];

    function getRoomInfo(val) { return ROOMS.find(r => r.value === val) || ROOMS[ROOMS.length - 1]; }
    function getCategoryInfo(val) { return TASK_CATEGORIES.find(c => c.value === val) || TASK_CATEGORIES[TASK_CATEGORIES.length - 1]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }
    function getPriorityInfo(val) { return PRIORITIES.find(p => p.value === val) || PRIORITIES[1]; }

    function isOverdue(task) {
        if (!task.dueDate || task.status === 'done') return false;
        return new Date(task.dueDate) < new Date();
    }

    async function getStats() {
        const all = await getAll();
        const pending = all.filter(t => t.status !== 'done').length;
        const overdue = all.filter(t => isOverdue(t)).length;
        const totalCost = all.reduce((s, t) => s + t.cost, 0);
        return { total: all.length, pending, overdue, totalCost: totalCost.toFixed(2) };
    }

    function exportCSV(tasks) {
        const header = 'Titre,Pièce,Catégorie,Priorité,Statut,Échéance,Coût,Prestataire\n';
        const rows = tasks.map(t => `"${t.title}","${t.room}","${t.category}","${t.priority}","${t.status}","${t.dueDate}",${t.cost},"${t.contractor}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'maison.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite, completeTask,
        getStats, exportCSV, isOverdue, getRoomInfo, getCategoryInfo, getStatusInfo, getPriorityInfo,
        ROOMS, TASK_CATEGORIES, STATUSES, PRIORITIES
    };
})();
