
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mergeWithLocalPublishedArticles } from '@/content/localPublishedArticles';

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      setArticles(mergeWithLocalPublishedArticles(data || []));
    };
    fetchArticles();
  }, []);

  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

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
      </div>
    </div>
  );
};

export default ArticlesListPage;
