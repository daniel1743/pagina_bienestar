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

const CATEGORY_EDITORIAL_MAP = {
  metabolismo: {
    title: 'Categoría: Metabolismo',
    description:
      'Marco editorial sobre fisiología metabólica, alteraciones frecuentes y criterios de lectura basada en evidencia.',
    sections: [
      {
        heading: '1. Definición editorial del tema',
        body: 'En esta sección, metabolismo se aborda como el conjunto de procesos que regulan producción, uso y almacenamiento de energía en tejido hepático, muscular y adiposo. El enfoque editorial prioriza la relación entre regulación glucémica, flexibilidad metabólica y riesgo cardiometabólico en población latinoamericana. No tratamos el metabolismo como concepto estético ni de rendimiento rápido, sino como fenómeno fisiológico con impacto clínico medible.',
      },
      {
        heading: '2. Problemas clínicos asociados',
        body: 'Se revisan alteraciones prevalentes como resistencia a la insulina, disfunción hepática metabólica, adiposidad visceral, hipertrigliceridemia y progresión hacia diabetes tipo 2. También se contextualizan fatiga persistente, variabilidad glucémica y desregulación del apetito cuando corresponda a mecanismos metabólicos documentados. Cada problema se presenta con sus límites diagnósticos y con advertencia explícita sobre la necesidad de evaluación profesional individual.',
      },
      {
        heading: '3. Enfoque diferencial de la plataforma',
        body: 'Bienestar en Claro integra cuatro sublíneas estratégicas: resistencia a la insulina, gasto energético, metabolismo hepático y adaptación metabólica. La diferencia editorial es conectar mecanismos fisiológicos con decisiones prácticas sin simplificaciones de marketing. Evitamos protocolos extremos y traducimos conceptos técnicos a lenguaje claro, manteniendo precisión terminológica y contexto clínico realista.',
      },
      {
        heading: '4. Qué encontrará el lector en esta sección',
        body: 'El lector encontrará análisis estructurados de conceptos base, interpretación general de marcadores, revisión de controversias frecuentes y guías de lectura para conversaciones más útiles en consulta. Los contenidos se organizan por nivel de complejidad para facilitar progresión: fundamentos, problemas prevalentes y aplicaciones prácticas con límites explícitos.',
      },
      {
        heading: '5. Declaración de rigor metodológico',
        body: 'La selección y redacción se sustenta en guías clínicas, revisiones sistemáticas, metaanálisis y ensayos clínicos de calidad. Cuando la evidencia es contradictoria o incompleta, se declara incertidumbre de forma explícita. Esta sección se revisa de manera periódica y se actualiza cuando cambian recomendaciones relevantes o aparece evidencia de mayor jerarquía.',
      },
    ],
  },
  higado: {
    title: 'Categoría: Hígado',
    description:
      'Cobertura editorial sobre salud hepática metabólica, interpretación clínica básica y progresión de riesgo.',
    sections: [
      {
        heading: '1. Definición editorial del tema',
        body: 'La categoría Hígado se centra en función hepática dentro del metabolismo sistémico, con especial atención a esteatosis hepática asociada a disfunción metabólica, inflamación y riesgo de progresión. El objetivo editorial es clarificar cómo el hígado integra señales nutricionales, hormonales y energéticas, y por qué su evaluación debe interpretarse en contexto clínico completo.',
      },
      {
        heading: '2. Problemas clínicos asociados',
        body: 'Se abordan hígado graso, alteración de enzimas hepáticas, progresión fibroinflamatoria, comorbilidad con resistencia a la insulina y riesgo cardiometabólico. También se revisan límites de biomarcadores aislados y errores frecuentes de interpretación en controles de rutina. El contenido no sustituye diagnóstico etiológico ni estratificación clínica formal.',
      },
      {
        heading: '3. Enfoque diferencial de la plataforma',
        body: 'El enfoque integra metabolismo hepático, marcadores bioquímicos, hábitos sostenibles y contexto latinoamericano de acceso a evaluación. Evitamos narrativas de detox, promesas de reversión garantizada y recomendaciones sin respaldo. Priorizamos lectura crítica de evidencia y explicación de umbrales clínicos con incertidumbre explícita cuando corresponde.',
      },
      {
        heading: '4. Qué encontrará el lector en esta sección',
        body: 'Encontrará marcos para comprender hallazgos frecuentes, guías de preguntas para consulta, criterios de seguimiento y relación entre hígado, insulina e inflamación metabólica. Los artículos distinguen con claridad qué es información educativa general y qué requiere valoración profesional individual.',
      },
      {
        heading: '5. Declaración de rigor metodológico',
        body: 'La sección se construye con base en guías internacionales de hepatología y metabolismo, metaanálisis y ensayos de intervención pertinentes. Se realiza revisión editorial periódica y actualización documentada ante cambios relevantes en nomenclatura, criterios diagnósticos o recomendaciones de manejo.',
      },
    ],
  },
  insulina: {
    title: 'Categoría: Insulina',
    description:
      'Análisis editorial de fisiología de la insulina, resistencia periférica e implicancias clínicas en salud metabólica.',
    sections: [
      {
        heading: '1. Definición editorial del tema',
        body: 'Esta categoría estudia la insulina como regulador central del equilibrio glucémico y del metabolismo energético. El enfoque incluye señalización periférica, compensación pancreática e impacto en tejido hepático, muscular y adiposo. Se evita reducir el tema a “azúcar alta” y se prioriza comprensión fisiológica útil para interpretar riesgo metabólico temprano.',
      },
      {
        heading: '2. Problemas clínicos asociados',
        body: 'Se cubren resistencia a la insulina, hiperinsulinemia compensatoria, alteración de glucosa en ayunas o posprandial y su relación con síndrome metabólico, hígado graso y progresión diabetogénica. También se explican límites de índices indirectos y variabilidad entre laboratorios para reducir interpretaciones simplistas.',
      },
      {
        heading: '3. Enfoque diferencial de la plataforma',
        body: 'Nuestro diferencial es conectar fisiología, biomarcadores y decisiones cotidianas sin afirmaciones absolutas. Se analizan señales tempranas, factores de estilo de vida y contexto clínico en población latinoamericana. No se promueven atajos terapéuticos ni protocolos extremos sin evaluación profesional.',
      },
      {
        heading: '4. Qué encontrará el lector en esta sección',
        body: 'El lector encontrará explicaciones estructuradas sobre rutas de señalización, interpretación general de exámenes, escenarios clínicos frecuentes y preguntas orientadoras para consulta. La organización editorial distingue evidencia sólida, hipótesis en desarrollo y áreas con incertidumbre actual.',
      },
      {
        heading: '5. Declaración de rigor metodológico',
        body: 'Los contenidos se redactan a partir de guías clínicas, revisiones sistemáticas y ensayos relevantes en metabolismo e insulinorresistencia. Cada pieza incluye revisión editorial y actualización periódica cuando cambian consensos, definiciones operativas o calidad de la evidencia disponible.',
      },
    ],
  },
  inflamacion: {
    title: 'Categoría: Inflamación',
    description:
      'Cobertura institucional sobre inflamación metabólica de bajo grado y su relación con riesgo cardiometabólico.',
    sections: [
      {
        heading: '1. Definición editorial del tema',
        body: 'La sección Inflamación se enfoca en inflamación crónica de bajo grado asociada a disfunción metabólica. Se aborda como proceso biológico sistémico vinculado a tejido adiposo, hígado, señalización insulínica y respuesta inmune, evitando el uso ambiguo del término como diagnóstico único o explicación universal de síntomas.',
      },
      {
        heading: '2. Problemas clínicos asociados',
        body: 'Se analizan fenómenos relacionados con adiposidad visceral, resistencia a la insulina, progresión hepática metabólica, alteraciones del sueño y estrés crónico cuando existe soporte fisiopatológico. También se discuten límites de marcadores inflamatorios inespecíficos y riesgos de sobreinterpretación fuera del contexto clínico.',
      },
      {
        heading: '3. Enfoque diferencial de la plataforma',
        body: 'El enfoque diferencial integra inflamación metabólica con hábitos sostenibles, regulación neuroendocrina y condiciones prevalentes en Latinoamérica. Se descartan narrativas alarmistas y protocolos de “desinflamación” sin sustento. La prioridad editorial es precisión conceptual y utilidad práctica sin promesas terapéuticas.',
      },
      {
        heading: '4. Qué encontrará el lector en esta sección',
        body: 'Encontrará marcos para entender mecanismos, factores moduladores y lectura crítica de intervenciones comunes. Los contenidos distinguen claramente evidencia robusta, plausibilidad biológica y áreas todavía en debate para facilitar decisiones informadas junto al equipo tratante.',
      },
      {
        heading: '5. Declaración de rigor metodológico',
        body: 'La sección se apoya en guías, revisiones sistemáticas y literatura clínica sobre inflamación de bajo grado en contexto metabólico. Se realiza revisión periódica y actualización editorial cuando nuevas síntesis de evidencia modifican interpretación o relevancia clínica de los hallazgos.',
      },
    ],
  },
  microbiota: {
    title: 'Categoría: Microbiota',
    description:
      'Sección editorial sobre microbiota intestinal y su vínculo con metabolismo, inflamación y salud hepática.',
    sections: [
      {
        heading: '1. Definición editorial del tema',
        body: 'Microbiota se presenta como un eje biológico relevante para metabolismo y respuesta inmune, no como explicación única de enfermedad. El abordaje editorial prioriza interacción intestino-hígado, permeabilidad intestinal, metabolitos microbianos y regulación inflamatoria en contextos clínicos frecuentes.',
      },
      {
        heading: '2. Problemas clínicos asociados',
        body: 'Se revisan asociaciones entre disbiosis, inflamación metabólica, hígado graso, resistencia a la insulina y síntomas digestivos funcionales cuando exista evidencia consistente. También se explican límites de pruebas comerciales y la distancia entre correlación microbiológica y recomendación clínica individual.',
      },
      {
        heading: '3. Enfoque diferencial de la plataforma',
        body: 'El diferencial es separar hallazgos preliminares de evidencia aplicable. Se evita convertir la microbiota en tendencia comercial o solución universal. Integramos fisiología digestiva, metabolismo sistémico y contexto de estilo de vida con lenguaje técnico accesible y sin simplificaciones promocionales.',
      },
      {
        heading: '4. Qué encontrará el lector en esta sección',
        body: 'El lector encontrará análisis de mecanismos plausibles, revisión crítica de probióticos y fibra dietaria, y criterios para interpretar afirmaciones frecuentes en medios y redes. La estructura editorial busca clarificar qué se sabe, qué no se sabe y qué preguntas siguen abiertas.',
      },
      {
        heading: '5. Declaración de rigor metodológico',
        body: 'Los textos se construyen con base en revisiones sistemáticas, metaanálisis y guías cuando están disponibles. Dado que el campo evoluciona rápido, cada publicación se reevalúa periódicamente y se actualiza ante evidencia de mayor calidad o cambios de consenso científico.',
      },
    ],
  },
};

