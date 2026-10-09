// ============================================================
// ✂️ محرك قص الصور
// ============================================================

import type {
  ImageInfo,
  CropArea,
  CropResult,
  CropSettings,
  AspectRatioId,
} from './types';

import {
  ASPECT_RATIOS,
  LIMITS,
  MIN_CROP_SIZE,
} from './constants';

// ============================================================
// 📷 قراءة معلومات الصورة
// ============================================================

export async function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const info: ImageInfo = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: (file.name.split('.').pop() || 'unknown').toUpperCase(),
        aspectRatio: img.naturalWidth / img.naturalHeight,
      };
      URL.revokeObjectURL(url);
      resolve(info);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('فشل تحميل الصورة'));
    };

    img.src = url;
  });
}

// ============================================================
// 🔄 تحميل الصورة كـ HTMLImageElement
// ============================================================

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('فشل تحميل الصورة'));

    img.src = url;
  });
}

// ============================================================
// 📐 حساب منطقة القص الافتراضية
// ============================================================

export function getDefaultCropArea(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: AspectRatioId,
  customRatio?: { width: number; height: number }
): CropArea {
  const ratioInfo = ASPECT_RATIOS.find(r => r.id === aspectRatio);

  // إذا كان حر — استخدم كل الصورة
  if (!ratioInfo || ratioInfo.value === null) {
    // إذا كان مخصص
    if (aspectRatio === 'custom' && customRatio) {
      const targetRatio = customRatio.width / customRatio.height;
      const imageRatio = imageWidth / imageHeight;

      if (imageRatio > targetRatio) {
        // الصورة أعرض — اقتص من الجانبين
        const newWidth = imageHeight * targetRatio;
        const x = (imageWidth - newWidth) / 2;
        return { x, y: 0, width: newWidth, height: imageHeight };
      } else {
        // الصورة أطول — اقتص من الأعلى والأسفل
        const newHeight = imageWidth / targetRatio;
        const y = (imageHeight - newHeight) / 2;
        return { x: 0, y, width: imageWidth, height: newHeight };
      }
    }

    // حر — كل الصورة
    return {
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    };
  }

  // نسبة محددة
  const targetRatio = ratioInfo.value;
  const imageRatio = imageWidth / imageHeight;

  if (imageRatio > targetRatio) {
    // الصورة أعرض — اقتص من الجانبين
    const newWidth = imageHeight * targetRatio;
    const x = (imageWidth - newWidth) / 2;
    return { x, y: 0, width: newWidth, height: imageHeight };
  } else {
    // الصورة أطول — اقتص من الأعلى والأسفل
    const newHeight = imageWidth / targetRatio;
    const y = (imageHeight - newHeight) / 2;
    return { x: 0, y, width: imageWidth, height: newHeight };
  }
}

// ============================================================
// 🔒 تطبيق قيود النسبة عند تغيير الحجم
// ============================================================

export function applyAspectRatioConstraint(
  area: CropArea,
  aspectRatio: AspectRatioId,
  customRatio: { width: number; height: number },
  imageWidth: number,
  imageHeight: number,
  handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
): CropArea {
  const ratioInfo = ASPECT_RATIOS.find(r => r.id === aspectRatio);
  let targetRatio: number | null = null;

  if (ratioInfo && ratioInfo.value !== null) {
    targetRatio = ratioInfo.value;
  } else if (aspectRatio === 'custom' && customRatio.height > 0) {
    targetRatio = customRatio.width / customRatio.height;
  }

  // إذا كان حر — أعد كما هو
  if (targetRatio === null) {
    return clampArea(area, imageWidth, imageHeight);
  }

  let { x, y, width, height } = area;

  // تطبيق النسبة حسب نوع المقبض
  switch (handle) {
    case 'se': // سحب من الزاوية السفلية اليمنى
      height = width / targetRatio;
      break;
    case 'sw': // الزاوية السفلية اليسرى
      height = width / targetRatio;
      break;
    case 'ne': // الزاوية العلوية اليمنى
      height = width / targetRatio;
      break;
    case 'nw': // الزاوية العلوية اليسرى
      height = width / targetRatio;
      break;
    case 'e':
    case 'w':
      height = width / targetRatio;
      break;
    case 'n':
    case 's':
      width = height * targetRatio;
      break;
  }

  // ضمان الحد الأدنى
  if (width < MIN_CROP_SIZE) {
    width = MIN_CROP_SIZE;
    height = width / targetRatio;
  }
  if (height < MIN_CROP_SIZE) {
    height = MIN_CROP_SIZE;
    width = height * targetRatio;
  }

  // ضبط الموضع
  const newArea = { x, y, width, height };
  return clampArea(newArea, imageWidth, imageHeight);
}

