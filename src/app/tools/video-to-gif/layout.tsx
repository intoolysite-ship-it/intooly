import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/video-to-gif`;

export const metadata: Metadata = {
  title: 'تحويل الفيديو إلى GIF أونلاين مجاناً | Intooly',
  description:
    'حوّل فيديوهاتك إلى صور GIF متحركة بجودة عالية أونلاين مجاناً. معالجة محلية 100% داخل متصفحك باستخدام FFmpeg.wasm. لا رفع، لا تسجيل.',
  keywords: [
    'تحويل الفيديو إلى GIF',
    'فيديو إلى GIF',
    'video to gif',
    'تحويل MP4 إلى GIF',
    'إنشاء GIF من فيديو',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'تحويل الفيديو إلى GIF أونلاين مجاناً | Intooly',
    description: 'حوّل فيديوهاتك إلى صور GIF متحركة بجودة عالية. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل الفيديو إلى GIF أونلاين مجاناً | Intooly',
    description: 'حوّل فيديوهاتك إلى صور GIF متحركة بجودة عالية.',
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
  name: 'تحويل الفيديو إلى GIF — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لتحويل الفيديو إلى GIF داخل المتصفح باستخدام FFmpeg.wasm دون رفعه إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الفيديو', item: `${SITE_URL}/tools/video` },
    { '@type': 'ListItem', position: 4, name: 'تحويل الفيديو إلى GIF', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يعمل تحويل الفيديو إلى GIF؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تستخدم الأداة FFmpeg.wasm — نسخة من FFmpeg تعمل داخل المتصفح — لتحويل مقاطع الفيديو إلى صور GIF متحركة بجودة عالية. لا تُرفع الفيديوهات إلى أي سيرفر.',
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
      name: 'كيف أتحكم في جودة GIF وحجمه؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يمكنك التحكم في معدل الإطارات (FPS) وحجم GIF والأبعاد ومدة المقطع. كلما زادت الجودة، زاد حجم الملف.',
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

export default function VideoToGifLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
