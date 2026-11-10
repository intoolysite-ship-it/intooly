import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/percentage-calculator";

export const metadata: Metadata = {
  title: "حساب النسبة المئوية أونلاين – حاسبة النسبة والخصم والزيادة | Intooly",
  description: "استخدم حاسبة حساب النسبة المئوية المجانية من Intooly لحساب نسبة رقم من رقم، والزيادة والنقصان، والخصومات والضرائب، ومعرفة الفرق والتغير بين الأرقام بسهولة ودقة.",
  keywords: [
    "حساب النسبة المئوية", "حاسبة النسبة المئوية", "حساب نسبة رقم من رقم", "حساب الزيادة بالنسبة المئوية",
    "حساب النقصان بالنسبة المئوية", "حساب الخصم بالنسبة المئوية", "حساب السعر بعد الخصم", "حساب الضريبة",
    "Percentage Calculator", "Calculate Percentage", "Percentage Increase", "Discount Calculator"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "حساب النسبة المئوية أونلاين – حاسبة النسبة والخصم والزيادة | Intooly",
    description: "حاسبة شاملة لحساب النسب المئوية، الخصومات، الزيادات، الضرائب، وتحويل النسب إلى كسور وأعداد عشرية بدقة.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "كيف أحسب النسبة المئوية من رقم؟", a: "اضرب الرقم في النسبة المئوية ثم اقسم الناتج على 100. مثال: 20% من 300 تساوي 300 × 20 ÷ 100 = 60." },
  { q: "كيف أحسب نسبة رقم من إجمالي؟", a: "اقسم الجزء على الإجمالي ثم اضرب الناتج في 100. مثال: 40 من أصل 200 تساوي (40 ÷ 200) × 100 = 20%." },
  { q: "كيف أحسب الزيادة بالنسبة المئوية؟", a: "اطرح القيمة الأصلية من القيمة الجديدة، ثم اقسم الفرق على القيمة الأصلية واضرب الناتج في 100." },
  { q: "كيف أعرف السعر الأصلي قبل الخصم؟", a: "اقسم السعر بعد الخصم على (1 − نسبة الخصم ÷ 100). مثال: سعر 80 بعد خصم 20% يعني أن السعر الأصلي كان 100." },
  { q: "كيف أحسب نسبة النجاح في الامتحان؟", a: "اقسم مجموع الدرجات التي حصلت عليها على مجموع الدرجات الكلية، ثم اضرب الناتج في 100." },
  { q: "كيف أحول النسبة المئوية إلى عدد عشري؟", a: "اقسم النسبة على 100. على سبيل المثال، 75% تساوي 0.75." },
  { q: "هل يمكن أن تكون النسبة المئوية أكبر من 100%؟", a: "نعم، يمكن أن تتجاوز النسبة 100% إذا كانت قيمة الجزء أكبر من الإجمالي المرجعي. على سبيل المثال، 150 من 100 تساوي 150%." },
  { q: "ما الفرق بين النسبة المئوية والتغير المئوي؟", a: "النسبة المئوية تعبر عن جزء من إجمالي، بينما التغير المئوي يقيس مقدار ارتفاع أو انخفاض قيمة مقارنة بقيمتها الأصلية." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      name: "حاسبة النسبة المئوية - Intooly",
      url: PAGE_URL,
      description: "حاسبة شاملة ودقيقة لحساب النسب المئوية، الخصومات، الزيادات، الضرائب، وتحويل النسب.",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      inLanguage: ["ar", "en"],
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "الأدوات", item: SITE_URL + "/tools" },
        { "@type": "ListItem", position: 3, name: "الحاسبات والأدوات الحسابية", item: SITE_URL + "/tools/calculators" },
        { "@type": "ListItem", position: 4, name: "حاسبة النسبة المئوية", item: PAGE_URL }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": PAGE_URL + "#faq",
      mainEntity: faqQuestions.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a }
      }))
    }
  ]
};

export default function PercentageCalculatorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}