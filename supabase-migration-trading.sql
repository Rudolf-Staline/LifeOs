-- ===================================================================
-- MIGRATION: Ajout tables Trading (Trades, Portfolio, Watchlist)
-- À exécuter dans Supabase SQL Editor
-- ===================================================================

-- 1. Table trades (journal de trading)
CREATE TABLE IF NOT EXISTS trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    instrument TEXT DEFAULT 'forex' CHECK (instrument IN ('forex','crypto','stock','etf','commodity','index','option','future','bond','autre')),
    direction TEXT DEFAULT 'long' CHECK (direction IN ('long','short')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
    strategy TEXT DEFAULT 'autre',
    entry_price NUMERIC DEFAULT 0,
    exit_price NUMERIC DEFAULT 0,
    quantity NUMERIC DEFAULT 0,
    leverage NUMERIC DEFAULT 1,
    stop_loss NUMERIC DEFAULT 0,
    take_profit NUMERIC DEFAULT 0,
    fees NUMERIC DEFAULT 0,
    pnl NUMERIC DEFAULT 0,
    pnl_percent NUMERIC DEFAULT 0,
    entry_date DATE,
    exit_date DATE,
    platform TEXT DEFAULT '',
    emotion_entry TEXT DEFAULT '',
    emotion_exit TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    screenshot TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS pour trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own trades" ON trades;
CREATE POLICY "Users manage own trades" ON trades
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Index pour trades
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_instrument ON trades(instrument);
CREATE INDEX IF NOT EXISTS idx_trades_entry_date ON trades(entry_date);

-- 2. Table portfolio_positions (portefeuille d'investissement)
CREATE TABLE IF NOT EXISTS portfolio_positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT DEFAULT '',
    asset_type TEXT DEFAULT 'stock' CHECK (asset_type IN ('stock','etf','crypto','forex','bond','commodity','reit','fund','autre')),
    sector TEXT DEFAULT 'autre',
    quantity NUMERIC DEFAULT 0,
    avg_price NUMERIC DEFAULT 0,
    current_price NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'MAD',
    platform TEXT DEFAULT '',
    dividend_yield NUMERIC DEFAULT 0,
    target_price NUMERIC DEFAULT 0,
    stop_loss NUMERIC DEFAULT 0,
    purchase_date DATE,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS pour portfolio_positions
ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own portfolio" ON portfolio_positions;
CREATE POLICY "Users manage own portfolio" ON portfolio_positions
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Index pour portfolio_positions
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_asset_type ON portfolio_positions(asset_type);

-- 3. Table trading_watchlist (liste de surveillance trading)
CREATE TABLE IF NOT EXISTS trading_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT DEFAULT '',
    asset_type TEXT DEFAULT 'stock' CHECK (asset_type IN ('stock','etf','crypto','forex','commodity','index','autre')),
    current_price NUMERIC DEFAULT 0,
    target_buy NUMERIC DEFAULT 0,
    target_sell NUMERIC DEFAULT 0,
    support NUMERIC DEFAULT 0,
    resistance NUMERIC DEFAULT 0,
    signal TEXT DEFAULT 'neutral' CHECK (signal IN ('strong_buy','buy','neutral','sell','strong_sell')),
    timeframe TEXT DEFAULT 'D1',
    alert_enabled BOOLEAN DEFAULT false,
    alert_price NUMERIC DEFAULT 0,
    analysis TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5),
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS pour trading_watchlist
ALTER TABLE trading_watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own trading watchlist" ON trading_watchlist;
CREATE POLICY "Users manage own trading watchlist" ON trading_watchlist
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Index pour trading_watchlist
CREATE INDEX IF NOT EXISTS idx_twatchlist_user_id ON trading_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_twatchlist_signal ON trading_watchlist(signal);
CREATE INDEX IF NOT EXISTS idx_twatchlist_asset_type ON trading_watchlist(asset_type);
