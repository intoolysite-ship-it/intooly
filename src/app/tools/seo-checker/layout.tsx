import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'فاحص SEO للصفحة مجانًا — تحليل HTML وتوصيات عملية | Intooly',
  description:
    'افحص عناصر SEO في صفحتك: العنوان، الوصف، العناوين، الصور، الروابط، Open Graph، والبيانات المنظمة. احصل على درجة إرشادية وتوصيات عملية داخل المتصفح.',
  keywords: [
    'فاحص SEO',
    'تحليل SEO',
    'On-Page SEO Checker',
    'SEO Analyzer',
    'فحص الميتا',
    'SEO Checker',
    'فحص الروابط',
    'فحص البيانات المنظمة',
  ],
  alternates: {
    canonical: '/tools/seo-checker',
  },
  openGraph: {
    title: 'فاحص SEO للصفحة — Intooly',
    description:
      'حلّل عناصر SEO في HTML واحصل على تقرير مع توصيات عملية.',
    url: '/tools/seo-checker',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فاحص SEO للصفحة — Intooly',
    description: 'حلّل عناصر SEO في HTML واحصل على تقرير مفصل.',
  },
};

export default function SeoCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
