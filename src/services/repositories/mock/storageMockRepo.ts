import { nanoid } from 'nanoid';
import { normalizeText } from '@/lib/utils';
import type {
  Book,
  BookFilter,
  CaseBoard,
  JournalEntry,
  MindMap,
  Note,
} from '@/types';
import type {
  IBookRepo,
  ICaseBoardRepo,
  IJournalRepo,
  IMindMapRepo,
  INoteRepo,
  IRepository,
} from '../interfaces';

const SIMULATED_DELAY_MS = 40;

function delay(ms = SIMULATED_DELAY_MS): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export class StorageMockRepo<
  T extends { id: string; createdAt: string; updatedAt: string },
> implements IRepository<T> {
  private readonly storageKey: string;
  private readonly seedData: T[];

  constructor(storageKey: string, seedData: T[]) {
    this.storageKey = storageKey;
    this.seedData = seedData;
  }

  protected readAll(): T[] {
    const storage = getStorage();
    if (!storage) return structuredClone(this.seedData);

    const raw = storage.getItem(this.storageKey);
    if (!raw) {
      const initial = structuredClone(this.seedData);
      storage.setItem(this.storageKey, JSON.stringify(initial));
      return initial;
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : structuredClone(this.seedData);
    } catch {
      const initial = structuredClone(this.seedData);
      storage.setItem(this.storageKey, JSON.stringify(initial));
      return initial;
    }
  }

  protected writeAll(items: T[]): void {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(this.storageKey, JSON.stringify(items));
  }

  async list(): Promise<T[]> {
    await delay();
    return this.readAll();
  }

  async get(id: string): Promise<T | undefined> {
    await delay();
    return this.readAll().find((item) => item.id === id);
  }

  async create(
    input: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<T, 'id'>>
  ): Promise<T> {
    await delay();
    const now = new Date().toISOString();
    const items = this.readAll();
    const created = {
      ...input,
      id: input.id || nanoid(10),
      createdAt: now,
      updatedAt: now,
    } as T;
    this.writeAll([created, ...items]);
    return created;
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    await delay();
    const items = this.readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id "${id}" not found in ${this.storageKey}`);
    }
    const updated: T = {
      ...items[index],
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    const next = [...items];
    next[index] = updated;
    this.writeAll(next);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await delay();
    const items = this.readAll();
    this.writeAll(items.filter((item) => item.id !== id));
  }

  async replaceAll(items: T[]): Promise<T[]> {
    await delay();
    const cloned = structuredClone(items);
    this.writeAll(cloned);
    return cloned;
  }

  async reset(): Promise<T[]> {
    await delay();
    const initial = structuredClone(this.seedData);
    this.writeAll(initial);
    return initial;
  }
}

export function filterBooks(books: Book[], filter?: BookFilter): Book[] {
  if (!filter) return books;

  const normalizedQuery = filter.query ? normalizeText(filter.query) : '';
  const result = books.filter((book) => {
    if (filter.status && filter.status !== 'all' && book.status !== filter.status) {
      return false;
    }
    if (filter.genre && filter.genre !== 'all' && !book.genres.includes(filter.genre)) {
      return false;
    }
    if (filter.tag && !book.tags.includes(filter.tag)) {
      return false;
    }
    if (filter.collection && !book.collections.includes(filter.collection)) {
      return false;
    }
    if (filter.minRating && (!book.rating || book.rating < filter.minRating)) {
      return false;
    }
    if (normalizedQuery) {
      const haystack = normalizeText(
        [book.title, ...book.authors, ...book.tags, ...book.collections, book.isbn || ''].join(' ')
      );
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  const sortBy = filter.sortBy ?? 'updatedAt';
  const sortOrder = filter.sortOrder ?? 'desc';
  const dir = sortOrder === 'asc' ? 1 : -1;

  return [...result].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      case 'rating':
        return ((a.rating ?? 0) - (b.rating ?? 0)) * dir;
      case 'publishedYear':
        return ((a.publishedYear ?? 0) - (b.publishedYear ?? 0)) * dir;
      case 'updatedAt':
      default:
        return a.updatedAt.localeCompare(b.updatedAt) * dir;
    }
  });
}

export class MockBookRepo extends StorageMockRepo<Book> implements IBookRepo {
  async search(filter?: BookFilter): Promise<Book[]> {
    const all = await this.list();
    return filterBooks(all, filter);
  }
}

export class MockJournalRepo extends StorageMockRepo<JournalEntry> implements IJournalRepo {
  async listByBook(bookId: string): Promise<JournalEntry[]> {
    const all = await this.list();
    return all
      .filter((entry) => entry.bookIds.includes(bookId))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}

export class MockNoteRepo extends StorageMockRepo<Note> implements INoteRepo {
  async listByBook(bookId: string): Promise<Note[]> {
    const all = await this.list();
    return all
      .filter((note) => note.bookId === bookId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export class MockMindMapRepo extends StorageMockRepo<MindMap> implements IMindMapRepo {
  async listByBook(bookId: string): Promise<MindMap[]> {
    const all = await this.list();
    return all
      .filter((m) => m.bookId === bookId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export class MockCaseBoardRepo extends StorageMockRepo<CaseBoard> implements ICaseBoardRepo {
  async listByBook(bookId: string): Promise<CaseBoard[]> {
    const all = await this.list();
    return all
      .filter((c) => c.bookId === bookId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}
