/* ===================================================================
   learning.js — Apprentissage & Formation Module
   Cours, compétences, certifications, progression
   =================================================================== */

const Learning = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapCourse(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            platform: row.platform || '',
            category: row.category || 'dev',
            instructor: row.instructor || '',
            url: row.url || '',
            status: row.status || 'not_started',
            progress: parseInt(row.progress || 0),
            rating: parseInt(row.rating || 0),
            startDate: row.start_date || row.startDate || '',
            endDate: row.end_date || row.endDate || '',
            duration: row.duration || '',
            cost: parseFloat(row.cost || 0),
            certificate: row.certificate || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-learning-v1';
    let useLocalStorage = false;
    let localCourses = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('learning').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localCourses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localCourses = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localCourses)); }

    async function getAll() {
        if (useLocalStorage) return localCourses.map(mapCourse);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('learning').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapCourse);
    }

    async function getById(id) {
        if (useLocalStorage) { const c = localCourses.find(x => x.id === id); return c ? mapCourse(c) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('learning').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapCourse(data);
    }

    async function add(course) {
        if (useLocalStorage) {
            const nc = { ...course, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localCourses.unshift(nc); saveLocal(); return mapCourse(nc);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: course.title, platform: course.platform || '',
            category: course.category || 'dev', instructor: course.instructor || '',
            url: course.url || '', status: course.status || 'not_started',
            progress: course.progress || 0, rating: course.rating || 0,
            start_date: course.startDate || null, end_date: course.endDate || null,
            duration: course.duration || '', cost: course.cost || 0,
            certificate: course.certificate || '', notes: course.notes || '',
            favorite: course.favorite || false
        };
        const { data, error } = await supabaseClient.from('learning').insert(row).select().single();
        return error ? null : mapCourse(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localCourses.findIndex(x => x.id === id); if (idx < 0) return null;
            localCourses[idx] = { ...localCourses[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapCourse(localCourses[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.platform !== undefined) row.platform = updates.platform;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.instructor !== undefined) row.instructor = updates.instructor;
        if (updates.url !== undefined) row.url = updates.url;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.progress !== undefined) row.progress = updates.progress;
        if (updates.rating !== undefined) row.rating = updates.rating;
        if (updates.startDate !== undefined) row.start_date = updates.startDate;
        if (updates.endDate !== undefined) row.end_date = updates.endDate;
        if (updates.duration !== undefined) row.duration = updates.duration;
        if (updates.cost !== undefined) row.cost = updates.cost;
        if (updates.certificate !== undefined) row.certificate = updates.certificate;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('learning').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapCourse(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localCourses = localCourses.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('learning').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const c = await getById(id); if (!c) return null; return update(id, { favorite: !c.favorite }); }

    const CATEGORIES = [
        { value: 'dev', label: 'Développement', icon: '💻' },
        { value: 'design', label: 'Design', icon: '🎨' },
        { value: 'business', label: 'Business', icon: '💼' },
        { value: 'marketing', label: 'Marketing', icon: '📢' },
        { value: 'data', label: 'Data Science', icon: '📊' },
        { value: 'language', label: 'Langues', icon: '🌍' },
        { value: 'music', label: 'Musique', icon: '🎵' },
        { value: 'photo', label: 'Photo/Vidéo', icon: '📸' },
        { value: 'health', label: 'Santé', icon: '🏥' },
        { value: 'autre', label: 'Autre', icon: '📚' }
    ];

    const STATUSES = [
        { value: 'not_started', label: 'Pas commencé', icon: '⏳', color: '#64748B' },
        { value: 'in_progress', label: 'En cours', icon: '▶️', color: '#6366F1' },
        { value: 'completed', label: 'Terminé', icon: '✅', color: '#22C55E' },
        { value: 'paused', label: 'En pause', icon: '⏸️', color: '#F59E0B' },
        { value: 'abandoned', label: 'Abandonné', icon: '❌', color: '#EF4444' }
    ];

    const PLATFORMS = [
        { value: 'udemy', label: 'Udemy' }, { value: 'coursera', label: 'Coursera' },
        { value: 'youtube', label: 'YouTube' }, { value: 'linkedin', label: 'LinkedIn Learning' },
        { value: 'pluralsight', label: 'Pluralsight' }, { value: 'skillshare', label: 'Skillshare' },
        { value: 'openclassrooms', label: 'OpenClassrooms' }, { value: 'autre', label: 'Autre' }
    ];

    function getCategoryInfo(val) { return CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }

    async function getStats() {
        const all = await getAll();
        const inProgress = all.filter(c => c.status === 'in_progress').length;
        const completed = all.filter(c => c.status === 'completed').length;
        const totalCost = all.reduce((s, c) => s + c.cost, 0);
        return { total: all.length, inProgress, completed, totalCost: totalCost.toFixed(2) };
    }

    function exportCSV(courses) {
        const header = 'Titre,Plateforme,Catégorie,Instructeur,Statut,Progression,Note,Coût\n';
        const rows = courses.map(c => `"${c.title}","${c.platform}","${c.category}","${c.instructor}","${c.status}",${c.progress},${c.rating},${c.cost}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'apprentissage.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, getCategoryInfo, getStatusInfo,
        CATEGORIES, STATUSES, PLATFORMS
    };
})();
