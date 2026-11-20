import type { Metadata } from 'next';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/tiktok-downloader`;

export const metadata: Metadata = {
  title: 'تنزيل فيديوهات تيك توك بدون علامة مائية مجاناً | Intooly',
  description: 'استخدم أداة تنزيل فيديوهات تيك توك لحفظ الفيديوهات بسهولة، مع خيارات جودة وتنسيقات متعددة حسب توفرها. مجانية، سهلة الاستخدام، وتعمل من المتصفح دون تثبيت تطبيق.',
  keywords: [
    'تنزيل فيديوهات تيك توك',
    'تنزيل فيديوهات تيك توك بدون علامة مائية',
    'تحميل فيديو تيك توك',
    'تنزيل فيديو تيك توك',
    'تحميل تيك توك بدون علامة مائية',
    'تنزيل مقاطع تيك توك',
    'حفظ فيديوهات تيك توك',
    'تنزيل فيديو تيك توك MP4',
    'تحميل فيديو تيك توك بجودة عالية',
    'تنزيل فيديوهات تيك توك أونلاين',
    'تحميل فيديو من رابط تيك توك',
    'تنزيل فيديوهات تيك توك للآيفون',
    'تنزيل فيديوهات تيك توك للأندرويد',
    'تحميل مقاطع تيك توك بدون تطبيق',
    'طريقة تنزيل فيديوهات تيك توك',
    'تحميل فيديو تيك توك على الهاتف',
    'TikTok video downloader',
    'TikTok downloader',
    'TikTok downloader without watermark',
    'Download TikTok videos',
    'Download TikTok without watermark',
    'TikTok video download online',
    'TikTok MP4 downloader',
    'Save TikTok videos',
    'TikTok video downloader HD',
    'TikTok downloader free',
    'TikTok link downloader',
    'TikTok video saver',
    'TikTok audio downloader',
    'Download TikTok videos on iPhone',
    'Download TikTok videos on Android',
    'descargar videos de TikTok',
    'baixar vídeo do TikTok',
    'download video TikTok',
    'télécharger vidéo TikTok',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'تنزيل فيديوهات تيك توك بدون علامة مائية مجاناً | Intooly',
    description: 'استخدم أداة تنزيل فيديوهات تيك توك لحفظ الفيديوهات بسهولة، مع خيارات جودة وتنسيقات متعددة حسب توفرها.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تنزيل فيديوهات تيك توك بدون علامة مائية مجاناً | Intooly',
    description: 'استخدم أداة تنزيل فيديوهات تيك توك لحفظ الفيديوهات بسهولة.',
  },
  robots: { 
    index: true, 
    follow: true, 
    'max-snippet': -1, 
    'max-image-preview': 'large' 
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'تنزيل فيديوهات تيك توك بدون علامة مائية',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية وسريعة لتنزيل فيديوهات تيك توك بدون علامة مائية وبجودة عالية، مع دعم استخراج الصوت بصيغة MP3.',
  inLanguage: ['ar', 'en', 'es', 'pt', 'id', 'fr'],
  featureList: [
    'تنزيل بدون علامة مائية',
    'تحويل إلى MP3',
    'بدون إعلانات',
    'متوافق مع الجوال',
    'واجهة عربية',
    'معاينة الفيديو'
  ]
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الفيديو', item: `${SITE_URL}/tools/video` },
    { '@type': 'ListItem', position: 4, name: 'تنزيل فيديوهات تيك توك', item: PAGE_URL },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'كيفية تنزيل فيديوهات تيك توك',
  description: 'خطوات بسيطة لتحميل أي فيديو من تيك توك بجودة عالية.',
  step: [
    { 
      '@type': 'HowToStep', 
      position: 1, 
      name: 'نسخ الرابط', 
      text: 'افتح تطبيق TikTok وانتقل إلى الفيديو الذي تريد حفظه. اضغط على زر المشاركة ثم اختر نسخ الرابط.' 
    },
    { 
      '@type': 'HowToStep', 
      position: 2, 
      name: 'فتح الأداة', 
      text: 'افتح أداة تنزيل فيديوهات تيك توك على Intooly من متصفح الهاتف أو الكمبيوتر.' 
    },
    { 
      '@type': 'HowToStep', 
      position: 3, 
      name: 'لصق الرابط', 
      text: 'الصق رابط الفيديو في مربع الإدخال المخصص في أعلى الصفحة.' 
    },
    { 
      '@type': 'HowToStep', 
      position: 4, 
      name: 'بدء التنزيل', 
      text: 'اضغط على زر التنزيل وانتظر ظهور خيارات الملف المتاحة.' 
    },
    { 
      '@type': 'HowToStep', 
      position: 5, 
      name: 'حفظ الملف', 
      text: 'اختر صيغة التنزيل المناسبة إذا كانت متوفرة، ثم احفظ الفيديو على جهازك.' 
    }
  ]
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يمكن تنزيل فيديوهات تيك توك؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'انسخ رابط الفيديو من تطبيق TikTok، ثم الصقه في مربع أداة التنزيل واضغط على زر التنزيل واتبع الخيارات المتاحة.' 
      }
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تنزيل فيديوهات تيك توك بدون علامة مائية؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'يعتمد ذلك على توفر نسخة بدون علامة مائية من مصدر الفيديو. تعرض الأداة خيارات التنزيل المتاحة دون ضمان إزالة العلامة المائية من جميع المقاطع.' 
      }
    },
    {
      '@type': 'Question',
      name: 'هل أداة تنزيل فيديوهات تيك توك مجانية؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'يمكن استخدام أداة Intooly مجاناً وفق حدود الاستخدام المعلنة في الموقع، دون الحاجة إلى اشتراك مدفوع.' 
      }
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تنزيل فيديوهات تيك توك على iPhone؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'يمكن فتح الأداة من متصفح Safari على iPhone، واستخدام خيارات التنزيل المتاحة وحفظ الملف وفق إمكانات الجهاز.' 
      }
    },
    {
      '@type': 'Question',
      name: 'هل تعمل الأداة على هواتف Android؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'نعم، يمكن فتح الأداة من متصفح الهاتف ولصق رابط الفيديو واتباع خطوات التنزيل.' 
      }
    },
    {
      '@type': 'Question',
      name: 'هل أحتاج إلى تثبيت تطبيق لتنزيل فيديو تيك توك؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'لا تحتاج إلى تثبيت تطبيق مستقل لاستخدام أداة Intooly؛ يمكنك الوصول إليها مباشرة من متصفح الإنترنت.' 
      }
    },
    {
      '@type': 'Question',
      name: 'لماذا لا يعمل رابط بعض فيديوهات تيك توك؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'قد يكون الفيديو خاصاً أو محذوفاً أو غير متاح في منطقتك، أو قد لا يكون الرابط مدعوماً من خدمة التنزيل.' 
      }
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تنزيل أي فيديو من تيك توك؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'لا، قد لا تتوفر إمكانية تنزيل جميع الفيديوهات، خصوصاً المحتوى الخاص أو المحمي أو الذي لا يسمح مصدره بالتنزيل.' 
      }
    },
    {
      '@type': 'Question',
      name: 'هل يمكن تنزيل فيديو تيك توك بصيغة MP4؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'يمكن تنزيل الفيديو بصيغة MP4 إذا كانت هذه الصيغة متاحة ضمن خيارات الملف الذي يوفره المصدر.' 
      }
    },
    {
      '@type': 'Question',
      name: 'هل أحتاج إلى حساب TikTok؟',
      acceptedAnswer: { 
        '@type': 'Answer', 
        text: 'لا تحتاج إلى تسجيل الدخول بحساب TikTok داخل أداة Intooly. استخدم رابط الفيديو العام الذي تسمح المنصة بالوصول إليه.' 
      }
    }
  ]
};

export default function TiktokDownloaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
