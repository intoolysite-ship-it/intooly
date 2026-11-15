import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/audio-converter`;

export const metadata: Metadata = {
  title: 'تحويل صيغ الصوت أونلاين مجاناً – محول صوتيات | Intooly',
  description: 'حوّل ملفاتك الصوتية بين صيغ MP3 وWAV وM4A وFLAC وOGG وAAC بسهولة ومجاناً. أداة تحويل صوتيات تعمل محلياً في متصفحك دون رفع ملفاتك.',
  keywords: [
    'محول صوتيات', 'تحويل الصوت', 'تحويل صيغ الصوت', 'audio converter',
    'mp3 converter', 'wav converter', 'm4a converter', 'flac converter',
    'تحويل mp3 إلى wav', 'تحويل wav إلى mp3', 'محول صوت اون لاين',
    'تحويل صوتيات مجانا', 'convert audio online', 'audio format converter',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'تحويل صيغ الصوت أونلاين مجاناً – محول صوتيات | Intooly',
    description: 'حوّل ملفاتك الصوتية بين MP3 وWAV وM4A وFLAC وOGG وAAC مجاناً.',
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
      'name': 'محول الصوتيات | Intooly',
      'url': PAGE_URL,
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Any',
      'inLanguage': ['ar', 'en'],
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'featureList': [
        'تحويل بين 6 صيغ صوتية',
        'دعم MP3 وWAV وM4A وFLAC وOGG وAAC',
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
        { '@type': 'ListItem', 'position': 4, 'name': 'محول الصوتيات', 'item': PAGE_URL },
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

export default function AudioConverterLayout({ children }: { children: ReactNode }) {
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