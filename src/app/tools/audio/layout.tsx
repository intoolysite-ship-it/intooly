import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'أدوات الصوت المجانية أونلاين | Audio Tools - Intooly',
  description: 'مجموعة أدوات الصوت المجانية من Intooly: تحويل الصوت الى نص، معالجة الملفات الصوتية، وتحويل الصيغ. كل الأدوات تعمل محلياً في متصفحك بدون تسجيل.',
  keywords: 'أدوات الصوت, تحويل الصوت الى نص, معالجة الصوت, أدوات صوتية مجانية, Audio Tools, Speech to Text',
  alternates: {
    canonical: 'https://intooly.com/tools/audio',
  },
};

export default function AudioToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
