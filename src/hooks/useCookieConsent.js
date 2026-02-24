import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyConsentSideEffects,
  getOptionalCookieServices,
  hasNonEssentialCookieServices,
} from '@/lib/consentScripts';

export const COOKIE_CONSENT_STORAGE_KEY = 'bec_cookie_consent_v1';
const CONSENT_VERSION = 1;

const defaultConsent = {
  version: CONSENT_VERSION,
  essential: true,
  analytics: false,
  marketing: false,
  externals: false,
  timestamp: '',
};

const isObject = (value) => value && typeof value === 'object';

const sanitizeConsent = (rawConsent) => {
  if (!isObject(rawConsent)) return null;
  return {
    version: CONSENT_VERSION,
    essential: true,
    analytics: Boolean(rawConsent.analytics),
    marketing: Boolean(rawConsent.marketing),
    externals: Boolean(rawConsent.externals),
    timestamp: rawConsent.timestamp || new Date().toISOString(),
  };
};

export const readCookieConsent = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return sanitizeConsent(parsed);
  } catch {
    return null;
  }
};

const persistCookieConsent = (nextConsent) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(nextConsent));
};

const emitConsentChangedEvent = (consent) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('bec:cookie-consent-updated', {
      detail: consent,
    }),
  );
};

export const useCookieConsent = () => {
  const [consent, setConsent] = useState(() => readCookieConsent());

  const optionalServices = useMemo(() => getOptionalCookieServices(), []);
  const hasNonEssentialCookies = useMemo(() => hasNonEssentialCookieServices(), []);
  const hasPreference = Boolean(consent);

  useEffect(() => {
    if (consent) applyConsentSideEffects(consent);
  }, [consent]);

  const saveConsent = useCallback((nextPartialConsent) => {
    const nextConsent = sanitizeConsent({
      ...defaultConsent,
      ...nextPartialConsent,
      timestamp: new Date().toISOString(),
    });
    setConsent(nextConsent);
    persistCookieConsent(nextConsent);
    applyConsentSideEffects(nextConsent);
    emitConsentChangedEvent(nextConsent);
    return nextConsent;
  }, []);

  const acceptAll = useCallback(
    () =>
      saveConsent({
        analytics: optionalServices.analytics,
        marketing: optionalServices.marketing,
        externals: optionalServices.externals,
      }),
    [optionalServices, saveConsent],
  );

  const rejectNonEssential = useCallback(
    () =>
      saveConsent({
        analytics: false,
        marketing: false,
        externals: false,
      }),
    [saveConsent],
  );

  return {
    consent: consent || defaultConsent,
    hasPreference,
    hasNonEssentialCookies,
    optionalServices,
    saveConsent,
    acceptAll,
    rejectNonEssential,
  };
};
