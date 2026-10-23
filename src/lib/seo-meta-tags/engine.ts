/**
 * منطق أداة Meta Tags Toolkit — Intooly
 * دوال نقية لتوليد الوسوم وفحص الطول.
 */

import type {
  MetaTagsState,
  LengthCheckResult,
  GeneratedMetaTags,
  ExportData,
} from './types';

import {
  LENGTH_LIMITS,
  LENGTH_MESSAGES,
} from './constants';

// ============================================
// 1. فحص طول العنوان والوصف
// ============================================

function estimatePixels(text: string): number {
  const avgPixelPerChar = /[\u0600-\u06FF]/.test(text) ? 7 : 8.5;
  return Math.round(text.length * avgPixelPerChar);
}

export function checkTitleLength(title: string): LengthCheckResult {
  const trimmed = title.trim();
  const charCount = trimmed.length;
  const pixelEstimate = estimatePixels(trimmed);
  const limits = LENGTH_LIMITS.title;

  if (charCount === 0) {
    return {
      status: 'empty',
      charCount: 0,
      pixelEstimate: 0,
      message: LENGTH_MESSAGES.title.empty,
      color: 'gray',
    };
  }

  if (charCount < limits.min) {
    return {
      status: 'too-short',
      charCount,
      pixelEstimate,
      message: LENGTH_MESSAGES.title.tooShort,
      color: 'yellow',
    };
  }

  if (charCount > limits.max) {
    return {
      status: 'too-long',
      charCount,
      pixelEstimate,
      message: LENGTH_MESSAGES.title.tooLong,
      color: 'red',
    };
  }

  return {
    status: 'good',
    charCount,
    pixelEstimate,
    message: LENGTH_MESSAGES.title.good,
    color: 'green',
  };
}

export function checkDescriptionLength(description: string): LengthCheckResult {
  const trimmed = description.trim();
  const charCount = trimmed.length;
  const pixelEstimate = estimatePixels(trimmed);
  const limits = LENGTH_LIMITS.description;

  if (charCount === 0) {
    return {
      status: 'empty',
      charCount: 0,
      pixelEstimate: 0,
      message: LENGTH_MESSAGES.description.empty,
      color: 'gray',
    };
  }

  if (charCount < limits.min) {
    return {
      status: 'too-short',
      charCount,
      pixelEstimate,
      message: LENGTH_MESSAGES.description.tooShort,
      color: 'yellow',
    };
  }

  if (charCount > limits.max) {
    return {
      status: 'too-long',
      charCount,
      pixelEstimate,
      message: LENGTH_MESSAGES.description.tooLong,
      color: 'red',
    };
  }

  return {
    status: 'good',
    charCount,
    pixelEstimate,
    message: LENGTH_MESSAGES.description.good,
    color: 'green',
  };
}

// ============================================
// 2. التحقق من صحة URL
// ============================================

export function isValidUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true; // فراغ = صحيح (اختياري)

  try {
    const candidate = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const urlObj = new URL(candidate);
    return Boolean(urlObj.hostname && urlObj.hostname.includes('.'));
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// ============================================
// 3. توليد الوسوم الفردية
// ============================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateTitleTag(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return '';
  return `<title>${escapeHtml(trimmed)}</title>`;
}

export function generateDescriptionTag(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return '';
  return `<meta name="description" content="${escapeHtml(trimmed)}">`;
}

// ============================================
// 4. توليد Robots Tag (متسق مع قيم Google)
// ============================================

export function generateRobotsTag(state: MetaTagsState): string {
  const directives: string[] = [];

  // Indexing (فقط إذا كان noindex، لأن index هو الافتراضي)
  if (!state.robots.index) {
    directives.push('noindex');
  }

  // Follow (فقط إذا كان nofollow، لأن follow هو الافتراضي)
  if (!state.robots.follow) {
    directives.push('nofollow');
  }

  // Text Snippet
  if (state.robots.snippet === 'none') {
    directives.push('nosnippet');
  } else if (state.robots.snippet === 'limited') {
    directives.push('max-snippet:150');
  } else if (state.robots.snippet === 'max') {
    directives.push('max-snippet:-1');
  }

  // Image Preview
  if (state.robots.imagePreview === 'large') {
    directives.push('max-image-preview:large');
  } else if (state.robots.imagePreview === 'standard') {
    directives.push('max-image-preview:standard');
  } else if (state.robots.imagePreview === 'none') {
    directives.push('max-image-preview:none');
  }

  // No Archive (خيار متقدم)
  if (state.robots.noarchive) {
    directives.push('noarchive');
  }

  // إذا لم يكن هناك أي توجيه، لا ننتج وسم Robots (index, follow افتراضي)
  if (directives.length === 0) return '';

  return `<meta name="robots" content="${directives.join(', ')}">`;
}

