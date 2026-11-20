import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://intooly.com/tools/watermark-pdf",
  },
};

export default function WatermarkPdfLayout({ children }: { children: ReactNode }) {
  return children;
}
