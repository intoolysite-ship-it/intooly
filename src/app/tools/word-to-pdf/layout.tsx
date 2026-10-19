import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/word-to-pdf`;

export const metadata: Metadata = {
  title: 'تحويل Word إلى PDF أونلاين مجاناً | Intooly',
  description:
    'حوّل مستندات Word (DOCX) إلى ملف PDF مجاناً وبدون رفع ملفاتك إلى أي سيرفر. الحفاظ على التنسيق، معالجة فورية داخل المتصفح، وتحميل مباشر.',
  keywords: [
    'تحويل Word إلى PDF',
    'Word to PDF',
    'DOCX to PDF',
    'تحويل مستند Word',
    'تحويل وورد إلى PDF',
    'Word إلى PDF عربي',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'تحويل Word إلى PDF أونلاين مجاناً | Intooly',
    description:
      'حوّل مستندات Word إلى PDF مجاناً. كل المعالجة داخل متصفحك — ملفاتك لا تُرفع إلى أي سيرفر.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل Word إلى PDF أونلاين مجاناً | Intooly',
    description: 'حوّل مستندات Word إلى PDF مجاناً. كل المعالجة داخل متصفحك.',
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
  name: 'تحويل Word إلى PDF — Intooly',
  url: PAGE_URL,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'أداة مجانية لتحويل مستندات Word (DOCX) إلى PDF داخل المتصفح، دون رفع الملفات إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات المستندات', item: `${SITE_URL}/tools/documents` },
    { '@type': 'ListItem', position: 4, name: 'تحويل Word إلى PDF', item: PAGE_URL },
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
      name: 'هل تُرفع ملفاتي إلى سيرفر؟',
      acceptedAnswer: { '@type': 'Answer', text: 'لا، جميع الملفات تُعالج داخل متصفحك ولا تُرفع إلى أي سيرفر خارجي.' },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: { '@type': 'Answer', text: 'ندعم صيغة DOCX (Word 2007 وما بعده). لا ندعم صيغة DOC القديمة.' },
    },
    {
      '@type': 'Question',
      name: 'هل يتم الحفاظ على التنسيق الأصلي؟',
      acceptedAnswer: { '@type': 'Answer', text: 'يتم الحفاظ على التنسيق الأساسي (نصوص، عناوين، قوائم). التنسيقات المعقدة (جداول متداخلة، خطوط مخصصة) قد تختلف قليلاً.' },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني تحويل عدة ملفات دفعة واحدة؟',
      acceptedAnswer: { '@type': 'Answer', text: 'حالياً نعالج ملفاً واحداً في كل مرة للحفاظ على الدقة.' },
    },
    {
      '@type': 'Question',
      name: 'ما الحد الأقصى لحجم الملف؟',
      acceptedAnswer: { '@type': 'Answer', text: 'الحد الأقصى 10 ميغابايت لكل ملف، وهو كافٍ لمعظم المستندات.' },
    },
  ],
};

export default function WordToPdfLayout({ children }: { children: React.ReactNode }) {
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
