/**
 * أنواع بيانات أداة SEO Checker — Intooly
 * تعريفات دقيقة للمشاكل والتقارير والحالات.
 */

// ============================================
// حالات الفحص
// ============================================

export type IssueStatus = 'pass' | 'warning' | 'error' | 'info';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'success';

export type IssueCategory =
  | 'meta'
  | 'headings'
  | 'images'
  | 'links'
  | 'social'
  | 'schema'
  | 'content'
  | 'technical';

// ============================================
// مشكلة واحدة
// ============================================

export interface SeoIssue {
  id: string;
  title: string;
  category: IssueCategory;
  status: IssueStatus;
  severity: IssueSeverity;
  details: string;
  recommendation?: string;
  value?: string;
  codeExample?: string;
  docUrl?: string;
}

// ============================================
// التقرير الكامل
// ============================================

export interface SeoReport {
  source: string;
  pageTitle: string;
  score: number;
  issues: SeoIssue[];
  totalChecks: number;
  passed: number;
  warnings: number;
  errors: number;
  infos: number;
  checkedAt: string;
  fetchInfo?: FetchInfo;
}

// ============================================
// معلومات جلب الرابط (Route Handler)
// ============================================

export interface FetchInfo {
  url: string;
  status: number;
  statusText: string;
  contentType: string;
  responseTimeMs: number;
  finalUrl: string;
  redirected: boolean;
}

export interface FetchResponse {
  success: boolean;
  html?: string;
  fetchInfo?: FetchInfo;
  error?: string;
  errorCode?: 'CORS' | 'TIMEOUT' | 'INVALID_URL' | 'NETWORK' | 'TOO_LARGE' | 'NOT_HTML';
}

// ============================================
// مدخلات المستخدم
// ============================================

export type InputMode = 'url' | 'html' | 'file';

export interface AnalysisInput {
  mode: InputMode;
  url?: string;
  html?: string;
  sourceName: string;
}

// ============================================
// خيارات الفحص
// ============================================

export interface AnalysisOptions {
  checkLinks?: boolean;
  checkImages?: boolean;
  checkSocial?: boolean;
  checkSchema?: boolean;
  checkContent?: boolean;
  checkTechnical?: boolean;
}

// ============================================
// تصنيفات (للعرض)
// ============================================

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  meta: 'البيانات الأساسية',
  headings: 'العناوين',
  images: 'الصور',
  links: 'الروابط',
  social: 'المشاركة الاجتماعية',
  schema: 'البيانات المنظمة',
  content: 'المحتوى',
  technical: 'التقنيات',
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  pass: 'اجتاز',
  warning: 'تحذير',
  error: 'خطأ',
  info: 'معلومة',
};

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
  critical: 'حرج',
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
  success: 'جيد',
};

// ============================================
// إعدادات افتراضية
// ============================================

export const DEFAULT_OPTIONS: AnalysisOptions = {
  checkLinks: true,
  checkImages: true,
  checkSocial: true,
  checkSchema: true,
  checkContent: true,
  checkTechnical: true,
};
