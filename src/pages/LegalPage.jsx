import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const LAST_UPDATED = '24 de febrero de 2026';

const privacyDoc = {
  title: 'Política de Privacidad',
  description:
    'Tratamiento de datos personales, finalidades, derechos del usuario y medidas de seguridad de Bienestar en Claro.',
  content: `
    <p><strong>Última actualización:</strong> ${LAST_UPDATED}</p>
    <p>Bienestar en Claro trata datos personales con fines editoriales, operativos y de seguridad. Esta política explica qué datos recopilamos, para qué los usamos, por cuánto tiempo los conservamos y cómo puedes ejercer tus derechos.</p>

    <h2>1. Responsable y alcance</h2>
    <p>Esta política aplica al uso del sitio, formularios, comentarios, suscripción a newsletter y canales de contacto. Si utilizas el sitio, aceptas este tratamiento dentro de los límites aquí indicados.</p>

    <h2>2. Datos que podemos recopilar</h2>
    <ul>
      <li>Datos de identificación y contacto que envías voluntariamente (por ejemplo, correo).</li>
      <li>Datos técnicos y de navegación (IP, navegador, sistema operativo, eventos básicos del sitio).</li>
      <li>Datos de cuenta y actividad, cuando exista registro de usuario.</li>
      <li>Datos de soporte cuando reportas errores o solicitas contacto.</li>
    </ul>

    <h2>3. Finalidades del tratamiento</h2>
    <ul>
      <li>Operar y mantener el sitio.</li>
      <li>Responder consultas y solicitudes.</li>
      <li>Gestionar suscripciones y comunicaciones editoriales.</li>
      <li>Prevenir abuso, fraude, spam o accesos no autorizados.</li>
      <li>Analizar uso agregado del sitio, cuando exista consentimiento para analítica no esencial.</li>
    </ul>

    <h2>4. Base jurídica y consentimiento</h2>
    <p>Tratamos datos por consentimiento, ejecución de servicios solicitados, interés legítimo de seguridad y cumplimiento de obligaciones aplicables. Puedes retirar consentimientos no esenciales desde “Preferencias de cookies”.</p>

    <h2>5. Conservación de datos</h2>
    <p>Conservamos datos solo durante el tiempo necesario para la finalidad declarada, salvo obligaciones legales o defensa frente a reclamaciones. Los periodos pueden variar según tipo de dato y riesgo operativo.</p>

    <h2>6. Compartición con terceros</h2>
    <p>Podemos utilizar proveedores para hosting, base de datos, envío de correos y analítica. Estos terceros operan bajo instrucciones y controles razonables de confidencialidad y seguridad. No vendemos datos personales.</p>

    <h2>7. Derechos del titular</h2>
    <p>Puedes solicitar acceso, rectificación, actualización, supresión u oposición al tratamiento, cuando corresponda. Para ejercer derechos escribe a <a href="mailto:contacto@bienestarenclaro.com">contacto@bienestarenclaro.com</a>.</p>

    <h2>8. Menores de edad</h2>
    <p>El contenido está dirigido a audiencia general adulta. Si detectamos datos de menores sin autorización válida, podremos bloquear o eliminar esa información.</p>

    <h2>9. Seguridad y notificación</h2>
    <p>Aplicamos medidas técnicas y organizativas razonables para reducir riesgo de acceso no autorizado, alteración o pérdida. Ningún sistema es infalible; por ello mantenemos procesos de detección, respuesta y mejora continua.</p>

    <h2>10. Cambios de política</h2>
    <p>Podemos actualizar esta política por cambios normativos, técnicos o editoriales. La versión vigente y su fecha de actualización se publican en esta misma página.</p>
  `,
};

