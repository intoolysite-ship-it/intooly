import * as pdfLib from "pdf-lib";

export type ProtectProgress = { percent: number; message: string };

export async function protectPdf(
  file: File,
  userPassword: string,
  onProgress: (progress: ProtectProgress) => void
): Promise<Blob> {
  onProgress({ percent: 10, message: "جارٍ قراءة الملف…" });

  const pdfLibEncrypt = await import("pdf-lib-encrypt");
  pdfLibEncrypt.configure(pdfLib);

  const arrayBuffer = await file.arrayBuffer();

  onProgress({ percent: 30, message: "جارٍ تشفير الملف…" });

  const encryptedBytes = await pdfLibEncrypt.lock(new Uint8Array(arrayBuffer), userPassword);

  onProgress({ percent: 90, message: "جارٍ إنهاء التشفير…" });

  const buffer = new ArrayBuffer(encryptedBytes.byteLength);
  new Uint8Array(buffer).set(encryptedBytes);
  const blob = new Blob([buffer], { type: "application/pdf" });

  onProgress({ percent: 100, message: "اكتمل التشفير." });
  return blob;
}