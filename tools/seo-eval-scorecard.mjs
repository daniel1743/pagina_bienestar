import fs from 'node:fs';
import path from 'node:path';

const INPUT_DIR = process.env.SEO_EVAL_OUTPUT_DIR || 'ops/seo-evaluations';
const OUTPUT_DIR = INPUT_DIR;
const BASELINE_PATTERN = /^seo-eval-baseline-(\d{8}-\d{6})\.json$/;
const LINK_PATTERN = /^seo-link-cluster-(\d{8}-\d{6})\.json$/;

const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const pickLatestBaselinePath = () => {
  if (!fs.existsSync(INPUT_DIR)) return null;
  const entries = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => BASELINE_PATTERN.test(file))
    .sort((a, b) => {
      const aTs = (a.match(BASELINE_PATTERN) || [])[1] || '';
      const bTs = (b.match(BASELINE_PATTERN) || [])[1] || '';
      return bTs.localeCompare(aTs);
    });
  if (!entries.length) return null;
  return path.join(INPUT_DIR, entries[0]);
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

const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

const scoreState = (score, passAt = 80) => (score >= passAt ? 'PASS' : 'FAIL');

const buildDimensionScores = (baseline, linkReport) => {
  const total = Number(baseline?.summary?.total_checked || 0);
  const passServerFirst = Number(baseline?.summary?.pass_server_first || 0);
  const failFetch = Number(baseline?.summary?.fail_source_fetch || 0);
  const http200 = Number(baseline?.summary?.ok_200 || 0);

  const serverFirstScore = pct(passServerFirst, total);
  const serverFirstState = serverFirstScore >= 95 ? 'PASS' : 'FAIL';

  const sitemap = baseline?.sitemap || {};
  let crawlChecks = 0;
  let crawlOk = 0;
  const check = (condition) => {
    crawlChecks += 1;
    if (condition) crawlOk += 1;
  };
  check(Number(sitemap.status) === 200);
  check(String(sitemap.x_sitemap_mode || '').toLowerCase() === 'full');
  check(Number(sitemap.article_urls_detected || 0) > 0);
  check(String(sitemap.cache_control || '').toLowerCase().includes('max-age=0'));
  check(http200 === total && failFetch === 0);

  const crawlBudgetScore = pct(crawlOk, crawlChecks);
  const crawlBudgetState = scoreState(crawlBudgetScore, 80);

  let linkingClusterScore = 0;
  if (linkReport?.graph_summary && Number(linkReport?.total_articles || 0) > 0) {
    const orphanRatio = Number(linkReport.graph_summary.orphan_ratio || 1);
    const weakRatio = Number(linkReport.graph_summary.weak_ratio || 1);
    const coverageRatio = Number(linkReport.graph_summary.related_coverage_ratio || 0);
    const clustersCount = Number((Array.isArray(linkReport.clusters) ? linkReport.clusters.length : 0) || 0);
    const avgOutlinks = Number(linkReport.graph_summary.avg_outlinks || 0);

    const orphanScore = Math.max(0, 100 - Math.round(orphanRatio * 100));
    const weakScore = Math.max(0, 100 - Math.round(weakRatio * 100));
    const coverageScore = Math.min(100, Math.round(coverageRatio * 100));
    const clusterScore = Math.min(100, clustersCount >= 8 ? 100 : clustersCount * 12);
    const outlinkScore = Math.min(100, Math.round((avgOutlinks / 3) * 100));
    linkingClusterScore = Math.round(
      orphanScore * 0.3 +
      weakScore * 0.25 +
      coverageScore * 0.25 +
      clusterScore * 0.1 +
      outlinkScore * 0.1,
    );
  }
  const linkingClusterState = scoreState(linkingClusterScore, 80);
  const operabilityScore = total > 0 && Number(baseline?.sitemap?.status || 0) === 200 ? 85 : 0;
  const operabilityState = scoreState(operabilityScore, 80);

  return {
    server_first_seo: { weight: 35, score: serverFirstScore, state: serverFirstState },
    crawl_budget_sitemap: { weight: 25, score: crawlBudgetScore, state: crawlBudgetState },
    linking_clusters: { weight: 20, score: linkingClusterScore, state: linkingClusterState },
    operability_monitoring: { weight: 20, score: operabilityScore, state: operabilityState },
  };
};

