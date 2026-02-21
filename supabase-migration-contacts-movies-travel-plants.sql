-- ===================================================================
-- MIGRATION: Ajout tables Contacts, Films, Voyages, Plantes
-- À exécuter dans Supabase SQL Editor si les tables n'existent pas
-- ===================================================================

-- 1. Table contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    group_name TEXT DEFAULT 'autre',
    company TEXT DEFAULT '',
    birthday DATE,
    address TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    avatar TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table movies (films & séries)
CREATE TABLE IF NOT EXISTS movies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'movie' CHECK (type IN ('movie', 'series', 'documentary', 'anime')),
    genre TEXT DEFAULT 'autre',
    year INTEGER DEFAULT 0,
    director TEXT DEFAULT '',
    platform TEXT DEFAULT '',
    status TEXT DEFAULT 'to-watch' CHECK (status IN ('to-watch', 'watching', 'watched', 'abandoned')),
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    season INTEGER DEFAULT 0,
    episode INTEGER DEFAULT 0,
    total_seasons INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    watch_date DATE,
    poster TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Table trips (voyages)
CREATE TABLE IF NOT EXISTS trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    destination TEXT NOT NULL,
    country TEXT DEFAULT '',
    continent TEXT DEFAULT 'autre',
    status TEXT DEFAULT 'planned' CHECK (status IN ('dream', 'planned', 'ongoing', 'visited')),
    start_date DATE,
    end_date DATE,
    transport TEXT DEFAULT 'avion',
    companions TEXT DEFAULT '',
    highlights TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    favorite BOOLEAN DEFAULT false,
    photos TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table plants (plantes)
CREATE TABLE IF NOT EXISTS plants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT DEFAULT '',
    location TEXT DEFAULT '',
    water_frequency INTEGER DEFAULT 7 CHECK (water_frequency >= 1),
    last_watered DATE,
    last_fertilized DATE,
    sunlight TEXT DEFAULT 'medium' CHECK (sunlight IN ('low', 'medium', 'high', 'direct')),
    health TEXT DEFAULT 'good' CHECK (health IN ('excellent', 'good', 'fair', 'poor', 'dead')),
    acquired DATE,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    photo TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- ROW LEVEL SECURITY
-- ===================================================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Policies contacts
CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);

-- Policies movies
CREATE POLICY "Users can view own movies" ON movies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own movies" ON movies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own movies" ON movies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own movies" ON movies FOR DELETE USING (auth.uid() = user_id);

-- Policies trips
CREATE POLICY "Users can view own trips" ON trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON trips FOR DELETE USING (auth.uid() = user_id);

-- Policies plants
CREATE POLICY "Users can view own plants" ON plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plants" ON plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plants" ON plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plants" ON plants FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- INDEX DE PERFORMANCE
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_group ON contacts(user_id, group_name);
CREATE INDEX IF NOT EXISTS idx_movies_user ON movies(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_user_status ON movies(user_id, status);
CREATE INDEX IF NOT EXISTS idx_movies_user_type ON movies(user_id, type);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_status ON trips(user_id, status);
CREATE INDEX IF NOT EXISTS idx_plants_user ON plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plants_user_health ON plants(user_id, health);

-- ===================================================================
-- TRIGGER updated_at pour les nouvelles tables
-- ===================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
