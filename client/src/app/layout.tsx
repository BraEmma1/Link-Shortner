import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import KeepAliveProvider from '@/components/KeepAliveProvider';

export const metadata: Metadata = {
  title: {
    default: 'The Vaultz Corporation',
    template: '%s | The Vaultz Corporation',
  },
  description:
    'Enterprise-grade URL shortening, QR code generation, and link analytics platform.',
  keywords: ['URL shortener', 'link management', 'QR codes', 'analytics'],
  icons: {
    icon: '/assets/TheVaultzLogo_cubic_For_newsletter.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Material Symbols Outlined icon font — preconnect first for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/*
          display=block: browser will NOT show fallback text while loading.
          This is the key FOUC prevention at the network level.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
        {/*
          Inline script: adds .fonts-loaded to <html> once the webfont is ready.
          Falls back to .fonts-timeout after 3 s so icons are never permanently hidden.
          Must be inline (not async/defer) so it runs before first paint.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var timeout = setTimeout(function() {
                  document.documentElement.classList.add('fonts-timeout');
                }, 3000);
                if (document.fonts && document.fonts.ready) {
                  document.fonts.ready.then(function() {
                    clearTimeout(timeout);
                    document.documentElement.classList.add('fonts-loaded');
                  });
                } else {
                  clearTimeout(timeout);
                  document.documentElement.classList.add('fonts-loaded');
                }
              })();
            `,
          }}
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
