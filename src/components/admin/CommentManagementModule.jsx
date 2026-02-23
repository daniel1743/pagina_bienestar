import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchCommentsWithProfiles } from '@/lib/commentQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  getAdminUserState,
  getCommentReplies,
  logAdminAction,
  saveAdminUserState,
  saveCommentReplies,
} from '@/lib/adminConfig';
import { Check, MessageSquareReply, Pencil, Search, ShieldAlert, Trash2, X } from 'lucide-react';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'spam'];

const CommentManagementModule = () => {
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyMap, setReplyMap] = useState(getCommentReplies());
  const [userState, setUserState] = useState(getAdminUserState());
  const [fallbackInfoShown, setFallbackInfoShown] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    const { data, error, usedFallback } = await fetchCommentsWithProfiles({
      onlyApproved: false,
      ascending: false,
      limit: 500,
    });

    if (error) {
      toast({ title: 'Error al cargar comentarios', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    if (usedFallback && !fallbackInfoShown) {
      setFallbackInfoShown(true);
      toast({
        title: 'Modo compatible activado',
        description: 'Se cargaron perfiles por user_id porque no existe relación comments->users.',
      });
    }
    setComments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, []);

  const getProfile = (comment) => {
    if (comment?.user_profile) return comment.user_profile;
    const maybeArray = comment?.users?.user_profiles;
    if (Array.isArray(maybeArray)) return maybeArray[0] || null;
    return maybeArray || null;
  };

  const notifyMentions = async (content, articleSlug, articleTitle, excludeUserId) => {
    const mentions = [...(content?.match(/@([\w\u00C0-\u024F\s]+)/gu) || [])];
    if (mentions.length === 0) return;
    const names = [...new Set(mentions.map((m) => m.slice(1).trim()).filter(Boolean))];
    for (const name of names) {
      const { data: profiles } = await supabase.from('user_profiles').select('user_id').ilike('name', `%${name}%`);
      if (profiles?.length) {
        for (const p of profiles) {
          if (p.user_id === excludeUserId) continue;
          await supabase.from('notifications').insert({
            user_id: p.user_id,
            type: 'mention',
            content: `Te mencionaron en un comentario sobre "${articleTitle || 'un artículo'}".`,
            link: articleSlug ? `/articulos/${articleSlug}` : '/articulos',
          });
        }
      }
    }
  };

  const updateStatus = async (id, status) => {
    const comment = comments.find((c) => c.id === id);
    const { error } = await supabase.from('comments').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'No se pudo actualizar estado', description: error.message, variant: 'destructive' });
      return;
    }
    if (status === 'approved' && comment) {
      const slug = comment?.articles?.slug || '';
      const title = comment?.articles?.title || 'un artículo';
      if (comment.user_id) {
        await supabase.from('notifications').insert({
          user_id: comment.user_id,
          type: 'comment_approved',
          content: `Tu comentario en "${title}" ha sido aprobado.`,
          link: slug ? `/articulos/${slug}` : '/articulos',
        });
      }
      await notifyMentions(comment.content, slug, title, comment.user_id);
    }
    logAdminAction('Comentario moderado', { id, status });
    setComments((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    toast({ title: `Comentario marcado como ${status}` });
  };

  const deleteComment = async (id) => {
    if (!window.confirm('¿Eliminar comentario permanentemente?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) {
      toast({ title: 'No se pudo eliminar', description: error.message, variant: 'destructive' });
      return;
    }
    logAdminAction('Comentario eliminado', { id });
    setComments((prev) => prev.filter((item) => item.id !== id));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('comments').update({ content: editText }).eq('id', editingId);
    if (error) {
      toast({ title: 'No se pudo editar', description: error.message, variant: 'destructive' });
      return;
    }
    setComments((prev) => prev.map((item) => (item.id === editingId ? { ...item, content: editText } : item)));
    logAdminAction('Comentario editado', { id: editingId });
    setEditingId(null);
    setEditText('');
    toast({ title: 'Comentario actualizado' });
  };

  const blockUser = (comment) => {
    const userId = comment.user_id;
    if (!userId) return;
    const next = {
      ...userState,
      [userId]: {
        ...(userState[userId] || {}),
        status: 'suspended',
        blockedFromComments: true,
      },
    };
    setUserState(next);
    saveAdminUserState(next);
    logAdminAction('Usuario bloqueado por comentarios', { user_id: userId, comment_id: comment.id });
    toast({ title: 'Usuario bloqueado (estado admin local)' });
  };

  const saveReply = (commentId) => {
    const reply = (replyDrafts[commentId] || '').trim();
    if (!reply) return;
    const next = {
      ...replyMap,
      [commentId]: [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          content: reply,
          created_at: new Date().toISOString(),
        },
        ...(replyMap[commentId] || []),
      ],
    };
    setReplyMap(next);
    saveCommentReplies(next);
    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));
    logAdminAction('Respuesta admin a comentario', { comment_id: commentId });
  };

  const filtered = useMemo(() => {
    return comments.filter((item) => {
      const text = `${item.content || ''} ${item.articles?.title || ''}`.toLowerCase();
      const bySearch = text.includes(search.toLowerCase());
      const byStatus = statusFilter === 'all' ? true : (item.status || 'pending') === statusFilter;
      const blocked = userState[item.user_id]?.blockedFromComments;
      return bySearch && byStatus && !blocked;
    });
  }, [comments, search, statusFilter, userState]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Moderación de comentarios</h2>
        <p className="text-sm text-slate-400">Aprobar, editar, responder, marcar spam y bloquear usuarios.</p>
      </div>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar comentario o artículo..." />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  statusFilter === status ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[72vh] overflow-y-auto">
          {loading ? <p className="text-sm text-slate-400">Cargando...</p> : null}
          {!loading && filtered.length === 0 ? <p className="text-sm text-slate-400">No hay comentarios para los filtros seleccionados.</p> : null}

          {filtered.map((comment) => {
            const profile = getProfile(comment);
            const replies = replyMap[comment.id] || [];
            const isEditing = editingId === comment.id;
            return (
              <div key={comment.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{profile?.name || 'Usuario'}</p>
                    <p className="text-xs text-slate-400">{comment.articles?.title || 'Sin artículo'}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">{comment.status || 'pending'}</span>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>Guardar edición</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{comment.content}</p>
                )}

                <div className="flex flex-wrap gap-1">
                  <Button size="icon" variant="ghost" title="Aprobar" onClick={() => updateStatus(comment.id, 'approved')}>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Rechazar" onClick={() => updateStatus(comment.id, 'rejected')}>
                    <X className="w-4 h-4 text-amber-400" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Spam" onClick={() => updateStatus(comment.id, 'spam')}>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Editar"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.content || '');
                    }}
                  >
                    <Pencil className="w-4 h-4 text-sky-400" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Bloquear usuario" onClick={() => blockUser(comment)}>
                    <ShieldAlert className="w-4 h-4 text-fuchsia-400" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Eliminar" onClick={() => deleteComment(comment.id)}>
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </Button>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={replyDrafts[comment.id] || ''}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                      placeholder="Responder desde admin..."
                    />
                    <Button variant="outline" onClick={() => saveReply(comment.id)}>
                      <MessageSquareReply className="w-4 h-4 mr-2" />
                      Responder
                    </Button>
                  </div>
                  {replies.map((reply) => (
                    <div key={reply.id} className="rounded-md border border-slate-700 p-2">
                      <p className="text-sm text-slate-200">{reply.content}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{new Date(reply.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentManagementModule;
