import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = `${SITE_URL}/tools/heic-to-jpg`;

export const metadata: Metadata = {
  title: "تحويل HEIC إلى JPG مجانًا أونلاين | محول صور iPhone – Intooly",
  description:
    "حوّل صور HEIC وHEIF من iPhone إلى JPG مجانًا أونلاين. تحويل عدة صور دفعة واحدة، اختيار جودة JPG، وتنزيل الصور مباشرة دون تثبيت برامج.",
  keywords: [
    "تحويل HEIC إلى JPG",
    "HEIC to JPG",
    "تحويل HEIC إلى JPEG",
    "تحويل صور iPhone إلى JPG",
    "تحويل صور الايفون إلى JPG",
    "HEIF to JPG",
    "HEIC Converter",
    "تحويل ملفات HEIC",
    "فتح ملفات HEIC على الكمبيوتر",
    "تحويل HEIC إلى JPG بدون برامج",
    "تحويل عدة صور HEIC إلى JPG",
    "محول HEIC أونلاين",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "تحويل HEIC إلى JPG مجانًا أونلاين | Intooly",
    description:
      "حوّل صور iPhone بصيغة HEIC وHEIF إلى JPG بسهولة، مع إمكانية تحويل عدة صور واختيار جودة الصورة.",
    url: PAGE_URL,
    siteName: "Intooly",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "تحويل HEIC إلى JPG مجانًا | Intooly",
    description:
      "محول صور HEIC وHEIF إلى JPG أونلاين. مجاني وسهل الاستخدام.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "محول HEIC إلى JPG - Intooly",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  url: PAGE_URL,
  description:
    "أداة عبر الإنترنت لتحويل صور HEIC وHEIF إلى JPG من المتصفح، مع دعم تحويل عدة صور واختيار جودة JPEG.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  isAccessibleForFree: true,
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "الأدوات",
      item: `${SITE_URL}/tools`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "أدوات الصور",
      item: `${SITE_URL}/tools/images`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "تحويل HEIC إلى JPG",
      item: PAGE_URL,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "كيف أحول HEIC إلى JPG مجانًا؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أضف ملفات HEIC أو HEIF إلى الأداة، واختر جودة JPG، ثم اضغط على تحويل الصور لتنزيل النتائج.",
      },
    },
    {
      "@type": "Question",
      name: "هل يمكن تحويل صور iPhone إلى JPG؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يمكنك إضافة الصور المحفوظة بصيغة HEIC أو HEIF من iPhone وتحويلها إلى JPG.",
      },
    },
    {
      "@type": "Question",
      name: "هل يمكن تحويل عدة صور HEIC دفعة واحدة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يمكنك إضافة عدة ملفات وتحويلها ثم تنزيل الصور منفردة أو في ملف ZIP.",
      },
    },
    {
      "@type": "Question",
      name: "هل يؤدي تحويل HEIC إلى JPG إلى فقدان الجودة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يستخدم JPG ضغطًا مع فقدان بعض البيانات، ويمكنك اختيار مستوى الجودة المناسب قبل التحويل.",
      },
    },
    {
      "@type": "Question",
      name: "هل أحتاج إلى تثبيت برنامج لتحويل HEIC؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا، تعمل الأداة من خلال متصفح الويب ولا تحتاج إلى تثبيت برنامج تحويل منفصل.",
      },
    },
    {
      "@type": "Question",
      name: "هل يتم رفع صوري إلى خادم الموقع؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تتم عملية التحويل داخل متصفحك ولا تتطلب رفع ملفات الصور إلى خادم Intooly.",
      },
    },
  ],
};

export default function HeicToJpgLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema).replace(/</g, "\\u003c"),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
