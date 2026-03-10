'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { User, SavedEvent, Event } from '@/lib/types';
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  fetchSavedEvents,
  saveEvent,
  unsaveEvent,
} from '@/lib/auth-api';
import { AuthSheet } from '@/components/AuthSheet';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  savedEventIds: Set<number>;
  savedEvents: SavedEvent[];
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  toggleSaveEvent: (eventId: number) => Promise<void>;
  openAuthSheet: (mode: 'login' | 'register') => void;
  closeAuthSheet: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function buildSavedState(events: SavedEvent[]) {
  const ids = new Set<number>();
  const map = new Map<number, number>();
  for (const se of events) {
    const eventId =
      typeof se.event === 'number' ? se.event : (se.event as Event).id;
    ids.add(eventId);
    map.set(eventId, se.id);
  }
  return { ids, map };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<Set<number>>(new Set());
  const [savedEventsMap, setSavedEventsMap] = useState<Map<number, number>>(
    new Map()
  );
  const [authSheet, setAuthSheet] = useState<'login' | 'register' | null>(
    null
  );
  const inflightRef = useRef<Set<number>>(new Set());

  const loadSavedEvents = useCallback(async () => {
    try {
      const events = await fetchSavedEvents();
      setSavedEvents(events);
      const { ids, map } = buildSavedState(events);
      setSavedEventIds(ids);
      setSavedEventsMap(map);
    } catch {
      // silently fail — user may not have saved events
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await fetchCurrentUser();
      if (cancelled) return;
      setUser(u);
      if (u) await loadSavedEvents();
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadSavedEvents]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u } = await loginUser(email, password);
      setUser(u);
      setAuthSheet(null);
      await loadSavedEvents();
    },
    [loadSavedEvents]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const { user: u } = await registerUser(data);
      setUser(u);
      setAuthSheet(null);
      await loadSavedEvents();
    },
    [loadSavedEvents]
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setSavedEvents([]);
    setSavedEventIds(new Set());
    setSavedEventsMap(new Map());
  }, []);

  const toggleSaveEvent = useCallback(
    async (eventId: number) => {
      if (!user) {
        setAuthSheet('login');
        return;
      }

      if (inflightRef.current.has(eventId)) return;
      inflightRef.current.add(eventId);

      const wasSaved = savedEventIds.has(eventId);
      const savedEventDocId = savedEventsMap.get(eventId);

      // Optimistic update
      if (wasSaved) {
        setSavedEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        setSavedEventsMap((prev) => {
          const next = new Map(prev);
          next.delete(eventId);
          return next;
        });
        setSavedEvents((prev) => prev.filter((se) => se.id !== savedEventDocId));
      } else {
        setSavedEventIds((prev) => new Set(prev).add(eventId));
      }

      try {
        if (wasSaved && savedEventDocId) {
          await unsaveEvent(savedEventDocId);
        } else {
          const created = await saveEvent(eventId);
          setSavedEvents((prev) => [created, ...prev]);
          setSavedEventsMap((prev) => new Map(prev).set(eventId, created.id));
        }
      } catch {
        // Rollback on error
        await loadSavedEvents();
      } finally {
        inflightRef.current.delete(eventId);
      }
    },
    [user, savedEventIds, savedEventsMap, loadSavedEvents]
  );

  const openAuthSheet = useCallback((mode: 'login' | 'register') => {
    setAuthSheet(mode);
  }, []);

  const closeAuthSheet = useCallback(() => {
    setAuthSheet(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        savedEventIds,
        savedEvents,
        login,
        register,
        logout,
        toggleSaveEvent,
        openAuthSheet,
        closeAuthSheet,
      }}
    >
      {children}
      <AuthSheet mode={authSheet} />
    </AuthContext.Provider>
  );
}
