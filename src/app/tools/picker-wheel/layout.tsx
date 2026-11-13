import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/picker-wheel`;

export const metadata: Metadata = {
  title: 'عجلة الحظ أونلاين مجاناً – عجلة الاختيار العشوائي | Intooly',
  description:
    'استخدم عجلة الحظ المجانية لاختيار الأسماء والفائزين والقرعة عشوائياً. أضف خياراتك، خصص الألوان والأوزان، وأدر العجلة بسهولة بدون تسجيل.',
  keywords: [
    'عجلة الحظ', 'عجلة الاختيار العشوائي', 'عجلة أسماء', 'عجلة عشوائية',
    'عجلة الحظ أون لاين', 'عجلة اختيار الفائز', 'عجلة القرعة', 'عجلة الأسماء العشوائية',
    'عجلة اختيار الاسم', 'عجلة نعم أو لا', 'عجلة أرقام', 'عجلة الطعام',
    'random wheel', 'picker wheel', 'spin the wheel', 'random picker',
    'wheel of names', 'random name picker', 'Intooly',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Intooly',
    title: 'عجلة الحظ أونلاين مجاناً – عجلة الاختيار العشوائي | Intooly',
    description:
      'أدر عجلة الحظ لاختيار اسم أو فائز أو رقم عشوائياً. أضف خياراتك وخصص العجلة مجاناً وبدون تسجيل.',
    locale: 'ar',
    images: [{ url: `${SITE_URL}/og/picker-wheel.png`, width: 1200, height: 630, alt: 'عجلة الحظ من Intooly' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'عجلة الحظ أونلاين مجاناً | Intooly',
    description: 'عجلة اختيار عشوائي مجانية للأسماء والفائزين والقرعة، مع تخصيص الألوان والأوزان.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': PAGE_URL + '#application',
      'name': 'عجلة الحظ – عجلة الاختيار العشوائي | Intooly',
      'url': PAGE_URL,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'Any',
      'inLanguage': ['ar', 'en'],
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description':
        'عجلة حظ مجانية لاختيار الأسماء والفائزين والأرقام عشوائياً، مع إمكانية تخصيص الخيارات والألوان والأوزان.',
      'featureList': [
        'اختيار عشوائي للأسماء والفائزين',
        'إضافة قائمة كاملة من الأسماء دفعة واحدة',
        'تخصيص ألوان القطاعات',
        'أوزان مخصصة لكل خيار',
        'عداد مرات الفوز',
        'دوران سلس مع تحقق من النتيجة',
        'مجاني وبدون تسجيل',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': PAGE_URL + '#breadcrumb',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'الرئيسية', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'الأدوات', 'item': `${SITE_URL}/tools` },
        { '@type': 'ListItem', 'position': 3, 'name': 'أدوات الإنتاجية', 'item': `${SITE_URL}/tools/productivity` },
        { '@type': 'ListItem', 'position': 4, 'name': 'عجلة الحظ', 'item': PAGE_URL },
      ],
    },
    {
      '@type': 'HowTo',
      '@id': PAGE_URL + '#howto',
      'name': 'كيفية استخدام عجلة الحظ المجانية',
      'totalTime': 'PT1M',
      'tool': [{ '@type': 'HowToTool', 'name': 'متصفح حديث' }],
      'step': [
        { '@type': 'HowToStep', 'position': 1, 'name': 'أدخل الخيارات', 'text': 'اكتب اسم كل مشارك أو خيار، أو أدخل قائمة كاملة بحيث يكون كل خيار في سطر مستقل.' },
        { '@type': 'HowToStep', 'position': 2, 'name': 'خصص الألوان والأوزان', 'text': 'اختر لوناً لكل قطاع، وحدد الوزن المناسب لكل خيار.' },
        { '@type': 'HowToStep', 'position': 3, 'name': 'أدر العجلة', 'text': 'اضغط على زر أدر العجلة وانتظر حتى يتوقف الدوران وتظهر نتيجة الاختيار.' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': PAGE_URL + '#faq',
      'mainEntity': [
        { '@type': 'Question', 'name': 'ما هي عجلة الحظ؟', 'acceptedAnswer': { '@type': 'Answer', 'text': 'عجلة الحظ هي أداة اختيار عشوائي تتيح لك إضافة أسماء أو أرقام أو خيارات مختلفة، ثم تدوير العجلة لاختيار نتيجة عشوائية.' } },
        { '@type': 'Question', 'name': 'هل عجلة الحظ مجانية؟', 'acceptedAnswer': { '@type': 'Answer', 'text': 'نعم، يمكنك استخدام عجلة الحظ من Intooly مجاناً وبدون الحاجة إلى إنشاء حساب.' } },
        { '@type': 'Question', 'name': 'هل يمكن استخدام عجلة الحظ لاختيار فائز؟', 'acceptedAnswer': { '@type': 'Answer', 'text': 'نعم، يمكنك إدخال أسماء المشاركين وتدوير العجلة لاختيار فائز عشوائي، كما يمكن تخصيص أوزان الخيارات.' } },
        { '@type': 'Question', 'name': 'هل يمكن إضافة عدة أسماء إلى عجلة الاختيار؟', 'acceptedAnswer': { '@type': 'Answer', 'text': 'نعم، يمكنك إضافة الخيارات بشكل فردي أو إدخال قائمة من الأسماء دفعة واحدة.' } },
        { '@type': 'Question', 'name': 'هل يمكن تخصيص ألوان عجلة الحظ؟', 'acceptedAnswer': { '@type': 'Answer', 'text': 'نعم، يمكنك تخصيص ألوان القطاعات وتعديل الخيارات والأوزان لتناسب استخدامك.' } },
        { '@type': 'Question', 'name': 'هل نتائج عجلة الحظ عشوائية؟', 'acceptedAnswer': { '@type': 'Answer', 'text': 'تستخدم الأداة مولداً عشوائياً آمناً متاحاً في المتصفح لاختيار النتائج، مع إمكانية تحديد أوزان مختلفة للخيارات.' } },
      ],
    },
  ],
};

export default function PickerWheelLayout({ children }: { children: ReactNode }) {
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
