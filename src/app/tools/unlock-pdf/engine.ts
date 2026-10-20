import * as pdfLib from "pdf-lib";

export type UnlockProgress = { percent: number; message: string };

export async function unlockPdf(
  file: File,
  password: string,
  onProgress: (progress: UnlockProgress) => void
): Promise<Blob> {
  onProgress({ percent: 10, message: "جارٍ قراءة الملف…" });

  const pdfLibEncrypt = await import("pdf-lib-encrypt");
  pdfLibEncrypt.configure(pdfLib);

  const arrayBuffer = await file.arrayBuffer();

  onProgress({ percent: 30, message: "جارٍ فك تشفير الملف…" });

  const pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const success = await pdfLibEncrypt.unlockInPlace(pdfDoc, password);

  if (!success) {
    throw new Error("كلمة المرور غير صحيحة.");
  }

  onProgress({ percent: 70, message: "جارٍ حفظ النسخة غير المحمية…" });

  const pdfBytes = await pdfDoc.save();

  const buffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(buffer).set(pdfBytes);
  const blob = new Blob([buffer], { type: "application/pdf" });

  onProgress({ percent: 100, message: "اكتملت إزالة الحماية." });
  return blob;
}