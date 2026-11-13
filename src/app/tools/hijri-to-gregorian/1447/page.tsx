'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS, hijriToGregorian } from '@/lib/hijri/convert';
import { faqQuestions } from './faq-data';

const YEAR = 1447;

const relatedTools = [
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه + تقويم شهري.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'الأشهر الهجرية', description: 'دليل شامل للأشهر الهجرية.', href: '/tools/hijri-to-gregorian/months', icon: '📆' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالهجري والميلادي.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '📅' },
  { title: 'المناسبات الإسلامية', description: 'المناسبات القادمة مع العد التنازلي.', href: '/tools/hijri-to-gregorian/islamic-events', icon: '🎉' },
];

function getMonthData(hijriYear: number, hijriMonth: number) {
  const days: { hijriDay: number; gregorianDay: number; gregorianMonth: number; gregorianYear: number; dayOfWeek: number }[] = [];
  let firstDayOfWeek = 0;

  for (let day = 1; day <= 30; day++) {
    try {
      const g = hijriToGregorian({ year: hijriYear, month: hijriMonth, day });
      if (!g.success || !g.gregorian) break;
      const date = new Date(g.gregorian.year, g.gregorian.month - 1, g.gregorian.day);
      if (day === 1) firstDayOfWeek = date.getDay();
      days.push({
        hijriDay: day,
        gregorianDay: g.gregorian.day,
        gregorianMonth: g.gregorian.month,
        gregorianYear: g.gregorian.year,
        dayOfWeek: date.getDay(),
      });
    } catch {
      break;
    }
  }
  return { days, firstDayOfWeek };
}

