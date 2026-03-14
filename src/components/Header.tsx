import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-up flex items-center justify-center shadow-glow_accent">
              <span className="text-sm font-bold text-white">CN</span>
            </div>
            <span className="font-bold text-text-primary text-lg leading-none">
              Chain<span className="text-brand-accent">News</span>
              <span className="ml-1 text-xs text-text-secondary font-normal">Japan</span>
            </span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/',          label: 'ホーム' },
              { href: '/ranking',   label: 'ランキング' },
              { href: '/news',      label: 'ニュース' },
              { href: '/heatmap',   label: 'ヒートマップ' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* 更新ステータス */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-up animate-pulse-slow" />
            <span className="hidden sm:inline">リアルタイム更新中</span>
          </div>
        </div>
      </div>
    </header>
  );
}
