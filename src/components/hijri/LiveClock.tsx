'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Copy, Check, Eye, EyeOff, Calendar } from 'lucide-react';
import { gregorianToHijri, HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS } from '@/lib/hijri/convert';

interface LiveClockProps {
  useArabic?: boolean;
}

function toArabicDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

export default function LiveClock({ useArabic = false }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [use24h, setUse24h] = useState(true);

  // تحديث الساعة كل ثانية
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = useCallback((n: number) => {
    return useArabic ? toArabicDigits(String(n)) : String(n);
  }, [useArabic]);

  if (!now) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      </div>
    );
  }

  // التاريخ الميلادي
  const gYear = now.getFullYear();
  const gMonth = now.getMonth() + 1;
  const gDay = now.getDate();
  const dayOfWeek = ARABIC_DAYS[now.getDay()];

  // التاريخ الهجري
  const hijriResult = gregorianToHijri({ year: gYear, month: gMonth, day: gDay });
  const hijri = hijriResult.hijri;

  // الوقت
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  let suffix = '';
  if (!use24h) {
    suffix = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
  }

  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // النصوص الجاهزة للنسخ
  const hijriText = hijri
    ? `${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]} ${hijri.year} هـ`
    : '';
  const gregorianText = `${gDay} ${GREGORIAN_MONTHS[gMonth - 1]} ${gYear} م`;

  const copyAll = () => {
    const text = `${hijriText}\n${gregorianText}\n${dayOfWeek} - ${timeStr} ${suffix}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!visible) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setVisible(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
        >
          <Eye size={16} /> إظهار التاريخ والساعة
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5 shadow-sm">
      {/* رأس */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-blue-900">
          <Calendar size={20} className="text-blue-600" />
          <h3 className="font-bold">التاريخ والساعة الآن</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUse24h(!use24h)}
            className="text-xs font-bold bg-white px-2 py-1 rounded-lg text-blue-700 hover:bg-blue-100 transition"
            title="تبديل نظام 12/24 ساعة"
          >
            {use24h ? '24 ساعة' : '12 ساعة'}
          </button>
          <button
            onClick={copyAll}
            className="inline-flex items-center gap-1 text-xs font-bold bg-white px-2 py-1 rounded-lg text-blue-700 hover:bg-blue-100 transition"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'تم النسخ!' : 'نسخ'}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition"
            title="إخفاء"
          >
            <EyeOff size={16} />
          </button>
        </div>
      </div>

      {/* التاريخان */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-xl p-3 border border-blue-200">
          <p className="text-xs text-slate-500 font-semibold mb-1">التاريخ الهجري</p>
          <p className="text-lg font-bold text-slate-900 leading-tight">
            {hijri ? formatNumber(hijri.day) : ''} {hijri ? HIJRI_MONTHS[hijri.month - 1] : ''} {hijri ? formatNumber(hijri.year) : ''} هـ
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-blue-200">
          <p className="text-xs text-slate-500 font-semibold mb-1">التاريخ الميلادي</p>
          <p className="text-lg font-bold text-slate-900 leading-tight">
            {formatNumber(gDay)} {GREGORIAN_MONTHS[gMonth - 1]} {formatNumber(gYear)} م
          </p>
        </div>
      </div>

      {/* اليوم والساعة */}
      <div className="bg-white rounded-xl p-3 border border-blue-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{dayOfWeek}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">المنطقة الزمنية: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-blue-600" />
          <span className="text-2xl font-mono font-extrabold text-blue-900 tabular-nums" dir="ltr">
            {formatNumber(hours).padStart(useArabic ? 2 : 2, '0')}:{formatNumber(minutes).padStart(2, '0')}:{formatNumber(seconds).padStart(2, '0')}
          </span>
          {suffix && <span className="text-sm font-bold text-blue-700">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}