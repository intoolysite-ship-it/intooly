/**
 * مقارنة النصوص
 * يقارن نسختين ويعرض الفروق
 */

import { 
  countWords, 
  countCharacters, 
  countParagraphs,
  removeDiacritics,
  normalizeArabic,
  calculateStats,
} from './textAnalyzer';
import type { TextComparison, DiffChunk } from './types';

// ============================================
// 1. مقارنة النصوص (نظرة عامة)
// ============================================

export function compareTexts(originalText: string, newText: string): TextComparison {
  const originalStats = calculateStats(originalText);
  const newStats = calculateStats(newText);
  
  // تقسيم النصوص إلى كلمات
  const originalWords = tokenize(originalText);
  const newWords = tokenize(newText);
  
  // إيجاد الفروق
  const originalSet = new Set(originalWords.map(normalizeArabic));
  const newSet = new Set(newWords.map(normalizeArabic));
  
  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];
  
  // الكلمات المضافة (في الجديد، ليست في القديم)
  for (const word of newWords) {
    const normalized = normalizeArabic(word);
    if (!originalSet.has(normalized)) {
      if (!added.includes(word)) added.push(word);
    }
  }
  
  // الكلمات المحذوفة (في القديم، ليست في الجديد)
  for (const word of originalWords) {
    const normalized = normalizeArabic(word);
    if (!newSet.has(normalized)) {
      if (!removed.includes(word)) removed.push(word);
    } else {
      if (!unchanged.includes(word)) unchanged.push(word);
    }
  }
  
  return {
    added,
    removed,
    unchanged,
    addedCount: added.length,
    removedCount: removed.length,
    wordCountDiff: newStats.words - originalStats.words,
    charCountDiff: newStats.characters - originalStats.characters,
    paragraphCountDiff: newStats.paragraphs - originalStats.paragraphs,
  };
}

// ============================================
// 2. مقارنة تفصيلية (كلمة بكلمة)
// ============================================

export function getDetailedDiff(originalText: string, newText: string): DiffChunk[] {
  const originalWords = tokenize(originalText);
  const newWords = tokenize(newText);
  
  // خوارزمية LCS بسيطة (Longest Common Subsequence)
  const lcs = findLCS(originalWords, newWords);
  
  const chunks: DiffChunk[] = [];
  let origIndex = 0;
  let newIndex = 0;
  let lcsIndex = 0;
  let position = 0;
  
  while (origIndex < originalWords.length || newIndex < newWords.length) {
    // إذا وصلنا إلى كلمة مشتركة
    if (lcsIndex < lcs.length && 
        origIndex < originalWords.length && 
        newIndex < newWords.length &&
        originalWords[origIndex] === lcs[lcsIndex] && 
        newWords[newIndex] === lcs[lcsIndex]) {
      
      chunks.push({
        type: 'equal',
        text: originalWords[origIndex],
        position: position++,
      });
      
      origIndex++;
      newIndex++;
      lcsIndex++;
    } else {
      // كلمات محذوفة من القديم
      if (origIndex < originalWords.length &&
          (lcsIndex >= lcs.length || originalWords[origIndex] !== lcs[lcsIndex])) {
        chunks.push({
          type: 'remove',
          text: originalWords[origIndex],
          position: position++,
        });
        origIndex++;
      }
      
      // كلمات مضافة في الجديد
      if (newIndex < newWords.length &&
          (lcsIndex >= lcs.length || newWords[newIndex] !== lcs[lcsIndex])) {
        chunks.push({
          type: 'add',
          text: newWords[newIndex],
          position: position++,
        });
        newIndex++;
      }
    }
  }
  
  return chunks;
}

// ============================================
// 3. خوارزمية LCS
// ============================================

function findLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  
  // تجنب المصفوفات الكبيرة جداً
  if (m > 1000 || n > 1000) {
    return [];
  }
  
  // مصفوفة DP
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalizeArabic(a[i - 1]) === normalizeArabic(b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // استرجاع LCS
  const lcs: string[] = [];
  let i = m;
  let j = n;
  
  while (i > 0 && j > 0) {
    if (normalizeArabic(a[i - 1]) === normalizeArabic(b[j - 1])) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}

// ============================================
// 4. تقسيم النص إلى كلمات
// ============================================

function tokenize(text: string): string[] {
  if (!text || !text.trim()) return [];
  
  const cleanText = removeDiacritics(text);
  
  return cleanText
    .replace(/[،؛؟!.,:;?!"'«»\-–—()\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0);
}

// ============================================
// 5. تنسيق الفروق للعرض
// ============================================

export function formatDiff(diff: DiffChunk[]): string {
  return diff.map(chunk => {
    switch (chunk.type) {
      case 'add':
        return `+${chunk.text}`;
      case 'remove':
        return `-${chunk.text}`;
      case 'equal':
        return ` ${chunk.text}`;
    }
  }).join(' ');
}

// ============================================
// 6. ملخص الفروق
// ============================================

export function getDiffSummary(diff: DiffChunk[]): {
  added: number;
  removed: number;
  unchanged: number;
} {
  return diff.reduce(
    (acc, chunk) => {
      if (chunk.type === 'add') acc.added++;
      else if (chunk.type === 'remove') acc.removed++;
      else acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 }
  );
}
