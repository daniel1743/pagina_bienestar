
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mergeWithLocalPublishedArticles } from '@/content/localPublishedArticles';
import { fetchPublishedArticles, getArticleTimestamp } from '@/lib/articleQueries';
import { resolveArticleImageUrl } from '@/lib/articleImage';

const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const formatArticleDate = (article) => {
  const value = article?.published_at || article?.updated_at || article?.created_at;
  if (!value) return 'Fecha reciente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha reciente';
  return date.toLocaleDateString('es-CL');
};

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const categoryFilter = normalizeSearchText(searchParams.get('categoria') || '');

  useEffect(() => {
    const fetchArticles = async () => {
      const { data: remoteArticles } = await fetchPublishedArticles();
      const merged = mergeWithLocalPublishedArticles(remoteArticles);
      const sorted = [...merged].sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));
      setArticles(sorted);
    };
    fetchArticles();
  }, []);

  const indexedArticles = useMemo(
    () =>
      articles.map((article) => {
        const searchableBlob = [
          article.title,
          article.excerpt,
          article.category,
          article.slug,
          article.author,
        ]
          .filter(Boolean)
          .join(' ');

        return {
          ...article,
          _searchIndex: normalizeSearchText(searchableBlob),
          _categoryNormalized: normalizeSearchText(article.category || ''),
          _slugNormalized: normalizeSearchText(article.slug || ''),
        };
      }),
    [articles],
  );

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeSearchText(search);
    const searchTerms = normalizedSearch.split(/\s+/).filter(Boolean);

    return indexedArticles.filter((article) => {
      const titleMatches =
        searchTerms.length === 0 || searchTerms.every((term) => article._searchIndex.includes(term));

      if (!categoryFilter) return titleMatches;

      const diagnosticsBucket = categoryFilter === 'diagnosticos';
      const categoryMatches =
        article._categoryNormalized.includes(categoryFilter) ||
        article._slugNormalized.includes(categoryFilter) ||
        (diagnosticsBucket &&
          (article._slugNormalized.includes('diagnostico') ||
            article._slugNormalized.includes('higado') ||
            article._categoryNormalized.includes('higado') ||
            article._categoryNormalized.includes('insulina')));

      return titleMatches && categoryMatches;
    });
  }, [indexedArticles, search, categoryFilter]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 text-slate-900 dark:bg-background dark:text-foreground">
      <Helmet><title>Artículos - Bienestar en Claro</title></Helmet>
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="mb-2 text-sm text-slate-500 dark:text-muted-foreground">
              <Link to="/" className="hover:text-emerald-500 dark:hover:text-primary">Inicio</Link> &gt; Artículos
            </nav>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground">Todos los Artículos</h1>
          </div>
          <Input 
            type="search" 
            placeholder="Buscar artículos..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs border-slate-300 bg-white text-slate-900 dark:border-border dark:bg-card dark:text-foreground"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((article) => {
            const coverImageUrl = resolveArticleImageUrl(article.image_url);
            return (
            <Link key={article.id} to={`/articulos/${article.slug}`} className="group block">
              <Card className="h-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:border-border dark:bg-card">
                <div className="aspect-video overflow-hidden">
                  {coverImageUrl ? (
                    <img
                      src={coverImageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-100 dark:bg-muted" />
                  )}
                </div>
                <CardContent className="p-6 space-y-3">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 dark:bg-primary/10 dark:text-primary">{article.category}</span>
                  <h3 className="line-clamp-2 text-xl font-bold text-slate-800 group-hover:text-blue-600 dark:text-foreground dark:group-hover:text-primary">{article.title}</h3>
                  <p className="line-clamp-3 text-sm text-slate-600 dark:text-muted-foreground">{article.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 text-xs text-slate-500 dark:text-muted-foreground">
                    <span>{article.author}</span>
                    <span>{formatArticleDate(article)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-border dark:bg-card dark:text-muted-foreground">
            No encontramos artículos con ese criterio. Prueba con palabras como "higado",
            "insulina", "inflamacion" o "metabolismo".
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ArticlesListPage;
