/**
 * ثوابت أداة عدّاد الكلمات
 * استوديو النص العربي الذكي
 */

// ============================================
// إعدادات الأداة
// ============================================

export const WORD_COUNTER_CONFIG = {
  // حدود النص
  MIN_TEXT_LENGTH: 1,
  MAX_TEXT_LENGTH: 1_000_000, // مليون حرف
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB

  // حفظ تلقائي
  AUTOSAVE_INTERVAL: 30_000, // 30 ثانية
  STORAGE_KEY: 'intooly-word-counter-draft',

  // وقت القراءة والكتابة
  READING_SPEED_AR: 180, // كلمة/دقيقة (عربي)
  READING_SPEED_EN: 220, // كلمة/دقيقة (إنجليزي)
  WRITING_SPEED: 40, // كلمة/دقيقة
  EDITING_SPEED: 20, // كلمة/دقيقة

  // حدود التحذيرات
  LONG_SENTENCE_THRESHOLD: 25, // كلمة — جملة طويلة
  VERY_LONG_SENTENCE_THRESHOLD: 40, // كلمة
  LONG_PARAGRAPH_THRESHOLD: 150, // كلمة — فقرة طويلة
  REPETITION_THRESHOLD: 5, // تكرار كلمة — تحذير
} as const;

// ============================================
// أنواع الأوضاع الذكية
// ============================================

export type ToolMode = 'general' | 'seo' | 'academic' | 'social' | 'editor';

export interface ModeInfo {
  id: ToolMode;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  color: string;
}

export const TOOL_MODES: ModeInfo[] = [
  {
    id: 'general',
    name: 'العدّ العام',
    nameEn: 'General',
    icon: '📝',
    description: 'لكتابة أي نص — إحصاءات شاملة',
    color: 'gray',
  },
  {
    id: 'seo',
    name: 'كاتب SEO',
    nameEn: 'SEO Writer',
    icon: '🎯',
    description: 'لمقالات محركات البحث + Meta Tags',
    color: 'blue',
  },
  {
    id: 'academic',
    name: 'بحث أكاديمي',
    nameEn: 'Academic',
    icon: '🎓',
    description: 'للبحوث والمقالات الأكاديمية',
    color: 'purple',
  },
  {
    id: 'social',
    name: 'تواصل اجتماعي',
    nameEn: 'Social Media',
    icon: '📱',
    description: 'لمنصات التواصل الاجتماعي',
    color: 'pink',
  },
  {
    id: 'editor',
    name: 'كاتب ومحرر',
    nameEn: 'Editor',
    icon: '✏️',
    description: 'للمحررين + مقارنة النصوص',
    color: 'green',
  },
];

export const DEFAULT_MODE: ToolMode = 'general';

// ============================================
// حدود المنصات
// ============================================

export interface PlatformLimit {
  id: string;
  name: string;
  icon: string;
  limit: number;
  unit: 'char' | 'word';
  color: string;
  notes?: string;
}

export const PLATFORM_LIMITS: PlatformLimit[] = [
  // SEO
  {
    id: 'seo-title',
    name: 'عنوان SEO',
    icon: '🎯',
    limit: 60,
    unit: 'char',
    color: 'blue',
    notes: 'الحد الأمثل لعرضه كاملاً في Google',
  },
  {
    id: 'meta-description',
    name: 'وصف Meta',
    icon: '📄',
    limit: 160,
    unit: 'char',
    color: 'blue',
    notes: 'الحد الأمثل لعرضه كاملاً في نتائج البحث',
  },
  {
    id: 'meta-keywords',
    name: 'كلمات مفتاحية',
    icon: '🔑',
    limit: 255,
    unit: 'char',
    color: 'blue',
  },

  // منصات التواصل
  {
    id: 'twitter',
    name: 'تويتر (X)',
    icon: '🐦',
    limit: 280,
    unit: 'char',
    color: 'sky',
    notes: 'الحد الأقصى للتغريدة',
  },
  {
    id: 'instagram-caption',
    name: 'إنستغرام',
    icon: '📸',
    limit: 2200,
    unit: 'char',
    color: 'pink',
    notes: 'الحد الأقصى لوصف المنشور',
  },
  {
    id: 'facebook-post',
    name: 'فيسبوك',
    icon: '📘',
    limit: 63206,
    unit: 'char',
    color: 'blue',
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn',
    icon: '💼',
    limit: 3000,
    unit: 'char',
    color: 'blue',
  },
  {
    id: 'whatsapp-message',
    name: 'واتساب',
    icon: '💬',
    limit: 65536,
    unit: 'char',
    color: 'green',
  },

  // الأكاديمي
  {
    id: 'abstract',
    name: 'ملخص بحث',
    icon: '📋',
    limit: 300,
    unit: 'word',
    color: 'purple',
    notes: 'الحد الأمثل لملخص بحث أكاديمي',
  },
  {
    id: 'thesis-page',
    name: 'صفحة رسالة',
    icon: '📖',
    limit: 300,
    unit: 'word',
    color: 'purple',
  },

  // عام
  {
    id: 'blog-post',
    name: 'مقال مدونة',
    icon: '📰',
    limit: 1500,
    unit: 'word',
    color: 'gray',
    notes: 'الطول المثالي لمقال مدونة',
  },
  {
    id: 'product-description',
    name: 'وصف منتج',
    icon: '🛒',
    limit: 200,
    unit: 'word',
    color: 'gray',
  },
];

