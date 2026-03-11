import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Riot',
    short_name: 'Riot',
    description: 'Discover events near you',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/riot_logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/riot_logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/riot_logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
