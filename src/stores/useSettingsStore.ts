'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  yearlyGoal: number;
  globalSearchQuery: string;
  setYearlyGoal: (goal: number) => void;
  setGlobalSearchQuery: (query: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      yearlyGoal: 24,
      globalSearchQuery: '',
      setYearlyGoal: (yearlyGoal) => set({ yearlyGoal: Math.max(1, yearlyGoal) }),
      setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
    }),
    {
      name: 'bookvault-store-settings',
      skipHydration: true,
      partialize: (state) => ({ yearlyGoal: state.yearlyGoal }),
    }
  )
);
