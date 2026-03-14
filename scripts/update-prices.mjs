/**
 * 価格データ更新スクリプト
 * 実行: node scripts/update-prices.mjs
 *
 * CoinGecko 無料APIから主要コインの価格を取得し
 * data/prices.json に保存します。
 * Rate limit: 30 req/min（無料枠）のため 1回のバッチ取得
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'data');
const PRICES_FILE = join(DATA_DIR, 'prices.json');

const COIN_IDS = [
  'bitcoin', 'ethereum', 'tether', 'ripple', 'binancecoin',
  'solana', 'usd-coin', 'dogecoin', 'staked-ether', 'tron',
  'cardano', 'avalanche-2', 'shiba-inu', 'wrapped-bitcoin', 'polkadot',
  'chainlink', 'uniswap', 'litecoin', 'near', 'matic-network',
];

async function fetchPrices() {
  const ids = COIN_IDS.join(',');
  const url =
    `https://api.coingecko.com/api/v3/simple/price` +
    `?ids=${ids}` +
    `&vs_currencies=jpy,usd` +
    `&include_24hr_change=true` +
    `&include_7d_change=true` +
    `&include_market_cap=true` +
    `&include_24hr_vol=true`;

  console.log('💹 CoinGecko APIから価格取得中...');

  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CoinGecko API error ${res.status}: ${body}`);
  }

  return res.json();
}

async function main() {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });

  let data;
  try {
    data = await fetchPrices();
  } catch (err) {
    console.error('❌ 価格取得失敗:', err.message);
    // レートリミットの場合は既存データを維持
    process.exit(0);
  }

  const now = new Date().toISOString();
  const prices = Object.entries(data).map(([coinId, d]) => ({
    coin_id: coinId,
    captured_at: now,
    price_jpy: d.jpy ?? 0,
    price_usd: d.usd ?? 0,
    change_24h: d.jpy_24h_change ?? 0,
    change_7d: d.usd_7d_change ?? 0,
    market_cap_jpy: d.jpy_market_cap ?? 0,
    volume_24h_jpy: d.jpy_24h_vol ?? 0,
  }));

  await writeFile(PRICES_FILE, JSON.stringify(prices, null, 2), 'utf-8');
  console.log(`💾 価格保存完了: ${prices.length}件 → data/prices.json`);
  prices.slice(0, 5).forEach(p => {
    const sign = p.change_24h >= 0 ? '+' : '';
    console.log(`  ${p.coin_id.padEnd(16)} ¥${p.price_jpy.toLocaleString('ja-JP')} (${sign}${p.change_24h.toFixed(2)}%)`);
  });
}

main().catch(err => {
  console.error('❌ エラー:', err);
  process.exit(1);
});
