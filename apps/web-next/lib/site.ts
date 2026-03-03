export const site = {
  name: 'Bienestar en Claro',
  defaultUrl: (process.env.SITE_URL || 'https://bienestarenclaro.com').replace(/\/$/, ''),
  defaultDescription: 'Información clara basada en evidencia para cuidar tu salud y bienestar.',
  defaultImage: '/branding/logo-horizontal.png',
};

export const toPublicUrl = (value?: string | null): string => {
  const raw = String(value || '').trim();
  if (!raw) return `${site.defaultUrl}${site.defaultImage}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${site.defaultUrl}${raw}`;
  return `${site.defaultUrl}/${raw}`;
};

export const toCanonical = (slug: string, candidate?: string | null): string => {
  const raw = String(candidate || '').trim();
  if (!raw) return `${site.defaultUrl}/articulos/${slug}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${site.defaultUrl}${raw}`;
  return `https://${raw}`;
};
