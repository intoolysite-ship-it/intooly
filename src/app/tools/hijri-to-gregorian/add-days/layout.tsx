import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/add-days`;

export const metadata: Metadata = {
  title: 'إضافة وطرح أيام من التاريخ – هجري وميلادي | Intooly',
  description: 'أضف أو اطرح أياماً أو أشهراً أو سنوات من أي تاريخ (هجري أو ميلادي). احسب التاريخ بعد 30 أو 60 أو 90 يوماً. أداة مجانية تعتمد تقويم أم القرى.',
  keywords: [
    'إضافة أيام إلى تاريخ', 'طرح أيام من تاريخ', 'حساب التاريخ بعد أيام',
    'التاريخ بعد 30 يوم', 'التاريخ بعد 90 يوم', 'إضافة أشهر إلى تاريخ',
    'إضافة سنوات إلى تاريخ', 'حاسبة التاريخ', 'add days to date',
    'date calculator', 'subtract days', 'calculate future date',
    'التاريخ بعد أسبوع', 'التاريخ بعد شهر', 'history calculator',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'إضافة وطرح أيام من التاريخ – هجري وميلادي | Intooly',
    description: 'أضف أو اطرح أياماً أو أشهراً أو سنوات من أي تاريخ.',
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
      'name': 'إضافة وطرح أيام من التاريخ | Intooly',
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
        { '@type': 'ListItem', 'position': 5, 'name': 'إضافة/طرح أيام', 'item': PAGE_URL },
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

export default function AddDaysLayout({ children }: { children: ReactNode }) {
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