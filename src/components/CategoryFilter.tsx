'use client';

import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/api';
import type { Category } from '@/lib/types';

interface CategoryFilterProps {
  activeCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}

export function CategoryFilter({
  activeCategoryId,
  onSelect,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
          activeCategoryId === null
            ? 'bg-riot-pink text-white'
            : 'bg-gray-100 text-riot-text-secondary'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            activeCategoryId === cat.id
              ? 'bg-riot-pink text-white'
              : 'bg-gray-100 text-riot-text-secondary'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
