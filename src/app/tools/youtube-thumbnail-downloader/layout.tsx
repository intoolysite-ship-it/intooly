import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/youtube-thumbnail-downloader";

export const metadata: Metadata = {
  title: "تحميل الصورة المصغرة من يوتيوب بجودة HD مجانًا | Intooly",
  description: "استخدم أداة تحميل الصورة المصغرة من Intooly لاستخراج صور فيديوهات يوتيوب وتنزيلها بجودات وأحجام مختلفة. الصق رابط الفيديو، واعرض الصورة واحفظها بسهولة مجانًا.",
  keywords: [
    "تحميل الصورة المصغرة", "تحميل الصورة المصغرة من يوتيوب", "تنزيل صورة فيديو يوتيوب", 
    "استخراج الصورة المصغرة", "تحميل صورة غلاف الفيديو", "YouTube Thumbnail Downloader", 
    "Download YouTube Thumbnail HD", "YouTube Thumbnail Grabber"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "تحميل الصورة المصغرة من يوتيوب بجودة HD مجانًا | Intooly",
    description: "أداة مجانية لاستخراج وتنزيل الصور المصغرة لفيديوهات يوتيوب بجميع الجودات المتاحة (HD, Full HD) بضغطة زر.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "كيف يمكن تحميل الصورة المصغرة من يوتيوب؟", a: "انسخ رابط فيديو YouTube، ثم افتح أداة تحميل الصورة المصغرة من Intooly والصق الرابط. بعد استخراج الصور المتاحة، اختر النسخة المناسبة واضغط على زر التنزيل لحفظها على جهازك." },
  { q: "هل يمكن تحميل الصورة المصغرة من يوتيوب مجانًا؟", a: "نعم، يمكنك استخدام أداة Intooly لاستخراج الصور المصغرة المتاحة مجانًا وفقًا لحدود الاستخدام المعلنة، دون الحاجة إلى تثبيت برنامج أو إنشاء حساب." },
  { q: "كيف أحمل الصورة المصغرة بجودة HD أو 1080p؟", a: "الصق رابط الفيديو في الأداة، ثم افحص الأحجام المتاحة واختر أعلى نسخة يمكن الوصول إليها (مثل maxresdefault). قد تختلف الدقة من فيديو إلى آخر." },
  { q: "هل تعمل أداة تحميل الصورة المصغرة على الهاتف؟", a: "نعم، يمكنك استخدام الأداة من متصفح الهاتف، سواء كان Android أو iPhone، ثم نسخ رابط الفيديو واستخراج الصورة وحفظها بحسب إمكانيات المتصفح." },
  { q: "هل يمكن تحميل الصورة المصغرة من رابط YouTube Shorts؟", a: "نعم، يمكن محاولة استخراج صورة الفيديو من روابط YouTube Shorts إذا كانت الصورة متاحة ويمكن الوصول إليها بالطريقة التي تستخدمها الأداة." },
  { q: "ما الفرق بين maxresdefault و hqdefault؟", a: "تشير هذه الأسماء إلى نسخ مختلفة من الصور المصغرة. تكون maxresdefault عادةً النسخة الأعلى دقة (قد تصل لـ 1280x720) عند توفرها، بينما hqdefault نسخة شائعة بدقة أقل (480x360)." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      "name": "تحميل الصورة المصغرة من يوتيوب - Intooly",
      "url": PAGE_URL,
      "description": "أداة مجانية لاستخراج وتنزيل الصور المصغرة لفيديوهات يوتيوب بجميع الجودات المتاحة.",
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
        { "@type": "ListItem", "position": 3, "name": "أدوات الفيديو", "item": SITE_URL + "/tools/video" },
        { "@type": "ListItem", "position": 4, "name": "تحميل الصورة المصغرة", "item": PAGE_URL }
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

export default function ThumbnailDownloaderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}