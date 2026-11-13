'use client';

import Link from 'next/link';
import { ArrowRight, ArrowLeftRight, Check, X } from 'lucide-react';
import { faqQuestions } from './faq-data';

const comparisonData = [
  { aspect: 'الأساس', hijri: 'قمري (دورة القمر)', gregorian: 'شمسي (دورة الأرض)' },
  { aspect: 'عدد أيام السنة', hijri: '354 أو 355 يوماً', gregorian: '365 أو 366 يوماً' },
  { aspect: 'عدد أشهر السنة', hijri: '12 شهراً', gregorian: '12 شهراً' },
  { aspect: 'عدد أيام الشهر', hijri: '29 أو 30 يوماً', gregorian: '28-31 يوماً' },
  { aspect: 'التقويم الرسمي في', hijri: 'السعودية', gregorian: 'معظم دول العالم' },
  { aspect: 'الأشهر الحرم', hijri: '4 أشهر (محرم، رجب، ذو القعدة، ذو الحجة)', gregorian: 'لا يوجد' },
  { aspect: 'بداية السنة', hijri: 'محرم', gregorian: 'يناير' },
  { aspect: 'الاستخدام الأساسي', hijri: 'العبادات والمناسبات الإسلامية', gregorian: 'المعاملات المدنية والعلمية' },
  { aspect: 'رأس السنة', hijri: '1 محرم', gregorian: '1 يناير' },
  { aspect: 'التأثير السنوي', hijri: 'يتقدم 11 يوماً كل سنة', gregorian: 'ثابت' },
];

const relatedTools = [
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه + تقويم شهري.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالتقويمين.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '📅' },
  { title: 'الأشهر الهجرية', description: 'دليل شامل للأشهر الهجرية.', href: '/tools/hijri-to-gregorian/months', icon: '📆' },
  { title: 'التقويم الهجري 1447', description: 'تقويم كامل للسنة 1447 هـ.', href: '/tools/hijri-to-gregorian/1447', icon: '🗓️' },
];

export default function ComparisonPage() {
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
          <span className="text-slate-700">مقارنة التقويمين</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
            <ArrowLeftRight size={16} />
            مقارنة شاملة
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            الفرق بين التقويم الهجري والميلادي
          </h1>
          <p className="mt-4 text-slate-600">
            قارن بين التقويمين الهجري والميلادي: الأساس، عدد الأيام، الأشهر، والاستخدامات.
          </p>
        </header>

        {/* جدول المقارنة */}
        <div className="mb-10 overflow-hidden rounded-2xl border-2 border-amber-200 bg-white shadow-sm">
          <div className="bg-amber-500 text-white p-4">
            <h2 className="text-lg font-bold">مقارنة بين التقويمين</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-amber-900">
                <tr>
                  <th className="text-right p-3 font-bold">الجانب</th>
                  <th className="text-right p-3 font-bold">التقويم الهجري</th>
                  <th className="text-right p-3 font-bold">التقويم الميلادي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonData.map((row, i) => (
                  <tr key={i} className="hover:bg-amber-50/30 transition">
                    <td className="p-3 font-bold text-slate-900">{row.aspect}</td>
                    <td className="p-3 text-slate-700">{row.hijri}</td>
                    <td className="p-3 text-slate-700">{row.gregorian}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEO CONTENT */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هو الفرق الجوهري بين التقويمين؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                الفرق الجوهري هو أن <strong>التقويم الهجري قمري</strong> يعتمد على دورة القمر (29.5 يوماً لكل شهر)، بينما <strong>التقويم الميلادي شمسي</strong> يعتمد على دورة الأرض حول الشمس (365.25 يوماً).
              </p>
              <p>
                هذا الفرق يجعل السنة الهجرية أقصر من الميلادية بـ 11 يوماً. هذا يعني أن المناسبات الإسلامية (مثل رمضان) تتقدم 11 يوماً كل سنة ميلادية.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">لماذا يختلف عدد أيام الشهر الهجري؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                الشهر الهجري يعتمد على <strong>رؤية الهلال</strong>. إذا رُئي الهلال في الليلة 29، يكون الشهر 29 يوماً. إذا لم يُرَ، يكون 30 يوماً.
              </p>
              <p>
                هذا يختلف عن التقويم الميلادي حيث الأشهر ثابتة تقريباً (يناير 31 يوماً، فبراير 28/29 يوماً، إلخ).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">أيهما أدق: الهجري أم الميلادي؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                لا يمكن القول إن أحدهما "أدق" من الآخر. كلاهما دقيق في مجاله:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                  <p className="font-bold text-emerald-900 mb-1">التقويم الهجري</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-emerald-800">
                    <li>دقيق للعبادات (الصيام، الحج)</li>
                    <li>دقيق للمناسبات الإسلامية</li>
                    <li>معتمد رسمياً في السعودية</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                  <p className="font-bold text-blue-900 mb-1">التقويم الميلادي</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-blue-800">
                    <li>دقيق للأغراض العلمية</li>
                    <li>دقيق للمعاملات المدنية</li>
                    <li>معتمد دولياً</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد تحويل تاريخ بين التقويمين؟</h2>
            <p className="text-amber-50 leading-8 mb-5 max-w-2xl mx-auto">
              استخدم محول التاريخ الكامل لتحويل أي تاريخ بين الهجري والميلادي بدقة، أو اعرف تاريخ اليوم.
            </p>
            <Link href="/tools/hijri-to-gregorian" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-amber-700 transition hover:bg-amber-50">
              محول التاريخ الكامل <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول الفرق بين التقويمين</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-amber-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition group-open:rotate-45">+</span>
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
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-amber-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-amber-600">استخدام الأداة <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </section>

        </article>

      </div>
    </main>
  );
}