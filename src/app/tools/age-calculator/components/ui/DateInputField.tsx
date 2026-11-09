// src/app/tools/age-calculator/components/ui/DateInputField.tsx
'use client';

import type { DateInput } from '../../lib/types';
import { todayInput } from '../../lib/validation';

interface Props {
  label: string;
  value: DateInput;
  onChange: (d: DateInput) => void;
  error?: string | null;
  minYear?: number;
  maxYear?: number;
  id?: string;
}

export function DateInputField({
  label,
  value,
  onChange,
  error,
  minYear = 1900,
  maxYear = 2200,
  id,
}: Props) {
  const update = (field: keyof DateInput, raw: string) => {
    const num = parseInt(raw, 10);
    if (Number.isNaN(num)) return;
    onChange({ ...value, [field]: num });
  };

  const baseInput =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-base text-slate-800 transition focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 hover:border-slate-400';

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2" dir="rtl">
        <div>
          <span className="block text-xs text-slate-500 mb-1">اليوم</span>
          <input
            id={id ? `${id}-day` : undefined}
            type="number"
            min={1}
            max={31}
            value={value.day}
            onChange={(e) => update('day', e.target.value)}
            className={baseInput}
          />
        </div>
        <div>
          <span className="block text-xs text-slate-500 mb-1">الشهر</span>
          <input
            type="number"
            min={1}
            max={12}
            value={value.month}
            onChange={(e) => update('month', e.target.value)}
            className={baseInput}
          />
        </div>
        <div>
          <span className="block text-xs text-slate-500 mb-1">السنة</span>
          <input
            type="number"
            min={minYear}
            max={maxYear}
            value={value.year}
            onChange={(e) => update('year', e.target.value)}
            className={baseInput}
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function todayAsInput(): DateInput {
  return todayInput();
}
