import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getAdminTopicState, logAdminAction, saveAdminTopicState } from '@/lib/adminConfig';
import { Lock, Pin, Search, Trash2 } from 'lucide-react';

const CommunityManagementModule = () => {
  const { toast } = useToast();
  const [topics, setTopics] = useState([]);
  const [replies, setReplies] = useState([]);
  const [search, setSearch] = useState('');
  const [topicState, setTopicState] = useState(getAdminTopicState());

  const loadCommunity = async () => {
    const [{ data: topicsData, error: topicsError }, { data: repliesData, error: repliesError }] = await Promise.all([
      supabase.from('community_topics').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('community_replies').select('*, community_topics(title)').order('created_at', { ascending: false }).limit(500),
    ]);

    if (topicsError) toast({ title: 'Error al cargar temas', description: topicsError.message, variant: 'destructive' });
    if (repliesError) toast({ title: 'Error al cargar respuestas', description: repliesError.message, variant: 'destructive' });
    setTopics(topicsData || []);
    setReplies(repliesData || []);
  };

  useEffect(() => {
    loadCommunity();
  }, []);

  const updateTopicState = (topicId, patch) => {
    const next = { ...topicState, [topicId]: { ...(topicState[topicId] || {}), ...patch } };
    setTopicState(next);
    saveAdminTopicState(next);
  };

  const deleteTopic = async (topicId) => {
    if (!window.confirm('¿Eliminar tema y su contexto?')) return;
    const { error } = await supabase.from('community_topics').delete().eq('id', topicId);
    if (error) {
      toast({ title: 'No se pudo eliminar tema', description: error.message, variant: 'destructive' });
      return;
    }
    logAdminAction('Tema eliminado', { topic_id: topicId });
    setTopics((prev) => prev.filter((item) => item.id !== topicId));
  };

  const deleteReply = async (replyId) => {
    if (!window.confirm('¿Eliminar respuesta?')) return;
    const { error } = await supabase.from('community_replies').delete().eq('id', replyId);
    if (error) {
      toast({ title: 'No se pudo eliminar respuesta', description: error.message, variant: 'destructive' });
      return;
    }
    logAdminAction('Respuesta de comunidad eliminada', { reply_id: replyId });
    setReplies((prev) => prev.filter((item) => item.id !== replyId));
  };

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) =>
      `${topic.title || ''} ${topic.content || ''}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [topics, search]);

  const filteredReplies = useMemo(() => {
    return replies.filter((reply) =>
      `${reply.content || ''} ${reply.community_topics?.title || ''}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [replies, search]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Gestión de comunidad</h2>
        <p className="text-sm text-slate-400">Temas, cierre, destacados y moderación de respuestas.</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar en temas y respuestas..." />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="border-slate-700/70 bg-slate-900/70">
          <CardHeader><CardTitle className="text-slate-100">Temas</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto">
            {filteredTopics.length === 0 ? <p className="text-sm text-slate-400">Sin temas.</p> : null}
            {filteredTopics.map((topic) => {
              const state = topicState[topic.id] || {};
              return (
                <div key={topic.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{topic.title}</p>
                      <p className="text-xs text-slate-400">{new Date(topic.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Fijar tema"
                        onClick={() => {
                          updateTopicState(topic.id, { pinned: !state.pinned });
                          logAdminAction('Tema fijado/desfijado', { topic_id: topic.id, pinned: !state.pinned });
                        }}
                      >
                        <Pin className={`w-4 h-4 ${state.pinned ? 'text-emerald-300' : 'text-slate-400'}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Cerrar tema"
                        onClick={() => {
                          updateTopicState(topic.id, { closed: !state.closed });
                          logAdminAction('Tema cerrado/abierto', { topic_id: topic.id, closed: !state.closed });
                        }}
                      >
                        <Lock className={`w-4 h-4 ${state.closed ? 'text-amber-300' : 'text-slate-400'}`} />
                      </Button>
                      <Button size="icon" variant="ghost" title="Eliminar tema" onClick={() => deleteTopic(topic.id)}>
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3">{topic.content || 'Sin contenido'}</p>
                  <div className="flex gap-2 text-[11px]">
                    {state.pinned ? <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-200">Destacado</span> : null}
                    {state.closed ? <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-200">Cerrado</span> : null}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-700/70 bg-slate-900/70">
          <CardHeader><CardTitle className="text-slate-100">Respuestas</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto">
            {filteredReplies.length === 0 ? <p className="text-sm text-slate-400">Sin respuestas.</p> : null}
            {filteredReplies.map((reply) => (
              <div key={reply.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">{reply.community_topics?.title || 'Tema'}</p>
                  <Button size="icon" variant="ghost" onClick={() => deleteReply(reply.id)} title="Eliminar respuesta">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </Button>
                </div>
                <p className="text-sm text-slate-200">{reply.content}</p>
                <p className="text-[11px] text-slate-500">{new Date(reply.created_at).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityManagementModule;
