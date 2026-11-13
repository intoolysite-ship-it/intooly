'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, Calendar, Copy, Check } from 'lucide-react';
import {
  HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS,
  hijriToGregorian, gregorianToHijri,
  MIN_HIJRI_YEAR, MAX_HIJRI_YEAR,
  MIN_GREGORIAN_YEAR, MAX_GREGORIAN_YEAR,
} from '@/lib/hijri/convert';
import { faqQuestions } from './faq-data';

type Direction = 'hijri-to-gregorian' | 'gregorian-to-hijri';

const relatedTools = [
  { title: 'محول التاريخ الكامل', description: 'مع تقويم شهري + مناسبات + حساب عمر.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالتقويمين مباشرة.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '📅' },
  { title: 'تحويل تاريخ الميلاد', description: 'تحويل تاريخ الميلاد بين التقويمين.', href: '/tools/hijri-to-gregorian/birth-date', icon: '🎂' },
  { title: 'مقارنة التقويمين', description: 'الفرق بين التقويم الهجري والميلادي.', href: '/tools/hijri-to-gregorian/comparison', icon: '📊' },
];

export default function DateConverterPage() {
  const [direction, setDirection] = useState<Direction>('hijri-to-gregorian');
  const [copied, setCopied] = useState(false);

  const today = new Date();
  const [hYear, setHYear] = useState(1447);
  const [hMonth, setHMonth] = useState(1);
  const [hDay, setHDay] = useState(1);
  const [gYear, setGYear] = useState(today.getFullYear());
  const [gMonth, setGMonth] = useState(today.getMonth() + 1);
  const [gDay, setGDay] = useState(today.getDate());

  const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

  const result = useMemo(() => {
    try {
      if (direction === 'hijri-to-gregorian') {
        const g = hijriToGregorian({ year: hYear, month: hMonth, day: hDay });
        if (!g.success || !g.gregorian) return { success: false, error: 'تاريخ هجري غير صالح' };
        const date = new Date(g.gregorian.year, g.gregorian.month - 1, g.gregorian.day);
        return {
          success: true,
          hijriText: `${hDay} ${HIJRI_MONTHS[hMonth - 1]} ${hYear} هـ`,
          gregorianText: `${g.gregorian.day} ${GREGORIAN_MONTHS[g.gregorian.month - 1]} ${g.gregorian.year} م`,
          dayOfWeek: ARABIC_DAYS[date.getDay()],
        };
      } else {
        const h = gregorianToHijri({ year: gYear, month: gMonth, day: gDay });
        if (!h.success || !h.hijri) return { success: false, error: 'تاريخ ميلادي غير صالح' };
        const date = new Date(gYear, gMonth - 1, gDay);
        return {
          success: true,
          hijriText: `${h.hijri.day} ${HIJRI_MONTHS[h.hijri.month - 1]} ${h.hijri.year} هـ`,
          gregorianText: `${gDay} ${GREGORIAN_MONTHS[gMonth - 1]} ${gYear} م`,
          dayOfWeek: ARABIC_DAYS[date.getDay()],
        };
      }
    } catch (e) {
      return { success: false, error: 'خطأ في الحساب' };
    }
  }, [direction, hYear, hMonth, hDay, gYear, gMonth, gDay]);

  const swap = () => {
    setDirection(direction === 'hijri-to-gregorian' ? 'gregorian-to-hijri' : 'hijri-to-gregorian');
  };

  const copyResult = () => {
    if (!result.success) return;
    const text = `${result.hijriText} = ${result.gregorianText}\n${result.dayOfWeek}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const gYearOptions = Array.from({ length: MAX_GREGORIAN_YEAR - MIN_GREGORIAN_YEAR + 1 }, (_, i) => MIN_GREGORIAN_YEAR + i);
  const hYearOptions = Array.from({ length: MAX_HIJRI_YEAR - MIN_HIJRI_YEAR + 1 }, (_, i) => MIN_HIJRI_YEAR + i);

  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <nav className="mb-5 text-sm text-slate-500 flex flex-wrap items-center gap-1">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/calculators" className="font-medium transition hover:text-orange-600">الحاسبات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/hijri-to-gregorian" className="font-medium transition hover:text-orange-600">محول التاريخ</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">محول التاريخ المبسط</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
            <Calendar size={16} />
            تحويل فوري
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            محول التاريخ الهجري والميلادي
          </h1>
          <p className="mt-4 text-slate-600">
            حوّل أي تاريخ بين الهجري والميلادي بسرعة. أدخل التاريخ واحصل على النتيجة فوراً مع اسم اليوم.
          </p>
        </header>

        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          {/* التبديل */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setDirection('hijri-to-gregorian')}
              className={`flex-1 rounded-xl border-2 py-2.5 px-3 text-sm font-bold transition ${direction === 'hijri-to-gregorian' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'}`}
            >
              هجري ← ميلادي
            </button>
            <button
              onClick={swap}
              className="rounded-full bg-slate-100 hover:bg-orange-100 p-2.5 text-slate-600 hover:text-orange-700 transition"
              title="تبديل"
            >
              <ArrowLeftRight size={18} />
            </button>
            <button
              onClick={() => setDirection('gregorian-to-hijri')}
              className={`flex-1 rounded-xl border-2 py-2.5 px-3 text-sm font-bold transition ${direction === 'gregorian-to-hijri' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'}`}
            >
              ميلادي ← هجري
            </button>
          </div>

          {/* الإدخال */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {direction === 'hijri-to-gregorian' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select value={hDay} onChange={(e) => setHDay(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-bold">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشهر</label>
                  <select value={hMonth} onChange={(e) => setHMonth(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-bold">
                    {HIJRI_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
                  <select value={hYear} onChange={(e) => setHYear(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-bold">
                    {hYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select value={gDay} onChange={(e) => setGDay(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-bold">
                    {Array.from({ length: daysInMonth(gYear, gMonth) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشهر</label>
                  <select value={gMonth} onChange={(e) => setGMonth(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-bold">
                    {GREGORIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
                  <select value={gYear} onChange={(e) => setGYear(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-bold">
                    {gYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* النتيجة */}
          {result.success ? (
            <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-green-900">النتيجة</p>
                <button onClick={copyResult} className="inline-flex items-center gap-1 rounded-lg bg-green-600 text-white px-2.5 py-1.5 text-xs font-bold hover:bg-green-700 transition">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">هجري</p>
                  <p className="font-bold text-green-900">{result.hijriText}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">ميلادي</p>
                  <p className="font-bold text-slate-900">{result.gregorianText}</p>
                </div>
              </div>
              <p className="text-center text-sm font-bold text-green-700 mt-2">{result.dayOfWeek}</p>
            </div>
          ) : (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{result.error}</div>
          )}
        </div>

        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">محول التاريخ الهجري والميلادي</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                هذا <strong>المحول المبسط</strong> لتحويل التواريخ بين الهجري والميلادي. يعتمد على تقويم أم القرى (المستخدم في السعودية). مناسب للتحويل السريع.
              </p>
              <p>
                إذا كنت تريد ميزات إضافية (تقويم شهري، مناسبات، حساب عمر، فرق بين تاريخين)، استخدم <Link href="/tools/hijri-to-gregorian" className="text-orange-600 font-bold hover:underline">محول التاريخ الكامل</Link>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تستخدم المحول؟</h2>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-8 pr-2">
              <li><strong>اختر الاتجاه:</strong> "هجري ← ميلادي" أو "ميلادي ← هجري".</li>
              <li><strong>أدخل التاريخ:</strong> اليوم، الشهر، السنة من القوائم.</li>
              <li><strong>النتيجة تظهر فوراً:</strong> التاريخ في التقويم الآخر + اسم اليوم.</li>
              <li><strong>انسخ النتيجة:</strong> بضغطة واحدة.</li>
            </ol>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-slate-700 to-slate-900 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد ميزات أكثر؟</h2>
            <p className="text-slate-300 leading-8 mb-5 max-w-2xl mx-auto">
              جرّب محول التاريخ الكامل: تقويم شهري، مناسبات إسلامية، حساب عمر، فرق بين تاريخين، وحاسبة انتهاء الوثائق.
            </p>
            <Link href="/tools/hijri-to-gregorian" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-100">
              محول التاريخ الكامل <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-8 text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">أدوات ذات صلة من Intooly</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-400 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-slate-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-slate-600">استخدام الأداة <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </section>

        </article>

      </div>
    </main>
  );
}