const GLOSSARY_CATEGORIES = [
  { id: 'bioenergetica', label: 'Bioenergetica y metabolismo base', description: 'Conceptos nucleares de energia celular y homeostasis.' },
  { id: 'carbohidratos', label: 'Carbohidratos, glucosa e insulina', description: 'Terminos de control glucemico y sensibilidad insulinica.' },
  { id: 'lipidos', label: 'Lipidos y riesgo cardiometabolico', description: 'Conceptos de grasas, lipoproteinas y metabolismo lipidico.' },
  { id: 'proteinas', label: 'Proteinas y recambio muscular', description: 'Aminoacidos, sintesis proteica y metabolismo nitrogenado.' },
  { id: 'mitocondria', label: 'Mitocondria y estres oxidativo', description: 'Produccion de ATP, ROS y calidad mitocondrial.' },
  { id: 'microbiota', label: 'Microbiota y eje intestino-cerebro', description: 'Ecologia intestinal, barrera digestiva e inflamacion.' },
  { id: 'cronobiologia', label: 'Cronobiologia y sueno metabolico', description: 'Ritmos circadianos, hormonas y sincronizacion biologica.' },
  { id: 'ejercicio', label: 'Ejercicio y adaptacion metabolica', description: 'Carga fisica, masa muscular y capacidad aerobica.' },
  { id: 'biomarcadores', label: 'Biomarcadores y quimica clinica', description: 'Marcadores de laboratorio para seguimiento metabolico.' },
  { id: 'nutricion-funcional', label: 'Nutricion funcional y fitonutrientes', description: 'Compuestos bioactivos de alimentos y su impacto metabolico.' },
  { id: 'clinica-general', label: 'Terminologia medica general', description: 'Vocabulario clinico para mejorar comprension editorial.' },
];

