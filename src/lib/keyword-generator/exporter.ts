/**
 * تصدير الكلمات المفتاحية
 * يدعم: CSV, JSON, XLSX, Markdown
 */

import type { 
  Keyword,
  KeywordCluster,
  ContentPlan,
  ExportFormat,
  ExportOptions,
} from './types';
import { COMPETITION_TIERS, INTENT_TYPES, OPPORTUNITY_TYPES, DATA_SOURCES } from './constants';

// ============================================
// 1. تحويل الكلمة إلى صف
// ============================================

interface ExportRow {
  keyword: string;
  country: string;
  language: string;
  wordCount: number;
  intent: string;
  intentConfidence: number;
  competitionScore: number;
  competitionLevel: string;
  opportunityType: string;
  dataSource: string;
  relevanceScore: number;
}

function keywordToRow(kw: Keyword): ExportRow {
  const intentLabel = INTENT_TYPES.find(i => i.id === kw.intent)?.label || kw.intent;
  const compTier = COMPETITION_TIERS.find(t => t.id === kw.competitionLevel);
  const oppLabel = OPPORTUNITY_TYPES.find(o => o.id === kw.opportunityType)?.label || kw.opportunityType;
  const sourceLabel = DATA_SOURCES.find(s => s.id === kw.dataSource)?.label || kw.dataSource;
  
  return {
    keyword: kw.text,
    country: kw.country,
    language: kw.language,
    wordCount: kw.wordCount,
    intent: intentLabel,
    intentConfidence: kw.intentConfidence,
    competitionScore: kw.competitionScore,
    competitionLevel: compTier?.label || 'غير محدد',
    opportunityType: oppLabel,
    dataSource: sourceLabel,
    relevanceScore: kw.relevanceScore,
  };
}

// ============================================
// 2. CSV
// ============================================

export function exportToCSV(keywords: Keyword[]): string {
  if (keywords.length === 0) return '';
  
  const rows = keywords.map(keywordToRow);
  const headers = Object.keys(rows[0]) as (keyof ExportRow)[];
  
  // BOM لدعم العربية في Excel
  const BOM = '\uFEFF';
  
  const headerLine = headers.join(',');
  const dataLines = rows.map(row => 
    headers.map(h => {
      const value = String(row[h]);
      // escape quotes and commas
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return BOM + [headerLine, ...dataLines].join('\n');
}

// ============================================
// 3. JSON
// ============================================

export function exportToJSON(
  keywords: Keyword[],
  clusters?: KeywordCluster[],
  contentPlan?: ContentPlan | null
): string {
  const data = {
    exportedAt: new Date().toISOString(),
    totalKeywords: keywords.length,
    keywords: keywords.map(kw => ({
      text: kw.text,
      country: kw.country,
      language: kw.language,
      wordCount: kw.wordCount,
      intent: kw.intent,
      intentConfidence: kw.intentConfidence,
      competitionScore: kw.competitionScore,
      competitionLevel: kw.competitionLevel,
      opportunityType: kw.opportunityType,
      dataSource: kw.dataSource,
      relevanceScore: kw.relevanceScore,
      hasActualData: kw.hasActualData,
    })),
    clusters: clusters?.map(c => ({
      title: c.title,
      totalKeywords: c.totalKeywords,
      avgCompetition: c.avgCompetition,
      dominantIntent: c.dominantIntent,
      suggestedPageType: c.suggestedPageType,
    })),
    contentPlan,
  };
  
  return JSON.stringify(data, null, 2);
}

// ============================================
// 4. Markdown
// ============================================

export function exportToMarkdown(
  keywords: Keyword[],
  contentPlan?: ContentPlan | null
): string {
  const lines: string[] = [];
  
  lines.push('# الكلمات المفتاحية المولّدة');
  lines.push('');
  lines.push(`> تم التوليد في: ${new Date().toLocaleDateString('ar-SA')}`);
  lines.push(`> إجمالي الكلمات: ${keywords.length}`);
  lines.push('');
  
  // جدول الكلمات
  lines.push('## جدول الكلمات المفتاحية');
  lines.push('');
  lines.push('| الكلمة | الدولة | النية | المنافسة | الفرصة |');
  lines.push('|--------|--------|-------|----------|--------|');
  
  for (const kw of keywords) {
    const intent = INTENT_TYPES.find(i => i.id === kw.intent)?.label || '—';
    const comp = COMPETITION_TIERS.find(t => t.id === kw.competitionLevel);
    const compText = comp ? `${comp.icon} ${kw.competitionScore}%` : '—';
    const opp = OPPORTUNITY_TYPES.find(o => o.id === kw.opportunityType)?.label || '—';
    
    lines.push(`| ${kw.text} | ${kw.country} | ${intent} | ${compText} | ${opp} |`);
  }
  
  // خطة المحتوى
  if (contentPlan) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## خطة المحتوى');
    lines.push('');
    lines.push(`### العنوان`);
    lines.push(contentPlan.title);
    lines.push('');
    lines.push(`### الوصف (Meta)`);
    lines.push(contentPlan.metaDescription);
    lines.push('');
    lines.push('### العناوين الرئيسية (H2)');
    for (const h2 of contentPlan.h2) {
      lines.push(`- ${h2}`);
    }
    lines.push('');
    lines.push('### الأسئلة الشائعة (FAQ)');
    for (const faq of contentPlan.faq) {
      lines.push(`**${faq.question}**`);
      lines.push('');
      lines.push(faq.answer);
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

// ============================================
// 5. الدالة الرئيسية للتنزيل
// ============================================

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  if (typeof window === 'undefined') return;
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportKeywords(
  keywords: Keyword[],
  options: ExportOptions,
  clusters?: KeywordCluster[],
  contentPlan?: ContentPlan | null
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = options.filename || `intooly-keywords-${timestamp}`;
  
  switch (options.format) {
    case 'csv': {
      const content = exportToCSV(keywords);
      downloadFile(content, `${baseFilename}.csv`, 'text/csv;charset=utf-8');
      break;
    }
    case 'json': {
      const content = exportToJSON(keywords, clusters, contentPlan);
      downloadFile(content, `${baseFilename}.json`, 'application/json;charset=utf-8');
      break;
    }
    case 'markdown': {
      const content = exportToMarkdown(keywords, contentPlan);
      downloadFile(content, `${baseFilename}.md`, 'text/markdown;charset=utf-8');
      break;
    }
    case 'xlsx': {
      // XLSX يحتاج مكتبة خارجية (xlsx)
      // للآن، نستخدم CSV كبديل
      const content = exportToCSV(keywords);
      downloadFile(content, `${baseFilename}.csv`, 'text/csv;charset=utf-8');
      break;
    }
  }
}
