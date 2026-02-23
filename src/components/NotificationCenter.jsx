
import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, MessageSquare, FileText, AtSign } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
    toast({ title: 'Notificación eliminada' });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h3 className="font-bold text-foreground">Notificaciones</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{unreadCount} nuevas</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No tienes notificaciones.</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-4 border-b border-border hover:bg-muted/50 transition-colors flex gap-3 ${!n.is_read ? 'bg-primary/5' : ''}`}>
                  <div className="mt-1 flex-shrink-0 text-primary">
                    {n.type === 'comment_reply' || n.type === 'comment_approved' ? <MessageSquare className="w-4 h-4" /> :
                     n.type === 'new_article' ? <FileText className="w-4 h-4" /> : <AtSign className="w-4 h-4" />}
                  </div>
                  <div className="flex-grow">
                    <Link to={n.link || '#'} onClick={() => markAsRead(n.id)} className="text-sm text-foreground hover:text-primary transition-colors line-clamp-2 mb-1">
                      {n.content}
                    </Link>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        {!n.is_read && (
                          <button onClick={() => markAsRead(n.id)} className="hover:text-primary" title="Marcar leída"><Check className="w-3.5 h-3.5" /></button>
                        )}
                        <button onClick={() => deleteNotification(n.id)} className="hover:text-destructive" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
