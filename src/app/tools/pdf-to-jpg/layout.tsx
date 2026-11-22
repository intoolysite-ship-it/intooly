import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "تحويل PDF إلى JPG أونلاين مجاناً | Intooly",
  description: "حوّل صفحات ملفات PDF إلى صور JPG، واختر الصفحات وجودة الصور المطلوبة ثم نزّلها بسهولة. التحويل يتم مباشرة داخل المتصفح.",
  alternates: {
    canonical: "https://intooly.com/tools/pdf-to-jpg",
  },
};

export default function PdfToJpgLayout({ children }: { children: ReactNode }) {
  return children;
}
