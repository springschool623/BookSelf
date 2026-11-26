'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book } from '@/types';
import { repositories } from '@/services/repositories';

export type CreateBookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;

interface BookState {
  books: Book[];
  initialized: boolean;
  loading: boolean;
  loadBooks: () => Promise<void>;
  createBook: (input: CreateBookInput) => Promise<Book>;
  updateBook: (id: string, patch: Partial<Book>) => Promise<Book>;
  deleteBook: (id: string) => Promise<void>;
  replaceBooks: (books: Book[]) => Promise<void>;
  resetBooks: () => Promise<void>;
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      books: [],
      initialized: false,
      loading: false,
      loadBooks: async () => {
        set({ loading: true });
        try {
          const books = await repositories.books.list();
          set({ books, initialized: true, loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      createBook: async (input) => {
        const created = await repositories.books.create(input);
        set((state) => ({ books: [created, ...state.books], initialized: true }));
        return created;
      },
      updateBook: async (id, patch) => {
        const updated = await repositories.books.update(id, patch);
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? updated : b)),
        }));
        return updated;
      },
      deleteBook: async (id) => {
        await repositories.books.remove(id);
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
        }));
      },
      replaceBooks: async (books) => {
        const saved = await repositories.books.replaceAll(books);
        set({ books: saved, initialized: true });
      },
      resetBooks: async () => {
        const reset = await repositories.books.reset();
        set({ books: reset, initialized: true });
      },
    }),
    {
      name: 'bookvault-store-books',
      skipHydration: true,
    }
  )
);
