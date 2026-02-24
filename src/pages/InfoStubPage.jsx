import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import ErrorReportModal from '@/components/ErrorReportModal';

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

const EditorialMethodologyPage = () => (
  <div className="min-h-screen bg-[#f8fafc] px-4 py-16 dark:bg-background">
    <Helmet>
      <title>Metodología editorial - Bienestar en Claro</title>
      <meta
        name="description"
        content="Documento institucional de metodología editorial: selección de temas, jerarquía de evidencia, revisión, límites y transparencia."
      />
    </Helmet>

    <div className="mx-auto w-full max-w-[1100px]">
      <nav className="mb-8 text-sm text-slate-500 dark:text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-primary">
          Inicio
        </Link>{' '}
        &gt; <span>Metodología editorial</span>
      </nav>

      <header className="border-b border-slate-200 pb-8 dark:border-border">
        <h1 className="text-3xl font-semibold text-[#0B1F3B] dark:text-foreground md:text-4xl">
          Metodología editorial
        </h1>
        <p className="mt-4 max-w-[65ch] leading-7 text-slate-700 dark:text-muted-foreground">
          Este documento describe cómo priorizamos, redactamos, revisamos y actualizamos contenido
          sobre salud metabólica. El objetivo es sostener claridad editorial, rigor técnico y
          transparencia para audiencia latinoamericana.
        </p>
      </header>

      <article className="mt-10 max-w-[65ch] space-y-12 text-slate-800 dark:text-foreground">
        <section aria-labelledby="criterios-seleccion">
          <h2 id="criterios-seleccion" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            1. Criterios de selección de temas
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Priorizamos temas por prevalencia en consulta, impacto clínico y nivel de confusión
            frecuente en población general. El enfoque central en salud metabólica responde a su
            relación transversal con hígado graso, resistencia a la insulina, inflamación crónica y
            riesgo cardiometabólico.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            No publicamos tendencias virales, protocolos extremos ni recomendaciones sin respaldo
            metodológico verificable. Cuando un tema es emergente, se presenta como hipótesis en
            desarrollo y no como conclusión cerrada.
          </p>
        </section>

        <section aria-labelledby="jerarquia-evidencia">
          <h2 id="jerarquia-evidencia" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            2. Jerarquía de evidencia
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            La interpretación editorial utiliza una jerarquía explícita de fuentes para reducir sesgo
            y mejorar trazabilidad:
          </p>
          <ul className="mt-4 space-y-2 leading-7 text-slate-700 dark:text-muted-foreground">
            <li>• Guías clínicas internacionales y consensos de sociedades científicas.</li>
            <li>• Metaanálisis y revisiones sistemáticas recientes.</li>
            <li>• Ensayos clínicos controlados con metodología robusta.</li>
            <li>• Estudios observacionales para contexto y señales de asociación.</li>
          </ul>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Si existe evidencia contradictoria, se comparan calidad metodológica, tamaño del efecto,
            población estudiada y reproducibilidad. Los límites se comunican en lenguaje claro, con
            incertidumbre explícita cuando no hay consenso.
          </p>
        </section>

        <section aria-labelledby="proceso-revision">
          <h2 id="proceso-revision" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            3. Proceso de revisión
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Cada pieza se desarrolla en cuatro etapas: definición de objetivo editorial, revisión de
            fuentes, redacción con estructura didáctica y control final de precisión terminológica.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            El contenido se revisa de forma periódica y también ante cambios relevantes en guías o
            nueva evidencia de alto impacto. Cuando una recomendación cambia, se actualiza el texto y
            se deja registro de corrección o actualización para mantener continuidad editorial.
          </p>
        </section>

        <section aria-labelledby="limites-alcance">
          <h2 id="limites-alcance" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            4. Límites y alcance
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Bienestar en Claro es una plataforma educativa y no reemplaza consulta médica ni evaluación
            profesional individual. No realizamos diagnósticos, no indicamos tratamientos personalizados
            y no emitimos promesas de resultado clínico.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Se evita lenguaje alarmista y se excluyen narrativas de “cura rápida” o soluciones milagro.
            El propósito es mejorar comprensión para decisiones más informadas y conversaciones clínicas
            más útiles.
          </p>
        </section>

        <section aria-labelledby="transparencia-conflictos">
          <h2 id="transparencia-conflictos" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            5. Transparencia y conflictos de interés
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            La política editorial exige declarar afiliaciones y separar claramente contenido educativo
            de cualquier integración comercial. Si existen enlaces de afiliación, se identifican de
            forma visible y nunca determinan la línea editorial.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Mantenemos compromiso de correcciones públicas cuando se detectan errores de forma,
            interpretación o referencia, con actualización verificable para preservar confianza.
          </p>
        </section>

        <p className="border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600 dark:border-border dark:text-muted-foreground">
          Nota institucional: este documento refleja el estándar editorial vigente de Bienestar en
          Claro al 24 de febrero de 2026 y se revisa de forma periódica para mantener consistencia,
          trazabilidad y responsabilidad informativa.
        </p>
      </article>
    </div>
  </div>
);

