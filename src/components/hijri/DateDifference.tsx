'use client';

import { useState, useMemo } from 'react';
import { Calendar, ArrowLeftRight, Clock, Copy, Check } from 'lucide-react';
import {
  HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS,
  hijriToGregorian, gregorianToHijri,
  MIN_HIJRI_YEAR, MAX_HIJRI_YEAR,
  MIN_GREGORIAN_YEAR, MAX_GREGORIAN_YEAR,
  type HijriDate, type GregorianDate,
} from '@/lib/hijri/convert';

type Direction = 'gregorian' | 'hijri';

export default function DateDifference() {
  const [direction, setDirection] = useState<Direction>('gregorian');
  const [copied, setCopied] = useState(false);

  const today = new Date();

  // تاريخ البداية (افتراضي: اليوم)
  const [fromGYear, setFromGYear] = useState(today.getFullYear());
  const [fromGMonth, setFromGMonth] = useState(today.getMonth() + 1);
  const [fromGDay, setFromGDay] = useState(today.getDate());

  // تاريخ النهاية (افتراضي: نفس اليوم)
  const [toGYear, setToGYear] = useState(today.getFullYear());
  const [toGMonth, setToGMonth] = useState(today.getMonth() + 1);
  const [toGDay, setToGDay] = useState(today.getDate());

  // التواريخ الهجرية (مشتقة)
  const todayHijri = gregorianToHijri({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() });
  const [fromHYear, setFromHYear] = useState(todayHijri.hijri?.year || 1447);
  const [fromHMonth, setFromHMonth] = useState(todayHijri.hijri?.month || 1);
  const [fromHDay, setFromHDay] = useState(todayHijri.hijri?.day || 1);
  const [toHYear, setToHYear] = useState(todayHijri.hijri?.year || 1447);
  const [toHMonth, setToHMonth] = useState(todayHijri.hijri?.month || 1);
  const [toHDay, setToHDay] = useState(todayHijri.hijri?.day || 1);

  const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

  // حساب الفرق
  const result = useMemo(() => {
    try {
      let fromDate: Date;
      let toDate: Date;

      if (direction === 'gregorian') {
        fromDate = new Date(fromGYear, fromGMonth - 1, fromGDay);
        toDate = new Date(toGYear, toGMonth - 1, toGDay);
      } else {
        const fromG = hijriToGregorian({ year: fromHYear, month: fromHMonth, day: fromHDay });
        const toG = hijriToGregorian({ year: toHYear, month: toHMonth, day: toHDay });
        if (!fromG.success || !fromG.gregorian || !toG.success || !toG.gregorian) {
          return { error: 'تاريخ غير صالح' };
        }
        fromDate = new Date(fromG.gregorian.year, fromG.gregorian.month - 1, fromG.gregorian.day);
        toDate = new Date(toG.gregorian.year, toG.gregorian.month - 1, toG.gregorian.day);
      }

      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;

      // حساب السنوات والأشهر والأيام
      let years = toDate.getFullYear() - fromDate.getFullYear();
      let months = toDate.getMonth() - fromDate.getMonth();
      let days = toDate.getDate() - fromDate.getDate();

      if (days < 0) {
        months--;
        const prevMonthDays = new Date(toDate.getFullYear(), toDate.getMonth(), 0).getDate();
        days += prevMonthDays;
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      // تأكد من الترتيب
      if (fromDate > toDate) {
        years = Math.abs(years);
        months = Math.abs(months);
        days = Math.abs(days);
      }

      return {
        years: Math.abs(years),
        months: Math.abs(months),
        days: Math.abs(days),
        totalDays,
        totalWeeks,
        remainingDays,
        totalHours: totalDays * 24,
        totalMinutes: totalDays * 24 * 60,
      };
    } catch (e) {
      return { error: 'خطأ في الحساب' };
    }
  }, [direction, fromGYear, fromGMonth, fromGDay, toGYear, toGMonth, toGDay, fromHYear, fromHMonth, fromHDay, toHYear, toHMonth, toHDay]);

  const copyResult = () => {
    if ('error' in result) return;
    const text = `الفرق: ${result.years} سنة، ${result.months} شهر، ${result.days} يوم\nإجمالي الأيام: ${result.totalDays}\nإجمالي الأسابيع: ${result.totalWeeks} أسبوع و${result.remainingDays} يوم`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const fillToday = () => {
    setFromGYear(today.getFullYear());
    setFromGMonth(today.getMonth() + 1);
    setFromGDay(today.getDate());
    if (todayHijri.hijri) {
      setFromHYear(todayHijri.hijri.year);
      setFromHMonth(todayHijri.hijri.month);
      setFromHDay(todayHijri.hijri.day);
    }
  };

  const gYearOptions = Array.from({ length: MAX_GREGORIAN_YEAR - MIN_GREGORIAN_YEAR + 1 }, (_, i) => MIN_GREGORIAN_YEAR + i);
  const hYearOptions = Array.from({ length: MAX_HIJRI_YEAR - MIN_HIJRI_YEAR + 1 }, (_, i) => MIN_HIJRI_YEAR + i);

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-orange-600" />
        <h3 className="font-bold text-lg text-orange-900">حساب الفرق بين تاريخين</h3>
      </div>

      {/* التبديل */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setDirection('gregorian')}
          className={`flex-1 rounded-xl border-2 py-2 px-3 text-sm font-bold transition ${direction === 'gregorian' ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-600'}`}
        >
          ميلادي
        </button>
        <button
          onClick={() => setDirection('hijri')}
          className={`flex-1 rounded-xl border-2 py-2 px-3 text-sm font-bold transition ${direction === 'hijri' ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-600'}`}
        >
          هجري
        </button>
        <button
          onClick={fillToday}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          اليوم
        </button>
      </div>

      {/* التواريخ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* من */}
        <div className="bg-white rounded-xl p-3 border border-orange-200">
          <p className="text-xs font-bold text-orange-800 mb-2">من تاريخ</p>
          <div className="grid grid-cols-3 gap-2">
            {direction === 'gregorian' ? (
              <>
                <select value={fromGDay} onChange={(e) => setFromGDay(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {Array.from({ length: daysInMonth(fromGYear, fromGMonth) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={fromGMonth} onChange={(e) => setFromGMonth(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {GREGORIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 5)}</option>)}
                </select>
                <select value={fromGYear} onChange={(e) => setFromGYear(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {gYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </>
            ) : (
              <>
                <select value={fromHDay} onChange={(e) => setFromHDay(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={fromHMonth} onChange={(e) => setFromHMonth(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {HIJRI_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 6)}</option>)}
                </select>
                <select value={fromHYear} onChange={(e) => setFromHYear(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {hYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </>
            )}
          </div>
        </div>

        {/* إلى */}
        <div className="bg-white rounded-xl p-3 border border-orange-200">
          <p className="text-xs font-bold text-orange-800 mb-2">إلى تاريخ</p>
          <div className="grid grid-cols-3 gap-2">
            {direction === 'gregorian' ? (
              <>
                <select value={toGDay} onChange={(e) => setToGDay(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {Array.from({ length: daysInMonth(toGYear, toGMonth) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={toGMonth} onChange={(e) => setToGMonth(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {GREGORIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 5)}</option>)}
                </select>
                <select value={toGYear} onChange={(e) => setToGYear(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {gYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </>
            ) : (
              <>
                <select value={toHDay} onChange={(e) => setToHDay(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={toHMonth} onChange={(e) => setToHMonth(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {HIJRI_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 6)}</option>)}
                </select>
                <select value={toHYear} onChange={(e) => setToHYear(Number(e.target.value))} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold">
                  {hYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* النتيجة */}
      {'error' in result ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{result.error}</div>
      ) : (
        <div className="bg-white rounded-xl p-4 border-2 border-orange-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-orange-900">النتيجة</h4>
            <button onClick={copyResult} className="inline-flex items-center gap-1 text-xs font-bold bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'تم النسخ' : 'نسخ'}
            </button>
          </div>
          <div className="text-center mb-3">
            <p className="text-2xl font-extrabold text-orange-900">
              {result.years} سنة، {result.months} شهر، {result.days} يوم
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-orange-50 rounded-lg p-2">
              <p className="text-xs text-slate-500">إجمالي الأيام</p>
              <p className="font-bold text-slate-900">{result.totalDays}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <p className="text-xs text-slate-500">الأسابيع</p>
              <p className="font-bold text-slate-900">{result.totalWeeks} + {result.remainingDays}ي</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <p className="text-xs text-slate-500">الساعات</p>
              <p className="font-bold text-slate-900">{result.totalHours.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <p className="text-xs text-slate-500">الدقائق</p>
              <p className="font-bold text-slate-900">{result.totalMinutes.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}