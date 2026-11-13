'use client';

import { useState, useMemo } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, Copy, Check } from 'lucide-react';
import {
  HIJRI_MONTHS, GREGORIAN_MONTHS,
  hijriToGregorian, gregorianToHijri,
  MIN_HIJRI_YEAR, MAX_HIJRI_YEAR,
  MIN_GREGORIAN_YEAR, MAX_GREGORIAN_YEAR,
} from '@/lib/hijri/convert';

type Direction = 'gregorian' | 'hijri';

export default function DocumentExpiry() {
  const [direction, setDirection] = useState<Direction>('gregorian');
  const [copied, setCopied] = useState(false);

  const today = new Date();
  const [gYear, setGYear] = useState(today.getFullYear());
  const [gMonth, setGMonth] = useState(today.getMonth() + 1);
  const [gDay, setGDay] = useState(today.getDate());
  const [hYear, setHYear] = useState(1447);
  const [hMonth, setHMonth] = useState(1);
  const [hDay, setHDay] = useState(1);

  const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

  const result = useMemo(() => {
    try {
      let expiryDate: Date;

      if (direction === 'gregorian') {
        expiryDate = new Date(gYear, gMonth - 1, gDay);
      } else {
        const g = hijriToGregorian({ year: hYear, month: hMonth, day: hDay });
        if (!g.success || !g.gregorian) {
          return { success: false, error: 'تاريخ هجري غير صالح' };
        }
        expiryDate = new Date(g.gregorian.year, g.gregorian.month - 1, g.gregorian.day);
      }

      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffTime = expiryDate.getTime() - todayMidnight.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const hijriResult = gregorianToHijri({
        year: expiryDate.getFullYear(),
        month: expiryDate.getMonth() + 1,
        day: expiryDate.getDate(),
      });

      let status: 'expired' | 'critical' | 'warning' | 'safe';
      if (daysRemaining < 0) status = 'expired';
      else if (daysRemaining <= 7) status = 'critical';
      else if (daysRemaining <= 30) status = 'warning';
      else status = 'safe';

      return {
        success: true,
        expiryDate,
        daysRemaining,
        status,
        gregorianText: `${expiryDate.getDate()} ${GREGORIAN_MONTHS[expiryDate.getMonth()]} ${expiryDate.getFullYear()} م`,
        hijriText: hijriResult.hijri
          ? `${hijriResult.hijri.day} ${HIJRI_MONTHS[hijriResult.hijri.month - 1]} ${hijriResult.hijri.year} هـ`
          : '',
      };
    } catch (e) {
      return { success: false, error: 'خطأ في الحساب' };
    }
  }, [direction, gYear, gMonth, gDay, hYear, hMonth, hDay]);

  const fillToday = () => {
    setGYear(today.getFullYear());
    setGMonth(today.getMonth() + 1);
    setGDay(today.getDate());
    const h = gregorianToHijri({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() });
    if (h.hijri) {
      setHYear(h.hijri.year);
      setHMonth(h.hijri.month);
      setHDay(h.hijri.day);
    }
  };

  const copyResult = () => {
    if (!result.success) return;
    const text = `تاريخ الانتهاء: ${result.gregorianText} / ${result.hijriText}\nالأيام المتبقية: ${result.daysRemaining}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const gYearOptions = Array.from({ length: MAX_GREGORIAN_YEAR - MIN_GREGORIAN_YEAR + 1 }, (_, i) => MIN_GREGORIAN_YEAR + i);
  const hYearOptions = Array.from({ length: MAX_HIJRI_YEAR - MIN_HIJRI_YEAR + 1 }, (_, i) => MIN_HIJRI_YEAR + i);

  const statusConfig = {
    expired: { color: 'bg-red-100 border-red-300 text-red-900', icon: AlertTriangle, iconColor: 'text-red-600', label: 'منتهية!' },
    critical: { color: 'bg-red-50 border-red-200 text-red-900', icon: AlertTriangle, iconColor: 'text-red-600', label: 'قريبة جداً' },
    warning: { color: 'bg-amber-50 border-amber-200 text-amber-900', icon: Clock, iconColor: 'text-amber-600', label: 'قريبة' },
    safe: { color: 'bg-green-50 border-green-200 text-green-900', icon: CheckCircle, iconColor: 'text-green-600', label: 'سارية' },
  };

  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={20} className="text-rose-600" />
        <h3 className="font-bold text-lg text-rose-900">حاسبة انتهاء الوثائق</h3>
      </div>

      <p className="text-xs text-rose-700 mb-3 leading-6">
        احسب الأيام المتبقية حتى انتهاء وثيقة (إقامة، جواز سفر، رخصة، عقد...).
      </p>

      {/* التبديل */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setDirection('gregorian')}
          className={`flex-1 rounded-xl border-2 py-2 px-3 text-sm font-bold transition ${direction === 'gregorian' ? 'border-rose-500 bg-rose-100 text-rose-800' : 'border-slate-200 bg-white text-slate-600'}`}
        >
          تاريخ ميلادي
        </button>
        <button
          onClick={() => setDirection('hijri')}
          className={`flex-1 rounded-xl border-2 py-2 px-3 text-sm font-bold transition ${direction === 'hijri' ? 'border-rose-500 bg-rose-100 text-rose-800' : 'border-slate-200 bg-white text-slate-600'}`}
        >
          تاريخ هجري
        </button>
        <button
          onClick={fillToday}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          اليوم
        </button>
      </div>

      {/* التاريخ */}
      <div className="bg-white rounded-xl p-3 border border-rose-200 mb-3">
        <p className="text-xs font-bold text-rose-800 mb-2">تاريخ انتهاء الوثيقة</p>
        <div className="grid grid-cols-3 gap-2">
          {direction === 'gregorian' ? (
            <>
              <select value={gDay} onChange={(e) => setGDay(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                {Array.from({ length: daysInMonth(gYear, gMonth) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={gMonth} onChange={(e) => setGMonth(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                {GREGORIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 5)}</option>)}
              </select>
              <select value={gYear} onChange={(e) => setGYear(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                {gYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          ) : (
            <>
              <select value={hDay} onChange={(e) => setHDay(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={hMonth} onChange={(e) => setHMonth(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                {HIJRI_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 6)}</option>)}
              </select>
              <select value={hYear} onChange={(e) => setHYear(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                {hYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {/* النتيجة */}
      {result.success ? (
        <div className={`rounded-xl p-4 border-2 ${statusConfig[result.status as keyof typeof statusConfig].color}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = statusConfig[result.status as keyof typeof statusConfig].icon;
                return <Icon size={20} className={statusConfig[result.status as keyof typeof statusConfig].iconColor} />;
              })()}
              <h4 className="font-bold">{statusConfig[result.status as keyof typeof statusConfig].label}</h4>
            </div>
            <button onClick={copyResult} className="inline-flex items-center gap-1 text-xs font-bold bg-white px-2 py-1 rounded-lg hover:bg-slate-50 transition">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'تم النسخ' : 'نسخ'}
            </button>
          </div>

          <div className="text-center mb-3">
            {result.status === 'expired' ? (
              <p className="text-2xl font-extrabold text-red-700">
                منتهية منذ {Math.abs(result.daysRemaining)} يوم
              </p>
            ) : (
              <p className="text-3xl font-extrabold text-slate-900">
                {result.daysRemaining} <span className="text-base">يوم متبقٍ</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-slate-500 mb-1">ميلادي</p>
              <p className="font-bold text-slate-900">{result.gregorianText}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-slate-500 mb-1">هجري</p>
              <p className="font-bold text-slate-900">{result.hijriText}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {result.error}
        </div>
      )}
    </div>
  );
}