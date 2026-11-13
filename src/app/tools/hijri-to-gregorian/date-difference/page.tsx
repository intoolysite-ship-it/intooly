'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Info } from 'lucide-react';
import DateDifference from '@/components/hijri/DateDifference';
import { faqQuestions } from './faq-data';

const relatedTools = [
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه + تقويم شهري + مناسبات.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'حساب العمر بالهجري', description: 'احسب عمرك بالتقويم الهجري والميلادي.', href: '/tools/hijri-to-gregorian/age-calculator', icon: '🎂' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالهجري والميلادي مباشرة.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '📅' },
  { title: 'إضافة/طرح أيام', description: 'أضف أو اطرح أياماً من تاريخ.', href: '/tools/hijri-to-gregorian/add-days', icon: '➕' },
];

export default function DateDifferencePage() {
  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-5 text-sm text-slate-500 flex flex-wrap items-center gap-1">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/calculators" className="font-medium transition hover:text-orange-600">الحاسبات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/hijri-to-gregorian" className="font-medium transition hover:text-orange-600">محول التاريخ</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">الفرق بين تاريخين</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Calendar size={16} />
            هجري + ميلادي
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            حساب الفرق بين تاريخين
          </h1>
          <p className="mt-4 text-slate-600">
            احسب الفرق بين أي تاريخين بالسنوات والأشهر والأيام، أو إجمالي الأيام والأسابيع. يدعم التقويم الهجري والميلادي.
          </p>
        </header>

        {/* الأداة */}
        <div className="mb-6">
          <DateDifference />
        </div>

        {/* ===== SEO CONTENT ===== */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هو حساب الفرق بين تاريخين؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>حساب الفرق بين تاريخين</strong> هو أداة تحسب المدة الزمنية الفاصلة بين تاريخين (بداية ونهاية). تُستخدم في كثير من المجالات: حساب مدة العقد، حساب الأيام المتبقية لمشروع، حساب المدة بين حدثين تاريخيين، وغيرها.
              </p>
              <p>
                يمكن استخدام الحاسبة لمعرفة:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li>الفرق بالسنوات والأشهر والأيام.</li>
                <li>إجمالي الأيام بين التاريخين.</li>
                <li>إجمالي الأسابيع.</li>
                <li>إجمالي الساعات والدقائق.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تحسب الفرق بين تاريخين؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <ol className="list-decimal list-inside space-y-2 pr-2">
                <li><strong>اختر نوع التقويم:</strong> هجري أو ميلادي.</li>
                <li><strong>أدخل تاريخ البداية:</strong> اليوم والشهر والسنة.</li>
                <li><strong>أدخل تاريخ النهاية:</strong> اليوم والشهر والسنة.</li>
                <li><strong>اطلع على النتيجة:</strong> الفرق بالسنوات والأشهر والأيام، مع إجمالي الأيام والأسابيع.</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">استخدامات حساب الفرق بين تاريخين</h2>
            <div className="space-y-2 text-slate-700 leading-8">
              <ul className="list-disc list-inside space-y-2 pr-2">
                <li><strong>حساب مدة العقد:</strong> معرفة المدة الفعلية لعقد الإيجار أو العمل.</li>
                <li><strong>حساب المدة بين حدثين:</strong> مثل مدة الحمل، مدة الدراسة، مدة الخدمة.</li>
                <li><strong>حساب الأيام المتبقية:</strong> لمشروع، لامتحان، لسفر.</li>
                <li><strong>حساب العمر:</strong> الفرق بين تاريخ الميلاد وتاريخ اليوم.</li>
                <li><strong>حساب المدة بين تاريخين هجريين:</strong> للوثائق الرسمية في السعودية.</li>
                <li><strong>التخطيط للمشاريع:</strong> حساب المدة بين مراحل المشروع.</li>
                <li><strong>التحقق من الالتزام بالمواعيد:</strong> مقارنة موعد التسليم بالموعد الفعلي.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">الفرق بين التقويم الهجري والميلادي في حساب المدة</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                عندما تحسب الفرق بين تاريخين هجريين، ستجد أن النتيجة <strong>تختلف</strong> عن حساب نفس التاريخين بالميلادي. السبب:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li>السنة الهجرية 354 يوماً، والميلادية 365 يوماً.</li>
                <li>الشهر الهجري 29 أو 30 يوماً، والميلادي 28-31 يوماً.</li>
                <li>لذلك، 30 يوماً هجرياً قد تعادل 29 أو 31 يوماً ميلادياً.</li>
              </ul>
              <p className="mt-3">
                هذا مهم عند حساب المدد القانونية أو الرسمية التي تعتمد تقويماً معيناً.
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد المزيد من أدوات التاريخ؟</h2>
            <p className="text-orange-50 leading-8 mb-5 max-w-2xl mx-auto">
              استخدم محول التاريخ الكامل لتحويل أي تاريخ بين الهجري والميلادي، أو احسب عمرك بالهجري، أو اعرف تاريخ اليوم.
            </p>
            <Link href="/tools/hijri-to-gregorian" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-700 transition hover:bg-orange-50">
              محول التاريخ الكامل <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول الفرق بين تاريخين</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-orange-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition group-open:rotate-45">+</span>
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
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                    {tool.icon}
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-orange-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-600">
                    استخدام الأداة <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>

        </article>

      </div>
    </main>
  );
}