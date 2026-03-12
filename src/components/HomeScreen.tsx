'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Page, Navbar, Toolbar, TabbarLink, Icon, Block } from 'konsta/react';
import { getEvents, getEventCategoriesForQuery } from '@/lib/api';
import type { Event } from '@/lib/types';
import { EventCard } from './EventCard';
import { EventCardSkeleton } from './EventCardSkeleton';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { EmptyState } from './EmptyState';
import { SearchScreen } from './SearchScreen';
import { SavedScreen } from './SavedScreen';
import { ProfileScreen } from './ProfileScreen';

// -- Tab icons --

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? 'text-riot-pink' : 'text-white'}
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
      />
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
      />
      <line
        x1="8"
        y1="2"
        x2="8"
        y2="6"
      />
      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
      />
    </svg>
  );
}

function SearchTabIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? 'text-riot-pink' : 'text-white'}
    >
      <circle
        cx="11"
        cy="11"
        r="8"
      />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
      />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? 'text-riot-pink' : 'text-white'}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? 'text-riot-pink' : 'text-white'}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle
        cx="12"
        cy="7"
        r="4"
      />
    </svg>
  );
}

const iconMap = {
  events: CalendarIcon,
  search: SearchTabIcon,
  saved: HeartIcon,
  profile: UserIcon,
} as const;

