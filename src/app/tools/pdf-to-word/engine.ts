import type { PDFDocumentProxy } from "pdfjs-dist";

export type ConvertProgress = { percent: number; message: string };

export async function convertPdfToWord(
  file: File,
  onProgress: (progress: ConvertProgress) => void
): Promise<Blob> {
  onProgress({ percent: 5, message: "جارٍ تحميل مكتبة PDF…" });

  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  onProgress({ percent: 10, message: "جارٍ قراءة الملف…" });

  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  onProgress({ percent: 20, message: `جارٍ استخراج النص من ${pdf.numPages} صفحة…` });

  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const paragraphs: InstanceType<typeof Paragraph>[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // جمع النص من كل عنصر
    const textItems = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter((s) => s.trim().length > 0);

    if (textItems.length > 0) {
      // إضافة عنوان الصفحة
      paragraphs.push(
        new Paragraph({
          text: `صفحة ${i}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      // إضافة النص كاملاً
      const fullText = textItems.join(" ");
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: fullText, size: 24, font: "Arial" })],
          spacing: { after: 100 },
        })
      );
    }

    const percent = 20 + Math.round((i / pdf.numPages) * 70);
    onProgress({ percent, message: `جارٍ معالجة الصفحة ${i} من ${pdf.numPages}…` });
  }

  onProgress({ percent: 92, message: "جارٍ إنشاء ملف Word…" });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: "لم يتم العثور على نص قابل للاستخراج." })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  onProgress({ percent: 100, message: "اكتمل التحويل." });
  return blob;
}