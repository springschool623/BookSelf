import { describe, expect, it } from 'vitest';
import type { Book } from '@/types';
import type { MappedGoogleBook } from '@/services/google/googleBooks';
import {
  extractTasteProfile,
  rankAndDedupeRecommendations,
} from './recommend';

const library: Book[] = [
  {
    id: 'b1',
    googleId: 'g-existing',
    isbn: '9780000000001',
    title: 'Sapiens: Lược sử loài người',
    authors: ['Yuval Noah Harari'],
    genres: ['history'],
    tags: ['văn minh'],
    collections: [],
    status: 'finished',
    rating: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'b2',
    title: 'Sherlock Holmes',
    authors: ['Arthur Conan Doyle'],
    genres: ['detective'],
    tags: [],
    collections: [],
    status: 'finished',
    rating: 4,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
];

describe('recommendation engine', () => {
  it('deduplicates books already in library by googleId, isbn, and normalized title', () => {
    const profile = extractTasteProfile(library);
    const candidates: MappedGoogleBook[] = [
      {
        googleId: 'g-existing',
        title: 'Duplicate by Google ID',
        authors: ['Someone'],
        genres: ['history'],
        tags: [],
        collections: [],
      },
      {
        googleId: 'g-isbn-dup',
        isbn: '9780000000001',
        title: 'Duplicate by ISBN',
        authors: ['Someone'],
        genres: ['history'],
        tags: [],
        collections: [],
      },
      {
        googleId: 'g-title-dup',
        title: 'sherlock holmes',
        authors: ['Arthur Conan Doyle'],
        genres: ['detective'],
        tags: [],
        collections: [],
      },
      {
        googleId: 'g-new-1',
        title: 'Homo Deus',
        authors: ['Yuval Noah Harari'],
        genres: ['history'],
        tags: [],
        collections: [],
        coverUrl: 'https://example.com/cover.jpg',
      },
      {
        googleId: 'g-new-2',
        title: 'Generic Business Book',
        authors: ['Unknown Author'],
        genres: ['business'],
        tags: [],
        collections: [],
      },
    ];

    const ranked = rankAndDedupeRecommendations(candidates, library, profile);

    expect(ranked.map((r) => r.googleId)).toEqual(['g-new-1', 'g-new-2']);
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});
