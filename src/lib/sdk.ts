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
    // On the server, always ask Next.js to bypass the data cache so
    // event and other dynamic data reflects the latest backend state.
    if (typeof window === 'undefined') {
      const serverInit: RequestInit = {
        cache: 'no-store',
        ...(init ?? {}),
        next: { ...(init as any)?.next, revalidate: 0 },
      };
      return defaultFetch(input, serverInit);
    }

    return defaultFetch(input, init as RequestInit);
  };
}

export const payload = new PayloadSDK<Config>({
  baseURL,
  baseInit: { credentials: 'include' },
  fetch: createFetchWithRevalidate(),
});
