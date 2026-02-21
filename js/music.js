/* ===================================================================
   music.js — Musique & Playlists Module
   Suivi musique, albums, artistes, playlists
   =================================================================== */

const Music = (() => {

    function getUserId() { return Auth.getUserId(); }

    function mapTrack(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title || '',
            artist: row.artist || '',
            album: row.album || '',
            genre: row.genre || 'autre',
            year: parseInt(row.year || 0),
            duration: row.duration || '',           // "3:45"
            platform: row.platform || '',
            rating: parseInt(row.rating || 0),
            mood: row.mood || '',
            playlist: row.playlist || '',
            favorite: !!row.favorite,
            listenDate: row.listen_date || row.listenDate || '',
            notes: row.notes || '',
            cover: row.cover || '',
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
    }

    const STORAGE_KEY = 'monbudget-music-v1';
    let useLocalStorage = false;
    let localTracks = [];

    async function initStorage() {
        try {
            const { data, error } = await supabaseClient.from('music').select('id').limit(1);
            if (error && error.code === '42P01') {
                console.log('Music: table not found, using localStorage');
                useLocalStorage = true; loadLocal();
            } else if (error) {
                console.warn('Music: Supabase error, using localStorage', error);
                useLocalStorage = true; loadLocal();
            }
        } catch (e) {
            console.warn('Music: Falling back to localStorage', e);
            useLocalStorage = true; loadLocal();
        }
    }

    function loadLocal() { try { localTracks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { localTracks = []; } }
    function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(localTracks)); }

    async function getAll() {
        if (useLocalStorage) return localTracks.map(mapTrack);
        const uid = getUserId(); if (!uid) return [];
        const { data, error } = await supabaseClient.from('music').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return error ? [] : (data || []).map(mapTrack);
    }

    async function getById(id) {
        if (useLocalStorage) { const t = localTracks.find(x => x.id === id); return t ? mapTrack(t) : null; }
        const uid = getUserId(); if (!uid) return null;
        const { data, error } = await supabaseClient.from('music').select('*').eq('id', id).eq('user_id', uid).single();
        return error ? null : mapTrack(data);
    }

    async function add(track) {
        if (useLocalStorage) {
            const newTrack = { ...track, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            localTracks.unshift(newTrack); saveLocal(); return mapTrack(newTrack);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {
            user_id: uid, title: track.title, artist: track.artist || '', album: track.album || '',
            genre: track.genre || 'autre', year: track.year || 0, duration: track.duration || '',
            platform: track.platform || '', rating: track.rating || 0, mood: track.mood || '',
            playlist: track.playlist || '', favorite: track.favorite || false,
            listen_date: track.listenDate || null, notes: track.notes || '', cover: track.cover || ''
        };
        const { data, error } = await supabaseClient.from('music').insert(row).select().single();
        return error ? null : mapTrack(data);
    }

    async function update(id, updates) {
        if (useLocalStorage) {
            const idx = localTracks.findIndex(x => x.id === id); if (idx < 0) return null;
            localTracks[idx] = { ...localTracks[idx], ...updates, updated_at: new Date().toISOString() };
            saveLocal(); return mapTrack(localTracks[idx]);
        }
        const uid = getUserId(); if (!uid) return null;
        const row = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.artist !== undefined) row.artist = updates.artist;
        if (updates.album !== undefined) row.album = updates.album;
        if (updates.genre !== undefined) row.genre = updates.genre;
        if (updates.year !== undefined) row.year = updates.year;
        if (updates.duration !== undefined) row.duration = updates.duration;
        if (updates.platform !== undefined) row.platform = updates.platform;
        if (updates.rating !== undefined) row.rating = updates.rating;
        if (updates.mood !== undefined) row.mood = updates.mood;
        if (updates.playlist !== undefined) row.playlist = updates.playlist;
        if (updates.favorite !== undefined) row.favorite = updates.favorite;
        if (updates.listenDate !== undefined) row.listen_date = updates.listenDate;
        if (updates.notes !== undefined) row.notes = updates.notes;
        if (updates.cover !== undefined) row.cover = updates.cover;
        const { data, error } = await supabaseClient.from('music').update(row).eq('id', id).eq('user_id', uid).select().single();
        return error ? null : mapTrack(data);
    }

    async function remove(id) {
        if (useLocalStorage) {
            localTracks = localTracks.filter(x => x.id !== id); saveLocal(); return true;
        }
        const uid = getUserId(); if (!uid) return false;
        const { error } = await supabaseClient.from('music').delete().eq('id', id).eq('user_id', uid);
        return !error;
    }

    async function toggleFavorite(id) {
        const track = await getById(id); if (!track) return null;
        return update(id, { favorite: !track.favorite });
    }

    // Genres
    const GENRES = [
        { value: 'pop', label: 'Pop', icon: '🎤' },
        { value: 'rock', label: 'Rock', icon: '🎸' },
        { value: 'hiphop', label: 'Hip-Hop/Rap', icon: '🎤' },
        { value: 'rnb', label: 'R&B/Soul', icon: '🎵' },
        { value: 'jazz', label: 'Jazz', icon: '🎷' },
        { value: 'classical', label: 'Classique', icon: '🎻' },
        { value: 'electronic', label: 'Électronique', icon: '🎧' },
        { value: 'reggae', label: 'Reggae', icon: '🌴' },
        { value: 'metal', label: 'Metal', icon: '🤘' },
        { value: 'country', label: 'Country', icon: '🤠' },
        { value: 'folk', label: 'Folk', icon: '🪕' },
        { value: 'blues', label: 'Blues', icon: '🎺' },
        { value: 'latin', label: 'Latin', icon: '💃' },
        { value: 'kpop', label: 'K-Pop', icon: '🇰🇷' },
        { value: 'arabic', label: 'Arabe/Oriental', icon: '🪘' },
        { value: 'autre', label: 'Autre', icon: '🎵' }
    ];

    const MOODS = [
        { value: 'happy', label: 'Joyeux', icon: '😊' },
        { value: 'sad', label: 'Triste', icon: '😢' },
        { value: 'energetic', label: 'Énergique', icon: '⚡' },
        { value: 'chill', label: 'Chill', icon: '😌' },
        { value: 'romantic', label: 'Romantique', icon: '❤️' },
        { value: 'focus', label: 'Concentration', icon: '🧠' },
        { value: 'party', label: 'Fête', icon: '🎉' },
        { value: 'workout', label: 'Sport', icon: '💪' }
    ];

    const PLATFORMS = [
        { value: 'spotify', label: 'Spotify', icon: '🟢' },
        { value: 'apple', label: 'Apple Music', icon: '🍎' },
        { value: 'youtube', label: 'YouTube Music', icon: '🔴' },
        { value: 'deezer', label: 'Deezer', icon: '🟣' },
        { value: 'soundcloud', label: 'SoundCloud', icon: '🟠' },
        { value: 'vinyl', label: 'Vinyle/CD', icon: '💿' },
        { value: 'autre', label: 'Autre', icon: '🎵' }
    ];

    function getGenreInfo(val) { return GENRES.find(g => g.value === val) || GENRES[GENRES.length - 1]; }
    function getMoodInfo(val) { return MOODS.find(m => m.value === val) || { value: val, label: val, icon: '🎵' }; }
    function getPlatformInfo(val) { return PLATFORMS.find(p => p.value === val) || PLATFORMS[PLATFORMS.length - 1]; }

    function renderStars(n) { let s = ''; for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; }

    async function getStats() {
        const tracks = await getAll();
        return {
            total: tracks.length,
            artists: new Set(tracks.map(t => t.artist).filter(Boolean)).size,
            favorites: tracks.filter(t => t.favorite).length,
            avgRating: tracks.length ? (tracks.reduce((s, t) => s + t.rating, 0) / tracks.length).toFixed(1) : '0'
        };
    }

    function exportCSV(tracks) {
        const header = 'Titre,Artiste,Album,Genre,Année,Durée,Plateforme,Note,Humeur,Playlist,Favori\n';
        const rows = tracks.map(t =>
            `"${t.title}","${t.artist}","${t.album}","${t.genre}",${t.year},"${t.duration}","${t.platform}",${t.rating},"${t.mood}","${t.playlist}",${t.favorite}`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'musique.csv'; a.click();
    }

    return {
        initStorage, getAll, getById, add, update, remove, toggleFavorite,
        getStats, exportCSV, renderStars,
        GENRES, MOODS, PLATFORMS, getGenreInfo, getMoodInfo, getPlatformInfo
    };
})();
