'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Calendar,
  Edit3,
  GitFork,
  SearchCheck,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Rating } from '@/components/ui/Rating';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import type { Locale } from '@/i18n/config';
import { formatDateLocalized } from '@/lib/date';
import { BookMindMapsTab } from '@/features/mindmap/BookMindMapsTab';
import { BookNotesTab } from '@/features/notes/BookNotesTab';
import { useBookStore } from '@/stores/useBookStore';
import { useHydrated } from '@/stores/useHydrated';
import { useJournalStore } from '@/stores/useJournalStore';
import { useMindMapStore } from '@/stores/useMindMapStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { BookCover } from './BookCover';
import { BookGooglePanel } from './BookGooglePanel';
import { BookRecommendationsTab } from './BookRecommendationsTab';
import { STATUS_BADGE_VARIANT } from './constants';

export function BookDetailView({ bookId }: { bookId: string }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const tBook = useTranslations('book');
  const tStatus = useTranslations('status');
  const tGenre = useTranslations('genre');
  const tCommon = useTranslations('common');
  const tJournal = useTranslations('journal');

  const book = useBookStore((s) => s.books.find((b) => b.id === bookId));
  const deleteBook = useBookStore((s) => s.deleteBook);
  const updateBook = useBookStore((s) => s.updateBook);
  const notesCount = useNoteStore(
    (s) => s.notes.filter((n) => n.bookId === bookId).length
  );
  const mapsCount = useMindMapStore(
    (s) => s.mindmaps.filter((m) => m.bookId === bookId).length
  );
  const journals = useJournalStore((s) => s.journals);
  const relatedJournals = React.useMemo(
    () =>
      journals
        .filter((j) => j.bookIds.includes(bookId))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [journals, bookId]
  );

  const [activeTab, setActiveTab] = React.useState('overview');

  if (!hydrated) {
    return <PageSkeleton />;
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] py-16 text-center">
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          {tBook('notFound')}
        </p>
        <Link href="/library">
          <Button variant="outline">{tCommon('back')}</Button>
        </Link>
      </div>
    );
  }

  const isDiagramPriority =
    book.genres.includes('history') || book.genres.includes('detective');

  const tabs: TabItem[] = [
    { id: 'overview', label: tBook('tabs.overview') },
    { id: 'notes', label: tBook('tabs.notes'), badge: notesCount },
    {
      id: 'mindmap',
      label: tBook('tabs.mindmap'),
      badge: mapsCount,
      highlight: isDiagramPriority,
    },
    {
      id: 'journal',
      label: tBook('tabs.journal'),
      badge: relatedJournals.length,
    },
    { id: 'recommendations', label: tBook('tabs.recommendations') },
  ];

  const handleDelete = async () => {
    if (!window.confirm(tCommon('confirmDelete'))) return;
    await deleteBook(book.id);
    toast.success(tCommon('deleted'));
    router.push('/library');
  };

  const progressPct =
    book.pageCount && book.pageCount > 0 && book.progress
      ? Math.min(100, Math.round((book.progress / book.pageCount) * 100))
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{tCommon('back')}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/playground?bookId=${book.id}`}>
            <Button variant={isDiagramPriority ? 'primary' : 'outline'} size="sm">
              <SearchCheck className="h-4 w-4" />
              <span>{tBook('openPlayground')}</span>
            </Button>
          </Link>
          <Link href={`/books/${book.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4" />
              <span>{tCommon('edit')}</span>
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            <span>{tCommon('delete')}</span>
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <BookCover
              title={book.title}
              coverUrl={book.coverUrl}
              className="h-56 w-38 shrink-0 self-center sm:self-start"
            />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_BADGE_VARIANT[book.status]}>
                  {tStatus(book.status)}
                </Badge>
                {isDiagramPriority && (
                  <Badge variant="accent">
                    <GitFork className="h-3 w-3" />
                    <span>{tBook('mindmapRecommendedBadge')}</span>
                  </Badge>
                )}
              </div>

              <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">
                {book.title}
              </h1>
              <p className="text-base text-[var(--text-secondary)]">
                {book.authors.join(', ')}
                {book.publishedYear ? ` · ${book.publishedYear}` : ''}
                {book.publisher ? ` · ${book.publisher}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Rating
                  value={book.rating}
                  onChange={async (r) => {
                    await updateBook(book.id, { rating: r });
                    toast.success(tCommon('saved'));
                  }}
                />
                {book.pageCount && (
                  <span className="text-xs text-[var(--text-muted)]">
                    {book.pageCount} {tCommon('pages')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {book.genres.map((g) => (
                  <Badge key={g} variant="outline">
                    {tGenre(g)}
                  </Badge>
                ))}
                {book.collections.map((c) => (
                  <Badge key={c} variant="default">
                    {c}
                  </Badge>
                ))}
                {book.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {progressPct !== undefined && (
                <div className="max-w-md space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                    <span>{tBook('progressPercent', { percent: progressPct })}</span>
                    <span>
                      {book.progress} / {book.pageCount} {tCommon('pages')}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent-primary)]"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs items={tabs} activeId={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="pt-5 space-y-4">
              <h2 className="font-serif-display text-lg font-semibold">
                {tBook('description')}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                {book.description || tCommon('empty')}
              </p>

              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)] pt-4 text-xs sm:grid-cols-4">
                <div>
                  <div className="text-[var(--text-muted)]">{tBook('isbn')}</div>
                  <div className="mt-0.5 font-medium">{book.isbn || '—'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">
                    {tBook('publishedYear')}
                  </div>
                  <div className="mt-0.5 font-medium">
                    {book.publishedYear || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">{tBook('startedAt')}</div>
                  <div className="mt-0.5 font-medium">
                    {book.startedAt
                      ? formatDateLocalized(book.startedAt, locale)
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">
                    {tBook('finishedAt')}
                  </div>
                  <div className="mt-0.5 font-medium">
                    {book.finishedAt
                      ? formatDateLocalized(book.finishedAt, locale)
                      : '—'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <BookGooglePanel book={book} />
        </div>
      )}

      {activeTab === 'notes' && <BookNotesTab bookId={book.id} />}

      {activeTab === 'mindmap' && <BookMindMapsTab book={book} />}

      {activeTab === 'journal' && (
        <div className="space-y-4">
          {relatedJournals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-color)] py-12 text-center text-sm text-[var(--text-muted)]">
              {tJournal('emptyForBook')}
            </div>
          ) : (
            relatedJournals.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="pt-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDateLocalized(entry.date, locale)}</span>
                    {entry.mood && (
                      <Badge variant="accent">
                        {tJournal(`moods.${entry.mood}`)}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-serif-display text-base font-semibold">
                    {entry.title}
                  </h3>
                  <div
                    className="text-sm text-[var(--text-secondary)]"
                    dangerouslySetInnerHTML={{ __html: entry.contentHtml }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'recommendations' && <BookRecommendationsTab book={book} />}
    </div>
  );
}
