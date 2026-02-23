
import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { X, Flag } from 'lucide-react';

const UserReportModal = ({ reportedUserId, onClose }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('reported_users').insert([{
        reporter_id: currentUser.id,
        reported_user_id: reportedUserId,
        reason: reason
      }]);
      
      if (error) throw error;
      toast({ title: 'Reporte enviado', description: 'Gracias por ayudarnos a mantener la comunidad segura.' });
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Flag className="w-5 h-5 text-destructive" /> Reportar Usuario</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground">Motivo del reporte</Label>
            <textarea
              id="reason"
              required
              rows="4"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground resize-none focus:ring-2 focus:ring-destructive outline-none"
              placeholder="Por favor, describe por qué estás reportando a este usuario. Esta información es confidencial."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserReportModal;
