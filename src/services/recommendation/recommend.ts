import { normalizeText } from '@/lib/utils';
import type { Book, Genre } from '@/types';
import type { MappedGoogleBook } from '@/services/google/googleBooks';

export interface TasteProfile {
  topGenres: Array<{ genre: Genre; weight: number }>;
  topAuthors: string[];
  topTags: string[];
}

export interface RecommendedBook extends MappedGoogleBook {
  score: number;
  reasons: string[];
}

const GENRE_GOOGLE_SUBJECT: Record<Genre, string> = {
  history: 'History',
  detective: 'Mystery',
  novel: 'Fiction',
  science: 'Science',
  'self-help': 'Self-Help',
  philosophy: 'Philosophy',
  biography: 'Biography',
  fantasy: 'Fantasy',
  business: 'Business',
  other: 'Literature',
};

export function extractTasteProfile(library: Book[]): TasteProfile {
  const favorites = library.filter(
    (b) => b.status === 'finished' && (b.rating ?? 0) >= 4
  );
  const pool = favorites.length > 0 ? favorites : library;

  const genreCounts = new Map<Genre, number>();
  const authorCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const book of pool) {
    const boost = book.rating === 5 ? 2 : 1;
    for (const g of book.genres) {
      genreCounts.set(g, (genreCounts.get(g) ?? 0) + boost);
    }
    for (const a of book.authors) {
      authorCounts.set(a, (authorCounts.get(a) ?? 0) + boost);
    }
    for (const t of book.tags) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }

  const topGenres = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre, weight]) => ({ genre, weight }));

  const topAuthors = Array.from(authorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([author]) => author);

  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);

  return { topGenres, topAuthors, topTags };
}

export function buildQueriesForBook(book: Book): string[] {
  const queries: string[] = [];
  if (book.genres[0]) {
    queries.push(`subject:${GENRE_GOOGLE_SUBJECT[book.genres[0]]}`);
  }
  if (book.authors[0]) {
    queries.push(`inauthor:"${book.authors[0]}"`);
  }
  if (book.genres[1]) {
    queries.push(`subject:${GENRE_GOOGLE_SUBJECT[book.genres[1]]}`);
  }
  return queries.length > 0 ? queries : ['subject:History'];
}

export function buildQueriesForProfile(profile: TasteProfile): string[] {
  const queries: string[] = [];
  for (const { genre } of profile.topGenres.slice(0, 2)) {
    queries.push(`subject:${GENRE_GOOGLE_SUBJECT[genre]}`);
  }
  if (profile.topAuthors[0]) {
    queries.push(`inauthor:"${profile.topAuthors[0]}"`);
  }
  return queries.length > 0 ? queries : ['subject:History', 'subject:Mystery'];
}

export function isBookInLibrary(
  candidate: Pick<MappedGoogleBook, 'googleId' | 'isbn' | 'title'>,
  library: Book[]
): boolean {
  const normCandidateTitle = normalizeText(candidate.title);
  return library.some((b) => {
    if (candidate.googleId && b.googleId && candidate.googleId === b.googleId) return true;
    if (candidate.isbn && b.isbn && candidate.isbn === b.isbn) return true;
    return normalizeText(b.title) === normCandidateTitle;
  });
}

