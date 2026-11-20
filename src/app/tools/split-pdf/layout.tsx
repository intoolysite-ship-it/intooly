import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://intooly.com/tools/split-pdf",
  },
};

export default function SplitPdfLayout({ children }: { children: ReactNode }) {
  return children;
}
