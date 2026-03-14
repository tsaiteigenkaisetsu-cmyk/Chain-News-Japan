import { NextResponse } from 'next/server';
import { loadNews } from '@/lib/data';

export const revalidate = 600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cat = searchParams.get('cat');
  const limit = Number(searchParams.get('limit') ?? '50');

  try {
    let news = await loadNews();

    if (cat && cat !== 'all') {
      news = news.filter(n => n.category === cat);
    }

    news = news
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, Math.min(limit, 200));

    return NextResponse.json({ data: news, count: news.length });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
  }
}
