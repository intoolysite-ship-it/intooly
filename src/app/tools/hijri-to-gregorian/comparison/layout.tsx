import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/comparison`;

export const metadata: Metadata = {
  title: 'الفرق بين التقويم الهجري والميلادي – مقارنة شاملة | Intooly',
  description: 'قارن بين التقويم الهجري والميلادي: الأساس، عدد الأيام، الأشهر، الاستخدامات. دليل شامل لفهم الفروق بين التقويمين.',
  keywords: [
    'الفرق بين التقويم الهجري والميلادي', 'مقارنة التقويمين', 'التقويم الهجري',
    'التقويم الميلادي', 'الفرق بين الهجري والميلادي', 'السنة الهجرية',
    'السنة الميلادية', 'أشهر التقويم الهجري', 'أشهر التقويم الميلادي',
    'hijri vs gregorian', 'islamic vs gregorian calendar',
    'difference between hijri and gregorian',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'الفرق بين التقويم الهجري والميلادي – مقارنة شاملة | Intooly',
    description: 'دليل شامل لفهم الفروق بين التقويم الهجري والميلادي.',
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
      'name': 'الفرق بين التقويم الهجري والميلادي',
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
        { '@type': 'ListItem', 'position': 5, 'name': 'مقارنة التقويمين', 'item': PAGE_URL },
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

export default function ComparisonLayout({ children }: { children: ReactNode }) {
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