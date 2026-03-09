'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  Page,
  Navbar,
  Toolbar,
  TabbarLink,
  Icon,
  Preloader,
  Block,
} from 'konsta/react';
import { getEvents } from '@/lib/api';
import type { Event } from '@/lib/types';
import { EventCard } from './EventCard';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';

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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
      <circle cx="12" cy="7" r="4" />
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

const navbarColors = {
  bgIos: 'bg-riot-black',
  textIos: 'text-white',
};

const tabbarColors = {
  bgIos: 'bg-riot-black',
};

// -- Events Feed --

function EventsFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
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

  return (
    <div className="space-y-4 px-4 pt-4 pb-24">
      <SearchBar onSearch={handleSearch} />
      <CategoryFilter
        activeCategoryId={categoryId}
        onSelect={setCategoryId}
      />

      {loading && (
        <div className="flex justify-center py-12">
          <Preloader />
        </div>
      )}

      {error && (
        <Block strong inset className="!bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </Block>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-riot-text-secondary">No upcoming events</p>
        </div>
      )}

      {!loading &&
        !error &&
        events.map((event) => <EventCard key={event.id} event={event} />)}
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

  return (
    <Page>
      <Navbar
        colors={navbarColors}
        centerTitle={false}
        title={
          <div className="flex items-center gap-2">
            <Image
              src="/riot_logo.png"
              alt="RIOT"
              width={28}
              height={28}
            />
            <span className="font-display text-lg font-bold uppercase tracking-wider text-white">
              RIOT
            </span>
          </div>
        }
      />

      {activeTab === 'events' && <EventsFeed />}
      {activeTab === 'search' && <PlaceholderTab label="Search coming soon" />}
      {activeTab === 'saved' && (
        <PlaceholderTab label="Sign in to see saved events" />
      )}
      {activeTab === 'profile' && (
        <PlaceholderTab label="Sign in to view your profile" />
      )}

      <Toolbar
        tabbar
        tabbarLabels
        colors={tabbarColors}
        className="left-0 bottom-0 fixed"
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
