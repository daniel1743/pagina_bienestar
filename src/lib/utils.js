import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

/** Recorta imagen a aspect ratio y devuelve Blob (JPEG 0.9) */
export async function cropImageToAspect(file, aspectRatio = 1, maxSize = 800) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const w = img.width;
			const h = img.height;
			let sw, sh, sx, sy;
			const currentRatio = w / h;
			if (currentRatio > aspectRatio) {
				sh = h;
				sw = h * aspectRatio;
				sx = (w - sw) / 2;
				sy = 0;
			} else {
				sw = w;
				sh = w / aspectRatio;
				sx = 0;
				sy = (h - sh) / 2;
			}
			const outSize = Math.min(sw, sh, maxSize);
			canvas.width = aspectRatio >= 1 ? outSize : outSize * aspectRatio;
			canvas.height = aspectRatio >= 1 ? outSize / aspectRatio : outSize;
			ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
			canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
		};
		img.onerror = () => reject(new Error('Error al cargar la imagen'));
		img.src = URL.createObjectURL(file);
	});
}

const ALLOWED_LINK_PROTOCOLS = ['https:', 'http:'];
const ALLOWED_SOCIAL_DOMAINS = {
	instagram: ['instagram.com', 'www.instagram.com'],
	linkedin: ['linkedin.com', 'www.linkedin.com'],
	youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'],
	website: null,
};

export function validateSocialUrl(key, value) {
	if (!value || !value.trim()) return { valid: true };
	try {
		const url = new URL(value.trim());
		if (!ALLOWED_LINK_PROTOCOLS.includes(url.protocol)) return { valid: false, message: 'Solo se permiten enlaces https o http.' };
		if (key === 'website') return { valid: true };
		const domains = ALLOWED_SOCIAL_DOMAINS[key];
		if (!domains) return { valid: true };
		const host = url.hostname.toLowerCase();
		const ok = domains.some(d => host === d || host.endsWith('.' + d));
		if (!ok) return { valid: false, message: `El enlace debe ser de ${key}.` };
		return { valid: true };
	} catch {
		return { valid: false, message: 'URL no válida.' };
	}
}