import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/audio-denoise`;

export const metadata: Metadata = {
  title: 'إزالة الضوضاء من الصوت أونلاين مجاناً – Intooly',
  description: 'أزل الضوضاء والتشويش والأصوات الخلفية من التسجيلات الصوتية مجاناً. نظّف صوتك وحسّن وضوح الكلام مع إمكانية معاينة النتيجة وتنزيلها بسهولة باستخدام Intooly.',
  keywords: [
    'إزالة الضوضاء من الصوت', 'تنظيف الصوت من الضوضاء', 'إزالة التشويش من الصوت',
    'إزالة الأصوات الخلفية من التسجيل', 'تنقية الصوت من الضجيج', 'تحسين جودة الصوت',
    'إزالة صوت الهواء من التسجيل', 'إزالة صوت المروحة من الصوت', 'عزل صوت المتحدث عن الضوضاء',
    'audio noise remover', 'background noise remover', 'clean audio online',
    'noise reduction audio', 'remove background noise from audio', 'AI audio denoiser',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'إزالة الضوضاء من الصوت أونلاين مجاناً – Intooly',
    description: 'أزل الضوضاء والتشويش والأصوات الخلفية من التسجيلات الصوتية مجاناً.',
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
      'name': 'إزالة الضوضاء من الصوت | Intooly',
      'url': PAGE_URL,
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Any',
      'inLanguage': ['ar', 'en'],
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'featureList': [
        'إزالة الضوضاء الثابتة (مروحة، مكيف، هسيس)',
        'التحكم في قوة التنظيف (0-100%)',
        'معاينة النتيجة قبل التحميل',
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
        { '@type': 'ListItem', 'position': 4, 'name': 'إزالة الضوضاء', 'item': PAGE_URL },
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

export default function AudioDenoiseLayout({ children }: { children: ReactNode }) {
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