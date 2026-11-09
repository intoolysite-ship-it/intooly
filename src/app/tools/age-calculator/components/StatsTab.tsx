// src/app/tools/age-calculator/components/StatsTab.tsx
'use client';

import { useMemo } from 'react';
import type { UseAgeCalculatorReturn } from '../hooks/useAgeCalculator';
import { DateInputField } from './ui/DateInputField';
import { ResultCard, BigNumber } from './ui/ResultCard';
import { isLeapYear } from '../lib/validation';

interface Props {
  hook: UseAgeCalculatorReturn;
}

export function StatsTab({ hook }: Props) {
  const { birth, setBirth, reference, setReference, birthError, referenceError, age } = hook;

  // إحصاءات إضافية
  const stats = useMemo(() => {
    if (!age) return null;

    // نسبة ما مضى من السنة الحالية
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear() + 1, 0, 1);
    const yearProgress =
      ((today.getTime() - startOfYear.getTime()) /
        (endOfYear.getTime() - startOfYear.getTime())) *
      100;

    const daysUntilYearEnd = Math.ceil(
      (endOfYear.getTime() - today.getTime()) / 86400000
    );

    // عدد السنوات الكبيسة منذ الميلاد
    let leapYears = 0;
    for (let y = birth.year; y <= today.getFullYear(); y++) {
      if (isLeapYear(y)) leapYears += 1;
    }

    return {
      yearProgress,
      daysUntilYearEnd,
      leapYears,
    };
  }, [age, birth.year]);

  return (
    <div className="space-y-6">
      {/* المدخلات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">لوحة إحصائيات العمر</h2>
        <p className="text-sm text-slate-500 mb-4">
          ملخص شامل لكل الوحدات الزمنية والإحصاءات المرتبطة بتاريخ ميلادك.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInputField
            id="stats-birth"
            label="تاريخ الميلاد"
            value={birth}
            onChange={setBirth}
            error={birthError}
            maxYear={new Date().getFullYear()}
          />
          <DateInputField
            id="stats-ref"
            label="تاريخ الحساب"
            value={reference}
            onChange={setReference}
            error={referenceError}
          />
        </div>
      </div>

      {/* الإحصاءات */}
      {age && !birthError && !referenceError && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard title="السنوات المكتملة" accent="gold">
              <BigNumber value={age.years} label="سنة" accent="gold" />
            </ResultCard>
            <ResultCard title="الأشهر المكتملة" accent="gold">
              <BigNumber value={age.totalMonths} label="شهر" accent="gold" />
            </ResultCard>
            <ResultCard title="الأسابيع المكتملة" accent="gold">
              <BigNumber value={age.totalWeeks} label="أسبوع" accent="gold" />
            </ResultCard>
            <ResultCard title="الأيام الكلية" accent="dark">
              <BigNumber value={age.totalDays} label="يوم" accent="dark" />
            </ResultCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ResultCard title="نسبة ما مضى من السنة" accent="gold">
              <div className="space-y-2">
                <div className="text-2xl font-extrabold text-yellow-600 text-center">
                  {stats.yearProgress.toFixed(1)}%
                </div>
                <div className="w-full h-2 bg-yellow-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${Math.min(100, stats.yearProgress)}%` }}
                  />
                </div>
              </div>
            </ResultCard>
            <ResultCard title="الأيام المتبقية من السنة" accent="gold">
              <BigNumber value={stats.daysUntilYearEnd} label="يوم" accent="gold" />
            </ResultCard>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ResultCard title="السنوات الكبيسة التي عشتها" accent="gold">
              <BigNumber value={stats.leapYears} label="سنة كبيسة" accent="gold" />
            </ResultCard>
            <ResultCard title="الأيام المتبقية لعيد ميلادك" accent="dark">
              <BigNumber value={age.nextBirthday.daysLeft} label="يوم" accent="dark" />
            </ResultCard>
          </div>

          <ResultCard title="ملخص قابل للنسخ" accent="dark">
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed" dir="rtl">
{`تاريخ الميلاد: ${birth.day}/${birth.month}/${birth.year}
يوم الميلاد: ${age.birthWeekday}
العمر: ${age.years} سنة، ${age.months} شهر، ${age.days} يوم
إجمالي الأيام: ${age.totalDays}
إجمالي الأسابيع: ${age.totalWeeks}
إجمالي الأشهر: ${age.totalMonths}
إجمالي الساعات: ${age.totalHours}
عيد الميلاد القادم: ${age.nextBirthday.dateInput.day}/${age.nextBirthday.dateInput.month}/${age.nextBirthday.dateInput.year}
الأيام حتى عيد الميلاد: ${age.nextBirthday.daysLeft}`}
            </pre>
          </ResultCard>
        </>
      )}
    </div>
  );
}

