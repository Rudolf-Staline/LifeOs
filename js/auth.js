/* ===================================================================
   auth.js — Authentication Module (Supabase Auth)
   Handles login, register, password reset, session management.
   On successful auth, calls global AppInit().
   =================================================================== */

const Auth = (() => {
    let currentUser = null;

    // -------- Init --------
    async function init() {
        bindForms();

        // Vérifier que Supabase est correctement initialisé
        if (!supabaseClient || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
            showAuth();
            showMessage('Erreur de configuration Supabase. Vérifiez vos clés dans supabase-config.js.', 'error');
            return;
        }

        // Check existing session
        let session = null;
        try {
            const resp = await supabaseClient.auth.getSession();
            session = resp.data?.session;
        } catch (e) {
            console.error('[Auth] getSession failed:', e);
        }

        if (session) {
            currentUser = session.user;
            showApp();
            return;
        }

        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                currentUser = session.user;
                showApp();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                showAuth();
            }
        });

        showAuth();
    }

    // -------- Show / Hide --------
    function showAuth() {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('app-shell').style.display = 'none';
        switchTab('login');
        clearMessage();
    }

    function showApp() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-shell').style.display = 'flex';
        // Stop auth particles to save resources
        if (typeof Theme !== 'undefined' && Theme.stopAuthParticles) {
            Theme.stopAuthParticles();
        }
        // Call global AppInit (defined in app.js)
        if (typeof AppInit === 'function') AppInit();
    }

    // -------- Tab Switching --------
    function switchTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

        const tabEl = document.querySelector(`.auth-tab[data-tab="${tab}"]`);
        if (tabEl) tabEl.classList.add('active');

        const formEl = document.getElementById(`${tab}-form`);
        if (formEl) formEl.classList.add('active');

        clearMessage();
    }

    // -------- Message Display --------
    function showMessage(msg, type) {
        const el = document.getElementById('auth-message');
        if (!el) return;
        el.textContent = msg;
        el.className = `auth-message ${type}`;
    }

    function clearMessage() {
        const el = document.getElementById('auth-message');
        if (el) {
            el.textContent = '';
            el.className = 'auth-message';
        }
    }

    // -------- Loading State --------
    function setLoading(formId, loading) {
        const btn = document.querySelector(`#${formId} button[type="submit"]`);
        if (!btn) return;
        if (loading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
            btn.disabled = false;
        }
    }

    // -------- Bind Forms & Events --------
    function bindForms() {
        // Tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        // Forgot password link
        const forgotLink = document.getElementById('forgot-password-link');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                switchTab('reset');
            });
        }

        // Back to login link
        const backLink = document.getElementById('back-to-login-link');
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                switchTab('login');
            });
        }

        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearMessage();
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value;

                if (!email || !password) {
                    showMessage('Veuillez remplir tous les champs.', 'error');
                    return;
                }

                setLoading('login-form', true);
                let data, error;
                try {
                    const resp = await supabaseClient.auth.signInWithPassword({ email, password });
                    data = resp.data;
                    error = resp.error;
                } catch (e) {
                    setLoading('login-form', false);
                    console.error('[Auth] signIn exception:', e);
                    showMessage('Impossible de contacter le serveur. Vérifiez votre connexion internet.', 'error');
                    return;
                }
                setLoading('login-form', false);

                if (error) {
                    const messages = {
                        'Invalid login credentials': 'Email ou mot de passe incorrect.',
                        'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter.',
                    };
                    showMessage(messages[error.message] || `Erreur : ${error.message}`, 'error');
                    return;
                }

                currentUser = data.user;
                showApp();
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearMessage();
                const fullName = document.getElementById('register-name').value.trim();
                const email = document.getElementById('register-email').value.trim();
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-password-confirm').value;

                if (!fullName || !email || !password) {
                    showMessage('Veuillez remplir tous les champs.', 'error');
                    return;
                }

                if (password !== confirmPassword) {
                    showMessage('Les mots de passe ne correspondent pas.', 'error');
                    return;
                }

                if (password.length < 6) {
                    showMessage('Le mot de passe doit contenir au moins 6 caractères.', 'error');
                    return;
                }

                setLoading('register-form', true);
                let data, error;
                try {
                    const resp = await supabaseClient.auth.signUp({
                        email,
                        password,
                        options: { data: { full_name: fullName } }
                    });
                    data = resp.data;
                    error = resp.error;
                } catch (e) {
                    setLoading('register-form', false);
                    console.error('[Auth] signUp exception:', e);
                    showMessage('Impossible de contacter le serveur. Vérifiez votre connexion internet.', 'error');
                    return;
                }
                setLoading('register-form', false);

                if (error) {
                    const messages = {
                        'User already registered': 'Cet email est déjà utilisé.',
                        'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
                        'Signups not allowed for this instance': 'Les inscriptions sont désactivées sur ce projet Supabase.',
                    };
                    showMessage(messages[error.message] || `Erreur : ${error.message}`, 'error');
                    return;
                }

                if (data.user && !data.session) {
                    showMessage('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.', 'success');
                    switchTab('login');
                } else if (data.session) {
                    currentUser = data.user;
                    showApp();
                }
            });
        }

        // Reset password form
        const resetForm = document.getElementById('reset-form');
        if (resetForm) {
            resetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearMessage();
                const email = document.getElementById('reset-email').value.trim();

                if (!email) {
                    showMessage('Veuillez entrer votre email.', 'error');
                    return;
                }

                setLoading('reset-form', true);
                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + window.location.pathname
                });
                setLoading('reset-form', false);

                if (error) {
                    showMessage(`Erreur : ${error.message}`, 'error');
                    return;
                }

                showMessage('Un email de réinitialisation a été envoyé.', 'success');
            });
        }
    }

    // -------- Logout --------
    async function logout() {
        await supabaseClient.auth.signOut();
        currentUser = null;
        showAuth();
    }

    // -------- Getters --------
    function getUser() { return currentUser; }
    function getUserId() { return currentUser?.id; }
    function isLoggedIn() { return !!currentUser; }

    return {
        init,
        logout,
        switchTab,
        getUser,
        getUserId,
        isLoggedIn
    };
})();

// -------- Start auth on page load --------
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
