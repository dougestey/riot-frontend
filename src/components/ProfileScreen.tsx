'use client';

import packageJson from '../../package.json';

export function ProfileScreen() {
  const version = packageJson.version ?? '0.0.0';

  return (
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
          <circle
            cx="12"
            cy="7"
            r="4"
          />
        </svg>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-base font-semibold text-riot-text">
          Sign in to view your profile
        </h1>
        <p className="mt-2 text-sm text-riot-text-secondary">
          Manage your saved events and preferences once sign-in is available.
        </p>
      </div>

      <button
        type="button"
        className="mt-6 rounded-full bg-riot-pink px-6 py-2.5 text-sm font-semibold text-white shadow-sm cursor-pointer active:opacity-85"
      >
        Sign In
      </button>
    </div>
  );
}
