import { z } from 'zod';
import type { Book, CaseBoard, JournalEntry, MindMap, Note } from '@/types';

const genreEnum = z.enum([
  'history',
  'detective',
  'novel',
  'science',
  'self-help',
  'philosophy',
  'biography',
  'fantasy',
  'business',
  'other',
]);

const statusEnum = z.enum(['want', 'reading', 'finished', 'dropped']);

export const bookSchema = z.object({
  id: z.string().min(1),
  googleId: z.string().optional(),
  isbn: z.string().optional(),
  title: z.string().min(1),
  authors: z.array(z.string()),
  coverUrl: z.string().optional(),
  description: z.string().optional(),
  publishedYear: z.number().optional(),
  pageCount: z.number().optional(),
  publisher: z.string().optional(),
  genres: z.array(genreEnum),
  tags: z.array(z.string()),
  collections: z.array(z.string()),
  status: statusEnum,
  rating: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
    .optional(),
  progress: z.number().optional(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const journalSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  title: z.string().min(1),
  contentHtml: z.string(),
  mood: z.enum(['inspired', 'thoughtful', 'excited', 'calm', 'curious']).optional(),
  bookIds: z.array(z.string()),
  pagesRead: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const noteSchema = z.object({
  id: z.string().min(1),
  bookId: z.string().min(1),
  type: z.enum(['note', 'quote', 'summary']),
  content: z.string().min(1),
  page: z.number().optional(),
  chapter: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const mindMapSchema = z.object({
  id: z.string().min(1),
  bookId: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(['characters', 'timeline', 'family-tree', 'case-board', 'free']),
  nodes: z.array(
    z.object({
      id: z.string().min(1),
      type: z.enum(['character', 'event', 'clue', 'place', 'note']),
      position: z.object({ x: z.number(), y: z.number() }),
      data: z
        .object({
          label: z.string(),
          description: z.string().optional(),
          color: z.string().optional(),
          date: z.string().optional(),
          role: z.string().optional(),
          isSuspect: z.boolean().optional(),
        })
        .passthrough(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string().min(1),
      source: z.string().min(1),
      target: z.string().min(1),
      label: z.string().optional(),
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const caseBoardSchema = z.object({
  id: z.string().min(1),
  bookId: z.string().optional(),
  title: z.string().min(1),
  theme: z.enum(['corkboard', 'noir']),
  nodes: z.array(
    z.object({
      id: z.string().min(1),
      type: z.enum(['suspect', 'clue', 'sticky', 'alibi', 'location']),
      position: z.object({ x: z.number(), y: z.number() }),
      data: z
        .object({
          label: z.string(),
        })
        .passthrough(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string().min(1),
      source: z.string().min(1),
      target: z.string().min(1),
      label: z.string().optional(),
      kind: z.enum(['suspect', 'contradicts', 'alibi', 'related']),
    })
  ),
  hypotheses: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      suspectNodeId: z.string().optional(),
      status: z.enum(['investigating', 'disproved', 'confirmed']),
      supportingNodeIds: z.array(z.string()),
      contradictingNodeIds: z.array(z.string()),
      notes: z.string().optional(),
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  exportedAt: z.string(),
  books: z.array(bookSchema),
  journals: z.array(journalSchema),
  notes: z.array(noteSchema),
  mindmaps: z.array(mindMapSchema),
  caseboards: z.array(caseBoardSchema).optional().default([]),
});

export type BackupPayload = {
  version: 1 | 2;
  exportedAt: string;
  books: Book[];
  journals: JournalEntry[];
  notes: Note[];
  mindmaps: MindMap[];
  caseboards: CaseBoard[];
};

export function createBackupPayload(data: {
  books: Book[];
  journals: JournalEntry[];
  notes: Note[];
  mindmaps: MindMap[];
  caseboards?: CaseBoard[];
}): BackupPayload {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    books: data.books,
    journals: data.journals,
    notes: data.notes,
    mindmaps: data.mindmaps,
    caseboards: data.caseboards ?? [],
  };
}

export function parseBackupJson(rawText: string): BackupPayload {
  const parsed = JSON.parse(rawText);
  return backupSchema.parse(parsed) as BackupPayload;
}
