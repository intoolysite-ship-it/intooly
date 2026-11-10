import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/pregnancy-calculator";

export const metadata: Metadata = {
  title: "حاسبة الحمل – احسبي عمر الحمل وموعد الولادة بالأسابيع والأيام | Intooly",
  description: "استخدمي حاسبة الحمل من Intooly لمعرفة كم أسبوع أنتِ حامل، وحساب موعد الولادة المتوقع وعمر الجنين بالأيام والأسابيع والشهور، مع متابعة مراحل الحمل والتاريخ الهجري والميلادي مجانًا.",
  keywords: [
    "حاسبة الحمل", "حساب الحمل", "حاسبة الحمل والولادة", "حساب أسابيع الحمل", 
    "كم أسبوع أنا حامل", "حاسبة موعد الولادة", "حساب الحمل من آخر دورة", "حاسبة الحمل بالهجري",
    "Pregnancy Calculator", "Due Date Calculator", "Gestational Age Calculator"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "حاسبة الحمل – احسبي عمر الحمل وموعد الولادة بالأسابيع والأيام | Intooly",
    description: "أداة متكاملة ودقيقة لحساب عمر الحمل، موعد الولادة المتوقع، ومتابعة مراحل نمو الجنين بالتقويم الهجري والميلادي.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "كيف أحسب حملي من آخر دورة شهرية؟", a: "أدخلي أول يوم من آخر دورة شهرية في حاسبة الحمل، ثم اضغطي على زر الحساب. ستظهر نتيجة تقديرية لعمر الحمل بالأسابيع والأيام وموعد الولادة المتوقع." },
  { q: "كم أسبوعًا يستمر الحمل؟", a: "يُقدّر الحمل عادةً بنحو 40 أسبوعًا، أي 280 يومًا، عند حسابه من أول يوم في آخر دورة شهرية." },
  { q: "هل حساب الحمل يبدأ من يوم التلقيح؟", a: "لا، الحساب الطبي المعتاد لعمر الحمل يبدأ من أول يوم في آخر دورة شهرية، وليس من يوم الإخصاب." },
  { q: "هل يمكن حساب الحمل إذا كانت الدورة غير منتظمة؟", a: "يمكن إدخال متوسط طول الدورة لتعديل التقدير، لكن يُنصح بتحديد عمر الحمل مع الطبيب باستخدام السونار في هذه الحالة." },
  { q: "هل يمكن استخدام الحاسبة بعد الحقن المجهري؟", a: "نعم، بشرط إدخال تاريخ نقل الجنين وعمره وقت النقل (3 أيام أو 5 أيام)، مع مراجعة موعد الولادة الذي حدده مركز الإخصاب." },
  { q: "هل تعرض حاسبة الحمل موعد الولادة بالهجري؟", a: "نعم، تعرض الحاسبة موعد الولادة المتوقع بالتاريخ الميلادي والهجري بدقة." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      "name": "حاسبة الحمل وموعد الولادة - Intooly",
      "url": PAGE_URL,
      "description": "أداة متكاملة ودقيقة لحساب عمر الحمل، موعد الولادة المتوقع، ومتابعة مراحل نمو الجنين بالتقويم الهجري والميلادي.",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Any",
      "inLanguage": ["ar", "en"],
      "isAccessibleForFree": true,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "الأدوات", "item": SITE_URL + "/tools" },
        { "@type": "ListItem", "position": 3, "name": "الصحة واللياقة البدنية", "item": SITE_URL + "/tools/health" },
        { "@type": "ListItem", "position": 4, "name": "حاسبة الحمل", "item": PAGE_URL }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": PAGE_URL + "#faq",
      "mainEntity": faqQuestions.map((item) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a }
      }))
    }
  ]
};

export default function PregnancyCalculatorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}