import { PayloadSDK } from '@payloadcms/sdk';
import type { Config } from './payload-types';

// 1. Determine the Base URL based on where the code is executing
const getBaseUrl = () => {
  // If we're on the server (SSR/Server Components), use the Internal Docker Network
  if (typeof window === 'undefined') {
    // Falls back to NEXT_PUBLIC if INTERNAL is missing
    return (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3000'
    );
  }
  // If we're in the browser (Client Components), use the Public URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

const BACKEND_URL = getBaseUrl();
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