const HIGADO_GUIDE_DOC = {
  title: 'Guía: Hígado graso',
  description:
    'Hígado graso como fenómeno metabólico (MASLD/SLD), estratificación de riesgo y decisiones de bienestar sin promesas clínicas.',
  sections: [
    {
      heading: '1. Marco actual del problema',
      paragraphs: [
        'La acumulación de grasa hepática se interpreta hoy principalmente en clave metabólica. En nomenclatura reciente, el marco técnico utiliza SLD como paraguas y MASLD para el fenotipo asociado a disfunción metabólica, lo que desplaza una lectura reducida al alcohol como única explicación.',
        'Esta actualización mejora la comunicación clínica porque integra riesgo cardiometabólico, adiposidad visceral, glucosa y perfil lipídico dentro de un mismo eje de interpretación.',
      ],
    },
    {
      heading: '2. Qué determina riesgo clínico relevante',
      paragraphs: [
        'Desde un enfoque editorial basado en evidencia, el punto crítico no es solo la presencia de grasa hepática, sino el riesgo de fibrosis y la carga cardiometabólica global. La progresión varía según contexto individual y comorbilidades.',
        'También se reconoce solapamiento entre disfunción metabólica y consumo de alcohol (MetALD), por lo que la dicotomía simple “metabólico o alcohol” resulta insuficiente para comunicación responsable.',
      ],
    },
    {
      heading: '3. Intervenciones con mejor respaldo',
      paragraphs: [
        'La evidencia de mayor consistencia muestra que reducción de peso sostenida, mejora de calidad dietaria y ejercicio regular pueden reducir grasa hepática y mejorar marcadores metabólicos. En guías, reducciones modestas de peso se asocian con mejora de esteatosis, y reducciones mayores pueden asociarse con cambios más profundos.',
        'El ejercicio se considera pilar central por beneficios hepáticos y cardiometabólicos incluso más allá de la pérdida de peso.',
      ],
    },
    {
      heading: '4. Errores frecuentes de interpretación',
      bullets: [
        'Hígado graso no equivale automáticamente a hepatitis o cirrosis.',
        'ALT/AST normales no excluyen enfermedad metabólica hepática relevante.',
        'El problema no es exclusivamente hepático: el riesgo cardiovascular forma parte del mismo escenario clínico.',
      ],
    },
    {
      heading: '5. Alcance editorial',
      paragraphs: [
        'Esta guía explica mecanismos, patrones y límites de interpretación. No emite diagnósticos ni reemplaza evaluación profesional. El objetivo es sostener lectura clínica realista, no mensajes simplificados ni sensacionalistas.',
      ],
    },
  ],
};

