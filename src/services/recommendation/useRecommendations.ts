'use client';

import { useQuery } from '@tanstack/react-query';
import { searchGoogleBooksClient } from '@/services/google/googleBooks';
import {
  buildQueriesForBook,
  buildQueriesForProfile,
  extractTasteProfile,
  OFFLINE_RECOMMENDATION_POOL,
  rankAndDedupeRecommendations,
  type RecommendedBook,
} from '@/services/recommendation/recommend';
import type { Book } from '@/types';

export interface RecommendationResult {
  items: RecommendedBook[];
  isFallback: boolean;
}

export function useBookRecommendations(library: Book[], targetBook?: Book) {
  const profile = extractTasteProfile(library);
  const queries = targetBook
    ? buildQueriesForBook(targetBook)
    : buildQueriesForProfile(profile);

  return useQuery<RecommendationResult>({
    queryKey: ['recommendations', targetBook?.id ?? 'global', queries.join('|'), library.length],
    queryFn: async () => {
      try {
        const batches = await Promise.allSettled(
          queries.slice(0, 3).map((q) => searchGoogleBooksClient(q, { maxResults: 8 }))
        );
        const candidates = batches.flatMap((res) =>
          res.status === 'fulfilled' ? res.value : []
        );

        if (candidates.length === 0) {
          return {
            items: rankAndDedupeRecommendations(
              OFFLINE_RECOMMENDATION_POOL,
              library,
              profile,
              targetBook
            ),
            isFallback: true,
          };
        }

        const ranked = rankAndDedupeRecommendations(candidates, library, profile, targetBook);
        if (ranked.length === 0) {
          return {
            items: rankAndDedupeRecommendations(
              OFFLINE_RECOMMENDATION_POOL,
              library,
              profile,
              targetBook
            ),
            isFallback: true,
          };
        }

        return { items: ranked, isFallback: false };
      } catch {
        return {
          items: rankAndDedupeRecommendations(
            OFFLINE_RECOMMENDATION_POOL,
            library,
            profile,
            targetBook
          ),
          isFallback: true,
        };
      }
    },
    staleTime: 60 * 60 * 1000,
  });
}
