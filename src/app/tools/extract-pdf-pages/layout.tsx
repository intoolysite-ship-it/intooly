import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "استخراج صفحات PDF أونلاين مجاناً | Intooly",
  description: "استخرج صفحات محددة من ملف PDF واحفظها في مستند مستقل بسهولة. اختر الصفحات المطلوبة ونزّل ملفك مباشرة دون رفعه إلى خادم.",
  alternates: {
    canonical: "https://intooly.com/tools/extract-pdf-pages",
  },
};

export default function ExtractPdfPagesLayout({ children }: { children: ReactNode }) {
  return children;
}
