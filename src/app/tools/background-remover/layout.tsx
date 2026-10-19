import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/background-remover`;

export const metadata: Metadata = {
  title: 'إزالة خلفية الصور بالذكاء الاصطناعي مجاناً | Intooly',
  description:
    'أزل خلفية صورك تلقائياً بدقة عالية مجاناً. يدعم JPG و PNG و WEBP. معالجة محلية 100% داخل متصفحك دون رفع صورك إلى أي سيرفر.',
  keywords: [
    'إزالة الخلفية',
    'إزالة خلفية الصور',
    'remove background',
    'background remover',
    'حذف خلفية الصورة',
    'إزالة الخلفية بالذكاء الاصطناعي',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'إزالة خلفية الصور بالذكاء الاصطناعي مجاناً | Intooly',
    description:
      'أزل خلفية صورك تلقائياً بدقة عالية. معالجة محلية 100% داخل متصفحك.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'إزالة خلفية الصور بالذكاء الاصطناعي مجاناً | Intooly',
    description: 'أزل خلفية صورك تلقائياً بدقة عالية. معالجة محلية 100%.',
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
  name: 'إزالة خلفية الصور — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'أداة مجانية لإزالة خلفية الصور بالذكاء الاصطناعي داخل المتصفح، دون رفع الصور إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الصور', item: `${SITE_URL}/tools/images` },
    { '@type': 'ListItem', position: 4, name: 'إزالة الخلفية', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف تعمل إزالة الخلفية بالذكاء الاصطناعي؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تستخدم الأداة نموذج ذكاء اصطناعي يعمل داخل متصفحك لتحليل الصورة وفصل الموضوع الرئيسي عن الخلفية تلقائياً. لا تُرفع أي صورة إلى سيرفر.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم JPG و PNG و WEBP. يُفضّل استخدام صور عالية الجودة للحصول على أفضل نتيجة.',
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
        text: 'نعم، الأداة مجانية بالكامل بدون تسجيل وبدون علامات مائية.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل تعمل الأداة على الجوال؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، الأداة متوافقة مع المتصفحات الحديثة على الجوال والأجهزة اللوحية.',
      },
    },
  ],
};

export default function BackgroundRemoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
