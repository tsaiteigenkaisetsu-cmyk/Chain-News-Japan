'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CoinSummary } from '@/types';
import { changeColor, formatChange } from '@/lib/format';

interface Props {
  coins: CoinSummary[];
}

const MAX_NEWS = 20; // ヒートマップの最大ニュース数（正規化用）

export default function HeatMap({ coins }: Props) {
  const maxSurge = Math.max(...coins.map(c => c.surge_score), 1);

  return (
    <div className="bg-bg-card rounded-card border border-white/5 p-4">
      <h3 className="text-sm font-semibold text-text-secondary mb-4">
        話題量ヒートマップ
        <span className="ml-2 text-xs text-text-muted font-normal">色の濃さ = 急上昇スコア</span>
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {coins.map(coin => {
          const intensity = coin.surge_score / maxSurge;
          const priceChange = coin.price?.change_24h ?? 0;
          const isUp = priceChange >= 0;

          // 色は急上昇度合いで決定
          const bgOpacity = Math.max(0.05, intensity * 0.6);
          const baseColor = coin.surge_score >= 3 ? '25, 195, 125' : coin.surge_score >= 1.5 ? '245, 185, 66' : '90, 200, 250';

          return (
            <Link key={coin.id} href={`/coins/${coin.slug}`}>
              <div
                className="rounded-xl p-2 border transition-all duration-200 hover:scale-105 cursor-pointer text-center"
                style={{
                  backgroundColor: `rgba(${baseColor}, ${bgOpacity})`,
                  borderColor: `rgba(${baseColor}, ${Math.min(intensity * 0.8, 0.5)})`,
                }}
              >
                <div className="relative w-7 h-7 mx-auto mb-1 rounded-full overflow-hidden bg-bg-elevated">
                  <Image
                    src={coin.logo_url}
                    alt={coin.symbol}
                    fill
                    className="object-contain p-0.5"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="text-xs font-mono font-bold text-text-primary">{coin.symbol}</div>
                <div className={`text-xs font-mono ${changeColor(priceChange)}`}>
                  {isUp ? '▲' : '▼'}{Math.abs(priceChange).toFixed(1)}%
                </div>
                <div className="text-xs text-text-muted mt-0.5">{coin.trend_24h}件</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-up/60" />
          <span>急上昇（3x以上）</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-warning/60" />
          <span>やや注目（1.5x〜）</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-accent/30" />
          <span>通常</span>
        </div>
      </div>
    </div>
  );
}
