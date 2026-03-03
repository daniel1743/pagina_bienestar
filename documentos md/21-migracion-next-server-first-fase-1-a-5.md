# Migracion Next Server-First (Fase 1 a 5) — Ejecutado en Repositorio

Fecha: 2026-03-03  
Proyecto: Bienestar en Claro  
Estado: Implementacion tecnica completada (pendiente deploy/canary/cutover en Vercel)

## 1) Que se implemento en codigo

## 1.1 App Next paralela

Ruta: `apps/web-next`

Se creo una app Next.js App Router con:
1. Ruta `app/articulos/[slug]/page.tsx` con render server-first.
2. `generateMetadata` por articulo (title, description, canonical, robots, OG, Twitter).
3. JSON-LD `Article` + `BreadcrumbList` en HTML inicial.
4. ISR configurado con `revalidate = 300`.
5. `app/sitemap.xml/route.ts` y `app/robots.txt/route.ts`.

## 1.2 Capa de datos server-side

Archivos:
1. `apps/web-next/lib/supabase-rest.ts`
2. `apps/web-next/lib/article-repository.ts`
3. `apps/web-next/lib/article-seo-mapper.ts`
4. `apps/web-next/lib/jsonld.ts`
5. `apps/web-next/lib/html-sanitize.ts`

Comportamiento:
1. Lee articulos publicados desde Supabase REST.
2. Usa fallback de metadata:
   - `meta_title || title`
   - `meta_description || excerpt`
   - `canonical_url || /articulos/{slug}`
3. Respeta `no_index` para robots.

## 1.3 Canary router en app actual (rollback inmediato)

Archivo:
1. `api/article-canary.js`

Cambio de routing:
1. `vercel.json` ahora dirige `/articulos/:slug` a `/api/article-canary?slug=:slug`.

Reglas:
1. Si `NEXT_CANARY_ENABLED=false` o falta `NEXT_CANARY_ORIGIN`:
   - sirve flujo estable (`api/article-ssr`).
2. Bots SEO (`googlebot`, `bingbot`, etc):
   - siempre van a flujo estable.
3. Humanos:
   - cookie `seo_next_canary=1/0`.
   - bucket por porcentaje `NEXT_CANARY_PERCENT` (default 10%).
4. Rollback:
   - basta con `NEXT_CANARY_ENABLED=false`.

## 2) Variables de entorno

Se agregaron en `.env.example`:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `NEXT_CANARY_ENABLED`
4. `NEXT_CANARY_PERCENT`
5. `NEXT_CANARY_ORIGIN`

## 3) Checklist de deploy

## 3.1 Deploy app Next (proyecto separado Vercel)

1. Crear proyecto Vercel apuntando a `apps/web-next`.
2. Cargar envs:
   - `SITE_URL=https://bienestarenclaro.com`
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...` (opcional para lecturas privadas)
3. Publicar subdominio canary:
   - ejemplo `next.bienestarenclaro.com`

## 3.2 Activar canary en app actual

1. En proyecto Vercel actual:
   - `NEXT_CANARY_ENABLED=true`
   - `NEXT_CANARY_PERCENT=10`
   - `NEXT_CANARY_ORIGIN=https://next.bienestarenclaro.com`
2. Redeploy.

## 3.3 Validacion obligatoria

1. Abrir 6 slugs QA en modo humano:
   - verificar mezcla de trafico canary/estable (`X-Article-Canary`).
2. Para cada slug (en ambos flujos):
   - `title`, `description`, `canonical`, `robots`.
3. Revisar:
   - `/sitemap.xml`
   - `/robots.txt`
4. Search Console:
   - inspeccion URL para 3 slugs.

## 4) Cutover final

Cuando canary este estable 3-7 dias:
1. Aumentar `NEXT_CANARY_PERCENT` progresivamente (25 -> 50 -> 100).
2. En 100%, mantener 7 dias.
3. Si todo estable, retirar bridge legacy (`api/article-ssr`) en una fase posterior.

## 5) Rollback en menos de 15 minutos

1. Setear `NEXT_CANARY_ENABLED=false`.
2. Redeploy del proyecto actual.
3. Verificar que `/articulos/*` vuelve a `api/article-ssr`.

## 6) Estado de avance por fases del plan

1. Fase 0: lista para cierre operativo (baseline ya existe).
2. Fase 1: completada en codigo.
3. Fase 2: completada en codigo.
4. Fase 3: completada en codigo.
5. Fase 4: completada en codigo, pendiente activacion en Vercel.
6. Fase 5: pendiente ejecucion operativa (cutover gradual + retiro bridge).
