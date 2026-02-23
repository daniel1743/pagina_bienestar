
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import CommentsSection from '@/components/CommentsSection';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { getLocalPublishedArticleBySlug } from '@/content/localPublishedArticles';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [saved, setSaved] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isLocalArticle = Boolean(article?.is_local) || String(article?.id || '').startsWith('local-');

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (data) {
        setArticle(data);
        return;
      }
      setArticle(getLocalPublishedArticleBySlug(slug));
    };
    fetchArticle();
  }, [slug]);

  useEffect(() => {
    const checkSaved = async () => {
      if (!currentUser || !article?.id || isLocalArticle) return;
      const { data } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('article_id', article.id)
        .maybeSingle();
      setSaved(!!data);
    };
    checkSaved();
  }, [currentUser?.id, article?.id, isLocalArticle]);

  const toggleSave = async () => {
    if (!currentUser || !article || isLocalArticle) return;
    setSavingId(article.id);
    try {
      if (saved) {
        await supabase.from('saved_articles').delete().eq('user_id', currentUser.id).eq('article_id', article.id);
        setSaved(false);
        toast({ title: 'Eliminado de guardados', description: 'Se ha quitado de tus artículos guardados.' });
      } else {
        await supabase.from('saved_articles').insert([{ user_id: currentUser.id, article_id: article.id }]);
        setSaved(true);
        toast({ title: 'Artículo guardado', description: 'Puedes encontrarlo en tu perfil > Artículos guardados.' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  if (!article) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Cargando artículo...</div>;

  return (
    <div className="min-h-screen bg-background py-16 transition-colors duration-300">
      <Helmet>
        <title>{article.title} - Bienestar en Claro</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>
      
      <article className="container mx-auto px-4 max-w-4xl">
        <nav className="text-sm text-muted-foreground mb-8 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link> &gt;{' '}
          <Link to="/articulos" className="hover:text-primary transition-colors">Artículos</Link> &gt;{' '}
          <span className="text-foreground">{article.title}</span>
        </nav>

        <header className="mb-12 text-center">
          <span className="text-xs font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full tracking-widest uppercase mb-6 inline-block">{article.category || 'Salud'}</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-8 leading-tight tracking-tight">{article.title}</h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
            {!isLocalArticle && currentUser ? (
              <Button
                variant={saved ? 'secondary' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={toggleSave}
                disabled={!!savingId}
              >
                {saved ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                {saved ? 'Guardado' : 'Guardar artículo'}
              </Button>
            ) : null}
            <div className="flex items-center gap-2">
            <img 
              src="https://images.unsplash.com/photo-1575383596664-30f4489f9786" 
              alt={article.author || 'Daniel Falcón'} 
              className="w-12 h-12 rounded-full object-cover border-2 border-border shadow-sm"
            />
            <div className="text-left">
              <p className="font-bold text-foreground text-base">{article.author || 'Daniel Falcón'}</p>
              <p>{article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Fecha reciente'} • 5 min de lectura</p>
            </div>
            </div>
          </div>
        </header>

        {article.image_url && (
          <div className="rounded-3xl overflow-hidden shadow-2xl mb-16 relative aspect-video">
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div 
          className="prose prose-lg dark:prose-invert prose-slate max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: article.content || '<p>Contenido no disponible.</p>' }}
        />

        <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 mt-12 mb-12 text-sm text-orange-700 dark:text-orange-400 rounded-r-xl">
          ⚠️ <strong>Descargo médico:</strong> Este artículo es puramente educativo y no constituye consejo médico, diagnóstico ni tratamiento. Consulta siempre a tu médico u otro proveedor de salud calificado con cualquier pregunta que puedas tener sobre una condición médica.
        </div>

        {/* Use the new comments section */}
        {!isLocalArticle ? <CommentsSection articleId={article.id} /> : null}

      </article>
    </div>
  );
};

export default ArticleDetailPage;
