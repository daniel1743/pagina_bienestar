
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { cropImageToAspect } from '@/lib/utils';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId, data) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', userId);
      if (error) throw error;
      setProfile(prev => ({ ...prev, ...data }));
      toast({ title: 'Perfil actualizado', description: 'Tus cambios han sido guardados.' });
      return true;
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  const uploadProfilePhoto = async (file, userId) => {
    try {
      const blob = await cropImageToAspect(file, 1, 400);
      const ext = file.name?.match(/\.(jpe?g|png|webp)$/i)?.[1] || 'jpg';
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(path, blob, { upsert: true, contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      const { error } = await supabase.from('user_profiles').update({ photo_url: publicUrl }).eq('user_id', userId);
      if (error) throw error;
      setProfile(prev => (prev ? { ...prev, photo_url: publicUrl } : prev));
      toast({ title: 'Foto actualizada', description: 'Tu foto de perfil se ha actualizado correctamente.' });
      return publicUrl;
    } catch (err) {
      toast({ title: 'Error al subir', description: err.message || 'No se pudo subir la foto.', variant: 'destructive' });
      return null;
    }
  };

  const uploadCoverPhoto = async (file, userId) => {
    try {
      const blob = await cropImageToAspect(file, 3, 1200);
      const ext = file.name?.match(/\.(jpe?g|png|webp)$/i)?.[1] || 'jpg';
      const path = `${userId}/cover.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(path, blob, { upsert: true, contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path);
      const { error } = await supabase.from('user_profiles').update({ cover_photo_url: publicUrl }).eq('user_id', userId);
      if (error) throw error;
      setProfile(prev => (prev ? { ...prev, cover_photo_url: publicUrl } : prev));
      toast({ title: 'Portada actualizada', description: 'Tu imagen de portada se ha actualizado.' });
      return publicUrl;
    } catch (err) {
      toast({ title: 'Error al subir', description: err.message || 'No se pudo subir la portada.', variant: 'destructive' });
      return null;
    }
  };

  const fetchUserActivity = async (userId) => {
    try {
      const [comments, topics, replies] = await Promise.all([
        supabase.from('comments').select('*, articles(title, slug)').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('community_topics').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('community_replies').select('*, community_topics(title)').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ]);
      return {
        comments: comments.data || [],
        topics: topics.data || [],
        replies: replies.data || []
      };
    } catch (error) {
      console.error(error);
      return { comments: [], topics: [], replies: [] };
    }
  };

  const fetchSavedArticles = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('*, articles(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchParticipationStats = async (userId) => {
    try {
      const [{ count: comments }, { count: topics }, { count: replies }] = await Promise.all([
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId).in('status', ['approved', 'pending']),
        supabase.from('community_topics').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('community_replies').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      ]);
      const total = (comments || 0) + (topics || 0) + (replies || 0);
      let level = 'Nuevo';
      if (total >= 20) level = 'Colaborador';
      else if (total >= 5) level = 'Activo';
      return { comments: comments || 0, topics: topics || 0, replies: replies || 0, level };
    } catch (error) {
      console.error(error);
      return { comments: 0, topics: 0, replies: 0, level: 'Nuevo' };
    }
  };

  return (
    <UserProfileContext.Provider value={{
      profile, loading, fetchUserProfile, updateUserProfile,
      uploadProfilePhoto, uploadCoverPhoto, fetchUserActivity, fetchSavedArticles, fetchParticipationStats
    }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) throw new Error('useUserProfile must be used within UserProfileProvider');
  return context;
};
