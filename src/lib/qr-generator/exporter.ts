/**
 * تصدير QR Code
 * PNG, SVG, JSON, PDF
 */

import type { QRData, QRSettings, QRType } from './types';
import { generateQrDataUrl, generateQrSvg, buildQRContent } from './generators';

// ============================================
// Download Helper
// ============================================

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// Export PNG
// ============================================

export async function exportPng(
  content: string,
  settings: QRSettings,
  filename: string = 'qr-code'
): Promise<void> {
  const dataUrl = await generateQrDataUrl(content, settings);
  downloadDataUrl(dataUrl, `${filename}.png`);
}

// ============================================
// Export SVG
// ============================================

export async function exportSvg(
  content: string,
  settings: QRSettings,
  filename: string = 'qr-code'
): Promise<void> {
  const svg = await generateQrSvg(content, settings);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${filename}.svg`);
}

// ============================================
// Export JSON (metadata)
// ============================================

export function exportJson(
  type: QRType,
  data: QRData,
  filename: string = 'qr-data'
): void {
  const json = JSON.stringify({
    type,
    data,
    exportedAt: new Date().toISOString(),
  }, null, 2);

  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `${filename}.json`);
}

// ============================================
// Export PDF (Print)
// ============================================

export async function exportPdf(
  content: string,
  settings: QRSettings,
  filename: string = 'qr-code'
): Promise<void> {
  const dataUrl = await generateQrDataUrl(content, settings);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('يرجى السماح بالنوافذ المنبثقة');
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Cairo', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      background: white;
    }
    .container {
      text-align: center;
      max-width: 500px;
    }
    .qr-image {
      max-width: 100%;
      height: auto;
      margin-bottom: 20px;
    }
    .title {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 10px;
    }
    .footer {
      font-size: 12px;
      color: #6b7280;
      margin-top: 20px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${dataUrl}" alt="QR Code" class="qr-image" />
    <div class="title">${filename}</div>
    <div class="footer">صُنع بواسطة intooly.com</div>
  </div>
  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ============================================
// Copy to Clipboard
// ============================================

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.warn('Copy failed:', error);
    return false;
  }
}

// ============================================
// Copy QR as Image
// ============================================

export async function copyQrImage(
  content: string,
  settings: QRSettings
): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return false;
    }

    const dataUrl = await generateQrDataUrl(content, settings);
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);

    return true;
  } catch (error) {
    console.warn('Copy image failed:', error);
    return false;
  }
}

// ============================================
// Export All Formats
// ============================================

export async function exportAll(
  type: QRType,
  data: QRData,
  settings: QRSettings,
  filename: string = 'qr-code'
): Promise<void> {
  const content = buildQRContent(type, data);

  await exportPng(content, settings, filename);
  await exportSvg(content, settings, filename);
  exportJson(type, data, filename);
}
