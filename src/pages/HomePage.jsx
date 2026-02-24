import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Clock3,
  FlaskConical,
  ShieldCheck,
  User,
  Waypoints,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { getGlobalSettings } from '@/lib/adminConfig';
import { mergeWithLocalPublishedArticles } from '@/content/localPublishedArticles';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.35, ease: 'easeOut' },
};

const titleClampStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const excerptClampStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const getArticleTimestamp = (article) =>
  new Date(article?.updated_at || article?.published_at || article?.created_at || 0).getTime();

const formatDate = (value) => {
  if (!value) return 'Actualizado recientemente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Actualizado recientemente';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const calculateReadingMinutes = (article) => {
  if (article?.reading_time_minutes) return `${article.reading_time_minutes} min`;
  if (article?.content) {
    const plainText = String(article.content).replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(2, Math.ceil(words / 220));
    return `${minutes} min`;
  }
  return '4 min';
};

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [globalSettings] = useState(() => getGlobalSettings());
  const reduceMotion = useReducedMotion();
  const revealProps = reduceMotion
    ? { initial: false, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
    : fadeUp;

  useEffect(() => {
    const fetchArticles = async () => {
      const primary = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('updated_at', { ascending: false })
        .limit(6);

      let remoteArticles = primary.data || [];

      if (primary.error) {
        const fallback = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('updated_at', { ascending: false })
          .limit(6);
        remoteArticles = fallback.data || [];
      }

      const merged = mergeWithLocalPublishedArticles(remoteArticles);
      const sorted = [...merged]
        .sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a))
        .slice(0, 6);

      setArticles(sorted);
    };

    fetchArticles();
  }, []);

  const siteUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://bienestarenclaro.com';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors duration-300 dark:bg-background dark:text-foreground">
      <Helmet>
        <title>Bienestar en Claro | Bienestar basado en evidencia</title>
        <meta
          name="description"
          content="Divulgación sobre metabolismo, inflamación y salud hepática con enfoque latinoamericano, sin exageraciones."
        />
        <meta property="og:title" content="Bienestar en Claro | Bienestar basado en evidencia" />
        <meta
          property="og:description"
          content="Información editorial sobre salud metabólica, explicada con claridad y límites explícitos."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
      </Helmet>

      <section
        id="hero"
        className="bg-[linear-gradient(135deg,#0B1220_0%,#0E1A2F_55%,#0B1220_100%)] px-4 py-28"
      >
        <div className="mx-auto grid w-full max-w-[1100px] gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <motion.div {...revealProps} className="space-y-8 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              Plataforma editorial latinoamericana
            </p>
            <h1 className="mx-auto max-w-[800px] text-3xl font-bold leading-tight text-white md:mx-0 md:text-5xl">
              Salud metabólica basada en evidencia, sin exageraciones.
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-base leading-relaxed text-white/80 md:mx-0 md:text-lg">
              Explicamos lo que se sabe hoy sobre hígado graso, resistencia a la insulina e
              inflamación metabólica con enfoque práctico, claridad editorial y límites explícitos.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-2xl bg-[#34D399] px-6 text-[#0B1220] hover:bg-[#2CC98C]"
              >
                <Link to="/guias">Explorar guías</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-2xl border-white/30 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/empieza-aqui">Empieza aquí</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-2 text-sm text-white/75 md:justify-start">
              <li>Guías actualizadas periódicamente</li>
              <li>Sin promesas milagro</li>
              <li>Contenido educativo, no diagnóstico</li>
              <li>Enfoque latinoamericano</li>
            </ul>
          </motion.div>

          <motion.div
            {...revealProps}
            transition={reduceMotion ? { duration: 0 } : { ...fadeUp.transition, delay: 0.08 }}
            className="pointer-events-none relative hidden h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] opacity-85 lg:block"
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#34D399]/14" />
            <div className="absolute -bottom-10 left-8 h-40 w-40 rounded-full bg-[#60A5FA]/12" />
            <svg
              viewBox="0 0 640 420"
              className="h-full w-full scale-105"
              role="img"
              aria-label="Ilustración abstracta de metabolismo"
            >
              <defs>
                <linearGradient id="metabPath" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              <circle cx="320" cy="210" r="126" stroke="url(#metabPath)" strokeWidth="1.2" fill="none" />
              <circle cx="320" cy="210" r="92" stroke="#E2E8F0" strokeOpacity="0.28" strokeWidth="1" fill="none" />
              <path
                d="M86 248 C164 168, 236 128, 324 160 C410 192, 486 158, 556 104"
                stroke="url(#metabPath)"
                strokeWidth="2.2"
                fill="none"
              />
              <path
                d="M108 318 C182 252, 258 214, 336 234 C410 252, 478 228, 544 180"
                stroke="#A7F3D0"
                strokeOpacity="0.6"
                strokeWidth="1.6"
                fill="none"
              />
              <circle cx="164" cy="188" r="6" fill="#93C5FD" fillOpacity="0.85" />
              <circle cx="264" cy="146" r="6" fill="#34D399" fillOpacity="0.85" />
              <circle cx="392" cy="178" r="6" fill="#93C5FD" fillOpacity="0.8" />
              <circle cx="474" cy="152" r="7" fill="#34D399" fillOpacity="0.82" />
              <circle cx="232" cy="268" r="5" fill="#E2E8F0" fillOpacity="0.65" />
              <circle cx="352" cy="246" r="5" fill="#E2E8F0" fillOpacity="0.65" />
              <circle cx="430" cy="228" r="5" fill="#E2E8F0" fillOpacity="0.65" />
            </svg>
          </motion.div>
        </div>
      </section>

      <section id="diferenciacion" className="border-y border-slate-200 bg-[#f5f8fb] px-4 py-20 dark:border-border dark:bg-card/40">
        <motion.div {...revealProps} className="mx-auto w-full max-w-[1100px]">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground md:text-4xl">
            ¿Por qué Bienestar en Claro es diferente?
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Basado en evidencia',
                text: 'Explicamos lo que se sabe hoy, con fuentes y límites claros.',
                icon: FlaskConical,
              },
              {
                title: 'Sin exageraciones',
                text: 'Nada de alarmismo ni promesas. Enfoque realista y útil.',
                icon: ShieldCheck,
              },
              {
                title: 'Enfoque metabólico',
                text: 'Conectamos diagnóstico, hábitos y contexto de forma práctica.',
                icon: Waypoints,
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
                <CardContent className="space-y-3 p-6">
                  <item.icon className="h-8 w-8 text-[#1d4e89] dark:text-primary" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-foreground">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-600 dark:text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="pilares-editoriales" className="bg-white px-4 py-20 dark:bg-background">
        <motion.div {...revealProps} className="mx-auto w-full max-w-[1100px]">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground md:text-4xl">Áreas centrales</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Metabolismo hepático',
                description: 'Hígado graso, marcadores, etapas y decisiones prácticas.',
                to: '/guias/metabolismo-hepatico',
              },
              {
                title: 'Resistencia a la insulina',
                description: 'Qué significa, señales, exámenes y cambios sostenibles.',
                to: '/guias/resistencia-a-la-insulina',
              },
              {
                title: 'Inflamación metabólica',
                description: 'Inflamación crónica, estilo de vida, sueño y estrés.',
                to: '/guias/inflamacion-metabolica',
              },
            ].map((item) => (
              <Card key={item.title} className="group rounded-2xl border-slate-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md dark:border-border dark:bg-card">
                <CardContent className="space-y-4 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-foreground">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-600 dark:text-muted-foreground">{item.description}</p>
                  <Link
                    to={item.to}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#1d4e89] transition-colors hover:text-[#163b68] dark:text-primary"
                  >
                    Ver guía
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="autor-confianza" className="border-y border-slate-200 bg-[#f5f8fb] px-4 py-20 dark:border-border dark:bg-card/40">
        <motion.div {...revealProps} className="mx-auto flex w-full max-w-[1100px] flex-col items-start gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-border dark:bg-card md:flex-row md:items-center">
          <img
            src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80&fm=webp"
            alt="Retrato profesional de Daniel Falcón"
            className="h-32 w-32 rounded-2xl object-cover md:h-36 md:w-36"
            width={240}
            height={240}
            loading="lazy"
            decoding="async"
          />
          <div className="max-w-[780px] space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground">Quién está detrás</h2>
            <p className="text-lg font-semibold text-[#1d4e89] dark:text-primary">
              Daniel Falcón
              <span className="block text-base font-medium text-slate-700 dark:text-muted-foreground">
                Divulgador en bienestar y salud metabólica (basado en evidencia)
              </span>
            </p>
            <p className="leading-7 text-slate-700 dark:text-muted-foreground">
              {globalSettings.founderBio ||
                'Traduzco información de salud y bienestar desde fuentes confiables a lenguaje claro y accionable. Este sitio es educativo y no reemplaza evaluación profesional.'}
            </p>
            <ul className="grid gap-2 text-sm text-slate-700 dark:text-muted-foreground sm:grid-cols-3">
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-border dark:bg-background">
                Explicación clara y estructurada
              </li>
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-border dark:bg-background">
                Fuentes y límites explícitos
              </li>
              <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-border dark:bg-background">
                Cero sensacionalismo
              </li>
            </ul>
            <Button asChild variant="outline" className="rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-border dark:text-foreground">
              <Link to="/sobre-mi">Conoce mi enfoque</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section id="empieza-aqui" className="bg-white px-4 py-20 dark:bg-background">
        <motion.div {...revealProps} className="mx-auto w-full max-w-[1100px]">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground md:text-4xl">Empieza aquí</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Tengo un diagnóstico',
                text: 'Guías para entender qué significa y qué hacer desde hoy.',
                to: '/empieza-aqui/diagnostico',
              },
              {
                title: 'Quiero prevenir',
                text: 'Hábitos y señales tempranas para cuidar tu metabolismo.',
                to: '/empieza-aqui/prevenir',
              },
              {
                title: 'Quiero entender mis exámenes',
                text: 'Interpretación general: qué mirar y qué preguntar.',
                to: '/empieza-aqui/examenes',
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-2xl border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-border dark:bg-card">
                <CardContent className="space-y-4 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-foreground">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-600 dark:text-muted-foreground">{item.text}</p>
                  <Button asChild className="h-11 w-full rounded-xl bg-[#1d4e89] text-white hover:bg-[#163b68]">
                    <Link to={item.to}>Ir ahora</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="ultimas-publicaciones" className="border-y border-slate-200 bg-[#f5f8fb] px-4 py-20 dark:border-border dark:bg-card/40">
        <motion.div {...revealProps} className="mx-auto w-full max-w-[1100px]">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground md:text-4xl">Últimas publicaciones</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-muted-foreground">
                Artículos actualizados periódicamente.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-border dark:text-foreground">
              <Link to="/articulos">Ver todo el archivo editorial</Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id || article.slug} to={`/articulos/${article.slug}`} className="group block">
                <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md dark:border-border dark:bg-card">
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-muted">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-slate-400 dark:text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-background dark:text-muted-foreground">
                        {article.category || 'General'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {calculateReadingMinutes(article)}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold leading-snug text-slate-900 transition-colors group-hover:text-[#1d4e89] dark:text-foreground dark:group-hover:text-primary" style={titleClampStyle}>
                      {article.title}
                    </h3>
                    <p className="mb-5 text-sm text-slate-600 dark:text-muted-foreground" style={excerptClampStyle}>
                      {article.excerpt || 'Artículo editorial actualizado para contexto latinoamericano.'}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-border dark:text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {article.author || 'Daniel Falcón'}
                      </span>
                      <span>{formatDate(article.updated_at || article.published_at || article.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="comunidad" className="bg-white px-4 py-20 dark:bg-background">
        <motion.div {...revealProps} className="mx-auto w-full max-w-[1100px] rounded-3xl border border-slate-200 bg-[#eff6ff] p-8 dark:border-border dark:bg-card">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground">Comunidad de aprendizaje</h2>
          <p className="mt-3 max-w-[780px] leading-7 text-slate-700 dark:text-muted-foreground">
            Un espacio moderado para aprender y compartir experiencias sin reemplazar atención
            profesional.
          </p>
          <Button asChild className="mt-6 h-11 rounded-xl bg-[#1d4e89] px-6 text-white hover:bg-[#163b68]">
            <Link to="/comunidad">Explorar comunidad</Link>
          </Button>
        </motion.div>
      </section>

      <section id="transparencia" className="border-t border-slate-200 bg-[#f8fafc] px-4 py-20 dark:border-border dark:bg-background">
        <motion.div {...revealProps} className="mx-auto w-full max-w-[1100px]">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground md:text-4xl">
            Transparencia editorial
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Educativo, no diagnóstico',
                text: 'No reemplaza consulta médica ni indica tratamientos personalizados.',
              },
              {
                title: 'Fuentes y límites',
                text: 'Se citan guías y evidencia disponible; se aclara incertidumbre.',
              },
              {
                title: 'Afiliaciones (si aplica)',
                text: 'Si en el futuro existen enlaces de afiliación, se declararán de forma clara y nunca sustituirán el contenido central.',
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
                <CardContent className="space-y-3 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-600 dark:text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-[#f8fafc] px-4 pb-16 dark:bg-background">
        <div className="mx-auto w-full max-w-[1100px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-border dark:bg-card dark:text-muted-foreground">
          <strong className="text-slate-900 dark:text-foreground">Descargo médico:</strong>{' '}
          {globalSettings.medicalDisclaimer ||
            'Este sitio es informativo y no sustituye la consulta médica profesional, diagnóstico o tratamiento personalizado.'}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
