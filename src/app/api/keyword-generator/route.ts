import { NextRequest, NextResponse } from 'next/server';

/* =========================================================
   CONFIG
========================================================= */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/* =========================================================
   TYPES
========================================================= */

type Intent =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'comparison'
  | 'general';

interface RawKeyword {
  keyword: string;
  source: string;
}

interface Keyword {
  keyword: string;
  intent: Intent;
  source: string;
  score: number;
  wordCount: number;
  characterCount: number;
  isLongTail: boolean;
}

interface Cluster {
  [key: string]: Keyword[];
}

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_REQUESTS = 150;
const REQUEST_TIMEOUT = 4000;

// الأحرف العربية
const ARABIC_LETTERS = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر',
  'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف',
  'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي',
];

// الأحرف الإنجليزية
const ENGLISH_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

// بادئات عربية (توسيع)
const ARABIC_PREFIXES = [
  'كيف', 'ما هو', 'ما هي', 'لماذا', 'متى', 'أين', 'من', 'هل',
  'أفضل', 'أحسن', 'أقوى', 'أسرع', 'أسهل', 'أرخص',
  'سعر', 'تكلفة', 'ثمن',
  'شرح', 'طريقة', 'درس',
];

// لواحق عربية (توسيع)
const ARABIC_SUFFIXES = [
  'مجانا', 'مجاني', 'بدون برامج', 'للمبتدئين', 'بالعربي',
  '2026', '2025', 'اون لاين', 'تحميل', 'شرح',
  'للاندرويد', 'للايفون', 'للكمبيوتر', 'للويندوز', 'للموبايل',
  'pdf', 'doc', 'excel', 'word',
];

// كلمات نية البحث
const INTENT_KEYWORDS = {
  informational: [
    'كيف', 'ما هو', 'ما هي', 'لماذا', 'متى', 'أين', 'من', 'هل',
    'شرح', 'طريقة', 'درس', 'تعلم', 'معنى', 'تعريف',
    'how', 'what', 'why', 'when', 'where', 'who', 'guide', 'tutorial',
  ],
  commercial: [
    'أفضل', 'أحسن', 'أقوى', 'أسرع', 'أسهل', 'أرخص',
    'مقارنة', 'مراجعة', 'تقييم', 'بديل',
    'best', 'top', 'review', 'comparison', 'vs', 'alternative',
  ],
  transactional: [
    'سعر', 'تكلفة', 'ثمن', 'شراء', 'اشتري', 'اشتري الان', 'طلب',
    'تحميل', 'تنزيل', 'اشتراك', 'تسجيل',
    'buy', 'price', 'cost', 'download', 'purchase', 'order',
  ],
  comparison: [
    'vs', 'ضد', 'مقارنة بين', 'الفرق بين', 'أيهما أفضل',
    'versus', 'difference between', 'better than',
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function fetchWithTimeout(
  url: string,
  timeout = REQUEST_TIMEOUT
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'ar,en;q=0.9',
      },
      cache: 'no-store',
    });

    clearTimeout(timer);

    if (!response.ok) return null;
    return response;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/* =========================================================
   GOOGLE AUTOCOMPLETE
========================================================= */

async function fetchGoogleSuggest(
  query: string,
  country: string,
  language: string
): Promise<string[]> {
  const url =
    'https://suggestqueries.google.com/complete/search' +
    '?client=firefox' +
    '&q=' + encodeURIComponent(query) +
    '&hl=' + language +
    '&gl=' + country;

  const response = await fetchWithTimeout(url);
  if (!response) return [];

  try {
    const text = await response.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data) || !Array.isArray(data[1])) {
      return [];
    }

    return data[1]
      .map((item: unknown) =>
        typeof item === 'string' ? item.trim() : ''
      )
      .filter((item: string) => item.length > 0);
  } catch {
    return [];
  }
}

/* =========================================================
   YOUTUBE AUTOCOMPLETE
========================================================= */

async function fetchYouTubeSuggest(
  query: string,
  country: string,
  language: string
): Promise<string[]> {
  const url =
    'https://suggestqueries.google.com/complete/search' +
    '?client=youtube' +
    '&ds=yt' +
    '&q=' + encodeURIComponent(query) +
    '&hl=' + language +
    '&gl=' + country;

  const response = await fetchWithTimeout(url);
  if (!response) return [];

  try {
    const text = await response.text();

    // YouTube يرجع JSONP أحياناً
    const jsonMatch = text.match(/\[.*\]/);
    if (!jsonMatch) return [];

    const data = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(data) || !Array.isArray(data[1])) {
      return [];
    }

    return data[1]
      .map((item: unknown) => {
        if (typeof item === 'string') return item.trim();
        if (Array.isArray(item) && typeof item[0] === 'string') {
          return item[0].trim();
        }
        return '';
      })
      .filter((item: string) => item.length > 0);
  } catch {
    return [];
  }
}

