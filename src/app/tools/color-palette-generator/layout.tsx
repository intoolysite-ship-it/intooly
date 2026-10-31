import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مولد لوحات الألوان مجانًا أونلاين | Color Palette Generator - Intooly',
  description: 'أنشئ لوحات ألوان متناسقة ومميزة مجانًا باستخدام أداة Color Palette Generator من Intooly. استخرج الألوان من الصور، وولّد تدرجات، وحاول عمى الألوان، وصدّر أكواد CSS وTailwind.',
  keywords: 'مولد لوحات الألوان, إنشاء لوحة ألوان, ألوان متناسقة, Color Palette Generator, تناغم الألوان, استخراج ألوان من صور, أكواد HEX وRGB, تصميم واجهات',
  alternates: {
    canonical: 'https://intooly.com/tools/color-palette-generator',
  },
};

export default function ColorPaletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
