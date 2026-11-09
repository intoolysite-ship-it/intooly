// src/app/tools/age-calculator/components/ui/ResultCard.tsx
'use client';

import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  accent?: 'gold' | 'dark' | 'soft';
}

const accentMap = {
  gold: 'border-yellow-200 bg-yellow-50/60',
  dark: 'border-slate-200 bg-white',
  soft: 'border-slate-100 bg-slate-50',
};

const iconColor = {
  gold: 'text-yellow-600',
  dark: 'text-slate-700',
  soft: 'text-slate-500',
};

export function ResultCard({ title, children, icon, accent = 'gold' }: Props) {
  return (
    <div
      className={`rounded-2xl border-2 ${accentMap[accent]} p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className={iconColor[accent]}>{icon}</span>}
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
  accent?: 'gold' | 'dark' | 'soft';
}

const bigAccent = {
  gold: 'text-yellow-600',
  dark: 'text-slate-800',
  soft: 'text-slate-600',
};

export function BigNumber({ value, label, suffix, accent = 'gold' }: BigNumberProps) {
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
