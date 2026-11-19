import type { Metadata } from 'next';
import { GoldCalculator } from './components/GoldCalculator';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/gold-calculator`;

export const metadata: Metadata = {
  title: 'حاسبة الذهب أونلاين – حساب سعر الذهب بالجرام والعيار | Intooly',
  description:
    'حاسبة الذهب من Intooly لمتابعة سعر أوقية الذهب عالمياً وسعر جرام عيار 24 بالدولار، مع أدوات لحساب الذهب بالجرام والعيارات المختلفة والشراء والبيع.',
  keywords: [
    'حاسبة الذهب',
    'حساب سعر الذهب اليوم',
    'حاسبة الذهب بالجرام',
    'حاسبة الذهب عيار 21',
    'حساب سعر الذهب عيار 24',
    'حاسبة الذهب بالمصنعية',
    'حساب الذهب بالجرام',
    'حاسبة بيع وشراء الذهب',
    'حاسبة الجنيه الذهب',
    'حاسبة السبائك الذهبية',
    'حساب الذهب المستعمل',
    'الربح والخسارة في الذهب',
    'Gold Calculator',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'حاسبة الذهب أونلاين – Intooly',
    description:
      'تابع أسعار الذهب العالمية بالدولار واستخدم أدوات حساب الذهب بالجرام والعيارات المختلفة.',
    url: PAGE_URL,
    siteName: 'Intooly',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حاسبة الذهب – Intooly',
    description:
      'تابع سعر الذهب العالمي واستخدم حاسبة الذهب بالجرام والعيارات المختلفة.',
  },
  robots: { index: true, follow: true },
};

const faq = [
  {
    q: 'ما هي حاسبة الذهب؟',
    a: 'حاسبة الذهب أداة تساعد على معرفة قيمة الذهب اعتماداً على الوزن والعيار وسعر الجرام، ويمكن استخدامها في تقدير قيمة المشغولات والسبائك الذهبية.',
  },
  {
    q: 'ما الفرق بين عيارات الذهب 24 و21 و18؟',
    a: 'عيار 24 هو الأعلى نقاءً ويحتوي نظرياً على 99.9% تقريباً من الذهب، وعيار 21 يحتوي على 87.5%، وعيار 18 يحتوي على 75%. لذلك تختلف قيمة الجرام باختلاف العيار.',
  },
  {
    q: 'كيف يتم حساب سعر جرام الذهب؟',
    a: 'يمكن تقدير سعر الجرام بقسمة سعر الأوقية الترويسية على 31.1034768، ثم تعديل القيمة وفق نسبة نقاء العيار. هذه طريقة لتحويل السعر العالمي وليست بديلاً عن سعر السوق المحلي.',
  },
  {
    q: 'هل السعر العالمي هو نفسه سعر الذهب في مصر والسعودية؟',
    a: 'لا. السعر العالمي المحوّل إلى العملة المحلية قد يختلف عن السعر المتداول في محلات الذهب بسبب سعر الصرف وفروق السوق والعرض والطلب والمصنعية والضرائب والرسوم.',
  },
  {
    q: 'ما وزن أوقية الذهب؟',
    a: 'الأوقية المستخدمة في تسعير الذهب عالمياً هي الأوقية الترويسية، ويبلغ وزنها 31.1034768 جراماً، وهي تختلف عن الأوقية العادية المستخدمة في بعض أنظمة الوزن.',
  },
  {
    q: 'هل تشمل قيمة الذهب المصنعية والضرائب؟',
    a: 'السعر العالمي للذهب لا يشمل المصنعية أو الضرائب أو الرسوم المحلية. يجب احتساب هذه التكاليف بصورة منفصلة عند تقدير التكلفة النهائية للشراء.',
  },
  {
    q: 'هل يمكن الاعتماد على السعر العالمي لتحديد سعر البيع؟',
    a: 'السعر العالمي مرجع للمقارنة والتقدير، لكنه لا يحدد وحده سعر شراء التاجر للذهب المستعمل. قد يختلف سعر البيع الفعلي وفق السوق المحلي وحالة المشغولات وسياسة التاجر.',
  },
  {
    q: 'هل حاسبة الذهب مجانية؟',
    a: 'يمكن استخدام أدوات Intooly المجانية مباشرة من المتصفح دون الحاجة إلى إنشاء حساب.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#app`,
      name: 'حاسبة الذهب',
      alternateName: 'Gold Calculator',
      url: PAGE_URL,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      inLanguage: 'ar',
      description:
        'أداة لمتابعة أسعار الذهب العالمية والمساعدة في حساب قيمة الذهب حسب الوزن والعيار.',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: 'الحاسبات', item: `${SITE_URL}/tools/calculators` },
        { '@type': 'ListItem', position: 4, name: 'حاسبة الذهب', item: PAGE_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ],
};

