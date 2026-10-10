/**
 * تصدير تقارير عدّاد الكلمات
 * يدعم: Markdown, CSV, JSON, TXT
 */

import type { 
  TextAnalysis, 
  WordCounterState,
  ExportFormat,
} from './types';
import { 
  READABILITY_LEVELS,
  TOOL_MODES,
} from './constants';

// ============================================
// 1. تصدير Markdown (تقرير كامل)
// ============================================

export function exportToMarkdown(analysis: TextAnalysis, mode: string): string {
  const { stats, readability, sentiment, keywords, topWords, uniqueWords, mistakes, suggestions, platformLimits } = analysis;
  const modeInfo = TOOL_MODES.find(m => m.id === mode);
  const readabilityLevel = READABILITY_LEVELS.find(l => l.id === readability.level);
  
  const lines: string[] = [];
  
  // العنوان
  lines.push('# تقرير تحليل النص');
  lines.push('');
  lines.push(`> تم التوليد في: ${new Date().toLocaleDateString('ar-SA')}`);
  lines.push(`> الوضع: ${modeInfo?.name || mode}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // 1. الإحصائيات الأساسية
  lines.push('## 📊 الإحصائيات الأساسية');
  lines.push('');
  lines.push('| المقياس | القيمة |');
  lines.push('|---------|--------|');
  lines.push(`| الكلمات | ${stats.words} |`);
  lines.push(`| الكلمات الفريدة | ${uniqueWords} |`);
  lines.push(`| الأحرف (مع مسافات) | ${stats.characters} |`);
  lines.push(`| الأحرف (بدون مسافات) | ${stats.charactersNoSpaces} |`);
  lines.push(`| الجمل | ${stats.sentences} |`);
  lines.push(`| الفقرات | ${stats.paragraphs} |`);
  lines.push(`| الأسطر | ${stats.lines} |`);
  lines.push('');
  
  // 2. المتوسطات
  lines.push('## 📈 المتوسطات');
  lines.push('');
  lines.push('| المقياس | القيمة |');
  lines.push('|---------|--------|');
  lines.push(`| متوسط الكلمات/الجملة | ${stats.avgWordsPerSentence} |`);
  lines.push(`| متوسط الكلمات/الفقرة | ${stats.avgWordsPerParagraph} |`);
  lines.push(`| متوسط الأحرف/الكلمة | ${stats.avgCharsPerWord} |`);
  lines.push('');
  
  // 3. الأوقات
  lines.push('## ⏱️ الأوقات التقديرية');
  lines.push('');
  lines.push('| النشاط | الوقت |');
  lines.push('|--------|-------|');
  lines.push(`| وقت القراءة | ${stats.readingTime} دقيقة |`);
  lines.push(`| وقت الكتابة | ${stats.writingTime} دقيقة |`);
  lines.push(`| وقت التحرير | ${stats.editingTime} دقيقة |`);
  lines.push('');
  
  // 4. مؤشر القراءة
  lines.push('## 📖 مؤشر القراءة');
  lines.push('');
  lines.push(`**المستوى:** ${readabilityLevel?.icon || ''} ${readabilityLevel?.label || ''} (${readability.score}%)`);
  lines.push('');
  lines.push(`**الوصف:** ${readabilityLevel?.description || ''}`);
  lines.push('');
  lines.push('### العوامل:');
  lines.push('');
  for (const item of readability.breakdown) {
    lines.push(`- **${item.factor}:** ${item.score}% (الوزن: ${Math.round(item.weight * 100)}%)`);
  }
  lines.push('');
  
  // 5. تحليل المشاعر
  lines.push('## 😊 تحليل المشاعر');
  lines.push('');
  const sentimentLabel = sentiment.overall === 'positive' ? 'إيجابي 😊' :
                          sentiment.overall === 'negative' ? 'سلبي 😟' : 'محايد 😐';
  lines.push(`**النتيجة:** ${sentimentLabel} (${sentiment.score})`);
  lines.push('');
  lines.push(`- إيجابي: ${sentiment.positive} كلمة`);
  lines.push(`- محايد: ${sentiment.neutral} كلمة`);
  lines.push(`- سلبي: ${sentiment.negative} كلمة`);
  lines.push('');
  
  // 6. كثافة الكلمات
  if (keywords.length > 0) {
    lines.push('## 🔑 كثافة الكلمات المفتاحية (Top 20)');
    lines.push('');
    lines.push('| الكلمة | التكرار | النسبة |');
    lines.push('|--------|---------|--------|');
    for (const kw of keywords.slice(0, 20)) {
      lines.push(`| ${kw.word} | ${kw.count} | ${kw.percentage.toFixed(2)}% |`);
    }
    lines.push('');
  }
  
  // 7. أكثر الكلمات
  if (topWords.length > 0) {
    lines.push('## 📝 أكثر الكلمات تكراراً');
    lines.push('');
    for (const tw of topWords.slice(0, 10)) {
      lines.push(`- **${tw.word}**: ${tw.count} مرة (${tw.percentage.toFixed(1)}%)`);
    }
    lines.push('');
  }
  
  // 8. الأخطاء
  if (mistakes.length > 0) {
    lines.push('## ⚠️ الأخطاء الشائعة');
    lines.push('');
    for (const m of mistakes) {
      lines.push(`- **"${m.wrong}"** → الصحيح: **"${m.correct}"**`);
      lines.push(`  - السبب: ${m.reason}`);
    }
    lines.push('');
  }
  
  // 9. الاقتراحات
  if (suggestions.length > 0) {
    lines.push('## 💡 اقتراحات التحسين');
    lines.push('');
    for (const s of suggestions) {
      const icon = s.severity === 'error' ? '🔴' :
                   s.severity === 'warning' ? '🟠' : '🔵';
      lines.push(`- ${icon} **${s.message}**`);
      if (s.suggestion) {
        lines.push(`  - 💡 ${s.suggestion}`);
      }
    }
    lines.push('');
  }
  
  // 10. حدود المنصات
  const platformChecks = platformLimits.filter(p => 
    ['seo-title', 'meta-description', 'twitter', 'instagram-caption'].includes(p.platform.id)
  );
  
  if (platformChecks.length > 0) {
    lines.push('## 📱 حدود المنصات');
    lines.push('');
    lines.push('| المنصة | الحالي | الحد | الحالة |');
    lines.push('|--------|--------|-------|--------|');
    for (const p of platformChecks) {
      const statusIcon = p.status === 'safe' ? '✅' :
                        p.status === 'near' ? '⚠️' : '🔴';
      lines.push(`| ${p.platform.name} | ${p.current} | ${p.platform.limit} | ${statusIcon} ${p.percentage}% |`);
    }
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  lines.push('تم التوليد بواسطة [Intooly Word Counter](https://intooly.com/tools/word-counter)');
  
  return lines.join('\n');
}

// ============================================
// 2. تصدير CSV
// ============================================

export function exportToCSV(analysis: TextAnalysis): string {
  const { stats, keywords, topWords, mistakes } = analysis;
  
  const lines: string[] = [];
  
  // BOM لدعم العربية في Excel
  const BOM = '\uFEFF';
  
  // 1. الإحصائيات
  lines.push('النوع,المقياس,القيمة');
  lines.push(`الإحصائيات,الكلمات,${stats.words}`);
  lines.push(`الإحصائيات,الأحرف,${stats.characters}`);
  lines.push(`الإحصائيات,الأحرف (بدون مسافات),${stats.charactersNoSpaces}`);
  lines.push(`الإحصائيات,الجمل,${stats.sentences}`);
  lines.push(`الإحصائيات,الفقرات,${stats.paragraphs}`);
  lines.push(`الإحصائيات,الأسطر,${stats.lines}`);
  lines.push(`الأوقات,وقت القراءة (دقيقة),${stats.readingTime}`);
  lines.push(`الأوقات,وقت الكتابة (دقيقة),${stats.writingTime}`);
  lines.push('');
  
  // 2. كثافة الكلمات
  lines.push('كثافة الكلمات');
  lines.push('الكلمة,التكرار,النسبة %');
  for (const kw of keywords.slice(0, 30)) {
    lines.push(`${kw.word},${kw.count},${kw.percentage.toFixed(2)}`);
  }
  lines.push('');
  
  // 3. الأخطاء
  if (mistakes.length > 0) {
    lines.push('الأخطاء الشائعة');
    lines.push('الخطأ,الصحيح,السبب');
    for (const m of mistakes) {
      lines.push(`"${m.wrong}","${m.correct}","${m.reason}"`);
    }
  }
  
  return BOM + lines.join('\n');
}

// ============================================
// 3. تصدير JSON
// ============================================

export function exportToJSON(analysis: TextAnalysis, mode: string): string {
  const data = {
    exportedAt: new Date().toISOString(),
    mode,
    analysis,
  };
  
  return JSON.stringify(data, null, 2);
}

// ============================================
// 4. تصدير TXT
// ============================================

export function exportToTxt(text: string): string {
  return text;
}

// ============================================
// 5. تنزيل الملف
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

// ============================================
// 6. الدالة الرئيسية للتصدير
// ============================================

export function exportReport(
  analysis: TextAnalysis,
  mode: string,
  format: 'markdown' | 'csv' | 'json' | 'txt',
  filename?: string,
  originalText?: string
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = filename || `intooly-text-analysis-${timestamp}`;
  
  switch (format) {
    case 'markdown': {
      const content = exportToMarkdown(analysis, mode);
      downloadFile(content, `${baseFilename}.md`, 'text/markdown;charset=utf-8');
      break;
    }
    case 'csv': {
      const content = exportToCSV(analysis);
      downloadFile(content, `${baseFilename}.csv`, 'text/csv;charset=utf-8');
      break;
    }
    case 'json': {
      const content = exportToJSON(analysis, mode);
      downloadFile(content, `${baseFilename}.json`, 'application/json;charset=utf-8');
      break;
    }
    case 'txt': {
      const content = originalText || '';
      downloadFile(content, `${baseFilename}.txt`, 'text/plain;charset=utf-8');
      break;
    }
  }
}

// ============================================
// 7. نسخ التقرير كـ Markdown
// ============================================

export async function copyReportAsMarkdown(analysis: TextAnalysis, mode: string): Promise<boolean> {
  try {
    const content = exportToMarkdown(analysis, mode);
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content);
      return true;
    }
    
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (e) {
    console.error('Copy error:', e);
    return false;
  }
}
