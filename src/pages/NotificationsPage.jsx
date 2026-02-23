
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Bell, CheckCircle2, Trash2, MessageSquare, Users, AtSign, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, comments, topics, mentions
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id).eq('is_read', false);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    toast({ title: 'Notificaciones actualizadas' });
  };

  const deleteNotification = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'comment_reply':
      case 'comment_approved': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'topic_reply': return <Users className="w-5 h-5 text-green-500" />;
      case 'mention': return <AtSign className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'comments') return n.type === 'comment_reply' || n.type === 'comment_approved';
    if (filter === 'topics') return n.type === 'topic_reply';
    if (filter === 'mentions') return n.type === 'mention';
    return true;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <Helmet><title>Mis Notificaciones - Bienestar en Claro</title></Helmet>
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" /> Centro de Notificaciones
            </h1>
            <p className="text-muted-foreground mt-2">Mantente al día con tu actividad en la comunidad.</p>
          </div>
          <Button variant="outline" onClick={markAllAsRead} className="shrink-0">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar todas como leídas
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {['all', 'unread', 'comments', 'topics', 'mentions'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {f === 'all' ? 'Todas' : f === 'unread' ? 'No leídas' : f === 'comments' ? 'Comentarios' : f === 'topics' ? 'Temas' : 'Menciones'}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando notificaciones...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-16 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground">No tienes notificaciones en esta categoría por el momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map(n => (
                <div key={n.id} className={`p-6 flex gap-4 transition-colors hover:bg-muted/30 ${!n.is_read ? 'bg-primary/5' : ''}`}>
                  <div className="mt-1 bg-background p-2 rounded-full border border-border shadow-sm h-fit">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-grow">
                    <p className="text-foreground text-base mb-1">{n.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                      {n.link && (
                        <Link to={n.link} className="text-primary hover:underline font-medium">Ver detalles</Link>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => deleteNotification(n.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
