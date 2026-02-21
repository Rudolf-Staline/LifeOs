/* ===================================================================
   health.js — Santé & Médical Module
   Rendez-vous, médicaments, vaccins, mesures santé
   =================================================================== */

const Health = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapRecord(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            type: row.type || 'appointment',
            category: row.category || 'general',
            doctor: row.doctor || '',
            location: row.location || '',
            date: row.date || '',
            time: row.time || '',
            status: row.status || 'scheduled',
            priority: row.priority || 'normal',
            medication: row.medication || '',
            dosage: row.dosage || '',
            frequency: row.frequency || '',
            duration: row.duration || '',
            symptoms: row.symptoms || '',
            diagnosis: row.diagnosis || '',
            notes: row.notes || '',
            reminder: !!row.reminder,
            cost: parseFloat(row.cost || 0),
            attachment: row.attachment || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-health-v1';
    let useLocalStorage = false;
    let localRecords = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('health_records').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Health: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Health: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Health: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal() { try { localRecords = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localRecords = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localRecords)); }

    async function getAll() {
        if (useLocalStorage) return localRecords.map(mapRecord);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('health_records').select('*').eq('user_id', uid).order('date', { ascending: false });
        return error ? [] : (data || []).map(mapRecord);
    }

    async function getById(id) {
        if (useLocalStorage) { const r = localRecords.find(x => x.id === id); return r ? mapRecord(r) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('health_records').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapRecord(data);
    }

    async function add(record) {
        if (useLocalStorage) {
            const nr = { ...record, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localRecords.unshift(nr); saveLocal(); return mapRecord(nr);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: record.title, type: record.type || 'appointment',
            category: record.category || 'general', doctor: record.doctor || '',
            location: record.location || '', date: record.date || null, time: record.time || '',
            status: record.status || 'scheduled', priority: record.priority || 'normal',
            medication: record.medication || '', dosage: record.dosage || '',
            frequency: record.frequency || '', duration: record.duration || '',
            symptoms: record.symptoms || '', diagnosis: record.diagnosis || '',
            notes: record.notes || '', reminder: record.reminder || false,
            cost: record.cost || 0, attachment: record.attachment || ''
        };
        const { data, error } = await supabaseClient.from('health_records').insert(row).select().single();
        return error ? null : mapRecord(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localRecords.findIndex(x => x.id === id); if (idx < 0) return null;
            localRecords[idx] = { ...localRecords[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapRecord(localRecords[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.type !== undefined) row.type = updates.type;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.doctor !== undefined) row.doctor = updates.doctor;
        if (updates.location !== undefined) row.location = updates.location;
        if (updates.date !== undefined) row.date = updates.date;
        if (updates.time !== undefined) row.time = updates.time;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.priority !== undefined) row.priority = updates.priority;
        if (updates.medication !== undefined) row.medication = updates.medication;
        if (updates.dosage !== undefined) row.dosage = updates.dosage;
        if (updates.frequency !== undefined) row.frequency = updates.frequency;
        if (updates.duration !== undefined) row.duration = updates.duration;
        if (updates.symptoms !== undefined) row.symptoms = updates.symptoms;
        if (updates.diagnosis !== undefined) row.diagnosis = updates.diagnosis;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.reminder !== undefined) row.reminder = updates.reminder;
        if (updates.cost !== undefined) row.cost = updates.cost;
        if (updates.attachment !== undefined) row.attachment = updates.attachment;
        const { data, error } = await supabaseClient.from('health_records').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapRecord(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            localRecords = localRecords.filter(x => x.id !== id); saveLocal(); return true;
        }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('health_records').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    const TYPES = [
        { value: 'appointment', label: 'Rendez-vous', icon: '📅' },
        { value: 'medication', label: 'Médicament', icon: '💊' },
        { value: 'vaccine', label: 'Vaccin', icon: '💉' },
        { value: 'exam', label: 'Examen/Analyse', icon: '🔬' },
        { value: 'surgery', label: 'Intervention', icon: '🏥' },
        { value: 'measure', label: 'Mesure', icon: '📏' }
    ];

    const CATEGORIES = [
        { value: 'general', label: 'Médecine générale', icon: '🩺' },
        { value: 'dental', label: 'Dentaire', icon: '🦷' },
        { value: 'ophtalmology', label: 'Ophtalmologie', icon: '👁️' },
        { value: 'dermatology', label: 'Dermatologie', icon: '🧴' },
        { value: 'cardiology', label: 'Cardiologie', icon: '❤️' },
        { value: 'ortho', label: 'Orthopédie', icon: '🦴' },
        { value: 'psy', label: 'Psychologie', icon: '🧠' },
        { value: 'gyneco', label: 'Gynécologie', icon: '🩷' },
        { value: 'pediatrics', label: 'Pédiatrie', icon: '👶' },
        { value: 'autre', label: 'Autre', icon: '🏥' }
    ];

    const STATUSES = [
        { value: 'scheduled', label: 'Planifié', icon: '📅', color: '#6366F1' },
        { value: 'completed', label: 'Effectué', icon: '✅', color: '#22C55E' },
        { value: 'cancelled', label: 'Annulé', icon: '❌', color: '#EF4444' },
        { value: 'ongoing', label: 'En cours', icon: '🔄', color: '#F59E0B' }
    ];

    const PRIORITIES = [
        { value: 'low', label: 'Basse', icon: '🟢', color: '#22C55E' },
        { value: 'normal', label: 'Normale', icon: '🔵', color: '#3B82F6' },
        { value: 'high', label: 'Haute', icon: '🟠', color: '#F59E0B' },
        { value: 'urgent', label: 'Urgente', icon: '🔴', color: '#EF4444' }
    ];

    function getTypeInfo(val) { return TYPES.find(t => t.value === val) || TYPES[0]; }
    function getCategoryInfo(val) { return CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }
    function getPriorityInfo(val) { return PRIORITIES.find(p => p.value === val) || PRIORITIES[1]; }

    function isUpcoming(record, days = 7) {
        if (!record.date) return false;
        const diff = (new Date(record.date) - new Date()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= days;
    }

    function isPast(record) {
        if (!record.date) return false;
        return new Date(record.date) < new Date();
    }

    async function getStats() {
        const records = await getAll();
        const upcoming = records.filter(r => isUpcoming(r, 30) && r.status === 'scheduled');
        const totalCost = records.filter(r => r.status === 'completed').reduce((s, r) => s + r.cost, 0);
        return {
            total: records.length,
            upcoming: upcoming.length,
            completed: records.filter(r => r.status === 'completed').length,
            totalCost: totalCost.toFixed(2)
        };
    }

    function exportCSV(records) {
        const header = 'Titre,Type,Catégorie,Médecin,Date,Statut,Priorité,Coût,Symptômes,Diagnostic\n';
        const rows = records.map(r =>
            `"${r.title}","${r.type}","${r.category}","${r.doctor}","${r.date}","${r.status}","${r.priority}",${r.cost},"${r.symptoms}","${r.diagnosis}"`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sante.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove,
        getStats, exportCSV,
        TYPES, CATEGORIES, STATUSES, PRIORITIES,
        getTypeInfo, getCategoryInfo, getStatusInfo, getPriorityInfo,
        isUpcoming, isPast
    };
})();
