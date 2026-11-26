'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { GitFork, Plus, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select } from '@/components/ui/Input';
import type { Locale } from '@/i18n/config';
import { formatDateLocalized } from '@/lib/date';
import { useMindMapStore } from '@/stores/useMindMapStore';
import type { Book, MindMapKind } from '@/types';
import { createTemplateGraph, getRecommendedMapKinds } from './templates';

const ALL_MAP_KINDS: MindMapKind[] = [
  'characters',
  'timeline',
  'family-tree',
  'case-board',
  'free',
];

export function BookMindMapsTab({ book }: { book: Book }) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const tMap = useTranslations('mindmap');
  const tGenre = useTranslations('genre');
  const tCommon = useTranslations('common');

  const { mindmaps, createMindMap, deleteMindMap } = useMindMapStore();

  const bookMaps = React.useMemo(
    () => mindmaps.filter((m) => m.bookId === book.id),
    [mindmaps, book.id]
  );

  const recommendedKinds = getRecommendedMapKinds(book.genres);
  const isPriorityGenre =
    book.genres.includes('history') || book.genres.includes('detective');

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [kind, setKind] = React.useState<MindMapKind>(recommendedKinds[0]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const graph = createTemplateGraph(kind, book.title);
    const created = await createMindMap({
      bookId: book.id,
      title: title.trim() || `${tMap(`kinds.${kind}`)} · ${book.title}`,
      kind,
      nodes: graph.nodes,
      edges: graph.edges,
    });
    setOpen(false);
    setTitle('');
    toast.success(tCommon('saved'));
    router.push(`/books/${book.id}/mindmap/${created.id}`);
  };

  const handleQuickTemplate = async (selectedKind: MindMapKind) => {
    const graph = createTemplateGraph(selectedKind, book.title);
    const created = await createMindMap({
      bookId: book.id,
      title: `${tMap(`kinds.${selectedKind}`)} · ${book.title}`,
      kind: selectedKind,
      nodes: graph.nodes,
      edges: graph.edges,
    });
    router.push(`/books/${book.id}/mindmap/${created.id}`);
  };

  return (
    <div className="space-y-5">
      {isPriorityGenre && (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--accent-primary)]/40 bg-[var(--accent-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
            <span>
              {tMap('recommendedHint', {
                genres: book.genres.map((g) => tGenre(g)).join(', '),
              })}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedKinds.map((rk) => (
              <Button
                key={rk}
                size="sm"
                onClick={() => handleQuickTemplate(rk)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{tMap(`kinds.${rk}`)}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif-display text-lg font-semibold">
            {tMap('title')}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {tMap('subtitle')}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>{tMap('createMap')}</span>
        </Button>
      </div>

      {bookMaps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-color)] py-12 text-center text-sm text-[var(--text-muted)]">
          {tMap('empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bookMaps.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge variant="accent">
                      <GitFork className="h-3 w-3" />
                      <span>{tMap(`kinds.${m.kind}`)}</span>
                    </Badge>
                    <h4 className="font-serif-display text-base font-semibold">
                      {m.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteMindMap(m.id);
                      toast.success(tCommon('deleted'));
                    }}
                    aria-label={tCommon('delete')}
                    className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-[var(--text-muted)]">
                  {m.nodes.length} nodes · {m.edges.length} edges ·{' '}
                  {formatDateLocalized(m.updatedAt, locale)}
                </div>

                <Link href={`/books/${book.id}/mindmap/${m.id}`}>
                  <Button size="sm" className="w-full">
                    {tMap('openEditor')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={tMap('createMap')}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {tMap('mapTitle')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${tMap(`kinds.${kind}`)} · ${book.title}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {tMap('mapKind')}
            </label>
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value as MindMapKind)}
            >
              {ALL_MAP_KINDS.map((k) => (
                <option key={k} value={k}>
                  {tMap(`kinds.${k}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit">{tMap('useTemplate')}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
