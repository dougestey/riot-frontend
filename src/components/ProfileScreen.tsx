'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { AuthSheet } from './AuthSheet';
import packageJson from '../../package.json';

export function ProfileScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const version = packageJson.version ?? '0.0.0';

  // Loading auth state
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-center px-6 pb-32 pt-16 lg:min-h-[calc(100vh-96px)]">
        <div className="h-20 w-20 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-5 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-white/10" />
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-base font-semibold text-riot-text">
              Sign in to view your profile
            </h1>
            <p className="mt-2 text-sm text-riot-text-secondary">
              Manage your saved events and preferences once sign-in is
              available.
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

  // Logged in — profile
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join('');
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-112px)] flex-col items-center px-6 pb-32 pt-16 lg:min-h-[calc(100vh-96px)]">
      {/* Avatar */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-riot-pink">
        <span className="font-display text-2xl font-bold text-white">
          {initials || user.email.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Name + email */}
      <h1 className="mt-4 font-display text-lg font-semibold text-riot-text">
        {displayName}
      </h1>
      {displayName !== user.email && (
        <p className="mt-1 text-sm text-riot-text-secondary">{user.email}</p>
      )}

      {/* Role badge */}
      <span className="mt-3 rounded-full bg-riot-pink/10 px-3 py-1 text-xs font-medium text-riot-pink capitalize">
        {user.roles?.[0] ?? 'attendee'}
      </span>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-8 rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-riot-text cursor-pointer active:opacity-85 disabled:opacity-50"
      >
        {loggingOut ? 'Signing out...' : 'Sign Out'}
      </button>

      {/* Version */}
      <p className="mt-auto pt-8 text-xs text-riot-text-secondary/50">
        v{version}
      </p>
    </div>
  );
}
