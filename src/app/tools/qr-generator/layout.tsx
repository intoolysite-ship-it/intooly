import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/qr-generator`;

export const metadata: Metadata = {
  title: 'مولّد QR Code أونلاين مجاناً — 14 نوع | Intooly',
  description:
    'أنشئ رمز QR مخصص لمطعمك، متجرك، شركتك، أو أي استخدام. 14 نوع QR، تخصيص كامل (ألوان، شعار)، رابط دائم. مجاني وبدون تسجيل.',
  keywords: [
    'مولد QR',
    'qr code generator',
    'إنشاء QR Code',
    'رمز QR',
    'qr code',
    'مولد رمز QR',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'مولّد QR Code أونلاين مجاناً | Intooly',
    description: 'أنشئ رمز QR مخصص لمطعمك، متجرك، شركتك. 14 نوع QR، تخصيص كامل، رابط دائم.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مولّد QR Code أونلاين مجاناً | Intooly',
    description: 'أنشئ رمز QR مخصص لمطعمك، متجرك، شركتك. 14 نوع QR.',
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
  name: 'مولّد QR Code — Intooly',
  url: PAGE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لإنشاء رموز QR مخصصة (14 نوع) داخل المتصفح دون رفع البيانات إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الإنتاجية', item: `${SITE_URL}/tools/productivity` },
    { '@type': 'ListItem', position: 4, name: 'مولّد QR Code', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ما أنواع QR المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم 14 نوع QR: رابط، نص، بريد إلكتروني، هاتف، SMS، واتساب، WiFi، vCard، حدث، موقع، PayPal، وغيرها.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني تخصيص QR؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك تخصيص الألوان، إضافة شعار، اختيار الحجم والشكل. كل شيء مجاني.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الرابط دائم؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، رمز QR الذي تنشئه دائم ولا ينتهي. يمكنك طباعته ومشاركته للأبد.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل بياناتي آمنة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع الرموز تُنشأ داخل متصفحك مباشرة. لا نرفع أي بيانات إلى خوادمنا.',
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

export default function QrGeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
