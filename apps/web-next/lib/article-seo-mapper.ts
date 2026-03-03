import type { Metadata } from 'next';
import type { ArticleRecord, ArticleSeoModel } from './article-types';
import { site, toCanonical, toPublicUrl } from './site';

const truncate = (value: string, max: number) => value.replace(/\s+/g, ' ').trim().slice(0, max);

export const mapArticleSeo = (article: ArticleRecord): ArticleSeoModel => {
  const titleBase = String(article.meta_title || article.title || site.name).trim();
  const title = titleBase.toLowerCase().includes(site.name.toLowerCase())
    ? titleBase
    : `${titleBase} - ${site.name}`;
  const description = truncate(
    String(article.meta_description || article.excerpt || site.defaultDescription),
    170,
  );
  const canonical = toCanonical(article.slug, article.canonical_url);
  const robots = article.no_index ? 'noindex, nofollow' : 'index, follow';
  const imageUrl = toPublicUrl(article.image_url);
  return { title, description, canonical, robots, imageUrl };
};

export const toMetadata = (article: ArticleRecord): Metadata => {
  const seo = mapArticleSeo(article);
  const indexable = seo.robots === 'index, follow';
  const publishedTime = article.published_at || article.created_at || new Date().toISOString();
  const modifiedTime = article.updated_at || article.published_at || article.created_at || new Date().toISOString();

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonical,
    },
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'es_CL',
      url: seo.canonical,
      siteName: site.name,
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: seo.imageUrl,
        },
      ],
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.imageUrl],
    },
  };
};
