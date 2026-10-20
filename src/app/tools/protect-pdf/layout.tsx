import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/protect-pdf`;

export const metadata: Metadata = {
  title: 'حماية PDF بكلمة مرور وتشفير الملف | Intooly',
  description:
    'احمِ مستند PDF بكلمة مرور باستخدام أداة Intooly. أنشئ نسخة محمية وفق خيارات التشفير المتاحة، وتحقق من إمكانية فتح الملف قبل مشاركته.',
  keywords: [
    'حماية PDF بكلمة مرور',
    'تشفير PDF',
    'وضع كلمة مرور لملف PDF',
    'حماية ملفات PDF',
    'قفل ملف PDF',
    'password protect PDF',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'حماية PDF بكلمة مرور | Intooly',
    description: 'احمِ ملفات PDF بكلمة مرور. معالجة محلية 100% داخل متصفحك.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حماية PDF بكلمة مرور | Intooly',
    description: 'احمِ ملفات PDF بكلمة مرور.',
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
  name: 'حماية PDF بكلمة مرور — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتشفير ملفات PDF بكلمة مرور داخل المتصفح.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات PDF', item: `${SITE_URL}/tools/pdf` },
    { '@type': 'ListItem', position: 4, name: 'حماية PDF', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أضع كلمة مرور على PDF؟',
      acceptedAnswer: { '@type': 'Answer', text: 'اختر الملف وأدخل كلمة المرور في الأداة، ثم نفّذ الحماية ونزّل الملف.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن حماية PDF مجانًا؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، الأداة مجانية بالكامل بدون تسجيل.' },
    },
    {
      '@type': 'Question',
      name: 'هل تمنع كلمة المرور فتح الملف؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، سيحتاج المستخدم إلى كلمة المرور للوصول إلى المحتوى عبر البرامج المتوافقة.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني اختيار كلمة المرور بنفسي؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، أنت من يختار كلمة المرور. يُفضل اختيار كلمة مرور قوية وفريدة.' },
    },
    {
      '@type': 'Question',
      name: 'ماذا يحدث إذا نسيت كلمة المرور؟',
      acceptedAnswer: { '@type': 'Answer', text: 'قد يصبح الوصول إلى المستند صعبًا أو غير ممكن. احتفظ بكلمة المرور بأمان قبل حماية الملفات المهمة.' },
    },
    {
      '@type': 'Question',
      name: 'هل التشفير يحمي الملف بعد إرساله؟',
      acceptedAnswer: { '@type': 'Answer', text: 'يساعد تشفير الملف على حماية محتواه، لكن أمانه يتأثر بقوة كلمة المرور وطريقة مشاركتها.' },
    },
  ],
};

export default function ProtectPdfLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}