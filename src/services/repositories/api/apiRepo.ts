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
  IRepositories,
  IRepository,
} from '../interfaces';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

class ApiRepository<T extends { id: string }> implements IRepository<T> {
  protected readonly endpoint: string;

  constructor(resourcePath: string) {
    this.endpoint = `${API_BASE}${resourcePath}`;
  }

  protected async request<R>(path: string, init?: RequestInit): Promise<R> {
    if (!API_BASE) {
      throw new Error('NotImplemented: NEXT_PUBLIC_API_URL is not configured');
    }
    const res = await fetch(`${this.endpoint}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    return (await res.json()) as R;
  }

  list(): Promise<T[]> {
    return this.request<T[]>('');
  }
  get(id: string): Promise<T | undefined> {
    return this.request<T>(`/${id}`);
  }
  create(input: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    return this.request<T>('', { method: 'POST', body: JSON.stringify(input) });
  }
  update(id: string, patch: Partial<T>): Promise<T> {
    return this.request<T>(`/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  }
  async remove(id: string): Promise<void> {
    await this.request<void>(`/${id}`, { method: 'DELETE' });
  }
  replaceAll(items: T[]): Promise<T[]> {
    return this.request<T[]>('/bulk', { method: 'PUT', body: JSON.stringify(items) });
  }
  reset(): Promise<T[]> {
    return this.request<T[]>('/reset', { method: 'POST' });
  }
}

class ApiBookRepo extends ApiRepository<Book> implements IBookRepo {
  search(filter?: BookFilter): Promise<Book[]> {
    const params = new URLSearchParams();
    if (filter?.query) params.set('q', filter.query);
    if (filter?.status && filter.status !== 'all') params.set('status', filter.status);
    if (filter?.genre && filter.genre !== 'all') params.set('genre', filter.genre);
    return this.request<Book[]>(`?${params.toString()}`);
  }
}

class ApiJournalRepo extends ApiRepository<JournalEntry> implements IJournalRepo {
  listByBook(bookId: string): Promise<JournalEntry[]> {
    return this.request<JournalEntry[]>(`?bookId=${encodeURIComponent(bookId)}`);
  }
}

class ApiNoteRepo extends ApiRepository<Note> implements INoteRepo {
  listByBook(bookId: string): Promise<Note[]> {
    return this.request<Note[]>(`?bookId=${encodeURIComponent(bookId)}`);
  }
}

class ApiMindMapRepo extends ApiRepository<MindMap> implements IMindMapRepo {
  listByBook(bookId: string): Promise<MindMap[]> {
    return this.request<MindMap[]>(`?bookId=${encodeURIComponent(bookId)}`);
  }
}

class ApiCaseBoardRepo extends ApiRepository<CaseBoard> implements ICaseBoardRepo {
  listByBook(bookId: string): Promise<CaseBoard[]> {
    return this.request<CaseBoard[]>(`?bookId=${encodeURIComponent(bookId)}`);
  }
}

export function createApiRepositories(): IRepositories {
  return {
    books: new ApiBookRepo('/api/books'),
    journals: new ApiJournalRepo('/api/journals'),
    notes: new ApiNoteRepo('/api/notes'),
    mindmaps: new ApiMindMapRepo('/api/mindmaps'),
    caseboards: new ApiCaseBoardRepo('/api/caseboards'),
  };
}
