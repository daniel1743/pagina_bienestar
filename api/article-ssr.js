import { getLocalPublishedArticleBySlug } from '../src/content/localPublishedArticles.js';

const SITE_URL = String(process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, '');
const SITE_NAME = 'Bienestar en Claro';
const DEFAULT_SUPABASE_URL = 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWN1cmlpdWVheGp6emdtcXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg0ODUsImV4cCI6MjA4NzE4NDQ4NX0.fkJIFamjrZOPJ5wHmz204MMlJMnEMKGd87XyCoQcaMI';
const PUBLISHED_STATUS_VALUES = ['published', 'publicado', 'active'];

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

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const normalizePublicUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return `${SITE_URL}${raw}`;
  return `${SITE_URL}/${raw.replace(/^\//, '')}`;
};

const canonicalFromArticle = (article, slug) => {
  const raw = String(article?.canonical_url || '').trim();
  if (!raw) return `${SITE_URL}/articulos/${slug}`;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return `${SITE_URL}${raw}`;
  return `https://${raw}`;
};

const stripExistingSeoTags = (html) =>
  String(html || '')
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta[^>]+name=["']description["'][^>]*>/gi, '')
    .replace(/<meta[^>]+name=["']robots["'][^>]*>/gi, '')
    .replace(/<meta[^>]+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta[^>]+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

const seoTagsForArticle = (article, slug) => {
  const title = article?.meta_title || `${article?.title || SITE_NAME} - ${SITE_NAME}`;
  const description =
    String(article?.meta_description || article?.excerpt || 'Información clara basada en evidencia para cuidar tu salud y bienestar.')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 170);
  const canonical = canonicalFromArticle(article, slug);
  const robots = article?.no_index ? 'noindex, nofollow' : 'index, follow';
  const imageUrl = normalizePublicUrl(article?.image_url || '/branding/logo-horizontal.png');
  const publishedAt = article?.published_at || article?.created_at || new Date().toISOString();
  const updatedAt = article?.updated_at || article?.published_at || article?.created_at || new Date().toISOString();
  const authorName = article?.author || SITE_NAME;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: String(article?.title || SITE_NAME).slice(0, 180),
    description,
    image: [imageUrl],
    datePublished: new Date(publishedAt).toISOString(),
    dateModified: new Date(updatedAt).toISOString(),
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/branding/logo-horizontal.png` },
    },
    mainEntityOfPage: canonical,
    articleSection: article?.category || 'Bienestar',
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Artículos', item: `${SITE_URL}/articulos` },
      { '@type': 'ListItem', position: 3, name: article?.title || slug, item: canonical },
    ],
  };

  return {
    title,
    description,
    canonical,
    robots,
    imageUrl,
    jsonLdScripts: [
      JSON.stringify(articleJsonLd).replace(/</g, '\\u003c'),
      JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
    ],
  };
};

const buildOrigin = (req) => {
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (!host) return SITE_URL;
  return `${proto}://${host}`;
};

const fetchShellHtml = async (origin) => {
  const candidates = [`${origin}/`, `${SITE_URL}/`];
  for (const candidate of candidates) {
    try {
      const response = await fetch(`${candidate}${candidate.includes('?') ? '&' : '?'}ssr_shell=1`, {
        redirect: 'follow',
        headers: { 'User-Agent': 'bec-article-ssr/1.0' },
      });
      if (!response.ok) continue;
      const html = await response.text();
      if (/<head[\s>]/i.test(html) && /<body[\s>]/i.test(html)) return html;
    } catch {
      // continue with next candidate
    }
  }
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${SITE_NAME}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
};

const injectSeoInShell = (shellHtml, seo, article) => {
  const cleaned = stripExistingSeoTags(shellHtml);
  const seoBlock = `
<title>${escapeHtml(seo.title)}</title>
<meta name="description" content="${escapeHtml(seo.description)}" />
<link rel="canonical" href="${escapeHtml(seo.canonical)}" />
<meta name="robots" content="${escapeHtml(seo.robots)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
<meta property="og:title" content="${escapeHtml(seo.title)}" />
<meta property="og:description" content="${escapeHtml(seo.description)}" />
<meta property="og:url" content="${escapeHtml(seo.canonical)}" />
<meta property="og:image" content="${escapeHtml(seo.imageUrl)}" />
<meta name="twitter:card" content="${seo.imageUrl ? 'summary_large_image' : 'summary'}" />
<meta name="twitter:title" content="${escapeHtml(seo.title)}" />
<meta name="twitter:description" content="${escapeHtml(seo.description)}" />
<meta name="twitter:image" content="${escapeHtml(seo.imageUrl)}" />
<script type="application/ld+json">${seo.jsonLdScripts[0]}</script>
<script type="application/ld+json">${seo.jsonLdScripts[1]}</script>
`;
  const withSeo = /<\/head>/i.test(cleaned)
    ? cleaned.replace(/<\/head>/i, `${seoBlock}\n</head>`)
    : `${cleaned}\n${seoBlock}`;

  const fallbackArticle = `
<article id="ssr-article-fallback" style="max-width:850px;margin:40px auto;padding:0 16px;font-family:Georgia,serif;">
  <h1 style="font-size:2rem;line-height:1.2;margin-bottom:12px;">${escapeHtml(article?.title || '')}</h1>
  <p style="font-size:1.1rem;line-height:1.7;color:#374151;">${escapeHtml(article?.excerpt || '')}</p>
</article>
<script>
(function () {
  var fallback = document.getElementById('ssr-article-fallback');
  var root = document.getElementById('root');
  if (!fallback || !root) return;
  var done = false;
  var hide = function () {
    if (done) return;
    if (root.childElementCount > 0 || root.textContent.trim().length > 0) {
      done = true;
      fallback.remove();
      if (observer) observer.disconnect();
    }
  };
  var observer = new MutationObserver(hide);
  observer.observe(root, { childList: true, subtree: true });
  setTimeout(hide, 1200);
  setTimeout(function () { if (!done) fallback.remove(); }, 6000);
})();
</script>
`;
  return /<body[^>]*>/i.test(withSeo)
    ? withSeo.replace(/<body([^>]*)>/i, `<body$1>\n${fallbackArticle}`)
    : `${withSeo}\n${fallbackArticle}`;
};

const buildArticleUrl = (slug, statuses) => {
  const url = new URL('/rest/v1/articles', SUPABASE_URL);
  url.searchParams.set(
    'select',
    'id,slug,title,excerpt,image_url,author,category,status,created_at,published_at,updated_at,meta_title,meta_description,canonical_url,no_index',
  );
  url.searchParams.set('slug', `eq.${slug}`);
  url.searchParams.set('limit', '1');
  if (statuses?.length === 1) url.searchParams.set('status', `eq.${statuses[0]}`);
  if (statuses?.length > 1) url.searchParams.set('status', `in.(${statuses.join(',')})`);
  return url.toString();
};

const fetchArticleFromSupabase = async (slug) => {
  let lastError = null;
  const urls = [
    buildArticleUrl(slug, ['published']),
    buildArticleUrl(slug, PUBLISHED_STATUS_VALUES),
    buildArticleUrl(slug, []),
  ];

  for (const url of urls) {
    for (const key of KEY_CANDIDATES) {
      try {
        const headers = { apikey: key, Authorization: `Bearer ${key}` };
        const response = await fetch(url, { headers });
        const body = await response.text();
        if (!response.ok) {
          lastError = new Error(`[${response.status}] ${body.slice(0, 250)}`);
          continue;
        }
        const rows = JSON.parse(body);
        if (Array.isArray(rows) && rows.length > 0) return { row: rows[0], source: 'remote' };
      } catch (error) {
        lastError = error;
      }
    }
  }
  if (lastError) {
    console.error('[article-ssr] unable to load remote article', {
      slug,
      message: lastError?.message || String(lastError),
    });
  }
  const local = getLocalPublishedArticleBySlug(slug);
  if (local) return { row: local, source: 'local' };
  return { row: null, source: 'none' };
};

const renderNotFound = async (req, slug) => {
  const shell = await fetchShellHtml(buildOrigin(req));
  const withNoIndex = stripExistingSeoTags(shell).replace(
    /<\/head>/i,
    `
<title>Artículo no encontrado - ${SITE_NAME}</title>
<meta name="robots" content="noindex, nofollow" />
<meta name="description" content="Este artículo no existe o ya no está disponible." />
<link rel="canonical" href="${escapeHtml(`${SITE_URL}/articulos/${slug}`)}" />
</head>`,
  );
  return withNoIndex;
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  const rawSlug = String(req.query?.slug || '').trim();
  const slug = decodeURIComponent(rawSlug);
  if (!slug || slug.includes('/')) {
    return res.status(400).send('Invalid slug');
  }

  try {
    const { row: article, source } = await fetchArticleFromSupabase(slug);
    if (!article) {
      const html404 = await renderNotFound(req, slug);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Article-SSR', 'not-found');
      if (req.method === 'HEAD') return res.status(404).send('');
      return res.status(404).send(html404);
    }

    const shellHtml = await fetchShellHtml(buildOrigin(req));
    const seo = seoTagsForArticle(article, slug);
    const html = injectSeoInShell(shellHtml, seo, article);
    const indexable = !article?.no_index;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Article-SSR', '1');
    res.setHeader('X-Article-Source', source);
    res.setHeader('X-Robots-Tag', seo.robots);
    res.setHeader(
      'Cache-Control',
      indexable ? 'public, max-age=0, s-maxage=300, stale-while-revalidate=60' : 'no-store',
    );

    if (req.method === 'HEAD') return res.status(200).send('');
    return res.status(200).send(html);
  } catch (error) {
    console.error('[article-ssr] fatal error', {
      slug,
      message: error?.message || String(error),
    });
    return res.status(500).send('Server error');
  }
}
