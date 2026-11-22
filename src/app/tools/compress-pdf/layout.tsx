import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ضغط PDF أونلاين مجاناً مع الحفاظ على الجودة | Intooly",
  description: "اضغط ملفات PDF مجاناً أونلاين وقلّل حجمها مع الحفاظ على النصوص والرموز قابلة للنسخ والتحديد. معالجة آمنة مباشرة داخل المتصفح دون رفع الملفات.",
  alternates: {
    canonical: "https://intooly.com/tools/compress-pdf",
  },
};

export default function CompressPdfLayout({ children }: { children: ReactNode }) {
  return children;
}
