# Fix Crítico Producción — Supabase Storage + `error_reports`

Fecha: 2026-03-01  
Proyecto: Bienestar en Claro  
Supabase: `kuacuriiueaxjzzgmqtu`

## Objetivo

Corregir errores reales detectados:

1. `Bucket not found: article-images`
2. `rest/v1/error_reports?select=id` devolviendo `404`

---

## SQL Único (copy/paste en Supabase SQL Editor)

```sql
begin;

-- =========================================================
-- T1) Bucket exacto: article-images (público)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update
set public = excluded.public;

-- =========================================================
-- T2) Policies de Storage
-- =========================================================
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow authenticated upload'
  ) then
    create policy "Allow authenticated upload"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'article-images');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read article-images'
  ) then
    create policy "Public read article-images"
    on storage.objects
    for select
    to public
    using (bucket_id = 'article-images');
  end if;
end
$$;

-- =========================================================
-- T3) Tabla error_reports (mínimo + columnas usadas por UI)
-- =========================================================
create extension if not exists pgcrypto;

create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  message text,
  stack text,
  created_at timestamptz not null default now(),

  -- columnas usadas por la app (evita 400 por columnas faltantes)
  ticket_code text,
  title text,
  detail text,
  reporter_name text,
  reporter_email text,
  source_path text,
  status text default 'nuevo',
  email_status text default 'pendiente',
  email_sent_at timestamptz
);

create index if not exists idx_error_reports_created_at
  on public.error_reports (created_at desc);

create index if not exists idx_error_reports_status
  on public.error_reports (status);

commit;
```

---

## Verificación SQL inmediata

```sql
-- Bucket
select id, name, public
from storage.buckets
where id = 'article-images';
```

```sql
-- Policies
select policyname, cmd, roles
from pg_policies
where schemaname='storage'
  and tablename='objects'
  and policyname in ('Allow authenticated upload', 'Public read article-images')
order by policyname;
```

```sql
-- Tabla
select to_regclass('public.error_reports') as error_reports_table;
```

```sql
-- Columnas clave
select column_name
from information_schema.columns
where table_schema='public'
  and table_name='error_reports'
order by ordinal_position;
```

---

## Validación Runtime (obligatoria)

1. Subir imagen desde CMS (featured o inline).
2. Confirmar que se guarda una URL pública con este patrón:
`https://kuacuriiueaxjzzgmqtu.supabase.co/storage/v1/object/public/article-images/...`
3. Abrir esa URL en navegador y verificar `200`.
4. Ver consola:
   - Debe desaparecer `Bucket not found`.
   - Debe desaparecer `rest/v1/error_reports?select=id 404`.

Query de control de imagen:

```sql
select slug, image_url
from public.articles
where slug = '<slug_qa>';
```

---

## Estado de Implementación (este repositorio)

1. `PASS` Código ya sube imágenes a bucket `article-images`: [articleMediaStorage.js](/c:/Users/Lenovo/Downloads/pagina bienestar 2/src/lib/articleMediaStorage.js)
2. `PASS` Código robusto para tabla `error_reports` mínima: [errorReports.js](/c:/Users/Lenovo/Downloads/pagina bienestar 2/src/lib/errorReports.js)
3. `FAIL (pendiente ejecución en Supabase)` Infraestructura remota (bucket/policies/tabla) hasta que ejecutes el SQL arriba.
4. `FAIL (pendiente evidencia runtime)` Confirmación final de desaparición de 404 en producción.
