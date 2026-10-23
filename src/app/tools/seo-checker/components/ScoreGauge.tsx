'use client';

/**
 * مؤشر بصري (Gauge) لدرجة الصحة العامة.
 * يعرض قوسًا دائريًا ملوّنًا + الدرجة في المنتصف.
 */

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
}

export default function ScoreGauge({
  score,
  size = 'lg',
  label = 'درجة SEO',
  showLabel = true,
}: ScoreGaugeProps) {
  const safeScore = Math.max(0, Math.min(100, score));

  const sizes = {
    sm: { width: 120, strokeWidth: 10, fontSize: 20, labelSize: 10 },
    md: { width: 180, strokeWidth: 14, fontSize: 28, labelSize: 12 },
    lg: { width: 220, strokeWidth: 16, fontSize: 38, labelSize: 13 },
  };

  const s = sizes[size];
  const radius = (s.width - s.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  const color =
    safeScore >= 80
      ? '#22c55e'
      : safeScore >= 50
        ? '#f59e0b'
        : '#dc2626';

  const colorClass =
    safeScore >= 80
      ? 'text-green-600'
      : safeScore >= 50
        ? 'text-amber-600'
        : 'text-red-600';

  const status =
    safeScore >= 80
      ? 'ممتاز'
      : safeScore >= 50
        ? 'يحتاج تحسينًا'
        : 'مشاكل حرجة';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: s.width, height: s.width / 2 + 20 }}>
        <svg
          width={s.width}
          height={s.width / 2 + 20}
          viewBox={`0 0 ${s.width} ${s.width / 2 + 20}`}
        >
          <path
            d={`M ${s.strokeWidth / 2} ${s.width / 2} A ${radius} ${radius} 0 0 1 ${s.width - s.strokeWidth / 2} ${s.width / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={s.strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={`M ${s.strokeWidth / 2} ${s.width / 2} A ${radius} ${radius} 0 0 1 ${s.width - s.strokeWidth / 2} ${s.width / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={s.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
          <text
            x={s.width / 2}
            y={s.width / 2 - 10}
            textAnchor="middle"
            className="font-black"
            style={{ fontSize: s.fontSize, fill: color }}
          >
            {safeScore}
          </text>
          <text
            x={s.width / 2}
            y={s.width / 2 + 8}
            textAnchor="middle"
            className="font-semibold"
            style={{ fontSize: s.fontSize * 0.35, fill: '#9ca3af' }}
          >
            /100
          </text>
        </svg>
      </div>
      {showLabel && (
        <div className="text-center mt-1">
          <p className="text-xs font-bold text-ink-500">{label}</p>
          <p className={`text-sm font-extrabold ${colorClass}`}>{status}</p>
        </div>
      )}
    </div>
  );
}
