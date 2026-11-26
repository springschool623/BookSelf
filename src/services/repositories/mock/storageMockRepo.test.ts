import { beforeEach, describe, expect, it } from 'vitest';
import type { Book, CaseBoard } from '@/types';
import { MockBookRepo, MockCaseBoardRepo } from './storageMockRepo';

const seed: Book[] = [
  {
    id: 'seed-1',
    title: 'Seed Book',
    authors: ['Author A'],
    genres: ['history'],
    tags: [],
    collections: [],
    status: 'finished',
    rating: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const caseSeed: CaseBoard[] = [
  {
    id: 'cb-1',
    bookId: 'seed-1',
    title: 'Sample Case',
    theme: 'corkboard',
    nodes: [],
    edges: [],
    hypotheses: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('MockBookRepo with localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('supports CRUD and persists to localStorage', async () => {
    const repo = new MockBookRepo('test:books', seed);

    const initial = await repo.list();
    expect(initial).toHaveLength(1);
    expect(initial[0].title).toBe('Seed Book');

    const created = await repo.create({
      title: 'New Detective Book',
      authors: ['Agatha Christie'],
      genres: ['detective'],
      tags: ['classic'],
      collections: [],
      status: 'want',
    });
    expect(created.id).toBeTruthy();

    const updated = await repo.update(created.id, { status: 'reading', progress: 50 });
    expect(updated.status).toBe('reading');
    expect(updated.progress).toBe(50);

    const repo2 = new MockBookRepo('test:books', seed);
    const found = await repo2.get(created.id);
    expect(found?.progress).toBe(50);

    await repo2.remove(created.id);
    const afterDelete = await repo2.list();
    expect(afterDelete).toHaveLength(1);
  });
});

describe('MockCaseBoardRepo with localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('supports CRUD and listByBook', async () => {
    const repo = new MockCaseBoardRepo('test:caseboards', caseSeed);
    const created = await repo.create({
      bookId: 'book-detective',
      title: 'Mystery Wall',
      theme: 'noir',
      nodes: [],
      edges: [],
      hypotheses: [],
    });

    const filtered = await repo.listByBook('book-detective');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(created.id);

    await repo.remove(created.id);
    expect(await repo.listByBook('book-detective')).toHaveLength(0);
  });
});
