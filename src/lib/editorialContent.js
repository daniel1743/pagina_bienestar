// TODO: sustituir por DOMPurify cuando el entorno permita instalar dependencias.
const ALLOWED_TAGS = new Set([
  'p',
  'h2',
  'h3',
  'h4',
  'strong',
  'em',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'code',
  'pre',
  'hr',
  'br',
  'figure',
  'figcaption',
  'img',
  'section',
  'span',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]);

const DANGEROUS_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'textarea',
  'select',
  'button',
  'meta',
  'link',
]);

const GLOBAL_ATTRS = new Set(['class']);
const TAG_ATTRS = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'class', 'data-display']),
  figure: new Set(['class']),
  figcaption: new Set(['class']),
  section: new Set(['class', 'data-editorial-callout']),
  span: new Set(['class', 'data-editorial-color']),
  code: new Set(['class']),
  pre: new Set(['class']),
  table: new Set(['class']),
  thead: new Set(['class']),
  tbody: new Set(['class']),
  tr: new Set(['class']),
  th: new Set(['class', 'colspan', 'rowspan']),
  td: new Set(['class', 'colspan', 'rowspan']),
};

const COLOR_RE = /^(#[0-9a-f]{3,8}|rgb(a)?\([\d\s,.%+-]+\)|hsl(a)?\([\d\s,.%+-]+\)|[a-z]+)$/i;
const CLASS_RE = /^[a-z0-9:_\-\s]+$/i;
const HTML_TAG_RE = /<\s*[a-z][^>]*>/i;
const ESCAPED_HTML_RE = /&lt;\s*[a-z][^&]*&gt;/i;

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const decodeHtmlEntities = (value) => {
  if (!value || typeof document === 'undefined') return String(value || '');
  if (!ESCAPED_HTML_RE.test(value)) return value;
  const el = document.createElement('textarea');
  el.innerHTML = value;
  return el.value;
};

const normalizeHeadings = (value) =>
  value.replace(/<h1(\s[^>]*)?>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');

const toHtmlParagraphs = (plainText) => {
  const blocks = String(plainText || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!blocks.length) return '<p></p>';
  return blocks
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

const isInternalHref = (href) =>
  href.startsWith('/') || href.startsWith('#') || href.startsWith('./') || href.startsWith('../');

const hasBlockedScheme = (value) => {
  const compact = String(value || '')
    .toLowerCase()
    .replace(/[\u0000-\u0020]+/g, '');
  return compact.startsWith('javascript:') || compact.startsWith('vbscript:') || compact.startsWith('data:text/html');
};

const sanitizeUrl = (value, { allowImageData = false } = {}) => {
  const raw = String(value || '').trim();
  if (!raw || hasBlockedScheme(raw)) return null;
  if (isInternalHref(raw)) return raw;
  if (allowImageData && raw.startsWith('data:image/')) return raw;
  if (raw.startsWith('blob:')) return raw;

  try {
    const parsed = new URL(raw, window.location.origin);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return raw;
  } catch {
    return null;
  }
  return null;
};

const sanitizeColor = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  return COLOR_RE.test(raw) ? raw : null;
};

const sanitizeClassAttr = (value) => {
  const raw = String(value || '').trim();
  if (!raw || !CLASS_RE.test(raw)) return null;
  return raw;
};

const sanitizeAttributes = (element) => {
  const tag = element.tagName.toLowerCase();
  const tagAttrs = TAG_ATTRS[tag] || new Set();

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    const isAllowed = GLOBAL_ATTRS.has(name) || tagAttrs.has(name);
    if (!isAllowed || name.startsWith('on') || name === 'style') {
      element.removeAttribute(attribute.name);
      return;
    }
    if (name === 'class') {
      const sanitized = sanitizeClassAttr(attribute.value);
      if (!sanitized) element.removeAttribute(attribute.name);
      else element.setAttribute('class', sanitized);
    }
  });

  if (tag === 'a') {
    const href = sanitizeUrl(element.getAttribute('href'));
    if (!href) {
      element.removeAttribute('href');
      element.removeAttribute('target');
      element.removeAttribute('rel');
    } else {
      element.setAttribute('href', href);
      const openInNewTab = element.getAttribute('target') === '_blank' || !isInternalHref(href);
      if (openInNewTab) {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      } else {
        element.removeAttribute('target');
        element.removeAttribute('rel');
      }
    }
  }

  if (tag === 'img') {
    const src = sanitizeUrl(element.getAttribute('src'), { allowImageData: true });
    if (!src) {
      element.remove();
      return;
    }
    element.setAttribute('src', src);
    element.setAttribute('loading', 'lazy');
    element.setAttribute('decoding', 'async');
    if (!element.hasAttribute('alt')) element.setAttribute('alt', 'Imagen');

    ['width', 'height'].forEach((sizeAttr) => {
      const raw = element.getAttribute(sizeAttr);
      if (!raw) return;
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 4000) {
        element.removeAttribute(sizeAttr);
      } else {
        element.setAttribute(sizeAttr, String(parsed));
      }
    });
  }

  if (tag === 'th' || tag === 'td') {
    ['colspan', 'rowspan'].forEach((spanAttr) => {
      const raw = element.getAttribute(spanAttr);
      if (!raw) return;
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 12) {
        element.removeAttribute(spanAttr);
      } else {
        element.setAttribute(spanAttr, String(parsed));
      }
    });
  }

  if (tag === 'span') {
    const safeColor = sanitizeColor(element.getAttribute('data-editorial-color'));
    if (safeColor) {
      element.setAttribute('data-editorial-color', safeColor);
      element.setAttribute('style', `color: ${safeColor};`);
    } else {
      element.removeAttribute('data-editorial-color');
    }
  }

  if (tag === 'section') {
    const tone = element.getAttribute('data-editorial-callout');
    if (tone && tone !== 'summary' && tone !== 'warning') {
      element.setAttribute('data-editorial-callout', 'summary');
    }
  }
};

