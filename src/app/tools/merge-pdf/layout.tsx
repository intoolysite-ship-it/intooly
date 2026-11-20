import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://intooly.com/tools/merge-pdf",
  },
};

export default function MergePdfLayout({ children }: { children: ReactNode }) {
  return children;
}
