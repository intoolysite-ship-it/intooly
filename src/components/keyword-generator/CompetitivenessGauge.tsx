'use client';

import { useState } from 'react';
import { COMPETITION_TIERS, type CompetitionLevel } from '@/lib/keyword-generator/constants';

interface CompetitivenessGaugeProps {
  score: number; // 0-100 أو -1 للا بيانات
  level: CompetitionLevel;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  breakdown?: {
    factor: string;
    weight: number;
    score: number;
    contribution: number;
  }[];
}

export default function CompetitivenessGauge({
  score,
  level,
  size = 'md',
  showDetails = false,
  breakdown,
}: CompetitivenessGaugeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const tier = COMPETITION_TIERS.find(t => t.id === level) || COMPETITION_TIERS[0];
  const hasData = score >= 0;
  
  // أحجام
  const sizes = {
    sm: { width: 80, height: 50, strokeWidth: 12, fontSize: 14 },
    md: { width: 120, height: 70, strokeWidth: 16, fontSize: 20 },
    lg: { width: 160, height: 95, strokeWidth: 20, fontSize: 28 },
  };
  
  const s = sizes[size];
  
  // حساب الإحداثيات
  const cx = s.width / 2;
  const cy = s.height - 10;
  const radius = (s.width - s.strokeWidth) / 2;
  
  // القوس
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;
  
  // النقطة
  const angle = hasData ? (score / 100) * 180 : 0;
  const radians = (angle - 90) * (Math.PI / 180);
  const dotX = cx + radius * Math.cos(radians);
  const dotY = cy + radius * Math.sin(radians);
  
  // القوس الملون
  const arcEndX = hasData ? dotX : startX;
  const arcEndY = hasData ? dotY : startY;
  const largeArc = angle > 180 ? 1 : 0;
  
  return (
    <div className="flex flex-col items-center relative">
      <div 
        className="cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg 
          width={s.width} 
          height={s.height} 
          viewBox={`0 0 ${s.width} ${s.height}`}
          className="overflow-visible"
        >
          {/* الخلفية الرمادية */}
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={s.strokeWidth}
            strokeLinecap="round"
          />
          
          {/* القوس الملون */}
          {hasData && (
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${arcEndX} ${arcEndY}`}
              fill="none"
              stroke={tier.hex}
              strokeWidth={s.strokeWidth}
              strokeLinecap="round"
            />
          )}
          
          {/* النقطة */}
          {hasData && (
            <circle
              cx={dotX}
              cy={dotY}
              r={s.strokeWidth / 2 + 2}
              fill="white"
              stroke={tier.hex}
              strokeWidth={3}
            />
          )}
          
          {/* النص */}
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            className="font-black"
            style={{ fontSize: s.fontSize, fill: hasData ? tier.hex : '#9ca3af' }}
          >
            {hasData ? `${score}%` : '?'}
          </text>
        </svg>
      </div>
      
      {/* التسمية */}
      <p 
        className="text-xs font-bold mt-1"
        style={{ color: hasData ? tier.hex : '#9ca3af' }}
      >
        {tier.label}
      </p>
      
      {/* Tooltip */}
      {showTooltip && showDetails && breakdown && breakdown.length > 0 && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-ink-900 text-white text-xs rounded-lg p-3 shadow-2xl min-w-[220px] whitespace-nowrap">
          <p className="font-bold mb-2 border-b border-white/20 pb-1">لماذا هذا التصنيف؟</p>
          {breakdown.map((b, i) => (
            <div key={i} className="flex justify-between gap-3 mb-1">
              <span className="opacity-80">{b.factor}:</span>
              <span className="font-bold">{b.contribution}%</span>
            </div>
          ))}
          <p className="text-[10px] mt-2 pt-2 border-t border-white/20 opacity-70">
            ⚠️ تقدير تقريبي. للدقة الكاملة استخدم Ahrefs أو Semrush.
          </p>
        </div>
      )}
    </div>
  );
}
