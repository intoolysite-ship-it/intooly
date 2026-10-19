import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/image-cropper`;

export const metadata: Metadata = {
  title: 'قص الصور أونلاين مجاناً — اقتصّ صورك بدقة | Intooly',
  description:
    'اقتطع أي جزء من صورك بدقة عالية مع قوالب جاهزة (مربع، دائرة، 16:9، 4:3). معالجة محلية 100% داخل متصفحك. لا رفع، لا تسجيل.',
  keywords: [
    'قص الصور',
    'قص الصور أونلاين',
    'image cropper',
    'اقتصاص الصور',
    'قطع الصور',
    'crop image',
    'قص صورة',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'قص الصور أونلاين مجاناً | Intooly',
    description: 'اقتطع أي جزء من صورك بدقة عالية مع قوالب جاهزة. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'قص الصور أونلاين مجاناً | Intooly',
    description: 'اقتطع أي جزء من صورك بدقة عالية مع قوالب جاهزة.',
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
  name: 'قص الصور — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لقص الصور داخل المتصفح دون رفعها إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الصور', item: `${SITE_URL}/tools/images` },
    { '@type': 'ListItem', position: 4, name: 'قص الصور', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أقص صورة بدقة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ارفع الصورة، ثم استخدم أداة القص لتحديد الجزء المطلوب. يمكنك استخدام القوالب الجاهزة (مربع، دائرة، 16:9، 4:3) أو تحديد منطقة مخصصة.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني قص عدة صور دفعة واحدة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك رفع عدة صور وقصها واحدة تلو الأخرى، ثم تنزيلها كلها.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم JPG و PNG و WEBP. الصور المقطوعة تُحفظ بنفس الصيغة الأصلية.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل أحتفظ بالصورة الأصلية؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، الصورة الأصلية تبقى كما هي. القص يُنشئ نسخة جديدة فقط.',
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
  ],
};

export default function ImageCropperLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
