import type {
  Book,
  BookFilter,
  CaseBoard,
  JournalEntry,
  MindMap,
  Note,
} from '@/types';

export interface IRepository<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(input: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<T, 'id'>>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
  replaceAll(items: T[]): Promise<T[]>;
  reset(): Promise<T[]>;
}

export interface IBookRepo extends IRepository<Book> {
  search(filter?: BookFilter): Promise<Book[]>;
}

export interface IJournalRepo extends IRepository<JournalEntry> {
  listByBook(bookId: string): Promise<JournalEntry[]>;
}

export interface INoteRepo extends IRepository<Note> {
  listByBook(bookId: string): Promise<Note[]>;
}

export interface IMindMapRepo extends IRepository<MindMap> {
  listByBook(bookId: string): Promise<MindMap[]>;
}

export interface ICaseBoardRepo extends IRepository<CaseBoard> {
  listByBook(bookId: string): Promise<CaseBoard[]>;
}

export interface IRepositories {
  books: IBookRepo;
  journals: IJournalRepo;
  notes: INoteRepo;
  mindmaps: IMindMapRepo;
  caseboards: ICaseBoardRepo;
}
