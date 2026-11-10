import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/barcode-reader";

export const metadata: Metadata = {
  title: "قارئ الباركود أونلاين مجانًا – قراءة الباركود من الصور والكاميرا | Intooly",
  description: "استخدم قارئ الباركود المجاني من Intooly لقراءة وفك رموز EAN وUPC وCode 128 وISBN وغيرها من الكاميرا أو الصور. امسح الباركود بسهولة، واعرض النتيجة وانسخها دون تثبيت تطبيق.",
  keywords: [
    "قارئ الباركود", "قراءة الباركود", "ماسح الباركود", "فك شفرة الباركود", "قارئ باركود أونلاين",
    "Barcode Reader", "Online Barcode Scanner", "EAN-13 Reader", "UPC Scanner", "QR Code Reader"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "قارئ الباركود أونلاين مجانًا – قراءة الباركود من الصور والكاميرا | Intooly",
    description: "أداة متقدمة لقراءة وتحليل الباركود من الكاميرا أو الصور محلياً مع دعم تحليل GS1 ووضع الجرد.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "ما هو قارئ الباركود؟", a: "قارئ الباركود هو أداة تقوم بمسح الرمز الشريطي وفك ترميزه لاستخراج الأرقام أو النصوص أو البيانات المخزنة بداخله، ويمكن استخدامه لقراءة رموز المنتجات والشحن والكتب وغيرها." },
  { q: "كيف أقرأ الباركود أونلاين؟", a: "افتح قارئ الباركود من Intooly، ثم اختر رفع صورة أو تشغيل الكاميرا، ووجّه الكاميرا نحو الرمز أو حمّل الصورة التي تحتوي عليه. بعد التعرف عليه ستظهر البيانات المستخرجة ويمكنك نسخها." },
  { q: "هل يمكن قراءة الباركود من صورة أو لقطة شاشة؟", a: "نعم، يمكنك رفع صورة تحتوي على باركود أو لصق لقطة شاشة مباشرة (Ctrl+V) إلى الأداة، وستحاول التعرف على الرموز الموجودة فيها وفك ترميزها." },
  { q: "ما أنواع الباركود التي يدعمها القارئ؟", a: "يدعم القارئ أنواعاً واسعة مثل EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF, ISBN, Data Matrix, PDF417, Aztec, و QR Code." },
  { q: "هل يتم رفع الصور إلى خادم عند استخدام قارئ الباركود؟", a: "لا، الأداة مصممة لمعالجة الصور وفك الترميز محلياً داخل متصفحك فقط، مما يضمن خصوصية تامة لبياناتك وصورك." },
  { q: "هل قراءة الباركود تعني أن المنتج أصلي؟", a: "لا. قراءة الباركود تعني أن الأداة استطاعت استخراج البيانات المخزنة داخل الرمز فقط. للتحقق من الأصالة، يجب الرجوع إلى قواعد بيانات موثوقة أو الشركة المصنعة." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      "name": "قارئ الباركود - Intooly",
      "url": PAGE_URL,
      "description": "أداة متقدمة لقراءة وتحليل الباركود من الكاميرا أو الصور محلياً مع دعم تحليل GS1 ووضع الجرد.",
      "applicationCategory": "UtilityApplication",
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
        { "@type": "ListItem", "position": 3, "name": "أدوات الإنتاجية", "item": SITE_URL + "/tools/productivity" },
        { "@type": "ListItem", "position": 4, "name": "قارئ الباركود", "item": PAGE_URL }
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

export default function BarcodeReaderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}