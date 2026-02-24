import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import BrandLogo from '@/components/BrandLogo';

const quickLinks = [
  { label: 'Conoce el enfoque', to: '/sobre-mi' },
  { label: 'Cómo trabajamos', to: '/metodologia-editorial' },
  { label: 'Transparencia editorial', to: '/transparencia' },
];

const guideLinks = [
  {
    label: 'Guía: Hígado graso',
    to: '/guias/higado-graso',
    summary: 'Enfoque MASLD/SLD, riesgo de fibrosis y relación cardiometabólica.',
  },
  {
    label: 'Guía: Resistencia a la insulina',
    to: '/guias/resistencia-insulina',
    summary: 'Músculo, hígado y tejido adiposo: lectura por patrón y contexto clínico.',
  },
  {
    label: 'Guía: Inflamación metabólica',
    to: '/guias/inflamacion-metabolica',
    summary: 'Inflamación crónica de bajo grado y su vínculo con metabolismo e hígado.',
  },
  {
    label: 'Guía: Exámenes y marcadores',
    to: '/guias/examenes-y-marcadores',
    summary: 'Glucosa, HbA1c, lípidos, FIB-4 y elastografía sin sobrediagnóstico.',
  },
  { label: 'Ver todos los artículos', to: '/articulos' },
];

const topicLinks = [
  { label: 'Metabolismo', to: '/categorias/metabolismo' },
  { label: 'Hígado', to: '/categorias/higado' },
  { label: 'Insulina', to: '/categorias/insulina' },
  { label: 'Inflamación', to: '/categorias/inflamacion' },
  { label: 'Microbiota', to: '/categorias/microbiota' },
];

const resourceLinks = [
  { label: 'Empieza aquí', to: '/empieza-aqui' },
  { label: 'Preguntas frecuentes', to: '/faq' },
  { label: 'Glosario', to: '/glosario' },
  { label: 'Comunidad', to: '/comunidad' },
  { label: 'Newsletter', to: '/newsletter' },
];

const legalLinksBase = [
  { label: 'Políticas y seguridad', to: '/politicas-seguridad' },
  { label: 'Descargo médico', to: '/descargo' },
  { label: 'Política de privacidad', to: '/privacidad' },
  { label: 'Términos de uso', to: '/terminos' },
  { label: 'Política de cookies', to: '/cookies' },
  { label: 'Seguridad de la información', to: '/seguridad' },
  { label: 'Correcciones y actualizaciones', to: '/correcciones' },
];

const contactLinks = [
  { label: 'Contactar', to: '/contacto' },
  { label: 'Colaboraciones / Prensa', to: '/colaboraciones' },
  { label: 'Reportar un error', to: '/reportar-error' },
];

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
const NEWSLETTER_RATE_LIMIT_MS = 45000;
const NEWSLETTER_RATE_LIMIT_KEY = 'bec_newsletter_last_submit_at';

