import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { faqQuestions } from './faq-data';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = SITE_URL + '/tools/hijri-to-gregorian';

export const metadata: Metadata = {
  title: 'تحويل الهجري إلى ميلادي والعكس أونلاين مجاناً | Intooly',
  description: 'حوّل التاريخ من هجري إلى ميلادي أو من ميلادي إلى هجري بسهولة ومجاناً. أدخل اليوم والشهر والسنة لمعرفة التاريخ المقابل مع اسم اليوم ونتيجة التحويل بدقة عبر محول التاريخ من Intooly.',
  keywords: [
    'تحويل الهجري الي ميلادي', 'تحويل هجري إلى ميلادي', 'تحويل من هجري الى ميلادي',
    'تحويل التاريخ الهجري إلى ميلادي', 'تحويل التاريخ من هجري إلى ميلادي',
    'تحويل التاريخ من ميلادي إلى هجري', 'تحويل الميلادي إلى هجري',
    'تحويل التاريخ الميلادي إلى هجري', 'محول التاريخ الهجري والميلادي',
    'محول التاريخ', 'تحويل التاريخ هجري وميلادي', 'حاسبة تحويل التاريخ',
    'تحويل التاريخ اون لاين', 'تحويل التاريخ الهجري والميلادي',
    'تحويل تاريخ الميلاد من هجري إلى ميلادي', 'تحويل تاريخ الميلاد من ميلادي إلى هجري',
    'كيف أحول التاريخ الهجري إلى ميلادي', 'كيف احول من هجري الى ميلادي',
    'معرفة التاريخ الميلادي المقابل للهجري', 'معرفة التاريخ الهجري المقابل للميلادي',
    'تحويل تاريخ قديم من هجري إلى ميلادي', 'تحويل تاريخ الوثائق من هجري إلى ميلادي',
    'تحويل تاريخ اليوم من هجري إلى ميلادي', 'تحويل التاريخ الهجري إلى الميلادي بالأرقام',
    'تحويل التاريخ الميلادي إلى الهجري بالأرقام', 'تحويل التاريخ الهجري باليوم والشهر والسنة',
    'تحويل التاريخ الهجري إلى ميلادي بدقة', 'تحويل التاريخ الهجري إلى ميلادي حسب أم القرى',
    'تحويل التاريخ من هجري إلى ميلادي والعكس', 'التاريخ الهجري والميلادي',
    'التقويم الهجري والميلادي', 'التاريخ الهجري اليوم', 'التاريخ الميلادي اليوم',
    'التقويم الهجري', 'التقويم الميلادي', 'الأشهر الهجرية بالترتيب',
    'أسماء الشهور الهجرية', 'السنة الهجرية كم يوم', 'الفرق بين السنة الهجرية والميلادية',
    'ما يقابل التاريخ الهجري بالميلادي', 'ما يوافق التاريخ الميلادي بالهجري',
    'تاريخ اليوم بالهجري والميلادي',
    'Hijri to Gregorian converter', 'Gregorian to Hijri converter', 'Islamic date converter',
    'Hijri date converter', 'Hijri Gregorian calendar converter', 'Islamic calendar converter',
    'Convert Hijri to Gregorian', 'Convert Gregorian to Hijri', 'Hijri date to English date',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'تحويل الهجري إلى ميلادي والعكس أونلاين مجاناً | Intooly',
    description: 'محول دقيق بين التقويم الهجري والميلادي (أم القرى) مع اسم اليوم ونسخ النتيجة.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تحويل الهجري إلى ميلادي والعكس | Intooly',
    description: 'حوّل التواريخ بدقة بين التقويمين الهجري والميلادي (أم القرى).',
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
      'description': 'محول دقيق لتحويل التاريخ بين التقويم الهجري (أم القرى) والتقويم الميلادي في الاتجاهين، مع اسم اليوم ونسخ النتيجة.',
      'featureList': [
        'تحويل الهجري إلى ميلادي',
        'تحويل الميلادي إلى هجري',
        'تبديل اتجاه التحويل',
        'عرض اسم اليوم',
        'دعم الأرقام العربية والإنجليزية',
        'نسخ النتيجة',
        'يعمل على الهاتف والكمبيوتر',
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
        { '@type': 'ListItem', 'position': 4, 'name': 'محول التاريخ', 'item': PAGE_URL },
      ],
    },
    {
      '@type': 'HowTo',
      '@id': PAGE_URL + '#howto',
      'name': 'كيفية تحويل التاريخ من هجري إلى ميلادي',
      'totalTime': 'PT1M',
      'tool': [{ '@type': 'HowToTool', 'name': 'متصفح حديث' }],
      'step': [
        { '@type': 'HowToStep', 'position': 1, 'name': 'اختر اتجاه التحويل', 'text': 'اختر هجري إلى ميلادي أو ميلادي إلى هجري.' },
        { '@type': 'HowToStep', 'position': 2, 'name': 'أدخل التاريخ', 'text': 'أدخل اليوم والشهر والسنة من القوائم المنسدلة.' },
        { '@type': 'HowToStep', 'position': 3, 'name': 'اضغط تحويل', 'text': 'اضغط زر حوّل لمعرفة التاريخ المقابل.' },
        { '@type': 'HowToStep', 'position': 4, 'name': 'انسخ النتيجة', 'text': 'انسخ التاريخ المحوّل لاستخدامه في المستندات أو المواعيد.' },
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

export default function HijriLayout({ children }: { children: ReactNode }) {
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