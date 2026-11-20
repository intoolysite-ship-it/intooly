import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://intooly.com/tools/pdf-to-jpg",
  },
};

export default function PdfToJpgLayout({ children }: { children: ReactNode }) {
  return children;
}
