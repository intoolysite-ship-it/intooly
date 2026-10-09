// ============================================================
// 📚 الثوابت والإعدادات المسبقة لمحوّل الصور
// ============================================================

import type { 
  ImageFormat, 
  PresetConfig, 
  SmartPreset,
  QualityPreset 
} from './types';

// ============================================================
// 🎨 الصيغ المدعومة
// ============================================================

export const SUPPORTED_FORMATS: Array<{
  id: ImageFormat;
  name: string;
  extension: string;
  mimeType: string;
  icon: string;
  description: string;
  supportsAlpha: boolean;
  recommendedFor: string[];
}> = [
  {
    id: 'webp',
    name: 'WebP',
    extension: 'webp',
    mimeType: 'image/webp',
    icon: '🌐',
    description: 'الأفضل للويب — أصغر 50% من JPG',
    supportsAlpha: true,
    recommendedFor: ['ويب', 'سوشيال', 'متاجر'],
  },
  {
    id: 'jpeg',
    name: 'JPG',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    icon: '📷',
    description: 'الأكثر توافقاً — يعمل على كل الأجهزة',
    supportsAlpha: false,
    recommendedFor: ['طباعة', 'بريد', 'عام'],
  },
  {
    id: 'png',
    name: 'PNG',
    extension: 'png',
    mimeType: 'image/png',
    icon: '🎨',
    description: 'يدعم الشفافية — للتصميم',
    supportsAlpha: true,
    recommendedFor: ['تصميم', 'شعارات', 'شفافية'],
  },
  {
    id: 'avif',
    name: 'AVIF',
    extension: 'avif',
    mimeType: 'image/avif',
    icon: '⚡',
    description: 'الأحدث — أصغر 70% مع جودة أعلى',
    supportsAlpha: true,
    recommendedFor: ['مواقع حديثة', 'أداء'],
  },
  {
    id: 'heic',
    name: 'HEIC',
    extension: 'heic',
    mimeType: 'image/heic',
    icon: '🍎',
    description: 'صيغة iPhone — حجم أصغر بجودة عالية',
    supportsAlpha: false,
    recommendedFor: ['iPhone', 'Apple'],
  },
  {
    id: 'gif',
    name: 'GIF',
    extension: 'gif',
    mimeType: 'image/gif',
    icon: '🎬',
    description: 'صور متحركة — للمشاركة السريعة',
    supportsAlpha: true,
    recommendedFor: ['متحرك', 'سوشيال'],
  },
  {
    id: 'bmp',
    name: 'BMP',
    extension: 'bmp',
    mimeType: 'image/bmp',
    icon: '🖼️',
    description: 'غير مضغوط — للأنظمة القديمة',
    supportsAlpha: false,
    recommendedFor: ['قديم', 'Windows'],
  },
  {
    id: 'ico',
    name: 'ICO',
    extension: 'ico',
    mimeType: 'image/x-icon',
    icon: '🎯',
    description: 'أيقونات المواقع والمجلدات',
    supportsAlpha: true,
    recommendedFor: ['أيقونات', 'مواقع'],
  },
  {
    id: 'tiff',
    name: 'TIFF',
    extension: 'tiff',
    mimeType: 'image/tiff',
    icon: '📐',
    description: 'جودة احترافية — للطباعة',
    supportsAlpha: true,
    recommendedFor: ['طباعة', 'احترافي'],
  },
];

// ============================================================
// 🎯 الإعدادات المسبقة الذكية
// ============================================================

