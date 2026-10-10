/**
 * مولّد الكلمات المفتاحية
 * جلب الاقتراحات الفعلية + التوليد الذكي
 */

import { 
  KEYWORD_CONFIG, 
  COUNTRIES,
  type CountryCode,
  type DataSource,
} from './constants';
import type { 
  SuggestResponse, 
  GeneratedSuggestion,
} from './types';
import {
  normalizeArabic,
  removeDuplicates,
  filterSuggestions,
  isQuestion,
  isComparison,
} from './arabicAnalyzer';

// ============================================
// 1. جلب الاقتراحات من Google Autocomplete
// ============================================

/**
 * جلب الاقتراحات من Google Suggest API
 */
/**
 * جلب الاقتراحات من Google Suggest عبر 3 بروكسيات متعددة
 */
export async function fetchGoogleSuggestions(
  keyword: string,
  country: CountryCode,
  language: string
): Promise<SuggestResponse> {
  const countryLower = country === 'ALL' ? 'us' : country.toLowerCase();
  
  // استخدام Cloudflare Worker
  const workerUrl = `https://intooly-suggest.intoolysite.workers.dev/?q=${encodeURIComponent(keyword)}&country=${countryLower}&hl=${language}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(workerUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    
    return {
      suggestions,
      source: 'actual' as DataSource,
      country,
      language,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw { error: 'انتهت مهلة الطلب', code: 'TIMEOUT', retryable: true };
    }
    
    throw { error: 'فشل الاتصال', code: 'NETWORK', retryable: true };
  }
}

export async function fetchExtendedSuggestions(
  keyword: string,
  country: CountryCode,
  language: string,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const allSuggestions: string[] = [];
  
  // 1. الاقتراحات الأساسية
  try {
    const base = await fetchGoogleSuggestions(keyword, country, language);
    allSuggestions.push(...base.suggestions);
    if (onProgress) onProgress(50);
  } catch (e) {
    console.warn('فشل جلب الاقتراحات الأساسية:', e);
  }
  
  // 2. اقتراحات "كيف" (لزيادة التنوع)
  if (allSuggestions.length < 10) {
    try {
      const howTo = await fetchGoogleSuggestions(`${keyword} كيف`, country, language);
      allSuggestions.push(...howTo.suggestions);
      if (onProgress) onProgress(80);
    } catch (e) {
      console.warn('فشل جلب اقتراحات "كيف":', e);
    }
  }
  
  return removeDuplicates(allSuggestions);
}

// ============================================
// 2. توليد الاقتراحات المولّدة آلياً
// ============================================

/**
 * قوالب الأسئلة العربية
 */
const QUESTION_TEMPLATES = [
  'كيف {keyword}',
  'ما هو {keyword}',
  'ما هي {keyword}',
  'لماذا {keyword}',
  'متى {keyword}',
  'أين {keyword}',
  'ما أفضل {keyword}',
  'كيفية {keyword}',
  'طريقة {keyword}',
  'شرح {keyword}',
  'معنى {keyword}',
  'تعريف {keyword}',
];

/**
 * قوالب المقارنات
 */
const COMPARISON_TEMPLATES = [
  '{keyword} vs',
  '{keyword} ضد',
  'الفرق بين {keyword}',
  '{keyword} مقارنة',
  'أفضل من {keyword}',
  '{keyword} بدائل',
  '{keyword} مقابل',
];

/**
 * قوالب العبارات الطويلة
 */
const LONG_TAIL_TEMPLATES = [
  '{keyword} للمبتدئين',
  '{keyword} خطوة بخطوة',
  '{keyword} بالعربي',
  '{keyword} 2026',
  '{keyword} مجانا',
  '{keyword} مجاناً',
  '{keyword} بدون تسجيل',
  '{keyword} اونلاين',
  '{keyword} أونلاين',
  '{keyword} عبر الإنترنت',
  '{keyword} في السعودية',
  '{keyword} في مصر',
  '{keyword} في الإمارات',
  '{keyword} للمبتدئين بالعربي',
  '{keyword} دليل شامل',
  '{keyword} أفضل طريقة',
];

/**
 * قوالب الكلمات المرتبطة
 */
const RELATED_TEMPLATES = [
  '{keyword}',
  'أفضل {keyword}',
  '{keyword} مجاني',
  '{keyword} سهل',
  '{keyword} سريع',
  '{keyword} احترافي',
  '{keyword} 2026',
];

/**
 * توليد اقتراحات مولّدة آلياً
 */
export function generateSuggestions(
  keyword: string,
  includeQuestions: boolean = true,
  includeLongTail: boolean = true,
  includeRelated: boolean = true
): GeneratedSuggestion[] {
  const suggestions: GeneratedSuggestion[] = [];
  const trimmedKeyword = keyword.trim();
  
  if (!trimmedKeyword) return suggestions;
  
  // توليد الأسئلة
  if (includeQuestions) {
    for (const template of QUESTION_TEMPLATES) {
      const text = template.replace('{keyword}', trimmedKeyword);
      suggestions.push({
        text,
        type: 'question',
        confidence: 80,
      });
    }
    
    // مقارنات
    for (const template of COMPARISON_TEMPLATES) {
      const text = template.replace('{keyword}', trimmedKeyword);
      suggestions.push({
        text,
        type: 'comparison',
        confidence: 75,
      });
    }
  }
  
  // توليد العبارات الطويلة
  if (includeLongTail) {
    for (const template of LONG_TAIL_TEMPLATES) {
      const text = template.replace('{keyword}', trimmedKeyword);
      suggestions.push({
        text,
        type: 'long-tail',
        confidence: 70,
      });
    }
  }
  
  // توليد الكلمات المرتبطة
  if (includeRelated) {
    for (const template of RELATED_TEMPLATES) {
      const text = template.replace('{keyword}', trimmedKeyword);
      suggestions.push({
        text,
        type: 'related',
        confidence: 60,
      });
    }
  }
  
  // إزالة التكرار
  const seen = new Set<string>();
  const unique: GeneratedSuggestion[] = [];
  
  for (const s of suggestions) {
    const key = normalizeArabic(s.text);
    if (!seen.has(key) && s.text !== trimmedKeyword) {
      seen.add(key);
      unique.push(s);
    }
  }
  
  return unique;
}

// ============================================
// 3. دمج الاقتراحات الفعلية والمولّدة
// ============================================

export interface CombinedSuggestion {
  text: string;
  source: DataSource;
  type: 'actual' | 'question' | 'long-tail' | 'related' | 'comparison';
  confidence: number;
}

/**
 * دمج الاقتراحات الفعلية من Google مع المولّدة آلياً
 */
export function combineSuggestions(
  keyword: string,
  googleSuggestions: string[],
  generated: GeneratedSuggestion[]
): CombinedSuggestion[] {
  const combined: CombinedSuggestion[] = [];
  const seen = new Set<string>();
  
  // 1. إضافة الاقتراحات الفعلية (أولوية عالية)
  for (const suggestion of googleSuggestions) {
    const key = normalizeArabic(suggestion);
    if (!seen.has(key)) {
      seen.add(key);
      combined.push({
        text: suggestion,
        source: 'actual' as DataSource,
        type: 'actual',
        confidence: 100,
      });
    }
  }
  
  // 2. إضافة الاقتراحات المولّدة
  for (const gen of generated) {
    const key = normalizeArabic(gen.text);
    if (!seen.has(key)) {
      seen.add(key);
      combined.push({
        text: gen.text,
        source: 'none' as DataSource,
        type: gen.type,
        confidence: gen.confidence,
      });
    }
  }
  
  return combined;
}



// ============================================
// حساب مؤشر كثافة الطلب من ترتيب Google
// ============================================

/**
 * حساب مؤشر كثافة الطلب بناءً على ترتيب الكلمة في اقتراحات Google
 * الاقتراحات الأولى = الأكثر بحثاً
 */
export function calculateTrendScore(
  keyword: string,
  googleSuggestions: string[]
): number {
  if (googleSuggestions.length === 0) return 0;
  
  const normalized = normalizeArabic(keyword);
  const index = googleSuggestions.findIndex(
    s => normalizeArabic(s) === normalized
  );
  
  if (index === -1) {
    // الكلمة ليست في اقتراحات Google (مولّدة)
    return 0;
  }
  
  // الترتيب يبدأ من 0
  // 0-2 → مرتفع جداً (90-100)
  // 3-6 → مرتفع (70-89)
  // 7-11 → متوسط (50-69)
  // 12+ → منخفض (30-49)
  
  if (index <= 2) return 95 - index * 2;      // 95, 93, 91
  if (index <= 6) return 85 - (index - 3) * 3; // 85, 82, 79, 76
  if (index <= 11) return 65 - (index - 7) * 3; // 65, 62, 59, 56, 53
  return Math.max(30, 50 - (index - 12) * 2);   // 50, 48, 46...
}


// ============================================
// 4. الدالة الرئيسية — توليد الكلمات
// ============================================

import { 
  LOCAL_VOCABULARY,
  COMPETITION_TIERS,
  INTENT_TYPES,
  OPPORTUNITY_TYPES,
  COMPETITION_WEIGHTS,
  type CompetitionLevel,
  type SearchIntent,
  type OpportunityType,
} from './constants';
import type { 
  Keyword, 
  KeywordInput,
  CompetitionReason,
} from './types';
import { 
  classifyIntent, 
  getWordCount, 
  getLengthType,
} from './arabicAnalyzer';

/**
 * الحصول على الكلمة المحلية حسب الدولة
 */
export function getLocalTerm(keyword: string, country: CountryCode): string {
  const normalized = normalizeArabic(keyword);
  
  for (const [standard, translations] of Object.entries(LOCAL_VOCABULARY)) {
    if (normalizeArabic(standard) === normalized) {
      return translations[country] || keyword;
    }
  }
  
  return keyword;
}

/**
 * توليد الكلمات المفتاحية الكاملة
 */
export async function generateKeywords(
  input: KeywordInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Keyword[]> {
  const { keyword, country, maxResults, includeQuestions, includeLongTail, includeRelated } = input;
  const language = input.language === 'all' ? 'ar' : input.language;
  
  if (!keyword || keyword.trim().length < 2) {
    throw new Error('الكلمة قصيرة جداً');
  }
  
  // 1. جلب الاقتراحات الفعلية
  if (onProgress) onProgress(10, 'جاري جلب الاقتراحات من Google...');
  
  let googleSuggestions: string[] = [];
  try {
    googleSuggestions = await fetchExtendedSuggestions(
      keyword,
      country,
      language,
      (p) => onProgress && onProgress(10 + p * 0.4, 'جاري جلب الاقتراحات...')
    );
  } catch (e) {
    console.warn('فشل جلب الاقتراحات:', e);
  }
  
  // 2. توليد الاقتراحات المولّدة
  if (onProgress) onProgress(55, 'جاري توليد اقتراحات إضافية...');
  
  const generated = generateSuggestions(
    keyword,
    includeQuestions,
    includeLongTail,
    includeRelated
  );
  
  // 3. دمج الاقتراحات
  if (onProgress) onProgress(70, 'جاري دمج الاقتراحات...');
  
  const combined = combineSuggestions(keyword, googleSuggestions, generated);
  
  // 4. تصفية وترتيب
  const filtered = removeDuplicates(
    combined.map(c => c.text)
  ).slice(0, maxResults);
  
  // 5. تحليل كل كلمة
  if (onProgress) onProgress(80, 'جاري تحليل النية والمنافسة...');
  
  const keywords: Keyword[] = filtered.map((text) => {
    const sourceItem = combined.find(c => c.text === text);
    return analyzeKeyword(
      text,
      country,
      language,
      sourceItem?.source || 'none',
      sourceItem?.type || 'related',
      googleSuggestions
    );
  });
  
  if (onProgress) onProgress(100, 'اكتمل!');
  
  return keywords;
}

// ============================================
// 5. تحليل الكلمة الواحدة
// ============================================

/**
 * تحليل كلمة مفتاحية واحدة
 */
export function analyzeKeyword(
  text: string,
  country: CountryCode,
  language: 'ar' | 'en',
  source: DataSource,
  type: 'actual' | 'question' | 'long-tail' | 'related' | 'comparison',
  googleSuggestions: string[] = []
): Keyword {
  const wordCount = getWordCount(text);
  const characterCount = text.length;
  const lengthType = getLengthType(wordCount);
  
  // تحليل النية
  const { intent, confidence: intentConfidence } = classifyIntent(text);
  
  // حساب المنافسة
  const { score: competitionScore, reason: competitionReason } = calculateCompetition(
    text,
    wordCount,
    intent,
    source
  );
  
  // تحديد مستوى المنافسة
  const competitionLevel = getCompetitionLevel(competitionScore);
  
  // تحديد تصنيف الفرصة
  const opportunityType = getOpportunityType(intent, wordCount, competitionLevel);
  
  // حساب الصلة
  const relevanceScore = type === 'actual' ? 100 : type === 'question' ? 80 : 60;
  
  // حساب كثافة الطلب من ترتيب Google
  const trendScore = calculateTrendScore(text, googleSuggestions);
  
  return {
    id: `kw-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    text,
    country,
    language,
    source,
    wordCount,
    characterCount,
    lengthType,
    intent,
    intentConfidence,
    competitionScore,
    competitionLevel,
    competitionReason,
    opportunityType,
    relevanceScore,
    hasActualData: source === 'actual',
    dataSource: source,
    trendScore,
    createdAt: new Date(),
  };
}

