import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/video-converter`;

export const metadata: Metadata = {
  title: 'تحويل صيغ الفيديو أونلاين مجاناً — MP4, WebM, MOV | Intooly',
  description:
    'حوّل فيديوهاتك بين MP4 و WebM و MOV و MKV و AVI أونلاين مجاناً دون فقدان الجودة. معالجة محلية 100% داخل متصفحك باستخدام FFmpeg.wasm.',
  keywords: [
    'تحويل صيغ الفيديو',
    'تحويل الفيديو',
    'video converter',
    'تحويل MP4',
    'تحويل WebM',
    'تحويل MOV',
    'convert video',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'تحويل صيغ الفيديو أونلاين مجاناً | Intooly',
    description: 'حوّل فيديوهاتك بين MP4 و WebM و MOV و MKV و AVI أونلاين دون فقدان الجودة.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل صيغ الفيديو أونلاين مجاناً | Intooly',
    description: 'حوّل فيديوهاتك بين MP4 و WebM و MOV و MKV و AVI أونلاين.',
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
  name: 'تحويل صيغ الفيديو — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتحويل صيغ الفيديو داخل المتصفح باستخدام FFmpeg.wasm دون رفعه إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الفيديو', item: `${SITE_URL}/tools/video` },
    { '@type': 'ListItem', position: 4, name: 'تحويل صيغ الفيديو', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يعمل تحويل صيغ الفيديو؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تستخدم الأداة FFmpeg.wasm — نسخة من FFmpeg تعمل داخل المتصفح — لتحويل الفيديو بين الصيغ المختلفة دون رفعه إلى أي سيرفر.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم التحويل بين MP4 و WebM و MOV و MKV و AVI. يمكنك اختيار الصيغة المستهدفة قبل التحويل.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل التحويل يؤثر على جودة الفيديو؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'جودة الفيديو تعتمد على الصيغة المستهدفة. يمكنك اختيار جودة عالية للحفاظ على أفضل جودة، أو جودة أقل لتقليل الحجم.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل فيديوهاتي آمنة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع الفيديوهات تُعالج داخل متصفحك مباشرة. لا نرفع أي فيديو إلى خوادمنا، ولا نحتفظ بأي نسخة.',
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

export default function VideoConverterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
