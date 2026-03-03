# Ejecucion Lote 1 — Enlazado Interno (Fase 4)

Fecha: 2026-03-03  
Fuente tecnica: `ops/seo-evaluations/seo-link-batch-plan-20260303-093235.md`

## Objetivo

Reducir orfandad/debilidad en los 4 articulos prioritarios de mayor impacto semantico.

## Instrucciones

1. Abrir cada articulo en CMS.
2. Insertar 3 enlaces internos usando los anchors sugeridos.
3. Guardar y publicar.
4. Repetir en los 4 articulos del lote.
5. Al terminar, ejecutar:

```bash
npm run seo:eval:links
npm run seo:eval:scorecard
```

## Articulos del lote 1

## 1) `cirrosis-hepatica-que-es-senales-y-que-hacer-sin-panico`

1. Anchor: `Sobre hígado`  
   URL: `/articulos/higado-graso-en-chile-que-significa-tu-diagnostico-y-que-puedes-hacer-desde-hoy`
2. Anchor: `estreñimiento crónico`  
   URL: `/articulos/estrenimiento-causas-habitos-y-cuando-consultar`
3. Anchor: `Helicobacter pylori: qué es, síntomas y tratamiento`  
   URL: `/articulos/helicobacterhelicobacter-pylori-que-es-sintomas-y-tratamiento`

## 2) `higado-graso-en-chile-que-significa-tu-diagnostico-y-que-puedes-hacer-desde-hoy`

1. Anchor: `Sobre hígado`  
   URL: `/articulos/cirrosis-hepatica-que-es-senales-y-que-hacer-sin-panico`
2. Anchor: `estreñimiento crónico`  
   URL: `/articulos/estrenimiento-causas-habitos-y-cuando-consultar`
3. Anchor: `Obesidad: la enfermedad metabólica que no empieza en la balanza`  
   URL: `/articulos/obesidad-la-enfermedad-metabolica-que-no-empieza-en-la-balanza`

## 3) `obesidad-la-enfermedad-metabolica-que-no-empieza-en-la-balanza`

1. Anchor: `Sobre metabolismo`  
   URL: `/articulos/resistencia-a-la-insulina-la-raiz-del-sindrome-metabolico-y-como-revertirla`
2. Anchor: `Hígado graso en Chile: qué significa tu diagnóstico y qué puedes hacer desde hoy`  
   URL: `/articulos/higado-graso-en-chile-que-significa-tu-diagnostico-y-que-puedes-hacer-desde-hoy`
3. Anchor: `estreñimiento crónico`  
   URL: `/articulos/estrenimiento-causas-habitos-y-cuando-consultar`

## 4) `resistencia-a-la-insulina-la-raiz-del-sindrome-metabolico-y-como-revertirla`

1. Anchor: `Sobre metabolismo`  
   URL: `/articulos/obesidad-la-enfermedad-metabolica-que-no-empieza-en-la-balanza`
2. Anchor: `Hígado graso en Chile: qué significa tu diagnóstico y qué puedes hacer desde hoy`  
   URL: `/articulos/higado-graso-en-chile-que-significa-tu-diagnostico-y-que-puedes-hacer-desde-hoy`
3. Anchor: `estreñimiento crónico`  
   URL: `/articulos/estrenimiento-causas-habitos-y-cuando-consultar`

## Criterio de completitud del lote

1. Los 4 articulos quedan publicados con 3 enlaces internos nuevos cada uno.
2. `npm run seo:eval:links` muestra reduccion de `orphan_count` y/o `weak_count`.
3. No aparecen errores de render en los articulos intervenidos.
