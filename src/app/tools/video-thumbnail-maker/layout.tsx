import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/video-thumbnail-maker";

export const metadata: Metadata = {
  title: "إنشاء صور مصغّرة للفيديو مجانًا أونلاين | صانع Thumbnail لليوتيوب - Intooly",
  description:
    "أنشئ صورة مصغّرة احترافية لفيديوهات YouTube مجانًا. استخرج لقطات من الفيديو مباشرة، أضف عناوين عربية جذابة، ونزّل التصميم بمقاس 1280×720 بصيغتي PNG وJPG. معالجة محلية 100% داخل متصفحك.",
  keywords: [
    "إنشاء صور مصغرة للفيديو",
    "صانع Thumbnail",
    "تصميم صور يوتيوب",
    "صورة مصغرة يوتيوب",
    "YouTube Thumbnail Maker",
    "تصميم غلاف فيديو",
    "صانع صور مصغرة عربي",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "صانع الصور المصغّرة للفيديو مجانًا أونلاين | Intooly",
    description:
      "صمّم صوراً مصغّرة احترافية لفيديوهات YouTube. استخرج لقطات من الفيديو، وأضف عناوين جذابة.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const faqQuestions = [
  {
    question: "هل أداة إنشاء الصور المصغّرة مجانية بالكامل؟",
    answer: "نعم، جميع الميزات متاحة مجانًا بدون تسجيل أو علامات مائية.",
  },
  {
    question: "هل يمكن استخراج صورة من فيديو لاستخدامها كخلفية؟",
    answer: "نعم، يمكنك رفع ملف فيديو، تحريك الشريط الزمني لاختيار اللقطة المثالية، والضغط على التقاط لتحويلها فورًا إلى خلفية.",
  },
  {
    question: "هل يتم رفع صوري أو فيديوهاتي إلى خادم الموقع؟",
    answer: "لا على الإطلاق. جميع عمليات المعالجة تتم محليًا داخل متصفحك.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      name: "صانع الصور المصغّرة للفيديو - Intooly",
      url: PAGE_URL,
      description: "أداة احترافية لإنشاء صور مصغّرة لفيديوهات YouTube مع ميزات متقدمة مثل استخراج الإطارات من الفيديو.",
      applicationCategory: "DesignApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "استخراج إطارات من الفيديو محليًا",
        "نظام طبقات متقدم مع سحب وإفلات",
        "نسخ وقفل وترتيب الطبقات",
        "نظام التراجع والإعادة (Undo/Redo)",
        "معاينة YouTube حية",
        "مولد عناوين فيرال محلي",
        "تحليل التصميم واقتراح التحسينات",
        "حفظ هوية القناة محليًا",
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "الأدوات", item: SITE_URL + "/tools" },
        { "@type": "ListItem", position: 3, name: "أدوات الفيديو", item: SITE_URL + "/tools/video" },
        { "@type": "ListItem", position: 4, name: "إنشاء صور مصغّرة للفيديو", item: PAGE_URL },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqQuestions.map((item: any) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default function VideoThumbnailMakerLayout({
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