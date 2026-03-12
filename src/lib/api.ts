import type { Event, Category, Venue } from './payload-types';
import { payload } from './sdk';

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
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

export interface GetEventCategoriesForQueryParams {
  search?: string;
  categoryId?: number;
  featured?: boolean;
}

export interface QueryCategorySummary {
  id: number;
  name: string;
  eventCount: number;
}

export async function getEventCategoriesForQuery(
  params: GetEventCategoriesForQueryParams = {}
): Promise<QueryCategorySummary[]> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.categoryId != null) qs.set('categoryId', String(params.categoryId));
  if (params.featured != null) qs.set('featured', String(params.featured));

  const res = await fetch(`/api/event-categories?${qs.toString()}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to load event categories');
  }

  const data = (await res.json()) as { categories?: QueryCategorySummary[] };
  return data.categories ?? [];
}

export async function getEvent(slug: string): Promise<Event | null> {
  const result = await payload.find({
    collection: 'events',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const result = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'name',
  });
  return result.docs;
}

export async function getVenue(id: number): Promise<Venue | null> {
  const doc = await payload.findByID({
    collection: 'venues',
    id,
    disableErrors: true,
  });
  return doc ?? null;
}
