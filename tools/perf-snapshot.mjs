import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = String(process.env.SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, '');
const MAX_ARTICLE_URLS = Number(process.env.PERF_ARTICLE_SAMPLE_COUNT || 3);
const OUTPUT_DIR = process.env.PERF_OUTPUT_DIR || 'ops/perf-snapshots';

const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const safeFetchText = async (url) => {
  const requestUrl = `${url}${url.includes('?') ? '&' : '?'}perf_ts=${Date.now()}`;
  const start = performance.now();
  const response = await fetch(requestUrl, { redirect: 'follow' });
  const ttfb = performance.now() - start;
  const text = await response.text();
  const total = performance.now() - start;
  return {
    url,
    status: response.status,
    finalUrl: response.url,
    ttfb_ms: Math.round(ttfb),
    total_ms: Math.round(total),
    bytes: Buffer.byteLength(text, 'utf8'),
    cache_control: response.headers.get('cache-control'),
    x_vercel_cache: response.headers.get('x-vercel-cache'),
    age: response.headers.get('age'),
  };
};

const getArticleUrlsFromSitemap = async () => {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const response = await fetch(`${sitemapUrl}?perf_ts=${Date.now()}`);
  const xml = await response.text();
  const allLocs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  return allLocs.filter((url) => url.includes('/articulos/')).slice(0, MAX_ARTICLE_URLS);
};

const run = async () => {
  const articleUrls = await getArticleUrlsFromSitemap();
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/articulos`,
    ...articleUrls,
    `${SITE_URL}/sitemap.xml`,
  ];

  const checks = [];
  for (const url of urls) {
    try {
      checks.push(await safeFetchText(url));
    } catch (error) {
      checks.push({
        url,
        status: 'ERR',
        finalUrl: null,
        ttfb_ms: null,
        total_ms: null,
        bytes: null,
        cache_control: null,
        x_vercel_cache: null,
        age: null,
        error: String(error?.message || error),
      });
    }
  }

  const payload = {
    generated_at: new Date().toISOString(),
    site_url: SITE_URL,
    urls_checked: urls.length,
    checks,
  };

  const ts = nowStamp();
  const outputPath = path.join(OUTPUT_DIR, `perf-snapshot-${ts}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const failed = checks.filter((item) => item.status !== 200).length;
  console.log(`Snapshot guardado: ${outputPath}`);
  console.log(`URLs verificadas: ${urls.length} | no-200: ${failed}`);
  checks.forEach((item) => {
    console.log(
      `${item.status}\t${item.ttfb_ms ?? '-'}ms\t${item.total_ms ?? '-'}ms\t${item.url}`,
    );
  });
};

run().catch((error) => {
  console.error(String(error?.stack || error));
  process.exit(1);
});
