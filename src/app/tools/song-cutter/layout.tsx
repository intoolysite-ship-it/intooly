import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/song-cutter";

export const metadata: Metadata = {
  title: "قص الأغاني MP3 أونلاين مجانًا – تقطيع الأغاني وإنشاء نغمات رنين | Intooly",
  description: "استخدم أداة قص الأغاني من Intooly لقص ملفات MP3 وWAV بدقة عبر شكل الموجة، مع اختيار المقطع ومعاينته قبل التصدير، وإنشاء نغمات رنين، كل ذلك محليًا في متصفحك دون رفع ملفاتك.",
  keywords: [
    "قص الاغاني", "قص الاغاني MP3", "قص الأغاني أونلاين", "تقطيع الأغاني", "قص الموسيقى",
    "قص مقطع من أغنية", "قص ملفات MP3", "قص الصوت أونلاين", "إنشاء نغمة رنين من أغنية",
    "Online Song Cutter", "MP3 Cutter", "Audio Trimmer", "Ringtone Maker"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "قص الأغاني MP3 أونلاين مجانًا – تقطيع الأغاني وإنشاء نغمات رنين | Intooly",
    description: "أداة متكاملة لقص الأغاني وإنشاء نغمات الرنين وتقطيع الملفات الصوتية مع معاينة مباشرة على شكل الموجة، تعمل بالكامل داخل المتصفح.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "كيف يمكن قص الأغاني أونلاين؟", a: "افتح أداة قص الأغاني، وارفع الملف الصوتي، ثم اسحب على شكل الموجة لتحديد المقطع الذي تريده. استمع إلى المقطع المحدد، وبعد التأكد من النتيجة قم بتصديره وحفظه بصيغة WAV." },
  { q: "كيف أقص أغنية بصيغة MP3؟", a: "ارفع ملف MP3 إلى الأداة، وسيتم فك ترميزه تلقائيًا داخل المتصفح. حدد الجزء الذي تريد الاحتفاظ به على شكل الموجة، ثم عاين المقطع وصدّره." },
  { q: "هل يمكن قص الأغاني مجانًا؟", a: "نعم، الأداة مجانية بالكامل وتعمل داخل المتصفح دون رفع ملفاتك إلى أي خادم." },
  { q: "هل يمكن قص الأغاني من الهاتف؟", a: "نعم، يمكن استخدام الأداة من متصفح الهاتف، ويدعم شكل الموجة اللمس لسحب المقابض وتحديد المقطع، مع مراعاة توافق المتصفح والجهاز." },
  { q: "كيف أحول جزءًا من أغنية إلى نغمة رنين؟", a: "ارفع الأغنية، وحدد الجزء الذي تريد استخدامه كنغمة رنين (يفضل 30 ثانية)، ثم عاينه واحفظه. يمكنك لاحقًا تحويل ملف WAV الناتج إلى MP3 أو M4A إذا رغبت." },
  { q: "هل يؤثر قص الأغنية على جودة الصوت؟", a: "لا. الأداة تقص العينات مباشرة من الملف الأصلي وتصدّر بصيغة WAV غير المضغوطة، لذا لا يحدث أي فقدان في الجودة عند القص." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      "name": "قص الأغاني أونلاين - Intooly",
      "url": PAGE_URL,
      "description": "أداة متكاملة لقص الأغاني وإنشاء نغمات الرنين وتقطيع الملفات الصوتية مع اختيار المقطع على شكل الموجة، تعمل بالكامل داخل المتصفح.",
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