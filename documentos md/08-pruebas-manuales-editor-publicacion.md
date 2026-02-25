# 08 - Pruebas manuales editor/publicación

Fecha: 25 de febrero de 2026

## Caso principal
1. Ir a `Admin > CMS Artículos`.
2. Crear o abrir artículo.
3. En el editor aplicar:
   - `H2`
   - párrafo normal
   - lista `ul`
   - bloque `blockquote`
   - enlace externo
   - imagen interna con caption
4. Guardar y publicar.
5. Abrir el artículo público por su `slug`.

## Verificación técnica esperada
1. En página pública, inspeccionar `.editorial-content` y confirmar:
   - existe `<h2>`
   - existe `<ul>` con `<li>`
   - existe `<blockquote>`
   - existe `<a href="...">` y, si es externo, con `target="_blank"` + `rel="noopener noreferrer"`
   - existe `<img ... loading="lazy" decoding="async">`
2. Confirmar que los tamaños y pesos de `H2/H3` son visualmente distintos de `<p>`.
3. Confirmar sangría correcta de listas y bloque de cita con borde.
4. Confirmar modo oscuro y claro en `.editorial-content`.

## Seguridad
1. Insertar manualmente contenido con `<script>alert(1)</script>` en el cuerpo (desde modo código/pegado).
2. Guardar y publicar.
3. Verificar que el script no aparece en DOM final.
4. Probar `href="javascript:alert(1)"` en enlaces y confirmar que se sanea.

## UX del editor
1. Seleccionar texto y validar `bubble menu` (H2/H3, negrita, cursiva, subrayado, enlace).
2. Click derecho dentro del editor y validar menú contextual:
   - H2/H3/H4
   - párrafo
   - negrita/cursiva/subrayado
   - listas/cita/código
   - insertar/quitar enlace
   - insertar imagen
3. Atajos:
   - `Ctrl/Cmd+B` negrita
   - `Ctrl/Cmd+I` cursiva
   - `Ctrl/Cmd+U` subrayado
   - `Ctrl/Cmd+K` enlace
   - `Ctrl/Cmd+Z` deshacer
   - `Ctrl/Cmd+Y` rehacer

## Móvil
1. Abrir vista pública en ancho <= 390px.
2. Confirmar que `H2/H3` mantienen jerarquía y no colapsan a texto plano.
3. Confirmar lectura cómoda de listas, code/pre y blockquote.
