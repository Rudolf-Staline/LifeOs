-- ===================================================================
-- LifeOS — Setup complet de la base de données Supabase
-- Ce script SUPPRIME toutes les tables existantes et les recrée
-- Exécutez dans : Supabase Dashboard → SQL Editor → New query
-- ===================================================================

-- ===================================================================
-- PHASE 1 : NETTOYAGE COMPLET
-- ===================================================================

-- Supprimer le trigger d'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Supprimer la fonction updated_at
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Supprimer toutes les tables (CASCADE supprime policies, indexes, triggers)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS recurring CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS music CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS learning CASCADE;
DROP TABLE IF EXISTS sleep_entries CASCADE;
DROP TABLE IF EXISTS home_tasks CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS wardrobe CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS passwords CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS podcasts CASCADE;
DROP TABLE IF EXISTS wines CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS gifts CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS cleaning CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS portfolio_positions CASCADE;
DROP TABLE IF EXISTS trading_watchlist CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;


-- ===================================================================
-- PHASE 2 : FONCTION UTILITAIRE
-- ===================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ===================================================================
-- PHASE 3 : CRÉATION DES TABLES
-- ===================================================================

-- -------------------------------------------------------------------
-- 1. Catégories (budget)
-- -------------------------------------------------------------------
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')),
    icon TEXT DEFAULT 'fas fa-tag',
    color TEXT DEFAULT '#4F46E5',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 2. Transactions (budget)
-- -------------------------------------------------------------------
CREATE TABLE transactions (
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
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 3. Budgets
-- -------------------------------------------------------------------
CREATE TABLE budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, category_id, year, month)
);