// ============================================
// الكلمات الشائعة العربية (Stop Words)
// تُستبعد من تحليل كثافة الكلمات
// ============================================

export const ARABIC_STOP_WORDS: string[] = [
  // حروف الجر
  'في', 'من', 'إلى', 'على', 'عن', 'مع', 'بين', 'حتى', 'منذ', 'خلال', 'بعد', 'قبل',
  'تحت', 'فوق', 'أمام', 'خلف', 'حول', 'عند', 'لدى', 'نحو', 'حسب', 'وفق', 'ضمن',
  
  // حروف العطف
  'و', 'أو', 'ثم', 'بل', 'لكن', 'حيث', 'إذ', 'إذا', 'لو', 'لولا', 'أما', 'إما',
  
  // الضمائر
  'هو', 'هي', 'هما', 'هم', 'هن', 'أنا', 'نحن', 'أنت', 'أنتم', 'أنتن', 'إياك',
  'إياه', 'إياها', 'إيانا', 'إياكم', 'إياهم',
  
  // أدوات التعريف والتنكير
  'ال', 'هذا', 'هذه', 'هؤلاء', 'ذلك', 'تلك', 'أولئك', 'الذي', 'التي', 'الذين',
  'اللاتي', 'اللواتي', 'ما', 'ماذا', 'من', 'كيف', 'متى', 'أين', 'لماذا',
  
  // الأفعال المساعدة
  'كان', 'كانت', 'كانوا', 'يكون', 'تكون', 'سوف', 'سـ', 'قد', 'لقد', 'ليس', 'ليست',
  
  // أدوات أخرى
  'لا', 'ما', 'لم', 'لن', 'إن', 'أن', 'كأن', 'لكن', 'ليت', 'لعل',
  'كل', 'بعض', 'جميع', 'كلا', 'كلتا', 'أي', 'أية', 'غير', 'سوى', 'مثل',
  'أيضا', 'أيضاً', 'فقط', 'جدا', 'جداً', 'حقاً', 'فعلاً', 'بالفعل', 'بالطبع',
  'نعم', 'لا', 'ربما', 'لعل', 'لعله', 'لعلي',
  
  // حروف النداء
  'يا', 'أيا', 'هيا', 'آي',
  
  // ظروف
  'الآن', 'اليوم', 'أمس', 'غداً', 'غدا', 'هنا', 'هناك', 'هنالك', 'ثمة',
];

// ============================================
// الأخطاء العربية الشائعة
// ============================================

export interface CommonMistake {
  wrong: string;
  correct: string;
  reason: string;
}

