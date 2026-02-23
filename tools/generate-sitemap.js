import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { LOCAL_PUBLISHED_ARTICLES } from '../src/content/localPublishedArticles.js';

const loadDotEnv = () => {
  const envFiles = ['.env', '.env.local'];
  envFiles.forEach((filename) => {
    const envPath = path.join(process.cwd(), filename);
    if (!fsSync.existsSync(envPath)) return;
    const content = fsSync.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex <= 0) return;
      const key = trimmed.slice(0, equalIndex).trim();
      const rawValue = trimmed.slice(equalIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    });
  });
};

loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWN1cmlpdWVheGp6emdtcXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg0ODUsImV4cCI6MjA4NzE4NDQ4NX0.fkJIFamjrZOPJ5wHmz204MMlJMnEMKGd87XyCoQcaMI';
const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://chactivo.com').replace(/\/$/, '');

const staticPaths = [
  '/',
  '/empieza-aqui',
  '/articulos',
  '/comunidad',
  '/sobre-mi',
  '/aviso-medico',
  '/politica-privacidad',
  '/terminos',
];

const localArticlePaths = LOCAL_PUBLISHED_ARTICLES.map((item) => `/articulos/${item.slug}`);

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const formatIsoDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

const buildSitemapXml = (urls) => {
  const nodes = urls
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(formatIsoDate(item.lastmod))}</lastmod>
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
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let rows = [];
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug,created_at,published_at,status')
      .limit(5000);
    if (error) throw error;
    rows = data || [];
    rows = rows.filter((item) => {
      const status = String(item?.status || '').toLowerCase();
      return ['published', 'publicado', 'active'].includes(status);
    });
  } catch {
    const { data, error } = await supabase
      .from('articles')
      .select('slug,created_at,published_at')
      .not('published_at', 'is', null)
      .limit(5000);
    if (error) throw error;
    rows = data || [];
    rows = rows.filter((item) => item?.published_at);
  }

  if (!Array.isArray(rows)) return [];
  return rows
    .filter((item) => item?.slug)
    .sort((a, b) => {
      const aDate = new Date(a.created_at || a.published_at || 0).getTime();
      const bDate = new Date(b.created_at || b.published_at || 0).getTime();
      return bDate - aDate;
    })
    .map((item) => ({
      loc: `${SITE_URL}/articulos/${item.slug}`,
      lastmod: item.created_at || item.published_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8',
    }));
};

const run = async () => {
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  const robotsPath = path.join(publicDir, 'robots.txt');
  await fs.mkdir(publicDir, { recursive: true });

  let articleUrls = [];
  try {
    articleUrls = await fetchPublishedArticles();
    console.log(`[sitemap] Artículos publicados detectados: ${articleUrls.length}`);
  } catch (error) {
    console.warn(`[sitemap] Fallback a páginas estáticas: ${error.message}`);
  }

  const staticUrls = staticPaths.map((route, index) => ({
    loc: `${SITE_URL}${route}`,
    lastmod: new Date().toISOString(),
    changefreq: route === '/' ? 'daily' : 'weekly',
    priority: index === 0 ? '1.0' : '0.7',
  }));

  const localArticleUrls = localArticlePaths.map((route) => ({
    loc: `${SITE_URL}${route}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const uniqueByLoc = new Map();
  [...staticUrls, ...localArticleUrls, ...articleUrls].forEach((item) => {
    if (!item?.loc) return;
    uniqueByLoc.set(item.loc, item);
  });

  const allUrls = Array.from(uniqueByLoc.values());
  const xml = buildSitemapXml(allUrls);
  await fs.writeFile(sitemapPath, xml, 'utf8');

  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  await fs.writeFile(robotsPath, robots, 'utf8');
  console.log('[sitemap] sitemap.xml y robots.txt actualizados.');
};

run().catch((error) => {
  console.error(`[sitemap] Error no controlado: ${error.message}`);
  process.exitCode = 0;
});
