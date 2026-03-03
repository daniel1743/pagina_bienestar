# Evaluacion SEO Editorial Avanzado (Crawl Budget + Enlazado Algoritmico + Hub/Spoke)

Fecha base: 2026-03-03  
Proyecto: Bienestar en Claro  
Hosting: Vercel  
Stack actual: Vite SPA + Supabase

## Objetivo

Decidir con evidencia si la arquitectura actual puede escalar SEO editorial profesional o si se debe migrar a modelo server-first para `/articulos/:slug`.

## Estado actual confirmado

1. SPA con `BrowserRouter` en `src/App.jsx`.
2. Head SEO por articulo inyectado en runtime en `src/pages/ArticleDetailPage.jsx`.
3. Sitemap dinamico en `api/sitemap.js` con:
   - filtro por `status/no_index`
   - header `X-Sitemap-Mode`
   - `Cache-Control` por modo `full|fallback`.
4. Editor con guard rails:
   - H1 -> H2
   - bloqueo `data:image/`
   - persistencia SEO en `articles`.

## Alcance de evaluacion

1. Indexabilidad real por HTML inicial (`view-source`).
2. Crawl budget y estructura de sitemap.
3. Enlazado interno automatico y cobertura semantica.
4. Escalabilidad operativa para 500+ articulos.
5. Decision SPA con mitigaciones vs migracion Next.js.

## Entregables obligatorios

1. Baseline tecnico automatico (`ops/seo-evaluations/seo-eval-baseline-*.json|md`).
2. Scorecard final con PASS/FAIL por criterio (`ops/seo-evaluations/SCORECARD_TEMPLATE.md`).
3. Evidencia de GSC y social previews (capturas + conclusiones).
4. Decision arquitectonica cerrada con backlog P0/P1/P2.

## Fase 0 - Baseline y muestra (S)

### 0.1 Ejecutar baseline tecnico

```bash
npm run seo:eval:baseline
```

Salida esperada:

1. `ops/seo-evaluations/seo-eval-baseline-YYYYMMDD-HHMMSS.json`
2. `ops/seo-evaluations/seo-eval-baseline-YYYYMMDD-HHMMSS.md`

### 0.1.b Generar scorecard automatico

```bash
npm run seo:eval:scorecard
```

Salida esperada:

1. `ops/seo-evaluations/seo-eval-scorecard-YYYYMMDD-HHMMSS.json`
2. `ops/seo-evaluations/seo-eval-scorecard-YYYYMMDD-HHMMSS.md`

### 0.1.c Generar evaluacion de enlazado + clusters

```bash
npm run seo:eval:links
```

Salida esperada:

1. `ops/seo-evaluations/seo-link-cluster-YYYYMMDD-HHMMSS.json`
2. `ops/seo-evaluations/seo-link-cluster-YYYYMMDD-HHMMSS.md`

Atajo pipeline completo:

```bash
npm run seo:eval:all
```

### 0.2 Congelar muestra de URLs (30)

1. 10 recientes.
2. 10 antiguas.
3. 10 estrategicas.

Nota:

1. Si quieres forzar URLs estrategicas concretas:

```bash
SEO_EVAL_STRATEGIC_URLS="/articulos/slug-a,/articulos/slug-b,/articulos/slug-c" npm run seo:eval:baseline
```

### 0.3 Capturas GSC

Registrar por cada URL de muestra:

1. En Google.
2. No indexada (motivo exacto).
3. Canonica seleccionada por Google.
4. Fecha ultima rastreada.

## Fase 1 - Validacion SEO server-first real (M)

Comparar para cada URL:

1. `view-source`
2. `Elements > head`
3. DB (`meta_title`, `meta_description`, `canonical_url`, `no_index`)

Criterio por URL:

1. `PASS_SERVER_FIRST`: source trae title + description + canonical + robots correctos.
2. `PARTIAL_SOURCE`: solo parte de metas en source.
3. `FAIL_SOURCE_MISSING`: source no trae metas criticas.

Regla:

1. Si `% PASS_SERVER_FIRST < 95%` para articulos, activar recomendacion de migracion server-first.

## Fase 2 - Crawl budget y sitemap (M)

Verificar:

1. `sitemap.xml` incluye solo `published + no_index=false`.
2. `lastmod` coherente con `updated_at/published_at`.
3. `X-Sitemap-Mode` y cache operando segun diseno.

Definir arquitectura objetivo de sitemaps:

1. `/sitemap.xml` (indice)
2. `/sitemaps/static.xml`
3. `/sitemaps/articles-1.xml`, `/sitemaps/articles-2.xml`, ...
4. `/sitemaps/categories-1.xml`, ...

Regla de volumen:

1. max 5.000 URLs por child sitemap (con margen operativo).

## Fase 3 - Enlazado interno algoritmico + hub/spoke (M/L)

### 3.1 Matriz semantica

Por articulo:

1. tema principal
2. intencion
3. etapa del usuario
4. cluster objetivo

### 3.2 Deteccion tecnica

1. paginas huerfanas (0 links internos entrantes)
2. paginas debiles (<2 enlaces internos relevantes)
3. profundidad >3 clics

### 3.3 Scoring de relacionados

Formula base sugerida:

1. categoria compartida
2. foco keyword compartido
3. overlap semantico titulo/subtitulo
4. recencia
5. autoridad interna

Output esperado:

`{ target_slug, anchor_text, relevance_score, reason }`

Comando soporte:

```bash
npm run seo:eval:links
```

## Fase 4 - Matriz de decision arquitectonica (S)

Comparar 2 opciones:

1. Opcion A: SPA actual + mitigaciones.
2. Opcion B: migracion progresiva Next.js App Router para `/articulos/[slug]`.

Dimensionar:

1. confiabilidad SEO
2. costo/esfuerzo
3. riesgo tecnico
4. velocidad de entrega
5. mantenibilidad

Reglas duras:

1. PASS source <95% -> recomendar migracion Next.
2. Sin mejora de indexacion en 4-8 semanas -> migracion obligatoria.

## Fase 5 - Plan posterior (solo si GO) (L)

1. Piloto 20 articulos.
2. Piloto sitemap segmentado + related links automaticos.
3. Rollout 100% + monitoreo semanal.

## Riesgos y consecuencias

1. Mantener runtime-only para head:
   - indexacion mas lenta o inestable.
2. Sitemap no segmentado al crecer:
   - peor eficiencia de rastreo.
3. Enlazado interno manual:
   - paginas huerfanas y menor distribucion de autoridad.
4. Sin clusters:
   - canibalizacion tematica.
5. Sin baseline:
   - decisiones por percepcion.

## Checklist final (DoD de evaluacion)

1. Baseline tecnico ejecutado y guardado.
2. 30 URLs auditadas con evidencia por URL.
3. Score final por:
   - server-first SEO
   - crawl budget
   - linking/cluster
   - operabilidad
4. Decision unica documentada:
   - mantener SPA + mitigaciones
   - o migrar Next.js
5. Backlog priorizado P0/P1/P2 listo para ejecucion.
