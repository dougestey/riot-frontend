import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      // Never cache API responses; always hit the network for dynamic data.
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
        handler: 'NetworkOnly',
        method: 'GET',
      },
    ],
  },
});

// The rewrite destination must be reachable from the Next.js server container.
// In Docker/Coolify, INTERNAL_API_URL (e.g. http://riot-backend:3000) goes over
// the Docker network. Falls back to the public URL for local dev.
const REWRITE_BACKEND =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

const nextConfig: NextConfig = {
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${REWRITE_BACKEND}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.riotevents.app',
      },
    ],
  },
};

export default withPWA(nextConfig);