// ============================================
// 6. حساب المنافسة
// ============================================

function calculateCompetition(
  text: string,
  wordCount: number,
  intent: SearchIntent,
  source: DataSource
): { score: number; reason: CompetitionReason } {
  // للكلمات المولّدة: نحسب المؤشر تقديرياً (مع توضيح ذلك)
  // للكلمات الفعلية: نحسب المؤشر بناءً على العوامل
  
  // حساب العوامل
  // 1. طول الكلمة (كلمات أطول = منافسة أقل)
  const lengthScore = Math.max(0, 100 - (wordCount - 1) * 15);
  
  // 2. عدد الكلمات
  const wordCountScore = Math.max(0, 100 - (wordCount - 1) * 20);
  
  // 3. نية البحث
  const intentScore = 
    intent === 'informational' ? 30 :
    intent === 'navigational' ? 40 :
    intent === 'commercial' ? 65 :
    intent === 'transactional' ? 80 : 50;
  
  // 4. حضور الكلمة في Google (تقديري بناءً على طول الكلمة)
  const googlePresenceScore = Math.min(100, 50 + (wordCount - 1) * 10);
  
  // الحساب الموزون
  const totalScore = Math.round(
    lengthScore * COMPETITION_WEIGHTS.KEYWORD_LENGTH +
    wordCountScore * COMPETITION_WEIGHTS.WORD_COUNT +
    intentScore * COMPETITION_WEIGHTS.INTENT +
    googlePresenceScore * COMPETITION_WEIGHTS.GOOGLE_PRESENCE
  );
  
  const clampedScore = Math.max(0, Math.min(100, totalScore));
  
  return {
    score: clampedScore,
    reason: {
      keywordLength: lengthScore,
      wordCount: wordCountScore,
      intent,
      googlePresence: googlePresenceScore,
      breakdown: [
        { factor: 'طول الكلمة', weight: COMPETITION_WEIGHTS.KEYWORD_LENGTH, score: lengthScore, contribution: Math.round(lengthScore * COMPETITION_WEIGHTS.KEYWORD_LENGTH) },
        { factor: 'عدد الكلمات', weight: COMPETITION_WEIGHTS.WORD_COUNT, score: wordCountScore, contribution: Math.round(wordCountScore * COMPETITION_WEIGHTS.WORD_COUNT) },
        { factor: 'نية البحث', weight: COMPETITION_WEIGHTS.INTENT, score: intentScore, contribution: Math.round(intentScore * COMPETITION_WEIGHTS.INTENT) },
        { factor: 'حضور الكلمة', weight: COMPETITION_WEIGHTS.GOOGLE_PRESENCE, score: googlePresenceScore, contribution: Math.round(googlePresenceScore * COMPETITION_WEIGHTS.GOOGLE_PRESENCE) },
      ],
    },
  };
}

function getCompetitionLevel(score: number): CompetitionLevel {
  if (score < 0) return 'unknown';
  if (score <= 25) return 'very-easy';
  if (score <= 50) return 'easy';
  if (score <= 75) return 'medium';
  return 'hard';
}

// ============================================
// 7. تحديد تصنيف الفرصة
// ============================================

function getOpportunityType(
  intent: SearchIntent,
  wordCount: number,
  competitionLevel: CompetitionLevel
): OpportunityType {
  // كلمات طويلة + منافسة منخفضة = مناسبة للمواقع الجديدة
  if (wordCount >= 4 && (competitionLevel === 'very-easy' || competitionLevel === 'easy')) {
    return 'new-site';
  }
  
  // نية شرائية = فرصة تجارية
  if (intent === 'transactional' || intent === 'commercial') {
    return 'commercial';
  }
  
  // نية معلوماتية = فرصة محتوى
  if (intent === 'informational') {
    return 'content';
  }
  
  return 'general';
}
