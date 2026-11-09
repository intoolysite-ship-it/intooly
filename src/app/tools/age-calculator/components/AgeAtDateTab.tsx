// src/app/tools/age-calculator/components/AgeAtDateTab.tsx
'use client';

import type { UseAgeCalculatorReturn } from '../hooks/useAgeCalculator';
import { DateInputField } from './ui/DateInputField';
import { ResultCard, BigNumber } from './ui/ResultCard';
import { formatDateAr, getMonthNameAr } from '../lib/age';
import { formatHijriAr, gregorianToHijri } from '../lib/hijri';
import { todayInput, inputToDate } from '../lib/validation';

interface Props {
  hook: UseAgeCalculatorReturn;
}

export function AgeAtDateTab({ hook }: Props) {
  const {
    birth, setBirth, customDate, setCustomDate,
    birthError, customDateError,
    ageAtCustomDate, birthWeekdayAr,
  } = hook;

  const isFuture = inputToDate(customDate).getTime() > inputToDate(todayInput()).getTime();
  const hijriCustom = !customDateError ? gregorianToHijri(customDate) : null;

  return (
    <div className="space-y-6">
      {/* المدخلات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          احسب عمرك في أي تاريخ
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          اختر تاريخًا ماضيًا أو مستقبليًا لمعرفة العمر الذي كنت عليه أو ستبلغه في ذلك اليوم.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInputField
            id="at-date-birth"
            label="تاريخ الميلاد"
            value={birth}
            onChange={setBirth}
            error={birthError}
            maxYear={new Date().getFullYear()}
          />
          <DateInputField
            id="at-date-custom"
            label="التاريخ المطلوب"
            value={customDate}
            onChange={setCustomDate}
            error={customDateError}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <QuickButton label="اليوم" onClick={() => setCustomDate(todayInput())} />
          <QuickButton
            label="بداية السنة القادمة"
            onClick={() => setCustomDate({ year: new Date().getFullYear() + 1, month: 1, day: 1 })}
          />
          <QuickButton
            label="نهاية السنة الحالية"
            onClick={() => setCustomDate({ year: new Date().getFullYear(), month: 12, day: 31 })}
          />
        </div>
      </div>

      {/* النتيجة */}
      {ageAtCustomDate && !birthError && !customDateError ? (
        <>
          <div className="rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 shadow-md">
            <div className="text-center text-sm font-semibold text-yellow-700 mb-2">
              {isFuture ? 'سيكون عمرك في' : 'كان عمرك في'} {formatDateAr(customDate)}
            </div>
            <div className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 text-3xl sm:text-4xl font-extrabold text-slate-900">
              <span className="text-yellow-600">{ageAtCustomDate.years}</span>
              <span className="text-base font-semibold text-slate-600">سنة</span>
              <span className="text-yellow-600">{ageAtCustomDate.months}</span>
              <span className="text-base font-semibold text-slate-600">شهر</span>
              <span className="text-slate-800">{ageAtCustomDate.days}</span>
              <span className="text-base font-semibold text-slate-600">يوم</span>
            </div>
            {hijriCustom && (
              <div className="mt-3 text-xs text-center text-slate-500">
                الموافق {formatHijriAr(hijriCustom)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard title="إجمالي الأيام" accent="gold">
              <BigNumber value={ageAtCustomDate.totalDays} label="يوم" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي الأسابيع" accent="gold">
              <BigNumber value={ageAtCustomDate.totalWeeks} label="أسبوع" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي الأشهر" accent="gold">
              <BigNumber value={ageAtCustomDate.totalMonths} label="شهر" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي السنوات" accent="dark">
              <BigNumber value={ageAtCustomDate.years} label="سنة" accent="dark" />
            </ResultCard>
          </div>
        </>
      ) : (
        !birthError && !customDateError && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center text-red-700">
            <p className="font-semibold">التاريخ المطلوب يسبق تاريخ الميلاد.</p>
            <p className="text-sm mt-1">لا يمكن حساب عمر في تاريخ قبل الولادة.</p>
          </div>
        )
      )}
    </div>
  );
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-semibold rounded-full border border-yellow-300 text-yellow-700 bg-white hover:bg-yellow-50 transition"
    >
      {label}
    </button>
  );
}

