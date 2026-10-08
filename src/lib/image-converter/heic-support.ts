// ============================================================
// 🍎 دعم صيغة HEIC (صور iPhone)
// ============================================================

/**
 * تحويل HEIC إلى صيغة أخرى (JPG/PNG)
 * 
 * يستخدم مكتبة heic2any التي تعمل محلياً في المتصفح
 * بدون الحاجة إلى رفع الصور.
 */

// استيراد ديناميكي (لتجنب تحميل المكتبة إلا عند الحاجة)
let heic2anyModule: any = null;

async function loadHeic2any() {
  if (heic2anyModule) return heic2anyModule;
  
  try {
    const module = await import('heic2any');
    heic2anyModule = module.default || module;
    console.log('✅ heic2any loaded successfully');
    return heic2anyModule;
  } catch (error) {
    console.error('❌ Failed to load heic2any:', error);
    throw new Error('فشل تحميل مكتبة HEIC. تحقق من اتصالك بالإنترنت.');
  }
}

// ============================================================
// 🔍 فحص إذا كان الملف HEIC
// ============================================================

export function isHeicFile(file: File | Blob): boolean {
  const name = 'name' in file ? file.name : '';
  const type = file.type;
  
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    /\.(heic|heif)$/i.test(name)
  );
}

// ============================================================
// 🔄 تحويل HEIC إلى Blob
// ============================================================

export async function convertHeicToBlob(
  file: File | Blob,
  targetMimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  try {
    console.log('🍎 Converting HEIC file...', {
      size: file.size,
      type: file.type,
      target: targetMimeType,
    });
    
    const heic2any = await loadHeic2any();
    
    const result = await heic2any({
      blob: file,
      toType: targetMimeType,
      quality,
      multiple: false,
    });
    
    // قد يعيد مصفوفة أو Blob واحد
    const blob = Array.isArray(result) ? result[0] : result;
    
    console.log('✅ HEIC converted:', {
      size: blob.size,
      type: blob.type,
    });
    
    return blob;
  } catch (error) {
    console.error('❌ HEIC conversion failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ERR_LIBHEIF')) {
        throw new Error('ملف HEIC تالف أو غير مدعوم');
      }
      if (error.message.includes('load')) {
        throw new Error('فشل تحميل مكتبة HEIC');
      }
      throw new Error(`فشل تحويل HEIC: ${error.message}`);
    }
    
    throw new Error('فشل تحويل ملف HEIC');
  }
}

// ============================================================
// 🖼️ تحويل HEIC إلى Data URL
// ============================================================

export async function convertHeicToDataURL(
  file: File | Blob,
  targetMimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.92
): Promise<string> {
  const blob = await convertHeicToBlob(file, targetMimeType, quality);
  return blobToDataURL(blob);
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ============================================================
// 🖼️ تحويل HEIC إلى صورة HTMLImageElement
// ============================================================

export async function heicToImage(
  file: File | Blob,
  targetMimeType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<HTMLImageElement> {
  const blob = await convertHeicToBlob(file, targetMimeType);
  
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('فشل تحميل صورة HEIC'));
    };
    
    img.src = url;
  });
}

// ============================================================
// 🖼️ إنشاء مصغّرة من HEIC
// ============================================================

export async function heicToThumbnail(
  file: File | Blob,
  maxSize: number = 200
): Promise<string> {
  const blob = await convertHeicToBlob(file, 'image/jpeg', 0.85);
  const img = await loadImageFromBlob(blob);
  
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

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
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
// 📊 معلومات HEIC بدون تحويل (قراءة metadata)
// ============================================================

export interface HeicInfo {
  width?: number;
  height?: number;
  hasAlpha?: boolean;
  isHeic: boolean;
}

export async function getHeicInfo(file: File): Promise<HeicInfo> {
  if (!isHeicFile(file)) {
    return { isHeic: false };
  }
  
  try {
    // تحويل مؤقت لقراءة الأبعاد
    const img = await heicToImage(file);
    return {
      isHeic: true,
      width: img.naturalWidth,
      height: img.naturalHeight,
      hasAlpha: false, // HEIC عادةً بدون شفافية
    };
  } catch (e) {
    return { isHeic: true };
  }
}

// ============================================================
// 🌐 هل المتصفح يدعم HEIC أصلاً؟
// ============================================================

export async function browserSupportsHeic(): Promise<boolean> {
  // Safari on macOS/iOS يدعم HEIC أصلاً
  // Chrome/Firefox/Edge يحتاجون مكتبة
  
  if (typeof navigator === 'undefined') return false;
  
  const ua = navigator.userAgent;
  
  // Safari على iOS أو macOS
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua);
  if (isSafari) return true;
  
  // Chrome حديث (يدعم HEIC من Chrome 96+ على بعض الأنظمة)
  // لكن عادةً يحتاج مكتبة — نعيد false للأمان
  return false;
}

// ============================================================
// 📋 قائمة الميزات المدعومة في heic2any
// ============================================================

export const HEIC_FEATURES = {
  multiImage: true,      // يدعم صور متعددة في ملف واحد
  preserveExif: false,   // لا يحتفظ بـ EXIF
  alphaChannel: false,   // لا يدعم الشفافية
  gps: false,            // لا يحتفظ بـ GPS
  supportsBatch: true,   // يدعم معالجة عدة صور
};

// ============================================================
// 🎯 تحويل دفعة HEIC
// ============================================================

export async function convertHeicBatch(
  files: File[],
  targetMimeType: 'image/jpeg' | 'image/png' = 'image/jpeg',
  onProgress?: (completed: number, total: number) => void
): Promise<Array<{ file: File; blob: Blob | null; error?: string }>> {
  const results: Array<{ file: File; blob: Blob | null; error?: string }> = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const blob = await convertHeicToBlob(file, targetMimeType);
      results.push({ file, blob });
    } catch (e) {
      results.push({ 
        file, 
        blob: null, 
        error: e instanceof Error ? e.message : 'خطأ غير معروف',
      });
    }
    
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  
  return results;
}