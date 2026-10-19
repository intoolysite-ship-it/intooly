import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/jpg-to-pdf`;

export const metadata: Metadata = {
  title: 'تحويل JPG إلى PDF أونلاين مجاناً | Intooly',
  description:
    'حوّل صور JPG و PNG و WEBP إلى ملف PDF واحد مجاناً وبدون رفع صورك إلى أي سيرفر. رتّب الصور، اختر حجم الصفحة، ونزّل ملف PDF جاهزاً في ثوانٍ.',
  keywords: [
    'تحويل JPG إلى PDF',
    'JPG to PDF',
    'صور إلى PDF',
    'تحويل صور إلى PDF',
    'دمج صور في PDF',
    'JPG to PDF عربي',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'تحويل JPG إلى PDF أونلاين مجاناً | Intooly',
    description:
      'حوّل صور JPG وPNG إلى ملف PDF واحد مجاناً. كل المعالجة داخل متصفحك — صورك لا تُرفع إلى أي سيرفر.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل JPG إلى PDF أونلاين مجاناً | Intooly',
    description: 'حوّل صور JPG وPNG إلى ملف PDF واحد مجاناً. كل المعالجة داخل متصفحك.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'تحويل JPG إلى PDF — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'أداة مجانية لتحويل صور JPG وPNG وWEBP إلى ملف PDF واحد داخل المتصفح، دون رفع الصور إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات PDF', item: `${SITE_URL}/tools/pdf` },
    { '@type': 'ListItem', position: 4, name: 'تحويل JPG إلى PDF', item: PAGE_URL },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'هل الأداة مجانية بالكامل؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، الأداة مجانية بالكامل بدون تسجيل وبدون علامات مائية.' },
    },
    {
      '@type': 'Question',
      name: 'هل تُرفع صوري إلى سيرفر؟',
      acceptedAnswer: { '@type': 'Answer', text: 'لا، جميع الصور تُعالج داخل متصفحك ولا تُرفع إلى أي سيرفر خارجي.' },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: { '@type': 'Answer', text: 'ندعم JPG و JPEG و PNG و WEBP.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني ترتيب الصور قبل التحويل؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، يمكنك تحريك الصور أعلى وأسفل لتحديد ترتيبها في ملف PDF النهائي.' },
    },
    {
      '@type': 'Question',
      name: 'ما الحد الأقصى لعدد الصور؟',
      acceptedAnswer: { '@type': 'Answer', text: 'لا يوجد حد رقمي، لكن الأداء يعتمد على ذاكرة المتصفح وحجم الصور.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني اختيار حجم الصفحة؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، يمكنك الاختيار بين A4 و Letter وحجم الصورة، مع اتجاه عمودي أو أفقي.' },
    },
  ],
};

export default function JpgToPdfLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}