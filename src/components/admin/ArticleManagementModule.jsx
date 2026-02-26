import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  getArticleMetaStore,
  getMediaLibrary,
  logAdminAction,
  saveArticleMetaStore,
  saveMediaLibrary,
} from '@/lib/adminConfig';
import { refreshSitemapAfterPublish } from '@/lib/sitemapRefresh';
import { resolveArticleImageUrl } from '@/lib/articleImage';
import {
  getEditorialContentDiagnostics,
  sanitizeEditorialHtml,
} from '@/lib/editorialContent';
import { LOCAL_PUBLISHED_ARTICLES } from '@/content/localPublishedArticles';
import EditorialUnderline from '@/components/admin/editorExtensions/EditorialUnderline';
import EditorialColor from '@/components/admin/editorExtensions/EditorialColor';
import EditorialCallout from '@/components/admin/editorExtensions/EditorialCallout';
import EditorialImage from '@/components/admin/editorExtensions/EditorialImage';
import {
  AlertTriangle,
  Bold,
  CheckSquare,
  Code2,
  Copy,
  Eye,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Palette,
  Plus,
  Quote,
  Save,
  Search,
  Strikethrough,
  Table2,
  Trash2,
  Underline,
} from 'lucide-react';

const STATUS = ['draft', 'review', 'scheduled', 'published'];
const CATEGORIES = ['General', 'Hígado', 'Digestión', 'Metabolismo', 'Inflamación', 'Nutrición'];
const COLORS = ['#1d4ed8', '#334155'];
const FORMAT_LABELS = { html: 'HTML', escaped_html: 'HTML escapado', plain_text: 'Texto plano' };
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 300 * 1024;
const MAX_IMAGE_WIDTH = 1600;
const IMAGE_QUALITY_START = 0.8;
const IMAGE_QUALITY_MIN = 0.6;
const WEBP_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;
const AUTHOR_SIGNATURES = {
  brand: { key: 'brand', name: 'Bienestar en Claro', avatar: '/branding/monogram-bc-180.png' },
  daniel: { key: 'daniel', name: 'Daniel Falcón', avatar: '/images/DANIEL_FALCON.jpeg' },
};

const emptyForm = {
  id: null, title: '', subtitle: '', slug: '', category: 'General', tags: '', status: 'draft',
  scheduledAt: '', authorName: 'Bienestar en Claro', authorSignature: 'brand', authorBio: '', featuredImage: '', videoEmbed: '',
  externalLinks: [''], metaTitle: '', metaDescription: '', focusKeyword: '', secondaryKeywords: '',
  canonical: '', noIndex: false, content: '<p>Escribe tu contenido...</p>',
};

const slugify = (text) => (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
const normalizeAuthorName = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
const inferAuthorSignature = (authorName) => {
  const normalized = normalizeAuthorName(authorName);
  if (normalized.includes('daniel')) return 'daniel';
  return 'brand';
};
const normalizeStatus = (value) => (['published', 'publicado'].includes((value || '').toLowerCase()) ? 'published' : ['scheduled', 'programado'].includes((value || '').toLowerCase()) ? 'scheduled' : ['review', 'en_revision', 'revision'].includes((value || '').toLowerCase()) ? 'review' : 'draft');
const safeRead = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) ?? fallback : fallback; } catch { return fallback; } };
const safeWrite = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const toDataUrl = (file) => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result || '')); r.onerror = () => reject(new Error('No se pudo leer la imagen.')); r.readAsDataURL(file); });
const fileToBase64 = async (file) => {
  const dataUrl = await toDataUrl(file);
  const parts = dataUrl.split(',');
  return parts[1] || '';
};
const base64ToBlob = (base64, mime = 'image/webp') => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};
const countImages = (node) => !node ? 0 : (node.type === 'image' ? 1 : 0) + (Array.isArray(node.content) ? node.content.reduce((a, b) => a + countImages(b), 0) : 0);
const btn = (active = false) => `h-9 min-w-9 px-2 inline-flex items-center justify-center rounded-md border transition ${active ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-100' : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'}`;
const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const normalizeLinkValue = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (
    value.startsWith('/') ||
    value.startsWith('#') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:')
  ) {
    return value;
  }
  return `https://${value}`;
};
const isInternalUrl = (url) =>
  url.startsWith('/') || url.startsWith('#') || url.startsWith('./') || url.startsWith('../');
const seoWebpName = (raw) => `${slugify((raw || '').replace(/\.[^/.]+$/, '')) || 'imagen-editorial'}.webp`;
const defaultAltFromFileName = (rawName) => {
  const cleaned = slugify((rawName || '').replace(/\.[^/.]+$/, '')).replace(/-/g, ' ').trim();
  if (!cleaned) return 'Imagen editorial';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};
const canvasToWebpBlob = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar imagen WebP.'));
          return;
        }
        resolve(blob);
      },
      'image/webp',
      quality,
    );
  });
const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo procesar el archivo de imagen.'));
    };
    image.src = url;
  });
const optimizeToEditorialWebp = async (file) => {
  if (!file?.type || !file.type.startsWith('image/')) {
    throw new Error('Archivo inválido: solo se permiten imágenes.');
  }

  const image = await loadImageElement(file);
  const sourceWidth = image.naturalWidth || image.width || 0;
  const sourceHeight = image.naturalHeight || image.height || 0;
  if (!sourceWidth || !sourceHeight) {
    throw new Error('No se pudieron leer dimensiones de la imagen.');
  }

  const targetWidth = Math.min(sourceWidth, MAX_IMAGE_WIDTH);
  const targetHeight = Math.round((sourceHeight / sourceWidth) * targetWidth);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No se pudo inicializar compresión de imagen.');
  }
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  let quality = IMAGE_QUALITY_START;
  let usedQuality = quality;
  let blob = null;
  while (quality >= IMAGE_QUALITY_MIN) {
    // Compresión progresiva: 80% -> 60%
    blob = await canvasToWebpBlob(canvas, quality);
    usedQuality = quality;
    if (blob.size <= MAX_IMAGE_BYTES) break;
    quality -= 0.05;
  }

  if (!blob || blob.size > MAX_IMAGE_BYTES || usedQuality < IMAGE_QUALITY_MIN) {
    throw new Error('No se pudo comprimir la imagen debajo de 300KB (mínimo 60% de calidad).');
  }

  return { blob, width: targetWidth, height: targetHeight, quality: Number(usedQuality.toFixed(2)) };
};

