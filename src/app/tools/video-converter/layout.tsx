import type { Metadata } from 'next';

// ============================================================
// ✅ إعدادات SEO الخاصة بصفحة تحويل صيغ الفيديو
// ============================================================
export const metadata: Metadata = {
  title: 'تحويل صيغ الفيديو أونلاين مجاناً | MP4, MOV, MKV - Intooly',
  description: 'أداة تحويل صيغ الفيديو أونلاين مجاناً. غيّر صيغة الفيديو إلى MP4, WebM, MOV, MKV, AVI بجودة عالية مباشرة من المتصفح دون رفع الملفات.',
  keywords: 'تحويل صيغ الفيديو, محول فيديو اونلاين, تحويل الفيديو الى mp4, تحويل mov الى mp4, تحويل mkv الى mp4, تحويل فيديو بدون رفع, محول فيديو مجاني',
  alternates: {
    canonical: 'https://intooly.com/tools/video-converter',
  },
};

// ============================================================
// ✅ المكوّن الرئيسي للتخطيط
// ============================================================
export default function VideoConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}