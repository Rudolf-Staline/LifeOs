-- ===================================================================
-- MonBudget — Supabase Database Setup
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase
-- ===================================================================

-- 1. Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')),
    icon TEXT DEFAULT 'fas fa-tag',
    color TEXT DEFAULT '#4F46E5',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- 2. Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    notes TEXT,
    recurring_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- 3. Table des budgets
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ,
    UNIQUE(user_id, category_id, year, month)
);

-- 4. Table des récurrences
CREATE TABLE IF NOT EXISTS recurring (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    last_generated DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- 5. Table des objectifs
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    color TEXT DEFAULT '#4F46E5',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- 6. Table du journal d'audit
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    entity TEXT NOT NULL,
    entity_id UUID,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Table inventaire & stock
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

-- 8. Table bibliothèque & lecture
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

-- 9. Table fitness / entraînements
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'strength',
    date DATE DEFAULT CURRENT_DATE,
    duration INTEGER DEFAULT 0 CHECK (duration >= 0),
    calories INTEGER DEFAULT 0 CHECK (calories >= 0),
    exercises TEXT DEFAULT '[]',
    mood INTEGER DEFAULT 3 CHECK (mood >= 1 AND mood <= 5),
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Table recettes
CREATE TABLE IF NOT EXISTS recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'autre',
    cuisine TEXT DEFAULT '',
    prep_time INTEGER DEFAULT 0 CHECK (prep_time >= 0),
    cook_time INTEGER DEFAULT 0 CHECK (cook_time >= 0),
    servings INTEGER DEFAULT 1 CHECK (servings >= 1),
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    ingredients TEXT DEFAULT '',
    steps TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    favorite BOOLEAN DEFAULT false,
    image TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Table notes / journal
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    mood INTEGER DEFAULT 0 CHECK (mood >= 0 AND mood <= 5),
    tags TEXT DEFAULT '',
    color TEXT DEFAULT '',
    pinned BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Table habitudes
CREATE TABLE IF NOT EXISTS habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '✅',
    color TEXT DEFAULT '#22C55E',
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekday', 'weekly')),
    target INTEGER DEFAULT 1 CHECK (target >= 1),
    completions TEXT DEFAULT '[]',
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Table contacts
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

-- 14. Table films & séries
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

-- 15. Table voyages
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

-- 16. Table plantes
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

-- 17. Table musique
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

-- 18. Table véhicules
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

-- 19. Table santé
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

-- 20. Table événements
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
-- TABLE : pets (Animaux)
-- ===================================================================
CREATE TABLE IF NOT EXISTS pets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    species TEXT DEFAULT 'chien',
    breed TEXT DEFAULT '',
    birthdate DATE,
    weight NUMERIC(6,2) DEFAULT 0,
    gender TEXT DEFAULT '',
    color TEXT DEFAULT '',
    microchip TEXT DEFAULT '',
    vet TEXT DEFAULT '',
    vet_phone TEXT DEFAULT '',
    last_vet_visit DATE,
    next_vet_visit DATE,
    vaccinations TEXT DEFAULT '',
    food TEXT DEFAULT '',
    allergies TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    photo TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : learning (Apprentissage)
-- ===================================================================
CREATE TABLE IF NOT EXISTS learning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    platform TEXT DEFAULT '',
    category TEXT DEFAULT 'dev',
    instructor TEXT DEFAULT '',
    url TEXT DEFAULT '',
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused', 'dropped')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    rating INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    duration NUMERIC(6,1) DEFAULT 0,
    cost NUMERIC(10,2) DEFAULT 0,
    certificate BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : sleep_entries (Sommeil)
-- ===================================================================
CREATE TABLE IF NOT EXISTS sleep_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    bedtime TEXT DEFAULT '',
    wake_time TEXT DEFAULT '',
    duration NUMERIC(4,1) DEFAULT 0,
    quality INTEGER DEFAULT 3 CHECK (quality >= 1 AND quality <= 5),
    mood TEXT DEFAULT 'normal',
    dreams TEXT DEFAULT '',
    interruptions INTEGER DEFAULT 0,
    factors TEXT DEFAULT '',
    nap BOOLEAN DEFAULT false,
    nap_duration NUMERIC(4,1) DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : home_tasks (Maison)
-- ===================================================================
CREATE TABLE IF NOT EXISTS home_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    room TEXT DEFAULT 'autre',
    category TEXT DEFAULT 'maintenance',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
    due_date DATE,
    completed_date DATE,
    frequency TEXT DEFAULT '',
    cost NUMERIC(10,2) DEFAULT 0,
    contractor TEXT DEFAULT '',
    contractor_phone TEXT DEFAULT '',
    description TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : games (Jeux)
-- ===================================================================
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    platform TEXT DEFAULT 'pc',
    genre TEXT DEFAULT 'action',
    status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'playing', 'completed', 'dropped', 'wishlist')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    hours_played NUMERIC(8,1) DEFAULT 0,
    rating INTEGER DEFAULT 0,
    release_year INTEGER DEFAULT 0,
    developer TEXT DEFAULT '',
    publisher TEXT DEFAULT '',
    price NUMERIC(10,2) DEFAULT 0,
    start_date DATE,
    completed_date DATE,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : wardrobe (Garde-robe)
