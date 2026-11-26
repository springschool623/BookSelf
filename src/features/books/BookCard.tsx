'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GitFork } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import type { Book } from '@/types';
import { BookCover } from './BookCover';
import { STATUS_BADGE_VARIANT } from './constants';

interface BookCardProps {
  book: Book;
  viewMode: 'grid' | 'list';
}

export function BookCard({ book, viewMode }: BookCardProps) {
  const tStatus = useTranslations('status');
  const tGenre = useTranslations('genre');
  const tBook = useTranslations('book');

  const isDiagramFriendly =
    book.genres.includes('history') || book.genres.includes('detective');

  const progressPct =
    book.pageCount && book.pageCount > 0 && book.progress
      ? Math.min(100, Math.round((book.progress / book.pageCount) * 100))
      : undefined;

  if (viewMode === 'list') {
    return (
      <Link
        href={`/books/${book.id}`}
        className="group flex items-center gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 transition-all hover:border-[var(--accent-primary)] hover:shadow-sm"
      >
        <BookCover title={book.title} coverUrl={book.coverUrl} className="h-24 w-16 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif-display truncate text-base font-semibold group-hover:text-[var(--accent-primary)]">
              {book.title}
            </h3>
            <Badge variant={STATUS_BADGE_VARIANT[book.status]}>
              {tStatus(book.status)}
            </Badge>
            {isDiagramFriendly && (
              <Badge variant="accent">
                <GitFork className="h-3 w-3" />
              </Badge>
            )}
          </div>
          <p className="truncate text-sm text-[var(--text-secondary)]">
            {book.authors.join(', ')}
            {book.publishedYear ? ` · ${book.publishedYear}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {book.genres.map((g) => (
              <Badge key={g} variant="outline">
                {tGenre(g)}
              </Badge>
            ))}
            {book.rating && <Rating value={book.rating} readonly size="sm" />}
          </div>
        </div>
        {progressPct !== undefined && (
          <div className="hidden sm:flex flex-col items-end gap-1 min-w-28">
            <span className="text-xs text-[var(--text-muted)]">
              {tBook('progressPercent', { percent: progressPct })}
            </span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg-muted)]">
              <div
                className="h-full bg-[var(--accent-primary)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--accent-primary)] hover:shadow-md"
    >
      <div className="mb-3 flex items-start gap-3">
        <BookCover title={book.title} coverUrl={book.coverUrl} className="h-32 w-22 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Badge variant={STATUS_BADGE_VARIANT[book.status]}>
            {tStatus(book.status)}
          </Badge>
          <h3 className="font-serif-display line-clamp-2 text-base font-semibold leading-snug group-hover:text-[var(--accent-primary)]">
            {book.title}
          </h3>
          <p className="line-clamp-1 text-xs text-[var(--text-secondary)]">
            {book.authors.join(', ')}
          </p>
          {book.rating ? <Rating value={book.rating} readonly size="sm" /> : null}
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-2 border-t border-[var(--border-color)]/60">
        <div className="flex flex-wrap gap-1">
          {book.genres.slice(0, 3).map((g) => (
            <Badge key={g} variant="outline">
              {tGenre(g)}
            </Badge>
          ))}
        </div>
        {progressPct !== undefined && book.status === 'reading' && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
              <span>{tBook('progressPercent', { percent: progressPct })}</span>
              <span>
                {book.progress}/{book.pageCount}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
              <div
                className="h-full rounded-full bg-[var(--accent-primary)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
