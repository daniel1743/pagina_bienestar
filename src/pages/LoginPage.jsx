
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getRememberSession } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [view, setView] = useState('login'); // 'login', 'register', 'recover'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(() => getRememberSession());
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === 'login') {
        await signIn(email, password, rememberSession);
        toast({ title: 'Bienvenido', description: 'Has iniciado sesión correctamente.' });
        navigate(from, { replace: true });
      } else if (view === 'register') {
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
        const { error, data } = await signUp(email, password, { full_name: name });
        if (error) throw error;
        toast({ title: '¡Bienvenido a Bienestar en Claro!', description: 'Tu cuenta ha sido creada. Completa tu perfil para personalizar tu experiencia.' });
        if (data?.user?.id) {
          navigate(`/perfil/${data.user.id}`, { replace: true, state: { welcome: true } });
        } else {
          setView('login');
        }
      } else if (view === 'recover') {
        // Implement recover logic using supabase auth reset password
        toast({ title: '🚧 Recuperación', description: 'This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀' });
        setView('login');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-12">
      <Helmet><title>{view === 'login' ? 'Iniciar Sesión' : view === 'register' ? 'Registro' : 'Recuperar Contraseña'} - Bienestar en Claro</title></Helmet>
      
      <div className="w-full max-w-md bg-card border border-border shadow-xl rounded-3xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {view === 'login' ? 'Bienvenido de nuevo' : view === 'register' ? 'Crea tu cuenta' : 'Recuperar acceso'}
          </h1>
          <p className="text-muted-foreground">
            {view === 'login' ? 'Ingresa tus credenciales para continuar' : 
             view === 'register' ? 'Únete a nuestra comunidad de bienestar' : 
             'Te enviaremos instrucciones a tu correo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {view === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="pl-10 text-foreground bg-background" placeholder="Juan Pérez" />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="pl-10 text-foreground bg-background" placeholder="tu@email.com" />
            </div>
          </div>

          {view !== 'recover' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Contraseña</Label>
                {view === 'login' && (
                  <button type="button" onClick={() => setView('recover')} className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 text-foreground bg-background"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {view === 'login' && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Mantener sesión iniciada
            </label>
          )}

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg rounded-xl" disabled={loading}>
            {loading ? 'Procesando...' : view === 'login' ? 'Iniciar Sesión' : view === 'register' ? 'Registrarse' : 'Enviar Instrucciones'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {view === 'login' ? (
            <p>¿No tienes cuenta? <button onClick={() => setView('register')} className="text-primary font-semibold hover:underline">Regístrate aquí</button></p>
          ) : (
            <p>¿Ya tienes cuenta? <button onClick={() => setView('login')} className="text-primary font-semibold hover:underline">Inicia sesión</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
