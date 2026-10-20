import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/pdf-to-ppt`;

export const metadata: Metadata = {
  title: 'تحويل PDF إلى PowerPoint أونلاين | Intooly',
  description:
    'حوّل ملفات PDF إلى عروض PowerPoint لتسهيل تقديم المحتوى ومراجعته. أنشئ ملف عرض من مستنداتك باستخدام Intooly، ثم تحقق من ترتيب الشرائح وإمكانية تحرير عناصرها.',
  keywords: [
    'تحويل PDF إلى PowerPoint',
    'تحويل PDF إلى PPT',
    'تحويل PDF إلى PPTX',
    'تحويل ملف PDF إلى عرض تقديمي',
    'تحويل PDF إلى شرائح',
    'PDF to PowerPoint',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'تحويل PDF إلى PowerPoint أونلاين | Intooly',
    description: 'حوّل ملفات PDF إلى عروض PowerPoint. معالجة محلية 100% داخل متصفحك.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل PDF إلى PowerPoint | Intooly',
    description: 'حوّل ملفات PDF إلى عروض PowerPoint.',
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
  name: 'تحويل PDF إلى PowerPoint — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتحويل ملفات PDF إلى عروض PowerPoint داخل المتصفح.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات PDF', item: `${SITE_URL}/tools/pdf` },
    { '@type': 'ListItem', position: 4, name: 'تحويل PDF إلى PowerPoint', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أحوّل PDF إلى PowerPoint؟',
      acceptedAnswer: { '@type': 'Answer', text: 'اختر ملف PDF، ابدأ التحويل، ثم نزّل ملف العرض إذا كانت الأداة تدعم إنشاء PPT أو PPTX.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تحويل PDF إلى PPTX؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، الأداة تُنتج ملف PPTX قابل للتحرير.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تعديل النصوص بعد التحويل؟',
      acceptedAnswer: { '@type': 'Answer', text: 'يمكن ذلك إذا تحولت النصوص إلى عناصر قابلة للتحرير؛ أما الصفحات المدرجة كصور فلا يمكن تحرير نصوصها مباشرة.' },
    },
    {
      '@type': 'Question',
      name: 'هل يحتفظ التحويل بالتصميم الأصلي؟',
      acceptedAnswer: { '@type': 'Answer', text: 'قد يحافظ على المظهر العام، لكن يمكن أن تختلف الخطوط والأبعاد وتوزيعات العناصر.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تحويل ملف PDF متعدد الصفحات؟',
      acceptedAnswer: { '@type': 'Answer', text: 'يعتمد ذلك على حدود الأداة وحجم الملف وعدد صفحاته.' },
    },
    {
      '@type': 'Question',
      name: 'هل يغني التحويل عن تصميم العرض؟',
      acceptedAnswer: { '@type': 'Answer', text: 'ليس دائمًا؛ فقد تحتاج إلى تعديل الشرائح وإعادة ترتيب المحتوى لتحسين سهولة القراءة.' },
    },
  ],
};

export default function PdfToPptLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}