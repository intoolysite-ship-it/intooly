import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://intooly.com/tools/extract-pdf-pages",
  },
};

export default function ExtractPdfPagesLayout({ children }: { children: ReactNode }) {
  return children;
}
