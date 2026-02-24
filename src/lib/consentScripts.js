const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
const marketingScriptUrl = import.meta.env.VITE_MARKETING_SCRIPT_URL || '';
const externalsTrackingEnabled = import.meta.env.VITE_EXTERNALS_TRACKING === 'true';

const OPTIONAL_COOKIE_SERVICES = {
  analytics: Boolean(gaMeasurementId),
  marketing: Boolean(marketingScriptUrl),
  externals: externalsTrackingEnabled,
};

let analyticsLoaded = false;
let marketingLoaded = false;
let externalsEnabled = false;

const appendScript = ({ id, src, async = true }) => {
  if (typeof document === 'undefined') return null;
  if (id && document.getElementById(id)) return document.getElementById(id);

  const script = document.createElement('script');
  if (id) script.id = id;
  script.src = src;
  script.async = async;
  document.head.appendChild(script);
  return script;
};

export const hasNonEssentialCookieServices = () =>
  Object.values(OPTIONAL_COOKIE_SERVICES).some(Boolean);

export const getOptionalCookieServices = () => OPTIONAL_COOKIE_SERVICES;

export const loadAnalytics = () => {
  if (analyticsLoaded || !OPTIONAL_COOKIE_SERVICES.analytics || !gaMeasurementId) return;
  analyticsLoaded = true;

  appendScript({
    id: 'bec-analytics-gtag',
    src: `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
  });

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaMeasurementId, { anonymize_ip: true });
};

export const loadMarketing = () => {
  if (marketingLoaded || !OPTIONAL_COOKIE_SERVICES.marketing || !marketingScriptUrl) return;
  marketingLoaded = true;

  appendScript({
    id: 'bec-marketing-script',
    src: marketingScriptUrl,
  });
};

export const enableExternalTracking = () => {
  if (externalsEnabled || !OPTIONAL_COOKIE_SERVICES.externals) return;
  externalsEnabled = true;

  window.dispatchEvent(
    new CustomEvent('bec:external-tracking-enabled', {
      detail: { enabled: true },
    }),
  );
};

export const applyConsentSideEffects = (consent) => {
  if (!consent) return;
  if (consent.analytics) loadAnalytics();
  if (consent.marketing) loadMarketing();
  if (consent.externals) enableExternalTracking();
};
