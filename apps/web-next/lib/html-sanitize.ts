const BLOCKED_TAGS = ['script', 'iframe', 'object', 'embed'];

export const sanitizeRenderedHtml = (html: string): string => {
  let out = String(html || '');

  // Remove blocked tags entirely.
  BLOCKED_TAGS.forEach((tag) => {
    const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    out = out.replace(re, '');
  });

  // Remove inline event handlers (onclick, onload, ...).
  out = out.replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '');
  out = out.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');

  // Neutralize javascript: URLs.
  out = out.replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"');

  return out;
};
