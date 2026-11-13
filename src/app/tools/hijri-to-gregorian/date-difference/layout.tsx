import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/date-difference`;

export const metadata: Metadata = {
  title: 'حساب الفرق بين تاريخين – هجري وميلادي | Intooly',
  description: 'احسب الفرق بين أي تاريخين بالسنوات والأشهر والأيام، أو إجمالي الأيام والأسابيع. أداة مجانية تدعم التقويم الهجري (أم القرى) والميلادي.',
  keywords: [
    'الفرق بين تاريخين', 'حساب الفرق بين تاريخين', 'الفرق بين تاريخين هجريين',
    'حساب الأيام بين تاريخين', 'الفرق بين تاريخين ميلاديين', 'كم يوم بين تاريخين',
    'حساب المدة بين تاريخين', 'حساب الفرق بين تاريخين بالهجري',
    'date difference calculator', 'days between dates', 'hijri date difference',
    'calculate difference between dates', 'الفرق بين تاريخين أونلاين',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'حساب الفرق بين تاريخين – هجري وميلادي | Intooly',
    description: 'احسب الفرق بين أي تاريخين بالسنوات والأشهر والأيام أو إجمالي الأيام.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حساب الفرق بين تاريخين | Intooly',
    description: 'احسب الفرق بين أي تاريخين بالهجري والميلادي.',
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': PAGE_URL + '#application',
      'name': 'حساب الفرق بين تاريخين | Intooly',
      'url': PAGE_URL,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'Any',
      'inLanguage': ['ar', 'en'],
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'حاسبة دقيقة لحساب الفرق بين أي تاريخين بالسنوات والأشهر والأيام، أو إجمالي الأيام والأسابيع.',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': PAGE_URL + '#breadcrumb',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'الأدوات', 'item': SITE_URL + '/tools' },
        { '@type': 'ListItem', 'position': 3, 'name': 'الحاسبات', 'item': SITE_URL + '/tools/calculators' },
        { '@type': 'ListItem', 'position': 4, 'name': 'محول التاريخ', 'item': SITE_URL + '/tools/hijri-to-gregorian' },
        { '@type': 'ListItem', 'position': 5, 'name': 'الفرق بين تاريخين', 'item': PAGE_URL },
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

export default function DateDifferenceLayout({ children }: { children: ReactNode }) {
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