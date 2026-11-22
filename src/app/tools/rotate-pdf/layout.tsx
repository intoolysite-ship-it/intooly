import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "تدوير صفحات PDF أونلاين مجاناً | Intooly",
  description: "دوّر صفحة واحدة أو عدة صفحات أو جميع صفحات ملف PDF إلى الاتجاه الصحيح، ثم نزّل الملف بعد التعديل. أداة مجانية تعمل داخل المتصفح.",
  alternates: {
    canonical: "https://intooly.com/tools/rotate-pdf",
  },
};

export default function RotatePdfLayout({ children }: { children: ReactNode }) {
  return children;
}
