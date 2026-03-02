import { LOCAL_PUBLISHED_ARTICLES } from '../src/content/localPublishedArticles.js';

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, '');
const DEFAULT_SUPABASE_URL = 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWN1cmlpdWVheGp6emdtcXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg0ODUsImV4cCI6MjA4NzE4NDQ4NX0.fkJIFamjrZOPJ5wHmz204MMlJMnEMKGd87XyCoQcaMI';

const cleanEnvValue = (value) => String(value || '').trim();
const isValidSupabaseProjectUrl = (value) =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value) && !value.includes('tu-proyecto.supabase.co');

const envSupabaseUrl = cleanEnvValue(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
const SUPABASE_URL = isValidSupabaseProjectUrl(envSupabaseUrl) ? envSupabaseUrl : DEFAULT_SUPABASE_URL;

const KEY_CANDIDATES = Array.from(
  new Set(
    [
      cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
      cleanEnvValue(process.env.SUPABASE_ANON_KEY),
      cleanEnvValue(process.env.VITE_SUPABASE_ANON_KEY),
      DEFAULT_SUPABASE_ANON_KEY,
    ].filter(Boolean),
  ),
);

const STATIC_PATHS = [
  '/',
  '/empieza-aqui',
  '/articulos',
  '/comunidad',
  '/sobre-mi',
  '/aviso-medico',
  '/politica-privacidad',
  '/terminos',
];

const PRIMARY_PUBLISHED_STATUS = 'published';
const LEGACY_PUBLISHED_STATUS_VALUES = ['published', 'publicado', 'active'];

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toIsoDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};
const contentDate = (value) => new Date(value?.updated_at || value?.published_at || value?.created_at || 0).getTime();

const buildArticlesRestUrl = ({ statuses = [], onlyIndexable = true }) => {
  const url = new URL('/rest/v1/articles', SUPABASE_URL);
  url.searchParams.set('select', 'slug,created_at,updated_at,published_at,status,no_index');
  url.searchParams.set('slug', 'not.is.null');
  url.searchParams.set('limit', '5000');
  if (statuses.length === 1) {
    url.searchParams.set('status', `eq.${statuses[0]}`);
  } else if (statuses.length > 1) {
    url.searchParams.set('status', `in.(${statuses.join(',')})`);
  }
  if (onlyIndexable) {
    url.searchParams.set('no_index', 'eq.false');
  } else {
    url.searchParams.set('no_index', 'neq.true');
  }
  return url.toString();
};

const fetchArticlesViaRest = async (url) => {
  let lastError = null;
  for (const key of KEY_CANDIDATES) {
    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
    };
    const response = await fetch(url, { headers });
    const body = await response.text();
    if (!response.ok) {
      lastError = new Error(`[${response.status}] ${body.slice(0, 400)}`);
      continue;
    }
    try {
      return JSON.parse(body);
    } catch {
      lastError = new Error(`Invalid JSON from Supabase REST: ${body.slice(0, 200)}`);
    }
  }
  throw lastError || new Error('No Supabase key candidates available for sitemap query');
};

const buildSitemapXml = (urls) => {
  const nodes = urls
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(toIsoDate(item.lastmod))}</lastmod>
    <changefreq>${escapeXml(item.changefreq || 'weekly')}</changefreq>
    <priority>${escapeXml(item.priority || '0.6')}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes}
</urlset>
`;
};

const fetchPublishedArticles = async () => {
  if (!SUPABASE_URL || KEY_CANDIDATES.length === 0) return [];

  let rows = [];
  try {
    rows = await fetchArticlesViaRest(
      buildArticlesRestUrl({
        statuses: [PRIMARY_PUBLISHED_STATUS],
        onlyIndexable: true,
      }),
    );
  } catch (error) {
    console.error('[sitemap] primary query failed', {
      message: error?.message || String(error),
      code: error?.code || '',
      hint: error?.hint || '',
    });
    try {
      rows = await fetchArticlesViaRest(
        buildArticlesRestUrl({
          statuses: LEGACY_PUBLISHED_STATUS_VALUES,
          onlyIndexable: false,
        }),
      );
    } catch (fallbackError) {
      console.error('[sitemap] fallback query failed', {
        message: fallbackError?.message || String(fallbackError),
        code: fallbackError?.code || '',
        hint: fallbackError?.hint || '',
      });
      throw fallbackError;
    }
  }

  return rows
    .filter((item) => item?.slug)
    .sort((a, b) => contentDate(b) - contentDate(a))
    .map((item) => ({
      loc: `${SITE_URL}/articulos/${item.slug}`,
      lastmod: item.updated_at || item.published_at || item.created_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    }));
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const staticUrls = STATIC_PATHS.map((route, index) => ({
      loc: `${SITE_URL}${route}`,
      lastmod: new Date().toISOString(),
      changefreq: route === '/' ? 'daily' : 'weekly',
      priority: index === 0 ? '1.0' : '0.7',
    }));

    const localArticleUrls = LOCAL_PUBLISHED_ARTICLES
      .filter((item) => !item?.no_index)
      .map((item) => ({
      loc: `${SITE_URL}/articulos/${item.slug}`,
      lastmod: item.updated_at || item.published_at || item.created_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    }));

    let sitemapMode = 'full';
    let remoteArticleUrls = [];
    try {
      remoteArticleUrls = await fetchPublishedArticles();
    } catch (remoteError) {
      sitemapMode = 'fallback';
      console.error('[sitemap] unable to load remote articles', {
        message: remoteError?.message || String(remoteError),
      });
    }

    const uniqueByLoc = new Map();
    [...staticUrls, ...localArticleUrls, ...remoteArticleUrls].forEach((item) => {
      if (!item?.loc) return;
      uniqueByLoc.set(item.loc, item);
    });

    const xml = buildSitemapXml(Array.from(uniqueByLoc.values()));
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      sitemapMode === 'full'
        ? 'public, max-age=0, s-maxage=60, must-revalidate'
        : 'no-store',
    );
    res.setHeader('X-Sitemap-Mode', sitemapMode);
    return res.status(200).send(xml);
  } catch (error) {
    console.error('[sitemap] fatal handler error', {
      message: error?.message || String(error),
      code: error?.code || '',
      hint: error?.hint || '',
    });
    const fallbackXml = buildSitemapXml(
      STATIC_PATHS.map((route, index) => ({
        loc: `${SITE_URL}${route}`,
        lastmod: new Date().toISOString(),
        changefreq: route === '/' ? 'daily' : 'weekly',
        priority: index === 0 ? '1.0' : '0.7',
      })),
    );
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Sitemap-Mode', 'fallback');
    return res.status(200).send(fallbackXml);
  }
}
