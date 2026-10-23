/**
 * ثوابت أداة Meta Tags Toolkit — Intooly
 * التبويبات، حدود الطول، التسميات، والرسائل.
 */

import type {
  TabDefinition,
  LengthColorMap,
  OgType,
  TwitterCardType,
} from './types';

// ============================================
// التبويبات
// ============================================

export const TABS: TabDefinition[] = [
  {
    id: 'meta',
    label: 'Meta Tags',
    icon: '📝',
    description: 'العنوان، الوصف، الرابط، ووسوم Robots',
  },
  {
    id: 'length',
    label: 'فحص الطول',
    icon: '📏',
    description: 'عدّ الأحرف والمؤشرات',
  },
  {
    id: 'google',
    label: 'معاينة Google',
    icon: '🔍',
    description: 'كيف قد تظهر صفحتك في البحث',
  },
  {
    id: 'social',
    label: 'المشاركة الاجتماعية',
    icon: '📱',
    description: 'Open Graph وTwitter Cards',
  },
  {
    id: 'html',
    label: 'كود HTML',
    icon: '💻',
    description: 'الوسوم الجاهزة للنسخ',
  },
  {
    id: 'export',
    label: 'تصدير',
    icon: '📥',
    description: 'نسخ أو تنزيل النتائج',
  },
];

// ============================================
// حدود الطول (إرشادية — ليست ضمانًا)
// ============================================

export const LENGTH_LIMITS = {
  title: {
    min: 30,
    ideal: 60,
    max: 70,
    pixelIdeal: 580,
    label: 'العنوان',
  },
  description: {
    min: 70,
    ideal: 160,
    max: 180,
    pixelIdeal: 990,
    label: 'الوصف',
  },
} as const;

// ============================================
// ألوان المؤشرات
// ============================================

export const LENGTH_COLORS: LengthColorMap = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#dc2626',
  gray: '#9ca3af',
};

// ============================================
// أنواع Open Graph
// ============================================

export const OG_TYPES: { value: OgType; label: string; description: string }[] = [
  {
    value: 'website',
    label: 'موقع ويب',
    description: 'الصفحة الرئيسية أو صفحة عامة',
  },
  {
    value: 'article',
    label: 'مقال',
    description: 'مقال أو تدوينة',
  },
  {
    value: 'product',
    label: 'منتج',
    description: 'صفحة منتج في متجر',
  },
  {
    value: 'profile',
    label: 'ملف شخصي',
    description: 'صفحة شخص أو حساب',
  },
  {
    value: 'video.other',
    label: 'فيديو',
    description: 'محتوى فيديو',
  },
];

// ============================================
// أنواع Twitter Cards
// ============================================

export const TWITTER_CARD_TYPES: { value: TwitterCardType; label: string; description: string }[] = [
  {
    value: 'summary',
    label: 'Summary (صورة صغيرة)',
    description: 'صورة صغيرة بجانب النص',
  },
  {
    value: 'summary_large_image',
    label: 'Summary Large (صورة كبيرة)',
    description: 'صورة كبيرة فوق النص (موصى به)',
  },
];

// ============================================
// إعدادات مؤشرات الطول
// ============================================

export const LENGTH_MESSAGES = {
  title: {
    empty: 'لم تكتب عنوانًا بعد',
    tooShort: 'العنوان قصير جدًا — قد لا يوضح محتوى الصفحة',
    good: 'العنوان بطول مثالي',
    tooLong: 'العنوان طويل — قد يقتطع Google جزءًا منه',
  },
  description: {
    empty: 'لم تكتب وصفًا بعد',
    tooShort: 'الوصف قصير — قد لا يوضح محتوى الصفحة',
    good: 'الوصف بطول مثالي',
    tooLong: 'الوصف طويل — قد يقتطع Google جزءًا منه',
  },
} as const;

// ============================================
// رسائل إفصاح
// ============================================

export const DISCLAIMER_MESSAGES = {
  lengthGuide:
    'حدود الطول إرشادية. Google لا يضمن حدًا ثابتًا، وقد يعرض عناوين وأوصافًا مختلفة حسب الاستعلام.',
  previewGuide:
    'المعاينة تقديرية. قد تختلف طريقة عرض النتيجة الفعلية حسب الجهاز والاستعلام.',
  socialGuide:
    'المعاينة الاجتماعية تقديرية. كل منصة (Facebook, Twitter, LinkedIn) قد تعرض البطاقة بشكل مختلف.',
  noDataCollected:
    'لا نجمع بياناتك. كل الحسابات تتم داخل متصفحك، ولا تُرسل إلى خوادمنا.',
} as const;
