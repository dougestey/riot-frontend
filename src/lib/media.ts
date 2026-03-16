import type { Event, Media } from './types';

/**
 * Payload returns media URLs that may be absolute (with PAYLOAD_PUBLIC_SERVER_URL
 * baked in) or relative. We strip any backend origin and return a relative path
 * like `/api/media/file/img.jpg`. Next.js Image treats relative URLs as local,
 * fetching through the app itself — which hits the `/api/*` rewrite and proxies
 * to the backend over the Docker network. This avoids the hairpin problem where
 * the server-side image optimizer can't reach the external hostname.
 */
const PUBLIC_BACKEND = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

function toRelativePath(url: string | null | undefined): string | null {
  if (!url) return null;
  // Already relative — use as-is
  if (url.startsWith('/')) return url;
  // Absolute URL with the backend origin — strip it to a relative path
  if (url.startsWith(PUBLIC_BACKEND)) {
    return url.slice(PUBLIC_BACKEND.length);
  }
  // Some other absolute URL — leave it alone
  return url;
}

export function getMediaUrl(
  media: Event['featuredImage'],
  size: 'card' | 'feature' | 'thumbnail' = 'card',
): string | null {
  if (!media || typeof media === 'number') return null;
  const m = media as Media;
  const sizeUrl = m.sizes?.[size]?.url;
  return toRelativePath(sizeUrl) ?? toRelativePath(m.url);
}

export function getMediaAlt(media: Event['featuredImage']): string {
  if (!media || typeof media === 'number') return '';
  return (media as Media).alt ?? '';
}
