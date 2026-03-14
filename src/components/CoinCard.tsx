'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CoinSummary } from '@/types';
import { formatJPY, formatChange, changeColor, surgeBadgeColor } from '@/lib/format';
import { NewsCategoryLabel, NewsCategoryColor } from '@/types';
import MiniChart from './MiniChart';

interface Props {
  coin: CoinSummary;
}

export default function CoinCard({ coin }: Props) {
  const priceChange = coin.price?.change_24h ?? 0;
  const isUp = priceChange >= 0;

  return (
    <Link href={`/coins/${coin.slug}`}>
      <div className="group bg-bg-card rounded-card border border-white/5 p-4 hover:border-brand-accent/30 hover:shadow-card_hover transition-all duration-300 cursor-pointer">
        {/* ヘッダー行 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-bg-elevated flex-shrink-0">
              <Image
                src={coin.logo_url}
                alt={coin.symbol}
                fill
                className="object-contain p-0.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="font-mono font-bold text-text-primary text-sm">{coin.symbol}</div>
              <div className="text-xs text-text-secondary">{coin.name_ja}</div>
            </div>
          </div>

          {/* 急上昇バッジ */}
          {coin.surge_score >= 2.0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${surgeBadgeColor(coin.surge_score)}`}>
              {coin.surge_score >= 5.0 ? '🔥' : coin.surge_score >= 3.0 ? '⚡' : '📈'}
              {coin.surge_score.toFixed(1)}x
            </span>
          )}
        </div>

        {/* 価格行 */}
        {coin.price && (
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-mono text-lg font-bold text-text-primary">
              {formatJPY(coin.price.price_jpy)}
            </span>
            <span className={`font-mono text-sm font-semibold ${changeColor(priceChange)}`}>
              {isUp ? '▲' : '▼'} {formatChange(priceChange)}
            </span>
          </div>
        )}

        {/* 話題量バー */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>話題量 (24h)</span>
            <span className="text-text-secondary font-medium">{coin.trend_24h}件</span>
          </div>
          <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-warning transition-all duration-500"
              style={{ width: `${Math.min(100, coin.trend_24h * 5)}%` }}
            />
          </div>
        </div>

        {/* ミニチャート */}
        <div className="mb-3">
          <MiniChart data={coin.trend_7d} color={isUp ? '#19C37D' : '#FF5D73'} />
        </div>

        {/* カテゴリタグ */}
        {coin.hot_categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {coin.hot_categories.slice(0, 2).map(cat => (
              <span
                key={cat}
                className={`text-xs px-1.5 py-0.5 rounded text-nowrap ${NewsCategoryColor[cat]}`}
              >
                {NewsCategoryLabel[cat]}
              </span>
            ))}
          </div>
        )}

        {/* 一言コメント */}
        {coin.one_liner && (
          <p className="text-xs text-text-muted leading-relaxed border-t border-white/5 pt-2 mt-2">
            {coin.one_liner}
          </p>
        )}
      </div>
    </Link>
  );
}
