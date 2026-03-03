import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bienestar en Claro',
  description: 'Información clara basada en evidencia para cuidar tu salud y bienestar.',
  metadataBase: new URL(process.env.SITE_URL || 'https://bienestarenclaro.com'),
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
