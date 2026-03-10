'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from 'next-view-transitions';
import type { Event, Media, Venue, Category } from '@/lib/types';

function getMediaUrl(media: Event['featuredImage']): string | null {
  if (!media || typeof media === 'number') return null;
  return (media as Media).sizes?.card?.url ?? (media as Media).url ?? null;
}

function getMediaAlt(media: Event['featuredImage']): string {
  if (!media || typeof media === 'number') return '';
  return (media as Media).alt ?? '';
}

function getVenue(venue: Event['venue']): Venue | null {
  if (!venue || typeof venue === 'number') return null;
  return venue as Venue;
}

function getCategories(cats: Event['categories']): Category[] {
  if (!cats) return [];
  return cats.filter((c): c is Category => typeof c !== 'number');
}

function formatDateTag(dateStr: string) {
  const date = new Date(dateStr);
  const weekday = date
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toUpperCase();
  const day = date.getDate();
  return { weekday, day };
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [saved, setSaved] = useState(false);
  const imageUrl = getMediaUrl(event.featuredImage);
  const imageAlt = getMediaAlt(event.featuredImage);
  const venue = getVenue(event.venue);
  const categories = getCategories(event.categories);
  const { weekday, day } = formatDateTag(event.startDateTime);
  const isCancelled = event.status === 'cancelled';
  const isPostponed = event.status === 'postponed';

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      {/* Image + date tag + favorite (view-transition-name for shared-element morph) */}
      <div
        className="relative aspect-[16/9] bg-gradient-to-br from-riot-black to-riot-black/70"
        style={{ viewTransitionName: `event-hero-${event.slug}` }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/riot_logo.png"
              alt=""
              width={48}
              height={48}
              className="opacity-20"
            />
          </div>
        )}

        {/* Date tag */}
        <div className="absolute top-3 left-3 flex flex-col items-center rounded-lg bg-white/90 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-riot-text-secondary">
            {weekday}
          </span>
          <span className="font-display text-xl font-bold leading-tight text-riot-text">
            {day}
          </span>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSaved(!saved);
          }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
          aria-label={saved ? 'Remove from saved' : 'Save event'}
        >
          <svg
            width="18"
            height="18"
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

        {/* Status badge overlay */}
        {(isCancelled || isPostponed) && (
          <div className="absolute bottom-3 left-3">
            <span
              className={`rounded px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${
                isCancelled ? 'bg-red-600' : 'bg-amber-600'
              }`}
            >
              {isCancelled ? 'Cancelled' : 'Postponed'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold leading-tight text-riot-text">
          {event.title}
        </h3>

        {venue && (
          <p className="mt-1 text-sm text-riot-text-secondary">
            {venue.name}
            {venue.address?.city && ` · ${venue.address.city}`}
          </p>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded bg-riot-pink px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
