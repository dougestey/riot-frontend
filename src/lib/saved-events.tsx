'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth';
import { getSavedEvents, saveEvent, unsaveEvent } from './api';
import type { SavedEvent } from './payload-types';

interface SavedEventsContextValue {
  /** Full saved event records (with populated event data) */
  savedEvents: SavedEvent[];
  /** Quick lookup: is this event ID saved? */
  isSaved: (eventId: number) => boolean;
  /** Toggle save state — saves if unsaved, removes if saved. Returns new state. */
  toggleSave: (eventId: number) => Promise<boolean>;
  /** True during initial fetch */
  loading: boolean;
  /** Refetch from server */
  refresh: () => Promise<void>;
}

const SavedEventsContext = createContext<SavedEventsContextValue | null>(null);

export function SavedEventsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Map of eventId -> savedEvent.id for quick lookup and deletion
  const savedMap = new Map<number, number>();
  for (const se of savedEvents) {
    const eventId = typeof se.event === 'number' ? se.event : se.event.id;
    savedMap.set(eventId, se.id);
  }

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docs = await getSavedEvents(user.id);
      setSavedEvents(docs);
    } catch {
      // Silent fail — saved state is non-critical
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setSavedEvents([]);
    }
  }, [user, refresh]);

  const isSaved = useCallback(
    (eventId: number) => savedMap.has(eventId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedEvents],
  );

  const toggleSave = useCallback(
    async (eventId: number) => {
      const existingSavedId = savedMap.get(eventId);

      if (existingSavedId) {
        // Optimistic remove
        setSavedEvents((prev) => prev.filter((se) => se.id !== existingSavedId));
        try {
          await unsaveEvent(existingSavedId);
        } catch {
          // Revert on failure
          await refresh();
        }
        return false;
      } else {
        // Save — need server response for the new record
        try {
          await saveEvent(eventId);
          // Refetch to get fully populated event data
          await refresh();
          return true;
        } catch {
          return false;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedEvents, refresh],
  );

  return (
    <SavedEventsContext
      value={{ savedEvents, isSaved, toggleSave, loading, refresh }}
    >
      {children}
    </SavedEventsContext>
  );
}

export function useSavedEvents(): SavedEventsContextValue {
  const ctx = useContext(SavedEventsContext);
  if (!ctx) {
    throw new Error(
      'useSavedEvents must be used within a SavedEventsProvider',
    );
  }
  return ctx;
}
