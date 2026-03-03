# Plan de Implementacion por Fases (Eficiente y Sin Errores)

Fecha de inicio: 2026-03-03  
Proyecto: Bienestar en Claro  
Estado: En ejecucion

## Objetivo de cierre

1. Activar SEO server-first real en `/articulos/:slug`.
2. Subir score tecnico global de `FAIL` a `PASS`.
3. Reducir paginas huerfanas/debiles con enlazado interno y clusters.
4. Mantener operacion segura con backup + rollback.

## Fase 0 - Preparacion segura (Dia 0)

Estado: `COMPLETADA`

Checklist:

1. Confirmar codigo de SSR articulos implementado (`api/article-ssr.js`).  
2. Confirmar rewrites en `vercel.json`.  
3. Ejecutar baseline tecnico inicial (`npm run seo:eval:all`).  
4. Validar build local (`npm run build`).  
5. Verificar variables en Vercel antes de deploy:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo server).

Gate de salida:

1. Baseline y scorecard generados.
2. Build local sin errores.

## Fase 1 - Activacion SSR en Preview (Dia 1)

Estado: `COMPLETADA`

Checklist:

1. Deploy a preview con cambios SSR de articulos.
2. Validar `view-source` en 3 articulos:
   - `<title>`
   - `<meta name="description">`
   - `<link rel="canonical">`
   - `<meta name="robots">`
   - OG/Twitter
   - JSON-LD
3. Validar headers:
   - `X-Article-SSR: 1`
   - `X-Article-Source: remote|local`
4. Validar que la hidratacion SPA no rompe UI.

Gate de salida:

1. 3/3 URLs con metas SEO en HTML inicial.
2. Sin errores criticos de consola.

## Fase 2 - Deploy Produccion Controlado (Dia 1)

Estado: `COMPLETADA`

Checklist:

1. Backup/tag predeploy.
2. Deploy prod en Vercel.
3. Smoke test:
   - `/` 200
   - `/articulos` 200
   - 5 articulos 200
   - `/sitemap.xml` 200

Gate de salida:

1. Produccion estable sin regresiones funcionales.
2. `view-source` de articulos con SEO completo.

## Fase 3 - Reauditoria Automatica (Dia 1-2)

Estado: `COMPLETADA`

Checklist:

1. Ejecutar `npm run seo:eval:all`.
2. Revisar:
   - `seo-eval-baseline-*.md`
   - `seo-link-cluster-*.md`
   - `seo-eval-scorecard-*.md`

Gate de salida:

1. `PASS_SERVER_FIRST >= 95%`.
2. Score global en mejora clara y sin nuevos fallos criticos.

## Fase 4 - Enlazado Interno + Clusters (Dia 2-7)

Estado: `EN CURSO`

Checklist:

1. Priorizar top 20 huérfanas y top 20 débiles.
2. Añadir 3-5 enlaces internos relevantes por articulo objetivo.
3. Consolidar hubs por categoria.
4. Re-ejecutar `npm run seo:eval:links` por lote.
5. Generar plan automatizado por lotes:
   - `npm run seo:links:plan`

Gate de salida:

1. Orfandad < 20%.
2. Debiles < 35%.
3. Score `Enlazado + clusters` >= 80.

## Fase 5 - Estabilizacion (Semanas 2-4)

Estado: `PENDIENTE`

Checklist:

1. Revisión semanal con `npm run seo:eval:all`.
2. Seguimiento GSC:
   - indexadas
   - descubiertas no indexadas
   - canonical seleccionada.
3. Ajustes de contenido/enlazado por datos.

Gate de salida:

1. Tendencia sostenida de mejora en indexacion y cobertura.

## Controles anti-error (obligatorios)

1. No deploy sin backup/tag predeploy.
2. No cerrar fase sin evidencia en `ops/seo-evaluations`.
3. Rollback inmediato si rompe UI o SEO source.
4. Cambios editoriales en lotes pequenos.

## Evidencia de arranque (se completa en ejecucion)

1. Baseline inicial:
   - `ops/seo-evaluations/seo-eval-baseline-20260303-092658.md`
2. Link/cluster inicial:
   - `ops/seo-evaluations/seo-link-cluster-20260303-092702.md`
3. Scorecard inicial:
   - `ops/seo-evaluations/seo-eval-scorecard-20260303-092704.md`
4. Resultado de arranque:
   - `PASS_SERVER_FIRST=12/12`
   - `Score ponderado=84/100`
   - `Estado global=FAIL` (bloque pendiente: enlazado/clusters)
5. Fecha/hora de inicio real: `2026-03-03`.

## Definicion de terminado (DoD)

1. SEO server-first estable en articulos en produccion.
2. Score tecnico global en `PASS`.
3. Enlazado interno con orfandad bajo umbral.
4. Operacion con backup/rollback y monitoreo semanal activos.
