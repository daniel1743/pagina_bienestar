import { supabase } from '@/lib/customSupabaseClient';

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

  const { error: uploadError } = await supabase.storage
    .from(ARTICLE_IMAGE_BUCKET)
    .upload(storagePath, file, {
      upsert: false,
      contentType: file.type || `image/${ext}`,
      cacheControl: '31536000',
    });
  if (uploadError) {
    throw new Error(uploadError.message || 'No se pudo subir imagen a Storage.');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(ARTICLE_IMAGE_BUCKET).getPublicUrl(storagePath);

  if (!publicUrl) {
    throw new Error('No se pudo resolver la URL pública de la imagen.');
  }

  return { publicUrl, storagePath, bucket: ARTICLE_IMAGE_BUCKET };
};
