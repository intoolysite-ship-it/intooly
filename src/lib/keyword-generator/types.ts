/**
 * أنواع البيانات لمولّد الكلمات المفتاحية
 */

import type {
  CountryCode,
  CompetitionLevel,
  SearchIntent,
  OpportunityType,
  DataSource,
} from './constants';

// ============================================
// المدخلات
// ============================================

export interface KeywordInput {
  keyword: string;
  country: CountryCode;
  language: 'ar' | 'en' | 'all';
  maxResults: number;
  includeQuestions: boolean;
  includeLongTail: boolean;
  includeRelated: boolean;
}

// ============================================
// الكلمة المفتاحية (النتيجة)
// ============================================

export interface Keyword {
  id: string;
  text: string;
  country: CountryCode;
  language: 'ar' | 'en';
  source: DataSource;
  
  // التحليل
  wordCount: number;
  characterCount: number;
  lengthType: 'short' | 'medium' | 'long' | 'very-long';
  
  // النية
  intent: SearchIntent;
  intentConfidence: number; // 0-100
  
  // المنافسة
  competitionScore: number; // 0-100 (-1 = لا بيانات)
  competitionLevel: CompetitionLevel;
  competitionReason?: CompetitionReason;
  
  // الفرصة
  opportunityType: OpportunityType;
  relevanceScore: number; // 0-100
  
  // البيانات
  hasActualData: boolean;
  dataSource: DataSource;
  
  // كثافة الطلب (من ترتيب Google) — 0-100
  trendScore?: number;
  
  // الوقت
  createdAt: Date;
}

export interface CompetitionReason {
  keywordLength: number;
  wordCount: number;
  intent: SearchIntent;
  googlePresence: number;
  breakdown: {
    factor: string;
    weight: number;
    score: number;
    contribution: number;
  }[];
}

// ============================================
// مجموعة الكلمات (Cluster)
// ============================================

export interface KeywordCluster {
  id: string;
  title: string;
  description: string;
  keywords: Keyword[];
  suggestedPageType: 'single-page' | 'multiple-pages' | 'content-hub';
  suggestedPageTypeReason: string;
  totalKeywords: number;
  avgCompetition: number;
  dominantIntent: SearchIntent;
}

// ============================================
// خطة المحتوى
// ============================================

export interface ContentPlan {
  title: string;
  metaDescription: string;
  h1: string;
  h2: string[];
  faq: FAQItem[];
  articleOutline: ArticleSection[];
  internalLinks: InternalLink[];
  targetKeywords: string[];
  estimatedWordCount: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ArticleSection {
  heading: string;
  points: string[];
  keywords: string[];
}

export interface InternalLink {
  anchorText: string;
  targetPage: string;
  reason: string;
}

// ============================================
// المقارنة بين الدول
// ============================================

export interface CountryComparison {
  keyword: string;
  countries: {
    code: CountryCode;
    name: string;
    flag: string;
    suggestions: string[];
    localTerm: string;
    count: number;
  }[];
}

// ============================================
// الفلاتر
// ============================================

export interface KeywordFilters {
  intent?: SearchIntent[];
  competitionLevel?: CompetitionLevel[];
  opportunityType?: OpportunityType[];
  minWordCount?: number;
  maxWordCount?: number;
  searchQuery?: string;
}

// ============================================
// حالة الأداة
// ============================================

export type ToolStatus = 
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'empty';

export interface ToolState {
  status: ToolStatus;
  progress: number;
  message: string;
  input: KeywordInput;
  keywords: Keyword[];
  clusters: KeywordCluster[];
  contentPlan: ContentPlan | null;
  selectedCountry: CountryCode;
  filters: KeywordFilters;
  error: string | null;
}

// ============================================
// نتائج التحليل
// ============================================

export interface AnalysisResult {
  totalKeywords: number;
  averageCompetition: number;
  dominantIntent: SearchIntent;
  intentDistribution: Record<SearchIntent, number>;
  competitionDistribution: Record<CompetitionLevel, number>;
  opportunityDistribution: Record<OpportunityType, number>;
  topOpportunities: Keyword[];
}

// ============================================
// التصدير
// ============================================

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  includeAnalysis: boolean;
  includeContentPlan: boolean;
  filename?: string;
}

// ============================================
// API Responses
// ============================================

export interface SuggestResponse {
  suggestions: string[];
  source: DataSource;
  country: CountryCode;
  language: string;
}

export interface SuggestError {
  error: string;
  code: 'TIMEOUT' | 'NETWORK' | 'INVALID_INPUT' | 'UNKNOWN';
  retryable: boolean;
}

// ============================================
// اقتراحات مولّدة آلياً
// ============================================

export interface GeneratedSuggestion {
  text: string;
  type: 'question' | 'long-tail' | 'related' | 'comparison';
  confidence: number;
}

// ============================================
// إعدادات افتراضية
// ============================================

export const DEFAULT_INPUT: KeywordInput = {
  keyword: '',
  country: 'SA',
  language: 'ar',
  maxResults: 30,
  includeQuestions: true,
  includeLongTail: true,
  includeRelated: true,
};

export const DEFAULT_FILTERS: KeywordFilters = {
  searchQuery: '',
};
