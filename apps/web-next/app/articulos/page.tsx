import Link from 'next/link';
import { getPublishedArticlesForSitemap } from '@/lib/article-repository';
import type { ArticleRecord } from '@/lib/article-types';

export const revalidate = 300;

export default async function ArticlesIndexPage() {
  let rows: ArticleRecord[] = [];
  try {
    rows = await getPublishedArticlesForSitemap();
  } catch {
    rows = [];
  }

  return (
    <main className="page-wrap">
      <div className="article-card">
        <h1>Artículos</h1>
        <p className="meta">Listado de artículos publicados.</p>
        <ul>
          {rows.slice(0, 100).map((item) => (
            <li key={item.slug} style={{ marginBottom: 8 }}>
              <Link href={`/articulos/${item.slug}`}>{item.slug}</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
