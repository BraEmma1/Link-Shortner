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
        {/*
          FOUC prevention — must be the first thing in <head>.
          Hides icons via visibility:hidden (not color:transparent) so Tailwind
          text-* utilities cannot override it. Reveals them once fonts resolve
          or after a 3 s timeout, whichever comes first.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .material-symbols-outlined {
                visibility: hidden;
              }
              html.fonts-loaded .material-symbols-outlined,
              html.fonts-timeout .material-symbols-outlined {
                visibility: visible;
              }
            `,
          }}
        />
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md antialiased" suppressHydrationWarning>
        <KeepAliveProvider />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
