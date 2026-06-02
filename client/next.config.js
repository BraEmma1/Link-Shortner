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
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