const sanitizeNode = (node) => {
  if (!node) return;
  const nodeType = node.nodeType;

  if (nodeType === 8) {
    node.remove();
    return;
  }

  if (nodeType !== 1) return;

  const tag = node.tagName.toLowerCase();
  if (DANGEROUS_TAGS.has(tag)) {
    node.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const parent = node.parentNode;
    if (!parent) {
      node.remove();
      return;
    }
    const movedChildren = Array.from(node.childNodes);
    movedChildren.forEach((child) => parent.insertBefore(child, node));
    node.remove();
    movedChildren.forEach((child) => sanitizeNode(child));
    return;
  }

  sanitizeAttributes(node);
  Array.from(node.childNodes).forEach((child) => sanitizeNode(child));
};

export const normalizeEditorialHtml = (inputHtml) => {
  const raw = String(inputHtml || '').trim();
  if (!raw) return '<p></p>';
  const decoded = decodeHtmlEntities(raw);
  const withHtml = HTML_TAG_RE.test(decoded) ? decoded : toHtmlParagraphs(decoded);
  return normalizeHeadings(withHtml);
};

export const sanitizeEditorialHtml = (inputHtml) => {
  const normalized = normalizeEditorialHtml(inputHtml);
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return normalized;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${normalized}</body>`, 'text/html');
  const body = doc.body;
  Array.from(body.childNodes).forEach((node) => sanitizeNode(node));
  const sanitized = body.innerHTML.trim();
  return sanitized || '<p></p>';
};

export const getEditorialContentDiagnostics = (inputHtml) => {
  const raw = String(inputHtml || '');
  const normalized = normalizeEditorialHtml(raw);
  const sanitized = sanitizeEditorialHtml(normalized);
  const format = ESCAPED_HTML_RE.test(raw)
    ? 'escaped_html'
    : HTML_TAG_RE.test(raw)
      ? 'html'
      : 'plain_text';
  const count = (tag) => (sanitized.match(new RegExp(`<${tag}(\\s|>)`, 'gi')) || []).length;

  return {
    format,
    rawLength: raw.length,
    sanitizedLength: sanitized.length,
    h2: count('h2'),
    h3: count('h3'),
    ul: count('ul'),
    ol: count('ol'),
    blockquote: count('blockquote'),
    code: count('code'),
    img: count('img'),
    sanitizedHtml: sanitized,
  };
};
