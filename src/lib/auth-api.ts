'use client';

import type { User, SavedEvent } from '@/lib/types';

function parseError(data: unknown): string {
  if (
    data &&
    typeof data === 'object' &&
    'errors' in data &&
    Array.isArray((data as { errors: unknown[] }).errors)
  ) {
    const first = (data as { errors: { message?: string }[] }).errors[0];
    if (first?.message) return first.message;
  }
  return 'Something went wrong';
}

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(parseError(body));
  }

  return res.json();
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const data = await api<{ user: User | null }>('/api/users/me');
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  return api('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ user: User; token: string }> {
  return api('/api/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logoutUser(): Promise<void> {
  await api('/api/users/logout', { method: 'POST' });
}

export async function fetchSavedEvents(): Promise<SavedEvent[]> {
  const data = await api<{ docs: SavedEvent[] }>('/api/saved-events?depth=2');
  return data.docs;
}

export async function saveEvent(
  eventId: number
): Promise<SavedEvent> {
  return api<SavedEvent>('/api/saved-events', {
    method: 'POST',
    body: JSON.stringify({ event: eventId }),
  });
}

export async function unsaveEvent(savedEventId: number): Promise<void> {
  await api(`/api/saved-events/${savedEventId}`, { method: 'DELETE' });
}
