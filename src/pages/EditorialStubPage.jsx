import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useParams } from 'react-router-dom';

const GUIDE_MAP = {
  'metabolismo-hepatico': {
    title: 'Guía de metabolismo hepático',
    description:
      'Marco editorial para entender hígado graso, marcadores y decisiones de estilo de vida.',
  },
  'higado-graso': {
    title: 'Guía de hígado graso',
    description:
      'Ruta práctica para comprender hígado graso, factores de riesgo y decisiones sostenibles.',
  },
  'resistencia-a-la-insulina': {
    title: 'Guía de resistencia a la insulina',
    description:
      'Explicación estructurada sobre señales, exámenes y hábitos sostenibles para contexto latinoamericano.',
  },
  'resistencia-insulina': {
    title: 'Guía de resistencia a la insulina',
    description:
      'Explicación estructurada sobre señales, exámenes y hábitos sostenibles para contexto latinoamericano.',
  },
  'inflamacion-metabolica': {
    title: 'Guía de inflamación metabólica',
    description:
      'Relación entre inflamación crónica, sueño, estrés y decisiones prácticas del día a día.',
  },
  'examenes-y-marcadores': {
    title: 'Guía de exámenes y marcadores',
    description:
      'Interpretación general de marcadores frecuentes y preguntas útiles para consulta.',
  },
};

const GET_STARTED_MAP = {
  diagnostico: {
    title: 'Tengo un diagnóstico',
    description:
      'Ruta inicial para entender qué significa un diagnóstico y cómo conversar mejor con profesionales de salud.',
  },
  prevenir: {
    title: 'Quiero prevenir',
    description:
      'Ruta de prevención con foco en hábitos, señales tempranas y seguimiento de cambios sostenibles.',
  },
  examenes: {
    title: 'Quiero entender mis exámenes',
    description:
      'Guía básica para interpretar resultados generales y preparar preguntas útiles para consulta.',
  },
};

const CATEGORY_MAP = {
  metabolismo: {
    title: 'Categoría: Metabolismo',
    description:
      'Artículos y guías editoriales para comprender relaciones entre energía, glucosa e inflamación.',
  },
  higado: {
    title: 'Categoría: Hígado',
    description:
      'Contenido educativo sobre salud hepática, marcadores y prevención de progresión metabólica.',
  },
  insulina: {
    title: 'Categoría: Insulina',
    description:
      'Piezas para entender resistencia a la insulina, señales tempranas y decisiones cotidianas.',
  },
  inflamacion: {
    title: 'Categoría: Inflamación',
    description:
      'Contenido editorial sobre inflamación crónica de bajo grado y factores de estilo de vida.',
  },
  microbiota: {
    title: 'Categoría: Microbiota',
    description:
      'Artículos introductorios sobre microbiota, salud digestiva y contexto metabólico.',
  },
};

const resolveContent = (pathname, slug) => {
  if (pathname.startsWith('/guias/')) {
    const fallbackLabel = String(slug || 'tema').replaceAll('-', ' ');
    return (
      GUIDE_MAP[slug] || {
        title: `Guía editorial: ${fallbackLabel}`,
        description:
          'Esta guía está en preparación. Mientras tanto, puedes revisar artículos relacionados y la ruta Empieza aquí.',
      }
    );
  }

  if (pathname.startsWith('/empieza-aqui/')) {
    const fallbackLabel = String(slug || 'ruta').replaceAll('-', ' ');
    return (
      GET_STARTED_MAP[slug] || {
        title: `Ruta inicial: ${fallbackLabel}`,
        description:
          'Esta ruta está en preparación. Te recomendamos comenzar por el bloque principal de Empieza aquí.',
      }
    );
  }

  const fallbackLabel = String(slug || 'tema').replaceAll('-', ' ');
  return (
    CATEGORY_MAP[slug] || {
      title: `Categoría: ${fallbackLabel}`,
      description:
        'Listado editorial en preparación. Puedes navegar por el archivo completo mientras se publica esta categoría.',
    }
  );
};

const EditorialStubPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const content = resolveContent(location.pathname, slug);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-16 dark:bg-background">
      <Helmet>
        <title>{content.title} - Bienestar en Claro</title>
        <meta name="description" content={content.description} />
      </Helmet>

      <div className="mx-auto w-full max-w-[900px] rounded-3xl border border-border bg-card p-8 shadow-sm">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>{' '}
          &gt;{' '}
          <span>{content.title}</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{content.title}</h1>
        <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">{content.description}</p>

        <section className="mt-8 rounded-2xl border border-border bg-background p-6">
          <h2 className="text-xl font-semibold text-foreground">Estado de esta sección</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Estamos completando esta página como parte de la arquitectura editorial por clusters.
            Mientras tanto, usa los recursos siguientes para continuar.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/articulos"
              className="rounded-xl bg-[#1d4e89] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#163b68]"
            >
              Ver artículos
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

export default EditorialStubPage;
