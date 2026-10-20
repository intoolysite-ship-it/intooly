import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/pdf-to-word`;

export const metadata: Metadata = {
  title: 'تحويل PDF إلى Word مجانًا أونلاين | Intooly',
  description:
    'حوّل ملفات PDF إلى مستندات Word لتعديل النصوص ومتابعة العمل بسهولة. استخدم أداة Intooly لتحويل مستنداتك، ثم راجع التنسيق قبل حفظ الملف.',
  keywords: [
    'تحويل PDF إلى Word',
    'PDF إلى Word',
    'تحويل PDF إلى DOCX',
    'تحويل PDF إلى Word مجانًا',
    'تحويل ملف PDF قابل للتعديل',
    'PDF to Word Online',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'تحويل PDF إلى Word مجانًا أونلاين | Intooly',
    description: 'حوّل ملفات PDF إلى مستندات Word قابلة للتحرير. معالجة محلية 100% داخل متصفحك.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل PDF إلى Word مجانًا | Intooly',
    description: 'حوّل ملفات PDF إلى مستندات Word قابلة للتحرير.',
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
  name: 'تحويل PDF إلى Word — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتحويل ملفات PDF إلى مستندات Word داخل المتصفح.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات PDF', item: `${SITE_URL}/tools/pdf` },
    { '@type': 'ListItem', position: 4, name: 'تحويل PDF إلى Word', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'هل يمكن تحويل PDF إلى Word مجانًا؟',
      acceptedAnswer: { '@type': 'Answer', text: 'يمكن استخدام الأداة مجانًا إذا كانت النسخة المنشورة من Intooly توفر التحويل دون رسوم.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تعديل ملف Word بعد التحويل؟',
      acceptedAnswer: { '@type': 'Answer', text: 'نعم، إذا نتج عن التحويل مستند Word يحتوي على نص قابل للتحرير، فيمكن تعديله باستخدام برنامج متوافق.' },
    },
    {
      '@type': 'Question',
      name: 'هل يحتفظ Word بالتنسيق الأصلي؟',
      acceptedAnswer: { '@type': 'Answer', text: 'ليس بالضرورة بصورة كاملة؛ فقد تتغير بعض الجداول والصور والخطوط والفواصل.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تحويل PDF ممسوح ضوئيًا؟',
      acceptedAnswer: { '@type': 'Answer', text: 'يعتمد ذلك على دعم الأداة لتقنية OCR. الملفات التي تحتوي على صور فقط قد تحتاج إلى التعرف الضوئي على الحروف.' },
    },
    {
      '@type': 'Question',
      name: 'هل يدعم التحويل اللغة العربية؟',
      acceptedAnswer: { '@type': 'Answer', text: 'تعتمد النتيجة على دعم الأداة للنص العربي واتجاه الكتابة والخطوط، لذلك يُنصح باختبار مستند عربي ومراجعة الناتج.' },
    },
    {
      '@type': 'Question',
      name: 'هل أحتاج إلى تثبيت برنامج؟',
      acceptedAnswer: { '@type': 'Answer', text: 'لا يلزم تثبيت برنامج منفصل إذا كانت الأداة تعمل مباشرة في المتصفح.' },
    },
  ],
};

export default function PdfToWordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}