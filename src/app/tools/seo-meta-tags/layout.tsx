import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'أداة Meta Tags الشاملة — عنوان ووصف ومشاركة اجتماعية | Intooly',
  description:
    'أنشئ وسوم SEO (Title, Description, Robots, Open Graph, Twitter Card) واختبر طولها، مع معاينة فورية لكيفية ظهورها في Google ومنصات التواصل.',
  alternates: {
    canonical: '/tools/seo-meta-tags',
  },
  openGraph: {
    title: 'أداة Meta Tags الشاملة | Intooly',
    description:
      'أنشئ وسوم SEO كاملة واختبر طولها، مع معاينة فورية في Google.',
    url: '/tools/seo-meta-tags',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أداة Meta Tags الشاملة | Intooly',
    description:
      'أنشئ وسوم SEO كاملة واختبر طولها، مع معاينة فورية.',
  },
};

export default function SeoMetaTagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
