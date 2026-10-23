'use client';

/**
 * 4 بطاقات ملخصة لنتائج الفحص.
 */

import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface StatsCardsProps {
  passed: number;
  warnings: number;
  errors: number;
  infos: number;
  total: number;
}

interface StatCardProps {
  label: string;
  value: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'amber' | 'red' | 'sky';
}

function StatCard({ label, value, total, icon: Icon, color }: StatCardProps) {
  const colors = {
    green: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
    },
    sky: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-700',
      icon: 'text-sky-600',
    },
  };

  const c = colors[color];
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-bold ${c.text}`}>{label}</p>
          <p className={`text-3xl font-black ${c.text} mt-1`}>{value}</p>
          <p className={`text-[10px] font-semibold ${c.text} opacity-70 mt-0.5`}>
            {percentage}% من {total}
          </p>
        </div>
        <Icon className={`w-6 h-6 ${c.icon} opacity-70`} />
      </div>
    </div>
  );
}

export default function StatsCards({ passed, warnings, errors, infos, total }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="اجتاز" value={passed} total={total} icon={CheckCircle2} color="green" />
      <StatCard label="تحذير" value={warnings} total={total} icon={AlertTriangle} color="amber" />
      <StatCard label="خطأ" value={errors} total={total} icon={XCircle} color="red" />
      <StatCard label="معلومة" value={infos} total={total} icon={Info} color="sky" />
    </div>
  );
}
