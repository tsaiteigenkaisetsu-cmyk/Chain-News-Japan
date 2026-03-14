import type { Metadata } from 'next';
import { loadCoinSummaries, loadNews, loadRankings, loadStats } from '@/lib/data';
import { loadSocialData } from '@/lib/social';
import CoinCard from '@/components/CoinCard';
import NewsCard from '@/components/NewsCard';
import RankingTable from '@/components/RankingTable';
import HeatMap from '@/components/HeatMap';
import MatrixChart from '@/components/MatrixChart';
import SocialBuzzPanel from '@/components/SocialBuzzPanel';
import TrendWords from '@/components/TrendWords';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'ホーム | いま市場で話題になっている通貨がわかる',
};

export const revalidate = 600; // 10分ごとに再生成

export default async function HomePage() {
  const [coins, news, rankings, stats, social] = await Promise.all([
    loadCoinSummaries(),
    loadNews(),
    loadRankings(),
    loadStats(),
    loadSocialData(),
  ]);

  // 注目通貨（急上昇スコア上位3件）
  const hotCoins = [...coins]
    .filter(c => c.trend_24h >= 3)
    .sort((a, b) => b.surge_score - a.surge_score)
    .slice(0, 3);

  // 最新ニュース（直近24件）
  const latestNews = [...news]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 12);

  // 重要ニュース（importance_score >= 0.7）
  const importantNews = [...news]
    .filter(n => n.importance_score >= 0.7)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ========== ヒーローセクション ========== */}
      <section className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
          いま市場で
          <span className="gradient-text">「話題になっている通貨」</span>
          がわかる
        </h1>
        <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto">
          国内外のニュースを自動収集し、どの通貨が今どれだけ注目されているかをリアルタイムで可視化
        </p>

        {/* 統計バッジ */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="bg-bg-card rounded-full px-4 py-2 border border-white/5 text-sm">
            <span className="text-text-muted">総収集件数</span>
            <span className="ml-2 font-mono font-bold text-brand-accent">{stats.total_news.toLocaleString()}</span>
            <span className="ml-1 text-text-muted">件</span>
          </div>
          <div className="bg-bg-card rounded-full px-4 py-2 border border-white/5 text-sm">
            <span className="text-text-muted">直近24時間</span>
            <span className="ml-2 font-mono font-bold text-brand-warning">{stats.news_24h.toLocaleString()}</span>
            <span className="ml-1 text-text-muted">件</span>
          </div>
          <div className="bg-bg-card rounded-full px-4 py-2 border border-white/5 text-sm">
            <span className="text-text-muted">追跡ソース数</span>
            <span className="ml-2 font-mono font-bold text-brand-up">{stats.source_count}</span>
            <span className="ml-1 text-text-muted">媒体</span>
          </div>
          <div className="bg-bg-card rounded-full px-4 py-2 border border-white/5 text-sm">
            <span className="text-text-muted">更新頻度</span>
            <span className="ml-2 font-bold text-text-primary">10分ごと</span>
          </div>
        </div>
      </section>

      {/* ========== 今日の注目通貨 ========== */}
      {hotCoins.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            🔥 <span>本日の注目通貨</span>
            <span className="text-xs font-normal text-text-muted ml-1">急上昇スコア順</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {hotCoins.map(coin => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </section>
      )}

      {/* ========== 広告 (ヒーロー下) ========== */}
      <AdSlot size="leaderboard" className="mb-10" />

      {/* ========== SNS話題量ランキング + Hypeスコア ========== */}
      {social && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            📡 <span>SNS話題量ランキング</span>
            <span className="text-xs font-normal text-text-muted ml-1">Reddit r/CryptoCurrency 24h集計</span>
          </h2>
          <SocialBuzzPanel social={social} />
        </section>
      )}

      {/* ========== ニューストレンドワード ========== */}
      {social && social.trend_words.length > 0 && (
        <section className="mb-10">
          <TrendWords words={social.trend_words} />
        </section>
      )}

      {/* ========== メイングリッド ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* 左2列: マトリクス + ヒートマップ */}
        <div className="lg:col-span-2 space-y-6">
          <MatrixChart coins={coins} />
          <HeatMap coins={coins.filter(c => c.trend_24h > 0 || c.price !== null)} />
        </div>

        {/* 右1列: 急上昇ランキング */}
        <div>
          <RankingTable
            entries={rankings.surge_24h}
            title="⚡ 急上昇ランキング (24h)"
            showSurge={true}
          />
        </div>
      </div>

      {/* ========== 全通貨グリッド ========== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">📊 全通貨一覧</h2>
          <a href="/ranking" className="text-sm text-brand-accent hover:underline">ランキングで見る →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coins
            .sort((a, b) => b.surge_score - a.surge_score)
            .slice(0, 12)
            .map(coin => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
        </div>
      </section>

      {/* ========== ニュースセクション ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* 重要ニュース */}
        <section>
          <h2 className="text-lg font-bold text-text-primary mb-4">⭐ 重要ニュース</h2>
          <div className="space-y-3">
            {importantNews.length > 0 ? importantNews.map(n => (
              <NewsCard key={n.id} news={n} compact />
            )) : (
              <div className="bg-bg-card rounded-card border border-white/5 p-6 text-text-muted text-sm text-center">
                ニュースを取得中です...
              </div>
            )}
          </div>
        </section>

        {/* 最新ニュース */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">📰 最新ニュース</h2>
            <a href="/news" className="text-sm text-brand-accent hover:underline">すべて見る →</a>
          </div>
          <div className="space-y-3">
            {latestNews.slice(0, 6).map(n => (
              <NewsCard key={n.id} news={n} compact />
            ))}
          </div>
        </section>
      </div>

      {/* ========== 広告 (一覧下部) ========== */}
      <AdSlot size="leaderboard" className="mb-10" />

      {/* ========== 注意書き ========== */}
      <p className="text-xs text-text-muted text-center mt-8 border-t border-white/5 pt-6">
        ⚠️ 本サイトの情報は投資助言ではありません。暗号資産への投資にはリスクが伴います。投資判断はご自身の責任で行ってください。
      </p>
    </div>
  );
}
