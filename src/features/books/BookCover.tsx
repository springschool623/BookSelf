'use client';

import * as React from 'react';
import { BookOpen } from 'lucide-react';
import { cn, getBookInitials } from '@/lib/utils';

interface BookCoverProps {
  title: string;
  coverUrl?: string;
  className?: string;
}

const COVER_GRADIENTS = [
  'from-amber-800 to-stone-900',
  'from-emerald-800 to-teal-950',
  'from-rose-900 to-stone-900',
  'from-sky-900 to-slate-950',
  'from-indigo-900 to-slate-950',
];

function pickGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) % COVER_GRADIENTS.length;
  }
  return COVER_GRADIENTS[Math.abs(hash) % COVER_GRADIENTS.length];
}

export function BookCover({ title, coverUrl, className }: BookCoverProps) {
  const [imgError, setImgError] = React.useState(false);

  if (coverUrl && !imgError) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-muted)]',
          className
        )}
      >
        <img
          src={coverUrl}
          alt={title}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-between overflow-hidden rounded-lg border border-black/10 bg-gradient-to-br p-3 text-amber-50 shadow-inner',
        pickGradient(title),
        className
      )}
    >
      <div className="flex w-full items-center justify-between opacity-75">
        <span className="text-[10px] font-semibold tracking-wider uppercase">
          {getBookInitials(title)}
        </span>
        <BookOpen className="h-3.5 w-3.5" />
      </div>
      <div className="line-clamp-3 text-center font-serif-display text-xs font-semibold leading-snug">
        {title}
      </div>
      <div className="h-0.5 w-8 rounded-full bg-amber-200/40" />
    </div>
  );
}
