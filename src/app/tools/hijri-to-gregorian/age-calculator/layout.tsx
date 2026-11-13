import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/hijri-to-gregorian/age-calculator`;

export const metadata: Metadata = {
  title: 'حساب العمر بالهجري والميلادي – حاسبة العمر الدقيقة | Intooly',
  description: 'احسب عمرك بالتقويم الهجري والميلادي بدقة. أدخل تاريخ ميلادك لتعرف عمرك بالسنوات والأشهر والأيام، ويوم ميلادك، وإجمالي أيام حياتك. أداة مجانية تعتمد تقويم أم القرى.',
  keywords: [
    'حساب العمر بالهجري', 'حاسبة العمر بالهجري', 'العمر بالهجري',
    'حساب العمر الهجري', 'كم عمري بالهجري', 'معرفة العمر بالهجري',
    'حساب العمر بالميلادي', 'حاسبة العمر الميلادية', 'معرفة عمري',
    'حساب العمر بالسنوات والأشهر والأيام', 'حساب العمر بالأيام',
    'حساب تاريخ الميلاد', 'العمر بالهجري والميلادي',
    'حسابة العمر', 'احسب عمري', 'حساب العمر باليوم',
    'age calculator in hijri', 'hijri age calculator', 'islamic age calculator',
    'calculate age in hijri calendar',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'حساب العمر بالهجري والميلادي – حاسبة العمر الدقيقة | Intooly',
    description: 'احسب عمرك بالتقويم الهجري والميلادي بدقة. أداة مجانية تعتمد تقويم أم القرى.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حساب العمر بالهجري والميلادي | Intooly',
    description: 'احسب عمرك بالتقويم الهجري والميلادي بدقة.',
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': PAGE_URL + '#application',
      'name': 'حاسبة العمر بالهجري والميلادي | Intooly',
      'url': PAGE_URL,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'Any',
      'inLanguage': ['ar', 'en'],
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'حاسبة دقيقة لحساب العمر بالتقويم الهجري والميلادي. أدخل تاريخ ميلادك لتعرف عمرك بالسنوات والأشهر والأيام.',
      'featureList': [
        'حساب العمر بالهجري',
        'حساب العمر بالميلادي',
        'حساب العمر بالأيام والأسابيع',
        'معرفة يوم الميلاد',
        'مجاني وبدون تسجيل',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': PAGE_URL + '#breadcrumb',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'الأدوات', 'item': SITE_URL + '/tools' },
        { '@type': 'ListItem', 'position': 3, 'name': 'الحاسبات', 'item': SITE_URL + '/tools/calculators' },
        { '@type': 'ListItem', 'position': 4, 'name': 'محول التاريخ', 'item': SITE_URL + '/tools/hijri-to-gregorian' },
        { '@type': 'ListItem', 'position': 5, 'name': 'حساب العمر بالهجري', 'item': PAGE_URL },
      ],
    },
    {
      '@type': 'HowTo',
      '@id': PAGE_URL + '#howto',
      'name': 'كيفية حساب العمر بالهجري',
      'totalTime': 'PT1M',
      'tool': [{ '@type': 'HowToTool', 'name': 'متصفح حديث' }],
      'step': [
        { '@type': 'HowToStep', 'position': 1, 'name': 'اختر نوع التاريخ', 'text': 'اختر هجري أو ميلادي.' },
        { '@type': 'HowToStep', 'position': 2, 'name': 'أدخل تاريخ الميلاد', 'text': 'أدخل اليوم والشهر والسنة.' },
        { '@type': 'HowToStep', 'position': 3, 'name': 'اطلع على العمر', 'text': 'ستظهر النتيجة بالسنوات والأشهر والأيام.' },
        { '@type': 'HowToStep', 'position': 4, 'name': 'انسخ أو شارك', 'text': 'انسخ النتيجة أو شاركها مع الآخرين.' },
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

export default function AgeCalculatorLayout({ children }: { children: ReactNode }) {
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