export const SMART_PRESETS: Record<SmartPreset, PresetConfig> = {
  whatsapp: {
    id: 'whatsapp',
    name: 'واتساب',
    description: 'مثالي للمشاركة عبر واتساب',
    icon: '💬',
    format: 'jpeg',
    quality: 0.8,
    maxWidth: 1280,
    maxHeight: 1280,
    stripExif: true,
  },
  instagram: {
    id: 'instagram',
    name: 'إنستغرام',
    description: 'مربع 1080×1080 — مثالي للمنشورات',
    icon: '📷',
    format: 'jpeg',
    quality: 0.9,
    maxWidth: 1080,
    maxHeight: 1080,
    stripExif: true,
  },
  web: {
    id: 'web',
    name: 'ويب',
    description: 'الأمثل لـ SEO والسرعة',
    icon: '🌐',
    format: 'webp',
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1920,
    stripExif: true,
  },
  print: {
    id: 'print',
    name: 'طباعة',
    description: 'جودة عالية للطباعة 300dpi',
    icon: '🖨️',
    format: 'png',
    quality: 1.0,
    stripExif: false,
  },
  email: {
    id: 'email',
    name: 'بريد',
    description: 'حجم صغير للمرفقات',
    icon: '📧',
    format: 'jpeg',
    quality: 0.75,
    maxWidth: 800,
    maxHeight: 800,
    stripExif: true,
  },
  thumbnail: {
    id: 'thumbnail',
    name: 'مصغّرة',
    description: 'مثالي للقوائم والمعارض',
    icon: '🔍',
    format: 'webp',
    quality: 0.7,
    maxWidth: 400,
    maxHeight: 400,
    stripExif: true,
  },
};

// ============================================================
// 📊 مستويات الجودة
// ============================================================

export const QUALITY_PRESETS: Record<QualityPreset, { 
  value: number; 
  label: string; 
  description: string;
}> = {
  low: {
    value: 0.5,
    label: 'منخفضة',
    description: 'حجم صغير جداً (مناسب للمعاينة)',
  },
  medium: {
    value: 0.75,
    label: 'متوسطة',
    description: 'متوازن بين الحجم والجودة',
  },
  high: {
    value: 0.9,
    label: 'عالية',
    description: 'جودة ممتازة (موصى به)',
  },
  max: {
    value: 1.0,
    label: 'قصوى',
    description: 'أعلى جودة ممكنة',
  },
  custom: {
    value: 0.85,
    label: 'مخصص',
    description: 'تحكم يدوي كامل',
  },
};

// ============================================================
// 🔢 الحدود
// ============================================================

export const LIMITS = {
  MAX_FILE_SIZE: 25 * 1024 * 1024,
  MAX_IMAGES: 100,
  MIN_WIDTH: 1,
  MAX_WIDTH: 20000,
  MIN_QUALITY: 0.1,
  MAX_QUALITY: 1.0,
  MAX_DIMENSION: 8000,
};

// ============================================================
// 📥 الصيغ المقبولة للإدخال
// ============================================================

export const ACCEPTED_EXTENSIONS = /\.(jpg|jpeg|png|webp|avif|heic|heif|gif|bmp|tiff|tif|ico|jfif)$/i;

// ============================================================
// 🎨 الألوان
// ============================================================

export const DEFAULT_BACKGROUND_COLOR = '#ffffff';

export const TRANSPARENT_VALUE = 'transparent';

export const COMMON_BACKGROUND_COLORS = [
  { name: 'أبيض', value: '#ffffff' },
  { name: 'أسود', value: '#000000' },
  { name: 'رمادي فاتح', value: '#f3f4f6' },
  { name: 'رمادي', value: '#9ca3af' },
  { name: 'رمادي غامق', value: '#4b5563' },
  { name: 'بيج', value: '#fef3c7' },
  { name: 'أزرق فاتح', value: '#dbeafe' },
  { name: 'وردي فاتح', value: '#fce7f3' },
];

// ============================================================
// 🎛️ الإعدادات الافتراضية
// ============================================================

export const DEFAULT_SETTINGS = {
  format: 'webp' as ImageFormat,
  quality: 0.85,
  qualityPreset: 'high' as QualityPreset,
  resize: {
    enabled: false,
    mode: 'exact' as const,
    keepAspectRatio: true,
  },
  stripExif: true,
  preserveAlpha: true,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  multiFormat: {
    enabled: false,
    formats: ['webp', 'jpeg', 'png'] as ImageFormat[],
  },
};

// ============================================================
// 💾 التخزين المحلي
// ============================================================

export const STORAGE_KEY = 'intooly_image_converter_settings';

// ============================================================
// ⚡ الأداء
// ============================================================

export const CONCURRENCY = {
  MAX_PARALLEL: 3,
  TASK_DELAY: 50,
};

// ============================================================
// 📊 حدود التحذير
// ============================================================

export const WARNING_THRESHOLDS = {
  LARGE_FILE: 10,
  HUGE_FILE: 20,
  HIGH_RESOLUTION: 4000,
  HUGE_RESOLUTION: 6000,
};