
import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Users, Reply, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserActivitySection = ({ userId }) => {
  const { fetchUserActivity } = useUserProfile();
  const [activeTab, setActiveTab] = useState('comments');
  const [activity, setActivity] = useState({ comments: [], topics: [], replies: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      setLoading(true);
      const data = await fetchUserActivity(userId);
      setActivity(data);
      setLoading(false);
    };
    loadActivity();
  }, [userId]);

  const tabs = [
    { id: 'comments', label: 'Comentarios', icon: <MessageSquare className="w-4 h-4" />, data: activity.comments },
    { id: 'topics', label: 'Temas', icon: <Users className="w-4 h-4" />, data: activity.topics },
    { id: 'replies', label: 'Respuestas', icon: <Reply className="w-4 h-4" />, data: activity.replies },
  ];

  if (loading) return <div className="h-40 flex items-center justify-center text-muted-foreground">Cargando actividad...</div>;

  const currentData = tabs.find(t => t.id === activeTab)?.data || [];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            {tab.icon} {tab.label} <span className="ml-1 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">{tab.data.length}</span>
          </button>
        ))}
      </div>
      
      <div className="p-6">
        {currentData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay actividad reciente en esta categoría.
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.map(item => (
              <Card key={item.id} className="border-border hover:shadow-md transition-shadow bg-background">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                      {activeTab === 'topics' ? <span className="font-semibold text-primary">{item.title}</span> : item.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    {activeTab === 'comments' && item.articles && (
                      <Link to={`/articulos/${item.articles.slug}`} className="flex items-center gap-1 text-primary hover:underline">
                        Ver artículo <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    {activeTab === 'topics' && (
                      <Link to={`/comunidad/tema/${item.id}`} className="flex items-center gap-1 text-primary hover:underline">
                        Ver tema <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivitySection;
