
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Calendar, Instagram, Linkedin, Youtube, Globe, Edit3, Flag } from 'lucide-react';
import EditProfileModal from '@/components/EditProfileModal';
import UserReportModal from '@/components/UserReportModal';
import UserActivitySection from '@/components/UserActivitySection';
import SavedArticlesSection from '@/components/SavedArticlesSection';

const UserProfilePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showWelcome, setShowWelcome] = useState(!!location.state?.welcome);
  const { fetchUserProfile, profile, loading, uploadProfilePhoto, uploadCoverPhoto, fetchParticipationStats } = useUserProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [stats, setStats] = useState(null);
  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const isOwner = currentUser?.id === id;

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !/^image\//.test(file.type)) return;
    setUploadingPhoto(true);
    await uploadProfilePhoto(file, id);
    setUploadingPhoto(false);
    e.target.value = '';
  };

  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !/^image\//.test(file.type)) return;
    setUploadingCover(true);
    await uploadCoverPhoto(file, id);
    setUploadingCover(false);
    e.target.value = '';
  };

  useEffect(() => {
    fetchUserProfile(id);
  }, [id]);

  if (loading || !profile) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Cargando perfil...</div>;
  }

  const participationBadge = stats?.level || 'Nuevo';

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <Helmet><title>{profile.name || 'Perfil'} - Bienestar en Claro</title></Helmet>

      {/* Mensaje de bienvenida tras registro */}
      {showWelcome && isOwner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <span className="text-lg">¡Bienvenido a Bienestar en Claro!</span>
          <button onClick={() => setShowWelcome(false)} className="text-primary-foreground/80 hover:text-white font-bold text-xl">&times;</button>
        </div>
      )}

      {/* Cover Photo */}
      <div className="h-64 md:h-80 w-full relative bg-muted group overflow-hidden">
        {profile.cover_photo_url ? (
          <img src={profile.cover_photo_url} alt="Portada" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-blue-500/20" />
        )}
        {isOwner && (
          <>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPhotoChange} />
            <Button variant="secondary" size="sm" className="absolute top-4 right-4 bg-background/80 backdrop-blur-md hover:bg-background" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
              <Edit3 className="w-4 h-4 mr-2" /> {uploadingCover ? 'Subiendo...' : 'Cambiar portada'}
            </Button>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative -mt-20 md:-mt-24 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Profile Photo */}
          <div className="relative inline-block">
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} />
            <div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-card shadow-xl overflow-hidden relative group cursor-pointer"
              onClick={() => isOwner && !uploadingPhoto && photoInputRef.current?.click()}
            >
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-4xl text-muted-foreground font-bold">
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {isOwner && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Edit3 className="text-white w-6 h-6" />
                </div>
              )}
              {uploadingPhoto && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white text-sm">Subiendo...</span></div>}
            </div>
            <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border-2 border-background uppercase tracking-wider">
              {participationBadge}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isOwner ? (
              <Button onClick={() => setIsEditing(true)} className="rounded-full shadow-sm">
                <Edit3 className="w-4 h-4 mr-2" /> Editar perfil
              </Button>
            ) : (
              currentUser && (
                <Button variant="outline" size="sm" onClick={() => setIsReporting(true)} className="text-muted-foreground hover:text-destructive rounded-full border-border">
                  <Flag className="w-4 h-4 mr-2" /> Reportar
                </Button>
              )
            )}
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{profile.name || 'Usuario'}</h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                {profile.profession && <><Briefcase className="w-4 h-4" /> {profile.profession}</>}
              </p>
            </div>

            <div className="text-sm text-foreground/80 leading-relaxed bg-card p-5 rounded-2xl border border-border shadow-sm">
              <h3 className="font-semibold text-foreground mb-2">Sobre mí</h3>
              <p>{profile.bio || 'Este usuario aún no ha escrito una biografía.'}</p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              {profile.location && <div className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {profile.location}</div>}
              <div className="flex items-center gap-3"><Calendar className="w-4 h-4" /> Miembro desde {new Date(profile.created_at).toLocaleDateString()}</div>
              {stats && (
                <div className="flex flex-wrap gap-4 pt-2 text-muted-foreground">
                  <span>{stats.comments} comentarios</span>
                  <span>{stats.topics} temas</span>
                  <span>{stats.replies} respuestas</span>
                </div>
              )}
            </div>

            {profile.social_links && Object.values(profile.social_links).some(v => v) && (
              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Conecta</h3>
                <div className="flex gap-4">
                  {profile.social_links.instagram && <a href={profile.social_links.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#E1306C] transition-colors"><Instagram className="w-5 h-5" /></a>}
                  {profile.social_links.linkedin && <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#0077B5] transition-colors"><Linkedin className="w-5 h-5" /></a>}
                  {profile.social_links.youtube && <a href={profile.social_links.youtube} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#FF0000] transition-colors"><Youtube className="w-5 h-5" /></a>}
                  {profile.social_links.website && <a href={profile.social_links.website} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Globe className="w-5 h-5" /></a>}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="flex gap-4 border-b border-border">
              <button 
                onClick={() => setActiveTab('activity')} 
                className={`pb-3 px-2 font-semibold text-sm transition-colors ${activeTab === 'activity' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Actividad Reciente
              </button>
              {isOwner && (
                <button 
                  onClick={() => setActiveTab('saved')} 
                  className={`pb-3 px-2 font-semibold text-sm transition-colors ${activeTab === 'saved' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Artículos Guardados
                </button>
              )}
            </div>

            <div className="pt-2">
              {activeTab === 'activity' && <UserActivitySection userId={id} />}
              {activeTab === 'saved' && isOwner && <SavedArticlesSection userId={id} isOwner={isOwner} />}
            </div>
          </div>
        </div>
      </div>

      {isEditing && <EditProfileModal profile={profile} onClose={() => setIsEditing(false)} />}
      {isReporting && <UserReportModal reportedUserId={id} onClose={() => setIsReporting(false)} />}
    </div>
  );
};

export default UserProfilePage;
