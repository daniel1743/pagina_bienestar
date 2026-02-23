
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { getGlobalSettings } from '@/lib/adminConfig';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, MessageCircle, Clock, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CommunityPage = () => {
  const [topics, setTopics] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSettings] = useState(() => getGlobalSettings());
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const categories = ['Todos', 'Hígado', 'Digestión', 'Metabolismo', 'Inflamación', 'General'];

  useEffect(() => {
    fetchTopics();
  }, [activeCategory, globalSettings.communityEnabled]);

  const fetchTopics = async () => {
    if (!globalSettings.communityEnabled) {
      setTopics([]);
      return;
    }
    let query = supabase.from('community_topics').select('*, user_profiles(name), community_replies(count)').order('created_at', { ascending: false });
    if (activeCategory !== 'Todos') {
      query = query.eq('category', activeCategory);
    }
    const { data } = await query;
    if (data) setTopics(data);
  };

  const handleCreateTopic = () => {
    toast({ title: '🚧 Crear Tema', description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀", duration: 3000 });
  };

  const filteredTopics = topics.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background py-12 transition-colors duration-300">
      <Helmet><title>Comunidad - Bienestar en Claro</title></Helmet>
      
      <div className="container mx-auto px-4 max-w-5xl">
        {!globalSettings.communityEnabled ? (
          <div className="text-center bg-card border border-border rounded-2xl p-10 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Comunidad desactivada temporalmente</h2>
            <p className="text-muted-foreground">La administración desactivó temporalmente este módulo.</p>
          </div>
        ) : null}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Comunidad</h1>
            <p className="text-muted-foreground text-lg">Comparte, aprende y apoya a otros en su proceso de salud.</p>
          </div>
          <Button onClick={handleCreateTopic} size="lg" className="bg-primary hover:opacity-90 text-primary-foreground rounded-full shadow-md" disabled={!globalSettings.communityEnabled}>
            <Plus className="w-5 h-5 mr-2" /> Nuevo Tema
          </Button>
        </div>

        <div className={`flex flex-col md:flex-row gap-6 mb-8 ${!globalSettings.communityEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Buscar temas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card border-border rounded-full shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${activeCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={`space-y-4 ${!globalSettings.communityEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {filteredTopics.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground">No se encontraron temas</h3>
              <p className="text-muted-foreground">Sé el primero en iniciar una conversación en esta categoría.</p>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <Card key={topic.id} className="bg-card border-border hover:shadow-md transition-shadow cursor-pointer group rounded-xl overflow-hidden" onClick={() => toast({title: "🚧 Detalles de Tema", description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"})}>
                <CardContent className="p-5 md:p-6 flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {topic.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(topic.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>Por <span className="font-medium text-foreground">{topic.user_profiles?.name || 'Usuario'}</span></span>
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center hidden sm:block">
                      <div className="text-xl font-bold text-foreground">{topic.community_replies?.[0]?.count || 0}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Respuestas</div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
