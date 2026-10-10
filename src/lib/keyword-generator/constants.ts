/**
 * ثوابت مولّد الكلمات المفتاحية
 * يدعم 22 دولة عربية + الأسواق العالمية
 */

// ============================================
// الدول المدعومة
// ============================================

export type CountryCode = 
  | 'SA' | 'EG' | 'AE' | 'KW' | 'QA' | 'BH' | 'OM'
  | 'JO' | 'LB' | 'SY' | 'PS' | 'IQ' | 'YE'
  | 'LY' | 'TN' | 'DZ' | 'MA' | 'SD' | 'MR'
  | 'SO' | 'DJ' | 'KM'
  | 'US' | 'GB' | 'FR' | 'DE' | 'TR' | 'IN' | 'ALL';

export interface Country {
  code: CountryCode;
  name: string;
  nameEn: string;
  flag: string;
  language: 'ar' | 'en' | 'fr' | 'tr' | 'multi';
  dialect: 'khaliji' | 'masri' | 'shami' | 'iraqi' | 'yemeni' | 'libi' | 'tunisi' | 'jazairi' | 'maghribi' | 'sudani' | 'standard';
}

export const COUNTRIES: Country[] = [
  // ===== الخليج =====
  { code: 'SA', name: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', language: 'ar', dialect: 'khaliji' },
  { code: 'AE', name: 'الإمارات', nameEn: 'United Arab Emirates', flag: '🇦🇪', language: 'ar', dialect: 'khaliji' },
  { code: 'KW', name: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼', language: 'ar', dialect: 'khaliji' },
  { code: 'QA', name: 'قطر', nameEn: 'Qatar', flag: '🇶🇦', language: 'ar', dialect: 'khaliji' },
  { code: 'BH', name: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭', language: 'ar', dialect: 'khaliji' },
  { code: 'OM', name: 'عُمان', nameEn: 'Oman', flag: '🇴🇲', language: 'ar', dialect: 'khaliji' },
  
  // ===== الشام =====
  { code: 'JO', name: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', language: 'ar', dialect: 'shami' },
  { code: 'LB', name: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧', language: 'ar', dialect: 'shami' },
  { code: 'SY', name: 'سوريا', nameEn: 'Syria', flag: '🇸🇾', language: 'ar', dialect: 'shami' },
  { code: 'PS', name: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸', language: 'ar', dialect: 'shami' },
  
  // ===== شمال أفريقيا =====
  { code: 'EG', name: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', language: 'ar', dialect: 'masri' },
  { code: 'LY', name: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾', language: 'ar', dialect: 'libi' },
  { code: 'TN', name: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳', language: 'ar', dialect: 'tunisi' },
  { code: 'DZ', name: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿', language: 'ar', dialect: 'jazairi' },
  { code: 'MA', name: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦', language: 'ar', dialect: 'maghribi' },
  { code: 'SD', name: 'السودان', nameEn: 'Sudan', flag: '🇸🇩', language: 'ar', dialect: 'sudani' },
  { code: 'MR', name: 'موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷', language: 'ar', dialect: 'maghribi' },
  
  // ===== دول أخرى =====
  { code: 'IQ', name: 'العراق', nameEn: 'Iraq', flag: '🇮🇶', language: 'ar', dialect: 'iraqi' },
  { code: 'YE', name: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪', language: 'ar', dialect: 'yemeni' },
  { code: 'SO', name: 'الصومال', nameEn: 'Somalia', flag: '🇸🇴', language: 'ar', dialect: 'standard' },
  { code: 'DJ', name: 'جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯', language: 'ar', dialect: 'standard' },
  { code: 'KM', name: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲', language: 'ar', dialect: 'standard' },
  
  // ===== أسواق عالمية =====
  { code: 'US', name: 'الولايات المتحدة', nameEn: 'United States', flag: '🇺🇸', language: 'en', dialect: 'standard' },
  { code: 'GB', name: 'المملكة المتحدة', nameEn: 'United Kingdom', flag: '🇬🇧', language: 'en', dialect: 'standard' },
  { code: 'FR', name: 'فرنسا', nameEn: 'France', flag: '🇫🇷', language: 'fr', dialect: 'standard' },
  { code: 'DE', name: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪', language: 'en', dialect: 'standard' },
  { code: 'TR', name: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷', language: 'tr', dialect: 'standard' },
  { code: 'IN', name: 'الهند', nameEn: 'India', flag: '🇮🇳', language: 'en', dialect: 'standard' },
];

export const DEFAULT_COUNTRY: CountryCode = 'SA';
export const ALL_COUNTRIES_CODE: CountryCode = 'ALL';

// ============================================
// القاموس المحلي — كلمات بديلة حسب الدولة
// ============================================

/**
 * كلمات بديلة حسب الدولة
 * مثال: "جوال" في السعودية = "موبايل" في مصر = "هاتف" في المغرب
 */
export const LOCAL_VOCABULARY: Record<string, Record<string, string>> = {
  // الأجهزة
  'جوال': {
    SA: 'جوال', AE: 'جوال', KW: 'جوال', QA: 'جوال', BH: 'جوال', OM: 'جوال',
    EG: 'موبايل', LY: 'موبايل', SD: 'موبايل',
    MA: 'هاتف', DZ: 'هاتف', TN: 'هاتف', MR: 'هاتف',
    JO: 'موبايل', LB: 'موبايل', SY: 'موبايل', PS: 'موبايل', IQ: 'موبايل',
    YE: 'جوال',
  },
  'سيارة': {
    SA: 'سيارة', AE: 'سيارة', KW: 'سيارة', QA: 'سيارة', BH: 'سيارة', OM: 'سيارة',
    EG: 'عربية', LY: 'عربية', SD: 'عربية',
    MA: 'طوموبيل', DZ: 'طوموبيل', TN: 'طوموبيل', MR: 'طوموبيل',
    JO: 'سيارة', LB: 'سيارة', SY: 'سيارة', PS: 'سيارة', IQ: 'سيارة',
    YE: 'سيارة',
  },
  'شقة': {
    SA: 'شقة', AE: 'شقة', KW: 'شقة', QA: 'شقة', BH: 'شقة', OM: 'شقة',
    EG: 'شقة', LY: 'شقة', SD: 'شقة',
    MA: 'دار', DZ: 'دار', TN: 'دار', MR: 'دار',
    JO: 'شقة', LB: 'شقة', SY: 'شقة', PS: 'شقة', IQ: 'شقة',
    YE: 'شقة',
  },
  'وظيفة': {
    SA: 'وظيفة', AE: 'وظيفة', KW: 'وظيفة', QA: 'وظيفة', BH: 'وظيفة', OM: 'وظيفة',
    EG: 'وظيفة', LY: 'وظيفة', SD: 'وظيفة',
    MA: 'خدمة', DZ: 'خدمة', TN: 'خدمة', MR: 'خدمة',
    JO: 'وظيفة', LB: 'وظيفة', SY: 'وظيفة', PS: 'وظيفة', IQ: 'وظيفة',
    YE: 'وظيفة',
  },
  'ملابس': {
    SA: 'ملابس', AE: 'ملابس', KW: 'ملابس', QA: 'ملابس', BH: 'ملابس', OM: 'ملابس',
    EG: 'هدوم', LY: 'هدوم', SD: 'هدوم',
    MA: 'حوايج', DZ: 'حوايج', TN: 'حوايج', MR: 'حوايج',
    JO: 'ملابس', LB: 'ملابس', SY: 'ملابس', PS: 'ملابس', IQ: 'ملابس',
    YE: 'ملابس',
  },
  'طعام': {
    SA: 'أكل', AE: 'أكل', KW: 'أكل', QA: 'أكل', BH: 'أكل', OM: 'أكل',
    EG: 'أكل', LY: 'ماكلة', SD: 'أكل',
    MA: 'ماكلة', DZ: 'ماكلة', TN: 'ماكلة', MR: 'ماكلة',
    JO: 'أكل', LB: 'أكل', SY: 'أكل', PS: 'أكل', IQ: 'أكل',
    YE: 'أكل',
  },
  'سعر': {
    SA: 'سعر', AE: 'سعر', KW: 'سعر', QA: 'سعر', BH: 'سعر', OM: 'سعر',
    EG: 'سعر', LY: 'سعر', SD: 'سعر',
    MA: 'ثمن', DZ: 'ثمن', TN: 'ثمن', MR: 'ثمن',
    JO: 'سعر', LB: 'سعر', SY: 'سعر', PS: 'سعر', IQ: 'سعر',
    YE: 'سعر',
  },
  'شراء': {
    SA: 'شراء', AE: 'شراء', KW: 'شراء', QA: 'شراء', BH: 'شراء', OM: 'شراء',
    EG: 'شراء', LY: 'شراء', SD: 'شراء',
    MA: 'شري', DZ: 'شري', TN: 'شري', MR: 'شري',
    JO: 'شراء', LB: 'شراء', SY: 'شراء', PS: 'شراء', IQ: 'شراء',
    YE: 'شراء',
  },
};

/**
 * العملة والمقاسات حسب الدولة
 */
export const COUNTRY_METRICS: Record<string, { currency: string; currencyCode: string; distance: string }> = {
  SA: { currency: 'ريال', currencyCode: 'SAR', distance: 'كم' },
  AE: { currency: 'درهم', currencyCode: 'AED', distance: 'كم' },
  KW: { currency: 'دينار', currencyCode: 'KWD', distance: 'كم' },
  QA: { currency: 'ريال', currencyCode: 'QAR', distance: 'كم' },
  BH: { currency: 'دينار', currencyCode: 'BHD', distance: 'كم' },
  OM: { currency: 'ريال', currencyCode: 'OMR', distance: 'كم' },
  JO: { currency: 'دينار', currencyCode: 'JOD', distance: 'كم' },
  LB: { currency: 'ليرة', currencyCode: 'LBP', distance: 'كم' },
  SY: { currency: 'ليرة', currencyCode: 'SYP', distance: 'كم' },
  PS: { currency: 'شيكل', currencyCode: 'ILS', distance: 'كم' },
  EG: { currency: 'جنيه', currencyCode: 'EGP', distance: 'كم' },
  LY: { currency: 'دينار', currencyCode: 'LYD', distance: 'كم' },
  TN: { currency: 'دينار', currencyCode: 'TND', distance: 'كم' },
  DZ: { currency: 'دينار', currencyCode: 'DZD', distance: 'كم' },
  MA: { currency: 'درهم', currencyCode: 'MAD', distance: 'كم' },
  SD: { currency: 'جنيه', currencyCode: 'SDG', distance: 'كم' },
  MR: { currency: 'أوقية', currencyCode: 'MRU', distance: 'كم' },
  IQ: { currency: 'دينار', currencyCode: 'IQD', distance: 'كم' },
  YE: { currency: 'ريال', currencyCode: 'YER', distance: 'كم' },
  SO: { currency: 'شلن', currencyCode: 'SOS', distance: 'كم' },
  DJ: { currency: 'فرنك', currencyCode: 'DJF', distance: 'كم' },
  KM: { currency: 'فرنك', currencyCode: 'KMF', distance: 'كم' },
  US: { currency: 'دولار', currencyCode: 'USD', distance: 'mile' },
  GB: { currency: 'جنيه', currencyCode: 'GBP', distance: 'mile' },
  FR: { currency: 'يورو', currencyCode: 'EUR', distance: 'km' },
  DE: { currency: 'يورو', currencyCode: 'EUR', distance: 'km' },
  TR: { currency: 'ليرة', currencyCode: 'TRY', distance: 'km' },
  IN: { currency: 'روبية', currencyCode: 'INR', distance: 'km' },
};

/**
 * المناسبات الموسمية حسب الدولة
 */
export const COUNTRY_EVENTS: Record<string, string[]> = {
  SA: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'اليوم الوطني', 'يوم التأسيس', 'موسم الرياض'],
  AE: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'اليوم الوطني', 'دبي شوبينج فستيفال'],
  KW: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'اليوم الوطني', 'عيد التحرير'],
  QA: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'اليوم الوطني', 'مهرجان الدوحة'],
  BH: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'اليوم الوطني'],
  OM: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'اليوم الوطني', 'مهرجان مسقط'],
  JO: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الاستقلال'],
  LB: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الاستقلال'],
  SY: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الجلاء'],
  PS: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'يوم النكبة'],
  EG: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'شم النسيم', 'عيد ثورة 25 يناير', 'عيد ثورة 30 يونيو'],
  LY: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'يوم الاستقلال'],
  TN: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الاستقلال', 'عيد الجمهورية'],
  DZ: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الثورة', 'رأس السنة الأمازيغية'],
  MA: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد العرش', 'عيد المسيرة الخضراء'],
  SD: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الاستقلال'],
  MR: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الاستقلال'],
  IQ: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد النوروز', 'يوم الجمهورية'],
  YE: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الوحدة', 'عيد الثورة'],
  SO: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الاستقلال'],
  DJ: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الاستقلال'],
  KM: ['رمضان', 'عيد الفطر', 'عيد الأضحى', 'عيد الاستقلال'],
  US: ['Christmas', 'Thanksgiving', 'Black Friday', 'New Year', 'Independence Day'],
  GB: ['Christmas', 'Boxing Day', 'Black Friday', 'New Year', 'Easter'],
  FR: ['Noël', 'Nouvel An', 'Black Friday', 'Pâques', 'Soldes'],
  DE: ['Weihnachten', 'Neujahr', 'Black Friday', 'Ostern', 'Oktoberfest'],
  TR: ['Ramazan', 'Kurban Bayramı', 'Yılbaşı', 'Cumhuriyet Bayramı'],
  IN: ['Diwali', 'Holi', 'Eid', 'Christmas', 'Independence Day'],
};

// ============================================
// إعدادات الأداة
// ============================================

export const KEYWORD_CONFIG = {
  // الحدود
  MIN_KEYWORD_LENGTH: 2,
  MAX_KEYWORD_LENGTH: 100,
  MIN_SUGGESTIONS: 5,
  MAX_SUGGESTIONS: 100,
  DEFAULT_SUGGESTIONS: 30,

  // حدود الاقتراحات
  MAX_QUESTIONS: 20,
  MAX_LONG_TAIL: 30,
  MAX_RELATED: 20,

  // مهلة الطلبات
  FETCH_TIMEOUT: 10000, // 10 ثوان

  // مصادر الاقتراحات
  SUGGEST_SOURCES: [
    'google-autocomplete',
    'google-related',
    'generated',
  ] as const,
} as const;

// ============================================
// مستويات المنافسة
// ============================================

export type CompetitionLevel = 'unknown' | 'very-easy' | 'easy' | 'medium' | 'hard';

export interface CompetitionTier {
  id: CompetitionLevel;
  label: string;
  labelEn: string;
  color: string;
  hex: string;
  minScore: number;
  maxScore: number;
  icon: string;
  description: string;
}

export const COMPETITION_TIERS: CompetitionTier[] = [
  {
    id: 'unknown',
    label: 'لا بيانات',
    labelEn: 'No data',
    color: 'gray',
    hex: '#9ca3af',
    minScore: -1,
    maxScore: -1,
    icon: '❓',
    description: 'اقتراح فقط — لا تتوفر بيانات منافسة',
  },
  {
    id: 'very-easy',
    label: 'سهلة جداً',
    labelEn: 'Very Easy',
    color: 'green',
    hex: '#22c55e',
    minScore: 0,
    maxScore: 25,
    icon: '🟢',
    description: 'فرصة ذهبية — منافسة منخفضة جداً',
  },
  {
    id: 'easy',
    label: 'سهلة',
    labelEn: 'Easy',
    color: 'yellow',
    hex: '#eab308',
    minScore: 26,
    maxScore: 50,
    icon: '🟡',
    description: 'مناسبة للمواقع الجديدة والمبتدئين',
  },
  {
    id: 'medium',
    label: 'متوسطة',
    labelEn: 'Medium',
    color: 'orange',
    hex: '#f97316',
    minScore: 51,
    maxScore: 75,
    icon: '🟠',
    description: 'تحتاج جهداً ومحتوى قوياً',
  },
  {
    id: 'hard',
    label: 'عالية',
    labelEn: 'Hard',
    color: 'red',
    hex: '#ef4444',
    minScore: 76,
    maxScore: 100,
    icon: '🔴',
    description: 'للمواقع القوية فقط',
  },
];

// ============================================
// نية البحث
// ============================================

export type SearchIntent = 'informational' | 'commercial' | 'transactional' | 'navigational' | 'unknown';

export interface IntentInfo {
  id: SearchIntent;
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  description: string;
}

export const INTENT_TYPES: IntentInfo[] = [
  {
    id: 'informational',
    label: 'معلوماتي',
    labelEn: 'Informational',
    icon: '📚',
    color: 'blue',
    description: 'يبحث عن معرفة أو شرح',
  },
  {
    id: 'commercial',
    label: 'تجاري',
    labelEn: 'Commercial',
    icon: '🛒',
    color: 'purple',
    description: 'يبحث قبل الشراء أو المقارنة',
  },
  {
    id: 'transactional',
    label: 'شرائي',
    labelEn: 'Transactional',
    icon: '💳',
    color: 'green',
    description: 'يبحث عن شراء أو تحميل',
  },
  {
    id: 'navigational',
    label: 'ملاحي',
    labelEn: 'Navigational',
    icon: '🧭',
    color: 'amber',
    description: 'يبحث عن موقع أو علامة تجارية',
  },
  {
    id: 'unknown',
    label: 'غير محدد',
    labelEn: 'Unknown',
    icon: '❓',
    color: 'gray',
    description: 'نية غير واضحة',
  },
];

// ============================================
// تصنيفات الفرص
// ============================================

export type OpportunityType = 'new-site' | 'commercial' | 'content' | 'general';

export interface OpportunityInfo {
  id: OpportunityType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const OPPORTUNITY_TYPES: OpportunityInfo[] = [
  {
    id: 'new-site',
    label: 'مناسبة للمواقع الجديدة',
    icon: '🌱',
    color: 'green',
    description: 'عبارات محددة ومرتبطة بتخصص الموقع',
  },
  {
    id: 'commercial',
    label: 'فرصة تجارية',
    icon: '💰',
    color: 'purple',
    description: 'كلمات تدل على الرغبة في شراء منتج أو خدمة',
  },
  {
    id: 'content',
    label: 'فرصة محتوى',
    icon: '📝',
    color: 'blue',
    description: 'أسئلة وشروحات ومقارنات تصلح للمقالات',
  },
  {
    id: 'general',
    label: 'فرصة عامة',
    icon: '🎯',
    color: 'gray',
    description: 'كلمات ذات صلة عامة',
  },
];

// ============================================
// مصادر البيانات
// ============================================

export type DataSource = 'actual' | 'trends' | 'estimated' | 'none';

export interface DataSourceInfo {
  id: DataSource;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const DATA_SOURCES: DataSourceInfo[] = [
  {
    id: 'actual',
    label: 'بيانات فعلية',
    icon: '✅',
    color: 'green',
    description: 'من Google Autocomplete — اقتراحات حقيقية',
  },
  {
    id: 'trends',
    label: 'اتجاهات',
    icon: '📈',
    color: 'blue',
    description: 'مؤشر اهتمام نسبي من Google Trends',
  },
  {
    id: 'estimated',
    label: 'تقديرية',
    icon: '⚠️',
    color: 'yellow',
    description: 'بناءً على منهج معلن — للاستخدام المرجعي فقط',
  },
  {
    id: 'none',
    label: 'لا بيانات',
    icon: '❌',
    color: 'gray',
    description: 'اقتراح مولّد آلياً — يحتاج تحقق',
  },
];

// ============================================
// الرسائل الموحدة
// ============================================

export const KEYWORD_MESSAGES = {
  // الحالة
  LOADING: 'جاري توليد الكلمات المفتاحية...',
  LOADING_SUGGESTIONS: 'جاري جلب الاقتراحات من Google...',
  LOADING_ANALYSIS: 'جاري تحليل النية والمنافسة...',
  SUCCESS: 'تم توليد الكلمات بنجاح!',
  EMPTY_INPUT: 'الرجاء إدخال كلمة مفتاحية أولاً.',
  TOO_SHORT: 'الكلمة قصيرة جداً (الحد: حرفان).',
  TOO_LONG: 'الكلمة طويلة جداً (الحد: 100 حرف).',
  NO_RESULTS: 'لم نتمكن من جلب اقتراحات. جرب كلمة أخرى.',
  ERROR_GENERIC: 'حدث خطأ. حاول مرة أخرى.',
  ERROR_NETWORK: 'فشل الاتصال بالإنترنت. تحقق من اتصالك.',
  ERROR_TIMEOUT: 'انتهت مهلة الطلب. حاول مرة أخرى.',
  COPY_SUCCESS: 'تم النسخ!',
  EXPORT_SUCCESS: 'تم التصدير بنجاح!',

  // تنبيهات
  DISCLAIMER_COMPETITION: 'مؤشر المنافسة تقديري بناءً على عوامل واضحة. للدقة الكاملة استخدم Ahrefs أو Semrush.',
  DISCLAIMER_DATA: 'الاقتراحات من Google Autocomplete. التحليل محلي في متصفحك.',
} as const;

// ============================================
// تصنيفات طول الكلمة
// ============================================

export const KEYWORD_LENGTH_TYPES = {
  SHORT: { min: 1, max: 1, label: 'قصيرة', icon: '⚡' },
  MEDIUM: { min: 2, max: 3, label: 'متوسطة', icon: '📝' },
  LONG: { min: 4, max: 6, label: 'طويلة', icon: '📚' },
  VERY_LONG: { min: 7, max: 100, label: 'طويلة جداً', icon: '📖' },
} as const;

// ============================================
// إعدادات مؤشر المنافسة
// ============================================

export const COMPETITION_WEIGHTS = {
  KEYWORD_LENGTH: 0.30,    // طول الكلمة
  WORD_COUNT: 0.20,        // عدد الكلمات
  INTENT: 0.20,            // نية البحث
  GOOGLE_PRESENCE: 0.30,   // حضور الكلمة في نتائج Google
} as const;
