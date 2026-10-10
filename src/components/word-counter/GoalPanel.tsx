'use client';

import { useState } from 'react';
import { Target, CheckCircle2, TrendingUp } from 'lucide-react';
import type { WritingGoal } from '@/lib/word-counter/types';

interface GoalPanelProps {
  goal: WritingGoal | null;
  onSetGoal: (target: number, unit: 'word' | 'char') => void;
  onClearGoal: () => void;
  disabled?: boolean;
}

const PRESET_GOALS = [
  { target: 100, label: '100', unit: 'word' as const },
  { target: 300, label: '300', unit: 'word' as const },
  { target: 500, label: '500', unit: 'word' as const },
  { target: 1000, label: '1K', unit: 'word' as const },
  { target: 1500, label: '1.5K', unit: 'word' as const },
  { target: 2000, label: '2K', unit: 'word' as const },
  { target: 3000, label: '3K', unit: 'word' as const },
  { target: 5000, label: '5K', unit: 'word' as const },
];

export default function GoalPanel({ goal, onSetGoal, onClearGoal, disabled = false }: GoalPanelProps) {
  const [customTarget, setCustomTarget] = useState('');
  const [unit, setUnit] = useState<'word' | 'char'>('word');
  
  const handleSetCustom = () => {
    const target = parseInt(customTarget);
    if (target > 0 && target <= 100000) {
      onSetGoal(target, unit);
      setCustomTarget('');
    }
  };
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
      
      {/* العنوان */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-ink-900 text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-500" />
          هدف الكتابة
        </h3>
        
        {goal && (
          <button
            onClick={onClearGoal}
            disabled={disabled}
            className="text-xs font-bold text-red-500 hover:text-red-700"
          >
            مسح الهدف
          </button>
        )}
      </div>
      
      {/* إذا لم يكن هناك هدف */}
      {!goal && (
        <div className="space-y-3">
          
          {/* اختيار الوحدة */}
          <div className="flex gap-2">
            <button
              onClick={() => setUnit('word')}
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                unit === 'word'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              كلمات
            </button>
            <button
              onClick={() => setUnit('char')}
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                unit === 'char'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              أحرف
            </button>
          </div>
          
          {/* أهداف جاهزة */}
          {unit === 'word' && (
            <div>
              <p className="text-xs font-bold text-ink-600 mb-2">أهداف سريعة:</p>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_GOALS.map((preset) => (
                  <button
                    key={preset.target}
                    onClick={() => onSetGoal(preset.target, 'word')}
                    disabled={disabled}
                    className="px-2 py-2 rounded-lg bg-ink-100 hover:bg-brand-100 text-ink-700 text-xs font-bold transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* هدف مخصص */}
          <div>
            <p className="text-xs font-bold text-ink-600 mb-2">أو هدف مخصص:</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                placeholder={unit === 'word' ? 'مثال: 800' : 'مثال: 5000'}
                disabled={disabled}
                min="1"
                max="100000"
                className="flex-1 px-3 py-2 rounded-lg border-2 border-ink-200 text-sm font-bold focus:outline-none focus:border-brand-400"
              />
              <button
                onClick={handleSetCustom}
                disabled={disabled || !customTarget}
                className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-ink-300 text-white text-sm font-bold transition-colors"
              >
                تعيين
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* إذا كان هناك هدف */}
      {goal && (
        <div className="space-y-3">
          
          {/* معلومات الهدف */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-ink-900">
                {goal.current.toLocaleString('ar-SA')}
                <span className="text-sm text-ink-500 font-bold">
                  {' / '}{goal.target.toLocaleString('ar-SA')}
                </span>
              </p>
              <p className="text-xs font-bold text-ink-500">
                {goal.unit === 'word' ? 'كلمة' : 'حرف'}
              </p>
            </div>
            
            {goal.isAchieved && (
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-black">تم الإنجاز!</span>
              </div>
            )}
          </div>
          
          {/* شريط التقدم */}
          <div className="space-y-2">
            <div className="w-full bg-ink-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  goal.isAchieved
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-brand-500 to-brand-600'
                }`}
                style={{ width: `${Math.min(100, goal.percentage)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={`${goal.isAchieved ? 'text-green-700' : 'text-brand-700'}`}>
                {goal.percentage}%
              </span>
              {!goal.isAchieved && (
                <span className="text-ink-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  متبقي: {goal.remaining.toLocaleString('ar-SA')} {goal.unit === 'word' ? 'كلمة' : 'حرف'}
                </span>
              )}
            </div>
          </div>
          
          {/* معلومات إضافية */}
          {goal.isAchieved && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
              <p className="text-xs font-bold text-green-700">
                🎉 مبروك! تجاوزت الهدف بمقدار{' '}
                {(goal.current - goal.target).toLocaleString('ar-SA')}{' '}
                {goal.unit === 'word' ? 'كلمة' : 'حرف'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
