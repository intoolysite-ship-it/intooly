import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/youtube-video-downloader";

export const metadata: Metadata = {
  title: "تحميل فيديوهات اليوتيوب – تنزيل الفيديوهات المسموح بها بسهولة مجانًا | Intooly",
  description: "تعرّف على طرق تحميل فيديوهات اليوتيوب المسموح بها، واحفظ فيديوهاتك الخاصة أو المحتوى الذي تملك إذنًا بتنزيله، مع خيارات واضحة وسهلة من Intooly.",
  keywords: [
    "تحميل فيديوهات اليوتيوب", "تحميل فيديو من اليوتيوب", "تنزيل فيديوهات اليوتيوب", 
    "تحميل فيديو يوتيوب", "تنزيل فيديو من YouTube", "حفظ فيديوهات اليوتيوب",
    "YouTube Video Downloader", "Download YouTube Video"
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "تحميل فيديوهات اليوتيوب – تنزيل الفيديوهات المسموح بها بسهولة مجانًا | Intooly",
    description: "أداة إرشادية لمعرفة خيارات حفظ فيديوهات اليوتيوب المسموح بها رسمياً مع أدوات معالجة الفيديو المحلية.",
    url: PAGE_URL,
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

const faqQuestions = [
  { q: "كيف يمكن تحميل فيديوهات اليوتيوب؟", a: "يمكن حفظ الفيديوهات التي تملكها أو لديك إذن بتنزيلها باستخدام الخيارات الرسمية المتاحة، مثل YouTube Studio للفيديوهات التي رفعتها بنفسك، أو ميزة التنزيل الرسمية للمشاهدة دون اتصال عندما تكون متاحة." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب مجانًا؟", a: "تتوفر بعض خيارات تنزيل الفيديوهات التي يملكها المستخدم من خلال أدوات YouTube الرسمية. أما التنزيل للمشاهدة دون اتصال فيعتمد على توفر الميزة وشروط الحساب والمنطقة والفيديو." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب بجودة HD؟", a: "تختلف الجودة المتاحة حسب الفيديو الأصلي والخيارات التي توفرها المنصة. قد تتوفر دقة HD أو Full HD أو 4K لبعض الفيديوهات، ولا تتوفر بالضرورة لجميعها." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب على الهاتف؟", a: "نعم، تتيح YouTube تنزيل بعض الفيديوهات للمشاهدة دون إنترنت من خلال التطبيق الرسمي في المناطق والحالات المدعومة." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب على الكمبيوتر؟", a: "تتيح YouTube تنزيل فيديوهات مؤهلة للمشاهدة دون اتصال لبعض مستخدمي Premium عبر متصفحات مدعومة، كما يمكن لصاحب الفيديو تنزيل فيديوهاته من YouTube Studio." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب بصيغة MP4؟", a: "يمكن الحصول على ملف MP4 عندما يكون تنزيل الفيديو كملف مستقل مسموحًا وتكون هذه الصيغة متاحة. لا ينبغي افتراض أن كل فيديو على YouTube يمكن حفظه بهذه الصيغة." },
  { q: "هل يمكن تحويل فيديوهات اليوتيوب إلى MP3؟", a: "يجب أن يكون استخراج الصوت مسموحًا لصاحب المحتوى أو بموجب إذن مناسب. ويمكنك استخدام أداة تحويل الفيديو إلى صوت من Intooly مع الملفات التي يحق لك معالجتها." },
  { q: "لماذا لا أجد زر تنزيل الفيديو؟", a: "قد لا يكون الفيديو مؤهلًا للتنزيل دون اتصال، أو قد لا تتوفر الميزة في منطقتك أو لحسابك. كما يمكن أن تختلف الخيارات حسب نوع الفيديو وحقوقه." },
  { q: "هل أحتاج إلى تثبيت برنامج لتحميل الفيديو؟", a: "تعتمد الإجابة على الطريقة المستخدمة. توفر YouTube خيارات رسمية عبر موقعها وتطبيقها، ويمكن استخدام YouTube Studio لتنزيل الفيديوهات التي رفعتها بنفسك." },
  { q: "هل تنزيل الفيديو يعني امتلاك حقوقه؟", a: "لا. تنزيل الفيديو أو حفظ نسخة منه لا يمنحك حقوق النشر أو حق إعادة نشره أو استخدامه تجاريًا. يجب الحصول على الإذن المناسب من صاحب الحقوق." }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": PAGE_URL + "#application",
      "name": "تحميل فيديوهات اليوتيوب - Intooly",
      "url": PAGE_URL,
      "description": "أداة إرشادية لمعرفة خيارات حفظ فيديوهات اليوتيوب المسموح بها رسمياً مع أدوات معالجة الفيديو المحلية.",
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
        { "@type": "ListItem", "position": 4, "name": "تحميل فيديوهات اليوتيوب", "item": PAGE_URL }
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

export default function YouTubeVideoDownloaderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {children}
    </>
  );
}