import { NextResponse } from 'next/server';

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const maxResults = Math.min(40, Math.max(1, Number(searchParams.get('maxResults') || 12)));
  const langRestrict = searchParams.get('langRestrict')?.trim();

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  const upstream = new URL(GOOGLE_BOOKS_BASE);
  upstream.searchParams.set('q', q);
  upstream.searchParams.set('maxResults', String(maxResults));
  if (langRestrict) {
    upstream.searchParams.set('langRestrict', langRestrict);
  }
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();
  if (apiKey) {
    upstream.searchParams.set('key', apiKey);
  }

  try {
    const res = await fetch(upstream.toString(), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Google Books API responded with ${res.status}`, items: [] },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json({
      totalItems: data.totalItems ?? 0,
      items: data.items ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to reach Google Books API',
        items: [],
      },
      { status: 502 }
    );
  }
}
