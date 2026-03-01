# Auditoría Técnica Final — Bienestar en Claro

Fecha: 2026-03-01  
Auditoría: Post-implementación P0/P1 (evidencia estricta)

## Resumen Ejecutivo

Estado global de esta auditoría: **FAIL**.

Motivo principal:

1. No hay evidencia runtime completa en producción para R1, R2, R3, R4, R6.
2. No se pudo confirmar trazabilidad de despliegue activo (T1).
3. Se verificó por DB que aún existen artículos con base64 legado (esperable sin migración ejecutada).
4. El script de migración legado no pudo correr ni en dry-run por falta de `SUPABASE_SERVICE_ROLE_KEY`.

Se validó localmente que el código compila y contiene cambios implementados, pero eso **no** cierra auditoría de producción.

---

## Validación por Criterio (PASS / FAIL)

## Aceptación AC1 — NO_BASE64_NEW
Estado: **FAIL**

Evidencia:
1. No existe evidencia QA runtime del artículo nuevo solicitado (`qa-seo-media-audit-*`).
2. Query de lectura muestra base64 en artículos publicados:
   - `scan_totals.rows=5`
   - `scan_totals.contentBase64=5`
   - `scan_totals.imageBase64=4`
3. Falta prueba obligatoria del QA nuevo con:
   - `image_url NOT ILIKE 'data:image/%'`
   - `content NOT ILIKE '%data:image/%'`

## Aceptación AC2 — SEO_PERSISTS_IN_DB
Estado: **FAIL**

Evidencia:
1. No se ejecutó flujo QA en producción con sesión limpia/incógnito.
2. No hay evidencia de persistencia real para un slug QA.
3. Muestra DB tomada no prueba persistencia del flujo nuevo (solo snapshot de un artículo existente con metas nulas).

## Aceptación AC3 — PUBLIC_HEAD_IS_CORRECT
Estado: **FAIL**

Evidencia:
1. No hay captura de DOM `head` en producción del artículo QA.
2. No hay evidencia Search Console URL Inspection (obligatoria por SPA).
3. Solo hay evidencia de código, insuficiente para PASS.

## Aceptación AC4 — SITEMAP_URLS_VALID
Estado: **FAIL**

Evidencia:
1. No se pudo acceder a `https://bienestarenclaro.com/sitemap.xml` desde este entorno:
   - `No se puede establecer una conexión... (127.0.0.1:9)`
2. No hay prueba de inclusión/exclusión del slug QA según `no_index`.
3. No hay validación de 3 URLs sitemap con 200.

## Aceptación AC5 — SITEMAP_MODE_OBSERVABILITY
Estado: **FAIL**

Evidencia:
1. En código sí está implementado `X-Sitemap-Mode` y manejo fallback.
2. No hay evidencia runtime en producción del header.
3. Falta prueba de comportamiento real del endpoint en prod.

## R1 — Sitemap producción
Estado: **FAIL**

Razón:
1. Sin evidencia runtime XML real de producción.
2. Sin prueba QA include/exclude.

## R2 — Persistencia SEO DB
Estado: **FAIL**

Razón:
1. No hay evidencia QA end-to-end con recarga/incógnito.

## R3 — Head público
Estado: **FAIL**

Razón:
1. Sin captura de `Elements > head` en producción.

## R4 — No base64 en contenido nuevo
Estado: **FAIL**

Razón:
1. Sin artículo QA nuevo validado por query.

## R5 — Estado migración legacy
Estado: **FAIL**

Evidencia:
1. Query de lectura confirma base64 en muestra publicada (`contentBase64=5`, `imageBase64=4`).
2. Script legacy en dry-run falló por falta de variable:
   - `Falta SUPABASE_SERVICE_ROLE_KEY. Requerido para migración de medios.`

## R6 — Spotcheck performance
Estado: **FAIL**

Razón:
1. Sin medición de `Document transferred size` antes/después en DevTools.

