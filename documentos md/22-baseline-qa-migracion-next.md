# Baseline QA — Migracion Next Server-First

Fecha baseline: 2026-03-03  
Objetivo: congelar muestra de validacion SEO para canary/cutover.

## SLO de migracion

1. `HTML inicial` con metadatos completos en 100% de muestra QA.
2. `0 cambios de URL` en rutas publicas de articulos.
3. `0 downtime` en `/articulos/*` durante canary/cutover.

## Muestra QA (6 slugs)

1. `/articulos/higado-graso-en-chile-que-significa-tu-diagnostico-y-que-puedes-hacer-desde-hoy`
2. `/articulos/cirrosis-hepatica-que-es-senales-y-que-hacer-sin-panico`
3. `/articulos/estrenimiento-causas-habitos-y-cuando-consultar`
4. `/articulos/helicobacterhelicobacter-pylori-que-es-sintomas-y-tratamiento`
5. `/articulos/obesidad-la-enfermedad-metabolica-que-no-empieza-en-la-balanza`
6. `/articulos/resistencia-a-la-insulina-la-raiz-del-sindrome-metabolico-y-como-revertirla`

## Validaciones por URL (debe pasar todo)

1. `title` especifico de articulo, no generico.
2. `meta description` presente y alineada con DB.
3. `canonical` absoluta hacia su propia URL.
4. `robots` correcto segun `no_index`.
5. `og:title`, `og:description`, `og:image` presentes.
6. `twitter:card`, `twitter:title`, `twitter:description` presentes.
7. JSON-LD `Article` y `BreadcrumbList` presentes.

## Criterios go/no-go

1. Go canary:
   - 6/6 URLs PASS en flow estable y flow canary.
2. Go cutover:
   - 6/6 PASS por 3 dias consecutivos en canary.
3. No-go:
   - cualquier desalineacion canonical/robots o ausencia de metadata en source HTML.
