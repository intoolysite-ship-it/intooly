import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download, FileVideo, Scissors, Music, RotateCcw, Film, Image as ImageIcon, Zap } from 'lucide-react';

const SITE_URL = 'https://intooly.com';
const PAGE_URL = `${SITE_URL}/tools/video`;

export const metadata: Metadata = {
  title: 'أدوات الفيديو | تعديل، ضغط، وتنزيل الفيديو أونلاين | Intooly',
  description: 'مجموعة أدوات الفيديو المجانية: تنزيل فيديوهات تيك توك بدون علامة مائية، قص الفيديو، ضغط الملفات، وتحويل الصيغ بسهولة وأمان.',
  keywords: ['أدوات الفيديو', 'تنزيل فيديو تيك توك', 'قص الفيديو', 'ضغط الفيديو', 'تحويل صيغ الفيديو', 'Intooly'],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'أدوات الفيديو | Intooly',
    description: 'مجموعة أدوات الفيديو المجانية لتعديل وتنزيل الفيديوهات أونلاين.',
    url: PAGE_URL,
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: `${SITE_URL}/tools` },
    { '@type': 'ListItem', position: 3, name: 'أدوات الفيديو', item: PAGE_URL },
  ],
};

export default function VideoToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
