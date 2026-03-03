import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const INPUT_DIR = process.env.SEO_EVAL_OUTPUT_DIR || 'ops/seo-evaluations';
const OUTPUT_DIR = INPUT_DIR;
const LINK_PATTERN = /^seo-link-cluster-(\d{8}-\d{6})\.json$/;
const DEFAULT_SITE_URL = String(process.env.SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, '');
const DEFAULT_SUPABASE_URL = 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const AUTO_BLOCK_START = '<!-- auto-internal-links:start -->';
const AUTO_BLOCK_END = '<!-- auto-internal-links:end -->';
const DOTENV_FILES = ['.env.local', '.env'];

const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const parseArgs = (argv) => {
  const args = {
    apply: false,
    dryRun: true,
    linkFile: process.env.SEO_EVAL_LINK_FILE || null,
    maxLinksPerArticle: Number(process.env.SEO_LINKS_PER_ARTICLE || 3),
    minRelevance: Number(process.env.SEO_LINK_MIN_RELEVANCE || 35),
    limit: Number(process.env.SEO_LINK_APPLY_LIMIT || 0),
    includeStrong: false,
    skipSlugs: new Set(
      String(process.env.SEO_LINK_SKIP_SLUGS || 'para-probar-sanitizacion')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
    onlySlugs: new Set(),
  };

  for (const arg of argv) {
    if (arg === '--apply') {
      args.apply = true;
      args.dryRun = false;
      continue;
    }
    if (arg === '--dry-run') {
      args.apply = false;
      args.dryRun = true;
      continue;
    }
    if (arg === '--include-strong') {
      args.includeStrong = true;
      continue;
    }
    if (arg.startsWith('--file=')) {
      args.linkFile = arg.slice('--file='.length).trim() || null;
      continue;
    }
    if (arg.startsWith('--max-links=')) {
      const value = Number(arg.slice('--max-links='.length));
      if (Number.isFinite(value) && value > 0) args.maxLinksPerArticle = Math.floor(value);
      continue;
    }
    if (arg.startsWith('--min-relevance=')) {
      const value = Number(arg.slice('--min-relevance='.length));
      if (Number.isFinite(value) && value >= 0) args.minRelevance = value;
      continue;
    }
    if (arg.startsWith('--limit=')) {
      const value = Number(arg.slice('--limit='.length));
      if (Number.isFinite(value) && value > 0) args.limit = Math.floor(value);
      continue;
    }
    if (arg.startsWith('--skip-slugs=')) {
      const list = arg
        .slice('--skip-slugs='.length)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      args.skipSlugs = new Set(list);
      continue;
    }
    if (arg.startsWith('--only-slugs=')) {
      const list = arg
        .slice('--only-slugs='.length)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      args.onlySlugs = new Set(list);
    }
  }

  return args;
};

const pickLatestLinkPath = () => {
  if (!fs.existsSync(INPUT_DIR)) return null;
  const entries = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => LINK_PATTERN.test(file))
    .sort((a, b) => {
      const aTs = (a.match(LINK_PATTERN) || [])[1] || '';
      const bTs = (b.match(LINK_PATTERN) || [])[1] || '';
      return bTs.localeCompare(aTs);
    });
  if (!entries.length) return null;
  return path.join(INPUT_DIR, entries[0]);
};

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const escapeMd = (value) => String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();

const normalizeSlug = (value) => String(value || '').trim().replace(/^\/+/, '').replace(/\/+$/, '');

const stripAutoLinksBlock = (value) =>
  String(value || '').replace(
    new RegExp(`${AUTO_BLOCK_START}[\\s\\S]*?${AUTO_BLOCK_END}`, 'gi'),
    '',
  );

