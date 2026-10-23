/**
 * أنواع بيانات أداة Meta Tags Toolkit — Intooly
 * أداة إنشاء وفحص وسوم SEO الأساسية.
 *
 * تنبيه:
 * - الأطوال الموصى بها إرشادية، وليست ضمانًا لظهور الوسوم كاملة في Google.
 * - المعاينة داخل الأداة تقديرية ولا تعكس بدقة ما ستعرضه كل منصة.
 */

// ============================================
// حالة الأداة الرئيسية
// ============================================

export interface MetaTagsState {
  title: string;
  description: string;
  url: string;
  robots: RobotsOptions;
  ogImage: string;
  ogType: OgType;
  twitterCard: TwitterCardType;
  twitterSite: string;
  twitterCreator: string;
  ogSiteName: string;
  ogLocale: string;
}

export interface RobotsOptions {
  index: boolean;
  follow: boolean;
  snippet: SnippetOption;
  imagePreview: ImagePreviewOption;
  noarchive: boolean;
}

export type SnippetOption = 'max' | 'limited' | 'none';
export type ImagePreviewOption = 'large' | 'standard' | 'none';

export type OgType =
  | 'website'
  | 'article'
  | 'product'
  | 'profile'
  | 'video.other';

export type TwitterCardType = 'summary' | 'summary_large_image';

// ============================================
// التبويبات
// ============================================

export type TabId =
  | 'meta'
  | 'length'
  | 'google'
  | 'social'
  | 'html'
  | 'export';

export interface TabDefinition {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}

// ============================================
// نتائج الفحص
// ============================================

export type LengthStatus = 'too-short' | 'good' | 'too-long' | 'empty';

export interface LengthCheckResult {
  status: LengthStatus;
  charCount: number;
  pixelEstimate: number;
  message: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
}

// ============================================
// المعاينة
// ============================================

export interface GooglePreviewProps {
  title: string;
  description: string;
  url: string;
  mode: 'desktop' | 'mobile';
}

export interface SocialPreviewProps {
  title: string;
  description: string;
  url: string;
  image: string;
  ogType: OgType;
  twitterCard: TwitterCardType;
  twitterSite: string;
  platform: 'facebook' | 'twitter' | 'linkedin';
}

// ============================================
// المخرجات (HTML / JSON)
// ============================================

export interface GeneratedMetaTags {
  titleTag: string;
  descriptionTag: string;
  robotsTag: string;
  canonicalTag: string;
  openGraphTags: string;
  twitterCardTags: string;
  fullHtml: string;
}

export interface ExportData {
  title: string;
  description: string;
  url: string;
  robots: string;
  ogImage: string;
  ogType: OgType;
  twitterCard: TwitterCardType;
  twitterSite: string;
  generatedAt: string;
  disclaimer: string;
}

// ============================================
// الألوان
// ============================================

export interface LengthColorMap {
  green: string;
  yellow: string;
  red: string;
  gray: string;
}

// ============================================
// الحفظ التلقائي
// ============================================

export interface AutoSaveSnapshot {
  state: MetaTagsState;
  savedAt: string;
  version: number;
}

// ============================================
// الإعدادات الافتراضية
// ============================================

export const DEFAULT_META_STATE: MetaTagsState = {
  title: '',
  description: '',
  url: '',
  robots: {
    index: true,
    follow: true,
    snippet: 'max',
    imagePreview: 'large',
    noarchive: false,
  },
  ogImage: '',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  twitterCreator: '',
  ogSiteName: '',
  ogLocale: 'ar_SA',
};
