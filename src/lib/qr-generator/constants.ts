/**
 * ثوابت أداة مولّد QR Code
 */

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  BASE_URL: 'https://intooly-qr-api.intoolysite.workers.dev',
  ENDPOINTS: {
    CREATE: '/api/qr/create',
    GET: '/api/qr',
    UPDATE: '/api/qr',
    DELETE: '/api/qr',
    LIST: '/api/qr/list',
    PUBLIC: '/r',
  },
  TIMEOUT: 15000,
} as const;

// ============================================
// أنواع QR
// ============================================

export type QRType = 
  | 'link'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'whatsapp'
  | 'location'
  | 'event'
  | 'restaurant'
  | 'store'
  | 'company'
  | 'custom';

export interface QRTypeInfo {
  id: QRType;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  keyword: string;
  color: string;
  fields: string[];
}

export const QR_TYPES: QRTypeInfo[] = [
  {
    id: 'link',
    name: 'رابط موقع',
    nameEn: 'Link',
    icon: '🔗',
    description: 'رابط لموقع أو صفحة',
    keyword: 'QR رابط',
    color: 'blue',
    fields: ['url', 'title', 'description'],
  },
  {
    id: 'text',
    name: 'نص',
    nameEn: 'Text',
    icon: '📝',
    description: 'نص حر',
    keyword: 'QR نص',
    color: 'gray',
    fields: ['text'],
  },
  {
    id: 'email',
    name: 'بريد إلكتروني',
    nameEn: 'Email',
    icon: '📧',
    description: 'بريد مع موضوع',
    keyword: 'QR بريد',
    color: 'red',
    fields: ['email', 'subject', 'body'],
  },
  {
    id: 'phone',
    name: 'هاتف',
    nameEn: 'Phone',
    icon: '📞',
    description: 'رقم هاتف',
    keyword: 'QR هاتف',
    color: 'green',
    fields: ['phone'],
  },
  {
    id: 'sms',
    name: 'رسالة SMS',
    nameEn: 'SMS',
    icon: '💬',
    description: 'رسالة نصية',
    keyword: 'QR SMS',
    color: 'teal',
    fields: ['phone', 'message'],
  },
  {
    id: 'wifi',
    name: 'شبكة Wi-Fi',
    nameEn: 'Wi-Fi',
    icon: '📶',
    description: 'مشاركة شبكة Wi-Fi',
    keyword: 'QR Wi-Fi',
    color: 'cyan',
    fields: ['ssid', 'password', 'encryption', 'hidden'],
  },
  {
    id: 'vcard',
    name: 'بطاقة عمل',
    nameEn: 'vCard',
    icon: '👤',
    description: 'بطاقة اتصال (vCard)',
    keyword: 'QR بطاقة عمل',
    color: 'purple',
    fields: ['firstName', 'lastName', 'phone', 'email', 'company', 'jobTitle', 'website', 'address'],
  },
  {
    id: 'whatsapp',
    name: 'واتساب',
    nameEn: 'WhatsApp',
    icon: '💚',
    description: 'محادثة واتساب',
    keyword: 'QR واتساب',
    color: 'green',
    fields: ['whatsapp', 'message'],
  },
  {
    id: 'location',
    name: 'موقع جغرافي',
    nameEn: 'Location',
    icon: '📍',
    description: 'موقع على الخريطة',
    keyword: 'QR موقع',
    color: 'red',
    fields: ['location'],
  },
  {
    id: 'event',
    name: 'فعالية',
    nameEn: 'Event',
    icon: '🎉',
    description: 'دعوة فعالية',
    keyword: 'QR للفعاليات',
    color: 'indigo',
    fields: ['name', 'description', 'date', 'time', 'location', 'registrationUrl'],
  },
  {
    id: 'restaurant',
    name: 'مطعم',
    nameEn: 'Restaurant',
    icon: '🍽️',
    description: 'معلومات مطعم + قائمة طعام',
    keyword: 'QR للمطاعم',
    color: 'orange',
    fields: ['name', 'description', 'phone', 'whatsapp', 'menuUrl', 'location', 'hours'],
  },
  {
    id: 'store',
    name: 'متجر',
    nameEn: 'Store',
    icon: '🛍️',
    description: 'معلومات متجر + منتجات',
    keyword: 'QR للمتاجر',
    color: 'pink',
    fields: ['name', 'description', 'phone', 'whatsapp', 'website', 'catalogUrl', 'location'],
  },
  {
    id: 'company',
    name: 'شركة',
    nameEn: 'Company',
    icon: '🏢',
    description: 'معلومات شركة',
    keyword: 'QR للشركات',
    color: 'emerald',
    fields: ['name', 'description', 'phone', 'email', 'website', 'address', 'location'],
  },
  {
    id: 'custom',
    name: 'مخصص',
    nameEn: 'Custom',
    icon: '⚙️',
    description: 'أي بيانات',
    keyword: 'QR مخصص',
    color: 'slate',
    fields: ['data', 'title', 'description'],
  },
];

