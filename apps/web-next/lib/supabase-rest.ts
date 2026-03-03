const DEFAULT_SUPABASE_URL = 'https://kuacuriiueaxjzzgmqtu.supabase.co';

const clean = (value: unknown) => String(value || '').trim();

const validSupabaseUrl = (value: string) =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value) && !value.includes('tu-proyecto.supabase.co');

const envUrl = clean(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
);
export const supabaseUrl = validSupabaseUrl(envUrl) ? envUrl : DEFAULT_SUPABASE_URL;

const keyCandidates = Array.from(
  new Set(
    [
      clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      clean(process.env.SUPABASE_ANON_KEY),
      clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      clean(process.env.VITE_SUPABASE_ANON_KEY),
    ].filter(Boolean),
  ),
);

const defaultFetchHeaders = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
});

export const fetchSupabaseRest = async <T>(pathAndQuery: string): Promise<T[]> => {
  if (!keyCandidates.length) {
    throw new Error('Missing SUPABASE keys for server-side fetch');
  }

  let lastError: unknown = null;
  const url = `${supabaseUrl}${pathAndQuery}`;

  for (const key of keyCandidates) {
    const response = await fetch(url, {
      headers: defaultFetchHeaders(key),
      next: { revalidate: 300 },
    });
    const raw = await response.text();
    if (!response.ok) {
      lastError = new Error(`Supabase REST ${response.status}: ${raw.slice(0, 300)}`);
      continue;
    }

    try {
      return JSON.parse(raw) as T[];
    } catch (error) {
      lastError = error;
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('Unknown Supabase REST error'));
};
