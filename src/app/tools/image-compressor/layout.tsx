import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/image-compressor`;

export const metadata: Metadata = {
  title: 'ضغط الصور أونلاين مجاناً — قلّل الحجم واحتفظ بالجودة | Intooly',
  description:
    'اضغط صور JPG و PNG و WEBP أونلاين مجاناً دون فقدان الجودة. معالجة محلية 100% داخل متصفحك. لا رفع، لا تسجيل، وسرعة فورية.',
  keywords: [
    'ضغط الصور',
    'ضغط الصور أونلاين',
    'image compressor',
    'تقليل حجم الصورة',
    'ضغط JPG',
    'ضغط PNG',
    'compress image',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'ضغط الصور أونلاين مجاناً | Intooly',
    description: 'اضغط صور JPG و PNG و WEBP أونلاين دون فقدان الجودة. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ضغط الصور أونلاين مجاناً | Intooly',
    description: 'اضغط صور JPG و PNG و WEBP أونلاين دون فقدان الجودة.',
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
  name: 'ضغط الصور — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لضغط الصور داخل المتصفح دون رفعها إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الصور', item: `${SITE_URL}/tools/images` },
    { '@type': 'ListItem', position: 4, name: 'ضغط الصور', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'هل الضغط يؤثر على جودة الصورة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يعتمد على مستوى الضغط الذي تختاره. يمكنك اختيار جودة عالية (90-95%) للاحتفاظ بأفضل جودة، أو جودة أقل (50-70%) لتقليل الحجم أكثر.',
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
      name: 'هل يمكنني ضغط عدة صور دفعة واحدة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك اختيار عدة صور وضغطها دفعة واحدة، ثم تنزيلها كلها.',
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

export default function ImageCompressorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
