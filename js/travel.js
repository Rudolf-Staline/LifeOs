/* ===================================================================
   travel.js — Voyages & Destinations Module
   Suivi de voyages, destinations visitées et à visiter
   =================================================================== */

const Travel = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapTrip(row) {
        if (!row) return null;
        return {
            id: row.id,
            destination: row.destination || '',
            country: row.country || '',
            continent: row.continent || 'autre',
            status: row.status || 'planned',          // planned | ongoing | visited | dream
            startDate: row.start_date || row.startDate || '',
            endDate: row.end_date || row.endDate || '',
            transport: row.transport || 'avion',
            companions: row.companions || '',
            highlights: row.highlights || '',
            notes: row.notes || '',
            rating: parseInt(row.rating || 0),
            favorite: !!row.favorite,
            photos: row.photos || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-travel-v1';
    let useLocalStorage = false;
    let localTrips = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('trips').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Travel: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Travel: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Travel: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal()  { try { localTrips = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localTrips = []; } }
    function saveLocal()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(localTrips)); }
    function genId()      { return 'tr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    async function getAll(filter) {
        let items;
        if (useLocalStorage) {
            items = localTrips.map(t => ({...t}));
        } else {
            let query = supabaseClient.from('trips').select('*').eq('user_id', getUserId());
            if (filter?.status) query = query.eq('status', filter.status);
            query = query.order('created_at', { ascending: false });
            const { data, error } = await query;
            items = error ? [] : data.map(mapTrip);
        }
        if (filter?.status && useLocalStorage) items = items.filter(t => t.status === filter.status);
        if (filter?.continent) items = items.filter(t => t.continent === filter.continent);
        return items;
    }

    async function getById(id) {
        if (useLocalStorage) return localTrips.find(t => t.id === id) || null;
        const { data, error } = await supabaseClient.from('trips').select('*')
            .eq('id', id).eq('user_id', getUserId()).single();
        return error ? null : mapTrip(data);
    }

    async function add(trip) {
        const item = {
            destination: trip.destination,
            country: trip.country || '',
            continent: trip.continent || 'autre',
            status: trip.status || 'planned',
            start_date: trip.startDate || '',
            end_date: trip.endDate || '',
            transport: trip.transport || 'avion',
            companions: trip.companions || '',
            highlights: trip.highlights || '',
            notes: trip.notes || '',
            rating: parseInt(trip.rating || 0),
            favorite: !!trip.favorite,
            photos: trip.photos || ''
        };
        if (useLocalStorage) {
            const local = { id: genId(), ...item, startDate: item.start_date, endDate: item.end_date, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            localTrips.push(local); saveLocal(); return local;
        }
        item.user_id = getUserId();
        const { data, error } = await supabaseClient.from('trips').insert(item).select().single();
        return error ? null : mapTrip(data);
    }

    async function update(id, changes) {
        const mapped = {};
        if (changes.destination !== undefined)  mapped.destination = changes.destination;
        if (changes.country !== undefined)      mapped.country = changes.country;
        if (changes.continent !== undefined)    mapped.continent = changes.continent;
        if (changes.status !== undefined)       mapped.status = changes.status;
        if (changes.startDate !== undefined)    mapped.start_date = changes.startDate;
        if (changes.endDate !== undefined)      mapped.end_date = changes.endDate;
        if (changes.transport !== undefined)    mapped.transport = changes.transport;
        if (changes.companions !== undefined)   mapped.companions = changes.companions;
        if (changes.highlights !== undefined)   mapped.highlights = changes.highlights;
        if (changes.notes !== undefined)        mapped.notes = changes.notes;
        if (changes.rating !== undefined)       mapped.rating = parseInt(changes.rating);
        if (changes.favorite !== undefined)     mapped.favorite = changes.favorite;
        if (changes.photos !== undefined)       mapped.photos = changes.photos;

        if (useLocalStorage) {
            const idx = localTrips.findIndex(t => t.id === id);
            if (idx === -1) return null;
            Object.assign(localTrips[idx], changes, { updatedAt: new Date().toISOString() });
            saveLocal(); return localTrips[idx];
        }
        mapped.updated_at = new Date().toISOString();
        const { data, error } = await supabaseClient.from('trips').update(mapped)
            .eq('id', id).eq('user_id', getUserId()).select().single();
        return error ? null : mapTrip(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            localTrips = localTrips.filter(t => t.id !== id);
            saveLocal(); return true;
        }
        const { error } = await supabaseClient.from('trips').delete()
            .eq('id', id).eq('user_id', getUserId());
        return !error;
    }

    async function toggleFavorite(id) {
        const trip = await getById(id);
        if (!trip) return null;
        return await update(id, { favorite: !trip.favorite });
    }

    // ===== Helpers =====
    const CONTINENTS = [
        { value: 'afrique',   label: 'Afrique',       icon: '🌍', color: '#F59E0B' },
        { value: 'amerique',  label: 'Amérique',      icon: '🌎', color: '#3B82F6' },
        { value: 'asie',      label: 'Asie',          icon: '🌏', color: '#EF4444' },
        { value: 'europe',    label: 'Europe',        icon: '🏰', color: '#A78BFA' },
        { value: 'oceanie',   label: 'Océanie',       icon: '🏝️', color: '#06B6D4' },
        { value: 'autre',     label: 'Autre',         icon: '🌐', color: '#64748B' }
    ];

    const TRANSPORTS = [
        { value: 'avion',   label: 'Avion',      icon: '✈️' },
        { value: 'train',   label: 'Train',      icon: '🚄' },
        { value: 'voiture', label: 'Voiture',    icon: '🚗' },
        { value: 'bus',     label: 'Bus',        icon: '🚌' },
        { value: 'bateau',  label: 'Bateau',     icon: '🚢' },
        { value: 'velo',    label: 'Vélo',       icon: '🚴' },
        { value: 'pied',    label: 'À pied',     icon: '🚶' },
        { value: 'autre',   label: 'Autre',      icon: '🧭' }
    ];

    const STATUSES = [
        { value: 'dream',    label: 'Rêve',       icon: '💭', color: '#A78BFA' },
        { value: 'planned',  label: 'Planifié',   icon: '📅', color: '#F59E0B' },
        { value: 'ongoing',  label: 'En cours',   icon: '✈️', color: '#3B82F6' },
        { value: 'visited',  label: 'Visité',     icon: '✅', color: '#22C55E' }
    ];

    function getContinentInfo(val) { return CONTINENTS.find(c => c.value === val) || CONTINENTS[CONTINENTS.length - 1]; }
    function getTransportInfo(val) { return TRANSPORTS.find(t => t.value === val) || TRANSPORTS[TRANSPORTS.length - 1]; }
    function getStatusInfo(val)    { return STATUSES.find(s => s.value === val) || STATUSES[0]; }

    function formatDateRange(start, end) {
        if (!start && !end) return '';
        const opts = { day: 'numeric', month: 'short', year: 'numeric' };
        const s = start ? new Date(start + 'T00:00:00').toLocaleDateString('fr-FR', opts) : '';
        const e = end ? new Date(end + 'T00:00:00').toLocaleDateString('fr-FR', opts) : '';
        if (s && e) return `${s} → ${e}`;
        return s || e;
    }

    function getDuration(start, end) {
        if (!start || !end) return '';
        const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
        return diff > 0 ? `${diff} jour${diff > 1 ? 's' : ''}` : '';
    }

    function renderStars(rating) {
        let s = '';
        for (let i = 1; i <= 5; i++) s += i <= rating ? '⭐' : '☆';
        return s;
    }

    async function getStats() {
        const all = await getAll();
        const visited = all.filter(t => t.status === 'visited').length;
        const planned = all.filter(t => t.status === 'planned' || t.status === 'dream').length;
        const countries = new Set(all.filter(t => t.country).map(t => t.country.toLowerCase())).size;
        return { total: all.length, visited, planned, countries };
    }

    function exportCSV(trips) {
        const headers = ['Destination', 'Pays', 'Continent', 'Statut', 'Début', 'Fin', 'Transport', 'Note', 'Compagnons'];
        const rows = trips.map(t => [t.destination, t.country, t.continent, t.status, t.startDate, t.endDate, t.transport, t.rating, t.companions]);
        return [headers, ...rows].map(r => r.join(',')).join('\n');
    }

    return {
        initStorage, getAll, getById, add, update, remove,
        toggleFavorite, getContinentInfo, getTransportInfo, getStatusInfo,
        formatDateRange, getDuration, renderStars, getStats, exportCSV,
        CONTINENTS, TRANSPORTS, STATUSES
    };
})();
