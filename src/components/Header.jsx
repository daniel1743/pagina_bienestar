
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const { currentUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Empieza aquí', path: '/empieza-aqui' },
    { name: 'Artículos', path: '/articulos' },
    { name: 'Comunidad', path: '/comunidad' },
    { name: 'Sobre mí', path: '/sobre-mi' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <BrandLogo compact />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map(item => (
            <Link key={item.name} to={item.path} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {item.name}
            </Link>
          ))}
          
          <button onClick={toggleTheme} className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-muted">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4 ml-2 pl-4 border-l border-border">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <NotificationCenter />
                {currentUser.email === 'falcondaniel37@gmail.com' && (
                  <Link to="/admin" className="text-sm font-medium text-primary hover:opacity-80">Admin</Link>
                )}
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link to={`/perfil/${currentUser.id}`}>
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>Salir</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild><Link to="/login">Iniciar sesión</Link></Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90" asChild><Link to="/login?signup=true">Registrarse</Link></Button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {currentUser && <NotificationCenter />}
          <button onClick={toggleTheme} className="text-muted-foreground p-2">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-4 shadow-lg">
          {menuItems.map(item => (
            <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary">
              {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {currentUser ? (
              <>
                <Link to={`/perfil/${currentUser.id}`} onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground">Mi Perfil</Link>
                {currentUser.email === 'falcondaniel37@gmail.com' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="text-sm font-medium text-primary">Admin Dashboard</Link>
                )}
                <button onClick={() => { signOut(); setIsOpen(false); }} className="text-left text-sm font-medium text-foreground">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground">Iniciar sesión</Link>
                <Link to="/login?signup=true" onClick={() => setIsOpen(false)} className="text-sm font-medium text-primary">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
