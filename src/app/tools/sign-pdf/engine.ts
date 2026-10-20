import { PDFDocument, rgb } from "pdf-lib";

export type SignOptions = {
  pageIndex: number;      // 0-based
  xPercent: number;       // 0-100 (موقع X كنسبة من عرض الصفحة)
  yPercent: number;       // 0-100 (موقع Y كنسبة من ارتفاع الصفحة)
  widthPercent: number;   // 0-100 (عرض التوقيع كنسبة من عرض الصفحة)
};

export async function signPdf(
  pdfFile: File,
  signatureFile: File,
  options: SignOptions
): Promise<Blob> {
  const pdfBytes = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  if (options.pageIndex < 0 || options.pageIndex >= pages.length) {
    throw new Error("رقم الصفحة غير صالح.");
  }

  const page = pages[options.pageIndex];
  const { width: pageWidth, height: pageHeight } = page.getSize();

  // تحميل صورة التوقيع
  const sigBytes = await signatureFile.arrayBuffer();
  let sigImage;
  if (signatureFile.type === "image/png") {
    sigImage = await pdfDoc.embedPng(sigBytes);
  } else {
    sigImage = await pdfDoc.embedJpg(sigBytes);
  }

  // حساب الأبعاد والموقع
  const sigWidth = (options.widthPercent / 100) * pageWidth;
  const sigHeight = (sigImage.height / sigImage.width) * sigWidth;

  const x = (options.xPercent / 100) * pageWidth - sigWidth / 2;
  const y = (options.yPercent / 100) * pageHeight - sigHeight / 2;

  page.drawImage(sigImage, {
    x,
    y,
    width: sigWidth,
    height: sigHeight,
  });

  const resultBytes = await pdfDoc.save();
  const buffer = new ArrayBuffer(resultBytes.byteLength);
  new Uint8Array(buffer).set(resultBytes);
  return new Blob([buffer], { type: "application/pdf" });
}