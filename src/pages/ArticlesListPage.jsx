
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mergeWithLocalPublishedArticles } from '@/content/localPublishedArticles';

const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const categoryFilter = normalizeSearchText(searchParams.get('categoria') || '');

  useEffect(() => {
    const fetchArticles = async () => {
      const primary = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('updated_at', { ascending: false });

      let remoteArticles = primary.data || [];
      if (primary.error) {
        const fallback = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('updated_at', { ascending: false });
        remoteArticles = fallback.data || [];
      }

      setArticles(mergeWithLocalPublishedArticles(remoteArticles));
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
    <div className="min-h-screen bg-slate-50 py-12">
      <Helmet><title>Artículos - Bienestar en Claro</title></Helmet>
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="text-sm text-slate-500 mb-2">
              <Link to="/" className="hover:text-emerald-500">Inicio</Link> &gt; Artículos
            </nav>
            <h1 className="text-3xl font-bold text-slate-900">Todos los Artículos</h1>
          </div>
          <Input 
            type="search" 
            placeholder="Buscar artículos..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs bg-white text-slate-900 border-slate-300"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(article => (
            <Link key={article.id} to={`/articulos/${article.slug}`} className="group block">
              <Card className="h-full border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={article.image_url} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6 space-y-3">
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{article.category}</span>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2">{article.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3">{article.excerpt}</p>
                  <div className="pt-4 flex justify-between items-center text-xs text-slate-500">
                    <span>{article.author}</span>
                    <span>{new Date(article.published_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No encontramos artículos con ese criterio. Prueba con palabras como "higado",
            "insulina", "inflamacion" o "metabolismo".
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ArticlesListPage;
