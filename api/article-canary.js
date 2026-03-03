const BOT_UA_REGEX =
  /(googlebot|adsbot-google|google-inspectiontool|bingbot|yandexbot|duckduckbot|baiduspider|slurp|applebot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot)/i;

const clean = (value) => String(value || '').trim();

const asBool = (value, fallback = false) => {
  const raw = clean(value).toLowerCase();
  if (!raw) return fallback;
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
};

const asPercent = (value, fallback = 10) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
};

const readCookie = (cookieHeader, key) => {
  const all = clean(cookieHeader);
  if (!all) return null;
  const pair = all
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`));
  if (!pair) return null;
  return decodeURIComponent(pair.split('=').slice(1).join('='));
};

const isBotRequest = (userAgent) => BOT_UA_REGEX.test(clean(userAgent));

const hashBucket = (value) => {
  const raw = clean(value);
  if (!raw) return 999;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) % 10000;
  }
  return hash % 100;
};

const buildOrigin = (req) => {
  const proto = clean(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = clean(req.headers['x-forwarded-host'] || req.headers.host).split(',')[0].trim();
  if (!host) return 'https://bienestarenclaro.com';
  return `${proto}://${host}`;
};

const appendSearch = (url, req) => {
  const query = new URLSearchParams(req.query || {});
  query.delete('slug');
  const qs = query.toString();
  if (!qs) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${qs}`;
};

const proxyStable = async (req, res, slug) => {
  const origin = buildOrigin(req);
  const url = `${origin}/api/article-ssr?slug=${encodeURIComponent(slug)}`;
  const response = await fetch(url, {
    method: req.method,
    headers: {
      'User-Agent': clean(req.headers['user-agent'] || 'bec-canary-router/1.0'),
      Accept: clean(req.headers.accept || 'text/html'),
    },
    redirect: 'manual',
  });

  const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8';
  const cacheControl = response.headers.get('cache-control') || 'no-store';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('X-Article-Canary', 'stable');

  if (req.method === 'HEAD') {
    return res.status(response.status).send('');
  }

  const body = await response.text();
  return res.status(response.status).send(body);
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  const rawSlug = clean(req.query?.slug);
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    slug = rawSlug;
  }
  if (!slug || slug.includes('/')) {
    return res.status(400).send('Invalid slug');
  }

  const canaryEnabled = asBool(process.env.NEXT_CANARY_ENABLED, false);
  const canaryPercent = asPercent(process.env.NEXT_CANARY_PERCENT, 10);
  const canaryOrigin = clean(process.env.NEXT_CANARY_ORIGIN);
  const ua = clean(req.headers['user-agent']);

  if (!canaryEnabled || !canaryOrigin) {
    return proxyStable(req, res, slug);
  }

  if (isBotRequest(ua)) {
    res.setHeader('X-Article-Canary', 'stable-bot');
    return proxyStable(req, res, slug);
  }

  const cookieValue = readCookie(req.headers.cookie, 'seo_next_canary');
  let bucketEnabled = null;
  if (cookieValue === '1') bucketEnabled = true;
  if (cookieValue === '0') bucketEnabled = false;

  if (bucketEnabled === null) {
    const identity = clean(req.headers['x-forwarded-for'] || '') + ua + slug;
    const bucket = hashBucket(identity);
    bucketEnabled = bucket < canaryPercent;
    res.setHeader(
      'Set-Cookie',
      `seo_next_canary=${bucketEnabled ? '1' : '0'}; Max-Age=2592000; Path=/; Secure; SameSite=Lax`,
    );
  }

  if (!bucketEnabled) {
    res.setHeader('X-Article-Canary', 'stable-human');
    return proxyStable(req, res, slug);
  }

  const destination = appendSearch(
    `${canaryOrigin.replace(/\/$/, '')}/articulos/${encodeURIComponent(slug)}`,
    req,
  );
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Article-Canary', 'canary');
  return res.redirect(307, destination);
}
