const TEMP_BLOB_PREFIX = 'blob:';

export const isTemporaryObjectUrl = (value) =>
  String(value || '').trim().toLowerCase().startsWith(TEMP_BLOB_PREFIX);

export const resolveArticleImageUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (isTemporaryObjectUrl(raw)) return '';
  if (/^javascript:/i.test(raw)) return '';
  return raw;
};
