// src/app/tools/age-calculator/components/ui/ResultCard.tsx
'use client';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  accent?: 'orange' | 'gold' | 'navy';
}

const accentMap = {
  orange: 'border-orange-200 bg-orange-50/50',
  gold: 'border-yellow-200 bg-yellow-50/50',
  navy: 'border-slate-300 bg-slate-50',
};

export function ResultCard({ title, children, icon, accent = 'orange' }: Props) {
  return (
    <div
      className={`rounded-2xl border-2 ${accentMap[accent]} p-4 sm:p-5 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-orange-600">{icon}</span>}
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="text-slate-700">{children}</div>
    </div>
  );
}

interface BigNumberProps {
  value: number | string;
  label: string;
  suffix?: string;
  accent?: 'orange' | 'gold' | 'navy';
}

const bigAccent = {
  orange: 'text-orange-600',
  gold: 'text-yellow-600',
  navy: 'text-slate-800',
};

export function BigNumber({ value, label, suffix, accent = 'orange' }: BigNumberProps) {
  return (
    <div className="text-center">
      <div className={`text-2xl sm:text-3xl font-extrabold ${bigAccent[accent]}`}>
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
        {suffix && <span className="text-sm mr-1 opacity-70">{suffix}</span>}
      </div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
