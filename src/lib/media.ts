import type { Event, Media } from './types';

/**
 * Payload returns media URLs as relative paths (e.g. /api/media/file/img.jpg).
 * Next.js Image optimization can't reliably resolve these through rewrites in
 * production, so we prepend the backend origin to create absolute URLs that
 * the /_next/image handler can fetch directly.
 */
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

function toAbsoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // Already absolute — leave it alone
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_URL}${path}`;
}

export function getMediaUrl(
  media: Event['featuredImage'],
  size: 'card' | 'feature' | 'thumbnail' = 'card',
): string | null {
  if (!media || typeof media === 'number') return null;
  const m = media as Media;
  const sizeUrl = m.sizes?.[size]?.url;
  return toAbsoluteUrl(sizeUrl) ?? toAbsoluteUrl(m.url);
}

export function getMediaAlt(media: Event['featuredImage']): string {
  if (!media || typeof media === 'number') return '';
  return (media as Media).alt ?? '';
}
