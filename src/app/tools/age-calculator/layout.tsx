import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/age-calculator";

export const metadata: Metadata = {
  title: "حاسبة العمر – احسب عمرك بالسنوات والأشهر والأيام بدقة | Intooly",
  description: "استخدم حاسبة العمر المجانية من Intooly لمعرفة عمرك بالسنوات والأشهر والأيام، وحساب العمر بالهجري والميلادي، ومعرفة موعد عيد ميلادك القادم وإجمالي الأيام التي عشتها بسهولة ودقة.",
  keywords: [
    "حاسبة العمر", "حساب العمر", "احسب عمرك", "حاسبة العمر بالميلادي", "حاسبة العمر بالهجري",
    "حاسبة العمر بالأيام", "معرفة كم عمري", "حساب فرق العمر بين شخصين", "Age Calculator", "Hijri Age Calculator"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "حاسبة العمر – احسب عمرك بالسنوات والأشهر والأيام بدقة | Intooly",
    description: "احسب عمرك بالتفصيل، واعرف موعد عيد ميلادك القادم، وإجمالي الأيام التي عشتها، مع دعم التقويم الهجري والميلادي.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "كيف تعمل حاسبة العمر؟", a: "تعمل حاسبة العمر من خلال إدخال تاريخ الميلاد ومقارنته بتاريخ اليوم أو التاريخ الذي تختاره. ثم تحسب السنوات والأشهر والأيام المكتملة، وتعرض تفاصيل العمر وإجمالي الأيام التي مرت منذ تاريخ الميلاد." },
  { q: "كيف أحسب عمري بالسنوات والأشهر والأيام؟", a: "أدخل تاريخ ميلادك في حاسبة العمر، ثم اضغط على زر الحساب. ستظهر لك النتيجة بالسنوات والأشهر والأيام، دون الحاجة إلى إجراء أي عمليات حسابية بنفسك." },
  { q: "هل حاسبة العمر دقيقة؟", a: "نعم، تعتمد دقة حاسبة العمر على الحساب التقويمي الصحيح، ومراعاة اختلاف عدد أيام الأشهر والسنوات الكبيسة، والتأكد من صحة تاريخ الميلاد والتاريخ المرجعي." },
  { q: "كيف أحسب عمري بالهجري؟", a: "تقوم الأداة بعرض التاريخ الهجري المقابل لتاريخ ميلادك تلقائياً باستخدام تقويم أم القرى المعتمد، لتعرف عمرك وفق التقويم الهجري بدقة." },
  { q: "كيف أعرف عدد الأيام التي عشتها؟", a: "أدخل تاريخ ميلادك في الحاسبة، وستتم مقارنة تاريخ الميلاد بتاريخ الحساب لمعرفة إجمالي الأيام التي مرت منذ ولادتك." },
  { q: "هل يمكن حساب العمر في تاريخ مستقبلي؟", a: "نعم، يمكنك تحديد تاريخ مستقبلي لمعرفة العمر الذي ستبلغه في ذلك الموعد، مثل موعد بداية الدراسة أو التقديم لوظيفة." },
  { q: "كيف أعرف موعد عيد ميلادي القادم؟", a: "بعد إدخال تاريخ ميلادك، تقوم حاسبة العمر بحساب موعد عيد ميلادك التالي، وتعرض عدد الأيام المتبقية ويوم الأسبوع الذي سيوافقه." },
  { q: "هل يمكن حساب فرق العمر بين شخصين؟", a: "نعم، باستخدام ميزة مقارنة العمر يمكنك إدخال تاريخ ميلاد شخصين، ومعرفة من الأكبر سنًا والفارق بينهما بالسنوات والأشهر والأيام." },
  { q: "هل يمكن حساب عمر الطفل بالشهور والأيام؟", a: "نعم، يمكن استخدام الحاسبة لمعرفة عمر الطفل بالأشهر والأسابيع والأيام، وهي وحدات مفيدة خصوصًا عند حساب أعمار الرضع والأطفال الصغار." },
  { q: "هل يتم إرسال تاريخ ميلادي إلى الإنترنت؟", a: "لا، تُنفذ عمليات الحساب محليًا داخل المتصفح، ولا تحتاج الأداة إلى إرسال تاريخ الميلاد إلى خادم خارجي، مما يضمن خصوصيتك الكاملة." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      "name": "حاسبة العمر - Intooly",
      "alternateName": "Age Calculator",
      "url": PAGE_URL,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "isAccessibleForFree": true,
      "inLanguage": "ar",
      "description": "حاسبة العمر المجانية لحساب العمر بالسنوات والأشهر والأيام ومعرفة تفاصيل تاريخ الميلاد بدقة وخصوصية."
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "الأدوات", "item": SITE_URL + "/tools" },
        { "@type": "ListItem", "position": 3, "name": "الأدوات الحسابية", "item": SITE_URL + "/tools/productivity" },
        { "@type": "ListItem", "position": 4, "name": "حاسبة العمر", "item": PAGE_URL }
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

export default function AgeCalculatorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}