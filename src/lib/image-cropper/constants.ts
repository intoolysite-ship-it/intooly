// ============================================================
// 📚 ثوابت أداة قص الصور
// ============================================================

import type {
  AspectRatioId,
  PresetTemplate,
} from './types';

// ============================================================
// 🔢 الحدود
// ============================================================

export const LIMITS = {
  /** الحد الأقصى لحجم الملف (25 MB) */
  MAX_FILE_SIZE: 25 * 1024 * 1024,
  /** الحد الأقصى لعدد الصور */
  MAX_IMAGES: 50,
  /** الحد الأدنى للعرض/الطول */
  MIN_SIZE: 10,
  /** الحد الأقصى للعرض/الطول */
  MAX_SIZE: 10000,
  /** الحد الأدنى للزوم */
  MIN_ZOOM: 0.5,
  /** الحد الأقصى للزوم */
  MAX_ZOOM: 3,
  /** خطوة الزوم */
  ZOOM_STEP: 0.1,
  /** الحد الأدنى لزوايا مدورة */
  MIN_BORDER_RADIUS: 0,
  /** الحد الأقصى لزوايا مدورة */
  MAX_BORDER_RADIUS: 200,
};

// ============================================================
// 📐 النسب الجاهزة
// ============================================================

export const ASPECT_RATIOS: Array<{
  id: AspectRatioId;
  label: string;
  value: number | null;
  description: string;
}> = [
  { id: 'free', label: 'حر', value: null, description: 'بدون قيد' },
  { id: '1:1', label: '1:1', value: 1, description: 'مربع' },
  { id: '4:3', label: '4:3', value: 4/3, description: 'كلاسيكي' },
  { id: '16:9', label: '16:9', value: 16/9, description: 'سينمائي' },
  { id: '3:2', label: '3:2', value: 3/2, description: 'كاميرا' },
  { id: '9:16', label: '9:16', value: 9/16, description: 'ستوري' },
  { id: '3:4', label: '3:4', value: 3/4, description: 'بورتريه' },
  { id: '2:3', label: '2:3', value: 2/3, description: 'بورتريه كلاسيكي' },
  { id: 'custom', label: 'مخصص', value: null, description: 'نسبة حرة' },
];

// ============================================================
// 🎯 القوالب الجاهزة (سوشيال + ماركت بليس + طباعة)
// ============================================================