// ============================================
// إعدادات QR
// ============================================

export const QR_CONFIG = {
  MIN_SIZE: 128,
  MAX_SIZE: 4096,
  DEFAULT_SIZE: 512,

  MIN_MARGIN: 0,
  MAX_MARGIN: 10,
  DEFAULT_MARGIN: 4,

  DEFAULT_FOREGROUND: '#111827',
  DEFAULT_BACKGROUND: '#ffffff',

  DEFAULT_ERROR_CORRECTION: 'M' as const,
  ERROR_CORRECTIONS: ['L', 'M', 'Q', 'H'] as const,
} as const;

export type ErrorCorrectionLevel = typeof QR_CONFIG.ERROR_CORRECTIONS[number];

export const ERROR_CORRECTION_INFO = {
  L: { level: 'L', percentage: '7%', label: 'منخفض' },
  M: { level: 'M', percentage: '15%', label: 'متوسط' },
  Q: { level: 'Q', percentage: '25%', label: 'مرتفع' },
  H: { level: 'H', percentage: '30%', label: 'أقصى' },
} as const;

// ============================================
// قوالب الألوان
// ============================================

export interface ColorTemplate {
  id: string;
  name: string;
  foreground: string;
  background: string;
  preview: string;
}

export const COLOR_TEMPLATES: ColorTemplate[] = [
  { id: 'default', name: 'افتراضي', foreground: '#111827', background: '#ffffff', preview: '#111827' },
  { id: 'brand', name: 'ذهبي', foreground: '#a16207', background: '#fefce8', preview: '#eab308' },
  { id: 'blue', name: 'أزرق', foreground: '#1e40af', background: '#eff6ff', preview: '#3b82f6' },
  { id: 'green', name: 'أخضر', foreground: '#15803d', background: '#f0fdf4', preview: '#22c55e' },
  { id: 'red', name: 'أحمر', foreground: '#b91c1c', background: '#fef2f2', preview: '#ef4444' },
  { id: 'purple', name: 'بنفسجي', foreground: '#6b21a8', background: '#faf5ff', preview: '#a855f7' },
  { id: 'pink', name: 'وردي', foreground: '#be185d', background: '#fdf2f8', preview: '#ec4899' },
  { id: 'orange', name: 'برتقالي', foreground: '#c2410c', background: '#fff7ed', preview: '#f97316' },
  { id: 'teal', name: 'فيروزي', foreground: '#0f766e', background: '#f0fdfa', preview: '#14b8a6' },
  { id: 'indigo', name: 'نيلي', foreground: '#4338ca', background: '#eef2ff', preview: '#6366f1' },
  { id: 'black', name: 'أسود', foreground: '#000000', background: '#ffffff', preview: '#000000' },
  { id: 'golden', name: 'ذهبي فاخر', foreground: '#78350f', background: '#fffbeb', preview: '#f59e0b' },
];

// ============================================
// الرسائل الموحدة
// ============================================

export const QR_MESSAGES = {
  READY: 'جاهز',
  LOADING: 'جاري التحميل...',
  CREATING: 'جاري إنشاء QR...',
  SUCCESS: '✅ تم إنشاء QR بنجاح!',
  ERROR: 'حدث خطأ. حاول مرة أخرى.',
  
  ERROR_API: 'فشل الاتصال بالخادم',
  ERROR_TIMEOUT: 'انتهت مهلة الطلب',
  ERROR_INVALID_DATA: 'البيانات غير صالحة',
  ERROR_NOT_FOUND: 'QR غير موجود',
  
  API_KEY_SAVED: 'تم حفظ مفتاح API',
  URL_COPIED: 'تم نسخ الرابط!',
  QR_DOWNLOADED: 'تم تحميل QR',
  
  DISCLAIMER: 'QR ثابت لا تنتهي صلاحيته. احفظ مفتاح API للعودة لاحقاً.',
} as const;

// ============================================
// الإعدادات الافتراضية
// ============================================

export const DEFAULT_QR_STATE = {
  type: 'link' as QRType,
  data: {} as Record<string, string>,
  size: QR_CONFIG.DEFAULT_SIZE,
  margin: QR_CONFIG.DEFAULT_MARGIN,
  foreground: QR_CONFIG.DEFAULT_FOREGROUND,
  background: QR_CONFIG.DEFAULT_BACKGROUND,
  errorCorrection: QR_CONFIG.DEFAULT_ERROR_CORRECTION,
} as const;