/* =========================================================
   BING AUTOCOMPLETE
========================================================= */

async function fetchBingSuggest(
  query: string,
  country: string,
  language: string
): Promise<string[]> {
  const market = language === 'ar' ? 'ar-SA' : 'en-US';

  const url =
    'https://api.bing.com/osjson.aspx' +
    '?query=' + encodeURIComponent(query) +
    '&market=' + market;

  const response = await fetchWithTimeout(url);
  if (!response) return [];

  try {
    const text = await response.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data) || !Array.isArray(data[1])) {
      return [];
    }

    return data[1]
      .map((item: unknown) =>
        typeof item === 'string' ? item.trim() : ''
      )
      .filter((item: string) => item.length > 0);
  } catch {
    return [];
  }
}

/* =========================================================
   GOOGLE TRENDS RELATED QUERIES
========================================================= */

async function fetchTrendsRelated(
  query: string,
  country: string,
  language: string
): Promise<string[]> {
  // Google Trends يحتاج خطوتين:
  // 1. explore للحصول على widgets
  // 2. relatedsearches للحصول على النتائج

  const exploreUrl =
    'https://trends.google.com/trends/api/explore' +
    '?hl=' + language +
    '&tz=0' +
    '&req=' + encodeURIComponent(JSON.stringify({
      comparisonItem: [
        { keyword: query, geo: country.toUpperCase(), time: 'today 12-m' },
      ],
      category: 0,
      property: '',
    }));

  const exploreResponse = await fetchWithTimeout(exploreUrl, 6000);
  if (!exploreResponse) return [];

  try {
    const exploreText = await exploreResponse.text();
    // Google Trends يرجع )]}' في البداية
    const cleanText = exploreText.replace(/^\)\]\}',?\s*/, '');
    const exploreData = JSON.parse(cleanText);

    const widgets = exploreData?.widgets ?? [];
    const relatedWidget = widgets.find(
      (w: { id?: string }) => w.id === 'RELATED_QUERIES'
    );

    if (!relatedWidget?.token) return [];

    const relatedUrl =
      'https://trends.google.com/trends/api/widgetdata/relatedsearches' +
      '?hl=' + language +
      '&tz=0' +
      '&req=' + encodeURIComponent(JSON.stringify(relatedWidget.request)) +
      '&token=' + encodeURIComponent(relatedWidget.token);

    const relatedResponse = await fetchWithTimeout(relatedUrl, 6000);
    if (!relatedResponse) return [];

    const relatedText = await relatedResponse.text();
    const cleanRelated = relatedText.replace(/^\)\]\}',?\s*/, '');
    const relatedData = JSON.parse(cleanRelated);

    const rankedList =
      relatedData?.default?.rankedList ?? [];

    const results: string[] = [];

    rankedList.forEach((list: { rankedKeyword?: Array<{ query?: string }> }) => {
      const items = list?.rankedKeyword ?? [];
      items.forEach((item: { query?: string }) => {
        if (item?.query && typeof item.query === 'string') {
          results.push(item.query.trim());
        }
      });
    });

    return results.filter((item) => item.length > 0);
  } catch {
    return [];
  }
}

/* =========================================================
   INTENT CLASSIFICATION
========================================================= */

function classifyIntent(keyword: string): Intent {
  const lower = keyword.toLowerCase();

  // comparison أولاً (لأنه يحتوي على كلمات قد تتداخل)
  const comparisonMatch = INTENT_KEYWORDS.comparison.some((word) =>
    lower.includes(word.toLowerCase())
  );
  if (comparisonMatch) return 'comparison';

  // transactional
  const transactionalMatch = INTENT_KEYWORDS.transactional.some((word) =>
    lower.includes(word.toLowerCase())
  );
  if (transactionalMatch) return 'transactional';

  // commercial
  const commercialMatch = INTENT_KEYWORDS.commercial.some((word) =>
    lower.includes(word.toLowerCase())
  );
  if (commercialMatch) return 'commercial';

  // informational
  const informationalMatch = INTENT_KEYWORDS.informational.some((word) =>
    lower.includes(word.toLowerCase())
  );
  if (informationalMatch) return 'informational';

  return 'general';
}

/* =========================================================
   OPPORTUNITY SCORE
========================================================= */

