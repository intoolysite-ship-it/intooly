import type { PDFDocumentProxy } from "pdfjs-dist";

export type ConvertProgress = { percent: number; message: string };

export async function convertPdfToPpt(
  file: File,
  onProgress: (progress: ConvertProgress) => void
): Promise<Blob> {
  onProgress({ percent: 5, message: "جارٍ تحميل مكتبة PDF…" });

  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  onProgress({ percent: 10, message: "جارٍ قراءة الملف…" });

  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  onProgress({ percent: 20, message: `جارٍ استخراج المحتوى من ${pdf.numPages} صفحة…` });

  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE";
  pptx.title = file.name.replace(/\.pdf$/i, "");

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // استخراج النص مع الحفاظ على الأسطر
    const lineMap = new Map<number, { x: number; text: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const transform = item.transform as number[];
      const y = Math.round(transform[5]);
      const x = transform[4];
      const key = Math.round(y / 3) * 3;
      if (!lineMap.has(key)) lineMap.set(key, []);
      lineMap.get(key)!.push({ x, text: item.str });
    }

    const sortedLines = Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map((it) => it.text.trim())
          .join(" ")
      )
      .filter((line) => line.trim().length > 0);

    const slide = pptx.addSlide();

    // عنوان الشريحة
    slide.addText(`صفحة ${i}`, {
      x: 0.3,
      y: 0.2,
      w: 12.5,
      h: 0.6,
      fontSize: 20,
      bold: true,
      color: "1F2937",
      align: "right",
      rtlMode: true,
    });

    if (sortedLines.length > 0) {
      slide.addText(sortedLines.join("\n"), {
        x: 0.3,
        y: 1.0,
        w: 12.5,
        h: 6.5,
        fontSize: 12,
        color: "374151",
        align: "right",
        rtlMode: true,
        valign: "top",
      });
    } else {
      slide.addText("لا يوجد نص قابل للاستخراج في هذه الصفحة.", {
        x: 0.3,
        y: 3.5,
        w: 12.5,
        h: 1,
        fontSize: 14,
        color: "9CA3AF",
        align: "center",
        rtlMode: true,
      });
    }

    const percent = 20 + Math.round((i / pdf.numPages) * 70);
    onProgress({ percent, message: `جارٍ معالجة الصفحة ${i} من ${pdf.numPages}…` });
  }

  onProgress({ percent: 92, message: "جارٍ إنشاء ملف PowerPoint…" });

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;

  onProgress({ percent: 100, message: "اكتمل التحويل." });
  return blob;
}