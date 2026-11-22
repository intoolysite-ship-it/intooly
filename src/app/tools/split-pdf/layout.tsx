import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "تقسيم PDF أونلاين مجاناً حسب الصفحات | Intooly",
  description: "قسّم ملف PDF إلى عدة ملفات حسب نطاق الصفحات أو عدد الصفحات، واستخرج الأجزاء التي تحتاجها بسهولة. معالجة مباشرة داخل المتصفح.",
  alternates: {
    canonical: "https://intooly.com/tools/split-pdf",
  },
};

export default function SplitPdfLayout({ children }: { children: ReactNode }) {
  return children;
}
