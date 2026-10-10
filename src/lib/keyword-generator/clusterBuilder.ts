/**
 * تجميع الكلمات المفتاحية في مجموعات موضوعية
 * Topic Clusters
 */

import type { 
  Keyword, 
  KeywordCluster,
} from './types';
import type { SearchIntent } from './constants';
import { normalizeArabic } from './arabicAnalyzer';

// ============================================
// 1. تجميع الكلمات حسب النية
// ============================================

export function clusterByIntent(keywords: Keyword[]): KeywordCluster[] {
  const groups: Record<SearchIntent, Keyword[]> = {
    informational: [],
    commercial: [],
    transactional: [],
    navigational: [],
    unknown: [],
  };
  
  for (const kw of keywords) {
    groups[kw.intent].push(kw);
  }
  
  const clusters: KeywordCluster[] = [];
  
  // المعلوماتي
  if (groups.informational.length > 0) {
    clusters.push(buildCluster(
      'أسئلة وشروحات',
      'كلمات تبحث عن معرفة أو شرح',
      groups.informational,
      'content-hub'
    ));
  }
  
  // التجاري
  if (groups.commercial.length > 0) {
    clusters.push(buildCluster(
      'مقارنات ومراجعات',
      'كلمات تجارية قبل الشراء',
      groups.commercial,
      'multiple-pages'
    ));
  }
  
  // الشرائي
  if (groups.transactional.length > 0) {
    clusters.push(buildCluster(
      'كلمات شرائية',
      'كلمات تدل على الرغبة في الشراء',
      groups.transactional,
      'single-page'
    ));
  }
  
  // الملاحي
  if (groups.navigational.length > 0) {
    clusters.push(buildCluster(
      'علامات تجارية',
      'كلمات تبحث عن موقع أو علامة',
      groups.navigational,
      'single-page'
    ));
  }
  
  return clusters;
}

// ============================================
// 2. تجميع الكلمات حسب الموضوع
// ============================================

export function clusterByTopic(keywords: Keyword[]): KeywordCluster[] {
  const topics = new Map<string, Keyword[]>();
  
  for (const kw of keywords) {
    // استخراج الموضوع من أول كلمتين
    const words = kw.text.split(/\s+/);
    const topic = words.slice(0, Math.min(2, words.length)).join(' ');
    const normalizedTopic = normalizeArabic(topic);
    
    if (!topics.has(normalizedTopic)) {
      topics.set(normalizedTopic, []);
    }
    topics.get(normalizedTopic)!.push(kw);
  }
  
  // تحويل إلى clusters
  const clusters: KeywordCluster[] = [];
  
  for (const [topic, kws] of topics.entries()) {
    if (kws.length < 2) continue; // تجاهل المجموعات الصغيرة
    
    // تحديد نوع الصفحة
    const avgWords = kws.reduce((sum, k) => sum + k.wordCount, 0) / kws.length;
    const pageType = kws.length > 10 ? 'content-hub' : 
                     avgWords > 4 ? 'multiple-pages' : 
                     'single-page';
    
    clusters.push(buildCluster(
      topic,
      `مجموعة "${topic}" — ${kws.length} كلمة`,
      kws,
      pageType
    ));
  }
  
  // ترتيب حسب العدد
  return clusters.sort((a, b) => b.totalKeywords - a.totalKeywords);
}

// ============================================
// 3. بناء Cluster
// ============================================

function buildCluster(
  title: string,
  description: string,
  keywords: Keyword[],
  pageType: 'single-page' | 'multiple-pages' | 'content-hub'
): KeywordCluster {
  // حساب متوسط المنافسة
  const validScores = keywords
    .map(k => k.competitionScore)
    .filter(s => s >= 0);
  
  const avgCompetition = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : -1;
  
  // تحديد النية السائدة
  const intentCounts = keywords.reduce((acc, k) => {
    acc[k.intent] = (acc[k.intent] || 0) + 1;
    return acc;
  }, {} as Record<SearchIntent, number>);
  
  const dominantIntent = Object.entries(intentCounts)
    .sort(([, a], [, b]) => b - a)[0][0] as SearchIntent;
  
  return {
    id: `cluster-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    description,
    keywords,
    suggestedPageType: pageType,
    suggestedPageTypeReason: getPageTypeReason(pageType, keywords.length),
    totalKeywords: keywords.length,
    avgCompetition,
    dominantIntent,
  };
}

function getPageTypeReason(pageType: string, count: number): string {
  if (pageType === 'single-page') {
    return `صفحة واحدة كافية — ${count} كلمة فقط في نفس الموضوع`;
  }
  if (pageType === 'multiple-pages') {
    return `صفحات متعددة أفضل — ${count} كلمة تحتاج تغطية أعمق`;
  }
  return `مركز محتوى (Content Hub) — ${count} كلمة تتطلب هيكل شامل`;
}

// ============================================
// 4. الدالة الرئيسية
// ============================================

export function buildClusters(keywords: Keyword[]): KeywordCluster[] {
  if (keywords.length === 0) return [];
  
  // استراتيجية: نجمع حسب الموضوع أولاً، ثم حسب النية
  const topicClusters = clusterByTopic(keywords);
  
  // إذا كانت المجموعات قليلة، نستخدم النية
  if (topicClusters.length < 3) {
    return clusterByIntent(keywords);
  }
  
  return topicClusters;
}
