'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ExternalLink, Globe, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  buildGoogleSearchUrl,
  buildWikipediaSearchUrl,
} from '@/services/google/googleBooks';
import type { Book } from '@/types';

export function BookGooglePanel({ book }: { book: Book }) {
  const locale = useLocale();
  const tBook = useTranslations('book');

  const googleBooksUrl = book.googleId
    ? `https://books.google.com/books?id=${encodeURIComponent(book.googleId)}`
    : buildGoogleSearchUrl(`${book.title} ${book.authors[0] || ''} book`);

  const authorQuery = book.authors[0] || book.title;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4 text-[var(--accent-primary)]" />
          <span>{tBook('googleInfo')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 text-sm">
        <a
          href={googleBooksUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border border-[var(--border-color)] px-3 py-2 hover:bg-[var(--bg-secondary)]"
        >
          <span>{tBook('openGoogleBooks')}</span>
          <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
        </a>
        <a
          href={buildGoogleSearchUrl(`${book.title} ${authorQuery}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border border-[var(--border-color)] px-3 py-2 hover:bg-[var(--bg-secondary)]"
        >
          <span className="inline-flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            {tBook('searchGoogleAuthor')}
          </span>
          <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
        </a>
        <a
          href={buildWikipediaSearchUrl(authorQuery, locale)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg border border-[var(--border-color)] px-3 py-2 hover:bg-[var(--bg-secondary)]"
        >
          <span>{tBook('searchWikipedia')}</span>
          <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
        </a>
      </CardContent>
    </Card>
  );
}
