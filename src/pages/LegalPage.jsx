
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const contentMap = {
  '/politica-privacidad': { title: 'Política de Privacidad', content: 'Contenido de la política de privacidad...' },
  '/privacidad': { title: 'Política de Privacidad', content: 'Contenido de la política de privacidad...' },
  '/terminos': { title: 'Términos de Servicio', content: 'Contenido de los términos...' },
  '/aviso-medico': { title: 'Aviso Médico', content: 'Este sitio es solo educativo y no sustituye la consulta médica profesional.' },
  '/descargo': { title: 'Descargo Médico', content: 'Este sitio es solo educativo y no sustituye la consulta médica profesional.' },
  '/politica-editorial': { title: 'Política Editorial', content: 'Información sobre salud explicada con claridad y basada en fuentes confiables.' },
  '/sobre-mi': { 
    title: 'Sobre Mí', 
    content: `
      <div class="flex flex-col md:flex-row gap-8 mb-8">
        <img src="/images/DANIEL_FALCON.jpeg" alt="Daniel Falcón" class="w-44 h-64 md:w-52 md:h-72 rounded-2xl object-cover border border-slate-200 shadow-sm transition-transform duration-500 hover:scale-[1.02]" />
        <div>
          <p class="text-lg">Soy Daniel Falcón, divulgador en bienestar y salud metabólica. Creo firmemente que la educación clara es una herramienta clave para tomar mejores decisiones.</p>
          <br/>
          <p>Contacto: <a href="mailto:contacto@bienestarenclaro.com" class="text-emerald-600">contacto@bienestarenclaro.com</a></p>
        </div>
      </div>
    `
  },
  '/contacto': { title: 'Contacto', content: 'Escríbeme a contacto@bienestarenclaro.com' },
  '/empieza-aqui': { title: 'Empieza Aquí', content: 'Guía para comenzar a entender tu salud de manera sencilla.' },
  '/legal/politica-privacidad': { title: 'Política de Privacidad', content: 'Contenido de la política de privacidad...' },
  '/legal/privacidad': { title: 'Política de Privacidad', content: 'Contenido de la política de privacidad...' },
  '/legal/cookies': {
    title: 'Política de Cookies',
    content:
      'Usamos cookies esenciales para funcionamiento y seguridad. Las cookies no esenciales (analítica/marketing/externos) solo se activan con tu consentimiento y puedes cambiar esta preferencia en cualquier momento.',
  },
  '/legal/terminos': { title: 'Términos de Servicio', content: 'Contenido de los términos...' },
  '/legal/aviso-medico': { title: 'Aviso Médico', content: 'Este sitio es solo educativo y no sustituye la consulta médica profesional.' },
  '/legal/descargo': { title: 'Descargo Médico', content: 'Este sitio es solo educativo y no sustituye la consulta médica profesional.' },
  '/legal/politica-editorial': { title: 'Política Editorial', content: 'Información sobre salud explicada con claridad y basada en fuentes confiables.' }
};

const LegalPage = () => {
  const location = useLocation();
  const pageData = contentMap[location.pathname] || { title: 'Página no encontrada', content: '' };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <Helmet><title>{pageData.title} - Bienestar en Claro</title></Helmet>
      <div className="container mx-auto px-4 max-w-3xl bg-white p-8 rounded-xl shadow-sm">
        <nav className="text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-emerald-500">Inicio</Link> &gt; {pageData.title}
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">{pageData.title}</h1>
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: pageData.content }} />
      </div>
    </div>
  );
};

export default LegalPage;
