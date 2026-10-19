import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/video-trimmer`;

export const metadata: Metadata = {
  title: 'قص الفيديو أونلاين مجاناً — بدقة الإطار | Intooly',
  description:
    'اقتطع أي جزء من فيديوهاتك بدقة الإطار، وقسّم ودمج المقاطع بسهولة. معالجة محلية 100% داخل متصفحك. لا رفع، لا تسجيل.',
  keywords: [
    'قص الفيديو',
    'قص الفيديو أونلاين',
    'video trimmer',
    'قطع الفيديو',
    'trim video',
    'تقسيم الفيديو',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'قص الفيديو أونلاين مجاناً | Intooly',
    description: 'اقتطع أي جزء من فيديوهاتك بدقة الإطار. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'قص الفيديو أونلاين مجاناً | Intooly',
    description: 'اقتطع أي جزء من فيديوهاتك بدقة الإطار.',
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
  name: 'قص الفيديو — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لقص الفيديو داخل المتصفح دون رفعه إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الفيديو', item: `${SITE_URL}/tools/video` },
    { '@type': 'ListItem', position: 4, name: 'قص الفيديو', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أقص فيديو بدقة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ارفع الفيديو، ثم استخدم شريط التمرير لتحديد وقت البداية والنهاية بدقة الإطار. يمكنك معاينة النتيجة قبل التنزيل.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم MP4 و WebM و MOV. يُفضّل استخدام MP4 للحصول على أفضل توافق.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني تقسيم الفيديو إلى عدة مقاطع؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك تحديد عدة نطاقات ودمجها أو تصديرها بشكل منفصل.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل فيديوهاتي آمنة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع الفيديوهات تُعالج داخل متصفحك مباشرة. لا نرفع أي فيديو إلى خوادمنا، ولا نحتفظ بأي نسخة.',
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

export default function VideoTrimmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
