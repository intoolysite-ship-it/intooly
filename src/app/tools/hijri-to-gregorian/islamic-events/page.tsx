'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import IslamicEvents from '@/components/hijri/IslamicEvents';
import { faqQuestions } from './faq-data';

const relatedTools = [
  { title: 'التقويم الهجري 1447', description: 'تقويم كامل للسنة 1447 هـ.', href: '/tools/hijri-to-gregorian/1447', icon: '📆' },
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه + تقويم شهري.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'الأشهر الهجرية', description: 'دليل شامل للأشهر الهجرية.', href: '/tools/hijri-to-gregorian/months', icon: '📅' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالهجري والميلادي.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '🗓️' },
];

export default function IslamicEventsPage() {
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
          <span className="text-slate-700">المناسبات الإسلامية</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
            <Sparkles size={16} />
            عد تنازلي حي
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            المناسبات الإسلامية 1447
          </h1>
          <p className="mt-4 text-slate-600">
            استعرض المناسبات الإسلامية القادمة مع تواريخها الهجرية والميلادية وعد تنازلي حي.
          </p>
        </header>

        <div className="mb-10">
          <IslamicEvents />
        </div>

        {/* SEO CONTENT */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هي المناسبات الإسلامية؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>المناسبات الإسلامية</strong> هي الأيام والأشهر ذات المكانة الدينية في الإسلام. تُحدد وفق التقويم الهجري، وتشمل:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>رأس السنة الهجرية</strong> (1 محرم).</li>
                <li><strong>يوم عاشوراء</strong> (10 محرم).</li>
                <li><strong>المولد النبوي الشريف</strong> (12 ربيع الأول).</li>
                <li><strong>الإسراء والمعراج</strong> (27 رجب).</li>
                <li><strong>ليلة النصف من شعبان</strong> (15 شعبان).</li>
                <li><strong>شهر رمضان المبارك</strong> (الشهر التاسع).</li>
                <li><strong>ليلة القدر</strong> (العشر الأواخر من رمضان).</li>
                <li><strong>عيد الفطر المبارك</strong> (1 شوال).</li>
                <li><strong>يوم عرفة</strong> (9 ذو الحجة).</li>
                <li><strong>عيد الأضحى المبارك</strong> (10 ذو الحجة).</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">تواريخ المناسبات الإسلامية 1447</h2>
            <div className="space-y-2 text-slate-700 leading-8">
              <p>إليك التواريخ المتوقعة للمناسبات الإسلامية في 1447 (وفق تقويم أم القرى):</p>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-teal-50 text-teal-900">
                    <tr>
                      <th className="text-right p-3 font-bold">المناسبة</th>
                      <th className="text-right p-3 font-bold">التاريخ الهجري</th>
                      <th className="text-right p-3 font-bold">التاريخ الميلادي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="p-3">رأس السنة الهجرية</td><td className="p-3 font-mono">1 محرم 1447</td><td className="p-3 font-mono">26 يونيو 2025</td></tr>
                    <tr><td className="p-3">يوم عاشوراء</td><td className="p-3 font-mono">10 محرم 1447</td><td className="p-3 font-mono">5 يوليو 2025</td></tr>
                    <tr><td className="p-3">المولد النبوي</td><td className="p-3 font-mono">12 ربيع الأول 1447</td><td className="p-3 font-mono">4 سبتمبر 2025</td></tr>
                    <tr><td className="p-3">الإسراء والمعراج</td><td className="p-3 font-mono">27 رجب 1447</td><td className="p-3 font-mono">16 يناير 2026</td></tr>
                    <tr><td className="p-3">ليلة النصف من شعبان</td><td className="p-3 font-mono">15 شعبان 1447</td><td className="p-3 font-mono">3 فبراير 2026</td></tr>
                    <tr><td className="p-3">شهر رمضان</td><td className="p-3 font-mono">1 رمضان 1447</td><td className="p-3 font-mono">19 فبراير 2026</td></tr>
                    <tr><td className="p-3">عيد الفطر</td><td className="p-3 font-mono">1 شوال 1447</td><td className="p-3 font-mono">20 مارس 2026</td></tr>
                    <tr><td className="p-3">يوم عرفة</td><td className="p-3 font-mono">9 ذو الحجة 1447</td><td className="p-3 font-mono">26 مايو 2026</td></tr>
                    <tr><td className="p-3">عيد الأضحى</td><td className="p-3 font-mono">10 ذو الحجة 1447</td><td className="p-3 font-mono">27 مايو 2026</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
                ⚠️ التواريخ المعلّمة بـ "متوقع" تعتمد على رؤية الهلال وقد تختلف بيوم واحد. راجع الجهة الرسمية في بلدك.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">لماذا تتغير تواريخ المناسبات الإسلامية كل عام؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                تتغير تواريخ المناسبات الإسلامية كل عام <strong>مقارنة بالتقويم الميلادي</strong>، لأن:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li>السنة الهجرية 354 يوماً، والميلادية 365 يوماً.</li>
                <li>الفرق 11 يوماً كل سنة.</li>
                <li>لذلك تتقدم المناسبات الإسلامية 11 يوماً كل سنة ميلادية.</li>
                <li>كل 33 سنة ميلادية، تعود المناسبة إلى نفس التاريخ الميلادي تقريباً.</li>
              </ul>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد معرفة تاريخ اليوم؟</h2>
            <p className="text-teal-50 leading-8 mb-5 max-w-2xl mx-auto">
              اعرف التاريخ الهجري اليوم مباشرة، أو استخدم محول التاريخ لتحويل أي تاريخ بين الهجري والميلادي.
            </p>
            <Link href="/tools/hijri-to-gregorian/hijri-today" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-teal-700 transition hover:bg-teal-50">
              التاريخ الهجري اليوم <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول المناسبات الإسلامية</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-teal-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition group-open:rotate-45">+</span>
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
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-teal-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-600">استخدام الأداة <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </section>

        </article>

      </div>
    </main>
  );
}