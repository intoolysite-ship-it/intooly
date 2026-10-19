import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/image-converter`;

export const metadata: Metadata = {
  title: 'محوّل الصور أونلاين مجاناً — JPG, PNG, WEBP | Intooly',
  description:
    'حوّل صورك بين JPG و PNG و WEBP و GIF أونلاين مجاناً دون فقدان الجودة. معالجة محلية 100% داخل متصفحك. لا رفع، لا تسجيل، سرعة فورية.',
  keywords: [
    'محول الصور',
    'تحويل الصور',
    'image converter',
    'تحويل JPG إلى PNG',
    'تحويل PNG إلى JPG',
    'تحويل WEBP',
    'convert image',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'محوّل الصور أونلاين مجاناً | Intooly',
    description: 'حوّل صورك بين JPG و PNG و WEBP و GIF أونلاين دون فقدان الجودة.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'محوّل الصور أونلاين مجاناً | Intooly',
    description: 'حوّل صورك بين JPG و PNG و WEBP و GIF أونلاين.',
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
  name: 'محوّل الصور — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتحويل صيغ الصور داخل المتصفح دون رفعها إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الصور', item: `${SITE_URL}/tools/images` },
    { '@type': 'ListItem', position: 4, name: 'محوّل الصور', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة للتحويل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم التحويل بين JPG و PNG و WEBP و GIF. يمكنك اختيار الصيغة المطلوبة قبل التحويل.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل التحويل يؤثر على جودة الصورة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'جودة الصورة تعتمد على الصيغة المستهدفة. JPG و WEBP يضغطان الصورة قليلاً، بينما PNG يحتفظ بالجودة الكاملة ويدعم الشفافية.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني تحويل عدة صور دفعة واحدة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك اختيار عدة صور وتحويلها دفعة واحدة، ثم تنزيلها كلها.',
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

export default function ImageConverterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
