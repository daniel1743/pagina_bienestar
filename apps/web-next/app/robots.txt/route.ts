import { site } from '@/lib/site';

export const revalidate = 300;

export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: ${site.defaultUrl}/sitemap.xml
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