const termsDoc = {
  title: 'Términos de Uso',
  description:
    'Condiciones de uso del sitio, límites de responsabilidad, propiedad intelectual y reglas de conducta.',
  content: `
    <p><strong>Última actualización:</strong> ${LAST_UPDATED}</p>
    <p>Estos términos regulan el acceso y uso de Bienestar en Claro. Si navegas o utilizas funcionalidades del sitio, aceptas estas condiciones.</p>

    <h2>1. Naturaleza del servicio</h2>
    <p>Bienestar en Claro es una plataforma editorial educativa. El contenido no constituye diagnóstico médico, prescripción, relación médico-paciente ni reemplaza evaluación profesional individual.</p>

    <h2>2. Uso permitido</h2>
    <ul>
      <li>Uso personal, informativo y no fraudulento.</li>
      <li>Respeto de normas de convivencia en espacios participativos.</li>
      <li>Cumplimiento de leyes aplicables de tu jurisdicción.</li>
    </ul>

    <h2>3. Uso prohibido</h2>
    <ul>
      <li>Publicar contenido difamatorio, engañoso, ilegal o que promueva daño.</li>
      <li>Intentar acceso no autorizado, extracción masiva de datos o ataques al sitio.</li>
      <li>Usar el contenido para afirmar curas, promesas clínicas o recomendaciones personalizadas en nombre del sitio.</li>
    </ul>

    <h2>4. Propiedad intelectual</h2>
    <p>Textos, estructura editorial, marca y recursos gráficos son propiedad de sus titulares. Queda prohibida su reproducción o explotación no autorizada, salvo usos permitidos por ley con atribución adecuada.</p>

    <h2>5. Exactitud y actualización</h2>
    <p>Buscamos precisión y actualización periódica, pero no garantizamos ausencia total de errores ni vigencia absoluta en todo contexto clínico. La evidencia puede cambiar y las decisiones deben validarse con profesionales calificados.</p>

    <h2>6. Limitación de responsabilidad</h2>
    <p>En la medida permitida por ley, el titular del sitio no será responsable por daños directos o indirectos derivados de la interpretación o uso del contenido, interrupciones del servicio o acciones de terceros fuera de su control razonable.</p>

    <h2>7. Indemnidad</h2>
    <p>El usuario acepta mantener indemne al sitio y su titular frente a reclamaciones originadas por uso indebido, violación de estos términos o incumplimiento normativo por parte del usuario.</p>

    <h2>8. Suspensión y cambios</h2>
    <p>Podemos suspender funcionalidades, restringir accesos o modificar el servicio por razones de seguridad, mantenimiento o cumplimiento normativo. También podemos actualizar estos términos.</p>

    <h2>9. Ley aplicable y contacto</h2>
    <p>Estos términos se interpretan conforme a normativa aplicable al titular del sitio y principios de buena fe contractual. Para asuntos legales o aclaraciones: <a href="mailto:contacto@bienestarenclaro.com">contacto@bienestarenclaro.com</a>.</p>
  `,
};

const disclaimerDoc = {
  title: 'Descargo Médico',
  description:
    'Alcance educativo del contenido, límites clínicos y advertencias para evitar interpretaciones incorrectas.',
  content: `
    <p><strong>Última actualización:</strong> ${LAST_UPDATED}</p>
    <p>El contenido de Bienestar en Claro es exclusivamente educativo y de divulgación. No constituye consejo médico personalizado ni reemplaza consulta, examen físico o seguimiento clínico profesional.</p>

    <h2>1. Sin diagnóstico ni tratamiento personalizado</h2>
    <p>No emitimos diagnósticos individuales, recetas ni indicaciones terapéuticas personalizadas. Toda decisión clínica debe ser evaluada por profesionales de salud habilitados.</p>

    <h2>2. Sin promesas de resultado</h2>
    <p>No prometemos curas, reversión garantizada de enfermedades ni resultados clínicos específicos. Evitamos mensajes milagro, alarmistas o de falsa certeza.</p>

    <h2>3. Emergencias</h2>
    <p>Si presentas una urgencia médica, síntomas graves o riesgo inmediato, contacta servicios de emergencia locales de forma inmediata. No uses este sitio para resolver una urgencia.</p>

    <h2>4. Responsabilidad del usuario</h2>
    <p>El usuario es responsable de contrastar información con su contexto personal, historial clínico, medicación y comorbilidades junto con su equipo tratante.</p>

    <h2>5. Suplementos, dietas y protocolos</h2>
    <p>Cualquier mención a hábitos, suplementos o estrategias de estilo de vida se presenta con fines informativos generales y no sustituye valoración individual de riesgos y beneficios.</p>
  `,
};

