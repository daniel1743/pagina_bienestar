import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const GetStartedPage = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <Helmet>
        <title>Empieza aquí: guía de salud metabólica - Bienestar en Claro</title>
        <meta
          name="description"
          content="Empieza aquí en Bienestar en Claro: guía de salud metabólica para entender diagnósticos, usar mejor los artículos y llegar mejor preparado a tu consulta."
        />
        <link rel="canonical" href="https://bienestarenclaro.com/empieza-aqui" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-4xl">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>{' '}
          &gt; Empieza aquí
        </nav>

        <h1 className="text-4xl font-bold text-foreground mb-8">
          Empieza aquí: guía clara de salud metabólica
        </h1>

        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Qué es este sitio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bienestar en Claro es una plataforma de educación en salud metabólica. Explicamos
              diagnósticos y procesos del cuerpo con lenguaje simple, enfoque práctico y límites
              claros, para ayudarte a tomar mejores decisiones informadas.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Qué puedes esperar</h2>
            <p className="text-muted-foreground leading-relaxed">
              Encontrarás artículos paso a paso sobre hígado graso, resistencia a la insulina,
              obesidad, digestión e inflamación metabólica. El contenido se organiza para que puedas
              empezar por lo esencial y profundizar sin perder contexto.
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
            <ol className="space-y-3 text-muted-foreground leading-relaxed list-decimal list-inside">
              <li>Empieza por temas base para entender los conceptos clave.</li>
              <li>Revisa artículos relacionados para conectar causas, riesgos y acciones.</li>
              <li>Usa cada lectura como apoyo para hacer mejores preguntas en tu consulta.</li>
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">Ruta recomendada para empezar</h2>
            <div className="grid gap-3">
              <Link
                to="/articulos/resistencia-a-la-insulina-la-raiz-del-sindrome-metabolico-y-como-revertirla"
                className="text-primary hover:underline"
              >
                1. Resistencia a la insulina: la raíz del síndrome metabólico
              </Link>
              <Link
                to="/articulos/higado-graso-en-chile-que-significa-tu-diagnostico-y-que-puedes-hacer-desde-hoy"
                className="text-primary hover:underline"
              >
                2. Hígado graso en Chile: qué significa tu diagnóstico
              </Link>
              <Link
                to="/articulos/obesidad-la-enfermedad-metabolica-que-no-empieza-en-la-balanza"
                className="text-primary hover:underline"
              >
                3. Obesidad: la enfermedad metabólica que no empieza en la balanza
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;
