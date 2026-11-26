import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import viMessages from '../../../messages/vi.json';
import booksSeed from '@/mocks/books.json';
import { useBookStore } from '@/stores/useBookStore';
import { useHydrationStore } from '@/stores/useHydrated';
import type { Book } from '@/types';
import { LibraryView } from './LibraryView';

describe('LibraryView filtering', () => {
  beforeEach(() => {
    useHydrationStore.setState({ hydrated: true });
    useBookStore.setState({
      books: booksSeed as Book[],
      initialized: true,
      loading: false,
    });
  });

  it('renders books and filters by genre in Vietnamese locale', () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <LibraryView />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByRole('heading', { name: 'Sapiens: Lược sử loài người' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Án mạng trên chuyến tàu tốc hành Phương Đông',
      })
    ).toBeInTheDocument();

    const genreSelect = screen.getByLabelText(viMessages.book.genres);
    fireEvent.change(genreSelect, { target: { value: 'detective' } });

    expect(
      screen.getByRole('heading', {
        name: 'Án mạng trên chuyến tàu tốc hành Phương Đông',
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Thói quen nguyên tử' })
    ).not.toBeInTheDocument();
  });
});
