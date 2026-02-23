
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              <span className="text-primary">Bienestar</span> en Claro
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Información sobre salud explicada con claridad y basada en fuentes confiables.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/legal/politica-privacidad" className="hover:text-primary transition-colors">Privacidad</Link></li>
              <li><Link to="/legal/terminos" className="hover:text-primary transition-colors">Términos</Link></li>
              <li><Link to="/legal/aviso-medico" className="hover:text-primary transition-colors">Aviso médico</Link></li>
              <li><Link to="/legal/politica-editorial" className="hover:text-primary transition-colors">Política editorial</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Conecta</h4>
            <div className="flex gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Bienestar en Claro. Todos los derechos reservados.</p>
          <p className="text-xs text-muted-foreground/70 max-w-xl text-center md:text-right">
            ⚠️ <strong>Aviso Médico:</strong> El contenido de este sitio es puramente educativo y no reemplaza la consulta, diagnóstico o tratamiento médico profesional.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
