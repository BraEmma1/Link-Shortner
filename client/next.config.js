/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for catching potential issues early
  reactStrictMode: true,

  // Image domains (add your CDN/storage domains here in future phases)
  images: {
    remotePatterns: [],
  },

  // Proxy API requests to the Express backend during development
  // This avoids CORS issues when calling /api/* from the browser
  async rewrites() {
    // Strip trailing /api (and any trailing slash) from the base URL to avoid double-slash
    // e.g. https://api.example.com/api → https://api.example.com
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const apiBase = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return [
      {
        // Proxy /api/* calls to the Express backend
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
      {
        // Proxy short-link slugs (e.g. /2b872a) to the Express redirect engine
        // This MUST come after /api to avoid accidentally proxying API routes
        source: '/:slug([a-zA-Z0-9]+)',
        destination: `${apiBase}/:slug`,
      },
    ];
  },
};

module.exports = nextConfig;
