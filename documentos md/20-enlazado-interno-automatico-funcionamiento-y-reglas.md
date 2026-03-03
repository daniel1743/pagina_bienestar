# Enlazado Interno Automático — Funcionamiento, Reglas y Mejora Continua

Fecha: 2026-03-03  
Proyecto: Bienestar en Claro  
Motor: `tools/seo-link-apply.mjs`

## 1) Objetivo

Automatizar la inserción de enlaces internos entre artículos para reducir páginas huérfanas/débiles y acelerar el cierre del score SEO, evitando ejecución manual artículo por artículo.

## 2) Qué implementa

1. Lee el último reporte de recomendaciones generado por:
   - `npm run seo:eval:links`
2. Filtra candidatos (prioriza huérfanos/débiles).
3. Construye un bloque automático de relacionados por artículo.
4. Inserta/actualiza ese bloque en `articles.content` usando marcadores estables.
5. Genera reporte de ejecución en JSON + MD.

## 3) Marcadores en contenido

El bloque automático queda encapsulado entre:

- `<!-- auto-internal-links:start -->`
- `<!-- auto-internal-links:end -->`

Esto permite re-ejecutar el algoritmo sin duplicar bloques ni romper contenido manual.

## 4) Reglas actuales del algoritmo

1. Solo procesa artículos `published` y `no_index=false`.
2. Toma sugerencias desde `row.related` del reporte link/cluster.
3. No agrega enlaces bajo umbral de relevancia (`min_relevance`, default `35`).
4. No agrega enlaces duplicados (mismo target o mismo anchor en el bloque).
5. No enlaza a sí mismo.
6. Permite excluir slugs (default incluye `para-probar-sanitizacion`).
7. Mantiene intacto el contenido editorial fuera del bloque automático.

## 5) Comandos operativos

## 5.1 Generar recomendaciones base

```bash
npm run seo:eval:links
```

## 5.2 Simulación sin escribir DB (recomendado primero)

```bash
npm run seo:links:apply
```

Equivale a:

```bash
node tools/seo-link-apply.mjs --dry-run
```

## 5.3 Aplicar cambios reales en DB

```bash
node tools/seo-link-apply.mjs --apply
```

## 5.4 Ejemplos de control fino

```bash
node tools/seo-link-apply.mjs --dry-run --limit=5 --max-links=3 --min-relevance=40
node tools/seo-link-apply.mjs --apply --only-slugs=slug-a,slug-b
node tools/seo-link-apply.mjs --apply --skip-slugs=slug-test,slug-demo
node tools/seo-link-apply.mjs --apply --include-strong
```

## 6) Evidencia de salida esperada

Cada corrida genera:

1. `ops/seo-evaluations/seo-link-apply-YYYYMMDD-HHMMSS.json`
2. `ops/seo-evaluations/seo-link-apply-YYYYMMDD-HHMMSS.md`

Campos clave a revisar:

1. `summary.updated`
2. `summary.links_added`
3. `summary.errors`
4. `items[].note`
5. `items[].links`

## 7) Flujo de prueba recomendado

1. Ejecutar `seo:eval:links`.
2. Ejecutar `seo:links:apply` (dry-run).
3. Revisar el MD generado y validar que anchors/targets sean coherentes.
4. Ejecutar `--apply` con `--limit` pequeño (piloto).
5. Re-ejecutar:
   - `npm run seo:eval:links`
   - `npm run seo:eval:scorecard`
6. Confirmar mejora de:
   - `orphan_count`
   - `weak_count`
   - `avg_outlinks`

## 8) Qué mejorar/perfeccionar después

1. Inserción contextual en párrafos (no solo bloque final).
2. Reglas anti-canibalización por keyword principal.
3. Pesos de relevancia por cluster y etapa de intención.
4. Límites por categoría para balancear distribución de autoridad.
5. Verificación automática de anchors repetitivos (calidad semántica).
6. Panel CMS para aprobar/rechazar sugerencias antes de aplicar.
7. Rollback automático por snapshot previo en lote.

## 9) Riesgos conocidos y mitigación

1. Riesgo: anchors genéricos en exceso.
   - Mitigación: subir `min_relevance` y revisar MD antes de `--apply`.
2. Riesgo: enlaces a slugs de baja calidad editorial.
   - Mitigación: usar `--skip-slugs` y limpiar contenido test.
3. Riesgo: sobre-enlazado artificial.
   - Mitigación: mantener `max-links` entre `2..4`.
4. Riesgo: errores de escritura en DB por credenciales.
   - Mitigación: dry-run primero y verificar `SUPABASE_SERVICE_ROLE_KEY`.

## 10) Definición de éxito operativo

1. `orphan_ratio < 20%`
2. `weak_ratio < 35%`
3. `avg_outlinks >= 2.5`
4. `seo:eval:scorecard` en `PASS` global.
