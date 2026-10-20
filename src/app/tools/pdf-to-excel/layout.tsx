import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/pdf-to-excel`;

export const metadata: Metadata = {
  title: 'تحويل PDF إلى Excel أونلاين واستخراج الجداول | Intooly',
  description:
    'حوّل البيانات والجداول الموجودة في ملفات PDF إلى جداول قابلة للتحرير في Excel. سهّل تنظيم التقارير والفواتير وراجع البيانات بعد التحويل باستخدام Intooly.',
  keywords: [
    'تحويل PDF إلى Excel',
    'تحويل PDF إلى XLSX',
    'استخراج الجداول من PDF',
    'تحويل الفواتير إلى Excel',
    'تحويل جداول PDF إلى Excel',
    'PDF to Excel',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'تحويل PDF إلى Excel أونلاين | Intooly',
    description: 'حوّل الجداول والبيانات من PDF إلى Excel قابلة للتحرير. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل PDF إلى Excel أونلاين | Intooly',
    description: 'حوّل الجداول والبيانات من PDF إلى Excel.',
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
  name: 'تحويل PDF إلى Excel — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتحويل الجداول والبيانات من PDF إلى Excel داخل المتصفح.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات PDF', item: `${SITE_URL}/tools/pdf` },
    { '@type': 'ListItem', position: 4, name: 'تحويل PDF إلى Excel', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أحوّل PDF إلى Excel؟',
      acceptedAnswer: { '@type': 'Answer', text: 'حمّل الملف إلى الأداة، ابدأ التحويل، ثم نزّل النتيجة وراجع الجدول الناتج.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تحويل PDF إلى XLSX؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، الأداة تُنتج ملف XLSX قابل للتحرير.' },
    },
    {
      '@type': 'Question',
      name: 'هل يحتفظ التحويل بالصفوف والأعمدة؟',
      acceptedAnswer: { '@type': 'Answer', text: 'يعتمد ذلك على تنظيم الجدول في الملف الأصلي، وقد تحتاج إلى إعادة ترتيب بعض الخلايا.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن استخراج البيانات من الفواتير؟',
      acceptedAnswer: { '@type': 'Answer', text: 'قد يمكن استخراج الجداول والبيانات الواضحة، لكن يجب التحقق من الأرقام والإجماليات يدويًا.' },
    },
    {
      '@type': 'Question',
      name: 'هل يدعم ملفات PDF العربية؟',
      acceptedAnswer: { '@type': 'Answer', text: 'تعتمد النتيجة على دعم الأداة للنصوص العربية واتجاه الكتابة وطبيعة الجداول.' },
    },
    {
      '@type': 'Question',
      name: 'هل يجب مراجعة البيانات بعد التحويل؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، خصوصًا القيم المالية والتواريخ والأرقام التي سيُبنى عليها قرار أو تقرير.' },
    },
  ],
};

export default function PdfToExcelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}