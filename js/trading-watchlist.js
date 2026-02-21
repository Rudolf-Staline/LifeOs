// ===================================================================
//  MODULE : Watchlist Trading (Liste de surveillance)
// ===================================================================
const TradingWatchlist = (() => {
    const TABLE = 'trading_watchlist';
    const LOCAL_KEY = 'monbudget_trading_watchlist';
    let useSupabase = false;

    const ASSET_TYPES = [
        { value: 'stock', label: 'Actions', icon: '📈', color: '#10B981' },
        { value: 'etf', label: 'ETF', icon: '📊', color: '#8B5CF6' },
        { value: 'crypto', label: 'Crypto', icon: '₿', color: '#F59E0B' },
        { value: 'forex', label: 'Devises', icon: '💱', color: '#2563EB' },
        { value: 'commodity', label: 'Matières premières', icon: '🛢️', color: '#EF4444' },
        { value: 'index', label: 'Indices', icon: '📉', color: '#06B6D4' },
        { value: 'autre', label: 'Autre', icon: '📋', color: '#64748B' }
    ];

    const SIGNALS = [
        { value: 'strong_buy', label: 'Achat fort', icon: '🟢', color: '#059669' },
        { value: 'buy', label: 'Achat', icon: '🔵', color: '#2563EB' },
        { value: 'neutral', label: 'Neutre', icon: '⚪', color: '#6B7280' },
        { value: 'sell', label: 'Vente', icon: '🟠', color: '#F59E0B' },
        { value: 'strong_sell', label: 'Vente forte', icon: '🔴', color: '#EF4444' }
    ];

    const TIMEFRAMES = [
        { value: 'M1', label: '1 min' }, { value: 'M5', label: '5 min' },
        { value: 'M15', label: '15 min' }, { value: 'M30', label: '30 min' },
        { value: 'H1', label: '1H' }, { value: 'H4', label: '4H' },
        { value: 'D1', label: 'Journalier' }, { value: 'W1', label: 'Hebdo' },
        { value: 'MN', label: 'Mensuel' }
    ];

    function getAssetTypeInfo(v) { return ASSET_TYPES.find(t => t.value === v) || ASSET_TYPES[ASSET_TYPES.length - 1]; }
    function getSignalInfo(v) { return SIGNALS.find(t => t.value === v) || SIGNALS[2]; }
    function getTimeframeInfo(v) { return TIMEFRAMES.find(t => t.value === v) || TIMEFRAMES[6]; }

    function mapRow(r) {
        return {
            id: r.id, symbol: r.symbol || '', name: r.name || '',
            assetType: r.asset_type || r.assetType || 'stock',
            currentPrice: parseFloat(r.current_price || r.currentPrice) || 0,
            targetBuy: parseFloat(r.target_buy || r.targetBuy) || 0,
            targetSell: parseFloat(r.target_sell || r.targetSell) || 0,
            support: parseFloat(r.support) || 0,
            resistance: parseFloat(r.resistance) || 0,
            signal: r.signal || 'neutral',
            timeframe: r.timeframe || 'D1',
            alertEnabled: r.alert_enabled || r.alertEnabled || false,
            alertPrice: parseFloat(r.alert_price || r.alertPrice) || 0,
            analysis: r.analysis || '',
            notes: r.notes || '',
            priority: parseInt(r.priority) || 0,
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            symbol: d.symbol, name: d.name, asset_type: d.assetType,
            current_price: d.currentPrice,
            target_buy: d.targetBuy, target_sell: d.targetSell,
            support: d.support, resistance: d.resistance,
            signal: d.signal, timeframe: d.timeframe,
            alert_enabled: d.alertEnabled, alert_price: d.alertPrice,
            analysis: d.analysis, notes: d.notes,
            priority: d.priority, favorite: d.favorite
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
            const { data } = await supabaseClient.from(TABLE).select('*').order('priority', { ascending: false });
            return (data || []).map(mapRow);
        }
        return _local().map(mapRow).sort((a, b) => b.priority - a.priority);
    }

    async function getById(id) { const all = await getAll(); return all.find(i => i.id === id) || null; }

    async function add(d) {
        const item = mapRow({ ...d, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        if (useSupabase) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const { error } = await supabaseClient.from(TABLE).insert({ ...toRow(item), id: item.id, user_id: session.user.id });
            if (error) { console.error(error); return null; }
        } else { const all = _local(); all.unshift(item); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'watchlist_trading', item.id, `Watchlist: ${item.symbol}`);
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
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'watchlist_trading', id, 'Watchlist modifiée');
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'watchlist_trading', id, 'Watchlist supprimée');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { ...item, favorite: !item.favorite }); }

    async function updatePrice(id, price) {
        const item = await getById(id);
        if (!item) return false;
        return update(id, { ...item, currentPrice: parseFloat(price) });
    }

    async function getStats() {
        const all = await getAll();
        const buySignals = all.filter(i => i.signal === 'strong_buy' || i.signal === 'buy');
        const sellSignals = all.filter(i => i.signal === 'sell' || i.signal === 'strong_sell');
        return {
            total: all.length,
            buySignals: buySignals.length,
            sellSignals: sellSignals.length,
            neutral: all.filter(i => i.signal === 'neutral').length,
            alertsActive: all.filter(i => i.alertEnabled).length,
            favorites: all.filter(i => i.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Symbole', 'Nom', 'Type', 'Prix actuel', 'Cible achat', 'Cible vente', 'Support', 'Résistance', 'Signal', 'Timeframe'];
        const rows = items.map(i => [i.symbol, i.name, i.assetType, i.currentPrice, i.targetBuy, i.targetSell, i.support, i.resistance, i.signal, i.timeframe]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'trading-watchlist.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, updatePrice, getStats, exportCSV,
             ASSET_TYPES, SIGNALS, TIMEFRAMES, getAssetTypeInfo, getSignalInfo, getTimeframeInfo };
})();