function calculateScore(keyword: string): number {
  const words = keyword.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = keyword.length;

  let score = 50;

  // Long-tail (3-6 كلمات)
  if (wordCount >= 3 && wordCount <= 6) score += 20;
  if (wordCount >= 7) score += 10;
  if (wordCount === 1) score -= 15;

  // طول مناسب (20-60 حرف)
  if (charCount >= 20 && charCount <= 60) score += 15;
  if (charCount > 80) score -= 10;

  // كلمات مفتاحية ذات قيمة
  const highValueWords = [
    'كيف', 'أفضل', 'شرح', 'طريقة', 'مجانا', 'مجاني', 'بدون',
    'للمبتدئين', 'بالعربي', '2026', '2025',
    'how', 'best', 'guide', 'tutorial', 'free',
  ];
  if (highValueWords.some((w) => keyword.includes(w))) score += 10;

  // كلمات سؤالية
  if (keyword.includes('؟') || keyword.startsWith('هل ')) score += 5;

  return Math.max(0, Math.min(100, score));
}

/* =========================================================
   NORMALIZE KEYWORD
========================================================= */

function normalizeKeyword(keyword: string): string {
  return keyword
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?؛،]/g, '')
    .toLowerCase();
}

/* =========================================================
   BUILD KEYWORD OBJECT
========================================================= */

function buildKeyword(keyword: string, source: string): Keyword {
  const normalized = normalizeKeyword(keyword);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const charCount = normalized.length;

  return {
    keyword: normalized,
    intent: classifyIntent(normalized),
    source,
    score: calculateScore(normalized),
    wordCount,
    characterCount: charCount,
    isLongTail: wordCount >= 3,
  };
}

/* =========================================================
   CLUSTERING (بالكلمات الأولى)
========================================================= */

function clusterKeywords(keywords: Keyword[]): Cluster {
  const clusters: Cluster = {};

  keywords.forEach((kw) => {
    // استخرج الكلمة الأولى (بعد إزالة كلمات التوسيع الشائعة)
    const words = kw.keyword.split(/\s+/).filter(Boolean);
    const stopWords = [
      'كيف', 'ما', 'هو', 'هي', 'هل', 'من', 'في', 'على', 'إلى',
      'أفضل', 'أحسن', 'أقوى', 'the', 'a', 'an', 'how', 'what',
    ];

    const meaningfulWord = words.find(
      (w) => w.length > 2 && !stopWords.includes(w)
    ) || words[0] || 'other';

    const clusterKey = meaningfulWord;

    if (!clusters[clusterKey]) {
      clusters[clusterKey] = [];
    }
    clusters[clusterKey].push(kw);
  });

  // فلترة الـ clusters الصغيرة (احتفظ بـ 3+ كلمات)
  const filtered: Cluster = {};
  Object.entries(clusters)
    .filter(([, kws]) => kws.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([key, kws]) => {
      filtered[key] = kws;
    });

  return filtered;
}

/* =========================================================
   MAIN GENERATOR
========================================================= */

async function generateKeywords(
  seed: string,
  country: string,
  language: string
): Promise<{
  keywords: Keyword[];
  queriesUsed: number;
}> {
  const rawMap = new Map<string, RawKeyword>();
  let queriesUsed = 0;

  const addKeyword = (keyword: string, source: string) => {
    const normalized = normalizeKeyword(keyword);
    if (!normalized || normalized.length < 2) return;
    if (normalized === normalizeKeyword(seed)) return;
    if (!rawMap.has(normalized)) {
      rawMap.set(normalized, { keyword: normalized, source });
    }
  };

  const runBatch = async (
    tasks: Array<() => Promise<{ keywords: string[]; source: string }>>
  ) => {
    const batchSize = 10;
    for (let i = 0; i < tasks.length; i += batchSize) {
      if (queriesUsed >= MAX_REQUESTS) break;
      const batch = tasks.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((t) => t()));
      results.forEach(({ keywords, source }) => {
        queriesUsed++;
        keywords.forEach((kw) => addKeyword(kw, source));
      });
    }
  };

  /* ====================================================
     PHASE 1: الطلبات الأساسية
  ==================================================== */

  await runBatch([
    async () => ({
      keywords: await fetchGoogleSuggest(seed, country, language),
      source: 'Google Autocomplete',
    }),
    async () => ({
      keywords: await fetchYouTubeSuggest(seed, country, language),
      source: 'YouTube Suggestions',
    }),
    async () => ({
      keywords: await fetchBingSuggest(seed, country, language),
      source: 'Bing Suggestions',
    }),
    async () => ({
      keywords: await fetchTrendsRelated(seed, country, language),
      source: 'Google Trends',
    }),
  ]);

  /* ====================================================
     PHASE 2: Alphabet Fan-out
  ==================================================== */

  const alphabetTasks: Array<() => Promise<{ keywords: string[]; source: string }>> = [];

  // عربي
  ARABIC_LETTERS.forEach((letter) => {
    alphabetTasks.push(async () => ({
      keywords: await fetchGoogleSuggest(
        `${seed} ${letter}`,
        country,
        language
      ),
      source: 'Google Alphabet',
    }));
  });

  // إنجليزي
  ENGLISH_LETTERS.forEach((letter) => {
    alphabetTasks.push(async () => ({
      keywords: await fetchGoogleSuggest(
        `${seed} ${letter}`,
        country,
        language
      ),
      source: 'Google Alphabet',
    }));
  });

  await runBatch(alphabetTasks);

  /* ====================================================
     PHASE 3: Prefix/Suffix Fan-out
  ==================================================== */

  const modifierTasks: Array<() => Promise<{ keywords: string[]; source: string }>> = [];

  ARABIC_PREFIXES.forEach((prefix) => {
    modifierTasks.push(async () => ({
      keywords: await fetchGoogleSuggest(
        `${prefix} ${seed}`,
        country,
        language
      ),
      source: 'Google Modifiers',
    }));
  });

  ARABIC_SUFFIXES.forEach((suffix) => {
    modifierTasks.push(async () => ({
      keywords: await fetchGoogleSuggest(
        `${seed} ${suffix}`,
        country,
        language
      ),
      source: 'Google Modifiers',
    }));
  });

  await runBatch(modifierTasks);

  /* ====================================================
     PHASE 4: Recursive Expansion
  ==================================================== */

  const existingKeywords = Array.from(rawMap.keys());
  const topForExpansion = existingKeywords
    .filter((kw) => kw.split(/\s+/).length >= 2)
    .slice(0, 25);

  const recursiveTasks = topForExpansion.map((kw) => async () => ({
    keywords: await fetchGoogleSuggest(kw, country, language),
    source: 'Google Recursive',
  }));

  await runBatch(recursiveTasks);

  /* ====================================================
     PHASE 5: بناء الكلمات النهائية
  ==================================================== */

  const keywords: Keyword[] = Array.from(rawMap.values())
    .map(({ keyword, source }) => buildKeyword(keyword, source))
    .sort((a, b) => b.score - a.score);

  return { keywords, queriesUsed };
}