export default function Year1447Page() {
  const [activeMonth, setActiveMonth] = useState<number | null>(1);

  const currentMonthData = useMemo(() => {
    if (activeMonth === null) return null;
    return getMonthData(YEAR, activeMonth);
  }, [activeMonth]);

  const yearOverview = useMemo(() => {
    return HIJRI_MONTHS.map((name, i) => {
      const month = i + 1;
      const start = hijriToGregorian({ year: YEAR, month, day: 1 });
      return {
        name,
        month,
        start: start.success && start.gregorian ? start.gregorian : null,
      };
    });
  }, []);

  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-5 text-sm text-slate-500 flex flex-wrap items-center gap-1">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/calculators" className="font-medium transition hover:text-orange-600">الحاسبات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/hijri-to-gregorian" className="font-medium transition hover:text-orange-600">محول التاريخ</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">التقويم الهجري 1447</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
            <Calendar size={16} />
            تقويم السنة كاملة
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            التقويم الهجري 1447
          </h1>
          <p className="mt-4 text-slate-600">
            استعرض التقويم الهجري 1447 كاملاً، مع التواريخ الميلادية المقابلة لكل يوم. اعرف تواريخ المناسبات الإسلامية.
          </p>
        </header>

        {/* نظرة سريعة على 12 شهراً */}
        <div className="mb-8 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            أشهر السنة 1447 (نظرة عامة)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {yearOverview.map((m) => (
              <button
                key={m.month}
                onClick={() => setActiveMonth(m.month)}
                className={`rounded-xl border-2 p-3 text-right transition ${
                  activeMonth === m.month
                    ? 'border-blue-500 bg-blue-100 shadow-md'
                    : 'border-blue-200 bg-white hover:border-blue-400'
                }`}
              >
                <p className="font-bold text-sm text-blue-900">{m.name}</p>
                {m.start && (
                  <p className="text-xs text-slate-600 mt-1 font-mono">
                    {m.start.day}/{m.start.month}/{m.start.year}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* التقويم الشهري */}
        {activeMonth !== null && currentMonthData && (
          <div className="mb-10 rounded-2xl border-2 border-blue-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveMonth(Math.max(1, activeMonth - 1))}
                  disabled={activeMonth === 1}
                  className="p-2 rounded-lg hover:bg-blue-100 text-blue-700 disabled:opacity-30 transition"
                >
                  <ChevronRight size={20} />
                </button>
                <h2 className="text-xl font-extrabold text-blue-900">
                  {HIJRI_MONTHS[activeMonth - 1]} {YEAR} هـ
                </h2>
                <button
                  onClick={() => setActiveMonth(Math.min(12, activeMonth + 1))}
                  disabled={activeMonth === 12}
                  className="p-2 rounded-lg hover:bg-blue-100 text-blue-700 disabled:opacity-30 transition"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                {currentMonthData.days.length} يوم
              </div>
            </div>

            {/* رأس الأسبوع */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {ARABIC_DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-blue-800 py-2 bg-blue-100 rounded-lg">
                  {d.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* الأيام */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: currentMonthData.firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[70px] rounded-lg bg-blue-50/30"></div>
              ))}
              {currentMonthData.days.map((day) => (
                <div
                  key={day.hijriDay}
                  className="min-h-[70px] rounded-lg p-1.5 text-center flex flex-col items-center justify-center border bg-white border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition"
                >
                  <span className="text-base font-bold text-blue-900">{day.hijriDay}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {day.gregorianDay}/{day.gregorianMonth}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span>التقويم يعتمد على تقويم أم القرى. قد تختلف التواريخ بيوم واحد حسب الرؤية المحلية.</span>
            </div>
          </div>
        )}

        {/* ===== SEO CONTENT ===== */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هو التقويم الهجري 1447؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>التقويم الهجري 1447</strong> هو تقويم السنة الهجرية 1447، والتي تبدأ بشهر محرم 1447 وتنتهي بذي الحجة 1447. يقابلها في التقويم الميلادي تقريباً الفترة من <strong>يونيو 2025 إلى مايو 2026</strong>.
              </p>
              <p>
                تعرض هذه الصفحة التقويم الكامل لكل شهر من أشهر 1447، مع التواريخ الميلادية المقابلة. يمكنك التنقل بين الأشهر لمعرفة تفاصيل كل شهر.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">متى تبدأ السنة الهجرية 1447؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                تبدأ السنة الهجرية 1447 في <strong>1 محرم 1447</strong>، والذي يوافق تقريباً <strong>26 يونيو 2025 م</strong> (وفق تقويم أم القرى). قد يختلف اليوم بيوم واحد في بعض الدول.
              </p>
              <p>
                تنتهي السنة الهجرية 1447 في <strong>29 أو 30 ذو الحجة 1447</strong>، والذي يوافق تقريباً <strong>16 يونيو 2026 م</strong>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">المناسبات الإسلامية في 1447</h2>
            <div className="space-y-2 text-slate-700 leading-8">
              <ul className="list-disc list-inside space-y-2 pr-2">
                <li><strong>رأس السنة الهجرية:</strong> 1 محرم 1447 ≈ 26 يونيو 2025.</li>
                <li><strong>يوم عاشوراء:</strong> 10 محرم 1447 ≈ 5 يوليو 2025.</li>
                <li><strong>المولد النبوي:</strong> 12 ربيع الأول 1447 ≈ 4 سبتمبر 2025.</li>
                <li><strong>الإسراء والمعراج:</strong> 27 رجب 1447 ≈ 16 يناير 2026.</li>
                <li><strong>ليلة النصف من شعبان:</strong> 15 شعبان 1447 ≈ 3 فبراير 2026.</li>
                <li><strong>شهر رمضان:</strong> 1 رمضان 1447 ≈ 19 فبراير 2026.</li>
                <li><strong>عيد الفطر:</strong> 1 شوال 1447 ≈ 20 مارس 2026.</li>
                <li><strong>يوم عرفة:</strong> 9 ذو الحجة 1447 ≈ 26 مايو 2026.</li>
                <li><strong>عيد الأضحى:</strong> 10 ذو الحجة 1447 ≈ 27 مايو 2026.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تستخدم التقويم الهجري 1447؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>يمكنك استخدام هذا التقويم لـ:</p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li>معرفة التواريخ الميلادية المقابلة للتواريخ الهجرية في 1447.</li>
                <li>التخطيط للمناسبات الإسلامية (رمضان، العيدين).</li>
                <li>تحويل تواريخ الوثائق الرسمية.</li>
                <li>معرفة عدد أيام كل شهر هجري.</li>
                <li>معرفة بداية ونهاية كل شهر.</li>
              </ul>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد تحويل تاريخ محدد؟</h2>
            <p className="text-blue-50 leading-8 mb-5 max-w-2xl mx-auto">
              استخدم محول التاريخ الكامل لتحويل أي تاريخ بين الهجري والميلادي، أو اعرف التاريخ الهجري اليوم.
            </p>
            <Link href="/tools/hijri-to-gregorian" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50">
              محول التاريخ الكامل <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول التقويم الهجري 1447</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-blue-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-open:rotate-45">+</span>
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
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-blue-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-600">استخدام الأداة <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </section>

        </article>

      </div>
    </main>
  );
}