---

## Evidencia Adjunta

## Evidencia de código (implementado localmente)

1. Sitemap excluye `no_index`, agrega `X-Sitemap-Mode`, fallback explícito:
   - `api/sitemap.js` (select con `no_index`, header `X-Sitemap-Mode`, logs).
2. CMS persiste SEO en payload DB:
   - `src/components/admin/ArticleManagementModule.jsx`
   - campos: `meta_title`, `meta_description`, `canonical_url`, `no_index`, `focus_keyword`, `secondary_keywords`.
3. CMS bloquea guardado con base64:
   - validación `isDataImageUrl(...) || /data:image\//i.test(content)`.
4. Upload a Storage:
   - `src/lib/articleMediaStorage.js`
   - uso en featured + inline desde `ArticleManagementModule`.
5. Head público:
   - `src/pages/ArticleDetailPage.jsx`
   - canonical + robots + description + title.

## Evidencia técnica ejecutada en este entorno

1. Build local:
   - `npm run build` => OK.
2. Producción HTTP desde entorno:
   - `Invoke-WebRequest https://bienestarenclaro.com/sitemap.xml` => FAIL de conectividad local (`127.0.0.1:9`).
3. Consulta lectura Supabase (anon):
   - acceso a `articles` => OK.
   - muestra base64 remanente en muestra de publicados.
4. Dry-run migración legacy:
   - `node tools/migrate-article-base64-images.mjs --dry-run` => FAIL por falta `SUPABASE_SERVICE_ROLE_KEY`.

---

## Riesgos Residuales

1. Riesgo SEO operativo: sin prueba runtime de head no se confirma indexabilidad/canonical real.
2. Riesgo de peso HTML: base64 legacy persiste hasta migración efectiva.
3. Riesgo de observabilidad sitemap: sin evidencia prod no se valida modo `full/fallback`.
4. Riesgo de cierre falso: el código local correcto no implica estado productivo correcto.

---

## Recomendaciones

1. Ejecutar validación QA en producción con slug único y capturas obligatorias.
2. Obtener trazabilidad de despliegue (Deployment ID + commit).
3. Ejecutar SQL de Storage y validar bucket/policies.
4. Ejecutar migración legacy por lotes pequeños (`limit=10..20`) con SERVICE ROLE en entorno seguro.
5. Re-ejecutar esta auditoría con evidencia runtime para actualizar estados a PASS.

### Procedimiento guiado obligatorio (para convertir FAIL a PASS)

1. Crear QA: `qa-seo-media-audit-YYYYMMDD-HHMM`.
2. Publicar con `no_index=true`, 1 featured, 1 inline, y H1 en cuerpo.
3. Ejecutar queries:
```sql
select id, slug, image_url, content
from public.articles
where slug = '<slug_qa>';
```
```sql
select meta_title, meta_description, canonical_url, no_index
from public.articles
where slug = '<slug_qa>';
```
```sql
select
  slug,
  (image_url ilike 'data:image/%') as image_url_has_base64,
  (content ilike '%data:image/%') as content_has_base64
from public.articles
where slug = '<slug_qa>';
```
4. Capturar `Elements > head` del QA (title/description/canonical/robots).
5. Capturar `/sitemap.xml` con QA:
   - `no_index=true` => no aparece
   - `no_index=false` => aparece
6. Tomar 3 URLs del sitemap y validar 200.
7. Eliminar QA, confirmar 404 y salida de sitemap tras convergencia.
8. Correr migración legacy en dry-run/apply con SERVICE ROLE y adjuntar salida.
9. Medir `Document transferred size` antes/después.

---

## Conclusión (Estado Global: PASS / FAIL)

**Estado Global: FAIL**

Criterios con evidencia insuficiente/no verificable en producción: **R1, R2, R3, R4, R5, R6 y AC1–AC5**.  
No se permite cierre exitoso hasta adjuntar evidencia runtime completa por criterio.
