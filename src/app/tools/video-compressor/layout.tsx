import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/video-compressor`;

export const metadata: Metadata = {
  title: 'ضغط الفيديو أونلاين مجاناً — قلّل الحجم واحتفظ بالجودة | Intooly',
  description:
    'اضغط فيديوهات MP4 و WebM و MOV أونلاين مجاناً دون فقدان الجودة. معالجة محلية 100% داخل متصفحك باستخدام FFmpeg.wasm. لا رفع، لا تسجيل.',
  keywords: [
    'ضغط الفيديو',
    'ضغط الفيديو أونلاين',
    'video compressor',
    'تقليل حجم الفيديو',
    'ضغط MP4',
    'compress video',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'ضغط الفيديو أونلاين مجاناً | Intooly',
    description: 'اضغط فيديوهات MP4 و WebM و MOV أونلاين دون فقدان الجودة. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ضغط الفيديو أونلاين مجاناً | Intooly',
    description: 'اضغط فيديوهات MP4 و WebM و MOV أونلاين دون فقدان الجودة.',
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
  name: 'ضغط الفيديو — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لضغط الفيديو داخل المتصفح باستخدام FFmpeg.wasm دون رفعه إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الفيديو', item: `${SITE_URL}/tools/video` },
    { '@type': 'ListItem', position: 4, name: 'ضغط الفيديو', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يعمل ضغط الفيديو؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تستخدم الأداة FFmpeg.wasm — نسخة من FFmpeg تعمل داخل المتصفح — لضغط الفيديو بجودة عالية وحجم أصغر. لا تُرفع الفيديوهات إلى أي سيرفر.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم MP4 و WebM و MOV. يُفضّل استخدام MP4 للحصول على أفضل توافق.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الضغط يؤثر على جودة الفيديو؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يعتمد على مستوى الضغط الذي تختاره. يمكنك اختيار جودة عالية للحفاظ على أفضل جودة، أو ضغط أعلى لتقليل الحجم أكثر.',
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

export default function VideoCompressorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
