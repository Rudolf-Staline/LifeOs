/* ===================================================================
   packages.js — Colis & Livraisons Module
   Suivi des colis, transporteurs, statuts, tracking
   =================================================================== */

const Packages = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapPackage(row) {
        if (!row) return null;
        return {
            id: row.id,
            name: row.name || '',
            trackingNumber: row.tracking_number || row.trackingNumber || '',
            carrier: row.carrier || 'poste',
            store: row.store || '',
            status: row.status || 'ordered',
            orderDate: row.order_date || row.orderDate || '',
            shippedDate: row.shipped_date || row.shippedDate || '',
            expectedDate: row.expected_date || row.expectedDate || '',
            deliveredDate: row.delivered_date || row.deliveredDate || '',
            price: parseFloat(row.price || 0),
            shippingCost: parseFloat(row.shipping_cost || row.shippingCost || 0),
            origin: row.origin || '',
            destination: row.destination || '',
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-packages-v1';
    let useLocalStorage = false;
    let localPackages = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('packages').select('id').limit(1);
            if (error && error.code === '42P01') { useLocalStorage = true; loadLocal(); }
            else if (error) { useLocalStorage = true; loadLocal(); }
        } catch (e) { useLocalStorage = true; loadLocal(); }
    }

    function loadLocal() { try { localPackages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localPackages = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localPackages)); }

    async function getAll() {
        if (useLocalStorage) return localPackages.map(mapPackage);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('packages').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapPackage);
    }

    async function getById(id) {
        if (useLocalStorage) { const p = localPackages.find(x => x.id === id); return p ? mapPackage(p) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('packages').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapPackage(data);
    }

    async function add(pkg) {
        if (useLocalStorage) {
            const np = { ...pkg, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localPackages.unshift(np); saveLocal(); return mapPackage(np);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, name: pkg.name, tracking_number: pkg.trackingNumber || '',
            carrier: pkg.carrier || 'poste', store: pkg.store || '',
            status: pkg.status || 'ordered', order_date: pkg.orderDate || null,
            shipped_date: pkg.shippedDate || null, expected_date: pkg.expectedDate || null,
            delivered_date: pkg.deliveredDate || null, price: pkg.price || 0,
            shipping_cost: pkg.shippingCost || 0, origin: pkg.origin || '',
            destination: pkg.destination || '', notes: pkg.notes || '',
            favorite: pkg.favorite || false
        };
        const { data, error } = await supabaseClient.from('packages').insert(row).select().single();
        return error ? null : mapPackage(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localPackages.findIndex(x => x.id === id); if (idx < 0) return null;
            localPackages[idx] = { ...localPackages[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapPackage(localPackages[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.name !== undefined) row.name = updates.name;
        if (updates.trackingNumber !== undefined) row.tracking_number = updates.trackingNumber;
        if (updates.carrier !== undefined) row.carrier = updates.carrier;
        if (updates.store !== undefined) row.store = updates.store;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.orderDate !== undefined) row.order_date = updates.orderDate;
        if (updates.shippedDate !== undefined) row.shipped_date = updates.shippedDate;
        if (updates.expectedDate !== undefined) row.expected_date = updates.expectedDate;
        if (updates.deliveredDate !== undefined) row.delivered_date = updates.deliveredDate;
        if (updates.price !== undefined) row.price = updates.price;
        if (updates.shippingCost !== undefined) row.shipping_cost = updates.shippingCost;
        if (updates.origin !== undefined) row.origin = updates.origin;
        if (updates.destination !== undefined) row.destination = updates.destination;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        const { data, error } = await supabaseClient.from('packages').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapPackage(data);
    }

    async function remove(id) {
        if (useLocalStorage) { localPackages = localPackages.filter(x => x.id !== id); saveLocal(); return true; }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('packages').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) { const p = await getById(id); if (!p) return null; return update(id, { favorite: !p.favorite }); }

    async function markDelivered(id) {
        return update(id, { status: 'delivered', deliveredDate: new Date().toISOString().split('T')[0] });
    }

    const CARRIERS = [
        { value: 'poste', label: 'La Poste', icon: '📮' },
        { value: 'dhl', label: 'DHL', icon: '📦' },
        { value: 'ups', label: 'UPS', icon: '📦' },
        { value: 'fedex', label: 'FedEx', icon: '📦' },
        { value: 'chronopost', label: 'Chronopost', icon: '⚡' },
        { value: 'colissimo', label: 'Colissimo', icon: '📬' },
        { value: 'amazon', label: 'Amazon', icon: '📦' },
        { value: 'autre', label: 'Autre', icon: '🚚' }
    ];

    const STATUSES = [
        { value: 'ordered', label: 'Commandé', icon: '🛒', color: '#64748B' },
        { value: 'processing', label: 'En préparation', icon: '📋', color: '#6366F1' },
        { value: 'shipped', label: 'Expédié', icon: '📤', color: '#F59E0B' },
        { value: 'in_transit', label: 'En transit', icon: '🚚', color: '#F97316' },
        { value: 'out_for_delivery', label: 'En livraison', icon: '🏃', color: '#A78BFA' },
        { value: 'delivered', label: 'Livré', icon: '✅', color: '#22C55E' },
        { value: 'returned', label: 'Retourné', icon: '↩️', color: '#EF4444' }
    ];

    function getCarrierInfo(val) { return CARRIERS.find(c => c.value === val) || CARRIERS[CARRIERS.length - 1]; }
    function getStatusInfo(val) { return STATUSES.find(s => s.value === val) || STATUSES[0]; }

    function getDaysUntilDelivery(pkg) {
        if (!pkg.expectedDate) return null;
        return Math.ceil((new Date(pkg.expectedDate) - new Date()) / (1000 * 60 * 60 * 24));
    }

    async function getStats() {
        const all = await getAll();
        const inTransit = all.filter(p => ['shipped', 'in_transit', 'out_for_delivery'].includes(p.status)).length;
        const delivered = all.filter(p => p.status === 'delivered').length;
        const totalSpent = all.reduce((s, p) => s + p.price + p.shippingCost, 0);
        return { total: all.length, inTransit, delivered, totalSpent: totalSpent.toFixed(2) };
    }

    function exportCSV(pkgs) {
        const header = 'Nom,Numéro suivi,Transporteur,Boutique,Statut,Commandé,Livraison prévue,Prix\n';
        const rows = pkgs.map(p => `"${p.name}","${p.trackingNumber}","${p.carrier}","${p.store}","${p.status}","${p.orderDate}","${p.expectedDate}",${p.price}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'colis.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite, markDelivered,
        getStats, exportCSV, getDaysUntilDelivery, getCarrierInfo, getStatusInfo,
        CARRIERS, STATUSES
    };
})();
