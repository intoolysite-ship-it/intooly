'use client';

/**
 * عدّاد أحرف ملوّن — يعرض عدد الأحرف والحد الأقصى مع شريط تقدم ومؤشر بصري.
 * مكوّن نقّي: لا يحسب الطول بنفسه، بل يستقبل النتيجة من الخارج.
 */

import type { LengthCheckResult } from '@/lib/seo-meta-tags/types';
import { LENGTH_COLORS } from '@/lib/seo-meta-tags/constants';

interface CharCounterProps {
  result: LengthCheckResult;
  max: number;
  showMessage?: boolean;
  size?: 'sm' | 'md';
}

export default function CharCounter({
  result,
  max,
  showMessage = true,
  size = 'md',
}: CharCounterProps) {
  const percentage = Math.min(100, (result.charCount / max) * 100);
  const color = LENGTH_COLORS[result.color];

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const barHeight = size === 'sm' ? 'h-1' : 'h-1.5';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className={`${textSize} font-bold`} style={{ color }}>
          {result.charCount} / {max} حرف
        </div>
        {result.pixelEstimate > 0 && (
          <div className={`${textSize} text-ink-500`}>
            ~{result.pixelEstimate}px
          </div>
        )}
      </div>

      <div className={`w-full bg-ink-200 rounded-full ${barHeight} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all ${barHeight}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {showMessage && result.message && (
        <p className={`${textSize} font-semibold`} style={{ color }}>
          {result.message}
        </p>
      )}
    </div>
  );
}