// ============================================================
// 🔒 تحديد حدود منطقة القص
// ============================================================

export function clampArea(
  area: CropArea,
  imageWidth: number,
  imageHeight: number
): CropArea {
  let { x, y, width, height } = area;

  // ضمان الحد الأدنى
  if (width < MIN_CROP_SIZE) width = MIN_CROP_SIZE;
  if (height < MIN_CROP_SIZE) height = MIN_CROP_SIZE;

  // ضمان عدم التجاوز
  if (width > imageWidth) width = imageWidth;
  if (height > imageHeight) height = imageHeight;

  // ضبط x
  if (x < 0) x = 0;
  if (x + width > imageWidth) x = imageWidth - width;

  // ضبط y
  if (y < 0) y = 0;
  if (y + height > imageHeight) y = imageHeight - height;

  return { x, y, width, height };
}

// ============================================================
// ✂️ تنفيذ القص الفعلي
// ============================================================

export async function cropImage(
  imageUrl: string,
  area: CropArea,
  settings: CropSettings,
  outputFormat: 'jpeg' | 'png' | 'webp' = 'jpeg',
  quality: number = 0.92
): Promise<CropResult> {
  const startTime = performance.now();

  try {
    // 1. تحميل الصورة
    const img = await loadImage(imageUrl);

    // 2. ضبط الأبعاد وفقًا للقالب (إن وُجد)
    const targetWidth = Math.round(area.width);
    const targetHeight = Math.round(area.height);

    // 3. إنشاء Canvas للقص
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('فشل الحصول على Canvas context');
    }

    // 4. تحسين جودة الرسم
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 5. تطبيق القص
    ctx.drawImage(
      img,
      area.x, area.y, area.width, area.height,
      0, 0, targetWidth, targetHeight
    );

    // 6. تطبيق القص الدائري (إن وُجد)
    if (settings.shape === 'circle') {
      applyCircleMask(ctx, targetWidth, targetHeight);
    } else if (settings.shape === 'rounded' && settings.borderRadius > 0) {
      applyRoundedCorners(ctx, targetWidth, targetHeight, settings.borderRadius);
    }

    // 7. تحويل إلى Blob
    const mimeType = `image/${outputFormat}`;
    const blob = await canvasToBlob(canvas, mimeType, quality);

    if (!blob) {
      throw new Error('فشل تحويل Canvas إلى Blob');
    }

    // 8. إنشاء URL للعرض
    const url = URL.createObjectURL(blob);
    const duration = performance.now() - startTime;

    return {
      success: true,
      blob,
      url,
      width: targetWidth,
      height: targetHeight,
      size: blob.size,
      duration,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('❌ Crop failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      duration,
    };
  }
}

// ============================================================
// ⚪ تطبيق قناع دائري
// ============================================================

function applyCircleMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // حفظ البيانات
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  // مسح البكسلات خارج الدائرة
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > radius) {
        const idx = (y * width + x) * 4;
        data[idx + 3] = 0; // alpha = 0
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ============================================================
// 🔲 تطبيق زوايا مدورة
// ============================================================

function applyRoundedCorners(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const r = Math.min(radius, width / 2, height / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let isCorner = false;
      let cornerX = 0;
      let cornerY = 0;

      // الزاوية العلوية اليسرى
      if (x < r && y < r) {
        isCorner = true;
        cornerX = r;
        cornerY = r;
      }
      // الزاوية العلوية اليمنى
      else if (x > width - r && y < r) {
        isCorner = true;
        cornerX = width - r;
        cornerY = r;
      }
      // الزاوية السفلية اليسرى
      else if (x < r && y > height - r) {
        isCorner = true;
        cornerX = r;
        cornerY = height - r;
      }
      // الزاوية السفلية اليمنى
      else if (x > width - r && y > height - r) {
        isCorner = true;
        cornerX = width - r;
        cornerY = height - r;
      }

      if (isCorner) {
        const dx = x - cornerX;
        const dy = y - cornerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > r) {
          const idx = (y * width + x) * 4;
          data[idx + 3] = 0;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
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
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality
    );
  });
}

// ============================================================
// 🔢 حساب النسبة من الأرقام
// ============================================================

export function parseAspectRatio(value: string): number | null {
  if (!value.includes(':')) return null;

  const [w, h] = value.split(':').map(Number);
  if (isNaN(w) || isNaN(h) || h === 0) return null;

  return w / h;
}

// ============================================================
// 📥 تحميل ملف
// ============================================================

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================
// 🆔 توليد معرف فريد
// ============================================================

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================
// 📏 تنسيق الحجم
// ============================================================

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}