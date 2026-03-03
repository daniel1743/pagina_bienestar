export type ArticleRecord = {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  image_url?: string | null;
  author?: string | null;
  category?: string | null;
  status?: string | null;
  created_at?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  no_index?: boolean | null;
};

export type ArticleSeoModel = {
  title: string;
  description: string;
  canonical: string;
  robots: 'index, follow' | 'noindex, nofollow';
  imageUrl: string;
};
