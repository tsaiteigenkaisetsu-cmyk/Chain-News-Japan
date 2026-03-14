/**
 * 話題量スコアリング
 * 急上昇スコア = 直近24h件数 / 過去7日平均
 */
import type { NewsItem, TopicTrend, RankingEntry, Coin } from '@/types';
import { COIN_MASTER } from './coins';

/** コイン別のニュース件数を時系列で集計 */
export function aggregateTopicTrends(news: NewsItem[]): TopicTrend[] {
  const now = Date.now();
  const h24 = 24 * 60 * 60 * 1000;
  const d7 = 7 * 24 * 60 * 60 * 1000;

  const trends: TopicTrend[] = [];

  for (const coin of COIN_MASTER) {
    const related = news.filter(n => n.coin_ids.includes(coin.id));

    // 24時間以内のニュース
    const news24h = related.filter(
      n => now - new Date(n.published_at).getTime() < h24
    );

    // 7日以内のニュース
    const news7d = related.filter(
      n => now - new Date(n.published_at).getTime() < d7
    );

    const count24h = news24h.length;
    const count7d = news7d.length;
    const avg7d = count7d / 7; // 1日あたり平均

    const surgeScore = avg7d > 0 ? count24h / avg7d : count24h > 0 ? 5.0 : 0;

    trends.push({
      coin_id: coin.id,
      date_hour: new Date().toISOString(),
      news_count: count24h,
      change_rate_24h: count24h,
      change_rate_7d: avg7d,
      surge_score: Math.round(surgeScore * 100) / 100,
    });
  }

  return trends;
}

/** 急上昇スコアによるランキング生成 */
export function buildSurgeRanking(
  trends: TopicTrend[],
  priceMap: Map<string, { change_24h: number }>,
  limit = 10,
): RankingEntry[] {
  const coinMap = new Map<string, Coin>(COIN_MASTER.map(c => [c.id, c]));

  return trends
    .filter(t => t.news_count >= 3 && t.surge_score > 0)
    .sort((a, b) => b.surge_score - a.surge_score)
    .slice(0, limit)
    .map((t, i) => {
      const coin = coinMap.get(t.coin_id)!;
      const price = priceMap.get(t.coin_id);
      const surgeLabel =
        t.surge_score >= 5.0 ? '爆発的注目' :
        t.surge_score >= 3.0 ? '急上昇' :
        t.surge_score >= 2.0 ? 'やや注目' : '注目';

      return {
        rank: i + 1,
        coin,
        score: t.surge_score,
        label: surgeLabel,
        delta: t.news_count,
        price_change_24h: price?.change_24h ?? 0,
        news_count_24h: t.news_count,
      };
    });
}

/** 7日間ニュース伸び率ランキング */
export function buildGrowthRanking(
  trends: TopicTrend[],
  priceMap: Map<string, { change_24h: number }>,
  limit = 10,
): RankingEntry[] {
  const coinMap = new Map<string, Coin>(COIN_MASTER.map(c => [c.id, c]));

  return trends
    .filter(t => t.change_rate_24h > 0)
    .sort((a, b) => b.change_rate_24h - a.change_rate_24h)
    .slice(0, limit)
    .map((t, i) => {
      const coin = coinMap.get(t.coin_id)!;
      const price = priceMap.get(t.coin_id);
      return {
        rank: i + 1,
        coin,
        score: t.change_rate_24h,
        label: `${t.change_rate_24h}件/24h`,
        delta: t.change_rate_24h,
        price_change_24h: price?.change_24h ?? 0,
        news_count_24h: t.news_count,
      };
    });
}

/** 時間減衰付き重み計算 (最新記事ほど重い) */
export function timeDecayWeight(publishedAt: string): number {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3600000;
  if (ageHours < 1) return 1.0;
  if (ageHours < 6) return 0.85;
  if (ageHours < 24) return 0.6;
  if (ageHours < 72) return 0.3;
  return 0.1;
}

/** 急上昇スコアの表示ラベル */
export function surgeLabel(score: number): string {
  if (score >= 5.0) return '🔥 爆発的注目';
  if (score >= 3.0) return '⚡ 急上昇';
  if (score >= 2.0) return '📈 やや注目';
  if (score >= 1.0) return '・通常';
  return '・低調';
}

/** 価格×話題量の4象限を判定 */
export function classifyMatrix(priceChange: number, surgeScore: number): {
  quadrant: 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
  const priceUp = priceChange >= 0;
  const newsUp = surgeScore >= 1.5;

  if (priceUp && newsUp) return  { quadrant: 1, label: '価格↑ × 話題↑', color: 'text-brand-up' };
  if (priceUp && !newsUp) return { quadrant: 2, label: '価格↑ × 話題→', color: 'text-brand-accent' };
  if (!priceUp && newsUp) return { quadrant: 3, label: '価格↓ × 話題↑', color: 'text-brand-warning' };
  return                         { quadrant: 4, label: '価格↓ × 話題↓', color: 'text-brand-down' };
}
