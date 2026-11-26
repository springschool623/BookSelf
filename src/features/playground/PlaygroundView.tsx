'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useBookStore } from '@/stores/useBookStore';
import { useCaseBoardStore } from '@/stores/useCaseBoardStore';
import { useHydrated } from '@/stores/useHydrated';

const DetectivePlaygroundCanvas = dynamic(
  () =>
    import('./DetectivePlaygroundCanvas').then(
      (mod) => mod.DetectivePlaygroundCanvas
    ),
  { ssr: false, loading: () => <PageSkeleton /> }
);

export function PlaygroundView() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const requestedBookId = searchParams.get('bookId');
  const t = useTranslations('playground');

  const books = useBookStore((s) => s.books);
  const { caseboards, createCaseBoard } = useCaseBoardStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const activeBoard = React.useMemo(() => {
    if (selectedId) {
      const found = caseboards.find((b) => b.id === selectedId);
      if (found) return found;
    }
    if (requestedBookId) {
      const forBook = caseboards.find((b) => b.bookId === requestedBookId);
      if (forBook) return forBook;
    }
    return caseboards[0];
  }, [caseboards, selectedId, requestedBookId]);

  const handleQuickCreateForBook = async () => {
    const book = books.find((b) => b.id === requestedBookId);
    const created = await createCaseBoard({
      title: book ? `${t('casePrefix')}: ${book.title}` : t('defaultBoardTitle'),
      bookId: book?.id,
      theme: 'corkboard',
      nodes: [
        {
          id: 'init-victim',
          type: 'suspect',
          position: { x: 260, y: 80 },
          data: {
            label: book?.title || t('nodeTypes.suspect'),
            suspectStatus: 'victim',
            suspicionLevel: 0,
          },
        },
      ],
      edges: [],
      hypotheses: [],
    });
    setSelectedId(created.id);
  };

  if (!hydrated) {
    return <PageSkeleton />;
  }

  if (!activeBoard) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] py-20 text-center">
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          {t('noBoards')}
        </p>
        <Button onClick={handleQuickCreateForBook}>
          <Plus className="h-4 w-4" />
          <span>{t('newBoard')}</span>
        </Button>
      </div>
    );
  }

  return (
    <DetectivePlaygroundCanvas
      board={activeBoard}
      allBoards={caseboards}
      onSelectBoard={(id) => setSelectedId(id)}
    />
  );
}
