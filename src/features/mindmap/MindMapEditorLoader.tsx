'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useHydrated } from '@/stores/useHydrated';
import { useMindMapStore } from '@/stores/useMindMapStore';

const MindMapCanvas = dynamic(
  () => import('./MindMapCanvas').then((mod) => mod.MindMapCanvas),
  { ssr: false, loading: () => <PageSkeleton /> }
);

export function MindMapEditorLoader({
  bookId,
  mapId,
}: {
  bookId: string;
  mapId: string;
}) {
  const hydrated = useHydrated();
  const tCommon = useTranslations('common');
  const map = useMindMapStore((s) =>
    s.mindmaps.find((m) => m.id === mapId && m.bookId === bookId)
  );

  if (!hydrated) {
    return (
      <div className="p-6">
        <PageSkeleton />
      </div>
    );
  }

  if (!map) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-[var(--text-secondary)]">{tCommon('empty')}</p>
        <Link href={`/books/${bookId}`}>
          <Button variant="outline">{tCommon('back')}</Button>
        </Link>
      </div>
    );
  }

  return <MindMapCanvas map={map} />;
}
