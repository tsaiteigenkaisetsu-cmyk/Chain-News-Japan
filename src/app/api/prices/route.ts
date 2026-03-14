import { NextResponse } from 'next/server';
import { loadPrices } from '@/lib/data';

export const revalidate = 300;

export async function GET() {
  try {
    const prices = await loadPrices();
    return NextResponse.json({ data: prices, updated_at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Failed to load prices' }, { status: 500 });
  }
}