const METABOLIC_GLOSSARY = [
  {
    id: 'metabolismo',
    term: 'Metabolismo',
    slug: 'metabolismo',
    category: 'bioenergetica',
    definition: 'Conjunto de reacciones quimicas que transforman nutrientes en energia y estructura celular.',
    relevance: 'Base para entender energia, peso, inflamacion y longevidad.',
    synonyms: ['metabolismo energetico'],
    relatedTerms: ['catabolismo', 'anabolismo', 'homeostasis'],
    linking: { keywords: ['metabolismo', 'salud metabolica'], preferredAnchors: ['metabolismo'], relatedArticleSlugs: [] },
  },
  {
    id: 'catabolismo',
    term: 'Catabolismo',
    slug: 'catabolismo',
    category: 'bioenergetica',
    definition: 'Fase degradativa donde se rompen nutrientes para liberar energia utilizable.',
    relevance: 'Explica como el cuerpo obtiene combustible en reposo o actividad.',
    synonyms: [],
    relatedTerms: ['anabolismo', 'atp'],
    linking: { keywords: ['catabolismo'], preferredAnchors: ['catabolismo'], relatedArticleSlugs: [] },
  },
  {
    id: 'anabolismo',
    term: 'Anabolismo',
    slug: 'anabolismo',
    category: 'bioenergetica',
    definition: 'Fase biosintetica donde se construyen tejidos y moleculas usando energia.',
    relevance: 'Clave para reparacion celular y mantenimiento muscular.',
    synonyms: [],
    relatedTerms: ['catabolismo', 'mps'],
    linking: { keywords: ['anabolismo'], preferredAnchors: ['anabolismo'], relatedArticleSlugs: [] },
  },
  {
    id: 'atp',
    term: 'ATP',
    slug: 'atp',
    category: 'bioenergetica',
    definition: 'Principal moneda energetica celular.',
    relevance: 'Sin ATP no hay contraccion muscular ni trabajo biologico.',
    synonyms: ['adenosin trifosfato'],
    relatedTerms: ['adp', 'fosforilacion-oxidativa'],
    linking: { keywords: ['ATP', 'adenosin trifosfato'], preferredAnchors: ['ATP'], relatedArticleSlugs: [] },
  },
  {
    id: 'homeostasis',
    term: 'Homeostasis',
    slug: 'homeostasis',
    category: 'bioenergetica',
    definition: 'Mantenimiento del equilibrio interno frente a cambios del entorno.',
    relevance: 'Objetivo operativo de la salud metabolica.',
    synonyms: [],
    relatedTerms: ['metabolismo', 'ritmo-circadiano'],
    linking: { keywords: ['homeostasis'], preferredAnchors: ['homeostasis'], relatedArticleSlugs: [] },
  },
  {
    id: 'glucosa',
    term: 'Glucosa',
    slug: 'glucosa',
    category: 'carbohidratos',
    definition: 'Monosacarido clave que funciona como combustible rapido para multiples tejidos.',
    relevance: 'Su control define gran parte del riesgo cardiometabolico.',
    synonyms: ['azucar en sangre'],
    relatedTerms: ['insulina', 'hba1c'],
    linking: { keywords: ['glucosa', 'glicemia'], preferredAnchors: ['glucosa'], relatedArticleSlugs: [] },
  },
  {
    id: 'insulina',
    term: 'Insulina',
    slug: 'insulina',
    category: 'carbohidratos',
    definition: 'Hormona que facilita la entrada de glucosa a tejidos.',
    relevance: 'Su accion eficaz es central para prevenir diabetes tipo 2.',
    synonyms: [],
    relatedTerms: ['resistencia-insulina', 'glut4'],
    linking: { keywords: ['insulina'], preferredAnchors: ['insulina'], relatedArticleSlugs: [] },
  },
  {
    id: 'resistencia-insulina',
    term: 'Resistencia a la insulina',
    slug: 'resistencia-a-la-insulina',
    category: 'carbohidratos',
    definition: 'Disminucion de respuesta de tejidos a la accion de la insulina.',
    relevance: 'Mecanismo central del sindrome metabolico.',
    synonyms: ['insulinoresistencia'],
    relatedTerms: ['hiperinsulinemia', 'homa-ir', 'higado-graso'],
    linking: { keywords: ['resistencia a la insulina', 'insulinoresistencia'], preferredAnchors: ['resistencia a la insulina'], relatedArticleSlugs: [] },
  },
  {
    id: 'hba1c',
    term: 'Hemoglobina A1c',
    slug: 'hemoglobina-a1c',
    category: 'carbohidratos',
    definition: 'Promedio aproximado de glucosa sanguinea de los ultimos 2 a 3 meses.',
    relevance: 'Biomarcador clave para diagnostico y seguimiento glucemico.',
    synonyms: ['HbA1c'],
    relatedTerms: ['glucosa', 'homa-ir'],
    linking: { keywords: ['HbA1c', 'hemoglobina A1c'], preferredAnchors: ['HbA1c'], relatedArticleSlugs: [] },
  },
  {
    id: 'trigliceridos',
    term: 'Trigliceridos',
    slug: 'trigliceridos',
    category: 'lipidos',
    definition: 'Forma principal de almacenamiento de grasa en tejido adiposo y plasma.',
    relevance: 'Elevaciones sostenidas indican riesgo cardiometabolico.',
    synonyms: [],
    relatedTerms: ['vldl', 'ratio-tg-hdl'],
    linking: { keywords: ['trigliceridos'], preferredAnchors: ['trigliceridos'], relatedArticleSlugs: [] },
  },
  {
    id: 'ldl',
    term: 'LDL',
    slug: 'ldl',
    category: 'lipidos',
    definition: 'Lipoproteina que transporta colesterol desde higado hacia tejidos.',
    relevance: 'Cuando se oxida o aumenta en exceso eleva riesgo aterosclerotico.',
    synonyms: ['colesterol LDL'],
    relatedTerms: ['apob', 'aterosclerosis'],
    linking: { keywords: ['LDL', 'colesterol LDL'], preferredAnchors: ['LDL'], relatedArticleSlugs: [] },
  },
  {
    id: 'hdl',
    term: 'HDL',
    slug: 'hdl',
    category: 'lipidos',
    definition: 'Lipoproteina involucrada en transporte reverso de colesterol.',
    relevance: 'Su interpretacion debe combinarse con trigliceridos y riesgo global.',
    synonyms: ['colesterol HDL'],
    relatedTerms: ['trigliceridos', 'ratio-tg-hdl'],
    linking: { keywords: ['HDL', 'colesterol HDL'], preferredAnchors: ['HDL'], relatedArticleSlugs: [] },
  },
  {
    id: 'higado-graso',
    term: 'Higado graso',
    slug: 'higado-graso',
    category: 'lipidos',
    definition: 'Acumulacion de grasa en hepatocitos asociada a disfuncion metabolica.',
    relevance: 'Senal temprana de riesgo cardiometabolico y hepatico.',
    synonyms: ['esteatosis hepatica', 'MASLD'],
    relatedTerms: ['alt', 'ast', 'resistencia-insulina'],
    linking: { keywords: ['higado graso', 'esteatosis hepatica'], preferredAnchors: ['higado graso'], relatedArticleSlugs: [] },
  },
  {
    id: 'mps',
    term: 'Sintesis proteica muscular',
    slug: 'sintesis-proteica-muscular',
    category: 'proteinas',
    definition: 'Formacion de nueva proteina muscular en respuesta a entrenamiento y nutricion.',
    relevance: 'Factor clave para evitar sarcopenia y mejorar metabolismo glucidico.',
    synonyms: ['MPS'],
    relatedTerms: ['leucina', 'mtor', 'sobrecarga-progresiva'],
    linking: { keywords: ['sintesis proteica muscular', 'MPS'], preferredAnchors: ['sintesis proteica muscular'], relatedArticleSlugs: [] },
  },
  {
    id: 'mitocondria',
    term: 'Mitocondria',
    slug: 'mitocondria',
    category: 'mitocondria',
    definition: 'Organelo responsable de gran parte de la produccion aerobica de ATP.',
    relevance: 'Su eficiencia define energia, rendimiento y envejecimiento biologico.',
    synonyms: [],
    relatedTerms: ['fosforilacion-oxidativa', 'ros'],
    linking: { keywords: ['mitocondria', 'mitocondrias'], preferredAnchors: ['mitocondria'], relatedArticleSlugs: [] },
  },
  {
    id: 'estres-oxidativo',
    term: 'Estres oxidativo',
    slug: 'estres-oxidativo',
    category: 'mitocondria',
    definition: 'Desequilibrio entre produccion de oxidantes y defensas antioxidantes.',
    relevance: 'Participa en envejecimiento biologico y enfermedad cronica.',
    synonyms: [],
    relatedTerms: ['ros', 'inflamacion'],
    linking: { keywords: ['estres oxidativo'], preferredAnchors: ['estres oxidativo'], relatedArticleSlugs: [] },
  },
  {
    id: 'microbiota',
    term: 'Microbiota',
    slug: 'microbiota',
    category: 'microbiota',
    definition: 'Conjunto de microorganismos que habitan un entorno, especialmente el intestino.',
    relevance: 'Influye en inflamacion, metabolismo y barrera intestinal.',
    synonyms: ['flora intestinal'],
    relatedTerms: ['disbiosis', 'prebioticos', 'probioticos'],
    linking: { keywords: ['microbiota', 'flora intestinal'], preferredAnchors: ['microbiota'], relatedArticleSlugs: [] },
  },
  {
    id: 'disbiosis',
    term: 'Disbiosis',
    slug: 'disbiosis',
    category: 'microbiota',
    definition: 'Desequilibrio de la microbiota con perdida de diversidad o predominio de patobiontes.',
    relevance: 'Se asocia a inflamacion metabolica y sintomas digestivos cronicos.',
    synonyms: [],
    relatedTerms: ['microbiota', 'permeabilidad-intestinal'],
    linking: { keywords: ['disbiosis'], preferredAnchors: ['disbiosis'], relatedArticleSlugs: [] },
  },
  {
    id: 'permeabilidad-intestinal',
    term: 'Permeabilidad intestinal',
    slug: 'permeabilidad-intestinal',
    category: 'microbiota',
    definition: 'Capacidad selectiva de barrera intestinal para regular el paso de compuestos.',
    relevance: 'Cuando se altera puede favorecer inflamacion sistemica.',
    synonyms: ['intestino permeable'],
    relatedTerms: ['lps', 'endotoxemia-metabolica'],
    linking: { keywords: ['permeabilidad intestinal', 'intestino permeable'], preferredAnchors: ['permeabilidad intestinal'], relatedArticleSlugs: [] },
  },
  {
    id: 'ritmo-circadiano',
    term: 'Ritmo circadiano',
    slug: 'ritmo-circadiano',
    category: 'cronobiologia',
    definition: 'Oscilacion biologica cercana a 24 horas que organiza funciones fisiologicas.',
    relevance: 'Coordina sueno, apetito, hormonas y sensibilidad insulinica.',
    synonyms: [],
    relatedTerms: ['melatonina', 'cortisol', 'higiene-sueno'],
    linking: { keywords: ['ritmo circadiano'], preferredAnchors: ['ritmo circadiano'], relatedArticleSlugs: [] },
  },
  {
    id: 'melatonina',
    term: 'Melatonina',
    slug: 'melatonina',
    category: 'cronobiologia',
    definition: 'Hormona asociada a senal nocturna y preparacion para el sueno.',
    relevance: 'Su ritmo adecuado favorece recuperacion y calidad de sueno.',
    synonyms: [],
    relatedTerms: ['luz-azul', 'higiene-sueno'],
    linking: { keywords: ['melatonina'], preferredAnchors: ['melatonina'], relatedArticleSlugs: [] },
  },
  {
    id: 'vo2-max',
    term: 'VO2 max',
    slug: 'vo2-max',
    category: 'ejercicio',
    definition: 'Consumo maximo de oxigeno durante esfuerzo incremental.',
    relevance: 'Es uno de los mejores predictores funcionales de longevidad.',
    synonyms: [],
    relatedTerms: ['umbral-lactato', 'capacidad-aerobica'],
    linking: { keywords: ['VO2 max'], preferredAnchors: ['VO2 max'], relatedArticleSlugs: [] },
  },
  {
    id: 'sarcopenia',
    term: 'Sarcopenia',
    slug: 'sarcopenia',
    category: 'ejercicio',
    definition: 'Perdida progresiva de masa y funcion muscular asociada a envejecimiento.',
    relevance: 'Aumenta fragilidad, caidas y deterioro metabolico.',
    synonyms: [],
    relatedTerms: ['mps', 'masa-magra', 'fuerza-muscular'],
    linking: { keywords: ['sarcopenia'], preferredAnchors: ['sarcopenia'], relatedArticleSlugs: [] },
  },
  {
    id: 'homa-ir',
    term: 'HOMA-IR',
    slug: 'homa-ir',
    category: 'biomarcadores',
    definition: 'Indice calculado con glucosa e insulina en ayuno para estimar resistencia insulinica.',
    relevance: 'Util en seguimiento de riesgo metabolico temprano.',
    synonyms: [],
    relatedTerms: ['glucemia-ayunas', 'insulina-basal'],
    linking: { keywords: ['HOMA-IR'], preferredAnchors: ['HOMA-IR'], relatedArticleSlugs: [] },
  },
  {
    id: 'pcr-us',
    term: 'PCR ultrasensible',
    slug: 'pcr-ultrasensible',
    category: 'biomarcadores',
    definition: 'Proteina C reactiva de alta sensibilidad para inflamacion de bajo grado.',
    relevance: 'Se usa para estratificar riesgo cardiometabolico.',
    synonyms: ['hs-CRP'],
    relatedTerms: ['inflamacion', 'homocisteina'],
    linking: { keywords: ['PCR ultrasensible', 'hs-CRP'], preferredAnchors: ['PCR ultrasensible'], relatedArticleSlugs: [] },
  },
  {
    id: 'alt',
    term: 'ALT',
    slug: 'alt',
    category: 'biomarcadores',
    definition: 'Enzima hepatica cuya elevacion sugiere dano celular en higado.',
    relevance: 'Util para monitoreo de esteatosis y otras condiciones hepaticas.',
    synonyms: ['alanina aminotransferasa'],
    relatedTerms: ['ast', 'higado-graso'],
    linking: { keywords: ['ALT', 'alanina aminotransferasa'], preferredAnchors: ['ALT'], relatedArticleSlugs: [] },
  },
  {
    id: 'polifenoles',
    term: 'Polifenoles',
    slug: 'polifenoles',
    category: 'nutricion-funcional',
    definition: 'Familia de compuestos vegetales con actividad antioxidante y senalizadora.',
    relevance: 'Pueden modular inflamacion y funcion endotelial.',
    synonyms: [],
    relatedTerms: ['flavonoides', 'resveratrol'],
    linking: { keywords: ['polifenoles'], preferredAnchors: ['polifenoles'], relatedArticleSlugs: [] },
  },
  {
    id: 'curcumina',
    term: 'Curcumina',
    slug: 'curcumina',
    category: 'nutricion-funcional',
    definition: 'Compuesto bioactivo de la curcuma con perfil antiinflamatorio.',
    relevance: 'Puede apoyar manejo de inflamacion de bajo grado en contextos seleccionados.',
    synonyms: [],
    relatedTerms: ['polifenoles', 'inflamacion'],
    linking: { keywords: ['curcumina'], preferredAnchors: ['curcumina'], relatedArticleSlugs: [] },
  },
  {
    id: 'inflamacion',
    term: 'Inflamacion',
    slug: 'inflamacion',
    category: 'clinica-general',
    definition: 'Respuesta biologica frente a dano, infeccion o estimulo nocivo.',
    relevance: 'Cuando es cronica puede deteriorar salud metabolica.',
    synonyms: [],
    relatedTerms: ['pcr-us', 'aterosclerosis', 'resistencia-insulina'],
    linking: { keywords: ['inflamacion'], preferredAnchors: ['inflamacion'], relatedArticleSlugs: [] },
  },
  {
    id: 'sindrome-metabolico',
    term: 'Sindrome metabolico',
    slug: 'sindrome-metabolico',
    category: 'clinica-general',
    definition: 'Conjunto de factores de riesgo como obesidad central, hipertension, dislipidemia y alteracion glucemica.',
    relevance: 'Aumenta riesgo de diabetes tipo 2 y enfermedad cardiovascular.',
    synonyms: [],
    relatedTerms: ['resistencia-insulina', 'trigliceridos', 'hipertension'],
    linking: { keywords: ['sindrome metabolico'], preferredAnchors: ['sindrome metabolico'], relatedArticleSlugs: [] },
  },
  {
    id: 'diabetes-tipo-2',
    term: 'Diabetes tipo 2',
    slug: 'diabetes-tipo-2',
    category: 'clinica-general',
    definition: 'Enfermedad cronica caracterizada por hiperglucemia y disfuncion insulinica.',
    relevance: 'Es prevenible en gran parte de los casos con intervencion temprana.',
    synonyms: ['DM2'],
    relatedTerms: ['hba1c', 'resistencia-insulina', 'prediabetes'],
    linking: { keywords: ['diabetes tipo 2', 'DM2'], preferredAnchors: ['diabetes tipo 2'], relatedArticleSlugs: [] },
  },
  {
    id: 'cirrosis',
    term: 'Cirrosis',
    slug: 'cirrosis',
    category: 'clinica-general',
    definition: 'Etapa avanzada de dano hepatica con arquitectura organica alterada.',
    relevance: 'Requiere seguimiento especializado por riesgo de complicaciones mayores.',
    synonyms: [],
    relatedTerms: ['fibrosis-hepatica', 'ictericia'],
    linking: { keywords: ['cirrosis'], preferredAnchors: ['cirrosis'], relatedArticleSlugs: [] },
  },
];

