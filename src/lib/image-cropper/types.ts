// ============================================================
// ✂️ أنواع أداة قص الصور
// ============================================================

/** نسبة القص */
export type AspectRatioId =
  | 'free'          // حر (بدون قيد)
  | '1:1'           // مربع
  | '4:3'           // كلاسيكي
  | '16:9'          // سينمائي
  | '3:2'           // كاميرا
  | '9:16'          // ستوري
  | '3:4'           // بورتريه
  | '2:3'           // بورتريه كلاسيكي
  | 'custom';       // مخصص

/** شكل القص */
export type CropShape =
  | 'rectangle'     // مستطيل عادي
  | 'circle'        // دائرة
  | 'rounded';      // زوايا مدورة

/** موضع منطقة القص */
export interface CropArea {
  x: number;              // إحداثي X بالبكسل
  y: number;              // إحداثي Y بالبكسل
  width: number;          // العرض بالبكسل
  height: number;         // الطول بالبكسل
}

/** إعدادات القص */
export interface CropSettings {
  /** النسبة المختارة */
  aspectRatio: AspectRatioId;
  /** نسبة مخصصة (إذا aspectRatio = 'custom') */
  customRatio: {
    width: number;
    height: number;
  };
  /** شكل المنطقة */
  shape: CropShape;
  /** نصف قطر الزوايا (إذا shape = 'rounded') */
  borderRadius: number;
  /** موضع القص */
  area: CropArea;
  /** الحفاظ على النسبة */
  lockAspectRatio: boolean;
  /** عرض شبكة القاعدة الذهبية */
  showGrid: boolean;
  /** عرض خطوط التقسيم */
  gridType: 'none' | 'thirds' | 'golden' | 'grid' | 'center';
}

/** معلومات الصورة */
export interface ImageInfo {
  width: number;          // العرض الأصلي
  height: number;         // الطول الأصلي
  size: number;           // الحجم بالبايت
  format: string;         // الصيغة (JPG، PNG...)
  aspectRatio: number;    // النسبة الأصلية
}

/** عنصر صورة في الجلسة */
export interface ImageItem {
  /** معرف فريد */
  id: string;
  /** ملف الصورة الأصلي */
  file: File;
  /** اسم الملف */
  name: string;
  /** رابط المعاينة (Object URL) */
  originalUrl: string;
  /** معلومات الصورة */
  info: ImageInfo | null;
  /** الحالة الحالية */
  status: CropStatus;
  /** رسالة الخطأ (إن وُجدت) */
  errorMessage?: string;
  /** رابط النتيجة */
  croppedUrl?: string;
  /** حجم النتيجة */
  croppedSize?: number;
  /** Blob النتيجة */
  croppedBlob?: Blob;
  /** إعدادات القص الخاصة بهذه الصورة */
  settings?: CropSettings;
}

/** حالة معالجة الصورة */
export type CropStatus =
  | 'pending'      // في الانتظار
  | 'analyzing'    // يُحلَّل
  | 'ready'        // جاهز للقص
  | 'cropping'     // قيد القص
  | 'done'         // تم بنجاح
  | 'error';       // خطأ

/** قالب جاهز */
export interface PresetTemplate {
  id: string;
  name: string;          // اسم القالب
  category: TemplateCategory;
  icon: string;
  width: number;
  height: number;
  description?: string;
}

/** فئة القالب */
export type TemplateCategory =
  | 'social'       // سوشيال ميديا
  | 'marketplace'  // ماركت بليس
  | 'print'        // طباعة
  | 'custom';      // مخصص

/** نتيجة القص */
export interface CropResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  width?: number;
  height?: number;
  size?: number;
  error?: string;
  duration?: number;
}