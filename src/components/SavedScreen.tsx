'use client';

export function SavedScreen() {
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
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-base font-semibold text-riot-text">Sign in to save events</h1>
        <p className="mt-2 text-sm text-riot-text-secondary">
          Keep track of the events you care about and quickly find them later.
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

