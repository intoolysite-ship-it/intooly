import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "حذف صفحات من PDF أونلاين مجاناً | Intooly",
  description: "احذف صفحات محددة أو غير مرغوبة من ملفات PDF بسهولة، وعاين الصفحات قبل تنزيل الملف المعدّل. أداة مجانية تعمل داخل المتصفح.",
  alternates: {
    canonical: "https://intooly.com/tools/delete-pdf-pages",
  },
};

export default function DeletePdfPagesLayout({ children }: { children: ReactNode }) {
  return children;
}