export function generateCanonicalTag(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  const normalized = normalizeUrl(trimmed);
  return `<link rel="canonical" href="${escapeHtml(normalized)}">`;
}

export function generateRobotsSummary(state: MetaTagsState): string {
  const directives: string[] = [];

  if (!state.robots.index) directives.push('noindex');
  if (!state.robots.follow) directives.push('nofollow');

  if (state.robots.snippet === 'none') directives.push('nosnippet');
  else if (state.robots.snippet === 'limited') directives.push('max-snippet:150');
  else if (state.robots.snippet === 'max') directives.push('max-snippet:-1');

  if (state.robots.imagePreview === 'large') directives.push('max-image-preview:large');
  else if (state.robots.imagePreview === 'standard') directives.push('max-image-preview:standard');
  else if (state.robots.imagePreview === 'none') directives.push('max-image-preview:none');

  if (state.robots.noarchive) directives.push('noarchive');

  return directives.length > 0 ? directives.join(', ') : 'index, follow (افتراضي)';
}

// ============================================
// 5. توليد وسوم Open Graph وTwitter
// ============================================

export function generateOpenGraphTags(state: MetaTagsState): string {
  const lines: string[] = [];
  const title = state.title.trim();
  const description = state.description.trim();
  const url = state.url.trim();
  const image = state.ogImage.trim();
  const siteName = (state.ogSiteName || '').trim();
  const locale = (state.ogLocale || '').trim();

  if (title) {
    lines.push(`<meta property="og:title" content="${escapeHtml(title)}">`);
  }
  if (description) {
    lines.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
  }
  if (url) {
    lines.push(`<meta property="og:url" content="${escapeHtml(normalizeUrl(url))}">`);
  }
  if (image) {
    lines.push(`<meta property="og:image" content="${escapeHtml(image)}">`);
  }
  if (siteName) {
    lines.push(`<meta property="og:site_name" content="${escapeHtml(siteName)}">`);
  }
  if (locale) {
    lines.push(`<meta property="og:locale" content="${escapeHtml(locale)}">`);
  }
  lines.push(`<meta property="og:type" content="${escapeHtml(state.ogType)}">`);

  return lines.join('\n');
}

export function generateTwitterCardTags(state: MetaTagsState): string {
  const lines: string[] = [];
  const title = state.title.trim();
  const description = state.description.trim();
  const image = state.ogImage.trim();
  const site = (state.twitterSite || '').trim();
  const creator = (state.twitterCreator || '').trim();

  lines.push(`<meta name="twitter:card" content="${escapeHtml(state.twitterCard)}">`);

  if (title) {
    lines.push(`<meta name="twitter:title" content="${escapeHtml(title)}">`);
  }
  if (description) {
    lines.push(`<meta name="twitter:description" content="${escapeHtml(description)}">`);
  }
  if (image) {
    lines.push(`<meta name="twitter:image" content="${escapeHtml(image)}">`);
  }
  if (site) {
    const handle = site.startsWith('@') ? site : `@${site}`;
    lines.push(`<meta name="twitter:site" content="${escapeHtml(handle)}">`);
  }
  if (creator) {
    const handle = creator.startsWith('@') ? creator : `@${creator}`;
    lines.push(`<meta name="twitter:creator" content="${escapeHtml(handle)}">`);
  }

  return lines.join('\n');
}

// ============================================
// 6. الدالة المجمعة
// ============================================

export function generateMetaTags(state: MetaTagsState): GeneratedMetaTags {
  const titleTag = generateTitleTag(state.title);
  const descriptionTag = generateDescriptionTag(state.description);
  const robotsTag = generateRobotsTag(state);
  const canonicalTag = generateCanonicalTag(state.url);
  const openGraphTags = generateOpenGraphTags(state);
  const twitterCardTags = generateTwitterCardTags(state);

  const fullHtmlParts: string[] = [];
  fullHtmlParts.push('<!-- Primary Meta Tags -->');
  if (titleTag) fullHtmlParts.push(titleTag);
  if (descriptionTag) fullHtmlParts.push(descriptionTag);
  if (robotsTag) fullHtmlParts.push(robotsTag);
  if (canonicalTag) fullHtmlParts.push(canonicalTag);

  if (openGraphTags) {
    fullHtmlParts.push('');
    fullHtmlParts.push('<!-- Open Graph / Facebook / LinkedIn -->');
    fullHtmlParts.push(openGraphTags);
  }

  if (twitterCardTags) {
    fullHtmlParts.push('');
    fullHtmlParts.push('<!-- Twitter / X -->');
    fullHtmlParts.push(twitterCardTags);
  }

  return {
    titleTag,
    descriptionTag,
    robotsTag,
    canonicalTag,
    openGraphTags,
    twitterCardTags,
    fullHtml: fullHtmlParts.join('\n'),
  };
}

