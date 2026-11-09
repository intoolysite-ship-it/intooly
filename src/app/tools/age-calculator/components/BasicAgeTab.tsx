// src/app/tools/age-calculator/components/BasicAgeTab.tsx
'use client';

import type { UseAgeCalculatorReturn } from '../hooks/useAgeCalculator';
import { DateInputField } from './ui/DateInputField';
import { ResultCard, BigNumber } from './ui/ResultCard';
import { formatDateAr, getMonthNameAr } from '../lib/age';
import { formatHijriAr } from '../lib/hijri';

interface Props {
  hook: UseAgeCalculatorReturn;
}

export function BasicAgeTab({ hook }: Props) {
  const {
    birth, setBirth, reference, setReference,
    birthError, referenceError,
    age, hijriBirth, hijriReference,
    birthWeekdayAr, formattedBirth,
  } = hook;

  return (
    <div className="space-y-6">
      {/* المدخلات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          أدخل تاريخ ميلادك
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInputField
            id="birth"
            label="تاريخ الميلاد"
            value={birth}
            onChange={setBirth}
            error={birthError}
            maxYear={new Date().getFullYear()}
          />
          <DateInputField
            id="reference"
            label="تاريخ الحساب (افتراضيًا اليوم)"
            value={reference}
            onChange={setReference}
            error={referenceError}
          />
        </div>
      </div>

      {/* النتيجة */}
      {age && !birthError && (
        <>
          {/* البطاقة الرئيسية */}
          <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-md">
            <div className="text-center space-y-2">
              <div className="text-sm font-semibold text-orange-700">
                عمرك بالتفصيل
              </div>
              <div className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 text-3xl sm:text-4xl font-extrabold text-slate-900">
                <span className="text-orange-600">{age.years}</span>
                <span className="text-base font-semibold text-slate-600">سنة</span>
                <span className="text-yellow-600">{age.months}</span>
                <span className="text-base font-semibold text-slate-600">شهر</span>
                <span className="text-slate-800">{age.days}</span>
                <span className="text-base font-semibold text-slate-600">يوم</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-200/60 text-center text-sm text-slate-600 space-y-1">
              <div>
                وُلدت يوم <strong className="text-slate-800">{birthWeekdayAr}</strong>
                {' — '}
                <strong className="text-slate-800">{formattedBirth}</strong>
              </div>
              {hijriBirth && (
                <div className="text-xs text-slate-500">
                  الموافق {formatHijriAr(hijriBirth)}
                  {hijriReference && ` — تاريخ الحساب ${formatHijriAr(hijriReference)}`}
                </div>
              )}
            </div>
          </div>

          {/* إحصاءات الوحدات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard title="إجمالي الأيام" accent="orange">
              <BigNumber value={age.totalDays} label="يوم" accent="orange" />
            </ResultCard>
            <ResultCard title="إجمالي الأسابيع" accent="gold">
              <BigNumber value={age.totalWeeks} label="أسبوع" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي الأشهر" accent="orange">
              <BigNumber value={age.totalMonths} label="شهر" accent="orange" />
            </ResultCard>
            <ResultCard title="إجمالي الساعات" accent="navy">
              <BigNumber value={age.totalHours} label="ساعة (تقدير)" accent="navy" />
            </ResultCard>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ResultCard title="إجمالي الدقائق" accent="gold">
              <BigNumber value={age.totalMinutes} label="دقيقة (تقدير)" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي الثواني" accent="navy">
              <BigNumber value={age.totalSeconds} label="ثانية (تقدير)" accent="navy" />
            </ResultCard>
          </div>

          {/* عيد الميلاد القادم */}
          <ResultCard title="عيد ميلادك القادم" accent="orange">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-2xl font-extrabold text-orange-600">
                  {age.nextBirthday.daysLeft.toLocaleString('en-US')}
                  <span className="text-sm font-semibold text-slate-600 mr-1">يوم متبقٍ</span>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {age.nextBirthday.dateInput.day}{' '}
                  {getMonthNameAr(age.nextBirthday.dateInput.month)}{' '}
                  {age.nextBirthday.dateInput.year}
                  {' — '}
                  {age.nextBirthday.weekday}
                </div>
              </div>
              <div className="text-sm text-slate-500">
                ستُكمل <strong className="text-slate-800">{age.nextBirthday.ageTurning}</strong> سنة
              </div>
            </div>
          </ResultCard>

          <p className="text-xs text-slate-500 text-center">
            * الساعات والدقائق والثواني تقديرات تعتمد على إجمالي الأيام، وليست محسوبة على وقت الميلاد الفعلي.
          </p>
        </>
      )}
    </div>
  );
}
