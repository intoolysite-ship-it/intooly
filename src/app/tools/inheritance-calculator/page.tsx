import type { Metadata } from "next";
import Link from "next/link";
import InheritanceCalculator from "./components/InheritanceCalculator";

const SITE_URL = "https://intooly.com";
const PAGE_URL = `${SITE_URL}/tools/inheritance-calculator`;

export const metadata: Metadata = {
  title: "حاسبة المواريث الشرعية | حساب تقسيم الميراث ونصيب كل وارث | Intooly",
  description:
    "استخدم حاسبة المواريث لحساب تقسيم التركة ومعرفة نصيب الزوج والزوجة والأب والأم والأبناء والبنات، مع عرض الأنصبة الشرعية والكسور والمبالغ. للحالات المدعومة فقط.",
  keywords: [
    "حاسبة المواريث",
    "حاسبة الميراث",
    "حاسبة تقسيم الميراث",
    "حساب الميراث الشرعي",
    "تقسيم الميراث بين الورثة",
    "حساب نصيب كل وارث",
    "حساب التركة",
    "حاسبة المواريث الشرعية",
    "معرفة نصيب الزوجة من الميراث",
    "نصيب الأبناء والبنات من الميراث",
    "توزيع التركة على الورثة",
    "برنامج حساب الميراث",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "حاسبة المواريث الشرعية | Intooly",
    description:
      "احسب أنصبة الورثة من التركة واعرف نصيب كل وارث بالكسر والمبلغ في الحالات التي تدعمها الحاسبة.",
    url: PAGE_URL,
    siteName: "Intooly",
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "حاسبة المواريث الشرعية | Intooly",
    description:
      "أداة عربية لحساب تقسيم التركة وعرض أنصبة الورثة في المسائل المدعومة.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const faqs = [
  {
    question: "ما هي حاسبة المواريث؟",
    answer:
      "حاسبة المواريث أداة حسابية تساعد على تقدير أنصبة الورثة من التركة وفق قواعد الفرائض في الحالات التي يدعمها محرك الحساب، وتعرض نصيب كل فئة بالكسر والمبلغ وسبب الاستحقاق.",
  },
  {
    question: "كيف أحسب تقسيم الميراث بين الورثة؟",
    answer:
      "أدخل قيمة التركة ومصاريف التجهيز والديون والوصية، ثم حدد جنس المتوفى والورثة الموجودين من الزوج أو الزوجة والأب والأم والأبناء والبنات، واضغط على زر الحساب. إذا كانت المسألة خارج نطاق الحاسبة فستظهر رسالة توضح تعذر إصدار توزيع نهائي.",
  },
  {
    question: "هل يجب خصم الديون ومصاريف التجهيز قبل تقسيم التركة؟",
    answer:
      "تأخذ الحاسبة مصاريف التجهيز والديون والوصية المدخلة في الاعتبار عند تقدير صافي التركة. ويجب التحقق من الحقوق والالتزامات المتعلقة بالتركة وفق الأحكام الشرعية والقانونية المعمول بها.",
  },
  {
    question: "كيف يتم حساب نصيب الزوجة من الميراث؟",
    answer:
      "يختلف نصيب الزوجة بحسب وجود الفرع الوارث من عدمه، كما تتشارك الزوجات في النصيب المقرر لهن. تعرض الحاسبة النتيجة في الحالات التي يدعمها محركها، مع ضرورة مراجعة المسألة قبل اعتماد القسمة.",
  },
  {
    question: "كيف يتم حساب نصيب الأبناء والبنات؟",
    answer:
      "عند اجتماع الأبناء الذكور والبنات في الحالات المدعومة، يوزع الباقي بينهم بحيث يكون للذكر مثل حظ الأنثيين. وقد تختلف تفاصيل المسألة بحسب وجود ورثة آخرين.",
  },
  {
    question: "هل تدعم الحاسبة جميع الورثة والمذاهب؟",
    answer:
      "لا. الإصدار الحالي محدود بالزوج أو الزوجة والأب والأم والأبناء والبنات، ولا يدعم جميع الورثة أو جميع المذاهب أو كل المسائل الخاصة. يجب عدم استخدامه لإصدار قسمة نهائية إذا وُجد وارث آخر.",
  },
  {
    question: "ماذا يحدث إذا كانت المسألة تحتاج إلى العول أو الرد؟",
    answer:
      "إذا اكتشف المحرك أن المسألة تحتاج إلى العول أو الرد أو إلى عصبات غير موجودة في نطاقه الحالي، فإنه يرفض إصدار توزيع نهائي ويعرض رسالة توضح سبب التعذر.",
  },
  {
    question: "هل نتائج حاسبة المواريث فتوى شرعية؟",
    answer:
      "لا. النتائج حسابية وإرشادية للحالات المحدودة المدعومة، ولا تمثل فتوى أو حكماً قضائياً. ينبغي عرض تفاصيل التركة والورثة على عالم مختص أو جهة قضائية معتمدة قبل توزيع الأموال.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "حاسبة المواريث الشرعية",
      url: PAGE_URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      inLanguage: "ar",
      description:
        "حاسبة عربية لتقدير أنصبة الزوج والزوجة والأب والأم والأبناء والبنات في الحالات التي يدعمها محرك الحساب.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: {
        "@type": "Organization",
        name: "Intooly",
        url: SITE_URL,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "الرئيسية",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "الحاسبات والأدوات الحسابية",
          item: `${SITE_URL}/tools/calculators`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "حاسبة المواريث الشرعية",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function InheritanceCalculatorPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="مسار التنقل" className="mb-6 text-sm text-slate-500">
          <Link href="/tools" className="transition hover:text-orange-600">
            جميع الأدوات
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/tools/calculators"
            className="transition hover:text-orange-600"
          >
            الحاسبات والأدوات الحسابية
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-slate-700">حاسبة المواريث</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            حاسبة شرعية مجانية
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            حاسبة المواريث الشرعية – احسب تقسيم التركة ونصيب كل وارث
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
            استخدم حاسبة المواريث لمعرفة كيفية توزيع التركة وتقدير نصيب الزوج
            أو الزوجة والأب والأم والأبناء والبنات. أدخل بيانات المتوفى والورثة
            وقيمة التركة والالتزامات، لتحصل على تفاصيل الأنصبة والكسور والمبالغ
            في المسائل التي يدعمها محرك الحاسبة.
          </p>
        </header>

        <InheritanceCalculator />

        <section className="mx-auto mt-14 max-w-4xl space-y-10 border-t border-slate-200 pt-10 text-right">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              ما هي حاسبة المواريث الشرعية؟
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              حاسبة المواريث هي أداة حسابية تساعد على تقدير تقسيم التركة بين
              الورثة وفق قواعد علم الفرائض. تتيح إدخال بيانات المتوفى والورثة
              وقيمة الأموال والالتزامات، ثم تعرض الأنصبة الناتجة في صورة كسور
              ومبالغ مالية، مع توضيح سبب استحقاق كل وارث في الحالات التي يغطيها
              محرك الحساب.
            </p>
            <p className="mt-3 leading-8 text-slate-600">
              صُممت هذه الأداة لتسهيل فهم الحسابات الأولية، وليست بديلاً عن
              التحقق من جميع الورثة والحقوق المتعلقة بالتركة أو الرجوع إلى
              المختصين في المسائل الشرعية والقانونية.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              كيفية استخدام حاسبة تقسيم الميراث
            </h2>
            <ol className="mt-4 list-inside list-decimal space-y-3 leading-8 text-slate-600">
              <li>أدخل إجمالي قيمة التركة قبل الخصومات.</li>
              <li>أدخل مصاريف التجهيز والديون والوصية إن وجدت.</li>
              <li>حدد جنس المتوفى، ثم أدخل بيانات الزوج أو الزوجات.</li>
              <li>حدد وجود الأب والأم وأدخل أعداد الأبناء والبنات.</li>
              <li>صرّح بوجود أي ورثة آخرين غير المذكورين.</li>
              <li>اضغط على زر الحساب لمراجعة النتيجة أو أسباب تعذر إصدارها.</li>
            </ol>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              ما البيانات التي تعرضها الحاسبة؟
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              عند نجاح الحساب، تعرض الأداة صافي التركة بعد الخصومات، وإجمالي
              المبالغ الموزعة، ونصيب كل فئة من الورثة. وتشمل التفاصيل الكسر
              الشرعي للفئة، ونصيب الفرد، والمبلغ المقدر لكل فرد، وإجمالي نصيب
              الفئة، بالإضافة إلى سبب الاستحقاق والملاحظات المرتبطة بالحساب.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              الورثة الذين تدعمهم النسخة الحالية
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              يقتصر نطاق الإصدار الحالي على الزوج أو الزوجة، والأب، والأم،
              والأبناء الذكور، والبنات. وتراعي الحسابات المدعومة وجود الفرع
              الوارث وبعض صور استحقاق أصحاب الفروض والتعصيب، بما في ذلك تطبيق
              ثلث الباقي للأم في صورتي العمريتين التي يغطيها المحرك.
            </p>
            <p className="mt-3 leading-8 text-slate-600">
              لا تدعم هذه النسخة جميع صور المواريث، ولا جميع الورثة أو المذاهب،
              ولا تصدر نتيجة نهائية للمسائل التي تحتاج إلى العول أو الرد أو
              عصبات غير مدعومة. عند ظهور رسالة تعذر الحساب، يجب إحالة المسألة
              إلى مختص بدلاً من محاولة اعتماد توزيع غير مكتمل.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              أهمية التحقق من صافي التركة قبل القسمة
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              لا ينبغي البدء بتوزيع الأموال قبل حصر التركة والتحقق من الحقوق
              والالتزامات المتعلقة بها. لذلك توفر الحاسبة حقولاً لإدخال مصاريف
              التجهيز والديون والوصية، وتتحقق من بعض الحدود الحسابية قبل إجراء
              التوزيع. وتظل صحة هذه البيانات ومسائل تنفيذ الوصايا والحقوق
              الأخرى بحاجة إلى مراجعة شرعية وقانونية بحسب ظروف كل حالة.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              الأسئلة الشائعة حول حاسبة المواريث
            </h2>
            <div className="mt-5 space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition open:border-orange-200 open:bg-orange-50/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-800">
                    <span>{faq.question}</span>
                    <span className="text-xl text-orange-600 transition group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 leading-8 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </article>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-extrabold text-amber-900">
              تنبيه مهم قبل توزيع التركة
            </h2>
            <p className="mt-2 leading-8 text-amber-900">
              نتائج هذه الأداة حسابية وإرشادية، ولا تمثل فتوى شرعية أو حكماً
              قضائياً. لا تعتمد عليها وحدها في توزيع الأموال فعلياً. يجب حصر
              الورثة والديون والوصايا والحقوق المتعلقة بالتركة، ثم مراجعة
              مختص في علم الفرائض أو الجهة القضائية المختصة.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-extrabold text-slate-900">
              اكتشف المزيد من الحاسبات
            </h2>
            <Link
              href="/tools/calculators"
              className="mt-3 inline-flex font-semibold text-orange-600 transition hover:text-orange-700"
            >
              تصفح الحاسبات والأدوات الحسابية في Intooly
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
