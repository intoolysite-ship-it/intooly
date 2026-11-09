// src/app/tools/age-calculator/components/HijriTab.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { UseAgeCalculatorReturn } from '../hooks/useAgeCalculator';
import { ResultCard, BigNumber } from './ui/ResultCard';
import { formatHijriAr, getHijriMonthNameAr, hijriToGregorian, gregorianToHijri, isValidHijriDate } from '../lib/hijri';
import { formatDateAr } from '../lib/age';

interface Props {
  hook: UseAgeCalculatorReturn;
}

interface HijriInput {
  year: number;
  month: number;
  day: number;
}

const DEFAULT_HIJRI: HijriInput = { year: 1416, month: 1, day: 1 };

export function HijriTab({ hook }: Props) {
  const { setBirth, age, hijriBirth, hijriAge } = hook;
  const [hijriInput, setHijriInput] = useState<HijriInput>(DEFAULT_HIJRI);
  const [error, setError] = useState<string | null>(null);

  // تحديث الميلادي في الـ hook عندما يتغير الهجري
  useEffect(() => {
    if (!isValidHijriDate(hijriInput)) {
      setError('تاريخ هجري غير صالح. تحقق من اليوم (1-30) والشهر والسنة.');
      return;
    }
    const greg = hijriToGregorian(hijriInput);
    if (!greg) {
      setError('لم نتمكن من تحويل التاريخ الهجري. جرّب تاريخًا آخر.');
      return;
    }
    setError(null);
    setBirth(greg);
  }, [hijriInput, setBirth]);

  const update = (field: keyof HijriInput, raw: string) => {
    const num = parseInt(raw, 10);
    if (Number.isNaN(num)) return;
    setHijriInput({ ...hijriInput, [field]: num });
  };

  // التاريخ الميلادي المقابل للعرض
  const gregEquivalent = useMemo(() => {
    if (!isValidHijriDate(hijriInput)) return null;
    return hijriToGregorian(hijriInput);
  }, [hijriInput]);

  return (
    <div className="space-y-6">
      {/* المدخلات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">حاسبة العمر بالهجري</h2>
        <p className="text-sm text-slate-500 mb-4">
          أدخل تاريخ ميلادك بالتقويم الهجري (أم القرى) لمعرفة عمرك الهجري والميلادي.
        </p>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-slate-700">
            تاريخ الميلاد الهجري
          </label>
          <div className="grid grid-cols-3 gap-2" dir="rtl">
            <div>
              <span className="block text-xs text-slate-500 mb-1">اليوم</span>
              <input
                type="number" min={1} max={30}
                value={hijriInput.day}
                onChange={(e) => update('day', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <span className="block text-xs text-slate-500 mb-1">الشهر</span>
              <select
                value={hijriInput.month}
                onChange={(e) => update('month', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{getHijriMonthNameAr(m)}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="block text-xs text-slate-500 mb-1">السنة</span>
              <input
                type="number" min={1300} max={1600}
                value={hijriInput.year}
                onChange={(e) => update('year', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 mt-1" role="alert">{error}</p>}
        </div>

        {gregEquivalent && (
          <div className="mt-3 text-xs text-slate-500 text-center">
            الموافق ميلاديًا: <strong className="text-slate-700">{formatDateAr(gregEquivalent)}</strong>
          </div>
        )}
      </div>

      {/* النتيجة */}
      {!error && age && hijriAge && hijriBirth && (
        <>
          {/* العمر الهجري */}
          <div className="rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 shadow-md">
            <div className="text-center text-sm font-semibold text-yellow-700 mb-2">
              عمرك بالتقويم الهجري
            </div>
            <div className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 text-3xl sm:text-4xl font-extrabold text-slate-900">
              <span className="text-yellow-600">{hijriAge.years}</span>
              <span className="text-base font-semibold text-slate-600">سنة</span>
              <span className="text-yellow-600">{hijriAge.months}</span>
              <span className="text-base font-semibold text-slate-600">شهر</span>
              <span className="text-slate-800">{hijriAge.days}</span>
              <span className="text-base font-semibold text-slate-600">يوم</span>
            </div>
            <div className="mt-3 text-xs text-center text-slate-500">
              تاريخ الميلاد: {formatHijriAr(hijriBirth)}
            </div>
          </div>

          {/* العمر الميلادي للمقارنة */}
          <ResultCard title="عمرك بالتقويم الميلادي (للمقارنة)" accent="dark">
            <div className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 text-2xl font-extrabold text-slate-800">
              <span>{age.years}</span><span className="text-sm font-semibold text-slate-600">سنة</span>
              <span>{age.months}</span><span className="text-sm font-semibold text-slate-600">شهر</span>
              <span>{age.days}</span><span className="text-sm font-semibold text-slate-600">يوم</span>
            </div>
          </ResultCard>

          {/* إحصاءات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard title="إجمالي الأيام" accent="gold">
              <BigNumber value={age.totalDays} label="يوم" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي الأسابيع" accent="gold">
              <BigNumber value={age.totalWeeks} label="أسبوع" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي الأشهر" accent="gold">
              <BigNumber value={age.totalMonths} label="شهر" accent="gold" />
            </ResultCard>
            <ResultCard title="السنوات المكتملة" accent="dark">
              <BigNumber value={age.years} label="سنة" accent="dark" />
            </ResultCard>
          </div>

          <p className="text-xs text-slate-500 text-center">
            * التحويل يعتمد على تقويم أم القرى. قد يختلف يومًا واحدًا عن بعض التقاويم المحلية المعتمدة على رؤية الهلال.
          </p>
        </>
      )}
    </div>
  );
}

