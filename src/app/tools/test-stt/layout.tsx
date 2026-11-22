import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "اختبار تحويل الكلام إلى نص بالعربية والإنجليزية | Intooly",
  description: "جرّب التعرف المباشر على الكلام وتحويل الصوت إلى نص باللغتين العربية والإنجليزية. هذه صفحة تجريبية مستقلة وليست أداة الإنتاج النهائية.",
  alternates: {
    canonical: "https://intooly.com/tools/test-stt",
  },
};

export default function TestSttLayout({ children }: { children: ReactNode }) {
  return children;
}
