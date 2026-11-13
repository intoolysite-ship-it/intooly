'use client';

import { useState, useMemo } from 'react';
import { Plus, Minus, Copy, Check, Calendar, RefreshCw } from 'lucide-react';
import {
  HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS,
  hijriToGregorian, gregorianToHijri,
  MIN_HIJRI_YEAR, MAX_HIJRI_YEAR,
  MIN_GREGORIAN_YEAR, MAX_GREGORIAN_YEAR,
} from '@/lib/hijri/convert';

type Direction = 'gregorian' | 'hijri';

export default function AddSubtractDays() {
  const [direction, setDirection] = useState<Direction>('gregorian');
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [copied, setCopied] = useState(false);

  const today = new Date();

  // تاريخ البداية
  const [gYear, setGYear] = useState(today.getFullYear());
  const [gMonth, setGMonth] = useState(today.getMonth() + 1);
  const [gDay, setGDay] = useState(today.getDate());
  const [hYear, setHYear] = useState(1447);
  const [hMonth, setHMonth] = useState(1);
  const [hDay, setHDay] = useState(1);

  // القيم المضافة/المطروحة
  const [addDays, setAddDays] = useState(0);
  const [addMonths, setAddMonths] = useState(0);
  const [addYears, setAddYears] = useState(0);

  const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

  // النتيجة
  const result = useMemo(() => {
    try {
      const sign = operation === 'add' ? 1 : -1;

      if (direction === 'gregorian') {
        const date = new Date(gYear, gMonth - 1, gDay);
        date.setFullYear(date.getFullYear() + sign * addYears);
        date.setMonth(date.getMonth() + sign * addMonths);
        date.setDate(date.getDate() + sign * addDays);

        const newG = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
        const newHResult = gregorianToHijri(newG);
        const newH = newHResult.hijri;
        const dayOfWeek = ARABIC_DAYS[date.getDay()];

        return {
          success: true,
          gregorian: newG,
          hijri: newH,
          dayOfWeek,
          gregorianText: `${newG.day} ${GREGORIAN_MONTHS[newG.month - 1]} ${newG.year} م`,
          hijriText: newH ? `${newH.day} ${HIJRI_MONTHS[newH.month - 1]} ${newH.year} هـ` : '',
        };
      } else {
        // هجري: نحول إلى ميلادي، نضيف، ثم نعود
        const startG = hijriToGregorian({ year: hYear, month: hMonth, day: hDay });
        if (!startG.success || !startG.gregorian) {
          return { success: false, error: 'تاريخ هجري غير صالح' };
        }
        const date = new Date(startG.gregorian.year, startG.gregorian.month - 1, startG.gregorian.day);
        date.setFullYear(date.getFullYear() + sign * addYears);
        date.setMonth(date.getMonth() + sign * addMonths);
        date.setDate(date.getDate() + sign * addDays);

        const newG = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
        const newHResult = gregorianToHijri(newG);
        const newH = newHResult.hijri;
        const dayOfWeek = ARABIC_DAYS[date.getDay()];

        return {
          success: true,
          gregorian: newG,
          hijri: newH,
          dayOfWeek,
          gregorianText: `${newG.day} ${GREGORIAN_MONTHS[newG.month - 1]} ${newG.year} م`,
          hijriText: newH ? `${newH.day} ${HIJRI_MONTHS[newH.month - 1]} ${newH.year} هـ` : '',
        };
      }
    } catch (e) {
      return { success: false, error: 'خطأ في الحساب' };
    }
  }, [direction, operation, gYear, gMonth, gDay, hYear, hMonth, hDay, addDays, addMonths, addYears]);

  const copyResult = () => {
    if (!result.success) return;
    const text = `${result.hijriText}\n${result.gregorianText}\n${result.dayOfWeek}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const fillToday = () => {
    const h = gregorianToHijri({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() });
    setGYear(today.getFullYear());
    setGMonth(today.getMonth() + 1);
    setGDay(today.getDate());
    if (h.hijri) {
      setHYear(h.hijri.year);
      setHMonth(h.hijri.month);
      setHDay(h.hijri.day);
    }
  };

  const reset = () => {
    setAddDays(0);
    setAddMonths(0);
    setAddYears(0);
  };

  const gYearOptions = Array.from({ length: MAX_GREGORIAN_YEAR - MIN_GREGORIAN_YEAR + 1 }, (_, i) => MIN_GREGORIAN_YEAR + i);
  const hYearOptions = Array.from({ length: MAX_HIJRI_YEAR - MIN_HIJRI_YEAR + 1 }, (_, i) => MIN_HIJRI_YEAR + i);

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Plus size={20} className="text-indigo-600" />
        <h3 className="font-bold text-lg text-indigo-900">إضافة / طرح أيام وشهور وسنوات</h3>
      </div>

      {/* التبديل */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setDirection('gregorian')}
          className={`flex-1 rounded-xl border-2 py-2 px-3 text-sm font-bold transition ${direction === 'gregorian' ? 'border-indigo-500 bg-indigo-100 text-indigo-800' : 'border-slate-200 bg-white text-slate-600'}`}
        >
          تاريخ ميلادي
        </button>
        <button
          onClick={() => setDirection('hijri')}
          className={`flex-1 rounded-xl border-2 py-2 px-3 text-sm font-bold transition ${direction === 'hijri' ? 'border-indigo-500 bg-indigo-100 text-indigo-800' : 'border-slate-200 bg-white text-slate-600'}`}
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

      {/* التاريخ الأساسي */}
      <div className="bg-white rounded-xl p-3 border border-indigo-200 mb-3">
        <p className="text-xs font-bold text-indigo-800 mb-2">التاريخ</p>
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

      {/* العملية */}
      <div className="bg-white rounded-xl p-3 border border-indigo-200 mb-3">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setOperation('add')}
            className={`flex-1 rounded-lg py-2 px-3 text-sm font-bold transition ${operation === 'add' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            <Plus size={14} className="inline ml-1" /> إضافة
          </button>
          <button
            onClick={() => setOperation('subtract')}
            className={`flex-1 rounded-lg py-2 px-3 text-sm font-bold transition ${operation === 'subtract' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            <Minus size={14} className="inline ml-1" /> طرح
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-slate-500 block mb-1">أيام</label>
            <input
              type="number"
              value={addDays}
              onChange={(e) => setAddDays(Math.max(0, Number(e.target.value)))}
              min={0}
              max={10000}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-bold text-center"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">شهور</label>
            <input
              type="number"
              value={addMonths}
              onChange={(e) => setAddMonths(Math.max(0, Number(e.target.value)))}
              min={0}
              max={120}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-bold text-center"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">سنوات</label>
            <input
              type="number"
              value={addYears}
              onChange={(e) => setAddYears(Math.max(0, Number(e.target.value)))}
              min={0}
              max={100}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-bold text-center"
            />
          </div>
        </div>

        <button
          onClick={reset}
          className="mt-2 w-full text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 font-bold"
        >
          <RefreshCw size={12} /> إعادة تعيين القيم
        </button>
      </div>

      {/* النتيجة */}
      {result.success ? (
        <div className="bg-white rounded-xl p-4 border-2 border-indigo-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-indigo-900">النتيجة</h4>
            <button onClick={copyResult} className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'تم النسخ' : 'نسخ'}
            </button>
          </div>
          <div className="space-y-2 text-center">
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-xs text-indigo-600 font-semibold mb-1">التاريخ الهجري</p>
              <p className="text-lg font-bold text-indigo-900">{result.hijriText}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-semibold mb-1">التاريخ الميلادي</p>
              <p className="text-lg font-bold text-blue-900">{result.gregorianText}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-xs text-slate-500 font-semibold">اسم اليوم</p>
              <p className="font-bold text-slate-900">{result.dayOfWeek}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {result.error || 'خطأ في الحساب'}
        </div>
      )}
    </div>
  );
}