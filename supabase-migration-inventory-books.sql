-- ===================================================================
-- MonBudget — Migration : Ajout tables Inventory & Books
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- (Supabase Dashboard → SQL Editor → New query)
-- ===================================================================

-- ---------------------------------------------------------------
-- 7. Table inventaire & stock
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'autre',
    quantity NUMERIC(12,2) DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT DEFAULT 'pièces',
    price NUMERIC(12,2) DEFAULT 0 CHECK (price >= 0),
    min_quantity NUMERIC(12,2) DEFAULT 0 CHECK (min_quantity >= 0),
    purchase_date DATE,
    expiry_date DATE,
    planned_duration TEXT,
    location TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- 8. Table bibliothèque & lecture
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    author TEXT DEFAULT '',
    genre TEXT DEFAULT 'autre',
    total_pages INTEGER DEFAULT 0 CHECK (total_pages >= 0),
    current_page INTEGER DEFAULT 0 CHECK (current_page >= 0),
    status TEXT DEFAULT 'to-read' CHECK (status IN ('to-read', 'reading', 'finished', 'abandoned')),
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    start_date DATE,
    finish_date DATE,
    cover TEXT DEFAULT '📖',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Policies inventory
CREATE POLICY "Users can view own inventory" ON inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory" ON inventory FOR DELETE USING (auth.uid() = user_id);

-- Policies books
CREATE POLICY "Users can view own books" ON books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own books" ON books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON books FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- Index performances
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_category ON inventory(user_id, category);
CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_user_status ON books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_books_user_genre ON books(user_id, genre);

-- ✅ Migration terminée !
-- Les modules Inventaire et Bibliothèque utiliseront Supabase automatiquement.
