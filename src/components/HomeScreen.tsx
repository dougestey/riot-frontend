'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Page,
  Navbar,
  Tabbar,
  TabbarLink,
  Icon,
  ToolbarPane,
} from 'konsta/react';
import { SearchScreen } from './SearchScreen';
import { SavedScreen } from './SavedScreen';
import { ProfileScreen } from './ProfileScreen';
import { EventsScreen } from './EventsScreen';

// -- Tab icons --

type TabIconTone = 'light' | 'dark';

function CalendarIcon({
  active,
  tone = 'light',
}: {
  active: boolean;
  tone?: TabIconTone;
}) {
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
      className={
        active
          ? 'text-riot-pink'
          : tone === 'dark'
            ? 'text-black/70'
            : 'text-white'
      }
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

function SearchTabIcon({
  active,
  tone = 'light',
}: {
  active: boolean;
  tone?: TabIconTone;
}) {
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
      className={
        active
          ? 'text-riot-pink'
          : tone === 'dark'
            ? 'text-black/70'
            : 'text-white'
      }
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

function HeartIcon({
  active,
  tone = 'light',
}: {
  active: boolean;
  tone?: TabIconTone;
}) {
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
      className={
        active
          ? 'text-riot-pink'
          : tone === 'dark'
            ? 'text-black/70'
            : 'text-white'
      }
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UserIcon({
  active,
  tone = 'light',
}: {
  active: boolean;
  tone?: TabIconTone;
}) {
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
      className={
        active
          ? 'text-riot-pink'
          : tone === 'dark'
            ? 'text-black/70'
            : 'text-white'
      }
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
            className="flex items-center gap-2 cursor-pointer"
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
                  className={`flex items-center gap-1 !bg-transparent text-xs font-medium uppercase tracking-wide transition-colors cursor-pointer ${
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
            <EventsScreen
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

      <Tabbar
        labels
        icons
        className="left-0 bottom-0 fixed lg:hidden"
      >
        <ToolbarPane>
          {tabs.map((tab) => {
            const TabIcon = iconMap[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <TabbarLink
                key={tab.id}
                active={isActive}
                onClick={() => setActiveTab(tab.id)}
                colors={{
                  textIos: 'text-black/70',
                  textActiveIos: 'text-riot-pink',
                }}
                label={tab.label}
                icon={
                  <Icon>
                    <TabIcon
                      active={isActive}
                      tone="dark"
                    />
                  </Icon>
                }
              />
            );
          })}
        </ToolbarPane>
      </Tabbar>
    </Page>
  );
}
