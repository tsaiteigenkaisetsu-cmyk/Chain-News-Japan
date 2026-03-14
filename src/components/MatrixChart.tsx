'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CoinSummary } from '@/types';
import { formatJPY, formatChange, changeColor, surgeBadgeColor } from '@/lib/format';
import { classifyMatrix } from '@/lib/scoring';

interface Props {
  coins: CoinSummary[];
}

export default function MatrixChart({ coins }: Props) {
  const data = coins
    .filter(c => c.price && c.trend_24h > 0)
    .map(c => ({
      coin: c,
      priceChange: c.price?.change_24h ?? 0,
      surgeScore: c.surge_score,
      matrix: classifyMatrix(c.price?.change_24h ?? 0, c.surge_score),
    }));

  const quadrants = [1, 2, 3, 4] as const;
  const quadrantConfig = {
    1: { label: '価格↑ × 話題↑', bg: 'bg-brand-up/5',      border: 'border-brand-up/20',      title: '連動上昇', icon: '🚀' },
    2: { label: '価格↑ × 話題→', bg: 'bg-brand-accent/5',   border: 'border-brand-accent/20',   title: '静かな上昇', icon: '📊' },
    3: { label: '価格↓ × 話題↑', bg: 'bg-brand-warning/5',  border: 'border-brand-warning/20',  title: '要注目！', icon: '👀' },
    4: { label: '価格↓ × 話題↓', bg: 'bg-brand-down/5',     border: 'border-brand-down/20',     title: '低調', icon: '📉' },
  };

  return (
    <div className="bg-bg-card rounded-card border border-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary">価格 × 話題量 マトリクス</h3>
        <span className="text-xs text-text-muted">直近24h基準</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quadrants.map(q => {
          const cfg = quadrantConfig[q];
          const items = data.filter(d => d.matrix.quadrant === q);

          return (
            <div
              key={q}
              className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border}`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">{cfg.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-text-primary">{cfg.title}</div>
                  <div className="text-xs text-text-muted">{cfg.label}</div>
                </div>
                <span className="ml-auto text-xs text-text-muted">{items.length}銘柄</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {items.slice(0, 6).map(({ coin }) => (
                  <Link key={coin.id} href={`/coins/${coin.slug}`}>
                    <div className="flex items-center gap-1 bg-bg-elevated/50 rounded-lg px-2 py-1 hover:bg-bg-elevated transition-colors">
                      <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={coin.logo_url}
                          alt={coin.symbol}
                          fill
                          className="object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-primary">{coin.symbol}</span>
                    </div>
                  </Link>
                ))}
                {items.length > 6 && (
                  <span className="text-xs text-text-muted px-1 py-1">+{items.length - 6}</span>
                )}
                {items.length === 0 && (
                  <span className="text-xs text-text-muted">該当なし</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
