'use client';

import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { faqQuestions } from './faq-data';

const HIJRI_MONTHS_DATA = [
  { id: 1, name: 'محرم', meaning: 'سُمي محرماً لأنه من الأشهر الحرم، ويُحرم فيه القتال.', days: '29-30', events: 'يوم عاشوراء (10 محرم)، رأس السنة الهجرية (1 محرم)', sacred: true },
  { id: 2, name: 'صفر', meaning: 'سُمي صفراً لأن ديار العرب كانت تصفر فيه من أهلها للسفر.', days: '29-30', events: 'لا توجد مناسبات دينية رئيسية', sacred: false },
  { id: 3, name: 'ربيع الأول', meaning: 'سُمي ربيعاً لأن العرب كانت ترتبع فيه (تسكن) بعد السفر.', days: '29-30', events: 'المولد النبوي الشريف (12 ربيع الأول)', sacred: false },
  { id: 4, name: 'ربيع الآخر', meaning: 'سُمي ربيعاً آخر لأن العرب كانت ترتبع فيه أيضاً.', days: '29-30', events: 'لا توجد مناسبات دينية رئيسية', sacred: false },
  { id: 5, name: 'جمادى الأولى', meaning: 'سُمي جمادى لأن الماء كان يتجمد فيه من شدة البرد.', days: '29-30', events: 'لا توجد مناسبات دينية رئيسية', sacred: false },
  { id: 6, name: 'جمادى الآخرة', meaning: 'سُمي جمادى الآخرة تمييزاً له عن جمادى الأولى.', days: '29-30', events: 'لا توجد مناسبات دينية رئيسية', sacred: false },
  { id: 7, name: 'رجب', meaning: 'سُمي رجباً لأنه من الأشهر الحرم، وكانوا يترجبون فيه (يعظمونه).', days: '29-30', events: 'الإسراء والمعراج (27 رجب)', sacred: true },
  { id: 8, name: 'شعبان', meaning: 'سُمي شعباناً لأن العرب كانت تتشعب فيه (تتفرق) للغزو.', days: '29-30', events: 'ليلة النصف من شعبان (15 شعبان)', sacred: false },
  { id: 9, name: 'رمضان', meaning: 'سُمي رمضاناً لأنه يرمض فيه الصائم (يشتد الحر).', days: '29-30', events: 'شهر الصيام، ليلة القدر', sacred: false },
  { id: 10, name: 'شوال', meaning: 'سُمي شوالاً لأن الإبل كانت تشول فيه (تقل أذنابها).', days: '29-30', events: 'عيد الفطر (1 شوال)', sacred: false },
  { id: 11, name: 'ذو القعدة', meaning: 'سُمي ذو القعدة لأن العرب كانت تقعد فيه عن السفر للقتال.', days: '29-30', events: 'من الأشهر الحرم', sacred: true },
  { id: 12, name: 'ذو الحجة', meaning: 'سُمي ذو الحجة لأن فيه يؤدى الحج.', days: '29-30', events: 'الحج، يوم عرفة (9)، عيد الأضحى (10)', sacred: true },
];

const relatedTools = [
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه + تقويم شهري.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالهجري والميلادي.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '📅' },
  { title: 'التقويم الهجري 1447', description: 'تقويم كامل للسنة 1447 هـ.', href: '/tools/hijri-to-gregorian/1447', icon: '📆' },
  { title: 'المناسبات الإسلامية', description: 'المناسبات القادمة مع العد التنازلي.', href: '/tools/hijri-to-gregorian/islamic-events', icon: '🎉' },
];

