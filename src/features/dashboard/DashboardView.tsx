'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BookCheck,
  BookOpen,
  Compass,
  Library,
  NotebookPen,
  Plus,
  StickyNote,
  Target,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { BookCover } from '@/features/books/BookCover';
import { ALL_GENRES } from '@/features/books/constants';
import type { Locale } from '@/i18n/config';
import { formatDateLocalized } from '@/lib/date';
import { useBookStore } from '@/stores/useBookStore';
import { useHydrated } from '@/stores/useHydrated';
import { useJournalStore } from '@/stores/useJournalStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function DashboardView() {
  const hydrated = useHydrated();
  const locale = useLocale() as Locale;
  const tDash = useTranslations('dashboard');
  const tGenre = useTranslations('genre');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const books = useBookStore((s) => s.books);
  const journals = useJournalStore((s) => s.journals);
  const notes = useNoteStore((s) => s.notes);
  const { yearlyGoal, setYearlyGoal } = useSettingsStore();

  const [editingGoal, setEditingGoal] = React.useState(false);
  const [goalInput, setGoalInput] = React.useState(String(yearlyGoal));

  const currentYear = new Date().getFullYear();

  const finishedCount = React.useMemo(
    () => books.filter((b) => b.status === 'finished').length,
    [books]
  );

  const readingBooks = React.useMemo(
    () => books.filter((b) => b.status === 'reading'),
    [books]
  );

  const genreChartData = React.useMemo(() => {
    return ALL_GENRES.map((g) => ({
      name: tGenre(g),
      count: books.filter((b) => b.genres.includes(g)).length,
    }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [books, tGenre]);

  const recentJournals = React.useMemo(
    () => [...journals].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
    [journals]
  );

  if (!hydrated) return <PageSkeleton />;

  const goalPercent = Math.min(
    100,
    Math.round((finishedCount / Math.max(1, yearlyGoal)) * 100)
  );

  const stats = [
    {
      label: tDash('totalBooks'),
      value: books.length,
      icon: Library,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: tDash('finishedBooks'),
      value: finishedCount,
      icon: BookCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: tDash('readingNow'),
      value: readingBooks.length,
      icon: BookOpen,
      color: 'text-sky-600 dark:text-sky-400',
    },
    {
      label: tDash('journalEntries'),
      value: journals.length,
      icon: NotebookPen,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: tDash('totalNotes'),
      value: notes.length,
      icon: StickyNote,
      color: 'text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">
            {tDash('title')}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {tDash('subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/books/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span>{tNav('addBook')}</span>
            </Button>
          </Link>
          <Link href="/discover">
            <Button size="sm" variant="outline">
              <Compass className="h-4 w-4" />
              <span>{tNav('discover')}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between pt-5">
              <div>
                <div className="text-xs text-[var(--text-muted)]">{label}</div>
                <div className="mt-1 font-serif-display text-2xl font-bold">
                  {value}
                </div>
              </div>
              <Icon className={`h-6 w-6 ${color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Yearly Goal & Genre Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-[var(--accent-primary)]" />
              <span>{tDash('yearlyGoal', { year: currentYear })}</span>
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setGoalInput(String(yearlyGoal));
                setEditingGoal((v) => !v);
              }}
            >
              {tDash('editGoal')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingGoal && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = Number(goalInput);
                  if (val > 0) setYearlyGoal(val);
                  setEditingGoal(false);
                }}
                className="flex gap-2"
              >
                <Input
                  type="number"
                  min={1}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                />
                <Button size="sm" type="submit">
                  {tCommon('save')}
                </Button>
              </form>
            )}

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-serif-display text-2xl font-bold text-[var(--accent-primary)]">
                  {goalPercent}%
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  {tDash('goalProgress', {
                    done: finishedCount,
                    goal: yearlyGoal,
                  })}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)] transition-all"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{tDash('booksByGenre')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b4513" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currently Reading & Recent Journals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{tDash('currentlyReading')}</CardTitle>
            <Link
              href="/library"
              className="text-xs font-medium text-[var(--accent-primary)] hover:underline"
            >
              {tCommon('viewAll')}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {readingBooks.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{tCommon('empty')}</p>
            ) : (
              readingBooks.map((b) => {
                const pct =
                  b.pageCount && b.progress
                    ? Math.min(100, Math.round((b.progress / b.pageCount) * 100))
                    : 0;
                return (
                  <Link
                    key={b.id}
                    href={`/books/${b.id}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] p-3 hover:border-[var(--accent-primary)]"
                  >
                    <BookCover
                      title={b.title}
                      coverUrl={b.coverUrl}
                      className="h-16 w-11 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="truncate font-serif-display text-sm font-semibold">
                        {b.title}
                      </div>
                      <div className="truncate text-xs text-[var(--text-secondary)]">
                        {b.authors.join(', ')}
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
                        <div
                          className="h-full rounded-full bg-[var(--accent-primary)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="accent">{pct}%</Badge>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{tDash('recentJournals')}</CardTitle>
            <Link
              href="/journal"
              className="text-xs font-medium text-[var(--accent-primary)] hover:underline"
            >
              {tCommon('viewAll')}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJournals.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{tCommon('empty')}</p>
            ) : (
              recentJournals.map((entry) => (
                <Link
                  key={entry.id}
                  href="/journal"
                  className="block rounded-xl border border-[var(--border-color)] p-3 hover:border-[var(--accent-primary)]"
                >
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{formatDateLocalized(entry.date, locale)}</span>
                    {entry.pagesRead ? (
                      <span>
                        +{entry.pagesRead} {tCommon('pages')}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 font-serif-display text-sm font-semibold">
                    {entry.title}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
