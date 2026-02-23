import { Buffer } from 'node:buffer';
import sharp from 'npm:sharp@0.33.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const slugify = (value: string) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const body = await req.json();
    const {
      imageBase64,
      fileName = 'imagen-editorial',
      fileType = '',
      maxBytes = 300 * 1024,
      maxWidth = 1600,
      qualityStart = 80,
      qualityMin = 60,
    } = body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return jsonResponse(400, { error: 'imageBase64 es obligatorio' });
    }
    if (!String(fileType).startsWith('image/')) {
      return jsonResponse(400, { error: 'Tipo MIME inválido. Solo se permiten imágenes.' });
    }

    const safeMaxBytes = clamp(Number(maxBytes) || 300 * 1024, 50 * 1024, 1024 * 1024);
    const safeMaxWidth = clamp(Number(maxWidth) || 1600, 320, 4000);
    const safeQualityStart = clamp(Number(qualityStart) || 80, 60, 95);
    const safeQualityMin = clamp(Number(qualityMin) || 60, 40, safeQualityStart);

    const inputBuffer = Buffer.from(imageBase64, 'base64');
    if (!inputBuffer.length) {
      return jsonResponse(400, { error: 'Buffer vacío o base64 inválido.' });
    }

    let quality = safeQualityStart;
    let resultBuffer: Buffer | null = null;
    let resultInfo: { width: number; height: number } | null = null;

    while (quality >= safeQualityMin) {
      const { data, info } = await sharp(inputBuffer)
        .rotate()
        .resize({ width: safeMaxWidth, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality })
        .toBuffer({ resolveWithObject: true });

      resultBuffer = data;
      resultInfo = { width: info.width, height: info.height };
      if (data.length <= safeMaxBytes) break;
      quality -= 5;
    }

    if (!resultBuffer || !resultInfo || resultBuffer.length > safeMaxBytes || quality < safeQualityMin) {
      return jsonResponse(422, {
        error: 'No se pudo comprimir la imagen debajo de 300KB con calidad mínima del 60%.',
      });
    }

    const finalName = `${slugify(String(fileName).replace(/\.[^/.]+$/, '')) || 'imagen-editorial'}.webp`;

    return jsonResponse(200, {
      ok: true,
      fileName: finalName,
      contentType: 'image/webp',
      sizeBytes: resultBuffer.length,
      width: resultInfo.width,
      height: resultInfo.height,
      quality: quality / 100,
      base64: resultBuffer.toString('base64'),
    });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Fallo interno en optimización de imagen.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