const RESISTENCIA_INSULINA_GUIDE_DOC = {
  title: 'Guía: Resistencia a la insulina',
  description:
    'Interpretación de la insulinorresistencia por tejidos, patrones metabólicos y límites de biomarcadores aislados.',
  sections: [
    {
      heading: '1. Qué significa resistencia a la insulina',
      paragraphs: [
        'La resistencia a la insulina no es un fenómeno único. Puede predominar en músculo, hígado o tejido adiposo, con efectos distintos sobre glucosa, lípidos y almacenamiento energético.',
        'Por eso, su interpretación clínica no debe reducirse a una cifra aislada, sino a patrones metabólicos repetidos en el tiempo y al contexto fisiológico de cada persona.',
      ],
    },
    {
      heading: '2. Factores que favorecen progresión',
      paragraphs: [
        'El exceso energético sostenido, el sedentarismo, el sueño insuficiente, el estrés crónico y la disfunción del tejido adiposo contribuyen de forma convergente. Este entorno facilita grasa ectópica, alteración glucémica y mayor riesgo de diabetes tipo 2.',
        'En población general, la progresión puede ser silenciosa y detectarse por combinación de glucosa, HbA1c, triglicéridos, HDL, perímetro abdominal y hallazgos hepáticos.',
      ],
    },
    {
      heading: '3. Qué intervenciones tienen respaldo sólido',
      paragraphs: [
        'Los programas intensivos de estilo de vida en prevención de diabetes muestran reducción significativa de riesgo en personas con alto riesgo metabólico. El mensaje técnico es que la consistencia de hábitos y el entorno conductual son determinantes del resultado.',
        'Actividad aeróbica y fuerza mejoran sensibilidad a la insulina y control glucémico, con referencias frecuentes a objetivos semanales de actividad física en guías clínicas.',
      ],
    },
    {
      heading: '4. Marcadores y límites de uso',
      paragraphs: [
        'Insulina basal y HOMA-IR pueden ser útiles en investigación o contextos específicos, pero no operan como estándar universal para cribado rutinario. Existen limitaciones analíticas y ausencia de umbral único aplicable a toda la población.',
        'Una lectura editorial rigurosa prioriza indicadores estandarizados y tendencia longitudinal sobre búsquedas de “un número definitivo”.',
      ],
    },
    {
      heading: '5. Alcance editorial',
      paragraphs: [
        'La guía organiza evidencia para comprensión técnica accesible. No reemplaza diagnóstico clínico ni indicaciones terapéuticas personalizadas.',
      ],
    },
  ],
};