export const PRESET_TEMPLATES: PresetTemplate[] = [
  // ============================================
  // 📱 سوشيال ميديا
  // ============================================
  {
    id: 'ig-square',
    name: 'إنستغرام مربع',
    category: 'social',
    icon: '📷',
    width: 1080,
    height: 1080,
    description: 'مثالي لمنشورات Instagram',
  },
  {
    id: 'ig-story',
    name: 'إنستغرام ستوري',
    category: 'social',
    icon: '📸',
    width: 1080,
    height: 1920,
    description: 'ستوري / ريلز',
  },
  {
    id: 'fb-post',
    name: 'فيسبوك بوست',
    category: 'social',
    icon: '📘',
    width: 1200,
    height: 630,
    description: 'منشور Facebook',
  },
  {
    id: 'twitter-post',
    name: 'تويتر بوست',
    category: 'social',
    icon: '🐦',
    width: 1600,
    height: 900,
    description: 'منشور Twitter/X',
  },
  {
    id: 'yt-thumbnail',
    name: 'يوتيوب Thumbnail',
    category: 'social',
    icon: '▶️',
    width: 1280,
    height: 720,
    description: 'صورة مصغّرة YouTube',
  },
  {
    id: 'tiktok',
    name: 'تيك توك',
    category: 'social',
    icon: '🎵',
    width: 1080,
    height: 1920,
    description: 'فيديو TikTok',
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    category: 'social',
    icon: '💼',
    width: 1584,
    height: 396,
    description: 'غلاف LinkedIn',
  },
  {
    id: 'whatsapp-status',
    name: 'واتساب حالة',
    category: 'social',
    icon: '💬',
    width: 1080,
    height: 1920,
    description: 'حالة WhatsApp',
  },

    {
    id: 'pinterest-standard',
    name: 'بنترست Pin',
    category: 'social',
    icon: '📌',
    width: 1000,
    height: 1500,
    description: 'Pin قياسي على Pinterest',
  },
  {
    id: 'pinterest-long',
    name: 'بنترست طويل',
    category: 'social',
    icon: '📌',
    width: 1000,
    height: 2100,
    description: 'Pin طويل مميز',
  },
  {
    id: 'pinterest-idea',
    name: 'بنترست Idea',
    category: 'social',
    icon: '📌',
    width: 1080,
    height: 1920,
    description: 'Idea Pin',
  },

  // ============================================
  // 🛒 ماركت بليس
  // ============================================
  {
    id: 'amazon',
    name: 'أمازون',
    category: 'marketplace',
    icon: '🛒',
    width: 2000,
    height: 2000,
    description: 'متطلبات Amazon',
  },
  {
    id: 'noon',
    name: 'نون',
    category: 'marketplace',
    icon: '🟡',
    width: 1200,
    height: 1200,
    description: 'متطلبات Noon',
  },
  {
    id: 'haraj',
    name: 'حراج',
    category: 'marketplace',
    icon: '🏠',
    width: 800,
    height: 800,
    description: 'متطلبات Haraj',
  },
  {
    id: 'salla',
    name: 'سلة',
    category: 'marketplace',
    icon: '📱',
    width: 800,
    height: 800,
    description: 'متطلبات Salla',
  },
  {
    id: 'etsy',
    name: 'إيتسي',
    category: 'marketplace',
    icon: '🛍️',
    width: 2000,
    height: 2000,
    description: 'متطلبات Etsy',
  },

  // ============================================
  // 🖨️ طباعة
  // ============================================
  {
    id: 'a4-print',
    name: 'A4',
    category: 'print',
    icon: '📄',
    width: 2480,
    height: 3508,
    description: 'A4 بـ 300dpi',
  },
  {
    id: 'a3-print',
    name: 'A3',
    category: 'print',
    icon: '📃',
    width: 3508,
    height: 4961,
    description: 'A3 بـ 300dpi',
  },
  {
    id: 'a5-print',
    name: 'A5',
    category: 'print',
    icon: '📋',
    width: 1748,
    height: 2480,
    description: 'A5 بـ 300dpi',
  },
  {
    id: 'business-card',
    name: 'بطاقة أعمال',
    category: 'print',
    icon: '💳',
    width: 1050,
    height: 600,
    description: 'بطاقة بـ 300dpi',
  },

  // ============================================
  // 🔧 مخصص
  // ============================================
  {
    id: 'custom-size',
    name: 'مقاس مخصص',
    category: 'custom',
    icon: '⚙️',
    width: 0,
    height: 0,
    description: 'أدخل الأبعاد يدويًا',
  },
];

// ============================================================
// 🎨 الألوان
// ============================================================

export const COLORS = {
  gridLine: 'rgba(255, 255, 255, 0.5)',
  gridLineShadow: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
  borderPrimary: '#eab308',
  borderSecondary: '#facc15',
  handleFill: '#ffffff',
  handleStroke: '#eab308',
};

// ============================================================
// 💾 التخزين المحلي
// ============================================================

export const STORAGE_KEY = 'intooly_image_cropper_settings';

// ============================================================
// ⚙️ الإعدادات الافتراضية
// ============================================================

export const DEFAULT_SETTINGS = {
  aspectRatio: 'free' as AspectRatioId,
  customRatio: {
    width: 1,
    height: 1,
  },
  shape: 'rectangle' as const,
  borderRadius: 0,
  lockAspectRatio: false,
  showGrid: true,
  gridType: 'thirds' as const,
  quality: 0.92,
  format: 'jpeg' as const,
};

// ============================================================
// 📄 الصيغ المدعومة للإخراج
// ============================================================

export const OUTPUT_FORMATS = [
  { id: 'jpeg', label: 'JPG', mime: 'image/jpeg', icon: '📷' },
  { id: 'png', label: 'PNG', mime: 'image/png', icon: '🎨' },
  { id: 'webp', label: 'WebP', mime: 'image/webp', icon: '🌐' },
];

// ============================================================
// 📥 الصيغ المقبولة للإدخال
// ============================================================

export const ACCEPTED_EXTENSIONS = /\.(jpg|jpeg|png|webp|avif|heic|heif|gif|bmp|tiff|tif|ico|jfif)$/i;

// ============================================================
// 📏 حجم مقبض السحب (بالنسبة المئوية)
// ============================================================

export const HANDLE_SIZE = 12; // بكسل
export const HANDLE_RADIUS = 6; // بكسل
export const MIN_CROP_SIZE = 20; // بكسل