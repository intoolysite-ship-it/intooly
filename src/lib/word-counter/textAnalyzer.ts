/**
 * محرك تحليل النص
 * عدّ الكلمات والأحرف والجمل والفقرات
 * مع دعم عربي متقدم
 */

import { 
  WORD_COUNTER_CONFIG,
  ARABIC_STOP_WORDS,
} from './constants';
import type { TextStats } from './types';

// ============================================
// ثوابت عربية
// ============================================

// التشكيل والتطويل
const DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;

// الفواصل العربية
const ARABIC_PUNCTUATION = /[،؛؟!.,:;?!"'«»\-–—()\[\]{}]/g;

// الأرقام العربية والغربية
const ARABIC_NUMERALS = /[٠-٩]/g;
const WESTERN_NUMERALS = /[0-9]/g;

// ============================================
// 1. إزالة التشكيل
// ============================================

export function removeDiacritics(text: string): string {
  return text.replace(DIACRITICS, '');
}

// ============================================
// 2. تطبيع النص العربي
// ============================================

export function normalizeArabic(text: string): string {
  if (!text) return '';
  
  let normalized = text;
  
  // توحيد الألف
  normalized = normalized.replace(/[أإآٱا]/g, 'ا');
  
  // توحيد التاء المربوطة
  normalized = normalized.replace(/ة/g, 'ه');
  
  // توحيد الياء
  normalized = normalized.replace(/[ىي]/g, 'ي');
  
  // توحيد الواو
  normalized = normalized.replace(/ؤ/g, 'و');
  
  // توحيد الهمزة
  normalized = normalized.replace(/ئ/g, 'ي');
  
  return normalized;
}

// ============================================
// 3. عدّ الكلمات
// ============================================

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  
  // إزالة التشكيل
  const cleanText = removeDiacritics(text);
  
  // تقسيم على المسافات والفواصل
  const words = cleanText
    .replace(ARABIC_PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0);
  
  return words.length;
}

// ============================================
// 4. عدّ الكلمات الفريدة
// ============================================

export function countUniqueWords(text: string): number {
  if (!text || !text.trim()) return 0;
  
  const cleanText = removeDiacritics(text);
  
  const words = cleanText
    .replace(ARABIC_PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 0);
  
  return new Set(words).size;
}

// ============================================
// 5. عدّ الأحرف
// ============================================

export function countCharacters(text: string): number {
  return text.length;
}

export function countCharactersNoSpaces(text: string): number {
  return text.replace(/\s/g, '').length;
}

// ============================================
// 6. عدّ الجمل
// ============================================

export function countSentences(text: string): number {
  if (!text || !text.trim()) return 0;
  
  // تقسيم على علامات الترقيم
  const sentences = text
    .split(/[.!?؟]+/)
    .filter(s => s.trim().length > 0);
  
  return Math.max(1, sentences.length);
}

// ============================================
// 7. عدّ الفقرات
// ============================================

export function countParagraphs(text: string): number {
  if (!text || !text.trim()) return 0;
  
  // تقسيم على أسطر فارغة
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0);
  
  return Math.max(1, paragraphs.length);
}

// ============================================
// 8. عدّ الأسطر
// ============================================

export function countLines(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.split('\n').length;
}

// ============================================
// 9. الدالة الرئيسية — حساب كل الإحصائيات
// ============================================

export function calculateStats(text: string): TextStats {
  // العدّ الأساسي
  const words = countWords(text);
  const characters = countCharacters(text);
  const charactersNoSpaces = countCharactersNoSpaces(text);
  const sentences = countSentences(text);
  const paragraphs = countParagraphs(text);
  const lines = countLines(text);
  
  // المتوسطات
  const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
  const avgWordsPerParagraph = paragraphs > 0 ? words / paragraphs : 0;
  const avgCharsPerWord = words > 0 ? characters / words : 0;
  
  // أوقات (بالدقائق)
  const readingTime = words > 0 
    ? words / WORD_COUNTER_CONFIG.READING_SPEED_AR 
    : 0;
  
  const writingTime = words > 0 
    ? words / WORD_COUNTER_CONFIG.WRITING_SPEED 
    : 0;
  
  const editingTime = words > 0 
    ? words / WORD_COUNTER_CONFIG.EDITING_SPEED 
    : 0;
  
  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgWordsPerParagraph: Math.round(avgWordsPerParagraph * 10) / 10,
    avgCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
    readingTime: Math.round(readingTime * 10) / 10,
    writingTime: Math.round(writingTime * 10) / 10,
    editingTime: Math.round(editingTime * 10) / 10,
  };
}

