import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://intooly.com/tools/delete-pdf-pages",
  },
};

export default function DeletePdfPagesLayout({ children }: { children: ReactNode }) {
  return children;
}
