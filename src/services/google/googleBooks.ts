import type { Book, Genre } from '@/types';

export interface GoogleVolumeImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
}

export interface GoogleVolumeIndustryIdentifier {
  type: string;
  identifier: string;
}

export interface GoogleVolumeInfo {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: GoogleVolumeIndustryIdentifier[];
  pageCount?: number;
  categories?: string[];
  imageLinks?: GoogleVolumeImageLinks;
  previewLink?: string;
  infoLink?: string;
  language?: string;
}

export interface GoogleVolume {
  id: string;
  volumeInfo: GoogleVolumeInfo;
}

export interface GoogleBooksSearchResponse {
  totalItems?: number;
  items?: GoogleVolume[];
}

export function toHttpsUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:\/\//i, 'https://');
}

const categoryToGenreMap: Array<[RegExp, Genre]> = [
  [/history|historical|war|civilization|ancient/i, 'history'],
  [/mystery|detective|crime|thriller|suspense/i, 'detective'],
  [/science|physics|biology|astronomy|nature|math/i, 'science'],
  [/philosophy|ethics|stoic/i, 'philosophy'],
  [/biography|memoir|autobiography/i, 'biography'],
  [/fantasy|sci-fi|science fiction|magic/i, 'fantasy'],
  [/business|economics|management|startup|finance/i, 'business'],
  [/self-help|psychology|habit|productivity/i, 'self-help'],
  [/fiction|novel|literature/i, 'novel'],
];

export function mapCategoriesToGenres(categories?: string[]): Genre[] {
  if (!categories || categories.length === 0) return ['other'];
  const matched = new Set<Genre>();
  for (const cat of categories) {
    for (const [regex, genre] of categoryToGenreMap) {
      if (regex.test(cat)) {
        matched.add(genre);
      }
    }
  }
  return matched.size > 0 ? Array.from(matched) : ['other'];
}

export function extractIsbn(identifiers?: GoogleVolumeIndustryIdentifier[]): string | undefined {
  if (!identifiers) return undefined;
  const isbn13 = identifiers.find((i) => i.type === 'ISBN_13');
  if (isbn13) return isbn13.identifier;
  return identifiers.find((i) => i.type === 'ISBN_10')?.identifier;
}

export function extractPublishedYear(publishedDate?: string): number | undefined {
  if (!publishedDate) return undefined;
  const match = publishedDate.match(/\d{4}/);
  return match ? Number(match[0]) : undefined;
}

export type MappedGoogleBook = Omit<Book, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
  previewLink?: string;
  infoLink?: string;
  rawCategories?: string[];
};

export function mapVolumeToBook(volume: GoogleVolume): MappedGoogleBook {
  const info = volume.volumeInfo || {};
  const title = info.subtitle ? `${info.title || ''}: ${info.subtitle}` : info.title || 'Untitled';
  const coverUrl = toHttpsUrl(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail);

  return {
    googleId: volume.id,
    isbn: extractIsbn(info.industryIdentifiers),
    title,
    authors: info.authors && info.authors.length > 0 ? info.authors : ['Unknown'],
    coverUrl,
    description: info.description,
    publishedYear: extractPublishedYear(info.publishedDate),
    pageCount: info.pageCount,
    publisher: info.publisher,
    genres: mapCategoriesToGenres(info.categories),
    tags: info.categories ? info.categories.slice(0, 4) : [],
    collections: [],
    previewLink: info.previewLink || info.infoLink,
    infoLink: info.infoLink,
    rawCategories: info.categories,
  };
}

export async function searchGoogleBooksClient(
  q: string,
  opts?: { maxResults?: number; langRestrict?: string }
): Promise<MappedGoogleBook[]> {
  const params = new URLSearchParams({ q });
  if (opts?.maxResults) params.set('maxResults', String(opts.maxResults));
  if (opts?.langRestrict) params.set('langRestrict', opts.langRestrict);

  const res = await fetch(`/api/google/books?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Google Books request failed');
  }
  const data = (await res.json()) as { items?: GoogleVolume[] };
  return (data.items ?? []).map(mapVolumeToBook);
}

export async function getGoogleVolumeClient(googleId: string): Promise<MappedGoogleBook> {
  const res = await fetch(`/api/google/books/${encodeURIComponent(googleId)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Google Books volume request failed');
  }
  const volume = (await res.json()) as GoogleVolume;
  return mapVolumeToBook(volume);
}

export function buildGoogleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function buildWikipediaSearchUrl(query: string, lang = 'vi'): string {
  const host = lang === 'zh' ? 'zh.wikipedia.org' : lang === 'en' ? 'en.wikipedia.org' : 'vi.wikipedia.org';
  return `https://${host}/w/index.php?search=${encodeURIComponent(query)}`;
}
