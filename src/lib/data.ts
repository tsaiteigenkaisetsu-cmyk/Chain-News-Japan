/**
 * データ読み込みユーティリティ
 * - サーバー側: data/ ディレクトリのJSONを読み込む
 * - クライアント側: /api/ エンドポイントを叩く
 */
import type { NewsItem, PriceSnapshot, TopicTrend, RankingEntry, CoinSummary } from '@/types';
import { COIN_MASTER } from './coins';
import { aggregateTopicTrends, buildSurgeRanking, buildGrowthRanking, classifyMatrix } from './scoring';

const DATA_DIR = process.env.DATA_DIR ?? './data';

/** JSONファイルを安全に読み込む（存在しない場合はデフォルト値を返す） */
async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const { readFile } = await import('fs/promises');
    const path = await import('path');
    const fullPath = path.join(process.cwd(), DATA_DIR, filename);
    const raw = await readFile(fullPath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function loadNews(): Promise<NewsItem[]> {
  return readJson<NewsItem[]>('news.json', []);
}

export async function loadPrices(): Promise<PriceSnapshot[]> {
  return readJson<PriceSnapshot[]>('prices.json', []);
}

/** 全コインサマリーを組み立てる */
export async function loadCoinSummaries(): Promise<CoinSummary[]> {
  const [news, prices] = await Promise.all([loadNews(), loadPrices()]);
  const trends = aggregateTopicTrends(news);
  const priceMap = new Map(prices.map(p => [p.coin_id, p]));

  const now = Date.now();
  const h24 = 24 * 60 * 60 * 1000;

  return COIN_MASTER.map(coin => {
    const trend = trends.find(t => t.coin_id === coin.id);
    const price = priceMap.get(coin.id) ?? null;
    const relatedNews = news.filter(n => n.coin_ids.includes(coin.id));
    const recent24h = relatedNews.filter(n => now - new Date(n.published_at).getTime() < h24);

    // 過去7日の日次件数
    const trend_7d: number[] = Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (i + 1) * h24;
      const dayEnd = now - i * h24;
      return relatedNews.filter(n => {
        const t = new Date(n.published_at).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
    }).reverse();

    // ホットなカテゴリ
    const catCount: Record<string, number> = {};
    for (const n of recent24h) {
      catCount[n.category] = (catCount[n.category] ?? 0) + 1;
    }
    const hot_categories = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat) as any[];

    // 一言コメント生成
    const surgeScore = trend?.surge_score ?? 0;
    const priceChange = price?.change_24h ?? 0;
    const matrix = classifyMatrix(priceChange, surgeScore);
    let one_liner: string | null = null;
    if (surgeScore >= 3.0) one_liner = `直近24hでニュースが急増中（${surgeScore.toFixed(1)}倍）`;
    else if (matrix.quadrant === 3) one_liner = 'まだ価格に反映されていない可能性あり';
    else if (matrix.quadrant === 1) one_liner = '価格・話題ともに上昇トレンド';
    else if (hot_categories.includes('regulation')) one_liner = '規制関連の話題が目立つ';
    else if (hot_categories.includes('security')) one_liner = 'セキュリティインシデントの話題あり';

    return {
      ...coin,
      price,
      trend_24h: trend?.news_count ?? 0,
      trend_7d,
      surge_score: trend?.surge_score ?? 0,
      hot_categories,
      one_liner,
    };
  });
}

/** ニュース収集統計を返す */
export async function loadStats() {
  const now = Date.now();
  const h24 = 24 * 60 * 60 * 1000;
  const news = await loadNews();
  const news24h = news.filter(n => now - new Date(n.published_at).getTime() < h24).length;

  // ソース数はフェッチメタから取得、なければ sources.json から
  let sourceCount = 30;
  try {
    const meta = await readJson<{ source_stats?: Record<string, unknown> }>('fetch-meta.json', {});
    if (meta.source_stats) {
      sourceCount = Object.keys(meta.source_stats).length;
    }
  } catch { /* デフォルト値を使用 */ }

  return {
    total_news: news.length,
    news_24h: news24h,
    source_count: sourceCount,
  };
}

/** トップページ用ランキングを全種類返す */
export async function loadRankings() {
  const [news, prices] = await Promise.all([loadNews(), loadPrices()]);
  const trends = aggregateTopicTrends(news);
  const priceMap = new Map(prices.map(p => [p.coin_id, p]));

  return {
    surge_24h: buildSurgeRanking(trends, priceMap, 10),
    growth_7d: buildGrowthRanking(trends, priceMap, 10),
    price_up: prices
      .filter(p => p.change_24h > 0)
      .sort((a, b) => b.change_24h - a.change_24h)
      .slice(0, 10)
      .map((p, i) => {
        const coin = COIN_MASTER.find(c => c.id === p.coin_id)!;
        const t = trends.find(t => t.coin_id === p.coin_id);
        return {
          rank: i + 1, coin, score: p.change_24h, label: `+${p.change_24h.toFixed(2)}%`,
          delta: p.change_24h, price_change_24h: p.change_24h, news_count_24h: t?.news_count ?? 0,
        } as RankingEntry;
      }),
    price_down: prices
      .filter(p => p.change_24h < 0)
      .sort((a, b) => a.change_24h - b.change_24h)
      .slice(0, 10)
      .map((p, i) => {
        const coin = COIN_MASTER.find(c => c.id === p.coin_id)!;
        const t = trends.find(t => t.coin_id === p.coin_id);
        return {
          rank: i + 1, coin, score: p.change_24h, label: `${p.change_24h.toFixed(2)}%`,
          delta: p.change_24h, price_change_24h: p.change_24h, news_count_24h: t?.news_count ?? 0,
        } as RankingEntry;
      }),
    news_increase: buildSurgeRanking(trends, priceMap, 10),
  };
}
