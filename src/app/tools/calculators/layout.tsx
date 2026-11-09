import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/calculators";

export const metadata: Metadata = {
  title: "حاسبات وأدوات حسابية أونلاين مجانًا – حاسبة BMI، العمر، السعرات | Intooly",
  description: "استخدم مجموعة الحاسبات والأدوات الحسابية المجانية من Intooly. حاسبة مؤشر كتلة الجسم، حاسبة العمر، حاسبة السعرات الحرارية، وأدوات حسابية دقيقة وسريعة أونلاين.",
  keywords: [
    "حاسبات أونلاين", "أدوات حسابية", "حاسبة مؤشر كتلة الجسم", "حاسبة العمر", 
    "حاسبة السعرات الحرارية", "حساب النسب المئوية", "أدوات حسابية مجانية", 
    "Online Calculators", "Free Calculators", "BMI Calculator Online"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "حاسبات وأدوات حسابية أونلاين مجانًا | Intooly",
    description: "مجموعة شاملة من الحاسبات والأدوات الحسابية الدقيقة والمجانية. احسب مؤشر كتلة الجسم، العمر، السعرات، والنسب المئوية بسهولة.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "ما هي الحاسبات والأدوات الحسابية المتاحة في Intooly؟", a: "نوفر مجموعة متنوعة من الحاسبات المجانية مثل حاسبة مؤشر كتلة الجسم (BMI)، حاسبة العمر الدقيقة، حاسبة السعرات الحرارية، وحاسبة النسب المئوية، مع دقة عالية وسرعة في النتائج." },
  { q: "هل هذه الحاسبات مجانية تماماً؟", a: "نعم، جميع الحاسبات والأدوات الحسابية في Intooly مجانية تماماً للاستخدام الشخصي والمهني دون أي رسوم مخفية." },
  { q: "هل تحافظون على خصوصية البيانات المدخلة في الحاسبات؟", a: "بالتأكيد. جميع عمليات الحساب تتم محلياً داخل متصفحك (Client-Side). لا يتم إرسال أي بيانات صحية أو شخصية إلى خوادمنا، مما يضمن خصوصيتك بنسبة 100%." },
  { q: "هل يمكن استخدام هذه الحاسبات من الهاتف المحمول؟", a: "نعم، جميع أدواتنا مصممة لتكون متجاوبة تماماً (Responsive) وتعمل بسلاسة على الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر." },
  { q: "هل نتائج حاسبة مؤشر كتلة الجسم (BMI) دقيقة طبياً؟", a: "تعتمد الحاسبة على المعادلات الرياضية المعتمدة عالمياً من منظمة الصحة العالمية. ومع ذلك، تُعد هذه النتائج للمعلومات العامة ولا تغني عن استشارة الطبيب المتخصص." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": PAGE_URL + "#webpage",
      url: PAGE_URL,
      name: "حاسبات وأدوات حسابية أونلاين مجانًا | Intooly",
      description: "مجموعة شاملة من الحاسبات والأدوات الحسابية الدقيقة والمجانية.",
      inLanguage: "ar"
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "الأدوات", item: SITE_URL + "/tools" },
        { "@type": "ListItem", position: 3, name: "الحاسبات والأدوات الحسابية", item: PAGE_URL }
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

export default function CalculatorsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}