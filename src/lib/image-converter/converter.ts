// ============================================================
// 🔄 محرك تحويل الصور — القلب الرئيسي للأداة
// ============================================================

import type { 
  ImageFormat, 
  ConversionSettings, 
  ConversionResult,
  PresetConfig,
  SmartPreset,
} from './types';
import { 
  SMART_PRESETS, 
  DEFAULT_SETTINGS, 
  LIMITS,
  SUPPORTED_FORMATS,
} from './constants';
import { getFormatInfo, hexToRgb } from './utils';
import { convertHeicToBlob } from './heic-support';

// ============================================================
// 🎯 تحويل صورة واحدة
// ============================================================

export async function convertImage(
  file: File,
  settings: ConversionSettings
): Promise<ConversionResult> {
  const startTime = performance.now();
  
  try {
    // 1. التحقق من الصيغة
    const targetInfo = getFormatInfo(settings.format);
    if (!targetInfo) {
      throw new Error(`الصيغة ${settings.format} غير مدعومة`);
    }
    
    // 2. إذا كانت الصيغة الأصلية HEIC
    let sourceFile: Blob = file;
    const sourceExt = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (sourceExt === 'heic' || sourceExt === 'heif') {
      console.log('🔄 Converting HEIC → intermediate format');
      sourceFile = await convertHeicToBlob(file, 'image/png');
    }
    
    // 3. تحميل الصورة
    const img = await loadImage(sourceFile);
    
    // 4. حساب الأبعاد الجديدة
    const { width: targetWidth, height: targetHeight } = calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      settings
    );
    
    // 5. إنشاء Canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { 
      alpha: targetInfo.supportsAlpha && settings.preserveAlpha,
      willReadFrequently: false,
    });
    
    if (!ctx) throw new Error('فشل الحصول على Canvas context');
    
    // 6. تحسين جودة التصيير
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 7. لون الخلفية (إذا كانت الصيغة لا تدعم الشفافية)
    const needsBackground = !targetInfo.supportsAlpha || !settings.preserveAlpha;
    if (needsBackground) {
      const bg = hexToRgb(settings.backgroundColor);
      ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    
    // 8. رسم الصورة
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    // 9. تحويل إلى Blob
    const blob = await canvasToBlob(
      canvas,
      targetInfo.mimeType,
      settings.quality
    );
    
    if (!blob) {
      throw new Error('فشل تحويل Canvas إلى Blob');
    }
    
    // 10. التحقق من الحجم
    const duration = performance.now() - startTime;
    
    return {
      success: true,
      blob,
      size: blob.size,
      format: settings.format,
      duration,
    };
    
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('❌ Conversion failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      duration,
    };
  }
}

// ============================================================
// 📥 تحميل الصورة
// ============================================================

function loadImage(source: Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('فشل تحميل الصورة'));
    };
    
    img.src = url;
  });
}

// ============================================================
// 📐 حساب الأبعاد الجديدة
// ============================================================

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  settings: ConversionSettings
): { width: number; height: number } {
  const { resize } = settings;
  
  // إذا لم يُفعَّل resize، أعد الأبعاد الأصلية
  if (!resize.enabled || resize.mode === 'original') {
    return { width: originalWidth, height: originalHeight };
  }
  
  let newWidth = originalWidth;
  let newHeight = originalHeight;
  
  switch (resize.mode) {
    case 'max-width': {
      const maxW = resize.maxWidth || LIMITS.MAX_DIMENSION;
      if (originalWidth > maxW) {
        newWidth = maxW;
        newHeight = Math.round((originalHeight * maxW) / originalWidth);
      }
      break;
    }
    
    case 'max-height': {
      const maxH = resize.maxHeight || LIMITS.MAX_DIMENSION;
      if (originalHeight > maxH) {
        newHeight = maxH;
        newWidth = Math.round((originalWidth * maxH) / originalHeight);
      }
      break;
    }
    
    case 'exact': {
      const targetW = resize.width || originalWidth;
      const targetH = resize.height || originalHeight;
      
      if (resize.keepAspectRatio) {
        // الحفاظ على النسبة — نستخدم الأصغر
        const scale = Math.min(targetW / originalWidth, targetH / originalHeight);
        newWidth = Math.round(originalWidth * scale);
        newHeight = Math.round(originalHeight * scale);
      } else {
        newWidth = targetW;
        newHeight = targetH;
      }
      break;
    }
  }
  
  // ضمان عدم تجاوز الحدود
  newWidth = Math.min(Math.max(1, newWidth), LIMITS.MAX_WIDTH);
  newHeight = Math.min(Math.max(1, newHeight), LIMITS.MAX_WIDTH);
  
  return { width: newWidth, height: newHeight };
}

// ============================================================
// 🎨 تحويل Canvas إلى Blob
// ============================================================

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    // محاولة toBlob أولاً (الأسرع)
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality
    );
  });
}

// ============================================================
// 🎯 تحويل متعدد الصيغ
// ============================================================

