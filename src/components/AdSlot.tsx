/** 広告枠コンポーネント（Google AdSense等に差し替え可能） */
interface Props {
  slot?: string;
  className?: string;
  size?: 'banner' | 'rectangle' | 'leaderboard';
}

export default function AdSlot({ slot, className = '', size = 'banner' }: Props) {
  const sizeClass = {
    banner:      'h-[90px] max-w-[728px]',
    rectangle:   'h-[250px] max-w-[300px]',
    leaderboard: 'h-[90px] max-w-full',
  }[size];

  // プロダクションでは AdSense スクリプトに差し替え
  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClass} w-full bg-bg-card border border-dashed border-white/10 rounded-card flex items-center justify-center text-text-muted text-xs`}
        data-ad-slot={slot}
      >
        {/* 広告スペース */}
        <span className="opacity-30">AD</span>
      </div>
    </div>
  );
}
