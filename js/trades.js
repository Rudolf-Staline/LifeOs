// ===================================================================
//  MODULE : Trades (Journal de Trading)
// ===================================================================
const Trades = (() => {
    const TABLE = 'trades';
    const LOCAL_KEY = 'monbudget_trades';
    let useSupabase = false;

    const INSTRUMENTS = [
        { value: 'forex', label: 'Forex', icon: '💱', color: '#2563EB' },
        { value: 'crypto', label: 'Crypto', icon: '₿', color: '#F59E0B' },
        { value: 'stock', label: 'Actions', icon: '📈', color: '#10B981' },
        { value: 'etf', label: 'ETF', icon: '📊', color: '#8B5CF6' },
        { value: 'commodity', label: 'Matières premières', icon: '🛢️', color: '#EF4444' },
        { value: 'index', label: 'Indices', icon: '📉', color: '#06B6D4' },
        { value: 'option', label: 'Options', icon: '🎯', color: '#EC4899' },
        { value: 'future', label: 'Futures', icon: '⏳', color: '#F97316' },
        { value: 'bond', label: 'Obligations', icon: '📜', color: '#6366F1' },
        { value: 'autre', label: 'Autre', icon: '📋', color: '#64748B' }
    ];

    const DIRECTIONS = [
        { value: 'long', label: 'Long (Achat)', icon: '🟢' },
        { value: 'short', label: 'Short (Vente)', icon: '🔴' }
    ];

    const STATUSES = [
        { value: 'open', label: 'Ouvert', icon: '🔵', color: '#2563EB' },
        { value: 'closed', label: 'Clôturé', icon: '✅', color: '#10B981' },
        { value: 'cancelled', label: 'Annulé', icon: '⛔', color: '#EF4444' }
    ];

    const STRATEGIES = [
        { value: 'scalping', label: 'Scalping' },
        { value: 'daytrading', label: 'Day Trading' },
        { value: 'swing', label: 'Swing Trading' },
        { value: 'position', label: 'Position Trading' },
        { value: 'breakout', label: 'Breakout' },
        { value: 'trend', label: 'Suivi de tendance' },
        { value: 'reversal', label: 'Reversal' },
        { value: 'range', label: 'Range Trading' },
        { value: 'news', label: 'News Trading' },
        { value: 'autre', label: 'Autre' }
    ];

    function getInstrumentInfo(v) { return INSTRUMENTS.find(t => t.value === v) || INSTRUMENTS[INSTRUMENTS.length - 1]; }
    function getDirectionInfo(v) { return DIRECTIONS.find(t => t.value === v) || DIRECTIONS[0]; }
    function getStatusInfo(v) { return STATUSES.find(t => t.value === v) || STATUSES[0]; }
    function getStrategyInfo(v) { return STRATEGIES.find(t => t.value === v) || STRATEGIES[STRATEGIES.length - 1]; }

    function mapRow(r) {
        return {
            id: r.id, symbol: r.symbol || '', instrument: r.instrument || 'forex',
            direction: r.direction || 'long', status: r.status || 'open',
            strategy: r.strategy || 'autre',
            entryPrice: parseFloat(r.entry_price || r.entryPrice) || 0,
            exitPrice: parseFloat(r.exit_price || r.exitPrice) || 0,
            quantity: parseFloat(r.quantity) || 0,
            leverage: parseFloat(r.leverage) || 1,
            stopLoss: parseFloat(r.stop_loss || r.stopLoss) || 0,
            takeProfit: parseFloat(r.take_profit || r.takeProfit) || 0,
            fees: parseFloat(r.fees) || 0,
            pnl: parseFloat(r.pnl) || 0,
            pnlPercent: parseFloat(r.pnl_percent || r.pnlPercent) || 0,
            entryDate: r.entry_date || r.entryDate || '',
            exitDate: r.exit_date || r.exitDate || '',
            platform: r.platform || '',
            emotionEntry: r.emotion_entry || r.emotionEntry || '',
            emotionExit: r.emotion_exit || r.emotionExit || '',
            notes: r.notes || '', tags: r.tags || '',
            screenshot: r.screenshot || '',
            favorite: r.favorite || false,
            created_at: r.created_at || new Date().toISOString()
        };
    }

    function toRow(d) {
        return {
            symbol: d.symbol, instrument: d.instrument, direction: d.direction,
            status: d.status, strategy: d.strategy,
            entry_price: d.entryPrice, exit_price: d.exitPrice,
            quantity: d.quantity, leverage: d.leverage,
            stop_loss: d.stopLoss, take_profit: d.takeProfit,
            fees: d.fees, pnl: d.pnl, pnl_percent: d.pnlPercent,
            entry_date: d.entryDate, exit_date: d.exitDate,
            platform: d.platform,
            emotion_entry: d.emotionEntry, emotion_exit: d.emotionExit,
            notes: d.notes, tags: d.tags, screenshot: d.screenshot,
            favorite: d.favorite
        };
    }

    function calcPnL(d) {
        if (!d.exitPrice || !d.entryPrice || !d.quantity) return { pnl: 0, pnlPercent: 0 };
        const diff = d.direction === 'long'
            ? (d.exitPrice - d.entryPrice) * d.quantity
            : (d.entryPrice - d.exitPrice) * d.quantity;
        const pnl = diff * (d.leverage || 1) - (d.fees || 0);
        const pnlPercent = d.entryPrice > 0 ? ((d.exitPrice - d.entryPrice) / d.entryPrice * 100 * (d.direction === 'short' ? -1 : 1)) : 0;
        return { pnl: Math.round(pnl * 100) / 100, pnlPercent: Math.round(pnlPercent * 100) / 100 };
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
        const calc = calcPnL(d);
        d.pnl = calc.pnl; d.pnlPercent = calc.pnlPercent;
        const item = mapRow({ ...d, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        if (useSupabase) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const { error } = await supabaseClient.from(TABLE).insert({ ...toRow(item), id: item.id, user_id: session.user.id });
            if (error) { console.error(error); return null; }
        } else { const all = _local(); all.unshift(item); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('create', 'trade', item.id, `Trade: ${item.symbol} ${item.direction}`);
        return item;
    }

    async function update(id, d) {
        const calc = calcPnL(d);
        d.pnl = calc.pnl; d.pnlPercent = calc.pnlPercent;
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).update({ ...toRow(d), updated_at: new Date().toISOString() }).eq('id', id);
            if (error) { console.error(error); return null; }
        } else {
            const all = _local(); const idx = all.findIndex(i => i.id === id);
            if (idx !== -1) { all[idx] = { ...all[idx], ...d, updated_at: new Date().toISOString() }; _saveLocal(all); }
        }
        if (typeof AuditLog !== 'undefined') AuditLog.log('update', 'trade', id, 'Trade modifié');
        return true;
    }

    async function remove(id) {
        if (useSupabase) {
            const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
            if (error) { console.error(error); return false; }
        } else { let all = _local(); all = all.filter(i => i.id !== id); _saveLocal(all); }
        if (typeof AuditLog !== 'undefined') AuditLog.log('delete', 'trade', id, 'Trade supprimé');
        return true;
    }

    async function toggleFavorite(id) { const item = await getById(id); if (item) return update(id, { ...item, favorite: !item.favorite }); }

    async function closeTrade(id, exitPrice, exitDate) {
        const item = await getById(id);
        if (!item) return false;
        item.exitPrice = parseFloat(exitPrice);
        item.exitDate = exitDate || new Date().toISOString().split('T')[0];
        item.status = 'closed';
        const calc = calcPnL(item);
        item.pnl = calc.pnl; item.pnlPercent = calc.pnlPercent;
        return update(id, item);
    }

    async function getStats() {
        const all = await getAll();
        const closed = all.filter(t => t.status === 'closed');
        const open = all.filter(t => t.status === 'open');
        const winners = closed.filter(t => t.pnl > 0);
        const losers = closed.filter(t => t.pnl < 0);
        const totalPnL = closed.reduce((s, t) => s + t.pnl, 0);
        const totalFees = all.reduce((s, t) => s + t.fees, 0);
        const winRate = closed.length > 0 ? (winners.length / closed.length * 100) : 0;
        const avgWin = winners.length > 0 ? winners.reduce((s, t) => s + t.pnl, 0) / winners.length : 0;
        const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((s, t) => s + t.pnl, 0) / losers.length) : 0;
        const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
        return {
            total: all.length, open: open.length, closed: closed.length,
            winners: winners.length, losers: losers.length,
            totalPnL: totalPnL.toFixed(2), totalFees: totalFees.toFixed(2),
            winRate: winRate.toFixed(1), profitFactor: profitFactor.toFixed(2),
            avgWin: avgWin.toFixed(2), avgLoss: avgLoss.toFixed(2),
            favorites: all.filter(t => t.favorite).length
        };
    }

    function exportCSV(items) {
        const hdr = ['Symbole', 'Instrument', 'Direction', 'Statut', 'Stratégie', 'Prix Entrée', 'Prix Sortie', 'Quantité', 'Levier', 'P&L', 'P&L%', 'Frais', 'Date Entrée', 'Date Sortie', 'Plateforme'];
        const rows = items.map(i => [i.symbol, i.instrument, i.direction, i.status, i.strategy, i.entryPrice, i.exitPrice, i.quantity, i.leverage, i.pnl, i.pnlPercent, i.fees, i.entryDate, i.exitDate, i.platform]);
        const csv = [hdr, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'trades.csv'; a.click();
    }

    return { initStorage, getAll, getById, add, update, remove, toggleFavorite, closeTrade, calcPnL, getStats, exportCSV,
             INSTRUMENTS, DIRECTIONS, STATUSES, STRATEGIES,
             getInstrumentInfo, getDirectionInfo, getStatusInfo, getStrategyInfo };
})();
