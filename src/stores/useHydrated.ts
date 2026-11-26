'use client';

import { create } from 'zustand';

interface HydrationState {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
}

export const useHydrationStore = create<HydrationState>((set) => ({
  hydrated: false,
  setHydrated: (value) => set({ hydrated: value }),
}));

export function useHydrated(): boolean {
  return useHydrationStore((s) => s.hydrated);
}
