import { PayloadSDK } from '@payloadcms/sdk';
import type { Config } from './payload-types';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const baseURL = `${BACKEND_URL.replace(/\/$/, '')}/api`;

function createFetchWithRevalidate(): typeof fetch {
  const defaultFetch = globalThis.fetch;
  return (input: RequestInfo | URL, init?: RequestInit) => {
    // Next.js extends fetch with next: { revalidate } for ISR (server only)
    const nextInit =
      typeof window === 'undefined' && init
        ? { ...init, next: { revalidate: 60 } }
        : init;
    return defaultFetch(input, nextInit as RequestInit);
  };
}

export const payload = new PayloadSDK<Config>({
  baseURL,
  baseInit: { credentials: 'include' },
  fetch: createFetchWithRevalidate(),
});
