// src/app/tools/age-calculator/components/AgeCalculator.tsx
'use client';

import { useAgeCalculator } from '../hooks/useAgeCalculator';
import { BasicAgeTab } from './BasicAgeTab';
import { AgeAtDateTab } from './AgeAtDateTab';
import { BirthdayTab } from './BirthdayTab';
import { HijriTab } from './HijriTab';
import { AgeDiffTab } from './AgeDiffTab';
import { ChildAgeTab } from './ChildAgeTab';
import { MilestonesTab } from './MilestonesTab';
import { StatsTab } from './StatsTab';
import type { TabKey } from '../lib/types';

interface TabDef {
  key: TabKey;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: 'basic',      label: 'الأساسية',    icon: '🎂' },
  { key: 'at-date',    label: 'تاريخ محدد',  icon: '📅' },
  { key: 'birthday',   label: 'عيد الميلاد', icon: '🎉' },
  { key: 'hijri',      label: 'هجري',        icon: '🌙' },
  { key: 'diff',       label: 'فرق العمر',   icon: '👥' },
  { key: 'child',      label: 'الأطفال',     icon: '👶' },
  { key: 'milestones', label: 'محطات',       icon: '🏆' },
  { key: 'stats',      label: 'إحصائيات',    icon: '📊' },
];

export function AgeCalculator() {
  const hook = useAgeCalculator();
  const { activeTab, setActiveTab, resetAll } = hook;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4" dir="rtl">
      {/* شريط علوي */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎂</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            حاسبة العمر الذكية
          </h2>
          <span className="hidden sm:inline-block text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
            Pro
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs text-slate-500">
            🔒 حساب محلي — بياناتك لا تُرفع
          </span>
          <button
            type="button"
            onClick={resetAll}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700 transition"
          >
            ↺ إعادة تعيين
          </button>
        </div>
      </div>

      {/* شريط التبويبات */}
      <div className="rounded-2xl bg-white border border-slate-200 p-1 shadow-sm overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition
                  ${isActive
                    ? 'bg-gradient-to-b from-yellow-400 to-yellow-500 text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-yellow-50 hover:text-yellow-700'}
                `}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* محتوى التبويب النشط */}
      <div className="min-h-[400px]">
        {activeTab === 'basic'      && <BasicAgeTab hook={hook} />}
        {activeTab === 'at-date'    && <AgeAtDateTab hook={hook} />}
        {activeTab === 'birthday'   && <BirthdayTab hook={hook} />}
        {activeTab === 'hijri'      && <HijriTab hook={hook} />}
        {activeTab === 'diff'       && <AgeDiffTab hook={hook} />}
        {activeTab === 'child'      && <ChildAgeTab hook={hook} />}
        {activeTab === 'milestones' && <MilestonesTab hook={hook} />}
        {activeTab === 'stats'      && <StatsTab hook={hook} />}
      </div>

      {/* تذييل */}
      <p className="text-xs text-center text-slate-400 pt-2">
        جميع الحسابات تُنفّذ داخل متصفحك — لا يتم إرسال تاريخ ميلادك إلى أي خادم.
      </p>
    </div>
  );
}
