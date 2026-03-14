import type { Metadata } from 'next';
import { Noto_Sans_JP, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const noto = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chain-news-japan.vercel.app'),
  title: {
    default: 'Chain News Japan | 暗号資産の話題量で市場の温度を読む',
    template: '%s | Chain News Japan',
  },
  description:
    '暗号資産に関する国内外ニュースを収集し、どの通貨が今どれだけ話題になっているかを日本語で可視化。急上昇通貨ランキング、話題量ヒートマップ、価格×話題量マトリクスを提供。',
  keywords: [
    '仮想通貨', '暗号資産', 'ニュース', 'ビットコイン', 'イーサリアム', 'ソラナ',
    '話題量', 'ランキング', '急上昇', '注目銘柄',
  ],
  openGraph: {
    title: 'Chain News Japan',
    description: '暗号資産の"話題量"で市場の温度を読む',
    locale: 'ja_JP',
    type: 'website',
    siteName: 'Chain News Japan',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chain News Japan',
    description: '暗号資産の"話題量"で市場の温度を読む',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${noto.variable} ${inter.variable}`}>
      <body className="bg-bg-primary text-text-primary font-sans antialiased min-h-screen">
        <GoogleAnalytics />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
