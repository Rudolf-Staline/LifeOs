/* ===================================================================
   supabase-config.js — Supabase Client Initialization
   ===================================================================
   Priorité : .env (si chargé via serveur local) → valeurs par défaut.
   La clé anon est publique (envoyée au navigateur), pas un secret.
   =================================================================== */

// Valeurs par défaut (utilisées si .env n'est pas chargé, ex: protocole file://)
const _DEFAULT_URL  = 'https://pkiyguggkyyhnctjyume.supabase.co';
const _DEFAULT_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraXlndWdna3l5aG5jdGp5dW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzA4ODQsImV4cCI6MjA4NzE0Njg4NH0.zLGcktQSW21yW6wfeHr-UvS1cUJk-WjyO1SE1b6syc8';

const SUPABASE_URL      = (typeof ENV !== 'undefined' && ENV.SUPABASE_URL)      || _DEFAULT_URL;
const SUPABASE_ANON_KEY = (typeof ENV !== 'undefined' && ENV.SUPABASE_ANON_KEY) || _DEFAULT_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('⚠️ Configuration Supabase manquante.');
}

// Initialisation du client Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.info(`[Supabase] Client initialisé → ${SUPABASE_URL.replace('https://', '').split('.')[0]}`);
