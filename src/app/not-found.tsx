import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">ページが見つかりません</h1>
        <p className="text-text-secondary mb-6">お探しのページは存在しないか、移動した可能性があります。</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 hover:bg-brand-accent/20 transition-colors px-4 py-2 rounded-lg"
        >
          ← トップページへ戻る
        </Link>
      </div>
    </div>
  );
}
