'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from 'next-view-transitions';
import { Page, Navbar } from 'konsta/react';
import { LexicalRenderer } from '@/lib/lexical';
import type { Event, Media, Venue, Category, Organizer } from '@/lib/types';

// -- Desktop nav icons (mirrors HomeScreen) --

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

function getMedia(media: Event['featuredImage']): Media | null {
  if (!media || typeof media === 'number') return null;
  return media as Media;
}

function getVenue(venue: Event['venue']): Venue | null {
  if (!venue || typeof venue === 'number') return null;
  return venue as Venue;
}

function getCategories(cats: Event['categories']): Category[] {
  if (!cats) return [];
  return cats.filter((c): c is Category => typeof c !== 'number');
}

function getOrganizers(orgs: Event['organizers']): Organizer[] {
  if (!orgs) return [];
  return orgs.filter((o): o is Organizer => typeof o !== 'number');
}

function formatDateTime(
  startStr: string,
  endStr?: string | null,
  isAllDay?: boolean | null,
  timezone?: string | null
) {
  const start = new Date(startStr);
  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };

  const datePart = start.toLocaleDateString('en-US', dateOpts);

  if (isAllDay) {
    return { date: datePart, time: 'All Day' };
  }

  const timePart = start.toLocaleTimeString('en-US', timeOpts);
  let timeRange = timePart;

  if (endStr) {
    const end = new Date(endStr);
    timeRange += ` – ${end.toLocaleTimeString('en-US', timeOpts)}`;
  }

  if (timezone) {
    timeRange += ` (${timezone.replace(/_/g, ' ').split('/').pop()})`;
  }

  return { date: datePart, time: timeRange };
}

function formatAddress(venue: Venue): string {
  const parts = [
    venue.address?.street,
    venue.address?.city,
    venue.address?.state,
    venue.address?.country,
  ].filter(Boolean);
  return parts.join(', ');
}

const navbarColors = {
  bgIos: 'bg-riot-black',
  textIos: 'text-white',
  bgMaterial: 'bg-riot-black',
  textMaterial: 'text-white',
};

interface EventDetailProps {
  event: Event;
}

export function EventDetail({ event }: EventDetailProps) {
  const [saved, setSaved] = useState(false);
  const media = getMedia(event.featuredImage);
  const imageUrl = media?.sizes?.feature?.url ?? media?.url ?? null;
  const venue = getVenue(event.venue);
  const categories = getCategories(event.categories);
  const organizers = getOrganizers(event.organizers);
  const { date, time } = formatDateTime(
    event.startDateTime,
    event.endDateTime,
    event.isAllDay,
    event.timezone
  );
  const isCancelled = event.status === 'cancelled';
  const isPostponed = event.status === 'postponed';

  return (
    <Page>
      <Navbar
        className="riot-navbar"
        colors={navbarColors}
        centerTitle={false}
        title={
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-lg font-bold uppercase tracking-wider text-white [font-family:Futura,_system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text',sans-serif]">
              Events
            </span>
          </Link>
        }
        right={
          <div className="hidden items-center gap-5 pr-2 lg:flex">
            {tabs.map((tab) => {
              const TabIcon = iconMap[tab.id];
              return (
                <Link
                  key={tab.id}
                  href="/"
                  className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-white/70 transition-colors hover:text-white"
                >
                  <TabIcon active={false} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        }
      />

      <div className="main-content-below-navbar px-4 pb-28 lg:pt-8">
        {/* Hero image (view-transition-name matches EventCard for shared-element morph) */}
        <div
          className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-riot-black to-riot-black/70 lg:mx-auto lg:max-w-5xl lg:aspect-[16/9]"
          style={{ viewTransitionName: `event-hero-${event.slug}` }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={media?.alt ?? event.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 960px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/riot_logo.png"
                alt=""
                width={64}
                height={64}
                className="opacity-20"
              />
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={() => setSaved(!saved)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm lg:top-6"
            aria-label={saved ? 'Remove from saved' : 'Save event'}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={saved ? '#E91E63' : 'none'}
              stroke={saved ? '#E91E63' : '#ffffff'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="mx-auto mt-5 max-w-5xl">
          {/* Status badge */}
          {(isCancelled || isPostponed) && (
            <div className="mb-3">
              <span
                className={`inline-block rounded px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white ${
                  isCancelled ? 'bg-red-600' : 'bg-amber-600'
                }`}
              >
                {isCancelled ? 'Cancelled' : 'Postponed'}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-2xl font-bold leading-tight text-riot-text">
            {event.title}
          </h1>

          {/* Date & Time */}
          <div className="mt-4 flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-riot-pink/10">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E91E63"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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
            </div>
            <div>
              <p className="text-sm font-semibold text-riot-text">{date}</p>
              <p className="text-sm text-riot-text-secondary">{time}</p>
            </div>
          </div>

          {/* Venue */}
          {venue && (
            <div className="mt-4 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-riot-pink/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E91E63"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle
                    cx="12"
                    cy="10"
                    r="3"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-riot-text">
                  {venue.name}
                </p>
                {venue.address && (
                  <p className="text-sm text-riot-text-secondary">
                    {formatAddress(venue)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Virtual event */}
          {event.isVirtual && event.virtualUrl && (
            <div className="mt-4 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-riot-pink/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E91E63"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div className="flex items-center">
                <a
                  href={event.virtualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-riot-pink"
                >
                  Join Virtual Event
                </a>
              </div>
            </div>
          )}

          {/* Organizers */}
          {organizers.length > 0 && (
            <div className="mt-4 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-riot-pink/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E91E63"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                  />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-riot-text">
                  {organizers.map((o) => o.name).join(', ')}
                </p>
                <p className="text-sm text-riot-text-secondary">Organizer</p>
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded bg-riot-pink px-3 py-1 text-xs font-medium uppercase tracking-wide text-white"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="mt-6">
              <h2 className="font-display mb-2 text-lg font-semibold text-riot-text">
                About
              </h2>
              <LexicalRenderer
                content={event.description}
                className="text-sm leading-relaxed text-riot-text-secondary"
              />
            </div>
          )}

          {/* Actions */}
          {event.website && (
            <div className="mt-6">
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-riot-pink py-3.5 text-center text-sm font-semibold text-white active:opacity-80"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
