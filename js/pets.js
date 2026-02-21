/* ===================================================================
   pets.js — Animaux de Compagnie Module
   Suivi des animaux, soins, vétérinaire, alimentation
   =================================================================== */

const Pets = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapPet(row) {
        if (!row) return null;
        return {
            id: row.id,
            name: row.name || '',
            species: row.species || 'chien',
            breed: row.breed || '',
            birthdate: row.birthdate || '',
            weight: parseFloat(row.weight || 0),
            color: row.color || '',
            gender: row.gender || '',
            microchip: row.microchip || '',
            vet: row.vet || '',
            vetPhone: row.vet_phone || row.vetPhone || '',
            lastVetVisit: row.last_vet_visit || row.lastVetVisit || '',
            nextVetVisit: row.next_vet_visit || row.nextVetVisit || '',
            vaccinations: row.vaccinations || '',
            food: row.food || '',
            allergies: row.allergies || '',
            notes: row.notes || '',
            photo: row.photo || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-pets-v1';
    let useLocalStorage = false;
    let localPets = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('pets').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localPets = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localPets = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localPets)); }

    async function getAll() {
        if (useLocalStorage) return localPets.map(mapPet);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('pets').select('*').eq('user_id', uid).order('name');
        return error ? [] : (data || []).map(mapPet);
    }

    async function getById(id) {
        if (useLocalStorage) { const p = localPets.find(x => x.id === id); return p ? mapPet(p) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('pets').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapPet(data);
    }

    async function add(pet) {
        if (useLocalStorage) {
            const np = { ...pet, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localPets.unshift(np); saveLocal(); return mapPet(np);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, name: pet.name, species: pet.species || 'chien', breed: pet.breed || '',
            birthdate: pet.birthdate || null, weight: pet.weight || 0, color: pet.color || '',
            gender: pet.gender || '', microchip: pet.microchip || '', vet: pet.vet || '',
            vet_phone: pet.vetPhone || '', last_vet_visit: pet.lastVetVisit || null,
            next_vet_visit: pet.nextVetVisit || null, vaccinations: pet.vaccinations || '',
            food: pet.food || '', allergies: pet.allergies || '', notes: pet.notes || '',
            photo: pet.photo || '', favorite: pet.favorite || false
        };
        const { data, error } = await supabaseClient.from('pets').insert(row).select().single();
        return error ? null : mapPet(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localPets.findIndex(x => x.id === id); if (idx < 0) return null;
            localPets[idx] = { ...localPets[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapPet(localPets[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.name !== undefined) row.name = updates.name;
        if (updates.species !== undefined) row.species = updates.species;
        if (updates.breed !== undefined) row.breed = updates.breed;
        if (updates.birthdate !== undefined) row.birthdate = updates.birthdate;
        if (updates.weight !== undefined) row.weight = updates.weight;
        if (updates.color !== undefined) row.color = updates.color;
        if (updates.gender !== undefined) row.gender = updates.gender;
        if (updates.microchip !== undefined) row.microchip = updates.microchip;
        if (updates.vet !== undefined) row.vet = updates.vet;
        if (updates.vetPhone !== undefined) row.vet_phone = updates.vetPhone;
        if (updates.lastVetVisit !== undefined) row.last_vet_visit = updates.lastVetVisit;
        if (updates.nextVetVisit !== undefined) row.next_vet_visit = updates.nextVetVisit;
        if (updates.vaccinations !== undefined) row.vaccinations = updates.vaccinations;
        if (updates.food !== undefined) row.food = updates.food;
        if (updates.allergies !== undefined) row.allergies = updates.allergies;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.photo !== undefined) row.photo = updates.photo;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('pets').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapPet(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localPets = localPets.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('pets').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const p = await getById(id); if (!p) return null; return update(id, { favorite: !p.favorite }); }

    const SPECIES = [
        { value: 'chien', label: 'Chien', icon: '🐕' },
        { value: 'chat', label: 'Chat', icon: '🐈' },
        { value: 'oiseau', label: 'Oiseau', icon: '🐦' },
        { value: 'poisson', label: 'Poisson', icon: '🐟' },
        { value: 'rongeur', label: 'Rongeur', icon: '🐹' },
        { value: 'reptile', label: 'Reptile', icon: '🦎' },
        { value: 'lapin', label: 'Lapin', icon: '🐇' },
        { value: 'autre', label: 'Autre', icon: '🐾' }
    ];

    const GENDERS = [
        { value: 'male', label: 'Mâle', icon: '♂️' },
        { value: 'female', label: 'Femelle', icon: '♀️' },
        { value: '', label: 'Non spécifié', icon: '—' }
    ];

    function getSpeciesInfo(val) { return SPECIES.find(s => s.value === val) || SPECIES[SPECIES.length - 1]; }

    function getAge(pet) {
        if (!pet.birthdate) return '';
        const diff = (new Date() - new Date(pet.birthdate)) / (1000 * 60 * 60 * 24 * 365.25);
        if (diff < 1) return Math.round(diff * 12) + ' mois';
        return Math.floor(diff) + ' an' + (Math.floor(diff) > 1 ? 's' : '');
    }

    function needsVetVisit(pet) {
        if (!pet.nextVetVisit) return false;
        return new Date(pet.nextVetVisit) <= new Date();
    }

    async function getStats() {
        const all = await getAll();
        const species = new Set(all.map(p => p.species)).size;
        const needVet = all.filter(p => needsVetVisit(p)).length;
        return { total: all.length, species, needVet, favorites: all.filter(p => p.favorite).length };
    }

    function exportCSV(pets) {
        const header = 'Nom,Espèce,Race,Date naissance,Poids,Genre,Vétérinaire,Vaccinations\n';
        const rows = pets.map(p => `"${p.name}","${p.species}","${p.breed}","${p.birthdate}",${p.weight},"${p.gender}","${p.vet}","${p.vaccinations}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'animaux.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, getAge, needsVetVisit, getSpeciesInfo,
        SPECIES, GENDERS
    };
})();
