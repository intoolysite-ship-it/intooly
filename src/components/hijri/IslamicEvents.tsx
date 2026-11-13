'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { ISLAMIC_EVENTS, type IslamicEvent } from '@/lib/hijri/events';
import { HIJRI_MONTHS, GREGORIAN_MONTHS, hijriToGregorian } from '@/lib/hijri/convert';

interface EventWithDate extends IslamicEvent {
  gregorianDate: Date | null;
  hijriYear: number;
  daysRemaining: number;
}

function getEventDate(event: IslamicEvent, hijriYear: number): Date | null {
  try {
    const result = hijriToGregorian({ year: hijriYear, month: event.hijriMonth, day: event.hijriDay });
    if (result.success && result.gregorian) {
      return new Date(result.gregorian.year, result.gregorian.month - 1, result.gregorian.day);
    }
    return null;
  } catch {
    return null;
  }
}

function getDaysRemaining(targetDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function IslamicEvents() {
  const [hijriYear] = useState(1447);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const eventsWithDates: EventWithDate[] = useMemo(() => {
    const thisYearEvents: EventWithDate[] = ISLAMIC_EVENTS.map((event) => {
      let gregorianDate = getEventDate(event, hijriYear);
      let daysRemaining = gregorianDate ? getDaysRemaining(gregorianDate) : Infinity;

      if (daysRemaining < 0) {
        const nextYearDate = getEventDate(event, hijriYear + 1);
        if (nextYearDate) {
          gregorianDate = nextYearDate;
          daysRemaining = getDaysRemaining(nextYearDate);
        }
      }

      return {
        ...event,
        gregorianDate,
        hijriYear,
        daysRemaining,
      };
    });

    return thisYearEvents.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [hijriYear]);

  const nextEvent = eventsWithDates[0];

  const countdown = useMemo(() => {
    if (!nextEvent?.gregorianDate) return null;

    const target = new Date(nextEvent.gregorianDate);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isToday: false };
  }, [nextEvent, now]);

  return (
    <div className="rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-teal-600" />
        <h3 className="font-bold text-lg text-teal-900">المناسبات الإسلامية</h3>
      </div>

      {nextEvent && countdown && (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 p-5 text-white shadow-lg">
          <p className="text-xs text-teal-100 font-semibold mb-1">المناسبة القادمة</p>
          <h4 className="text-2xl font-extrabold mb-3">{nextEvent.name}</h4>

          {countdown.isToday ? (
            <p className="text-lg font-bold text-yellow-200">🎉 اليوم! كل عام وأنتم بخير</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur">
                <p className="text-2xl font-extrabold">{countdown.days}</p>
                <p className="text-xs text-teal-100">يوم</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur">
                <p className="text-2xl font-extrabold">{countdown.hours}</p>
                <p className="text-xs text-teal-100">ساعة</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur">
                <p className="text-2xl font-extrabold">{countdown.minutes}</p>
                <p className="text-xs text-teal-100">دقيقة</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2 text-center backdrop-blur">
                <p className="text-2xl font-extrabold">{countdown.seconds}</p>
                <p className="text-xs text-teal-100">ثانية</p>
              </div>
            </div>
          )}

          {nextEvent.gregorianDate && (
            <p className="mt-3 text-xs text-teal-100 text-center">
              {nextEvent.gregorianDate.getDate()} {GREGORIAN_MONTHS[nextEvent.gregorianDate.getMonth()]} {nextEvent.gregorianDate.getFullYear()} م
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {eventsWithDates.slice(0, 8).map((event) => (
          <div key={event.id} className="bg-white rounded-xl p-3 border border-teal-200 hover:border-teal-400 transition">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-bold text-sm text-slate-900">{event.name}</h4>
              {event.isEstimated && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">متوقع</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
                {event.hijriDay} {HIJRI_MONTHS[event.hijriMonth - 1]}
              </span>
              {event.gregorianDate && (
                <span className="font-mono bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded">
                  {event.gregorianDate.getDate()}/{event.gregorianDate.getMonth() + 1}/{event.gregorianDate.getFullYear()}
                </span>
              )}
              {event.daysRemaining >= 0 && event.daysRemaining < 365 && (
                <span className={`font-bold px-2 py-0.5 rounded ${
                  event.daysRemaining === 0
                    ? 'bg-green-100 text-green-700'
                    : event.daysRemaining < 30
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {event.daysRemaining === 0 ? 'اليوم!' : `بعد ${event.daysRemaining} يوم`}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2 flex items-start gap-2">
        <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-5">
          التواريخ المعلّمة بـ "متوقع" تعتمد على رؤية الهلال وقد تختلف بيوم واحد عن التقويم المحلي لكل دولة.
        </p>
      </div>
    </div>
  );
}