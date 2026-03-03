import fs from 'node:fs';
import path from 'node:path';

const INPUT_DIR = process.env.SEO_EVAL_OUTPUT_DIR || 'ops/seo-evaluations';
const OUTPUT_DIR = INPUT_DIR;
const LINK_PATTERN = /^seo-link-cluster-(\d{8}-\d{6})\.json$/;
const BATCH_SIZE = Number(process.env.SEO_LINK_BATCH_SIZE || 4);
const LINKS_PER_ARTICLE = Number(process.env.SEO_LINKS_PER_ARTICLE || 3);

const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const escapeMd = (value) => String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();

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

const priorityScore = (row) => {
  const orphanBoost = row.is_orphan ? 50 : 0;
  const weakBoost = row.is_weak ? 25 : 0;
  const topRel = Number(row.related?.[0]?.relevance_score || 0);
  return orphanBoost + weakBoost + topRel;
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const run = () => {
  const linkPath = process.env.SEO_EVAL_LINK_FILE || pickLatestLinkPath();
  if (!linkPath) {
    console.error('No se encontro reporte link/clusters. Ejecuta primero: npm run seo:eval:links');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(linkPath, 'utf8'));
  const rows = Array.isArray(report.rows) ? report.rows : [];
  const prioritized = [...rows]
    .filter((row) => row.is_orphan || row.is_weak)
    .sort((a, b) => priorityScore(b) - priorityScore(a));

  const batches = chunk(prioritized, BATCH_SIZE);
  const ts = nowStamp();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outJson = path.join(OUTPUT_DIR, `seo-link-batch-plan-${ts}.json`);
  const outMd = path.join(OUTPUT_DIR, `seo-link-batch-plan-${ts}.md`);

  const payload = {
    generated_at: new Date().toISOString(),
    source_report: path.basename(linkPath),
    config: { batch_size: BATCH_SIZE, links_per_article: LINKS_PER_ARTICLE },
    summary: {
      total_articles: rows.length,
      prioritized_articles: prioritized.length,
      batches: batches.length,
      orphan_count: Number(report?.graph_summary?.orphan_count || 0),
      weak_count: Number(report?.graph_summary?.weak_count || 0),
    },
    batches: batches.map((items, idx) => ({
      batch_number: idx + 1,
      size: items.length,
      items: items.map((row) => ({
        source_slug: row.slug,
        source_title: row.title,
        category: row.category,
        orphan: Boolean(row.is_orphan),
        weak: Boolean(row.is_weak),
        links_to_add: (row.related || []).slice(0, LINKS_PER_ARTICLE).map((rel) => ({
          target_slug: rel.target_slug,
          anchor_text: rel.anchor_text,
          relevance_score: rel.relevance_score,
          reason: rel.reason,
          href: `/articulos/${rel.target_slug}`,
        })),
      })),
    })),
    quality_warnings: prioritized
      .filter((row) => String(row.slug || '').length <= 3 || String(row.title || '').trim().length <= 6)
      .map((row) => ({
        slug: row.slug,
        title: row.title,
        warning: 'Slug/titulo de baja calidad editorial; considerar merge o noindex.',
      })),
  };

  fs.writeFileSync(outJson, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const batchMd = payload.batches
    .map((batch) => {
      const lines = batch.items
        .map((item) => {
          const rel = item.links_to_add
            .map(
              (link) =>
                `   - anchor: "${link.anchor_text}" -> ${link.href} (score ${link.relevance_score})`,
            )
            .join('\n');
          return `1. ${item.source_slug} (${item.category})\n${rel || '   - sin sugerencias'}`;
        })
        .join('\n\n');
      return `## Lote ${batch.batch_number} (${batch.size} articulos)\n\n${lines}`;
    })
    .join('\n\n');

  const warningsMd = payload.quality_warnings.length
    ? payload.quality_warnings
        .map((item) => `1. ${item.slug} - ${item.title}: ${item.warning}`)
        .join('\n')
    : '1. Sin alertas criticas de calidad en slugs/titulos.';

  const md = `# Plan de Enlazado Interno por Lotes

Fecha: ${payload.generated_at}
Fuente: ${payload.source_report}

## Resumen

1. Articulos evaluados: ${payload.summary.total_articles}
2. Articulos priorizados: ${payload.summary.prioritized_articles}
3. Lotes generados: ${payload.summary.batches}
4. Orfanas: ${payload.summary.orphan_count}
5. Debiles: ${payload.summary.weak_count}
6. Objetivo por articulo: agregar ${LINKS_PER_ARTICLE} enlaces internos relevantes

## Modo de ejecucion recomendado

1. Ejecutar lote por lote desde CMS.
2. Publicar cambios en bloques de ${BATCH_SIZE} articulos.
3. Re-correr npm run seo:eval:links al finalizar cada lote.
4. Validar que bajen orphan/weak antes de avanzar al siguiente lote.

${batchMd}

## Alertas editoriales

${warningsMd}

## Criterio de cierre de Fase 4

1. Orfanas < 20%.
2. Debiles < 35%.
3. Al menos 3 enlaces internos relevantes por articulo en prioridad alta.
`;
  fs.writeFileSync(outMd, md, 'utf8');

  console.log(`Batch plan JSON: ${outJson}`);
  console.log(`Batch plan MD: ${outMd}`);
  console.log(
    `Resumen -> priorizados=${payload.summary.prioritized_articles} lotes=${payload.summary.batches}`,
  );
};

run();
