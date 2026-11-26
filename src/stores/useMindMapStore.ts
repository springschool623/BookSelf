'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MindMap } from '@/types';
import { repositories } from '@/services/repositories';

export type CreateMindMapInput = Omit<MindMap, 'id' | 'createdAt' | 'updatedAt'>;

interface MindMapState {
  mindmaps: MindMap[];
  initialized: boolean;
  loading: boolean;
  loadMindMaps: () => Promise<void>;
  createMindMap: (input: CreateMindMapInput) => Promise<MindMap>;
  updateMindMap: (id: string, patch: Partial<MindMap>) => Promise<MindMap>;
  deleteMindMap: (id: string) => Promise<void>;
  replaceMindMaps: (mindmaps: MindMap[]) => Promise<void>;
  resetMindMaps: () => Promise<void>;
}

export const useMindMapStore = create<MindMapState>()(
  persist(
    (set) => ({
      mindmaps: [],
      initialized: false,
      loading: false,
      loadMindMaps: async () => {
        set({ loading: true });
        try {
          const mindmaps = await repositories.mindmaps.list();
          set({ mindmaps, initialized: true, loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      createMindMap: async (input) => {
        const created = await repositories.mindmaps.create(input);
        set((state) => ({ mindmaps: [created, ...state.mindmaps], initialized: true }));
        return created;
      },
      updateMindMap: async (id, patch) => {
        const updated = await repositories.mindmaps.update(id, patch);
        set((state) => ({
          mindmaps: state.mindmaps.map((m) => (m.id === id ? updated : m)),
        }));
        return updated;
      },
      deleteMindMap: async (id) => {
        await repositories.mindmaps.remove(id);
        set((state) => ({
          mindmaps: state.mindmaps.filter((m) => m.id !== id),
        }));
      },
      replaceMindMaps: async (mindmaps) => {
        const saved = await repositories.mindmaps.replaceAll(mindmaps);
        set({ mindmaps: saved, initialized: true });
      },
      resetMindMaps: async () => {
        const reset = await repositories.mindmaps.reset();
        set({ mindmaps: reset, initialized: true });
      },
    }),
    {
      name: 'bookvault-store-mindmaps',
      skipHydration: true,
    }
  )
);
