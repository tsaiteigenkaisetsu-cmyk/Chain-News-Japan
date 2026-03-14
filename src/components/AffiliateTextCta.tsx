interface Props {
  className?: string;
  compact?: boolean;
}

export default function AffiliateTextCta({ className = '', compact = false }: Props) {
  const url = process.env.NEXT_PUBLIC_AFFILIATE_TEXT_URL;

  if (!url) {
    return null;
  }

  const title = process.env.NEXT_PUBLIC_AFFILIATE_TEXT_TITLE ?? '口座開設・サービス比較はこちら';
  const description = process.env.NEXT_PUBLIC_AFFILIATE_TEXT_DESCRIPTION ??
    '運営費の一部をまかなう提携リンクです。掲載順や紹介内容は広告出稿の有無のみで決めていません。';
  const ctaLabel = process.env.NEXT_PUBLIC_AFFILIATE_TEXT_CTA ?? '公式ページを見る';
  const note = process.env.NEXT_PUBLIC_AFFILIATE_TEXT_NOTE ?? 'スポンサーリンク';

  return (
    <aside className={`rounded-card border border-brand-accent/20 bg-gradient-to-br from-brand-accent/10 via-bg-card to-bg-card p-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-accent/90">{note}</p>
          <h3 className={`mt-1 font-semibold text-text-primary ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
          <p className={`mt-1 text-text-secondary ${compact ? 'text-xs leading-5' : 'text-sm leading-6'}`}>{description}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-2 text-sm font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
        >
          {ctaLabel}
        </a>
      </div>
    </aside>
  );
}