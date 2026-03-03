# SEO Evaluation Scorecard

Fecha: 2026-03-03T14:09:53.776Z
Dominio: https://bienestarenclaro.com
Baseline fuente: seo-eval-baseline-20260303-092658.json

## Resumen Ejecutivo

- Estado global: **FAIL**
- Score ponderado total: **86/100**
- Decision recomendada: **Priorizar enlazado interno por lotes y consolidacion de clusters semanticos**

## Resultado por Dimension

| Dimension | Peso | Score | Estado |
| --- | --- | --- | --- |
| SEO server-first real | 35% | 100 | PASS |
| Crawl budget + sitemap | 25% | 100 | PASS |
| Enlazado + clusters | 20% | 44 | FAIL |
| Operabilidad + monitoreo | 20% | 85 | PASS |

## Reglas duras (automaticas)

1. PASS server-first >=95%: **SI**
2. Sitemap 200 + mode full + articulos detectados: **SI**
3. Todas las dimensiones en PASS: **NO**

## Evidencia usada por scorecard

1. Baseline tecnico: seo-eval-baseline-20260303-092658.json
2. Link/cluster report: seo-link-cluster-20260303-110944.json

## Diagnostico directo

1. SEO server-first en source HTML de articulos: PASS en la muestra actual.
2. Sitemap/crawl budget tecnico: PASS (endpoint y señales base correctas).
3. Enlazado interno + clusters: FAIL; alta orfandad/debilidad en la red interna.
4. Operabilidad y monitoreo: PASS.

## Siguiente accion recomendada (P0)

1. Ejecutar lote 1 de enlazado interno y repetir por lotes con seo:links:plan.
2. Re-correr seo:eval:links y seo:eval:scorecard tras cada lote.
