'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Plus, Quote, StickyNote, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { splitCommaList } from '@/lib/utils';
import { useNoteStore } from '@/stores/useNoteStore';
import type { NoteType } from '@/types';

const NOTE_TYPES: NoteType[] = ['note', 'quote', 'summary'];

export function BookNotesTab({ bookId }: { bookId: string }) {
  const tNotes = useTranslations('notes');
  const tCommon = useTranslations('common');
  const { notes, createNote, deleteNote } = useNoteStore();

  const [filterType, setFilterType] = React.useState<NoteType | 'all'>('all');
  const [type, setType] = React.useState<NoteType>('note');
  const [content, setContent] = React.useState('');
  const [page, setPage] = React.useState('');
  const [chapter, setChapter] = React.useState('');
  const [tagsText, setTagsText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const bookNotes = React.useMemo(
    () =>
      notes
        .filter((n) => n.bookId === bookId)
        .filter((n) => filterType === 'all' || n.type === filterType)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notes, bookId, filterType]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await createNote({
        bookId,
        type,
        content: content.trim(),
        page: page ? Number(page) : undefined,
        chapter: chapter.trim() || undefined,
        tags: splitCommaList(tagsText),
      });
      setContent('');
      setPage('');
      setChapter('');
      setTagsText('');
      toast.success(tCommon('saved'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    toast.success(tCommon('deleted'));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  {tNotes('type')}
                </label>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as NoteType)}
                >
                  {NOTE_TYPES.map((nt) => (
                    <option key={nt} value={nt}>
                      {tNotes(`types.${nt}`)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  {tNotes('page')}
                </label>
                <Input
                  type="number"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  placeholder="120"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  {tNotes('chapter')}
                </label>
                <Input
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                />
              </div>
            </div>

            <Textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={tNotes('contentPlaceholder')}
              required
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder={tNotes('tags')}
                className="sm:max-w-xs"
              />
              <Button type="submit" disabled={submitting}>
                <Plus className="h-4 w-4" />
                <span>{tNotes('addNote')}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={filterType === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilterType('all')}
        >
          {tCommon('all')}
        </Button>
        {NOTE_TYPES.map((nt) => (
          <Button
            key={nt}
            size="sm"
            variant={filterType === nt ? 'primary' : 'outline'}
            onClick={() => setFilterType(nt)}
          >
            {tNotes(`types.${nt}`)}
          </Button>
        ))}
      </div>

      {bookNotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-color)] py-12 text-center text-sm text-[var(--text-muted)]">
          {tNotes('empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bookNotes.map((note) => (
            <Card
              key={note.id}
              className={
                note.type === 'quote'
                  ? 'border-l-4 border-l-[var(--accent-primary)]'
                  : ''
              }
            >
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={
                      note.type === 'quote'
                        ? 'accent'
                        : note.type === 'summary'
                          ? 'info'
                          : 'default'
                    }
                  >
                    {note.type === 'quote' ? (
                      <Quote className="h-3 w-3" />
                    ) : note.type === 'summary' ? (
                      <BookOpen className="h-3 w-3" />
                    ) : (
                      <StickyNote className="h-3 w-3" />
                    )}
                    <span>{tNotes(`types.${note.type}`)}</span>
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    aria-label={tCommon('delete')}
                    className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p
                  className={
                    note.type === 'quote'
                      ? 'font-serif-display text-sm italic leading-relaxed'
                      : 'text-sm leading-relaxed'
                  }
                >
                  {note.type === 'quote' ? `“${note.content}”` : note.content}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  {note.chapter && <span>{note.chapter}</span>}
                  {note.page && (
                    <span>
                      · {tNotes('page')} {note.page}
                    </span>
                  )}
                </div>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
