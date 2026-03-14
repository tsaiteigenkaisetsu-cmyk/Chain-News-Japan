import type { ReactNode } from 'react';

type LegalPageLayoutProps = {
  title: string;
  lead: string;
  revisedAt?: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  title,
  lead,
  revisedAt = '2026年3月14日',
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8 sm:mb-10">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-bg-card px-3 py-1 text-xs text-text-muted">
          最終更新日: {revisedAt}
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-text-primary">{title}</h1>
        <p className="mt-4 text-sm sm:text-base leading-7 text-text-secondary">{lead}</p>
      </header>

      <div className="space-y-6 [&_section]:rounded-2xl [&_section]:border [&_section]:border-white/5 [&_section]:bg-bg-card [&_section]:p-5 sm:[&_section]:p-7 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mb-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-text-secondary [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:text-sm [&_li]:leading-7 [&_li]:text-text-secondary">
        {children}
      </div>
    </div>
  );
}