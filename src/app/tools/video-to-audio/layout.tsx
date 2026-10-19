import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/video-to-audio`;

export const metadata: Metadata = {
  title: 'استخراج الصوت من الفيديو أونلاين مجاناً — MP3, WAV, AAC | Intooly',
  description:
    'استخرج الصوت من أي فيديو بصيغة MP3 أو WAV أو AAC أو غيرها أونلاين مجاناً. معالجة محلية 100% داخل متصفحك باستخدام FFmpeg.wasm.',
  keywords: [
    'استخراج الصوت من الفيديو',
    'تحويل الفيديو إلى صوت',
    'video to audio',
    'استخراج MP3',
    'استخراج WAV',
    'extract audio',
    'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'استخراج الصوت من الفيديو أونلاين مجاناً | Intooly',
    description: 'استخرج الصوت من أي فيديو بصيغة MP3 أو WAV أو AAC أونلاين. معالجة محلية 100%.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'استخراج الصوت من الفيديو أونلاين مجاناً | Intooly',
    description: 'استخرج الصوت من أي فيديو بصيغة MP3 أو WAV أو AAC أونلاين.',
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
  name: 'استخراج الصوت من الفيديو — Intooly',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لاستخراج الصوت من الفيديو داخل المتصفح باستخدام FFmpeg.wasm دون رفعه إلى أي سيرفر.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الفيديو', item: `${SITE_URL}/tools/video` },
    { '@type': 'ListItem', position: 4, name: 'استخراج الصوت من الفيديو', item: PAGE_URL },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يعمل استخراج الصوت من الفيديو؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تستخدم الأداة FFmpeg.wasm — نسخة من FFmpeg تعمل داخل المتصفح — لفصل الصوت عن الفيديو وتحويله إلى صيغة صوتية. لا تُرفع الفيديوهات إلى أي سيرفر.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما صيغ الصوت المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم 6 صيغ صوتية: MP3، WAV، AAC، OGG، M4A، FLAC. يمكنك اختيار الصيغة المطلوبة قبل الاستخراج.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني استخراج الصوت من عدة فيديوهات؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك رفع عدة فيديوهات واستخراج الصوت منها دفعة واحدة، ثم تنزيلها كلها.',
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

export default function VideoToAudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