const extractInternalArticleLinks = (html, siteUrl) => {
  const raw = String(html || '');
  const hrefs = [...raw.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)].map((m) => m[1] || '');
  const slugs = hrefs
    .map((href) => {
      const clean = String(href || '').trim();
      if (!clean) return '';
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        try {
          const u = new URL(clean);
          if (u.origin !== siteUrl) return '';
          const match = u.pathname.match(/^\/articulos\/([^/?#]+)/i);
          return match ? match[1] : '';
        } catch {
          return '';
        }
      }
      const local = clean.startsWith('/') ? clean : `/${clean}`;
      const match = local.match(/^\/articulos\/([^/?#]+)/i);
      return match ? match[1] : '';
    })
    .filter(Boolean);
  return new Set(slugs);
};

const buildAutoLinksBlock = (links) => {
  const items = links
    .map(
      (link) =>
        `  <li><a href="/articulos/${encodeURIComponent(link.target_slug)}">${escapeHtml(link.anchor_text || link.target_slug)}</a></li>`,
    )
    .join('\n');

  return `${AUTO_BLOCK_START}
<section class="auto-internal-links" data-auto-internal-links="v1">
  <h2>Lecturas relacionadas</h2>
  <ul>
${items}
  </ul>
</section>
${AUTO_BLOCK_END}`;
};

const normalizeContent = (value) => {
  const raw = String(value || '').trim();
  return raw || '<p></p>';
};

const loadDotEnvIfPresent = () => {
  for (const fileName of DOTENV_FILES) {
    if (!fs.existsSync(fileName)) continue;
    const raw = fs.readFileSync(fileName, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = String(line || '').trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      if (!key || process.env[key]) continue;
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
};

const buildArticlePlan = (row, content, config, siteUrl) => {
  const cleanedContent = stripAutoLinksBlock(normalizeContent(content));
  const existingTargets = extractInternalArticleLinks(cleanedContent, siteUrl);
  const related = Array.isArray(row.related) ? row.related : [];
  const picked = [];
  const seenTargets = new Set();
  const seenAnchors = new Set();

  for (const suggestion of related) {
    if (picked.length >= config.maxLinksPerArticle) break;
    const targetSlug = normalizeSlug(suggestion.target_slug);
    const anchor = String(suggestion.anchor_text || '').trim();
    const relevance = Number(suggestion.relevance_score || 0);
    if (!targetSlug || !anchor) continue;
    if (targetSlug === row.slug) continue;
    if (relevance < config.minRelevance) continue;
    if (config.skipSlugs.has(row.slug) || config.skipSlugs.has(targetSlug)) continue;
    if (existingTargets.has(targetSlug)) continue;
    if (seenTargets.has(targetSlug)) continue;
    if (seenAnchors.has(anchor.toLowerCase())) continue;

    picked.push({
      target_slug: targetSlug,
      anchor_text: anchor,
      relevance_score: relevance,
      reason: String(suggestion.reason || ''),
    });
    seenTargets.add(targetSlug);
    seenAnchors.add(anchor.toLowerCase());
  }

  if (!picked.length) {
    return {
      changed: false,
      links_added: 0,
      links: [],
      content_before: normalizeContent(content),
      content_after: normalizeContent(content),
      reason: 'sin_sugerencias_validas',
    };
  }

  const autoBlock = buildAutoLinksBlock(picked);
  const contentAfter = `${cleanedContent}\n\n${autoBlock}`.trim();
  return {
    changed: contentAfter !== normalizeContent(content),
    links_added: picked.length,
    links: picked,
    content_before: normalizeContent(content),
    content_after: contentAfter,
    reason: 'ok',
  };
};

const getSupabaseClient = ({ apply }) => {
  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const serviceRole = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anonKey = String(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!supabaseUrl) throw new Error('Falta SUPABASE_URL.');
  if (apply && !serviceRole) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para aplicar enlazado automático en DB.');
  }
  const key = serviceRole || anonKey;
  if (!key) throw new Error('Falta key de Supabase (SERVICE_ROLE o ANON) para ejecutar el enlazado.');
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
};

const getReportRows = (report, options) => {
  const rows = Array.isArray(report?.rows) ? report.rows : [];
  const filtered = rows.filter((row) => {
    const slug = normalizeSlug(row.slug);
    if (!slug) return false;
    if (!options.includeStrong && !row.is_orphan && !row.is_weak) return false;
    if (options.onlySlugs.size > 0 && !options.onlySlugs.has(slug)) return false;
    if (options.skipSlugs.has(slug)) return false;
    return true;
  });

  if (options.limit > 0) return filtered.slice(0, options.limit);
  return filtered;
};

const readLinkReport = (options) => {
  const pathFromArg = options.linkFile && fs.existsSync(options.linkFile) ? options.linkFile : null;
  const linkPath = pathFromArg || pickLatestLinkPath();
  if (!linkPath) {
    throw new Error('No se encontró reporte seo-link-cluster-*.json. Ejecuta primero: npm run seo:eval:links');
  }
  const report = JSON.parse(fs.readFileSync(linkPath, 'utf8'));
  return { report, linkPath };
};

const fetchArticlesBySlug = async (supabase, slugs) => {
  const unique = Array.from(new Set(slugs.filter(Boolean)));
  const chunkSize = 200;
  const out = [];

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('articles')
      .select('id,slug,content,status,no_index')
      .in('slug', chunk);
    if (error) throw new Error(`Error leyendo artículos: ${error.message}`);
    out.push(...(Array.isArray(data) ? data : []));
  }

  return out;
};

const writeOutputs = (payload) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const ts = nowStamp();
  const jsonPath = path.join(OUTPUT_DIR, `seo-link-apply-${ts}.json`);
  const mdPath = path.join(OUTPUT_DIR, `seo-link-apply-${ts}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const tableRows = payload.items
    .slice(0, 200)
    .map(
      (item) =>
        `| ${escapeMd(item.slug)} | ${item.mode} | ${item.changed ? 'Y' : 'N'} | ${item.links_added} | ${escapeMd(item.status)} | ${escapeMd(item.note)} |`,
    )
    .join('\n');

  const linksRows = payload.items
    .filter((item) => item.links_added > 0)
    .slice(0, 100)
    .map((item) => {
      const links = item.links
        .map((link) => `"${link.anchor_text}" -> /articulos/${link.target_slug} (score ${link.relevance_score})`)
        .join('; ');
      return `1. ${item.slug}: ${links}`;
    })
    .join('\n');

  const md = `# Aplicación automática de enlazado interno

Fecha: ${payload.generated_at}
Modo: ${payload.mode}
Fuente: ${payload.source_report}

## Configuración

1. max_links_per_article: ${payload.config.max_links_per_article}
2. min_relevance: ${payload.config.min_relevance}
3. include_strong: ${payload.config.include_strong}
4. limit: ${payload.config.limit || 'sin limite'}
5. skip_slugs: ${payload.config.skip_slugs.join(', ') || 'ninguno'}

## Resumen

1. Artículos candidatos: ${payload.summary.candidates}
2. Artículos encontrados en DB: ${payload.summary.found_in_db}
3. Artículos modificables: ${payload.summary.change_candidates}
4. Artículos actualizados: ${payload.summary.updated}
5. Artículos sin cambios: ${payload.summary.unchanged}
6. Enlaces agregados: ${payload.summary.links_added}
7. Slugs no encontrados en DB: ${payload.summary.missing_in_db}
8. Saltados por base64 legado: ${payload.summary.skipped_base64}
9. Errores: ${payload.summary.errors}

## Resultado por artículo

| Slug | Modo | Cambió | Links | Estado DB | Nota |
| --- | --- | --- | --- | --- | --- |
${tableRows || '| n/a | n/a | n | 0 | n/a | sin datos |'}

## Muestra de enlaces agregados

${linksRows || '1. No se agregaron enlaces en esta corrida.'}

## Reglas aplicadas

1. Solo se procesa contenido en artículos publicados y no_index=false.
2. Se usa reporte de \`seo:eval:links\` como fuente de sugerencias.
3. Se priorizan huérfanos/débiles (a menos que se use include_strong).
4. No se agregan links con relevancia menor al umbral.
5. No se duplican targets ni anchors en el bloque automático.
6. No se pisa el contenido editorial manual: solo se reemplaza el bloque auto marcado.
7. El bloque automático usa marcadores:
   - ${AUTO_BLOCK_START}
   - ${AUTO_BLOCK_END}
`;
  fs.writeFileSync(mdPath, md, 'utf8');

  return { jsonPath, mdPath };
};

const run = async () => {
  loadDotEnvIfPresent();
  const options = parseArgs(process.argv.slice(2));
  const { report, linkPath } = readLinkReport(options);
  const siteUrl = String(report?.site_url || DEFAULT_SITE_URL).replace(/\/$/, '');
  const candidates = getReportRows(report, options);

  if (!candidates.length) {
    throw new Error('No hay artículos candidatos según filtros actuales.');
  }

  const supabase = getSupabaseClient({ apply: options.apply });
  const dbRows = await fetchArticlesBySlug(
    supabase,
    candidates.map((row) => normalizeSlug(row.slug)),
  );
  const bySlug = new Map(dbRows.map((row) => [normalizeSlug(row.slug), row]));

  const payload = {
    generated_at: new Date().toISOString(),
    mode: options.apply ? 'apply' : 'dry-run',
    source_report: path.basename(linkPath),
    config: {
      max_links_per_article: options.maxLinksPerArticle,
      min_relevance: options.minRelevance,
      include_strong: options.includeStrong,
      limit: options.limit,
      skip_slugs: Array.from(options.skipSlugs),
    },
    summary: {
      candidates: candidates.length,
      found_in_db: 0,
      change_candidates: 0,
      updated: 0,
      unchanged: 0,
      links_added: 0,
      missing_in_db: 0,
      skipped_base64: 0,
      errors: 0,
    },
    items: [],
  };

  for (const row of candidates) {
    const slug = normalizeSlug(row.slug);
    const dbRow = bySlug.get(slug);
    if (!dbRow) {
      payload.summary.missing_in_db += 1;
      payload.items.push({
        slug,
        mode: options.apply ? 'apply' : 'dry-run',
        changed: false,
        links_added: 0,
        status: 'missing',
        note: 'Artículo no encontrado en DB para ese slug.',
        links: [],
      });
      continue;
    }

    payload.summary.found_in_db += 1;
    if (String(dbRow.status || '').toLowerCase() !== 'published' || Boolean(dbRow.no_index)) {
      payload.summary.unchanged += 1;
      payload.items.push({
        slug,
        mode: options.apply ? 'apply' : 'dry-run',
        changed: false,
        links_added: 0,
        status: 'skipped',
        note: 'Artículo fuera de criterio (status/no_index).',
        links: [],
      });
      continue;
    }

    if (/data:image\//i.test(String(dbRow.content || ''))) {
      payload.summary.skipped_base64 += 1;
      payload.items.push({
        slug,
        mode: options.apply ? 'apply' : 'dry-run',
        changed: false,
        links_added: 0,
        status: 'skipped_base64',
        note: 'Contenido con data:image legado; migrar base64 antes de enlazado automático.',
        links: [],
      });
      continue;
    }

    const planned = buildArticlePlan(
      row,
      dbRow.content || '<p></p>',
      {
        maxLinksPerArticle: options.maxLinksPerArticle,
        minRelevance: options.minRelevance,
        skipSlugs: options.skipSlugs,
      },
      siteUrl,
    );

    if (!planned.changed) {
      payload.summary.unchanged += 1;
      payload.items.push({
        slug,
        mode: options.apply ? 'apply' : 'dry-run',
        changed: false,
        links_added: 0,
        status: 'unchanged',
        note: planned.reason,
        links: [],
      });
      continue;
    }

    payload.summary.change_candidates += 1;

    if (options.apply) {
      const { error } = await supabase
        .from('articles')
        .update({ content: planned.content_after })
        .eq('id', dbRow.id);
      if (error) {
        payload.summary.errors += 1;
        payload.items.push({
          slug,
          mode: 'apply',
          changed: false,
          links_added: 0,
          status: 'error',
          note: `Error al actualizar: ${error.message}`,
          links: [],
        });
        continue;
      }
      payload.summary.updated += 1;
      payload.summary.links_added += planned.links_added;
      payload.items.push({
        slug,
        mode: 'apply',
        changed: true,
        links_added: planned.links_added,
        status: 'updated',
        note: 'Actualizado en DB.',
        links: planned.links,
      });
      continue;
    }

    payload.summary.updated += 1;
    payload.summary.links_added += planned.links_added;
    payload.items.push({
      slug,
      mode: 'dry-run',
      changed: true,
      links_added: planned.links_added,
      status: 'planned',
      note: 'Cambio planificado (sin escribir DB).',
      links: planned.links,
    });
  }

  const { jsonPath, mdPath } = writeOutputs(payload);
  console.log(`Link apply JSON: ${jsonPath}`);
  console.log(`Link apply MD: ${mdPath}`);
  console.log(
    `Resumen -> mode=${payload.mode} candidatos=${payload.summary.candidates} actualizados=${payload.summary.updated} links=${payload.summary.links_added} errores=${payload.summary.errors}`,
  );
};

run().catch((error) => {
  console.error(String(error?.stack || error));
  process.exit(1);
});
