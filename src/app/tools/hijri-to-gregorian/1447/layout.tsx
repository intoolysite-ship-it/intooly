import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/1447`;

export const metadata: Metadata = {
  title: 'التقويم الهجري 1447 – تقويم السنة الهجرية كاملة | Intooly',
  description: 'استعرض التقويم الهجري 1447 كاملاً: 12 شهراً مع ما يقابلها في التقويم الميلادي. اعرف تواريخ رمضان وعيد الفطر وعيد الأضحى والمناسبات الإسلامية في 1447.',
  keywords: [
    'التقويم الهجري 1447', 'تقويم 1447', 'السنة الهجرية 1447',
    'التقويم الهجري ١٤٤٧', 'شهور 1447', 'رمضان 1447', 'عيد الفطر 1447',
    'عيد الأضحى 1447', 'التقويم الهجري 2025', 'التقويم الهجري 2026',
    'hijri calendar 1447', 'islamic calendar 1447', '1447 hijri calendar',
    'التقويم الهجري كامل', 'تقويم السنة الهجرية',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'التقويم الهجري 1447 – تقويم السنة الهجرية كاملة | Intooly',
    description: 'استعرض التقويم الهجري 1447 كاملاً مع التواريخ الميلادية المقابلة.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'التقويم الهجري 1447 | Intooly',
    description: 'التقويم الهجري 1447 كامل مع التواريخ الميلادية.',
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
      'name': 'التقويم الهجري 1447',
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
        { '@type': 'ListItem', 'position': 5, 'name': 'التقويم الهجري 1447', 'item': PAGE_URL },
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

export default function Year1447Layout({ children }: { children: ReactNode }) {
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