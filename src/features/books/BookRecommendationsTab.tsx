'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { buildGoogleSearchUrl } from '@/services/google/googleBooks';
import { useBookRecommendations } from '@/services/recommendation/useRecommendations';
import { useBookStore } from '@/stores/useBookStore';
import type { Book, Genre } from '@/types';
import { BookCover } from './BookCover';
import { ALL_GENRES } from './constants';

export function BookRecommendationsTab({ book }: { book: Book }) {
  const tDiscover = useTranslations('discover');
  const tGenre = useTranslations('genre');
  const { books, createBook } = useBookStore();

  const { data, isLoading } = useBookRecommendations(books, book);

  const handleAddToWant = async (item: NonNullable<typeof data>['items'][number]) => {
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.isFallback && (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {tDiscover('fallbackNotice')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(data?.items ?? []).slice(0, 8).map((item) => (
          <Card key={item.googleId || item.title}>
            <CardContent className="flex gap-3 pt-5">
              <BookCover
                title={item.title}
                coverUrl={item.coverUrl}
                className="h-28 w-20 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <h4 className="font-serif-display line-clamp-2 font-semibold">
                  {item.title}
                </h4>
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
                  {item.reasons.length > 0 && (
                    <Badge variant="accent">
                      <Sparkles className="h-3 w-3" />
                      <span>
                        {item.reasons
                          .map((r) =>
                            ALL_GENRES.includes(r as Genre)
                              ? tGenre(r as Genre)
                              : r
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
                  <Button size="sm" onClick={() => handleAddToWant(item)}>
                    <Plus className="h-3.5 w-3.5" />
                    <span>{tDiscover('addToWant')}</span>
                  </Button>
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
        ))}
      </div>
    </div>
  );
}
