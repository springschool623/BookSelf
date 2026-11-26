'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Rating } from '@/components/ui/Rating';
import { splitCommaList } from '@/lib/utils';
import {
  searchGoogleBooksClient,
  type MappedGoogleBook,
} from '@/services/google/googleBooks';
import { useBookStore } from '@/stores/useBookStore';
import type { Book, Genre, ReadingStatus } from '@/types';
import { BookCover } from './BookCover';
import { ALL_GENRES, ALL_STATUSES } from './constants';

interface BookFormProps {
  initialBook?: Book;
}

export function BookForm({ initialBook }: BookFormProps) {
  const router = useRouter();
  const tBook = useTranslations('book');
  const tStatus = useTranslations('status');
  const tGenre = useTranslations('genre');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');

  const { createBook, updateBook } = useBookStore();

  const [title, setTitle] = React.useState(initialBook?.title ?? '');
  const [authorsText, setAuthorsText] = React.useState(
    initialBook?.authors.join(', ') ?? ''
  );
  const [coverUrl, setCoverUrl] = React.useState(initialBook?.coverUrl ?? '');
  const [description, setDescription] = React.useState(
    initialBook?.description ?? ''
  );
  const [publishedYear, setPublishedYear] = React.useState(
    initialBook?.publishedYear ? String(initialBook.publishedYear) : ''
  );
  const [pageCount, setPageCount] = React.useState(
    initialBook?.pageCount ? String(initialBook.pageCount) : ''
  );
  const [publisher, setPublisher] = React.useState(initialBook?.publisher ?? '');
  const [isbn, setIsbn] = React.useState(initialBook?.isbn ?? '');
  const [googleId, setGoogleId] = React.useState(initialBook?.googleId ?? '');
  const [genres, setGenres] = React.useState<Genre[]>(
    initialBook?.genres ?? ['novel']
  );
  const [tagsText, setTagsText] = React.useState(
    initialBook?.tags.join(', ') ?? ''
  );
  const [collectionsText, setCollectionsText] = React.useState(
    initialBook?.collections.join(', ') ?? ''
  );
  const [status, setStatus] = React.useState<ReadingStatus>(
    initialBook?.status ?? 'reading'
  );
  const [rating, setRating] = React.useState<1 | 2 | 3 | 4 | 5 | undefined>(
    initialBook?.rating
  );
  const [progress, setProgress] = React.useState(
    initialBook?.progress ? String(initialBook.progress) : ''
  );
  const [startedAt, setStartedAt] = React.useState(initialBook?.startedAt ?? '');
  const [finishedAt, setFinishedAt] = React.useState(initialBook?.finishedAt ?? '');
  const [saving, setSaving] = React.useState(false);

  // Google Books autofill modal
  const [googleOpen, setGoogleOpen] = React.useState(false);
  const [googleQuery, setGoogleQuery] = React.useState('');
  const [googleResults, setGoogleResults] = React.useState<MappedGoogleBook[]>([]);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const toggleGenre = (genre: Genre) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleGoogleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleQuery.trim()) return;
    setGoogleLoading(true);
    try {
      const items = await searchGoogleBooksClient(googleQuery.trim(), {
        maxResults: 10,
      });
      setGoogleResults(items);
    } catch {
      toast.error(tErrors('googleFetchFailed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const applyGoogleBook = (item: MappedGoogleBook) => {
    setTitle(item.title);
    setAuthorsText(item.authors.join(', '));
    if (item.coverUrl) setCoverUrl(item.coverUrl);
    if (item.description) setDescription(item.description);
    if (item.publishedYear) setPublishedYear(String(item.publishedYear));
    if (item.pageCount) setPageCount(String(item.pageCount));
    if (item.publisher) setPublisher(item.publisher);
    if (item.isbn) setIsbn(item.isbn);
    if (item.googleId) setGoogleId(item.googleId);
    if (item.genres.length > 0) setGenres(item.genres);
    if (item.tags.length > 0) setTagsText(item.tags.join(', '));
    setGoogleOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authors = splitCommaList(authorsText);
    if (!title.trim()) {
      toast.error(tBook('validationTitleRequired'));
      return;
    }
    if (authors.length === 0) {
      toast.error(tBook('validationAuthorRequired'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        googleId: googleId.trim() || undefined,
        isbn: isbn.trim() || undefined,
        title: title.trim(),
        authors,
        coverUrl: coverUrl.trim() || undefined,
        description: description.trim() || undefined,
        publishedYear: publishedYear ? Number(publishedYear) : undefined,
        pageCount: pageCount ? Number(pageCount) : undefined,
        publisher: publisher.trim() || undefined,
        genres: genres.length > 0 ? genres : (['other'] as Genre[]),
        tags: splitCommaList(tagsText),
        collections: splitCommaList(collectionsText),
        status,
        rating,
        progress: progress ? Number(progress) : undefined,
        startedAt: startedAt || undefined,
        finishedAt: finishedAt || undefined,
      };

      if (initialBook) {
        const updated = await updateBook(initialBook.id, payload);
        toast.success(tCommon('saved'));
        router.push(`/books/${updated.id}`);
      } else {
        const created = await createBook(payload);
        toast.success(tCommon('saved'));
        router.push(`/books/${created.id}`);
      }
    } catch {
      toast.error(tErrors('generic'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">
          {initialBook ? tBook('editBook') : tBook('newBook')}
        </h1>
        <Button
          variant="outline"
          onClick={() => {
            setGoogleQuery(title);
            setGoogleOpen(true);
          }}
        >
          <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
          <span>{tBook('findFromGoogle')}</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{tBook('tabs.overview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  {tBook('title')} *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  {tBook('authors')} *
                </label>
                <Input
                  value={authorsText}
                  onChange={(e) => setAuthorsText(e.target.value)}
                  placeholder={tBook('authorsHint')}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('status')}
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {tStatus(s)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('rating')}
                </label>
                <div className="flex h-9.5 items-center">
                  <Rating value={rating} onChange={setRating} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('publishedYear')}
                </label>
                <Input
                  type="number"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('pageCount')}
                </label>
                <Input
                  type="number"
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('progress')}
                </label>
                <Input
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('isbn')}
                </label>
                <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('publisher')}
                </label>
                <Input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('coverUrl')}
                </label>
                <Input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('startedAt')}
                </label>
                <Input
                  type="date"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('finishedAt')}
                </label>
                <Input
                  type="date"
                  value={finishedAt}
                  onChange={(e) => setFinishedAt(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {tBook('genres')}
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map((g) => {
                  const selected = genres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {tGenre(g)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('tags')}
                </label>
                <Input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder={tBook('tagsHint')}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {tBook('collections')}
                </label>
                <Input
                  value={collectionsText}
                  onChange={(e) => setCollectionsText(e.target.value)}
                  placeholder={tBook('collectionsHint')}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {tBook('description')}
              </label>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => router.back()}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? tCommon('loading') : tCommon('save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Dialog
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
        title={tBook('findFromGoogle')}
      >
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          {tBook('googleAutofillHint')}
        </p>
        <form onSubmit={handleGoogleSearch} className="mb-4 flex gap-2">
          <Input
            value={googleQuery}
            onChange={(e) => setGoogleQuery(e.target.value)}
            placeholder={tBook('title')}
          />
          <Button type="submit" disabled={googleLoading}>
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{tCommon('search')}</span>
          </Button>
        </form>
        <div className="space-y-3">
          {googleResults.map((item) => (
            <div
              key={item.googleId || item.title}
              className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] p-3"
            >
              <BookCover
                title={item.title}
                coverUrl={item.coverUrl}
                className="h-20 w-14 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold line-clamp-1">{item.title}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {item.authors.join(', ')}
                  {item.publishedYear ? ` · ${item.publishedYear}` : ''}
                </div>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">
                    {item.description}
                  </p>
                )}
              </div>
              <Button size="sm" onClick={() => applyGoogleBook(item)}>
                {tBook('applyBook')}
              </Button>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
