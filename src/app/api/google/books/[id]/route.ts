import { NextResponse } from 'next/server';

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing volume id' }, { status: 400 });
  }

  const upstream = new URL(`${GOOGLE_BOOKS_BASE}/${encodeURIComponent(id)}`);
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
        { error: `Google Books API responded with ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to reach Google Books API',
      },
      { status: 502 }
    );
  }
}
