import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadCoinSummaries, loadNews } from '@/lib/data';
import { COIN_SLUG_MAP } from '@/lib/coins';
import NewsCard from '@/components/NewsCard';
import TrendChart from '@/components/TrendChart';
import AdSlot from '@/components/AdSlot';
import CoinImage from '@/components/CoinImage';
import { formatJPY, formatChange, changeColor, surgeBadgeColor, shortNumber } from '@/lib/format';
import { NewsCategoryLabel, NewsCategoryColor } from '@/types';
import type { NewsCategory } from '@/types';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const { COIN_MASTER } = await import('@/lib/coins');
  return COIN_MASTER.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const coin = COIN_SLUG_MAP.get(params.slug);
  if (!coin) return { title: 'Not Found' };
  return {
    title: `${coin.name_ja}(${coin.symbol}) ニュース・話題量・価格`,
    description: `${coin.name_ja}の最新ニュース、話題量推移、価格情報をまとめて確認。急上昇スコアや関連テーマも表示。`,
  };
}

export const revalidate = 600;

export default async function CoinDetailPage({ params }: Props) {
  const coinMeta = COIN_SLUG_MAP.get(params.slug);
  if (!coinMeta) notFound();

  const [coins, news] = await Promise.all([loadCoinSummaries(), loadNews()]);
  const coin = coins.find(c => c.slug === params.slug);
  if (!coin) notFound();

  // この通貨のニュース
  const relatedNews = news
    .filter(n => n.coin_ids.includes(coin.id))
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  // 7日間チャートデータ
  const chartData = coin.trend_7d.map((count, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, news: count };
  });

  // カテゴリ分布
  const catDist: Record<string, number> = {};
  for (const n of relatedNews) {
    catDist[n.category] = (catDist[n.category] ?? 0) + 1;
  }

  // 類似通貨（同カテゴリの上位3件）
  const similarCoins = coins
    .filter(c => c.id !== coin.id && c.hot_categories.some(cat => coin.hot_categories.includes(cat)))
    .sort((a, b) => b.surge_score - a.surge_score)
    .slice(0, 4);

  const priceChange = coin.price?.change_24h ?? 0;
  const isUp = priceChange >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* パンくず */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-brand-accent transition-colors">ホーム</Link>
        <span>/</span>
        <Link href="/ranking" className="hover:text-brand-accent transition-colors">ランキング</Link>
        <span>/</span>
        <span className="text-text-secondary">{coin.symbol}</span>
      </div>

      {/* ========== コインヘッダー ========== */}
      <div className="bg-bg-card rounded-card_lg border border-white/5 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* アイコン + 名前 */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-bg-elevated">
              <CoinImage
                src={coin.logo_url}
                alt={coin.symbol}
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{coin.name_ja}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-text-secondary">{coin.symbol}</span>
                {coin.market_cap_rank && (
                  <span className="text-xs bg-bg-elevated px-2 py-0.5 rounded text-text-muted">
                    #{coin.market_cap_rank}
                  </span>
                )}
                {coin.surge_score >= 2.0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${surgeBadgeColor(coin.surge_score)}`}>
                    {coin.surge_score.toFixed(1)}x 急上昇
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 価格情報 */}
          {coin.price && (
            <div className="sm:ml-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-text-muted mb-1">現在価格</div>
                <div className="font-mono font-bold text-xl text-text-primary">
                  {formatJPY(coin.price.price_jpy)}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">24h変動</div>
                <div className={`font-mono font-bold text-lg ${changeColor(priceChange)}`}>
                  {isUp ? '▲' : '▼'} {formatChange(priceChange)}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">24hニュース</div>
                <div className="font-mono font-bold text-lg text-brand-accent">{coin.trend_24h}件</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">時価総額</div>
                <div className="font-mono text-text-primary">{shortNumber(coin.price.market_cap_jpy)}円</div>
              </div>
            </div>
          )}
        </div>

        {/* 一言コメント */}
        {coin.one_liner && (
          <div className="mt-4 p-3 bg-brand-accent/5 border border-brand-accent/20 rounded-xl text-sm text-text-secondary">
            💡 {coin.one_liner}
          </div>
        )}
      </div>

      {/* ========== メインコンテンツ ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* 左: チャート + 話題のテーマ */}
        <div className="lg:col-span-2 space-y-4">
          {/* 7日間ニュース推移チャート */}
          <TrendChart
            data={chartData}
            series={[{ key: 'news', name: 'ニュース件数', color: '#5AC8FA' }]}
            title="7日間ニュース話題量推移"
            height={180}
          />

          {/* 話題のテーマタグ */}
          {coin.hot_categories.length > 0 && (
            <div className="bg-bg-card rounded-card border border-white/5 p-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">🏷️ 話題のテーマ</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(catDist)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => (
                    <span
                      key={cat}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${NewsCategoryColor[cat as NewsCategory]}`}
                    >
                      {NewsCategoryLabel[cat as NewsCategory]}
                      <span className="ml-1.5 opacity-70 text-xs">{count}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 右: サイドバー情報 */}
        <div className="space-y-4">
          {/* 急上昇スコア */}
          <div className="bg-bg-card rounded-card border border-white/5 p-4">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">📊 話題量スコア</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">急上昇スコア</span>
                  <span className={`font-mono font-bold ${surgeBadgeColor(coin.surge_score)} px-1.5 py-0.5 rounded`}>
                    {coin.surge_score.toFixed(2)}x
                  </span>
                </div>
                <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-warning"
                    style={{ width: `${Math.min(100, coin.surge_score * 20)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-text-muted">24hニュース数</div>
                  <div className="font-mono font-bold text-text-primary">{coin.trend_24h}件</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">7日間合計</div>
                  <div className="font-mono font-bold text-text-primary">
                    {coin.trend_7d.reduce((a, b) => a + b, 0)}件
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 広告スロット */}
          <AdSlot size="rectangle" />

          {/* 類似通貨 */}
          {similarCoins.length > 0 && (
            <div className="bg-bg-card rounded-card border border-white/5 p-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">🔗 関連通貨</h3>
              <div className="space-y-2">
                {similarCoins.map(sc => (
                  <Link key={sc.id} href={`/coins/${sc.slug}`} className="flex items-center gap-2 hover:bg-bg-elevated p-2 rounded-lg transition-colors">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-bg-elevated flex-shrink-0">
                        <CoinImage src={sc.logo_url} alt={sc.symbol} fill className="object-contain p-0.5" />
                    </div>
                    <span className="text-sm text-text-secondary">{sc.name_ja}</span>
                    <span className={`ml-auto text-xs font-mono ${changeColor(sc.price?.change_24h ?? 0)}`}>
                      {formatChange(sc.price?.change_24h ?? 0)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== 関連ニュース一覧 ========== */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          📰 関連ニュース
          <span className="ml-2 text-sm font-normal text-text-muted">（{relatedNews.length}件）</span>
        </h2>

        {relatedNews.length > 0 ? (
          <div className="space-y-3">
            {relatedNews.slice(0, 20).map(n => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        ) : (
          <div className="bg-bg-card rounded-card border border-white/5 p-12 text-center">
            <p className="text-text-muted">関連ニュースはまだありません。</p>
          </div>
        )}
      </section>

      {/* 広告 */}
      <AdSlot size="leaderboard" className="mt-8" />
    </div>
  );
}
