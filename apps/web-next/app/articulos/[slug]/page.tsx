import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedArticleBySlug, getPublishedArticlesForSitemap } from '@/lib/article-repository';
import { toMetadata } from '@/lib/article-seo-mapper';
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/jsonld';
import { sanitizeRenderedHtml } from '@/lib/html-sanitize';
import { toPublicUrl } from '@/lib/site';

type PageParams = {
  slug: string;
};

type PageProps = {
  params: PageParams;
};

export const revalidate = 300;
export const dynamicParams = true;

const toDateText = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(date);
};

export async function generateStaticParams(): Promise<PageParams[]> {
  try {
    const rows = await getPublishedArticlesForSitemap();
    return rows.slice(0, 100).map((item) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getPublishedArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Artículo no encontrado - Bienestar en Claro',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  return toMetadata(article);
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getPublishedArticleBySlug(params.slug);
  if (!article) {
    notFound();
  }

  const publishedText = toDateText(article.published_at || article.created_at);
  const updatedText = toDateText(article.updated_at);
  const safeHtml = sanitizeRenderedHtml(String(article.content || ''));
  const heroUrl = article.image_url ? toPublicUrl(article.image_url) : '';
  const articleJsonLd = buildArticleJsonLd(article);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(article);

  return (
    <main className="page-wrap">
      <div className="article-card">
        <p className="meta">Inicio / Artículos / {article.title}</p>
        <h1>{article.title}</h1>
        <p className="meta">
          {article.author || 'Bienestar en Claro'}
          {publishedText ? ` · ${publishedText}` : ''}
          {updatedText ? ` · Actualizado ${updatedText}` : ''}
        </p>
        {heroUrl ? <img className="hero" src={heroUrl} alt={article.title} loading="eager" /> : null}
        <article className="article-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
    </main>
  );
}
