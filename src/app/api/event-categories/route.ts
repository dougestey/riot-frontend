import { NextRequest, NextResponse } from 'next/server';
import { payload } from '@/lib/sdk';
import type { Event, Category } from '@/lib/payload-types';

type Where =
  | { equals?: string | boolean | number }
  | { like?: string }
  | { in?: number[] };

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || undefined;
  const categoryIdParam = url.searchParams.get('categoryId');
  const featuredParam = url.searchParams.get('featured');

  const where: Record<string, Where> = {
    status: { equals: 'published' },
  };

  if (search) {
    where.title = { like: search };
  }

  if (categoryIdParam != null) {
    const parsed = Number(categoryIdParam);
    if (!Number.isNaN(parsed)) {
      where.categories = { in: [parsed] };
    }
  }

  if (featuredParam === 'true') {
    where.featured = { equals: true };
  }

  // Limit the window of events we scan for categories to keep
  // this endpoint reasonably fast even with many events.
  const EVENTS_LIMIT = 200;

  const eventsResult = await payload.find({
    collection: 'events',
    where,
    sort: '-startDateTime',
    limit: EVENTS_LIMIT,
    depth: 1,
  });

  const counts = new Map<number, number>();

  for (const event of eventsResult.docs as Event[]) {
    const cats = event.categories ?? [];
    for (const cat of cats) {
      const id = typeof cat === 'number' ? cat : cat?.id;
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  if (counts.size === 0) {
    return NextResponse.json({ categories: [] });
  }

  const categoryIds = Array.from(counts.keys());

  const categoriesResult = await payload.find({
    collection: 'categories',
    where: {
      id: { in: categoryIds },
    },
    limit: categoryIds.length,
    sort: 'name',
  });

  const summaries: { id: number; name: string; eventCount: number }[] = [];

  for (const cat of categoriesResult.docs as Category[]) {
    const count = counts.get(cat.id) ?? 0;
    if (count === 0) continue;
    summaries.push({
      id: cat.id,
      name: cat.name,
      eventCount: count,
    });
  }

  summaries.sort((a, b) => {
    if (b.eventCount !== a.eventCount) {
      return b.eventCount - a.eventCount;
    }
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({ categories: summaries });
}

