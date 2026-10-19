import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/image-resizer`;

export const metadata: Metadata = {
  title: 'تغيير حجم الصور أونلاين مجاناً — بالبكسل أو النسبة | Intooly',
  description:
    'غيّر حجم صورك بالبكسل أو النسبة المئوية مع قفل النسبة. معالجة محلية 100% داخل متصفحك. لا رفع، لا تسجيل، سرعة فورية.',
  keywords: [
    'تغيير حجم الصور',
    'تغيير حجم الصورة',
    'image resizer',
    'resize image',
    'تغيير أبعاد الصورة',
    'تصغير الصورة',
    'تكبير الصورة',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'تغيير حجم الصور أونلاين مجاناً | Intooly',
    description: 'غيّر حجم صورك بالبكسل أو النسبة مع قفل النسبة. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تغيير حجم الصور أونلاين مجاناً | Intooly',
    description: 'غيّر حجم صورك بالبكسل أو النسبة مع قفل النسبة.',
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
  name: 'تغيير حجم الصور — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتغيير حجم الصور داخل المتصفح دون رفعها إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الصور', item: `${SITE_URL}/tools/images` },
    { '@type': 'ListItem', position: 4, name: 'تغيير حجم الصور', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أغيّر حجم الصورة دون فقدان الجودة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'استخدم خيار "قفل النسبة" للحفاظ على الأبعاد الأصلية، واختر أبعادًا أكبر من أو تساوي الأبعاد الأصلية. الصور التي تُصغَّر تفقد بعض الجودة، لذا احتفظ بنسخة أصلية.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الأبعاد المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يمكنك إدخال أي أبعاد بالبكسل (مثل 800x600، 1920x1080). يدعم القفل النسبي للحفاظ على نسبة العرض إلى الارتفاع.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني تغيير حجم عدة صور دفعة واحدة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك رفع عدة صور وتغيير أحجامها دفعة واحدة، ثم تنزيلها كلها في ملف ZIP.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم JPG و PNG و WEBP. الصور المعدّلة تُحفظ بنفس الصيغة الأصلية.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل صوري آمنة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع الصور تُعالج داخل متصفحك مباشرة. لا نرفع أي صورة إلى خوادمنا، ولا نحتفظ بأي نسخة.',
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

export default function ImageResizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
