import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://intooly.com";
const PAGE_URL = SITE_URL + "/tools/health-fitness";

export const metadata: Metadata = {
  title: "أدوات الصحة واللياقة البدنية وحاسبات صحية مجانية | Intooly",
  description:
    "اكتشف أدوات الصحة واللياقة البدنية المجانية من Intooly، واستخدم حاسبات الوزن ومؤشر كتلة الجسم والسعرات الحرارية والوزن المثالي وأدوات التغذية واللياقة بسهولة.",
  keywords: [
    "الصحة واللياقة البدنية",
    "أدوات الصحة واللياقة البدنية",
    "أدوات صحية مجانية",
    "حاسبات صحية مجانية",
    "أدوات اللياقة أونلاين",
    "حاسبة الوزن",
    "حاسبة مؤشر كتلة الجسم",
    "Health and Fitness Tools",
    "Free Health Tools",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "أدوات الصحة واللياقة البدنية وحاسبات صحية مجانية | Intooly",
    description: "اكتشف أدوات الصحة واللياقة البدنية المجانية من Intooly، واستخدم حاسبات الوزن ومؤشر كتلة الجسم والسعرات الحرارية والوزن المثالي وأدوات التغذية واللياقة بسهولة.",
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": PAGE_URL + "#webpage",
      url: PAGE_URL,
      name: "أدوات الصحة واللياقة البدنية أونلاين مجانًا",
      description: "اكتشف مجموعة أدوات الصحة واللياقة البدنية المجانية من Intooly، واستخدم حاسبات صحية وأدوات حسابية تساعدك على فهم مؤشرات الجسم.",
      inLanguage: "ar",
    },
    {
      "@type": "BreadcrumbList",
      "@id": PAGE_URL + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "الأدوات", item: SITE_URL + "/tools" },
        { "@type": "ListItem", position: 3, name: "الصحة واللياقة البدنية", item: PAGE_URL },
      ],
    },
  ],
};

export default function HealthFitnessLayout({ children }: { children: ReactNode }) {
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