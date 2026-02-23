
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchCommentsWithProfiles } from '@/lib/commentQueries';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getAdminUserState, getGlobalSettings, getSecuritySettings } from '@/lib/adminConfig';
import { User, Check, X } from 'lucide-react';

const CommentsSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isAdmin = currentUser?.email === 'falcondaniel37@gmail.com';
  const globalSettings = getGlobalSettings();
  const securitySettings = getSecuritySettings();
  const userState = getAdminUserState();
  const [fallbackInfoShown, setFallbackInfoShown] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    const { data, error, usedFallback } = await fetchCommentsWithProfiles({
      articleId,
      onlyApproved: !isAdmin,
      ascending: true,
      limit: 500,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    if (usedFallback && !fallbackInfoShown) {
      setFallbackInfoShown(true);
      toast({
        title: 'Modo compatible de perfiles',
        description: 'Se cargaron nombres/fotos por user_id.',
      });
    }
    if (data) setComments(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!globalSettings.commentsEnabled) {
      toast({ title: 'Comentarios desactivados temporalmente' });
      return;
    }
    if (userState[currentUser.id]?.blockedFromComments) {
      toast({ title: 'Cuenta restringida para comentar', variant: 'destructive' });
      return;
    }

    if (securitySettings.spamProtectionEnabled) {
      const linksCount = (newComment.match(/https?:\/\//gi) || []).length;
      if (linksCount > Number(securitySettings.maxLinksPerComment || 2)) {
        toast({ title: 'Demasiados enlaces en el comentario', variant: 'destructive' });
        return;
      }
      const blockedWords = Array.isArray(securitySettings.bannedWords) ? securitySettings.bannedWords : [];
      const hasBlockedWord = blockedWords.some((word) => word && newComment.toLowerCase().includes(word.toLowerCase()));
      if (hasBlockedWord) {
        toast({ title: 'Contenido marcado por anti-spam', variant: 'destructive' });
        return;
      }

      const key = `comment-rate-${currentUser.id}`;
      const now = Date.now();
      let recentStore = [];
      try {
        recentStore = JSON.parse(localStorage.getItem(key) || '[]') || [];
      } catch {
        recentStore = [];
      }
      const recent = recentStore.filter((ts) => now - ts <= 60 * 1000);
      if (recent.length >= Number(securitySettings.maxCommentsPerMinute || 3)) {
        toast({ title: 'Límite temporal de comentarios alcanzado', variant: 'destructive' });
        return;
      }
      localStorage.setItem(key, JSON.stringify([...recent, now]));
    }
    
    const { error } = await supabase.from('comments').insert([{
      article_id: articleId,
      user_id: currentUser.id,
      content: newComment,
      status: isAdmin ? 'approved' : 'pending'
    }]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Enviado', description: isAdmin ? 'Comentario publicado' : 'Comentario en revisión' });
      setNewComment('');
      fetchComments();
    }
  };

  const updateStatus = async (id, status) => {
    await supabase.from('comments').update({ status }).eq('id', id);
    fetchComments();
  };

  const getProfile = (comment) => {
    if (comment?.user_profile) return comment.user_profile;
    const profiles = comment?.users?.user_profiles;
    return Array.isArray(profiles) ? profiles[0] : profiles;
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-2xl font-bold mb-6 text-foreground">Comentarios ({comments.filter(c => c.status === 'approved').length})</h3>
      {!globalSettings.commentsEnabled ? (
        <p className="mb-6 text-muted-foreground">Los comentarios están temporalmente desactivados por administración.</p>
      ) : null}
      
      {currentUser && globalSettings.commentsEnabled ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            className="w-full p-4 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
            rows="3"
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button type="submit" className="mt-2 bg-primary hover:opacity-90 text-primary-foreground">Comentar</Button>
        </form>
      ) : globalSettings.commentsEnabled ? (
        <p className="mb-8 text-muted-foreground">Inicia sesión para dejar un comentario.</p>
      ) : null}

      <div className="space-y-6">
        {comments.map(comment => {
          const profile = getProfile(comment);
          return (
            <div key={comment.id} className={`flex gap-4 p-4 rounded-lg border ${comment.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-card border-border'}`}>
              <div className="flex-shrink-0">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="User" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{profile?.name || 'Usuario anónimo'}</span>
                  <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                  {comment.status === 'pending' && <span className="text-xs text-orange-500 font-medium">Pendiente</span>}
                </div>
                <p className="text-foreground/90 text-sm whitespace-pre-wrap">{comment.content}</p>
                
                {isAdmin && comment.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-8 border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => updateStatus(comment.id, 'approved')}>
                      <Check className="w-4 h-4 mr-1" /> Aprobar
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => updateStatus(comment.id, 'rejected')}>
                      <X className="w-4 h-4 mr-1" /> Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentsSection;
