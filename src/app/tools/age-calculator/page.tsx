// src/app/tools/age-calculator/page.tsx
import type { Metadata } from 'next';
import { AgeCalculator } from './components/AgeCalculator';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/age-calculator`;

export const metadata: Metadata = {
  title: 'حاسبة العمر – احسب عمرك بالسنوات والأشهر والأيام بدقة | Intooly',
  description:
    'استخدم حاسبة العمر المجانية من Intooly لمعرفة عمرك بالسنوات والأشهر والأيام، وحساب العمر بالهجري والميلادي، ومعرفة موعد عيد ميلادك القادم وإجمالي الأيام التي عشتها بسهولة ودقة.',
  keywords: [
    'حاسبة العمر',
    'حساب العمر',
    'احسب عمرك',
    'حاسبة العمر بالهجري',
    'حاسبة العمر بالميلادي',
    'حساب العمر بالأيام',
    'معرفة كم عمري',
    'Age Calculator',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'حاسبة العمر – احسب عمرك بالسنوات والأشهر والأيام بدقة | Intooly',
    description:
      'حاسبة عمر مجانية بالهجري والميلادي، حساب العمر في أي تاريخ، عيد الميلاد القادم، فرق العمر بين شخصين، ومحطات 10000 يوم.',
    url: PAGE_URL,
    siteName: 'Intooly',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حاسبة العمر – Intooly',
    description: 'احسب عمرك بدقة بالسنوات والأشهر والأيام، بالهجري والميلادي، مجانًا.',
  },
  robots: { index: true, follow: true },
};

const faq = [
  {
    q: 'كيف تعمل حاسبة العمر؟',
    a: 'تعمل بإدخال تاريخ الميلاد ومقارنته بتاريخ اليوم أو أي تاريخ تختاره، ثم تحسب السنوات والأشهر والأيام المكتملة مع مراعاة اختلاف طول الأشهر والسنوات الكبيسة.',
  },
  {
    q: 'كيف أحسب عمري بالسنوات والأشهر والأيام؟',
    a: 'أدخل تاريخ ميلادك في الحاسبة واضغط زر الحساب. ستظهر النتيجة مباشرة بالسنوات والأشهر والأيام المكتملة دون أي حساب يدوي.',
  },
  {
    q: 'هل حاسبة العمر دقيقة؟',
    a: 'نعم، تعتمد الحاسبة على الحساب التقويمي الصحيح مع مراعاة السنوات الكبيسة (خصوصًا مواليد 29 فبراير)، واختلاف عدد أيام الأشهر.',
  },
  {
    q: 'كيف أحسب عمري بالهجري؟',
    a: 'اختر تبويب "هجري" وأدخل تاريخ ميلادك بالتقويم الهجري. تعتمد الأداة تقويم أم القرى عبر Intl المدمج في المتصفح. قد يختلف يومًا واحدًا عن بعض التقاويم المحلية.',
  },
  {
    q: 'كيف أعرف عدد الأيام التي عشتها؟',
    a: 'بعد إدخال تاريخ الميلاد، تعرض الحاسبة إجمالي الأيام التي مرت منذ ولادتك، بالإضافة إلى إجمالي الأسابيع والأشهر والساعات.',
  },
  {
    q: 'هل يمكن حساب العمر في تاريخ مستقبلي؟',
    a: 'نعم، استخدم تبويب "تاريخ محدد" لاختيار أي تاريخ ماضٍ أو مستقبلي ومعرفة العمر الذي كنت عليه أو ستبلغه في ذلك اليوم.',
  },
  {
    q: 'هل يمكن حساب فرق العمر بين شخصين؟',
    a: 'نعم، تبويب "فرق العمر" يتيح إدخال تاريخي ميلاد شخصين ومعرفة الفرق بالسنوات والأشهر والأيام ومن الأكبر سنًا.',
  },
  {
    q: 'هل حاسبة العمر مجانية وتحافظ على الخصوصية؟',
    a: 'نعم، الأداة مجانية تمامًا ولا تحتاج إلى تسجيل. جميع الحسابات تجري محليًا داخل متصفحك ولا يُرفع تاريخ ميلادك إلى أي خادم.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#app`,
      name: 'حاسبة العمر',
      alternateName: 'Age Calculator',
      url: PAGE_URL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      inLanguage: 'ar',
      description:
        'حاسبة العمر المجانية لحساب العمر بالسنوات والأشهر والأيام بالهجري والميلادي.',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: 'حاسبة العمر', item: PAGE_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
};

const steps = [
  { n: 1, t: 'أدخل تاريخ ميلادك', d: 'اختر اليوم والشهر والسنة، أو استخدم التقويم الهجري مباشرة.' },
  { n: 2, t: 'اختر نوع الحساب', d: 'عمرك الآن، عمرك في تاريخ محدد، عيد ميلادك القادم، أو أي تبويب آخر.' },
  { n: 3, t: 'اقرأ النتيجة بالتفصيل', d: 'احصل على عمرك بالسنوات والأشهر والأيام، وإجمالي الأيام، وكل التفاصيل فورًا.' },
];

const features = [
  { i: '🎯', t: 'دقة تقويمية كاملة', d: 'نراعي السنوات الكبيسة واختلاف أيام الأشهر، مع معالجة خاصة لمواليد 29 فبراير.' },
  { i: '🌙', t: 'هجري وميلادي معًا', d: 'نتائج بالتقويمين في واجهة واحدة عبر تقويم أم القرى المدمج في المتصفح.' },
  { i: '📅', t: 'أي تاريخ تختاره', d: 'اعرف عمرك في تاريخ سابق أو مستقبلي، أو في يوم مناسب كالتقديم على وظيفة.' },
  { i: '👥', t: 'فرق العمر بين شخصين', d: 'قارن بين تاريخي ميلاد واكتشف من الأكبر والفرق بالسنوات والأشهر والأيام.' },
  { i: '🏆', t: 'محطات العمر', d: 'تواريخ إكمال 1,000 / 10,000 / 20,000 يوم من حياتك.' },
  { i: '🔒', t: 'خصوصية مطلقة', d: 'كل الحسابات داخل متصفحك فقط، ولا يُرفع تاريخ ميلادك إلى أي خادم.' },
];

