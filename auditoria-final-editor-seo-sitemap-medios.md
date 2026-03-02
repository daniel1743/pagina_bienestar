# Auditoría Final Editor + SEO + Sitemap + Medios — Validación antes de publicar

Fecha: 2026-03-02  
Dominio auditado: `https://bienestarenclaro.com`  
Artículo QA: `qa-validacion-seo-editor-20260301-214355`

## Resumen Ejecutivo

Estado global: **FAIL**.

Resultado:
1. Persistencia SEO en DB: **PASS**.
2. Render SEO en `<head>` público: **FAIL**.
3. Medios sin base64 en QA nuevo: **PASS**.
4. Sanitización H1 -> H2: **FAIL** (en evidencia QA).
5. Sitemap include/exclude por `no_index`: **FAIL** (exclude sí, include no).
6. Peso de documento/no base64 masivo: **PASS**.

## Resultado por Check (PASS / FAIL)

1. `E1_DB_PERSISTENCE`: **PASS**
   - Evidencia DB QA:
     - `meta_title = "QA Meta Title 20260301-214355"`
     - `meta_description = "QA Meta Description 20260301-214355"`
     - `canonical_url = "https://bienestarenclaro.com/articulos/qa-validacion-seo-editor-20260301-214355"`
     - `no_index = true`
   - Evidencia de código source-of-truth DB:
     - [ArticleManagementModule.jsx](c:/Users/Lenovo/Downloads/pagina bienestar 2/src/components/admin/ArticleManagementModule.jsx:700)
     - [ArticleManagementModule.jsx](c:/Users/Lenovo/Downloads/pagina bienestar 2/src/components/admin/ArticleManagementModule.jsx:405)

2. `E2_HEAD_RENDER`: **FAIL**
   - Evidencia runtime HTTP (`/articulos/qa-validacion-seo-editor-20260301-214355`):
     - `status=200`
     - `<title>Bienestar en Claro</title>` (genérico)
     - `canonical`: no encontrado en source
     - `robots`: no encontrado en source
     - `description`: no encontrado en source
   - No hay evidencia DOM post-hidratación en navegador (captura `Elements > head`) desde este entorno.

3. `E3_IMAGE_STORAGE`: **PASS**
   - Evidencia DB QA:
     - `image_url` usa `.../storage/v1/object/public/article-images/...`
     - `content` **no** contiene `data:image/`
   - Evidencia runtime:
     - URL pública imagen destacada responde `200`, `content-type=image/png`.

4. `E4_SANITIZATION`: **FAIL**
   - Evidencia DB QA:
     - `content` persistido contiene `<h1>H1 de prueba QA</h1>`
     - no se encontró `<h2>` en el contenido persistido.
   - Con la evidencia actual no se valida transformación automática H1->H2 para este flujo QA.

5. `E5_SITEMAP`: **FAIL**
   - Evidencia con `no_index=true`:
     - QA **no** aparece en `sitemap.xml` (correcto).
   - Evidencia tras cambiar a `no_index=false`:
     - QA **no** apareció tras 24 intentos (cada 5s, ~120s).
   - `x-sitemap-mode` no presente en respuesta.
   - `x-vercel-cache=HIT`, `age=342`.

6. `E6_PERFORMANCE`: **PASS**
   - Evidencia runtime:
     - `Document bytes = 4468` en `/articulos/qa-validacion-seo-editor-20260301-214355`.
     - source HTML sin `data:image/`.

## Evidencia Adjunta

1. QA en DB (resumen):
   - `id = 6aa7269b-e231-416e-86a9-7d5fc784bbab`
   - `slug = qa-validacion-seo-editor-20260301-214355`
   - `status = published`
   - `no_index = true` (restaurado tras test)

2. Upload QA:
   - Featured:
     - `https://kuacuriiueaxjzzgmqtu.supabase.co/storage/v1/object/public/article-images/articles/qa-validacion-seo-editor-20260301-214355/featured/1772412235865-gfrdwo.png`
   - Inline:
     - `https://kuacuriiueaxjzzgmqtu.supabase.co/storage/v1/object/public/article-images/articles/qa-validacion-seo-editor-20260301-214355/inline/1772412238727-eqklmz.jpg`

3. Runtime sitemap:
   - `status=200`
   - `x-vercel-cache=HIT`
   - `x-sitemap-mode` ausente
   - QA slug ausente incluso con `no_index=false` durante ventana de prueba.

4. Runtime artículo QA:
   - `status=200`
   - Source sin canonical/robots/description específicos del QA.

## Riesgos Detectados

1. Riesgo SEO crítico: no hay evidencia suficiente de head SEO específico en runtime público.
2. Riesgo indexación/sitemap: comportamiento include por `no_index=false` no validado.
3. Riesgo editorial: sanitización H1->H2 no validada para el flujo QA ejecutado.
4. Riesgo de falso positivo SPA: source HTML puede no reflejar DOM final sin prueba de navegador real.

## Recomendación Final

1. Ejecutar validación manual en navegador real para `E2`:
   - `DevTools > Elements > head` en artículo QA.
   - Capturar `title`, `description`, `canonical`, `robots`.
2. Revalidar `E5` con observabilidad de sitemap desplegada (`X-Sitemap-Mode`) y sin caché stale.
3. Probar `E4` desde el editor CMS (no por inserción directa) con H1 en cuerpo y revisar DB/render.
4. No iniciar publicación masiva hasta cerrar `E2`, `E4`, `E5`.

## Estado Global: PASS / FAIL

**FAIL**
