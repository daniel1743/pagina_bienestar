# Uso del Editor CMS Profesional

## Objetivo

Este editor está diseñado para crear artículos largos con estructura editorial clara, SEO integrado e inserción de imágenes explicativas.

## 1) Estructura Editorial

- `H1`: se controla desde el campo **Título** del artículo.
- En el cuerpo usa:
  - `H2` para secciones principales.
  - `H3` para subsecciones.
  - `H4` para detalles puntuales.

Recomendación:
- Mantén bloques de texto cortos.
- Usa subtítulos cada 2-4 párrafos.

## 2) Toolbar Profesional

La barra del editor es fija y contiene:

- Formatos: negrita, cursiva, subrayado, tachado, código inline.
- Headings: H2, H3, H4 + botón rápido insertar H2.
- Color limitado a paleta editorial:
  - Azul institucional.
  - Gris oscuro.
- Listas:
  - Viñetas.
  - Numerada.
  - Checklist.
- Bloques:
  - Cita destacada.
  - Tabla.
  - Separador horizontal.
  - Bloque resumen.
  - Bloque advertencia.
- Enlaces:
  - Internos y externos.
  - Opción “Abrir en nueva pestaña”.
  - En externos se aplica `rel="noopener noreferrer"`.

## 3) Imágenes Internas (2 a 4 recomendadas)

### Flujo

1. Selecciona archivo en “Imágenes internas”.
2. El sistema optimiza automáticamente:
   - Convierte a `WebP`.
   - Redimensiona si supera `1600px` de ancho.
   - Comprime progresivamente (80% a 60%) hasta quedar bajo `300KB`.
   - Prioriza optimización en servidor (Edge Function) si está configurada.
3. Verás loader durante optimización y luego peso/tamaño final.
4. Define:
   - ALT (obligatorio).
   - Descripción/caption (opcional).
   - Posición: ancho completo, centrada o con caption.
5. Inserta con botón **Insertar imagen**.

### Reglas editoriales

- Máximo técnico: `4` imágenes internas por artículo.
- Peso máximo por imagen: `300KB`.
- Formato sugerido: `WebP`.
- El sistema fuerza formato final `WebP` y nombre SEO automático:
  `palabras-clave-separadas-por-guiones.webp`.
- Evita imágenes decorativas; cada imagen debe explicar algo.
- Si no logra bajar de 300KB con calidad mínima 60%, se rechaza el archivo.
- Si el optimizador servidor no está disponible, se usa fallback local en navegador.

## 4) SEO Integrado

Campos disponibles:

- Slug (auto + editable).
- Meta title (contador y advertencia si pasa 60).
- Meta description (contador y advertencia si pasa 160).
- Frase clave principal.
- Frases clave secundarias.
- Canonical.
- No-index.

Validaciones:

- Slug en minúsculas y sin tildes.
- Aviso cuando metas exceden límite recomendado.

## 5) Vista Previa Profesional

La vista previa renderiza:

- Jerarquía tipográfica real (H2/H3/H4).
- Espaciado de lectura.
- Bloques resumen y advertencia.
- Imágenes integradas según posición.

Úsala antes de publicar para confirmar legibilidad en desktop y móvil.

## 6) Publicación y Sitemap

Al guardar con estado `published`:

- Se intenta refresco automático de sitemap vía webhook/function (si está configurado).
- Si no hay endpoint, se actualizará en el siguiente build/deploy.

## 7) Buenas Prácticas Rápidas

- Comienza con 1 H2 fuerte y 2-4 H3.
- Añade 2-3 imágenes explicativas reales.
- Cierra con bloque resumen.
- Incluye advertencia médica contextual al final del contenido.
- Revisa contador SEO antes de publicar.
