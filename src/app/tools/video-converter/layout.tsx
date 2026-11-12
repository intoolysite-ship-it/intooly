import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = SITE_URL + '/tools/video-converter';

export const metadata: Metadata = {
  title: 'تحويل صيغ الفيديو أونلاين مجانًا – محول MP4 وMOV وMKV | Intooly',
  description: 'حوّل صيغ الفيديو أونلاين مجانًا باستخدام Intooly. غيّر صيغة MP4 وMOV وMKV وWebM وAVI، وتحكم في جودة الفيديو ودقته دون تثبيت برامج أو رفع ملفاتك.',
  keywords: [
    'تحويل صيغة الفيديو', 'صيغ الفيديوهات', 'تحويل صيغة الفيديو مجانًا', 'صيغ فيديو',
    'تغيير صيغة الفيديو', 'تحويل صيغ الفيديو', 'تحويل الفيديو', 'تحويل الفيديو إلى mp4 بدون برنامج',
    'موقع تحويل صيغة الفيديو', 'صيغ الفيديو', 'محول صيغ الفيديو', 'تحويل صيغة الفيديو أون لاين',
    'تحويل صيغ الفيديو اون لاين', 'تغير صيغة فيديو', 'تحويل الصيغة الى mp4', 'تغير صيغة الفيديو',
    'موقع تحويل صيغ الفيديو', 'محول الصيغ', 'تحويل الفيديو اون لاين', 'تحويل صيغ الفيديو مجانا',
    'تحويل صيغ الفيديو أونلاين', 'تحويل تنسيق الفيديو', 'تغيير تنسيق الفيديو', 'تحويل ملفات الفيديو',
    'برنامج تحويل صيغ الفيديو', 'محول الفيديو اون لاين', 'موقع تحويل الفيديو', 'تحويل الفيديو مجانا',
    'تحويل الفيديو بدون برنامج', 'تغيير صيغة ملفات الفيديو', 'تحويل الفيديو من المتصفح',
    'تحويل الفيديو إلى MP4', 'تحويل MOV إلى MP4', 'تحويل MKV إلى MP4', 'تحويل AVI إلى MP4',
    'تحويل WebM إلى MP4', 'تحويل VOB إلى MP4', 'تحويل GIF إلى MP4', 'تحويل MP4 إلى MOV',
    'تحويل MP4 إلى MKV', 'تحويل MP4 إلى AVI', 'تحويل MP4 إلى WebM', 'محول MP4 اون لاين',
    'تحويل ملف فيديو إلى MP4', 'تغيير صيغة الفيديو إلى MP4', 'تحويل ملفات الفيديو إلى MP4',
    'تغيير تنسيق الفيديو إلى MP4', 'أنواع صيغ الفيديو', 'أشهر صيغ الفيديو', 'أفضل صيغة فيديو',
    'امتدادات الفيديو', 'تنسيقات الفيديو', 'صيغ ملفات الفيديو', 'أنواع ملفات الفيديو',
    'تنسيق الفيديو', 'امتداد ملف الفيديو', 'تحويل الفيديو بجودة عالية', 'تحويل الفيديو مع الحفاظ على الجودة',
    'تحويل الفيديو دون فقدان الجودة', 'تغيير دقة الفيديو', 'تحويل الفيديو مع تغيير الدقة',
    'تحويل الفيديو للهاتف', 'تحويل الفيديو للموبايل', 'تحويل الفيديو للكمبيوتر', 'تحويل الفيديو للتلفزيون',
    'تحويل الفيديو للإنترنت', 'تحويل الفيديو للمشاركة', 'تحويل الفيديو بدون علامة مائية',
    'تحويل الفيديو بدون رفع', 'تحويل الفيديو من الهاتف', 'تحويل الفيديو من الكمبيوتر',
    'تحويل الفيديو بدون تثبيت برنامج',
    'Video Converter', 'Online Video Converter', 'Free Video Converter', 'Video Format Converter',
    'Online Video Format Converter', 'Convert Video Online', 'Change Video Format', 'Video Format Changer',
    'Video File Converter', 'Free Online Video Converter', 'Video Format Conversion', 'Browser Video Converter',
    'Online Video Format Changer', 'Video Converter Online Free', 'MP4 Converter', 'Convert to MP4',
    'MOV to MP4', 'MKV to MP4', 'AVI to MP4', 'WebM to MP4', 'VOB to MP4', 'GIF to MP4', 'MP4 to MOV',
    'MP4 to MKV', 'MP4 to AVI', 'MP4 to WebM', 'MOV Converter', 'MKV Converter', 'AVI Converter',
    'WebM Converter', 'Convert MOV Online', 'Convert MKV Online', 'Convert AVI Online', 'Convert Video to MP4',
    'Video Transcoder', 'Online Video Transcoder', 'High Quality Video Converter', 'Video Resolution Converter',
    'Change Video Resolution', 'Convert Video Without Losing Quality', 'Browser Based Video Converter',
    'FFmpeg Video Converter', 'Private Video Converter', 'Convert Video Without Uploading',
    'Free Video Converter No Watermark', 'Video Converter No Software', 'Convert Video Without Software',
    'Online Video Converter No Installation', 'Video Format Conversion Online',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'تحويل صيغ الفيديو أونلاين مجانًا – محول MP4 وMOV وMKV | Intooly',
    description: 'حوّل صيغ الفيديو أونلاين مجانًا بين 11 صيغة، مع تحكم في الجودة والدقة، محلياً في متصفحك.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
    images: [{ url: SITE_URL + '/og/video-converter.png', width: 1200, height: 630, alt: 'أداة تحويل صيغ الفيديو من Intooly' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل صيغ الفيديو أونلاين مجانًا | Intooly',
    description: 'غيّر صيغة MP4 وMOV وMKV وWebM وAVI محلياً في متصفحك.',
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': PAGE_URL + '#application',
      'name': 'تحويل صيغ الفيديو - Intooly',
      'url': PAGE_URL,
      'description': 'أداة تحويل صيغ الفيديو أونلاين مجاناً. غيّر صيغة الفيديو إلى MP4, WebM, MOV, MKV, AVI بجودة عالية مباشرة من المتصفح دون رفع الملفات.',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Any',
      'inLanguage': ['ar', 'en'],
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'featureList': [
        'تحويل صيغ الفيديو بين 11 صيغة',
        'تحويل الفيديو إلى MP4 و MOV و MKV و WebM و AVI',
        'تحويل MOV إلى MP4 و MKV إلى MP4 و AVI إلى MP4',
        'التحكم في جودة الفيديو والدقة',
        'دعم الحفاظ على الدقة الأصلية',
        'معالجة محلية 100% دون رفع الملفات',
        'بدون علامة مائية',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': PAGE_URL + '#breadcrumb',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'الأدوات', 'item': SITE_URL + '/tools' },
        { '@type': 'ListItem', 'position': 3, 'name': 'أدوات الفيديو', 'item': SITE_URL + '/tools/video' },
        { '@type': 'ListItem', 'position': 4, 'name': 'تحويل صيغ الفيديو', 'item': PAGE_URL },
      ],
    },
    {
      '@type': 'HowTo',
      '@id': PAGE_URL + '#howto',
      'name': 'كيفية تحويل صيغة الفيديو أون لاين',
      'description': 'خطوات تحويل صيغة الفيديو باستخدام أداة Intooly.',
      'totalTime': 'PT2M',
      'tool': [{ '@type': 'HowToTool', 'name': 'متصفح حديث' }],
      'step': [
        { '@type': 'HowToStep', 'position': 1, 'name': 'اختيار ملف الفيديو', 'text': 'افتح أداة تحويل صيغ الفيديو، ثم اضغط على زر اختيار الملف وحدد الفيديو الذي تريد تغيير صيغته من جهازك.' },
        { '@type': 'HowToStep', 'position': 2, 'name': 'اختيار صيغة الفيديو', 'text': 'بعد تحميل الملف داخل واجهة الأداة، اختر تنسيق الإخراج الذي تريده، مثل MP4 أو MOV أو MKV أو WebM أو AVI.' },
        { '@type': 'HowToStep', 'position': 3, 'name': 'تحديد الجودة والدقة', 'text': 'اختر مستوى جودة الفيديو المناسب، ثم حدد أقصى دقة للفيديو الناتج من الخيارات المتاحة.' },
        { '@type': 'HowToStep', 'position': 4, 'name': 'بدء تحويل الفيديو', 'text': 'اضغط على زر التحويل وانتظر حتى تكتمل معالجة الملف.' },
        { '@type': 'HowToStep', 'position': 5, 'name': 'تنزيل الفيديو', 'text': 'بعد اكتمال التحويل، يمكنك تنزيل الفيديو بالصيغة الجديدة وحفظه على جهازك.' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': PAGE_URL + '#faq',
      'mainEntity': faqQuestions.map((item) => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
      })),
    },
  ],
};

export default function VideoConverterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      {children}
    </>
  );
}
