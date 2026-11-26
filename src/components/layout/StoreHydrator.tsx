'use client';

import { useEffect } from 'react';
import { useBookStore } from '@/stores/useBookStore';
import { useCaseBoardStore } from '@/stores/useCaseBoardStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useNoteStore } from '@/stores/useNoteStore';
import { useMindMapStore } from '@/stores/useMindMapStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useHydrationStore } from '@/stores/useHydrated';

export function StoreHydrator() {
  useEffect(() => {
    let active = true;

    async function init() {
      await Promise.all([
        useBookStore.persist.rehydrate(),
        useJournalStore.persist.rehydrate(),
        useNoteStore.persist.rehydrate(),
        useMindMapStore.persist.rehydrate(),
        useCaseBoardStore.persist.rehydrate(),
        useSettingsStore.persist.rehydrate(),
      ]);

      const tasks: Promise<void>[] = [];
      if (!useBookStore.getState().initialized) {
        tasks.push(useBookStore.getState().loadBooks());
      }
      if (!useJournalStore.getState().initialized) {
        tasks.push(useJournalStore.getState().loadJournals());
      }
      if (!useNoteStore.getState().initialized) {
        tasks.push(useNoteStore.getState().loadNotes());
      }
      if (!useMindMapStore.getState().initialized) {
        tasks.push(useMindMapStore.getState().loadMindMaps());
      }
      if (!useCaseBoardStore.getState().initialized) {
        tasks.push(useCaseBoardStore.getState().loadCaseBoards());
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      if (active) {
        useHydrationStore.getState().setHydrated(true);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
