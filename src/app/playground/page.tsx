import { Suspense } from 'react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PlaygroundView } from '@/features/playground/PlaygroundView';

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PlaygroundView />
    </Suspense>
  );
}
