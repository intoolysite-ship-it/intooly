import type { PDFDocumentProxy } from "pdfjs-dist";

export type ConvertProgress = { percent: number; message: string };

export async function convertPdfToExcel(
  file: File,
  onProgress: (progress: ConvertProgress) => void
): Promise<Blob> {
  onProgress({ percent: 5, message: "جارٍ تحميل مكتبة PDF…" });

  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  onProgress({ percent: 10, message: "جارٍ قراءة الملف…" });

  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  onProgress({ percent: 20, message: `جارٍ استخراج البيانات من ${pdf.numPages} صفحة…` });

  const XLSX = await import("xlsx");
  const allRows: string[][] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // تجميع العناصر حسب السطر (y)
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

    // ترتيب الأسطر (من الأعلى إلى الأسفل)
    const sortedLines = Array.from(lineMap.entries()).sort((a, b) => b[0] - a[0]);

    if (sortedLines.length > 0) {
      // عنوان الصفحة
      allRows.push([`--- صفحة ${i} ---`]);

      for (const [, items] of sortedLines) {
        // ترتيب العناصر في السطر (من اليسار إلى اليمين)
        const sortedItems = items.sort((a, b) => a.x - b.x);
        allRows.push(sortedItems.map((it) => it.text.trim()));
      }

      allRows.push([]); // سطر فارغ بين الصفحات
    }

    const percent = 20 + Math.round((i / pdf.numPages) * 70);
    onProgress({ percent, message: `جارٍ معالجة الصفحة ${i} من ${pdf.numPages}…` });
  }

  onProgress({ percent: 92, message: "جارٍ إنشاء ملف Excel…" });

  const worksheet = XLSX.utils.aoa_to_sheet(allRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PDF Data");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  onProgress({ percent: 100, message: "اكتمل التحويل." });
  return blob;
}