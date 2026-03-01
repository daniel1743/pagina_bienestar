import { createClient } from '@supabase/supabase-js';
import { LOCAL_PUBLISHED_ARTICLES } from '../src/content/localPublishedArticles.js';

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWN1cmlpdWVheGp6emdtcXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg0ODUsImV4cCI6MjA4NzE4NDQ4NX0.fkJIFamjrZOPJ5wHmz204MMlJMnEMKGd87XyCoQcaMI';

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

const PUBLISHED_STATUS_VALUES = ['published', 'publicado', 'active'];

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
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let rows = [];
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug,created_at,updated_at,published_at,status,no_index')
      .limit(5000);
    if (error) throw error;
    rows = (data || []).filter((item) => {
      const status = String(item?.status || '').toLowerCase();
      return PUBLISHED_STATUS_VALUES.includes(status) && !item?.no_index;
    });
  } catch (error) {
    console.error('[sitemap] primary query failed', error);
    const { data, error: fallbackError } = await supabase
      .from('articles')
      .select('slug,created_at,updated_at,published_at,no_index')
      .not('published_at', 'is', null)
      .limit(5000);
    if (fallbackError) {
      console.error('[sitemap] fallback query failed', fallbackError);
      throw fallbackError;
    }
    rows = (data || []).filter((item) => item?.published_at && !item?.no_index);
  }

  return rows
    .filter((item) => item?.slug)
    .sort((a, b) => {
      const aDate = new Date(a.updated_at || a.published_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.published_at || b.created_at || 0).getTime();
      return bDate - aDate;
    })
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
      console.error('[sitemap] unable to load remote articles', remoteError);
    }

    const uniqueByLoc = new Map();
    [...staticUrls, ...localArticleUrls, ...remoteArticleUrls].forEach((item) => {
      if (!item?.loc) return;
      uniqueByLoc.set(item.loc, item);
    });

    const xml = buildSitemapXml(Array.from(uniqueByLoc.values()));
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=0, must-revalidate');
    res.setHeader('X-Sitemap-Mode', sitemapMode);
    return res.status(200).send(xml);
  } catch (error) {
    console.error('[sitemap] fatal handler error', error);
    const fallbackXml = buildSitemapXml(
      STATIC_PATHS.map((route, index) => ({
        loc: `${SITE_URL}${route}`,
        lastmod: new Date().toISOString(),
        changefreq: route === '/' ? 'daily' : 'weekly',
        priority: index === 0 ? '1.0' : '0.7',
      })),
    );
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=0, must-revalidate');
    res.setHeader('X-Sitemap-Mode', 'fallback');
    return res.status(200).send(fallbackXml);
  }
}
