
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { getGlobalSettings } from '@/lib/adminConfig';
import { useTheme } from '@/contexts/ThemeContext';
import { mergeWithLocalPublishedArticles } from '@/content/localPublishedArticles';
import { Heart, Activity, Flame, ShieldAlert, Users, MessageSquare, BookOpen, User } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const { theme } = useTheme();
  const [globalSettings] = useState(() => getGlobalSettings());

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(3);
      setArticles(mergeWithLocalPublishedArticles(data || [], { limit: 3 }));
    };
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Helmet>
        <title>Bienestar en Claro - Entiende tu cuerpo</title>
        <meta name="description" content="Entiende lo que está pasando en tu cuerpo, con claridad y sin exageraciones." />
      </Helmet>

      {/* Hero Section */}
      <section className={`relative pt-24 pb-32 overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-b from-background to-[#0a1e16]' : 'bg-gradient-to-b from-background to-emerald-50/50'}`}>
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 z-10 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
              {globalSettings.heroTitle || 'Entiende lo que está pasando en tu cuerpo, con claridad.'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto lg:mx-0">
              {globalSettings.heroSubtitle || 'Explicaciones médicas responsables, sin exageraciones.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button asChild size="lg" className="bg-primary hover:opacity-90 text-primary-foreground text-lg px-8 h-14 rounded-full shadow-lg shadow-primary/20">
                <Link to="/articulos">Explorar artículos</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-foreground border-border hover:bg-muted text-lg px-8 h-14 rounded-full">
                <Link to="/comunidad">Conocer comunidad</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative z-10 rounded-2xl overflow-hidden shadow-2xl lg:h-[600px]">
            <img 
              src="https://images.unsplash.com/photo-1612537785084-06a08fc52b11" 
              alt="Medical professional explaining" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:hidden" />
          </motion.div>
        </div>
      </section>

      {/* Founder Authority Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-background rounded-3xl p-8 md:p-12 shadow-xl border border-border flex flex-col md:flex-row items-center gap-10">
            <img 
              src="https://images.unsplash.com/photo-1575383596664-30f4489f9786" 
              alt="Daniel Falcón" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg border-4 border-primary/20"
            />
            <div className="space-y-4 text-center md:text-left flex-1">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Daniel Falcón</h2>
                <p className="text-primary font-medium">Divulgador en bienestar y salud metabólica.</p>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {globalSettings.founderBio}
              </p>
              <Link to="/sobre-mi" className="inline-block text-foreground font-semibold hover:text-primary transition-colors border-b-2 border-primary pb-1">
                Ver perfil completo &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnósticos Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Diagnósticos explicados</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Información sobre salud explicada con claridad y basada en fuentes confiables.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Hígado graso', icon: <Heart className="w-8 h-8" />, desc: 'Metabolismo hepático y reversión' },
              { title: 'Resistencia a insulina', icon: <Activity className="w-8 h-8" />, desc: 'Equilibrio glucémico y energía' },
              { title: 'Inflamación', icon: <Flame className="w-8 h-8" />, desc: 'Inflamación crónica de bajo grado' },
              { title: 'H. pylori', icon: <ShieldAlert className="w-8 h-8" />, desc: 'Salud digestiva y microbioma' }
            ].map((diag) => (
              <Link key={diag.title} to="/articulos" className="group block">
                <Card className="h-full border border-border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-6 md:p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {diag.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{diag.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{diag.desc}</p>
                    <span className="text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Leer guía &rarr;</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">
            Por qué existe Bienestar en Claro
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Bienestar en Claro nace para ayudarte a entender diagnósticos y procesos del cuerpo de
            forma simple, responsable y sin exageraciones, para que puedas tomar decisiones con más
            claridad en tu día a día.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/empieza-aqui">Ir a Empieza aquí</Link>
          </Button>
        </div>
      </section>

      {/* Community Highlight Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0')] bg-cover bg-center mix-blend-overlay" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Nunca estás solo en tu diagnóstico</h2>
          <p className="text-xl max-w-2xl mx-auto mb-12 opacity-90">
            Únete a nuestra comunidad moderada. Comparte experiencias, resuelve dudas generales y encuentra apoyo en personas que están en tu mismo camino.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 backdrop-blur-md">
              <Users className="w-6 h-6" /> <span className="text-lg font-semibold">+5,000 usuarios activos</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 backdrop-blur-md">
              <MessageSquare className="w-6 h-6" /> <span className="text-lg font-semibold">+1,200 discusiones</span>
            </div>
          </div>
          <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 text-lg px-10 h-14 rounded-full shadow-xl">
            <Link to="/comunidad">Explorar comunidad</Link>
          </Button>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">Últimas publicaciones</h2>
              <p className="text-muted-foreground">La ciencia médica más reciente, traducida para ti.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/articulos">Ver todos los artículos <BookOpen className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={`/articulos/${article.slug}`} className="group block h-full">
                  <Card className="h-full border-border bg-card shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden flex flex-col">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {article.image_url ? (
                        <img 
                          src={article.image_url} 
                          alt={article.title} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {article.category || 'Medicina'}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-xs font-medium text-muted-foreground/80 border-t border-border/50 pt-4">
                        <span className="flex items-center gap-2"><User className="w-4 h-4" /> {article.author || 'Daniel Falcón'}</span>
                        <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Reciente'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <strong className="text-foreground">Descargo médico:</strong> {globalSettings.medicalDisclaimer}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
