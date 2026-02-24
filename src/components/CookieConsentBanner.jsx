import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const CookieConsentBanner = () => {
  const {
    consent,
    hasPreference,
    hasNonEssentialCookies,
    optionalServices,
    saveConsent,
    acceptAll,
    rejectNonEssential,
  } = useCookieConsent();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    analytics: consent.analytics,
    marketing: consent.marketing,
    externals: consent.externals,
  });

  useEffect(() => {
    setDraft({
      analytics: consent.analytics,
      marketing: consent.marketing,
      externals: consent.externals,
    });
  }, [consent.analytics, consent.externals, consent.marketing]);

  useEffect(() => {
    const onOpenPreferences = () => setIsModalOpen(true);
    window.addEventListener('bec:open-cookie-preferences', onOpenPreferences);
    return () => window.removeEventListener('bec:open-cookie-preferences', onOpenPreferences);
  }, []);

  const shouldShowBanner = hasNonEssentialCookies && !hasPreference;

  const categoryRows = useMemo(
    () => [
      {
        key: 'essential',
        label: 'Cookies esenciales',
        description: 'Necesarias para sesión, seguridad y funcionamiento básico del sitio.',
        enabled: true,
        locked: true,
        available: true,
      },
      {
        key: 'analytics',
        label: 'Cookies de analítica',
        description: 'Nos ayudan a medir uso para mejorar navegación y contenidos.',
        enabled: draft.analytics,
        locked: false,
        available: optionalServices.analytics,
      },
      {
        key: 'marketing',
        label: 'Cookies de marketing',
        description: 'Relacionadas con anuncios o remarketing cuando aplique.',
        enabled: draft.marketing,
        locked: false,
        available: optionalServices.marketing,
      },
      {
        key: 'externals',
        label: 'Contenido externo con tracking',
        description: 'Embeds de terceros que pueden añadir trazabilidad.',
        enabled: draft.externals,
        locked: false,
        available: optionalServices.externals,
      },
    ],
    [draft.analytics, draft.externals, draft.marketing, optionalServices.analytics, optionalServices.externals, optionalServices.marketing],
  );

  const onAcceptAll = () => {
    acceptAll();
    setIsModalOpen(false);
  };

  const onRejectAll = () => {
    rejectNonEssential();
    setIsModalOpen(false);
  };

  const onSavePreferences = () => {
    saveConsent({
      analytics: optionalServices.analytics ? draft.analytics : false,
      marketing: optionalServices.marketing ? draft.marketing : false,
      externals: optionalServices.externals ? draft.externals : false,
    });
    setIsModalOpen(false);
  };

  const renderConfigModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center">
        <div className="w-full max-w-xl rounded-2xl border border-border bg-background p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Preferencias de cookies</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Puedes ajustar qué categorías no esenciales permites en este sitio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
              aria-label="Cerrar configuración de cookies"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {categoryRows.map((item) => (
              <div key={item.key} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                      {!item.available && !item.locked ? (
                        <span className="ml-2 text-xs font-medium text-muted-foreground">(No usada actualmente)</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.locked ? true : item.enabled}
                    disabled={item.locked || !item.available}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, [item.key]: event.target.checked }))
                    }
                    className="mt-1 h-4 w-4 accent-primary"
                    aria-label={item.label}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSavePreferences}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Guardar preferencias
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Aceptar todo
            </button>
            <button
              type="button"
              onClick={onRejectAll}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Rechazar no esenciales
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {shouldShowBanner && (
        <div className="fixed bottom-3 left-3 right-3 z-[80] mx-auto w-auto max-w-4xl rounded-2xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-foreground">Cookies y privacidad</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Usamos cookies esenciales para que el sitio funcione y, con tu permiso, cookies de
            analítica para mejorar la experiencia. Puedes aceptar, rechazar o configurar.
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <Link to="/legal/cookies" className="underline underline-offset-2 hover:text-primary">
              Política de cookies
            </Link>
            <Link to="/legal/privacidad" className="underline underline-offset-2 hover:text-primary">
              Política de privacidad
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAcceptAll}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Aceptar todo
            </button>
            <button
              type="button"
              onClick={onRejectAll}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Rechazar no esenciales
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Configurar
            </button>
          </div>
        </div>
      )}
      {renderConfigModal()}
    </>
  );
};

export default CookieConsentBanner;
