'use client';

import { useAuth } from '@/contexts/AuthContext';
import packageJson from '../../package.json';

export function ProfileScreen() {
  const { user, loading, isAuthenticated, savedEvents, logout, openAuthSheet } =
    useAuth();
  const version = packageJson.version ?? '0.0.0';

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-112px)] items-center justify-center pb-24 pt-16 lg:min-h-[calc(100vh-96px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-riot-pink border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-center px-6 pb-24 pt-16 lg:min-h-[calc(100vh-96px)]">
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-base font-semibold text-riot-text">
            Sign in to view your profile
          </h1>
          <p className="mt-2 text-sm text-riot-text-secondary">
            Manage your saved events and preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAuthSheet('login')}
          className="mt-6 rounded-full bg-riot-pink px-6 py-2.5 text-sm font-semibold text-white shadow-sm active:opacity-85"
        >
          Sign In
        </button>

        <div className="mt-10 text-xs text-riot-text-secondary">
          <p>RIOT Events &middot; v{version}</p>
        </div>
      </div>
    );
  }

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join('');
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const roleBadge = user.roles?.[0] ?? 'attendee';

  return (
    <div className="flex min-h-[calc(100vh-112px)] flex-col items-center px-6 pb-24 pt-16 lg:min-h-[calc(100vh-96px)]">
      {/* Avatar */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-riot-pink text-2xl font-bold text-white">
        {initials || user.email[0].toUpperCase()}
      </div>

      {/* Name + email */}
      <h1 className="mt-4 text-lg font-semibold text-riot-text">
        {displayName}
      </h1>
      {displayName !== user.email && (
        <p className="mt-1 text-sm text-riot-text-secondary">{user.email}</p>
      )}

      {/* Role badge */}
      <span className="mt-2 rounded-full bg-riot-pink/10 px-3 py-1 text-xs font-medium capitalize text-riot-pink">
        {roleBadge}
      </span>

      {/* Stats */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center">
        <p className="text-2xl font-bold text-riot-text">
          {savedEvents.length}
        </p>
        <p className="text-xs text-riot-text-secondary">Saved Events</p>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        className="mt-8 rounded-full border border-white/10 px-6 py-2.5 text-sm font-medium text-riot-text-secondary active:opacity-85"
      >
        Log Out
      </button>

      <div className="mt-auto pt-10 text-xs text-riot-text-secondary">
        <p>RIOT Events &middot; v{version}</p>
      </div>
    </div>
  );
}
