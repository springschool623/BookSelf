'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useBookStore } from '@/stores/useBookStore';
import { useHydrated } from '@/stores/useHydrated';
import { BookForm } from './BookForm';

export function BookEditLoader({ bookId }: { bookId: string }) {
  const hydrated = useHydrated();
  const tBook = useTranslations('book');
  const tCommon = useTranslations('common');
  const book = useBookStore((s) => s.books.find((b) => b.id === bookId));

  if (!hydrated) return <PageSkeleton />;

  if (!book) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-color)] py-16 text-center">
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          {tBook('notFound')}
        </p>
        <Link href="/library">
          <Button variant="outline">{tCommon('back')}</Button>
        </Link>
      </div>
    );
  }

  return <BookForm initialBook={book} />;
}