export function rankAndDedupeRecommendations(
  candidates: MappedGoogleBook[],
  library: Book[],
  profile: TasteProfile,
  targetBook?: Book
): RecommendedBook[] {
  const seenKeys = new Set<string>();
  const genreWeights = new Map<Genre, number>(
    profile.topGenres.map((item) => [item.genre, item.weight])
  );
  if (targetBook) {
    for (const g of targetBook.genres) {
      genreWeights.set(g, (genreWeights.get(g) ?? 0) + 5);
    }
  }

  const ranked: RecommendedBook[] = [];

  for (const candidate of candidates) {
    if (isBookInLibrary(candidate, library)) continue;

    const dedupeKey = candidate.googleId || candidate.isbn || normalizeText(candidate.title);
    if (!dedupeKey || seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    let score = 0;
    const reasons: string[] = [];

    for (const g of candidate.genres) {
      const w = genreWeights.get(g);
      if (w) {
        score += w * 2;
        reasons.push(g);
      }
    }

    const authorOverlap = candidate.authors.some(
      (a) =>
        profile.topAuthors.some((pa) => normalizeText(pa) === normalizeText(a)) ||
        targetBook?.authors.some((ta) => normalizeText(ta) === normalizeText(a))
    );
    if (authorOverlap) {
      score += 6;
      reasons.push(candidate.authors[0]);
    }

    if (candidate.coverUrl) score += 1;

    ranked.push({
      ...candidate,
      score,
      reasons: Array.from(new Set(reasons)),
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
}

export const OFFLINE_RECOMMENDATION_POOL: MappedGoogleBook[] = [
  {
    googleId: 'offline-homo-deus',
    isbn: '9780062464316',
    title: 'Homo Deus: Lược sử tương lai',
    authors: ['Yuval Noah Harari'],
    description: 'Khám phá những dự phóng về công nghệ sinh học, trí tuệ nhân tạo và tương lai của loài người sau kỷ nguyên Sapiens.',
    publishedYear: 2016,
    pageCount: 448,
    genres: ['history', 'science'],
    tags: ['tương lai', 'văn minh'],
    collections: [],
  },
  {
    googleId: 'offline-roger-ackroyd',
    isbn: '9780062073563',
    title: 'Vụ án mạng của Roger Ackroyd',
    authors: ['Agatha Christie'],
    description: 'Một trong những tiểu thuyết trinh thám kinh điển nhất mọi thời đại của Hercule Poirot với cú lật bất ngờ.',
    publishedYear: 1926,
    pageCount: 288,
    genres: ['detective'],
    tags: ['Poirot', 'kinh điển'],
    collections: [],
  },
  {
    googleId: 'offline-stalingrad',
    isbn: '9780140284584',
    title: 'Stalingrad: The Fateful Siege',
    authors: ['Antony Beevor'],
    description: 'Chi tiết trận chiến khốc liệt nhất trên Mặt trận phía Đông trong Thế chiến II.',
    publishedYear: 1998,
    pageCount: 493,
    genres: ['history'],
    tags: ['Thế chiến 2', 'quân sử'],
    collections: [],
  },
  {
    googleId: 'offline-malice',
    isbn: '9781250037534',
    title: 'Ác ý (Malice)',
    authors: ['Higashino Keigo'],
    description: 'Thám tử Kaga Kyoichiro giải mã động cơ thực sự đằng sau vụ sát hại nhà văn Hidaka Kunihiko.',
    publishedYear: 1996,
    pageCount: 288,
    genres: ['detective', 'novel'],
    tags: ['Nhật Bản', 'tâm lý'],
    collections: [],
  },
  {
    googleId: 'offline-viet-nam-su-luoc',
    title: 'Việt Nam sử lược',
    authors: ['Trần Trọng Kim'],
    description: 'Bộ thông sử tiếng Việt hiện đại đầu tiên hệ thống hóa lịch sử Việt Nam từ thuở lập quốc tới cận đại.',
    publishedYear: 1920,
    pageCount: 540,
    genres: ['history'],
    tags: ['Việt Nam', 'thông sử'],
    collections: [],
  },
  {
    googleId: 'offline-brief-history-time',
    isbn: '9780553380163',
    title: 'Lược sử thời gian',
    authors: ['Stephen Hawking'],
    description: 'Giới thiệu vũ trụ học, hố đen, Big Bang và bản chất của không-thời gian cho độc giả đại chúng.',
    publishedYear: 1988,
    pageCount: 212,
    genres: ['science'],
    tags: ['vật lý', 'vũ trụ'],
    collections: [],
  },
  {
    googleId: 'offline-seneca',
    isbn: '9780140442106',
    title: 'Những bức thư đạo đức (Letters from a Stoic)',
    authors: ['Seneca'],
    description: 'Tuyển tập thư triết học Khắc kỷ về nghệ thuật sống thanh thản, đối diện thời gian và nghịch cảnh.',
    publishedYear: 65,
    pageCount: 254,
    genres: ['philosophy'],
    tags: ['Khắc kỷ', 'La Mã'],
    collections: [],
  },
];
