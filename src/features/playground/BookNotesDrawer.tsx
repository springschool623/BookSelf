'use client';

import { useTranslations } from 'next-intl';
import { Check, Plus, StickyNote } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { CaseNode, Note } from '@/types';

interface BookNotesDrawerProps {
  bookTitle?: string;
  notes: Note[];
  boardNodes: CaseNode[];
  onDropNote: (note: Note) => void;
}

export function BookNotesDrawer({
  bookTitle,
  notes,
  boardNodes,
  onDropNote,
}: BookNotesDrawerProps) {
  const t = useTranslations('playground');
  const tNotes = useTranslations('notes');

  const droppedNoteIds = new Set(
    boardNodes
      .map((n) => n.data.sourceNoteId)
      .filter((id): id is string => Boolean(id))
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--border-color)] p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <StickyNote className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
          <span>{t('bookNotesDrawer')}</span>
        </div>
        {bookTitle && (
          <div className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
            {bookTitle}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {notes.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">{t('noBookNotes')}</p>
        ) : (
          notes.map((note) => {
            const alreadyOnBoard = droppedNoteIds.has(note.id);
            return (
              <div
                key={note.id}
                className="space-y-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <Badge variant={note.type === 'quote' ? 'accent' : 'default'}>
                    {tNotes(`types.${note.type}`)}
                  </Badge>
                  {note.page && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      p.{note.page}
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 leading-relaxed text-[var(--text-secondary)]">
                  {note.content}
                </p>
                {alreadyOnBoard ? (
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" />
                    <span>{t('alreadyOnBoard')}</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => onDropNote(note)}
                  >
                    <Plus className="h-3 w-3" />
                    <span>{t('dropToBoard')}</span>
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
