import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إنشاء صور مصغّرة للفيديو مجانًا أونلاين | صانع Thumbnail لليوتيوب - Intooly",
  description:
    "أنشئ صورة مصغّرة للفيديو وصمّم Thumbnail احترافي لليوتيوب مجانًا. أضف الصور والنصوص العربية، حرّك العناوين، خصص الألوان والخلفيات، ونزّل التصميم بمقاس 1280×720 بصيغتي PNG وJPG.",
  alternates: {
    canonical: "https://intooly.com/tools/video-thumbnail-maker",
  },
  openGraph: {
    title: "صانع الصور المصغّرة للفيديو مجانًا أونلاين | Intooly",
    description:
      "صمّم صورة مصغّرة لفيديوهات YouTube بسهولة. أضف صورتك ونصوصك العربية، خصص التصميم، ثم نزّل صورة المعاينة بجودة عالية.",
    url: "https://intooly.com/tools/video-thumbnail-maker",
    siteName: "Intooly",
    type: "website",
    locale: "ar",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function VideoThumbnailMakerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}