/* =========================================================
   STATS
========================================================= */

function computeStats(keywords: Keyword[]) {
  const stats = {
    total: keywords.length,
    informational: 0,
    commercial: 0,
    transactional: 0,
    comparison: 0,
    general: 0,
    longTail: 0,
    averageScore: 0,
  };

  if (keywords.length === 0) return stats;

  let totalScore = 0;

  keywords.forEach((kw) => {
    stats[kw.intent]++;
    if (kw.isLongTail) stats.longTail++;
    totalScore += kw.score;
  });

  stats.averageScore = Math.round(totalScore / keywords.length);

  return stats;
}

/* =========================================================
   POST HANDLER
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const seed =
      typeof body?.seed === 'string' ? body.seed.trim() : '';

    const country =
      typeof body?.country === 'string' && body.country.length === 2
        ? body.country.toLowerCase()
        : 'eg';

    const language =
      typeof body?.language === 'string' &&
      ['ar', 'en'].includes(body.language)
        ? body.language
        : 'ar';

    if (!seed || seed.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'يرجى إدخال كلمة أساسية صحيحة (حرفان على الأقل).',
        },
        { status: 400 }
      );
    }

    if (seed.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'الكلمة الأساسية طويلة جداً (100 حرف كحد أقصى).',
        },
        { status: 400 }
      );
    }

    const { keywords, queriesUsed } = await generateKeywords(
      seed,
      country,
      language
    );

    if (keywords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'لم نتمكن من العثور على كلمات مفتاحية. جرب كلمة أخرى أو تحقق من اتصالك.',
        },
        { status: 404 }
      );
    }

    const stats = computeStats(keywords);
    const clusters = clusterKeywords(keywords);

    const questions = keywords
      .filter((kw) => kw.intent === 'informational')
      .slice(0, 100);

    const commercialKeywords = keywords
      .filter(
        (kw) =>
          kw.intent === 'commercial' ||
          kw.intent === 'transactional'
      )
      .slice(0, 100);

    return NextResponse.json({
      success: true,
      seed,
      totalKeywords: keywords.length,
      keywords,
      clusters,
      questions,
      commercialKeywords,
      stats,
      meta: {
        source: 'Google, YouTube, Bing, Google Trends',
        note:
          'الأرقام المعروضة هي Opportunity Score تقديري، وليس حجم بحث حقيقي. Google Autocomplete لا يوفر حجم البحث.',
        queriesUsed,
      },
    });
  } catch (error) {
    console.error('[keyword-generator] خطأ:', error);

    const message =
      error instanceof Error ? error.message : 'خطأ غير معروف';

    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء توليد الكلمات: ' + message,
      },
      { status: 500 }
    );
  }
}