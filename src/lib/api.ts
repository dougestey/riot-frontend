import type {
  Event,
  Category,
  Venue,
  PaginatedResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchAPI<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`/api${endpoint}`, API_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  featured?: boolean;
  sort?: string;
}

export async function getEvents(
  params: GetEventsParams = {}
): Promise<PaginatedResponse<Event>> {
  const query: Record<string, string> = {
    'where[status][equals]': 'published',
    sort: params.sort ?? '-startDateTime',
    limit: String(params.limit ?? 20),
    page: String(params.page ?? 1),
    depth: '2',
  };

  if (params.search) {
    query['where[title][like]'] = params.search;
  }

  if (params.categoryId) {
    query['where[categories][in]'] = String(params.categoryId);
  }

  if (params.featured) {
    query['where[featured][equals]'] = 'true';
  }

  return fetchAPI<PaginatedResponse<Event>>('/events', query);
}

export async function getEvent(
  slug: string
): Promise<Event | null> {
  const result = await fetchAPI<PaginatedResponse<Event>>('/events', {
    'where[slug][equals]': slug,
    'where[status][equals]': 'published',
    depth: '2',
    limit: '1',
  });

  return result.docs[0] ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const result = await fetchAPI<PaginatedResponse<Category>>('/categories', {
    limit: '100',
    sort: 'name',
  });

  return result.docs;
}

export async function getVenue(id: number): Promise<Venue | null> {
  try {
    return await fetchAPI<Venue>(`/venues/${id}`);
  } catch {
    return null;
  }
}
