
import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { BookmarkMinus, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SavedArticlesSection = ({ userId, isOwner }) => {
  const { fetchSavedArticles } = useUserProfile();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSaved();
  }, [userId]);

  const loadSaved = async () => {
    setLoading(true);
    const data = await fetchSavedArticles(userId);
    setSaved(data);
    setLoading(false);
  };

  const removeSaved = async (id) => {
    try {
      await supabase.from('saved_articles').delete().eq('id', id);
      setSaved(saved.filter(item => item.id !== id));
      toast({ title: 'Artículo eliminado', description: 'Se ha quitado de tus guardados.' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar.', variant: 'destructive' });
    }
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">Cargando artículos guardados...</div>;

  if (saved.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No hay artículos guardados</h3>
        <p className="text-muted-foreground mb-6">Explora la sección de artículos y guarda los que te interesen para leerlos más tarde.</p>
        <Button asChild variant="outline" className="rounded-full"><Link to="/articulos">Explorar artículos</Link></Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {saved.map(({ id, articles }) => (
        articles && (
          <Card key={id} className="h-full border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden flex flex-col group">
            <Link to={`/articulos/${articles.slug}`} className="block relative aspect-video bg-muted overflow-hidden">
              {articles.image_url ? (
                <img src={articles.image_url} alt={articles.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-muted-foreground/30" /></div>
              )}
              <span className="absolute top-3 left-3 bg-background/90 text-foreground text-xs font-bold px-2.5 py-1 rounded-full">{articles.category}</span>
            </Link>
            <CardContent className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <Link to={`/articulos/${articles.slug}`} className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
                  {articles.title}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3 h-3" /> {new Date(articles.published_at || articles.created_at).toLocaleDateString()}
                </div>
              </div>
              {isOwner && (
                <Button variant="ghost" size="sm" onClick={() => removeSaved(id)} className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive mt-auto border border-destructive/20 rounded-xl">
                  <BookmarkMinus className="w-4 h-4 mr-2" /> Eliminar de guardados
                </Button>
              )}
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

export default SavedArticlesSection;
