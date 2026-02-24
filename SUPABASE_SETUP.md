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

## Tabla `error_reports` (tickets de Reportar error)

Si aún no existe, crea la tabla:

```sql
CREATE TABLE error_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  detail TEXT NOT NULL CHECK (char_length(detail) <= 500),
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  source_path TEXT,
  status TEXT NOT NULL DEFAULT 'nuevo',
  email_status TEXT NOT NULL DEFAULT 'pendiente',
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_error_reports_created_at ON error_reports(created_at DESC);
CREATE INDEX idx_error_reports_status ON error_reports(status);
CREATE INDEX idx_error_reports_email ON error_reports(reporter_email);
```

Políticas básicas (ajusta según tu modelo de seguridad):

```sql
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert error reports"
ON error_reports FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated can read error reports"
ON error_reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can update error reports"
ON error_reports FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
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

## Edge Function para correo de ticket de error

Se agregó una función de Supabase:

- Ruta: `supabase/functions/report-ticket/index.ts`
- Nombre recomendado de despliegue: `report-ticket`

### Despliegue

```bash
supabase functions deploy report-ticket
```

### Variables de entorno (Supabase Functions)

- `RESEND_API_KEY` (requerida)
- `REPORT_TICKET_FROM_EMAIL` (opcional)
- `REPORT_TICKET_REPLY_TO` (opcional)

### Variable frontend

Configura en `.env` / Vercel:

```env
VITE_REPORT_TICKET_FUNCTION_NAME=report-ticket
```
