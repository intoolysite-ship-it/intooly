import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/video-thumbnail-maker";

export const metadata: Metadata = {
  title: "إنشاء صور مصغّرة للفيديو مجانًا أونلاين | صانع Thumbnail لليوتيوب - Intooly",
  description:
    "أنشئ صورة مصغّرة احترافية لفيديوهات YouTube مجانًا. استخرج لقطات من الفيديو مباشرة، قص الصور، طبّق الفلاتر، أضف عناوين عربية جذابة، ونزّل التصميم بمقاس 1280×720 بصيغتي PNG وJPG. معالجة محلية 100% داخل متصفحك.",
  keywords: [
    "إنشاء صور مصغرة للفيديو",
    "صانع Thumbnail",
    "تصميم صور يوتيوب",
    "صورة مصغرة يوتيوب",
    "YouTube Thumbnail Maker",
    "تصميم غلاف فيديو",
    "صانع صور مصغرة عربي",
    "استخراج إطار من فيديو",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "صانع الصور المصغّرة للفيديو مجانًا أونلاين | Intooly",
    description:
      "صمّم صوراً مصغّرة احترافية لفيديوهات YouTube. استخرج لقطات من الفيديو، قص الصور، طبّق الفلاتر، وأضف عناوين جذابة.",
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
    answer: "نعم، جميع الميزات متاحة مجانًا بدون تسجيل أو علامات مائية، بما في ذلك استخراج الإطارات من الفيديو والفلاتر والقص.",
  },
  {
    question: "هل يمكن استخراج صورة من فيديو لاستخدامها كخلفية؟",
    answer: "نعم، يمكنك رفع ملف فيديو (MP4 أو WebM)، تحريك الشريط الزمني لاختيار اللقطة المثالية، والضغط على 'التقاط' لتحويلها فورًا إلى خلفية قابلة للتحرير.",
  },
  {
    question: "هل يمكن قص الخلفية أو تدويرها؟",
    answer: "نعم، يمكنك قص أي منطقة من الخلفية، تدويرها بأي زاوية، وقلبها أفقيًا أو رأسيًا.",
  },
  {
    question: "هل يمكن تطبيق فلاتر على الخلفية؟",
    answer: "نعم، يمكنك تعديل السطوع، التباين، التشبع، الضبابية، والتدرج الرمادي للخلفية لتحسين مظهرها.",
  },
  {
    question: "هل يتم رفع صوري أو فيديوهاتي إلى خادم الموقع؟",
    answer: "لا على الإطلاق. جميع عمليات المعالجة تتم محليًا داخل متصفحك. لا يتم إرسال أي ملفات إلى خوادم Intooly.",
  },
  {
    question: "هل يمكنني حفظ هوية قناتي لاستخدامها لاحقًا؟",
    answer: "نعم، يتم حفظ اسم قناتك وألوانك تلقائيًا في متصفحك (localStorage)، ويمكنك استخدامها في كل تصميم جديد.",
  },
  {
    question: "هل الأداة تعمل على الهاتف؟",
    answer: "نعم، الأداة متجاوبة 100% وتعمل بسلاسة على الهواتف الذكية والأجهزة اللوحية.",
  },
  {
    question: "ما مقاس الصورة المصغّرة الناتجة؟",
    answer: "المقاس الافتراضي هو 1280×720 بكسل (نسبة 16:9)، وهو المقاس المثالي والمعتمد من YouTube.",
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
      description:
        "أداة احترافية لإنشاء صور مصغّرة لفيديوهات YouTube مع ميزات متقدمة مثل استخراج الإطارات من الفيديو، قص الصور، الفلاتر، التدوير، ومولد عناوين فيرال.",
      applicationCategory: "DesignApplication",
      operatingSystem: "Any",
      inLanguage: ["ar", "en"],
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "استخراج إطارات من الفيديو محليًا",
        "قص الصور وتحرير المناطق",
        "فلاتر صور متقدمة (سطوع، تباين، تشبع، ضبابية، تدرج رمادي)",
        "تدوير وقلب الصور",
        "نظام طبقات متقدم مع سحب وإفلات",
        "نسخ وقفل وترتيب الطبقات",
        "نظام التراجع والإعادة (Undo/Redo)",
        "معاينة YouTube حية",
        "مولد عناوين فيرال محلي",
        "تحليل التصميم واقتراح التحسينات",
        "حفظ هوية القناة محليًا",
        "توليد نسخ متعددة بألوان مختلفة",
        "8 قوالب احترافية جاهزة",
        "دعم كامل للغة العربية",
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "الأدوات", item: SITE_URL + "/tools" },
        { "@type": "ListItem", position: 3, name: "أدوات الفيديو", item: SITE_URL + "/tools/video" },
        { "@type": "ListItem", position: 4, name: "إنشاء صور مصغّرة للفيديو", item: PAGE_URL },
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