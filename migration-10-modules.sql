-- ===================================================================
-- MIGRATION : 10 nouveaux modules
-- Pets, Learning, Sleep, Home, Games, Wardrobe, Packages, Ideas, Projects, Passwords
-- ===================================================================

-- 1. PETS
CREATE TABLE IF NOT EXISTS pets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, species TEXT DEFAULT 'chien', breed TEXT DEFAULT '',
    birthdate DATE, weight NUMERIC(6,2) DEFAULT 0, gender TEXT DEFAULT '',
    color TEXT DEFAULT '', microchip TEXT DEFAULT '', vet TEXT DEFAULT '',
    vet_phone TEXT DEFAULT '', last_vet_visit DATE, next_vet_visit DATE,
    vaccinations TEXT DEFAULT '', food TEXT DEFAULT '', allergies TEXT DEFAULT '',
    notes TEXT DEFAULT '', photo TEXT DEFAULT '', favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_pets_user ON pets(user_id);
CREATE INDEX idx_pets_user_species ON pets(user_id, species);

-- 2. LEARNING
CREATE TABLE IF NOT EXISTS learning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL, platform TEXT DEFAULT '', category TEXT DEFAULT 'dev',
    instructor TEXT DEFAULT '', url TEXT DEFAULT '',
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','paused','dropped')),
    progress INTEGER DEFAULT 0, rating INTEGER DEFAULT 0,
    start_date DATE, end_date DATE, duration NUMERIC(6,1) DEFAULT 0,
    cost NUMERIC(10,2) DEFAULT 0, certificate BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '', favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE learning ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own learning" ON learning FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning" ON learning FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning" ON learning FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own learning" ON learning FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_learning_user ON learning(user_id);
CREATE INDEX idx_learning_user_status ON learning(user_id, status);

-- 3. SLEEP_ENTRIES
CREATE TABLE IF NOT EXISTS sleep_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL, bedtime TEXT DEFAULT '', wake_time TEXT DEFAULT '',
    duration NUMERIC(4,1) DEFAULT 0, quality INTEGER DEFAULT 3,
    mood TEXT DEFAULT 'normal', dreams TEXT DEFAULT '',
    interruptions INTEGER DEFAULT 0, factors TEXT DEFAULT '',
    nap BOOLEAN DEFAULT false, nap_duration NUMERIC(4,1) DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sleep_entries" ON sleep_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_entries" ON sleep_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_entries" ON sleep_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_entries" ON sleep_entries FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_sleep_user ON sleep_entries(user_id);
CREATE INDEX idx_sleep_user_date ON sleep_entries(user_id, date);

-- 4. HOME_TASKS
CREATE TABLE IF NOT EXISTS home_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL, room TEXT DEFAULT 'autre', category TEXT DEFAULT 'maintenance',
    priority TEXT DEFAULT 'normal', status TEXT DEFAULT 'todo',
    due_date DATE, completed_date DATE, frequency TEXT DEFAULT '',
    cost NUMERIC(10,2) DEFAULT 0, contractor TEXT DEFAULT '',
    contractor_phone TEXT DEFAULT '', description TEXT DEFAULT '',
    notes TEXT DEFAULT '', favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE home_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own home_tasks" ON home_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own home_tasks" ON home_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own home_tasks" ON home_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own home_tasks" ON home_tasks FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_home_tasks_user ON home_tasks(user_id);
CREATE INDEX idx_home_tasks_user_status ON home_tasks(user_id, status);

-- 5. GAMES
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL, platform TEXT DEFAULT 'pc', genre TEXT DEFAULT 'action',
    status TEXT DEFAULT 'backlog', progress INTEGER DEFAULT 0,
    hours_played NUMERIC(8,1) DEFAULT 0, rating INTEGER DEFAULT 0,
    release_year INTEGER DEFAULT 0, developer TEXT DEFAULT '',
    publisher TEXT DEFAULT '', price NUMERIC(10,2) DEFAULT 0,
    start_date DATE, completed_date DATE, notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own games" ON games FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own games" ON games FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own games" ON games FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own games" ON games FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_games_user ON games(user_id);
CREATE INDEX idx_games_user_status ON games(user_id, status);

-- 6. WARDROBE
CREATE TABLE IF NOT EXISTS wardrobe (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, category TEXT DEFAULT 'top', brand TEXT DEFAULT '',
    color TEXT DEFAULT '', size TEXT DEFAULT '', season TEXT DEFAULT 'all',
    occasion TEXT DEFAULT 'casual', condition TEXT DEFAULT 'good',
    price NUMERIC(10,2) DEFAULT 0, purchase_date DATE,
    last_worn DATE, times_worn INTEGER DEFAULT 0,
    notes TEXT DEFAULT '', photo TEXT DEFAULT '', favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE wardrobe ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wardrobe" ON wardrobe FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wardrobe" ON wardrobe FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wardrobe" ON wardrobe FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wardrobe" ON wardrobe FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_wardrobe_user ON wardrobe(user_id);
CREATE INDEX idx_wardrobe_user_category ON wardrobe(user_id, category);

-- 7. PACKAGES
CREATE TABLE IF NOT EXISTS packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, tracking_number TEXT DEFAULT '', carrier TEXT DEFAULT 'poste',
    store TEXT DEFAULT '', status TEXT DEFAULT 'ordered',
    order_date DATE, shipped_date DATE, expected_date DATE, delivered_date DATE,
    price NUMERIC(10,2) DEFAULT 0, shipping_cost NUMERIC(10,2) DEFAULT 0,
    origin TEXT DEFAULT '', destination TEXT DEFAULT '',
    notes TEXT DEFAULT '', favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own packages" ON packages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own packages" ON packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own packages" ON packages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own packages" ON packages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_packages_user ON packages(user_id);
CREATE INDEX idx_packages_user_status ON packages(user_id, status);

-- 8. IDEAS
CREATE TABLE IF NOT EXISTS ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL, category TEXT DEFAULT 'general', description TEXT DEFAULT '',
    priority TEXT DEFAULT 'normal', status TEXT DEFAULT 'new',
    impact TEXT DEFAULT 'medium', effort TEXT DEFAULT 'medium',
    tags TEXT DEFAULT '', due_date DATE, source TEXT DEFAULT '',
    notes TEXT DEFAULT '', favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ideas" ON ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas" ON ideas FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_ideas_user ON ideas(user_id);
CREATE INDEX idx_ideas_user_status ON ideas(user_id, status);

-- 9. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, description TEXT DEFAULT '', category TEXT DEFAULT 'personal',
    status TEXT DEFAULT 'planning', priority TEXT DEFAULT 'normal',
    progress INTEGER DEFAULT 0, start_date DATE, deadline DATE, completed_date DATE,
    budget NUMERIC(12,2) DEFAULT 0, spent NUMERIC(12,2) DEFAULT 0,
    client TEXT DEFAULT '', team TEXT DEFAULT '', tags TEXT DEFAULT '',
    notes TEXT DEFAULT '', favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);

-- 10. PASSWORDS
CREATE TABLE IF NOT EXISTS passwords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    site TEXT NOT NULL, url TEXT DEFAULT '', username TEXT DEFAULT '',
    email TEXT DEFAULT '', password TEXT DEFAULT '', category TEXT DEFAULT 'web',
    strength TEXT DEFAULT 'medium', two_factor BOOLEAN DEFAULT false,
    last_changed DATE, expires_at DATE, notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own passwords" ON passwords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own passwords" ON passwords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own passwords" ON passwords FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own passwords" ON passwords FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_passwords_user ON passwords(user_id);
CREATE INDEX idx_passwords_user_category ON passwords(user_id, category);
