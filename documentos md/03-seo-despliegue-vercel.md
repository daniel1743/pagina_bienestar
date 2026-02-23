# Categoria: SEO y despliegue Vercel

## Sitemap y robots

- Se creo `tools/generate-sitemap.js`.
- El build ahora genera automaticamente:
  - `public/sitemap.xml`
  - `public/robots.txt`
- El sitemap incluye rutas estaticas y articulos publicados desde Supabase.

## Trigger al publicar

- Al publicar articulo desde admin, se puede disparar refresh remoto de sitemap via:
  - `VITE_SITEMAP_WEBHOOK_URL`, o
  - `VITE_SITEMAP_FUNCTION_NAME`.
- Si no hay trigger remoto configurado, el sitemap queda actualizado en el proximo build/deploy.

## Preparacion Vercel

- `vercel.json` creado con:
  - rewrite SPA para rutas del frontend,
  - headers para `sitemap.xml` y `robots.txt`.
- `.env` y `.env.example` listos para variables de despliegue.

## Scripts

- `package.json` build:
  - `node tools/generate-llms.js || true && node tools/generate-sitemap.js || true && vite build`
