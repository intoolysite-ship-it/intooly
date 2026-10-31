import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'استخراج الألوان من الصور أونلاين مجانًا | Image Color Picker - Intooly',
  description: 'استخرج الألوان من الصور مجانًا باستخدام أداة Image Color Picker من Intooly. احصل على أكواد HEX وRGB وHSL، واختر الألوان بدقة، وأنشئ لوحة ألوان بسهولة دون تثبيت برامج.',
  keywords: 'استخراج الألوان من الصور, معرفة كود اللون من الصورة, منتقي الألوان من الصور, تحديد لون الصورة, استخراج كود HEX من صورة, معرفة RGB من الصورة, أداة اختيار الألوان أونلاين, Image Color Picker, Extract Colors From Image',
  alternates: {
    canonical: 'https://intooly.com/tools/image-color-picker',
  },
};

export default function ImageColorPickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
