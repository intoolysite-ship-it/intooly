'use client';

import { useState } from 'react';
import { BookOpen, Info, ChevronDown } from 'lucide-react';
import { READABILITY_LEVELS } from '@/lib/word-counter/constants';
import type { ReadabilityScore } from '@/lib/word-counter/types';

interface ReadabilityPanelProps {
  readability: ReadabilityScore;
}

export default function ReadabilityPanel({ readability }: ReadabilityPanelProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const level = READABILITY_LEVELS.find(l => l.id === readability.level);
  
  // ألوان المستوى
  const levelColors: Record<string, string> = {
    'very-easy': '#22c55e',
    'easy': '#eab308',
    'medium': '#f97316',
    'hard': '#ef4444',
    'very-hard': '#6b7280',
  };
  
  const color = levelColors[readability.level] || '#9ca3af';
  
  // حساب النصف دائرة
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 15;
  
  const angle = (readability.score / 100) * 180;
  const radians = (angle - 90) * (Math.PI / 180);
  const dotX = cx + radius * Math.cos(radians);
  const dotY = cy + radius * Math.sin(radians);
  
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
      
      {/* الرأس */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-ink-900 text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          مؤشر القراءة
        </h3>
        
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          {showBreakdown ? 'إخفاء' : 'التفاصيل'}
          <ChevronDown className={`w-3 h-3 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* النصف دائرة */}
      <div className="flex flex-col items-center">
        <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
          {/* الخلفية */}
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* القوس الملون */}
          {readability.score > 0 && (
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${angle > 90 ? 1 : 0} 1 ${dotX} ${dotY}`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
          
          {/* النقطة */}
          {readability.score > 0 && (
            <circle
              cx={dotX}
              cy={dotY}
              r={strokeWidth / 2 + 2}
              fill="white"
              stroke={color}
              strokeWidth={3}
            />
          )}
          
          {/* النص */}
          <text
            x={cx}
            y={cy - 20}
            textAnchor="middle"
            className="font-black"
            style={{ fontSize: 36, fill: color }}
          >
            {readability.score}%
          </text>
          
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            className="font-bold"
            style={{ fontSize: 14, fill: '#6b7280' }}
          >
            {level?.icon} {level?.label}
          </text>
        </svg>
        
        {/* الوصف */}
        {level && (
          <p className="text-xs text-ink-600 font-bold text-center mt-2 max-w-xs">
            {level.description}
          </p>
        )}
      </div>
      
      {/* التفاصيل */}
      {showBreakdown && (
        <div className="mt-4 pt-4 border-t border-ink-200 space-y-3">
          
          {/* العوامل */}
          <div>
            <p className="text-xs font-black text-ink-700 mb-2">عوامل المؤشر:</p>
            <div className="space-y-2">
              {readability.breakdown.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink-700">{item.factor}</span>
                    <span className="font-black" style={{ color }}>
                      {item.contribution} نقطة
                    </span>
                  </div>
                  <div className="w-full bg-ink-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${item.score}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-ink-500 font-bold">
                    الوزن: {Math.round(item.weight * 100)}% — النتيجة: {item.score}%
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* إحصائيات إضافية */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-ink-50 text-center">
              <p className="text-[10px] font-bold text-ink-600">متوسط الجملة</p>
              <p className="text-sm font-black text-ink-900">
                {readability.avgSentenceLength} كلمة
              </p>
            </div>
            <div className="p-2 rounded-lg bg-ink-50 text-center">
              <p className="text-[10px] font-bold text-ink-600">متوسط الكلمة</p>
              <p className="text-sm font-black text-ink-900">
                {readability.avgWordLength} حرف
              </p>
            </div>
            <div className="p-2 rounded-lg bg-ink-50 text-center">
              <p className="text-[10px] font-bold text-ink-600">الكلمات الطويلة</p>
              <p className="text-sm font-black text-ink-900">
                {readability.longWordsRatio}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-ink-50 text-center">
              <p className="text-[10px] font-bold text-ink-600">نسبة التشكيل</p>
              <p className="text-sm font-black text-ink-900">
                {readability.diacriticsRatio}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
