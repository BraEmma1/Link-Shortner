import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import KeepAliveProvider from '@/components/KeepAliveProvider';

export const metadata: Metadata = {
  title: {
    default: 'Vaultz Links',
    template: '%s | Vaultz Links',
  },
  description:
    'Enterprise-grade URL shortening, QR code generation, and link analytics platform.',
  keywords: ['URL shortener', 'link management', 'QR codes', 'analytics'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Material Symbols Outlined icon font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md antialiased" suppressHydrationWarning>
        {/* Warms up the Express backend immediately and keeps it alive every 14 min */}
        <KeepAliveProvider />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
