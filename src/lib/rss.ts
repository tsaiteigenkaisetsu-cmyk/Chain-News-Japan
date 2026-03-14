/**
 * RSSフィード取得 & ニュース正規化
 * 権利リスク軽減のため: タイトル・URL・日時・出典のみ保存し本文は保存しない
 */
import type { NewsItem, NewsCategory } from '@/types';
import { COIN_KEYWORDS } from './coins';
import { createHash } from 'crypto';

export interface RSSSource {
  name: string;
  url: string;
  language: 'en' | 'ja';
  trust_score: number;   // 0.5 – 1.0
}

export const RSS_SOURCES: RSSSource[] = [
  // 英語ソース
  { name: 'CoinDesk',         url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',            language: 'en', trust_score: 1.0 },
  { name: 'CoinTelegraph',    url: 'https://cointelegraph.com/rss',                               language: 'en', trust_score: 1.0 },
  { name: 'The Block',        url: 'https://www.theblock.co/rss.xml',                             language: 'en', trust_score: 0.9 },
  { name: 'Decrypt',          url: 'https://decrypt.co/feed',                                     language: 'en', trust_score: 0.9 },
  { name: 'Bitcoin Magazine',  url: 'https://bitcoinmagazine.com/.rss/full/',                      language: 'en', trust_score: 0.8 },
  // 日本語ソース
  { name: 'CoinPost',          url: 'https://coinpost.jp/?feed=rss2',                              language: 'ja', trust_score: 1.0 },
  { name: 'CoinDesk Japan',    url: 'https://www.coindeskjapan.com/feed/',                         language: 'ja', trust_score: 0.95 },
  { name: 'Minkabu Crypto',    url: 'https://crypto.minkabu.jp/news/rss',                          language: 'ja', trust_score: 0.85 },
];

/** ニュースIDをタイトル+URLハッシュから生成（重複排除用） */
export function generateNewsId(title: string, url: string): string {
  return createHash('md5').update(`${title}||${url}`).digest('hex').slice(0, 16);
}

/** カテゴリ推定（キーワードベース） */
export function inferCategory(title: string, tags: string[]): NewsCategory {
  const t = (title + ' ' + tags.join(' ')).toLowerCase();
  if (/etf|exchange.traded/i.test(t)) return 'ETF';
  if (/hack|exploit|breach|vulnerab|stolen|drain/i.test(t)) return 'security';
  if (/regulat|sec |cftc|法規制|規制|ban|禁止|法案|当局/i.test(t)) return 'regulation';
  if (/list|delist|上場|廃止/i.test(t)) return 'listing';
  if (/upgrade|update|fork|mainnet|アップデート|ハードフォーク/i.test(t)) return 'upgrade';
  if (/partner|integrat|提携|partnership/i.test(t)) return 'partnership';
  if (/fed |interest rate|inflation|macro|fed rate|cpi|gdp/i.test(t)) return 'macro';
  if (/airdrop|エアドロップ/i.test(t)) return 'airdrop';
  if (/defi|yield|liquidity|swap|amm|dex/i.test(t)) return 'defi';
  if (/nft|非代替|opensea/i.test(t)) return 'nft';
  if (/layer.?2|l2|rollup|optimism|arbitrum/i.test(t)) return 'layer2';
  return 'general';
}

/** タイトルから関連コインIDを抽出 */
export function extractCoinIds(title: string): string[] {
  const lower = title.toLowerCase();
  const found: string[] = [];
  for (const [coinId, keywords] of Object.entries(COIN_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      found.push(coinId);
    }
  }
  return [...new Set(found)];
}

/** 重要度スコアを計算（0.0-1.0） */
export function calcImportanceScore(
  source_trust: number,
  category: NewsCategory,
): number {
  const categoryWeight: Record<NewsCategory, number> = {
    security: 1.0,
    ETF: 0.95,
    regulation: 0.9,
    listing: 0.75,
    upgrade: 0.7,
    partnership: 0.65,
    macro: 0.6,
    airdrop: 0.5,
    defi: 0.55,
    nft: 0.45,
    layer2: 0.55,
    general: 0.4,
  };
  return Math.min(1.0, source_trust * (categoryWeight[category] ?? 0.4) + 0.1);
}

/** ニュースアイテムを正規化 */
export function normalizeNewsItem(
  raw: { title?: string; link?: string; pubDate?: string; isoDate?: string; categories?: string[] },
  source: RSSSource,
): NewsItem | null {
  const title = (raw.title ?? '').trim();
  const url = (raw.link ?? '').trim();
  if (!title || !url) return null;

  // URLがhttps以外は除外（セキュリティ）
  if (!url.startsWith('https://') && !url.startsWith('http://')) return null;

  const tags = (raw.categories ?? []).map(c => c.toLowerCase());
  const category = inferCategory(title, tags);
  const coin_ids = extractCoinIds(title);
  const importance = calcImportanceScore(source.trust_score, category);

  return {
    id: generateNewsId(title, url),
    title,
    source_name: source.name,
    source_url: source.url,
    article_url: url,
    published_at: raw.isoDate ?? raw.pubDate ?? new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    language: source.language,
    summary_ja: null,
    importance_score: Math.round(importance * 100) / 100,
    sentiment_score: 0,
    category,
    tags,
    coin_ids: coin_ids.length > 0 ? coin_ids : ['general'],
  };
}
