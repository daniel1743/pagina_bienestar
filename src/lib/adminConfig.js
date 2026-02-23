const STORAGE_KEYS = {
  globalSettings: 'admin_global_settings_v1',
  securitySettings: 'admin_security_settings_v1',
  actionLogs: 'admin_action_logs_v1',
  userAdminState: 'admin_user_state_v1',
  topicAdminState: 'admin_topic_state_v1',
  commentReplies: 'admin_comment_replies_v1',
  mediaLibrary: 'admin_media_library_v1',
  articleMeta: 'admin_article_meta_v1',
  editorialCalendar: 'admin_editorial_calendar_v1',
};

export const DEFAULT_GLOBAL_SETTINGS = {
  founderBio:
    'Mi propósito es construir el puente que falta entre el consultorio y tu casa. Traduzco la complejidad científica en herramientas prácticas para que puedas tomar el control informado de tu bienestar diario.',
  medicalDisclaimer:
    'Este sitio es informativo y no sustituye la consulta médica profesional, diagnóstico o tratamiento personalizado.',
  commentsEnabled: true,
  communityEnabled: true,
  primaryColor: '#10b981',
  defaultTheme: 'light',
  heroTitle: 'Entiende lo que está pasando en tu cuerpo, con claridad.',
  heroSubtitle:
    'Información sobre salud explicada con claridad y basada en fuentes confiables.',
};

export const DEFAULT_SECURITY_SETTINGS = {
  twoFactorEnabled: false,
  twoFactorCode: '',
  spamProtectionEnabled: true,
  maxLinksPerComment: 2,
  bannedWords: ['casino', 'apuesta', 'viagra', 'criptoganancias'],
  maxCommentsPerMinute: 3,
};

const safeRead = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const mergeWithObjectDefaults = (value, defaults) => {
  if (!value || typeof value !== 'object') return defaults;
  return { ...defaults, ...value };
};

export const getGlobalSettings = () =>
  mergeWithObjectDefaults(
    safeRead(STORAGE_KEYS.globalSettings, DEFAULT_GLOBAL_SETTINGS),
    DEFAULT_GLOBAL_SETTINGS,
  );

export const saveGlobalSettings = (nextSettings) => {
  const merged = mergeWithObjectDefaults(nextSettings, DEFAULT_GLOBAL_SETTINGS);
  safeWrite(STORAGE_KEYS.globalSettings, merged);
  return merged;
};

const hexToHslTriplet = (hex) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return null;
  const clean = hex.replace('#', '');
  const normalized =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const applyGlobalVisualSettings = (settings) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (settings?.primaryColor) {
    root.style.setProperty('--primary-color', settings.primaryColor);
    const hslTriplet = hexToHslTriplet(settings.primaryColor);
    if (hslTriplet) root.style.setProperty('--primary', hslTriplet);
  }
  if (settings?.defaultTheme === 'dark') {
    root.classList.add('dark');
    window.localStorage.setItem('appTheme', 'dark');
  } else if (settings?.defaultTheme === 'light') {
    root.classList.remove('dark');
    window.localStorage.setItem('appTheme', 'light');
  }
};

export const getSecuritySettings = () =>
  mergeWithObjectDefaults(
    safeRead(STORAGE_KEYS.securitySettings, DEFAULT_SECURITY_SETTINGS),
    DEFAULT_SECURITY_SETTINGS,
  );

export const saveSecuritySettings = (nextSettings) => {
  const merged = mergeWithObjectDefaults(nextSettings, DEFAULT_SECURITY_SETTINGS);
  safeWrite(STORAGE_KEYS.securitySettings, merged);
  return merged;
};

export const isTwoFactorVerified = () => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem('admin_2fa_verified') === '1';
};

export const setTwoFactorVerified = (isVerified) => {
  if (typeof window === 'undefined') return;
  if (isVerified) {
    window.sessionStorage.setItem('admin_2fa_verified', '1');
  } else {
    window.sessionStorage.removeItem('admin_2fa_verified');
  }
};

export const getActionLogs = () => safeRead(STORAGE_KEYS.actionLogs, []);

export const logAdminAction = (action, details = {}) => {
  const current = getActionLogs();
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    details,
    created_at: new Date().toISOString(),
  };
  const next = [item, ...current].slice(0, 400);
  safeWrite(STORAGE_KEYS.actionLogs, next);
  return item;
};

export const clearActionLogs = () => safeWrite(STORAGE_KEYS.actionLogs, []);

export const getAdminUserState = () => safeRead(STORAGE_KEYS.userAdminState, {});

export const saveAdminUserState = (userStateMap) =>
  safeWrite(STORAGE_KEYS.userAdminState, userStateMap || {});

export const getAdminTopicState = () => safeRead(STORAGE_KEYS.topicAdminState, {});

export const saveAdminTopicState = (topicStateMap) =>
  safeWrite(STORAGE_KEYS.topicAdminState, topicStateMap || {});

export const getCommentReplies = () => safeRead(STORAGE_KEYS.commentReplies, {});

export const saveCommentReplies = (replyMap) =>
  safeWrite(STORAGE_KEYS.commentReplies, replyMap || {});

export const getMediaLibrary = () => safeRead(STORAGE_KEYS.mediaLibrary, []);

export const saveMediaLibrary = (items) => safeWrite(STORAGE_KEYS.mediaLibrary, items || []);

export const getArticleMetaStore = () => safeRead(STORAGE_KEYS.articleMeta, {});

export const saveArticleMetaStore = (metaStore) =>
  safeWrite(STORAGE_KEYS.articleMeta, metaStore || {});

export const getEditorialCalendarEntries = () =>
  safeRead(STORAGE_KEYS.editorialCalendar, []);

export const saveEditorialCalendarEntries = (entries) =>
  safeWrite(STORAGE_KEYS.editorialCalendar, entries || []);

export const createCode6Digits = () =>
  String(Math.floor(100000 + Math.random() * 900000));
