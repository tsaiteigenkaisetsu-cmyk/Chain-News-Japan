import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg-card border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ブランド */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-accent to-brand-up flex items-center justify-center shadow-glow_accent">
                <span className="text-xs font-bold text-white">CN</span>
              </div>
              <span className="font-bold text-text-primary">
                Chain<span className="text-brand-accent">News</span> Japan
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              暗号資産の&quot;話題量&quot;で市場の温度を読む。<br/>
              ニュース量の変化から注目通貨を発見。
            </p>
          </div>

          {/* リンク */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">コンテンツ</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              {[
                { href: '/',           label: 'トップ（今日のホット）' },
                { href: '/ranking',    label: '急上昇ランキング' },
                { href: '/news',       label: 'ニュース一覧' },
                { href: '/heatmap',    label: '話題量ヒートマップ' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-accent transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 注意事項 */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">法務情報</h3>
            <ul className="space-y-2 text-sm text-text-secondary mb-4">
              {[
                { href: '/privacy', label: 'プライバシーポリシー' },
                { href: '/disclaimer', label: '免責事項' },
                { href: '/terms', label: '利用規約' },
                { href: '/contact', label: 'お問い合わせ' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-accent transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-muted leading-relaxed">
              本サイトは投資助言を目的としません。情報の正確性を保証しません。
              最終的な投資判断はご自身の責任でお願いします。
              外部リンク先の内容について当サイトは一切責任を負いません。
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
          <span>© {new Date().getFullYear()} Chain News Japan. All rights reserved.</span>
          <span>データソース: CoinGecko / CoinDesk / CoinPost 他</span>
        </div>
      </div>
    </footer>
  );
}
