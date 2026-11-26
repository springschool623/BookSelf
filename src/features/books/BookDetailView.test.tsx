import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import viMessages from '../../../messages/vi.json';
import booksSeed from '@/mocks/books.json';
import journalsSeed from '@/mocks/journals.json';
import mindmapsSeed from '@/mocks/mindmaps.json';
import notesSeed from '@/mocks/notes.json';
import { useBookStore } from '@/stores/useBookStore';
import { useHydrationStore } from '@/stores/useHydrated';
import { useJournalStore } from '@/stores/useJournalStore';
import { useMindMapStore } from '@/stores/useMindMapStore';
import { useNoteStore } from '@/stores/useNoteStore';
import type { Book, JournalEntry, MindMap, Note } from '@/types';
import { BookDetailView } from './BookDetailView';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/books/book-orient-express',
}));

describe('BookDetailView with sample data', () => {
  beforeEach(() => {
    useHydrationStore.setState({ hydrated: true });
    useBookStore.setState({
      books: booksSeed as Book[],
      initialized: true,
      loading: false,
    });
    useNoteStore.setState({
      notes: notesSeed as Note[],
      initialized: true,
      loading: false,
    });
    useMindMapStore.setState({
      mindmaps: mindmapsSeed as MindMap[],
      initialized: true,
      loading: false,
    });
    useJournalStore.setState({
      journals: journalsSeed as JournalEntry[],
      initialized: true,
      loading: false,
    });
  });

  it('renders book details and switches through notes, mindmap, and journal tabs without error', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <QueryClientProvider client={queryClient}>
          <BookDetailView bookId="book-orient-express" />
        </QueryClientProvider>
      </NextIntlClientProvider>
    );

    expect(
      screen.getByRole('heading', {
        name: 'Án mạng trên chuyến tàu tốc hành Phương Đông',
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Agatha Christie/)).toBeInTheDocument();
    expect(
      screen.getByText(/Thám tử Hercule Poirot điều tra vụ sát hại bí ẩn/)
    ).toBeInTheDocument();

    // Switch to Notes & Quotes tab
    fireEvent.click(screen.getByRole('tab', { name: /Ghi chú & Trích dẫn/ }));
    expect(
      screen.getByText(/Nạn nhân Samuel Ratchett thực chất là Cassetti/)
    ).toBeInTheDocument();

    // Switch to Mind Map tab
    fireEvent.click(screen.getByRole('tab', { name: /Sơ đồ cây/ }));
    expect(
      screen.getByText('Sơ đồ vụ án Chuyến tàu Phương Đông')
    ).toBeInTheDocument();

    // Switch to Related Journal tab
    fireEvent.click(screen.getByRole('tab', { name: /Nhật ký liên quan/ }));
    expect(
      screen.getByText('Cú twist trên chuyến tàu Phương Đông')
    ).toBeInTheDocument();
  });
});
