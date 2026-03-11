## Event Staleness in Production

This doc captures why the Riot events list can show stale data in production (e.g. only up to **Feb 28**), even when the backend returns newer events (e.g. **March/June**), and what to change in this codebase to fix it.

---

## 1. How events are fetched

### 1.1 Event list (home screen)

The home screen is a **client component** that fetches events from the browser:

```160:195:src/components/HomeScreen.tsx
function EventsFeed({
  resetKey = 0,
  onOpenSearch,
}: {
  resetKey?: number;
  onOpenSearch?: () => void;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [visibleCategoryIds, setVisibleCategoryIds] = useState<number[]>([]);

  const fetchEvents = useCallback(async () => {
    const showLoading = events.length === 0;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const result = await getEvents({
        search: search || undefined,
        categoryId: categoryId ?? undefined,
      });
      setEvents(result.docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [search, categoryId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
```

`getEvents` lives in `src/lib/api.ts` and uses the Payload SDK:

```17:52:src/lib/api.ts
export async function getEvents(
  params: GetEventsParams = {}
): Promise<PaginatedResponse<Event>> {
  const where: Record<string, { equals?: string | boolean; like?: string; in?: number[] }> = {
    status: { equals: 'published' },
  };
  if (params.search) {
    where.title = { like: params.search };
  }
  if (params.categoryId != null) {
    where.categories = { in: [params.categoryId] };
  }
  if (params.featured === true) {
    where.featured = { equals: true };
  }

  const result = await payload.find({
    collection: 'events',
    where,
    sort: params.sort ?? '-startDateTime',
    limit: params.limit ?? 20,
    page: params.page ?? 1,
    depth: 2,
  });

  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    limit: result.limit,
    totalPages: result.totalPages,
    page: result.page ?? 1,
    pagingCounter: result.pagingCounter,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage ?? null,
    nextPage: result.nextPage ?? null,
  };
}
```

### 1.2 Search screen

The search tab is also a **client component** that calls `getEvents` from the browser:

```41:80:src/components/SearchScreen.tsx
export function SearchScreen({ focusKey = 0 }: { focusKey?: number }) {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [visibleCategoryIds, setVisibleCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    setRecent(loadRecentSearches());
  }, []);

  const hasQuery = query.trim().length > 0;

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!hasQuery && !categoryId) {
        setEvents([]);
        setError(null);
        setLoading(false);
        return;
      }

      const showLoading = events.length === 0;
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const result = await getEvents({
          search: hasQuery ? query : undefined,
          categoryId: categoryId ?? undefined,
        });
        if (cancelled) return;
        setEvents(result.docs);
```

### 1.3 Payload SDK base URL

All of the above eventually go through the shared Payload SDK client in `src/lib/sdk.ts`:

```1:21:src/lib/sdk.ts
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
```

Key points:

- **Browser (client components)** use `NEXT_PUBLIC_API_URL` as the origin.
- **Server (SSR / server components)** use `INTERNAL_API_URL` if set, otherwise `NEXT_PUBLIC_API_URL`.

So the **events list and search** always depend on what `NEXT_PUBLIC_API_URL` is set to at build/runtime, and what sits behind that origin.

---

## 2. Where staleness comes from

Symptom:

- Curling the backend directly (e.g. `curl https://<backend-host>/api/events`) returns **new events for March/June**.
- The Riot app only shows events up to **Feb 28**, consistently, even after a “fresh build” on Coolify.

This means that somewhere **between the browser and the backend**, responses are being cached and reused.

### 2.1 PWA / Service Worker caching

The app enables PWA support via `@ducanh2912/next-pwa`:

```1:15:next.config.ts
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});
```

Important implications:

- A **service worker (SW)** is registered on the **frontend origin**.
- The SW can intercept and cache:
  - Navigation requests (HTML),
  - Static assets,
  - And, depending on defaults / configuration, **fetch requests to `/api/...`** on that same origin.

In earlier production debugging, `NEXT_PUBLIC_API_URL` was (at least once) set to the **frontend’s own URL**. In that setup:

