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

export default function UtmBuilderPage() {
  return <UtmBuilderClient />;
}