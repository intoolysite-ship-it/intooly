'use client';

/**
 * 4 بطاقات ملخصة أفقية — تشبه لوحات التحكم الاحترافية.
 * كل بطاقة تعرض: أيقونة + عنوان + رقم كبير + شريط تقدم نسبي.
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
      bar: 'bg-emerald-500',
      icon: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
      icon: 'text-amber-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      bar: 'bg-red-500',
      icon: 'text-red-600',
    },
    sky: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-700',
      bar: 'bg-sky-500',
      icon: 'text-sky-600',
    },
  };

  const c = colors[color];
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4 flex flex-col justify-between`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className={`text-sm font-bold ${c.text}`}>{label}</p>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>

      <div className="flex items-baseline gap-2">
        <p className={`text-3xl font-black ${c.text}`}>{value}</p>
        <span className={`text-xs font-bold ${c.text} opacity-70`}>
          ({percentage}%)
        </span>
      </div>

      <div className="mt-3 w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${c.bar}`}
          style={{ width: `${percentage}%` }}
        />
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