- Client components call `getEvents()` → browser fetches `/api/events?...` on the **frontend origin**.
- The SW sits in front of that origin and can **cache** those API responses.
- If `/api/events` (or an equivalent URL) was cached when Feb 28 was the latest event, the SW can keep serving that old response **forever**, even after:
  - Backend data changes,
  - App containers are rebuilt and redeployed.

When you `curl` the backend directly using its own hostname, you:

- Bypass the frontend origin entirely,
- Bypass the SW,
- Hit the Payload backend and see **fresh March/June data**.

This explains the discrepancy: **the browser is talking to a cached layer (SW) on the frontend origin, curl is not**.

### 2.2 Next.js ISR / `revalidate` on the server

The Payload SDK also wraps `fetch` to add a Next.js `revalidate` hint on the server:

```23:34:src/lib/sdk.ts
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
```

This affects:

- **Server-side** uses of the SDK (e.g. `getEvent` in `src/app/events/[slug]/page.tsx`).

Consequences:

- Next.js is allowed to cache server fetches for **up to 60 seconds**.
- This can make event detail pages up to 60s stale.

But this is **time-based** and short-lived; it cannot explain a hard cutoff at **Feb 28** that persists across deployments. That pattern strongly suggests a **long-lived HTTP cache** like:

- A service worker cache in the browser, and/or
- An intermediate reverse-proxy cache (e.g. Traefik, CDN).

Given the presence of a SW via next-pwa and no custom runtimeCaching rules, the SW is the most likely culprit inside this repo.

---

## 3. Why this is not Next “prerendering” the list

The home page itself is not prerendering the events list:

- `src/app/page.tsx`:

```1:4:src/app/page.tsx
import { HomeScreen } from '@/components/HomeScreen';

export default function Home() {
  return <HomeScreen />;
}
```

- `HomeScreen` is a **client component** (`'use client';`), and `EventsFeed` fetches on mount via `useEffect`.
- There is **no `generateStaticParams`** or `export const revalidate` defined for the route segment that renders the list.

So:

- The events list is **not** a static snapshot taken at build time.
- It is always driven by **runtime client-side fetches**.
- Any “frozen” data is therefore coming from **HTTP caching layers** (SW, browser, or proxy), not from Next’s build-time prerendering.

---

## 4. Recommended changes

If the requirement is: “backend events can change at any time, and the app should reflect that quickly,” then:

### 4.1 Make event API requests non-stale

Conceptual goals:

- **Do not** let the SW cache `/api` responses long-term.
- Prefer to hit the backend directly for dynamic data, especially for the events list.

Implementation directions:

- In `next.config.ts` PWA config (`workboxOptions`), add explicit `runtimeCaching` rules for `/api/**` that:
  - Either use `NetworkOnly`, or
  - Use `NetworkFirst` with very small `maxAgeSeconds` and limited entries.
- Alternatively, ensure that `NEXT_PUBLIC_API_URL` points at the **backend’s own public URL**, on a **different origin** from the SW, so the frontend SW cannot intercept and cache those requests at all.

Result:

- `getEvents()` from the browser will:
  - Either bypass SW caching, or
  - Hit the network first and only fall back to a very short-lived cache.

### 4.2 Tighten server-side caching for event detail (optional)

For event detail pages (`/events/[slug]`), decide how much staleness is acceptable:

- If **60 seconds** is fine, leave `revalidate: 60`.
- If not, change the SDK’s server-side `fetch` to:
  - Use a smaller `revalidate` window, or
  - Omit `revalidate` entirely to force fresh data on each request (with the trade-off of more backend load).

This only affects SSR routes that call the SDK on the server (e.g. `getEvent` in `src/app/events/[slug]/page.tsx`); it does **not** affect the home list.

---

## 5. How to confirm this diagnosis manually

On a device where you see the Feb 28 cutoff:

1. Open DevTools → **Application** → **Service Workers**.
2. Look for a registered SW for your Riot frontend origin.
3. Either:
   - Enable “Bypass for network” (Chrome), or
   - Unregister the SW for that origin.
4. Hard reload the app (or open it in a fresh incognito window).
5. Check whether the events list now includes March/June.

If it does, that confirms the stale data is coming from the **service worker’s cache**, and the fixes above (updating PWA/runtime caching and/or separating frontend/backend origins) are the right direction.

