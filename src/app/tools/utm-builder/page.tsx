import type { Metadata } from 'next';
import UtmBuilderClient from './UtmBuilderClient';

export const metadata: Metadata = {
  title: 'مولّد روابط UTM المجاني – إنشاء UTM Code للتسويق | Intooly',
  description:
    'أنشئ روابط UTM احترافية لحملاتك التسويقية مجانًا. أضف utm_source وutm_medium وutm_campaign وتتبّع مصادر الزيارات بدقة. معالجة محلية 100%.',
  keywords: [
    'UTM Builder',
    'مولد UTM',
    'Google URL Builder',
    'UTM Code',
    'UTM Parameters',
    'تتبع الحملات',
    'تحليلات جوجل',
    'أدوات التسويق',
  ],
  alternates: {
    canonical: 'https://intooly.com/tools/utm-builder',
  },
  openGraph: {
    title: 'مولّد روابط UTM المجاني | Intooly',
    description:
      'أنشئ روابط UTM احترافية لحملاتك التسويقية مجانًا. تتبّع مصادر الزيارات بدقة.',
    url: 'https://intooly.com/tools/utm-builder',
    siteName: 'Intooly',
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'مولّد روابط UTM — Intooly',
  url: 'https://intooly.com/tools/utm-builder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'أداة مجانية لإنشاء روابط UTM احترافية داخل المتصفح، لتتبع حملاتك التسويقية بدقة في Google Analytics.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://intooly.com' },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: 'https://intooly.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'أدوات الإنتاجية', item: 'https://intooly.com/tools/productivity' },
    { '@type': 'ListItem', position: 4, name: 'مولّد روابط UTM', item: 'https://intooly.com/tools/utm-builder' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ما هو UTM Builder؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'UTM Builder هو أداة لإنشاء روابط UTM تحتوي على معاملات تتبع (source, medium, campaign) لقياس فعالية حملاتك التسويقية في Google Analytics.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما معاملات UTM الأساسية؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'المعاملات الأساسية: utm_source (المصدر)، utm_medium (الوسيط)، utm_campaign (الحملة)، ويمكن إضافة utm_term و utm_content اختياريًا.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الأداة مجانية؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، الأداة مجانية بالكامل بدون تسجيل وبدون حدود.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل بياناتي آمنة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع الروابط تُنشأ داخل متصفحك مباشرة. لا نرفع أي بيانات إلى خوادمنا.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني نسخ الرابط بسهولة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك نسخ الرابط بضغطة واحدة بعد إنشائه.',
      },
    },
  ],
};

export default function UtmBuilderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <UtmBuilderClient />
    </>
  );
}