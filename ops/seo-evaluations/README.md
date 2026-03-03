# SEO Evaluations

Esta carpeta contiene artefactos de evaluacion SEO avanzada:

1. baseline tecnico automatico.
2. scorecards de decision.
3. muestras de URLs auditadas.

## Comando baseline

```bash
npm run seo:eval:baseline
```

Genera:

1. `seo-eval-baseline-YYYYMMDD-HHMMSS.json`
2. `seo-eval-baseline-YYYYMMDD-HHMMSS.md`

## Comando scorecard (PASS/FAIL global)

```bash
npm run seo:eval:scorecard
```

Genera:

1. `seo-eval-scorecard-YYYYMMDD-HHMMSS.json`
2. `seo-eval-scorecard-YYYYMMDD-HHMMSS.md`

Nota:

1. Toma automaticamente el baseline mas reciente.
2. Puedes fijar baseline manual:

```bash
SEO_EVAL_BASELINE_FILE="ops/seo-evaluations/seo-eval-baseline-YYYYMMDD-HHMMSS.json" npm run seo:eval:scorecard
```

## Comando enlazado + clusters

```bash
npm run seo:eval:links
```

Genera:

1. `seo-link-cluster-YYYYMMDD-HHMMSS.json`
2. `seo-link-cluster-YYYYMMDD-HHMMSS.md`

Uso recomendado:

1. `npm run seo:eval:baseline`
2. `npm run seo:eval:links`
3. `npm run seo:eval:scorecard`

Atajo:

```bash
npm run seo:eval:all
```

## Variables opcionales

1. `SITE_URL` (default: `https://bienestarenclaro.com`)
2. `SEO_EVAL_OUTPUT_DIR` (default: `ops/seo-evaluations`)
3. `SEO_EVAL_SAMPLE_RECENT` (default: `10`)
4. `SEO_EVAL_SAMPLE_OLD` (default: `10`)
5. `SEO_EVAL_SAMPLE_STRATEGIC` (default: `10`)
6. `SEO_EVAL_STRATEGIC_URLS` (lista separada por comas)

Ejemplo:

```bash
SEO_EVAL_STRATEGIC_URLS="/articulos/slug-a,/articulos/slug-b" npm run seo:eval:baseline
```
