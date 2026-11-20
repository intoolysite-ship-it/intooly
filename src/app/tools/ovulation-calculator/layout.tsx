import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/ovulation-calculator";

export const metadata: Metadata = {
  title: "حاسبة التبويض وأيام الخصوبة بالهجري والميلادي مجانًا | Intooly",
  description:
    "احسبي موعد التبويض وأيام الخصوبة بعد الدورة الشهرية مجانًا. تدعم الدورة المنتظمة وغير المنتظمة، وتعرض المواعيد التقديرية بالتقويمين الهجري والميلادي مع تقويم تفاعلي.",
  keywords: [
    "حاسبة التبويض",
    "حساب التبويض",
    "حاسبة أيام التبويض",
    "حساب أيام التبويض بعد الدورة",
    "حاسبة التبويض والحمل",
    "أيام التبويض",
    "موعد الإباضة",
    "حساب فترة الخصوبة",
    "أيام الخصوبة",
    "تحديد فترة التبويض",
    "حاسبة التبويض بالهجري",
    "حاسبة التبويض بالميلادي",
    "حساب التبويض للدورة المنتظمة",
    "حساب التبويض للدورة غير المنتظمة",
    "متى يكون التبويض",
    "Ovulation Calculator",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "حاسبة التبويض وأيام الخصوبة مجانًا | Intooly",
    description:
      "احسبي موعد الإباضة ونطاق الخصوبة التقديري حسب طول الدورة الشهرية، مع عرض التواريخ بالهجري والميلادي. الحسابات تتم محليًا في المتصفح.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  twitter: {
    card: "summary_large_image",
    title: "حاسبة التبويض بالهجري والميلادي | Intooly",
    description:
      "احسبي موعد التبويض ونطاق الخصوبة التقديري للدورة المنتظمة وغير المنتظمة مجانًا.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const faqQuestions = [
  {
    question: "كيف أحسب أيام التبويض بعد الدورة الشهرية؟",
    answer:
      "أدخلي أول يوم من آخر دورة شهرية وطول دورتك المعتاد. تعرض الحاسبة موعد الإباضة ونافذة الخصوبة بصورة تقديرية.",
  },
  {
    question: "متى يكون التبويض في دورة مدتها 28 يومًا؟",
    answer:
      "تقدّر الحاسبة موعد الإباضة بالرجوع نحو 14 يومًا من موعد الدورة التالية المتوقع. وقد يختلف الموعد الفعلي من دورة لأخرى.",
  },
  {
    question: "هل يمكن حساب التبويض إذا كانت الدورة غير منتظمة؟",
    answer:
      "يمكن إدخال أقصر وأطول دورة شهرية للحصول على نطاق تقديري، لكن الحساب التقويمي يكون أقل موثوقية عند عدم انتظام الدورة.",
  },
  {
    question: "ما مدة نافذة الخصوبة؟",
    answer:
      "تُقدّر نافذة الخصوبة عادةً بالأيام الخمسة السابقة للإباضة ويوم الإباضة، لكن توقيت الخصوبة الفعلي قد يختلف.",
  },
  {
    question: "هل يمكن الاعتماد على الحاسبة لمنع الحمل؟",
    answer:
      "لا. هذه الحاسبة أداة تقديرية وليست وسيلة لمنع الحمل، ولا يمكن الاعتماد على التقويم وحده لتجنب الحمل.",
  },
  {
    question: "هل نتائج حاسبة التبويض دقيقة 100%؟",
    answer:
      "لا. تعتمد النتائج على متوسطات وتقويم الدورة الشهرية، وقد يتغير موعد الإباضة بسبب عوامل متعددة.",
  },
  {
    question: "هل تعرض الحاسبة التاريخ الهجري؟",
    answer:
      "نعم، تعرض الحاسبة التواريخ الميلادية والهجرية لتسهيل متابعة المواعيد، وقد يختلف التاريخ الهجري يومًا حسب التقويم المعتمد.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      name: "حاسبة التبويض - Intooly",
      url: PAGE_URL,
      description:
        "حاسبة مجانية لتقدير موعد الإباضة ونطاق الخصوبة والدورة التالية حسب طول الدورة الشهرية، مع عرض التواريخ الهجرية والميلادية.",
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      inLanguage: "ar",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "تقدير موعد الإباضة للدورة المنتظمة",
        "تقدير نطاق الإباضة للدورة غير المنتظمة",
        "تقدير نطاق الخصوبة",
        "تقدير موعد الدورة الشهرية التالية",
        "عرض التواريخ بالتقويم الميلادي",
        "عرض التواريخ بالتقويم الهجري",
        "تقويم شهري تفاعلي",
        "معالجة الحسابات محليًا داخل المتصفح",
        "لا يتطلب التسجيل",
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
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
          name: "الأدوات",
          item: SITE_URL + "/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "الصحة واللياقة البدنية",
          item: SITE_URL + "/tools/health-fitness",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "حاسبة التبويض",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": PAGE_URL + "#faq",
      mainEntity: faqQuestions.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function OvulationCalculatorLayout({
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
