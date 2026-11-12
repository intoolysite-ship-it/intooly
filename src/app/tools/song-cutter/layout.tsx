import type { Metadata } from "next";
import type { ReactNode } from "react";
import { faqQuestions } from "./faq-data";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/song-cutter";

export const metadata: Metadata = {
  title: "قص الاغاني MP3 أونلاين مجانًا – تقطيع الأغاني بسهولة | Intooly",
  description: "قص الاغاني MP3 أونلاين مجانًا باستخدام أداة Intooly. حدد بداية ونهاية المقطع، واستمع إلى الجزء الذي تريده، واستخرج مقاطعك الصوتية بسهولة من المتصفح.",
  keywords: [
    "قص الاغاني", "قص الاغاني MP3", "قص الاغاني اون لاين", "قص الاغاني مجانا",
    "قص الاغاني online", "برنامج قص الاغاني", "موقع قص الاغاني", "تقطيع الاغاني",
    "تقطيع الأغاني اون لاين", "قص الموسيقى", "قص مقطع من اغنية", "قص جزء من الاغنية",
    "قص ملفات MP3", "قص الصوت MP3", "قص الصوت اون لاين", "تقطيع الصوت",
    "تقطيع ملفات الصوت", "قص ملف صوتي", "محرر الصوت اون لاين", "قاطع الاغاني", "مقص الاغاني",
    "قص الاغاني نغمة رنين", "قص اغنية نغمة هاتف", "صنع نغمة رنين", "عمل نغمة رنين من اغنية",
    "قص نغمة رنين", "تقطيع نغمات الهاتف", "تحويل جزء من اغنية الى نغمة", "قص اغنية للموبايل", "نغمات رنين MP3",
    "قص بداية الاغنية", "قص نهاية الاغنية", "استخراج مقطع من اغنية", "تحديد جزء من الاغنية",
    "حذف جزء من ملف صوتي", "قص جزء من منتصف الاغنية", "تقطيع الموسيقى الى مقاطع", "قص اغنية بدقة",
    "قص الصوت بالثواني", "معاينة الصوت قبل القص", "قص ملفات صوتية من الهاتف", "قص الاغاني من الكمبيوتر",
    "قص الاغاني من الموبايل", "تقطيع MP3 بدون برنامج",
    "Song Cutter", "Online Song Cutter", "MP3 Cutter", "Online MP3 Cutter",
    "Audio Cutter", "Online Audio Cutter", "Music Cutter", "Online Music Cutter",
    "Audio Trimmer", "MP3 Trimmer", "Music Trimmer", "Cut MP3 Online", "Cut Songs Online",
    "Trim Audio Online", "Trim MP3 Online", "Cut Audio File", "Audio Clip Cutter", "Song Trimmer",
    "MP3 Song Cutter", "Ringtone Maker", "Ringtone Cutter", "Make Ringtone from Song",
    "Create Ringtone Online", "Audio Segment Cutter", "Audio Clip Extractor", "Music Clip Cutter",
    "Audio Editing Online", "Cut Music Online Free", "Free MP3 Cutter", "Free Audio Cutter",
    "Split Audio Online", "Audio Splitter", "MP3 Splitter", "Trim Music", "Extract Audio Clip",
    "Cut Part of MP3", "Audio Waveform Editor",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "قص الاغاني MP3 أونلاين مجانًا – تقطيع الأغاني بسهولة | Intooly",
    description: "أداة متكاملة لقص الأغاني وإنشاء نغمات الرنين وتقطيع الملفات الصوتية مع معاينة مباشرة على شكل الموجة، تعمل بالكامل داخل المتصفح.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
    images: [{ url: SITE_URL + "/og/song-cutter.png", width: 1200, height: 630, alt: "أداة قص الاغاني من Intooly" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "قص الاغاني MP3 أونلاين مجانًا | Intooly",
    description: "قص ودمج المقاطع الصوتية وإنشاء نغمات رنين محليًا في متصفحك.",
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      "name": "قص الاغاني أونلاين - Intooly",
      "url": PAGE_URL,
      "description": "أداة متكاملة لقص الأغاني وإنشاء نغمات الرنين وتقطيع الملفات الصوتية مع اختيار المقطع على شكل الموجة، تعمل بالكامل داخل المتصفح.",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Any",
      "inLanguage": ["ar", "en"],
      "isAccessibleForFree": true,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "featureList": [
        "قص الاغاني بدقة عبر شكل الموجة",
        "دمج عدة مقاطع صوتية في ملف واحد",
        "إنشاء نغمات رنين (30 ثانية)",
        "إضافة Fade In / Fade Out",
        "التحكم في مستوى الصوت",
        "تطبيع مستوى الصوت Normalize",
        "تصدير عدة مقاطع كملف ZIP",
        "معالجة محلية 100% دون رفع الملفات",
      ],
      "browserRequirements": "يتطلب متصفحًا حديثًا يدعم WebAssembly وWeb Audio API (Chrome, Edge, Firefox, Safari)",
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "الأدوات", "item": SITE_URL + "/tools" },
        { "@type": "ListItem", "position": 3, "name": "أدوات الصوت", "item": SITE_URL + "/tools/audio" },
        { "@type": "ListItem", "position": 4, "name": "قص الاغاني", "item": PAGE_URL },
      ],
    },
    {
      "@type": "HowTo",
      "@id": PAGE_URL + "#howto",
      "name": "كيفية قص الاغاني MP3 أونلاين",
      "description": "خطوات قص أغنية أو تقطيع ملف صوتي باستخدام أداة Intooly.",
      "totalTime": "PT2M",
      "tool": [{ "@type": "HowToTool", "name": "متصفح حديث" }],
      "step": [
        { "@type": "HowToStep", "position": 1, "name": "رفع الملف", "text": "ارفع ملف الصوت (MP3, WAV, M4A...) بحد أقصى 50 ميجابايت." },
        { "@type": "HowToStep", "position": 2, "name": "تحديد المقطع", "text": "اسحب المقابض على شكل الموجة لتحديد نقطة البداية والنهاية." },
        { "@type": "HowToStep", "position": 3, "name": "المعاينة", "text": "اضغط على زر المعاينة للاستماع إلى المقطع المحدد." },
        { "@type": "HowToStep", "position": 4, "name": "الحفظ أو الدمج", "text": "احفظ المقطع أو أضف عدة مقاطع ودمجها في ملف واحد." },
        { "@type": "HowToStep", "position": 5, "name": "التنزيل", "text": "نزّل الناتج بصيغة MP3 بجودة عالية." },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": PAGE_URL + "#faq",
      "mainEntity": faqQuestions.map((item) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a },
      })),
    },
  ],
};

export default function SongCutterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      {children}
    </>
  );
}
