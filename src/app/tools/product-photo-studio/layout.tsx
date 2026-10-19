import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/product-photo-studio`;

export const metadata: Metadata = {
  title: 'استوديو صور المنتجات — خلفيات وظلال احترافية | Intooly',
  description:
    'حوّل صور منتجاتك إلى صور احترافية بخلفيات جاهزة وظلال وعلامات مائية. إزالة الخلفية بالذكاء الاصطناعي داخل متصفحك. مجاني وبدون رفع.',
  keywords: [
    'استوديو صور المنتجات',
    'product photo studio',
    'خلفيات صور المنتجات',
    'إزالة خلفية المنتج',
    'صور منتجات احترافية',
    'ظلال المنتجات',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'استوديو صور المنتجات | Intooly',
    description: 'حوّل صور منتجاتك إلى صور احترافية بخلفيات وظلال. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'استوديو صور المنتجات | Intooly',
    description: 'حوّل صور منتجاتك إلى صور احترافية بخلفيات وظلال.',
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
  name: 'استوديو صور المنتجات — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتحسين صور المنتجات داخل المتصفح: إزالة الخلفية، إضافة خلفيات وظلال وعلامات مائية.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الصور', item: `${SITE_URL}/tools/images` },
    { '@type': 'ListItem', position: 4, name: 'استوديو صور المنتجات', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ما هو استوديو صور المنتجات؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'هو أداة متكاملة لتحسين صور منتجاتك: تزيل الخلفية بالذكاء الاصطناعي، وتضيف خلفيات احترافية وظلالاً وعلامات مائية، لتبدو صور منتجاتك جاهزة للمتاجر الإلكترونية.',
      },
    },
    {
      '@type': 'Question',
      name: 'كيف أستخدمه لتحسين صور منتجاتي؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ارفع صورة المنتج، ثم اختر "إزالة الخلفية" لتطبيق الذكاء الاصطناعي، بعدها اختر خلفية (أبيض، رمادي، أو أي لون)، وأضف ظلاً وعلامة مائية اختيارياً، ثم نزّل الصورة النهائية.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني إضافة خلفيات مخصصة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك اختيار خلفيات جاهزة (9 قوالب) أو استخدام لون مخصص. كما يمكنك إضافة ظلال (4 أنواع) وعلامة مائية نصية.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل صوري آمنة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع الصور تُعالج داخل متصفحك مباشرة. لا نرفع أي صورة إلى خوادمنا، ولا نحتفظ بأي نسخة.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الأداة مجانية بالكامل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، الأداة مجانية بالكامل بدون تسجيل وبدون علامات مائية إجبارية. العلامة المائية اختيارية.',
      },
    },
  ],
};

export default function ProductPhotoStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
