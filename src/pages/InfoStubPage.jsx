import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';

const PAGE_MAP = {
  '/guias': {
    title: 'Guías editoriales',
    description:
      'Mapa de guías sobre hígado graso, insulina, inflamación metabólica y marcadores frecuentes.',
    body: 'Esta sección reúne guías base para navegar temas clave con estructura clara, límites explícitos y enfoque práctico.',
  },
  '/metodologia-editorial': {
    title: 'Metodología editorial',
    description:
      'Cómo seleccionamos, revisamos y actualizamos contenido para mantener claridad y rigor editorial.',
    body: 'Definimos temas prioritarios por impacto en salud metabólica, revisamos guías y evidencia disponible, y actualizamos piezas cuando aparecen cambios relevantes o mejores fuentes.',
  },
  '/transparencia': {
    title: 'Transparencia editorial',
    description:
      'Principios de transparencia: alcance educativo, límites del contenido y política de actualizaciones.',
    body: 'Este sitio es educativo y no reemplaza evaluación profesional. Indicamos límites de la evidencia, evitamos promesas clínicas y explicitamos correcciones cuando corresponde.',
  },
  '/correcciones': {
    title: 'Correcciones y actualizaciones',
    description:
      'Registro editorial para correcciones de contenido y actualizaciones relevantes.',
    body: 'Cuando detectamos errores o cambios importantes, corregimos el contenido y dejamos constancia de la actualización para mantener trazabilidad editorial.',
  },
  '/afiliacion': {
    title: 'Divulgación de afiliación',
    description:
      'Política de afiliación y conflictos de interés para preservar independencia editorial.',
    body: 'Si existen enlaces de afiliación, se identifican de forma clara. Las decisiones editoriales no se subordinan a acuerdos comerciales.',
  },
  '/contacto': {
    title: 'Contacto',
    description: 'Canales de contacto para consultas generales sobre Bienestar en Claro.',
    body: 'Puedes escribir para dudas generales, propuestas de mejora o solicitudes sobre el proyecto editorial.',
  },
  '/colaboraciones': {
    title: 'Colaboraciones y prensa',
    description:
      'Página para solicitudes de colaboración, entrevistas y prensa relacionadas al proyecto.',
    body: 'Evaluamos colaboraciones alineadas con divulgación responsable, transparencia y enfoque basado en evidencia.',
  },
  '/reportar-error': {
    title: 'Reportar un error',
    description:
      'Canal para reportar errores de contenido y ayudar a mejorar la calidad editorial del sitio.',
    body: 'Si detectas un error factual o de contexto, compártelo con el enlace y detalle. Revisamos cada reporte y actualizamos cuando corresponde.',
  },
  '/faq': {
    title: 'Preguntas frecuentes',
    description:
      'Respuestas a preguntas frecuentes sobre el enfoque editorial y uso del contenido.',
    body: 'Aquí reunimos respuestas breves sobre el propósito del sitio, cómo usar las guías y qué límites tiene la información publicada.',
  },
  '/glosario': {
    title: 'Glosario',
    description:
      'Definiciones simples de términos sobre metabolismo, hígado, insulina e inflamación.',
    body: 'El glosario traduce términos técnicos a lenguaje claro para facilitar una lectura más comprensible y útil.',
  },
  '/cookies': {
    title: 'Política de cookies',
    description:
      'Información sobre uso de cookies y tecnologías similares en Bienestar en Claro.',
    body: 'Explicamos qué cookies se usan, con qué finalidad y cómo gestionar tus preferencias.',
  },
  '/newsletter': {
    title: 'Newsletter',
    description:
      'Suscripción a actualizaciones editoriales de Bienestar en Claro.',
    body: 'Compartimos 1–2 correos al mes con artículos nuevos y actualizaciones relevantes. Sin spam y con opción de baja.',
  },
};

const InfoStubPage = () => {
  const location = useLocation();
  const page = PAGE_MAP[location.pathname] || {
    title: 'Página informativa',
    description: 'Sección editorial en preparación.',
    body: 'Estamos completando esta sección. Puedes navegar por artículos y guías desde la portada.',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-16 dark:bg-background">
      <Helmet>
        <title>{page.title} - Bienestar en Claro</title>
        <meta name="description" content={page.description} />
      </Helmet>

      <div className="mx-auto w-full max-w-[900px] rounded-3xl border border-border bg-card p-8 shadow-sm">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>{' '}
          &gt; <span>{page.title}</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{page.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{page.description}</p>

        <section className="mt-8 rounded-2xl border border-border bg-background p-6">
          <h2 className="text-xl font-semibold text-foreground">Resumen</h2>
          <p className="mt-3 leading-7 text-muted-foreground">{page.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/articulos"
              className="rounded-xl bg-[#1d4e89] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#163b68]"
            >
              Explorar artículos
            </Link>
            <Link
              to="/empieza-aqui"
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Ir a Empieza aquí
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InfoStubPage;
