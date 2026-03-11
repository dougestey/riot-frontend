'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Category, Event } from '@/lib/types';
import { getEvents } from '@/lib/api';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { EmptyState } from './EmptyState';
import { EventCard } from './EventCard';
import { EventCardSkeleton } from './EventCardSkeleton';

const RECENT_SEARCHES_KEY = 'riot_recent_searches_v1';
const MAX_RECENT_SEARCHES = 5;

function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as string[]).slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {
    // ignore quota / privacy errors
  }
}

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

        if (hasQuery) {
          const trimmed = query.trim();
          setRecent((prev) => {
            const next = [trimmed, ...prev.filter((v) => v !== trimmed)];
            saveRecentSearches(next);
            return next;
          });
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Failed to search events'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [query, hasQuery, categoryId]);

  useEffect(() => {
    // Recompute visible categories only when no specific category
    // is selected so that tabbing through categories doesn't shrink the list.
    if (categoryId === null) {
      const ids = new Set<number>();
      events.forEach((event) => {
        event.categories?.forEach((cat) => {
          if (typeof cat === 'number') {
            ids.add(cat);
          } else if (cat && typeof cat === 'object') {
            ids.add((cat as Category).id);
          }
        });
      });
      setVisibleCategoryIds(Array.from(ids));
    }
  }, [events, categoryId]);

  const placeholderText = useMemo(() => {
    if (categoryId && !hasQuery) return 'Search within this category...';
    return 'Search events...';
  }, [categoryId, hasQuery]);

  const handleClear = useCallback(() => {
    setQuery('');
    setCategoryId(null);
    setEvents([]);
    setError(null);
    setVisibleCategoryIds([]);
    setSearchInputKey((key) => key + 1);
  }, []);

  const showResults =
    !loading && !error && (events.length > 0 || hasQuery || !!categoryId);

  return (
    <div className="px-4 pt-6 pb-24 lg:pb-14">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                key={searchInputKey}
                onSearch={handleSearch}
                placeholder={placeholderText}
                initialValue={query}
                autoFocusKey={focusKey}
              />
            </div>
            {(hasQuery || categoryId || events.length > 0) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-riot-text-secondary underline-offset-2 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <CategoryFilter
            activeCategoryId={categoryId}
            onSelect={setCategoryId}
            allowedCategoryIds={hasQuery ? visibleCategoryIds : undefined}
          />
        </div>

        {!hasQuery && !categoryId && recent.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.21em] text-riot-text-secondary">
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="rounded border border-riot-pink/40 px-3 py-1 text-xs font-semibold text-riot-pink"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="overflow-hidden">
          <div key={`search-feed-${categoryId ?? 'all'}`}>
            {loading && (
              <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              (hasQuery || categoryId) &&
              events.length === 0 && (
                <EmptyState
                  title="No events match your search"
                  description="Try a different search or category."
                  icon="search"
                  action={{ label: 'Clear search', onClear: handleClear }}
                />
              )}

            {showResults && events.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.21em] text-riot-text-secondary">
                  Results
                </h2>
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                    />
                  ))}
                </div>
              </section>
            )}

            {!loading &&
              !error &&
              !hasQuery &&
              !categoryId &&
              events.length === 0 &&
              recent.length === 0 && (
                <p className="text-sm text-riot-text-secondary">
                  Start typing to search for events or filter by category.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
