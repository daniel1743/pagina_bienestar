# Storage `article-images` + migración legacy base64 (copy/paste)

## Objetivo

1. Crear/configurar bucket público `article-images`.
2. Permitir lectura pública y subida para usuarios autenticados.
3. Ejecutar migración de artículos legacy con `data:image/`.

---

## 1) SQL idempotente de Storage (Supabase SQL Editor)

```sql
begin;

-- Bucket público para imágenes editoriales
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = true;

-- Lectura pública
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

-- Subida para usuarios autenticados
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated upload article-images'
  ) then
    create policy "Authenticated upload article-images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'article-images');
  end if;
end
$$;

commit;
```

---

## 2) Verificación rápida

```sql
select id, name, public
from storage.buckets
where id = 'article-images';
```

```sql
select policyname, cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in (
    'Public read article-images',
    'Authenticated upload article-images'
  )
order by policyname;
```

---

## 3) Migración legacy base64 (script)

Archivo:
- `tools/migrate-article-base64-images.mjs`

Requisitos:
1. `SUPABASE_URL`
2. `SUPABASE_SERVICE_ROLE_KEY`

### 3.1 Dry run (recomendado primero)

```bash
node tools/migrate-article-base64-images.mjs --dry-run
```

### 3.2 Dry run con filtro

```bash
node tools/migrate-article-base64-images.mjs --dry-run --limit=20
```

```bash
node tools/migrate-article-base64-images.mjs --dry-run --slug=tu-slug
```

### 3.3 Aplicar migración real

```bash
node tools/migrate-article-base64-images.mjs --apply --limit=20
```

### 3.4 Aplicar por slug específico

```bash
node tools/migrate-article-base64-images.mjs --apply --slug=tu-slug
```

El script imprime resumen + JSON final con:
1. `scanned`
2. `withBase64`
3. `imagesFound`
4. `imagesMigrated`
5. `articlesUpdated`
6. `errors`

---

## 4) Query de control post-migración

```sql
select
  id,
  slug,
  (content ilike '%data:image/%') as content_has_base64,
  (image_url ilike 'data:image/%') as featured_has_base64
from public.articles
where content ilike '%data:image/%'
   or image_url ilike 'data:image/%'
order by created_at desc
limit 100;
```
