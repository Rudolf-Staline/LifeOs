/* ===================================================================
   plants.js — Plantes d'Intérieur Module
   Suivi de plantes, arrosage, soins, santé
   =================================================================== */

const Plants = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapPlant(row) {
        if (!row) return null;
        return {
            id: row.id,
            name: row.name || '',
            species: row.species || '',
            location: row.location || '',
            waterFrequency: parseInt(row.water_frequency || row.waterFrequency || 7),  // days
            lastWatered: row.last_watered || row.lastWatered || '',
            lastFertilized: row.last_fertilized || row.lastFertilized || '',
            sunlight: row.sunlight || 'medium',        // low | medium | high | direct
            health: row.health || 'good',              // excellent | good | fair | poor | dead
            acquired: row.acquired || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            photo: row.photo || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-plants-v1';
    let useLocalStorage = false;
    let localPlants = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('plants').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Plants: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Plants: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Plants: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal()  { try { localPlants = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localPlants = []; } }
    function saveLocal()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(localPlants)); }
    function genId()      { return 'pl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    async function getAll() {
        if (useLocalStorage) return localPlants.map(p => ({...p}));
        const { data, error } = await supabaseClient.from('plants').select('*')
            .eq('user_id', getUserId()).order('name', { ascending: true });
        return error ? [] : data.map(mapPlant);
    }

    async function getById(id) {
        if (useLocalStorage) return localPlants.find(p => p.id === id) || null;
        const { data, error } = await supabaseClient.from('plants').select('*')
            .eq('id', id).eq('user_id', getUserId()).single();
        return error ? null : mapPlant(data);
    }

    async function add(plant) {
        const item = {
            name: plant.name,
            species: plant.species || '',
            location: plant.location || '',
            water_frequency: parseInt(plant.waterFrequency || 7),
            last_watered: plant.lastWatered || '',
            last_fertilized: plant.lastFertilized || '',
            sunlight: plant.sunlight || 'medium',
            health: plant.health || 'good',
            acquired: plant.acquired || '',
            notes: plant.notes || '',
            favorite: !!plant.favorite,
            photo: plant.photo || ''
        };
        if (useLocalStorage) {
            const local = { id: genId(), ...item, waterFrequency: item.water_frequency, lastWatered: item.last_watered, lastFertilized: item.last_fertilized, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            localPlants.push(local); saveLocal(); return local;
        }
        item.user_id = getUserId();
        const { data, error } = await supabaseClient.from('plants').insert(item).select().single();
        return error ? null : mapPlant(data);
    }

    async function update(id, changes) {
        const mapped = {};
        if (changes.name !== undefined)            mapped.name = changes.name;
        if (changes.species !== undefined)         mapped.species = changes.species;
        if (changes.location !== undefined)        mapped.location = changes.location;
        if (changes.waterFrequency !== undefined)  mapped.water_frequency = parseInt(changes.waterFrequency);
        if (changes.lastWatered !== undefined)     mapped.last_watered = changes.lastWatered;
        if (changes.lastFertilized !== undefined)  mapped.last_fertilized = changes.lastFertilized;
        if (changes.sunlight !== undefined)        mapped.sunlight = changes.sunlight;
        if (changes.health !== undefined)          mapped.health = changes.health;
        if (changes.acquired !== undefined)        mapped.acquired = changes.acquired;
        if (changes.notes !== undefined)           mapped.notes = changes.notes;
        if (changes.favorite !== undefined)        mapped.favorite = changes.favorite;
        if (changes.photo !== undefined)           mapped.photo = changes.photo;

        if (useLocalStorage) {
            const idx = localPlants.findIndex(p => p.id === id);
            if (idx === -1) return null;
            Object.assign(localPlants[idx], changes, { updatedAt: new Date().toISOString() });
            saveLocal(); return localPlants[idx];
        }
        mapped.updated_at = new Date().toISOString();
        const { data, error } = await supabaseClient.from('plants').update(mapped)
            .eq('id', id).eq('user_id', getUserId()).select().single();
        return error ? null : mapPlant(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            localPlants = localPlants.filter(p => p.id !== id);
            saveLocal(); return true;
        }
        const { error } = await supabaseClient.from('plants').delete()
            .eq('id', id).eq('user_id', getUserId());
        return !error;
    }

    async function waterPlant(id) {
        return await update(id, { lastWatered: new Date().toISOString().split('T')[0] });
    }

    async function fertilizePlant(id) {
        return await update(id, { lastFertilized: new Date().toISOString().split('T')[0] });
    }

    // ===== Helpers =====
    const SUNLIGHT = [
        { value: 'low',    label: 'Ombre',         icon: '🌑', color: '#64748B' },
        { value: 'medium', label: 'Mi-ombre',      icon: '⛅', color: '#F59E0B' },
        { value: 'high',   label: 'Lumineux',      icon: '☀️', color: '#F97316' },
        { value: 'direct', label: 'Soleil direct',  icon: '🔆', color: '#EF4444' }
    ];

    const HEALTH = [
        { value: 'excellent', label: 'Excellent',  icon: '🌿', color: '#22C55E' },
        { value: 'good',      label: 'Bon',        icon: '🌱', color: '#84CC16' },
        { value: 'fair',      label: 'Moyen',      icon: '🍂', color: '#F59E0B' },
        { value: 'poor',      label: 'Mauvais',    icon: '🥀', color: '#EF4444' },
        { value: 'dead',      label: 'Mort',       icon: '💀', color: '#64748B' }
    ];

    const LOCATIONS = [
        { value: 'salon',    label: 'Salon',       icon: '🛋️' },
        { value: 'chambre',  label: 'Chambre',     icon: '🛏️' },
        { value: 'cuisine',  label: 'Cuisine',     icon: '🍳' },
        { value: 'balcon',   label: 'Balcon',      icon: '🌤️' },
        { value: 'bureau',   label: 'Bureau',      icon: '💻' },
        { value: 'sdb',      label: 'Salle de bain', icon: '🚿' },
        { value: 'terrasse', label: 'Terrasse',    icon: '🏡' },
        { value: 'jardin',   label: 'Jardin',      icon: '🌳' },
        { value: 'autre',    label: 'Autre',       icon: '📍' }
    ];

    function getSunlightInfo(val)  { return SUNLIGHT.find(s => s.value === val) || SUNLIGHT[1]; }
    function getHealthInfo(val)    { return HEALTH.find(h => h.value === val) || HEALTH[1]; }

    function needsWater(plant) {
        if (!plant.lastWatered) return true;
        const last = new Date(plant.lastWatered);
        const now = new Date();
        const diff = Math.ceil((now - last) / (1000 * 60 * 60 * 24));
        return diff >= plant.waterFrequency;
    }

    function daysSinceWatered(plant) {
        if (!plant.lastWatered) return 999;
        return Math.ceil((new Date() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24));
    }

    function getWaterStatus(plant) {
        const days = daysSinceWatered(plant);
        if (days >= plant.waterFrequency * 1.5) return { label: 'Urgence !', icon: '🚨', color: '#EF4444' };
        if (days >= plant.waterFrequency)       return { label: 'À arroser', icon: '💧', color: '#F59E0B' };
        return { label: 'OK', icon: '✅', color: '#22C55E' };
    }

    async function getStats() {
        const all = await getAll();
        const needWater = all.filter(p => needsWater(p)).length;
        const healthy = all.filter(p => p.health === 'excellent' || p.health === 'good').length;
        const locations = new Set(all.map(p => p.location).filter(Boolean)).size;
        return { total: all.length, needWater, healthy, locations };
    }

    function exportCSV(plants) {
        const headers = ['Nom', 'Espèce', 'Emplacement', 'Lumière', 'Santé', 'Arrosage (jours)', 'Dernier arrosage', 'Acquise'];
        const rows = plants.map(p => [p.name, p.species, p.location, p.sunlight, p.health, p.waterFrequency, p.lastWatered, p.acquired]);
        return [headers, ...rows].map(r => r.join(',')).join('\n');
    }

    return {
        initStorage, getAll, getById, add, update, remove,
        waterPlant, fertilizePlant, needsWater, daysSinceWatered,
        getWaterStatus, getSunlightInfo, getHealthInfo,
        getStats, exportCSV, SUNLIGHT, HEALTH, LOCATIONS
    };
})();