export default function MonthsPage() {
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
          <span className="text-slate-700">الأشهر الهجرية</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
            <Calendar size={16} />
            دليل شامل
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            الأشهر الهجرية بالترتيب
          </h1>
          <p className="mt-4 text-slate-600">
            تعرف على الأشهر الهجرية الاثني عشر بالترتيب، مع معاني أسمائها وعدد أيامها والمناسبات الإسلامية في كل شهر.
          </p>
        </header>

        {/* جدول الأشهر */}
        <div className="mb-10 overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-sm">
          <div className="bg-blue-600 text-white p-4">
            <h2 className="text-lg font-bold">الأشهر الهجرية الاثنا عشر</h2>
            <p className="text-sm text-blue-100 mt-1">مرتبة حسب ترتيبها في التقويم الهجري</p>
          </div>
          <div className="divide-y divide-slate-100">
            {HIJRI_MONTHS_DATA.map((month) => (
              <div key={month.id} className="p-4 hover:bg-blue-50/30 transition">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-extrabold">
                    {month.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-lg text-slate-900">{month.name}</h3>
                      {month.sacred && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">
                          شهر حرام
                        </span>
                      )}
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {month.days} يوم
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-7 mb-2">{month.meaning}</p>
                    <div className="flex items-start gap-1 text-xs">
                      <span className="text-slate-500 font-bold shrink-0">المناسبات:</span>
                      <span className="text-slate-600">{month.events}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SEO CONTENT ===== */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هي الأشهر الهجرية؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>الأشهر الهجرية</strong> هي الأشهر الاثنا عشر التي يتكون منها التقويم الهجري (القمري)، والذي يعتمد على دورة القمر. تُستخدم هذه الأشهر في تحديد المناسبات الإسلامية، وهي التقويم الرسمي في المملكة العربية السعودية.
              </p>
              <p>
                تبدأ السنة الهجرية بشهر <strong>محرم</strong> وتنتهي بشهر <strong>ذو الحجة</strong>. تتكون السنة الهجرية من 354 أو 355 يوماً، أي أقصر من السنة الميلادية بحوالي 11 يوماً.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">أسماء الشهور الهجرية ومعانيها</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                أسماء الأشهر الهجرية لها دلالات تاريخية ولغوية مرتبطة بالعرب قبل الإسلام. بعضها يشير إلى مواسم، وبعضها يشير إلى أوضاع اجتماعية. إليك معانيها:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>محرم:</strong> من الأشهر الحرم، يُحرم فيه القتال.</li>
                <li><strong>صفر:</strong> كانت ديار العرب تصفر (تخلو) فيه من أهلها للسفر.</li>
                <li><strong>ربيع الأول والآخر:</strong> كانت العرب ترتبع فيه (تسكن) بعد السفر.</li>
                <li><strong>جمادى الأولى والآخرة:</strong> كان الماء يتجمد فيه من شدة البرد.</li>
                <li><strong>رجب:</strong> من الأشهر الحرم، وكانوا يعظمونه.</li>
                <li><strong>شعبان:</strong> كانت العرب تتشعب (تتفرق) فيه للغزو.</li>
                <li><strong>رمضان:</strong> يرمض فيه الصائم (يشتد الحر).</li>
                <li><strong>شوال:</strong> كانت الإبل تشول فيه (تقل أذنابها).</li>
                <li><strong>ذو القعدة:</strong> كانت العرب تقعد فيه عن السفر للقتال.</li>
                <li><strong>ذو الحجة:</strong> فيه يؤدى الحج.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">الأشهر الحرم الأربعة</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                من بين الأشهر الهجرية الاثني عشر، هناك <strong>أربعة أشهر حرم</strong> لها مكانة خاصة في الإسلام:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>ذو القعدة</strong> (الشهر 11).</li>
                <li><strong>ذو الحجة</strong> (الشهر 12).</li>
                <li><strong>محرم</strong> (الشهر 1).</li>
                <li><strong>رجب</strong> (الشهر 7).</li>
              </ul>
              <p className="mt-3">
                سُميت حرمةً لأن الله حرّم فيها القتال، ولها مكانة خاصة. قال تعالى: "إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ".
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">المناسبات الإسلامية في الأشهر الهجرية</h2>
            <div className="space-y-2 text-slate-700 leading-8">
              <ul className="list-disc list-inside space-y-2 pr-2">
                <li><strong>محرم:</strong> رأس السنة الهجرية (1 محرم)، يوم عاشوراء (10 محرم).</li>
                <li><strong>ربيع الأول:</strong> المولد النبوي الشريف (12 ربيع الأول).</li>
                <li><strong>رجب:</strong> الإسراء والمعراج (27 رجب).</li>
                <li><strong>شعبان:</strong> ليلة النصف من شعبان (15 شعبان).</li>
                <li><strong>رمضان:</strong> شهر الصيام، ليلة القدر (في العشر الأواخر).</li>
                <li><strong>شوال:</strong> عيد الفطر (1 شوال).</li>
                <li><strong>ذو الحجة:</strong> الحج، يوم عرفة (9)، عيد الأضحى (10).</li>
              </ul>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد تحويل تاريخ إلى هجري؟</h2>
            <p className="text-blue-50 leading-8 mb-5 max-w-2xl mx-auto">
              استخدم محول التاريخ الكامل لتحويل أي تاريخ بين الهجري والميلادي، أو اعرف التاريخ الهجري اليوم، أو احسب الفرق بين تاريخين.
            </p>
            <Link href="/tools/hijri-to-gregorian" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-blue-50">
              محول التاريخ الكامل <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول الأشهر الهجرية</h2>
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
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                    {tool.icon}
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-blue-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-600">
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