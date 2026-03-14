'use client';

import Link from 'next/link';
import type { NewsItem } from '@/types';
import { NewsCategoryLabel, NewsCategoryColor } from '@/types';
import { timeAgo } from '@/lib/format';
import { COIN_MASTER } from '@/lib/coins';

interface Props {
  news: NewsItem;
  compact?: boolean;
}

export default function NewsCard({ news, compact = false }: Props) {
  const relatedCoins = COIN_MASTER.filter(c => news.coin_ids.includes(c.id)).slice(0, 3);
  const isJa = news.language === 'ja';

  return (
    <article className="bg-bg-card rounded-card border border-white/5 p-4 hover:border-brand-accent/20 transition-all duration-200 group">
      {/* ヘッダー行 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* カテゴリバッジ */}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NewsCategoryColor[news.category]}`}>
            {NewsCategoryLabel[news.category]}
          </span>
          {/* 重要度 */}
          {news.importance_score >= 0.7 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-warning/20 text-brand-warning border border-brand-warning/30">
              重要
            </span>
          )}
          {isJa && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-brand-up/10 text-brand-up">JP</span>
          )}
        </div>
        <time className="text-xs text-text-muted flex-shrink-0">{timeAgo(news.published_at)}</time>
      </div>

      {/* タイトル */}
      <a
        href={news.article_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-2 group-hover:text-brand-accent transition-colors"
      >
        <h3 className={`font-semibold text-text-primary leading-snug ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
          {news.title}
        </h3>
      </a>

      {/* 日本語要約 */}
      {news.summary_ja && !compact && (
        <p className="text-sm text-text-secondary leading-relaxed mb-3 line-clamp-2">
          {news.summary_ja}
        </p>
      )}

      {/* フッター */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        {/* 出典 */}
        <span className="text-xs text-text-muted">
          📰 {news.source_name}
        </span>

        {/* 関連コイン */}
        <div className="flex items-center gap-1">
          {relatedCoins.map(coin => (
            <Link
              key={coin.id}
              href={`/coins/${coin.slug}`}
              className="text-xs px-1.5 py-0.5 rounded bg-bg-elevated text-text-secondary hover:text-brand-accent transition-colors"
            >
              {coin.symbol}
            </Link>
          ))}
          <a
            href={news.article_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs text-brand-accent hover:underline"
          >
            元記事 →
          </a>
        </div>
      </div>
    </article>
  );
}
