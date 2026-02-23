import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWN1cmlpdWVheGp6emdtcXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg0ODUsImV4cCI6MjA4NzE4NDQ4NX0.fkJIFamjrZOPJ5wHmz204MMlJMnEMKGd87XyCoQcaMI';
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
    window.localStorage.setItem(REMEMBER_SESSION_KEY, remember ? '1' : '0');
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
        if (remember) {
            window.localStorage.setItem(key, value);
            window.sessionStorage.removeItem(key);
        } else {
            window.sessionStorage.setItem(key, value);
            window.localStorage.removeItem(key);
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
