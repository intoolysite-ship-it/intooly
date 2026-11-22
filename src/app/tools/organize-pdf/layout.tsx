import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ترتيب صفحات PDF أونلاين مع التدوير والحذف | Intooly",
  description: "رتّب صفحات PDF بالسحب والإفلات، وغيّر ترتيبها أو دوّر الصفحات واحذف غير المطلوب منها. أداة مجانية تعمل داخل متصفحك.",
  alternates: {
    canonical: "https://intooly.com/tools/organize-pdf",
  },
};

export default function OrganizePdfLayout({ children }: { children: ReactNode }) {
  return children;
}
