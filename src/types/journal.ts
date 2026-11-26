export type JournalMood = 'inspired' | 'thoughtful' | 'excited' | 'calm' | 'curious';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  contentHtml: string;
  mood?: JournalMood;
  bookIds: string[];
  pagesRead?: number;
  createdAt: string;
  updatedAt: string;
}
