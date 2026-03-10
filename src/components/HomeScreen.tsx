'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Page, Navbar, Toolbar, TabbarLink, Icon, Block } from 'konsta/react';
import { getEvents } from '@/lib/api';
import type { Event } from '@/lib/types';
import { EventCard } from './EventCard';
import { EventCardSkeleton } from './EventCardSkeleton';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
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

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  useEffect(() => {
    // Only update the visible category set when no specific category
    // is selected, so tabbing through categories doesn't shrink the list.
    if (categoryId === null) {
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
    }
  }, [events, categoryId]);

  // When resetKey changes (e.g. via navbar logo), clear the local
  // search/category context so the feed returns to its default state.
  useEffect(() => {
    setSearch('');
    setCategoryId(null);
  }, [resetKey]);

  // Direction-aware slide when category changes (index = position in filter pills: All=0, then visibleCategoryIds order)
  const categoryIndex =
    categoryId === null
      ? 0
      : 1 + visibleCategoryIds.indexOf(categoryId);
  const prevCategoryIndexRef = useRef(categoryIndex);
  const [categorySlideFromRight, setCategorySlideFromRight] = useState(true);
  const [categoryContentEntered, setCategoryContentEntered] = useState(true);

  useEffect(() => {
    if (prevCategoryIndexRef.current !== categoryIndex) {
      setCategorySlideFromRight(categoryIndex > prevCategoryIndexRef.current);
      prevCategoryIndexRef.current = categoryIndex;
      setCategoryContentEntered(false);
    }
  }, [categoryIndex]);

  useEffect(() => {
    if (categoryContentEntered) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setCategoryContentEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [categoryContentEntered]);

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
          onSelect={setCategoryId}
          allowedCategoryIds={events.length > 0 && visibleCategoryIds.length > 0 ? visibleCategoryIds : undefined}
        />

        <div className="overflow-hidden">
          <div
            key={`feed-${categoryId ?? 'all'}`}
            className={`category-content-transition ${categoryContentEntered ? 'translate-x-0 opacity-100' : categorySlideFromRight ? 'translate-x-4 opacity-0' : '-translate-x-4 opacity-0'}`}
          >
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
              <div className="py-12 text-center">
                <p className="text-riot-text-secondary">No upcoming events</p>
              </div>
            )}

            {!loading && !error && events.length > 0 && (
              <div className="space-y-8">
                {monthGroups.map((group) => (
                  <section
                    key={group.monthLabel}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-riot-text-secondary lg:text-sm">
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
            <span className="text-lg font-bold uppercase tracking-wider text-white [font-family:Futura,_system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text',sans-serif]">
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
