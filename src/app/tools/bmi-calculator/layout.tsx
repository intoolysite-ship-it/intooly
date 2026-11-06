import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/bmi-calculator";

export const metadata: Metadata = {
  title: "حساب مؤشر كتلة الجسم BMI مجانًا | حاسبة الوزن الصحي - Intooly",
  description:
    "احسب مؤشر كتلة الجسم (BMI) مجانًا بدقة فورية. يدعم كجم/سم ورطل/قدم، يعرض نطاق الوزن الصحي، BMI Prime، تصنيف السمنة الكامل، وسجل آخر 10 حسابات. معالجة محلية 100% داخل متصفحك.",
  keywords: [
    "حساب مؤشر كتلة الجسم",
    "حاسبة مؤشر كتلة الجسم",
    "حاسبة BMI",
    "حساب BMI",
    "مؤشر كتلة الجسم",
    "BMI calculator",
    "حاسبة الوزن الصحي",
    "حساب الوزن المثالي",
    "BMI عربي",
    "حاسبة السمنة",
    "مؤشر كتلة الجسم للرجال",
    "مؤشر كتلة الجسم للنساء",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "حساب مؤشر كتلة الجسم BMI مجانًا | Intooly",
    description:
      "احسب مؤشر كتلة الجسم (BMI) بدقة فورية مع نطاق الوزن الصحي وBMI Prime وسجل الحسابات. خصوصية تامة ومعالجة محلية.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  twitter: {
    card: "summary_large_image",
    title: "حاسبة مؤشر كتلة الجسم BMI | Intooly",
    description: "احسب مؤشر كتلة الجسم مجانًا مع نطاق الوزن الصحي وBMI Prime.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const faqQuestions = [
  {
    question: "ما هو مؤشر كتلة الجسم BMI؟",
    answer:
      "مؤشر كتلة الجسم (Body Mass Index) هو مقياس حسابي يُستخدم لتقدير العلاقة بين وزن الشخص وطوله. يُحسب بقسمة الوزن بالكيلوجرام على مربع الطول بالمتر، ويُساعد على تصنيف الوزن إلى فئات عامة مثل نقص الوزن والوزن الطبيعي وزيادة الوزن والسمنة.",
  },
  {
    question: "كيف يتم حساب مؤشر كتلة الجسم؟",
    answer:
      "يُحسب مؤشر كتلة الجسم بقسمة الوزن بالكيلوجرام على مربع الطول بالمتر. مثال: إذا كان وزنك 75 كجم وطولك 175 سم (1.75 متر)، فإن BMI = 75 ÷ (1.75 × 1.75) = 24.5 تقريبًا.",
  },
  {
    question: "هل حاسبة مؤشر كتلة الجسم مجانية؟",
    answer:
      "نعم، جميع الميزات متاحة مجانًا بدون تسجيل أو علامات مائية، بما في ذلك نطاق الوزن الصحي وBMI Prime وسجل الحسابات وتنزيل تقرير PDF.",
  },
  {
    question: "هل يتم رفع بياناتي إلى خادم الموقع؟",
    answer:
      "لا على الإطلاق. جميع الحسابات تتم محليًا داخل متصفحك. لا يتم إرسال وزنك أو طولك إلى أي خادم. سجل الحسابات يُحفظ محليًا في متصفحك فقط.",
  },
  {
    question: "هل يمكنني استخدام النظام الإمبراطوري (رطل/قدم)؟",
    answer:
      "نعم، تدعم الحاسبة النظام المتري (كجم/سم) والنظام الإمبراطوري (رطل/قدم/بوصة) مع تحويل تلقائي بين الوحدات.",
  },
  {
    question: "هل مؤشر كتلة الجسم دقيق للجميع؟",
    answer:
      "BMI مؤشر أولي للبالغين (18 سنة فأكثر). قد تكون دلالته أقل دقة للرياضيين ذوي الكتلة العضلية العالية، وكبار السن، والنساء أثناء الحمل. يجب تفسيره مع عوامل صحية أخرى.",
  },
  {
    question: "ما هو BMI Prime؟",
    answer:
      "BMI Prime هو قيمة تُحسب بقسمة BMI على 25 (الحد الأعلى للنطاق الطبيعي). إذا كانت القيمة 1.0 أو أقل، فأنت ضمن النطاق الطبيعي. إذا كانت أكبر، فأنت فوق النطاق.",
  },
  {
    question: "كيف أحسب نطاق الوزن الصحي؟",
    answer:
      "نطاق الوزن الصحي يُحسب بناءً على طولك: الحد الأدنى = 18.5 × (الطول بالمتر)²، والحد الأعلى = 24.9 × (الطول بالمتر)². تعرضه الحاسبة تلقائيًا.",
  },
  {
    question: "هل يمكنني تنزيل تقرير PDF؟",
    answer:
      "نعم، يمكنك تنزيل تقرير PDF يحتوي على نتائج حسابك، نطاق الوزن الصحي، والتوصيات العامة للاحتفاظ بها.",
  },
  {
    question: "هل يختلف مؤشر كتلة الجسم بين الرجال والنساء؟",
    answer:
      "تُستخدم نفس المعادلة لحساب BMI لدى الرجال والنساء البالغين، لكن تفسير النتيجة يجب أن يراعي الظروف الفردية مثل الحمل والرضاعة والكتلة العضلية.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      name: "حاسبة مؤشر كتلة الجسم - Intooly",
      url: PAGE_URL,
      description:
        "حاسبة BMI احترافية مجانية مع نطاق الوزن الصحي، BMI Prime، سجل الحسابات، وتنزيل PDF. معالجة محلية 100%.",
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      inLanguage: ["ar", "en"],
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "حساب BMI فوري للبالغين",
        "دعم كجم/سم ورطل/قدم/بوصة",
        "التصنيف الكامل لمؤشر كتلة الجسم",
        "مؤشر بصري ملون للنتيجة",
        "حساب نطاق الوزن الصحي",
        "حساب BMI Prime",
        "توضيح الفرق عن نطاق الوزن الصحي",
        "سجل آخر 10 حسابات محليًا",
        "مقارنة النتائج السابقة",
        "تنزيل تقرير PDF",
        "نسخ ومشاركة النتيجة",
        "تصميم RTL متجاوب",
        "معالجة محلية دون رفع البيانات",
      ],
    },
    {
      "@type": "MedicalWebPage",
      "@id": PAGE_URL + "#medical",
      name: "حساب مؤشر كتلة الجسم - معلومات صحية",
      url: PAGE_URL,
      description:
        "معلومات تثقيفية عن مؤشر كتلة الجسم وكيفية حسابه وتصنيف الوزن لدى البالغين.",
      specialty: "https://schema.org/Nutrition",
      about: {
        "@type": "MedicalCondition",
        name: "مؤشر كتلة الجسم",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "الأدوات", item: SITE_URL + "/tools" },
        { "@type": "ListItem", position: 3, name: "أدوات الصحة", item: SITE_URL + "/tools/health" },
        { "@type": "ListItem", position: 4, name: "حساب مؤشر كتلة الجسم", item: PAGE_URL },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": PAGE_URL + "#faq",
      mainEntity: faqQuestions.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default function BmiCalculatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}