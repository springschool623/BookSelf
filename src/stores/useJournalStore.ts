'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JournalEntry } from '@/types';
import { repositories } from '@/services/repositories';

export type CreateJournalInput = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>;

interface JournalState {
  journals: JournalEntry[];
  initialized: boolean;
  loading: boolean;
  loadJournals: () => Promise<void>;
  createJournal: (input: CreateJournalInput) => Promise<JournalEntry>;
  updateJournal: (id: string, patch: Partial<JournalEntry>) => Promise<JournalEntry>;
  deleteJournal: (id: string) => Promise<void>;
  replaceJournals: (journals: JournalEntry[]) => Promise<void>;
  resetJournals: () => Promise<void>;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      journals: [],
      initialized: false,
      loading: false,
      loadJournals: async () => {
        set({ loading: true });
        try {
          const journals = await repositories.journals.list();
          set({ journals, initialized: true, loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      createJournal: async (input) => {
        const created = await repositories.journals.create(input);
        set((state) => ({ journals: [created, ...state.journals], initialized: true }));
        return created;
      },
      updateJournal: async (id, patch) => {
        const updated = await repositories.journals.update(id, patch);
        set((state) => ({
          journals: state.journals.map((j) => (j.id === id ? updated : j)),
        }));
        return updated;
      },
      deleteJournal: async (id) => {
        await repositories.journals.remove(id);
        set((state) => ({
          journals: state.journals.filter((j) => j.id !== id),
        }));
      },
      replaceJournals: async (journals) => {
        const saved = await repositories.journals.replaceAll(journals);
        set({ journals: saved, initialized: true });
      },
      resetJournals: async () => {
        const reset = await repositories.journals.reset();
        set({ journals: reset, initialized: true });
      },
    }),
    {
      name: 'bookvault-store-journals',
      skipHydration: true,
    }
  )
);
