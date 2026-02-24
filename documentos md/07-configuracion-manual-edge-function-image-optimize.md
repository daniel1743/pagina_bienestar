# Configuración Manual (Sin Consola) de `image-optimize`

## Objetivo

Activar la optimización de imágenes en servidor para el CMS:

- Convierte a WebP.
- Redimensiona a máximo 1600px.
- Comprime hasta 300KB.
- Si falla, el CMS usa fallback local automáticamente.

---

## 1) Crear la función en Supabase (UI web)

1. Entra a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Menú lateral: **Edge Functions**.
3. Clic en **Create a new function**.
4. Selecciona **From scratch**.
5. Nombre exacto: `image-optimize`.
6. Abre el editor de la función y pega el contenido de este archivo local:
   - `supabase/functions/image-optimize/index.ts`
7. Guarda los cambios.
8. Pulsa **Deploy** (botón del dashboard).

Nota:
- No necesitas CLI para este paso.
- El código ya incluye CORS.

---

## 2) Configurar variable en Vercel (UI web)

1. Entra al proyecto en Vercel.
2. Ve a **Settings** -> **Environment Variables**.
3. Crea esta variable:
   - `VITE_IMAGE_OPTIMIZER_FUNCTION_NAME` = `image-optimize`
4. Guarda.
5. Haz **Redeploy** del proyecto.

---

## 3) Verificar que quedó activo

1. Entra al panel admin.
2. Abre **CMS Artículos**.
3. En “Imágenes internas”, sube una imagen grande.
4. Debes ver mensaje tipo:
   - `Imagen optimizada automáticamente`
   - `Optimizada (servidor): ...KB ...`

Si ves:
- `Optimizador servidor no disponible ... Se usará optimización local`
entonces la función no quedó activa o no está siendo encontrada por nombre.

---

## 4) Checklist rápido de errores comunes

- Nombre de función mal escrito:
  - Debe ser exactamente `image-optimize`.
- Variable de entorno no aplicada:
  - Revisa que exista en Vercel y redeploy hecho.
- Función no desplegada:
  - Verifica estado en **Supabase -> Edge Functions**.
- Error de permisos/autenticación:
  - Prueba desde sesión iniciada en el admin.

---

## 5) Dónde revisar logs sin consola

En Supabase:
1. **Edge Functions** -> `image-optimize`.
2. Abre **Logs**.
3. Revisa errores al momento de subir imagen desde el CMS.

---

## Referencias internas

- Código función: `supabase/functions/image-optimize/index.ts`
- Setup general: `SUPABASE_SETUP.md`
- Uso del editor: `documentos md/06-uso-editor-cms-profesional.md`
