'use client';

import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import AddSubtractDays from '@/components/hijri/AddSubtractDays';
import { faqQuestions } from './faq-data';

const relatedTools = [
  { title: 'الفرق بين تاريخين', description: 'احسب الفرق بين أي تاريخين.', href: '/tools/hijri-to-gregorian/date-difference', icon: '📊' },
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه + تقويم شهري.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالهجري والميلادي.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '📅' },
  { title: 'حساب العمر بالهجري', description: 'احسب عمرك بالتقويم الهجري.', href: '/tools/hijri-to-gregorian/age-calculator', icon: '🎂' },
];

export default function AddDaysPage() {
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
          <span className="text-slate-700">إضافة/طرح أيام</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
            <Plus size={16} />
            حاسبة تواريخ متقدمة
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            إضافة وطرح أيام من التاريخ
          </h1>
          <p className="mt-4 text-slate-600">
            أضف أو اطرح أياماً أو أشهراً أو سنوات من أي تاريخ (هجري أو ميلادي) لمعرفة التاريخ الجديد.
          </p>
        </header>

        <div className="mb-10">
          <AddSubtractDays />
        </div>

        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تحسب التاريخ بعد عدد معين من الأيام؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>إضافة أو طرح أيام من تاريخ</strong> عملية شائعة في الحياة اليومية والمهنية. تحتاجها لحساب:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>تاريخ انتهاء العقد:</strong> إذا وُقّع اليوم لمدة 90 يوماً.</li>
                <li><strong>المواعيد النهائية:</strong> تاريخ تسليم المشروع بعد 30 يوماً.</li>
                <li><strong>موعد السفر:</strong> تاريخ العودة بعد أسبوعين.</li>
                <li><strong>فترة الحمل:</strong> تاريخ الولادة المتوقع بعد 280 يوماً.</li>
                <li><strong>العلاج:</strong> موعد الجرعة القادمة بعد 7 أيام.</li>
                <li><strong>التقاعد:</strong> تاريخ استحقاق المعاش.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">الفرق بين إضافة أيام وإضافة أشهر</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                قد يبدو الأمر بسيطاً، لكن هناك فرق مهم:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>إضافة 30 يوماً:</strong> تاريخ محدد بعد 30 يوماً بالضبط (30 × 24 ساعة).</li>
                <li><strong>إضافة شهر واحد:</strong> قد تكون 28، 29، 30، أو 31 يوماً حسب الشهر.</li>
              </ul>
              <p className="mt-3">
                في العقود الرسمية، يُفضل استخدام الأيام لضمان الدقة. في المعاملات البنكية، قد تُستخدم الأشهر.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">أمثلة عملية</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3">
                <p className="font-bold text-indigo-900 mb-1">مثال 1: عقد إيجار</p>
                <p className="text-sm">بدأ العقد في 1 يناير 2025 لمدة 365 يوماً. تاريخ الانتهاء: 1 يناير 2026 (بعد إضافة 365 يوماً).</p>
              </div>
              <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3">
                <p className="font-bold text-indigo-900 mb-1">مثال 2: موعد طبي</p>
                <p className="text-sm">الجرعة الأولى في 15 نوفمبر 2025. الجرعة التالية بعد 21 يوماً: 6 ديسمبر 2025.</p>
              </div>
              <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3">
                <p className="font-bold text-indigo-900 mb-1">مثال 3: موعد التسليم</p>
                <p className="text-sm">المشروع يبدأ 1 ديسمبر 2025. الموعد النهائي بعد 90 يوماً: 1 مارس 2026.</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد حساب الفرق بين تاريخين؟</h2>
            <p className="text-indigo-50 leading-8 mb-5 max-w-2xl mx-auto">
              استخدم حاسبة الفرق بين تاريخين لمعرفة المدة بين حدثين، أو استخدم محول التاريخ لتحويل أي تاريخ.
            </p>
            <Link href="/tools/hijri-to-gregorian/date-difference" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 transition hover:bg-indigo-50">
              حاسبة الفرق بين تاريخين <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول إضافة/طرح الأيام</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-indigo-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition group-open:rotate-45">+</span>
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
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-indigo-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-indigo-600">استخدام الأداة <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </section>

        </article>

      </div>
    </main>
  );
}