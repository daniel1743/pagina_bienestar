import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = String(process.env.SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, '');
const OUTPUT_DIR = process.env.SEO_EVAL_OUTPUT_DIR || 'ops/seo-evaluations';
const SAMPLE_RECENT = Number(process.env.SEO_EVAL_SAMPLE_RECENT || 10);
const SAMPLE_OLD = Number(process.env.SEO_EVAL_SAMPLE_OLD || 10);
const SAMPLE_STRATEGIC = Number(process.env.SEO_EVAL_SAMPLE_STRATEGIC || 10);
const STRATEGIC_URLS = String(process.env.SEO_EVAL_STRATEGIC_URLS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
  .map((item) => (item.startsWith('http://') || item.startsWith('https://') ? item : `${SITE_URL}/${item.replace(/^\//, '')}`))
  .map((item) => item.replace(/\/$/, ''));

const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const escapeMd = (value) =>
  String(value || '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .trim();

const decodeEntities = (value) =>
  String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

const withCacheBuster = (url, key = 'seo_eval_ts') => {
  const parsed = new URL(url);
  parsed.searchParams.set(key, String(Date.now()));
  return parsed.toString();
};

const fetchText = async (url) => {
  const response = await fetch(withCacheBuster(url), {
    redirect: 'follow',
    headers: { 'User-Agent': 'bec-seo-eval-baseline/1.0' },
  });
  const text = await response.text();
  return { response, text };
};

const parseSitemap = (xml) => {
  const blocks = [...String(xml).matchAll(/<url>([\s\S]*?)<\/url>/gi)];
  return blocks
    .map((match) => {
      const block = match[1] || '';
      const loc = decodeEntities((block.match(/<loc>([\s\S]*?)<\/loc>/i) || [])[1] || '').replace(/\/$/, '');
      const lastmod = decodeEntities((block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i) || [])[1] || '');
      return { loc, lastmod };
    })
    .filter((item) => item.loc);
};

const parseAttributes = (tag) => {
  const attrs = {};
  const regex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match = regex.exec(tag);
  while (match) {
    const key = String(match[1] || '').toLowerCase();
    const value = decodeEntities(match[2] || match[3] || match[4] || '');
    attrs[key] = value;
    match = regex.exec(tag);
  }
  return attrs;
};

const parseHeadSignalsFromSource = (html) => {
  const content = String(html || '');
  const title = decodeEntities((content.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const metaTags = [...content.matchAll(/<meta\b[^>]*>/gi)].map((m) => parseAttributes(m[0]));
  const linkTags = [...content.matchAll(/<link\b[^>]*>/gi)].map((m) => parseAttributes(m[0]));
  const scriptTags = [...content.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  const getMetaByName = (name) =>
    (metaTags.find((item) => item.name?.toLowerCase() === name.toLowerCase()) || {}).content || '';
  const getMetaByProp = (property) =>
    (metaTags.find((item) => item.property?.toLowerCase() === property.toLowerCase()) || {}).content || '';
  const canonical =
    (linkTags.find((item) => item.rel?.toLowerCase() === 'canonical') || {}).href || '';

  return {
    title,
    description: getMetaByName('description'),
    canonical,
    robots: getMetaByName('robots'),
    og_title: getMetaByProp('og:title'),
    og_description: getMetaByProp('og:description'),
    og_image: getMetaByProp('og:image'),
    twitter_card: getMetaByName('twitter:card'),
    jsonld_count: scriptTags.length,
    has_article_jsonld: scriptTags.some((m) =>
      /"@type"\s*:\s*"(Article|NewsArticle|BlogPosting)"/i.test(m[1] || ''),
    ),
  };
};

const pickArticleSample = (sitemapEntries) => {
  const articles = sitemapEntries
    .filter((item) => item.loc.includes('/articulos/'))
    .map((item) => ({
      ...item,
      ts: Number.isFinite(new Date(item.lastmod).getTime()) ? new Date(item.lastmod).getTime() : 0,
    }))
    .sort((a, b) => b.ts - a.ts);

  const recent = articles.slice(0, SAMPLE_RECENT);
  const old = [...articles].reverse().slice(0, SAMPLE_OLD);

  let strategic = [];
  if (STRATEGIC_URLS.length) {
    strategic = STRATEGIC_URLS.map((loc) => ({
      loc,
      lastmod: '',
      ts: 0,
      source: 'strategic_explicit',
    }));
  } else if (articles.length) {
    const middleStart = Math.max(0, Math.floor(articles.length / 2) - Math.floor(SAMPLE_STRATEGIC / 2));
    strategic = articles.slice(middleStart, middleStart + SAMPLE_STRATEGIC);
  }

  const dedup = new Map();
  [...recent, ...old, ...strategic].forEach((item) => {
    const key = String(item.loc || '').replace(/\/$/, '');
    if (!key) return;
    if (!dedup.has(key)) dedup.set(key, { ...item, loc: key });
  });
  return Array.from(dedup.values());
};

const classifySourceSeo = (signals) => {
  const hasCritical =
    Boolean(signals.title) &&
    Boolean(signals.description) &&
    Boolean(signals.canonical) &&
    Boolean(signals.robots);
  if (hasCritical) return 'PASS_SERVER_FIRST';
  if (signals.title || signals.description || signals.canonical || signals.robots) return 'PARTIAL_SOURCE';
  return 'FAIL_SOURCE_MISSING';
};

const run = async () => {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const { response: sitemapResponse, text: sitemapXml } = await fetchText(sitemapUrl);
  const sitemapEntries = parseSitemap(sitemapXml);
  const sample = pickArticleSample(sitemapEntries);

  const checks = [];
  for (const item of sample) {
    const started = performance.now();
    try {
      const { response, text } = await fetchText(item.loc);
      const elapsed = Math.round(performance.now() - started);
      const signals = parseHeadSignalsFromSource(text);
      checks.push({
        url: item.loc,
        lastmod: item.lastmod || null,
        status: response.status,
        elapsed_ms: elapsed,
        source_bytes: Buffer.byteLength(text, 'utf8'),
        seo_source_status: classifySourceSeo(signals),
        ...signals,
      });
    } catch (error) {
      checks.push({
        url: item.loc,
        lastmod: item.lastmod || null,
        status: 'ERR',
        elapsed_ms: null,
        source_bytes: null,
        seo_source_status: 'FAIL_SOURCE_FETCH',
        title: '',
        description: '',
        canonical: '',
        robots: '',
        og_title: '',
        og_description: '',
        og_image: '',
        twitter_card: '',
        jsonld_count: 0,
        has_article_jsonld: false,
        error: String(error?.message || error),
      });
    }
  }

  const summary = {
    total_checked: checks.length,
    ok_200: checks.filter((item) => item.status === 200).length,
    pass_server_first: checks.filter((item) => item.seo_source_status === 'PASS_SERVER_FIRST').length,
    partial_source: checks.filter((item) => item.seo_source_status === 'PARTIAL_SOURCE').length,
    fail_source_missing: checks.filter((item) => item.seo_source_status === 'FAIL_SOURCE_MISSING').length,
    fail_source_fetch: checks.filter((item) => item.seo_source_status === 'FAIL_SOURCE_FETCH').length,
  };

  const payload = {
    generated_at: new Date().toISOString(),
    site_url: SITE_URL,
    sitemap: {
      url: sitemapUrl,
      status: sitemapResponse.status,
      x_sitemap_mode: sitemapResponse.headers.get('x-sitemap-mode'),
      cache_control: sitemapResponse.headers.get('cache-control'),
      x_vercel_cache: sitemapResponse.headers.get('x-vercel-cache'),
      age: sitemapResponse.headers.get('age'),
      total_urls_detected: sitemapEntries.length,
      article_urls_detected: sitemapEntries.filter((item) => item.loc.includes('/articulos/')).length,
    },
    sample_config: {
      recent: SAMPLE_RECENT,
      old: SAMPLE_OLD,
      strategic: SAMPLE_STRATEGIC,
      strategic_explicit_count: STRATEGIC_URLS.length,
    },
    summary,
    checks,
  };

  const ts = nowStamp();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const jsonPath = path.join(OUTPUT_DIR, `seo-eval-baseline-${ts}.json`);
  const mdPath = path.join(OUTPUT_DIR, `seo-eval-baseline-${ts}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const failedRows = checks
    .filter((item) => item.seo_source_status !== 'PASS_SERVER_FIRST' || item.status !== 200)
    .slice(0, 20)
    .map(
      (item) =>
        `- ${item.url} | status=${item.status} | source=${item.seo_source_status} | title=${Boolean(item.title)} desc=${Boolean(item.description)} canonical=${Boolean(item.canonical)} robots=${Boolean(item.robots)}`,
    )
    .join('\n');

  const tableRows = checks
    .map(
      (item) =>
        `| ${escapeMd(item.url)} | ${item.status} | ${item.seo_source_status} | ${item.elapsed_ms ?? '-'} | ${item.source_bytes ?? '-'} | ${item.title ? 'Y' : 'N'} | ${item.description ? 'Y' : 'N'} | ${item.canonical ? 'Y' : 'N'} | ${item.robots ? 'Y' : 'N'} | ${item.og_title ? 'Y' : 'N'} | ${item.og_image ? 'Y' : 'N'} | ${item.has_article_jsonld ? 'Y' : 'N'} |`,
    )
    .join('\n');

  const md = `# SEO Eval Baseline

Fecha: ${payload.generated_at}
Dominio: ${SITE_URL}

## Resumen

- URLs revisadas: ${summary.total_checked}
- HTTP 200: ${summary.ok_200}
- PASS server-first (source): ${summary.pass_server_first}
- PARTIAL source: ${summary.partial_source}
- FAIL source missing: ${summary.fail_source_missing}
- FAIL source fetch: ${summary.fail_source_fetch}

## Sitemap Runtime

- URL: ${sitemapUrl}
- HTTP: ${payload.sitemap.status}
- X-Sitemap-Mode: ${payload.sitemap.x_sitemap_mode || 'n/a'}
- Cache-Control: ${payload.sitemap.cache_control || 'n/a'}
- X-Vercel-Cache: ${payload.sitemap.x_vercel_cache || 'n/a'}
- Age: ${payload.sitemap.age || 'n/a'}
- URLs detectadas: ${payload.sitemap.total_urls_detected}
- URLs de articulos detectadas: ${payload.sitemap.article_urls_detected}

## Hallazgos Críticos (Top 20)

${failedRows || '- Sin hallazgos críticos en el muestreo técnico.'}

## Detalle por URL

| URL | HTTP | SEO Source | ms | bytes | title | desc | canonical | robots | og:title | og:image | jsonld article |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${tableRows}
`;
  fs.writeFileSync(mdPath, md, 'utf8');

  console.log(`Baseline SEO guardado: ${jsonPath}`);
  console.log(`Reporte Markdown: ${mdPath}`);
  console.log(
    `Resumen -> total=${summary.total_checked} pass_source=${summary.pass_server_first} partial=${summary.partial_source} fail=${summary.fail_source_missing + summary.fail_source_fetch}`,
  );
};

run().catch((error) => {
  console.error(String(error?.stack || error));
  process.exit(1);
});
