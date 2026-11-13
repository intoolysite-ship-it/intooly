import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/date-converter`;

export const metadata: Metadata = {
  title: 'محول التاريخ الهجري والميلادي – تحويل فوري | Intooly',
  description: 'محول سريع لتحويل التاريخ بين الهجري والميلادي في الاتجاهين. أدخل التاريخ واحصل على النتيجة فوراً مع اسم اليوم. مجاني وبدون تسجيل.',
  keywords: [
    'محول التاريخ', 'تحويل التاريخ', 'محول التاريخ الهجري والميلادي',
    'تحويل التاريخ الهجري إلى ميلادي', 'تحويل التاريخ الميلادي إلى هجري',
    'converter hijri to gregorian', 'hijri gregorian converter',
    'date converter', 'islamic date converter', 'محول التاريخ أونلاين',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'محول التاريخ الهجري والميلادي – تحويل فوري | Intooly',
    description: 'محول سريع لتحويل التاريخ بين الهجري والميلادي في الاتجاهين.',
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
      'name': 'محول التاريخ الهجري والميلادي | Intooly',
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
        { '@type': 'ListItem', 'position': 5, 'name': 'محول التاريخ المبسط', 'item': PAGE_URL },
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

export default function DateConverterLayout({ children }: { children: ReactNode }) {
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