const editorialPolicyDoc = {
  title: 'Política Editorial',
  description:
    'Criterios editoriales, estándares de evidencia, actualizaciones y manejo de conflictos de interés.',
  content: `
    <p><strong>Última actualización:</strong> ${LAST_UPDATED}</p>
    <p>Nuestra línea editorial prioriza claridad, trazabilidad de fuentes y límites explícitos para audiencia latinoamericana en temas de salud metabólica.</p>

    <h2>1. Criterios de evidencia</h2>
    <p>La prioridad se da a guías clínicas, metaanálisis, revisiones sistemáticas y ensayos clínicos de calidad. La evidencia observacional se utiliza con advertencias sobre sus límites.</p>

    <h2>2. Proceso editorial</h2>
    <p>Cada pieza pasa por selección temática, revisión de fuentes, redacción estructurada, control de lenguaje no sensacionalista y actualización cuando aparece evidencia relevante.</p>

    <h2>3. Transparencia</h2>
    <p>Cuando existe incertidumbre, se declara explícitamente. Cuando hay cambios sustanciales de criterio, se actualiza el contenido y, cuando aplica, se deja registro de corrección.</p>

    <h2>4. Integridad comercial</h2>
    <p>La eventual integración comercial no sustituye contenido nuclear ni define conclusiones editoriales. Cualquier enlace comercial o de afiliación debe identificarse de forma visible.</p>
  `,
};

const cookiesDoc = {
  title: 'Política de Cookies',
  description:
    'Tipos de cookies, finalidades, consentimiento, revocación y gestión de preferencias.',
  content: `
    <p><strong>Última actualización:</strong> ${LAST_UPDATED}</p>
    <p>Usamos cookies y tecnologías similares para funcionamiento básico del sitio y, con tu consentimiento, para analítica u otros fines no esenciales.</p>

    <h2>1. Categorías de cookies</h2>
    <ul>
      <li><strong>Esenciales:</strong> necesarias para seguridad, sesión y funcionamiento técnico.</li>
      <li><strong>Analítica:</strong> miden uso agregado para mejorar contenidos y experiencia.</li>
      <li><strong>Marketing/externas:</strong> solo si se habilitan funcionalidades que lo requieran.</li>
    </ul>

    <h2>2. Consentimiento previo</h2>
    <p>Las cookies no esenciales se activan únicamente tras consentimiento explícito. Puedes aceptar, rechazar o configurar categorías desde el banner o “Preferencias de cookies”.</p>

    <h2>3. Revocación y cambios</h2>
    <p>Puedes cambiar tu decisión en cualquier momento. Al revocar consentimiento, se detiene la carga de scripts no esenciales en visitas futuras.</p>

    <h2>4. Terceros</h2>
    <p>Algunos servicios de terceros pueden establecer sus propias cookies bajo sus políticas. Recomendamos revisar también sus condiciones de privacidad.</p>
  `,
};

const securityDoc = {
  title: 'Seguridad de la Información',
  description:
    'Marco de seguridad del sitio: prevención, controles, respuesta a incidentes y divulgación responsable.',
  content: `
    <p><strong>Última actualización:</strong> ${LAST_UPDATED}</p>
    <p>Este documento resume medidas operativas y criterios de seguridad aplicados para reducir riesgos técnicos, abuso de la plataforma y exposición indebida de datos.</p>

    <h2>1. Principios de seguridad</h2>
    <ul>
      <li>Minimización de datos y privilegios mínimos.</li>
      <li>Separación entre contenido editorial y servicios críticos.</li>
      <li>Monitoreo, actualización y mejora continua.</li>
    </ul>

    <h2>2. Controles implementados</h2>
    <ul>
      <li>Conexiones cifradas en tránsito (HTTPS).</li>
      <li>Protecciones básicas anti-spam y anti-abuso en formularios.</li>
      <li>Rate limit en acciones sensibles de frontend y validaciones de entrada.</li>
      <li>Gestión de consentimiento para scripts no esenciales.</li>
    </ul>

    <h2>3. Gestión de incidentes</h2>
    <p>Ante incidentes relevantes, se activan medidas de contención, análisis de impacto, corrección y prevención de recurrencia. Si corresponde, se notificará por canales disponibles.</p>

    <h2>4. Reporte responsable</h2>
    <p>Si detectas vulnerabilidades o riesgos de seguridad, repórtalos a <a href="mailto:contacto@bienestarenclaro.com">contacto@bienestarenclaro.com</a> con evidencia reproducible. No realices pruebas destructivas ni acceso no autorizado.</p>

    <h2>5. Limitaciones</h2>
    <p>Ningún sistema conectado a Internet puede garantizar riesgo cero. Este sitio aplica medidas razonables de seguridad, sin prometer invulnerabilidad absoluta.</p>
  `,
};

