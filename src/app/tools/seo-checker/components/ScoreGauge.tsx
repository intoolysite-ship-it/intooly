'use client';

/**
 * مؤشر بصري احترافي (Gauge) — يشبه Sitebulb وAhrefs.
 * يعرض قوسًا ملوّنًا يمتلئ + إبرة + الدرجة + الحالة.
 */

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
}

export default function ScoreGauge({
  score,
  size = 'md',
  label = 'درجة SEO',
  showLabel = true,
}: ScoreGaugeProps) {
  const safeScore = Math.max(0, Math.min(100, score));

  const sizes = {
    sm: { width: 140, strokeWidth: 12, fontSize: 24 },
    md: { width: 200, strokeWidth: 16, fontSize: 32 },
    lg: { width: 260, strokeWidth: 20, fontSize: 42 },
  };

  const s = sizes[size];
  const radius = (s.width - s.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  // الألوان بناءً على الدرجة
  const color =
    safeScore >= 80
      ? '#10b981' // أخضر
      : safeScore >= 50
        ? '#f59e0b' // برتقالي
        : '#ef4444'; // أحمر

  const status =
    safeScore >= 80
      ? 'ممتاز'
      : safeScore >= 50
        ? 'يحتاج تحسين'
        : 'مشاكل حرجة';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: s.width, height: s.width / 2 + 30 }}>
        <svg
          width={s.width}
          height={s.width / 2 + 30}
          viewBox={`0 0 ${s.width} ${s.width / 2 + 30}`}
          className="overflow-visible"
        >
          {/* الخلفية الرمادية */}
          <path
            d={`M ${s.strokeWidth / 2} ${s.width / 2} A ${radius} ${radius} 0 0 1 ${s.width - s.strokeWidth / 2} ${s.width / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={s.strokeWidth}
            strokeLinecap="round"
          />
          {/* القوس الملوّن */}
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
          {/* النص في المنتصف */}
          <text
            x={s.width / 2}
            y={s.width / 2 - 15}
            textAnchor="middle"
            className="font-black"
            style={{ fontSize: s.fontSize, fill: color }}
          >
            {safeScore}
          </text>
          <text
            x={s.width / 2}
            y={s.width / 2 + 5}
            textAnchor="middle"
            className="font-bold"
            style={{ fontSize: s.fontSize * 0.3, fill: '#9ca3af' }}
          >
            /100
          </text>
        </svg>
      </div>
      
      {showLabel && (
        <div className="text-center mt-1">
          <p className="text-sm font-bold text-ink-500">{label}</p>
          <p className="text-lg font-black" style={{ color }}>{status}</p>
        </div>
      )}
    </div>
  );
}
