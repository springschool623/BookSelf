export type ReadingStatus = 'want' | 'reading' | 'finished' | 'dropped';

export type Genre =
  | 'history'
  | 'detective'
  | 'novel'
  | 'science'
  | 'self-help'
  | 'philosophy'
  | 'biography'
  | 'fantasy'
  | 'business'
  | 'other';

export interface Book {
  id: string;
  googleId?: string;
  isbn?: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  description?: string;
  publishedYear?: number;
  pageCount?: number;
  publisher?: string;
  genres: Genre[];
  tags: string[];
  collections: string[];
  status: ReadingStatus;
  rating?: 1 | 2 | 3 | 4 | 5;
  progress?: number;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookFilter {
  query?: string;
  status?: ReadingStatus | 'all';
  genre?: Genre | 'all';
  tag?: string;
  collection?: string;
  minRating?: number;
  sortBy?: 'updatedAt' | 'title' | 'rating' | 'publishedYear';
  sortOrder?: 'asc' | 'desc';
}
