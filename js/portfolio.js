// ===================================================================
//  MODULE : Portfolio (Portefeuille d'investissement)
// ===================================================================
const Portfolio = (() => {
    const TABLE = 'portfolio_positions';
    const LOCAL_KEY = 'monbudget_portfolio';
    let useSupabase = false;

    const ASSET_TYPES = [
        { value: 'stock', label: 'Actions', icon: '📈', color: '#10B981' },
        { value: 'etf', label: 'ETF', icon: '📊', color: '#8B5CF6' },
        { value: 'crypto', label: 'Crypto', icon: '₿', color: '#F59E0B' },
        { value: 'forex', label: 'Devises', icon: '💱', color: '#2563EB' },
        { value: 'bond', label: 'Obligations', icon: '📜', color: '#6366F1' },
        { value: 'commodity', label: 'Matières premières', icon: '🛢️', color: '#EF4444' },
        { value: 'reit', label: 'Immobilier (REIT)', icon: '🏢', color: '#F97316' },
        { value: 'fund', label: 'Fonds', icon: '🏦', color: '#06B6D4' },
        { value: 'autre', label: 'Autre', icon: '📋', color: '#64748B' }
    ];

    const SECTORS = [
        { value: 'tech', label: 'Technologie' }, { value: 'finance', label: 'Finance' },
        { value: 'health', label: 'Santé' }, { value: 'energy', label: 'Énergie' },
        { value: 'consumer', label: 'Consommation' }, { value: 'industrial', label: 'Industrie' },
        { value: 'telecom', label: 'Télécoms' }, { value: 'materials', label: 'Matériaux' },
        { value: 'utilities', label: 'Services publics' }, { value: 'realestate', label: 'Immobilier' },
        { value: 'defi', label: 'DeFi' }, { value: 'nft', label: 'NFT/Metaverse' },
        { value: 'autre', label: 'Autre' }
    ];

    function getAssetTypeInfo(v) { return ASSET_TYPES.find(t => t.value === v) || ASSET_TYPES[ASSET_TYPES.length - 1]; }
    function getSectorInfo(v) { return SECTORS.find(t => t.value === v) || SECTORS[SECTORS.length - 1]; }

    function mapRow(r) {
        return {
            id: r.id, symbol: r.symbol || '', name: r.name || '',
            assetType: r.asset_type || r.assetType || 'stock',
            sector: r.sector || 'autre',
            quantity: parseFloat(r.quantity) || 0,
            avgPrice: parseFloat(r.avg_price || r.avgPrice) || 0,
            currentPrice: parseFloat(r.current_price || r.currentPrice) || 0,
            currency: r.currency || 'MAD',
            platform: r.platform || '',
            dividendYield: parseFloat(r.dividend_yield || r.dividendYield) || 0,
            targetPrice: parseFloat(r.target_price || r.targetPrice) || 0,
            stopLoss: parseFloat(r.stop_loss || r.stopLoss) || 0,
            purchaseDate: r.purchase_date || r.purchaseDate || '',
            notes: r.notes || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            symbol: d.symbol, name: d.name, asset_type: d.assetType,
            sector: d.sector, quantity: d.quantity, avg_price: d.avgPrice,
            current_price: d.currentPrice, currency: d.currency,
            platform: d.platform, dividend_yield: d.dividendYield,
            target_price: d.targetPrice, stop_loss: d.stopLoss,
            purchase_date: d.purchaseDate, notes: d.notes, favorite: d.favorite
        };
    }

    function calcPosition(p) {
        const invested = p.avgPrice * p.quantity;
        const currentValue = p.currentPrice * p.quantity;
        const pnl = currentValue - invested;
        const pnlPercent = invested > 0 ? (pnl / invested * 100) : 0;
        return {
            invested: Math.round(invested * 100) / 100,
            currentValue: Math.round(currentValue * 100) / 100,
            pnl: Math.round(pnl * 100) / 100,
            pnlPercent: Math.round(pnlPercent * 100) / 100
        };
    }

    function _local() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; } }
    function _saveLocal(data) { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); }

    async function initStorage() {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) { useSupabase = true; return; }
        }
        useSupabase = false;
    }

    async function getAll() {
        if (useSupabase) {
            const { data } = await supabaseClient.from(TABLE).select('*').order('created_at', { ascending: false });
            return (data || []).map(mapRow);
        }
        return _local().map(mapRow);
    }

    async function getById(id) { const all = await getAll(); return all.find(i => i.id === id) || null; }

    async function add(d) {
        const item = mapRow({ ...d, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        if (useSupabase) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const { error } = await supabaseClient.from(TABLE).insert({ ...toRow(item), id: item.id, user_id: session.user.id });
            if (error) { console.error(error); return null; }
        } else { const all = _local(); all.unshift(item); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'portfolio', item.id, `Position: ${item.symbol}`);
        return item;
    }

    async function update(id, d) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).update({ ...toRow(d), updated_at: new Date().toISOString() }).eq('id', id);
            if (error) { console.error(error); return null; }
        } else {
            const all = _local(); const idx = all.findIndex(i => i.id === id);
            if (idx !== -1) { all[idx] = { ...all[idx], ...d, updated_at: new Date().toISOString() }; _saveLocal(all); }
        }
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'portfolio', id, 'Position modifiée');
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'portfolio', id, 'Position supprimée');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { ...item, favorite: !item.favorite }); }

    async function updatePrice(id, newPrice) {
        const item = await getById(id);
        if (!item) return false;
        return update(id, { ...item, currentPrice: parseFloat(newPrice) });
    }

    async function getStats() {
        const all = await getAll();
        let totalInvested = 0, totalValue = 0, totalDividends = 0;
        all.forEach(p => {
            const calc = calcPosition(p);
            totalInvested += calc.invested;
            totalValue += calc.currentValue;
            totalDividends += (p.dividendYield / 100) * calc.currentValue;
        });
        const totalPnL = totalValue - totalInvested;
        const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested * 100) : 0;
        const winners = all.filter(p => { const c = calcPosition(p); return c.pnl > 0; });
        return {
            total: all.length,
            totalInvested: totalInvested.toFixed(2),
            totalValue: totalValue.toFixed(2),
            totalPnL: totalPnL.toFixed(2),
            totalPnLPercent: totalPnLPercent.toFixed(1),
            totalDividends: totalDividends.toFixed(2),
            winners: winners.length,
            losers: all.length - winners.length,
            favorites: all.filter(p => p.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Symbole', 'Nom', 'Type', 'Secteur', 'Quantité', 'Prix moyen', 'Prix actuel', 'P&L', 'P&L%', 'Plateforme'];
        const rows = items.map(i => {
            const c = calcPosition(i);
            return [i.symbol, i.name, i.assetType, i.sector, i.quantity, i.avgPrice, i.currentPrice, c.pnl, c.pnlPercent, i.platform];
        });
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'portfolio.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, updatePrice, calcPosition, getStats, exportCSV,
             ASSET_TYPES, SECTORS, getAssetTypeInfo, getSectorInfo };
})();
