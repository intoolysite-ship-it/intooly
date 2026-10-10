/**
 * قارئ الملفات — TXT, DOCX, PDF
 * يستخرج النص محلياً في المتصفح
 */

import { WORD_COUNTER_CONFIG, WORD_COUNTER_MESSAGES } from './constants';

// ============================================
// قراءة ملف كـ نص (TXT)
// ============================================

export async function readTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || '');
    };
    
    reader.onerror = () => {
      reject(new Error(WORD_COUNTER_MESSAGES.FILE_READ_ERROR));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
}

// ============================================
// قراءة ملف DOCX
// ============================================

export async function readDocxFile(file: File): Promise<string> {
  try {
    // نستخدم JSZip لقراءة DOCX (ملف ZIP)
    const JSZip = (await import('jszip')).default;
    
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // ملف word/document.xml يحتوي على النص
    const documentXml = await zip.file('word/document.xml')?.async('string');
    
    if (!documentXml) {
      throw new Error('ملف DOCX غير صالح');
    }
    
    // استخراج النص من XML
    let text = documentXml;
    
    // استبدال الفقرات بأسطر جديدة
    text = text.replace(/<\/w:p>/g, '\n');
    
    // إزالة كل الوسوم XML
    text = text.replace(/<[^>]+>/g, '');
    
    // فك ترميز HTML entities
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    
    // تنظيف الأسطر الفارغة المتعددة
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    
    return text;
  } catch (e) {
    console.error('DOCX read error:', e);
    throw new Error('فشل قراءة ملف DOCX');
  }
}

// ============================================
// قراءة ملف PDF (بسيط - بدون OCR)
// ============================================

export async function readPdfFile(file: File): Promise<string> {
  try {
    // ملاحظة: قراءة PDF في المتصفح معقدة
    // نستخدم pdfjs-dist إذا كان متاحاً
    const pdfjs = await import('pdfjs-dist');
    
    // تعيين worker
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (e) {
    console.error('PDF read error:', e);
    throw new Error('فشل قراءة ملف PDF. تأكد من أن الملف يحتوي على نص (وليس صوراً ممسوحة ضوئياً)');
  }
}

// ============================================
// الدالة الرئيسية — قراءة أي ملف
// ============================================

export async function readFile(file: File): Promise<string> {
  // التحقق من الحجم
  if (file.size > WORD_COUNTER_CONFIG.MAX_FILE_SIZE) {
    throw new Error(WORD_COUNTER_MESSAGES.FILE_TOO_BIG);
  }
  
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop() || '';
  
  // قراءة حسب النوع
  if (extension === 'txt' || extension === 'md' || extension === 'csv') {
    return readTxtFile(file);
  }
  
  if (extension === 'docx') {
    return readDocxFile(file);
  }
  
  if (extension === 'pdf') {
    return readPdfFile(file);
  }
  
  // محاولة القراءة كـ TXT افتراضياً
  return readTxtFile(file);
}

// ============================================
// التحقق من نوع الملف
// ============================================

export function isSupportedFile(file: File): boolean {
  const supportedExtensions = ['txt', 'md', 'csv', 'docx', 'pdf'];
  const extension = file.name.toLowerCase().split('.').pop() || '';
  return supportedExtensions.includes(extension);
}

// ============================================
// تنزيل النص كملف
// ============================================

export function downloadTextAsFile(
  text: string,
  filename: string,
  format: 'txt' | 'md' = 'txt'
): void {
  if (typeof window === 'undefined') return;
  
  const mimeType = format === 'md' 
    ? 'text/markdown;charset=utf-8' 
    : 'text/plain;charset=utf-8';
  
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// نسخ النص إلى الحافظة
// ============================================

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (e) {
    console.error('Copy error:', e);
    return false;
  }
}