-- -------------------------------------------------------------------
-- 4. Récurrences
-- -------------------------------------------------------------------
CREATE TABLE recurring (
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
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 5. Objectifs d'épargne
-- -------------------------------------------------------------------
CREATE TABLE goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    color TEXT DEFAULT '#4F46E5',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 6. Journal d'audit
-- -------------------------------------------------------------------
CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    entity TEXT NOT NULL,
    entity_id UUID,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 7. Inventaire & stock
-- -------------------------------------------------------------------
CREATE TABLE inventory (
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

-- -------------------------------------------------------------------
-- 8. Bibliothèque & lecture
-- -------------------------------------------------------------------
CREATE TABLE books (
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

-- -------------------------------------------------------------------
-- 9. Fitness / entraînements
-- -------------------------------------------------------------------
CREATE TABLE workouts (
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

-- -------------------------------------------------------------------
-- 10. Recettes
-- -------------------------------------------------------------------
CREATE TABLE recipes (
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

-- -------------------------------------------------------------------
-- 11. Notes / journal
-- -------------------------------------------------------------------
CREATE TABLE notes (
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

-- -------------------------------------------------------------------
-- 12. Habitudes
-- -------------------------------------------------------------------
CREATE TABLE habits (
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

-- -------------------------------------------------------------------
-- 13. Contacts
-- -------------------------------------------------------------------
CREATE TABLE contacts (
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

-- -------------------------------------------------------------------
-- 14. Films & séries
-- -------------------------------------------------------------------
CREATE TABLE movies (
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

-- -------------------------------------------------------------------
-- 15. Voyages
-- -------------------------------------------------------------------
CREATE TABLE trips (
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

-- -------------------------------------------------------------------
-- 16. Plantes
-- -------------------------------------------------------------------
CREATE TABLE plants (
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

-- -------------------------------------------------------------------
-- 17. Musique
-- -------------------------------------------------------------------
CREATE TABLE music (
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

-- -------------------------------------------------------------------
-- 18. Véhicules
-- -------------------------------------------------------------------
CREATE TABLE vehicles (
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

-- -------------------------------------------------------------------
-- 19. Santé
-- -------------------------------------------------------------------
CREATE TABLE health_records (
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

-- -------------------------------------------------------------------
-- 20. Événements
-- -------------------------------------------------------------------
CREATE TABLE events (
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

-- -------------------------------------------------------------------
-- 21. Animaux
-- -------------------------------------------------------------------
CREATE TABLE pets (
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

-- -------------------------------------------------------------------
-- 22. Apprentissage
-- -------------------------------------------------------------------
CREATE TABLE learning (
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

-- -------------------------------------------------------------------
-- 23. Sommeil
-- -------------------------------------------------------------------
CREATE TABLE sleep_entries (
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

-- -------------------------------------------------------------------
-- 24. Maison (tâches)
-- -------------------------------------------------------------------
CREATE TABLE home_tasks (
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

-- -------------------------------------------------------------------
-- 25. Jeux vidéo
-- -------------------------------------------------------------------
CREATE TABLE games (
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

-- -------------------------------------------------------------------
-- 26. Garde-robe
-- -------------------------------------------------------------------
CREATE TABLE wardrobe (
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

-- -------------------------------------------------------------------
-- 27. Colis
-- -------------------------------------------------------------------
CREATE TABLE packages (
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

-- -------------------------------------------------------------------
-- 28. Idées
-- -------------------------------------------------------------------
CREATE TABLE ideas (
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

-- -------------------------------------------------------------------
-- 29. Projets
-- -------------------------------------------------------------------
CREATE TABLE projects (
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

-- -------------------------------------------------------------------
-- 30. Mots de passe
-- -------------------------------------------------------------------
CREATE TABLE passwords (
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

-- -------------------------------------------------------------------
-- 31. Abonnements
-- -------------------------------------------------------------------
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    provider TEXT DEFAULT '',
    category TEXT DEFAULT 'autre',
    price NUMERIC(10,2) DEFAULT 0,
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'trial')),
    start_date DATE,
    renewal_date DATE,
    cancel_date DATE,
    url TEXT DEFAULT '',
    auto_renew BOOLEAN DEFAULT true,
    payment_method TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 32. Albums photos
-- -------------------------------------------------------------------
CREATE TABLE albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'autre',
    description TEXT DEFAULT '',
    date DATE,
    location TEXT DEFAULT '',
    photo_count INTEGER DEFAULT 0,
    cover_url TEXT DEFAULT '',
    storage_size TEXT DEFAULT '',
    platform TEXT DEFAULT '',
    shared BOOLEAN DEFAULT false,
    tags TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 33. Podcasts
-- -------------------------------------------------------------------
CREATE TABLE podcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    host TEXT DEFAULT '',
    category TEXT DEFAULT 'autre',
    platform TEXT DEFAULT '',
    status TEXT DEFAULT 'queued' CHECK (status IN ('listening', 'queued', 'finished', 'dropped')),
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    episodes_total INTEGER DEFAULT 0,
    episodes_listened INTEGER DEFAULT 0,
    url TEXT DEFAULT '',
    start_date DATE,
    frequency TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 34. Cave à vins
-- -------------------------------------------------------------------
CREATE TABLE wines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'red' CHECK (type IN ('red', 'white', 'rose', 'sparkling', 'dessert', 'autre')),
    region TEXT DEFAULT 'autre',
    appellation TEXT DEFAULT '',
    vintage INTEGER DEFAULT 0,
    producer TEXT DEFAULT '',
    grape TEXT DEFAULT '',
    price NUMERIC(10,2) DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    drink_before DATE,
    purchase_date DATE,
    location TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 35. Liste de souhaits
-- -------------------------------------------------------------------
CREATE TABLE wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'autre',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'wanted' CHECK (status IN ('wanted', 'saved', 'bought', 'gifted', 'abandoned')),
    price NUMERIC(10,2) DEFAULT 0,
    saved_amount NUMERIC(10,2) DEFAULT 0,
    url TEXT DEFAULT '',
    store TEXT DEFAULT '',
    image TEXT DEFAULT '',
    added_date DATE,
    purchase_date DATE,
    description TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 36. Cadeaux
-- -------------------------------------------------------------------
CREATE TABLE gifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'given' CHECK (type IN ('given', 'received', 'idea')),
    recipient TEXT DEFAULT '',
    occasion TEXT DEFAULT 'autre',
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'bought', 'wrapped', 'given')),
    price NUMERIC(10,2) DEFAULT 0,
    date DATE,
    store TEXT DEFAULT '',
    url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 37. Documents
-- -------------------------------------------------------------------
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'autre' CHECK (type IN ('id', 'passport', 'contract', 'invoice', 'certificate', 'insurance', 'tax', 'medical', 'warranty', 'license', 'autre')),
    issuer TEXT DEFAULT '',
    number TEXT DEFAULT '',
    issue_date DATE,
    expiry_date DATE,
    status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired', 'archived')),
    location TEXT DEFAULT '',
    digital_copy TEXT DEFAULT '',
    holder TEXT DEFAULT '',
    description TEXT DEFAULT '',
    reminder_days INTEGER DEFAULT 30,
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 38. Médicaments
-- -------------------------------------------------------------------
CREATE TABLE medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'pill' CHECK (type IN ('pill', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'supplement', 'autre')),
    dosage TEXT DEFAULT '',
    frequency TEXT DEFAULT 'once' CHECK (frequency IN ('once', 'twice', 'thrice', 'weekly', 'as_needed', 'autre')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'discontinued')),
    prescriber TEXT DEFAULT '',
    pharmacy TEXT DEFAULT '',
    start_date DATE,
    end_date DATE,
    refill_date DATE,
    quantity INTEGER DEFAULT 0,
    price NUMERIC(10,2) DEFAULT 0,
    side_effects TEXT DEFAULT '',
    purpose TEXT DEFAULT '',
    instructions TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 39. Collections
-- -------------------------------------------------------------------
CREATE TABLE collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'autre' CHECK (type IN ('stamps', 'coins', 'figurines', 'cards', 'art', 'vinyl', 'comics', 'toys', 'watches', 'minerals', 'autre')),
    item TEXT DEFAULT '',
    condition TEXT DEFAULT 'good' CHECK (condition IN ('mint', 'excellent', 'good', 'fair', 'poor')),
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'very_rare', 'legendary')),
    year TEXT DEFAULT '',
    value NUMERIC(10,2) DEFAULT 0,
    purchase_price NUMERIC(10,2) DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    source TEXT DEFAULT '',
    location TEXT DEFAULT '',
    photo TEXT DEFAULT '',
    series TEXT DEFAULT '',
    edition TEXT DEFAULT '',
    description TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 40. Ménage / nettoyage
-- -------------------------------------------------------------------
CREATE TABLE cleaning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task TEXT NOT NULL,
    room TEXT DEFAULT 'autre',
    frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    last_done DATE,
    next_due DATE,
    assignee TEXT DEFAULT '',
    duration INTEGER DEFAULT 0,
    difficulty TEXT DEFAULT 'easy',
    supplies TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------------
-- 41. Trading — Journal de trades
-- -------------------------------------------------------------------
CREATE TABLE trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    instrument TEXT DEFAULT 'forex' CHECK (instrument IN ('forex', 'crypto', 'stock', 'etf', 'commodity', 'index', 'option', 'future', 'bond', 'autre')),
    direction TEXT DEFAULT 'long' CHECK (direction IN ('long', 'short')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
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

-- -------------------------------------------------------------------
-- 42. Trading — Portefeuille
-- -------------------------------------------------------------------
CREATE TABLE portfolio_positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT DEFAULT '',
    asset_type TEXT DEFAULT 'stock' CHECK (asset_type IN ('stock', 'etf', 'crypto', 'forex', 'bond', 'commodity', 'reit', 'fund', 'autre')),
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

-- -------------------------------------------------------------------
-- 43. Trading — Watchlist
-- -------------------------------------------------------------------
CREATE TABLE trading_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT DEFAULT '',
    asset_type TEXT DEFAULT 'stock' CHECK (asset_type IN ('stock', 'etf', 'crypto', 'forex', 'commodity', 'index', 'autre')),
    current_price NUMERIC DEFAULT 0,
    target_buy NUMERIC DEFAULT 0,
    target_sell NUMERIC DEFAULT 0,
    support NUMERIC DEFAULT 0,
    resistance NUMERIC DEFAULT 0,
    signal TEXT DEFAULT 'neutral' CHECK (signal IN ('strong_buy', 'buy', 'neutral', 'sell', 'strong_sell')),
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


-- -------------------------------------------------------------------
-- 44. Notifications
-- -------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'danger')),
    category TEXT DEFAULT 'system',
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    source_table TEXT DEFAULT '',
    source_id UUID,
    action_url TEXT DEFAULT '',
    read BOOLEAN DEFAULT false,
    dismissed BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ===================================================================
-- PHASE 4 : ROW LEVEL SECURITY (RLS)
-- ===================================================================

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
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- ===================================================================
-- PHASE 5 : POLICIES RLS (CRUD par utilisateur)
-- ===================================================================

-- Macro : chaque table a 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- sauf audit_log (pas d'UPDATE) et trading (policy ALL)

-- categories
CREATE POLICY "Users manage own categories" ON categories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- transactions
CREATE POLICY "Users manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- budgets
CREATE POLICY "Users manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recurring
CREATE POLICY "Users manage own recurring" ON recurring FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- goals
CREATE POLICY "Users manage own goals" ON goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- audit_log
CREATE POLICY "Users manage own audit_log" ON audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own audit_log" ON audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own audit_log" ON audit_log FOR DELETE USING (auth.uid() = user_id);

-- inventory
CREATE POLICY "Users manage own inventory" ON inventory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- books
CREATE POLICY "Users manage own books" ON books FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- workouts
CREATE POLICY "Users manage own workouts" ON workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recipes
CREATE POLICY "Users manage own recipes" ON recipes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- notes
CREATE POLICY "Users manage own notes" ON notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- habits
CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- contacts
CREATE POLICY "Users manage own contacts" ON contacts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- movies
CREATE POLICY "Users manage own movies" ON movies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- trips
CREATE POLICY "Users manage own trips" ON trips FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- plants
CREATE POLICY "Users manage own plants" ON plants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- music
CREATE POLICY "Users manage own music" ON music FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- vehicles
CREATE POLICY "Users manage own vehicles" ON vehicles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- health_records
CREATE POLICY "Users manage own health_records" ON health_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- events
CREATE POLICY "Users manage own events" ON events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- pets
CREATE POLICY "Users manage own pets" ON pets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- learning
CREATE POLICY "Users manage own learning" ON learning FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- sleep_entries
CREATE POLICY "Users manage own sleep_entries" ON sleep_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- home_tasks
CREATE POLICY "Users manage own home_tasks" ON home_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- games
CREATE POLICY "Users manage own games" ON games FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- wardrobe
CREATE POLICY "Users manage own wardrobe" ON wardrobe FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- packages
CREATE POLICY "Users manage own packages" ON packages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ideas
CREATE POLICY "Users manage own ideas" ON ideas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- projects
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- passwords
CREATE POLICY "Users manage own passwords" ON passwords FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- subscriptions
CREATE POLICY "Users manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- albums
CREATE POLICY "Users manage own albums" ON albums FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- podcasts
CREATE POLICY "Users manage own podcasts" ON podcasts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- wines
CREATE POLICY "Users manage own wines" ON wines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- wishlist
CREATE POLICY "Users manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- gifts
CREATE POLICY "Users manage own gifts" ON gifts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- documents
CREATE POLICY "Users manage own documents" ON documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- medications
CREATE POLICY "Users manage own medications" ON medications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- collections
CREATE POLICY "Users manage own collections" ON collections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- cleaning
CREATE POLICY "Users manage own cleaning" ON cleaning FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- trades
CREATE POLICY "Users manage own trades" ON trades FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- portfolio_positions
CREATE POLICY "Users manage own portfolio" ON portfolio_positions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- trading_watchlist
CREATE POLICY "Users manage own trading_watchlist" ON trading_watchlist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- notifications
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ===================================================================
-- PHASE 6 : INDEX DE PERFORMANCE
-- ===================================================================


-- Budget / Finance
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, year, month);
CREATE INDEX idx_recurring_user_active ON recurring(user_id, active);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_audit_user_created ON audit_log(user_id, created_at DESC);

-- Inventaire & Livres
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_inventory_user_category ON inventory(user_id, category);
CREATE INDEX idx_books_user ON books(user_id);
CREATE INDEX idx_books_user_status ON books(user_id, status);
CREATE INDEX idx_books_user_genre ON books(user_id, genre);

-- Fitness & Recettes
CREATE INDEX idx_workouts_user ON workouts(user_id);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX idx_workouts_user_type ON workouts(user_id, type);
CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipes_user_category ON recipes(user_id, category);

-- Notes & Habitudes
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_user_pinned ON notes(user_id, pinned);
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_habits_user_archived ON habits(user_id, archived);

-- Contacts & Films
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_user_group ON contacts(user_id, group_name);
CREATE INDEX idx_movies_user ON movies(user_id);
CREATE INDEX idx_movies_user_status ON movies(user_id, status);
CREATE INDEX idx_movies_user_type ON movies(user_id, type);

-- Voyages & Plantes
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_user_status ON trips(user_id, status);
CREATE INDEX idx_plants_user ON plants(user_id);
CREATE INDEX idx_plants_user_health ON plants(user_id, health);

-- Musique & Véhicules
CREATE INDEX idx_music_user ON music(user_id);
CREATE INDEX idx_music_user_genre ON music(user_id, genre);
CREATE INDEX idx_music_user_artist ON music(user_id, artist);
CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_vehicles_user_status ON vehicles(user_id, status);

-- Santé & Événements
CREATE INDEX idx_health_user ON health_records(user_id);
CREATE INDEX idx_health_user_date ON health_records(user_id, date);
CREATE INDEX idx_health_user_type ON health_records(user_id, type);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_user_date ON events(user_id, date);
CREATE INDEX idx_events_user_status ON events(user_id, status);

-- Animaux & Apprentissage
CREATE INDEX idx_pets_user ON pets(user_id);
CREATE INDEX idx_pets_user_species ON pets(user_id, species);
CREATE INDEX idx_learning_user ON learning(user_id);
CREATE INDEX idx_learning_user_status ON learning(user_id, status);
CREATE INDEX idx_learning_user_category ON learning(user_id, category);

-- Sommeil & Maison
CREATE INDEX idx_sleep_user ON sleep_entries(user_id);
CREATE INDEX idx_sleep_user_date ON sleep_entries(user_id, date);
CREATE INDEX idx_home_tasks_user ON home_tasks(user_id);
CREATE INDEX idx_home_tasks_user_status ON home_tasks(user_id, status);
CREATE INDEX idx_home_tasks_user_room ON home_tasks(user_id, room);

-- Jeux & Garde-robe
CREATE INDEX idx_games_user ON games(user_id);
CREATE INDEX idx_games_user_status ON games(user_id, status);
CREATE INDEX idx_games_user_platform ON games(user_id, platform);
CREATE INDEX idx_wardrobe_user ON wardrobe(user_id);
CREATE INDEX idx_wardrobe_user_category ON wardrobe(user_id, category);
CREATE INDEX idx_wardrobe_user_season ON wardrobe(user_id, season);

-- Colis & Idées
CREATE INDEX idx_packages_user ON packages(user_id);
CREATE INDEX idx_packages_user_status ON packages(user_id, status);
CREATE INDEX idx_ideas_user ON ideas(user_id);
CREATE INDEX idx_ideas_user_status ON ideas(user_id, status);
CREATE INDEX idx_ideas_user_category ON ideas(user_id, category);

-- Projets & Mots de passe
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_projects_user_priority ON projects(user_id, priority);
CREATE INDEX idx_passwords_user ON passwords(user_id);
CREATE INDEX idx_passwords_user_category ON passwords(user_id, category);

-- Abonnements & Albums
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_albums_user ON albums(user_id);
CREATE INDEX idx_albums_user_category ON albums(user_id, category);

-- Podcasts & Vins
CREATE INDEX idx_podcasts_user ON podcasts(user_id);
CREATE INDEX idx_podcasts_user_status ON podcasts(user_id, status);
CREATE INDEX idx_wines_user ON wines(user_id);
CREATE INDEX idx_wines_user_type ON wines(user_id, type);

-- Wishlist & Cadeaux
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_user_status ON wishlist(user_id, status);
CREATE INDEX idx_gifts_user ON gifts(user_id);
CREATE INDEX idx_gifts_user_type ON gifts(user_id, type);

-- Documents & Médicaments
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_user_type ON documents(user_id, type);
CREATE INDEX idx_documents_user_status ON documents(user_id, status);
CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_medications_user_status ON medications(user_id, status);

-- Collections & Ménage
CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_user_type ON collections(user_id, type);
CREATE INDEX idx_cleaning_user ON cleaning(user_id);
CREATE INDEX idx_cleaning_user_room ON cleaning(user_id, room);

-- Trading
CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_user_status ON trades(user_id, status);
CREATE INDEX idx_trades_user_instrument ON trades(user_id, instrument);
CREATE INDEX idx_trades_entry_date ON trades(entry_date);
CREATE INDEX idx_portfolio_user ON portfolio_positions(user_id);
CREATE INDEX idx_portfolio_asset_type ON portfolio_positions(user_id, asset_type);
CREATE INDEX idx_twatchlist_user ON trading_watchlist(user_id);
CREATE INDEX idx_twatchlist_signal ON trading_watchlist(user_id, signal);
CREATE INDEX idx_twatchlist_asset_type ON trading_watchlist(user_id, asset_type);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_user_category ON notifications(user_id, category);
CREATE INDEX idx_notifications_scheduled ON notifications(user_id, scheduled_at);


-- ===================================================================
-- PHASE 7 : TRIGGERS updated_at
-- ===================================================================

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_updated_at BEFORE UPDATE ON recurring FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_music_updated_at BEFORE UPDATE ON music FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_updated_at BEFORE UPDATE ON learning FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sleep_entries_updated_at BEFORE UPDATE ON sleep_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_home_tasks_updated_at BEFORE UPDATE ON home_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wardrobe_updated_at BEFORE UPDATE ON wardrobe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_passwords_updated_at BEFORE UPDATE ON passwords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON podcasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wines_updated_at BEFORE UPDATE ON wines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wishlist_updated_at BEFORE UPDATE ON wishlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gifts_updated_at BEFORE UPDATE ON gifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cleaning_updated_at BEFORE UPDATE ON cleaning FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_twatchlist_updated_at BEFORE UPDATE ON trading_watchlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ===================================================================
-- PHASE 8 : TRIGGER D'INSCRIPTION (catégories par défaut)
-- ===================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
        (NEW.id, 'Alimentation',     'expense', 'fas fa-utensils',          '#EF4444'),
        (NEW.id, 'Logement',         'expense', 'fas fa-home',             '#F59E0B'),
        (NEW.id, 'Transport',        'expense', 'fas fa-car',              '#0EA5E9'),
        (NEW.id, 'Santé',            'expense', 'fas fa-heartbeat',        '#10B981'),
        (NEW.id, 'Loisirs',          'expense', 'fas fa-gamepad',          '#8B5CF6'),
        (NEW.id, 'Vêtements',        'expense', 'fas fa-tshirt',           '#EC4899'),
        (NEW.id, 'Éducation',        'expense', 'fas fa-graduation-cap',   '#6366F1'),
        (NEW.id, 'Énergie',          'expense', 'fas fa-bolt',             '#F97316'),
        (NEW.id, 'Télécom',          'expense', 'fas fa-phone',            '#14B8A6'),
        (NEW.id, 'Abonnements',      'expense', 'fas fa-wifi',             '#06B6D4'),
        (NEW.id, 'Cadeaux',          'expense', 'fas fa-gift',             '#EC4899'),
        (NEW.id, 'Épargne',          'expense', 'fas fa-piggy-bank',       '#10B981'),
        (NEW.id, 'Salaire',          'income',  'fas fa-briefcase',        '#10B981'),
        (NEW.id, 'Freelance',        'income',  'fas fa-money-bill-wave',  '#0EA5E9'),
        (NEW.id, 'Investissements',  'income',  'fas fa-hand-holding-usd', '#8B5CF6'),
        (NEW.id, 'Autres revenus',   'income',  'fas fa-coins',           '#F59E0B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ===================================================================
-- ✅ SETUP TERMINÉ — 44 tables, RLS, indexes, triggers
-- ===================================================================