-- ===================================================================
CREATE TABLE IF NOT EXISTS wardrobe (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'top',
    brand TEXT DEFAULT '',
    color TEXT DEFAULT '',
    size TEXT DEFAULT '',
    season TEXT DEFAULT 'all',
    occasion TEXT DEFAULT 'casual',
    condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'worn', 'damaged')),
    price NUMERIC(10,2) DEFAULT 0,
    purchase_date DATE,
    last_worn DATE,
    times_worn INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    photo TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : packages (Colis)
-- ===================================================================
CREATE TABLE IF NOT EXISTS packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    tracking_number TEXT DEFAULT '',
    carrier TEXT DEFAULT 'poste',
    store TEXT DEFAULT '',
    status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'lost')),
    order_date DATE,
    shipped_date DATE,
    expected_date DATE,
    delivered_date DATE,
    price NUMERIC(10,2) DEFAULT 0,
    shipping_cost NUMERIC(10,2) DEFAULT 0,
    origin TEXT DEFAULT '',
    destination TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : ideas (Idées)
-- ===================================================================
CREATE TABLE IF NOT EXISTS ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT DEFAULT '',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'exploring', 'in_progress', 'realized', 'archived')),
    impact TEXT DEFAULT 'medium',
    effort TEXT DEFAULT 'medium',
    tags TEXT DEFAULT '',
    due_date DATE,
    source TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : projects (Projets)
-- ===================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'personal',
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    deadline DATE,
    completed_date DATE,
    budget NUMERIC(12,2) DEFAULT 0,
    spent NUMERIC(12,2) DEFAULT 0,
    client TEXT DEFAULT '',
    team TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- TABLE : passwords (Mots de passe)
-- ===================================================================
CREATE TABLE IF NOT EXISTS passwords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    site TEXT NOT NULL,
    url TEXT DEFAULT '',
    username TEXT DEFAULT '',
    email TEXT DEFAULT '',
    password TEXT DEFAULT '',
    category TEXT DEFAULT 'web',
    strength TEXT DEFAULT 'medium' CHECK (strength IN ('weak', 'medium', 'strong', 'very_strong')),
    two_factor BOOLEAN DEFAULT false,
    last_changed DATE,
    expires_at DATE,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Policies pour categories
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Policies pour transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Policies pour budgets
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- Policies pour recurring
CREATE POLICY "Users can view own recurring" ON recurring FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring" ON recurring FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring" ON recurring FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring" ON recurring FOR DELETE USING (auth.uid() = user_id);

-- Policies pour goals
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- Policies pour audit_log
CREATE POLICY "Users can view own audit" ON audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit" ON audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own audit" ON audit_log FOR DELETE USING (auth.uid() = user_id);

-- Policies pour inventory
CREATE POLICY "Users can view own inventory" ON inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory" ON inventory FOR DELETE USING (auth.uid() = user_id);