const FooterV2 = ({ showAffiliateDisclosure = false }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState({ kind: '', message: '' });

  const legalLinks = showAffiliateDisclosure
    ? [...legalLinksBase, { label: 'Divulgación de afiliación', to: '/afiliacion' }]
    : legalLinksBase;

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const honeypotValue = String(formData.get('company') || '').trim();

    if (honeypotValue) {
      setSubmitFeedback({
        kind: 'success',
        message: 'Suscripción recibida. Revisa tu correo en unos minutos.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setSubmitFeedback({
        kind: 'error',
        message: 'Ingresa un correo válido para suscribirte.',
      });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setSubmitFeedback({
        kind: 'error',
        message: 'Revisa el formato del correo e inténtalo nuevamente.',
      });
      return;
    }

    if (typeof window !== 'undefined') {
      const now = Date.now();
      const lastSubmit = Number(window.localStorage.getItem(NEWSLETTER_RATE_LIMIT_KEY) || 0);
      if (lastSubmit && now - lastSubmit < NEWSLETTER_RATE_LIMIT_MS) {
        setSubmitFeedback({
          kind: 'error',
          message: 'Espera unos segundos antes de volver a intentarlo.',
        });
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitFeedback({ kind: '', message: '' });

    try {
      let isSaved = false;

      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail }),
        });

        if (response.ok) isSaved = true;
      } catch {
        isSaved = false;
      }

      if (!isSaved) {
        const { error } = await supabase.from('newsletter_subscribers').insert({
          email: normalizedEmail,
        });
        if (error) throw error;
        isSaved = true;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(NEWSLETTER_RATE_LIMIT_KEY, String(Date.now()));
      }

      setSubmitFeedback({
        kind: 'success',
        message: 'Suscripción confirmada. Recibirás 1–2 correos al mes.',
      });
      setEmail('');
    } catch {
      setSubmitFeedback({
        kind: 'error',
        message: 'No se pudo guardar tu suscripción. Intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-white/10 bg-[#0B1220] px-6 py-14 text-white/85">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-1">
            <BrandLogo showDescriptor tone="inverse" />

            <p className="text-sm leading-6 text-white/70">
              Divulgación editorial sobre salud metabólica con claridad, límites explícitos y enfoque
              latinoamericano.
            </p>

            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/80 transition-colors hover:text-[#34D399]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/90">Guías</h4>
            <ul className="space-y-3 text-sm">
              {guideLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/85 transition-colors hover:text-[#34D399]">
                    {link.label}
                  </Link>
                  {link.summary ? (
                    <p className="mt-1 text-xs leading-5 text-white/55">{link.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/90">Temas</h4>
            <ul className="space-y-2 text-sm">
              {topicLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/80 transition-colors hover:text-[#34D399]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/90">Recursos</h4>
            <ul className="space-y-2 text-sm">
              {resourceLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/80 transition-colors hover:text-[#34D399]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-7">
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/90">
                Legal y confianza
              </h4>
              <ul className="space-y-2 text-sm">
                {legalLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-white/80 transition-colors hover:text-[#34D399]">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event('bec:open-cookie-preferences'))}
                    className="text-white/80 transition-colors hover:text-[#34D399]"
                  >
                    Preferencias de cookies
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/90">Contacto</h4>
              <ul className="space-y-2 text-sm">
                {contactLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-white/80 transition-colors hover:text-[#34D399]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3.5 sm:px-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white/90">
                Recibe artículos nuevos y actualizaciones
              </h4>
              <p className="line-clamp-2 text-xs text-white/65">
                Resumen editorial breve para seguir guías, actualizaciones y nuevos contenidos.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                aria-hidden="true"
              />
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Correo electrónico para suscripción al newsletter
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                className="h-11 w-full min-w-[240px] rounded-[12px] border border-white/15 bg-white/[0.06] px-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-[#34D399] sm:max-w-[420px]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#34D399] px-5 text-sm font-semibold text-[#0B1220] transition-colors duration-150 hover:bg-[#2CC98C] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-80"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {isSubmitting ? 'Enviando...' : 'Suscribirme'}
              </button>
            </form>

            <div className="flex flex-col gap-1 text-xs text-white/60 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p>1–2 correos al mes. Sin spam.</p>
              <p>
                Al suscribirte aceptas la{' '}
                <Link to="/privacidad" className="text-white/85 underline decoration-white/40 underline-offset-2 hover:text-[#34D399]">
                  Política de privacidad
                </Link>
                .
              </p>
            </div>
            {submitFeedback.message && (
              <p
                className={`text-xs ${
                  submitFeedback.kind === 'error' ? 'text-rose-300' : 'text-[#A7F3D0]'
                }`}
                role="status"
                aria-live="polite"
              >
                {submitFeedback.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-end md:justify-between">
          <p>© 2026 Bienestar en Claro.</p>
          <div className="md:text-right">
            <p>Contenido educativo; no reemplaza evaluación profesional.</p>
            <p className="text-xs text-white/50">Última actualización del sitio: Feb 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterV2;
