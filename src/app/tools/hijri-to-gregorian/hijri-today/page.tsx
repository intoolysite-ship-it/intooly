'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, ArrowLeft, ChevronDown, Sparkles,
  Copy, Check, Share2, ArrowRight,
} from 'lucide-react';
import { gregorianToHijri, HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS } from '@/lib/hijri/convert';
import { faqQuestions } from './faq-data';

function toArabicDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

const relatedTools = [
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه بين الهجري والميلادي + تقويم شهري + مناسبات.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'حاسبة العمر', description: 'احسب عمرك بالسنوات والأشهر والأيام.', href: '/tools/age-calculator', icon: '🎂' },
  { title: 'الفرق بين تاريخين', description: 'احسب الفرق بين أي تاريخين.', href: '/tools/hijri-to-gregorian/date-difference', icon: '📅' },
  { title: 'الأشهر الهجرية', description: 'قائمة الأشهر الهجرية الاثني عشر.', href: '/tools/hijri-to-gregorian/months', icon: '📆' },
];

export default function HijriTodayPage() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [useArabic, setUseArabic] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const displayValue = (val: string) => useArabic ? toArabicDigits(val) : val;

  if (!mounted || !now) {
    return (
      <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-slate-500">جاري التحميل...</div>
      </main>
    );
  }

  const gYear = now.getFullYear();
  const gMonth = now.getMonth() + 1;
  const gDay = now.getDate();
  const dayOfWeek = ARABIC_DAYS[now.getDay()];

  const hijriResult = gregorianToHijri({ year: gYear, month: gMonth, day: gDay });
  const hijri = hijriResult.hijri;

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const hijriText = hijri ? `${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]} ${hijri.year} هـ` : '';
  const gregorianText = `${gDay} ${GREGORIAN_MONTHS[gMonth - 1]} ${gYear} م`;

  const copyDate = () => {
    const text = `${hijriText}\n${gregorianText}\n${dayOfWeek}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareDate = () => {
    const text = `التاريخ الهجري اليوم: ${hijriText}\nالتاريخ الميلادي: ${gregorianText}\n${dayOfWeek}`;
    if (navigator.share) {
      navigator.share({ title: 'التاريخ الهجري اليوم', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

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
          <span className="text-slate-700">التاريخ الهجري اليوم</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <Sparkles size={16} />
            محدّث تلقائياً
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            التاريخ الهجري اليوم
          </h1>
          <p className="mt-4 text-slate-600">
            اعرف تاريخ اليوم بالتقويم الهجري والميلادي مباشرة، مع اسم اليوم والساعة الحية.
          </p>
        </header>

        {/* البطاقة الرئيسية */}
        <div className="mb-6 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 sm:p-8 shadow-lg">
          {/* التاريخان */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 text-center">
              <p className="text-xs text-slate-500 font-semibold mb-2">التاريخ الهجري</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 leading-tight">
                {hijri ? displayValue(String(hijri.day)) : ''} {hijri ? HIJRI_MONTHS[hijri.month - 1] : ''}
              </p>
              <p className="text-lg font-bold text-emerald-700 mt-1">
                {hijri ? displayValue(String(hijri.year)) : ''} هـ
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 text-center">
              <p className="text-xs text-slate-500 font-semibold mb-2">التاريخ الميلادي</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {displayValue(String(gDay))} {GREGORIAN_MONTHS[gMonth - 1]}
              </p>
              <p className="text-lg font-bold text-slate-700 mt-1">
                {displayValue(String(gYear))} م
              </p>
            </div>
          </div>

          {/* اليوم والساعة */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-emerald-600" />
              <span className="text-lg font-bold text-slate-900">{dayOfWeek}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-emerald-600" />
              <span className="text-2xl font-mono font-extrabold text-emerald-900 tabular-nums" dir="ltr">
                {displayValue(timeStr)}
              </span>
            </div>
          </div>

          {/* أزرار */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              onClick={copyDate}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-emerald-700 transition"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'تم النسخ!' : 'نسخ التاريخ'}
            </button>
            <button
              onClick={shareDate}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-700 border border-emerald-300 px-4 py-2.5 text-sm font-bold hover:bg-emerald-50 transition"
            >
              <Share2 size={16} />
              مشاركة
            </button>
            <button
              onClick={() => setUseArabic(!useArabic)}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-700 border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 transition"
            >
              {useArabic ? '123' : '١٢٣'}
              {useArabic ? ' أرقام إنجليزية' : ' أرقام عربية'}
            </button>
          </div>
        </div>

        {/* CTA للأداة الكاملة */}
        <div className="mb-10 rounded-2xl border border-orange-200 bg-orange-50 p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-bold text-orange-900">هل تريد تحويل تاريخ آخر؟</p>
            <p className="text-sm text-orange-700 mt-1">استخدم محول التاريخ الكامل: تحويل ثنائي الاتجاه + تقويم شهري + مناسبات.</p>
          </div>
          <Link
            href="/tools/hijri-to-gregorian"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-orange-700 transition whitespace-nowrap"
          >
            محول التاريخ <ArrowRight size={16} />
          </Link>
        </div>

        {/* ===== SEO CONTENT ===== */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هو التاريخ الهجري اليوم؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>التاريخ الهجري اليوم</strong> هو التاريخ المعتمد في التقويم الإسلامي، والذي يعتمد على دورة القمر لتحديد بداية كل شهر. يُستخدم التقويم الهجري في تحديد المناسبات الإسلامية مثل رمضان وعيد الفطر وعيد الأضحى، ويُعتمد رسمياً في المملكة العربية السعودية ودول عربية أخرى.
              </p>
              <p>
                تعرض هذه الصفحة <strong>تاريخ اليوم بالهجري والميلادي</strong> مباشرة، مع اسم اليوم والساعة الحية. يتم تحديث التاريخ تلقائياً كل يوم عند منتصف الليل، لذا يمكنك الاعتماد عليه لمعرفة التاريخ الهجري الحالي في أي وقت.
              </p>
              <p>
                يعتمد حساب التاريخ الهجري في هذه الصفحة على <strong>تقويم أم القرى</strong>، وهو التقويم الرسمي المعتمد في المملكة العربية السعودية. قد يختلف التاريخ بيوم أو يومين بين الدول التي تعتمد الرؤية المحلية للهلال.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تعرف التاريخ الهجري اليوم؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                معرفة <strong>تاريخ اليوم الهجري</strong> كانت تتطلب سابقاً الرجوع إلى التقاويم المطبوعة أو السؤال عن بداية الشهر. اليوم، أصبح الأمر أسهل بكثير بفضل الأدوات الرقمية التي تحسب التاريخ الهجري تلقائياً بدقة.
              </p>
              <p>
                في هذه الصفحة، يمكنك رؤية <strong>التاريخ الهجري والميلادي اليوم</strong> في بطاقة واحدة، مع اسم اليوم (السبت، الأحد...). كما يمكنك نسخ التاريخ بضغطة واحدة، أو مشاركته مع الآخرين.
              </p>
              <p>
                إذا كنت بحاجة إلى تحويل تاريخ آخر (مثل تاريخ ميلاد أو موعد مناسبة)، يمكنك استخدام <a href="/tools/hijri-to-gregorian" className="text-orange-600 font-bold hover:underline">محول التاريخ الكامل</a> الذي يدعم التحويل في الاتجاهين.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">أهم استخدامات التاريخ الهجري اليوم</h2>
            <div className="space-y-2 text-slate-700 leading-8">
              <p>معرفة التاريخ الهجري اليوم مفيدة في حالات كثيرة، منها:</p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>الصيام والعبادات:</strong> تحديد أيام الصيام التطوعي (الاثنين والخميس، الأيام البيض، عاشوراء، عرفة).</li>
                <li><strong>المناسبات الإسلامية:</strong> معرفة موعد رمضان، عيد الفطر، عيد الأضحى، والمولد النبوي.</li>
                <li><strong>الوثائق الرسمية:</strong> كثير من الوثائق في السعودية تستخدم التاريخ الهجري (عقود، شهادات، إقامات).</li>
                <li><strong>المعاملات المالية:</strong> بعض البنوك والمؤسسات المالية تستخدم التقويم الهجري في العقود والمواعيد.</li>
                <li><strong>المناسبات العائلية:</strong> تواريخ الميلاد والزواج في بعض الأسر تُسجل بالهجري.</li>
                <li><strong>التقويم الدراسي:</strong> العام الدراسي في السعودية يُخطط وفق التقويم الهجري.</li>
                <li><strong>الرواتب والأجور:</strong> بعض الشركات تصرف الرواتب وفق التقويم الهجري.</li>
                <li><strong>المواعيد الطبية:</strong> بعض المستشفيات تحدد المواعيد بالتاريخ الهجري.</li>
                <li><strong>السفر والحج:</strong> مواعيد الحج والعمرة تعتمد على التقويم الهجري.</li>
                <li><strong>الأحداث التاريخية:</strong> معرفة التواريخ الهجرية للأحداث الإسلامية.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما الفرق بين التقويم الهجري والتقويم الميلادي؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>التقويم الهجري</strong> تقويم قمري يعتمد على دورة القمر، ويتكون من 12 شهراً، ويبلغ طول السنة فيه 354 أو 355 يوماً. أشهره تبدأ من محرم وتنتهي بذي الحجة.
              </p>
              <p>
                <strong>التقويم الميلادي</strong> تقويم شمسي يعتمد على دورة الأرض حول الشمس، وتتكون سنته من 365 يوماً (أو 366 يوماً في السنة الكبيسة). أشهره تبدأ من يناير وتنتهي بديسمبر.
              </p>
              <p>
                لهذا السبب يتقدم التاريخ الهجري كل عام بالنسبة إلى التاريخ الميلادي بنحو 10-11 يوماً، وتتغير مواعيد المناسبات الإسلامية بالنسبة للتقويم الميلادي من سنة إلى أخرى.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">لماذا يختلف التاريخ الهجري بين الدول؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                قد يختلف <strong>تاريخ اليوم الهجري</strong> بين الدول بسبب اختلاف طرق إثبات بداية الشهر الهجري. بعض الدول تعتمد على الرؤية المحلية للهلال، بينما تعتمد دول أخرى على تقاويم حسابية أو على رؤية دولة أخرى.
              </p>
              <p>
                على سبيل المثال، قد يكون اليوم 15 رمضان في السعودية (وفق تقويم أم القرى)، بينما يكون 14 رمضان في دولة أخرى اعتمدت رؤية الهلال في يوم مختلف.
              </p>
              <p>
                لذلك، إذا كنت تستخدم التاريخ الهجري لأغراض رسمية أو دينية، تحقق من التقويم المعتمد في بلدك.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">هل التاريخ الهجري اليوم دقيق؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                نعم، <strong>التاريخ الهجري اليوم</strong> في هذه الصفحة دقيق وفق تقويم أم القرى، وهو التقويم الرسمي المعتمد في المملكة العربية السعودية. الحساب يتم باستخدام خوارزميات دقيقة معتمدة على مكتبة <code dir="ltr" className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">hijri-converter</code>.
              </p>
              <p>
                ومع ذلك، قد يختلف التاريخ في بعض الدول التي تعتمد الرؤية المحلية للهلال بيوم أو يومين. للحصول على الدقة الكاملة، راجع الجهة الرسمية في بلدك.
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد المزيد من أدوات التاريخ؟</h2>
            <p className="text-emerald-50 leading-8 mb-5 max-w-2xl mx-auto">
              استخدم محول التاريخ الكامل لتحويل أي تاريخ بين الهجري والميلادي، أو احسب الفرق بين تاريخين، أو اكتشف المناسبات الإسلامية القادمة.
            </p>
            <Link href="/tools/hijri-to-gregorian" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50">
              محول التاريخ الكامل <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول التاريخ الهجري اليوم</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-emerald-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition group-open:rotate-45">+</span>
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
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                    {tool.icon}
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-emerald-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
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