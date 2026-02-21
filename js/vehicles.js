/* ===================================================================
   vehicles.js — Véhicules & Entretien Module
   Suivi véhicules, maintenance, kilométrage, dépenses
   =================================================================== */

const Vehicles = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapVehicle(row) {
        if (!row) return null;
        return {
            id: row.id,
            name: row.name || '',
            type: row.type || 'car',
            brand: row.brand || '',
            model: row.model || '',
            year: parseInt(row.year || 0),
            plate: row.plate || '',
            color: row.color || '',
            fuel: row.fuel || 'essence',
            mileage: parseInt(row.mileage || 0),
            purchaseDate: row.purchase_date || row.purchaseDate || '',
            purchasePrice: parseFloat(row.purchase_price || row.purchasePrice || 0),
            insuranceExpiry: row.insurance_expiry || row.insuranceExpiry || '',
            nextService: row.next_service || row.nextService || '',
            status: row.status || 'active',
            notes: row.notes || '',
            favorite: !!row.favorite,
            photo: row.photo || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-vehicles-v1';
    let useLocalStorage = false;
    let localVehicles = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('vehicles').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Vehicles: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Vehicles: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Vehicles: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal() { try { localVehicles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localVehicles = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localVehicles)); }

    async function getAll() {
        if (useLocalStorage) return localVehicles.map(mapVehicle);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('vehicles').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapVehicle);
    }

    async function getById(id) {
        if (useLocalStorage) { const v = localVehicles.find(x => x.id === id); return v ? mapVehicle(v) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('vehicles').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapVehicle(data);
    }

    async function add(vehicle) {
        if (useLocalStorage) {
            const nv = { ...vehicle, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localVehicles.unshift(nv); saveLocal(); return mapVehicle(nv);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, name: vehicle.name, type: vehicle.type || 'car',
            brand: vehicle.brand || '', model: vehicle.model || '', year: vehicle.year || 0,
            plate: vehicle.plate || '', color: vehicle.color || '', fuel: vehicle.fuel || 'essence',
            mileage: vehicle.mileage || 0, purchase_date: vehicle.purchaseDate || null,
            purchase_price: vehicle.purchasePrice || 0, insurance_expiry: vehicle.insuranceExpiry || null,
            next_service: vehicle.nextService || null, status: vehicle.status || 'active',
            notes: vehicle.notes || '', favorite: vehicle.favorite || false, photo: vehicle.photo || ''
        };
        const { data, error } = await supabaseClient.from('vehicles').insert(row).select().single();
        return error ? null : mapVehicle(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localVehicles.findIndex(x => x.id === id); if (idx < 0) return null;
            localVehicles[idx] = { ...localVehicles[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapVehicle(localVehicles[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.name !== undefined) row.name = updates.name;
        if (updates.type !== undefined) row.type = updates.type;
        if (updates.brand !== undefined) row.brand = updates.brand;
        if (updates.model !== undefined) row.model = updates.model;
        if (updates.year !== undefined) row.year = updates.year;
        if (updates.plate !== undefined) row.plate = updates.plate;
        if (updates.color !== undefined) row.color = updates.color;
        if (updates.fuel !== undefined) row.fuel = updates.fuel;
        if (updates.mileage !== undefined) row.mileage = updates.mileage;
        if (updates.purchaseDate !== undefined) row.purchase_date = updates.purchaseDate;
        if (updates.purchasePrice !== undefined) row.purchase_price = updates.purchasePrice;
        if (updates.insuranceExpiry !== undefined) row.insurance_expiry = updates.insuranceExpiry;
        if (updates.nextService !== undefined) row.next_service = updates.nextService;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        if (updates.photo !== undefined) row.photo = updates.photo;
        const { data, error } = await supabaseClient.from('vehicles').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapVehicle(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            localVehicles = localVehicles.filter(x => x.id !== id); saveLocal(); return true;
        }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('vehicles').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) {
        const v = await getById(id); if (!v) return null;
        return update(id, { favorite: !v.favorite });
    }

    async function updateMileage(id, newMileage) {
        return update(id, { mileage: newMileage });
    }

    const TYPES = [
        { value: 'car', label: 'Voiture', icon: '🚗' },
        { value: 'moto', label: 'Moto', icon: '🏍️' },
        { value: 'scooter', label: 'Scooter', icon: '🛵' },
        { value: 'van', label: 'Camionnette', icon: '🚐' },
        { value: 'truck', label: 'Camion', icon: '🚛' },
        { value: 'bike', label: 'Vélo', icon: '🚲' },
        { value: 'electric', label: 'Trottinette', icon: '🛴' },
        { value: 'autre', label: 'Autre', icon: '🚙' }
    ];

    const FUELS = [
        { value: 'essence', label: 'Essence', icon: '⛽' },
        { value: 'diesel', label: 'Diesel', icon: '⛽' },
        { value: 'electric', label: 'Électrique', icon: '⚡' },
        { value: 'hybrid', label: 'Hybride', icon: '🔋' },
        { value: 'gpl', label: 'GPL', icon: '🟢' },
        { value: 'none', label: 'Aucun', icon: '🚲' }
    ];

    const STATUSES = [
        { value: 'active', label: 'Actif', icon: '✅', color: '#22C55E' },
        { value: 'maintenance', label: 'En entretien', icon: '🔧', color: '#F59E0B' },
        { value: 'parked', label: 'Garé', icon: '🅿️', color: '#6366F1' },
        { value: 'sold', label: 'Vendu', icon: '💰', color: '#94A3B8' }
    ];

    function getTypeInfo(val) { return TYPES.find(t => t.value === val) || TYPES[TYPES.length - 1]; }
    function getFuelInfo(val) { return FUELS.find(f => f.value === val) || FUELS[0]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }

    function formatMileage(km) { return km ? km.toLocaleString('fr-FR') + ' km' : '— km'; }

    function isInsuranceExpiring(vehicle, days = 30) {
        if (!vehicle.insuranceExpiry) return false;
        const diff = (new Date(vehicle.insuranceExpiry) - new Date()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= days;
    }

    function isServiceDue(vehicle, days = 30) {
        if (!vehicle.nextService) return false;
        const diff = (new Date(vehicle.nextService) - new Date()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= days;
    }

    async function getStats() {
        const vehicles = await getAll();
        const active = vehicles.filter(v => v.status === 'active');
        return {
            total: vehicles.length,
            active: active.length,
            alerts: vehicles.filter(v => isInsuranceExpiring(v) || isServiceDue(v)).length,
            totalKm: active.reduce((s, v) => s + v.mileage, 0)
        };
    }

    function exportCSV(vehicles) {
        const header = 'Nom,Type,Marque,Modèle,Année,Plaque,Carburant,Kilométrage,Statut,Assurance,Prochain entretien\n';
        const rows = vehicles.map(v =>
            `"${v.name}","${v.type}","${v.brand}","${v.model}",${v.year},"${v.plate}","${v.fuel}",${v.mileage},"${v.status}","${v.insuranceExpiry}","${v.nextService}"`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vehicules.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite, updateMileage,
        getStats, exportCSV, formatMileage,
        TYPES, FUELS, STATUSES, getTypeInfo, getFuelInfo, getStatusInfo,
        isInsuranceExpiring, isServiceDue
    };
})();
