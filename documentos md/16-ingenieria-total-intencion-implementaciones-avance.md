# Ingenieria Total de la Pagina — Intencion, Implementaciones y Avance

Fecha: 2026-03-03  
Proyecto: Bienestar en Claro  
Hosting: Vercel  
Datos: Supabase (Postgres + Storage)

## 1) Intencion del producto

Construir una plataforma editorial de salud y bienestar con:

1. Publicacion continua de articulos de alto valor.
2. SEO tecnico robusto para indexacion estable en Google.
3. CMS profesional para operacion diaria sin dependencia de codigo.
4. Control de calidad de contenido (sanitizacion + guard rails).
5. Infraestructura operativa segura (backup, recovery, monitoreo).

## 2) Arquitectura actual (real)

1. Frontend:
   - React + Vite (SPA) con React Router.
   - Admin y sitio publico en el mismo proyecto.
2. Backend/API en Vercel Functions:
   - `api/sitemap.js` para sitemap dinamico.
   - `api/article-ssr.js` para SSR SEO de `/articulos/:slug` (implementado, pendiente validar ya desplegado).
3. Base de datos:
   - Supabase `public.articles` como source of truth editorial/SEO.
4. Media:
   - Supabase Storage bucket `article-images` para URLs publicas.
5. Operacion:
   - Scripts en `tools/` para performance, backup, restore y auditoria SEO.

## 3) Implementaciones principales completadas

## 3.1 CMS + Persistencia SEO

1. Persistencia de campos SEO en `articles`:
   - `meta_title`
   - `meta_description`
   - `canonical_url`
   - `no_index`
   - `focus_keyword`
   - `secondary_keywords`
   - `updated_at`
2. Carga de SEO desde DB en flujos `loadData/openArticle/buildRemoteDraft`.
3. Validaciones para evitar dependencia de `localStorage` como fuente principal.

## 3.2 Calidad editorial (guard rails)

1. Sanitizacion HTML centralizada (`sanitizeEditorialHtml`).
2. Reemplazo de `h1` por `h2` en editor y persistencia.
3. Bloqueo de contenido con `data:image/` en guardado.

## 3.3 Medios (peso y performance)

1. Upload de imagen destacada e imagen interna a Supabase Storage.
2. Uso de URL publica final, no base64 nuevo.
3. Flujo legacy disponible para migrar base64 historico por lotes.

## 3.4 Sitemap y observabilidad

1. Sitemap dinamico con filtros:
   - solo publicados
   - exclusion `no_index=true`
2. `X-Sitemap-Mode: full|fallback`.
3. `Cache-Control` controlado por modo.
4. Fallback XML valido ante fallas de DB.

## 3.5 Fixes de infraestructura critica

1. Creacion/normalizacion de bucket `article-images`.
2. Policies de Storage para lectura publica + upload autenticado.
3. Tabla `error_reports` para eliminar 404/errores REST.

## 3.6 Operacion y recuperacion

1. Snapshot de carga (`perf-snapshot`).
2. Backup diario + predeploy (DB + Storage + tags).
3. Runbook de restore DB/Storage.
4. Documentacion de continuidad operativa.

## 3.7 Evaluacion SEO avanzada automatizada

1. Baseline tecnico SEO:
   - `tools/seo-eval-baseline.mjs`
2. Evaluacion de enlazado + clusters:
   - `tools/seo-link-cluster-eval.mjs`
3. Scorecard global PASS/FAIL:
   - `tools/seo-eval-scorecard.mjs`
4. Pipeline integrado:
   - `npm run seo:eval:all`

## 4) Estado de avance consolidado

## 4.1 Logrado

1. CMS funcional con persistencia SEO real en DB.
2. Subida de imagenes a Storage operativa.
3. Nuevas publicaciones sin base64 persistente.
4. Sitemap tecnico operativo y observable.
5. Auditoria automatica de SEO/crawl/linking disponible.
6. Plan operativo de backup/recovery documentado y ejecutable.

## 4.2 En progreso

1. Mejora del enlazado interno real en contenido publicado.
2. Construccion de clusters semanticos editoriales estables.
3. Cierre de score global de evaluacion SEO automatizada.

## 4.3 Brechas actuales (segun scorecard)

1. SEO server-first en source HTML de articulos:
   - estado actual de auditoria tecnica: PASS en la muestra reciente.
2. Enlazado interno:
   - alto nivel de paginas huerfanas/debiles en la muestra.
3. Decision arquitectonica final:
   - mantener SPA con mitigaciones o migrar progresivamente a Next.js.

## 5) Evidencia de avance (artefactos)

1. Reporte implementacion P0:
   - `documentos md/11-reporte-implementacion-cms-seo-sitemap-medios.md`
2. Operacion backup/performance:
   - `documentos md/14-operacion-backup-performance-recovery.md`
3. Plan evaluacion SEO avanzada:
   - `documentos md/15-evaluacion-seo-editorial-avanzado.md`
4. Evidencias runtime:
   - `ops/seo-evaluations/seo-eval-baseline-*.md`
   - `ops/seo-evaluations/seo-link-cluster-*.md`
   - `ops/seo-evaluations/seo-eval-scorecard-*.md`

## 6) Riesgos tecnicos principales

1. Mantener head SEO solo runtime:
   - riesgo: indexacion lenta/inconsistente.
2. Enlazado interno insuficiente:
   - riesgo: baja distribucion de autoridad y cobertura semantica.
3. No completar migracion legacy base64:
   - riesgo: peso HTML mayor en historico.
4. No ejecutar rutina operativa:
   - riesgo: recovery lento ante incidente.

## 7) Proximo hito recomendado

1. Ejecutar plan de enlazado interno por lotes editoriales para bajar orfandad.
2. Re-ejecutar:
   - `npm run seo:eval:all`
3. Confirmar objetivo minimo:
   - orfandad < 20%
   - debiles < 35%
4. Cerrar score global en PASS.

## 8) Conclusión ejecutiva

La ingenieria base del proyecto ya esta montada y operativa para publicar con calidad (CMS, SEO persistente, Storage, sitemap, backup y auditoria).  
Con server-first tecnico ya validado en muestra, el foco critico restante para escalar SEO editorial competitivo es elevar enlazado interno y cluster semantico.
