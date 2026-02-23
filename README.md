# Bienestar en Claro

Plataforma web de bienestar con:
- Sitio público editorial.
- Panel de administración tipo CMS SaaS.
- Integración con Supabase.
- SEO técnico con `sitemap.xml`, `robots.txt` y `llms.txt`.

## Estado Actual (Feb 2026)

- Frontend en React + Vite + Tailwind.
- Login con `ojito` para mostrar/ocultar contraseña.
- Opción `Mantener sesión iniciada` (persistencia entre reinicios).
- Admin modular con secciones:
  - Dashboard
  - Calendario Editorial
  - CMS de Artículos
  - Comentarios
  - Usuarios
  - Comunidad
  - Configuración global
  - Seguridad (2FA + anti-spam + auditoría)
- Publicación de artículos con trigger de actualización de sitemap:
  - Vía webhook (`VITE_SITEMAP_WEBHOOK_URL`) o
  - Vía Supabase Edge Function (`VITE_SITEMAP_FUNCTION_NAME`) o
  - En el próximo build/deploy.
- Optimización de imágenes internas:
  - Primario en servidor vía Edge Function `image-optimize`.
  - Fallback local en navegador si no hay función configurada.
- Artículo local de respaldo integrado:
  - `higado-graso-en-chile-que-significa-tu-diagnostico-y-que-puedes-hacer-desde-hoy`

## Stack

- React 18
- Vite 4
- Tailwind CSS
- Radix UI
- TipTap (editor)
- Supabase JS
- Recharts
- Framer Motion
- React Router

## Requisitos

- Node.js `20.19.1` (ver `.nvmrc`)
- npm 10+

## Instalación y Ejecución

```bash
npm install
npm run dev
```

App local:
- `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:warn
```

`npm run build` ejecuta:
1. `tools/generate-llms.js`
2. `tools/generate-sitemap.js`
3. Build de Vite

## Variables de Entorno

Copia `.env.example` a `.env` y completa valores:

```env
# Dominio público para sitemap/robots
SITE_URL=https://tu-dominio.com

# Supabase (usado por scripts de sitemap)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_supabase_anon_key

# Refresh inmediato de sitemap al publicar (opcional; usa uno)
VITE_SITEMAP_WEBHOOK_URL=
VITE_SITEMAP_FUNCTION_NAME=

# Optimización en servidor de imágenes internas del CMS
VITE_IMAGE_OPTIMIZER_FUNCTION_NAME=image-optimize
```

Notas:
- `.env` está ignorado por git.
- Si no configuras webhook/function, el sitemap se actualiza en cada build/deploy.

## SEO Técnico

Se generan automáticamente en `public/`:
- `sitemap.xml`
- `robots.txt`
- `llms.txt`

El sitemap incluye:
- Rutas estáticas.
- Artículos publicados en Supabase.
- Artículos locales declarados en `src/content/localPublishedArticles.js`.

## Branding e Imágenes

- Logo principal: `public/images/logo.png`
- Imagen artículo hígado graso:
  - `public/images/articles/higado-graso-chile-diagnostico-que-hacer-desde-hoy.jpg`

## Estructura Principal

```text
src/
  components/
    admin/
  content/
    localPublishedArticles.js
  contexts/
  lib/
  pages/
tools/
  generate-sitemap.js
  generate-llms.js
documentos md/
```

## Despliegue en Vercel

Proyecto preparado con:
- `vercel.json` para SPA rewrites.
- Headers de caché para `robots.txt` y `sitemap.xml`.

Flujo sugerido:
1. Configura variables de entorno en Vercel.
2. Despliega (`vercel --prod` o integración Git).
3. Verifica:
   - `/robots.txt`
   - `/sitemap.xml`
   - rutas SPA (`/articulos/...`, `/admin/...`)

## Documentación Interna

Revisa:
- `SUPABASE_SETUP.md`
- Carpeta `documentos md/`

## Consideraciones Técnicas

- Parte de la configuración admin se persiste en `localStorage` (ajustes globales, seguridad local, logs locales, metadatos editoriales).
- El acceso admin en `AdminLoginPage` valida un correo específico; ajustar si se desea multi-admin por roles en backend.
- Se recomienda migrar claves hardcodeadas de Supabase en frontend a variables de entorno `VITE_*` para producción.
