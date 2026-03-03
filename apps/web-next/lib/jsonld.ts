import type { ArticleRecord } from './article-types';
import { mapArticleSeo } from './article-seo-mapper';
import { site } from './site';

const esc = (value: unknown) => String(value || '').replace(/</g, '\\u003c');

export const buildArticleJsonLd = (article: ArticleRecord) => {
  const seo = mapArticleSeo(article);
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: String(article.title || site.name).slice(0, 180),
    description: seo.description,
    image: [seo.imageUrl],
    datePublished: article.published_at || article.created_at || new Date().toISOString(),
    dateModified: article.updated_at || article.published_at || article.created_at || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || site.name,
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: {
        '@type': 'ImageObject',
        url: `${site.defaultUrl}/branding/logo-horizontal.png`,
      },
    },
    mainEntityOfPage: seo.canonical,
    articleSection: article.category || 'Bienestar',
  };
  return esc(JSON.stringify(payload));
};

export const buildBreadcrumbJsonLd = (article: ArticleRecord) => {
  const seo = mapArticleSeo(article);
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: site.defaultUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Artículos',
        item: `${site.defaultUrl}/articulos`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: seo.canonical,
      },
    ],
  };
  return esc(JSON.stringify(payload));
};
