// src/app/tools/age-calculator/components/MilestonesTab.tsx
'use client';

import type { UseAgeCalculatorReturn } from '../hooks/useAgeCalculator';
import { DateInputField } from './ui/DateInputField';
import { ResultCard } from './ui/ResultCard';
import { formatDateAr } from '../lib/age';

interface Props {
  hook: UseAgeCalculatorReturn;
}

export function MilestonesTab({ hook }: Props) {
  const { birth, setBirth, birthError, milestones } = hook;

  return (
    <div className="space-y-6">
      {/* المدخلات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">محطات العمر</h2>
        <p className="text-sm text-slate-500 mb-4">
          تواريخ إكمال أعداد مميزة من الأيام منذ ولادتك: 1,000، 5,000، 10,000، 20,000، 30,000، 40,000 يوم.
        </p>
        <DateInputField
          id="milestones-birth"
          label="تاريخ الميلاد"
          value={birth}
          onChange={setBirth}
          error={birthError}
          maxYear={new Date().getFullYear()}
        />
      </div>

      {/* المحطات */}
      {!birthError && milestones.length > 0 && (
        <ResultCard title="جدول محطات العمر" accent="orange">
          <div className="divide-y divide-orange-100">
            {milestones.map((m) => (
              <div key={m.targetDays} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      m.reached ? 'bg-green-500' : 'bg-orange-400'
                    }`}
                  />
                  <span className="font-bold text-slate-800">
                    {m.targetDays.toLocaleString('en-US')} يوم
                  </span>
                </div>
                {m.reached && m.reachedDate ? (
                  <div className="text-sm text-green-700 font-semibold">
                    ✓ {formatDateAr(m.reachedDate)}
                  </div>
                ) : (
                  <div className="text-sm text-orange-700 font-semibold">
                    متبقٍ {m.daysUntil?.toLocaleString('en-US')} يوم
                  </div>
                )}
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      <p className="text-xs text-slate-500 text-center">
        * محطات العمر للمتعة والفضول فقط، وليست تقييمًا صحيًا.
      </p>
    </div>
  );
}
