import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/sign-pdf`;

export const metadata: Metadata = {
  title: 'توقيع PDF أونلاين مجانًا وإضافة توقيع إلكتروني | Intooly',
  description:
    'أضف توقيعك إلى ملف PDF بسهولة. ضع صورة توقيعك أو ارسمه إذا كانت الأداة تدعم ذلك، ثم نزّل المستند وراجع موضع التوقيع قبل مشاركته.',
  keywords: [
    'توقيع PDF',
    'توقيع PDF أونلاين',
    'إضافة توقيع إلى PDF',
    'توقيع إلكتروني على PDF',
    'توقيع مستند PDF',
    'sign PDF online',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'توقيع PDF أونلاين مجانًا | Intooly',
    description: 'أضف توقيعك الإلكتروني إلى ملفات PDF. معالجة محلية 100% داخل متصفحك.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'توقيع PDF أونلاين | Intooly',
    description: 'أضف توقيعك الإلكتروني إلى ملفات PDF.',
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
  name: 'توقيع PDF — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لإضافة توقيع إلكتروني إلى ملفات PDF داخل المتصفح.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات PDF', item: `${SITE_URL}/tools/pdf` },
    { '@type': 'ListItem', position: 4, name: 'توقيع PDF', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أوقّع ملف PDF أونلاين؟',
      acceptedAnswer: { '@type': 'Answer', text: 'افتح الأداة، واختر الملف، وأضف التوقيع وفق الخيارات المتاحة، ثم نزّل المستند وراجعه.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني رسم توقيعي؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، الأداة تتيح رسم التوقيع مباشرة باستخدام الفأرة أو اللمس.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن رفع صورة توقيع؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، يمكنك رفع صورة توقيع (PNG أو JPG) وإضافتها إلى المستند.' },
    },
    {
      '@type': 'Question',
      name: 'هل إضافة صورة توقيع تجعل المستند موثقًا رقميًا؟',
      acceptedAnswer: { '@type': 'Answer', text: 'لا، فإضافة صورة لا تنشئ وحدها شهادة توقيع رقمي أو تحققًا موثقًا من الهوية.' },
    },
    {
      '@type': 'Question',
      name: 'هل التوقيع الإلكتروني معترف به قانونيًا؟',
      acceptedAnswer: { '@type': 'Answer', text: 'يختلف الاعتراف القانوني حسب الدولة ونوع التوقيع والمستند ومتطلبات الجهة المعنية. تحقق من القواعد المحلية عند التعامل مع مستندات مهمة.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني مراجعة موضع التوقيع قبل التنزيل؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، تعرض الأداة معاينة مباشرة للتوقيع على الصفحة قبل التنزيل.' },
    },
  ],
};

export default function SignPdfLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}