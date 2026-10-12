import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مولّد الصور بالذكاء الاصطناعي المجاني | Intooly',
  description: 'أنشئ صورًا احترافية بالذكاء الاصطناعي مجانًا. اكتب وصفك بالعربية واحصل على صورة واقعية في ثوانٍ.',
  keywords: ['مولد الصور', 'توليد صور AI', 'ذكاء اصطناعي', 'صور مجانية', 'FLUX', 'AI Image Generator'],
  openGraph: {
    title: 'مولّد الصور بالذكاء الاصطناعي المجاني | Intooly',
    description: 'أنشئ صورًا احترافية بالذكاء الاصطناعي مجانًا.',
    url: 'https://intooly.com/tools/ai-image-generator',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
  alternates: {
    canonical: 'https://intooly.com/tools/ai-image-generator',
  robots: { index: false, follow: false },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
