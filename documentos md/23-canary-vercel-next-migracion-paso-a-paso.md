# Canary en Vercel para Migracion Next (Server-First) — Paso a Paso

Fecha: 2026-03-03  
Proyecto: Bienestar en Claro  
Objetivo: activar canary de migracion a Next para `/articulos/*` sin riesgo de caida.

## 1) Resumen de que vas a hacer (manual)

1. Crear un proyecto Vercel nuevo para `apps/web-next`.
2. Publicarlo en subdominio (ejemplo: `next.bienestarenclaro.com`).
3. Activar canary en el proyecto actual (SPA) con 10% de trafico humano.
4. Redeploy del proyecto actual.
5. Verificar header `X-Article-Canary` y comportamiento.
6. Tener rollback inmediato listo.

## 2) Prerrequisitos

1. Repo con cambios ya subidos a git.
2. Build local de Next ya pasa:
   - `npm run next:build`
3. Variables de Supabase correctas (ya las tienes).

## 3) Parte A — Deploy del proyecto Next (`apps/web-next`)

## 3.1 Crear proyecto en Vercel

1. Vercel Dashboard -> `Add New...` -> `Project`.
2. Selecciona el mismo repositorio.
3. En `Root Directory`, elige: `apps/web-next`.
4. Framework detectado: `Next.js`.
5. Deploy inicial.

## 3.2 Variables de entorno del proyecto Next

En `Settings -> Environment Variables` agrega:

1. `SITE_URL=https://bienestarenclaro.com`
2. `NEXT_PUBLIC_SUPABASE_URL=https://kuacuriiueaxjzzgmqtu.supabase.co`
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>`
4. `SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key>` (opcional, recomendado server-side)

Notas:
1. Nunca usar `SERVICE_ROLE` en frontend cliente.
2. Aquí se usa solo en runtime server de Next.

## 3.3 Dominio canary

1. `Settings -> Domains`.
2. Agrega: `next.bienestarenclaro.com`.
3. Espera estado `Valid Configuration`.

## 4) Parte B — Activar canary en el proyecto actual (SPA)

Este paso usa el router `api/article-canary.js` ya implementado.

## 4.1 Variables en proyecto actual (SPA)

En `Settings -> Environment Variables` del proyecto actual agrega/actualiza:

1. `NEXT_CANARY_ENABLED=true`
2. `NEXT_CANARY_PERCENT=10`
3. `NEXT_CANARY_ORIGIN=https://next.bienestarenclaro.com`

## 4.2 Redeploy

1. Haz `Redeploy` del proyecto actual.
2. Espera deployment `Ready`.

## 5) Validacion en 10 minutos (checklist exacto)

Usa 3 URLs de muestra:

1. `https://bienestarenclaro.com/articulos/obesidad-la-enfermedad-metabolica-que-no-empieza-en-la-balanza`
2. `https://bienestarenclaro.com/articulos/higado-graso-en-chile-que-significa-tu-diagnostico-y-que-puedes-hacer-desde-hoy`
3. `https://bienestarenclaro.com/articulos/helicobacterhelicobacter-pylori-que-es-sintomas-y-tratamiento`

## 5.1 Verificar headers en navegador (manual)

1. Abrir URL en Chrome.
2. DevTools -> `Network`.
3. Clic en request principal del documento.
4. Revisar `Response Headers`.

Esperado en `X-Article-Canary`:
1. `canary`: usuario fue enviado al Next.
2. `stable-human`: se quedo en flujo estable.
3. `stable-bot`: bots forzados al estable.

## 5.2 Forzar cookie para probar ambos caminos

En consola del navegador:

Forzar canary:
```js
document.cookie = "seo_next_canary=1; path=/";
location.reload();
```

Forzar estable:
```js
document.cookie = "seo_next_canary=0; path=/";
location.reload();
```

Limpiar cookie:
```js
document.cookie = "seo_next_canary=; Max-Age=0; path=/";
location.reload();
```

## 5.3 Verificar SEO en el flujo canary

En una URL que vaya por canary, correr:
```js
JSON.stringify({
  path: location.pathname,
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content || null,
  canonical: document.querySelector('link[rel="canonical"]')?.href || null,
  robots: document.querySelector('meta[name="robots"]')?.content || null,
  ogTitle: document.querySelector('meta[property="og:title"]')?.content || null
}, null, 2)
```

PASS si:
1. `title` especifico de articulo.
2. `description` presente.
3. `canonical` correcta.
4. `robots` correcto (`index, follow` en indexables).
5. `ogTitle` presente.

## 6) Rollback inmediato (si algo falla)

1. En proyecto actual, poner:
   - `NEXT_CANARY_ENABLED=false`
2. Redeploy.
3. Verificar que `/articulos/*` vuelve a flujo estable.

Tiempo objetivo rollback: < 15 minutos.

## 7) Escalado recomendado de canary

Solo si todo PASS:
1. 10% por 24-48h.
2. 25% por 24h.
3. 50% por 24h.
4. 100% por 3-7 dias.

Si hay regresion:
1. volver a 10% o desactivar canary.
2. corregir y reintentar.

## 8) Seguridad Next (pendiente)

Detectaste warning en `next@14.2.25` por vulnerabilidad.

Plan:
1. Estabilizar canary primero.
2. Luego actualizar Next a version parcheada.
3. Rebuild + redeploy + smoke test.

## 9) Registro de ejecucion (rellenar)

1. Fecha/hora activacion canary:
2. Deployment SPA:
3. Deployment Next:
4. Resultado validacion 3 URLs:
5. Decision:
   - Continuar canary
   - Escalar porcentaje
   - Rollback
