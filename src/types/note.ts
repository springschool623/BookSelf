export type NoteType = 'note' | 'quote' | 'summary';

export interface Note {
  id: string;
  bookId: string;
  type: NoteType;
  content: string;
  page?: number;
  chapter?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
