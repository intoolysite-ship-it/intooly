import type { Metadata } from 'next';
import { GoldCalculator } from './components/GoldCalculator';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/gold-calculator`;

export const metadata: Metadata = {
  title: 'حاسبة الذهب اليوم | حساب سعر الذهب بيع وشراء وزكاته | Intooly',
  description:
    'استخدم حاسبة الذهب المجانية لحساب سعر الذهب اليوم حسب العيار والوزن، وتقدير قيمة البيع والشراء والذهب المستعمل، وحساب زكاة الذهب بعملتك المحلية.',
  keywords: [
    'حاسبة الذهب',
    'حاسبة الذهب اليوم',
    'حاسبه الذهب',
    'حساب سعر الذهب',
    'حاسبة اسعار الذهب',
    'حساب سعر جرام الذهب اليوم',
    'حاسبة سعر جرام الذهب',
    'حاسبة الذهب بالجرام',
    'حاسبة الذهب عيار 24',
    'حاسبة الذهب عيار 21',
    'حاسبة الذهب عيار 22',
    'حاسبة الذهب عيار 18',
    'حاسبة بيع الذهب',
    'حاسبة الذهب بيع وشراء',
    'حاسبة الذهب بيع وشراء السعودية',
    'حاسبة الذهب المستعمل',
    'حساب قيمة الذهب المستعمل',
    'حساب المصنعية',
    'حاسبة الذهب في مصر',
    'حاسبة الذهب السعودية',
    'حاسبة الذهب الامارات',
    'حساب الذهب بالجنيه المصري',
    'حساب الذهب بالريال السعودي',
    'حساب الذهب بالدرهم الإماراتي',
    'حاسبة زكاة الذهب',
    'حساب زكاة الذهب بالجرام',
    'حساب قيمة الذهب',
    'حساب الذهب بالجرام',
    'الربح والخسارة في الذهب',
    'حاسبة السبائك الذهبية',
    'Gold Calculator',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'حاسبة الذهب اليوم وبيع وشراء الذهب | Intooly',
    description:
      'احسب قيمة الذهب حسب الوزن والعيار، وقدّر أسعار البيع والشراء وزكاة الذهب بالعملات العربية.',
    url: PAGE_URL,
    siteName: 'Intooly',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حاسبة الذهب اليوم | Intooly',
    description:
      'احسب سعر الذهب بالجرام والعيار، وقدّر قيمة البيع والشراء وزكاة الذهب.',
  },
  robots: { index: true, follow: true },
};

const faq = [
  {
    q: 'كيف أحسب سعر الذهب اليوم؟',
    a: 'لحساب سعر الذهب، حدد العيار والوزن ثم اضرب وزن الذهب في سعر الجرام للعيار نفسه. ويمكنك استخدام حاسبة الذهب للحصول على القيمة التقديرية بسرعة.',
  },
  {
    q: 'كيف أحسب سعر الذهب عيار 21؟',
    a: 'يمكن تقدير سعر جرام الذهب عيار 21 بضرب سعر جرام عيار 24 في 21 ثم قسمة الناتج على 24، وذلك قبل إضافة المصنعية أو الرسوم.',
  },
  {
    q: 'هل يمكن استخدام حاسبة الذهب في مصر؟',
    a: 'نعم، يمكنك اختيار مصر لعرض نتائج حساب الذهب بالجنيه المصري، بشرط توافر سعر صرف العملة المستخدم في الحاسبة.',
  },
  {
    q: 'هل تدعم حاسبة الذهب السعودية والإمارات؟',
    a: 'نعم، يمكنك اختيار السعودية لعرض النتائج بالريال السعودي أو الإمارات لعرضها بالدرهم الإماراتي، إلى جانب عملات عربية أخرى مدعومة.',
  },
  {
    q: 'كيف أحسب سعر بيع الذهب المستعمل؟',
    a: 'ابدأ بحساب وزن الذهب مضروباً في سعر الجرام للعيار نفسه، ثم راعِ الخصومات وفروق أسعار الشراء التي يطبقها التاجر؛ فقد يختلف السعر النهائي عن القيمة النظرية للذهب.',
  },
  {
    q: 'كيف أحسب زكاة الذهب؟',
    a: 'يتم تقدير قيمة الذهب الخالص بناءً على الوزن والعيار، ثم تُحسب الزكاة بنسبة 2.5% عند تحقق النصاب وشروط وجوب الزكاة، ومنها اكتمال الحول وفق الأحكام الشرعية.',
  },
  {
    q: 'ما الفرق بين الذهب عيار 24 و21 و18؟',
    a: 'عيار 24 هو الأعلى نقاءً، ويحتوي عيار 21 على 87.5% من الذهب الخالص، بينما يحتوي عيار 18 على 75%. لذلك تختلف قيمة الجرام باختلاف العيار.',
  },
  {
    q: 'هل سعر الذهب في الحاسبة هو السعر النهائي في محلات الذهب؟',
    a: 'ليس بالضرورة. السعر المحسوب تقديري، وقد يختلف السعر الفعلي بسبب المصنعية والضرائب والرسوم وفروق البيع والشراء وظروف السوق المحلي.',
  },
  {
    q: 'هل حاسبة الذهب مجانية؟',
    a: 'نعم، يمكنك استخدام حاسبة الذهب من Intooly مجاناً من خلال المتصفح دون الحاجة إلى تثبيت تطبيق أو إنشاء حساب.',
  },
  {
    q: 'هل يمكن حساب قيمة الذهب بالجرام أو بوزن السبيكة؟',
    a: 'نعم، يمكنك إدخال وزن الذهب بالجرام واختيار العيار لمعرفة القيمة التقديرية، سواء كنت تحسب قيمة مشغولات ذهبية أو سبيكة.',
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
              حاسبة الذهب اليوم – احسب سعر الذهب بيع وشراء وزكاة الذهب
            </h1>
            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              احسب قيمة الذهب حسب الوزن والعيار، وقدّر أسعار البيع والشراء
              والذهب المستعمل وزكاة الذهب، مع عرض النتائج بعملتك المحلية.
              الأسعار تقديرية وقد تختلف عن أسعار محلات الذهب المحلية.
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
          حاسبة الذهب من Intooly أداة مجانية تساعدك على تقدير قيمة الذهب اعتماداً على الوزن والعيار وسعر الذهب المستخدم في الحساب. يمكنك استخدامها لمعرفة قيمة الجرام والمشغولات والسبائك، وتقدير تكلفة الشراء والبيع، وحساب الأرباح والخسائر وزكاة الذهب. كما يمكنك اختيار الدولة والعملة المحلية لعرض النتائج بطريقة تناسبك.
        </p>

        <h2 className="mt-8 text-2xl font-bold">كيف تستخدم حاسبة الذهب؟</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          اختر الدولة والعملة أولاً، ثم حدد عيار الذهب وأدخل الوزن بالجرام. بعد ذلك استخدم القسم المناسب للحساب، سواء أردت معرفة قيمة الذهب أو تقدير سعر البيع والشراء أو حساب الأرباح والزكاة. راجع سعر الصرف ووقت تحديث الأسعار قبل الاعتماد على النتيجة.
        </p>

        <h2 className="mt-8 text-2xl font-bold">حاسبة الذهب اليوم وحساب سعر جرام الذهب</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          يعتمد تقدير سعر الذهب على سعره المرجعي ووزنه ودرجة نقائه. يُسعّر الذهب عالمياً عادةً بالأوقية الترويسية التي تساوي 31.1034768 جراماً. ويمكن تقدير سعر جرام الذهب عيار 24 بقسمة سعر الأوقية على وزنها، ثم تعديل القيمة وفق نسبة نقاء العيار المطلوب.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700">
          معادلة تقدير سعر العيار المطلوب هي: سعر جرام عيار 24 × العيار المطلوب ÷ 24. تساعدك هذه الطريقة على تقدير أسعار عيارات 21 و22 و18، مع الانتباه إلى أن السعر الناتج لا يشمل بالضرورة المصنعية أو الرسوم المحلية.
        </p>

        <h2 className="mt-8 text-2xl font-bold">حاسبة الذهب بيع وشراء</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          قبل شراء الذهب أو بيعه، من المفيد معرفة قيمته التقريبية حسب الوزن والعيار. عند الشراء قد تضاف المصنعية والرسوم والضرائب إلى قيمة الذهب الخام، بينما قد يختلف المبلغ الذي تحصل عليه عند البيع بسبب خصومات التاجر وفروق أسعار الشراء والبيع. تساعدك الحاسبة على تقدير القيمة ومقارنة النتائج قبل إتمام الصفقة.
        </p>

        <h2 className="mt-8 text-2xl font-bold">حاسبة الذهب المستعمل</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          لحساب قيمة الذهب المستعمل، ابدأ بمعرفة الوزن الفعلي والعيار، ثم قدّر قيمة الذهب الخام باستخدام سعر الجرام المناسب. قد يختلف سعر البيع النهائي بحسب حالة المشغولات وسياسة التاجر والخصومات المطبقة في السوق المحلي، لذلك لا تعتبر القيمة الحسابية عرض شراء مؤكداً.
        </p>

        <h2 className="mt-8 text-2xl font-bold">الفرق بين عيارات الذهب 24 و22 و21 و18</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          يعبّر العيار عن نسبة الذهب الخالص في القطعة. عيار 24 هو الأعلى نقاءً ويحتوي نظرياً على نحو 99.9% من الذهب، وعيار 22 يحتوي على نحو 91.67%، وعيار 21 يحتوي على 87.5%، أما عيار 18 فيحتوي على 75%. لذلك تختلف قيمة الجرام باختلاف العيار حتى عند تساوي الوزن.
        </p>

        <h2 className="mt-8 text-2xl font-bold">حاسبة الذهب في مصر والسعودية والإمارات</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          تتيح حاسبة الذهب اختيار الدولة وعرض النتائج بالعملة المحلية المدعومة. يمكن للمستخدم في مصر عرض النتائج بالجنيه المصري، وفي السعودية بالريال السعودي، وفي الإمارات بالدرهم الإماراتي، مع دعم عملات عربية أخرى. يسهّل ذلك تقدير قيمة الذهب دون الحاجة إلى إجراء تحويل العملة يدوياً.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700">
          يجب الانتباه إلى أن تحويل السعر العالمي إلى العملة المحلية لا يعني بالضرورة أنه سعر البيع الفعلي في محلات الذهب؛ فقد تتأثر الأسعار المحلية بسعر الصرف والعرض والطلب وفروق السوق والمصنعية والضرائب والرسوم.
        </p>

        <h2 className="mt-8 text-2xl font-bold">حاسبة زكاة الذهب</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          تساعدك حاسبة زكاة الذهب على تقدير قيمة الزكاة عند تحقق شروط وجوبها. ويُستخدم نصاب الذهب الشائع الذي يعادل 85 جراماً من الذهب الخالص، وتبلغ نسبة الزكاة 2.5% عند اكتمال الحول وتحقق بقية الشروط الشرعية.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700">
          لتقدير وزن الذهب الخالص، اضرب وزن الذهب في العيار ثم اقسم الناتج على 24. وبعد تحديد قيمة الذهب المستحق للزكاة، احسب 2.5% من قيمته. قد تختلف بعض التفاصيل الفقهية، ومنها أحكام حلي الذهب المعد للاستعمال، لذلك يُنصح بالرجوع إلى جهة إفتاء موثوقة لمعرفة الحكم المناسب لحالتك. الحاسبة أداة مساعدة للحساب وليست بديلاً عن الفتوى الشرعية.
        </p>

        <h2 className="mt-8 text-2xl font-bold">كيف تحسب قيمة الذهب بنفسك؟</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          يمكنك تقدير قيمة الذهب بضرب الوزن في سعر الجرام للعيار نفسه. فعلى سبيل المثال، تُحسب قيمة 10 جرامات من الذهب عيار 21 بضرب 10 في سعر جرام عيار 21. وإذا كان المتاح لديك سعر عيار 24، يمكنك تقدير سعر عيار 21 باستخدام معادلة العيارات. تذكّر أن المصنعية والخصومات والضرائب وفروق البيع والشراء قد تغيّر السعر النهائي.
        </p>

        <h2 className="mt-8 text-2xl font-bold">مميزات حاسبة الذهب من Intooly</h2>
        <ul className="mt-3 leading-relaxed text-slate-700">
          <li>حساب قيمة الذهب حسب الوزن والعيار.</li>
          <li>تقدير أسعار عيارات الذهب المختلفة.</li>
          <li>عرض النتائج بالعملات العربية المدعومة.</li>
          <li>تقدير قيمة الذهب عند البيع والشراء.</li>
          <li>إدخال المصنعية والرسوم والخصومات في الحسابات المتاحة.</li>
          <li>حساب الأرباح والخسائر ومتابعة محفظة الذهب.</li>
          <li>تقدير زكاة الذهب وفق بيانات الحساب.</li>
          <li>استخدام مجاني من المتصفح دون الحاجة إلى تثبيت برنامج.</li>
        </ul>
        <p className="mt-5 leading-relaxed text-slate-700">
          ابدأ الآن باستخدام حاسبة الذهب من Intooly، وأدخل وزن الذهب والعيار واختر العملة لمعرفة القيمة التقديرية بسهولة.
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