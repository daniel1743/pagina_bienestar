import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWN1cmlpdWVheGp6emdtcXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg0ODUsImV4cCI6MjA4NzE4NDQ4NX0.fkJIFamjrZOPJ5wHmz204MMlJMnEMKGd87XyCoQcaMI';

const cleanEnvValue = (value) => String(value || '').trim();
const isValidSupabaseUrl = (value) =>
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value) && !value.includes('tu-proyecto.supabase.co');
const isValidAnonKey = (value) =>
    value.length > 40 && !value.includes('tu_supabase_anon_key') && !value.includes('xxxxxxxx');

const envUrl = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL);
const envAnon = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY);

const supabaseUrl = isValidSupabaseUrl(envUrl) ? envUrl : DEFAULT_SUPABASE_URL;
const supabaseAnonKey = isValidAnonKey(envAnon) ? envAnon : DEFAULT_SUPABASE_ANON_KEY;
const AUTH_STORAGE_KEY = 'sb-kuacuriiueaxjzzgmqtu-auth-token';
const REMEMBER_SESSION_KEY = 'remember_session';

const getRememberSession = () => {
    if (typeof window === 'undefined') return true;
    const raw = window.localStorage.getItem(REMEMBER_SESSION_KEY);
    return raw === null ? true : raw === '1';
};

const migrateTokenStorage = (remember) => {
    if (typeof window === 'undefined') return;
    const from = remember ? window.sessionStorage : window.localStorage;
    const to = remember ? window.localStorage : window.sessionStorage;
    const token = from.getItem(AUTH_STORAGE_KEY);
    if (token) {
        to.setItem(AUTH_STORAGE_KEY, token);
        from.removeItem(AUTH_STORAGE_KEY);
    }
};

const setRememberSession = (remember) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(REMEMBER_SESSION_KEY, remember ? '1' : '0');
    } catch {
        // Ignore local storage quota errors; auth storage fallback still works.
    }
    migrateTokenStorage(remember);
};

const dynamicAuthStorage = {
    getItem: (key) => {
        if (typeof window === 'undefined') return null;
        const remember = getRememberSession();
        const primary = remember ? window.localStorage : window.sessionStorage;
        const secondary = remember ? window.sessionStorage : window.localStorage;
        return primary.getItem(key) ?? secondary.getItem(key);
    },
    setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        const remember = getRememberSession();
        try {
            if (remember) {
                window.localStorage.setItem(key, value);
                window.sessionStorage.removeItem(key);
                return;
            }
            window.sessionStorage.setItem(key, value);
            window.localStorage.removeItem(key);
        } catch {
            try {
                window.sessionStorage.setItem(key, value);
            } catch {
                // Ignore hard storage failures to avoid app crash loops.
            }
        }
    },
    removeItem: (key) => {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
    },
};

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: AUTH_STORAGE_KEY,
        storage: dynamicAuthStorage,
    },
});

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
    getRememberSession,
    setRememberSession,
};
