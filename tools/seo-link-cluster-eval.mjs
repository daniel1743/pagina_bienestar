import fs from 'node:fs';
import path from 'node:path';
import { LOCAL_PUBLISHED_ARTICLES } from '../src/content/localPublishedArticles.js';

const SITE_URL = String(process.env.SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, '');
const OUTPUT_DIR = process.env.SEO_EVAL_OUTPUT_DIR || 'ops/seo-evaluations';
const MAX_ARTICLES = Number(process.env.SEO_LINK_EVAL_LIMIT || 5000);
const MAX_RELATED = Number(process.env.SEO_LINK_EVAL_RELATED || 5);

const DEFAULT_SUPABASE_URL = 'https://kuacuriiueaxjzzgmqtu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWN1cmlpdWVheGp6emdtcXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg0ODUsImV4cCI6MjA4NzE4NDQ4NX0.fkJIFamjrZOPJ5wHmz204MMlJMnEMKGd87XyCoQcaMI';
const PUBLISHED_STATUS_VALUES = ['published', 'publicado', 'active'];
const STOPWORDS = new Set([
  'a', 'al', 'algo', 'ante', 'bajo', 'cabe', 'como', 'con', 'contra', 'cual', 'cuales', 'cuando',
  'de', 'del', 'desde', 'donde', 'dos', 'el', 'ella', 'ellas', 'ellos', 'en', 'entre', 'era', 'erais',
  'eran', 'eres', 'es', 'esa', 'ese', 'eso', 'esta', 'estaba', 'estais', 'estan', 'estar', 'estas', 'este',
  'esto', 'fue', 'fueron', 'ha', 'han', 'hasta', 'hay', 'la', 'las', 'le', 'les', 'lo', 'los', 'mas', 'me',
  'mi', 'mis', 'mucho', 'muy', 'nada', 'ni', 'no', 'nos', 'nosotros', 'nuestra', 'nuestro', 'o', 'os', 'otra',
  'otro', 'para', 'pero', 'por', 'porque', 'que', 'se', 'segun', 'ser', 'si', 'sin', 'sobre', 'son', 'su',
  'sus', 'te', 'tenia', 'tiene', 'todo', 'tu', 'tus', 'un', 'una', 'uno', 'unos', 'y', 'ya',
]);

const cleanEnvValue = (value) => String(value || '').trim();
const isValidSupabaseProjectUrl = (value) =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value) && !value.includes('tu-proyecto.supabase.co');
const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const slugify = (value) =>
  normalizeText(value)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};
const escapeMd = (value) => String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
const toDateTs = (value) => {
  const ts = new Date(value || 0).getTime();
  return Number.isFinite(ts) ? ts : 0;
};
const uniq = (list) => Array.from(new Set((Array.isArray(list) ? list : []).filter(Boolean)));
const extractWords = (value) =>
  uniq(
    normalizeText(value)
      .split(/\s+/)
      .filter((item) => item.length >= 3 && !STOPWORDS.has(item)),
  );

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

const buildArticlesUrl = () => {
  const url = new URL('/rest/v1/articles', SUPABASE_URL);
  url.searchParams.set(
    'select',
    'id,slug,title,excerpt,content,category,status,no_index,focus_keyword,secondary_keywords,published_at,updated_at,created_at',
  );
  url.searchParams.set('status', `in.(${PUBLISHED_STATUS_VALUES.join(',')})`);
  url.searchParams.set('no_index', 'eq.false');
  url.searchParams.set('slug', 'not.is.null');
  url.searchParams.set('limit', String(MAX_ARTICLES));
  return url.toString();
};

