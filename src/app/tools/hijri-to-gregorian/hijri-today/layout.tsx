import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/hijri-today`;

export const metadata: Metadata = {
  title: 'التاريخ الهجري اليوم – تاريخ اليوم بالهجري والميلادي | Intooly',
  description: 'اعرف التاريخ الهجري اليوم مباشرة مع ما يقابله في التقويم الميلادي واسم اليوم. أداة مجانية تعرض تاريخ اليوم الهجري والميلادي تلقائياً وفق تقويم أم القرى.',
  keywords: [
    'التاريخ الهجري اليوم', 'تاريخ اليوم هجري', 'التاريخ الهجري والميلادي اليوم',
    'تاريخ اليوم بالهجري', 'التاريخ الهجري الآن', 'تاريخ اليوم الهجري',
    'ما هو التاريخ الهجري اليوم', 'التقويم الهجري اليوم', 'today hijri date',
    'hijri date today', 'Islamic date today', 'التاريخ الهجري الحالي',
    'تاريخ اليوم هجري وميلادي', 'اليوم كم هجري', 'التاريخ الهجري اليوم أم القرى',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'التاريخ الهجري اليوم – تاريخ اليوم بالهجري والميلادي | Intooly',
    description: 'اعرف تاريخ اليوم الهجري والميلادي مباشرة مع اسم اليوم. أداة مجانية تعتمد تقويم أم القرى.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'التاريخ الهجري اليوم | Intooly',
    description: 'اعرف تاريخ اليوم الهجري والميلادي مباشرة.',
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
      'name': 'التاريخ الهجري اليوم – تاريخ اليوم بالهجري والميلادي',
      'description': 'اعرف التاريخ الهجري اليوم مع ما يقابله في التقويم الميلادي واسم اليوم.',
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
        { '@type': 'ListItem', 'position': 5, 'name': 'التاريخ الهجري اليوم', 'item': PAGE_URL },
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

export default function HijriTodayLayout({ children }: { children: ReactNode }) {
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