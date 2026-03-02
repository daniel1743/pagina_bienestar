# SQL idempotente — Editor + SEO + Sitemap + Medios

## 1) `public.articles` (SEO + updated_at + guard rails)

```sql
begin;

-- Columnas SEO + updated_at
alter table if exists public.articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists canonical_url text,
  add column if not exists no_index boolean not null default false,
  add column if not exists focus_keyword text,
  add column if not exists secondary_keywords text,
  add column if not exists updated_at timestamptz;

-- Backfill updated_at
update public.articles
set updated_at = coalesce(updated_at, published_at, created_at, now())
where updated_at is null;

-- Trigger updated_at
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

-- Guard: normaliza H1->H2 y bloquea data:image en persistencia
create or replace function public.guard_articles_content()
returns trigger
language plpgsql
as $$
begin
  if new.content is not null then
    new.content := regexp_replace(new.content, '<h1(\\s[^>]*)?>', '<h2\\1>', 'gi');
    new.content := regexp_replace(new.content, '</h1>', '</h2>', 'gi');
    if new.content ~* 'data:image/' then
      raise exception 'data:image no permitido en articles.content';
    end if;
  end if;

  if new.image_url is not null and new.image_url ~* '^data:image/' then
    raise exception 'data:image no permitido en articles.image_url';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_articles_content_guard on public.articles;
create trigger trg_articles_content_guard
before insert or update on public.articles
for each row
execute function public.guard_articles_content();

-- Restricciones SEO
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'articles_meta_title_len_chk'
  ) then
    alter table public.articles
      add constraint articles_meta_title_len_chk
      check (meta_title is null or char_length(meta_title) <= 60);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'articles_meta_description_len_chk'
  ) then
    alter table public.articles
      add constraint articles_meta_description_len_chk
      check (meta_description is null or char_length(meta_description) <= 160);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'articles_canonical_url_format_chk'
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

-- Índices
create index if not exists idx_articles_slug on public.articles (slug);
create index if not exists idx_articles_status_published_at on public.articles (status, published_at desc);
create index if not exists idx_articles_updated_at on public.articles (updated_at desc);
create index if not exists idx_articles_no_index on public.articles (no_index);

commit;
```

## 2) Storage bucket `article-images` + policies

```sql
begin;

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = true;

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

-- opcional: update/delete para authenticated
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow authenticated update article-images'
  ) then
    create policy "Allow authenticated update article-images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'article-images')
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
      and policyname = 'Allow authenticated delete article-images'
  ) then
    create policy "Allow authenticated delete article-images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'article-images');
  end if;
end
$$;

commit;
```

## 3) `public.error_reports`

```sql
begin;

create extension if not exists pgcrypto;

create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  message text,
  stack text,
  created_at timestamptz not null default now(),
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

create index if not exists idx_error_reports_created_at on public.error_reports (created_at desc);
create index if not exists idx_error_reports_status on public.error_reports (status);

commit;

notify pgrst, 'reload schema';
```
