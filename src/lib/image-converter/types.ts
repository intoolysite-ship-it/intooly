// ============================================================
// 📦 الأنواع الأساسية لمحوّل الصور
// ============================================================

/** الصيغ المدعومة للتحويل */
export type ImageFormat =
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'avif'
  | 'gif'
  | 'bmp'
  | 'ico'
  | 'tiff'
  | 'heic';

/** الصيغ التي يمكن القراءة منها */
export type InputFormat = ImageFormat | 'jpg' | 'jfif';

/** مستويات الجودة */
export type QualityPreset = 'low' | 'medium' | 'high' | 'max' | 'custom';

/** الإعدادات المسبقة الذكية */
export type SmartPreset = 
  | 'whatsapp'
  | 'instagram'
  | 'web'
  | 'print'
  | 'email'
  | 'thumbnail';

/** حالة الصورة في الجلسة */
export type ImageStatus =
  | 'pending'      // في الانتظار
  | 'analyzing'    // يُحلَّل
  | 'ready'        // جاهز للتحويل
  | 'converting'   // قيد التحويل
  | 'done'         // تم بنجاح
  | 'error';       // خطأ

/** بيانات EXIF المستخرجة */
export interface ExifData {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  dateTaken?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
  software?: string;
}

/** معلومات الصورة الكاملة */
export interface ImageInfo {
  /** العرض بالبكسل */
  width: number;
  /** الارتفاع بالبكسل */
  height: number;
  /** الحجم بالبايت */
  size: number;
  /** الصيغة الأصلية */
  format: string;
  /** هل تحتوي على قناة ألفا (شفافية) */
  hasAlpha: boolean;
  /** نسبة العرض للارتفاع */
  aspectRatio: number;
  /** بيانات EXIF (إن وجدت) */
  exif?: ExifData;
  /** متوسط اللون (للمعاينة) */
  dominantColor?: string;
}

/** عنصر صورة في الجلسة */
export interface ImageItem {
  /** معرف فريد */
  id: string;
  /** ملف الصورة الأصلي */
  file: File;
  /** اسم الملف */
  name: string;
  /** رابط معاينة (Object URL) */
  originalUrl: string;
  /** معلومات الصورة */
  info: ImageInfo | null;
  /** الحالة الحالية */
  status: ImageStatus;
  /** رسالة الخطأ (إن وجد) */
  errorMessage?: string;
  /** رابط النتيجة (بعد التحويل) */
  convertedUrl?: string;
  /** حجم النتيجة */
  convertedSize?: number;
  /** Blob النتيجة (للتحميل) */
  convertedBlob?: Blob;
  /** الصيغة النهائية */
  convertedFormat?: ImageFormat;
  /** نُسخ متعددة الصيغ */
  multiFormatBlobs?: Partial<Record<ImageFormat, Blob>>;
}

/** إعدادات التحويل */
export interface ConversionSettings {
  /** الصيغة المستهدفة */
  format: ImageFormat;
  /** الجودة (0.1 - 1.0) */
  quality: number;
  /** الجودة المسبقة */
  qualityPreset: QualityPreset;
  /** تغيير الأبعاد */
  resize: {
    enabled: boolean;
    mode: 'original' | 'max-width' | 'max-height' | 'exact';
    maxWidth?: number;
    maxHeight?: number;
    width?: number;
    height?: number;
    /** الحفاظ على النسبة */
    keepAspectRatio: boolean;
  };
  /** حذف بيانات EXIF */
  stripExif: boolean;
  /** الحفاظ على الشفافية */
  preserveAlpha: boolean;
  /** لون الخلفية عند التحويل من شفاف إلى غير شفاف */
  backgroundColor: string;
  /** إعدادات مسبقة */
  smartPreset?: SmartPreset;
  /** تصدير متعدد الصيغ */
  multiFormat: {
    enabled: boolean;
    formats: ImageFormat[];
  };
}

/** إعدادات مسبقة ذكية */
export interface PresetConfig {
  id: SmartPreset;
  name: string;
  description: string;
  icon: string;
  format: ImageFormat;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  stripExif: boolean;
}

/** نتيجة التحليل */
export interface AnalysisResult {
  /** توصيات ذكية */
  recommendations: AnalysisRecommendation[];
  /** معلومات إضافية */
  warnings?: string[];
  /** مقدار التوفير المتوقع */
  estimatedSavings?: {
    percentage: number;
    bytes: number;
  };
}

/** توصية تحليلية */
export interface AnalysisRecommendation {
  type: 'format' | 'quality' | 'size' | 'privacy' | 'optimization';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  action?: string;
}

/** نتيجة التحويل */
export interface ConversionResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  size?: number;
  format?: ImageFormat;
  error?: string;
  duration?: number;
}

/** أنواع الأحداث */
export type ImageConverterEvent = 
  | { type: 'image-added'; id: string }
  | { type: 'image-removed'; id: string }
  | { type: 'conversion-started'; id: string }
  | { type: 'conversion-completed'; id: string; result: ConversionResult }
  | { type: 'conversion-failed'; id: string; error: string }
  | { type: 'batch-started'; total: number }
  | { type: 'batch-completed'; successful: number; failed: number };

/** دالة معالجة الأحداث */
export type EventHandler = (event: ImageConverterEvent) => void;