const tabs = [
  { id: 'events', label: 'Events' },
  { id: 'search', label: 'Search' },
  { id: 'saved', label: 'Saved' },
  { id: 'profile', label: 'Profile' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const tabOrder: TabId[] = ['events', 'search', 'saved', 'profile'];

const navbarColors = {
  bgIos: 'bg-riot-black',
  textIos: 'text-white',
  bgMaterial: 'bg-riot-black',
  textMaterial: 'text-white',
};

const tabbarColors = {
  bgIos: 'bg-riot-black',
};

// -- Events Feed --

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
  const [queryCategoryIds, setQueryCategoryIds] = useState<number[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const eventsRequestIdRef = useRef(0);
  const categoriesRequestIdRef = useRef(0);

  const fetchEvents = useCallback(
    async ({
      pageToLoad,
      mode,
    }: {
      pageToLoad: number;
      mode: 'reset' | 'append';
    }) => {
      const isReset = mode === 'reset';
      const requestId = ++eventsRequestIdRef.current;

      if (isReset) {
        setLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
        setLoadMoreError(null);
      }

      try {
        const result = await getEvents({
          search: search || undefined,
          categoryId: categoryId ?? undefined,
          page: pageToLoad,
        });
        const incoming = result.docs ?? [];

        // Ignore stale responses for older requests
        if (eventsRequestIdRef.current !== requestId) return;

        if (isReset) {
          setEvents(incoming);
        } else {
          // Append: only add truly new events to avoid duplicates.
          setEvents((prev) => {
            if (incoming.length === 0) return prev;

            const existingIds = new Set(prev.map((e) => e.id));
            const newDocs = incoming.filter((e) => !existingIds.has(e.id));
            if (newDocs.length === 0) return prev;

            return [...prev, ...newDocs];
          });
        }

        const hasMoreFromBackend =
          result.hasNextPage && result.nextPage != null;
        setPage(result.page);
        setHasNextPage(hasMoreFromBackend);
        setNextPage(hasMoreFromBackend ? result.nextPage! : null);
      } catch (err) {
        if (eventsRequestIdRef.current !== requestId) return;

        const message = err instanceof Error ? err.message : 'Failed to load events';
        if (isReset) {
          setError(message);
        } else {
          setLoadMoreError(message);
        }
      } finally {
        if (eventsRequestIdRef.current !== requestId) return;

        if (isReset) setLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [search, categoryId]
  );

  useEffect(() => {
    // Whenever the search or category changes, restart pagination from page 1
    // and let the caller decide how to refresh categories.
    setEvents([]);
    setPage(1);
    setHasNextPage(true);
    setNextPage(null);
    eventsRequestIdRef.current += 1; // invalidate in-flight requests

    fetchEvents({ pageToLoad: 1, mode: 'reset' });
  }, [fetchEvents]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const handleCategorySelect = useCallback((id: number | null) => {
    setCategoryId(id);
  }, []);

  // Preload categories for the current query whenever search/category change.
  useEffect(() => {
    const requestId = ++categoriesRequestIdRef.current;
    setQueryCategoryIds(null);

    getEventCategoriesForQuery({
      search: search || undefined,
      categoryId: categoryId ?? undefined,
    })
      .then((categories) => {
        if (categoriesRequestIdRef.current !== requestId) return;
        setQueryCategoryIds(categories.map((c) => c.id));
      })
      .catch(() => {
        if (categoriesRequestIdRef.current !== requestId) return;
        setQueryCategoryIds(null);
      });
  }, [search, categoryId]);

  useEffect(() => {
    // Derive category IDs from the currently loaded events as a fallback
    // when we don't yet have query-level category data.
    if (queryCategoryIds != null) return;

    const ids = new Set<number>();
    events.forEach((event) => {
      event.categories?.forEach((cat) => {
        if (typeof cat === 'number') {
          ids.add(cat);
        } else if (cat && typeof cat === 'object') {
          ids.add(cat.id);
        }
      });
    });
    setVisibleCategoryIds(Array.from(ids));
  }, [events, queryCategoryIds]);

  // When resetKey changes (e.g. via navbar logo), clear the local
  // search/category context so the feed returns to its default state.
  useEffect(() => {
    setSearch('');
    setCategoryId(null);
    setQueryCategoryIds(null);
    // The fetch effect above is keyed on search/category and will
    // reset pagination and refetch page 1 automatically.
  }, [resetKey]);

  useEffect(() => {
    if (!hasNextPage) return;

    const node = loadMoreRef.current;
    if (!node) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (loading || isLoadingMore || !hasNextPage || !nextPage) return;

        fetchEvents({ pageToLoad: nextPage, mode: 'append' });
      },
      {
        root: null,
        // Start loading a bit before the sentinel fully enters view
        // to avoid hitching at the exact bottom of the viewport.
        rootMargin: '0px 0px 300px 0px',
        threshold: 0,
      }
    );

    observerRef.current = observer;
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (observerRef.current === observer) {
        observerRef.current = null;
      }
    };
  }, [hasNextPage, loading, isLoadingMore, fetchEvents, nextPage]);

  const monthGroups =
    !loading && !error
      ? events.reduce<
          {
            monthLabel: string;
            events: Event[];
          }[]
        >((groups, event) => {
          const date = new Date(event.startDateTime);
          const monthLabel = date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });

          const lastGroup = groups[groups.length - 1];
          if (!lastGroup || lastGroup.monthLabel !== monthLabel) {
            groups.push({ monthLabel, events: [event] });
          } else {
            lastGroup.events.push(event);
          }

          return groups;
        }, [])
      : [];

  return (
    <div className="px-4 pt-6 pb-24 lg:pb-14">
      <div className="mx-auto max-w-4xl space-y-4">
        <SearchBar onSearch={handleSearch} onFocus={onOpenSearch} />
        <CategoryFilter
          activeCategoryId={categoryId}
          onSelect={handleCategorySelect}
          allowedCategoryIds={queryCategoryIds ?? visibleCategoryIds}
        />

        <div className="overflow-hidden">
          <div key={`feed-${categoryId ?? 'all'}`}>
            {loading && (
              <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && (
              <Block
                strong
                inset
                className="!bg-red-50"
              >
                <p className="text-sm text-red-600">{error}</p>
              </Block>
            )}

            {!loading && !error && events.length === 0 && (
              <EmptyState
                title={search.trim() || categoryId ? 'No events match your search' : 'No upcoming events'}
                description={
                  search.trim() || categoryId
                    ? 'Try a different search or category.'
                    : 'Check back later for new events.'
                }
                icon="calendar"
                action={
                  search.trim() || categoryId
                    ? {
                        label: 'Clear search',
                        onClear: () => {
                          setSearch('');
                          setCategoryId(null);
                        },
                      }
                    : undefined
                }
              />
            )}

            {!loading && !error && events.length > 0 && (
              <div className="space-y-8">
                {monthGroups.map((group) => (
                  <section
                    key={group.monthLabel}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.21em] text-riot-text-secondary lg:text-sm">
                        {group.monthLabel}
                      </h2>
                    </div>
                    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                      {group.events.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                        />
                      ))}
                    </div>
                  </section>
                ))}
                {hasNextPage && (
                  <div
                    ref={loadMoreRef}
                    className="h-8 w-full"
                  />
                )}
                {isLoadingMore && (
                  <p className="mt-4 text-center text-xs text-riot-text-secondary">
                    Loading more events...
                  </p>
                )}
                {loadMoreError && (
                  <Block
                    strong
                    inset
                    className="mt-4 !bg-red-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-red-600">{loadMoreError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasNextPage && !isLoadingMore && nextPage) {
                            fetchEvents({ pageToLoad: nextPage, mode: 'append' });
                          }
                        }}
                        className="text-sm font-medium text-red-700 underline"
                      >
                        Retry
                      </button>
                    </div>
                  </Block>
                )}
                {!hasNextPage && events.length > 0 && (
                  <p className="mt-4 text-center text-xs text-riot-text-secondary">
                    You&apos;ve reached the end of the list.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Placeholder tabs --

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 pt-20 pb-24">
      <p className="text-riot-text-secondary">{label}</p>
    </div>
  );
}