// ============================================
// 7. بناء بيانات التصدير (JSON)
// ============================================

export function buildExportData(state: MetaTagsState): ExportData {
  return {
    title: state.title.trim(),
    description: state.description.trim(),
    url: state.url.trim(),
    robots: generateRobotsSummary(state),
    ogImage: state.ogImage.trim(),
    ogType: state.ogType,
    twitterCard: state.twitterCard,
    twitterSite: (state.twitterSite || '').trim(),
    generatedAt: new Date().toISOString(),
    disclaimer:
      'حدود الطول والمعاينات إرشادية. لا نضمن ظهور الوسوم كاملة في Google أو منصات التواصل.',
  };
}

// ============================================
// 8. فحص جودة النصوص (تنبيهات عامة)
// ============================================

/**
 * كلمات وعبارات عامة قد تشير إلى محتوى غير محدد.
 * ليست قائمة شاملة، بل مؤشرات إرشادية.
 */
const GENERIC_PHRASES = [
  'مرحبا بكم',
  'مرحباً بكم',
  'اهلا بكم',
  'أهلاً بكم',
  'الصفحة الرئيسية',
  'افضل موقع',
  'أفضل موقع',
  'افضل شركة',
  'أفضل شركة',
  'الموقع الرسمي',
  'اضغط هنا',
  'انقر هنا',
  'click here',
  'welcome to',
  'home page',
  'best site',
  'best website',
  'lorem ipsum',
];

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
}

/**
 * فحص جودة العنوان.
 * @param title النص
 * @param targetKeyword كلمة مفتاحية مستهدفة (اختياري)
 */
export function checkTitleQuality(
  title: string,
  targetKeyword?: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const trimmed = title.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    return issues; // الفراغ يُعالج في فحص الطول
  }

  // عبارات عامة
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      issues.push({
        severity: 'warning',
        message: `العنوان يحتوي على عبارة عامة («${phrase}»). فكّر في وصف أكثر تحديدًا.`,
      });
      break;
    }
  }

  // كلمة مفتاحية مفقودة
  if (targetKeyword && targetKeyword.trim()) {
    const kw = targetKeyword.trim().toLowerCase();
    if (!lower.includes(kw)) {
      issues.push({
        severity: 'warning',
        message: `الكلمة المفتاحية «${targetKeyword.trim()}» غير موجودة في العنوان.`,
      });
    }
  }

  // عنوان عام جدًا (كلمتان أو أقل)
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 2 && trimmed.length < 20) {
    issues.push({
      severity: 'info',
      message: 'العنوان قصير جدًا من حيث عدد الكلمات — قد لا يكون واضحًا للباحث.',
    });
  }

  return issues;
}

/**
 * فحص جودة الوصف.
 * @param description النص
 * @param targetKeyword كلمة مفتاحية مستهدفة (اختياري)
 */
export function checkDescriptionQuality(
  description: string,
  targetKeyword?: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const trimmed = description.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    return issues;
  }

  // عبارات عامة
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      issues.push({
        severity: 'warning',
        message: `الوصف يحتوي على عبارة عامة («${phrase}»). فكّر في وصف أكثر تحديدًا.`,
      });
      break;
    }
  }

  // كلمة مفتاحية مفقودة
  if (targetKeyword && targetKeyword.trim()) {
    const kw = targetKeyword.trim().toLowerCase();
    if (!lower.includes(kw)) {
      issues.push({
        severity: 'info',
        message: `الكلمة المفتاحية «${targetKeyword.trim()}» غير موجودة في الوصف (اختياري).`,
      });
    }
  }

  // جملة واحدة فقط
  const sentenceCount = (trimmed.match(/[.!?؟]+/g) || []).length;
  if (sentenceCount === 0 && trimmed.length > 40) {
    issues.push({
      severity: 'info',
      message: 'الوصف يبدو كجملة واحدة طويلة — قد يكون أقرب للقراءة لو قُسّم.',
    });
  }

  return issues;
}
