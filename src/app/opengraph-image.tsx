import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Chain News Japan — Crypto Market Attention Dashboard';
export const runtime = 'edge';

const TAGS = [
  { label: 'Trending Ranking', color: '#D4A24C', border: 'rgba(212,162,76,0.45)' },
  { label: 'Heat Map',         color: '#E3813A', border: 'rgba(227,129,58,0.45)' },
  { label: 'SNS Buzz Score',   color: '#3FA66B', border: 'rgba(63,166,107,0.45)'  },
  { label: 'Price x Matrix',   color: '#C6B7A3', border: 'rgba(198,183,163,0.35)' },
];

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#171411',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
        }}
      >
        {/* ロゴ行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #D4A24C, #3FA66B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#171411',
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            CN
          </div>
          <span style={{ color: '#C6B7A3', fontSize: 26, fontWeight: 600 }}>
            Chain News Japan
          </span>
        </div>

        {/* メインキャッチコピー */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              color: '#F6EFE5',
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.0,
              display: 'flex',
            }}
          >
            Crypto Market
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.0,
              display: 'flex',
              gap: 22,
            }}
          >
            <span style={{ color: '#D4A24C' }}>Attention</span>
            <span style={{ color: '#F6EFE5' }}>Dashboard</span>
          </div>
          <div
            style={{
              color: '#8D7A66',
              fontSize: 28,
              marginTop: 14,
              display: 'flex',
            }}
          >
            News  ×  Social  ×  Price — Visualized in Real Time
          </div>
        </div>

        {/* タグ行 */}
        <div style={{ display: 'flex', gap: 14 }}>
          {TAGS.map(tag => (
            <div
              key={tag.label}
              style={{
                border: `1.5px solid ${tag.border}`,
                borderRadius: 100,
                padding: '10px 26px',
                color: tag.color,
                fontSize: 20,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {tag.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