const INFLAMACION_GUIDE_DOC = {
  title: 'Guía: Inflamación metabólica',
  description:
    'Inflamación crónica de bajo grado, su vínculo con adiposidad visceral e insulinorresistencia, y lectura responsable de marcadores.',
  sections: [
    {
      heading: '1. Definición operativa',
      paragraphs: [
        'La inflamación metabólica describe un estado crónico de bajo grado asociado a exceso energético y disfunción del tejido adiposo. No corresponde a inflamación aguda por infección y no debe comunicarse como etiqueta diagnóstica única.',
        'Su relevancia clínica surge por interacción con hígado, músculo, tejido adiposo y regulación de glucosa.',
      ],
    },
    {
      heading: '2. Mecanismos de interés clínico',
      paragraphs: [
        'Cuando el tejido adiposo se expande y se vuelve disfuncional, cambia su perfil de señales y aumenta el entorno proinflamatorio. Este proceso facilita resistencia a la insulina y depósito de grasa ectópica, incluido hígado.',
        'La relación es bidireccional: inflamación metabólica e insulinorresistencia se refuerzan mutuamente.',
      ],
    },
    {
      heading: '3. Qué sí y qué no comunicar',
      paragraphs: [
        'En divulgación rigurosa, no corresponde prometer “desinflamación” rápida. El respaldo más sólido apunta a cambios sostenidos en actividad física, sueño, calidad dietaria y control de adiposidad visceral.',
        'La respuesta individual varía; por eso, el lenguaje editorial debe evitar absolutismos y explicar incertidumbre cuando la evidencia sea heterogénea.',
      ],
    },
    {
      heading: '4. Marcadores: utilidad y límites',
      bullets: [
        'hs-CRP y ferritina pueden aportar contexto, pero son inespecíficos.',
        'Un valor aislado no define estado inflamatorio metabólico por sí solo.',
        'La interpretación exige contexto clínico, repetición y descartar causas agudas.',
      ],
    },
    {
      heading: '5. Alcance editorial',
      paragraphs: [
        'Esta guía ofrece un marco técnico para lectura crítica y no sustituye evaluación profesional individual.',
      ],
    },
  ],
};