export const COMMON_MISTAKES: CommonMistake[] = [
  { wrong: 'انشاء الله', correct: 'إن شاء الله', reason: 'الفعل "شاء" منفصل عن "إن"' },
  { wrong: 'إنشاء الله', correct: 'إن شاء الله', reason: 'الخطأ في كتابة "إن شاء" ككلمة واحدة' },
  { wrong: 'ان شاء الله', correct: 'إن شاء الله', reason: 'كسر همزة إن' },
  { wrong: 'لاكن', correct: 'لكن', reason: 'بدون ألف بعد اللام' },
  { wrong: 'لاكنه', correct: 'لكنه', reason: 'بدون ألف بعد اللام' },
  { wrong: 'إسم', correct: 'اسم', reason: 'همزة الوصل لا تُكتب' },
  { wrong: 'إبن', correct: 'ابن', reason: 'همزة الوصل لا تُكتب' },
  { wrong: 'إبنة', correct: 'ابنة', reason: 'همزة الوصل لا تُكتب' },
  { wrong: 'إبنه', correct: 'ابنه', reason: 'همزة الوصل لا تُكتب' },
  { wrong: 'الذى', correct: 'الذي', reason: 'الياء بدون نقطتين' },
  { wrong: 'التى', correct: 'التي', reason: 'الياء بدون نقطتين' },
  { wrong: 'على (حرف جر)', correct: 'على', reason: 'الياء تلتصق' },
  { wrong: 'من ضمنها', correct: 'ضمنها', reason: 'حشو' },
  { wrong: 'أحدا', correct: 'أحداً', reason: 'تنوين الفتح على الألف' },
  { wrong: 'شكرا', correct: 'شكراً', reason: 'تنوين الفتح' },
  { wrong: 'أيضا', correct: 'أيضاً', reason: 'تنوين الفتح' },
  { wrong: 'فعلا', correct: 'فعلاً', reason: 'تنوين الفتح' },
  { wrong: 'جدا', correct: 'جداً', reason: 'تنوين الفتح' },
  { wrong: 'هذة', correct: 'هذه', reason: 'بدون تاء مربوطة' },
  { wrong: 'هذة', correct: 'هذه', reason: 'الهاء بدل التاء' },
  { wrong: 'ألذى', correct: 'الذي', reason: 'خطأ في كتابة الهمزة' },
  { wrong: 'بأذن الله', correct: 'بإذن الله', reason: 'كسر همزة إذن' },
  { wrong: 'بأذنه', correct: 'بإذنه', reason: 'كسر همزة إذن' },
  { wrong: 'مشأالله', correct: 'ما شاء الله', reason: 'كتابة كلمة واحدة' },
  { wrong: 'ماشاءالله', correct: 'ما شاء الله', reason: 'كتابة كلمات منفصلة' },
  { wrong: 'تصفحت', correct: 'تصفّحت', reason: 'يُفضّل التشديد (اختياري)' },
  { wrong: 'مهما كان من', correct: 'مهما كان', reason: 'حشو' },
  { wrong: 'أياً كان', correct: 'أيّاً كان', reason: 'تشديد الياء (اختياري)' },
  { wrong: 'أما بعد', correct: 'أما بعد', reason: 'خطأ شائع في الفصل' },
  { wrong: 'أن شاء الله', correct: 'إن شاء الله', reason: 'كسر همزة إن' },
  { wrong: 'أنشاء الله', correct: 'إن شاء الله', reason: 'خطأ في الهمزة' },
  { wrong: 'خطاء', correct: 'خطأ', reason: 'همزة على ألف بدون مد' },
  { wrong: 'أخطاء', correct: 'أخطاء', reason: 'صحيح' },
  { wrong: 'مساءا', correct: 'مساءً', reason: 'تنوين الفتح على الهمزة' },
  { wrong: 'صباحا', correct: 'صباحاً', reason: 'تنوين الفتح' },
  { wrong: 'أهلا', correct: 'أهلاً', reason: 'تنوين الفتح' },
  { wrong: 'سهلا', correct: 'سهلاً', reason: 'تنوين الفتح' },
  { wrong: 'مرحبا', correct: 'مرحباً', reason: 'تنوين الفتح' },
  { wrong: 'أهلا وسهلا', correct: 'أهلاً وسهلاً', reason: 'تنوين الفتح' },
  { wrong: 'بالتوفيق', correct: 'بالتوفيق', reason: 'صحيح' },
  { wrong: 'بالتوفيق ان شاء الله', correct: 'بالتوفيق إن شاء الله', reason: 'كسر همزة إن' },
  { wrong: 'أتمنى لك التوفيق', correct: 'أتمنى لك التوفيق', reason: 'صحيح' },
  { wrong: 'إلى اللقاء', correct: 'إلى اللقاء', reason: 'صحيح' },
  { wrong: 'الى اللقاء', correct: 'إلى اللقاء', reason: 'همزة قطع' },
  { wrong: 'إنشالله', correct: 'إن شاء الله', reason: 'كتابة كلمة واحدة' },
  { wrong: 'حبيبي', correct: 'حبيبي', reason: 'صحيح' },
  { wrong: 'حبى', correct: 'حبي', reason: 'الياء بدون نقطتين' },
  { wrong: 'يسعدني', correct: 'يسعدني', reason: 'صحيح' },
  { wrong: 'يسعدنى', correct: 'يسعدني', reason: 'الياء بدون نقطتين' },
  { wrong: 'أنا', correct: 'أنا', reason: 'صحيح' },
  { wrong: 'انا', correct: 'أنا', reason: 'همزة القطع' },
  { wrong: 'أنا ذاهب', correct: 'أنا ذاهب', reason: 'صحيح' },
  { wrong: 'انا ذاهب', correct: 'أنا ذاهب', reason: 'همزة القطع' },
];

