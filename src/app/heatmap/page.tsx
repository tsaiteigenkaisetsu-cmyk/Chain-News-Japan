import type { Metadata } from 'next';
import { loadCoinSummaries } from '@/lib/data';
import HeatMap from '@/components/HeatMap';
import MatrixChart from '@/components/MatrixChart';
import AdSlot from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'ヒートマップ | 話題量・価格マトリクス一覧',
  description: '全通貨の話題量を色で視覚化したヒートマップと、価格×話題量の4象限マトリクスを表示。',
};

export const revalidate = 900;

export default async function HeatmapPage() {
  const coins = await loadCoinSummaries();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">🌡️ 話題量ヒートマップ</h1>
        <p className="text-text-secondary text-sm">色の濃さが急上昇スコアを表します。直感的に注目通貨を把握できます。</p>
      </div>

      <div className="space-y-6">
        <HeatMap coins={coins} />
        <MatrixChart coins={coins} />
      </div>

      <AdSlot size="leaderboard" className="mt-8" />
    </div>
  );
}
