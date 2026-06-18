'use client';

import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryPillProps {
  category: Category;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryPill({ category, isActive = false, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95',
        isActive
          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      )}
    >
      <span className="text-2xl">{category.icon}</span>
      <span className="text-xs font-medium">{category.name}</span>
    </button>
  );
}
