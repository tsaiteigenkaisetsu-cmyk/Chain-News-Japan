'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { SocialSnapshot } from '@/types';
import { COIN_MASTER } from '@/lib/coins';

interface Props {
  social: SocialSnapshot;
}

function formatEngagement(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1_000)  return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function getRedditMetricValue(item: SocialSnapshot['coins'][number]): number {
  return item.reddit_engagement_24h > 0 ? item.reddit_engagement_24h : item.reddit_posts_24h;
}

export default function SocialBuzzPanel({ social }: Props) {
  const coinMap = new Map(COIN_MASTER.map(c => [c.id, c]));
  const isRedditFallback = (social.stats.reddit_json_success ?? 0) === 0 && (social.stats.reddit_rss_success ?? 0) > 0;
  const hasCachedReddit = (social.stats.reddit_reused_previous ?? 0) > 0;
  const getRedditMetric = (item: SocialSnapshot['coins'][number]) => {
    return getRedditMetricValue(item);
  };
  const formatRedditMetric = (item: SocialSnapshot['coins'][number]) => {
    if (item.reddit_engagement_24h > 0) {
      return formatEngagement(item.reddit_engagement_24h);
    }
    return `${item.reddit_posts_24h}件`;
  };

  // 複合スコア = Reddit エンゲージメント + ニュース数×50 でソート
  const buzzRanking = [...social.coins]
    .filter(c => getRedditMetric(c) > 0 || c.news_count_24h > 0)
    .sort((a, b) => {
      const sa = getRedditMetric(a) + a.news_count_24h * 50;
      const sb = getRedditMetric(b) + b.news_count_24h * 50;
      return sb - sa;
    })
    .slice(0, 8);

  // Hype Score TOP5（Reddit 過熱気味な銘柄）
  const hypeTop = [...social.coins]
    .filter(c => c.hype_score > 0 && getRedditMetricValue(c) > 0)
    .sort((a, b) => b.hype_score - a.hype_score)
    .slice(0, 5);

  const maxEngagement = Math.max(...buzzRanking.map(c => getRedditMetric(c)), 1);
  const maxNews       = Math.max(...buzzRanking.map(c => c.news_count_24h), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* ===== SNS話題量ランキング (左2列) ===== */}
      <div className="lg:col-span-2 bg-bg-card rounded-card border border-white/5 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-secondary">
            📡 SNS話題量ランキング
          </h3>
          <span className="text-xs text-text-muted">
            {isRedditFallback ? 'Reddit 投稿件数フォールバック · 24h' : 'Reddit 反応量 · 24h'}
          </span>
        </div>

        <div className="space-y-1.5">
          {buzzRanking.map((item, idx) => {
            const coin = coinMap.get(item.coin_id);
            if (!coin) return null;
            const redditMetric = getRedditMetric(item);
            const ePct = (redditMetric / maxEngagement) * 100;
            const nPct = (item.news_count_24h / maxNews) * 100;

            return (
              <Link key={item.coin_id} href={`/coins/${coin.slug}`}>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-elevated transition-colors">
                  {/* 順位 */}
                  <span className={`text-xs font-bold w-5 flex-shrink-0 ${
                    idx === 0 ? 'text-yellow-400' :
                    idx === 1 ? 'text-gray-300'   :
                    idx === 2 ? 'text-orange-400'  : 'text-text-muted'
                  }`}>
                    {idx + 1}
                  </span>

                  {/* ロゴ */}
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-bg-elevated flex-shrink-0">
                    <Image
                      src={coin.logo_url}
                      alt={coin.symbol}
                      fill
                      className="object-contain p-0.5"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>

                  {/* 銘柄名 */}
                  <div className="flex-shrink-0 w-16">
                    <div className="text-sm font-mono font-bold text-text-primary">{coin.symbol}</div>
                    <div className="text-xs text-text-muted truncate">{coin.name_en}</div>
                  </div>

                  {/* 二重バー: Reddit & ニュース */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-14 text-xs text-text-muted text-right flex-shrink-0 hidden sm:block">Reddit</span>
                      <div className="flex-1 bg-bg-elevated rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-brand-accent rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(ePct, ePct > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-brand-accent w-12 text-right flex-shrink-0">
                        {formatRedditMetric(item)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 text-xs text-text-muted text-right flex-shrink-0 hidden sm:block">ニュース</span>
                      <div className="flex-1 bg-bg-elevated rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-brand-warning rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(nPct, nPct > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-brand-warning w-12 text-right flex-shrink-0">
                        {item.news_count_24h}件
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!social.reddit_enabled && (
          <p className="text-xs text-text-muted mt-3 pt-3 border-t border-white/5">
            ※ Reddit データ取得準備中。現在はニュース件数のみ表示しています。
          </p>
        )}

        {social.reddit_enabled && isRedditFallback && (
          <p className="text-xs text-text-muted mt-3 pt-3 border-t border-white/5">
            ※ Reddit の反応量取得が不安定なため、現在は投稿件数ベースで補完しています。
          </p>
        )}

        {social.reddit_enabled && !isRedditFallback && hasCachedReddit && (
          <p className="text-xs text-text-muted mt-3 pt-3 border-t border-white/5">
            ※ 一部の銘柄は直近の取得成功値を補完表示しています。
          </p>
        )}

        {/* 凡例 */}
        <div className="flex items-center gap-4 mt-3 text-xs text-text-muted border-t border-white/5 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
            <span>{isRedditFallback ? 'Reddit 投稿件数' : 'Reddit エンゲージメント'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-warning" />
            <span>ニュース件数</span>
          </div>
        </div>
      </div>

      {/* ===== Hypeスコア TOP5 (右1列) ===== */}
      <div className="bg-bg-card rounded-card border border-white/5 p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text-secondary">🔥 Hypeスコア TOP5</h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            SNS過熱度 = Reddit ÷ ニュース数<br />
            高いほど話題先行・SNS過熱気味
          </p>
        </div>

        <div className="space-y-3">
          {hypeTop.length > 0 ? hypeTop.map((item, idx) => {
            const coin = coinMap.get(item.coin_id);
            if (!coin) return null;
            const level =
              item.hype_score >= 500 ? { label: '過熱', color: 'text-brand-down',    dot: 'bg-brand-down'    } :
              item.hype_score >= 200 ? { label: 'やや高', color: 'text-brand-warning', dot: 'bg-brand-warning' } :
                                       { label: '普通',   color: 'text-text-secondary', dot: 'bg-text-muted'    };

            return (
              <Link key={item.coin_id} href={`/coins/${coin.slug}`}>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-elevated transition-colors">
                  <span className="text-xs text-text-muted w-4 flex-shrink-0 font-mono">{idx + 1}</span>
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-bg-elevated flex-shrink-0">
                    <Image
                      src={coin.logo_url}
                      alt={coin.symbol}
                      fill
                      className="object-contain p-0.5"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono font-bold text-text-primary">{coin.symbol}</div>
                    <div className="text-xs text-text-muted truncate">
                      {item.reddit_engagement_24h > 0
                        ? `Reddit ${formatEngagement(item.reddit_engagement_24h)} / ニュース${item.news_count_24h}件`
                        : `Reddit ${item.reddit_posts_24h}件 / ニュース${item.news_count_24h}件`}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold font-mono leading-none ${level.color}`}>
                      {item.hype_score.toLocaleString()}
                    </div>
                    <div className={`text-xs mt-0.5 flex items-center justify-end gap-1 ${level.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${level.dot}`} />
                      {level.label}
                    </div>
                  </div>
                </div>
              </Link>
            );
          }) : (
            <p className="text-sm text-text-muted text-center py-6">
              データ収集中…
            </p>
          )}
        </div>

        {/* Hype スコア説明 */}
        <div className="mt-4 border-t border-white/5 pt-3 space-y-1.5 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-down flex-shrink-0" />
            <span>500+ : SNS が過熱（話題先行）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-warning flex-shrink-0" />
            <span>200〜499 : やや高め</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-text-muted flex-shrink-0" />
            <span>〜199 : 通常水準</span>
          </div>
        </div>
      </div>
    </div>
  );
}