const EditorialTransparencyPage = () => (
  <div className="min-h-screen bg-[#f8fafc] px-4 py-16 dark:bg-background">
    <Helmet>
      <title>Transparencia editorial - Bienestar en Claro</title>
      <meta
        name="description"
        content="Documento de transparencia editorial: alcance, límites, evidencia, correcciones y conflictos de interés."
      />
    </Helmet>

    <div className="mx-auto w-full max-w-[1100px]">
      <nav className="mb-8 text-sm text-slate-500 dark:text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-primary">
          Inicio
        </Link>{' '}
        &gt; <span>Transparencia editorial</span>
      </nav>

      <header className="border-b border-slate-200 pb-8 dark:border-border">
        <h1 className="text-3xl font-semibold text-[#0B1F3B] dark:text-foreground md:text-4xl">
          Transparencia editorial
        </h1>
        <p className="mt-4 max-w-[65ch] leading-7 text-slate-700 dark:text-muted-foreground">
          Este documento establece los criterios de claridad, límites y rendición de cuentas que
          rigen la publicación de contenidos en Bienestar en Claro.
        </p>
      </header>

      <article className="mt-10 max-w-[65ch] space-y-12 text-slate-800 dark:text-foreground">
        <section aria-labelledby="alcance-limites">
          <h2 id="alcance-limites" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            1. Alcance y límites del contenido
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Bienestar en Claro es una plataforma educativa en salud metabólica. El contenido se
            publica con fines de comprensión general y no sustituye consulta, diagnóstico ni
            tratamiento profesional individual.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            No se formulan promesas clínicas, curas garantizadas ni recomendaciones personalizadas.
            Cuando se describen estrategias de estilo de vida, se explican como orientación general,
            con límites y contexto.
          </p>
        </section>

        <section aria-labelledby="fuentes-evidencia">
          <h2 id="fuentes-evidencia" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            2. Fuentes y jerarquía de evidencia
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Las afirmaciones editoriales priorizan guías clínicas, metaanálisis, revisiones
            sistemáticas y ensayos clínicos de calidad. Estudios observacionales se usan para
            contexto y siempre con cautela en causalidad.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Cuando existe discrepancia entre fuentes, se explican diferencias metodológicas,
            población estudiada y grado de certeza disponible, evitando simplificaciones engañosas.
          </p>
        </section>

        <section aria-labelledby="metodo-redaccion">
          <h2 id="metodo-redaccion" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            3. Método de redacción y control editorial
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Cada contenido se construye con objetivo definido, revisión de fuentes, redacción en
            lenguaje claro y verificación final de coherencia técnica. Se evita lenguaje alarmista,
            absolutista o de marketing.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            La estructura prioriza preguntas frecuentes de la audiencia para facilitar comprensión
            práctica sin alterar el rigor conceptual.
          </p>
        </section>

        <section aria-labelledby="conflictos-interes">
          <h2 id="conflictos-interes" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            4. Conflictos de interés y afiliaciones
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            La línea editorial se mantiene independiente. Si en el futuro existen enlaces de
            afiliación o acuerdos comerciales, se señalarán de forma explícita y visible en la pieza
            correspondiente.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Ningún interés comercial debe sustituir la revisión de evidencia ni modificar conclusiones
            editoriales.
          </p>
        </section>

        <section aria-labelledby="correcciones-trazabilidad">
          <h2 id="correcciones-trazabilidad" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            5. Correcciones, actualizaciones y trazabilidad
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Cuando se detecta un error factual, de interpretación o de contexto, se corrige el
            contenido y se registra la actualización para mantener trazabilidad editorial.
          </p>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Las actualizaciones también se realizan cuando cambian guías clínicas o aparece evidencia
            de mayor calidad que modifica el estado del conocimiento previo.
          </p>
        </section>

        <section aria-labelledby="contacto-transparencia">
          <h2 id="contacto-transparencia" className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
            6. Reportes y contacto editorial
          </h2>
          <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">
            Si identificas un posible error o ambigüedad, puedes reportarlo mediante la sección
            “Reportar un error” o al correo{' '}
            <a
              href="mailto:contacto@bienestarenclaro.com"
              className="font-medium text-[#0B1F3B] hover:text-[#1E6F5C] dark:text-foreground dark:hover:text-primary"
            >
              contacto@bienestarenclaro.com
            </a>
            .
          </p>
        </section>

        <p className="border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600 dark:border-border dark:text-muted-foreground">
          Nota institucional: esta política de transparencia editorial está vigente al 24 de febrero
          de 2026 y se revisa de forma periódica para sostener estándares de rigor, claridad y
          responsabilidad informativa.
        </p>
      </article>
    </div>
  </div>
);

const ReportErrorPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-16 dark:bg-background">
      <Helmet>
        <title>Reportar un error - Bienestar en Claro</title>
        <meta
          name="description"
          content="Canal para reportar errores de contenido o funcionamiento y generar ticket de seguimiento."
        />
      </Helmet>

      <div className="mx-auto w-full max-w-[1100px]">
        <nav className="mb-8 text-sm text-slate-500 dark:text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>{' '}
          &gt; <span>Reportar un error</span>
        </nav>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-border dark:bg-card">
          <h1 className="text-4xl font-bold text-[#0B1F3B] dark:text-foreground">Reportar un error</h1>
          <p className="mt-4 max-w-[65ch] text-lg leading-8 text-slate-700 dark:text-muted-foreground">
            Si detectas un error de contenido o funcionamiento, envíalo mediante el formulario para
            generar un ticket de seguimiento en el panel de administración.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-border dark:bg-background">
            <h2 className="text-3xl font-semibold text-[#0B1F3B] dark:text-foreground">Resumen</h2>
            <p className="mt-3 max-w-[65ch] text-lg leading-8 text-slate-700 dark:text-muted-foreground">
              El ticket incluirá título, detalle del error, nombre y correo. El estado podrá
              revisarse por el equipo editorial desde el módulo Admin “Errores / Reportes”.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl bg-[#1d4e89] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#163b68]"
              >
                Abrir formulario de reporte
              </button>
              <Link
                to="/articulos"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-[#0B1F3B] transition-colors hover:bg-slate-100 dark:border-border dark:text-foreground dark:hover:bg-muted"
              >
                Explorar artículos
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ErrorReportModal open={isModalOpen} onClose={() => setIsModalOpen(false)} sourcePath="/reportar-error" />
    </div>
  );
};

