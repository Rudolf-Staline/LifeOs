-- ============================================================
-- Migration: 5 nouveaux modules — Citations, Humeur, Signets, Journal, Défis
-- ============================================================

-- 1. QUOTES (Citations)
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    author VARCHAR(255) DEFAULT '',
    source VARCHAR(255) DEFAULT '',
    category VARCHAR(50) DEFAULT 'inspiration',
    tags VARCHAR(500) DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes_user_policy" ON quotes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_quotes_user ON quotes(user_id);
CREATE INDEX idx_quotes_category ON quotes(user_id, category);

CREATE OR REPLACE FUNCTION update_quotes_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER quotes_updated BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_quotes_timestamp();

-- 2. MOODS (Humeur)
CREATE TABLE IF NOT EXISTS moods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood VARCHAR(20) NOT NULL DEFAULT 'neutral',
    energy INTEGER DEFAULT 5 CHECK (energy >= 1 AND energy <= 10),
    stress INTEGER DEFAULT 5 CHECK (stress >= 1 AND stress <= 10),
    sleep_quality INTEGER DEFAULT 5 CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    activities VARCHAR(500) DEFAULT '',
    emotions VARCHAR(500) DEFAULT '',
    weather VARCHAR(50) DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moods_user_policy" ON moods FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_moods_user ON moods(user_id);
CREATE INDEX idx_moods_date ON moods(user_id, date DESC);

CREATE OR REPLACE FUNCTION update_moods_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER moods_updated BEFORE UPDATE ON moods FOR EACH ROW EXECUTE FUNCTION update_moods_timestamp();

-- 3. BOOKMARKS (Signets)
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(50) DEFAULT 'general',
    tags VARCHAR(500) DEFAULT '',
    is_read BOOLEAN DEFAULT FALSE,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_user_policy" ON bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_category ON bookmarks(user_id, category);

CREATE OR REPLACE FUNCTION update_bookmarks_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER bookmarks_updated BEFORE UPDATE ON bookmarks FOR EACH ROW EXECUTE FUNCTION update_bookmarks_timestamp();

-- 4. JOURNALS (Journal intime)
CREATE TABLE IF NOT EXISTS journals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) DEFAULT '',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    mood VARCHAR(20) DEFAULT 'neutral',
    weather VARCHAR(50) DEFAULT '',
    tags VARCHAR(500) DEFAULT '',
    is_private BOOLEAN DEFAULT TRUE,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journals_user_policy" ON journals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_journals_user ON journals(user_id);
CREATE INDEX idx_journals_date ON journals(user_id, date DESC);

CREATE OR REPLACE FUNCTION update_journals_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER journals_updated BEFORE UPDATE ON journals FOR EACH ROW EXECUTE FUNCTION update_journals_timestamp();

-- 5. CHALLENGES (Défis personnels)
CREATE TABLE IF NOT EXISTS challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(50) DEFAULT 'personal',
    status VARCHAR(20) DEFAULT 'active',
    difficulty VARCHAR(20) DEFAULT 'medium',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    target VARCHAR(255) DEFAULT '',
    reward VARCHAR(255) DEFAULT '',
    tags VARCHAR(500) DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges_user_policy" ON challenges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_challenges_user ON challenges(user_id);
CREATE INDEX idx_challenges_status ON challenges(user_id, status);

CREATE OR REPLACE FUNCTION update_challenges_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER challenges_updated BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_challenges_timestamp();
