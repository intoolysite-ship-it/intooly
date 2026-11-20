import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://intooly.com/tools/rotate-pdf",
  },
};

export default function RotatePdfLayout({ children }: { children: ReactNode }) {
  return children;
}
