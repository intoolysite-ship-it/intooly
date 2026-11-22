import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "دمج ملفات PDF أونلاين مجاناً في ملف واحد | Intooly",
  description: "ادمج عدة ملفات PDF في ملف واحد مجاناً، ورتّب الملفات قبل الدمج ثم نزّل النتيجة مباشرة. معالجة محلية وآمنة داخل المتصفح.",
  alternates: {
    canonical: "https://intooly.com/tools/merge-pdf",
  },
};

export default function MergePdfLayout({ children }: { children: ReactNode }) {
  return children;
}
