const TEMP_BLOB_PREFIX = 'blob:';

export const isTemporaryObjectUrl = (value) =>
  String(value || '').trim().toLowerCase().startsWith(TEMP_BLOB_PREFIX);

export const normalizeSupabaseStorageObjectUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  // Fix malformed public bucket URLs:
  // /storage/v1/object/<bucket>/<path> -> /storage/v1/object/public/<bucket>/<path>
  return raw.replace(
    /(https?:\/\/[^/]+\/storage\/v1\/object\/)(?!public\/|sign\/|upload\/|authenticated\/)([^/?#]+)\/([^?#]+)/i,
    '$1public/$2/$3',
  );
};

export const resolveArticleImageUrl = (value) => {
  const raw = normalizeSupabaseStorageObjectUrl(value);
  if (!raw) return '';
  if (isTemporaryObjectUrl(raw)) return '';
  if (/^javascript:/i.test(raw)) return '';
  return raw;
};
