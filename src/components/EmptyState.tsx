'use client';

import type { ReactNode } from 'react';

const iconPresets = {
  search: (
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  calendar: (
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
};

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'search' | 'calendar' | ReactNode;
  action?: {
    label: string;
    onClear: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon = 'search',
  action,
}: EmptyStateProps) {
  const iconNode =
    typeof icon === 'string'
      ? iconPresets[icon as keyof typeof iconPresets] ?? iconPresets.search
      : icon;

  return (
    <div className="flex min-h-[calc(100vh-112px)] flex-col items-center justify-center px-6 pb-24 pt-16 lg:min-h-[calc(100vh-96px)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-riot-pink/10">
        {iconNode}
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-base font-semibold text-riot-text">{title}</h1>
        <p className="mt-2 text-sm text-riot-text-secondary">{description}</p>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClear}
          className="mt-6 rounded-full bg-riot-pink px-6 py-2.5 text-sm font-semibold text-white shadow-sm active:opacity-85"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