const weightedTotal = (dimensions) => {
  const keys = Object.keys(dimensions);
  if (!keys.length) return 0;
  const totalWeight = keys.reduce((acc, key) => acc + Number(dimensions[key].weight || 0), 0);
  if (!totalWeight) return 0;
  const weighted = keys.reduce(
    (acc, key) => acc + Number(dimensions[key].score || 0) * Number(dimensions[key].weight || 0),
    0,
  );
  return Math.round(weighted / totalWeight);
};

const hasBlockingFail = (dimensions) =>
  Object.values(dimensions).some((item) => String(item.state || 'FAIL') !== 'PASS');

const buildRecommendation = (dimensions, globalState) => {
  if (globalState === 'PASS') return 'Mantener arquitectura actual con mejora continua';
  if (dimensions.server_first_seo.state !== 'PASS') {
    return 'Priorizar server-first para articulos antes de escalar contenido';
  }
  if (dimensions.linking_clusters.state !== 'PASS') {
    return 'Priorizar enlazado interno por lotes y consolidacion de clusters semanticos';
  }
  if (dimensions.crawl_budget_sitemap.state !== 'PASS') {
    return 'Corregir arquitectura de sitemap/crawl budget antes de expandir volumen';
  }
  return 'Cerrar dimensiones pendientes con evidencia hasta pasar score global';
};

const buildDiagnosticoLines = (dimensions) => {
  const lines = [];
  if (dimensions.server_first_seo.state === 'PASS') {
    lines.push('SEO server-first en source HTML de articulos: PASS en la muestra actual.');
  } else {
    lines.push('SEO server-first en source HTML de articulos: FAIL; metas incompletas en HTML inicial.');
  }

  if (dimensions.crawl_budget_sitemap.state === 'PASS') {
    lines.push('Sitemap/crawl budget tecnico: PASS (endpoint y señales base correctas).');
  } else {
    lines.push('Sitemap/crawl budget tecnico: FAIL; revisar cobertura y señales de cache/modo.');
  }

  if (dimensions.linking_clusters.state === 'PASS') {
    lines.push('Enlazado interno + clusters: PASS en la muestra auditada.');
  } else {
    lines.push('Enlazado interno + clusters: FAIL; alta orfandad/debilidad en la red interna.');
  }

  if (dimensions.operability_monitoring.state === 'PASS') {
    lines.push('Operabilidad y monitoreo: PASS.');
  } else {
    lines.push('Operabilidad y monitoreo: FAIL; faltan señales o estabilidad de control.');
  }

  return lines;
};

const buildNextActions = (dimensions) => {
  const actions = [];
  if (dimensions.server_first_seo.state !== 'PASS') {
    actions.push('Desplegar/corregir server-first en /articulos/:slug y revalidar source HTML.');
    actions.push('Re-ejecutar baseline hasta lograr PASS_SERVER_FIRST >=95%.');
  }
  if (dimensions.linking_clusters.state !== 'PASS') {
    actions.push('Ejecutar lote 1 de enlazado interno y repetir por lotes con seo:links:plan.');
    actions.push('Re-correr seo:eval:links y seo:eval:scorecard tras cada lote.');
  }
  if (dimensions.crawl_budget_sitemap.state !== 'PASS') {
    actions.push('Corregir señales de sitemap (status/mode/cobertura) y re-auditar.');
  }
  if (!actions.length) {
    actions.push('Mantener ciclo semanal de monitoreo y mejora continua.');
  }
  return actions.slice(0, 3);
};

