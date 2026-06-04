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
          FOUC PREVENTION — must be the very first thing in <head>.
          Inline styles are parsed synchronously, so this fires before any
          external CSS or font asset is fetched — even on Ctrl+F5 hard refresh.
          visibility:hidden is used (not color:transparent) because Tailwind
          text-* utilities applied directly on icon <span>s override color
          but cannot override visibility set here.
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
        {/*
          Inline script: adds .fonts-loaded to <html> the instant document.fonts
          resolves. Falls back to .fonts-timeout after 3 s so icons are never
          permanently hidden on slow connections.
          Must stay inline (no async/defer) so it executes before first paint.
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
        {/* Preconnect for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/*
          display=block keeps ligature text invisible at the browser/font level
          as a second layer of defence while the inline style does the heavy lifting.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
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