const fetchRemoteArticles = async () => {
  const url = buildArticlesUrl();
  let lastError = null;
  for (const key of KEY_CANDIDATES) {
    try {
      const response = await fetch(url, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      const text = await response.text();
      if (!response.ok) {
        lastError = new Error(`[${response.status}] ${text.slice(0, 250)}`);
        continue;
      }
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
      lastError = new Error('Respuesta inválida de Supabase REST.');
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    console.error('[seo-link-eval] remote fetch failed, fallback local', {
      message: lastError?.message || String(lastError),
    });
  }
  return [];
};

const normalizeArticles = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      id: row.id || `local-${row.slug}`,
      slug: String(row.slug || '').trim(),
      url: `${SITE_URL}/articulos/${String(row.slug || '').trim()}`,
      title: String(row.title || '').trim(),
      excerpt: String(row.excerpt || '').trim(),
      content: String(row.content || ''),
      category: String(row.category || 'General').trim(),
      no_index: Boolean(row.no_index),
      focus_keyword: String(row.focus_keyword || '').trim(),
      secondary_keywords: String(row.secondary_keywords || '').trim(),
      status: String(row.status || '').trim(),
      created_at: row.created_at || null,
      published_at: row.published_at || null,
      updated_at: row.updated_at || null,
    }))
    .filter((item) => item.slug);

const mergeRemoteWithLocal = (remoteRows) => {
  const bySlug = new Map();
  normalizeArticles(LOCAL_PUBLISHED_ARTICLES).forEach((item) => bySlug.set(item.slug, item));
  normalizeArticles(remoteRows).forEach((item) => bySlug.set(item.slug, item));
  return Array.from(bySlug.values())
    .filter((item) => !item.no_index)
    .sort((a, b) => toDateTs(b.updated_at || b.published_at || b.created_at) - toDateTs(a.updated_at || a.published_at || a.created_at));
};

const extractInternalArticleLinks = (html) => {
  const raw = String(html || '');
  const hrefs = [...raw.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)].map((m) => m[1] || '');
  const slugs = hrefs
    .map((href) => {
      const clean = String(href || '').trim();
      if (!clean) return '';
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        try {
          const u = new URL(clean);
          if (u.origin !== SITE_URL) return '';
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
  return uniq(slugs);
};

const overlapScore = (aTokens, bTokens) => {
  if (!aTokens.length || !bTokens.length) return 0;
  const bSet = new Set(bTokens);
  const overlap = aTokens.filter((token) => bSet.has(token)).length;
  return overlap;
};

const pickAnchor = (source, target) => {
  if (target.focus_keyword) return target.focus_keyword;
  if (source.category && target.category && source.category === target.category) return `Sobre ${target.category.toLowerCase()}`;
  return target.title || target.slug;
};

const buildRelatedSuggestions = (article, allArticles, inlinksBySlug) => {
  const sourceTokens = extractWords([article.title, article.excerpt, article.content, article.focus_keyword, article.secondary_keywords].join(' '));
  const sourceDate = toDateTs(article.updated_at || article.published_at || article.created_at);

  return allArticles
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => {
      const candidateTokens = extractWords(
        [candidate.title, candidate.excerpt, candidate.content, candidate.focus_keyword, candidate.secondary_keywords].join(' '),
      );
      const sameCategory = article.category && candidate.category && article.category === candidate.category ? 8 : 0;
      const focusMatch = article.focus_keyword && candidate.focus_keyword && normalizeText(article.focus_keyword) === normalizeText(candidate.focus_keyword) ? 10 : 0;
      const tokenOverlap = overlapScore(sourceTokens, candidateTokens);
      const authority = Math.min(6, Number(inlinksBySlug.get(candidate.slug) || 0));
      const recency = Math.max(0, 4 - Math.floor(Math.abs(sourceDate - toDateTs(candidate.updated_at || candidate.published_at || candidate.created_at)) / (1000 * 60 * 60 * 24 * 30)));
      const relevance = sameCategory + focusMatch + tokenOverlap + authority + recency;
      const reasons = [];
      if (sameCategory) reasons.push('same_category');
      if (focusMatch) reasons.push('focus_match');
      if (tokenOverlap > 0) reasons.push(`token_overlap:${tokenOverlap}`);
      if (authority > 0) reasons.push(`authority:${authority}`);
      if (recency > 0) reasons.push(`recency:${recency}`);

      return {
        target_slug: candidate.slug,
        anchor_text: pickAnchor(article, candidate),
        relevance_score: relevance,
        reason: reasons.join(', '),
      };
    })
    .filter((item) => item.relevance_score > 0)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, MAX_RELATED);
};

