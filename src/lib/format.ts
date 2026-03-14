import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

/** 日本時間に変換して表示 */
export function formatJST(isoString: string, fmt = 'MM/dd HH:mm'): string {
  try {
    const date = new Date(isoString);
    return format(date, fmt, { locale: ja });
  } catch {
    return '---';
  }
}

/** "〇分前" 表示 */
export function timeAgo(isoString: string): string {
  try {
    return formatDistanceToNow(new Date(isoString), { locale: ja, addSuffix: true });
  } catch {
    return '---';
  }
}

/** 価格を日本円で表示 */
export function formatJPY(yen: number): string {
  if (yen >= 1_000_000) return `¥${(yen / 1_000_000).toFixed(2)}M`;
  if (yen >= 1_000) return `¥${yen.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
  if (yen >= 1) return `¥${yen.toLocaleString('ja-JP', { maximumFractionDigits: 2 })}`;
  return `¥${yen.toFixed(6)}`;
}

/** パーセント変動の色クラス */
export function changeColor(change: number): string {
  if (change > 0) return 'text-brand-up';
  if (change < 0) return 'text-brand-down';
  return 'text-text-secondary';
}

/** パーセント変動の表示文字列 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/** 急上昇スコアに応じたバッジ色 */
export function surgeBadgeColor(score: number): string {
  if (score >= 5.0) return 'bg-brand-down/20 text-brand-down border border-brand-down/40';
  if (score >= 3.0) return 'bg-brand-warning/20 text-brand-warning border border-brand-warning/40';
  if (score >= 2.0) return 'bg-brand-up/20 text-brand-up border border-brand-up/40';
  return 'bg-text-muted/20 text-text-secondary';
}

/** 数値の短縮表示 */
export function shortNumber(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3)  return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
