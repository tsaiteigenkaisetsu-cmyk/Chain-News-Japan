'use client';

import { useEffect, useRef } from 'react';

interface Props {
  slot?: string;
  className?: string;
  size?: 'banner' | 'rectangle' | 'leaderboard';
}

export default function AdSlot({ slot, className = '', size = 'banner' }: Props) {
  const adRef = useRef<HTMLModElement | null>(null);
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const defaultSlot = {
    banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER,
    rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE,
    leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  }[size];
  const resolvedSlot = slot ?? defaultSlot;
  const adsenseEnabled = Boolean(adsenseClient && resolvedSlot);
  const sizeClass = {
    banner:      'h-[90px] max-w-[728px]',
    rectangle:   'h-[250px] max-w-[300px]',
    leaderboard: 'h-[90px] max-w-full',
  }[size];

  useEffect(() => {
    if (!adsenseEnabled || !adRef.current || adRef.current.dataset.loaded === 'true') {
      return;
    }

    try {
      ((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
      adRef.current.dataset.loaded = 'true';
    } catch {
      // Ad blockers or duplicate initialization should not break page rendering.
    }
  }, [adsenseEnabled, resolvedSlot]);

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      {adsenseEnabled ? (
        <ins
          ref={adRef}
          className={`adsbygoogle ${sizeClass} w-full overflow-hidden rounded-card`}
          style={{ display: 'block' }}
          data-ad-client={adsenseClient}
          data-ad-slot={resolvedSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className={`${sizeClass} w-full bg-bg-card border border-dashed border-white/10 rounded-card flex items-center justify-center text-text-muted text-xs`}
          data-ad-slot={resolvedSlot}
        >
          <span className="opacity-30">AD</span>
        </div>
      )}
    </div>
  );
}
