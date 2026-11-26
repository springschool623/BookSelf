import { BookDetailView } from '@/features/books/BookDetailView';

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookDetailView bookId={id} />;
}
