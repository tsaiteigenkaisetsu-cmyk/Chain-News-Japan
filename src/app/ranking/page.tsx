import type { Metadata } from 'next';
import { loadRankings, loadCoinSummaries } from '@/lib/data';
import RankingTable from '@/components/RankingTable';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'ランキング | 急上昇・価格変動・ニュース増加率',
  description: '24時間で話題量が急上昇した通貨ランキング、価格急騰・急落ランキング、ニュース増加率ランキングを一覧表示。',
};

export const revalidate = 900;

export default async function RankingPage() {
  const [rankings, coins] = await Promise.all([loadRankings(), loadCoinSummaries()]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">🏆 ランキング</h1>
        <p className="text-text-secondary text-sm">直近24h・7日間のデータに基づくランキング</p>
      </div>

      <AdSlot size="leaderboard" className="mb-8" />

      {/* ランキンググリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* 急上昇 */}
        <RankingTable
          entries={rankings.surge_24h}
          title="⚡ 24h急上昇ランキング"
          scoreLabel="急上昇倍率"
          showSurge={true}
        />

        {/* 価格急騰 */}
        <RankingTable
          entries={rankings.price_up}
          title="🚀 価格急騰ランキング (24h)"
          scoreLabel="価格変動率"
          showSurge={false}
        />

        {/* 価格急落 */}
        <RankingTable
          entries={rankings.price_down}
          title="📉 価格急落ランキング (24h)"
          scoreLabel="価格変動率"
          showSurge={false}
        />

        {/* 7日ニュース増加 */}
        <RankingTable
          entries={rankings.growth_7d}
          title="📰 ニュース増加率ランキング"
          scoreLabel="ニュース件数"
          showSurge={true}
        />
      </div>

      {/* 注目指標の説明 */}
      <div className="bg-bg-card rounded-card border border-white/5 p-6 mb-8">
        <h2 className="font-semibold text-text-primary mb-4">📖 指標の見方</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-brand-warning mt-0.5">⚡</span>
              <div>
                <div className="font-medium text-text-primary">急上昇スコア（倍率）</div>
                <div>直近24hのニュース件数 ÷ 過去7日平均。2倍以上で「やや注目」、3倍以上で「急上昇」、5倍以上で「爆発的注目」</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-up mt-0.5">📈</span>
              <div>
                <div className="font-medium text-text-primary">価格変動率</div>
                <div>過去24時間の価格変動率（円建て）</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-brand-accent mt-0.5">📰</span>
              <div>
                <div className="font-medium text-text-primary">24hニュース件数</div>
                <div>過去24時間にその通貨に関するニュースが何件収集されたか</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-warning mt-0.5">💡</span>
              <div>
                <div className="font-medium text-text-primary">注目のパターン</div>
                <div>価格↓なのにニュース↑の通貨は「まだ価格に反映されていない可能性あり」として注目</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdSlot size="leaderboard" />

      <p className="text-xs text-text-muted text-center mt-8">
        ⚠️ 本ランキングは投資助言ではありません。暗号資産への投資はリスクを伴います。
      </p>
    </div>
  );
}