const EXAMENES_GUIDE_DOC = {
  title: 'Guía: Exámenes y marcadores',
  description:
    'Cómo interpretar paneles metabólicos por patrones: glucosa, HbA1c, lípidos, hígado, fibrosis y marcadores inflamatorios.',
  sections: [
    {
      heading: '1. Principio de lectura: patrón y tendencia',
      paragraphs: [
        'La interpretación metabólica útil no depende de un solo número. Se prioriza coherencia entre marcadores, tendencia temporal y contexto clínico.',
        'Tres preguntas ordenan el análisis: control glucémico, riesgo cardiometabólico y evidencia de afectación de órgano diana (incluido hígado).',
      ],
    },
    {
      heading: '2. Glucosa y criterios diagnósticos',
      paragraphs: [
        'Glucosa en ayunas, HbA1c y OGTT constituyen el núcleo estandarizado para alteraciones de glucosa. Los umbrales diagnósticos deben interpretarse con confirmación y contexto, siguiendo estándares clínicos vigentes.',
        'La utilidad editorial es explicar qué mide cada prueba y cuáles son sus límites, no emitir diagnóstico desde internet.',
      ],
    },
    {
      heading: '3. Lípidos, enzimas hepáticas e imagen',
      paragraphs: [
        'Triglicéridos y HDL suelen aportar señal metabólica relevante cuando se interpretan con el resto del panel. En hígado, ALT/AST pueden estar normales pese a enfermedad metabólica hepática, por lo que no deben usarse como criterio excluyente.',
        'La ecografía es útil, pero su sensibilidad para esteatosis leve es limitada; de ahí el enfoque combinado de analítica, scores y métodos no invasivos según riesgo.',
      ],
    },
    {
      heading: '4. Fibrosis y estratificación',
      paragraphs: [
        'La fibrosis es una variable de pronóstico clave en hígado graso metabólico. Por eso se emplean estrategias escalonadas con índices como FIB-4 y, según riesgo, elastografía u otras pruebas no invasivas.',
        'Estos instrumentos son de estratificación de riesgo, no herramientas de autodiagnóstico.',
      ],
    },
    {
      heading: '5. Marcadores inflamatorios y límites',
      paragraphs: [
        'Marcadores como hs-CRP y ferritina requieren lectura contextual, porque se modifican por múltiples causas no metabólicas.',
        'La guía enfatiza interpretación prudente, comparación longitudinal y discusión clínica cuando los hallazgos sean persistentes o discordantes.',
      ],
    },
  ],
};

