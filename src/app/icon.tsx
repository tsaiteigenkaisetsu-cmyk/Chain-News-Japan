import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #D4A24C 0%, #3FA66B 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
        }}
      >
        <span
          style={{
            color: '#171411',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}
        >
          CN
        </span>
      </div>
    ),
    { ...size },
  );
}
