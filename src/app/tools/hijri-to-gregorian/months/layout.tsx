import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/months`;

export const metadata: Metadata = {
  title: 'الأشهر الهجرية بالترتيب – أسماء الشهور الهجرية ومعانيها | Intooly',
  description: 'تعرف على الأشهر الهجرية الاثني عشر بالترتيب، مع معاني أسمائها وعدد أيامها والمناسبات الإسلامية في كل شهر. دليل شامل للتقويم الهجري.',
  keywords: [
    'الأشهر الهجرية بالترتيب', 'أسماء الشهور الهجرية', 'الشهور الهجرية',
    'الأشهر الهجرية', 'ترتيب الأشهر الهجرية', 'أشهر السنة الهجرية',
    'ما هي الأشهر الهجرية', 'عدد أيام الشهور الهجرية', 'الأشهر الحرم',
    'شهر رمضان', 'شهر محرم', 'شهر ذو الحجة', 'hijri months',
    'islamic months', 'months in hijri calendar', 'ترتيب شهور السنة الهجرية',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'الأشهر الهجرية بالترتيب – أسماء الشهور الهجرية ومعانيها | Intooly',
    description: 'دليل شامل للأشهر الهجرية الاثني عشر: الأسماء، المعاني، عدد الأيام، المناسبات.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الأشهر الهجرية بالترتيب | Intooly',
    description: 'دليل شامل للأشهر الهجرية الاثني عشر.',
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': PAGE_URL + '#webpage',
      'url': PAGE_URL,
      'name': 'الأشهر الهجرية بالترتيب',
      'inLanguage': 'ar',
      'isPartOf': { '@id': SITE_URL + '#website' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': PAGE_URL + '#breadcrumb',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'الأدوات', 'item': SITE_URL + '/tools' },
        { '@type': 'ListItem', 'position': 3, 'name': 'الحاسبات', 'item': SITE_URL + '/tools/calculators' },
        { '@type': 'ListItem', 'position': 4, 'name': 'محول التاريخ', 'item': SITE_URL + '/tools/hijri-to-gregorian' },
        { '@type': 'ListItem', 'position': 5, 'name': 'الأشهر الهجرية', 'item': PAGE_URL },
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

export default function MonthsLayout({ children }: { children: ReactNode }) {
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