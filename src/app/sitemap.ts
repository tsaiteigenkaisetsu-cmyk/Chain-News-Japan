import { MetadataRoute } from 'next';
import { COIN_MASTER } from '@/lib/coins';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chain-news-japan.vercel.app';

  const staticPages = [
    { url: baseUrl,              changeFrequency: 'hourly' as const,  priority: 1.0 },
    { url: `${baseUrl}/ranking`, changeFrequency: 'hourly' as const,  priority: 0.9 },
    { url: `${baseUrl}/news`,    changeFrequency: 'hourly' as const,  priority: 0.8 },
    { url: `${baseUrl}/heatmap`, changeFrequency: 'hourly' as const,  priority: 0.7 },
  ];

  const coinPages = COIN_MASTER.map(coin => ({
    url: `${baseUrl}/coins/${coin.slug}`,
    changeFrequency: 'hourly' as const,
    priority: 0.75,
  }));

  return [...staticPages, ...coinPages].map(p => ({
    ...p,
    lastModified: new Date(),
  }));
}
