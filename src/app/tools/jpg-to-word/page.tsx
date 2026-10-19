import type { Metadata } from 'next';
import JpgToWordClient from './JpgToWordClient';

export const metadata: Metadata = {
  title: 'JPG to Word Converter Free – Convert Image to Editable Word | Intooly',
  description:
    'Convert JPG and PNG images to editable Word documents online for free. Extract Arabic or English text with OCR, edit the result, or place the original image in a DOCX file. Images are processed in your browser.',
  keywords: [
    'JPG to Word',
    'JPG to Word converter',
    'image to Word',
    'convert image to Word',
    'JPG to DOCX',
    'Arabic OCR',
    'تحويل JPG إلى Word',
    'تحويل صورة إلى وورد',
    'استخراج النص من الصور',
  ],
  alternates: {
    canonical: '/tools/jpg-to-word',
  },
  openGraph: {
    title: 'JPG to Word Converter Free | Intooly',
    description:
      'Extract text from JPG or PNG images and create editable Word documents in your browser.',
    url: 'https://intooly.com/tools/jpg-to-word',
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'تحويل JPG إلى Word — Intooly',
  url: 'https://intooly.com/tools/jpg-to-word',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'أداة مجانية لتحويل صور JPG وPNG إلى مستندات Word باستخدام OCR (عربي وإنجليزي) داخل المتصفح.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://intooly.com' },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: 'https://intooly.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'أدوات المستندات', item: 'https://intooly.com/tools/documents' },
    { '@type': 'ListItem', position: 4, name: 'تحويل JPG إلى Word', item: 'https://intooly.com/tools/jpg-to-word' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يعمل تحويل JPG إلى Word؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تستخدم الأداة تقنية OCR (التعرف الضوئي على الحروف) لاستخراج النص من الصورة، ثم إنشاء ملف Word قابل للتحرير. كل شيء يعمل داخل متصفحك.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما اللغات المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم العربية والإنجليزية، ويمكن دمج اللغتين إذا كانت الصورة تحتوي على نصوص مختلطة.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما الصيغ المدعومة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ندعم JPG و PNG. الحد الأقصى لحجم الصورة 10 ميجابايت.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل صوري آمنة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، جميع الصور تُعالج داخل متصفحك مباشرة. لا نرفع أي صورة إلى خوادمنا.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل الأداة مجانية بالكامل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، الأداة مجانية بالكامل بدون تسجيل وبدون علامات مائية.',
      },
    },
  ],
};

export default function JpgToWordPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <JpgToWordClient />
    </>
  );
}