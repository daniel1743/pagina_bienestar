import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-wrap">
      <div className="article-card">
        <h1>Bienestar en Claro</h1>
        <p className="meta">
          App Next.js para migración SEO server-first de artículos.
        </p>
        <p>
          Esta app está preparada para renderizar <code>/articulos/[slug]</code> con metadata en HTML
          inicial (SSR/SSG + ISR).
        </p>
        <p>
          <Link href="/articulos">Ir a artículos</Link>
        </p>
      </div>
    </main>
  );
}
