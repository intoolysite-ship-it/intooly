/**
 * محلل اللغة العربية
 * معالجة متقدمة للكلمات العربية
 */

// ============================================
// إزالة التشكيل
// ============================================

const DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g;

export function removeDiacritics(text: string): string {
  return text.replace(DIACRITICS, '');
}

// ============================================
// تطبيع النص العربي
// ============================================

export function normalizeArabic(text: string): string {
  if (!text) return '';
  
  let normalized = removeDiacritics(text);
  
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
  normalized = normalized.replace(/ء/g, '');
  
  // إزالة المسافات الزائدة
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

// ============================================
// استخراج الجذر (بسيط)
// ============================================

const PREFIXES = ['ال', 'وال', 'بال', 'فال', 'كال', 'لل', 'و', 'ف', 'ب', 'ك', 'ل'];
const SUFFIXES = ['ات', 'ون', 'ين', 'ان', 'ها', 'هم', 'هن', 'كم', 'كن', 'نا', 'ي', 'ه', 'ة', 'ت'];

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
// حساب تشابه الجذر
// ============================================

export function shareRoot(word1: string, word2: string): boolean {
  const root1 = extractRoot(word1);
  const root2 = extractRoot(word2);
  return root1 === root2 && root1.length >= 3;
}

// ============================================
// كلمات الاستفهام (للأسئلة)
// ============================================

export const QUESTION_WORDS = [
  'كيف', 'ما', 'ماذا', 'لماذا', 'متى', 'أين', 'من', 'هل', 'أي',
  'كم', 'كيفية', 'طريقة', 'شرح', 'معنى', 'تعريف', 'أفضل', 'افضل',
];

export function isQuestion(text: string): boolean {
  const normalized = normalizeArabic(text);
  return QUESTION_WORDS.some(qw => normalized.startsWith(normalizeArabic(qw)));
}

// ============================================
// كلمات المقارنة
// ============================================

export const COMPARISON_WORDS = [
  'vs', 'ضد', 'مقارنة', 'الفرق', 'افضل من', 'أفضل من', 'أيهما', 'ايهما',
];

export function isComparison(text: string): boolean {
  const normalized = normalizeArabic(text);
  return COMPARISON_WORDS.some(cw => normalized.includes(normalizeArabic(cw)));
}

// ============================================
// كلمات الشراء
// ============================================

export const TRANSACTIONAL_WORDS = [
  'شراء', 'اشتري', 'اشتري', 'سعر', 'اسعار', 'أسعار', 'تخفيض', 'خصم',
  'عرض', 'تحميل', 'تنزيل', 'طلب', 'حجز', 'تسجيل', 'اشتراك', 'دفع', 'مجانا', 'مجاناً',
];

export function isTransactional(text: string): boolean {
  const normalized = normalizeArabic(text);
  return TRANSACTIONAL_WORDS.some(tw => normalized.includes(normalizeArabic(tw)));
}

// ============================================
// كلمات تجارية
// ============================================

export const COMMERCIAL_WORDS = [
  'افضل', 'أفضل', 'مراجعة', 'تقييم', 'مقارنة', 'بدائل', 'مميزات', 'عيوب',
  'تجربة', 'استخدام', 'دليل', 'كيفية', 'طريقة',
];

export function isCommercial(text: string): boolean {
  const normalized = normalizeArabic(text);
  return COMMERCIAL_WORDS.some(cw => normalized.includes(normalizeArabic(cw)));
}

// ============================================
// كلمات معلوماتية
// ============================================

export const INFORMATIONAL_WORDS = [
  'ما هو', 'ما هي', 'تعريف', 'معنى', 'شرح', 'كيف', 'لماذا', 'متى',
  'أين', 'معلومات', 'حقائق', 'تاريخ', 'أساسيات', 'مقدمة',
];

export function isInformational(text: string): boolean {
  const normalized = normalizeArabic(text);
  return INFORMATIONAL_WORDS.some(iw => normalized.includes(normalizeArabic(iw)));
}

// ============================================
// تصنيف النية
// ============================================

export type IntentType = 'informational' | 'commercial' | 'transactional' | 'navigational' | 'unknown';

export function classifyIntent(text: string): { intent: IntentType; confidence: number } {
  const scores = {
    transactional: isTransactional(text) ? 1 : 0,
    commercial: isCommercial(text) ? 1 : 0,
    informational: isInformational(text) ? 1 : 0,
    navigational: 0,
  };
  
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore === 0) {
    return { intent: 'unknown', confidence: 30 };
  }
  
  const intent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as IntentType;
  return { intent, confidence: 60 + maxScore * 30 };
}

// ============================================
// حساب طول الكلمة
// ============================================

export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function getLengthType(wordCount: number): 'short' | 'medium' | 'long' | 'very-long' {
  if (wordCount === 1) return 'short';
  if (wordCount <= 3) return 'medium';
  if (wordCount <= 6) return 'long';
  return 'very-long';
}

// ============================================
// إزالة التكرار
// ============================================

export function removeDuplicates(suggestions: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const suggestion of suggestions) {
    const normalized = normalizeArabic(suggestion);
    if (!seen.has(normalized) && suggestion.trim().length > 0) {
      seen.add(normalized);
      result.push(suggestion.trim());
    }
  }
  
  return result;
}

// ============================================
// تصفية الاقتراحات
// ============================================

export function filterSuggestions(
  suggestions: string[],
  originalKeyword: string,
  minLength = 2
): string[] {
  const normalizedOriginal = normalizeArabic(originalKeyword);
  
  return suggestions.filter(s => {
    if (!s || s.trim().length < minLength) return false;
    
    const normalized = normalizeArabic(s);
    
    // يجب أن تحتوي على الكلمة الأصلية أو جذرها
    if (normalized.includes(normalizedOriginal)) return true;
    
    // أو تشترك في الجذر
    if (shareRoot(s, originalKeyword)) return true;
    
    return false;
  });
}