// ============================================
// 10. تنسيق الوقت
// ============================================

export function formatTime(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} ثانية`;
  }
  
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  
  if (secs === 0) {
    return `${mins} دقيقة`;
  }
  
  return `${mins} دقيقة و ${secs} ثانية`;
}

// ============================================
// 11. تنسيق الأرقام
// ============================================

export function formatNumber(num: number): string {
  return num.toLocaleString('ar-SA');
}

// ============================================
// 12. استخراج الجذر العربي
// ============================================

const PREFIXES = ['ال', 'وال', 'بال', 'فال', 'كال', 'لل', 'و', 'ف', 'ب', 'ك', 'ل', 'س'];
const SUFFIXES = ['ات', 'ون', 'ين', 'ان', 'ها', 'هم', 'هن', 'كم', 'كن', 'نا', 'ي', 'ه', 'ة', 'ت', 'وا', 'تم', 'تن'];

export function extractRoot(word: string): string {
  let root = normalizeArabic(word);
  
  // إزالة السوابق
  for (const prefix of PREFIXES) {
    if (root.startsWith(prefix) && root.length - prefix.length >= 3) {
      root = root.slice(prefix.length);
      break;
    }
  }
  
  // إزالة اللواحق
  for (const suffix of SUFFIXES) {
    if (root.endsWith(suffix) && root.length - suffix.length >= 3) {
      root = root.slice(0, -suffix.length);
      break;
    }
  }
  
  return root;
}

// ============================================
// 13. هل الكلمة شائعة (Stop Word)؟
// ============================================

export function isStopWord(word: string): boolean {
  const normalized = normalizeArabic(word);
  return ARABIC_STOP_WORDS.some(sw => normalizeArabic(sw) === normalized);
}

// ============================================
// 14. تكرار الكلمات
// ============================================

export function getWordFrequency(
  text: string,
  includeStopWords: boolean = false,
  useRoots: boolean = false
): { word: string; count: number; percentage: number; root?: string }[] {
  if (!text || !text.trim()) return [];
  
  const cleanText = removeDiacritics(text);
  
  // استخراج الكلمات
  const words = cleanText
    .replace(ARABIC_PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 1);
  
  // فلترة الكلمات الشائعة
  const filteredWords = includeStopWords 
    ? words 
    : words.filter(w => !isStopWord(w));
  
  // حساب التكرار
  const frequency = new Map<string, number>();
  const roots = new Map<string, string>();
  
  for (const word of filteredWords) {
    const key = useRoots ? extractRoot(word) : word;
    frequency.set(key, (frequency.get(key) || 0) + 1);
    if (!roots.has(key)) {
      roots.set(key, word);
    }
  }
  
  // تحويل إلى مصفوفة وترتيب
  const total = filteredWords.length;
  const result = Array.from(frequency.entries())
    .map(([key, count]) => ({
      word: key,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      root: useRoots ? key : undefined,
    }))
    .sort((a, b) => b.count - a.count);
  
  return result;
}

// ============================================
// 15. كثافة الكلمات المفتاحية
// ============================================

export function getKeywordDensity(
  text: string,
  excludeStopWords: boolean = true
): { word: string; count: number; percentage: number; density: number; isStopWord: boolean }[] {
  if (!text || !text.trim()) return [];
  
  const cleanText = removeDiacritics(text);
  
  // استخراج الكلمات
  const words = cleanText
    .replace(ARABIC_PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 1);
  
  const total = words.length;
  if (total === 0) return [];
  
  // حساب التكرار
  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }
  
  // تحويل إلى مصفوفة
  const result = Array.from(frequency.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: (count / total) * 100,
      density: (count / total) * 100,
      isStopWord: isStopWord(word),
    }))
    .filter(item => !excludeStopWords || !item.isStopWord)
    .sort((a, b) => b.count - a.count);
  
  return result;
}

// ============================================
// 16. أكثر الكلمات تكراراً
// ============================================

export function getTopWords(
  text: string,
  limit: number = 10,
  useRoots: boolean = false
): { word: string; count: number; percentage: number; root?: string }[] {
  const frequency = getWordFrequency(text, false, useRoots);
  return frequency.slice(0, limit);
}

// ============================================
// 17. حساب عدد الفقرات الطويلة
// ============================================

export function findLongParagraphs(text: string): { index: number; wordCount: number; preview: string }[] {
  if (!text || !text.trim()) return [];
  
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const longParagraphs: { index: number; wordCount: number; preview: string }[] = [];
  
  paragraphs.forEach((para, index) => {
    const wordCount = countWords(para);
    if (wordCount > WORD_COUNTER_CONFIG.LONG_PARAGRAPH_THRESHOLD) {
      longParagraphs.push({
        index,
        wordCount,
        preview: para.trim().slice(0, 50) + '...',
      });
    }
  });
  
  return longParagraphs;
}

// ============================================
// 18. حساب عدد الجمل الطويلة
// ============================================

export function findLongSentences(text: string): { index: number; wordCount: number; preview: string }[] {
  if (!text || !text.trim()) return [];
  
  const sentences = text
    .split(/[.!?؟]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  const longSentences: { index: number; wordCount: number; preview: string }[] = [];
  
  sentences.forEach((sentence, index) => {
    const wordCount = countWords(sentence);
    if (wordCount > WORD_COUNTER_CONFIG.LONG_SENTENCE_THRESHOLD) {
      longSentences.push({
        index,
        wordCount,
        preview: sentence.slice(0, 50) + '...',
      });
    }
  });
  
  return longSentences;
}

// ============================================
// 19. أكثر الكلمات المكررة
// ============================================

export function findRepetitions(
  text: string, 
  threshold: number = WORD_COUNTER_CONFIG.REPETITION_THRESHOLD
): { word: string; count: number }[] {
  const frequency = getWordFrequency(text, false, false);
  
  return frequency
    .filter(item => item.count >= threshold)
    .map(item => ({ word: item.word, count: item.count }))
    .slice(0, 10);
}

// ============================================
// 20. متوسط طول الكلمات
// ============================================

export function getAverageWordLength(text: string): number {
  if (!text || !text.trim()) return 0;
  
  const cleanText = removeDiacritics(text);
  const words = cleanText
    .replace(ARABIC_PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0);
  
  if (words.length === 0) return 0;
  
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return totalLength / words.length;
}

// ============================================
// 21. نسبة الكلمات الطويلة
// ============================================

export function getLongWordsRatio(text: string, minLength: number = 7): number {
  if (!text || !text.trim()) return 0;
  
  const cleanText = removeDiacritics(text);
  const words = cleanText
    .replace(ARABIC_PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0);
  
  if (words.length === 0) return 0;
  
  const longWords = words.filter(w => w.length >= minLength);
  return (longWords.length / words.length) * 100;
}

// ============================================
// 22. نسبة التشكيل
// ============================================

export function getDiacriticsRatio(text: string): number {
  if (!text || !text.trim()) return 0;
  
  const diacriticsCount = (text.match(DIACRITICS) || []).length;
  return (diacriticsCount / text.length) * 100;
}

// ============================================
// 23. مؤشر القراءة العربي
// ============================================

import { READABILITY_WEIGHTS, READABILITY_LEVELS, COMMON_MISTAKES } from './constants';
import type { 
  ReadabilityScore, 
  DetectedMistake, 
  SentimentAnalysis, 
  WritingSuggestion,
  TextAnalysis,
  KeywordDensity,
  WordFrequency,
  PlatformLimitStatus,
} from './types';

export function calculateReadability(text: string): ReadabilityScore {
  if (!text || !text.trim()) {
    return {
      score: 0,
      level: 'very-hard',
      avgSentenceLength: 0,
      avgWordLength: 0,
      longWordsRatio: 0,
      diacriticsRatio: 0,
      breakdown: [],
    };
  }
  
  const stats = calculateStats(text);
  const avgSentenceLength = stats.avgWordsPerSentence;
  const avgWordLength = stats.avgCharsPerWord;
  const longWordsRatio = getLongWordsRatio(text, 7);
  const diacriticsRatio = getDiacriticsRatio(text);
  
  // حساب العوامل
  // 1. طول الجملة (أقصر = أسهل)
  // جملة 10 كلمات = 100 نقطة، جملة 30 كلمة = 0 نقطة
  const sentenceScore = Math.max(0, Math.min(100, 
    100 - ((avgSentenceLength - 10) / 20) * 100
  ));
  
  // 2. تعقيد الكلمات (كلمات قصيرة = أسهل)
  // كلمة 4 أحرف = 100 نقطة، كلمة 8 أحرف = 0 نقطة
  const wordScore = Math.max(0, Math.min(100,
    100 - ((avgWordLength - 4) / 4) * 100
  ));
  
  // 3. نسبة التشكيل (مزيد = أصعب لكن أدق)
  // 0% = 100 نقطة، 20% = 0 نقطة
  const diacriticsScore = Math.max(0, Math.min(100,
    100 - (diacriticsRatio / 20) * 100
  ));
  
  // 4. نسبة الكلمات الطويلة (أقل = أسهل)
  // 10% = 100 نقطة، 50% = 0 نقطة
  const longWordsScore = Math.max(0, Math.min(100,
    100 - ((longWordsRatio - 10) / 40) * 100
  ));
  
  // الحساب الموزون
  const totalScore = Math.round(
    sentenceScore * READABILITY_WEIGHTS.SENTENCE_LENGTH +
    wordScore * READABILITY_WEIGHTS.WORD_COMPLEXITY +
    diacriticsScore * READABILITY_WEIGHTS.DIACRITICS_RATIO +
    longWordsScore * READABILITY_WEIGHTS.LONG_WORDS_RATIO
  );
  
  const clampedScore = Math.max(0, Math.min(100, totalScore));
  
  // تحديد المستوى
  const level = READABILITY_LEVELS.find(
    l => clampedScore >= l.minScore && clampedScore <= l.maxScore
  )?.id || 'very-hard';
  
  return {
    score: clampedScore,
    level: level as ReadabilityScore['level'],
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    longWordsRatio: Math.round(longWordsRatio * 10) / 10,
    diacriticsRatio: Math.round(diacriticsRatio * 10) / 10,
    breakdown: [
      {
        factor: 'طول الجملة',
        weight: READABILITY_WEIGHTS.SENTENCE_LENGTH,
        score: Math.round(sentenceScore),
        contribution: Math.round(sentenceScore * READABILITY_WEIGHTS.SENTENCE_LENGTH),
      },
      {
        factor: 'تعقيد الكلمات',
        weight: READABILITY_WEIGHTS.WORD_COMPLEXITY,
        score: Math.round(wordScore),
        contribution: Math.round(wordScore * READABILITY_WEIGHTS.WORD_COMPLEXITY),
      },
      {
        factor: 'نسبة التشكيل',
        weight: READABILITY_WEIGHTS.DIACRITICS_RATIO,
        score: Math.round(diacriticsScore),
        contribution: Math.round(diacriticsScore * READABILITY_WEIGHTS.DIACRITICS_RATIO),
      },
      {
        factor: 'الكلمات الطويلة',
        weight: READABILITY_WEIGHTS.LONG_WORDS_RATIO,
        score: Math.round(longWordsScore),
        contribution: Math.round(longWordsScore * READABILITY_WEIGHTS.LONG_WORDS_RATIO),
      },
    ],
  };
}

// ============================================
// 24. اكتشاف الأخطاء الشائعة
// ============================================

export function detectMistakes(text: string): DetectedMistake[] {
  if (!text || !text.trim()) return [];
  
  const mistakes: DetectedMistake[] = [];
  const normalizedText = removeDiacritics(text);
  
  for (const mistake of COMMON_MISTAKES) {
    const normalizedWrong = normalizeArabic(mistake.wrong);
    const normalizedCorrect = normalizeArabic(mistake.correct);
    
    // تجاهل الأخطاء التي "wrong === correct" (صحيحة)
    if (normalizedWrong === normalizedCorrect) continue;
    
    let position = normalizedText.indexOf(mistake.wrong);
    
    while (position !== -1) {
      // استخراج السياق (20 حرفاً قبل و بعد)
      const start = Math.max(0, position - 20);
      const end = Math.min(text.length, position + mistake.wrong.length + 20);
      const context = text.slice(start, end);
      
      mistakes.push({
        wrong: mistake.wrong,
        correct: mistake.correct,
        reason: mistake.reason,
        position,
        context,
      });
      
      position = normalizedText.indexOf(mistake.wrong, position + 1);
    }
  }
  
  return mistakes.slice(0, 20); // حد أقصى 20 خطأ
}

// ============================================
// 25. تحليل المشاعر (بسيط)
// ============================================

const POSITIVE_WORDS = [
  'جيد', 'ممتاز', 'رائع', 'جميل', 'مذهل', 'عظيم', 'رائع', 'مبدع',
  'سعيد', 'فرح', 'مبتهج', 'متفائل', 'أحب', 'يعجبني', 'أفضل', 'أحسن',
  'نجاح', 'إنجاز', 'تقدم', 'تحسن', 'مفيد', 'نافع', 'قيّم', 'مهم',
  'سهل', 'بسيط', 'واضح', 'مفهوم', 'سريع', 'قوي', 'متين', 'جذاب',
];

const NEGATIVE_WORDS = [
  'سيء', 'فظيع', 'بشع', 'مزعج', 'ممل', 'ضعيف', 'فاشل', 'خطأ',
  'حزين', 'كئيب', 'متشائم', 'أكره', 'لا يعجبني', 'أسوأ', 'أردأ',
  'فشل', 'خسارة', 'تراجع', 'تدهور', 'ضار', 'سيء', 'منخفض', 'تافه',
  'صعب', 'معقد', 'غامض', 'بطيء', 'هش', 'ضعيف', 'ممل',
];

export function analyzeSentiment(text: string): SentimentAnalysis {
  if (!text || !text.trim()) {
    return {
      overall: 'neutral',
      score: 0,
      positive: 0,
      neutral: 100,
      negative: 0,
      positiveWords: [],
      negativeWords: [],
    };
  }
  
  const cleanText = removeDiacritics(text).toLowerCase();
  const words = cleanText
    .replace(ARABIC_PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 1);
  
  const positiveFound: string[] = [];
  const negativeFound: string[] = [];
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of words) {
    const normalized = normalizeArabic(word);
    
    for (const pw of POSITIVE_WORDS) {
      if (normalizeArabic(pw) === normalized) {
        positiveCount++;
        if (!positiveFound.includes(pw)) positiveFound.push(pw);
        break;
      }
    }
    
    for (const nw of NEGATIVE_WORDS) {
      if (normalizeArabic(nw) === normalized) {
        negativeCount++;
        if (!negativeFound.includes(nw)) negativeFound.push(nw);
        break;
      }
    }
  }
  
  const total = positiveCount + negativeCount;
  
  let score = 0;
  if (total > 0) {
    score = Math.round(((positiveCount - negativeCount) / total) * 100);
  }
  
  let overall: SentimentAnalysis['overall'] = 'neutral';
  if (score > 20) overall = 'positive';
  else if (score < -20) overall = 'negative';
  
  return {
    overall,
    score,
    positive: positiveCount,
    neutral: words.length - total,
    negative: negativeCount,
    positiveWords: positiveFound,
    negativeWords: negativeFound,
  };
}

// ============================================
// 26. اقتراحات الكتابة
// ============================================

export function generateSuggestions(
  text: string,
  readability: ReadabilityScore,
  mistakes: DetectedMistake[]
): WritingSuggestion[] {
  if (!text || !text.trim()) return [];
  
  const suggestions: WritingSuggestion[] = [];
  
  // 1. الجمل الطويلة
  const longSentences = findLongSentences(text);
  for (const s of longSentences.slice(0, 5)) {
    suggestions.push({
      type: 'long-sentence',
      severity: s.wordCount > 40 ? 'warning' : 'info',
      message: `جملة طويلة (${s.wordCount} كلمة) — حاول تقسيمها`,
      position: s.index,
      suggestion: 'قسّم الجملة إلى جملتين أقصر لتحسين القراءة',
      relatedText: s.preview,
    });
  }
  
  // 2. الفقرات الطويلة
  const longParagraphs = findLongParagraphs(text);
  for (const p of longParagraphs.slice(0, 3)) {
    suggestions.push({
      type: 'long-paragraph',
      severity: p.wordCount > 200 ? 'warning' : 'info',
      message: `فقرة طويلة (${p.wordCount} كلمة) — أضف فاصلاً`,
      position: p.index,
      suggestion: 'قسّم الفقرة إلى فقرتين لتحسين القراءة',
      relatedText: p.preview,
    });
  }
  
  // 3. التكرارات
  const repetitions = findRepetitions(text);
  for (const r of repetitions.slice(0, 5)) {
    suggestions.push({
      type: 'repetition',
      severity: r.count > 10 ? 'warning' : 'info',
      message: `كلمة "${r.word}" تكررت ${r.count} مرة`,
      suggestion: 'جرّب استخدام مرادفات لتجنب التكرار',
      relatedText: r.word,
    });
  }
  
  // 4. الأخطاء الشائعة
  for (const m of mistakes.slice(0, 5)) {
    suggestions.push({
      type: 'mistake',
      severity: 'error',
      message: `خطأ شائع: "${m.wrong}" — الصحيح "${m.correct}"`,
      position: m.position,
      suggestion: m.reason,
      relatedText: m.context,
    });
  }
  
  // 5. اقتراحات الأسلوب
  if (readability.score < 40) {
    suggestions.push({
      type: 'style',
      severity: 'info',
      message: 'النص صعب القراءة — حاول تبسيطه',
      suggestion: 'قلّل الكلمات الطويلة، قصّر الجمل',
    });
  }
  
  if (readability.avgSentenceLength > 25) {
    suggestions.push({
      type: 'style',
      severity: 'info',
      message: `متوسط الجملة ${readability.avgSentenceLength} كلمة — طويل نسبياً`,
      suggestion: 'المتوسط المثالي: 15-20 كلمة',
    });
  }
  
  // 6. اقتراحات البنية
  const stats = calculateStats(text);
  if (stats.paragraphs > 0 && stats.avgWordsPerParagraph > 150) {
    suggestions.push({
      type: 'structure',
      severity: 'info',
      message: `متوسط الفقرة ${stats.avgWordsPerParagraph} كلمة — طويلة`,
      suggestion: 'المتوسط المثالي: 50-100 كلمة',
    });
  }
  
  return suggestions;
}

// ============================================
// 27. حالة حدود المنصات
// ============================================

import { PLATFORM_LIMITS } from './constants';

export function getPlatformLimitStatus(text: string): PlatformLimitStatus[] {
  const stats = calculateStats(text);
  
  return PLATFORM_LIMITS.map(platform => {
    const current = platform.unit === 'char' 
      ? stats.characters 
      : stats.words;
    
    const percentage = (current / platform.limit) * 100;
    
    let status: PlatformLimitStatus['status'] = 'safe';
    if (percentage > 100) status = 'over';
    else if (percentage > 80) status = 'near';
    
    return {
      platform,
      current,
      status,
      percentage: Math.round(percentage),
    };
  });
}

// ============================================
// 28. حساب تقدم الهدف
// ============================================

import type { WritingGoal } from './types';

export function calculateGoalProgress(
  text: string,
  target: number,
  unit: 'word' | 'char'
): WritingGoal {
  const stats = calculateStats(text);
  const current = unit === 'char' ? stats.characters : stats.words;
  
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);
  const isAchieved = current >= target;
  
  return {
    target,
    unit,
    current,
    percentage: Math.round(percentage),
    remaining,
    isAchieved,
  };
}

// ============================================
// 29. الدالة الشاملة — تحليل كامل
// ============================================

export function analyzeText(text: string): TextAnalysis {
  // 1. الإحصائيات الأساسية
  const stats = calculateStats(text);
  
  // 2. مؤشر القراءة
  const readability = calculateReadability(text);
  
  // 3. تحليل المشاعر
  const sentiment = analyzeSentiment(text);
  
  // 4. كثافة الكلمات
  const keywords = getKeywordDensity(text, true);
  
  // 5. أكثر الكلمات
  const topWords = getTopWords(text, 15, false);
  
  // 6. الكلمات الفريدة
  const uniqueWords = countUniqueWords(text);
  
  // 7. الأخطاء
  const mistakes = detectMistakes(text);
  
  // 8. اقتراحات الكتابة
  const suggestions = generateSuggestions(text, readability, mistakes);
  
  // 9. حدود المنصات
  const platformLimits = getPlatformLimitStatus(text);
  
  return {
    stats,
    readability,
    sentiment,
    keywords,
    topWords,
    uniqueWords,
    mistakes,
    suggestions,
    goal: null, // يُحسب من page.tsx
    platformLimits,
  };
}
