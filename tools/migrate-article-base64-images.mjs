import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ARTICLE_IMAGE_BUCKET = process.env.ARTICLE_IMAGE_BUCKET || 'article-images';

const parseArgs = (argv) => {
  const args = { apply: false, dryRun: true, limit: null, slug: null };
  argv.forEach((arg) => {
    if (arg === '--apply') {
      args.apply = true;
      args.dryRun = false;
      return;
    }
    if (arg === '--dry-run') {
      args.apply = false;
      args.dryRun = true;
      return;
    }
    if (arg.startsWith('--limit=')) {
      const raw = Number(arg.slice('--limit='.length));
      args.limit = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : null;
      return;
    }
    if (arg.startsWith('--slug=')) {
      const raw = arg.slice('--slug='.length).trim();
      args.slug = raw || null;
    }
  });
  return args;
};

const ensureEnv = () => {
  if (!SUPABASE_URL) {
    throw new Error('Falta SUPABASE_URL.');
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY. Requerido para migración de medios.');
  }
};

const extractContentDataUrls = (html) => {
  const urls = [];
  const pattern = /<img\b[^>]*\bsrc=(["'])(data:image\/[^"']+)\1/gi;
  let match = pattern.exec(String(html || ''));
  while (match) {
    urls.push(match[2]);
    match = pattern.exec(String(html || ''));
  }
  return urls;
};

const parseDataUrl = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:(image\/[a-z0-9+.-]+);base64,([\s\S]+)$/i);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const base64Body = match[2].replace(/\s+/g, '');
  const buffer = Buffer.from(base64Body, 'base64');
  if (!buffer.length) return null;
  return {
    mime,
    buffer,
    bytes: buffer.length,
  };
};

const extensionFromMime = (mime) => {
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('png')) return 'png';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  return 'bin';
};

const replaceAllByMap = (value, replacements) => {
  let next = String(value || '');
  replacements.forEach((url, key) => {
    if (!key || !url) return;
    next = next.split(key).join(url);
  });
  return next;
};

const fetchCandidateArticles = async (supabase, options) => {
  let query = supabase
    .from('articles')
    .select('id,slug,content,image_url,created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (options.slug) {
    query = query.eq('slug', options.slug);
  }

  const { data, error } = await query;
  if (error) throw error;

  const scanned = data || [];
  return options.limit ? scanned.slice(0, options.limit) : scanned;
};

const buildLegacyPath = (articleId, ext, index) => {
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `legacy/${articleId}/${stamp}-${index}-${rand}.${ext}`;
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  ensureEnv();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const report = {
    mode: options.apply ? 'apply' : 'dry-run',
    scanned: 0,
    withBase64: 0,
    imagesFound: 0,
    imagesMigrated: 0,
    articlesUpdated: 0,
    estimatedBytesBefore: 0,
    estimatedBytesAfter: 0,
    errors: [],
    details: [],
  };

  const rows = await fetchCandidateArticles(supabase, options);
  report.scanned = rows.length;

  for (const row of rows) {
    const content = String(row.content || '');
    const imageUrl = String(row.image_url || '');
    const featuredHasBase64 = /^data:image\//i.test(imageUrl.trim());
    const contentDataUrls = extractContentDataUrls(content);
    const uniqueDataUrls = Array.from(new Set([...contentDataUrls, ...(featuredHasBase64 ? [imageUrl] : [])]));

    if (!uniqueDataUrls.length) continue;

    report.withBase64 += 1;
    report.imagesFound += uniqueDataUrls.length;
    report.estimatedBytesBefore += uniqueDataUrls.reduce((sum, item) => sum + String(item || '').length, 0);

    const detail = {
      id: row.id,
      slug: row.slug,
      imagesFound: uniqueDataUrls.length,
      migrated: 0,
      updated: false,
      errors: [],
    };

    if (options.dryRun) {
      report.details.push(detail);
      continue;
    }

    const replacements = new Map();
    let uploadIndex = 0;

    for (const dataUrl of uniqueDataUrls) {
      uploadIndex += 1;
      const parsed = parseDataUrl(dataUrl);
      if (!parsed) {
        detail.errors.push(`data_url_invalida_${uploadIndex}`);
        continue;
      }

      const ext = extensionFromMime(parsed.mime);
      const path = buildLegacyPath(row.id, ext, uploadIndex);

      const { error: uploadError } = await supabase.storage
        .from(ARTICLE_IMAGE_BUCKET)
        .upload(path, parsed.buffer, {
          upsert: false,
          contentType: parsed.mime,
          cacheControl: '31536000',
        });

      if (uploadError) {
        detail.errors.push(`upload_error_${uploadIndex}:${uploadError.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(ARTICLE_IMAGE_BUCKET).getPublicUrl(path);

      if (!publicUrl) {
        detail.errors.push(`public_url_error_${uploadIndex}`);
        continue;
      }

      replacements.set(dataUrl, publicUrl);
      report.imagesMigrated += 1;
      detail.migrated += 1;
      report.estimatedBytesAfter += publicUrl.length;
    }

    if (!replacements.size) {
      report.details.push(detail);
      continue;
    }

    const nextContent = replaceAllByMap(content, replacements);
    const nextImageUrl = replacements.get(imageUrl) || imageUrl;
    const changed = nextContent !== content || nextImageUrl !== imageUrl;
    if (!changed) {
      report.details.push(detail);
      continue;
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({ content: nextContent, image_url: nextImageUrl })
      .eq('id', row.id);

    if (updateError) {
      detail.errors.push(`update_error:${updateError.message}`);
      report.errors.push({ id: row.id, slug: row.slug, message: updateError.message });
      report.details.push(detail);
      continue;
    }

    detail.updated = true;
    report.articlesUpdated += 1;
    report.details.push(detail);
  }

  console.log(`[migrate-article-base64-images] mode=${report.mode}`);
  console.log(`[migrate-article-base64-images] scanned=${report.scanned} withBase64=${report.withBase64}`);
  console.log(`[migrate-article-base64-images] imagesFound=${report.imagesFound} imagesMigrated=${report.imagesMigrated}`);
  console.log(`[migrate-article-base64-images] articlesUpdated=${report.articlesUpdated}`);
  console.log(JSON.stringify(report, null, 2));
};

run().catch((error) => {
  console.error('[migrate-article-base64-images] fatal', error);
  process.exitCode = 1;
});
