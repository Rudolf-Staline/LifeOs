/* ===================================================================
   books.js — Bibliothèque & Lecture Module
   Suivi de lecture, bibliothèque personnelle, notes et progression
   =================================================================== */

const Books = (() => {

    // ===== SUPABASE / LOCALSTORAGE =====

    function getUserId() {
        return Auth.getUserId();
    }

    function mapBook(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title,
            author: row.author || '',
            genre: row.genre || 'autre',
            totalPages: parseInt(row.total_pages || row.totalPages || 0),
            currentPage: parseInt(row.current_page || row.currentPage || 0),
            status: row.status || 'to-read',     // to-read | reading | finished | abandoned
            rating: parseInt(row.rating || 0),     // 0-5
            startDate: row.start_date || row.startDate || null,
            finishDate: row.finish_date || row.finishDate || null,
            cover: row.cover || '',                // emoji or color code
            notes: row.notes || '',
            favorite: !!row.favorite,
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-books-v1';
    let useLocalStorage = false;
    let localBooks = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient
                .from('books')
                .select('id')
                .limit(1);
            if (error && error.code === '42P01') {
                console.log('Books: Supabase table not found, using localStorage');
                useLocalStorage = true;
                loadLocal();
            } else if (error) {
                console.warn('Books: Supabase error, using localStorage', error);
                useLocalStorage = true;
                loadLocal();
            }
        } catch (e) {
            console.warn('Books: Falling back to localStorage', e);
            useLocalStorage = true;
            loadLocal();
        }
    }

    function loadLocal() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            localBooks = raw ? JSON.parse(raw) : [];
        } catch (e) {
            localBooks = [];
        }
    }

    function saveLocal() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localBooks));
    }

    function generateLocalId() {
        return 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ===== CRUD =====

    async function getAll() {
        if (useLocalStorage) {
            return localBooks.map(b => ({...b}));
        }
        const { data, error } = await supabaseClient
            .from('books')
            .select('*')
            .eq('user_id', getUserId())
            .order('updated_at', { ascending: false });
        return error ? [] : data.map(mapBook);
    }

    async function getById(id) {
        if (useLocalStorage) {
            return localBooks.find(b => b.id === id) || null;
        }
        const { data, error } = await supabaseClient
            .from('books')
            .select('*')
            .eq('id', id)
            .single();
        return error ? null : mapBook(data);
    }

    async function create(bookData) {
        if (useLocalStorage) {
            const book = {
                id: generateLocalId(),
                title: bookData.title,
                author: bookData.author || '',
                genre: bookData.genre || 'autre',
                totalPages: parseInt(bookData.totalPages || 0),
                currentPage: parseInt(bookData.currentPage || 0),
                status: bookData.status || 'to-read',
                rating: parseInt(bookData.rating || 0),
                startDate: bookData.startDate || null,
                finishDate: bookData.finishDate || null,
                cover: bookData.cover || '📖',
                notes: bookData.notes || '',
                favorite: !!bookData.favorite,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            localBooks.push(book);
            saveLocal();
            return book;
        }

        const { data, error } = await supabaseClient
            .from('books')
            .insert({
                user_id: getUserId(),
                title: bookData.title,
                author: bookData.author || '',
                genre: bookData.genre || 'autre',
                total_pages: bookData.totalPages || 0,
                current_page: bookData.currentPage || 0,
                status: bookData.status || 'to-read',
                rating: bookData.rating || 0,
                start_date: bookData.startDate || null,
                finish_date: bookData.finishDate || null,
                cover: bookData.cover || '📖',
                notes: bookData.notes || '',
                favorite: !!bookData.favorite
            })
            .select()
            .single();
        if (error) { console.error('Book create error:', error); return null; }
        return mapBook(data);
    }

    async function update(id, bookData) {
        if (useLocalStorage) {
            const idx = localBooks.findIndex(b => b.id === id);
            if (idx === -1) return null;
            const book = localBooks[idx];
            for (const key of Object.keys(bookData)) {
                if (bookData[key] !== undefined) book[key] = bookData[key];
            }
            book.updatedAt = new Date().toISOString();
            localBooks[idx] = book;
            saveLocal();
            return {...book};
        }

        const updateObj = { updated_at: new Date().toISOString() };
        if (bookData.title !== undefined) updateObj.title = bookData.title;
        if (bookData.author !== undefined) updateObj.author = bookData.author;
        if (bookData.genre !== undefined) updateObj.genre = bookData.genre;
        if (bookData.totalPages !== undefined) updateObj.total_pages = bookData.totalPages;
        if (bookData.currentPage !== undefined) updateObj.current_page = bookData.currentPage;
        if (bookData.status !== undefined) updateObj.status = bookData.status;
        if (bookData.rating !== undefined) updateObj.rating = bookData.rating;
        if (bookData.startDate !== undefined) updateObj.start_date = bookData.startDate;
        if (bookData.finishDate !== undefined) updateObj.finish_date = bookData.finishDate;
        if (bookData.cover !== undefined) updateObj.cover = bookData.cover;
        if (bookData.notes !== undefined) updateObj.notes = bookData.notes;
        if (bookData.favorite !== undefined) updateObj.favorite = bookData.favorite;

        const { data, error } = await supabaseClient
            .from('books')
            .update(updateObj)
            .eq('id', id)
            .select()
            .single();
        if (error) return null;
        return mapBook(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            const idx = localBooks.findIndex(b => b.id === id);
            if (idx === -1) return false;
            localBooks.splice(idx, 1);
            saveLocal();
            return true;
        }
        const { error } = await supabaseClient.from('books').delete().eq('id', id);
        return !error;
    }

    async function updateProgress(id, newPage) {
        const book = await getById(id);
        if (!book) return null;
        const page = Math.max(0, Math.min(newPage, book.totalPages));
        const updates = { currentPage: page };

        // Auto-set status
        if (page > 0 && book.status === 'to-read') {
            updates.status = 'reading';
            if (!book.startDate) updates.startDate = new Date().toISOString().split('T')[0];
        }
        if (page >= book.totalPages && book.totalPages > 0) {
            updates.status = 'finished';
            if (!book.finishDate) updates.finishDate = new Date().toISOString().split('T')[0];
        }

        return await update(id, updates);
    }

    // ===== HELPERS =====

    function getReadingProgress(book) {
        if (!book.totalPages || book.totalPages <= 0) return 0;
        return Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
    }

    function getGenreLabel(genre) {
        const labels = {
            'fiction': '📚 Fiction',
            'non-fiction': '📰 Non-fiction',
            'science': '🔬 Science',
            'histoire': '🏛️ Histoire',
            'philosophie': '💭 Philosophie',
            'religion': '🕌 Religion',
            'biographie': '👤 Biographie',
            'developpement': '🧠 Développement personnel',
            'business': '💼 Business',
            'technologie': '💻 Technologie',
            'poesie': '✨ Poésie',
            'roman': '📖 Roman',
            'manga': '🎌 Manga / BD',
            'cuisine': '🍳 Cuisine',
            'voyage': '✈️ Voyage',
            'enfants': '🧒 Enfants',
            'scolaire': '🎓 Scolaire',
            'autre': '📄 Autre'
        };
        return labels[genre] || labels.autre;
    }

    function getGenreEmoji(genre) {
        const emojis = {
            'fiction': '📚', 'non-fiction': '📰', 'science': '🔬',
            'histoire': '🏛️', 'philosophie': '💭', 'religion': '🕌',
            'biographie': '👤', 'developpement': '🧠', 'business': '💼',
            'technologie': '💻', 'poesie': '✨', 'roman': '📖',
            'manga': '🎌', 'cuisine': '🍳', 'voyage': '✈️',
            'enfants': '🧒', 'scolaire': '🎓', 'autre': '📄'
        };
        return emojis[genre] || '📄';
    }

    function getStatusInfo(status) {
        const statuses = {
            'to-read': { label: 'À lire', class: 'badge-to-read', icon: 'fas fa-bookmark' },
            'reading': { label: 'En cours', class: 'badge-reading', icon: 'fas fa-book-reader' },
            'finished': { label: 'Terminé', class: 'badge-finished', icon: 'fas fa-check-circle' },
            'abandoned': { label: 'Abandonné', class: 'badge-abandoned', icon: 'fas fa-times-circle' }
        };
        return statuses[status] || statuses['to-read'];
    }

    function renderStars(rating, interactive = false) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= rating;
            if (interactive) {
                html += `<i class="fas fa-star book-star ${filled ? 'star-filled' : 'star-empty'}" data-rating="${i}"></i>`;
            } else {
                html += `<i class="fas fa-star ${filled ? 'star-filled' : 'star-empty'}"></i>`;
            }
        }
        return html;
    }

    function formatDateShort(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function getStats(books) {
        const total = books.length;
        const reading = books.filter(b => b.status === 'reading').length;
        const finished = books.filter(b => b.status === 'finished').length;
        const toRead = books.filter(b => b.status === 'to-read').length;
        const totalPages = books.filter(b => b.status === 'finished').reduce((s, b) => s + b.totalPages, 0);
        const avgRating = finished > 0
            ? (books.filter(b => b.status === 'finished' && b.rating > 0).reduce((s, b) => s + b.rating, 0) /
               books.filter(b => b.status === 'finished' && b.rating > 0).length).toFixed(1)
            : '—';

        return { total, reading, finished, toRead, totalPages, avgRating };
    }

    // ===== EXPORT =====
    function exportCSV(books) {
        const headers = ['Titre', 'Auteur', 'Genre', 'Pages totales', 'Page actuelle', 'Statut', 'Note', 'Date début', 'Date fin', 'Favori', 'Notes'];
        const rows = books.map(b => [
            b.title, b.author, b.genre, b.totalPages, b.currentPage,
            b.status, b.rating, b.startDate || '', b.finishDate || '',
            b.favorite ? 'Oui' : 'Non', b.notes
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bibliotheque_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ===== PUBLIC API =====
    return {
        initStorage,
        getAll,
        getById,
        create,
        update,
        remove,
        updateProgress,
        getReadingProgress,
        getGenreLabel,
        getGenreEmoji,
        getStatusInfo,
        renderStars,
        formatDateShort,
        getStats,
        exportCSV
    };

})();
