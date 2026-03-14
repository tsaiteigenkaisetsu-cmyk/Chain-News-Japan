import { NextResponse } from 'next/server';
import { loadRankings } from '@/lib/data';

export const revalidate = 600;

export async function GET() {
  try {
    const rankings = await loadRankings();
    return NextResponse.json({ data: rankings, updated_at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Failed to load rankings' }, { status: 500 });
  }
}
