// ---------------------------------------------------------------------------
// コア型定義
// ---------------------------------------------------------------------------

export interface Coin {
  id: string;           // CoinGecko ID (e.g. "bitcoin")
  symbol: string;       // e.g. "BTC"
  name_en: string;
  name_ja: string;
  slug: string;
  market_cap_rank: number | null;
  logo_url: string;
  categories: string[];
}

export interface PriceSnapshot {
  coin_id: string;
  captured_at: string;  // ISO 8601
  price_jpy: number;
  price_usd: number;
  change_24h: number;   // パーセント
  change_7d: number;    // パーセント
  market_cap_jpy: number;
  volume_24h_jpy: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source_name: string;
  source_url: string;
  article_url: string;
  published_at: string;   // ISO 8601
  fetched_at: string;
  language: string;       // "en" | "ja"
  summary_ja: string | null;
  importance_score: number;  // 0.0 – 1.0
  sentiment_score: number;   // -1.0 – 1.0
  category: NewsCategory;
  tags: string[];
  coin_ids: string[];        // 関連コインID
}

export type NewsCategory =
  | 'ETF'
  | 'regulation'
  | 'security'
  | 'listing'
  | 'upgrade'
  | 'partnership'
  | 'macro'
  | 'airdrop'
  | 'defi'
  | 'nft'
  | 'layer2'
  | 'general';

export const NewsCategoryLabel: Record<NewsCategory, string> = {
  ETF: 'ETF',
  regulation: '規制',
  security: 'セキュリティ',
  listing: '上場/廃止',
  upgrade: 'アップデート',
  partnership: '提携',
  macro: 'マクロ',
  airdrop: 'エアドロップ',
  defi: 'DeFi',
  nft: 'NFT',
  layer2: 'Layer2',
  general: '一般',
};

export const NewsCategoryColor: Record<NewsCategory, string> = {
  ETF: 'bg-brand-accent/20 text-brand-accent',
  regulation: 'bg-brand-warning/20 text-brand-warning',
  security: 'bg-brand-down/20 text-brand-down',
  listing: 'bg-brand-warning/20 text-brand-warning',
  upgrade: 'bg-brand-up/20 text-brand-up',
  partnership: 'bg-sky-500/20 text-sky-400',
  macro: 'bg-gray-500/20 text-gray-400',
  airdrop: 'bg-pink-500/20 text-pink-400',
  defi: 'bg-indigo-500/20 text-indigo-400',
  nft: 'bg-orange-500/20 text-orange-400',
  layer2: 'bg-teal-500/20 text-teal-400',
  general: 'bg-gray-600/20 text-gray-400',
};

export interface TopicTrend {
  coin_id: string;
  date_hour: string;    // "2024-01-01T12:00:00Z"
  news_count: number;
  change_rate_24h: number;
  change_rate_7d: number;
  surge_score: number;  // 直近24h件数 / 過去7日平均
}

export interface CoinSummary extends Coin {
  price: PriceSnapshot | null;
  trend_24h: number;        // ニュース件数 (24h)
  trend_7d: number[];       // 過去7日の日次件数
  surge_score: number;
  hot_categories: NewsCategory[];
  one_liner: string | null; // 一言コメント
}

// ===========================================================================
// ソーシャルデータ型
// ===========================================================================

export interface CoinSocialData {
  coin_id: string;
  symbol: string;
  reddit_posts_24h: number;
  reddit_engagement_24h: number;   // upvotes + comments の合計
  news_count_24h: number;
  hype_score: number;              // reddit_engagement / (news_count * 10)
  buzz_rank: number;               // 複合スコアによるランキング
}

export interface TrendWord {
  word: string;
  count: number;
  category: string | null;
}

export interface SocialSnapshot {
  updated_at: string;
  reddit_enabled: boolean;
  coins: CoinSocialData[];
  trend_words: TrendWord[];
  stats: {
    reddit_success: number;
    reddit_failed: number;
    news_analyzed: number;
  };
}

export interface RankingEntry {
  rank: number;
  coin: Coin;
  score: number;
  label: string;
  delta: number;
  price_change_24h: number;
  news_count_24h: number;
}

export interface SiteData {
  updated_at: string;
  coins: Record<string, CoinSummary>;
  news: NewsItem[];
  rankings: {
    surge_24h: RankingEntry[];
    growth_7d: RankingEntry[];
    price_up: RankingEntry[];
    price_down: RankingEntry[];
    news_increase: RankingEntry[];
  };
  topic_trends: TopicTrend[];
}
