# web-next

App Next.js (App Router) para migracion SEO server-first de articulos.

## Objetivo

Servir `"/articulos/[slug]"` con HTML inicial completo:
1. `title`
2. `meta description`
3. `canonical`
4. `robots`
5. OG/Twitter
6. JSON-LD `Article` y `BreadcrumbList`

## Scripts

```bash
npm install
npm run dev
npm run build
npm run start
```

## Variables de entorno minimas

```env
SITE_URL=https://bienestarenclaro.com
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_opcional
```

## Rutas clave

1. `/articulos/[slug]`
2. `/sitemap.xml`
3. `/robots.txt`
