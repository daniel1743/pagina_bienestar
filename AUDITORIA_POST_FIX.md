# AUDITORIA_POST_FIX

Fecha: 2026-03-02  
Objetivo: validación final de Editor + SEO + Sitemap + Medios antes de publicar contenido real.

## QA Test

Usar slug único:

`qa-{{YYYYMMDD-HHMMSS}}`

Campos QA obligatorios:

1. 1 imagen destacada.
2. 1 imagen interna.
3. 1 `<h1>` en el cuerpo.
4. `meta_title` único.
5. `meta_description` única.
6. `canonical_url` explícita.
7. `no_index=true` inicial.

## E1_DB_PERSISTENCE (PASS/FAIL)

```sql
select
  id,
  slug,
  meta_title,
  meta_description,
  canonical_url,
  no_index,
  focus_keyword,
  secondary_keywords,
  updated_at
from public.articles
where slug = '<slug_qa>';
```

Criterio PASS:

1. Los 4 campos SEO (`meta_title`, `meta_description`, `canonical_url`, `no_index`) existen y tienen el valor esperado.
2. Tras recargar admin, valores se mantienen (no dependen de `localStorage`).

## E2_HEAD_RENDER (PASS/FAIL)

Validación en navegador (obligatoria):

1. Abrir `https://bienestarenclaro.com/articulos/<slug_qa>`.
2. `F12` -> `Elements` -> `head`.
3. Capturar:
   - `<title>`
   - `<meta name="description">`
   - `<link rel="canonical">`
   - `<meta name="robots">`

Criterio PASS:

1. Valores en DOM coinciden con DB para ese slug.
2. Con `no_index=true`, robots debe ser `noindex, nofollow`.

## E3_IMAGE_STORAGE (PASS/FAIL)

```sql
select
  slug,
  image_url,
  (image_url ilike 'data:image/%') as image_url_has_base64,
  (content ilike '%data:image/%') as content_has_base64
from public.articles
where slug = '<slug_qa>';
```

Verificación URL de imagen:

1. Abrir `image_url` en navegador.
2. Confirmar HTTP `200`.

Criterio PASS:

1. `image_url_has_base64=false`.
2. `content_has_base64=false`.
3. `image_url` con patrón `/storage/v1/object/public/article-images/...`.
4. URL responde `200`.

## E4_SANITIZATION (PASS/FAIL)

```sql
select
  slug,
  content,
  (content ~* '<h1[\\s>]') as db_has_h1,
  (content ~* '<h2[\\s>]') as db_has_h2
from public.articles
where slug = '<slug_qa>';
```

Criterio PASS:

1. `db_has_h1=false`.
2. `db_has_h2=true` cuando el contenido original incluía H1.
3. En render público no aparece H1 dentro de cuerpo (solo H1 del título).

## E5_SITEMAP (PASS/FAIL)

Paso 1 (con `no_index=true`):

1. `https://bienestarenclaro.com/sitemap.xml`
2. Confirmar que `<slug_qa>` NO aparece.

Paso 2 (cambiar a `no_index=false`, guardar, esperar convergencia):

1. Volver a abrir `sitemap.xml`.
2. Confirmar que `<slug_qa>` aparece.
3. Copiar 3 URLs del sitemap y comprobar `200`.

Comando opcional (PowerShell):

```powershell
$xml = Invoke-WebRequest -UseBasicParsing https://bienestarenclaro.com/sitemap.xml
$xml.Headers
```

Criterio PASS:

1. Excluye con `no_index=true`.
2. Incluye con `no_index=false`.
3. Header `X-Sitemap-Mode` presente (`full` o `fallback`).
4. `Content-Type=application/xml; charset=utf-8`.

## E6_PERFORMANCE (PASS/FAIL)

Validación DevTools:

1. `F12` -> `Network` -> recargar artículo QA.
2. Seleccionar request `Document`.
3. Guardar:
   - `Transferred`
   - `Size`

Criterio PASS:

1. Documento no inflado (sin blobs/base64 masivo en HTML).
2. `content` DB no contiene `data:image/`.

## SQL de apoyo rápido

```sql
select
  count(*) filter (where content ilike '%data:image/%') as content_base64_count,
  count(*) filter (where image_url ilike 'data:image/%') as featured_base64_count
from public.articles;
```

## Resultado Global

Regla:

1. Si E1..E6 pasan: `PASS`.
2. Si falla uno: `FAIL`.