// ============================================
// أوزان مؤشر القراءة العربي
// ============================================

export const READABILITY_WEIGHTS = {
  SENTENCE_LENGTH: 0.35, // طول الجملة
  WORD_COMPLEXITY: 0.30, // تعقيد الكلمات (حروف طويلة)
  DIACRITICS_RATIO: 0.15, // نسبة التشكيل (يدل على الرسمية)
  LONG_WORDS_RATIO: 0.20, // نسبة الكلمات الطويلة
} as const;

// ============================================
// مستويات مؤشر القراءة
// ============================================

export interface ReadabilityLevel {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export const READABILITY_LEVELS: ReadabilityLevel[] = [
  {
    id: 'very-easy',
    label: 'سهل جداً',
    labelEn: 'Very Easy',
    icon: '🟢',
    color: 'green',
    minScore: 80,
    maxScore: 100,
    description: 'مناسب للأطفال والجمهور العام',
  },
  {
    id: 'easy',
    label: 'سهل',
    labelEn: 'Easy',
    icon: '🟡',
    color: 'yellow',
    minScore: 60,
    maxScore: 79,
    description: 'مناسب للجمهور العام والمقالات',
  },
  {
    id: 'medium',
    label: 'متوسط',
    labelEn: 'Medium',
    icon: '🟠',
    color: 'orange',
    minScore: 40,
    maxScore: 59,
    description: 'مناسب للمتعلمين والمقالات المتخصصة',
  },
  {
    id: 'hard',
    label: 'صعب',
    labelEn: 'Hard',
    icon: '🔴',
    color: 'red',
    minScore: 20,
    maxScore: 39,
    description: 'مناسب للأكاديميين والمتخصصين',
  },
  {
    id: 'very-hard',
    label: 'صعب جداً',
    labelEn: 'Very Hard',
    icon: '⚫',
    color: 'gray',
    minScore: 0,
    maxScore: 19,
    description: 'مناسب للبحوث المتخصصة جداً',
  },
];

// ============================================
// الرسائل الموحدة
// ============================================

export const WORD_COUNTER_MESSAGES = {
  // الحالة
  EMPTY_TEXT: 'الرجاء إدخال نص أولاً',
  LOADING: 'جاري التحليل...',
  SUCCESS: 'تم التحليل بنجاح',
  
  // الملفات
  FILE_TOO_BIG: 'الملف كبير جداً (الحد: 10 ميجابايت)',
  FILE_INVALID_TYPE: 'نوع الملف غير مدعوم',
  FILE_READ_ERROR: 'فشل قراءة الملف',
  
  // عام
  COPY_SUCCESS: 'تم النسخ!',
  SAVE_SUCCESS: 'تم الحفظ!',
  CLEAR_SUCCESS: 'تم المسح!',
  EXPORT_SUCCESS: 'تم التصدير!',
  
  // تحذيرات
  LONG_SENTENCE: 'جملة طويلة — حاول تقسيمها',
  LONG_PARAGRAPH: 'فقرة طويلة — أضف فاصلاً',
  WORD_REPETITION: 'كلمة مكررة كثيراً',
  COMMON_MISTAKE: 'يوجد خطأ إملائي شائع',
} as const;
