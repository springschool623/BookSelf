'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CaseBoard } from '@/types';
import { repositories } from '@/services/repositories';

export type CreateCaseBoardInput = Omit<CaseBoard, 'id' | 'createdAt' | 'updatedAt'>;

interface CaseBoardState {
  caseboards: CaseBoard[];
  initialized: boolean;
  loading: boolean;
  loadCaseBoards: () => Promise<void>;
  createCaseBoard: (input: CreateCaseBoardInput) => Promise<CaseBoard>;
  updateCaseBoard: (id: string, patch: Partial<CaseBoard>) => Promise<CaseBoard>;
  deleteCaseBoard: (id: string) => Promise<void>;
  replaceCaseBoards: (boards: CaseBoard[]) => Promise<void>;
  resetCaseBoards: () => Promise<void>;
}

export const useCaseBoardStore = create<CaseBoardState>()(
  persist(
    (set) => ({
      caseboards: [],
      initialized: false,
      loading: false,
      loadCaseBoards: async () => {
        set({ loading: true });
        try {
          const caseboards = await repositories.caseboards.list();
          set({ caseboards, initialized: true, loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      createCaseBoard: async (input) => {
        const created = await repositories.caseboards.create(input);
        set((state) => ({
          caseboards: [created, ...state.caseboards],
          initialized: true,
        }));
        return created;
      },
      updateCaseBoard: async (id, patch) => {
        const updated = await repositories.caseboards.update(id, patch);
        set((state) => ({
          caseboards: state.caseboards.map((b) => (b.id === id ? updated : b)),
        }));
        return updated;
      },
      deleteCaseBoard: async (id) => {
        await repositories.caseboards.remove(id);
        set((state) => ({
          caseboards: state.caseboards.filter((b) => b.id !== id),
        }));
      },
      replaceCaseBoards: async (boards) => {
        const saved = await repositories.caseboards.replaceAll(boards);
        set({ caseboards: saved, initialized: true });
      },
      resetCaseBoards: async () => {
        const reset = await repositories.caseboards.reset();
        set({ caseboards: reset, initialized: true });
      },
    }),
    {
      name: 'bookvault-store-caseboards',
      skipHydration: true,
    }
  )
);