const steps = [
  {
    n: 1,
    t: 'تابع سعر الذهب العالمي',
    d: 'اطلع على سعر أوقية الذهب بالدولار وسعر جرام الذهب عيار 24 ووقت آخر تحديث من المصدر.',
  },
  {
    n: 2,
    t: 'اختر قسم الحاسبة',
    d: 'تعرّف على أقسام حساب الذهب والشراء والبيع والربح والخسارة والمحفظة والزكاة.',
  },
  {
    n: 3,
    t: 'راجع بيانات السعر',
    d: 'ميّز بين السعر العالمي والسعر المحلي، وانتبه إلى المصنعية والرسوم وفروق أسعار العملات.',
  },
];

const features = [
  {
    i: '🌍',
    t: 'متابعة السعر العالمي',
    d: 'عرض سعر أوقية الذهب بالدولار وسعر جرام عيار 24 من مصدر الأسعار.',
  },
  {
    i: '🔄',
    t: 'تحديث الأسعار',
    d: 'إمكانية طلب تحديث جديد مع توضيح حالة الاتصال ووقت آخر تحديث.',
  },
  {
    i: '⚖️',
    t: 'أوزان الذهب',
    d: 'التعرف على الأوقية الترويسية والجرام والعلاقة بين وحدات الوزن.',
  },
  {
    i: '🥇',
    t: 'عيارات الذهب',
    d: 'شرح درجات نقاء الذهب المختلفة مثل عيار 24 و22 و21 و18 و14.',
  },
  {
    i: '🧾',
    t: 'فهم تكلفة الشراء',
    d: 'التعرف على أثر المصنعية والضرائب والرسوم في التكلفة النهائية.',
  },
  {
    i: '🔎',
    t: 'التمييز بين السعرين',
    d: 'عدم الخلط بين السعر العالمي المحوّل والسعر الفعلي المتداول في السوق المحلي.',
  },
];

const relatedTools = [
  { href: '/tools/percentage-calculator', label: 'حاسبة النسبة المئوية', icon: '📊' },
  { href: '/tools/currency-converter', label: 'محول العملات', icon: '💱' },
  { href: '/tools/calculators', label: 'جميع الحاسبات', icon: '🧮' },
  { href: '/tools/bmi-calculator', label: 'حاسبة كتلة الجسم', icon: '⚖️' },
];

