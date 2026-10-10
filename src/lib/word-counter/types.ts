/**
 * أنواع البيانات لأداة عدّاد الكلمات
 */

import type { ToolMode, PlatformLimit } from './constants';

// ============================================
// الإحصائيات الأساسية
// ============================================

export interface TextStats {
  // العدّ
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  
  // متوسطات
  avgWordsPerSentence: number;
  avgWordsPerParagraph: number;
  avgCharsPerWord: number;
  
  // أوقات
  readingTime: number; // بالدقائق
  writingTime: number;
  editingTime: number;
}

// ============================================
// تكرار الكلمات
// ============================================

export interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
  root?: string; // الجذر العربي
}

export interface KeywordDensity {
  word: string;
  count: number;
  percentage: number;
  density: number; // نسبة مئوية من إجمالي الكلمات
  isStopWord: boolean;
}

// ============================================
// مؤشر القراءة
// ============================================

export interface ReadabilityScore {
  score: number; // 0-100
  level: 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard';
  avgSentenceLength: number;
  avgWordLength: number;
  longWordsRatio: number;
  diacriticsRatio: number;
  breakdown: {
    factor: string;
    weight: number;
    score: number;
    contribution: number;
  }[];
}

// ============================================
// الأخطاء الشائعة
// ============================================

export interface DetectedMistake {
  wrong: string;
  correct: string;
  reason: string;
  position: number;
  context: string; // النص حول الخطأ
}

// ============================================
// اقتراحات الكتابة
// ============================================

export interface WritingSuggestion {
  type: 'long-sentence' | 'long-paragraph' | 'repetition' | 'mistake' | 'style' | 'structure';
  severity: 'info' | 'warning' | 'error';
  message: string;
  position?: number;
  suggestion?: string;
  relatedText?: string;
}

// ============================================
// تحليل المشاعر
// ============================================

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface SentimentAnalysis {
  overall: SentimentType;
  score: number; // -100 إلى 100
  positive: number;
  neutral: number;
  negative: number;
  positiveWords: string[];
  negativeWords: string[];
}

// ============================================
// هدف الكتابة
// ============================================

export interface WritingGoal {
  target: number;
  unit: 'word' | 'char';
  current: number;
  percentage: number;
  remaining: number;
  isAchieved: boolean;
}

// ============================================
// مقارنة النصوص
// ============================================

export interface TextComparison {
  added: string[];
  removed: string[];
  unchanged: string[];
  addedCount: number;
  removedCount: number;
  wordCountDiff: number;
  charCountDiff: number;
  paragraphCountDiff: number;
}

export interface DiffChunk {
  type: 'add' | 'remove' | 'equal';
  text: string;
  position: number;
}

// ============================================
// النص الكامل (التحليل)
// ============================================

export interface TextAnalysis {
  stats: TextStats;
  readability: ReadabilityScore;
  sentiment: SentimentAnalysis;
  keywords: KeywordDensity[];
  topWords: WordFrequency[];
  uniqueWords: number;
  mistakes: DetectedMistake[];
  suggestions: WritingSuggestion[];
  goal: WritingGoal | null;
  platformLimits: PlatformLimitStatus[];
}

export interface PlatformLimitStatus {
  platform: PlatformLimit;
  current: number;
  status: 'safe' | 'near' | 'over';
  percentage: number;
}

// ============================================
// حالة الأداة
// ============================================

export type ToolStatus = 'idle' | 'typing' | 'analyzing' | 'success' | 'error';

export interface WordCounterState {
  // الحالة
  status: ToolStatus;
  text: string;
  mode: ToolMode;
  
  // التحليل
  analysis: TextAnalysis | null;
  
  // الأهداف
  goal: WritingGoal | null;
  
  // المقارنة
  comparison: TextComparison | null;
  comparisonText: string;
  
  // الحفظ
  lastSaved: Date | null;
  hasDraft: boolean;
  
  // UI
  showDetails: boolean;
  activeTab: 'stats' | 'keywords' | 'suggestions' | 'compare' | 'export';
  
  // الخطأ
  error: string | null;
}

// ============================================
// قوالب جاهزة
// ============================================

export interface TextTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  minWords: number;
  maxWords: number;
  mode: ToolMode;
}

export const TEXT_TEMPLATES: TextTemplate[] = [
  {
    id: 'blog-post',
    name: 'مقال مدونة',
    icon: '📰',
    description: '800-1500 كلمة — للقراءة السريعة',
    minWords: 800,
    maxWords: 1500,
    mode: 'general',
  },
  {
    id: 'seo-article',
    name: 'مقال SEO',
    icon: '🎯',
    description: '1500-2500 كلمة — لمحركات البحث',
    minWords: 1500,
    maxWords: 2500,
    mode: 'seo',
  },
  {
    id: 'news',
    name: 'خبر',
    icon: '📢',
    description: '300-600 كلمة — للمحتوى الإخباري',
    minWords: 300,
    maxWords: 600,
    mode: 'general',
  },
  {
    id: 'product',
    name: 'وصف منتج',
    icon: '🛒',
    description: '100-300 كلمة — للمتاجر',
    minWords: 100,
    maxWords: 300,
    mode: 'seo',
  },
  {
    id: 'linkedin-post',
    name: 'منشور LinkedIn',
    icon: '💼',
    description: '1300-2000 كلمة — للمحتوى المهني',
    minWords: 1300,
    maxWords: 2000,
    mode: 'social',
  },
  {
    id: 'academic',
    name: 'بحث أكاديمي',
    icon: '🎓',
    description: '2000-5000 كلمة — للبحوث',
    minWords: 2000,
    maxWords: 5000,
    mode: 'academic',
  },
];



// ============================================
// التصدير
// ============================================

export type ExportFormat = 'markdown' | 'csv' | 'json' | 'txt';

// ============================================
// إعدادات افتراضية
// ============================================

export const DEFAULT_STATE: WordCounterState = {
  status: 'idle',
  text: '',
  mode: 'general',
  analysis: null,
  goal: null,
  comparison: null,
  comparisonText: '',
  lastSaved: null,
  hasDraft: false,
  showDetails: false,
  activeTab: 'stats',
  error: null,
};
