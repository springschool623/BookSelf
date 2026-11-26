'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value?: number;
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

export function Rating({ value = 0, onChange, readonly = false, size = 'md' }: RatingProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        if (readonly) {
          return (
            <Star
              key={star}
              className={cn(
                iconSize,
                active ? 'fill-amber-400 text-amber-500' : 'text-[var(--border-color)]'
              )}
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star as 1 | 2 | 3 | 4 | 5)}
            className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110"
            aria-label={`${star} stars`}
          >
            <Star
              className={cn(
                iconSize,
                active ? 'fill-amber-400 text-amber-500' : 'text-[var(--border-color)]'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
