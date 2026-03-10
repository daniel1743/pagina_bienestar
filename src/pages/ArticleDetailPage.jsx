
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import CommentsSection from '@/components/CommentsSection';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { getLocalPublishedArticleBySlug } from '@/content/localPublishedArticles';
import { resolveArticleImageUrl } from '@/lib/articleImage';
import { getEditorialContentDiagnostics, sanitizeEditorialHtml } from '@/lib/editorialContent';

const SITE_URL = String(import.meta.env.VITE_SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, '');

const normalizeAuthor = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const getAuthorPresentation = (authorName) => {
  const normalized = normalizeAuthor(authorName);
  if (normalized.includes('daniel')) {
    return { name: 'Daniel Falcón', avatar: '/images/DANIEL_FALCON.jpeg' };
  }
  return { name: 'Bienestar en Claro', avatar: '/branding/monogram-bc-180.png' };
};
const formatArticleDate = (value) => {
  if (!value) return 'No disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No disponible';
  return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
};

const SITE_ORIGIN = (() => {
  try {
    return new URL(SITE_URL).origin;
  } catch {
    return 'https://bienestarenclaro.com';
  }
})();

const buildCanonicalUrl = (canonicalUrl, slug) => {
  const raw = String(canonicalUrl || '').trim();
  const fallback = `${SITE_URL}/articulos/${slug}`;
  if (!raw) return fallback;

  if (raw.startsWith('/')) {
    if (!/^\/articulos\/[^/?#]+/i.test(raw)) return fallback;
    return `${SITE_ORIGIN}${raw}`;
  }

  try {
    const parsed = new URL(raw);
    // Avoid cross-domain canonicals caused by bad manual entries.
    const isArticlePath = /^\/articulos\/[^/?#]+/i.test(parsed.pathname);
    if (parsed.origin !== SITE_ORIGIN || !isArticlePath) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
};
const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [saved, setSaved] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isLocalArticle = Boolean(article?.is_local) || String(article?.id || '').startsWith('local-');
  const authorPresentation = getAuthorPresentation(article?.author);
  const contentDiagnostics = useMemo(
    () => getEditorialContentDiagnostics(article?.content || ''),
    [article?.content],
  );
  const safePublishedHtml = useMemo(
    () => sanitizeEditorialHtml(article?.content || '<p>Contenido no disponible.</p>'),
    [article?.content],
  );
  const coverImageUrl = useMemo(
    () => resolveArticleImageUrl(article?.image_url || ''),
    [article?.image_url],
  );
  const publishedDateLabel = useMemo(
    () => formatArticleDate(article?.published_at || article?.created_at),
    [article?.published_at, article?.created_at],
  );
  const updatedDateLabel = useMemo(
    () => formatArticleDate(article?.updated_at || article?.published_at || article?.created_at),
    [article?.updated_at, article?.published_at, article?.created_at],
  );
  const seoTitle = useMemo(
    () => {
      if (article?.meta_title) return article.meta_title;
      if (article?.title) return `${article.title} - Bienestar en Claro`;
      return 'Bienestar en Claro';
    },
    [article?.meta_title, article?.title],
  );
  const seoDescription = useMemo(
    () => article?.meta_description || article?.excerpt || '',
    [article?.meta_description, article?.excerpt],
  );
  const canonicalUrl = useMemo(
    () => buildCanonicalUrl(article?.canonical_url, article?.slug || slug),
    [article?.canonical_url, article?.slug, slug],
  );
  const robotsContent = useMemo(
    () => (article?.no_index ? 'noindex, nofollow' : 'index, follow'),
    [article?.no_index],
  );

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
      if (!currentUser?.id || !article?.id || isLocalArticle) return;
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
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content={robotsContent} />
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
              src={authorPresentation.avatar}
              alt={authorPresentation.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-border shadow-sm"
            />
            <div className="text-left">
              <p className="font-bold text-foreground text-base">{authorPresentation.name}</p>
              <p>Publicado: {publishedDateLabel} • Revisado: {updatedDateLabel} • 5 min de lectura</p>
            </div>
            </div>
          </div>
        </header>

        {coverImageUrl && (
          <div className="rounded-3xl overflow-hidden shadow-2xl mb-16 relative aspect-video">
            <img 
              src={coverImageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div
          className="editorial-content max-w-none text-[1.04rem] leading-8 text-slate-900 dark:text-slate-100"
          data-editor-format={contentDiagnostics.format}
          dangerouslySetInnerHTML={{ __html: safePublishedHtml }}
        />

        {/* Use the new comments section */}
        {!isLocalArticle ? <CommentsSection articleId={article.id} /> : null}

      </article>
    </div>
  );
};

export default ArticleDetailPage;
