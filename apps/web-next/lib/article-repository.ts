import type { ArticleRecord } from './article-types';
import { fetchSupabaseRest } from './supabase-rest';

const articleFields =
  'id,slug,title,excerpt,content,image_url,author,category,status,created_at,published_at,updated_at,meta_title,meta_description,canonical_url,no_index';

const normalizeSlug = (slug: string) => encodeURIComponent(String(slug || '').trim());

export const getPublishedArticleBySlug = async (slug: string): Promise<ArticleRecord | null> => {
  const safeSlug = normalizeSlug(slug);
  if (!safeSlug) return null;

  const query = `/rest/v1/articles?select=${articleFields}&slug=eq.${safeSlug}&status=eq.published&limit=1`;
  const rows = await fetchSupabaseRest<ArticleRecord>(query);
  if (!rows.length) return null;
  return rows[0];
};

export const getPublishedArticlesForSitemap = async (): Promise<ArticleRecord[]> => {
  const query =
    `/rest/v1/articles?select=slug,status,no_index,updated_at,published_at,created_at` +
    `&status=eq.published&no_index=eq.false&slug=not.is.null&limit=5000`;
  const rows = await fetchSupabaseRest<ArticleRecord>(query);
  return rows
    .filter((item) => item?.slug)
    .sort((a, b) => {
      const aDate = new Date(a.updated_at || a.published_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.published_at || b.created_at || 0).getTime();
      return bDate - aDate;
    });
};