const GLOSSARY_INDEX_BY_SLUG = METABOLIC_GLOSSARY.reduce((acc, item) => {
  acc[item.slug] = item;
  return acc;
}, {});

const GLOSSARY_INDEX_BY_TERM = METABOLIC_GLOSSARY.reduce((acc, item) => {
  acc[item.term.toLowerCase()] = item;
  return acc;
}, {});

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const GLOSSARY_VERSION = '2026-03-06';
export const GLOSSARY_STATUS = 'draft';
export { GLOSSARY_CATEGORIES, METABOLIC_GLOSSARY };

export const getGlossaryTermBySlug = (slug) => GLOSSARY_INDEX_BY_SLUG[String(slug || '').trim()] || null;

export const getGlossaryTermByName = (term) => GLOSSARY_INDEX_BY_TERM[String(term || '').toLowerCase().trim()] || null;

export const getGlossaryTermsByCategory = (categoryId) =>
  METABOLIC_GLOSSARY.filter((item) => item.category === categoryId);

export const searchGlossaryTerms = (query) => {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return [];

  return METABOLIC_GLOSSARY.filter((item) => {
    const haystack = [
      item.term,
      item.definition,
      item.relevance,
      ...(item.synonyms || []),
      ...(item.linking?.keywords || []),
    ]
      .map((value) => normalizeText(value))
      .join(' ');

    return haystack.includes(cleanQuery);
  });
};

export const getGlossaryCoverageSummary = () => ({
  version: GLOSSARY_VERSION,
  status: GLOSSARY_STATUS,
  categories: GLOSSARY_CATEGORIES.length,
  terms: METABOLIC_GLOSSARY.length,
  termsByCategory: GLOSSARY_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = METABOLIC_GLOSSARY.filter((term) => term.category === category.id).length;
    return acc;
  }, {}),
});
