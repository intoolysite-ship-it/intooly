import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/word-counter`;

export const metadata: Metadata = {
  title: 'عدّاد الكلمات أونلاين مجاناً — تحليل نصك فورياً | Intooly',
  description:
    'حلّل نصك فورياً: عدد الكلمات، الأحرف، الجمل، مؤشر القراءة، كثافة الكلمات، وأكثر. محلي 100% داخل متصفحك. مجاني وبدون تسجيل.',
  keywords: [
    'عدّاد الكلمات',
    'عدّ الكلمات',
    'word counter',
    'حساب الكلمات',
    'عدد الأحرف',
    'تحليل النصوص',
    'كثافة الكلمات',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'عدّاد الكلمات أونلاين مجاناً | Intooly',
    description: 'حلّل نصك فورياً: كلمات، أحرف، جمل، مؤشر القراءة، كثافة الكلمات. محلي 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'عدّاد الكلمات أونلاين مجاناً | Intooly',
    description: 'حلّل نصك فورياً: كلمات، أحرف، جمل، مؤشر القراءة.',
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
  name: 'عدّاد الكلمات — Intooly',
  url: PAGE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتحليل النصوص داخل المتصفح: عدد الكلمات، الأحرف، الجمل، مؤشر القراءة، كثافة الكلمات.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات SEO', item: `${SITE_URL}/tools/seo` },
    { '@type': 'ListItem', position: 4, name: 'عدّاد الكلمات', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يحسب عدّاد الكلمات؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يحسب عدد الكلمات بفصل النص بالمسافات، وعدد الأحرف (مع/بدون المسافات)، وعدد الجمل بعلامات الترقيم. كل شيء يعمل محليًا داخل متصفحك.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما مؤشر القراءة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'مؤشر تقديري لسهولة قراءة النص. يعتمد على متوسط طول الكلمات والجمل. كلما كان أقل، كان النص أسهل قراءة.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما كثافة الكلمات؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'هي نسبة تكرار كل كلمة إلى إجمالي الكلمات. تفيد في تحسين SEO لمعرفة الكلمات المفتاحية الأكثر تكرارًا.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل نصي آمن؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع التحليلات تُجرى داخل متصفحك مباشرة. لا نرفع أي نص إلى خوادمنا.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الأداة مجانية بالكامل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، الأداة مجانية بالكامل بدون تسجيل وبدون حدود.',
      },
    },
  ],
};

export default function WordCounterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