const FAQPage = () => {
  const faqs = [
    {
      question: '1. ¿Qué tipo de información publica Bienestar en Claro?',
      paragraphs: [
        'Bienestar en Claro es una plataforma editorial especializada en salud metabólica. Publicamos análisis estructurados sobre hígado graso, resistencia a la insulina, inflamación metabólica, microbiota intestinal y riesgo cardiovascular, entre otros temas relacionados.',
        'El contenido se basa en revisión de guías clínicas, consensos médicos y estudios científicos relevantes. No se trata de opiniones personales ni de contenido promocional. Cada artículo explica qué se sabe actualmente, cuáles son los límites del conocimiento disponible y cómo interpretar la información dentro de un marco clínico realista.',
      ],
    },
    {
      question: '2. ¿La información reemplaza la consulta médica?',
      paragraphs: [
        'No. El contenido tiene carácter exclusivamente educativo e informativo.',
        'No constituye diagnóstico, tratamiento ni indicación terapéutica individual. Las decisiones clínicas requieren evaluación médica personalizada, antecedentes, examen físico y estudios complementarios.',
        'La función editorial de esta sección es aportar contexto y claridad conceptual, no sustituir la relación médico-paciente ni la práctica clínica profesional.',
      ],
    },
    {
      question: '3. ¿Cómo seleccionan las fuentes científicas?',
      paragraphs: ['La selección se basa en jerarquía de evidencia.', 'Se priorizan:'],
      bullets: [
        'Guías clínicas internacionales.',
        'Revisiones sistemáticas.',
        'Meta-análisis.',
        'Ensayos clínicos controlados.',
      ],
      tail:
        'Los estudios observacionales se utilizan como referencia contextual, pero se diferencian claramente de evidencia de mayor nivel metodológico. No se utilizan estudios preliminares como base para conclusiones clínicas definitivas.',
    },
    {
      question: '4. ¿Qué significa “basado en evidencia” en este sitio?',
      paragraphs: [
        'Significa que el contenido se apoya en datos científicos publicados y evaluados bajo criterios metodológicos reconocidos.',
        'También implica reconocer límites:',
      ],
      bullets: [
        'Diferenciar hipótesis de evidencia consolidada.',
        'Distinguir asociación de causalidad.',
        'Señalar controversias cuando existen.',
      ],
      tail:
        'No se presentan afirmaciones categóricas cuando la literatura científica no las respalda de manera consistente.',
    },
    {
      question: '5. ¿Cada cuánto se actualizan los contenidos?',
      paragraphs: [
        'Los artículos se revisan periódicamente cuando:',
      ],
      bullets: [
        'Se publican nuevas guías clínicas.',
        'Cambian recomendaciones oficiales.',
        'Aparecen estudios relevantes que modifican el consenso previo.',
      ],
      tail:
        'La actualización no responde a tendencias digitales sino a cambios reales en la evidencia disponible.',
    },
    {
      question: '6. ¿Por qué no promueven suplementos ni tratamientos “milagro”?',
      paragraphs: [
        'La plataforma no comercializa productos ni promueve soluciones rápidas.',
        'Las condiciones metabólicas son complejas y multifactoriales. No existe intervención única que resuelva de manera aislada problemas como hígado graso, resistencia a la insulina o inflamación crónica.',
        'Evitar el sensacionalismo es parte del enfoque editorial.',
      ],
    },
    {
      question: '7. ¿Cuál es el enfoque sobre hígado graso y resistencia a la insulina?',
      paragraphs: [
        'El abordaje se centra en comprender mecanismos fisiopatológicos y factores modificables respaldados por evidencia.',
        'Se analiza:',
      ],
      bullets: [
        'Rol del exceso calórico sostenido.',
        'Distribución de grasa visceral.',
        'Inflamación sistémica.',
        'Impacto del estilo de vida.',
      ],
      tail:
        'No se simplifican estas condiciones como problemas aislados ni se presentan como diagnósticos universales sin evaluación clínica adecuada.',
    },
    {
      question: '8. ¿Publican recomendaciones dietéticas específicas?',
      paragraphs: [
        'Se explican principios respaldados por evidencia, como patrones alimentarios estudiados en ensayos clínicos.',
        'No se diseñan planes personalizados ni dietas individualizadas. Las recomendaciones deben adaptarse a contexto clínico, antecedentes médicos y evaluación profesional.',
      ],
    },
    {
      question: '9. ¿Cómo diferencian información educativa de diagnóstico clínico?',
      paragraphs: [
        'El contenido describe patrones generales observados en poblaciones estudiadas.',
        'El diagnóstico clínico requiere:',
      ],
      bullets: [
        'Evaluación médica.',
        'Estudios de laboratorio.',
        'Imagenología cuando corresponde.',
        'Interpretación individual.',
      ],
      tail: 'La información educativa no puede reemplazar ese proceso.',
    },
    {
      question: '10. ¿Quién está detrás del proyecto y cuál es su rol editorial?',
      paragraphs: [
        'Bienestar en Claro es un proyecto de divulgación estructurada en salud metabólica con enfoque latinoamericano.',
        'El rol editorial consiste en:',
      ],
      bullets: [
        'Analizar evidencia científica.',
        'Traducir complejidad técnica a lenguaje comprensible.',
        'Establecer límites explícitos.',
        'Evitar interpretaciones alarmistas o simplificaciones.',
      ],
      tail:
        'No es una clínica, ni un servicio médico directo, ni una plataforma de venta de tratamientos.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-16 dark:bg-background">
      <Helmet>
        <title>Preguntas frecuentes - Bienestar en Claro</title>
        <meta
          name="description"
          content="Preguntas frecuentes editoriales sobre alcance, evidencia, límites y metodología en salud metabólica."
        />
      </Helmet>

      <div className="mx-auto w-full max-w-[1100px]">
        <nav className="mb-8 text-sm text-slate-500 dark:text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>{' '}
          &gt; <span>Preguntas frecuentes</span>
        </nav>

        <header className="border-b border-slate-200 pb-8 dark:border-border">
          <h1 className="text-3xl font-semibold text-[#0B1F3B] dark:text-foreground md:text-4xl">
            Preguntas frecuentes
          </h1>
        </header>

        <article className="mt-10 max-w-[65ch] space-y-10 text-slate-800 dark:text-foreground">
          {faqs.map((item) => {
            const sectionId = item.question
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            return (
              <section key={item.question} aria-labelledby={sectionId}>
                <h2 id={sectionId} className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
                  {item.question}
                </h2>
                <div className="mt-4 space-y-4 text-slate-700 dark:text-muted-foreground">
                  {(item.paragraphs || []).map((paragraph, index) => (
                    <p key={`${sectionId}-p-${index}`} className="leading-8">
                      {paragraph}
                    </p>
                  ))}
                  {item.bullets?.length ? (
                    <ul className="space-y-2 pl-5">
                      {item.bullets.map((bullet) => (
                        <li key={`${sectionId}-${bullet}`} className="list-disc leading-8">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.tail ? <p className="leading-8">{item.tail}</p> : null}
                </div>
              </section>
            );
          })}
        </article>
      </div>
    </div>
  );
};

const InfoStubPage = () => {
  const location = useLocation();

  if (location.pathname === '/metodologia-editorial') {
    return <EditorialMethodologyPage />;
  }

  if (location.pathname === '/transparencia') {
    return <EditorialTransparencyPage />;
  }

  if (location.pathname === '/reportar-error') {
    return <ReportErrorPage />;
  }

  if (location.pathname === '/faq') {
    return <FAQPage />;
  }

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
