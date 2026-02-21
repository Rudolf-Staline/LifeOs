/* ===================================================================
   inventory.js — Inventory & Stock Management Module
   Gestion des articles, aliments et ressources en stock
   =================================================================== */

const Inventory = (() => {

    // ===== SUPABASE CRUD =====

    function getUserId() {
        return Auth.getUserId();
    }

    function formatMoney(amount) {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    function mapItem(row) {
        if (!row) return null;
        return {
            id: row.id,
            name: row.name,
            category: row.category,
            quantity: parseFloat(row.quantity || 0),
            unit: row.unit || 'pièces',
            price: parseFloat(row.price || 0),
            minQuantity: parseFloat(row.min_quantity || 0),
            purchaseDate: row.purchase_date,
            expiryDate: row.expiry_date,
            plannedDuration: row.planned_duration ? parseInt(row.planned_duration) : null,
            location: row.location || '',
            notes: row.notes || '',
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    // ===== STORAGE (Supabase with localStorage fallback) =====

    const STORAGE_KEY = 'monbudget-inventory-v1';
    let useLocalStorage = false;
    let localItems = [];

    async function initStorage() {
        // Try Supabase first, fallback to localStorage
        try {
            const { data, error } = await supabaseClient
                .from('inventory')
                .select('id')
                .limit(1);
            if (error && error.code === '42P01') {
                // Table doesn't exist — use localStorage
                console.log('Inventory: Supabase table not found, using localStorage');
                useLocalStorage = true;
                loadLocal();
            } else if (error) {
                console.warn('Inventory: Supabase error, using localStorage', error);
                useLocalStorage = true;
                loadLocal();
            }
        } catch (e) {
            console.warn('Inventory: Falling back to localStorage', e);
            useLocalStorage = true;
            loadLocal();
        }
    }

    function loadLocal() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            localItems = raw ? JSON.parse(raw) : [];
        } catch (e) {
            localItems = [];
        }
    }

    function saveLocal() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems));
    }

    function generateLocalId() {
        return 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ===== CRUD OPERATIONS =====

    async function getAll() {
        if (useLocalStorage) {
            return localItems.map(i => ({...i}));
        }
        const { data, error } = await supabaseClient
            .from('inventory')
            .select('*')
            .eq('user_id', getUserId())
            .order('name');
        return error ? [] : data.map(mapItem);
    }

    async function getById(id) {
        if (useLocalStorage) {
            return localItems.find(i => i.id === id) || null;
        }
        const { data, error } = await supabaseClient
            .from('inventory')
            .select('*')
            .eq('id', id)
            .single();
        return error ? null : mapItem(data);
    }

    async function create(itemData) {
        if (useLocalStorage) {
            const item = {
                id: generateLocalId(),
                name: itemData.name,
                category: itemData.category || 'autre',
                quantity: parseFloat(itemData.quantity || 0),
                unit: itemData.unit || 'pièces',
                price: parseFloat(itemData.price || 0),
                minQuantity: parseFloat(itemData.minQuantity || 0),
                purchaseDate: itemData.purchaseDate || null,
                expiryDate: itemData.expiryDate || null,
                plannedDuration: itemData.plannedDuration || null,
                location: itemData.location || '',
                notes: itemData.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            localItems.push(item);
            saveLocal();
            return item;
        }

        const { data, error } = await supabaseClient
            .from('inventory')
            .insert({
                user_id: getUserId(),
                name: itemData.name,
                category: itemData.category || 'autre',
                quantity: itemData.quantity,
                unit: itemData.unit || 'pièces',
                price: itemData.price || 0,
                min_quantity: itemData.minQuantity || 0,
                purchase_date: itemData.purchaseDate || null,
                expiry_date: itemData.expiryDate || null,
                planned_duration: itemData.plannedDuration || null,
                location: itemData.location || '',
                notes: itemData.notes || ''
            })
            .select()
            .single();
        if (error) { console.error('Inventory create error:', error); return null; }
        return mapItem(data);
    }

    async function update(id, itemData) {
        if (useLocalStorage) {
            const idx = localItems.findIndex(i => i.id === id);
            if (idx === -1) return null;
            const item = localItems[idx];
            if (itemData.name !== undefined) item.name = itemData.name;
            if (itemData.category !== undefined) item.category = itemData.category;
            if (itemData.quantity !== undefined) item.quantity = parseFloat(itemData.quantity);
            if (itemData.unit !== undefined) item.unit = itemData.unit;
            if (itemData.price !== undefined) item.price = parseFloat(itemData.price);
            if (itemData.minQuantity !== undefined) item.minQuantity = parseFloat(itemData.minQuantity);
            if (itemData.purchaseDate !== undefined) item.purchaseDate = itemData.purchaseDate;
            if (itemData.expiryDate !== undefined) item.expiryDate = itemData.expiryDate;
            if (itemData.plannedDuration !== undefined) item.plannedDuration = itemData.plannedDuration;
            if (itemData.location !== undefined) item.location = itemData.location;
            if (itemData.notes !== undefined) item.notes = itemData.notes;
            item.updatedAt = new Date().toISOString();
            localItems[idx] = item;
            saveLocal();
            return {...item};
        }

        const updateObj = { updated_at: new Date().toISOString() };
        if (itemData.name !== undefined) updateObj.name = itemData.name;
        if (itemData.category !== undefined) updateObj.category = itemData.category;
        if (itemData.quantity !== undefined) updateObj.quantity = itemData.quantity;
        if (itemData.unit !== undefined) updateObj.unit = itemData.unit;
        if (itemData.price !== undefined) updateObj.price = itemData.price;
        if (itemData.minQuantity !== undefined) updateObj.min_quantity = itemData.minQuantity;
        if (itemData.purchaseDate !== undefined) updateObj.purchase_date = itemData.purchaseDate;
        if (itemData.expiryDate !== undefined) updateObj.expiry_date = itemData.expiryDate;
        if (itemData.plannedDuration !== undefined) updateObj.planned_duration = itemData.plannedDuration;
        if (itemData.location !== undefined) updateObj.location = itemData.location;
        if (itemData.notes !== undefined) updateObj.notes = itemData.notes;

        const { data, error } = await supabaseClient
            .from('inventory')
            .update(updateObj)
            .eq('id', id)
            .select()
            .single();
        if (error) return null;
        return mapItem(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            const idx = localItems.findIndex(i => i.id === id);
            if (idx === -1) return false;
            localItems.splice(idx, 1);
            saveLocal();
            return true;
        }
        const { error } = await supabaseClient.from('inventory').delete().eq('id', id);
        return !error;
    }

    async function useQuantity(id, amount) {
        const item = await getById(id);
        if (!item) return null;
        const newQty = Math.max(0, item.quantity - amount);
        return await update(id, { quantity: newQty });
    }

    // ===== COMPUTED HELPERS =====

    function getItemStatus(item) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check expired
        if (item.expiryDate) {
            const expiry = new Date(item.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            if (expiry < today) return 'expired';
            const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 7) return 'expiring';
        }

        // Check low stock
        if (item.minQuantity > 0 && item.quantity <= item.minQuantity) return 'low';
        if (item.quantity <= 0) return 'low';

        return 'ok';
    }

    function getDurationProgress(item) {
        if (!item.plannedDuration || !item.purchaseDate) return null;

        const today = new Date();
        const purchase = new Date(item.purchaseDate);
        const elapsed = Math.max(0, Math.floor((today - purchase) / (1000 * 60 * 60 * 24)));
        const remaining = Math.max(0, item.plannedDuration - elapsed);
        const pct = Math.min(100, Math.max(0, (elapsed / item.plannedDuration) * 100));

        return {
            elapsed,
            remaining,
            total: item.plannedDuration,
            pct,
            label: remaining > 0 ? `${remaining}j restants` : 'Durée dépassée'
        };
    }

    function getExpiryInfo(item) {
        if (!item.expiryDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(item.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (days < 0) return { text: `Expiré depuis ${Math.abs(days)}j`, class: 'text-danger' };
        if (days === 0) return { text: "Expire aujourd'hui", class: 'text-danger' };
        if (days <= 3) return { text: `Expire dans ${days}j`, class: 'text-danger' };
        if (days <= 7) return { text: `Expire dans ${days}j`, class: 'text-warning' };
        return { text: formatDateShort(item.expiryDate), class: '' };
    }

    function getCategoryLabel(cat) {
        const labels = {
            alimentaire: '🍎 Alimentaire',
            hygiene: '🧴 Hygiène',
            menage: '🧹 Ménage',
            electronique: '💡 Électronique',
            vetements: '👕 Vêtements',
            autre: '📦 Autre'
        };
        return labels[cat] || labels.autre;
    }

    function getCategoryIcon(cat) {
        const icons = {
            alimentaire: 'fas fa-apple-alt',
            hygiene: 'fas fa-pump-soap',
            menage: 'fas fa-broom',
            electronique: 'fas fa-lightbulb',
            vetements: 'fas fa-tshirt',
            autre: 'fas fa-box'
        };
        return icons[cat] || icons.autre;
    }

    function getStatusBadge(status) {
        const badges = {
            ok: { label: 'En stock', class: 'badge-ok' },
            low: { label: 'Stock faible', class: 'badge-low' },
            expired: { label: 'Expiré', class: 'badge-expired' },
            expiring: { label: 'Expire bientôt', class: 'badge-expiring' }
        };
        return badges[status] || badges.ok;
    }

    function formatDateShort(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // ===== EXPORT =====
    function exportCSV(items) {
        const headers = ['Nom', 'Catégorie', 'Quantité', 'Unité', 'Prix unitaire', 'Quantité min', 'Date achat', 'Date expiration', 'Durée prévue (j)', 'Emplacement', 'Statut', 'Notes'];
        const rows = items.map(item => {
            const status = getItemStatus(item);
            return [
                item.name,
                item.category,
                item.quantity,
                item.unit,
                item.price,
                item.minQuantity,
                item.purchaseDate || '',
                item.expiryDate || '',
                item.plannedDuration || '',
                item.location,
                status,
                item.notes
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventaire_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ===== PUBLIC API =====
    return {
        initStorage,
        getAll,
        getById,
        create,
        update,
        remove,
        useQuantity,
        getItemStatus,
        getDurationProgress,
        getExpiryInfo,
        getCategoryLabel,
        getCategoryIcon,
        getStatusBadge,
        formatDateShort,
        formatMoney,
        exportCSV
    };

})();
