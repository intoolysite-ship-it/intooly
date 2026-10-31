import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تحويل الصورة إلى نص مجانًا أونلاين | Intooly',
  description: 'حوّل الصورة إلى نص مكتوب مجانًا باستخدام أداة استخراج النص من الصور. استخرج النص العربي والإنجليزي من الصور، وانسخه أو نزّله لاستخدامه في Word والمستندات بسهولة.',
  alternates: { canonical: 'https://intooly.com/tools/convert-image-to-text' },
  openGraph: {
    title: 'تحويل الصورة إلى نص عربي وإنجليزي مجانًا',
    description: 'استخرج النص من الصور بسهولة، وانسخه أو نزّله في ملف نصي.',
  },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}