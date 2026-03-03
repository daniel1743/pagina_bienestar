import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="page-wrap">
      <div className="article-card">
        <h1>Artículo no encontrado</h1>
        <p className="meta">La URL no existe o el contenido no está publicado.</p>
        <p>
          <Link href="/">Volver al inicio</Link>
        </p>
      </div>
    </main>
  );
}
