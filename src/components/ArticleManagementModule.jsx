
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Search, Edit, Eye, Copy, Trash2, Plus, Filter } from 'lucide-react';

const ArticleManagementModule = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (data) setArticles(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este artículo? Esta acción es irreversible.')) {
      await supabase.from('articles').delete().eq('id', id);
      toast({ title: 'Artículo eliminado' });
      fetchArticles();
    }
  };

  const handleDuplicate = async (article) => {
    const { id, created_at, updated_at, ...rest } = article;
    const newArticle = { ...rest, title: `${article.title} (Copia)`, slug: `${article.slug}-copia-${Date.now()}` };
    const { error } = await supabase.from('articles').insert([newArticle]);
    if (error) toast({ title: 'Error al duplicar', variant: 'destructive' });
    else {
      toast({ title: 'Artículo duplicado' });
      fetchArticles();
    }
  };

  const filteredArticles = articles.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Artículos</h2>
        <Button onClick={() => toast({ title: '🚧 Editor de Artículos', description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Artículo
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por título..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border rounded-full h-10"
          />
        </div>
        <Button variant="outline" className="rounded-full h-10"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando artículos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-muted text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Título</th>
                  <th className="px-6 py-4 font-semibold">Categoría</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArticles.map(a => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium max-w-[250px] truncate">{a.title}</td>
                    <td className="px-6 py-4"><span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-semibold">{a.category || 'General'}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.status === 'publicado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                        {a.status || 'borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => toast({title: 'Ver en sitio'})} title="Ver"><Eye className="w-4 h-4 text-blue-500" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => toast({title: '🚧 Editar'})} title="Editar"><Edit className="w-4 h-4 text-primary" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDuplicate(a)} title="Duplicar"><Copy className="w-4 h-4 text-muted-foreground" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)} title="Eliminar"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleManagementModule;