export async function convertToMultipleFormats(
  file: File,
  settings: ConversionSettings
): Promise<Partial<Record<ImageFormat, Blob>>> {
  const results: Partial<Record<ImageFormat, Blob>> = {};
  
  const formats = settings.multiFormat.formats;
  
  for (const format of formats) {
    try {
      const result = await convertImage(file, {
        ...settings,
        format,
      });
      
      if (result.success && result.blob) {
        results[format] = result.blob;
      }
    } catch (e) {
      console.warn(`Failed to convert to ${format}:`, e);
    }
  }
  
  return results;
}

// ============================================================
// 🎯 تطبيق Preset
// ============================================================

export function applyPreset(
  preset: SmartPreset,
  currentSettings: ConversionSettings
): ConversionSettings {
  const config: PresetConfig = SMART_PRESETS[preset];
  
  return {
    ...currentSettings,
    format: config.format,
    quality: config.quality,
    qualityPreset: 'custom',
    stripExif: config.stripExif,
    resize: {
      enabled: !!(config.maxWidth || config.maxHeight),
      mode: config.maxWidth ? 'max-width' : 'original',
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      keepAspectRatio: true,
    },
    smartPreset: preset,
  };
}

// ============================================================
// 🚫 إلغاء صيغة معينة
// ============================================================

export function unapplyPreset(settings: ConversionSettings): ConversionSettings {
  return {
    ...settings,
    smartPreset: undefined,
  };
}

// ============================================================
// 📊 إحصائيات الجلسة
// ============================================================

export interface SessionStats {
  totalImages: number;
  totalOriginalSize: number;
  totalConvertedSize: number;
  totalSavings: number;
  totalSavingsPercentage: number;
  successfulConversions: number;
  failedConversions: number;
  averageDuration: number;
}

export function calculateSessionStats(
  results: Array<{
    originalSize: number;
    convertedSize?: number;
    success: boolean;
    duration?: number;
  }>
): SessionStats {
  const totalImages = results.length;
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalConvertedSize = successful.reduce(
    (sum, r) => sum + (r.convertedSize || 0), 
    0
  );
  
  const totalSavings = totalOriginalSize - totalConvertedSize;
  const totalSavingsPercentage = totalOriginalSize > 0 
    ? (totalSavings / totalOriginalSize) * 100 
    : 0;
  
  const durations = successful
    .filter(r => r.duration !== undefined)
    .map(r => r.duration!);
  const averageDuration = durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;
  
  return {
    totalImages,
    totalOriginalSize,
    totalConvertedSize,
    totalSavings,
    totalSavingsPercentage,
    successfulConversions: successful.length,
    failedConversions: failed.length,
    averageDuration,
  };
}

// ============================================================
// 🔍 فحص دعم الصيغ في المتصفح
// ============================================================

export async function checkFormatSupport(
  format: ImageFormat
): Promise<boolean> {
  const info = getFormatInfo(format);
  if (!info) return false;
  
  // الطريقة القياسية للفحص
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    const dataUrl = canvas.toDataURL(info.mimeType);
    return dataUrl.startsWith(`data:${info.mimeType}`);
  } catch (e) {
    return false;
  }
}

// ============================================================
// 📋 قائمة الصيغ المدعومة في هذا المتصفح
// ============================================================

export async function getSupportedFormatsInBrowser(): Promise<ImageFormat[]> {
  const supported: ImageFormat[] = [];
  
  for (const format of SUPPORTED_FORMATS) {
    const isSupported = await checkFormatSupport(format.id);
    if (isSupported) {
      supported.push(format.id);
    }
  }
  
  return supported;
}

// ============================================================
// 🖼️ إنشاء مصغّرة
// ============================================================

export async function createThumbnail(
  file: File | Blob,
  maxSize: number = 200
): Promise<string> {
  const img = await loadImage(file);
  
  const canvas = document.createElement('canvas');
  const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight);
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('فشل الحصول على Canvas context');
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/webp', 0.7);
}

// ============================================================
// 🎯 اقتراح الصيغة الأفضل
// ============================================================

export function suggestBestFormat(
  currentFormat: string,
  hasAlpha: boolean,
  fileSize: number,
  isForWeb: boolean = true
): ImageFormat {
  const sizeMB = fileSize / (1024 * 1024);
  
  // أولوية 1: HEIC → WebP أو JPG
  if (currentFormat === 'heic' || currentFormat === 'heif') {
    return isForWeb ? 'webp' : 'jpeg';
  }
  
  // أولوية 2: BMP (كبير جداً) → WebP
  if (currentFormat === 'bmp') {
    return 'webp';
  }
  
  // أولوية 3: صور كبيرة → WebP أو AVIF
  if (sizeMB > 2) {
    return 'avif'; // الأفضل ضغطاً
  }
  
  // أولوية 4: صور شفافة
  if (hasAlpha) {
    return isForWeb ? 'webp' : 'png';
  }
  
  // افتراضي: WebP للويب، JPG لغيره
  return isForWeb ? 'webp' : 'jpeg';
}