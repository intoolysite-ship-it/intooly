import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/unlock-pdf`;

export const metadata: Metadata = {
  title: 'إزالة كلمة مرور PDF أونلاين | Intooly',
  description:
    'أزل كلمة المرور من ملف PDF يمكنك فتحه ولديك صلاحية تعديل إعدادات حمايته. استخدم أداة Intooly لإنشاء نسخة غير محمية إذا كانت الأداة تدعم ذلك.',
  keywords: [
    'إزالة كلمة مرور PDF',
    'فتح PDF محمي بكلمة مرور',
    'فك حماية PDF',
    'إزالة قفل PDF',
    'إزالة كلمة السر من PDF',
    'unlock PDF online',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'إزالة كلمة مرور PDF أونلاين | Intooly',
    description: 'أزل كلمة المرور من ملفات PDF التي تملك صلاحية الوصول إليها.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'إزالة كلمة مرور PDF | Intooly',
    description: 'أزل كلمة المرور من ملفات PDF التي تملك صلاحية الوصول إليها.',
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
  name: 'إزالة كلمة مرور PDF — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لإزالة كلمة المرور من ملفات PDF داخل المتصفح.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات PDF', item: `${SITE_URL}/tools/pdf` },
    { '@type': 'ListItem', position: 4, name: 'إزالة كلمة مرور PDF', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أزيل كلمة مرور PDF؟',
      acceptedAnswer: { '@type': 'Answer', text: 'اختر الملف وأدخل كلمة المرور الحالية إذا طلبتها الأداة، ثم نفّذ العملية ونزّل النسخة الناتجة.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن إزالة كلمة المرور مجانًا؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، الأداة مجانية بالكامل بدون تسجيل.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن فتح PDF دون معرفة كلمة المرور؟',
      acceptedAnswer: { '@type': 'Answer', text: 'لا يمكن ضمان ذلك. اطلب كلمة المرور من مالك الملف أو الجهة المخولة.' },
    },
    {
      '@type': 'Question',
      name: 'هل إزالة كلمة المرور تحذف محتوى الملف؟',
      acceptedAnswer: { '@type': 'Answer', text: 'لا، النتيجة نسخة من المستند بدون كلمة مرور. تحقق من الملف الناتج بعد العملية.' },
    },
    {
      '@type': 'Question',
      name: 'هل يجب الاحتفاظ بالنسخة الأصلية؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، يُفضّل الاحتفاظ بالنسخة الأصلية إلى أن تتأكد من سلامة النسخة الناتجة.' },
    },
  ],
};

export default function UnlockPdfLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}