// -- Main screen --

export function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('events');
  const [eventsResetKey, setEventsResetKey] = useState(0);
  const [searchFocusKey, setSearchFocusKey] = useState(0);
  const [tabEntered, setTabEntered] = useState(true);
  const [slideFromRight, setSlideFromRight] = useState(true);
  const prevTabIndexRef = useRef(0);

  const tabIndex = tabOrder.indexOf(activeTab);
  useEffect(() => {
    if (prevTabIndexRef.current !== tabIndex) {
      setSlideFromRight(tabIndex > prevTabIndexRef.current);
      prevTabIndexRef.current = tabIndex;
      setTabEntered(false);
    }
  }, [tabIndex]);

  useEffect(() => {
    if (tabEntered) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTabEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [tabEntered, activeTab]);

  // Scroll to top when switching tabs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  return (
    <Page>
      <Navbar
        className="riot-navbar"
        colors={navbarColors}
        centerTitle={false}
        title={
          <button
            type="button"
            onClick={() => {
              setActiveTab('events');
              setEventsResetKey((key) => key + 1);
            }}
            className="flex items-center gap-2"
          >
            <Image
              src="/riot_logo.png"
              alt="RIOT"
              width={28}
              height={28}
            />
            <span className="font-brand text-lg font-bold uppercase tracking-wider text-white">
              RIOT
            </span>
          </button>
        }
        right={
          <div className="hidden items-center gap-5 pr-2 lg:flex !bg-transparent !shadow-none !backdrop-blur-0">
            {tabs.map((tab) => {
              const TabIcon = iconMap[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'search') {
                      setSearchFocusKey((key) => key + 1);
                    }
                  }}
                  className={`flex items-center gap-1 !bg-transparent text-xs font-medium uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'text-riot-pink'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <TabIcon active={isActive} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        }
      />

      <div className="main-content-below-navbar overflow-hidden">
        <div
          key={activeTab}
          className={`tab-pane-transition ${tabEntered ? 'translate-x-0 opacity-100' : slideFromRight ? 'translate-x-3 opacity-0' : '-translate-x-3 opacity-0'}`}
        >
          {activeTab === 'events' && (
            <EventsFeed
              resetKey={eventsResetKey}
              onOpenSearch={() => {
                setActiveTab('search');
                setSearchFocusKey((k) => k + 1);
              }}
            />
          )}
          {activeTab === 'search' && <SearchScreen focusKey={searchFocusKey} />}
          {activeTab === 'saved' && <SavedScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
        </div>
      </div>

      <Toolbar
        tabbar
        tabbarLabels
        colors={tabbarColors}
        className="left-0 bottom-0 fixed lg:hidden"
      >
        {tabs.map((tab) => {
          const TabIcon = iconMap[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <TabbarLink
              key={tab.id}
              active={isActive}
              onClick={() => setActiveTab(tab.id)}
              colors={{
                textIos: 'text-white/60',
                textActiveIos: 'text-riot-pink',
              }}
              label={tab.label}
              icon={
                <Icon>
                  <TabIcon active={isActive} />
                </Icon>
              }
            />
          );
        })}
      </Toolbar>
    </Page>
  );
}
