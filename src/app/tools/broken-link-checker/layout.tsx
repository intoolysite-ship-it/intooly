import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/broken-link-checker";

export const metadata: Metadata = {
  title: "فاحص الروابط المعطلة أونلاين مجانًا – Broken Link Checker | Intooly",
  description:
    "افحص الروابط المعطلة والتالفة في موقعك مجانًا باستخدام فاحص الروابط المعطلة من Intooly. اكتشف روابط 404 والروابط المكسورة والروابط التي لا تعمل بسهولة.",
  keywords: [
    "فاحص الروابط المعطلة",
    "فحص الروابط التالفة",
    "فحص الروابط المكسورة",
    "كاشف الروابط المعطلة",
    "اكتشاف روابط 404",
    "Broken Link Checker",
    "Free Broken Link Checker",
    "Website Link Checker",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "فاحص الروابط المعطلة أونلاين مجانًا | Intooly",
    description: "افحص الروابط المعطلة والتالفة في موقعك مجانًا باستخدام فاحص الروابط المعطلة من Intooly. اكتشف روابط 404 والروابط المكسورة بسهولة.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { question: "ما هو فاحص الروابط المعطلة؟", answer: "فاحص الروابط المعطلة هو أداة تستخدم للتحقق من صلاحية روابط صفحات الويب واكتشاف الروابط التي تؤدي إلى صفحات غير موجودة أو لا يمكن الوصول إليها." },
  { question: "كيف أفحص الروابط المعطلة في موقعي؟", answer: "أدخل رابط الصفحة التي تريد فحصها في أداة Broken Link Checker، ثم ابدأ الفحص واستعرض الروابط التي تم التحقق منها لمعرفة حالتها." },
  { question: "ما معنى Broken Link؟", answer: "مصطلح Broken Link يعني رابطًا معطلًا أو مكسورًا لا يستطيع المستخدم الوصول من خلاله إلى الصفحة أو المورد المستهدف بالشكل المتوقع." },
  { question: "ما هو خطأ 404 في الروابط؟", answer: "خطأ 404 هو رمز استجابة HTTP يشير إلى أن الصفحة المطلوبة غير موجودة على الخادم، وغالبًا يحدث بسبب حذف الصفحة أو تغيير عنوانها." },
  { question: "هل تؤثر الروابط المعطلة على ترتيب الموقع في Google؟", answer: "قد تؤثر الروابط المعطلة بصورة غير مباشرة على جودة تجربة المستخدم، لكن وجود رابط معطل لا يعني تلقائيًا تعرض الموقع لعقوبة من Google." },
  { question: "ما الفرق بين الروابط الداخلية والخارجية؟", answer: "الروابط الداخلية تربط صفحات الموقع الواحد، أما الروابط الخارجية فتشير إلى صفحات موجودة على مواقع ونطاقات أخرى." },
  { question: "هل يمكن فحص الروابط الخارجية؟", answer: "نعم، يمكن التحقق من الروابط الخارجية لمعرفة ما إذا كانت الصفحات المستهدفة متاحة، مع مراعاة أن بعض المواقع تمنع أدوات الفحص الآلي." },
  { question: "كيف أصلح الروابط المعطلة؟", answer: "يمكن إصلاحها بتحديث عنوان URL، أو إعادة توجيه الرابط إلى صفحة بديلة مناسبة (301)، أو استبدال الرابط الخارجي بمصدر موثوق، أو حذفه." },
  { question: "هل فحص الروابط المعطلة مجاني؟", answer: "نعم، يمكنك استخدام أداة فاحص الروابط المعطلة من Intooly مجانًا مباشرة من المتصفح." },
  { question: "هل أحتاج إلى تثبيت برنامج لفحص الروابط؟", answer: "لا، تعمل الأداة مباشرة من متصفح الإنترنت دون الحاجة إلى تثبيت أي برامج إضافية." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      name: "فاحص الروابط المعطلة - Intooly",
      url: PAGE_URL,
      description: "أداة مجانية لفحص واكتشاف الروابط المعطلة والتالفة وروابط 404 في صفحات الويب.",
      applicationCategory: "SEOApplication",
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
        { "@type": "ListItem", position: 3, name: "أدوات SEO", item: SITE_URL + "/tools/seo" },
        { "@type": "ListItem", position: 4, name: "فاحص الروابط المعطلة", item: PAGE_URL }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": PAGE_URL + "#faq",
      mainEntity: faqQuestions.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer }
      }))
    }
  ]
};

export default function BrokenLinkCheckerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}