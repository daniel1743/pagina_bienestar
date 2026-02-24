
import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import BrandLogo from '@/components/BrandLogo';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const { currentUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Empieza aquí', path: '/empieza-aqui' },
    { name: 'Artículos', path: '/articulos' },
    { name: 'Comunidad', path: '/comunidad' },
    { name: 'Sobre mí', path: '/sobre-mi' },
  ];

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'nav--scrolled' : ''}`}>
      <div className="container mx-auto px-4 h-[72px] flex items-center justify-between">
        <Link to="/" className="nav-brand flex items-center -translate-y-[2px]">
          <BrandLogo compact />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `${isActive ? 'is-active' : ''} text-sm`
              }
            >
              {item.name}
            </NavLink>
          ))}
          
          <button onClick={toggleTheme} className="inline-flex items-center justify-center">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4 ml-2 pl-4 border-l border-border">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <NotificationCenter />
                {currentUser.email === 'falcondaniel37@gmail.com' && (
                  <NavLink to="/admin" className={({ isActive }) => `${isActive ? 'is-active' : ''} text-sm`}>
                    Admin
                  </NavLink>
                )}
                <Link to={`/perfil/${currentUser.id}`} className="inline-flex items-center justify-center" aria-label="Mi perfil">
                  <User className="w-5 h-5" />
                </Link>
                <button type="button" onClick={signOut} className="nav-secondary text-sm">
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login" className={({ isActive }) => `nav-secondary text-sm ${isActive ? 'is-active' : ''}`}>
                  Iniciar sesión
                </NavLink>
                <NavLink to="/login?signup=true" className="nav-cta text-sm">
                  Registrarse
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {currentUser && <NotificationCenter />}
          <button onClick={toggleTheme} className="inline-flex items-center justify-center">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="inline-flex items-center justify-center" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block text-sm ${isActive ? 'is-active' : ''}`
              }
            >
              {item.name}
            </NavLink>
          ))}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {currentUser ? (
              <>
                <Link to={`/perfil/${currentUser.id}`} onClick={() => setIsOpen(false)} className="text-sm">
                  Mi Perfil
                </Link>
                {currentUser.email === 'falcondaniel37@gmail.com' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="text-sm">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { signOut(); setIsOpen(false); }} className="text-left text-sm">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm">
                  Iniciar sesión
                </Link>
                <Link to="/login?signup=true" onClick={() => setIsOpen(false)} className="nav-cta text-sm text-center">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
