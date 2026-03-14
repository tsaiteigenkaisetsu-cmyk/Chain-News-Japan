import type { Metadata } from 'next';
import { loadNews } from '@/lib/data';
import NewsCard from '@/components/NewsCard';
import { NewsCategoryLabel } from '@/types';
import type { NewsCategory } from '@/types';
import AdSlot from '@/components/AdSlot';
import AffiliateTextCta from '@/components/AffiliateTextCta';

export const metadata: Metadata = {
  title: 'ニュース一覧 | 暗号資産の最新ニュース',
  description: '国内外の暗号資産ニュースを通貨別・カテゴリ別・時間別にフィルタして閲覧できます。',
};

export const revalidate = 600;

const CATEGORIES = Object.keys(NewsCategoryLabel) as NewsCategory[];

interface Props {
  searchParams: { cat?: string; sort?: string };
}

export default async function NewsPage({ searchParams }: Props) {
  const news = await loadNews();

  const selectedCat = (searchParams.cat ?? 'all') as NewsCategory | 'all';
  const sortOrder = searchParams.sort ?? 'new';

  // フィルタ
  let filtered = selectedCat === 'all'
    ? news
    : news.filter(n => n.category === selectedCat);

  // ソート
  filtered = [...filtered].sort((a, b) => {
    if (sortOrder === 'importance') return b.importance_score - a.importance_score;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">📰 ニュース一覧</h1>
        <p className="text-text-secondary text-sm">
          全{news.length}件 · 10分ごとに自動更新
        </p>
      </div>

      {/* フィルターバー */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-white/5">
        {/* カテゴリフィルター */}
        <a
          href="/news"
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCat === 'all'
              ? 'bg-brand-accent text-white'
              : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
          }`}
        >
          すべて
        </a>
        {CATEGORIES.map(cat => (
          <a
            key={cat}
            href={`/news?cat=${cat}${sortOrder !== 'new' ? `&sort=${sortOrder}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCat === cat
                ? 'bg-brand-accent text-white'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
            }`}
          >
            {NewsCategoryLabel[cat]}
          </a>
        ))}

        {/* ソート */}
        <div className="ml-auto flex gap-2">
          <a
            href={`/news${selectedCat !== 'all' ? `?cat=${selectedCat}&sort=new` : '?sort=new'}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              sortOrder === 'new'
                ? 'bg-bg-elevated text-brand-accent'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
            }`}
          >
            新着順
          </a>
          <a
            href={`/news${selectedCat !== 'all' ? `?cat=${selectedCat}&sort=importance` : '?sort=importance'}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              sortOrder === 'importance'
                ? 'bg-bg-elevated text-brand-accent'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
            }`}
          >
            重要度順
          </a>
        </div>
      </div>

      <AffiliateTextCta className="mb-6" compact />

      {/* ニュースグリッド */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((newsItem, idx) => (
            <div key={newsItem.id}>
              <NewsCard news={newsItem} />
              {/* 6件ごとに広告を挿入 */}
              {(idx + 1) % 6 === 0 && (
                <AdSlot size="leaderboard" className="my-4" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-bg-card rounded-card border border-white/5 p-16 text-center">
          <p className="text-text-muted">
            {selectedCat === 'all'
              ? 'ニュースを取得中です...'
              : `「${NewsCategoryLabel[selectedCat as NewsCategory]}」カテゴリのニュースはありません。`}
          </p>
          <p className="text-xs text-text-muted mt-2">GitHub Actions で自動取得するとニュースが表示されます</p>
        </div>
      )}
    </div>
  );
}
