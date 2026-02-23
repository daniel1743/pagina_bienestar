
import React, { useState } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { validateSocialUrl } from '@/lib/utils';
import { X, Save } from 'lucide-react';

const EditProfileModal = ({ profile, onClose }) => {
  const { updateUserProfile } = useUserProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    profession: profile?.profession || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    social_links: profile?.social_links || { instagram: '', linkedin: '', youtube: '', website: '' }
  });
  
  const [loading, setLoading] = useState(false);

  const handleSocialChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast({ title: 'Error', description: 'El nombre es obligatorio.', variant: 'destructive' });
    if (formData.bio.length > 250) return toast({ title: 'Error', description: 'Biografía demasiado larga.', variant: 'destructive' });
    for (const [key, value] of Object.entries(formData.social_links)) {
      if (value) {
        const { valid, message } = validateSocialUrl(key, value);
        if (!valid) return toast({ title: 'Enlace no válido', description: message, variant: 'destructive' });
      }
    }

    setLoading(true);
    const success = await updateUserProfile(profile.user_id, formData);
    setLoading(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/20">
          <h2 className="text-2xl font-bold text-foreground">Editar Perfil</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nombre *</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession" className="text-foreground">Profesión</Label>
                <Input id="profession" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} className="bg-background" placeholder="Ej. Nutricionista" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground">Ubicación</Label>
              <Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background" placeholder="Ciudad, País" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="bio" className="text-foreground">Biografía</Label>
                <span className={`text-xs ${formData.bio.length > 250 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>{formData.bio.length}/250</span>
              </div>
              <textarea
                id="bio"
                rows="3"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full p-3 rounded-lg border border-border bg-background text-foreground resize-none focus:ring-2 focus:ring-primary outline-none"
                placeholder="Cuéntanos un poco sobre ti..."
              />
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Enlaces Sociales</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {['instagram', 'linkedin', 'youtube', 'website'].map(social => (
                  <div key={social} className="space-y-1">
                    <Label className="text-foreground capitalize">{social}</Label>
                    <Input 
                      value={formData.social_links[social] || ''} 
                      onChange={e => handleSocialChange(social, e.target.value)} 
                      className="bg-background text-sm" 
                      placeholder={`URL de ${social}`}
                      type="url"
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" form="edit-profile-form" className="bg-primary hover:opacity-90" disabled={loading}>
            {loading ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" /> Guardar cambios</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
