# Migración Supabase (SEO + CMS) Lista Para Copiar/Pegar

## Objetivo

Dejar la base de datos preparada para:

1. Persistir SEO real en `articles` (`meta_title`, `meta_description`, `canonical_url`, `no_index`, etc.).
2. Corregir el problema de `updated_at` para flujos como sitemap dinámico.
3. Añadir índices útiles para lecturas públicas y admin.

Nota importante:
- Este script no rompe datos existentes.
- Es idempotente (puedes ejecutarlo más de una vez).
- No requiere deploy para ejecutarse en Supabase.
- Sin deploy del frontend, las nuevas columnas no se aprovecharán al 100% en la UI actual.

---

## 1) SQL principal (ejecutar completo)

Pega todo este bloque en **Supabase > SQL Editor** y ejecuta:

```sql
begin;

-- 1) Columnas SEO + soporte updated_at para runtime/sitemap
alter table if exists public.articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists canonical_url text,
  add column if not exists no_index boolean not null default false,
  add column if not exists focus_keyword text,
  add column if not exists secondary_keywords text,
  add column if not exists updated_at timestamptz;

-- 2) Backfill de updated_at en filas existentes
update public.articles
set updated_at = coalesce(updated_at, published_at, created_at, now())
where updated_at is null;

-- 3) Trigger para mantener updated_at automáticamente en cada UPDATE
create or replace function public.set_articles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_articles_updated_at on public.articles;

create trigger trg_articles_updated_at
before update on public.articles
for each row
execute function public.set_articles_updated_at();

-- 4) Restricciones SEO (longitudes recomendadas)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_meta_title_len_chk'
  ) then
    alter table public.articles
      add constraint articles_meta_title_len_chk
      check (meta_title is null or char_length(meta_title) <= 60);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_meta_description_len_chk'
  ) then
    alter table public.articles
      add constraint articles_meta_description_len_chk
      check (meta_description is null or char_length(meta_description) <= 160);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_canonical_url_format_chk'
  ) then
    alter table public.articles
      add constraint articles_canonical_url_format_chk
      check (
        canonical_url is null
        or canonical_url = ''
        or canonical_url ~* '^https?://'
      );
  end if;
end
$$;

-- 5) Índices útiles
create index if not exists idx_articles_slug on public.articles (slug);
create index if not exists idx_articles_status_published_at on public.articles (status, published_at desc);
create index if not exists idx_articles_updated_at on public.articles (updated_at desc);
create index if not exists idx_articles_no_index on public.articles (no_index);

commit;
```

---

## 2) Verificación rápida (ejecutar después)

```sql
-- Ver columnas clave
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'articles'
  and column_name in (
    'meta_title',
    'meta_description',
    'canonical_url',
    'no_index',
    'focus_keyword',
    'secondary_keywords',
    'updated_at'
  )
order by column_name;
```

```sql
-- Ver trigger
select
  trigger_name,
  event_manipulation,
  action_timing
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'articles'
  and trigger_name = 'trg_articles_updated_at';
```

```sql
-- Muestra de artículos recientes
select
  id,
  slug,
  status,
  published_at,
  updated_at,
  meta_title,
  no_index,
  canonical_url
from public.articles
order by created_at desc
limit 10;
```

---

## 3) Opcional: columna para detectar contenido con base64

Si quieres auditar artículos pesados por `data:image/` en `content`:

```sql
select
  id,
  slug,
  length(content) as content_length,
  (content ilike '%data:image/%') as has_base64_image
from public.articles
order by content_length desc
limit 30;
```

---

## 4) Siguiente paso recomendado (cuando quieras)

Cuando estés listo para la parte de app (frontend), hay que mapear estas columnas en:

1. Guardado CMS (`insert/update` en `ArticleManagementModule`).
2. Carga CMS (`loadData/openArticle`).
3. Render público de `<head>` (title, description, canonical, robots noindex).

Sin ese ajuste de código, la DB queda correcta pero la web no consumirá todavía todo el SEO nuevo.

## 5) Siguiente documento recomendado

Para completar medios en Storage y limpieza de base64 legacy:

- `documentos md/10-storage-article-images-y-migracion-legacy.md`
