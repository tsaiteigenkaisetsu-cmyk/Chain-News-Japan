/**
 * CoinGecko Free API ラッパー
 * Rate limit: 30 req/min (無料枠)
 */
import type { PriceSnapshot } from '@/types';
import { COIN_MASTER } from './coins';

const BASE = 'https://api.coingecko.com/api/v3';

interface CGPrice {
  [coinId: string]: {
    jpy: number;
    usd: number;
    jpy_24h_change: number;
    usd_7d_change: number;
    market_cap: number;
    total_volume: number;
  };
}

export async function fetchPrices(): Promise<PriceSnapshot[]> {
  const ids = COIN_MASTER.map(c => c.id).join(',');
  const url =
    `${BASE}/simple/price?ids=${ids}` +
    `&vs_currencies=jpy,usd` +
    `&include_24hr_change=true` +
    `&include_7d_change=true` +
    `&include_market_cap=true` +
    `&include_24hr_vol=true`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  const data: CGPrice = await res.json();

  const now = new Date().toISOString();
  return Object.entries(data).map(([coinId, d]) => ({
    coin_id: coinId,
    captured_at: now,
    price_jpy: d.jpy ?? 0,
    price_usd: d.usd ?? 0,
    change_24h: d.jpy_24h_change ?? 0,
    change_7d: d.usd_7d_change ?? 0,
    market_cap_jpy: d.market_cap ?? 0,
    volume_24h_jpy: d.total_volume ?? 0,
  }));
}

export async function fetchCoinDetails(coinId: string) {
  const url = `${BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  return res.json();
}
