/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LifeOS â€” Theme & Animation Engine
   Exports: Theme.init(), Theme.animateCounters(), 
            Theme.launchConfetti(), Theme.applyTheme()
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const Theme = (function () {
    'use strict';

    let particlesCtx = null;
    let particles = [];
    let particlesAnimId = null;
    let authParticlesCtx = null;
    let authParticles = [];
    let authAnimId = null;
    let themeToggleBound = false;
    let appEffectsInitialized = false;
    let productivityBound = false;
    let commandItems = [];
    let commandFiltered = [];
    let commandActiveIndex = 0;
    let clockInterval = null;
    let widgetsDnDBound = false;

    /* â”€â”€â”€ Theme Init â”€â”€â”€ */
    function initTheme() {
        const saved = localStorage.getItem('lifeos-theme') || 'dark';
        applyTheme(saved);

        const toggle = document.getElementById('theme-toggle');
        if (toggle && !themeToggleBound) {
            themeToggleBound = true;
            toggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                applyTheme(next);
            });
        }
    }

    function updateChartColors(theme) {
        if (typeof Chart === 'undefined') return;
        const rootStyles = getComputedStyle(document.documentElement);
        const textColor = rootStyles.getPropertyValue('--chart-text').trim() || (theme === 'dark' ? '#94A3B8' : '#64748B');
        const gridColor = rootStyles.getPropertyValue('--chart-grid').trim() || (theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)');
        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;
        // Re-render charts if Charts module exists
        if (typeof Charts !== 'undefined') {
            try { Charts.renderAll && Charts.renderAll(); } catch (e) { /* ignore */ }
        }
    }

    /* â”€â”€â”€ Particle System (App Background) â”€â”€â”€ */
    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        particlesCtx = canvas.getContext('2d');
        resizeCanvas(canvas);
        window.addEventListener('resize', () => resizeCanvas(canvas));

        particles = [];
        const count = Math.min(40, Math.floor(window.innerWidth / 40));
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(canvas));
        }
        animateParticles(canvas);
    }

    function createParticle(canvas) {
        const hues = [230, 260, 290, 320, 180];
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2.5 + 0.5,
            hue: hues[Math.floor(Math.random() * hues.length)],
            alpha: Math.random() * 0.3 + 0.1
        };
    }

    function resizeCanvas(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animateParticles(canvas) {
        if (!particlesCtx) return;
        particlesCtx.clearRect(0, 0, canvas.width, canvas.height);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const alphaMultiplier = isDark ? 1.5 : 0.7;

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            particlesCtx.beginPath();
            particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            particlesCtx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha * alphaMultiplier})`;
            particlesCtx.fill();
        }

        // Connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    particlesCtx.beginPath();
                    particlesCtx.moveTo(particles[i].x, particles[i].y);
                    particlesCtx.lineTo(particles[j].x, particles[j].y);
                    const lineAlpha = (1 - dist / 120) * 0.08 * alphaMultiplier;
                    particlesCtx.strokeStyle = `hsla(230, 60%, 60%, ${lineAlpha})`;
                    particlesCtx.lineWidth = 0.5;
                    particlesCtx.stroke();
                }
            }
        }

        particlesAnimId = requestAnimationFrame(() => animateParticles(canvas));
    }

    /* â”€â”€â”€ Auth Particles â”€â”€â”€ */
    function initAuthParticles() {
        const canvas = document.getElementById('auth-particles');
        if (!canvas) return;
        authParticlesCtx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        authParticles = [];
        for (let i = 0; i < 60; i++) {
            authParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
                hue: [230, 300, 180, 340][Math.floor(Math.random() * 4)]
            });
        }
        animateAuthParticles(canvas);
    }

    function animateAuthParticles(canvas) {
        if (!authParticlesCtx) return;
        authParticlesCtx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of authParticles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            authParticlesCtx.beginPath();
            authParticlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            authParticlesCtx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
            authParticlesCtx.fill();
        }

        // Connection lines
        for (let i = 0; i < authParticles.length; i++) {
            for (let j = i + 1; j < authParticles.length; j++) {
                const dx = authParticles[i].x - authParticles[j].x;
                const dy = authParticles[i].y - authParticles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    authParticlesCtx.beginPath();
                    authParticlesCtx.moveTo(authParticles[i].x, authParticles[i].y);
                    authParticlesCtx.lineTo(authParticles[j].x, authParticles[j].y);
                    authParticlesCtx.strokeStyle = `hsla(230, 60%, 60%, ${(1 - dist / 100) * 0.12})`;
                    authParticlesCtx.lineWidth = 0.5;
                    authParticlesCtx.stroke();
                }
            }
        }

        authAnimId = requestAnimationFrame(() => animateAuthParticles(canvas));
    }

    function stopAuthParticles() {
        if (authAnimId) {
            cancelAnimationFrame(authAnimId);
            authAnimId = null;
        }
    }

    /* â”€â”€â”€ Scroll Animations â”€â”€â”€ */
    function initScrollAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));

        // Stagger children
        document.querySelectorAll('.stagger-children').forEach(parent => {
            const children = parent.children;
            Array.from(children).forEach((child, i) => {
                child.style.transitionDelay = `${i * 0.05}s`;
            });
        });
    }

    /* â”€â”€â”€ Counter Animation â”€â”€â”€ */
    function animateCounters() {
        document.querySelectorAll('.stat-value').forEach(el => {
            const text = el.textContent;
            // Extract numeric value from formatted money string
            const numMatch = text.replace(/[^\d,.\-]/g, '').replace(/\s/g, '');
            if (!numMatch) return;
            
            // Parse the number (handles French format: 1 234,56)
            const cleanNum = numMatch.replace(/\./g, '').replace(',', '.');
            const target = parseFloat(cleanNum);
            if (isNaN(target) || target === 0) return;

            const suffix = text.replace(/[\d\s.,\-]+/g, '').trim();
            const duration = 1200;
            const startTime = performance.now();
            const startVal = 0;

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = startVal + (target - startVal) * eased;
                
                // Format like original
                if (text.includes('MAD')) {
                    try {
                        el.textContent = new Intl.NumberFormat('fr-MA', {
                            style: 'currency', currency: 'MAD',
                            minimumFractionDigits: 2
                        }).format(current);
                    } catch (e) {
                        el.textContent = current.toFixed(2) + ' MAD';
                    }
                } else if (text.includes('%')) {
                    el.textContent = Math.round(current) + ' %';
                } else {
                    el.textContent = text;
                    return; // Don't animate non-numeric
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    // Restore exact original text
                    el.textContent = text;
                }
            }
            requestAnimationFrame(update);
        });
    }

    /* â”€â”€â”€ Confetti â”€â”€â”€ */
    function launchConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        
        const colors = [
            '#22C55E', '#A78BFA', '#06B6D4', '#10B981',
            '#4ADE80', '#C4B5FD', '#F43F5E', '#14B8A6',
            '#84CC16', '#F59E0B'
        ];
        const count = 80;
        
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.width = (Math.random() * 8 + 5) + 'px';
            piece.style.height = (Math.random() * 8 + 5) + 'px';
            piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            piece.style.animationDelay = (Math.random() * 0.5) + 's';
            if (Math.random() > 0.5) piece.style.borderRadius = '50%';
            container.appendChild(piece);
        }
        
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    /* â”€â”€â”€ Micro Interactions â”€â”€â”€ */
    function initMicroInteractions() {
        // Ripple on nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function (e) {
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    width: 0; height: 0;
                    left: ${e.offsetX}px;
                    top: ${e.offsetY}px;
                    transform: translate(-50%, -50%);
                    animation: rippleEffect 0.6s ease-out forwards;
                    pointer-events: none;
                `;
                this.style.position = 'relative';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple keyframe if not exists
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes rippleEffect {
                    to { width: 200px; height: 200px; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Card hover subtle tilt effect
        document.querySelectorAll('.stat-card, .goal-card, .category-card').forEach(card => {
            card.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / centerY * -3;
                const rotateY = (x - centerX) / centerX * 3;
                this.style.transform = `translateY(-3px) perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', function () {
                this.style.transform = '';
            });
        });
    }

    /* â”€â”€â”€ Productivity Features â”€â”€â”€ */
    function initProductivityFeatures() {
        if (productivityBound) return;
        productivityBound = true;
        initLiveClock();
        initStyleLab();
        initFocusMode();
        initCommandPalette();
        initGuidedTour();
        initQuickFabActions();
        initViewCinematics();
        initDashboardWidgetDnD();
        initCursorReactiveBackground();
        initNotificationCenter();
        initKeyboardShortcutsModal();
    }

    function initStyleLab() {
        const panel = document.getElementById('style-lab');
        const btnOpen = document.getElementById('btn-style-lab');
        const btnClose = document.getElementById('style-lab-close');
        const accentGrid = document.getElementById('accent-grid');
        const sceneGrid = document.getElementById('scene-grid');
        const toggleAmbient = document.getElementById('toggle-ambient');
        const toggleNeon = document.getElementById('toggle-neon');
        const toggleReduced = document.getElementById('toggle-reduced-motion');
        const resetBtn = document.getElementById('btn-style-reset');

        const savedAccent = localStorage.getItem('lifeos-accent') || 'violet';
        applyAccent(savedAccent);

        const savedScene = localStorage.getItem('lifeos-scene') || 'default';
        applyScene(savedScene);

        const ambient = localStorage.getItem('lifeos-ambient') === '1';
        document.body.classList.toggle('ambient-mode', ambient);
        if (toggleAmbient) toggleAmbient.checked = ambient;

        const neon = localStorage.getItem('lifeos-neon') === '1';
        document.body.classList.toggle('neon-mode', neon);
        if (toggleNeon) toggleNeon.checked = neon;

        const reducedMotion = localStorage.getItem('lifeos-reduced-motion') === '1';
        document.body.classList.toggle('reduce-motion', reducedMotion);
        if (toggleReduced) toggleReduced.checked = reducedMotion;

        if (btnOpen && panel) {
            btnOpen.addEventListener('click', () => {
                panel.classList.toggle('active');
                const isOpen = panel.classList.contains('active');
                panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
                btnOpen.classList.toggle('style-active', isOpen);
            });
        }

        if (btnClose && panel) {
            btnClose.addEventListener('click', () => {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
                if (btnOpen) btnOpen.classList.remove('style-active');
            });
        }

        if (accentGrid) {
            accentGrid.addEventListener('click', (e) => {
                const chip = e.target.closest('.accent-chip');
                if (!chip) return;
                const accent = chip.dataset.accent || 'violet';
                applyAccent(accent);
            });
        }

        if (sceneGrid) {
            sceneGrid.addEventListener('click', (e) => {
                const chip = e.target.closest('.scene-chip');
                if (!chip) return;
                const scene = chip.dataset.scene || 'default';
                applyScene(scene);
            });
        }

        if (toggleAmbient) {
            toggleAmbient.addEventListener('change', () => {
                document.body.classList.toggle('ambient-mode', toggleAmbient.checked);
                localStorage.setItem('lifeos-ambient', toggleAmbient.checked ? '1' : '0');
            });
        }

        if (toggleNeon) {
            toggleNeon.addEventListener('change', () => {
                document.body.classList.toggle('neon-mode', toggleNeon.checked);
                localStorage.setItem('lifeos-neon', toggleNeon.checked ? '1' : '0');
            });
        }

        if (toggleReduced) {
            toggleReduced.addEventListener('change', () => {
                document.body.classList.toggle('reduce-motion', toggleReduced.checked);
                localStorage.setItem('lifeos-reduced-motion', toggleReduced.checked ? '1' : '0');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                applyAccent('violet');
                applyScene('default');
                if (toggleAmbient) toggleAmbient.checked = false;
                if (toggleNeon) toggleNeon.checked = false;
                if (toggleReduced) toggleReduced.checked = false;
                document.body.classList.remove('ambient-mode', 'neon-mode', 'reduce-motion');
                localStorage.setItem('lifeos-ambient', '0');
                localStorage.setItem('lifeos-neon', '0');
                localStorage.setItem('lifeos-reduced-motion', '0');
            });
        }

        document.addEventListener('click', (e) => {
            if (!panel || !btnOpen || !panel.classList.contains('active')) return;
            if (!panel.contains(e.target) && !btnOpen.contains(e.target)) {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
                btnOpen.classList.remove('style-active');
            }
        });
    }

    function applyAccent(accent) {
        const ACCENT_PALETTES = {
            violet:  { p: '#7C3AED', pl: '#8B5CF6', pd: '#6D28D9', s: '#D946EF', glow: 'rgba(124,58,237,0.25)' },
            ocean:   { p: '#2563EB', pl: '#3B82F6', pd: '#1D4ED8', s: '#06B6D4', glow: 'rgba(37,99,235,0.25)' },
            emerald: { p: '#059669', pl: '#34D399', pd: '#047857', s: '#0EA5E9', glow: 'rgba(5,150,105,0.25)' },
            rose:    { p: '#E11D48', pl: '#FB7185', pd: '#BE123C', s: '#F97316', glow: 'rgba(225,29,72,0.25)' },
            sunset:  { p: '#F59E0B', pl: '#FBBF24', pd: '#D97706', s: '#EF4444', glow: 'rgba(245,158,11,0.25)' },
            cyan:    { p: '#06B6D4', pl: '#22D3EE', pd: '#0891B2', s: '#8B5CF6', glow: 'rgba(6,182,212,0.25)' }
        };
        const finalAccent = ACCENT_PALETTES[accent] ? accent : 'violet';
        const pal = ACCENT_PALETTES[finalAccent];

        const root = document.documentElement;
        root.style.setProperty('--primary', pal.p);
        root.style.setProperty('--primary-light', pal.pl);
        root.style.setProperty('--primary-dark', pal.pd);
        root.style.setProperty('--secondary', pal.s);
        root.style.setProperty('--primary-glow', pal.glow);

        localStorage.setItem('lifeos-accent', finalAccent);
        document.querySelectorAll('.accent-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.accent === finalAccent);
        });
    }

    function applyScene(scene) {
        const VALID_SCENES = ['default', 'cyberpunk', 'aurora', 'gold', 'midnight', 'forest'];
        const finalScene = VALID_SCENES.includes(scene) ? scene : 'default';
        if (finalScene === 'default') {
            document.documentElement.removeAttribute('data-scene');
        } else {
            document.documentElement.setAttribute('data-scene', finalScene);
        }
        localStorage.setItem('lifeos-scene', finalScene);
        document.querySelectorAll('.scene-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.scene === finalScene);
        });
    }

    function initCursorReactiveBackground() {
        const updatePos = (x, y) => {
            document.documentElement.style.setProperty('--mx', `${x}px`);
            document.documentElement.style.setProperty('--my', `${y}px`);
        };

        updatePos(window.innerWidth / 2, window.innerHeight / 2);

        window.addEventListener('mousemove', (e) => {
            if (document.body.classList.contains('reduce-motion')) return;
            updatePos(e.clientX, e.clientY);
        }, { passive: true });
    }

    function initLiveClock() {
        const greetingEl = document.getElementById('live-greeting');
        const clockEl = document.getElementById('live-clock');
        if (!greetingEl || !clockEl) return;

        const update = () => {
            const now = new Date();
            const h = now.getHours();
            let greeting = 'Bonsoir';
            if (h >= 5 && h < 12) greeting = 'Bonjour';
            else if (h >= 12 && h < 18) greeting = 'Bon aprÃ¨s-midi';

            greetingEl.textContent = greeting;
            clockEl.textContent = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        };

        update();
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(update, 1000);
    }

    function initFocusMode() {
        const savedFocus = localStorage.getItem('lifeos-focus-mode') === '1';
        setFocusMode(savedFocus);
    }

    function setFocusMode(enabled) {
        document.body.classList.toggle('focus-mode', enabled);
        localStorage.setItem('lifeos-focus-mode', enabled ? '1' : '0');

        const fab = document.getElementById('fab-focus');
        if (fab) {
            fab.classList.toggle('active', enabled);
            const icon = fab.querySelector('i');
            if (icon) icon.className = enabled ? 'fas fa-compress-alt' : 'fas fa-expand-alt';
            fab.title = enabled ? 'Quitter le mode focus' : 'Mode focus';
        }
    }

    function toggleFocusMode() {
        setFocusMode(!document.body.classList.contains('focus-mode'));
    }

    function initQuickFabActions() {
        const fabTop = document.getElementById('fab-top');
        const fabFocus = document.getElementById('fab-focus');
        const fabCommand = document.getElementById('fab-command');
        const btnShortcuts = document.getElementById('btn-shortcuts');

        if (fabTop) {
            fabTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (fabFocus) {
            fabFocus.addEventListener('click', () => {
                toggleFocusMode();
            });
        }

        if (fabCommand) {
            fabCommand.addEventListener('click', () => openCommandPalette());
        }

        if (btnShortcuts) {
            btnShortcuts.addEventListener('click', () => openCommandPalette());
        }
    }

    function initViewCinematics() {
        const animateActiveView = () => {
            const activeView = document.querySelector('#main-content .view.active');
            if (!activeView) return;
            activeView.classList.remove('view-enter');
            void activeView.offsetWidth;
            activeView.classList.add('view-enter');
            setTimeout(() => activeView.classList.remove('view-enter'), 520);
        };

        // First paint animation
        setTimeout(animateActiveView, 120);

        // Animate when user navigates with sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => setTimeout(animateActiveView, 30));
        });

        // Animate when user navigates with contextual links
        document.addEventListener('click', (e) => {
            const navTrigger = e.target.closest('[data-nav]');
            if (navTrigger) setTimeout(animateActiveView, 30);
        });
    }

    function initDashboardWidgetDnD() {
        const grid = document.querySelector('#view-dashboard .stats-grid');
        if (!grid || widgetsDnDBound) return;
        widgetsDnDBound = true;

        const cards = [...grid.querySelectorAll('.stat-card')];
        cards.forEach(card => {
            const valueEl = card.querySelector('.stat-value');
            const key = valueEl?.id || Math.random().toString(36).slice(2);
            card.dataset.widgetKey = key;
            card.draggable = true;
            card.classList.add('widget-draggable');

            card.addEventListener('dragstart', (e) => {
                card.classList.add('widget-dragging');
                if (e.dataTransfer) e.dataTransfer.setData('text/plain', key);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('widget-dragging');
                persistWidgetOrder(grid);
            });
        });

        grid.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = grid.querySelector('.widget-dragging');
            if (!dragging) return;

            const afterElement = getDragAfterElement(grid, e.clientY, e.clientX);
            if (!afterElement) grid.appendChild(dragging);
            else grid.insertBefore(dragging, afterElement);
        });

        restoreWidgetOrder(grid);
    }

    function getDragAfterElement(container, y, x) {
        const elements = [...container.querySelectorAll('.stat-card:not(.widget-dragging)')];
        return elements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = (y - box.top - box.height / 2) + (x - box.left - box.width / 2) * 0.05;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    }

    function persistWidgetOrder(grid) {
        const order = [...grid.querySelectorAll('.stat-card')].map(card => card.dataset.widgetKey).filter(Boolean);
        localStorage.setItem('lifeos-widget-order', JSON.stringify(order));
    }

    function restoreWidgetOrder(grid) {
        try {
            const raw = localStorage.getItem('lifeos-widget-order');
            if (!raw) return;
            const order = JSON.parse(raw);
            if (!Array.isArray(order) || order.length === 0) return;

            const map = new Map([...grid.querySelectorAll('.stat-card')].map(card => [card.dataset.widgetKey, card]));
            order.forEach(key => {
                const card = map.get(key);
                if (card) grid.appendChild(card);
            });
        } catch {
            // ignore malformed storage
        }
    }

    function initGuidedTour() {
        const overlay = document.getElementById('tour-overlay');
        const btnNext = document.getElementById('tour-next');
        const btnPrev = document.getElementById('tour-prev');
        const btnSkip = document.getElementById('tour-skip');
        if (!overlay || !btnNext || !btnPrev || !btnSkip) return;

        const steps = [
            {
                selector: '#sidebar',
                title: 'Navigation principale',
                description: 'AccÃ©dez rapidement Ã  toutes les vues ici.'
            },
            {
                selector: '.topbar',
                title: 'ContrÃ´les rapides',
                description: 'Mois actif, thÃ¨me, style et actions instantanÃ©es.'
            },
            {
                selector: '#view-dashboard .stats-grid',
                title: 'Cartes de performance',
                description: 'Suivez revenus, dÃ©penses et solde en un coup d\'Å“il.'
            },
            {
                selector: '#quick-fab-dock',
                title: 'Dock intelligent',
                description: 'Palette de commandes, mode focus et retour en haut.'
            }
        ];

        let idx = 0;

        function openTour() {
            idx = 0;
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
            renderStep();
        }

        function closeTour(markDone = true) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
            clearHighlights();
            if (markDone) localStorage.setItem('lifeos-tour-done', '1');
        }

        function clearHighlights() {
            document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        }

        function renderStep() {
            const stepMeta = document.getElementById('tour-step');
            const stepTitle = document.getElementById('tour-title');
            const stepDesc = document.getElementById('tour-description');
            const target = document.querySelector(steps[idx].selector);

            if (stepMeta) stepMeta.textContent = `Ã‰tape ${idx + 1}/${steps.length}`;
            if (stepTitle) stepTitle.textContent = steps[idx].title;
            if (stepDesc) stepDesc.textContent = steps[idx].description;

            clearHighlights();
            if (target) {
                target.classList.add('tour-highlight');
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            btnPrev.disabled = idx === 0;
            btnNext.textContent = idx === steps.length - 1 ? 'Terminer' : 'Suivant';
        }

        btnNext.addEventListener('click', () => {
            if (idx >= steps.length - 1) {
                closeTour(true);
                return;
            }
            idx += 1;
            renderStep();
        });

        btnPrev.addEventListener('click', () => {
            idx = Math.max(0, idx - 1);
            renderStep();
        });

        btnSkip.addEventListener('click', () => closeTour(true));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeTour(false);
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                openTour();
            }
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeTour(false);
            }
        });

        const firstRunDone = localStorage.getItem('lifeos-tour-done') === '1';
        if (!firstRunDone) {
            setTimeout(openTour, 900);
        }
    }

    function initCommandPalette() {
        const modal = document.getElementById('modal-command');
        const searchInput = document.getElementById('command-search');
        const list = document.getElementById('command-list');
        if (!modal || !searchInput || !list) return;

        commandItems = [
            { icon: 'fa-chart-pie', title: 'Aller au Tableau de bord', subtitle: 'Vue globale', keywords: 'dashboard accueil', action: () => navTo('dashboard') },
            { icon: 'fa-bullseye', title: 'Aller au Budget', subtitle: 'Planification mensuelle', keywords: 'budget plan', action: () => navTo('budget') },
            { icon: 'fa-exchange-alt', title: 'Aller aux Transactions', subtitle: 'Historique complet', keywords: 'transactions mouvement', action: () => navTo('transactions') },
            { icon: 'fa-redo', title: 'Aller aux RÃ©currences', subtitle: 'Paiements automatiques', keywords: 'rÃ©currence recurring', action: () => navTo('recurring') },
            { icon: 'fa-tags', title: 'Aller aux CatÃ©gories', subtitle: 'Organisation des postes', keywords: 'categories tags', action: () => navTo('categories') },
            { icon: 'fa-flag-checkered', title: 'Aller aux Objectifs', subtitle: 'Suivi Ã©pargne', keywords: 'objectifs goals', action: () => navTo('goals') },
            { icon: 'fa-chart-bar', title: 'Aller aux Rapports', subtitle: 'Analyses annuelles', keywords: 'reports rapports analyse', action: () => navTo('reports') },
            { icon: 'fa-history', title: 'Aller au Journal d\'audit', subtitle: 'Historique des actions', keywords: 'audit journal', action: () => navTo('audit') },
            { icon: 'fa-plus', title: 'Ajouter une transaction', subtitle: 'Ouverture rapide du formulaire', keywords: 'nouvelle transaction add', action: () => clickById('btn-quick-add') },
            { icon: 'fa-moon', title: 'Changer de thÃ¨me', subtitle: 'Basculer clair / sombre', keywords: 'theme dark light', action: () => clickById('theme-toggle') },
            { icon: 'fa-expand-alt', title: 'Basculer mode focus', subtitle: 'Masquer / afficher la sidebar', keywords: 'focus zen', action: () => toggleFocusMode() },
            { icon: 'fa-bolt', title: 'ScÃ¨ne Cyberpunk', subtitle: 'Ambiance nÃ©on contrastÃ©e', keywords: 'scene cyberpunk neon', action: () => applyScene('cyberpunk') },
            { icon: 'fa-feather-pointed', title: 'ScÃ¨ne Aurora', subtitle: 'DÃ©gradÃ©s doux et modernes', keywords: 'scene aurora', action: () => applyScene('aurora') },
            { icon: 'fa-crown', title: 'ScÃ¨ne Gold', subtitle: 'Palette prestige chaude', keywords: 'scene gold premium', action: () => applyScene('gold') },
            { icon: 'fa-bolt', title: 'Basculer mode Ultra Premium', subtitle: 'Effets nÃ©on renforcÃ©s', keywords: 'neon ultra premium', action: () => toggleNeonMode() },
            { icon: 'fa-download', title: 'Exporter les donnÃ©es', subtitle: 'Backup JSON complet', keywords: 'export sauvegarde backup', action: () => clickById('btn-export-all') }
        ];

        renderCommandList('');

        searchInput.addEventListener('input', () => {
            renderCommandList(searchInput.value || '');
        });

        list.addEventListener('click', (e) => {
            const item = e.target.closest('.command-item');
            if (!item) return;
            const idx = Number(item.dataset.index || '-1');
            if (idx >= 0 && commandFiltered[idx]) {
                commandFiltered[idx].action();
                closeCommandPalette();
            }
        });

        document.addEventListener('keydown', (e) => {
            const isOpen = modal.classList.contains('active');

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (isOpen) closeCommandPalette();
                else openCommandPalette();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
                if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
                e.preventDefault();
                toggleFocusMode();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
                e.preventDefault();
                toggleNeonMode();
                return;
            }

            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                commandActiveIndex = Math.min(commandActiveIndex + 1, commandFiltered.length - 1);
                highlightActiveCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                commandActiveIndex = Math.max(commandActiveIndex - 1, 0);
                highlightActiveCommand();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (commandFiltered[commandActiveIndex]) {
                    commandFiltered[commandActiveIndex].action();
                    closeCommandPalette();
                }
            }
        });
    }

    function renderCommandList(filterText) {
        const list = document.getElementById('command-list');
        if (!list) return;

        const query = (filterText || '').trim().toLowerCase();
        commandFiltered = commandItems.filter(item => {
            if (!query) return true;
            const hay = `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase();
            return hay.includes(query);
        });

        if (commandFiltered.length === 0) {
            list.innerHTML = '<div class="command-empty">Aucune commande trouvÃ©e.</div>';
            commandActiveIndex = 0;
            return;
        }

        commandActiveIndex = 0;
        list.innerHTML = commandFiltered.map((item, idx) => `
            <button type="button" class="command-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                <span class="command-icon"><i class="fas ${item.icon}"></i></span>
                <span class="command-text">
                    <span class="command-title">${item.title}</span>
                    <span class="command-subtitle">${item.subtitle}</span>
                </span>
            </button>
        `).join('');
    }

    function highlightActiveCommand() {
        const list = document.getElementById('command-list');
        if (!list) return;
        const buttons = list.querySelectorAll('.command-item');
        buttons.forEach((btn, idx) => {
            btn.classList.toggle('active', idx === commandActiveIndex);
            if (idx === commandActiveIndex) {
                btn.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function openCommandPalette() {
        const modal = document.getElementById('modal-command');
        const searchInput = document.getElementById('command-search');
        if (!modal || !searchInput) return;
        modal.classList.add('active');
        renderCommandList('');
        searchInput.value = '';
        setTimeout(() => searchInput.focus(), 0);
    }

    function closeCommandPalette() {
        const modal = document.getElementById('modal-command');
        if (modal) modal.classList.remove('active');
    }

    function navTo(view) {
        const navItem = document.querySelector(`.nav-item[data-view="${view}"]`);
        if (navItem) navItem.click();
    }

    function clickById(id) {
        const el = document.getElementById(id);
        if (el) el.click();
    }

    function toggleNeonMode() {
        const enabled = !document.body.classList.contains('neon-mode');
        document.body.classList.toggle('neon-mode', enabled);
        localStorage.setItem('lifeos-neon', enabled ? '1' : '0');
        const toggleNeon = document.getElementById('toggle-neon');
        if (toggleNeon) toggleNeon.checked = enabled;
    }

    /* --- Notification Center (delegates to Notifications module) --- */
    function initNotificationCenter() {
        // Notifications module handles its own panel binding via Notifications.init()
        // This is now a no-op; kept for backward-compatibility with the init chain.
    }

    function addNotification(type, title, desc) {
        if (typeof Notifications !== 'undefined' && Notifications.push) {
            Notifications.push(type, title, desc);
        } else {
            console.warn('[Theme] Notifications module not loaded, notification lost:', title);
        }
    }
    /* â”€â”€â”€ Keyboard Shortcuts Modal â”€â”€â”€ */
    function initKeyboardShortcutsModal() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                const modal = document.getElementById('modal-shortcuts');
                if (modal) {
                    modal.classList.toggle('active');
                }
            }
        });
    }

    /* â”€â”€â”€ Health Score Animation â”€â”€â”€ */
    function animateHealthScore(score) {
        const ring = document.getElementById('health-ring-fill');
        const num = document.getElementById('health-score-num');
        if (!ring || !num) return;

        const circumference = 2 * Math.PI * 52;
        const clampedScore = Math.max(0, Math.min(100, score));
        const offset = circumference - (clampedScore / 100) * circumference;

        // Color based on score
        let color = '#E11D48';
        if (clampedScore >= 80) color = '#10B981';
        else if (clampedScore >= 60) color = '#14B8A6';
        else if (clampedScore >= 40) color = '#F59E0B';

        ring.style.stroke = color;
        ring.style.filter = `drop-shadow(0 0 8px ${color}50)`;

        // Animate
        requestAnimationFrame(() => {
            ring.style.strokeDashoffset = offset;
        });

        // Animate number
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            num.textContent = Math.round(eased * clampedScore);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* â”€â”€â”€ Public API â”€â”€â”€ */
    function init() {
        initTheme();
        if (!appEffectsInitialized) {
            appEffectsInitialized = true;
            initParticles();
            initScrollAnimations();
            initMicroInteractions();
            initProductivityFeatures();
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('lifeos-theme', theme);
        updateChartColors(theme);
    }

    // Auto-init auth particles on page load
    document.addEventListener('DOMContentLoaded', () => {
        initAuthParticles();
        initTheme();
    });

    return {
        init,
        animateCounters,
        launchConfetti,
        applyTheme,
        stopAuthParticles,
        addNotification,
        animateHealthScore
    };
})();
