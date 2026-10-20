import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/what-is-my-ip`;

export const metadata: Metadata = {
  title: 'ما هو عنوان IP الخاص بي؟ فحص شامل + خريطة + أمان | Intooly',
  description:
    'اكتشف عنوان IP العام الخاص بك (IPv4/IPv6)، وموقعك على الخريطة، ومزود الخدمة، والمنطقة الزمنية، وفحص القائمة السوداء. أداة مجانية 100% بدون تسجيل.',
  keywords: [
    'ما هو اي بي',
    'فحص IP',
    'عنوان IP',
    'IPv4',
    'IPv6',
    'مزود خدمة الإنترنت',
    'ISP',
    'موقعي على الخريطة',
    'فحص blacklist',
    'what is my ip',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'ما هو عنوان IP الخاص بي؟ | Intooly',
    description: 'اكتشف عنوان IP العام، موقعك على الخريطة، ومزود الخدمة. أداة مجانية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ما هو عنوان IP الخاص بي؟ | Intooly',
    description: 'اكتشف عنوان IP العام، موقعك على الخريطة، ومزود الخدمة.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ما هو عنوان IP الخاص بي؟ — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لفحص عنوان IP العام والموقع الجغرافي ومزود الخدمة وفحص الأمان.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الإنتاجية', item: `${SITE_URL}/tools/productivity` },
    { '@type': 'ListItem', position: 4, name: 'ما هو عنوان IP الخاص بي؟', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ما هو عنوان IP؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'عنوان IP (Internet Protocol) هو رقم فريد يُعطى لكل جهاز متصل بالإنترنت، يشبه عنوان المنزل الرقمي، ويستخدم لتوجيه البيانات بين الأجهزة.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الفرق بين IPv4 و IPv6؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IPv4 هو الإصدار الأقدم ويتكون من 4 أرقام (مثل 192.168.1.1)، بينما IPv6 هو الإصدار الأحدث ويتكون من 8 مجموعات سداسية عشرية، ويوفر عدداً أكبر بكثير من العناوين.',
      },
    },
    {
      '@type': 'Question',
      name: 'كيف أخفي عنوان IP الخاص بي؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يمكنك إخفاء عنوان IP باستخدام شبكة VPN (الأنسب للاستخدام اليومي)، أو Proxy (للتصفح السريع)، أو Tor (لأقصى درجات الخصوصية).',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الموقع الجغرافي دقيق؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'الموقع تقريبي بناءً على عنوان IP، وقد لا يكون دقيقاً بنسبة 100%. يعتمد على قاعدة بيانات مزود الخدمة وقد يختلف من وقت لآخر.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الأداة مجانية بالكامل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، الأداة مجانية بالكامل بدون تسجيل وبدون إعلانات.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل تحتفظ الأداة بعنوان IP الخاص بي؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'لا، الأداة تعرض عنوان IP الخاص بك فقط. لا نحتفظ بأي بيانات على خوادمنا. يتم جلب البيانات من خدمة ipwho.is مباشرة.',
      },
    },
  ],
};

export default function WhatIsMyIpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}