/**
 * مولّد الكلمات المفتاحية — Intooly
 * جلب اقتراحات Google Autocomplete وتوليد اقتراحات إضافية ملائمة.
 *
 * تنبيه:
 * - اقتراحات Google ليست بيانات حجم بحث.
 * - درجة المنافسة تقديرية مبنية على 4 عوامل قابلة للقياس، وليست بيانات Ahrefs/Semrush.
 * - الاقتراحات المولّدة آلياً ليست بيانات بحث فعلية.
 */

import {
  LOCAL_VOCABULARY,
  COMPETITION_WEIGHTS,
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
 * جلب الاقتراحات الأساسية + اقتراحات إضافية عبر البادئات العربية.
 *
 * لا نضيف كلمة «كيف» إلى البحث تلقائياً عند قلة النتائج؛
 * لأن ذلك قد ينتج اقتراحات بعيدة عن نية المستخدم.
 *
 * بدلاً من ذلك، نستخدم بادئات عربية شائعة (ا، ب، ت، م، و، ال، ك، ف)
 * لإرجاع اقتراحات أكثر صلة، للوصول إلى عدد أكبر من الكلمات الحقيقية.
 */
export async function fetchExtendedSuggestions(
  keyword: string,
  country: CountryCode,
  language: string,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const allSuggestions: string[] = [];

  // 1. الاقتراحات الأساسية
  try {
    const base = await fetchGoogleSuggestions(
      keyword,
      country,
      language
    );
    allSuggestions.push(...base.suggestions);
    onProgress?.(40);
  } catch (error) {
    console.warn('فشل جلب الاقتراحات الأساسية:', error);
  }

  // 2. اقتراحات إضافية عبر بادئات عربية شائعة
  const prefixes = ['ا', 'ب', 'ت', 'م', 'و', 'ال', 'ك', 'ف'];

  for (const prefix of prefixes) {
    try {
      const extended = await fetchGoogleSuggestions(
        `${keyword} ${prefix}`,
        country,
        language
      );
      allSuggestions.push(...extended.suggestions);
    } catch (error) {
      // تجاهل أخطاء البادئات الفردية
    }
  }

  onProgress?.(100);

  return removeDuplicates(
    allSuggestions.filter((suggestion) => suggestion.trim().length > 0)
  );
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
function getApplicableLongTailTemplates(keyword: string): string[] {
  const value = normalizeArabic(keyword);
  const templates: string[] = [];

  if (isListOrCreativeQuery(keyword)) {
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

  // الكلمات المرتبطة
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
  googleSuggestions: string[] = []
): Keyword {
  const wordCount = getWordCount(text);
  const characterCount = text.length;
  const lengthType = getLengthType(wordCount);

  const {
    intent,
    confidence: intentConfidence,
  } = classifyIntent(text);

  // حساب تقدير المنافسة بناءً على 4 عوامل
  const competitionResult = calculateCompetitionScore(
    text,
    intent,
    googleSuggestions
  );

  const competitionScore = competitionResult.score;
  const competitionLevel = getCompetitionLevel(competitionScore);

  const competitionReason: CompetitionReason | undefined =
    competitionScore >= 0
      ? {
          keywordLength: characterCount,
          wordCount,
          intent,
          googlePresence:
            competitionResult.breakdown.find(
              (b) => b.factor === 'وجود في Google'
            )?.score ?? 0,
          breakdown: competitionResult.breakdown,
        }
      : undefined;

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
// 8-ب. حساب درجة المنافسة (تقديرية مبنية على 4 عوامل)
// ============================================

/**
 * حساب تقدير المنافسة بناءً على 4 عوامل:
 * - طول الكلمة (35%): كلمات أكثر = منافسة أقل
 * - وجودها في Google (30%): إن ظهرت = منافسة أعلى
 * - نية البحث (20%): تجاري/شرائي أعلى من معلوماتي
 * - تشابه الجذر (15%): كلمات متشاركة الجذر = منافسة أعلى
 */
function calculateCompetitionScore(
  text: string,
  intent: SearchIntent,
  googleSuggestions: string[]
): {
  score: number;
  breakdown: {
    factor: string;
    weight: number;
    score: number;
    contribution: number;
  }[];
} {
  const wordCount = getWordCount(text);
  const normalizedText = normalizeArabic(text);

  // 1. طول الكلمة
  let lengthScore = 100;
  if (wordCount >= 6) lengthScore = 10;
  else if (wordCount === 5) lengthScore = 25;
  else if (wordCount === 4) lengthScore = 40;
  else if (wordCount === 3) lengthScore = 60;
  else if (wordCount === 2) lengthScore = 80;
  else if (wordCount === 1) lengthScore = 100;

  // 2. وجود في اقتراحات Google
  const indexInGoogle = googleSuggestions.findIndex(
    (s) => normalizeArabic(s) === normalizedText
  );
  let googleScore = 30;
  if (indexInGoogle >= 0) {
    if (indexInGoogle <= 2) googleScore = 95;
    else if (indexInGoogle <= 5) googleScore = 80;
    else if (indexInGoogle <= 9) googleScore = 65;
    else googleScore = 50;
  }

  // 3. نية البحث
  let intentScore = 40;
  if (intent === 'transactional') intentScore = 95;
  else if (intent === 'commercial') intentScore = 85;
  else if (intent === 'informational') intentScore = 45;
  else if (intent === 'navigational') intentScore = 55;
  else intentScore = 40;

  // 4. تشابه الجذر
  const rootOverlapScore = calculateRootOverlap(
    normalizedText,
    googleSuggestions
  );

  // الدرجة النهائية
  const total =
    lengthScore * COMPETITION_WEIGHTS.KEYWORD_LENGTH +
    googleScore * COMPETITION_WEIGHTS.GOOGLE_PRESENCE +
    intentScore * COMPETITION_WEIGHTS.INTENT +
    rootOverlapScore * COMPETITION_WEIGHTS.ROOT_OVERLAP;

  const score = Math.round(Math.min(100, Math.max(0, total)));

  return {
    score,
    breakdown: [
      {
        factor: 'طول الكلمة',
        weight: COMPETITION_WEIGHTS.KEYWORD_LENGTH,
        score: lengthScore,
        contribution: Math.round(
          lengthScore * COMPETITION_WEIGHTS.KEYWORD_LENGTH
        ),
      },
      {
        factor: 'وجود في Google',
        weight: COMPETITION_WEIGHTS.GOOGLE_PRESENCE,
        score: googleScore,
        contribution: Math.round(
          googleScore * COMPETITION_WEIGHTS.GOOGLE_PRESENCE
        ),
      },
      {
        factor: 'نية البحث',
        weight: COMPETITION_WEIGHTS.INTENT,
        score: intentScore,
        contribution: Math.round(
          intentScore * COMPETITION_WEIGHTS.INTENT
        ),
      },
      {
        factor: 'تشابه الجذر',
        weight: COMPETITION_WEIGHTS.ROOT_OVERLAP,
        score: rootOverlapScore,
        contribution: Math.round(
          rootOverlapScore * COMPETITION_WEIGHTS.ROOT_OVERLAP
        ),
      },
    ],
  };
}

/**
 * حساب تشابه الجذر مع الكلمات الأخرى في اقتراحات Google.
 * كلما زادت الكلمات المتشاركة = الموضوع مشبع = منافسة أعلى.
 */
function calculateRootOverlap(
  normalizedText: string,
  googleSuggestions: string[]
): number {
  if (googleSuggestions.length === 0) return 30;

  const words = normalizedText.split(' ').filter((w) => w.length >= 3);
  if (words.length === 0) return 30;

  let matchCount = 0;
  for (const suggestion of googleSuggestions) {
    const normalizedSuggestion = normalizeArabic(suggestion);
    const hasCommonWord = words.some((w) =>
      normalizedSuggestion.includes(w)
    );
    if (hasCommonWord) matchCount++;
  }

  const ratio = matchCount / googleSuggestions.length;

  if (ratio >= 0.6) return 90;
  if (ratio >= 0.3) return 60;
  return 30;
}

// ============================================
// 9. مستوى المنافسة
// ============================================

function getCompetitionLevel(score: number): CompetitionLevel {
  if (score < 0) return 'unknown';
  if (score <= 20) return 'very-easy';
  if (score <= 35) return 'easy';
  if (score <= 48) return 'medium';
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