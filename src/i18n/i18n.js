const translations = {
  es: {
    // Header & Navigation
    brandName: 'CHISMES & FARÁNDULA',
    categories: {
      farandula: 'Farándula',
      chismes: 'Chismes',
      celebridades: 'Celebridades',
      entretenimiento: 'Entretenimiento',
      noticias: 'Noticias',
      tendencias: 'Tendencias'
    },
    
    // Settings Panel
    settings: {
      title: 'Configuración',
      fontFamily: 'Fuente',
      fontSize: 'Tamaño de fuente',
      primaryColor: 'Color primario',
      secondaryColor: 'Color secundario',
      accentColor: 'Color de acento',
      language: 'Idioma',
      save: 'Guardar',
      reset: 'Restablecer',
      close: 'Cerrar',
      saved: 'Configuración guardada exitosamente',
      reset_success: 'Tema restablecido a valores predeterminados'
    },
    
    // News Section
    news: {
      featured: 'Noticia Destacada',
      latest: 'Últimas Noticias',
      readMore: 'Leer más',
      loadMore: 'Cargar más',
      noNews: 'No hay noticias disponibles',
      category: 'Categoría'
    },
    
    // Footer
    footer: {
      about: 'Acerca de',
      aboutText: 'Tu fuente número 1 de chismes, farándula y noticias de celebridades en español.',
      quickLinks: 'Enlaces Rápidos',
      followUs: 'Síguenos',
      newsletter: 'Boletín',
      newsletterText: 'Suscríbete para recibir las últimas noticias',
      subscribe: 'Suscribirse',
      email: 'Tu correo electrónico',
      copyright: '© 2026 Chismes & Farándula. Todos los derechos reservados.',
      privacyPolicy: 'Política de Privacidad',
      terms: 'Términos de Servicio'
    },
    
    // Common
    menu: 'Menú',
    spanish: 'Español',
    english: 'English'
  },
  
  en: {
    // Header & Navigation
    brandName: 'GOSSIP & ENTERTAINMENT',
    categories: {
      farandula: 'Entertainment',
      chismes: 'Gossip',
      celebridades: 'Celebrities',
      entretenimiento: 'Shows',
      noticias: 'News',
      tendencias: 'Trends'
    },
    
    // Settings Panel
    settings: {
      title: 'Settings',
      fontFamily: 'Font Family',
      fontSize: 'Font Size',
      primaryColor: 'Primary Color',
      secondaryColor: 'Secondary Color',
      accentColor: 'Accent Color',
      language: 'Language',
      save: 'Save',
      reset: 'Reset',
      close: 'Close',
      saved: 'Settings saved successfully',
      reset_success: 'Theme reset to default values'
    },
    
    // News Section
    news: {
      featured: 'Featured Story',
      latest: 'Latest News',
      readMore: 'Read more',
      loadMore: 'Load more',
      noNews: 'No news available',
      category: 'Category'
    },
    
    // Footer
    footer: {
      about: 'About',
      aboutText: 'Your #1 source for celebrity gossip, entertainment news and trends in Spanish.',
      quickLinks: 'Quick Links',
      followUs: 'Follow Us',
      newsletter: 'Newsletter',
      newsletterText: 'Subscribe to get the latest news',
      subscribe: 'Subscribe',
      email: 'Your email',
      copyright: '© 2026 Gossip & Entertainment. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms of Service'
    },
    
    // Common
    menu: 'Menu',
    spanish: 'Español',
    english: 'English'
  }
};

export const useTranslation = () => {
  const getCurrentLanguage = () => {
    const saved = localStorage.getItem('appTheme');
    if (saved) {
      const theme = JSON.parse(saved);
      return theme.language || 'es';
    }
    return 'es';
  };

  const language = getCurrentLanguage();

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  };

  return { t, language };
};