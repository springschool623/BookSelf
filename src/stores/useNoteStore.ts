'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note } from '@/types';
import { repositories } from '@/services/repositories';

export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;

interface NoteState {
  notes: Note[];
  initialized: boolean;
  loading: boolean;
  loadNotes: () => Promise<void>;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, patch: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  replaceNotes: (notes: Note[]) => Promise<void>;
  resetNotes: () => Promise<void>;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: [],
      initialized: false,
      loading: false,
      loadNotes: async () => {
        set({ loading: true });
        try {
          const notes = await repositories.notes.list();
          set({ notes, initialized: true, loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      createNote: async (input) => {
        const created = await repositories.notes.create(input);
        set((state) => ({ notes: [created, ...state.notes], initialized: true }));
        return created;
      },
      updateNote: async (id, patch) => {
        const updated = await repositories.notes.update(id, patch);
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updated : n)),
        }));
        return updated;
      },
      deleteNote: async (id) => {
        await repositories.notes.remove(id);
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
      },
      replaceNotes: async (notes) => {
        const saved = await repositories.notes.replaceAll(notes);
        set({ notes: saved, initialized: true });
      },
      resetNotes: async () => {
        const reset = await repositories.notes.reset();
        set({ notes: reset, initialized: true });
      },
    }),
    {
      name: 'bookvault-store-notes',
      skipHydration: true,
    }
  )
);
