import booksSeed from '@/mocks/books.json';
import journalsSeed from '@/mocks/journals.json';
import notesSeed from '@/mocks/notes.json';
import mindmapsSeed from '@/mocks/mindmaps.json';
import caseboardsSeed from '@/mocks/caseboards.json';
import type { Book, CaseBoard, JournalEntry, MindMap, Note } from '@/types';
import type { IRepositories } from '../interfaces';
import {
  MockBookRepo,
  MockCaseBoardRepo,
  MockJournalRepo,
  MockMindMapRepo,
  MockNoteRepo,
} from './storageMockRepo';

export function createMockRepositories(): IRepositories {
  return {
    books: new MockBookRepo('bookvault:books', booksSeed as Book[]),
    journals: new MockJournalRepo('bookvault:journals', journalsSeed as JournalEntry[]),
    notes: new MockNoteRepo('bookvault:notes', notesSeed as Note[]),
    mindmaps: new MockMindMapRepo('bookvault:mindmaps', mindmapsSeed as MindMap[]),
    caseboards: new MockCaseBoardRepo('bookvault:caseboards', caseboardsSeed as CaseBoard[]),
  };
}
