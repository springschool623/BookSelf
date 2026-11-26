'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, List, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import type { BookFilter, Genre, ReadingStatus } from '@/types';
import { ALL_GENRES, ALL_STATUSES } from './constants';

interface BookFiltersProps {
  filter: BookFilter;
  collections: string[];
  viewMode: 'grid' | 'list';
  onFilterChange: (next: BookFilter) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onReset: () => void;
}

export function BookFilters({
  filter,
  collections,
  viewMode,
  onFilterChange,
  onViewModeChange,
  onReset,
}: BookFiltersProps) {
  const tBook = useTranslations('book');
  const tStatus = useTranslations('status');
  const tGenre = useTranslations('genre');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            aria-label={tCommon('search')}
            value={filter.query ?? ''}
            onChange={(e) => onFilterChange({ ...filter, query: e.target.value })}
            placeholder={tCommon('search')}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Select
            aria-label={tBook('status')}
            value={filter.status ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                status: e.target.value as ReadingStatus | 'all',
              })
            }
            className="sm:w-40"
          >
            <option value="all">{tBook('allStatuses')}</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tStatus(s)}
              </option>
            ))}
          </Select>

          <Select
            aria-label={tBook('genres')}
            value={filter.genre ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                genre: e.target.value as Genre | 'all',
              })
            }
            className="sm:w-44"
          >
            <option value="all">{tBook('allGenres')}</option>
            {ALL_GENRES.map((g) => (
              <option key={g} value={g}>
                {tGenre(g)}
              </option>
            ))}
          </Select>

          {collections.length > 0 && (
            <Select
              aria-label={tBook('collections')}
              value={filter.collection ?? ''}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  collection: e.target.value || undefined,
                })
              }
              className="sm:w-44"
            >
              <option value="">{tBook('allCollections')}</option>
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}

          <Select
            aria-label={tBook('sortBy')}
            value={filter.sortBy ?? 'updatedAt'}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                sortBy: e.target.value as BookFilter['sortBy'],
              })
            }
            className="sm:w-44"
          >
            <option value="updatedAt">{tBook('sortUpdated')}</option>
            <option value="title">{tBook('sortTitle')}</option>
            <option value="rating">{tBook('sortRating')}</option>
            <option value="publishedYear">{tBook('sortYear')}</option>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{tCommon('reset')}</span>
          </Button>
          <div className="inline-flex rounded-lg border border-[var(--border-color)] p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label={tBook('gridView')}
              className={`rounded-md p-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label={tBook('listView')}
              className={`rounded-md p-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
