import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const GetStartedPage = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <Helmet>
        <title>Empieza aquí - Bienestar en Claro</title>
        <meta
          name="description"
          content="Guía para empezar en Bienestar en Claro: qué es el sitio, qué puedes esperar y cómo usar los artículos."
        />
      </Helmet>

      <div className="container mx-auto px-4 max-w-4xl">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>{' '}
          &gt; Empieza aquí
        </nav>

        <h1 className="text-4xl font-bold text-foreground mb-8">Empieza aquí</h1>

        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Qué es este sitio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bienestar en Claro es una plataforma de divulgación y educación en bienestar y salud
              metabólica, creada para explicar diagnósticos y procesos del cuerpo de forma clara y sin
              alarmismo.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Qué puedes esperar</h2>
            <p className="text-muted-foreground leading-relaxed">
              Artículos prácticos, explicaciones ordenadas y lenguaje sencillo para entender mejor tu
              salud, con enfoque responsable y basado en fuentes confiables.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Qué no hacemos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este sitio no reemplaza consulta médica, diagnóstico ni tratamiento personalizado.
              Siempre consulta con un profesional de salud calificado para decisiones clínicas.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Cómo usar los artículos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Empieza por temas base, revisa conceptos clave y luego profundiza según tu situación.
              Usa cada artículo como apoyo para hacer mejores preguntas en tu consulta.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;
