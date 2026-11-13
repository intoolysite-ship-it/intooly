import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/islamic-events`;

export const metadata: Metadata = {
  title: 'المناسبات الإسلامية 1447 – التواريخ الهجرية والميلادية | Intooly',
  description: 'استعرض المناسبات الإسلامية القادمة مع تواريخها الهجرية والميلادية وعد تنازلي. رمضان، عيد الفطر، عيد الأضحى، المولد النبوي، ويوم عرفة.',
  keywords: [
    'المناسبات الإسلامية', 'المناسبات الإسلامية 1447', 'المناسبات الهجرية',
    'رمضان 1447', 'عيد الفطر 1447', 'عيد الأضحى 1447', 'يوم عرفة 1447',
    'المولد النبوي 1447', 'الإسراء والمعراج 1447', 'عاشوراء 1447',
    'islamic events 2025', 'islamic events 2026', 'muslim holidays',
    'ramadan 2026', 'eid al fitr 2026', 'eid al adha 2026',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'المناسبات الإسلامية 1447 – التواريخ الهجرية والميلادية | Intooly',
    description: 'المناسبات الإسلامية القادمة مع تواريخها وعد تنازلي.',
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
      '@type': 'WebPage',
      '@id': PAGE_URL + '#webpage',
      'url': PAGE_URL,
      'name': 'المناسبات الإسلامية 1447',
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
        { '@type': 'ListItem', 'position': 5, 'name': 'المناسبات الإسلامية', 'item': PAGE_URL },
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

export default function IslamicEventsLayout({ children }: { children: ReactNode }) {
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