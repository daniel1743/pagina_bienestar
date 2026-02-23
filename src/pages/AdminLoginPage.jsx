
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getRememberSession } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getSecuritySettings, setTwoFactorVerified } from '@/lib/adminConfig';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(() => getRememberSession());
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email !== 'falcondaniel37@gmail.com') {
      toast({ title: 'Acceso Denegado', description: 'No tienes permisos de administrador.', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password, rememberSession);
      const security = getSecuritySettings();
      if (security.twoFactorEnabled) {
        if (!twoFactorCode || twoFactorCode !== String(security.twoFactorCode || '')) {
          setTwoFactorVerified(false);
          toast({
            title: '2FA inválido',
            description: 'El código de verificación no es correcto.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }
      setTwoFactorVerified(true);
      toast({ title: 'Bienvenido', description: 'Acceso concedido al panel de control.' });
      navigate('/admin');
    } catch (error) {
      toast({ title: 'Error de autenticación', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      <Helmet><title>Admin Login - Bienestar en Claro</title></Helmet>
      
      {/* Dark premium background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-2xl rounded-2xl overflow-hidden text-slate-100">
          <CardHeader className="text-center space-y-4 pb-8 pt-10">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-primary/30 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Portal de Administración</CardTitle>
            <p className="text-sm text-slate-400">Acceso exclusivo para personal autorizado</p>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="bg-slate-950 border-slate-800 h-12 px-4 rounded-xl text-slate-100 focus:ring-primary focus:border-primary placeholder:text-slate-600"
                  placeholder="admin@dominio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 h-12 px-4 pr-11 rounded-xl text-slate-100 focus:ring-primary focus:border-primary placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Mantener sesión iniciada
              </label>
              {getSecuritySettings().twoFactorEnabled ? (
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode" className="text-slate-300">Código 2FA</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="bg-slate-950 border-slate-800 h-12 px-4 rounded-xl text-slate-100 focus:ring-primary focus:border-primary placeholder:text-slate-600"
                    placeholder="123456"
                  />
                </div>
              ) : null}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-slate-950 h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all mt-4" disabled={loading}>
                {loading ? 'Verificando credenciales...' : 'Acceder al Sistema'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
