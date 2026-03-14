'use client';

import type { TrendWord } from '@/types';

interface Props {
  words: TrendWord[];
  timeRange?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'ETF':          'bg-brand-accent/20 text-brand-accent border-brand-accent/30',
  '規制':         'bg-brand-warning/20 text-brand-warning border-brand-warning/30',
  'セキュリティ':  'bg-brand-down/20 text-brand-down border-brand-down/30',
  'エアドロップ':  'bg-brand-up/20 text-brand-up border-brand-up/30',
  'DeFi':         'bg-sky-500/20 text-sky-400 border-sky-500/30',
  'NFT':          'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Layer2':       'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'ステーキング':  'bg-teal-500/20 text-teal-400 border-teal-500/30',
  '半減期':       'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '相場':         'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '価格':         'bg-green-500/20 text-green-400 border-green-500/30',
  '上場/廃止':    'bg-brand-purple/20 text-brand-purple border-brand-purple/30',
  '提携':         'bg-violet-500/20 text-violet-400 border-violet-500/30',
  '機関投資家':   'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  '取引所':       'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const DEFAULT_COLOR = 'bg-bg-elevated/80 text-text-secondary border-white/10';

export default function TrendWords({ words, timeRange = '48h' }: Props) {
  if (!words || words.length === 0) return null;

  const maxCount = Math.max(...words.map(w => w.count), 1);

  return (
    <div className="bg-bg-card rounded-card border border-white/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary">
          🏷️ ニューストレンドワード
        </h3>
        <span className="text-xs text-text-muted">直近{timeRange}のニュース集計</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {words.map(w => {
          const color = w.category
            ? (CATEGORY_COLORS[w.category] ?? DEFAULT_COLOR)
            : DEFAULT_COLOR;

          // 件数に比例してフォントサイズを 0.72rem〜1.05rem に変化
          const scale = 0.72 + (w.count / maxCount) * 0.33;

          return (
            <span
              key={w.word}
              className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-full border
                font-medium transition-transform hover:scale-105 cursor-default select-none
                ${color}
              `}
              style={{ fontSize: `${scale}rem` }}
              title={`${w.count}件のニュースに登場`}
            >
              {w.word}
              {w.category && (
                <span className="opacity-50" style={{ fontSize: '0.62rem' }}>
                  #{w.category}
                </span>
              )}
              <span className="opacity-40 ml-0.5" style={{ fontSize: '0.62rem' }}>
                {w.count}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
