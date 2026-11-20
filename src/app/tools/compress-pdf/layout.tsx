import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://intooly.com/tools/compress-pdf",
  },
};

export default function CompressPdfLayout({ children }: { children: ReactNode }) {
  return children;
}
