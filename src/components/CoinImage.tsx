'use client';

import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export default function CoinImage({ src, alt, fill, width, height, className }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? (width ?? 32) : undefined}
      height={!fill ? (height ?? 32) : undefined}
      className={className}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}
