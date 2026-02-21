/* ===================================================================
   recipes.js — Recettes & Cuisine Module
   Collection de recettes, ingrédients, temps de préparation
   =================================================================== */

const Recipes = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapRecipe(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            category: row.category || 'autre',
            cuisine: row.cuisine || '',
            prepTime: parseInt(row.prep_time || row.prepTime || 0),
            cookTime: parseInt(row.cook_time || row.cookTime || 0),
            servings: parseInt(row.servings || 1),
            difficulty: row.difficulty || 'medium',     // easy | medium | hard
            ingredients: row.ingredients || '',          // text/json
            steps: row.steps || '',                      // text/json
            notes: row.notes || '',
            rating: parseInt(row.rating || 0),
            favorite: !!row.favorite,
            image: row.image || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-recipes-v1';
    let useLocalStorage = false;
    let localRecipes = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('recipes').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Recipes: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Recipes: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Recipes: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal()  { try { localRecipes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localRecipes = []; } }
    function saveLocal()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(localRecipes)); }
    function genId()      { return 'rc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    async function getAll() {
        if (useLocalStorage) return localRecipes.map(r => ({...r}));
        const { data, error } = await supabaseClient.from('recipes').select('*')
            .eq('user_id', getUserId()).order('updated_at', { ascending: false });
        return error ? [] : data.map(mapRecipe);
    }

    async function getById(id) {
        if (useLocalStorage) return localRecipes.find(r => r.id === id) || null;
        const { data, error } = await supabaseClient.from('recipes').select('*').eq('id', id).single();
        return error ? null : mapRecipe(data);
    }

    async function create(d) {
        if (useLocalStorage) {
            const r = { id: genId(), title: d.title, category: d.category || 'autre', cuisine: d.cuisine || '',
                prepTime: parseInt(d.prepTime||0), cookTime: parseInt(d.cookTime||0), servings: parseInt(d.servings||1),
                difficulty: d.difficulty || 'medium', ingredients: d.ingredients || '', steps: d.steps || '',
                notes: d.notes||'', rating: parseInt(d.rating||0), favorite: !!d.favorite, image: d.image||'',
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            localRecipes.push(r); saveLocal(); return r;
        }
        const { data, error } = await supabaseClient.from('recipes').insert({
            user_id: getUserId(), title: d.title, category: d.category || 'autre',
            cuisine: d.cuisine || '', prep_time: d.prepTime || 0, cook_time: d.cookTime || 0,
            servings: d.servings || 1, difficulty: d.difficulty || 'medium',
            ingredients: d.ingredients || '', steps: d.steps || '',
            notes: d.notes || '', rating: d.rating || 0, favorite: !!d.favorite, image: d.image || ''
        }).select().single();
        if (error) { console.error('Recipe create error:', error); return null; }
        return mapRecipe(data);
    }

    async function update(id, d) {
        if (useLocalStorage) {
            const idx = localRecipes.findIndex(r => r.id === id);
            if (idx === -1) return null;
            const r = localRecipes[idx];
            for (const k of Object.keys(d)) { if (d[k] !== undefined) r[k] = d[k]; }
            r.updatedAt = new Date().toISOString();
            localRecipes[idx] = r; saveLocal(); return {...r};
        }
        const u = { updated_at: new Date().toISOString() };
        if (d.title !== undefined) u.title = d.title;
        if (d.category !== undefined) u.category = d.category;
        if (d.cuisine !== undefined) u.cuisine = d.cuisine;
        if (d.prepTime !== undefined) u.prep_time = d.prepTime;
        if (d.cookTime !== undefined) u.cook_time = d.cookTime;
        if (d.servings !== undefined) u.servings = d.servings;
        if (d.difficulty !== undefined) u.difficulty = d.difficulty;
        if (d.ingredients !== undefined) u.ingredients = d.ingredients;
        if (d.steps !== undefined) u.steps = d.steps;
        if (d.notes !== undefined) u.notes = d.notes;
        if (d.rating !== undefined) u.rating = d.rating;
        if (d.favorite !== undefined) u.favorite = d.favorite;
        if (d.image !== undefined) u.image = d.image;
        const { data, error } = await supabaseClient.from('recipes').update(u).eq('id', id).select().single();
        if (error) return null;
        return mapRecipe(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            const idx = localRecipes.findIndex(r => r.id === id);
            if (idx === -1) return false;
            localRecipes.splice(idx, 1); saveLocal(); return true;
        }
        const { error } = await supabaseClient.from('recipes').delete().eq('id', id);
        return !error;
    }

    // ===== HELPERS =====
    function getCategoryInfo(cat) {
        const cats = {
            'entree':  { label: 'Entrée', emoji: '🥗' },
            'plat':    { label: 'Plat principal', emoji: '🍽️' },
            'dessert': { label: 'Dessert', emoji: '🍰' },
            'soupe':   { label: 'Soupe', emoji: '🍜' },
            'salade':  { label: 'Salade', emoji: '🥙' },
            'snack':   { label: 'Snack', emoji: '🥨' },
            'boisson': { label: 'Boisson', emoji: '🥤' },
            'pain':    { label: 'Pain & Pâtisserie', emoji: '🥖' },
            'sauce':   { label: 'Sauce & Condiment', emoji: '🫙' },
            'autre':   { label: 'Autre', emoji: '🍴' }
        };
        return cats[cat] || cats.autre;
    }

    function getDifficultyInfo(diff) {
        const diffs = {
            'easy':   { label: 'Facile', class: 'diff-easy', icon: '⭐' },
            'medium': { label: 'Moyen', class: 'diff-medium', icon: '⭐⭐' },
            'hard':   { label: 'Difficile', class: 'diff-hard', icon: '⭐⭐⭐' }
        };
        return diffs[diff] || diffs.medium;
    }

    function formatTime(min) {
        if (!min || min <= 0) return '—';
        if (min < 60) return `${min} min`;
        const h = Math.floor(min / 60);
        const m = min % 60;
        return m > 0 ? `${h}h${m.toString().padStart(2,'0')}` : `${h}h`;
    }

    function getTotalTime(r) { return (r.prepTime || 0) + (r.cookTime || 0); }

    function getStats(recipes) {
        return {
            total: recipes.length,
            favorites: recipes.filter(r => r.favorite).length,
            avgRating: recipes.filter(r => r.rating > 0).length > 0
                ? (recipes.filter(r => r.rating > 0).reduce((s, r) => s + r.rating, 0) / recipes.filter(r => r.rating > 0).length).toFixed(1) : '—',
            categories: [...new Set(recipes.map(r => r.category))].length
        };
    }

    function renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) html += `<i class="fas fa-star ${i <= rating ? 'star-filled' : 'star-empty'}"></i>`;
        return html;
    }

    function exportCSV(recipes) {
        const headers = ['Titre','Catégorie','Cuisine','Prép (min)','Cuisson (min)','Portions','Difficulté','Note','Favori','Notes'];
        const rows = recipes.map(r => [r.title, r.category, r.cuisine, r.prepTime, r.cookTime, r.servings, r.difficulty, r.rating, r.favorite?'Oui':'Non', r.notes]
            .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `recettes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    }

    return {
        initStorage, getAll, getById, create, update, remove,
        getCategoryInfo, getDifficultyInfo, formatTime, getTotalTime, getStats, renderStars, exportCSV
    };
})();
