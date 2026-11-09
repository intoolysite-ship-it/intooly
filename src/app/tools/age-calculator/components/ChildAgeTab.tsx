// src/app/tools/age-calculator/components/ChildAgeTab.tsx
'use client';

import type { UseAgeCalculatorReturn } from '../hooks/useAgeCalculator';
import { DateInputField } from './ui/DateInputField';
import { ResultCard, BigNumber } from './ui/ResultCard';
import { formatDateAr, getMonthNameAr } from '../lib/age';
import { inputToDate, todayInput, daysInMonth } from '../lib/validation';

interface Props {
  hook: UseAgeCalculatorReturn;
}

export function ChildAgeTab({ hook }: Props) {
  const { birth, setBirth, birthError, age, ageInMonths } = hook;

  // مراحل العمر المتعارف عليها
  const milestones = [
    { months: 6, label: '6 أشهر' },
    { months: 12, label: 'سنة' },
    { months: 24, label: 'سنتان' },
    { months: 36, label: '3 سنوات' },
  ];

  return (
    <div className="space-y-6">
      {/* المدخلات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">حاسبة عمر الأطفال والرضع</h2>
        <p className="text-sm text-slate-500 mb-4">
          حساب عمر الطفل بالأسابيع والأشهر والأيام، ومعرفة مواعيد إكمال مراحل عمرية مهمة.
        </p>
        <DateInputField
          id="child-birth"
          label="تاريخ ميلاد الطفل"
          value={birth}
          onChange={setBirth}
          error={birthError}
          maxYear={new Date().getFullYear()}
        />
      </div>

      {/* النتيجة */}
      {age && !birthError && (
        <>
          {/* العمر الرئيسي */}
          <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-md">
            <div className="text-center text-sm font-semibold text-orange-700 mb-2">
              عمر الطفل بالتفصيل
            </div>
            <div className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 text-3xl sm:text-4xl font-extrabold text-slate-900">
              <span className="text-orange-600">{age.years}</span>
              <span className="text-base font-semibold text-slate-600">سنة</span>
              <span className="text-yellow-600">{age.months}</span>
              <span className="text-base font-semibold text-slate-600">شهر</span>
              <span className="text-slate-800">{age.days}</span>
              <span className="text-base font-semibold text-slate-600">يوم</span>
            </div>
            <div className="mt-3 text-xs text-center text-slate-500">
              {formatDateAr(birth)} — {age.birthWeekday}
            </div>
          </div>

          {/* وحدات صغيرة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard title="إجمالي الأسابيع" accent="orange">
              <BigNumber value={age.totalWeeks} label="أسبوع" accent="orange" />
            </ResultCard>
            <ResultCard title="إجمالي الأشهر" accent="gold">
              <BigNumber value={ageInMonths} label="شهر" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي الأيام" accent="orange">
              <BigNumber value={age.totalDays} label="يوم" accent="orange" />
            </ResultCard>
            <ResultCard title="إجمالي الساعات" accent="navy">
              <BigNumber value={age.totalHours} label="ساعة" accent="navy" />
            </ResultCard>
          </div>

          {/* مواعيد المراحل */}
          <ResultCard title="مواعيد إكمال المراحل العمرية" accent="gold">
            <div className="divide-y divide-yellow-100">
              {milestones.map((m) => {
                const targetYear = birth.year;
                let targetMonth = birth.month + m.months;
                let targetYearAdjusted = targetYear;
                while (targetMonth > 12) {
                  targetMonth -= 12;
                  targetYearAdjusted += 1;
                }
                const maxDay = daysInMonth(targetYearAdjusted, targetMonth);
                const targetDay = Math.min(birth.day, maxDay);
                const targetDate = { year: targetYearAdjusted, month: targetMonth, day: targetDay };
                const reached = ageInMonths >= m.months;
                const today = inputToDate(todayInput());
                const target = inputToDate(targetDate);
                const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86400000);

                return (
                  <div key={m.months} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="font-semibold text-slate-800">{m.label}</div>
                    <div className="text-slate-600">
                      {targetDate.day} {getMonthNameAr(targetDate.month)} {targetDate.year}
                    </div>
                    <div className={`text-xs font-semibold ${reached ? 'text-green-600' : 'text-orange-600'}`}>
                      {reached ? '✓ مكتمل' : `متبقٍ ${daysLeft} يوم`}
                    </div>
                  </div>
                );
              })}
            </div>
          </ResultCard>

          <p className="text-xs text-slate-500 text-center">
            * هذه الأداة لحساب الوقت فقط، وليست أداة لتقييم النمو أو التشخيص الطبي. استشر طبيب الأطفال لأي قلق.
          </p>
        </>
      )}
    </div>
  );
}
