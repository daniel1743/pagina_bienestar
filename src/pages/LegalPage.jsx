
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
  '/sobre-mi': { title: 'Sobre Mí', content: '' },
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
  const isAboutPage = location.pathname === '/sobre-mi';

  if (isAboutPage) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 dark:bg-background">
        <Helmet>
          <title>Sobre mí - Bienestar en Claro</title>
          <meta
            name="description"
            content="Perfil editorial de Daniel Falcón y principios de trabajo en divulgación de salud metabólica basada en evidencia."
          />
        </Helmet>

        <div className="mx-auto w-full max-w-[1100px] px-4">
          <nav className="mb-10 text-sm text-slate-500 dark:text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-primary">
              Inicio
            </Link>{' '}
            &gt; Sobre mí
          </nav>

          <section className="grid items-start gap-16 border-y border-slate-200 py-12 dark:border-border md:grid-cols-[28%_72%]">
            <figure className="aspect-[3/4] min-h-[360px] max-h-[420px] w-full max-w-[315px] overflow-hidden rounded-[4px] bg-transparent">
              <img
                src="/images/DANIEL_FALCON.jpeg"
                alt="Daniel Falcón"
                className="h-full w-full object-cover"
                style={{ objectPosition: '50% 30%' }}
                width={416}
                height={624}
                loading="lazy"
                decoding="async"
              />
            </figure>

            <div className="max-w-[65ch] space-y-5">
              <h1 className="text-3xl font-semibold uppercase tracking-[0.04em] text-[#0B1F3B] dark:text-foreground md:text-[2.4rem]">
                Quién está detrás
              </h1>
              <p className="text-[1.45rem] font-semibold leading-tight text-[#0B1F3B] dark:text-foreground">
                Daniel Falcón
              </p>
              <p className="text-[1.05rem] text-slate-700 dark:text-muted-foreground">
                Divulgador en bienestar y salud metabólica con enfoque editorial basado en evidencia.
              </p>

              <p className="text-[1.02rem] leading-[1.7] text-slate-700 dark:text-muted-foreground">
                Bienestar en Claro nace para traducir información compleja de salud metabólica a un
                lenguaje claro, verificable y útil para personas de habla hispana.
              </p>
              <p className="text-[1.02rem] leading-[1.7] text-slate-700 dark:text-muted-foreground">
                La línea editorial prioriza utilidad práctica, precisión terminológica y contexto
                latinoamericano, evitando promesas clínicas o mensajes alarmistas.
              </p>
              <p className="text-[1.02rem] leading-[1.7] text-slate-700 dark:text-muted-foreground">
                El sitio no reemplaza evaluación profesional. Su propósito es ayudarte a entender mejor
                diagnósticos, marcadores y hábitos para formular mejores preguntas en consulta.
              </p>

              <ul className="space-y-2 text-[1rem] leading-[1.7] text-slate-700 dark:text-muted-foreground">
                <li>• Basado en evidencia disponible y límites explícitos.</li>
                <li>• Sin sensacionalismo ni recomendaciones milagro.</li>
                <li>• Estructura clara para decisiones informadas.</li>
                <li>• Revisión y actualización editorial periódica.</li>
              </ul>

              <p className="text-[1rem] text-slate-700 dark:text-muted-foreground">
                Contacto:{' '}
                <a
                  href="mailto:contacto@bienestarenclaro.com"
                  className="font-medium text-[#0B1F3B] transition-colors hover:text-[#1E6F5C] dark:text-foreground dark:hover:text-primary"
                >
                  contacto@bienestarenclaro.com
                </a>
              </p>

              <Link
                to="/metodologia-editorial"
                className="inline-flex text-[1rem] font-medium text-[#0B1F3B] transition-colors hover:text-[#1E6F5C] dark:text-foreground dark:hover:text-primary"
              >
                Conoce el enfoque completo →
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

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