const inferClusterTopic = (article) => {
  if (article.focus_keyword) return slugify(article.focus_keyword) || slugify(article.title) || article.slug;
  const words = extractWords([article.title, article.excerpt].join(' '));
  return words[0] || slugify(article.category) || article.slug;
};

const buildClusters = (articles, inlinksBySlug) => {
  const groups = new Map();
  articles.forEach((article) => {
    const topic = inferClusterTopic(article);
    const category = slugify(article.category || 'general') || 'general';
    const clusterId = `${category}-${topic}`;
    if (!groups.has(clusterId)) groups.set(clusterId, []);
    groups.get(clusterId).push(article);
  });

  return Array.from(groups.entries())
    .map(([clusterId, rows]) => {
      const scored = [...rows].sort((a, b) => {
        const scoreA = Number(inlinksBySlug.get(a.slug) || 0) + Math.min(5, extractWords(a.content).length / 100);
        const scoreB = Number(inlinksBySlug.get(b.slug) || 0) + Math.min(5, extractWords(b.content).length / 100);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return toDateTs(b.updated_at || b.published_at || b.created_at) - toDateTs(a.updated_at || a.published_at || a.created_at);
      });
      const pillar = scored[0];
      const supporting = scored.slice(1).map((item) => item.slug);
      return {
        cluster_id: clusterId,
        topic: clusterId.split('-').slice(1).join('-') || clusterId,
        intent: 'informacional',
        pillar_slug: pillar?.slug || null,
        supporting_slugs: supporting,
        size: scored.length,
      };
    })
    .sort((a, b) => b.size - a.size);
};

