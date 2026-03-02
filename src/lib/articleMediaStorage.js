import { supabase } from '@/lib/customSupabaseClient';
import { normalizeSupabaseStorageObjectUrl } from '@/lib/articleImage';

export const ARTICLE_IMAGE_BUCKET = 'article-images';

const normalizePathToken = (value, fallback = 'draft') => {
  const normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || fallback;
};

const inferExt = (file) => {
  const mime = String(file?.type || '').toLowerCase();
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  return 'webp';
};

export const isDataImageUrl = (value) => /^data:image\//i.test(String(value || '').trim());

export const uploadImageToStorage = async (file, options = {}) => {
  if (!(file instanceof File)) {
    throw new Error('Archivo de imagen inválido para Storage.');
  }

  const slug = normalizePathToken(options.slug, 'articulo');
  const kind = normalizePathToken(options.kind, 'inline');
  const ext = inferExt(file);
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const fileName = `${stamp}-${rand}.${ext}`;
  const storagePath = `articles/${slug}/${kind}/${fileName}`;

  let uploadError = null;
  try {
    const { error } = await supabase.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .upload(storagePath, file, {
        upsert: false,
        contentType: file.type || `image/${ext}`,
        cacheControl: '31536000',
      });
    uploadError = error;
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('failed to fetch') || message.includes('name_not_resolved')) {
      throw new Error('No se pudo conectar con Supabase Storage (DNS/red). Revisa conexión o dominio.');
    }
    throw error;
  }
  if (uploadError) {
    const message = String(uploadError.message || '').toLowerCase();
    if (
      message.includes('row-level security') ||
      message.includes('violates row-level security policy') ||
      String(uploadError.statusCode || '') === '403'
    ) {
      throw new Error(
        'No autorizado para subir a Storage. Inicia sesión o ajusta policies del bucket article-images.',
      );
    }
    throw new Error(uploadError.message || 'No se pudo subir imagen a Storage.');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(ARTICLE_IMAGE_BUCKET).getPublicUrl(storagePath);

  if (!publicUrl) {
    throw new Error('No se pudo resolver la URL pública de la imagen.');
  }

  return {
    publicUrl: normalizeSupabaseStorageObjectUrl(publicUrl),
    storagePath,
    bucket: ARTICLE_IMAGE_BUCKET,
  };
};
