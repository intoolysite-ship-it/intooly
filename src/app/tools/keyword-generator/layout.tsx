import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/keyword-generator`;

export const metadata: Metadata = {
  title: 'مولّد الكلمات المفتاحية أونلاين مجاناً — 22 دولة عربية | Intooly',
  description:
    'اكتشف كلمات مفتاحية حقيقية وحلّل فرصها في السوق المستهدف. محلي للتحليل، شفافية كاملة، 22 دولة عربية. مجاني وبدون تسجيل.',
  keywords: [
    'مولد الكلمات المفتاحية',
    'keyword generator',
    'الكلمات المفتاحية',
    'البحث عن الكلمات المفتاحية',
    'تحليل الكلمات المفتاحية',
    'SEO keywords',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'مولّد الكلمات المفتاحية أونلاين مجاناً | Intooly',
    description: 'اكتشف كلمات مفتاحية حقيقية وحلّل فرصها في السوق المستهدف. 22 دولة عربية.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مولّد الكلمات المفتاحية أونلاين مجاناً | Intooly',
    description: 'اكتشف كلمات مفتاحية حقيقية وحلّل فرصها في السوق المستهدف.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'مولّد الكلمات المفتاحية — Intooly',
  url: PAGE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لاكتشاف كلمات مفتاحية حقيقية وتحليل فرصها في 22 دولة عربية.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات SEO', item: `${SITE_URL}/tools/seo` },
    { '@type': 'ListItem', position: 4, name: 'مولّد الكلمات المفتاحية', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يعمل مولّد الكلمات المفتاحية؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تحلّل الأداة الكلمات المفتاحية محليًا داخل متصفحك، مع دعم 22 دولة عربية. تحصل على كلمات مفتاحية حقيقية وفرصها في السوق المستهدف.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الأداة مجانية؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، الأداة مجانية بالكامل بدون تسجيل وبدون حدود يومية.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الدول المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم 22 دولة عربية، بما فيها السعودية، الإمارات، مصر، الأردن، الكويت، قطر، والبحرين وغيرها.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل بياناتي آمنة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع التحليلات تُجرى داخل متصفحك مباشرة. لا نرفع أي بيانات إلى خوادمنا.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني تصدير النتائج؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك تصدير النتائج بصيغة CSV أو نسخها مباشرة.',
      },
    },
  ],
};

export default function KeywordGeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
