// src/app/tools/age-calculator/components/AgeDiffTab.tsx
'use client';

import type { UseAgeCalculatorReturn } from '../hooks/useAgeCalculator';
import { DateInputField } from './ui/DateInputField';
import { ResultCard, BigNumber } from './ui/ResultCard';
import { calculateAge } from '../lib/age';
import { todayInput } from '../lib/validation';

interface Props {
  hook: UseAgeCalculatorReturn;
}

export function AgeDiffTab({ hook }: Props) {
  const {
    birth, setBirth, secondBirth, setSecondBirth,
    birthError, secondBirthError,
    ageDifference,
  } = hook;

  // عمر كل شخص اليوم (مستقل عن الـ reference في الـ hook)
  const today = todayInput();
  const firstAge = !birthError ? calculateAge(birth, today) : null;
  const secondAge = !secondBirthError ? calculateAge(secondBirth, today) : null;

  return (
    <div className="space-y-6">
      {/* المدخلات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">حاسبة فرق العمر</h2>
        <p className="text-sm text-slate-500 mb-4">
          قارن بين تاريخ ميلاد شخصين لمعرفة الفرق بينهما بالسنوات والأشهر والأيام.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInputField
            id="diff-first"
            label="تاريخ ميلاد الشخص الأول"
            value={birth}
            onChange={setBirth}
            error={birthError}
            maxYear={new Date().getFullYear()}
          />
          <DateInputField
            id="diff-second"
            label="تاريخ ميلاد الشخص الثاني"
            value={secondBirth}
            onChange={setSecondBirth}
            error={secondBirthError}
            maxYear={new Date().getFullYear()}
          />
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              const tmp = birth;
              setBirth(secondBirth);
              setSecondBirth(tmp);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            ⇄ تبديل الشخصين
          </button>
        </div>
      </div>

      {/* النتيجة */}
      {ageDifference && !birthError && !secondBirthError && (
        <>
          {/* من الأكبر؟ */}
          <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-md text-center">
            <div className="text-sm font-semibold text-orange-700 mb-2">
              {ageDifference.older === 'equal'
                ? 'الشخصان في نفس العمر'
                : ageDifference.older === 'first'
                ? 'الشخص الأول أكبر سنًا'
                : 'الشخص الثاني أكبر سنًا'}
            </div>
            {ageDifference.older !== 'equal' && (
              <div className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 text-3xl sm:text-4xl font-extrabold text-slate-900">
                <span className="text-orange-600">{ageDifference.years}</span>
                <span className="text-base font-semibold text-slate-600">سنة</span>
                <span className="text-yellow-600">{ageDifference.months}</span>
                <span className="text-base font-semibold text-slate-600">شهر</span>
                <span className="text-slate-800">{ageDifference.days}</span>
                <span className="text-base font-semibold text-slate-600">يوم</span>
              </div>
            )}
          </div>

          {/* إحصاءات الفرق */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard title="إجمالي الأيام" accent="orange">
              <BigNumber value={ageDifference.totalDays} label="يوم" accent="orange" />
            </ResultCard>
            <ResultCard title="إجمالي الأسابيع" accent="gold">
              <BigNumber value={Math.floor(ageDifference.totalDays / 7)} label="أسبوع" accent="gold" />
            </ResultCard>
            <ResultCard title="إجمالي الأشهر" accent="orange">
              <BigNumber value={ageDifference.years * 12 + ageDifference.months} label="شهر" accent="orange" />
            </ResultCard>
            <ResultCard title="إجمالي الساعات" accent="navy">
              <BigNumber value={ageDifference.totalDays * 24} label="ساعة" accent="navy" />
            </ResultCard>
          </div>

          {/* مقارنة العمرين */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ResultCard title="عمر الشخص الأول اليوم" accent="orange">
              {firstAge && (
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-orange-700">
                    {firstAge.years} <span className="text-sm font-semibold text-slate-600">سنة</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {firstAge.months} شهر و{firstAge.days} يوم
                  </div>
                </div>
              )}
            </ResultCard>
            <ResultCard title="عمر الشخص الثاني اليوم" accent="gold">
              {secondAge && (
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-yellow-700">
                    {secondAge.years} <span className="text-sm font-semibold text-slate-600">سنة</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {secondAge.months} شهر و{secondAge.days} يوم
                  </div>
                </div>
              )}
            </ResultCard>
          </div>
        </>
      )}
    </div>
  );
}