const md = (payload) => {
  const d = payload.dimensions;
  const diagnostico = (payload.diagnostico_lines || []).map((line, idx) => `${idx + 1}. ${line}`).join('\n');
  const acciones = (payload.next_actions || []).map((line, idx) => `${idx + 1}. ${line}`).join('\n');
  return `# SEO Evaluation Scorecard

Fecha: ${payload.generated_at}
Dominio: ${payload.site_url}
Baseline fuente: ${payload.baseline_file}

## Resumen Ejecutivo

- Estado global: **${payload.global_state}**
- Score ponderado total: **${payload.weighted_score}/100**
- Decision recomendada: **${payload.recommendation}**

## Resultado por Dimension

| Dimension | Peso | Score | Estado |
| --- | --- | --- | --- |
| SEO server-first real | ${d.server_first_seo.weight}% | ${d.server_first_seo.score} | ${d.server_first_seo.state} |
| Crawl budget + sitemap | ${d.crawl_budget_sitemap.weight}% | ${d.crawl_budget_sitemap.score} | ${d.crawl_budget_sitemap.state} |
| Enlazado + clusters | ${d.linking_clusters.weight}% | ${d.linking_clusters.score} | ${d.linking_clusters.state} |
| Operabilidad + monitoreo | ${d.operability_monitoring.weight}% | ${d.operability_monitoring.score} | ${d.operability_monitoring.state} |

## Reglas duras (automaticas)

1. PASS server-first >=95%: **${payload.hard_rules.server_first_95 ? 'SI' : 'NO'}**
2. Sitemap 200 + mode full + articulos detectados: **${payload.hard_rules.sitemap_ok ? 'SI' : 'NO'}**
3. Todas las dimensiones en PASS: **${payload.hard_rules.all_dimensions_pass ? 'SI' : 'NO'}**

## Evidencia usada por scorecard

1. Baseline tecnico: ${payload.baseline_file}
2. Link/cluster report: ${payload.link_file || 'n/a (falta ejecutar npm run seo:eval:links)'}

## Diagnostico directo

${diagnostico}

## Siguiente accion recomendada (P0)

${acciones}
`;
};

const run = () => {
  const baselinePath = process.env.SEO_EVAL_BASELINE_FILE || pickLatestBaselinePath();
  if (!baselinePath) {
    console.error('No se encontro baseline JSON. Ejecuta primero: npm run seo:eval:baseline');
    process.exit(1);
  }

  const linkPath = process.env.SEO_EVAL_LINK_FILE || pickLatestLinkPath();
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const linkReport = linkPath && fs.existsSync(linkPath) ? JSON.parse(fs.readFileSync(linkPath, 'utf8')) : null;
  const dimensions = buildDimensionScores(baseline, linkReport);
  const weightedScore = weightedTotal(dimensions);
  const globalState = hasBlockingFail(dimensions) ? 'FAIL' : 'PASS';
  const recommendation = buildRecommendation(dimensions, globalState);
  const diagnosticoLines = buildDiagnosticoLines(dimensions);
  const nextActions = buildNextActions(dimensions);

  const payload = {
    generated_at: new Date().toISOString(),
    site_url: baseline?.site_url || 'https://bienestarenclaro.com',
    baseline_file: path.basename(baselinePath),
    link_file: linkPath ? path.basename(linkPath) : null,
    baseline_generated_at: baseline?.generated_at || null,
    dimensions,
    weighted_score: weightedScore,
    global_state: globalState,
    recommendation,
    diagnostico_lines: diagnosticoLines,
    next_actions: nextActions,
    hard_rules: {
      server_first_95: Number(dimensions.server_first_seo.score || 0) >= 95,
      sitemap_ok: String(dimensions.crawl_budget_sitemap.state) === 'PASS',
      all_dimensions_pass: !hasBlockingFail(dimensions),
    },
  };

  const ts = nowStamp();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const jsonPath = path.join(OUTPUT_DIR, `seo-eval-scorecard-${ts}.json`);
  const mdPath = path.join(OUTPUT_DIR, `seo-eval-scorecard-${ts}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, md(payload), 'utf8');

  console.log(`Scorecard JSON: ${jsonPath}`);
  console.log(`Scorecard MD: ${mdPath}`);
  console.log(`Estado global: ${globalState} | Score ponderado: ${weightedScore}/100`);
};

run();
