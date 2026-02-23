# image-optimize (Supabase Edge Function)

Optimiza imágenes para el editor del CMS:

- Convierte a WebP.
- Redimensiona a máximo 1600px de ancho.
- Comprime en pasos de calidad (80% a 60%).
- Rechaza si no baja de 300KB.

## Deploy

```bash
supabase functions deploy image-optimize
```

## Request JSON

```json
{
  "imageBase64": "<base64 sin prefijo data:...>",
  "fileName": "imagen-original.jpg",
  "fileType": "image/jpeg",
  "maxBytes": 307200,
  "maxWidth": 1600,
  "qualityStart": 80,
  "qualityMin": 60
}
```

## Response JSON

```json
{
  "ok": true,
  "fileName": "imagen-original.webp",
  "contentType": "image/webp",
  "sizeBytes": 245812,
  "width": 1600,
  "height": 900,
  "quality": 0.75,
  "base64": "<contenido-webp-base64>"
}
```
