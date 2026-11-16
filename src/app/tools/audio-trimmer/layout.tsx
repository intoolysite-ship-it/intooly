import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/audio-trimmer`;

export const metadata: Metadata = {
  title: 'قص ودمج الصوت أونلاين مجاناً – قص MP3 ودمج الملفات | Intooly',
  description: 'قص الصوت ودمج ملفات MP3 وWAV أونلاين مجاناً. حدد المقاطع بدقة من الموجة الصوتية، ورتب الملفات، ثم نزّل النتيجة بسهولة مع معالجة محلية تحافظ على خصوصية ملفاتك.',
  keywords: [
    'قص الصوت اون لاين', 'قص ودمج الملفات الصوتية', 'قص الصوت أونلاين',
    'قص ملفات MP3', 'دمج ملفات صوتية', 'قص MP3 اون لاين', 'دمج MP3 اون لاين',
    'تقطيع الصوت', 'محرر صوت اون لاين', 'قص الأغاني', 'قص مقطع صوتي',
    'قص ملف صوتي بدون برنامج', 'audio trimmer', 'audio cutter', 'mp3 cutter',
    'audio joiner', 'mp3 merger', 'audio editor',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'قص ودمج الصوت أونلاين مجاناً – قص MP3 ودمج الملفات | Intooly',
    description: 'قص الصوت ودمج ملفات MP3 وWAV أونلاين مجاناً. حدد المقاطع بدقة من الموجة الصوتية.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': PAGE_URL + '#application',
      'name': 'قص ودمج الصوت | Intooly',
      'url': PAGE_URL,
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Any',
      'inLanguage': ['ar', 'en'],
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'featureList': [
        'قص الصوت بدقة عبر الموجة الصوتية',
        'تحديد بداية ونهاية المقطع',
        'معاينة المقطع قبل التحميل',
        'تصدير MP3, WAV, FLAC, OGG',
        'معالجة محلية 100%',
        'مجاني وبدون تسجيل',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': PAGE_URL + '#breadcrumb',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'الأدوات', 'item': SITE_URL + '/tools' },
        { '@type': 'ListItem', 'position': 3, 'name': 'أدوات الصوت', 'item': SITE_URL + '/tools/audio' },
        { '@type': 'ListItem', 'position': 4, 'name': 'قص الصوت', 'item': PAGE_URL },
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

export default function AudioTrimmerLayout({ children }: { children: ReactNode }) {
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