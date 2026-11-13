'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Printer, Home } from 'lucide-react';
import { toGregorian, toHijri } from 'hijri-converter';
import { HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS } from '@/lib/hijri/convert';

interface DayCell {
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;
  dayOfWeek: number; // 0=الأحد
  isToday: boolean;
  isValid: boolean;
}

function getHijriMonthDays(hijriYear: number, hijriMonth: number): DayCell[] {
  const days: DayCell[] = [];
  const today = new Date();
  const todayHijri = toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const todayHijriYear = todayHijri.hy;
  const todayHijriMonth = todayHijri.hm;
  const todayHijriDay = todayHijri.hd;

  // نحاول 30 يوماً، نتوقف إذا كان اليوم غير موجود
  for (let day = 1; day <= 30; day++) {
    try {
      const g = toGregorian(hijriYear, hijriMonth, day);
      const date = new Date(g.gy, g.gm - 1, g.gd);
      const isToday = hijriYear === todayHijriYear && hijriMonth === todayHijriMonth && day === todayHijriDay;
      days.push({
        hijriDay: day,
        hijriMonth,
        hijriYear,
        gregorianDay: g.gd,
        gregorianMonth: g.gm,
        gregorianYear: g.gy,
        dayOfWeek: date.getDay(),
        isToday,
        isValid: true,
      });
    } catch {
      // اليوم غير موجود (الشهر 29 يوماً)
      break;
    }
  }
  return days;
}

export default function HijriCalendar() {
  const today = new Date();
  const initialHijri = toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const [hijriYear, setHijriYear] = useState(initialHijri.hy);
  const [hijriMonth, setHijriMonth] = useState(initialHijri.hm);
  const [showGregorian, setShowGregorian] = useState(true);

  const days = useMemo(() => getHijriMonthDays(hijriYear, hijriMonth), [hijriYear, hijriMonth]);

  // تحديد يوم البداية في الأسبوع (0=الأحد)
  const firstDayOfWeek = days[0]?.dayOfWeek ?? 0;
  // عدد الخلايا الفارغة قبل اليوم الأول
  const emptyCells = firstDayOfWeek;

  const prevMonth = () => {
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear(hijriYear - 1);
    } else {
      setHijriMonth(hijriMonth - 1);
    }
  };

  const nextMonth = () => {
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear(hijriYear + 1);
    } else {
      setHijriMonth(hijriMonth + 1);
    }
  };

  const goToToday = () => {
    const h = toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setHijriYear(h.hy);
    setHijriMonth(h.hm);
  };

  const printCalendar = () => {
    window.print();
  };

  // حساب التاريخ الميلادي لبداية ونهاية الشهر
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const rangeText = firstDay && lastDay
    ? `${firstDay.gregorianDay} ${GREGORIAN_MONTHS[firstDay.gregorianMonth - 1]} ${firstDay.gregorianYear} – ${lastDay.gregorianDay} ${GREGORIAN_MONTHS[lastDay.gregorianMonth - 1]} ${lastDay.gregorianYear}`
    : '';

  // خيارات السنوات
  const yearOptions = Array.from({ length: 50 }, (_, i) => 1440 + i);

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6 shadow-sm">
      {/* رأس التقويم */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={22} className="text-emerald-600" />
          <h3 className="font-bold text-lg text-emerald-900">التقويم الهجري</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={goToToday}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs font-bold hover:bg-emerald-700 transition"
          >
            <Home size={14} /> اليوم
          </button>
          <button
            onClick={printCalendar}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white text-emerald-700 border border-emerald-300 px-3 py-2 text-xs font-bold hover:bg-emerald-50 transition print:hidden"
          >
            <Printer size={14} /> طباعة
          </button>
          <label className="inline-flex items-center gap-2 rounded-xl bg-white border border-emerald-300 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-emerald-50 transition print:hidden">
            <input
              type="checkbox"
              checked={showGregorian}
              onChange={(e) => setShowGregorian(e.target.checked)}
              className="accent-emerald-600"
            />
            إظهار الميلادي
          </label>
        </div>
      </div>

      {/* التنقل */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 border border-emerald-200">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-700 transition"
          aria-label="الشهر السابق"
        >
          <ChevronRight size={20} />
        </button>

        <div className="flex gap-2 items-center">
          <select
            value={hijriMonth}
            onChange={(e) => setHijriMonth(Number(e.target.value))}
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-bold text-emerald-900 bg-white cursor-pointer"
          >
            {HIJRI_MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={hijriYear}
            onChange={(e) => setHijriYear(Number(e.target.value))}
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-bold text-emerald-900 bg-white cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y} هـ</option>
            ))}
          </select>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-700 transition"
          aria-label="الشهر التالي"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* نطاق التاريخ الميلادي */}
      <div className="text-center text-xs text-emerald-700 font-semibold mb-3">
        {rangeText} • {days.length} يوم
      </div>

      {/* رأس الأسبوع */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {ARABIC_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-emerald-800 py-2 bg-emerald-100 rounded-lg">
            {d.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* الأيام */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: emptyCells }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[60px] rounded-lg bg-emerald-50/30"></div>
        ))}
        {days.map((day) => (
          <div
            key={day.hijriDay}
            className={`min-h-[60px] rounded-lg p-1.5 text-center flex flex-col items-center justify-center transition border ${
              day.isToday
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md font-bold ring-2 ring-emerald-400'
                : 'bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <span className={`text-base font-bold ${day.isToday ? 'text-white' : 'text-emerald-900'}`}>
              {day.hijriDay}
            </span>
            {showGregorian && (
              <span className={`text-[10px] ${day.isToday ? 'text-emerald-100' : 'text-slate-500'}`}>
                {day.gregorianDay}/{day.gregorianMonth}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* تذييل */}
      <div className="mt-3 text-center text-xs text-emerald-700">
        💡 التقويم يعتمد على تقويم أم القرى. قد تختلف النتيجة بيوم عن الرؤية المحلية.
      </div>
    </div>
  );
}