# Configuración de Supabase para Bienestar en Claro

## Bucket de Storage para perfiles

Para que la subida de foto de perfil y portada funcione, debes crear un bucket en Supabase:

1. Ve a tu proyecto Supabase → **Storage** → **New bucket**
2. Nombre: `profiles`
3. **Public bucket**: activado (para que las URLs públicas funcionen)
4. Crea el bucket

### Políticas RLS (Row Level Security)

En el bucket `profiles`, añade una política para permitir que los usuarios autenticados suban y actualicen sus propias imágenes:

**Política: "Usuarios pueden subir su propia carpeta"**
- Operación: INSERT, UPDATE
- Condición (USING/CHECK): `auth.uid()::text = (storage.foldername(name))[1]`
- O bien, en SQL:

```sql
CREATE POLICY "Users can upload own profile files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own profile files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read access for profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');
```

## Tabla `notifications`

Si aún no existe, créala:

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

## Sitemap automático (sin actualización manual)

El proyecto ahora genera `public/sitemap.xml` automáticamente en cada `npm run build` leyendo artículos publicados desde Supabase.

### Variables opcionales para build/deploy

- `SITE_URL`: dominio público final (ejemplo: `https://chactivo.com`)
- `SUPABASE_URL`: URL de tu proyecto Supabase (si no usas la por defecto del repo)
- `SUPABASE_ANON_KEY`: anon key de Supabase (si no usas la por defecto del repo)

### Refresh inmediato al publicar desde el admin (opcional)

Si quieres refresco inmediato al publicar (sin esperar al próximo deploy), configura uno de estos en el frontend:

- `VITE_SITEMAP_WEBHOOK_URL`: endpoint que dispare tu pipeline de deploy
- `VITE_SITEMAP_FUNCTION_NAME`: nombre de una Supabase Edge Function que haga ese trigger

Si no configuras ninguno, la publicación sigue funcionando y el sitemap se refresca automáticamente en el próximo build/deploy.

## Despliegue en Vercel

1. En Vercel, usa el comando de build por defecto del proyecto: `npm run build`.
2. Configura estas variables de entorno en el proyecto de Vercel:
   - `SITE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Opcional para refresh inmediato al publicar:
   - `VITE_SITEMAP_WEBHOOK_URL` o `VITE_SITEMAP_FUNCTION_NAME`
4. El archivo `vercel.json` ya está configurado para:
   - fallback SPA (rutas de React Router),
   - servir correctamente `robots.txt` y `sitemap.xml`.

## Edge Function para optimizar imágenes internas del CMS

Se agregó una función de Supabase:

- Ruta: `supabase/functions/image-optimize/index.ts`
- Nombre recomendado de despliegue: `image-optimize`
- Comportamiento:
  - valida MIME de imagen,
  - redimensiona a ancho máximo 1600px,
  - convierte a WebP,
  - comprime de 80% a 60%,
  - rechaza si no logra quedar bajo 300KB.

### Despliegue

```bash
supabase functions deploy image-optimize
```

### Variable frontend

Configura en `.env` / Vercel:

```env
VITE_IMAGE_OPTIMIZER_FUNCTION_NAME=image-optimize
```

Si no está configurada, el CMS usa fallback local en navegador.
