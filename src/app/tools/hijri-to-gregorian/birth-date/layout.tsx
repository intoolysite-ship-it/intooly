import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/birth-date`;

export const metadata: Metadata = {
  title: 'تحويل تاريخ الميلاد من هجري إلى ميلادي والعكس | Intooly',
  description: 'حوّل تاريخ ميلادك بين التقويم الهجري والميلادي بدقة. اعرف تاريخ ميلادك بالهجري والميلادي، ويوم ميلادك. أداة مجانية تعتمد تقويم أم القرى.',
  keywords: [
    'تحويل تاريخ الميلاد من هجري إلى ميلادي', 'تحويل تاريخ الميلاد من ميلادي إلى هجري',
    'تاريخ الميلاد بالهجري', 'تاريخ الميلاد بالميلادي', 'تحويل تاريخ الميلاد',
    'معرفة تاريخ الميلاد بالهجري', 'حاسبة تاريخ الميلاد', 'يوم الميلاد',
    'تحويل عيد الميلاد', 'تاريخ ميلادي بالهجري', 'birth date converter',
    'hijri birth date', 'convert birth date hijri',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'تحويل تاريخ الميلاد من هجري إلى ميلادي والعكس | Intooly',
    description: 'حوّل تاريخ ميلادك بين التقويم الهجري والميلادي بدقة. أداة مجانية تعتمد تقويم أم القرى.',
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
      'name': 'تحويل تاريخ الميلاد | Intooly',
      'url': PAGE_URL,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'Any',
      'inLanguage': ['ar', 'en'],
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': PAGE_URL + '#breadcrumb',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'الأدوات', 'item': SITE_URL + '/tools' },
        { '@type': 'ListItem', 'position': 3, 'name': 'الحاسبات', 'item': SITE_URL + '/tools/calculators' },
        { '@type': 'ListItem', 'position': 4, 'name': 'محول التاريخ', 'item': SITE_URL + '/tools/hijri-to-gregorian' },
        { '@type': 'ListItem', 'position': 5, 'name': 'تحويل تاريخ الميلاد', 'item': PAGE_URL },
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

export default function BirthDateLayout({ children }: { children: ReactNode }) {
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