const GUIDE_EDITORIAL_MAP = {
  'higado-graso': HIGADO_GUIDE_DOC,
  'metabolismo-hepatico': {
    ...HIGADO_GUIDE_DOC,
    title: 'Guía de metabolismo hepático',
  },
  'resistencia-a-la-insulina': RESISTENCIA_INSULINA_GUIDE_DOC,
  'resistencia-insulina': RESISTENCIA_INSULINA_GUIDE_DOC,
  'inflamacion-metabolica': INFLAMACION_GUIDE_DOC,
  'examenes-y-marcadores': EXAMENES_GUIDE_DOC,
};

const sectionIdFromHeading = (value) =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

  if (location.pathname.startsWith('/guias/') && GUIDE_EDITORIAL_MAP[slug]) {
    const guideDoc = GUIDE_EDITORIAL_MAP[slug];

    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-16 dark:bg-background">
        <Helmet>
          <title>{guideDoc.title} - Bienestar en Claro</title>
          <meta name="description" content={guideDoc.description} />
        </Helmet>

        <div className="mx-auto w-full max-w-[1100px]">
          <nav className="mb-8 text-sm text-slate-500 dark:text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-primary">
              Inicio
            </Link>{' '}
            &gt; <span>{guideDoc.title}</span>
          </nav>

          <header className="border-b border-slate-200 pb-8 dark:border-border">
            <h1 className="text-3xl font-semibold text-[#0B1F3B] dark:text-foreground md:text-4xl">
              {guideDoc.title}
            </h1>
            <p className="mt-4 max-w-[65ch] leading-7 text-slate-700 dark:text-muted-foreground">
              {guideDoc.description}
            </p>
          </header>

          <article className="mt-10 max-w-[65ch] space-y-10 text-slate-800 dark:text-foreground">
            {guideDoc.sections.map((section) => {
              const sectionId = sectionIdFromHeading(section.heading);
              return (
                <section key={section.heading} aria-labelledby={sectionId}>
                  <h2 id={sectionId} className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-slate-700 dark:text-muted-foreground">
                    {(section.paragraphs || []).map((paragraph, index) => (
                      <p key={`${sectionId}-p-${index}`} className="leading-8">
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets?.length ? (
                      <ul className="space-y-2 pl-5">
                        {section.bullets.map((bullet) => (
                          <li key={`${sectionId}-${bullet}`} className="list-disc leading-8">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </article>
        </div>
      </div>
    );
  }

  if (location.pathname.startsWith('/categorias/') && CATEGORY_EDITORIAL_MAP[slug]) {
    const categoryDoc = CATEGORY_EDITORIAL_MAP[slug];

    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-16 dark:bg-background">
        <Helmet>
          <title>{categoryDoc.title} - Bienestar en Claro</title>
          <meta name="description" content={categoryDoc.description} />
        </Helmet>

        <div className="mx-auto w-full max-w-[1100px]">
          <nav className="mb-8 text-sm text-slate-500 dark:text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-primary">
              Inicio
            </Link>{' '}
            &gt; <span>{categoryDoc.title}</span>
          </nav>

          <header className="border-b border-slate-200 pb-8 dark:border-border">
            <h1 className="text-3xl font-semibold text-[#0B1F3B] dark:text-foreground md:text-4xl">
              {categoryDoc.title}
            </h1>
            <p className="mt-4 max-w-[65ch] leading-7 text-slate-700 dark:text-muted-foreground">
              {categoryDoc.description}
            </p>
          </header>

          <article className="mt-10 max-w-[65ch] space-y-10 text-slate-800 dark:text-foreground">
            {categoryDoc.sections.map((section) => {
              const sectionId = sectionIdFromHeading(section.heading);
              return (
              <section key={section.heading} aria-labelledby={sectionId}>
                <h2 id={sectionId} className="text-2xl font-semibold text-[#0B1F3B] dark:text-foreground">
                  {section.heading}
                </h2>
                <p className="mt-4 leading-7 text-slate-700 dark:text-muted-foreground">{section.body}</p>
              </section>
              );
            })}
          </article>
        </div>
      </div>
    );
  }

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
