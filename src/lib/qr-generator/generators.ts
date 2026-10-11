/**
 * محرك توليد QR Code
 * يستخدم مكتبة qrcode
 */

import QRCode from 'qrcode';
import type { QRData, QRType, QRSettings } from './types';

// ============================================
// Helper: Build QR Content by Type
// ============================================

export function buildQRContent(type: QRType, data: QRData): string {
  switch (type) {
    case 'link':
      return data.url || '';

    case 'text':
      return data.text || '';

    case 'email': {
      const email = data.email || '';
      const params: string[] = [];
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
      return `mailto:${email}${params.length ? '?' + params.join('&') : ''}`;
    }

    case 'phone':
      return `tel:${data.phone || ''}`;

    case 'wifi': {
      const ssid = data.ssid || '';
      const password = data.password || '';
      const encryption = data.encryption || 'WPA';
      const hidden = data.hidden === 'true' ? 'true' : 'false';
      return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;
    }

    case 'vcard': {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${data.lastName || ''};${data.firstName || ''};;;`,
        `FN:${data.firstName || ''} ${data.lastName || ''}`.trim(),
      ];
      if (data.phone) lines.push(`TEL:${data.phone}`);
      if (data.email) lines.push(`EMAIL:${data.email}`);
      if (data.company) lines.push(`ORG:${data.company}`);
      if (data.jobTitle) lines.push(`TITLE:${data.jobTitle}`);
      if (data.website) lines.push(`URL:${data.website}`);
      if (data.address) lines.push(`ADR:;;${data.address};;;;`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'whatsapp': {
      const number = (data.whatsapp || '').replace(/[^0-9]/g, '');
      const message = data.message ? `?text=${encodeURIComponent(data.message)}` : '';
      return `https://wa.me/${number}${message}`;
    }

    case 'location': {
      const location = data.location || '';
      return location;
    }

    case 'event': {
      const lines = [
        'BEGIN:VEVENT',
        `SUMMARY:${data.name || ''}`,
        `DESCRIPTION:${data.description || ''}`,
        `LOCATION:${data.location || ''}`,
      ];
      if (data.date && data.time) {
        const dt = data.date.replace(/-/g, '') + 'T' + data.time.replace(/:/g, '') + '00';
        lines.push(`DTSTART:${dt}`);
        lines.push(`DTEND:${dt}`);
      }
      lines.push('END:VEVENT');
      return lines.join('\n');
    }

    case 'restaurant':
    case 'store':
    case 'company': {
      const url = data.website || data.menuUrl || data.catalogUrl || '';
      if (url) return url;
      return data.name || '';
    }

    case 'custom':
      return data.data || '';

    default:
      return '';
  }
}

// ============================================
// Generate QR as Data URL (PNG)
// ============================================

export async function generateQrDataUrl(
  content: string,
  settings: QRSettings
): Promise<string> {
  if (!content) {
    throw new Error('المحتوى فارغ');
  }

  const options: QRCode.QRCodeToDataURLOptions = {
    width: settings.size,
    margin: settings.margin,
    errorCorrectionLevel: settings.errorCorrection,
    color: {
      dark: settings.foreground,
      light: settings.background,
    },
    type: 'image/png',
  };

  return QRCode.toDataURL(content, options);
}

// ============================================
// Generate QR as SVG String
// ============================================

export async function generateQrSvg(
  content: string,
  settings: QRSettings
): Promise<string> {
  if (!content) {
    throw new Error('المحتوى فارغ');
  }

  const options: QRCode.QRCodeToStringOptions = {
    width: settings.size,
    margin: settings.margin,
    errorCorrectionLevel: settings.errorCorrection,
    color: {
      dark: settings.foreground,
      light: settings.background,
    },
    type: 'svg',
  };

  return QRCode.toString(content, options);
}

// ============================================
// Generate QR as Blob
// ============================================

export async function generateQrBlob(
  content: string,
  settings: QRSettings
): Promise<Blob> {
  const dataUrl = await generateQrDataUrl(content, settings);
  const response = await fetch(dataUrl);
  return response.blob();
}

// ============================================
// Download QR
// ============================================

export async function downloadQr(
  content: string,
  settings: QRSettings,
  filename: string = 'qr-code',
  format: 'png' | 'svg' = 'png'
): Promise<void> {
  if (format === 'svg') {
    const svg = await generateQrSvg(content, settings);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const dataUrl = await generateQrDataUrl(content, settings);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ============================================
// Validate Content
// ============================================

export function validateContent(type: QRType, data: QRData): string | null {
  switch (type) {
    case 'link':
      if (!data.url) return 'الرابط مطلوب';
      if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
        return 'الرابط يجب أن يبدأ بـ http:// أو https://';
      }
      return null;

    case 'text':
      if (!data.text) return 'النص مطلوب';
      return null;

    case 'email':
      if (!data.email) return 'البريد الإلكتروني مطلوب';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return 'البريد الإلكتروني غير صالح';
      }
      return null;

    case 'phone':
      if (!data.phone) return 'رقم الهاتف مطلوب';
      return null;

    case 'wifi':
      if (!data.ssid) return 'اسم الشبكة (SSID) مطلوب';
      return null;

    case 'vcard':
      if (!data.firstName && !data.lastName) return 'الاسم مطلوب';
      return null;

    case 'whatsapp':
      if (!data.whatsapp) return 'رقم واتساب مطلوب';
      return null;

    case 'restaurant':
    case 'store':
    case 'company':
      if (!data.name) return 'الاسم مطلوب';
      return null;

    case 'event':
      if (!data.name) return 'اسم الفعالية مطلوب';
      return null;

    case 'custom':
      if (!data.data) return 'البيانات مطلوبة';
      return null;

    default:
      return null;
  }
}