const policySecurityDoc = {
  title: 'Políticas y Seguridad',
  description:
    'Documento marco con reglas de privacidad, uso, descargo médico, cookies, seguridad y prevención de malentendidos.',
  content: `
    <p><strong>Última actualización:</strong> ${LAST_UPDATED}</p>
    <p>Este documento integra los criterios principales de cumplimiento editorial, legal y seguridad para Bienestar en Claro, con foco en reducción de riesgo reputacional, operativo y de malentendidos en temas de salud.</p>

    <h2>1. Naturaleza del sitio</h2>
    <p>Bienestar en Claro es una plataforma educativa en salud metabólica. No presta servicios médicos, no reemplaza consulta profesional y no realiza diagnóstico individual.</p>

    <h2>2. Compromisos de protección</h2>
    <ul>
      <li>Lenguaje no sensacionalista y sin promesas de cura.</li>
      <li>Separación entre contenido editorial y cualquier interés comercial.</li>
      <li>Política de correcciones y actualización periódica.</li>
      <li>Protecciones razonables de seguridad y privacidad.</li>
    </ul>

    <h2>3. Documentos vinculados</h2>
    <ul>
      <li><a href="/privacidad">Política de Privacidad</a></li>
      <li><a href="/terminos">Términos de Uso</a></li>
      <li><a href="/descargo">Descargo Médico</a></li>
      <li><a href="/cookies">Política de Cookies</a></li>
      <li><a href="/politica-editorial">Política Editorial</a></li>
      <li><a href="/seguridad">Seguridad de la Información</a></li>
      <li><a href="/correcciones">Correcciones y actualizaciones</a></li>
    </ul>

    <h2>4. Prevención de malentendidos</h2>
    <p>Si un contenido puede interpretarse como consejo clínico individual, prevalece siempre este marco: uso educativo general, necesidad de evaluación profesional y ausencia de garantía de resultado.</p>

    <h2>5. Alcance legal y revisión profesional</h2>
    <p>Este marco se publica para transparencia y reducción de riesgo operativo. No sustituye asesoría legal especializada. Se recomienda revisión periódica por asesoría jurídica local para ajustar redacción a normativa vigente en la jurisdicción aplicable.</p>
  `,
};

const contentMap = {
  '/privacidad': privacyDoc,
  '/politica-privacidad': privacyDoc,
  '/legal/privacidad': privacyDoc,
  '/legal/politica-privacidad': privacyDoc,
  '/terminos': termsDoc,
  '/legal/terminos': termsDoc,
  '/descargo': disclaimerDoc,
  '/aviso-medico': disclaimerDoc,
  '/legal/descargo': disclaimerDoc,
  '/legal/aviso-medico': disclaimerDoc,
  '/politica-editorial': editorialPolicyDoc,
  '/legal/politica-editorial': editorialPolicyDoc,
  '/cookies': cookiesDoc,
  '/legal/cookies': cookiesDoc,
  '/seguridad': securityDoc,
  '/legal/seguridad': securityDoc,
  '/politicas-seguridad': policySecurityDoc,
  '/legal/politicas-seguridad': policySecurityDoc,
  '/sobre-mi': { title: 'Sobre Mí', description: '', content: '' },
};

const LegalPage = () => {
  const location = useLocation();
  const pageData = contentMap[location.pathname] || {
    title: 'Página no encontrada',
    description: 'Documento no disponible.',
    content: '',
  };
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
            <figure className="aspect-[3/4] min-h-[360px] max-h-[420px] w-full max-w-[288px] overflow-hidden rounded-[4px] bg-transparent">
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
    <div className="min-h-screen bg-slate-50 py-16 dark:bg-background">
      <Helmet>
        <title>{pageData.title} - Bienestar en Claro</title>
        <meta name="description" content={pageData.description} />
      </Helmet>
      <div className="container mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm dark:bg-card">
        <nav className="mb-8 text-sm text-slate-500 dark:text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>{' '}
          &gt; {pageData.title}
        </nav>
        <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-foreground">{pageData.title}</h1>
        <div
          className="prose prose-slate max-w-none dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-foreground prose-a:text-emerald-700"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
    </div>
  );
};

export default LegalPage;