-- Policies pour books
CREATE POLICY "Users can view own books" ON books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own books" ON books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON books FOR DELETE USING (auth.uid() = user_id);

-- Policies pour workouts
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- Policies pour recipes
CREATE POLICY "Users can view own recipes" ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Policies pour notes
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Policies pour habits
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- Policies pour contacts
CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);

-- Policies pour movies
CREATE POLICY "Users can view own movies" ON movies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own movies" ON movies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own movies" ON movies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own movies" ON movies FOR DELETE USING (auth.uid() = user_id);

-- Policies pour trips
CREATE POLICY "Users can view own trips" ON trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON trips FOR DELETE USING (auth.uid() = user_id);

-- Policies pour plants
CREATE POLICY "Users can view own plants" ON plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plants" ON plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plants" ON plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plants" ON plants FOR DELETE USING (auth.uid() = user_id);

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

-- Policies pour pets
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = user_id);

-- Policies pour learning
CREATE POLICY "Users can view own learning" ON learning FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning" ON learning FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning" ON learning FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own learning" ON learning FOR DELETE USING (auth.uid() = user_id);

-- Policies pour sleep_entries
CREATE POLICY "Users can view own sleep_entries" ON sleep_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_entries" ON sleep_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_entries" ON sleep_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_entries" ON sleep_entries FOR DELETE USING (auth.uid() = user_id);

-- Policies pour home_tasks
CREATE POLICY "Users can view own home_tasks" ON home_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own home_tasks" ON home_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own home_tasks" ON home_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own home_tasks" ON home_tasks FOR DELETE USING (auth.uid() = user_id);

-- Policies pour games
CREATE POLICY "Users can view own games" ON games FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own games" ON games FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own games" ON games FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own games" ON games FOR DELETE USING (auth.uid() = user_id);

-- Policies pour wardrobe
CREATE POLICY "Users can view own wardrobe" ON wardrobe FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wardrobe" ON wardrobe FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wardrobe" ON wardrobe FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wardrobe" ON wardrobe FOR DELETE USING (auth.uid() = user_id);

-- Policies pour packages
CREATE POLICY "Users can view own packages" ON packages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own packages" ON packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own packages" ON packages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own packages" ON packages FOR DELETE USING (auth.uid() = user_id);

-- Policies pour ideas
CREATE POLICY "Users can view own ideas" ON ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas" ON ideas FOR DELETE USING (auth.uid() = user_id);

-- Policies pour projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Policies pour passwords
CREATE POLICY "Users can view own passwords" ON passwords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own passwords" ON passwords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own passwords" ON passwords FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own passwords" ON passwords FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- INDEX pour les performances
-- ===================================================================

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, year, month);
CREATE INDEX idx_recurring_user_active ON recurring(user_id, active);
CREATE INDEX idx_audit_user_created ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_inventory_user_category ON inventory(user_id, category);
CREATE INDEX idx_books_user ON books(user_id);
CREATE INDEX idx_books_user_status ON books(user_id, status);
CREATE INDEX idx_books_user_genre ON books(user_id, genre);
CREATE INDEX idx_workouts_user ON workouts(user_id);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX idx_workouts_user_type ON workouts(user_id, type);
CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipes_user_category ON recipes(user_id, category);
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_user_pinned ON notes(user_id, pinned);
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_habits_user_archived ON habits(user_id, archived);
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_user_group ON contacts(user_id, group_name);
CREATE INDEX idx_movies_user ON movies(user_id);
CREATE INDEX idx_movies_user_status ON movies(user_id, status);
CREATE INDEX idx_movies_user_type ON movies(user_id, type);
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_user_status ON trips(user_id, status);
CREATE INDEX idx_plants_user ON plants(user_id);
CREATE INDEX idx_plants_user_health ON plants(user_id, health);
CREATE INDEX idx_music_user ON music(user_id);
CREATE INDEX idx_music_user_genre ON music(user_id, genre);
CREATE INDEX idx_music_user_artist ON music(user_id, artist);
CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_vehicles_user_status ON vehicles(user_id, status);
CREATE INDEX idx_health_user ON health_records(user_id);
CREATE INDEX idx_health_user_date ON health_records(user_id, date);
CREATE INDEX idx_health_user_type ON health_records(user_id, type);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_user_date ON events(user_id, date);
CREATE INDEX idx_events_user_status ON events(user_id, status);