export default function GoldCalculatorPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <nav aria-label="breadcrumb" className="text-xs text-slate-500">
            <a href="/" className="hover:text-orange-600">الرئيسية</a>
            <span className="mx-1.5">/</span>
            <a href="/tools" className="hover:text-orange-600">الأدوات</a>
            <span className="mx-1.5">/</span>
            <a href="/tools/calculators" className="hover:text-orange-600">الحاسبات</a>
            <span className="mx-1.5">/</span>
            <span className="font-semibold text-slate-800">حاسبة الذهب</span>
          </nav>
        </div>
      </div>

      <section className="bg-gradient-to-b from-amber-50/70 to-slate-50 px-4 pb-10 pt-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-block rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              🥇 متابعة أسعار الذهب العالمية
            </div>
            <h1 className="mb-3 text-2xl font-extrabold text-slate-900 sm:text-3xl md:text-4xl">
              حاسبة الذهب أونلاين – حساب الذهب بالجرام والعيار
            </h1>
            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              تابع سعر أوقية الذهب عالمياً بالدولار وسعر جرام عيار 24،
              وتعرّف على طرق حساب الذهب بالوزن والعيار وتكلفة الشراء والبيع.
              الأسعار العالمية لا تمثل بالضرورة أسعار محلات الذهب المحلية.
            </p>
          </div>

          <GoldCalculator />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
          كيفية استخدام حاسبة الذهب؟
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-extrabold text-white shadow">
                {step.n}
              </div>
              <h3 className="mb-1 font-bold text-slate-800">{step.t}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
            مميزات حاسبة الذهب من Intooly
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.t}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-amber-200 hover:bg-amber-50/40"
              >
                <div className="mb-2 text-2xl">{feature.i}</div>
                <h3 className="mb-1 text-sm font-bold text-slate-800">{feature.t}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{feature.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <article className="prose prose-slate mx-auto max-w-3xl px-4 py-12 prose-headings:text-slate-800 prose-a:text-orange-700">
        <h2 className="text-2xl font-bold">ما هي حاسبة الذهب؟</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          حاسبة الذهب أداة تساعد على تقدير قيمة الذهب بناءً على وزنه ودرجة
          نقائه وسعر الجرام. ويحتاج حساب قيمة المشغولات الذهبية إلى معرفة
          العيار والوزن، مع مراعاة المصنعية والرسوم وفروق السوق عند الشراء أو البيع.
        </p>

        <h2 className="mt-8 text-2xl font-bold">كيفية حساب سعر جرام الذهب</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          يُسعّر الذهب عالمياً عادةً باستخدام الأوقية الترويسية التي تساوي
          31.1034768 جراماً. ويمكن تقدير سعر جرام الذهب عيار 24 بقسمة سعر
          الأوقية بالدولار على هذا الوزن، ثم تعديل القيمة وفق نقاء العيار
          عند حساب عيارات الذهب الأخرى.
        </p>

        <h2 className="mt-8 text-2xl font-bold">الفرق بين عيارات الذهب</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          تختلف عيارات الذهب حسب نسبة الذهب النقي في السبيكة أو المشغول.
          عيار 24 هو الأعلى نقاءً، بينما يحتوي عيار 21 على 21 جزءاً من الذهب
          من أصل 24، ويحتوي عيار 18 على 18 جزءاً. لذلك تتغير قيمة الجرام
          باختلاف العيار حتى عند تساوي الوزن.
        </p>

        <h2 className="mt-8 text-2xl font-bold">الفرق بين سعر الذهب العالمي والسعر المحلي</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          السعر العالمي بالدولار يمثل مرجعاً لتسعير الذهب في الأسواق الدولية.
          أما السعر المحلي في مصر أو السعودية أو غيرهما فيتأثر بسعر صرف العملة
          والطلب والعرض وفروق السوق والمصنعية والضرائب والرسوم. لذلك لا ينبغي
          اعتبار تحويل السعر العالمي إلى العملة المحلية سعراً مؤكداً للبيع أو الشراء.
        </p>

        <h2 className="mt-8 text-2xl font-bold">ما الذي يحدد تكلفة شراء الذهب؟</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          تتكون تكلفة شراء المشغولات عادةً من قيمة الذهب بحسب الوزن والعيار،
          إضافة إلى المصنعية وأي رسوم أو ضرائب مطبقة. وقد تختلف المصنعية
          من محل إلى آخر ومن قطعة إلى أخرى، كما قد تختلف شروط إعادة البيع.
        </p>

        <h2 className="mt-8 text-2xl font-bold">الأوقية الترويسية ووزن الذهب</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          الأوقية الترويسية هي وحدة الوزن المستخدمة في أسواق المعادن الثمينة،
          وتساوي 31.1034768 جراماً. وهي ليست الأوقية العادية التي تساوي
          نحو 28.35 جراماً، ولذلك من المهم استخدام وحدة الوزن الصحيحة عند
          تحويل أسعار الذهب العالمية.
        </p>
      </article>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
          الأسئلة الشائعة حول حاسبة الذهب
        </h2>
        <div className="space-y-3">
          {faq.map((item, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition-all open:border-amber-300 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-bold text-slate-800">
                <span>{item.q}</span>
                <span className="text-xl leading-none text-amber-600 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-700">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">
          أدوات أخرى من Intooly
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {relatedTools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="tool-card rounded-xl border border-slate-200 bg-white p-4 text-center transition-colors hover:border-amber-300"
            >
              <div className="mb-2 text-2xl">{tool.icon}</div>
              <div className="text-sm font-bold text-slate-800">{tool.label}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}