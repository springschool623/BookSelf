import type { BadgeProps } from '@/components/ui/Badge';
import type { Genre, ReadingStatus } from '@/types';

export const ALL_STATUSES: ReadingStatus[] = ['want', 'reading', 'finished', 'dropped'];

export const ALL_GENRES: Genre[] = [
  'history',
  'detective',
  'novel',
  'science',
  'self-help',
  'philosophy',
  'biography',
  'fantasy',
  'business',
  'other',
];

export const STATUS_BADGE_VARIANT: Record<ReadingStatus, BadgeProps['variant']> = {
  want: 'info',
  reading: 'warning',
  finished: 'success',
  dropped: 'default',
};
