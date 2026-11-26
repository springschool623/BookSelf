'use client';

import { createBackupPayload, type BackupPayload } from '@/lib/backup';
import { useBookStore } from './useBookStore';
import { useCaseBoardStore } from './useCaseBoardStore';
import { useJournalStore } from './useJournalStore';
import { useMindMapStore } from './useMindMapStore';
import { useNoteStore } from './useNoteStore';

export function buildCurrentBackup(): BackupPayload {
  return createBackupPayload({
    books: useBookStore.getState().books,
    journals: useJournalStore.getState().journals,
    notes: useNoteStore.getState().notes,
    mindmaps: useMindMapStore.getState().mindmaps,
    caseboards: useCaseBoardStore.getState().caseboards,
  });
}

export async function restoreBackupPayload(payload: BackupPayload): Promise<void> {
  await Promise.all([
    useBookStore.getState().replaceBooks(payload.books),
    useJournalStore.getState().replaceJournals(payload.journals),
    useNoteStore.getState().replaceNotes(payload.notes),
    useMindMapStore.getState().replaceMindMaps(payload.mindmaps),
    useCaseBoardStore.getState().replaceCaseBoards(payload.caseboards ?? []),
  ]);
}

export async function resetAllToSampleData(): Promise<void> {
  await Promise.all([
    useBookStore.getState().resetBooks(),
    useJournalStore.getState().resetJournals(),
    useNoteStore.getState().resetNotes(),
    useMindMapStore.getState().resetMindMaps(),
    useCaseBoardStore.getState().resetCaseBoards(),
  ]);
}
