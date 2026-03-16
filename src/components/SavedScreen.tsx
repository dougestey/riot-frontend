'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSavedEvents } from '@/lib/saved-events';
import { AuthSheet } from './AuthSheet';
import { EventCard } from './EventCard';
import { EventCardSkeleton } from './EventCardSkeleton';
import { EmptyState } from './EmptyState';
import type { Event } from '@/lib/types';

export function SavedScreen() {
  const { user, loading: authLoading } = useAuth();
  const { savedEvents, loading: savedLoading } = useSavedEvents();
  const [showAuth, setShowAuth] = useState(false);

  // Loading auth state
  if (authLoading) {
    return (
      <div className="px-4 pt-6 pb-32 lg:pb-16">
        <div className="mx-auto max-w-4xl space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <>
        <div className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-center px-6 pb-32 pt-16 lg:min-h-[calc(100vh-96px)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-riot-pink/10">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E91E63"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-base font-semibold text-riot-text">
              Sign in to save events
            </h1>
            <p className="mt-2 text-sm text-riot-text-secondary">
              Keep track of the events you care about and quickly find them
              later.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="mt-6 rounded-full bg-riot-pink px-6 py-2.5 text-sm font-semibold text-white shadow-sm cursor-pointer active:opacity-85"
          >
            Sign In
          </button>
        </div>

        <AuthSheet opened={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  // Logged in — loading saved events
  if (savedLoading) {
    return (
      <div className="px-4 pt-6 pb-32 lg:pb-16">
        <div className="mx-auto max-w-4xl space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // No saved events
  if (savedEvents.length === 0) {
    return (
      <EmptyState
        title="No saved events yet"
        description="Tap the heart icon on any event to save it here."
        icon="calendar"
      />
    );
  }

  // Saved events list
  return (
    <div className="px-4 pt-6 pb-32 lg:pb-16">
      <div className="mx-auto max-w-4xl space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.21em] text-riot-text-secondary lg:text-sm">
          Saved Events
        </h2>
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {savedEvents.map((saved) => {
            const event =
              typeof saved.event === 'number' ? null : (saved.event as Event);
            if (!event) return null;
            return <EventCard key={saved.id} event={event} />;
          })}
        </div>
      </div>
    </div>
  );
}