const relatedTools = [
  { href: '/tools/percentage-calculator', label: 'حاسبة النسبة المئوية', icon: '📊' },
  { href: '/tools/bmi-calculator', label: 'حاسبة كتلة الجسم', icon: '⚖️' },
  { href: '/tools/word-counter', label: 'عداد الكلمات', icon: '📝' },
  { href: '/tools/qr-generator', label: 'مولّد رموز QR', icon: '🔗' },
];

export default function AgeCalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <nav aria-label="breadcrumb" className="text-xs text-slate-500">
            <a href="/" className="hover:text-yellow-600">الرئيسية</a>
            <span className="mx-1.5">/</span>
            <a href="/tools" className="hover:text-yellow-600">الأدوات</a>
            <span className="mx-1.5">/</span>
            <span className="text-slate-800 font-semibold">حاسبة العمر</span>
          </nav>
        </div>
      </div>

      {/* Hero + الأداة */}
      <section className="bg-gradient-to-b from-yellow-50/60 to-slate-50 pt-8 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200 mb-3">
              🎂 أداة مجانية 100%
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              حاسبة العمر – احسب عمرك بالسنوات والأشهر والأيام
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              أداة مجانية تحسب عمرك بدقة بالهجري والميلادي، وتعرض إجمالي الأيام التي عشتها،
              وموعد عيد ميلادك القادم، وفرق العمر بين شخصين، ومحطات 10,000 يوم.
            </p>
          </div>
          <AgeCalculator />
        </div>
      </section>

      {/* كيف تستخدم الأداة */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          كيفية استخدام حاسبة العمر؟
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-slate-900 font-extrabold text-lg flex items-center justify-center mb-3 shadow">
                {s.n}
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{s.t}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* مميزات */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            لماذا تستخدم حاسبة العمر من Intooly؟
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.t}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-yellow-50/40 hover:border-yellow-200 transition-colors"
              >
                <div className="text-2xl mb-2">{f.i}</div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{f.t}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* محتوى SEO */}
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate prose-headings:text-slate-800 prose-a:text-yellow-700">
        <h2 className="text-2xl font-bold">ما هي حاسبة العمر؟</h2>
        <p className="mt-3 text-slate-700 leading-relaxed">
          حاسبة العمر أداة إلكترونية تحسب الفترة الزمنية التي مرت منذ تاريخ ميلادك حتى
          تاريخ اليوم أو أي تاريخ آخر تختاره. بدلًا من حساب السنوات يدويًا، تقوم الأداة
          بحساب العمر بالسنوات الكاملة والأشهر والأيام المتبقية، مع عرض معلومات إضافية
          مثل إجمالي الأيام والأسابيع وموعد عيد الميلاد القادم.
        </p>

        <h2 className="text-2xl font-bold mt-8">حساب العمر بالسنوات والأشهر والأيام</h2>
        <p className="mt-3 text-slate-700 leading-relaxed">
          لا تكتفي الحاسبة بطرح سنة الميلاد من السنة الحالية، لأن ذلك يعطي نتيجة تقريبية
          فقط. بدلًا من ذلك، تحسب الأداة السنوات والأشهر والأيام المكتملة مع مراعاة اختلاف
          عدد أيام الأشهر والسنوات الكبيسة، وتحوّل مواليد 29 فبراير بطريقة واضحة في
          السنوات غير الكبيسة.
        </p>

        <h2 className="text-2xl font-bold mt-8">حاسبة العمر بالهجري والميلادي</h2>
        <p className="mt-3 text-slate-700 leading-relaxed">
          الأداة تدعم التقويم الهجري والميلادي معًا. يمكنك إدخال تاريخ ميلادك بالتقويم
          الهجري لمعرفة عمرك وفق تقويم أم القرى، أو بالتقويم الميلادي لمعرفة العمر بالتفصيل.
          التحويل يعتمد على <code>Intl.DateTimeFormat</code> المدمج في المتصفح مع تقويم
          <code>islamic-umalqura</code>، وقد يختلف يومًا واحدًا عن بعض التقاويم المحلية
          المعتمدة على رؤية الهلال.
        </p>

        <h2 className="text-2xl font-bold mt-8">خصوصيتك عند استخدام حاسبة العمر</h2>
        <p className="mt-3 text-slate-700 leading-relaxed">
          جميع الحسابات تُنفّذ محليًا داخل متصفحك. لا يتم إرسال تاريخ ميلادك إلى أي خادم
          أو واجهة برمجية (API)، ولا نُخزّن أي بيانات شخصية. لا تحتاج إلى تسجيل حساب أو
          إدخال بريد إلكتروني.
        </p>
      </article>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          الأسئلة الشائعة حول حاسبة العمر
        </h2>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-slate-200 bg-white p-4 open:shadow-md open:border-yellow-300 transition-all"
            >
              <summary className="font-bold text-slate-800 cursor-pointer list-none flex items-center justify-between gap-2">
                <span>{item.q}</span>
                <span className="text-yellow-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-slate-700 leading-relaxed text-sm border-t border-slate-100 pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* أدوات أخرى */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
          أدوات أخرى من Intooly
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {relatedTools.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="tool-card rounded-xl border border-slate-200 bg-white p-4 text-center hover:border-yellow-300 transition-colors"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-sm font-bold text-slate-800">{t.label}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
