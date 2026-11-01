
import type { Metadata } from "next";
import type { ReactNode } from "react";

const PAGE_URL = "https://intooly.com/tools/audio-to-text";

export const metadata: Metadata = {
  title: "تحويل الصوت الى نص عربي وإنجليزي مجانًا | Intooly",

  description:
    "حوّل الصوت إلى نص مكتوب بالعربية والإنجليزية مجانًا باستخدام Whisper AI. فرّغ تسجيلات MP3 وWAV، وعدّل النص وانسخه أو نزّله بسهولة.",

  alternates: {
    canonical: PAGE_URL,
  },

  openGraph: {
    title: "تحويل الصوت الى نص عربي وإنجليزي | Intooly",
    description:
      "أداة ذكية لتحويل الملفات الصوتية إلى نص مكتوب وتفريغ التسجيلات والمحاضرات والاجتماعات بسهولة.",
    url: PAGE_URL,
    siteName: "Intooly",
    locale: "ar_EG",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "تحويل الصوت الى نص | Intooly",
    description:
      "حوّل التسجيلات الصوتية إلى نص عربي أو إنجليزي باستخدام Whisper AI.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const faqQuestions = [
  {
    question: "هل يمكن تحويل الصوت إلى نص عربي مجانًا؟",
    answer:
      "نعم، يمكنك استخدام مسار Whisper لتحويل الملفات الصوتية إلى نص عربي داخل المتصفح دون رفع الملف إلى خادم Intooly. قد تحتاج إلى اتصال بالإنترنت لتنزيل النموذج أول مرة.",
  },
  {
    question: "هل تدعم الأداة تحويل الصوت إلى نص بالإنجليزية؟",
    answer:
      "نعم، يمكنك اختيار الإنجليزية من قائمة اللغة قبل التحويل، كما يمكنك اختيار الاكتشاف التلقائي للغة.",
  },
  {
    question: "هل يمكن تحويل ملفات MP3 وWAV إلى نص؟",
    answer:
      "يمكن استخدام ملفات MP3 وWAV إذا كان المتصفح والجهاز يدعمان فك ترميز الملف. وقد تختلف الصيغ القابلة للفتح من متصفح إلى آخر.",
  },
  {
    question: "هل يتم رفع الملفات الصوتية إلى خادم الموقع؟",
    answer:
      "في مسار تحويل الملفات باستخدام Whisper تتم المعالجة داخل المتصفح ولا تتطلب وظيفة التحويل رفع الملف إلى خادم Intooly. أما التسجيل المباشر فيستخدم Web Speech API وقد يعتمد على خدمات خارجية.",
  },
  {
    question: "هل يمكن تعديل النص بعد تحويل الصوت؟",
    answer:
      "نعم، يمكنك تعديل النص مباشرة داخل مربع النتائج، ثم نسخه أو تنزيله كملف TXT.",
  },
  {
    question: "لماذا لا يعمل تحويل بعض الملفات الصوتية؟",
    answer:
      "قد يكون السبب عدم دعم المتصفح لترميز الملف أو تلف التسجيل أو عدم توفر الذاكرة الكافية. جرّب تصدير الصوت إلى WAV أو MP3 قياسي ثم أعد المحاولة.",
  },
  {
    question: "هل يمكن تفريغ المحاضرات والاجتماعات الطويلة؟",
    answer:
      "يمكن تجربة التسجيلات الطويلة، لكن وقت المعالجة واستهلاك الذاكرة يزدادان مع طول الملف. وقد تتأثر العملية بقدرات الجهاز والمتصفح.",
  },
  {
    question: "هل تحتاج الأداة إلى تثبيت برنامج؟",
    answer:
      "لا تحتاج إلى تثبيت برنامج مستقل. يعمل محرك تحويل الملفات في المتصفح بعد تحميل نموذج Whisper، بينما يحتاج التسجيل المباشر إلى متصفح يدعم Web Speech API.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${PAGE_URL}#application`,
      name: "تحويل الصوت الى نص - Intooly",
      url: PAGE_URL,
      description:
        "أداة لتحويل الملفات الصوتية إلى نص عربي وإنجليزي باستخدام نموذج Whisper داخل المتصفح، مع دعم التسجيل المباشر في المتصفحات المتوافقة.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements:
        "A modern browser with JavaScript, WebAssembly and Audio API support.",
      inLanguage: ["ar", "en"],
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "تحويل الملفات الصوتية إلى نص",
        "التعرف على الكلام باللغة العربية",
        "التعرف على الكلام باللغة الإنجليزية",
        "اكتشاف اللغة تلقائيًا",
        "تسجيل الكلام المباشر عبر Web Speech API",
        "تحرير النص الناتج",
        "نسخ النص وتنزيله بصيغة TXT",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
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

export default function AudioToTextLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {children}
    </>
  );
}