const run = async () => {
  const remote = await fetchRemoteArticles();
  const articles = mergeRemoteWithLocal(remote);
  const slugsSet = new Set(articles.map((item) => item.slug));

  const outlinksBySlug = new Map();
  const inlinksBySlug = new Map();
  articles.forEach((article) => {
    const outlinks = extractInternalArticleLinks(article.content).filter((slug) => slugsSet.has(slug));
    outlinksBySlug.set(article.slug, outlinks);
    outlinks.forEach((target) => inlinksBySlug.set(target, Number(inlinksBySlug.get(target) || 0) + 1));
  });

  const rows = articles.map((article) => {
    const inlinks = Number(inlinksBySlug.get(article.slug) || 0);
    const outlinks = (outlinksBySlug.get(article.slug) || []).length;
    const related = buildRelatedSuggestions(article, articles, inlinksBySlug);
    return {
      slug: article.slug,
      title: article.title,
      category: article.category,
      inlinks,
      outlinks,
      is_orphan: inlinks === 0,
      is_weak: inlinks < 2,
      related,
    };
  });

  const orphanPages = rows.filter((item) => item.is_orphan).map((item) => item.slug);
  const weakPages = rows.filter((item) => item.is_weak).map((item) => item.slug);
  const withRelatedCoverage = rows.filter((item) => item.related.length >= 3).length;
  const clusters = buildClusters(articles, inlinksBySlug);

  const payload = {
    generated_at: new Date().toISOString(),
    site_url: SITE_URL,
    total_articles: rows.length,
    graph_summary: {
      orphan_count: orphanPages.length,
      weak_count: weakPages.length,
      orphan_ratio: rows.length ? Number((orphanPages.length / rows.length).toFixed(4)) : 0,
      weak_ratio: rows.length ? Number((weakPages.length / rows.length).toFixed(4)) : 0,
      related_coverage_count: withRelatedCoverage,
      related_coverage_ratio: rows.length ? Number((withRelatedCoverage / rows.length).toFixed(4)) : 0,
      avg_outlinks: rows.length
        ? Number((rows.reduce((acc, item) => acc + item.outlinks, 0) / rows.length).toFixed(2))
        : 0,
    },
    contracts: {
      internal_link_contract_sample: rows.slice(0, 5).map((item) => ({
        source_slug: item.slug,
        suggestions: item.related.map((rel) => ({
          target_slug: rel.target_slug,
          anchor_text: rel.anchor_text,
          relevance_score: rel.relevance_score,
          reason: rel.reason,
        })),
      })),
      cluster_contract_sample: clusters.slice(0, 10).map((cluster) => ({
        cluster_id: cluster.cluster_id,
        pillar_slug: cluster.pillar_slug,
        topic: cluster.topic,
        intent: cluster.intent,
        supporting_slugs: cluster.supporting_slugs,
      })),
    },
    rows,
    clusters,
  };

  const ts = nowStamp();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const jsonPath = path.join(OUTPUT_DIR, `seo-link-cluster-${ts}.json`);
  const mdPath = path.join(OUTPUT_DIR, `seo-link-cluster-${ts}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const topOrphans = orphanPages.slice(0, 20).map((slug) => `- ${slug}`).join('\n') || '- Sin paginas huerfanas detectadas.';
  const topWeak = weakPages.slice(0, 20).map((slug) => `- ${slug}`).join('\n') || '- Sin paginas debiles detectadas.';
  const clusterRows = clusters
    .slice(0, 20)
    .map(
      (cluster) =>
        `| ${escapeMd(cluster.cluster_id)} | ${escapeMd(cluster.pillar_slug)} | ${cluster.size} | ${escapeMd(cluster.supporting_slugs.slice(0, 6).join(', '))} |`,
    )
    .join('\n');
  const relatedRows = rows
    .slice(0, 20)
    .map((item) => {
      const rel = item.related[0];
      return `| ${escapeMd(item.slug)} | ${item.inlinks} | ${item.outlinks} | ${item.is_orphan ? 'Y' : 'N'} | ${item.is_weak ? 'Y' : 'N'} | ${escapeMd(rel?.target_slug || '')} | ${escapeMd(rel?.anchor_text || '')} | ${rel?.relevance_score ?? ''} |`;
    })
    .join('\n');

  const md = `# SEO Link + Cluster Evaluation

Fecha: ${payload.generated_at}
Dominio: ${SITE_URL}

## Resumen

- Articulos evaluados: ${payload.total_articles}
- Orphan pages: ${payload.graph_summary.orphan_count} (${(payload.graph_summary.orphan_ratio * 100).toFixed(1)}%)
- Weak pages (<2 inlinks): ${payload.graph_summary.weak_count} (${(payload.graph_summary.weak_ratio * 100).toFixed(1)}%)
- Cobertura related>=3: ${payload.graph_summary.related_coverage_count} (${(payload.graph_summary.related_coverage_ratio * 100).toFixed(1)}%)
- Avg outlinks internos: ${payload.graph_summary.avg_outlinks}
- Clusters inferidos: ${payload.clusters.length}

## Paginas huerfanas (Top 20)

${topOrphans}

## Paginas debiles (Top 20)

${topWeak}

## Muestra de enlazado

| Source slug | inlinks | outlinks | orphan | weak | top target | anchor | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
${relatedRows}

## Muestra de clusters

| Cluster ID | Pillar | Size | Supporting (sample) |
| --- | --- | --- | --- |
${clusterRows || '| n/a | n/a | 0 | n/a |'}
`;
  fs.writeFileSync(mdPath, md, 'utf8');

  console.log(`Link/Cluster JSON: ${jsonPath}`);
  console.log(`Link/Cluster MD: ${mdPath}`);
  console.log(
    `Resumen -> total=${payload.total_articles} orphan=${payload.graph_summary.orphan_count} weak=${payload.graph_summary.weak_count} clusters=${payload.clusters.length}`,
  );
};

run().catch((error) => {
  console.error(String(error?.stack || error));
  process.exit(1);
});
