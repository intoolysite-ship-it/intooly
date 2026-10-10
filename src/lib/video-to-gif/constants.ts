/**
 * إعدادات أداة تحويل الفيديو إلى GIF
 */

export const GIF_CONFIG = {
  // الحدود
  MIN_FPS: 5,
  MAX_FPS: 30,
  DEFAULT_FPS: 15,

  MIN_WIDTH: 100,
  MAX_WIDTH: 1920,
  DEFAULT_WIDTH: 480,

  MIN_DURATION: 0.5,
  MAX_DURATION: 30,
  DEFAULT_DURATION: 10,

  // حدود الملفات
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100 MB

  // أنواع الملفات المدعومة
  ACCEPTED_VIDEO_TYPES: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ],

  // امتدادات الفيديو
  VIDEO_EXTENSIONS: ['.mp4', '.webm', '.mov', '.avi'],
} as const;

/**
 * قوالب FPS الجاهزة
 */
export const FPS_PRESETS = [
  { label: 'بطيء (10)', value: 10 },
  { label: 'متوسط (15)', value: 15 },
  { label: 'سلس (20)', value: 20 },
  { label: 'سريع (24)', value: 24 },
] as const;

/**
 * قوالب الأبعاد الجاهزة
 */
export const SIZE_PRESETS = [
  { label: 'صغير (320)', value: 320 },
  { label: 'متوسط (480)', value: 480 },
  { label: 'كبير (640)', value: 640 },
  { label: 'HD (1280)', value: 1280 },
] as const;

/**
 * نصوص الرسائل (للتوحيد)
 */
export const MESSAGES = {
  LOADING_FFMPEG: 'جاري تحميل محرك المعالجة...',
  PROCESSING: 'جاري التحويل إلى GIF...',
  SUCCESS: 'تم إنشاء ملف GIF بنجاح!',
  ERROR_GENERIC: 'حدث خطأ. حاول مرة أخرى.',
  ERROR_FILE_TOO_BIG: 'الملف كبير جداً.',
  ERROR_INVALID_TYPE: 'نوع الملف غير مدعوم.',
  ERROR_NO_FILE: 'الرجاء اختيار فيديو أولاً.',
  ERROR_FFMPEG_FAILED: 'فشل تحميل محرك المعالجة.',
} as const;
