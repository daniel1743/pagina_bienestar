import { getPublishedArticlesForSitemap } from '@/lib/article-repository';
import { site } from '@/lib/site';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

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

const esc = (value: unknown) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toIso = (value?: string | null) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

export async function GET() {
  const now = new Date().toISOString();
  const staticUrls = STATIC_PATHS.map((path, index) => ({
    loc: `${site.defaultUrl}${path}`,
    lastmod: now,
    changefreq: path === '/' ? 'daily' : 'weekly',
    priority: index === 0 ? '1.0' : '0.7',
  }));

  let articleUrls: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }> = [];

  try {
    const articleRows = await getPublishedArticlesForSitemap();
    articleUrls = articleRows.map((item) => ({
      loc: `${site.defaultUrl}/articulos/${item.slug}`,
      lastmod: toIso(item.updated_at || item.published_at || item.created_at),
      changefreq: 'weekly',
      priority: '0.8',
    }));
  } catch {
    articleUrls = [];
  }

  const combined = [...staticUrls, ...articleUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${combined
  .map(
    (item) => `  <url>
    <loc>${esc(item.loc)}</loc>
    <lastmod>${esc(item.lastmod)}</lastmod>
    <changefreq>${esc(item.changefreq)}</changefreq>
    <priority>${esc(item.priority)}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
      'X-Sitemap-Mode': 'full',
    },
  });
}
