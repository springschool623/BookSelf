import { describe, expect, it } from 'vitest';
import booksSeed from '@/mocks/books.json';
import caseboardsSeed from '@/mocks/caseboards.json';
import journalsSeed from '@/mocks/journals.json';
import notesSeed from '@/mocks/notes.json';
import mindmapsSeed from '@/mocks/mindmaps.json';
import type { Book, CaseBoard, JournalEntry, MindMap, Note } from '@/types';
import { createBackupPayload, parseBackupJson } from './backup';

describe('backup JSON schema', () => {
  it('accepts valid v2 backup payload with caseboards', () => {
    const payload = createBackupPayload({
      books: booksSeed as Book[],
      journals: journalsSeed as JournalEntry[],
      notes: notesSeed as Note[],
      mindmaps: mindmapsSeed as MindMap[],
      caseboards: caseboardsSeed as CaseBoard[],
    });

    const parsed = parseBackupJson(JSON.stringify(payload));
    expect(parsed.version).toBe(2);
    expect(parsed.books.length).toBeGreaterThan(10);
    expect(parsed.mindmaps.length).toBe(3);
    expect(parsed.caseboards.length).toBe(2);
  });

  it('remains backward compatible with v1 backups without caseboards', () => {
    const legacyV1 = {
      version: 1,
      exportedAt: '2026-11-26T00:00:00.000Z',
      books: booksSeed,
      journals: journalsSeed,
      notes: notesSeed,
      mindmaps: mindmapsSeed,
    };

    const parsed = parseBackupJson(JSON.stringify(legacyV1));
    expect(parsed.version).toBe(1);
    expect(parsed.caseboards).toEqual([]);
  });

  it('rejects malformed or invalid backup payload', () => {
    expect(() => parseBackupJson('not json')).toThrow();
    expect(() =>
      parseBackupJson(JSON.stringify({ version: 3, books: [] }))
    ).toThrow();
    expect(() =>
      parseBackupJson(
        JSON.stringify({
          version: 2,
          exportedAt: '2026-01-01',
          books: [{ id: '' }],
          journals: [],
          notes: [],
          mindmaps: [],
          caseboards: [],
        })
      )
    ).toThrow();
  });
});