CREATE INDEX idx_pets_user ON pets(user_id);
CREATE INDEX idx_pets_user_species ON pets(user_id, species);
CREATE INDEX idx_learning_user ON learning(user_id);
CREATE INDEX idx_learning_user_status ON learning(user_id, status);
CREATE INDEX idx_learning_user_category ON learning(user_id, category);
CREATE INDEX idx_sleep_user ON sleep_entries(user_id);
CREATE INDEX idx_sleep_user_date ON sleep_entries(user_id, date);
CREATE INDEX idx_home_tasks_user ON home_tasks(user_id);
CREATE INDEX idx_home_tasks_user_status ON home_tasks(user_id, status);
CREATE INDEX idx_home_tasks_user_room ON home_tasks(user_id, room);
CREATE INDEX idx_games_user ON games(user_id);
CREATE INDEX idx_games_user_status ON games(user_id, status);
CREATE INDEX idx_games_user_platform ON games(user_id, platform);
CREATE INDEX idx_wardrobe_user ON wardrobe(user_id);
CREATE INDEX idx_wardrobe_user_category ON wardrobe(user_id, category);
CREATE INDEX idx_wardrobe_user_season ON wardrobe(user_id, season);
CREATE INDEX idx_packages_user ON packages(user_id);
CREATE INDEX idx_packages_user_status ON packages(user_id, status);
CREATE INDEX idx_ideas_user ON ideas(user_id);
CREATE INDEX idx_ideas_user_status ON ideas(user_id, status);
CREATE INDEX idx_ideas_user_category ON ideas(user_id, category);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_projects_user_priority ON projects(user_id, priority);
CREATE INDEX idx_passwords_user ON passwords(user_id);
CREATE INDEX idx_passwords_user_category ON passwords(user_id, category);

-- ===================================================================
-- FONCTION : Insérer les catégories par défaut pour un nouvel utilisateur
-- ===================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
        (NEW.id, 'Alimentation', 'expense', 'fas fa-utensils', '#EF4444'),
        (NEW.id, 'Logement', 'expense', 'fas fa-home', '#F59E0B'),
        (NEW.id, 'Transport', 'expense', 'fas fa-car', '#0EA5E9'),
        (NEW.id, 'Santé', 'expense', 'fas fa-heartbeat', '#10B981'),
        (NEW.id, 'Loisirs', 'expense', 'fas fa-gamepad', '#8B5CF6'),
        (NEW.id, 'Vêtements', 'expense', 'fas fa-tshirt', '#EC4899'),
        (NEW.id, 'Éducation', 'expense', 'fas fa-graduation-cap', '#6366F1'),
        (NEW.id, 'Énergie', 'expense', 'fas fa-bolt', '#F97316'),
        (NEW.id, 'Télécom', 'expense', 'fas fa-phone', '#14B8A6'),
        (NEW.id, 'Abonnements', 'expense', 'fas fa-wifi', '#06B6D4'),
        (NEW.id, 'Cadeaux', 'expense', 'fas fa-gift', '#EC4899'),
        (NEW.id, 'Épargne', 'expense', 'fas fa-piggy-bank', '#10B981'),
        (NEW.id, 'Salaire', 'income', 'fas fa-briefcase', '#10B981'),
        (NEW.id, 'Freelance', 'income', 'fas fa-money-bill-wave', '#0EA5E9'),
        (NEW.id, 'Investissements', 'income', 'fas fa-hand-holding-usd', '#8B5CF6'),
        (NEW.id, 'Autres revenus', 'income', 'fas fa-coins', '#F59E0B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger : créer les catégories par défaut à l'inscription
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