const optimizeToWebpWithEdgeFunction = async (file) => {
  const functionName = import.meta.env.VITE_IMAGE_OPTIMIZER_FUNCTION_NAME;
  if (!functionName) return null;
  const imageBase64 = await fileToBase64(file);
  const payload = {
    imageBase64,
    fileName: file.name,
    fileType: file.type,
    maxBytes: MAX_IMAGE_BYTES,
    maxWidth: MAX_IMAGE_WIDTH,
    qualityStart: Math.round(IMAGE_QUALITY_START * 100),
    qualityMin: Math.round(IMAGE_QUALITY_MIN * 100),
  };
  const { data, error } = await supabase.functions.invoke(functionName, { body: payload });
  if (error) throw new Error(error.message || 'Falló la optimización en servidor.');
  if (!data?.base64) throw new Error('Respuesta inválida desde optimizador de servidor.');
  const blob = base64ToBlob(data.base64, data.contentType || 'image/webp');
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error('El servidor devolvió una imagen mayor a 300KB.');
  }
  const optimizedFile = new File([blob], data.fileName || seoWebpName(file.name), {
    type: data.contentType || 'image/webp',
    lastModified: Date.now(),
  });
  return {
    file: optimizedFile,
    bytes: blob.size,
    width: Number(data.width || 0),
    height: Number(data.height || 0),
    quality: Number(data.quality || IMAGE_QUALITY_START),
    mode: 'server',
  };
};

