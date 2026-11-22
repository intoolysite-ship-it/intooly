import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "إضافة علامة مائية إلى PDF أونلاين مجاناً | Intooly",
  description: "أضف علامة مائية نصية إلى صفحات PDF، وتحكّم في النص واللون والحجم والموضع والشفافية. أداة مجانية تعالج الملفات داخل المتصفح.",
  alternates: {
    canonical: "https://intooly.com/tools/watermark-pdf",
  },
};

export default function WatermarkPdfLayout({ children }: { children: ReactNode }) {
  return children;
}
