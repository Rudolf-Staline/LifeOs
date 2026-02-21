/* ===================================================================
   LifeOS — Notification Service
   Scans modules, persists to Supabase, powers the notification center
   =================================================================== */
const Notifications = (function () {
    'use strict';

    let initialized = false;
    let cachedNotifs = [];
    let panelOpen = false;
    let scanInterval = null;

    // ── Supabase helpers ──────────────────────────────────────────

    function sb() { return window.supabaseClient; }
    function userId() {
        const u = typeof Auth !== 'undefined' ? Auth.getUser() : null;
        return u?.id || null;
    }

    // ── CRUD ──────────────────────────────────────────────────────

    async function fetchAll() {
        const uid = userId();
        if (!uid || !sb()) return [];
        try {
            const { data, error } = await sb()
                .from('notifications')
                .select('*')
                .eq('user_id', uid)
                .eq('dismissed', false)
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn('[Notifications] fetchAll error:', e.message);
            return cachedNotifs;
        }
    }

    async function insert(notif) {
        const uid = userId();
        if (!uid || !sb()) return null;
        const row = {
            user_id: uid,
            type: notif.type || 'info',
            category: notif.category || 'system',
            title: notif.title,
            description: notif.description || '',
            source_table: notif.source_table || '',
            source_id: notif.source_id || null,
            action_url: notif.action_url || '',
            read: false,
            dismissed: false,
            scheduled_at: notif.scheduled_at || new Date().toISOString(),
            expires_at: notif.expires_at || null
        };
        try {
            const { data, error } = await sb()
                .from('notifications')
                .insert(row)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (e) {
            console.warn('[Notifications] insert error:', e.message);
            return null;
        }
    }

    async function markRead(id) {
        if (!sb()) return;
        try {
            await sb().from('notifications').update({ read: true }).eq('id', id);
            const n = cachedNotifs.find(x => x.id === id);
            if (n) n.read = true;
            render();
            updateBadge();
        } catch (e) { /* silent */ }
    }

    async function markAllRead() {
        const uid = userId();
        if (!uid || !sb()) return;
        try {
            await sb().from('notifications').update({ read: true })
                .eq('user_id', uid).eq('read', false);
            cachedNotifs.forEach(n => n.read = true);
            render();
            updateBadge();
        } catch (e) { /* silent */ }
    }

    async function dismiss(id) {
        if (!sb()) return;
        try {
            await sb().from('notifications').update({ dismissed: true }).eq('id', id);
            cachedNotifs = cachedNotifs.filter(x => x.id !== id);
            render();
            updateBadge();
        } catch (e) { /* silent */ }
    }

    async function clearAll() {
        const uid = userId();
        if (!uid || !sb()) return;
        try {
            await sb().from('notifications').update({ dismissed: true })
                .eq('user_id', uid).eq('dismissed', false);
            cachedNotifs = [];
            render();
            updateBadge();
        } catch (e) { /* silent */ }
    }

    // ── Smart scanning — generates notifications from module data ─

    async function scanAllModules() {
        const uid = userId();
        if (!uid || !sb()) return;

        // Collect existing source_ids to avoid duplicating today's notifs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const existing = new Set(
            cachedNotifs
                .filter(n => new Date(n.created_at) >= today)
                .map(n => `${n.source_table}:${n.source_id}:${n.category}`)
        );

        const newNotifs = [];

        function shouldAdd(table, id, category) {
            const key = `${table}:${id}:${category}`;
            if (existing.has(key)) return false;
            existing.add(key);
            return true;
        }

        // ── 1. Subscriptions — renewal coming up ──
        try {
            const { data } = await sb().from('subscriptions').select('*')
                .eq('user_id', uid).eq('status', 'active');
            if (data) {
                data.forEach(s => {
                    if (!s.renewal_date) return;
                    const days = daysUntil(s.renewal_date);
                    if (days >= 0 && days <= 3 && shouldAdd('subscriptions', s.id, 'renewal')) {
                        newNotifs.push({
                            type: days === 0 ? 'danger' : 'warning',
                            category: 'renewal',
                            title: days === 0 ? 'Renouvellement aujourd\'hui' : `Renouvellement dans ${days}j`,
                            description: `${s.name} — ${formatMoney(s.price)}`,
                            source_table: 'subscriptions',
                            source_id: s.id,
                            action_url: 'subscriptions'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 2. Documents — expiry ──
        try {
            const { data } = await sb().from('documents').select('*')
                .eq('user_id', uid).in('status', ['valid', 'expiring']);
            if (data) {
                data.forEach(d => {
                    if (!d.expiry_date) return;
                    const days = daysUntil(d.expiry_date);
                    const threshold = d.reminder_days || 30;
                    if (days >= 0 && days <= threshold && shouldAdd('documents', d.id, 'expiry')) {
                        newNotifs.push({
                            type: days <= 7 ? 'danger' : 'warning',
                            category: 'expiry',
                            title: days === 0 ? 'Document expiré aujourd\'hui' : `Document expire dans ${days}j`,
                            description: d.title,
                            source_table: 'documents',
                            source_id: d.id,
                            action_url: 'documents'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 3. Medications — refill needed ──
        try {
            const { data } = await sb().from('medications').select('*')
                .eq('user_id', uid).eq('status', 'active');
            if (data) {
                data.forEach(m => {
                    if (!m.refill_date) return;
                    const days = daysUntil(m.refill_date);
                    if (days >= 0 && days <= 5 && shouldAdd('medications', m.id, 'refill')) {
                        newNotifs.push({
                            type: days === 0 ? 'danger' : 'warning',
                            category: 'refill',
                            title: days === 0 ? 'Renouvellement médicament' : `Renouvellement dans ${days}j`,
                            description: `${m.name} — ${m.dosage || ''}`,
                            source_table: 'medications',
                            source_id: m.id,
                            action_url: 'medications'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 4. Events — upcoming ──
        try {
            const { data } = await sb().from('events').select('*')
                .eq('user_id', uid).in('status', ['upcoming', 'ongoing']);
            if (data) {
                data.forEach(ev => {
                    if (!ev.date) return;
                    const days = daysUntil(ev.date);
                    if (days >= 0 && days <= 2 && shouldAdd('events', ev.id, 'event')) {
                        newNotifs.push({
                            type: days === 0 ? 'info' : 'info',
                            category: 'event',
                            title: days === 0 ? 'Événement aujourd\'hui' : `Événement dans ${days}j`,
                            description: `${ev.title}${ev.location ? ' — ' + ev.location : ''}`,
                            source_table: 'events',
                            source_id: ev.id,
                            action_url: 'events'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 5. Vehicles — insurance & service ──
        try {
            const { data } = await sb().from('vehicles').select('*')
                .eq('user_id', uid).eq('status', 'active');
            if (data) {
                data.forEach(v => {
                    if (v.insurance_expiry) {
                        const days = daysUntil(v.insurance_expiry);
                        if (days >= 0 && days <= 14 && shouldAdd('vehicles', v.id, 'insurance')) {
                            newNotifs.push({
                                type: days <= 3 ? 'danger' : 'warning',
                                category: 'insurance',
                                title: days === 0 ? 'Assurance expire aujourd\'hui' : `Assurance expire dans ${days}j`,
                                description: `${v.name} ${v.brand || ''} ${v.model || ''}`.trim(),
                                source_table: 'vehicles',
                                source_id: v.id,
                                action_url: 'vehicles'
                            });
                        }
                    }
                    if (v.next_service) {
                        const days = daysUntil(v.next_service);
                        if (days >= 0 && days <= 7 && shouldAdd('vehicles', v.id, 'service')) {
                            newNotifs.push({
                                type: 'warning',
                                category: 'service',
                                title: `Entretien dans ${days}j`,
                                description: `${v.name} ${v.brand || ''} ${v.model || ''}`.trim(),
                                source_table: 'vehicles',
                                source_id: v.id,
                                action_url: 'vehicles'
                            });
                        }
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 6. Plants — watering ──
        try {
            const { data } = await sb().from('plants').select('*')
                .eq('user_id', uid);
            if (data) {
                data.forEach(p => {
                    if (!p.last_watered || !p.water_frequency) return;
                    const lastWatered = new Date(p.last_watered);
                    const nextWater = new Date(lastWatered);
                    nextWater.setDate(nextWater.getDate() + p.water_frequency);
                    const days = daysUntil(nextWater.toISOString().slice(0, 10));
                    if (days <= 0 && shouldAdd('plants', p.id, 'water')) {
                        newNotifs.push({
                            type: 'warning',
                            category: 'water',
                            title: 'Arrosage nécessaire',
                            description: `${p.name}${p.species ? ' (' + p.species + ')' : ''}`,
                            source_table: 'plants',
                            source_id: p.id,
                            action_url: 'plants'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 7. Packages — in transit ──
        try {
            const { data } = await sb().from('packages').select('*')
                .eq('user_id', uid).in('status', ['shipped', 'in_transit', 'out_for_delivery']);
            if (data) {
                data.forEach(pkg => {
                    if (shouldAdd('packages', pkg.id, 'delivery')) {
                        const statusLabels = {
                            shipped: 'expédié',
                            in_transit: 'en transit',
                            out_for_delivery: 'en livraison'
                        };
                        newNotifs.push({
                            type: pkg.status === 'out_for_delivery' ? 'success' : 'info',
                            category: 'delivery',
                            title: `Colis ${statusLabels[pkg.status] || pkg.status}`,
                            description: pkg.name,
                            source_table: 'packages',
                            source_id: pkg.id,
                            action_url: 'packages'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 8. Health records — upcoming appointments ──
        try {
            const { data } = await sb().from('health_records').select('*')
                .eq('user_id', uid).eq('status', 'scheduled');
            if (data) {
                data.forEach(h => {
                    if (!h.date) return;
                    const days = daysUntil(h.date);
                    if (days >= 0 && days <= 3 && shouldAdd('health_records', h.id, 'health')) {
                        newNotifs.push({
                            type: days === 0 ? 'danger' : 'info',
                            category: 'health',
                            title: days === 0 ? 'RDV santé aujourd\'hui' : `RDV santé dans ${days}j`,
                            description: `${h.title}${h.doctor ? ' — Dr. ' + h.doctor : ''}`,
                            source_table: 'health_records',
                            source_id: h.id,
                            action_url: 'health'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 9. Pets — vet appointments ──
        try {
            const { data } = await sb().from('pets').select('*')
                .eq('user_id', uid);
            if (data) {
                data.forEach(pet => {
                    if (!pet.next_vet_visit) return;
                    const days = daysUntil(pet.next_vet_visit);
                    if (days >= 0 && days <= 5 && shouldAdd('pets', pet.id, 'vet')) {
                        newNotifs.push({
                            type: days === 0 ? 'warning' : 'info',
                            category: 'vet',
                            title: days === 0 ? 'RDV vétérinaire aujourd\'hui' : `RDV vétérinaire dans ${days}j`,
                            description: pet.name,
                            source_table: 'pets',
                            source_id: pet.id,
                            action_url: 'pets'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 10. Wines — drink-before ──
        try {
            const { data } = await sb().from('wines').select('*')
                .eq('user_id', uid);
            if (data) {
                data.forEach(w => {
                    if (!w.drink_before || w.quantity <= 0) return;
                    const days = daysUntil(w.drink_before);
                    if (days >= 0 && days <= 30 && shouldAdd('wines', w.id, 'drink')) {
                        newNotifs.push({
                            type: days <= 7 ? 'warning' : 'info',
                            category: 'drink',
                            title: `Vin à consommer dans ${days}j`,
                            description: `${w.name} ${w.vintage ? w.vintage : ''}`.trim(),
                            source_table: 'wines',
                            source_id: w.id,
                            action_url: 'wine'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 11. Home tasks — overdue ──
        try {
            const { data } = await sb().from('home_tasks').select('*')
                .eq('user_id', uid).in('status', ['todo', 'in_progress']);
            if (data) {
                data.forEach(t => {
                    if (!t.due_date) return;
                    const days = daysUntil(t.due_date);
                    if (days <= 0 && shouldAdd('home_tasks', t.id, 'overdue')) {
                        newNotifs.push({
                            type: 'danger',
                            category: 'overdue',
                            title: 'Tâche maison en retard',
                            description: t.title,
                            source_table: 'home_tasks',
                            source_id: t.id,
                            action_url: 'home'
                        });
                    } else if (days >= 1 && days <= 2 && shouldAdd('home_tasks', t.id, 'due_soon')) {
                        newNotifs.push({
                            type: 'warning',
                            category: 'due_soon',
                            title: `Tâche maison dans ${days}j`,
                            description: t.title,
                            source_table: 'home_tasks',
                            source_id: t.id,
                            action_url: 'home'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 12. Cleaning — overdue ──
        try {
            const { data } = await sb().from('cleaning').select('*')
                .eq('user_id', uid);
            if (data) {
                data.forEach(c => {
                    if (!c.next_due) return;
                    const days = daysUntil(c.next_due);
                    if (days <= 0 && shouldAdd('cleaning', c.id, 'clean_due')) {
                        newNotifs.push({
                            type: 'info',
                            category: 'clean_due',
                            title: 'Nettoyage à faire',
                            description: `${c.task} — ${c.room || ''}`,
                            source_table: 'cleaning',
                            source_id: c.id,
                            action_url: 'cleaning'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 13. Projects — deadline ──
        try {
            const { data } = await sb().from('projects').select('*')
                .eq('user_id', uid).in('status', ['planning', 'active']);
            if (data) {
                data.forEach(p => {
                    if (!p.deadline) return;
                    const days = daysUntil(p.deadline);
                    if (days >= 0 && days <= 3 && shouldAdd('projects', p.id, 'deadline')) {
                        newNotifs.push({
                            type: days === 0 ? 'danger' : 'warning',
                            category: 'deadline',
                            title: days === 0 ? 'Deadline projet aujourd\'hui' : `Deadline projet dans ${days}j`,
                            description: p.name,
                            source_table: 'projects',
                            source_id: p.id,
                            action_url: 'projects'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── 14. Passwords — expiring ──
        try {
            const { data } = await sb().from('passwords').select('*')
                .eq('user_id', uid);
            if (data) {
                data.forEach(pw => {
                    if (!pw.expires_at) return;
                    const days = daysUntil(pw.expires_at);
                    if (days >= 0 && days <= 7 && shouldAdd('passwords', pw.id, 'pw_expiry')) {
                        newNotifs.push({
                            type: days <= 2 ? 'danger' : 'warning',
                            category: 'pw_expiry',
                            title: `Mot de passe expire dans ${days}j`,
                            description: pw.site,
                            source_table: 'passwords',
                            source_id: pw.id,
                            action_url: 'passwords'
                        });
                    }
                });
            }
        } catch (e) { /* silent */ }

        // ── Batch insert new notifications ──
        if (newNotifs.length > 0) {
            const uid2 = userId();
            const rows = newNotifs.map(n => ({
                user_id: uid2,
                type: n.type,
                category: n.category,
                title: n.title,
                description: n.description,
                source_table: n.source_table,
                source_id: n.source_id,
                action_url: n.action_url,
                read: false,
                dismissed: false,
                scheduled_at: new Date().toISOString()
            }));

            try {
                await sb().from('notifications').insert(rows);
            } catch (e) {
                console.warn('[Notifications] batch insert error:', e.message);
            }

            // Refresh cache
            cachedNotifs = await fetchAll();
            render();
            updateBadge();
            animateBell();
        }
    }

    // ── UI rendering ─────────────────────────────────────────────

    function render(filter) {
        const list = document.getElementById('notif-list');
        if (!list) return;

        let items = cachedNotifs;
        if (filter === 'unread') items = items.filter(n => !n.read);

        if (items.length === 0) {
            list.innerHTML = `<p class="notif-empty"><i class="fas fa-inbox"></i> ${filter === 'unread' ? 'Tout est lu !' : 'Aucune notification'}</p>`;
            return;
        }

        const icons = {
            success: { icon: 'fa-check-circle', cls: 'notif-success' },
            warning: { icon: 'fa-exclamation-triangle', cls: 'notif-warning' },
            danger: { icon: 'fa-exclamation-circle', cls: 'notif-danger' },
            info: { icon: 'fa-info-circle', cls: 'notif-info' }
        };

        const categoryIcons = {
            renewal: 'fa-sync-alt',
            expiry: 'fa-id-card',
            refill: 'fa-pills',
            event: 'fa-calendar-alt',
            insurance: 'fa-shield-alt',
            service: 'fa-wrench',
            water: 'fa-tint',
            delivery: 'fa-truck',
            health: 'fa-heartbeat',
            vet: 'fa-paw',
            drink: 'fa-wine-glass-alt',
            overdue: 'fa-home',
            due_soon: 'fa-clock',
            clean_due: 'fa-broom',
            deadline: 'fa-flag',
            pw_expiry: 'fa-key',
            budget: 'fa-wallet',
            system: 'fa-bell'
        };

        list.innerHTML = items.map(n => {
            const ic = icons[n.type] || icons.info;
            const catIcon = categoryIcons[n.category] || 'fa-bell';
            const ago = timeAgo(new Date(n.created_at));
            return `
                <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}" data-nav="${n.action_url || ''}">
                    <div class="notif-icon ${ic.cls}"><i class="fas ${catIcon}"></i></div>
                    <div class="notif-content">
                        <div class="notif-title">${escHtml(n.title)}</div>
                        <div class="notif-desc">${escHtml(n.description)}</div>
                        <div class="notif-time">${ago}</div>
                    </div>
                    <button class="notif-dismiss" data-dismiss="${n.id}" title="Supprimer"><i class="fas fa-times"></i></button>
                </div>
            `;
        }).join('');
    }

    function updateBadge() {
        const badge = document.getElementById('notif-badge');
        if (!badge) return;
        const count = cachedNotifs.filter(n => !n.read).length;
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    function animateBell() {
        const bell = document.getElementById('btn-notifications');
        if (!bell) return;
        bell.classList.add('has-notifs');
        setTimeout(() => bell.classList.remove('has-notifs'), 600);
    }

    // ── Panel interactions ────────────────────────────────────────

    function bindPanel() {
        const bell = document.getElementById('btn-notifications');
        const panel = document.getElementById('notification-panel');
        const clearBtn = document.getElementById('notif-clear-all');
        if (!bell || !panel) return;

        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            panelOpen = !panelOpen;
            panel.classList.toggle('active', panelOpen);
            panel.setAttribute('aria-hidden', panelOpen ? 'false' : 'true');
            if (panelOpen) {
                markAllRead();
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearAll();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('notif-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const icon = refreshBtn.querySelector('.fa-sync-alt');
                if (icon) icon.classList.add('spinning');
                await scanAllModules();
                cachedNotifs = await fetchAll();
                render();
                updateBadge();
                if (icon) setTimeout(() => icon.classList.remove('spinning'), 600);
            });
        }

        // Tab buttons
        panel.addEventListener('click', (e) => {
            const tab = e.target.closest('[data-notif-tab]');
            if (tab) {
                panel.querySelectorAll('[data-notif-tab]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                render(tab.dataset.notifTab === 'unread' ? 'unread' : undefined);
                return;
            }

            // Dismiss button
            const dismissBtn = e.target.closest('.notif-dismiss');
            if (dismissBtn) {
                e.stopPropagation();
                dismiss(dismissBtn.dataset.dismiss);
                return;
            }

            // Click on notification item ⇒ navigate
            const item = e.target.closest('.notif-item');
            if (item && item.dataset.nav) {
                const nav = item.dataset.nav;
                if (nav && typeof App !== 'undefined' && App.navigateTo) {
                    App.navigateTo(nav);
                } else {
                    // Fallback: click sidebar link
                    const sideLink = document.querySelector(`.sidebar-link[data-view="${nav}"]`);
                    if (sideLink) sideLink.click();
                }
                panelOpen = false;
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (panelOpen && !panel.contains(e.target) && !bell.contains(e.target)) {
                panelOpen = false;
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // ── Utility ──────────────────────────────────────────────────

    function daysUntil(dateStr) {
        const target = new Date(dateStr);
        const now = new Date();
        target.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        return Math.ceil((target - now) / 86400000);
    }

    function timeAgo(date) {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'À l\'instant';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Il y a ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Hier';
        return `Il y a ${days}j`;
    }

    function formatMoney(val) {
        return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(val || 0);
    }

    function escHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Public API for external modules to push notifications ────

    async function push(type, title, description, opts = {}) {
        const notif = await insert({
            type,
            title,
            description,
            category: opts.category || 'system',
            source_table: opts.source_table || '',
            source_id: opts.source_id || null,
            action_url: opts.action_url || ''
        });
        if (notif) {
            cachedNotifs.unshift(notif);
            if (cachedNotifs.length > 50) cachedNotifs.pop();
            render();
            updateBadge();
            animateBell();
        }
        return notif;
    }

    // ── Init ─────────────────────────────────────────────────────

    async function init() {
        if (initialized) return;
        initialized = true;

        bindPanel();

        // Initial load
        cachedNotifs = await fetchAll();
        render();
        updateBadge();

        // Scan modules for smart notifications
        await scanAllModules();

        // Re-scan every 15 minutes
        scanInterval = setInterval(() => scanAllModules(), 15 * 60 * 1000);
    }

    function destroy() {
        if (scanInterval) clearInterval(scanInterval);
        initialized = false;
        cachedNotifs = [];
    }

    return {
        init,
        destroy,
        push,                  // push(type, title, desc, opts)
        addNotification: push, // alias for backward compatibility with Theme.addNotification
        markRead,
        markAllRead,
        dismiss,
        clearAll,
        scanAllModules,
        getUnreadCount: () => cachedNotifs.filter(n => !n.read).length
    };
})();
