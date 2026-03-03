# SEO Evaluation Scorecard

Fecha: 2026-03-03T12:11:33.468Z
Dominio: https://bienestarenclaro.com
Baseline fuente: seo-eval-baseline-20260303-084933.json

## Resumen Ejecutivo

- Estado global: **FAIL**
- Score ponderado total: **49/100**
- Decision recomendada: **Migrar a server-first para articulos y cerrar brechas de cluster/enlazado**

## Resultado por Dimension

| Dimension | Peso | Score | Estado |
| --- | --- | --- | --- |
| SEO server-first real | 35% | 0 | FAIL |
| Crawl budget + sitemap | 25% | 100 | PASS |
| Enlazado + clusters | 20% | 35 | FAIL |
| Operabilidad + monitoreo | 20% | 85 | PASS |

## Reglas duras (automaticas)

1. PASS server-first >=95%: **NO**
2. Sitemap 200 + mode full + articulos detectados: **SI**
3. Todas las dimensiones en PASS: **NO**

## Evidencia usada por scorecard

1. Baseline tecnico: seo-eval-baseline-20260303-084933.json
2. Link/cluster report: seo-link-cluster-20260303-091109.json

## Diagnostico directo

1. Tu sitemap tecnico esta operativo, pero el HTML inicial de articulos sigue sin metas SEO completas en source.
2. Con estado actual, la arquitectura queda en **FAIL** para SEO server-first estricto.
3. El bloque de enlazado + clusters depende del reporte generado por npm run seo:eval:links.

## Siguiente accion recomendada (P0)

1. Ejecutar migracion server-first para /articulos/[slug] (Next.js App Router o prerender SSR real).
2. Re-ejecutar baseline y exigir PASS_SERVER_FIRST >=95%.
3. Completar score de enlaces/clusters con matriz semantica y evidencia de no-huerfanas.
