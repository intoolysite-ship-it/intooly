
/**
 * مولّد الكلمات المفتاحية — Intooly
 * جلب اقتراحات Google Autocomplete وتوليد اقتراحات إضافية ملائمة.
 *
 * تنبيه:
 * - اقتراحات Google ليست بيانات حجم بحث.
 * - لا تتوفر درجة منافسة حقيقية من Google Autocomplete.
 * - الاقتراحات المولّدة آلياً ليست بيانات بحث فعلية.
 */

import {
  LOCAL_VOCABULARY,
  type CountryCode,
  type DataSource,
  type CompetitionLevel,
  type SearchIntent,
  type OpportunityType,
} from './constants';

import type {
  SuggestResponse,
  GeneratedSuggestion,
  Keyword,
  KeywordInput,
  CompetitionReason,
} from './types';

import {
  normalizeArabic,
  removeDuplicates,
  classifyIntent,
  getWordCount,
  getLengthType,
} from './arabicAnalyzer';

// ============================================
// 1. جلب الاقتراحات من Google Autocomplete
// ============================================

export async function fetchGoogleSuggestions(
  keyword: string,
  country: CountryCode,
  language: string
): Promise<SuggestResponse> {
  const countryLower = country === 'ALL' ? 'us' : country.toLowerCase();

  const workerUrl =
    `https://intooly-suggest.intoolysite.workers.dev/` +
    `?q=${encodeURIComponent(keyword)}` +
    `&country=${encodeURIComponent(countryLower)}` +
    `&hl=${encodeURIComponent(language)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(workerUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const suggestions: string[] = Array.isArray(data?.suggestions)
      ? data.suggestions.filter(
          (item: unknown): item is string =>
            typeof item === 'string' && item.trim().length > 0
        )
      : [];

    return {
      suggestions: removeDuplicates(suggestions),
      source: 'actual' as DataSource,
      country,
      language,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        error: 'انتهت مهلة الطلب',
        code: 'TIMEOUT',
        retryable: true,
      };
    }

    console.warn('تعذّر جلب اقتراحات Google:', error);

    throw {
      error: 'تعذّر الاتصال بخدمة الاقتراحات',
      code: 'NETWORK',
      retryable: true,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * جلب الاقتراحات الأساسية فقط.
 *
 * لا نضيف كلمة «كيف» إلى البحث تلقائياً عند قلة النتائج؛
 * لأن ذلك قد ينتج اقتراحات بعيدة عن نية المستخدم.
 */
export async function fetchExtendedSuggestions(
  keyword: string,
  country: CountryCode,
  language: string,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  try {
    const result = await fetchGoogleSuggestions(
      keyword,
      country,
      language
    );

    onProgress?.(100);

    return removeDuplicates(
      result.suggestions.filter(
        (suggestion) => suggestion.trim().length > 0
      )
    );
  } catch (error) {
    console.warn('فشل جلب الاقتراحات الأساسية:', error);
    throw error;
  }
}

// ============================================
// 2. تحديد طبيعة الكلمة المفتاحية
// ============================================

/**
 * استعلامات تتعلق غالباً بقوائم أو أفكار أو أسماء.
 * لا يناسبها عادةً توليد أسئلة مثل «أين» و«لماذا».
 */
function isListOrCreativeQuery(keyword: string): boolean {
  const value = normalizeArabic(keyword);

  const patterns = [
    /اسماء|اسماء|اسم\b/,
    /افكار|عبارات|كلمات|جمل|رسائل/,
    /تهنئه|تهاني|اقتباسات|حالات/,
    /وصفات|اكلات|حلويات|مشروبات/,
    /قصص|نكت|الغاز|ألغاز/,
    /بحرف|تبدأ بحرف|تنتهي بحرف/,
    /صور|خلفيات|تصاميم/,
  ];

  return patterns.some((pattern) => pattern.test(value));
}

/**
 * موضوعات تتعلق بأداة أو منتج أو خدمة رقمية.
 */
function isToolOrProductQuery(keyword: string): boolean {
  const value = normalizeArabic(keyword);

  const patterns = [
    /اداه|ادوات|مولد|منشئ|محرر|محول|ضاغط/,
    /برنامج|تطبيق|موقع|منصه|خدمه/,
    /حاسبه|حساب|تحويل|ضغط|تصغير|تكبير/,
    /pdf|jpg|png|svg|mp3|mp4|qr/,
    /ذكاء اصطناعي|ذكاء صناعي/,
    /افضل هاتف|لابتوب|كمبيوتر|كاميرا/,
  ];

  return patterns.some((pattern) => pattern.test(value));
}

/**
 * موضوعات يمكن أن تناسبها أسئلة تعليمية.
 */
function isLearningTopic(keyword: string): boolean {
  const value = normalizeArabic(keyword);

  const patterns = [
    /تعلم|تعليم|شرح|دراسه|دراسة/,
    /برمجه|برمجة|تسويق|تصميم|تحليل/,
    /سيو|seo|javascript|typescript|python|html|css/,
    /ذكاء اصطناعي|ذكاء صناعي|امن سيبراني/,
    /طريقه|كيفية|كيفيه|خطوات|دليل/,
    /ما هو|ما هي|معنى|مفهوم|تعريف/,
  ];

  return patterns.some((pattern) => pattern.test(value));
}

/**
 * تحديد ما إذا كان إلحاق عبارة زمنية أو وصفية مناسباً.
 */
function getApplicableLongTailTemplates(
  keyword: string
): string[] {
  const value = normalizeArabic(keyword);
  const templates: string[] = [];

  if (isListOrCreativeQuery(keyword)) {
    // عبارات ملائمة لاستعلامات القوائم والأسماء والأفكار.
    if (/اسماء|اسم\b/.test(value)) {
      templates.push(
        '{keyword} جديدة',
        '{keyword} نادرة',
        '{keyword} ومعانيها',
        '{keyword} للبنات',
        '{keyword} للأولاد'
      );
    } else if (/بحرف/.test(value)) {
      templates.push(
        '{keyword} جديدة',
        '{keyword} نادرة',
        '{keyword} ومعانيها'
      );
    } else {
      templates.push(
        '{keyword} جديدة',
        'أفضل {keyword}',
        '{keyword} متنوعة'
      );
    }

    return templates;
  }

  if (isToolOrProductQuery(keyword)) {
    templates.push(
      '{keyword} مجانا',
      '{keyword} بدون تسجيل',
      '{keyword} اونلاين',
      '{keyword} بالعربي',
      '{keyword} للكمبيوتر',
      '{keyword} للموبايل'
    );
  }

  if (isLearningTopic(keyword)) {
    templates.push(
      'شرح {keyword}',
      '{keyword} للمبتدئين',
      '{keyword} خطوة بخطوة',
      '{keyword} بالعربي',
      '{keyword} أمثلة'
    );
  }

  // لا نضيف عبارات عامة لمجرد زيادة عدد النتائج.
  return templates;
}

// ============================================
// 3. توليد الاقتراحات آلياً
// ============================================

export function generateSuggestions(
  keyword: string,
  includeQuestions: boolean = true,
  includeLongTail: boolean = true,
  includeRelated: boolean = true
): GeneratedSuggestion[] {
  const suggestions: GeneratedSuggestion[] = [];
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return suggestions;
  }

  const listQuery = isListOrCreativeQuery(trimmedKeyword);
  const toolQuery = isToolOrProductQuery(trimmedKeyword);
  const learningTopic = isLearningTopic(trimmedKeyword);

  // الأسئلة: نولدها فقط عندما يكون الموضوع مناسباً لها.
  if (includeQuestions && !listQuery) {
    if (toolQuery) {
      const questionTemplates = [
        'كيفية استخدام {keyword}',
        'طريقة استخدام {keyword}',
        'كيف يعمل {keyword}',
        'هل {keyword} مجاني',
      ];

      for (const template of questionTemplates) {
        suggestions.push({
          text: template.replace('{keyword}', trimmedKeyword),
          type: 'question',
          confidence: 70,
        });
      }
    } else if (learningTopic) {
      const questionTemplates = [
        'شرح {keyword}',
        'ما معنى {keyword}',
        'ما المقصود بـ {keyword}',
      ];

      for (const template of questionTemplates) {
        suggestions.push({
          text: template.replace('{keyword}', trimmedKeyword),
          type: 'question',
          confidence: 65,
        });
      }
    }
  }

  // العبارات الطويلة: نستخدم فقط القوالب الملائمة لطبيعة الاستعلام.
  if (includeLongTail) {
    const templates = getApplicableLongTailTemplates(trimmedKeyword);

    for (const template of templates) {
      suggestions.push({
        text: template.replace('{keyword}', trimmedKeyword),
        type: 'long-tail',
        confidence: 65,
      });
    }
  }

  // الكلمات المرتبطة: لا نضيف أوصافاً مثل «مجاني» و«احترافي»
  // إلى موضوع لا علاقة له بالأدوات أو المنتجات.
  if (includeRelated) {
    if (listQuery) {
      // استخدمنا قوالب خاصة بالقوائم أعلاه لتجنب التكرار.
    } else if (toolQuery) {
      const relatedTemplates = [
        'بدائل {keyword}',
        'أفضل بدائل {keyword}',
        '{keyword} للكمبيوتر',
        '{keyword} للموبايل',
      ];

      for (const template of relatedTemplates) {
        suggestions.push({
          text: template.replace('{keyword}', trimmedKeyword),
          type: 'related',
          confidence: 60,
        });
      }
    } else if (learningTopic) {
      const relatedTemplates = [
        'أنواع {keyword}',
        'أمثلة على {keyword}',
      ];

      for (const template of relatedTemplates) {
        suggestions.push({
          text: template.replace('{keyword}', trimmedKeyword),
          type: 'related',
          confidence: 55,
        });
      }
    }
  }

  // إزالة التكرارات مع استبعاد الكلمة الأصلية.
  const seen = new Set<string>();
  const unique: GeneratedSuggestion[] = [];

  for (const suggestion of suggestions) {
    const text = suggestion.text.trim();
    const normalized = normalizeArabic(text);

    if (
      !text ||
      normalized === normalizeArabic(trimmedKeyword) ||
      seen.has(normalized)
    ) {
      continue;
    }

    seen.add(normalized);

    unique.push({
      ...suggestion,
      text,
    });
  }

  return unique;
}

// ============================================
// 4. دمج الاقتراحات الفعلية والمولّدة
// ============================================

export interface CombinedSuggestion {
  text: string;
  source: DataSource;
  type: 'actual' | 'question' | 'long-tail' | 'related' | 'comparison';
  confidence: number;
}

export function combineSuggestions(
  keyword: string,
  googleSuggestions: string[],
  generated: GeneratedSuggestion[]
): CombinedSuggestion[] {
  const combined: CombinedSuggestion[] = [];
  const seen = new Set<string>();
  const normalizedKeyword = normalizeArabic(keyword);

  // اقتراحات Google أولاً، مع الحفاظ على ترتيب وصولها.
  for (const suggestion of googleSuggestions) {
    const text = suggestion.trim();
    const key = normalizeArabic(text);

    if (!text || key === normalizedKeyword || seen.has(key)) {
      continue;
    }

    seen.add(key);

    combined.push({
      text,
      source: 'actual' as DataSource,
      type: 'actual',
      confidence: 100,
    });
  }

  // الاقتراحات المولّدة تضاف بعد اقتراحات Google.
  for (const suggestion of generated) {
    const text = suggestion.text.trim();
    const key = normalizeArabic(text);

    if (!text || key === normalizedKeyword || seen.has(key)) {
      continue;
    }

    seen.add(key);

    combined.push({
      text,
      source: 'none' as DataSource,
      type: suggestion.type,
      confidence: suggestion.confidence,
    });
  }

  return combined;
}

// ============================================
// 5. مؤشر الطلب
// ============================================

/**
 * لا يمكن استنتاج حجم البحث أو مستوى الطلب من ترتيب
 * اقتراحات Google Autocomplete وحده.
 *
 * أبقينا الدالة للتوافق مع الاستدعاءات المحتملة،
 * وتعيد -1 للدلالة على عدم توفر بيانات موثوقة.
 */
export function calculateTrendScore(
  _keyword: string,
  _googleSuggestions: string[]
): number {
  return -1;
}

// ============================================
// 6. المصطلحات المحلية
// ============================================

export function getLocalTerm(
  keyword: string,
  country: CountryCode
): string {
  const normalized = normalizeArabic(keyword);

  for (const [standard, translations] of Object.entries(
    LOCAL_VOCABULARY
  )) {
    if (normalizeArabic(standard) === normalized) {
      return translations[country] || keyword;
    }
  }

  return keyword;
}

// ============================================
// 7. توليد الكلمات المفتاحية
// ============================================

export async function generateKeywords(
  input: KeywordInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Keyword[]> {
  const {
    keyword,
    country,
    maxResults,
    includeQuestions,
    includeLongTail,
    includeRelated,
  } = input;

  const language = input.language === 'all' ? 'ar' : input.language;

  if (!keyword || keyword.trim().length < 2) {
    throw new Error('الكلمة قصيرة جداً');
  }

  const cleanKeyword = keyword.trim();

  onProgress?.(10, 'جاري جلب الاقتراحات من Google...');

  let googleSuggestions: string[] = [];

  try {
    googleSuggestions = await fetchExtendedSuggestions(
      cleanKeyword,
      country,
      language,
      (progress) => {
        onProgress?.(
          10 + progress * 0.4,
          'جاري جلب الاقتراحات...'
        );
      }
    );
  } catch (error) {
    // نستمر في إنشاء اقتراحات ملائمة حتى لو تعذر الاتصال.
    console.warn('تعذر جلب اقتراحات Google:', error);
  }

  onProgress?.(55, 'جاري توليد اقتراحات إضافية...');

  const generated = generateSuggestions(
    cleanKeyword,
    includeQuestions,
    includeLongTail,
    includeRelated
  );

  onProgress?.(70, 'جاري دمج الاقتراحات...');

  const combined = combineSuggestions(
    cleanKeyword,
    googleSuggestions,
    generated
  );

  const safeMaxResults = Number.isFinite(maxResults)
    ? Math.max(0, Math.floor(maxResults))
    : combined.length;

  const filtered = removeDuplicates(
    combined.map((item) => item.text)
  ).slice(0, safeMaxResults);

  onProgress?.(80, 'جاري تحليل نية البحث...');

  const keywords: Keyword[] = filtered.map((text) => {
    const sourceItem = combined.find((item) => item.text === text);

    return analyzeKeyword(
      text,
      country,
      language,
      sourceItem?.source || 'none',
      sourceItem?.type || 'related',
      googleSuggestions
    );
  });

  onProgress?.(100, 'اكتمل!');

  return keywords;
}

// ============================================
// 8. تحليل الكلمة المفتاحية
// ============================================

export function analyzeKeyword(
  text: string,
  country: CountryCode,
  language: 'ar' | 'en',
  source: DataSource,
  type: 'actual' | 'question' | 'long-tail' | 'related' | 'comparison',
  _googleSuggestions: string[] = []
): Keyword {
  const wordCount = getWordCount(text);
  const characterCount = text.length;
  const lengthType = getLengthType(wordCount);

  const {
    intent,
    confidence: intentConfidence,
  } = classifyIntent(text);

  // لا توجد لدينا بيانات فعلية تكفي لتحديد المنافسة.
  const competitionScore = -1;
  const competitionReason: CompetitionReason | undefined = undefined;
  const competitionLevel = getCompetitionLevel(competitionScore);

  const opportunityType = getOpportunityType(
    intent,
    wordCount,
    competitionLevel
  );

  const relevanceScore =
    type === 'actual' ? 100 :
    type === 'question' ? 80 :
    60;

  return {
    id: `kw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    trendScore: undefined,
    createdAt: new Date(),
  };
}

// ============================================
// 9. مستوى المنافسة
// ============================================

function getCompetitionLevel(score: number): CompetitionLevel {
  if (score < 0) return 'unknown';
  if (score <= 25) return 'very-easy';
  if (score <= 50) return 'easy';
  if (score <= 75) return 'medium';
  return 'hard';
}

// ============================================
// 10. تصنيف الفرصة
// ============================================

function getOpportunityType(
  intent: SearchIntent,
  wordCount: number,
  competitionLevel: CompetitionLevel
): OpportunityType {
  // لا نصنف الكلمة على أنها مناسبة لموقع جديد
  // اعتماداً على طولها وحده أو منافسة غير معروفة.
  if (
    wordCount >= 4 &&
    (competitionLevel === 'very-easy' ||
      competitionLevel === 'easy')
  ) {
    return 'new-site';
  }

  if (intent === 'transactional' || intent === 'commercial') {
    return 'commercial';
  }

  if (intent === 'informational') {
    return 'content';
  }

  return 'general';
}
