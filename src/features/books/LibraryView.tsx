'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { filterBooks } from '@/services/repositories/mock/storageMockRepo';
import { useBookStore } from '@/stores/useBookStore';
import { useHydrated } from '@/stores/useHydrated';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { BookFilter } from '@/types';
import { BookCard } from './BookCard';
import { BookFilters } from './BookFilters';

export function LibraryView() {
  const hydrated = useHydrated();
  const books = useBookStore((s) => s.books);
  const { globalSearchQuery, setGlobalSearchQuery } = useSettingsStore();
  const tBook = useTranslations('book');
  const tCommon = useTranslations('common');

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = React.useState<BookFilter>({
    status: 'all',
    genre: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const mergedFilter = React.useMemo<BookFilter>(
    () => ({
      ...filter,
      query: filter.query !== undefined ? filter.query : globalSearchQuery,
    }),
    [filter, globalSearchQuery]
  );

  const collections = React.useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.collections.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [books]);

  const filteredBooks = React.useMemo(
    () => filterBooks(books, mergedFilter),
    [books, mergedFilter]
  );

  const handleReset = () => {
    setGlobalSearchQuery('');
    setFilter({
      query: '',
      status: 'all',
      genre: 'all',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  };

  if (!hydrated) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">
            {tBook('libraryTitle')}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {tBook('librarySubtitle')}
          </p>
        </div>
        <Link href="/books/new">
          <Button>
            <Plus className="h-4 w-4" />
            <span>{tBook('newBook')}</span>
          </Button>
        </Link>
      </div>

      <BookFilters
        filter={mergedFilter}
        collections={collections}
        viewMode={viewMode}
        onFilterChange={(next) => {
          setFilter(next);
          if (next.query !== undefined) setGlobalSearchQuery(next.query);
        }}
        onViewModeChange={setViewMode}
        onReset={handleReset}
      />

      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-[var(--text-muted)]" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {tCommon('noResults')}
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
            {tCommon('reset')}
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
}
