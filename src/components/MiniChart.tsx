'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data: number[];
  color?: string;
  height?: number;
}

export default function MiniChart({ data, color = '#5AC8FA', height = 40 }: Props) {
  if (!data || data.length === 0) {
    return <div style={{ height }} className="bg-bg-elevated rounded" />;
  }

  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={{ background: '#131A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
          labelStyle={{ display: 'none' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`${v ?? 0}件`, '話題量']}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
