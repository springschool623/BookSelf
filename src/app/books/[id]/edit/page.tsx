import { BookEditLoader } from '@/features/books/BookEditLoader';

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookEditLoader bookId={id} />;
}
