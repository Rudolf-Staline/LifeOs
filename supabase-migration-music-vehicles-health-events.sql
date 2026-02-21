-- ===================================================================
-- MIGRATION: Ajout tables Musique, Véhicules, Santé, Événements
-- À exécuter dans Supabase SQL Editor si les tables n'existent pas
-- ===================================================================

-- 1. Table musique
CREATE TABLE IF NOT EXISTS music (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    artist TEXT DEFAULT '',
    album TEXT DEFAULT '',
    genre TEXT DEFAULT 'autre',
    year INTEGER DEFAULT 0,
    duration TEXT DEFAULT '',
    platform TEXT DEFAULT '',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    mood TEXT DEFAULT '',
    playlist TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    listen_date DATE,
    notes TEXT DEFAULT '',
    cover TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table véhicules
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'car' CHECK (type IN ('car', 'moto', 'scooter', 'van', 'truck', 'bike', 'electric', 'autre')),
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    year INTEGER DEFAULT 0,
    plate TEXT DEFAULT '',
    color TEXT DEFAULT '',
    fuel TEXT DEFAULT 'essence' CHECK (fuel IN ('essence', 'diesel', 'electric', 'hybrid', 'gpl', 'none')),
    mileage INTEGER DEFAULT 0,
    purchase_date DATE,
    purchase_price NUMERIC(12,2) DEFAULT 0,
    insurance_expiry DATE,
    next_service DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'parked', 'sold')),
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    photo TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Table santé (health_records)
CREATE TABLE IF NOT EXISTS health_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'appointment' CHECK (type IN ('appointment', 'medication', 'vaccine', 'exam', 'surgery', 'measure')),
    category TEXT DEFAULT 'general',
    doctor TEXT DEFAULT '',
    location TEXT DEFAULT '',
    date DATE,
    time TEXT DEFAULT '',
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'ongoing')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    medication TEXT DEFAULT '',
    dosage TEXT DEFAULT '',
    frequency TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    symptoms TEXT DEFAULT '',
    diagnosis TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    reminder BOOLEAN DEFAULT false,
    cost NUMERIC(10,2) DEFAULT 0,
    attachment TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table événements
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'personal',
    category TEXT DEFAULT 'autre',
    date DATE,
    end_date DATE,
    time TEXT DEFAULT '',
    end_time TEXT DEFAULT '',
    location TEXT DEFAULT '',
    description TEXT DEFAULT '',
    guests TEXT DEFAULT '',
    budget NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal',
    reminder BOOLEAN DEFAULT false,
    recurring TEXT DEFAULT '',
    color TEXT DEFAULT '#A78BFA',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- ROW LEVEL SECURITY
-- ===================================================================

ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies music
CREATE POLICY "Users can view own music" ON music FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own music" ON music FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own music" ON music FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own music" ON music FOR DELETE USING (auth.uid() = user_id);

-- Policies vehicles
CREATE POLICY "Users can view own vehicles" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON vehicles FOR DELETE USING (auth.uid() = user_id);

-- Policies health_records
CREATE POLICY "Users can view own health_records" ON health_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health_records" ON health_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health_records" ON health_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health_records" ON health_records FOR DELETE USING (auth.uid() = user_id);

-- Policies events
CREATE POLICY "Users can view own events" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- INDEX DE PERFORMANCE
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_music_user ON music(user_id);
CREATE INDEX IF NOT EXISTS idx_music_user_genre ON music(user_id, genre);
CREATE INDEX IF NOT EXISTS idx_music_user_artist ON music(user_id, artist);
CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_status ON vehicles(user_id, status);
CREATE INDEX IF NOT EXISTS idx_health_user ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_user_date ON health_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_health_user_type ON health_records(user_id, type);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_events_user_status ON events(user_id, status);

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

CREATE TRIGGER update_music_updated_at BEFORE UPDATE ON music
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
