// src/app/tools/age-calculator/components/BirthdayTab.tsx
'use client';

import type { UseAgeCalculatorReturn } from '../hooks/useAgeCalculator';
import { DateInputField } from './ui/DateInputField';
import { ResultCard, BigNumber } from './ui/ResultCard';
import { formatDateAr, getMonthNameAr, getWeekdayAr, formatDateAr as fmt } from '../lib/age';
import { formatHijriAr, gregorianToHijri } from '../lib/hijri';
import { inputToDate, todayInput } from '../lib/validation';

interface Props {
  hook: UseAgeCalculatorReturn;
}

export function BirthdayTab({ hook }: Props) {
  const { birth, setBirth, birthError, age } = hook;

  if (birthError || !age) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">عيد ميلادك القادم</h2>
        <p className="text-sm text-slate-500 mb-4">أدخل تاريخ ميلادك لعرض عيد ميلادك القادم والعد التنازلي.</p>
        <DateInputField
          id="birthday-birth"
          label="تاريخ الميلاد"
          value={birth}
          onChange={setBirth}
          error={birthError}
          maxYear={new Date().getFullYear()}
        />
      </div>
    );
  }

  const next = age.nextBirthday;
  const hijriNext = gregorianToHijri(next.dateInput);
  const birthDate = inputToDate(birth);
  const hijriBirth = gregorianToHijri(birth);

  return (
    <div className="space-y-6">
      {/* المدخلات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">عيد ميلادك القادم</h2>
        <DateInputField
          id="birthday-birth-input"
          label="تاريخ الميلاد"
          value={birth}
          onChange={setBirth}
          error={birthError}
          maxYear={new Date().getFullYear()}
        />
      </div>

      {/* العد التنازلي الرئيسي */}
      <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-md">
        <div className="text-center">
          <div className="text-sm font-semibold text-orange-700 mb-1">
            الوقت المتبقي لعيد ميلادك القادم
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-orange-600">
            {next.daysLeft.toLocaleString('en-US')}
          </div>
          <div className="text-base font-semibold text-slate-700 mt-1">يوم متبقٍ</div>
          <div className="mt-4 pt-4 border-t border-orange-200/60 text-sm text-slate-700 space-y-1">
            <div>
              <strong className="text-slate-900">{fmt(next.dateInput)}</strong>
              {' — '}
              <span className="text-orange-700 font-semibold">{next.weekday}</span>
            </div>
            {hijriNext && (
              <div className="text-xs text-slate-500">الموافق {formatHijriAr(hijriNext)}</div>
            )}
            <div className="text-slate-600">
              ستُكمل <strong className="text-orange-700">{next.ageTurning}</strong> سنة
            </div>
          </div>
        </div>
      </div>

      {/* تفاصيل إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ResultCard title="عيد ميلادك السابق" accent="gold">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-700">{age.years}</div>
            <div className="text-xs text-slate-500 mt-1">سنة أكملتها</div>
          </div>
        </ResultCard>
        <ResultCard title="عدد أعياد الميلاد التي مرت" accent="orange">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-700">{age.years}</div>
            <div className="text-xs text-slate-500 mt-1">عيد ميلاد</div>
          </div>
        </ResultCard>
      </div>

      {/* التاريخ الميلادي والهجري */}
      <ResultCard title="تاريخ ميلادك بالتقويمين" accent="navy">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-500 mb-1">ميلادي</div>
            <div className="font-bold text-slate-800">{formatDateAr(birth)}</div>
            <div className="text-xs text-slate-500 mt-1">{getWeekdayAr(birthDate)}</div>
          </div>
          {hijriBirth && (
            <div>
              <div className="text-xs text-slate-500 mb-1">هجري</div>
              <div className="font-bold text-slate-800">{formatHijriAr(hijriBirth)}</div>
              <div className="text-xs text-slate-500 mt-1">{hijriBirth.weekdayAr}</div>
            </div>
          )}
        </div>
      </ResultCard>

      {/* أعياد ميلاد قادمة متعددة */}
      <ResultCard title="أعياد الميلاد القادمة" accent="orange">
        <div className="divide-y divide-orange-100">
          {[0, 1, 2].map((offset) => {
            const year = next.dateInput.year + offset;
            let d = { year, month: birth.month, day: birth.day };
            // معالجة 29 فبراير في سنة غير كبيسة → 1 مارس
            if (d.month === 2 && d.day === 29) {
              const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
              if (!isLeap) d = { year, month: 3, day: 1 };
            }
            const wd = getWeekdayAr(new Date(d.year, d.month - 1, d.day));
            const age = next.ageTurning + offset;
            return (
              <div key={year} className="flex items-center justify-between py-2 text-sm">
                <div className="text-slate-700">
                  {d.day} {getMonthNameAr(d.month)} {year}
                </div>
                <div className="text-slate-500 text-xs">{wd}</div>
                <div className="text-orange-700 font-semibold">{age} سنة</div>
              </div>
            );
          })}
        </div>
      </ResultCard>
    </div>
  );
}
