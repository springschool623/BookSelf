'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { BookOpen, Calendar, Edit3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select } from '@/components/ui/Input';
import { PageSkeleton } from '@/components/ui/Skeleton';
import type { Locale } from '@/i18n/config';
import { formatDateLocalized, todayIsoDate } from '@/lib/date';
import { useBookStore } from '@/stores/useBookStore';
import { useHydrated } from '@/stores/useHydrated';
import { useJournalStore } from '@/stores/useJournalStore';
import type { JournalEntry, JournalMood } from '@/types';
import { JournalEditor } from './JournalEditor';

const MOODS: JournalMood[] = ['inspired', 'thoughtful', 'excited', 'calm', 'curious'];

export function JournalView() {
  const hydrated = useHydrated();
  const locale = useLocale() as Locale;
  const tJournal = useTranslations('journal');
  const tCommon = useTranslations('common');

  const books = useBookStore((s) => s.books);
  const { journals, createJournal, updateJournal, deleteJournal } = useJournalStore();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<JournalEntry | null>(null);
  const [filterBookId, setFilterBookId] = React.useState<string>('');

  const [title, setTitle] = React.useState('');
  const [date, setDate] = React.useState(todayIsoDate());
  const [mood, setMood] = React.useState<JournalMood>('thoughtful');
  const [pagesRead, setPagesRead] = React.useState('');
  const [selectedBookIds, setSelectedBookIds] = React.useState<string[]>([]);
  const [contentHtml, setContentHtml] = React.useState('');

  const bookMap = React.useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books]
  );

  const sortedJournals = React.useMemo(
    () =>
      journals
        .filter((j) => !filterBookId || j.bookIds.includes(filterBookId))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [journals, filterBookId]
  );

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setDate(todayIsoDate());
    setMood('thoughtful');
    setPagesRead('');
    setSelectedBookIds(filterBookId ? [filterBookId] : []);
    setContentHtml('');
    setDialogOpen(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditing(entry);
    setTitle(entry.title);
    setDate(entry.date);
    setMood(entry.mood ?? 'thoughtful');
    setPagesRead(entry.pagesRead ? String(entry.pagesRead) : '');
    setSelectedBookIds(entry.bookIds);
    setContentHtml(entry.contentHtml);
    setDialogOpen(true);
  };

  const toggleBook = (id: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      date,
      mood,
      pagesRead: pagesRead ? Number(pagesRead) : undefined,
      bookIds: selectedBookIds,
      contentHtml,
    };

    if (editing) {
      await updateJournal(editing.id, payload);
    } else {
      await createJournal(payload);
    }
    toast.success(tCommon('saved'));
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteJournal(id);
    toast.success(tCommon('deleted'));
  };

  if (!hydrated) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">
            {tJournal('title')}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {tJournal('subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterBookId}
            onChange={(e) => setFilterBookId(e.target.value)}
            className="w-52"
          >
            <option value="">{tCommon('all')}</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </Select>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            <span>{tJournal('newEntry')}</span>
          </Button>
        </div>
      </div>

      {sortedJournals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] py-16 text-center text-sm text-[var(--text-muted)]">
          {tJournal('empty')}
        </div>
      ) : (
        <div className="relative space-y-4 before:hidden sm:before:block sm:before:absolute sm:before:left-5 sm:before:top-4 sm:before:bottom-4 sm:before:w-0.5 sm:before:bg-[var(--border-color)]">
          {sortedJournals.map((entry) => (
            <div key={entry.id} className="relative sm:pl-14">
              <div className="hidden sm:flex absolute left-2.5 top-5 h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--accent-primary)] bg-[var(--bg-card)]" />
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateLocalized(entry.date, locale)}
                        </span>
                        {entry.mood && (
                          <Badge variant="accent">
                            {tJournal(`moods.${entry.mood}`)}
                          </Badge>
                        )}
                        {entry.pagesRead ? (
                          <Badge variant="outline">
                            +{entry.pagesRead} {tCommon('pages')}
                          </Badge>
                        ) : null}
                      </div>
                      <h2 className="font-serif-display text-lg font-semibold">
                        {entry.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(entry)}
                        aria-label={tCommon('edit')}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        aria-label={tCommon('delete')}
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>

                  <div
                    className="prose-sm text-sm leading-relaxed text-[var(--text-secondary)] [&_blockquote]:border-l-3 [&_blockquote]:border-[var(--accent-primary)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_strong]:text-[var(--text-primary)]"
                    dangerouslySetInnerHTML={{ __html: entry.contentHtml }}
                  />

                  {entry.bookIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-color)]/60">
                      {entry.bookIds.map((bid) => {
                        const b = bookMap.get(bid);
                        if (!b) return null;
                        return (
                          <Link
                            key={bid}
                            href={`/books/${bid}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--bg-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
                          >
                            <BookOpen className="h-3 w-3" />
                            <span>{b.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? tJournal('editEntry') : tJournal('newEntry')}
        className="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {tJournal('entryTitle')} *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tJournal('entryTitlePlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium">
                {tJournal('date')}
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                {tJournal('mood')}
              </label>
              <Select
                value={mood}
                onChange={(e) => setMood(e.target.value as JournalMood)}
              >
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {tJournal(`moods.${m}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                {tJournal('pagesRead')}
              </label>
              <Input
                type="number"
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">
              {tJournal('linkedBooks')}
            </label>
            <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-[var(--border-color)] p-2">
              {books.map((b) => {
                const selected = selectedBookIds.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBook(b.id)}
                    className={`rounded-full px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {b.title}
                  </button>
                );
              })}
            </div>
          </div>

          <JournalEditor
            value={contentHtml}
            onChange={setContentHtml}
            placeholder={tJournal('contentPlaceholder')}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit">{tCommon('save')}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
