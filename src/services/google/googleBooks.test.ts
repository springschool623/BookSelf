import { describe, expect, it } from 'vitest';
import { mapVolumeToBook, type GoogleVolume } from './googleBooks';

describe('mapVolumeToBook', () => {
  it('maps Google Books volume to Book fields and upgrades thumbnail to https', () => {
    const sample: GoogleVolume = {
      id: 'gb-123',
      volumeInfo: {
        title: 'Murder on the Orient Express',
        subtitle: 'A Hercule Poirot Mystery',
        authors: ['Agatha Christie'],
        publisher: 'HarperCollins',
        publishedDate: '1934-01-01',
        description: 'Classic detective novel.',
        pageCount: 274,
        categories: ['Fiction / Mystery & Detective / General'],
        industryIdentifiers: [
          { type: 'ISBN_10', identifier: '0062693662' },
          { type: 'ISBN_13', identifier: '9780062693662' },
        ],
        imageLinks: {
          thumbnail: 'http://books.google.com/books/content?id=gb-123&img=1',
        },
        previewLink: 'https://books.google.com/books?id=gb-123',
      },
    };

    const mapped = mapVolumeToBook(sample);

    expect(mapped.googleId).toBe('gb-123');
    expect(mapped.title).toBe('Murder on the Orient Express: A Hercule Poirot Mystery');
    expect(mapped.authors).toEqual(['Agatha Christie']);
    expect(mapped.isbn).toBe('9780062693662');
    expect(mapped.publishedYear).toBe(1934);
    expect(mapped.pageCount).toBe(274);
    expect(mapped.genres).toContain('detective');
    expect(mapped.coverUrl).toBe('https://books.google.com/books/content?id=gb-123&img=1');
  });
});
