import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/song-cutter";

export const metadata: Metadata = {
  title: "قص الأغاني MP3 أونلاين مجانًا – تقطيع الأغاني وإنشاء نغمات رنين | Intooly",
  description: "استخدم أداة قص الأغاني من Intooly لقص ملفات MP3 وتقطيع الأغاني بدقة، وتحديد المقاطع ومعاينتها وإنشاء نغمات رنين، ودمج المقاطع الصوتية وتنزيلها بسهولة مجانًا.",
  keywords: [
    "قص الاغاني", "قص الاغاني MP3", "قص الأغاني أونلاين", "تقطيع الأغاني", "قص الموسيقى", 
    "قص مقطع من أغنية", "قص ملفات MP3", "قص الصوت أونلاين", "إنشاء نغمة رنين من أغنية",
    "Online Song Cutter", "MP3 Cutter", "Audio Trimmer", "Ringtone Maker"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "قص الأغاني MP3 أونلاين مجانًا – تقطيع الأغاني وإنشاء نغمات رنين | Intooly",
    description: "أداة متكاملة لقص الأغاني وإنشاء نغمات الرنين وتقطيع الملفات الصوتية ودمج المقاطع والتحكم في الصوت مباشرة من المتصفح.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "كيف يمكن قص الأغاني أونلاين؟", a: "افتح أداة قص الأغاني، وارفع الملف الصوتي، ثم حدد نقطة البداية والنهاية من الموجة الصوتية. استمع إلى المقطع، وبعد التأكد من النتيجة قم بتصديره وحفظه." },
  { q: "كيف أقص أغنية بصيغة MP3؟", a: "ارفع ملف MP3 إلى الأداة، وحدد الجزء الذي تريد الاحتفاظ به، ثم عاين المقطع واختر تصدير الملف بالصيغ المتاحة." },
  { q: "هل يمكن قص الأغاني مجانًا؟", a: "نعم، يمكنك استخدام أداة قص الأغاني من Intooly مجانًا وفق حدود حجم الملف (حتى 50 ميجابايت لضمان أداء المتصفح) ومدة المعالجة." },
  { q: "هل يمكن قص الأغاني من الهاتف؟", a: "نعم، يمكن استخدام الأداة من متصفح الهاتف لرفع الملفات الصوتية وتحديد المقاطع ومعاينتها وحفظها، مع مراعاة توافق المتصفح والجهاز." },
  { q: "كيف أحول جزءًا من أغنية إلى نغمة رنين؟", a: "ارفع الأغنية، وحدد الجزء الذي تريد استخدامه كنغمة رنين (يفضل 30 ثانية)، ثم عاينه واحفظه بصيغة MP3 أو M4A المناسبة للهاتف." },
  { q: "هل يؤثر قص الأغنية على جودة الصوت؟", a: "لا يؤدي تحديد جزء من الملف بالضرورة إلى تقليل الجودة، لكن إعادة ترميز الصوت بصيغة مضغوطة مثل MP3 قد تسبب فقدًا طفيفًا. الأداة تحاول الحفاظ على أعلى جودة ممكنة." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      "name": "قص الأغاني أونلاين - Intooly",
      "url": PAGE_URL,
      "description": "أداة متكاملة لقص الأغاني وإنشاء نغمات الرنين وتقطيع الملفات الصوتية مباشرة من المتصفح.",
      "applicationCategory": "MultimediaApplication",
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
        { "@type": "ListItem", "position": 3, "name": "أدوات الصوت", "item": SITE_URL + "/tools/audio" },
        { "@type": "ListItem", "position": 4, "name": "قص الأغاني", "item": PAGE_URL }
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

export default function SongCutterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}