const ArticleManagementModule = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState(getMediaLibrary());
  const [autosaveInfo, setAutosaveInfo] = useState('Sin cambios');
  const [linkDraft, setLinkDraft] = useState({ url: '', newTab: false });
  const [internalFile, setInternalFile] = useState(null);
  const [internalPreview, setInternalPreview] = useState('');
  const [internalAlt, setInternalAlt] = useState('');
  const [internalCaption, setInternalCaption] = useState('');
  const [internalDisplay, setInternalDisplay] = useState('full');
  const [isOptimizingInternalImage, setIsOptimizingInternalImage] = useState(false);
  const [optimizedInternalInfo, setOptimizedInternalInfo] = useState(null);
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });
  const quickImageInputRef = useRef(null);
  const lastSelectionRef = useRef(null);
  const contextMenuRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ autolink: true, openOnClick: false, linkOnPaste: true }),
      EditorialUnderline, EditorialColor, EditorialCallout, EditorialImage,
      Table.configure({ resizable: true }), TableRow, TableCell, TableHeader,
    ],
    content: sanitizeEditorialHtml(form.content),
    onUpdate: ({ editor: ed }) => setForm((p) => ({ ...p, content: ed.getHTML() })),
    onCreate: ({ editor: ed }) => {
      lastSelectionRef.current = ed.state.selection.from;
    },
    onSelectionUpdate: ({ editor: ed }) => {
      lastSelectionRef.current = ed.state.selection.from;
    },
  });

  const loadData = async () => {
    const meta = getArticleMetaStore();
    const { data: rows } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    const remote = (rows || []).map((a) => {
      const normalizedSlug = slugify(a.slug || '');
      const m = meta[String(a.id)] || (normalizedSlug ? meta[`slug:${normalizedSlug}`] : null) || {};
      const authorName = m.authorName || a.author || 'Bienestar en Claro';
      return {
        ...emptyForm,
        ...m,
        id: a.id,
        title: a.title || '',
        subtitle: m.subtitle ?? a.excerpt ?? '',
        slug: a.slug || '',
        category: m.category ?? a.category ?? 'General',
        status: normalizeStatus(m.status || a.status),
        authorName,
        authorSignature: m.authorSignature || inferAuthorSignature(authorName),
        featuredImage: resolveArticleImageUrl(m.featuredImage || a.image_url || ''),
        content: sanitizeEditorialHtml(m.content || a.content || '<p>Sin contenido</p>'),
      };
    });
    const dbSlugs = new Set(remote.map((a) => a.slug));
    const local = LOCAL_PUBLISHED_ARTICLES.filter((a) => !dbSlugs.has(a.slug)).map((a) => {
      const authorName = a.author || 'Bienestar en Claro';
      const normalizedSlug = slugify(a.slug || '');
      const m = (normalizedSlug ? meta[`slug:${normalizedSlug}`] : null) || {};
      return {
        ...emptyForm,
        ...m,
        id: a.id,
        title: a.title,
        subtitle: a.excerpt,
        slug: a.slug,
        category: a.category || 'General',
        status: 'published',
        authorName,
        authorSignature: inferAuthorSignature(authorName),
        featuredImage: resolveArticleImageUrl(a.image_url || ''),
        content: sanitizeEditorialHtml(a.content || '<p>Sin contenido</p>'),
        localOnly: true,
      };
    });
    setArticles([...local, ...remote]);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!editor) return;
    const normalized = sanitizeEditorialHtml(form.content || '<p></p>');
    if (editor.getHTML() !== normalized) editor.commands.setContent(normalized, false);
  }, [editor, form.id, form.content]);
  useEffect(() => { if (!form.slug && form.title) setForm((p) => ({ ...p, slug: slugify(p.title) })); }, [form.title, form.slug]);
  useEffect(() => { if (!form.title && !form.content) return; setAutosaveInfo('Autosave en progreso...'); const t = setTimeout(() => { safeWrite(`admin_article_autosave_${form.id || form.slug || 'new'}`, { ...form, autosavedAt: new Date().toISOString() }); setAutosaveInfo(`Autosave ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`); }, 6000); return () => clearTimeout(t); }, [form]);
  useEffect(() => () => {
    if (internalPreview && internalPreview.startsWith('blob:')) URL.revokeObjectURL(internalPreview);
  }, [internalPreview]);
  useEffect(() => {
    if (!contextMenu.open) return undefined;
    const handleOutsideClick = (event) => {
      if (contextMenuRef.current?.contains(event.target)) return;
      setContextMenu((prev) => ({ ...prev, open: false }));
    };
    const handleEsc = (event) => {
      if (event.key === 'Escape') setContextMenu((prev) => ({ ...prev, open: false }));
    };
    const closeMenu = () => setContextMenu((prev) => ({ ...prev, open: false }));

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [contextMenu.open]);

  const filtered = useMemo(() => articles.filter((a) => (a.title || '').toLowerCase().includes(search.toLowerCase()) && (statusFilter === 'all' || a.status === statusFilter)), [articles, search, statusFilter]);
  const contentDiagnostics = useMemo(
    () => getEditorialContentDiagnostics(form.content || ''),
    [form.content],
  );
  const safePreviewHtml = useMemo(
    () => sanitizeEditorialHtml(form.content || '<p>Sin contenido.</p>'),
    [form.content],
  );

  const clearInternalImageDraft = () => {
    setInternalFile(null);
    setInternalAlt('');
    setInternalCaption('');
    setInternalDisplay('full');
    setOptimizedInternalInfo(null);
    setInternalPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return '';
    });
  };

  const buildRemoteDraft = (row) => {
    if (!row) return null;
    const authorName = row.author || 'Bienestar en Claro';
    return {
      ...emptyForm,
      id: row.id,
      title: row.title || '',
      subtitle: row.excerpt || '',
      slug: row.slug || '',
      category: row.category || 'General',
      status: normalizeStatus(row.status),
      authorName,
      authorSignature: inferAuthorSignature(authorName),
      featuredImage: resolveArticleImageUrl(row.image_url || ''),
      content: sanitizeEditorialHtml(row.content || '<p>Sin contenido</p>'),
    };
  };

  const openArticle = async (article) => {
    const normalizedSlug = slugify(article?.slug || '');
    const metaStore = getArticleMetaStore();
    const metaById = metaStore[String(article?.id)] || {};
    const metaBySlug = normalizedSlug ? metaStore[`slug:${normalizedSlug}`] || {} : {};

    let remoteDraft = null;
    if (article?.id && !String(article.id).startsWith('local-')) {
      try {
        const { data, error } = await supabase.from('articles').select('*').eq('id', article.id).maybeSingle();
        if (error) throw error;
        remoteDraft = buildRemoteDraft(data);
      } catch {
        remoteDraft = null;
      }
    }

    const source = {
      ...emptyForm,
      ...article,
      ...(remoteDraft || {}),
      ...metaBySlug,
      ...metaById,
    };
    const autosaveKey = `admin_article_autosave_${source.id || source.slug || 'new'}`;
    const autosaved = safeRead(autosaveKey, null);
    const next =
      autosaved && window.confirm('Se encontró autosave. ¿Restaurar?')
        ? { ...source, ...autosaved }
        : source;

    setForm({
      ...next,
      slug: slugify(next.slug || next.title),
      featuredImage: resolveArticleImageUrl(next.featuredImage || next.image_url || ''),
      content: sanitizeEditorialHtml(next.content || '<p></p>'),
    });
    setShowPreview(false);
    setLinkDraft({ url: '', newTab: false });
    setContextMenu({ open: false, x: 0, y: 0 });
    clearInternalImageDraft();
  };

  const persistMeta = (id, payload) => {
    const store = getArticleMetaStore();
    const normalizedSlug = slugify(payload?.slug || '');
    const resolvedId = id || payload?.id || null;
    if (resolvedId) {
      Object.keys(store).forEach((key) => {
        if (!key.startsWith('slug:')) return;
        if (String(store[key]?.id || '') === String(resolvedId) && key !== `slug:${normalizedSlug}`) {
          delete store[key];
        }
      });
      store[String(resolvedId)] = payload;
    }
    if (normalizedSlug) store[`slug:${normalizedSlug}`] = { ...payload, id: resolvedId };
    saveArticleMetaStore(store);
  };

  const saveArticle = async (overrides = {}) => {
    const workingForm = { ...form, ...overrides };
    if (!workingForm.title.trim() || !workingForm.slug.trim()) { toast({ title: 'Título y slug obligatorios', variant: 'destructive' }); return; }
    if (workingForm.metaTitle.length > 60 || workingForm.metaDescription.length > 160) toast({ title: 'Advertencia SEO', description: 'Meta title recomendado: hasta 60 caracteres. Meta description: hasta 160.' });
    const slug = slugify(workingForm.slug);
    const raw = editor?.getHTML() || workingForm.content;
    const content = sanitizeEditorialHtml(raw);
    const resolvedSignature = AUTHOR_SIGNATURES[workingForm.authorSignature] ? workingForm.authorSignature : inferAuthorSignature(workingForm.authorName);
    const resolvedAuthorName =
      AUTHOR_SIGNATURES[resolvedSignature]?.name || workingForm.authorName || 'Bienestar en Claro';
    if (/<h1[\s>]/i.test(raw)) toast({ title: 'H1 ajustado', description: 'En el cuerpo se reemplazó H1 por H2 automáticamente.' });
    const safeFeaturedImage = resolveArticleImageUrl(workingForm.featuredImage || '');
    if (workingForm.featuredImage && !safeFeaturedImage) {
      toast({
        title: 'Imagen destacada temporal detectada',
        description: 'La imagen anterior era temporal. Vuelve a subirla para guardarla de forma permanente.',
        variant: 'destructive',
      });
    }
    const payload = {
      title: workingForm.title,
      slug,
      excerpt: workingForm.subtitle,
      content,
      category: workingForm.category,
      image_url: safeFeaturedImage || null,
      author: resolvedAuthorName,
      status: workingForm.status,
      published_at:
        workingForm.status === 'published'
          ? new Date().toISOString()
          : workingForm.scheduledAt
            ? new Date(workingForm.scheduledAt).toISOString()
            : null,
    };
    let id = workingForm.id; let savedRemotely = false;
    const shouldUpdate = Boolean(workingForm.id) && !String(workingForm.id).startsWith('local-');
    if (shouldUpdate) {
      let { error } = await supabase.from('articles').update(payload).eq('id', workingForm.id);
      if (error && error.message?.toLowerCase().includes('status')) { const { status, ...without } = payload; ({ error } = await supabase.from('articles').update(without).eq('id', workingForm.id)); }
      if (error) toast({ title: 'Guardado remoto falló', description: error.message, variant: 'destructive' }); else savedRemotely = true;
    } else {
      let { data, error } = await supabase.from('articles').insert([payload]).select('id').single();
      if (error && error.message?.toLowerCase().includes('status')) { const { status, ...without } = payload; ({ data, error } = await supabase.from('articles').insert([without]).select('id').single()); }
      if (error) { id = `local-${Date.now()}`; toast({ title: 'Guardado local', description: 'No se pudo guardar en Supabase.', variant: 'destructive' }); } else { id = data.id; savedRemotely = true; }
    }
    const next = {
      ...workingForm,
      id,
      slug,
      content,
      featuredImage: safeFeaturedImage || '',
      authorSignature: resolvedSignature,
      authorName: resolvedAuthorName,
      localOnly: String(id).startsWith('local-'),
    };
    persistMeta(id, next); logAdminAction('Artículo guardado', { id, title: workingForm.title }); toast({ title: workingForm.status === 'published' ? 'Artículo publicado' : 'Artículo guardado' });
    if (savedRemotely && workingForm.status === 'published') {
      try { const r = await refreshSitemapAfterPublish(); toast({ title: r.mode === 'build-only' ? 'Artículo publicado' : 'Sitemap actualizado', description: r.mode === 'build-only' ? 'El sitemap se actualizará en el próximo deploy/build.' : 'Se disparó actualización automática.' }); } catch { toast({ title: 'Artículo publicado', description: 'No se pudo disparar refresh remoto del sitemap. Se actualizará en el próximo deploy.', variant: 'destructive' }); }
    }
    setForm(next); await loadData();
  };

  const publishArticleNow = async () => {
    await saveArticle({ status: 'published', scheduledAt: '' });
  };

  const deleteArticle = async (article) => {
    if (!window.confirm(`Eliminar ${article.title}?`)) return;
    if (!String(article.id).startsWith('local-')) await supabase.from('articles').delete().eq('id', article.id);
    const store = getArticleMetaStore();
    delete store[String(article.id)];
    const normalizedSlug = slugify(article?.slug || '');
    if (normalizedSlug) delete store[`slug:${normalizedSlug}`];
    saveArticleMetaStore(store);
    setArticles((prev) => prev.filter((a) => String(a.id) !== String(article.id))); if (String(form.id) === String(article.id)) setForm({ ...emptyForm });
  };

  const duplicate = (article) =>
    setForm({
      ...article,
      id: null,
      title: `${article.title} (Copia)`,
      slug: `${article.slug}-copia-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      featuredImage: resolveArticleImageUrl(article.featuredImage || article.image_url || ''),
    });
  const updateExternalLink = (index, value) => { const next = [...form.externalLinks]; next[index] = value; setForm((p) => ({ ...p, externalLinks: next })); };
  const uploadFeatured = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const optimizedResult = await optimizeInternalImageFile(file, { showServerFallbackToast: false });
      const persistentUrl = await toDataUrl(optimizedResult.file);
      setForm((p) => ({ ...p, featuredImage: persistentUrl }));
      setMediaLibrary((prev) => {
        const next = [
          {
            id: `${Date.now()}`,
            url: persistentUrl,
            alt: defaultAltFromFileName(file.name),
            name: optimizedResult.file.name || file.name,
          },
          ...prev,
        ].slice(0, 120);
        saveMediaLibrary(next);
        return next;
      });
      toast({
        title: 'Imagen destacada optimizada',
        description: `${(optimizedResult.bytes / 1024).toFixed(1)}KB · WebP`,
      });
    } catch (error) {
      toast({
        title: 'No se pudo procesar la imagen destacada',
        description: error.message || 'Intenta con otra imagen.',
        variant: 'destructive',
      });
    } finally {
      event.target.value = '';
    }
  };

  const closeContextMenu = () => setContextMenu((prev) => ({ ...prev, open: false }));

  const resolveLinkAttrs = (rawUrl, forceNewTab = false) => {
    const href = normalizeLinkValue(rawUrl);
    if (!href) return null;
    const openInNewTab = forceNewTab || !isInternalUrl(href);
    return {
      href,
      target: openInNewTab ? '_blank' : null,
      rel: openInNewTab ? 'noopener noreferrer' : null,
    };
  };

  const applyLink = () => {
    const attrs = resolveLinkAttrs(linkDraft.url, linkDraft.newTab);
    if (!attrs?.href) {
      toast({ title: 'Ingresa URL del enlace', variant: 'destructive' });
      return;
    }
    editor
      ?.chain()
      .focus()
      .extendMarkRange('link')
      .setLink(attrs)
      .run();
    setLinkDraft((p) => ({ ...p, url: '' }));
  };

  const promptAndApplyLink = () => {
    if (!editor) return;
    const currentHref = editor.getAttributes('link')?.href || linkDraft.url || '';
    const drafted = window.prompt('URL del enlace', currentHref || 'https://');
    if (drafted === null) return;
    const trimmed = drafted.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
      closeContextMenu();
      return;
    }
    const attrs = resolveLinkAttrs(trimmed);
    if (!attrs?.href) {
      toast({ title: 'URL inválida', variant: 'destructive' });
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
    setLinkDraft((prev) => ({ ...prev, url: attrs.href, newTab: attrs.target === '_blank' }));
    closeContextMenu();
  };

  const rememberEditorSelection = () => {
    if (!editor) return;
    lastSelectionRef.current = editor.state.selection.from;
  };

  const editorChainAtLastSelection = () => {
    if (!editor) return null;
    const docSize = editor.state.doc.content.size;
    const rawPos =
      typeof lastSelectionRef.current === 'number'
        ? lastSelectionRef.current
        : editor.state.selection.from;
    const safePos = Math.max(1, Math.min(rawPos || 1, Math.max(1, docSize)));
    return editor.chain().focus().setTextSelection(safePos);
  };

  const runEditorAction = (action) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    action(chain);
    closeContextMenu();
  };

  const handleEditorContextMenu = (event) => {
    if (!editor) return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.closest('.ProseMirror')) return;
    event.preventDefault();
    const coords = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (coords?.pos) editor.chain().focus().setTextSelection(coords.pos).run();
    rememberEditorSelection();
    const safeX = Math.max(12, Math.min(event.clientX, window.innerWidth - 252));
    const safeY = Math.max(12, Math.min(event.clientY, window.innerHeight - 260));
    setContextMenu({ open: true, x: safeX, y: safeY });
  };

  const handleEditorKeyDownCapture = (event) => {
    if (!editor) return;
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'k') {
      event.preventDefault();
      promptAndApplyLink();
      return;
    }
    if (key === 'y') {
      event.preventDefault();
      editor.chain().focus().redo().run();
    }
  };

  const optimizeInternalImageFile = async (file, options = {}) => {
    const { showServerFallbackToast = true } = options;
    let optimizedResult = null;
    try {
      optimizedResult = await optimizeToWebpWithEdgeFunction(file);
    } catch (serverError) {
      optimizedResult = null;
      if (showServerFallbackToast) {
        toast({
          title: 'Optimizador servidor no disponible',
          description: `${serverError.message} Se usará optimización local.`,
        });
      }
    }

    if (!optimizedResult) {
      const optimized = await optimizeToEditorialWebp(file);
      const optimizedFile = new File([optimized.blob], seoWebpName(file.name), {
        type: 'image/webp',
        lastModified: Date.now(),
      });
      optimizedResult = {
        file: optimizedFile,
        bytes: optimized.blob.size,
        width: optimized.width,
        height: optimized.height,
        quality: optimized.quality,
        mode: 'client',
      };
    }

    return optimizedResult;
  };

  const insertImageInEditor = async (options = {}) => {
    const {
      imageFile,
      alt,
      caption = '',
      displayMode = 'full',
      width = null,
      height = null,
      successMessage = 'Imagen insertada',
      silentSuccess = false,
    } = options;

    if (!editor || !imageFile) {
      toast({ title: 'Selecciona una imagen', variant: 'destructive' });
      return false;
    }
    if (countImages(editor.getJSON()) >= MAX_IMAGES) {
      toast({ title: `Máximo ${MAX_IMAGES} imágenes por artículo`, variant: 'destructive' });
      return false;
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      toast({ title: 'Imagen excede 300KB', variant: 'destructive' });
      return false;
    }

    const finalAlt = (alt || '').trim() || defaultAltFromFileName(imageFile.name);
    const seoNameSource = finalAlt || caption.trim() || imageFile.name;
    const renamedFile = new File([imageFile], seoWebpName(seoNameSource), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
    const lower = renamedFile.name.toLowerCase();
    if (!WEBP_NAME.test(lower)) {
      toast({
        title: 'Nombre inválido',
        description: 'Usa formato palabras-clave-separadas-por-guiones.webp',
        variant: 'destructive',
      });
      return false;
    }

    const src = await toDataUrl(renamedFile);
    const display = displayMode === 'caption' ? 'center' : displayMode;
    const imageAttrs = {
      src,
      alt: finalAlt,
      title: caption.trim() || finalAlt,
      display,
      width: width || null,
      height: height || null,
    };
    const chain = editorChainAtLastSelection();
    const insertedAtRememberedSelection = chain ? chain.setImage(imageAttrs).run() : false;
    const insertedAtCurrentSelection = insertedAtRememberedSelection
      ? true
      : editor.chain().focus().setImage(imageAttrs).run();
    if (!insertedAtCurrentSelection) {
      toast({
        title: 'No se pudo insertar la imagen',
        description: 'Intenta ubicar el cursor nuevamente y repetir.',
        variant: 'destructive',
      });
      return false;
    }

    if (displayMode === 'caption') {
      editor.chain().focus().insertContent(`<p><em>${escapeHtml(caption.trim() || finalAlt)}</em></p>`).run();
    }

    const next = [{ id: `${Date.now()}`, url: src, alt: finalAlt, name: renamedFile.name }, ...mediaLibrary].slice(0, 120);
    setMediaLibrary(next);
    saveMediaLibrary(next);
    if (!silentSuccess) toast({ title: successMessage });
    return true;
  };

  const onInternalFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsOptimizingInternalImage(true);
    setOptimizedInternalInfo(null);
    try {
      const optimizedResult = await optimizeInternalImageFile(file, { showServerFallbackToast: true });

      const previewUrl = URL.createObjectURL(optimizedResult.file);
      setInternalPreview((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return previewUrl;
      });
      setInternalFile(optimizedResult.file);
      if (!internalAlt.trim()) setInternalAlt(defaultAltFromFileName(file.name));
      setOptimizedInternalInfo({
        bytes: optimizedResult.bytes,
        width: optimizedResult.width,
        height: optimizedResult.height,
        quality: optimizedResult.quality,
        mode: optimizedResult.mode,
      });
      toast({
        title: 'Imagen optimizada automáticamente',
        description: `${(optimizedResult.bytes / 1024).toFixed(1)}KB · ${optimizedResult.width}x${optimizedResult.height} · WebP`,
      });
    } catch (error) {
      clearInternalImageDraft();
      toast({
        title: 'No se pudo optimizar la imagen',
        description: error.message || 'Intenta con otra imagen o menor resolución.',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizingInternalImage(false);
      e.target.value = '';
    }
  };

  const onQuickInternalFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsOptimizingInternalImage(true);
    try {
      const optimizedResult = await optimizeInternalImageFile(file, { showServerFallbackToast: false });
      const inserted = await insertImageInEditor({
        imageFile: optimizedResult.file,
        alt: defaultAltFromFileName(file.name),
        caption: '',
        displayMode: 'full',
        width: optimizedResult.width,
        height: optimizedResult.height,
        successMessage: 'Imagen insertada en la posición del cursor',
      });
      if (!inserted) return;
      setOptimizedInternalInfo({
        bytes: optimizedResult.bytes,
        width: optimizedResult.width,
        height: optimizedResult.height,
        quality: optimizedResult.quality,
        mode: optimizedResult.mode,
      });
    } catch (error) {
      toast({
        title: 'No se pudo insertar la imagen',
        description: error.message || 'Intenta con otra imagen o menor resolución.',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizingInternalImage(false);
      e.target.value = '';
    }
  };

  const insertInternalImage = async () => {
    if (!internalFile) {
      toast({ title: 'Selecciona una imagen', variant: 'destructive' });
      return;
    }
    const inserted = await insertImageInEditor({
      imageFile: internalFile,
      alt: internalAlt.trim() || defaultAltFromFileName(internalFile.name),
      caption: internalCaption.trim(),
      displayMode: internalDisplay,
      width: optimizedInternalInfo?.width || null,
      height: optimizedInternalInfo?.height || null,
    });
    if (!inserted) return;
    clearInternalImageDraft();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">CMS avanzado de artículos</h2>
          <p className="text-sm text-slate-400">{autosaveInfo}</p>
          <p className="text-xs text-slate-500 mt-1">H1 lo controla el título. En contenido se permite H2, H3 y H4.</p>
          <p className="text-xs text-slate-500 mt-1">
            Formato detectado: {FORMAT_LABELS[contentDiagnostics.format] || contentDiagnostics.format} · H2 {contentDiagnostics.h2} · H3 {contentDiagnostics.h3} · UL {contentDiagnostics.ul} · OL {contentDiagnostics.ol} · Citas {contentDiagnostics.blockquote}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview((v) => !v)}><Eye className="w-4 h-4 mr-2" />{showPreview ? 'Editar' : 'Vista previa'}</Button>
          <Button onClick={saveArticle}><Save className="w-4 h-4 mr-2" />Guardar</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={publishArticleNow}>Publicar ahora</Button>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-[65]">
        <Button
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl"
          onClick={publishArticleNow}
        >
          Publicar ahora
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-4 border-slate-700/70 bg-slate-900/70">
          <CardHeader className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1"><Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /><Input className="pl-8" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-600 bg-slate-700/50 px-2 text-sm text-slate-100"><option value="all">Todos</option>{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <Button
              onClick={() => {
                setForm({ ...emptyForm });
                setContextMenu({ open: false, x: 0, y: 0 });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo artículo
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
            {filtered.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-700 p-3 bg-slate-950/50">
                <p className="font-semibold text-slate-100 line-clamp-2">{a.title}</p><p className="text-xs text-slate-400">{a.slug}</p>
                <div className="flex gap-1 mt-2">
                  <Button size="icon" variant="ghost" onClick={() => openArticle(a)}><Eye className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => duplicate(a)}><Copy className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteArticle(a)}><Trash2 className="w-4 h-4 text-rose-400" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="xl:col-span-8 space-y-5">
          <Card className="border-slate-700/70 bg-slate-900/70">
            <CardHeader><CardTitle className="text-slate-100">Información y SEO</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2"><Label>Título (H1)</Label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
              <div className="md:col-span-2"><Label>Subtítulo</Label><Input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))} /><p className="text-[11px] text-slate-400 mt-1">Normalizado: {slugify(form.slug || form.title) || '-'}</p></div>
              <div><Label>Categoría</Label><select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="h-10 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><Label>Estado</Label><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="h-10 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100">{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><Label>Fecha programada</Label><Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Firma editorial</Label>
                <select
                  value={form.authorSignature || inferAuthorSignature(form.authorName)}
                  onChange={(e) => {
                    const nextSignature = e.target.value;
                    const selected = AUTHOR_SIGNATURES[nextSignature] || AUTHOR_SIGNATURES.brand;
                    setForm((p) => ({
                      ...p,
                      authorSignature: nextSignature,
                      authorName: selected.name,
                    }));
                  }}
                  className="h-10 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100"
                >
                  <option value="brand">Bienestar en Claro (logo)</option>
                  <option value="daniel">Daniel Falcón (foto)</option>
                </select>
                <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/50 px-2.5 py-2">
                  <img
                    src={(AUTHOR_SIGNATURES[form.authorSignature || inferAuthorSignature(form.authorName)] || AUTHOR_SIGNATURES.brand).avatar}
                    alt={(AUTHOR_SIGNATURES[form.authorSignature || inferAuthorSignature(form.authorName)] || AUTHOR_SIGNATURES.brand).name}
                    className="h-8 w-8 rounded-full object-cover border border-slate-600"
                  />
                  <p className="text-xs text-slate-300">
                    Se mostrará como: <span className="font-semibold">{(AUTHOR_SIGNATURES[form.authorSignature || inferAuthorSignature(form.authorName)] || AUTHOR_SIGNATURES.brand).name}</span>
                  </p>
                </div>
              </div>
              <div><Label>Meta title ({form.metaTitle.length}/60)</Label><Input value={form.metaTitle} onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))} className={form.metaTitle.length > 60 ? 'border-amber-400' : ''} /></div>
              <div><Label>Keyword principal</Label><Input value={form.focusKeyword} onChange={(e) => setForm((p) => ({ ...p, focusKeyword: e.target.value }))} /></div>
              <div className="md:col-span-2"><Label>Meta description ({form.metaDescription.length}/160)</Label><textarea value={form.metaDescription} onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))} rows={2} className={`w-full rounded-lg border px-3 py-2 text-sm ${form.metaDescription.length > 160 ? 'border-amber-400 bg-slate-700/50 text-slate-100' : 'border-slate-600 bg-slate-700/50 text-slate-100'}`} /></div>
              <div><Label>Keywords secundarias</Label><Input value={form.secondaryKeywords} onChange={(e) => setForm((p) => ({ ...p, secondaryKeywords: e.target.value }))} /></div>
              <div><Label>Canonical</Label><Input value={form.canonical} onChange={(e) => setForm((p) => ({ ...p, canonical: e.target.value }))} /></div>
              <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-slate-700 p-2"><span className="text-sm text-slate-200">No-index</span><input type="checkbox" checked={form.noIndex} onChange={(e) => setForm((p) => ({ ...p, noIndex: e.target.checked }))} className="h-4 w-4 accent-emerald-500" /></div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/70 bg-slate-900/70">
            <CardHeader><CardTitle className="text-slate-100">Editor profesional y multimedia</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label>Imagen destacada</Label><Input type="file" accept="image/*" onChange={uploadFeatured} />{form.featuredImage ? <img src={form.featuredImage} alt="featured" className="mt-2 rounded-lg border border-slate-700 max-h-36 object-cover w-full" /> : null}</div>
                <div><Label>Video embebido</Label><Input value={form.videoEmbed} onChange={(e) => setForm((p) => ({ ...p, videoEmbed: e.target.value }))} placeholder="URL YouTube/TikTok/Vimeo" /></div>
              </div>

              <div id="internal-image-panel" className="rounded-xl border border-slate-700 bg-slate-950/40 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-100">Imágenes internas</p><p className="text-xs text-slate-400">Máximo {MAX_IMAGES} | 300KB | WebP final automático | ancho máx. {MAX_IMAGE_WIDTH}px</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><Label>Subida desde panel</Label><Input type="file" accept="image/*" onChange={onInternalFile} disabled={isOptimizingInternalImage} /></div>
                  <div><Label>Posicionamiento</Label><select value={internalDisplay} onChange={(e) => setInternalDisplay(e.target.value)} className="h-10 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100"><option value="full">Ancho completo</option><option value="center">Centrada</option><option value="caption">Con caption</option></select></div>
                  <div><Label>ALT recomendado</Label><Input value={internalAlt} onChange={(e) => setInternalAlt(e.target.value)} placeholder="Se completa automáticamente si lo dejas vacío" /></div>
                  <div><Label>Descripción opcional</Label><Input value={internalCaption} onChange={(e) => setInternalCaption(e.target.value)} placeholder="Caption breve" /></div>
                </div>
                {isOptimizingInternalImage ? <p className="text-xs text-emerald-300">Optimizando imagen a WebP...</p> : null}
                {optimizedInternalInfo ? (
                  <p className="text-xs text-slate-300">
                    Optimizada ({optimizedInternalInfo.mode === 'server' ? 'servidor' : 'cliente'}): {(optimizedInternalInfo.bytes / 1024).toFixed(1)}KB · {optimizedInternalInfo.width}x{optimizedInternalInfo.height} · calidad {(optimizedInternalInfo.quality * 100).toFixed(0)}%
                  </p>
                ) : null}
                {internalPreview ? <img src={internalPreview} alt="preview" className="max-h-52 rounded-md object-contain w-full bg-slate-950/60 border border-slate-700" /> : null}
                <div className="flex items-center justify-between gap-2 flex-wrap"><p className="text-xs text-slate-400">Nombre SEO final automático: <code>palabras-clave-separadas-por-guiones.webp</code></p><Button variant="outline" onClick={insertInternalImage} disabled={isOptimizingInternalImage}><ImagePlus className="w-4 h-4 mr-2" />Insertar imagen</Button></div>
              </div>

              <div>
                <Label>Enlaces externos</Label>
                {form.externalLinks.map((link, index) => (
                  <div key={`${index}-${link}`} className="flex gap-2 mt-2">
                    <Input value={link} onChange={(e) => updateExternalLink(index, e.target.value)} />
                    <Button
                      variant="outline"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          externalLinks: p.externalLinks.filter((_, idx) => idx !== index).length
                            ? p.externalLinks.filter((_, idx) => idx !== index)
                            : [''],
                        }))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setForm((p) => ({ ...p, externalLinks: [...p.externalLinks, ''] }))}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir enlace
                </Button>
              </div>

              <div className="sticky top-2 z-20 rounded-xl border border-slate-700 bg-slate-950/95 backdrop-blur">
                <input
                  ref={quickImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onQuickInternalFile}
                  className="hidden"
                />
                <div className="p-2 flex flex-wrap gap-2 items-center border-b border-slate-800">
                  <button type="button" title="Insertar H2" className={btn(false)} onClick={() => editor?.chain().focus().insertContent('<h2>Nuevo subtítulo</h2><p></p>').run()}><Heading2 className="w-4 h-4" /></button>
                  <button type="button" title="H2" className={btn(editor?.isActive('heading', { level: 2 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></button>
                  <button type="button" title="H3" className={btn(editor?.isActive('heading', { level: 3 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></button>
                  <button type="button" title="H4" className={btn(editor?.isActive('heading', { level: 4 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 className="w-4 h-4" /></button>
                  <button type="button" title="Negrita" className={btn(editor?.isActive('bold'))} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></button>
                  <button type="button" title="Cursiva" className={btn(editor?.isActive('italic'))} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></button>
                  <button type="button" title="Subrayado" className={btn(editor?.isActive('editorialUnderline'))} onClick={() => editor?.chain().focus().toggleEditorialUnderline().run()}><Underline className="w-4 h-4" /></button>
                  <button type="button" title="Tachado" className={btn(editor?.isActive('strike'))} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></button>
                  <button type="button" title="Código inline" className={btn(editor?.isActive('code'))} onClick={() => editor?.chain().focus().toggleCode().run()}><Code2 className="w-4 h-4" /></button>
                  {COLORS.map((c) => <button key={c} type="button" title={`Color ${c}`} className={btn(editor?.isActive('editorialColor', { color: c }))} onClick={() => editor?.chain().focus().setEditorialColor(c).run()}><Palette className="w-4 h-4 mr-1" /><span className="w-3 h-3 rounded-full border border-slate-400" style={{ backgroundColor: c }} /></button>)}
                  <button type="button" title="Quitar color" className={btn(false)} onClick={() => editor?.chain().focus().unsetEditorialColor().run()}><Minus className="w-4 h-4" /></button>
                  <button type="button" title="Lista viñetas" className={btn(editor?.isActive('bulletList'))} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></button>
                  <button type="button" title="Lista numerada" className={btn(editor?.isActive('orderedList'))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></button>
                  <button type="button" title="Checklist" className={btn(false)} onClick={() => editor?.chain().focus().insertContent('<ul><li>☐ Tarea 1</li><li>☐ Tarea 2</li></ul>').run()}><CheckSquare className="w-4 h-4" /></button>
                  <button type="button" title="Cita destacada" className={btn(editor?.isActive('blockquote'))} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></button>
                  <button type="button" title="Tabla" className={btn(false)} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 className="w-4 h-4" /></button>
                  <button type="button" title="Separador" className={btn(false)} onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus className="w-4 h-4" /></button>
                  <button type="button" title="Bloque resumen" className={btn(false)} onClick={() => editor?.chain().focus().insertEditorialSummary().run()}><ListChecks className="w-4 h-4" /></button>
                  <button type="button" title="Bloque advertencia" className={btn(false)} onClick={() => editor?.chain().focus().insertEditorialWarning().run()}><AlertTriangle className="w-4 h-4" /></button>
                  <button type="button" title="Insertar imagen rápida" className={btn(false)} onMouseDown={rememberEditorSelection} onClick={() => quickImageInputRef.current?.click()}><ImagePlus className="w-4 h-4" /></button>
                </div>
                <div className="p-2 flex flex-wrap gap-2 items-center">
                  <div className="flex-1 min-w-[220px]"><Input value={linkDraft.url} onChange={(e) => setLinkDraft((p) => ({ ...p, url: e.target.value }))} placeholder="Enlace interno o externo" /></div>
                  <label className="text-xs text-slate-300 flex items-center gap-2"><input type="checkbox" checked={linkDraft.newTab} onChange={(e) => setLinkDraft((p) => ({ ...p, newTab: e.target.checked }))} className="h-4 w-4 accent-emerald-500" />Nueva pestaña</label>
                  <Button variant="outline" onClick={applyLink}><Link2 className="w-4 h-4 mr-2" />Insertar enlace</Button>
                  <Button variant="outline" onClick={() => editor?.chain().focus().unsetLink().run()}><Link2Off className="w-4 h-4 mr-2" />Quitar enlace</Button>
                </div>
              </div>

              <div className="min-h-[320px] rounded-lg border border-slate-700 bg-slate-950/60 p-4 text-slate-100">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2">
                  <p className="text-xs text-slate-300">Inserta imagen exactamente donde dejaste el cursor.</p>
                  <Button variant="outline" size="sm" onMouseDown={rememberEditorSelection} onClick={() => quickImageInputRef.current?.click()} disabled={isOptimizingInternalImage}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isOptimizingInternalImage ? 'Optimizando...' : 'Insertar imagen aquí'}
                  </Button>
                </div>
                {editor ? (
                  <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 120, placement: 'top', offset: [0, 8] }}
                    className="editorial-bubble-menu flex flex-wrap gap-1 rounded-lg border border-slate-700 bg-slate-950/95 p-1 shadow-xl"
                  >
                    <button type="button" title="H2" className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></button>
                    <button type="button" title="H3" className={btn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></button>
                    <button type="button" title="Negrita" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></button>
                    <button type="button" title="Cursiva" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></button>
                    <button type="button" title="Subrayado" className={btn(editor.isActive('editorialUnderline'))} onClick={() => editor.chain().focus().toggleEditorialUnderline().run()}><Underline className="w-4 h-4" /></button>
                    <button type="button" title="Enlace" className={btn(editor.isActive('link'))} onClick={promptAndApplyLink}><Link2 className="w-4 h-4" /></button>
                  </BubbleMenu>
                ) : null}

                <div
                  className="relative"
                  onContextMenu={handleEditorContextMenu}
                  onKeyDownCapture={handleEditorKeyDownCapture}
                >
                  <EditorContent editor={editor} className="editorial-editor" />
                  {editor?.isEmpty ? (
                    <p className="pointer-events-none absolute left-3 top-3 text-sm text-slate-500">
                      Escribe aquí. Usa la barra superior, selección (bubble menu) o click derecho para formatear.
                    </p>
                  ) : null}
                </div>

                {contextMenu.open ? (
                  <div
                    ref={contextMenuRef}
                    className="fixed z-[70] min-w-[220px] rounded-xl border border-slate-700 bg-slate-950/95 p-2 shadow-2xl"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                  >
                    <div className="grid grid-cols-3 gap-1 border-b border-slate-800 pb-2">
                      <button type="button" className={btn(editor?.isActive('heading', { level: 2 }))} onClick={() => runEditorAction((chain) => chain.toggleHeading({ level: 2 }).run())}><Heading2 className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('heading', { level: 3 }))} onClick={() => runEditorAction((chain) => chain.toggleHeading({ level: 3 }).run())}><Heading3 className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('heading', { level: 4 }))} onClick={() => runEditorAction((chain) => chain.toggleHeading({ level: 4 }).run())}><Heading4 className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('bold'))} onClick={() => runEditorAction((chain) => chain.toggleBold().run())}><Bold className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('italic'))} onClick={() => runEditorAction((chain) => chain.toggleItalic().run())}><Italic className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('editorialUnderline'))} onClick={() => runEditorAction((chain) => chain.toggleEditorialUnderline().run())}><Underline className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 border-b border-slate-800 py-2">
                      <button type="button" className={btn(editor?.isActive('bulletList'))} onClick={() => runEditorAction((chain) => chain.toggleBulletList().run())}><List className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('orderedList'))} onClick={() => runEditorAction((chain) => chain.toggleOrderedList().run())}><ListOrdered className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('blockquote'))} onClick={() => runEditorAction((chain) => chain.toggleBlockquote().run())}><Quote className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('code'))} onClick={() => runEditorAction((chain) => chain.toggleCode().run())}><Code2 className="w-4 h-4" /></button>
                      <button type="button" className={btn(editor?.isActive('link'))} onClick={promptAndApplyLink}><Link2 className="w-4 h-4" /></button>
                      <button type="button" className={btn(false)} onClick={() => runEditorAction((chain) => chain.unsetLink().run())}><Link2Off className="w-4 h-4" /></button>
                    </div>
                    <div className="pt-2 grid gap-1">
                      <button
                        type="button"
                        className="rounded-md border border-slate-700 px-2 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800"
                        onMouseDown={rememberEditorSelection}
                        onClick={() => {
                          quickImageInputRef.current?.click();
                          closeContextMenu();
                        }}
                      >
                        Insertar imagen
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-slate-700 px-2 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800"
                        onClick={() => runEditorAction((chain) => chain.setParagraph().run())}
                      >
                        Convertir a párrafo
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {showPreview ? (
            <Card className="border-slate-700/70 bg-slate-900/70">
              <CardHeader><CardTitle className="text-slate-100">Vista previa profesional</CardTitle></CardHeader>
              <CardContent>
                <article className="editorial-preview rounded-2xl bg-white text-slate-900 p-4 sm:p-8">
                  <header className="mb-8 border-b border-slate-200 pb-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{form.category || 'General'}</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">{form.title || 'Título del artículo'}</h1>
                    {form.subtitle ? <p className="text-slate-600 mt-3 text-lg">{form.subtitle}</p> : null}
                  </header>
                  {form.featuredImage ? <div className="rounded-2xl overflow-hidden mb-8 border border-slate-200"><img src={form.featuredImage} alt={form.title || 'Imagen destacada'} className="w-full h-auto max-h-[420px] object-cover" /></div> : null}
                  <div className="editorial-content" dangerouslySetInnerHTML={{ __html: safePreviewHtml }} />
                </article>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ArticleManagementModule;
