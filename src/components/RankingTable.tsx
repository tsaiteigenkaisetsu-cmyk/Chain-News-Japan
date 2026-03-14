'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { RankingEntry } from '@/types';
import { formatChange, changeColor, surgeBadgeColor } from '@/lib/format';

interface Props {
  entries: RankingEntry[];
  title: string;
  scoreLabel?: string;
  showSurge?: boolean;
}

export default function RankingTable({ entries, title, scoreLabel = 'スコア', showSurge = true }: Props) {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-bg-card rounded-card border border-white/5 p-6">
        <h2 className="font-semibold text-text-primary mb-4">{title}</h2>
        <p className="text-text-muted text-sm">データを取得中...</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-card border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h2 className="font-semibold text-text-primary">{title}</h2>
      </div>

      <div className="divide-y divide-white/5">
        {entries.map((entry) => (
          <Link
            key={entry.coin.id}
            href={`/coins/${entry.coin.slug}`}
            className="flex items-center gap-3 p-3 hover:bg-bg-elevated transition-colors group"
          >
            {/* 順位 */}
            <span className={`
              w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
              ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                'bg-bg-elevated text-text-muted'}
            `}>
              {entry.rank}
            </span>

            {/* コインアイコン */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-bg-elevated flex-shrink-0">
              <Image
                src={entry.coin.logo_url}
                alt={entry.coin.symbol}
                fill
                className="object-contain p-0.5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            {/* コイン名 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm text-text-primary">{entry.coin.symbol}</span>
                <span className="text-xs text-text-muted truncate">{entry.coin.name_ja}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-muted">24h: <span className="text-text-secondary">{entry.news_count_24h}件</span></span>
              </div>
            </div>

            {/* スコア */}
            <div className="text-right flex-shrink-0">
              {showSurge ? (
                <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-full ${surgeBadgeColor(entry.score)}`}>
                  {entry.score.toFixed(1)}x
                </span>
              ) : (
                <span className={`text-sm font-mono font-bold ${changeColor(entry.price_change_24h)}`}>
                  {formatChange(entry.price_change_24h)}
                </span>
              )}
              <div className={`text-xs mt-0.5 ${changeColor(entry.price_change_24h)}`}>
                {entry.label}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
