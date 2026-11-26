'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  Compass,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { BookCover } from '@/features/books/BookCover';
import { ALL_GENRES } from '@/features/books/constants';
import {
  buildGoogleSearchUrl,
  searchGoogleBooksClient,
  type MappedGoogleBook,
} from '@/services/google/googleBooks';
import { isBookInLibrary } from '@/services/recommendation/recommend';
import { useBookRecommendations } from '@/services/recommendation/useRecommendations';
import { useBookStore } from '@/stores/useBookStore';
import { useHydrated } from '@/stores/useHydrated';
import type { Genre } from '@/types';

export function DiscoverView() {
  const hydrated = useHydrated();
  const tDiscover = useTranslations('discover');
  const tGenre = useTranslations('genre');
  const tErrors = useTranslations('errors');

  const { books, createBook } = useBookStore();

  const [query, setQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<MappedGoogleBook[] | null>(
    null
  );
  const [searching, setSearching] = React.useState(false);

  const { data: recData, isLoading: recLoading } = useBookRecommendations(books);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error(tErrors('missingQuery'));
      return;
    }
    setSearching(true);
    try {
      const items = await searchGoogleBooksClient(query.trim(), { maxResults: 12 });
      setSearchResults(items);
    } catch {
      toast.error(tErrors('googleFetchFailed'));
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddToWant = async (item: MappedGoogleBook) => {
    await createBook({
      googleId: item.googleId,
      isbn: item.isbn,
      title: item.title,
      authors: item.authors,
      coverUrl: item.coverUrl,
      description: item.description,
      publishedYear: item.publishedYear,
      pageCount: item.pageCount,
      publisher: item.publisher,
      genres: item.genres,
      tags: item.tags,
      collections: [],
      status: 'want',
      progress: 0,
    });
    toast.success(tDiscover('addedToWant'));
  };

  if (!hydrated) return <PageSkeleton />;

  const renderBookItem = (item: MappedGoogleBook, reasons?: string[]) => {
    const exists = isBookInLibrary(item, books);
    return (
      <Card key={item.googleId || item.isbn || item.title}>
        <CardContent className="flex gap-3 pt-5">
          <BookCover
            title={item.title}
            coverUrl={item.coverUrl}
            className="h-28 w-20 shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="font-serif-display line-clamp-2 font-semibold">
              {item.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {item.authors.join(', ')}
              {item.publishedYear ? ` · ${item.publishedYear}` : ''}
            </p>
            <div className="flex flex-wrap gap-1">
              {item.genres.map((g) => (
                <Badge key={g} variant="outline">
                  {tGenre(g)}
                </Badge>
              ))}
              {reasons && reasons.length > 0 && (
                <Badge variant="accent">
                  <Sparkles className="h-3 w-3" />
                  <span>
                    {reasons
                      .map((r) =>
                        ALL_GENRES.includes(r as Genre) ? tGenre(r as Genre) : r
                      )
                      .join(', ')}
                  </span>
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="line-clamp-2 text-xs text-[var(--text-muted)]">
                {item.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {exists ? (
                <Badge variant="success">
                  <Check className="h-3 w-3" />
                  <span>{tDiscover('alreadyInLibrary')}</span>
                </Badge>
              ) : (
                <Button size="sm" onClick={() => handleAddToWant(item)}>
                  <Plus className="h-3.5 w-3.5" />
                  <span>{tDiscover('addToWant')}</span>
                </Button>
              )}
              <a
                href={
                  item.previewLink ||
                  buildGoogleSearchUrl(`${item.title} ${item.authors[0] || ''}`)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] px-2.5 py-1 text-xs hover:bg-[var(--bg-secondary)]"
              >
                <span>{tDiscover('openGoogleSearch')}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">
          {tDiscover('title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {tDiscover('subtitle')}
        </p>
      </div>

      {/* Google Books Search */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tDiscover('searchPlaceholder')}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={searching}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Compass className="h-4 w-4" />
              )}
              <span>{tDiscover('searchButton')}</span>
            </Button>
          </form>

          {searchResults === null ? (
            <p className="text-xs text-[var(--text-muted)]">
              {tDiscover('noSearchYet')}
            </p>
          ) : (
            <div className="space-y-3">
              <h2 className="font-serif-display text-lg font-semibold">
                {tDiscover('searchResults')} ({searchResults.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {searchResults.map((item) => renderBookItem(item))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif-display text-xl font-bold">
            {tDiscover('personalizedTitle')}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {tDiscover('personalizedSubtitle')}
          </p>
        </div>

        {recData?.isFallback && (
          <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {tDiscover('fallbackNotice')}
          </div>
        )}

        {recLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(recData?.items ?? []).map((item) =>
              renderBookItem(item, item.reasons)
            )}
          </div>
        )}
      </section>
    </div>
  );
}
